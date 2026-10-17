import os
import sys
import logging
import platform
import uuid
from typing import List, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, text, delete
from app.database import get_db
from app.config import get_settings
from app.models.user import User
from app.models.conversation import Conversation
from app.models.message import Message
from app.models.attachment import Attachment
from app.auth.dependencies import get_current_admin, ADMIN_EMAILS
from app.services.ollama_service import ollama_service
from app.schemas.admin import (
    AdminStatsResponse,
    AdminUserItem,
    AdminUserListResponse,
    AdminModelUsageItem,
    AdminUsageResponse,
    AdminSystemResponse,
    AdminCleanupResponse,
)

router = APIRouter(prefix="/admin", tags=["admin"])
logger = logging.getLogger("vickyai.admin")
settings = get_settings()


@router.get("/stats", response_model=AdminStatsResponse)
async def get_admin_stats(
    admin: User = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db),
):
    """
    Returns platform-wide KPIs: registered users, conversations, messages,
    token counts, latency metrics, storage consumption, and Ollama status.
    """
    # 1. Total users
    res_users = await db.execute(select(func.count(User.id)))
    total_users = res_users.scalar() or 0

    # 2. Total conversations
    res_convs = await db.execute(select(func.count(Conversation.id)))
    total_conversations = res_convs.scalar() or 0

    # 3. Messages breakdown
    res_total_msg = await db.execute(select(func.count(Message.id)))
    total_messages = res_total_msg.scalar() or 0

    res_user_msg = await db.execute(select(func.count(Message.id)).where(Message.role == "user"))
    user_messages = res_user_msg.scalar() or 0

    res_asst_msg = await db.execute(select(func.count(Message.id)).where(Message.role == "assistant"))
    assistant_messages = res_asst_msg.scalar() or 0

    # 4. Token metrics and generation latency
    res_tokens = await db.execute(select(func.coalesce(func.sum(Message.token_count), 0)))
    total_tokens = int(res_tokens.scalar() or 0)

    res_avg_time = await db.execute(
        select(func.coalesce(func.avg(Message.generation_time), 0.0))
        .where(Message.generation_time.is_not(None))
    )
    avg_gen_time = round(float(res_avg_time.scalar() or 0.0), 2)

    # 5. Attachments & Storage
    res_att_count = await db.execute(select(func.count(Attachment.id)))
    total_attachments = res_att_count.scalar() or 0

    res_storage = await db.execute(select(func.coalesce(func.sum(Attachment.size), 0)))
    total_storage = int(res_storage.scalar() or 0)

    # 6. Live Ollama probe
    ollama_ok = await ollama_service.check_health()
    ollama_models = []
    if ollama_ok:
        try:
            raw_models = await ollama_service.list_models()
            ollama_models = [m.get("name", m.get("model", "")) for m in raw_models]
        except Exception as e:
            logger.warning(f"Failed to list Ollama models during admin stats: {e}")

    return AdminStatsResponse(
        total_users=total_users,
        total_conversations=total_conversations,
        total_messages=total_messages,
        user_messages=user_messages,
        assistant_messages=assistant_messages,
        total_tokens=total_tokens,
        avg_generation_time_seconds=avg_gen_time,
        total_attachments=total_attachments,
        total_storage_bytes=total_storage,
        ollama_status="connected" if ollama_ok else "offline",
        ollama_base_url=settings.OLLAMA_BASE_URL,
        ollama_models_count=len(ollama_models),
    )


@router.get("/users", response_model=AdminUserListResponse)
async def list_admin_users(
    admin: User = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db),
):
    """
    Returns the comprehensive list of users with their individual activity:
    conversation count, message count, tokens consumed, and timestamps.
    """
    users_res = await db.execute(select(User).order_by(User.created_at.desc()))
    users = users_res.scalars().all()

    items: List[AdminUserItem] = []
    for u in users:
        # Conversations count
        conv_res = await db.execute(
            select(func.count(Conversation.id)).where(Conversation.user_id == u.id)
        )
        c_count = conv_res.scalar() or 0

        # Messages and tokens
        msg_res = await db.execute(
            select(
                func.count(Message.id),
                func.coalesce(func.sum(Message.token_count), 0),
            )
            .join(Conversation, Conversation.id == Message.conversation_id)
            .where(Conversation.user_id == u.id)
        )
        msg_row = msg_res.first()
        m_count = msg_row[0] if msg_row else 0
        tokens_count = int(msg_row[1]) if msg_row else 0

        # Attachments count
        att_res = await db.execute(
            select(func.count(Attachment.id))
            .join(Message, Message.id == Attachment.message_id)
            .join(Conversation, Conversation.id == Message.conversation_id)
            .where(Conversation.user_id == u.id)
        )
        att_count = att_res.scalar() or 0

        items.append(
            AdminUserItem(
                id=u.id,
                email=u.email,
                username=u.username,
                created_at=u.created_at,
                last_login=u.last_login,
                is_admin=u.email.strip().lower() in ADMIN_EMAILS,
                conversations_count=c_count,
                messages_count=m_count,
                tokens_consumed=tokens_count,
                attachments_count=att_count,
            )
        )

    return AdminUserListResponse(users=items, total=len(items))


@router.delete("/users/{user_id}", status_code=status.HTTP_200_OK)
async def delete_user(
    user_id: uuid.UUID,
    admin: User = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db),
):
    """
    Permanently deletes a user and cascades all their conversations/messages.
    Guards against deleting the primary administrator.
    """
    user_res = await db.execute(select(User).where(User.id == user_id))
    target_user = user_res.scalar_one_or_none()

    if not target_user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )

    if target_user.email.strip().lower() in ADMIN_EMAILS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Forbidden: The primary administrator account cannot be deleted.",
        )

    await db.delete(target_user)
    await db.commit()

    return {"message": f"User '{target_user.username}' successfully deleted."}


@router.get("/usage", response_model=AdminUsageResponse)
async def get_admin_usage(
    admin: User = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db),
):
    """
    Returns breakdown of usage per AI model (message count, tokens, latency)
    and attachment file types breakdown.
    """
    # 1. Model breakdown
    model_res = await db.execute(
        select(
            Message.model,
            func.count(Message.id),
            func.coalesce(func.sum(Message.token_count), 0),
            func.coalesce(func.avg(Message.generation_time), 0.0),
        )
        .where(Message.model.is_not(None))
        .where(Message.role == "assistant")
        .group_by(Message.model)
    )

    models_list: List[AdminModelUsageItem] = []
    total_tokens = 0
    total_messages = 0

    for row in model_res.all():
        m_name = row[0] or "unknown"
        m_count = row[1] or 0
        t_count = int(row[2] or 0)
        avg_time = round(float(row[3] or 0.0), 2)
        total_tokens += t_count
        total_messages += m_count
        models_list.append(
            AdminModelUsageItem(
                model=m_name,
                messages_count=m_count,
                tokens_count=t_count,
                avg_generation_time=avg_time,
            )
        )

    # Sort models by tokens descending
    models_list.sort(key=lambda x: x.tokens_count, reverse=True)

    # 2. Attachments breakdown
    att_res = await db.execute(
        select(
            Attachment.mime_type,
            func.count(Attachment.id),
        )
        .group_by(Attachment.mime_type)
    )
    mime_breakdown: Dict[str, int] = {}
    total_atts = 0
    for row in att_res.all():
        mime = row[0] or "unknown"
        cnt = row[1] or 0
        mime_breakdown[mime] = cnt
        total_atts += cnt

    storage_res = await db.execute(select(func.coalesce(func.sum(Attachment.size), 0)))
    total_storage = int(storage_res.scalar() or 0)

    return AdminUsageResponse(
        models=models_list,
        total_tokens=total_tokens,
        total_messages=total_messages,
        storage_bytes=total_storage,
        attachments_count=total_atts,
        mime_breakdown=mime_breakdown,
    )


@router.get("/system", response_model=AdminSystemResponse)
async def get_admin_system(
    admin: User = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db),
):
    """
    Returns server environment, runtime health, host OS, database connectivity,
    and Ollama LAN status.
    """
    # Test DB
    db_ok = False
    try:
        await db.execute(text("SELECT 1"))
        db_ok = True
    except Exception as e:
        logger.error(f"Admin system DB check failed: {e}")

    # Test Ollama
    ollama_ok = await ollama_service.check_health()
    ollama_models = []
    if ollama_ok:
        try:
            raw_models = await ollama_service.list_models()
            ollama_models = [m.get("name", m.get("model", "")) for m in raw_models if m.get("name") or m.get("model")]
        except Exception as e:
            logger.warning(f"Admin system Ollama list failed: {e}")

    # Calculate actual disk size of upload directory
    upload_dir = settings.resolved_upload_dir
    upload_size = 0
    if os.path.exists(upload_dir):
        for root, _, files in os.walk(upload_dir):
            for f in files:
                fp = os.path.join(root, f)
                try:
                    upload_size += os.path.getsize(fp)
                except OSError:
                    pass

    return AdminSystemResponse(
        os_platform=f"{platform.system()} {platform.release()} ({platform.machine()})",
        python_version=sys.version.split()[0],
        database_connected=db_ok,
        ollama_connected=ollama_ok,
        ollama_base_url=settings.OLLAMA_BASE_URL,
        ollama_models=ollama_models,
        environment=settings.ENVIRONMENT,
        upload_dir=upload_dir,
        upload_dir_size_bytes=upload_size,
    )


@router.post("/maintenance/cleanup", response_model=AdminCleanupResponse)
async def cleanup_maintenance(
    admin: User = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db),
):
    """
    Performs maintenance cleanup:
    1. Removes database attachment records where the physical file was deleted.
    2. Removes physical files in upload directory that have no database attachment record.
    """
    upload_dir = settings.resolved_upload_dir
    os.makedirs(upload_dir, exist_ok=True)

    # 1. Check all attachment records in DB
    att_res = await db.execute(select(Attachment))
    db_attachments = att_res.scalars().all()

    known_filenames = set()
    records_removed = 0
    bytes_freed = 0

    for att in db_attachments:
        known_filenames.add(att.filename)
        # Check if file exists on disk
        if not os.path.exists(att.storage_path):
            await db.delete(att)
            records_removed += 1

    # 2. Check files on disk
    files_removed = 0
    for fname in os.listdir(upload_dir):
        fp = os.path.join(upload_dir, fname)
        if os.path.isfile(fp) and fname not in known_filenames:
            try:
                sz = os.path.getsize(fp)
                os.remove(fp)
                files_removed += 1
                bytes_freed += sz
            except OSError as e:
                logger.warning(f"Failed to remove orphaned file {fp}: {e}")

    if records_removed > 0:
        await db.commit()

    return AdminCleanupResponse(
        orphaned_records_removed=records_removed,
        orphaned_files_removed=files_removed,
        bytes_freed=bytes_freed,
        message=f"Maintenance complete: {records_removed} orphaned records removed, {files_removed} unused files purged ({round(bytes_freed / 1024 / 1024, 2)} MB freed).",
    )

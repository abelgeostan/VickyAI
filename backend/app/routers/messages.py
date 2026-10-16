import uuid
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.database import get_db
from app.auth.dependencies import get_current_user
from app.models.user import User
from app.schemas.message import MessageCreate, MessageResponse, MessageEditRequest
from app.schemas.attachment import AttachmentResponse
from app.repositories.conversation_repo import ConversationRepository
from app.repositories.message_repo import MessageRepository

router = APIRouter(prefix="/conversations/{conversation_id}/messages", tags=["messages"])


@router.get("", response_model=List[MessageResponse])
async def list_messages(
    conversation_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    conv_repo = ConversationRepository(db)
    conv = await conv_repo.get_by_id(conversation_id, current_user.id)
    if not conv:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Conversation not found")

    msg_repo = MessageRepository(db)
    messages = await msg_repo.list_for_conversation(conversation_id)

    response_list = []
    for m in messages:
        attachments = [
            AttachmentResponse(
                id=a.id,
                message_id=a.message_id,
                filename=a.filename,
                original_filename=a.original_filename,
                mime_type=a.mime_type,
                size=a.size,
                url=f"/api/uploads/{a.filename}",
                created_at=a.created_at,
            )
            for a in m.attachments
        ]
        response_list.append(
            MessageResponse(
                id=m.id,
                conversation_id=m.conversation_id,
                role=m.role,
                content=m.content,
                model=m.model,
                token_count=m.token_count,
                generation_time=m.generation_time,
                created_at=m.created_at,
                updated_at=m.updated_at,
                attachments=attachments,
            )
        )
    return response_list


@router.post("", response_model=MessageResponse, status_code=status.HTTP_201_CREATED)
async def create_message(
    conversation_id: uuid.UUID,
    req: MessageCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    conv_repo = ConversationRepository(db)
    conv = await conv_repo.get_by_id(conversation_id, current_user.id)
    if not conv:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Conversation not found")

    msg_repo = MessageRepository(db)
    msg = await msg_repo.create(
        conversation_id=conversation_id,
        role=req.role,
        content=req.content,
        model=req.model or conv.model,
    )
    return MessageResponse.model_validate(msg)


@router.patch("/{message_id}", response_model=MessageResponse)
async def edit_message(
    conversation_id: uuid.UUID,
    message_id: uuid.UUID,
    req: MessageEditRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Edit a message content. If it is a user message being re-sent,
    deletes following assistant messages so it can be regenerated.
    """
    conv_repo = ConversationRepository(db)
    conv = await conv_repo.get_by_id(conversation_id, current_user.id)
    if not conv:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Conversation not found")

    msg_repo = MessageRepository(db)
    msg = await msg_repo.get_by_id(message_id)
    if not msg or msg.conversation_id != conversation_id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Message not found")

    # If user message, delete subsequent messages to allow clean continuation
    if msg.role == "user":
        await msg_repo.delete_messages_from(conversation_id, msg.created_at)
        # Re-create updated user message
        msg = await msg_repo.create(
            conversation_id=conversation_id,
            role="user",
            content=req.content,
            model=conv.model,
        )
    else:
        msg.content = req.content
        await db.commit()
        await db.refresh(msg)

    return MessageResponse.model_validate(msg)

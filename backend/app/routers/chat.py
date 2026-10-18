import asyncio
import json
import time
import uuid
import logging
from typing import AsyncGenerator
from fastapi import APIRouter, Depends, HTTPException, status, Request
from fastapi.responses import StreamingResponse
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from app.database import get_db
from app.auth.dependencies import get_current_user
from app.models.user import User
from app.models.conversation import Conversation
from app.models.message import Message
from app.models.attachment import Attachment
from app.schemas.chat import ChatStreamRequest, ChatNonStreamResponse
from app.schemas.message import MessageResponse
from app.services.ollama_service import ollama_service
from app.services.upload_service import upload_service
from app.services.conversation_service import ConversationService
from app.repositories.conversation_repo import ConversationRepository
from app.repositories.message_repo import MessageRepository
from app.ai.router import ModelRouter
from app.services.search import web_search_service

router = APIRouter(prefix="/chat", tags=["chat"])
logger = logging.getLogger("vickyai.chat")
model_router = ModelRouter()

VICKY_SYSTEM_PROMPT = (
    "You are VickyAI, a personal AI assistant designed to be intelligent, friendly, reliable, and genuinely helpful. "
    "Your goal is to help the user understand things, solve problems, make decisions, learn, create, and get work done. "

    "Be conversational and natural rather than robotic. "
    "Be concise for simple questions and provide deeper explanations when the problem requires it. "
    "Do not unnecessarily repeat information or add filler. "

    "Be honest about uncertainty. Never invent facts, sources, results, or capabilities. "
    "If you do not know something, say so clearly and explain what would be needed to determine the answer. "

    "Remain intellectually neutral and objective. "
    "Do not blindly agree with the user. If the user's assumption is incorrect, respectfully explain why. "
    "For controversial or subjective topics, distinguish facts, interpretations, and opinions and present relevant perspectives fairly. "

    "For technical questions, prioritize practical and accurate solutions. "
    "When providing code, use clean, maintainable code and explain important decisions when useful. "
    "When debugging, identify the root cause before suggesting a fix. "

    "Format responses clearly using Markdown. "
    "Use headings, bullet points, numbered steps, tables, and syntax-highlighted code blocks when they improve readability. "

    "Adapt your communication style to the user's context. "
    "Be supportive and approachable without being overly cheerful, repetitive, or artificial. "
    "Your personality should feel like a smart, dependable personal companion rather than a generic chatbot."
)


@router.post("/stream")
async def chat_stream(
    req: ChatStreamRequest,
    raw_request: Request,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Streaming endpoint returning Server-Sent Events (SSE).
    Persists user message, streams assistant tokens, handles vision validation,
    gracefully separates reasoning, and saves the final response in PostgreSQL.
    """
    conv_repo = ConversationRepository(db)
    msg_repo = MessageRepository(db)
    conv_service = ConversationService(db)

    # 1. Resolve or create conversation
    conv: Conversation
    is_new_conversation = False
    if req.conversation_id:
        conv = await conv_repo.get_by_id(req.conversation_id, current_user.id)
        if not conv:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Conversation not found")
    else:
        is_new_conversation = True
        chosen_model = model_router.route_model(req.model)
        conv = await conv_repo.create(
            user_id=current_user.id,
            title="New Conversation",
            model=chosen_model,
        )

    # Resolve active model
    active_model = req.model or conv.model or "gemma3:4b"
    # Update conversation model if explicitly changed
    if req.model and req.model != conv.model:
        await conv_repo.update(conv.id, current_user.id, model=req.model)

    # 2. Check for attachments and vision capability
    attachments_to_process = []
    base64_images = []
    if req.attachment_ids:
        # Check model vision capability
        if not model_router.validate_vision_support(active_model):
            # Format friendly error for non-vision models (e.g. Qwen 3 4B)
            async def unsupported_vision_stream():
                error_data = {
                    "error": f"The selected model '{active_model}' cannot process images. Please switch to Gemma 3 4B for vision tasks.",
                    "code": "VISION_UNSUPPORTED",
                    "suggested_model": "gemma3:4b",
                }
                yield f"event: error\ndata: {json.dumps(error_data)}\n\n"

            return StreamingResponse(
                unsupported_vision_stream(),
                media_type="text/event-stream",
                headers={
                    "Cache-Control": "no-cache",
                    "Connection": "keep-alive",
                    "X-Accel-Buffering": "no",
                },
            )

        # Retrieve attachments
        for att_id in req.attachment_ids:
            att_result = await db.execute(select(Attachment).where(Attachment.id == att_id))
            att = att_result.scalars().first()
            if att:
                attachments_to_process.append(att)
                try:
                    b64 = upload_service.encode_image_base64(att.storage_path)
                    base64_images.append(b64)
                    logger.info(f"Loaded image base64 for attachment {att_id} ({len(b64)} chars)")
                except Exception as e:
                    logger.error(f"Failed to load image for attachment {att_id}: {e}")
            else:
                # Disk fallback in case attachment row was created before DB commit
                disk_path = upload_service.find_file_by_id(str(att_id))
                if disk_path:
                    try:
                        b64 = upload_service.encode_image_base64(disk_path)
                        base64_images.append(b64)
                        logger.info(f"Loaded image base64 from disk fallback for {att_id} ({disk_path})")
                        filename = os.path.basename(disk_path)
                        file_stat = os.stat(disk_path)
                        fallback_att = Attachment(
                            id=att_id,
                            message_id=None,
                            filename=filename,
                            original_filename=filename,
                            mime_type="image/jpeg",
                            size=file_stat.st_size,
                            storage_path=disk_path,
                        )
                        db.add(fallback_att)
                        attachments_to_process.append(fallback_att)
                    except Exception as e:
                        logger.error(f"Failed disk fallback for {att_id}: {e}")

    # 3. Handle regeneration if requested
    if req.regenerate_message_id:
        regen_msg = await msg_repo.get_by_id(req.regenerate_message_id)
        if regen_msg and regen_msg.conversation_id == conv.id:
            await msg_repo.delete_messages_from(conv.id, regen_msg.created_at)

    user_prompt = (req.message or "").strip()
    if not user_prompt and base64_images:
        user_prompt = "Please analyze this image and describe what you see."

    # 4. Save user message in PostgreSQL
    user_msg = await msg_repo.create(
        conversation_id=conv.id,
        role="user",
        content=user_prompt,
        model=active_model,
    )

    # Link attachments to the saved user message
    for att in attachments_to_process:
        att.message_id = user_msg.id
    if attachments_to_process:
        await db.commit()

    # 5. Build conversation message history for Ollama context
    history_messages = await msg_repo.list_for_conversation(conv.id)
    ollama_messages = []
    for m in history_messages:
        # Skip the message we just added (we will add it with images below)
        if m.id == user_msg.id:
            continue
        ollama_messages.append({
            "role": m.role,
            "content": m.content,
        })

    # Add current user message with images if present
    current_payload = {"role": "user", "content": user_prompt}
    if base64_images:
        current_payload["images"] = base64_images
        logger.info(f"Streaming chat with {len(base64_images)} image(s) to Ollama model {active_model}")
    ollama_messages.append(current_payload)

    # 6. Stream generator
    async def event_generator() -> AsyncGenerator[str, None]:
        start_time = time.time()
        collected_content = []
        token_count = 0
        assistant_msg_id = uuid.uuid4()
        sources_data = None
        effective_system_prompt = VICKY_SYSTEM_PROMPT

        # Emit start event
        yield f"event: start\ndata: {json.dumps({'conversation_id': str(conv.id), 'user_message_id': str(user_msg.id), 'assistant_message_id': str(assistant_msg_id), 'model': active_model})}\n\n"

        # Optional Web Search
        if req.web_search and user_prompt:
            yield f"event: search_start\ndata: {json.dumps({'query': user_prompt})}\n\n"
            try:
                search_results = await web_search_service.perform_search(user_prompt)
                if search_results:
                    sources_data = [
                        {"title": r.title, "url": r.url, "snippet": r.snippet}
                        for r in search_results
                    ]
                yield f"event: search_complete\ndata: {json.dumps({'query': user_prompt, 'sources': sources_data or []})}\n\n"
                effective_system_prompt = VICKY_SYSTEM_PROMPT + web_search_service.build_search_prompt_context(
                    user_prompt, search_results
                )
            except Exception as se:
                logger.error(f"Web search error in stream: {se}")
                yield f"event: search_complete\ndata: {json.dumps({'query': user_prompt, 'sources': []})}\n\n"

        try:
            async for chunk in ollama_service.stream_chat(
                model=active_model,
                messages=ollama_messages,
                system_prompt=effective_system_prompt,
            ):
                # Check if client disconnected
                if await raw_request.is_disconnected():
                    logger.info(f"Client disconnected during generation for conv {conv.id}")
                    break

                msg_chunk = chunk.get("message", {})
                content_token = msg_chunk.get("content", "")
                thinking_token = msg_chunk.get("thinking", "")

                # Handle reasoning/thinking token
                if thinking_token:
                    yield f"event: reasoning\ndata: {json.dumps({'status': 'thinking', 'token': thinking_token})}\n\n"

                # Handle main response content token
                if content_token:
                    collected_content.append(content_token)
                    token_count += 1
                    yield f"event: token\ndata: {json.dumps({'token': content_token})}\n\n"

                # Check completion metrics
                if chunk.get("done", False):
                    eval_count = chunk.get("eval_count", token_count)
                    total_dur_ns = chunk.get("total_duration", 0)
                    gen_time = round(total_dur_ns / 1e9, 2) if total_dur_ns else round(time.time() - start_time, 2)

                    final_text = "".join(collected_content)
                    
                    # Persist completed assistant message to PostgreSQL
                    await msg_repo.create(
                        conversation_id=conv.id,
                        role="assistant",
                        content=final_text,
                        model=active_model,
                        token_count=eval_count,
                        generation_time=gen_time,
                        sources=sources_data,
                    )

                    # Auto generate conversation title if initial message
                    title = conv.title
                    if is_new_conversation or conv.title == "New Conversation":
                        try:
                            title = await conv_service.generate_title_if_needed(
                                conv.id, current_user.id, req.message
                            )
                        except Exception as e:
                            logger.warning(f"Title generation error: {e}")

                    yield f"event: complete\ndata: {json.dumps({'conversation_id': str(conv.id), 'assistant_message_id': str(assistant_msg_id), 'title': title, 'token_count': eval_count, 'generation_time': gen_time, 'sources': sources_data})}\n\n"
                    return

        except asyncio.CancelledError:
            logger.info("Generation cancelled by client")
            final_text = "".join(collected_content)
            if final_text:
                await msg_repo.create(
                    conversation_id=conv.id,
                    role="assistant",
                    content=final_text + " [Generation stopped]",
                    model=active_model,
                    token_count=token_count,
                    generation_time=round(time.time() - start_time, 2),
                    sources=sources_data,
                )
            yield f"event: cancelled\ndata: {json.dumps({'status': 'cancelled'})}\n\n"

        except Exception as e:
            logger.error(f"Error streaming from Ollama: {e}", exc_info=True)
            yield f"event: error\ndata: {json.dumps({'error': 'Woof... I encountered an issue reaching my AI brain.', 'detail': str(e)})}\n\n"

    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
        },
    )


@router.post("", response_model=ChatNonStreamResponse)
async def chat_non_stream(
    req: ChatStreamRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Fallback non-streaming chat endpoint."""
    conv_repo = ConversationRepository(db)
    msg_repo = MessageRepository(db)
    conv_service = ConversationService(db)

    if req.conversation_id:
        conv = await conv_repo.get_by_id(req.conversation_id, current_user.id)
        if not conv:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Conversation not found")
    else:
        chosen_model = model_router.route_model(req.model)
        conv = await conv_repo.create(user_id=current_user.id, model=chosen_model)

    active_model = req.model or conv.model or "gemma3:4b"

    # Save user message
    user_msg = await msg_repo.create(
        conversation_id=conv.id,
        role="user",
        content=req.message,
        model=active_model,
    )

    sources_data = None
    effective_system_prompt = VICKY_SYSTEM_PROMPT

    if req.web_search and req.message:
        try:
            search_results = await web_search_service.perform_search(req.message)
            if search_results:
                sources_data = [
                    {"title": r.title, "url": r.url, "snippet": r.snippet}
                    for r in search_results
                ]
            effective_system_prompt = VICKY_SYSTEM_PROMPT + web_search_service.build_search_prompt_context(
                req.message, search_results
            )
        except Exception as e:
            logger.error(f"Web search error in non-stream: {e}")

    t0 = time.time()
    try:
        res = await ollama_service.chat(
            model=active_model,
            messages=[{"role": "user", "content": req.message}],
            system_prompt=effective_system_prompt,
        )
        assistant_content = res.get("message", {}).get("content", "")
        eval_count = res.get("eval_count", 0)
        gen_time = round(time.time() - t0, 2)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=f"Could not connect to Ollama service: {str(e)}",
        )

    assistant_msg = await msg_repo.create(
        conversation_id=conv.id,
        role="assistant",
        content=assistant_content,
        model=active_model,
        token_count=eval_count,
        generation_time=gen_time,
        sources=sources_data,
    )

    if conv.title == "New Conversation":
        await conv_service.generate_title_if_needed(conv.id, current_user.id, req.message)

    return ChatNonStreamResponse(
        conversation_id=conv.id,
        user_message=MessageResponse.model_validate(user_msg),
        assistant_message=MessageResponse.model_validate(assistant_msg),
    )

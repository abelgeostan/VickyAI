import re
import uuid
import logging
from typing import List, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import HTTPException, status
from app.models.conversation import Conversation
from app.repositories.conversation_repo import ConversationRepository
from app.repositories.message_repo import MessageRepository
from app.schemas.conversation import (
    ConversationCreate,
    ConversationUpdate,
    ConversationResponse,
    ConversationDetailResponse,
)
from app.schemas.message import MessageResponse
from app.schemas.attachment import AttachmentResponse
from app.services.ollama_service import ollama_service

logger = logging.getLogger("vickyai.conversation")


class ConversationService:
    def __init__(self, db: AsyncSession):
        self.db = db
        self.conv_repo = ConversationRepository(db)
        self.msg_repo = MessageRepository(db)

    def _to_response(self, conv: Conversation) -> ConversationResponse:
        msg_count = len(conv.messages) if conv.messages is not None else 0
        return ConversationResponse(
            id=conv.id,
            user_id=conv.user_id,
            title=conv.title,
            model=conv.model,
            archived=conv.archived,
            created_at=conv.created_at,
            updated_at=conv.updated_at,
            message_count=msg_count,
        )

    def _to_detail_response(self, conv: Conversation) -> ConversationDetailResponse:
        messages = []
        for m in (conv.messages or []):
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
                for a in (m.attachments or [])
            ]
            messages.append(
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

        return ConversationDetailResponse(
            id=conv.id,
            user_id=conv.user_id,
            title=conv.title,
            model=conv.model,
            archived=conv.archived,
            created_at=conv.created_at,
            updated_at=conv.updated_at,
            message_count=len(messages),
            messages=messages,
        )

    async def list_conversations(
        self,
        user_id: uuid.UUID,
        include_archived: bool = False,
    ) -> List[ConversationResponse]:
        convs = await self.conv_repo.list_conversations(user_id, include_archived=include_archived)
        return [self._to_response(c) for c in convs]

    async def get_conversation(
        self,
        conversation_id: uuid.UUID,
        user_id: uuid.UUID,
    ) -> ConversationDetailResponse:
        conv = await self.conv_repo.get_by_id(conversation_id, user_id)
        if not conv:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Conversation not found")
        return self._to_detail_response(conv)

    async def create_conversation(
        self,
        user_id: uuid.UUID,
        req: ConversationCreate,
    ) -> ConversationResponse:
        conv = await self.conv_repo.create(
            user_id=user_id,
            title=req.title or "New Conversation",
            model=req.model or "gemma3:4b",
        )
        return self._to_response(conv)

    async def update_conversation(
        self,
        conversation_id: uuid.UUID,
        user_id: uuid.UUID,
        req: ConversationUpdate,
    ) -> ConversationResponse:
        conv = await self.conv_repo.update(
            conversation_id=conversation_id,
            user_id=user_id,
            title=req.title,
            model=req.model,
            archived=req.archived,
        )
        if not conv:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Conversation not found")
        return self._to_response(conv)

    async def delete_conversation(
        self,
        conversation_id: uuid.UUID,
        user_id: uuid.UUID,
    ) -> bool:
        deleted = await self.conv_repo.delete(conversation_id, user_id)
        if not deleted:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Conversation not found")
        return True

    async def search(self, user_id: uuid.UUID, query: str) -> List[ConversationResponse]:
        if not query or not query.strip():
            return []
        convs = await self.conv_repo.search(user_id, query.strip())
        return [self._to_response(c) for c in convs]

    async def generate_title_if_needed(
        self,
        conversation_id: uuid.UUID,
        user_id: uuid.UUID,
        first_message_content: str,
    ) -> str:
        """Generate a concise title after the first interaction."""
        conv = await self.conv_repo.get_by_id(conversation_id, user_id)
        if not conv or (conv.title and conv.title != "New Conversation"):
            return conv.title if conv else "New Conversation"

        clean_text = first_message_content.strip()
        # Fast extractive fallback title
        words = clean_text.split()
        fallback_title = " ".join(words[:5])
        if len(fallback_title) > 40:
            fallback_title = fallback_title[:40].strip() + "..."
        if not fallback_title:
            fallback_title = "Conversation"

        # Try fast generation with Ollama if available
        try:
            res = await ollama_service.chat(
                model=conv.model or "gemma3:4b",
                messages=[
                    {
                        "role": "user",
                        "content": f"Summarize this query into a concise 3 to 5 word title. Do not include quotes, punctuation, or preamble:\n\n{clean_text[:200]}",
                    }
                ],
            )
            title = res.get("message", {}).get("content", "").strip()
            title = re.sub(r'["\']', '', title).strip()
            if title and len(title) <= 50:
                fallback_title = title
        except Exception as e:
            logger.info(f"Using extractive title fallback: {e}")

        await self.conv_repo.update(conversation_id, user_id, title=fallback_title)
        return fallback_title

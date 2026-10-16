import uuid
from typing import List, Optional
from datetime import datetime, timezone
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload
from sqlalchemy import func, or_, desc
from app.models.conversation import Conversation
from app.models.message import Message


class ConversationRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def list_conversations(
        self,
        user_id: uuid.UUID,
        include_archived: bool = False,
    ) -> List[Conversation]:
        query = (
            select(Conversation)
            .where(Conversation.user_id == user_id)
            .order_by(desc(Conversation.updated_at))
        )
        if not include_archived:
            query = query.where(Conversation.archived == False)

        result = await self.db.execute(query)
        return list(result.scalars().all())

    async def get_by_id(
        self,
        conversation_id: uuid.UUID,
        user_id: uuid.UUID,
    ) -> Optional[Conversation]:
        query = (
            select(Conversation)
            .where(Conversation.id == conversation_id, Conversation.user_id == user_id)
            .options(
                selectinload(Conversation.messages).selectinload(Message.attachments)
            )
        )
        result = await self.db.execute(query)
        return result.scalars().first()

    async def create(
        self,
        user_id: uuid.UUID,
        title: str = "New Conversation",
        model: str = "gemma3:4b",
    ) -> Conversation:
        conv = Conversation(
            user_id=user_id,
            title=title,
            model=model,
            archived=False,
        )
        self.db.add(conv)
        await self.db.commit()
        await self.db.refresh(conv)
        return conv

    async def update(
        self,
        conversation_id: uuid.UUID,
        user_id: uuid.UUID,
        title: Optional[str] = None,
        model: Optional[str] = None,
        archived: Optional[bool] = None,
    ) -> Optional[Conversation]:
        conv = await self.get_by_id(conversation_id, user_id)
        if not conv:
            return None

        if title is not None:
            conv.title = title
        if model is not None:
            conv.model = model
        if archived is not None:
            conv.archived = archived

        conv.updated_at = datetime.now(timezone.utc)
        await self.db.commit()
        await self.db.refresh(conv)
        return conv

    async def delete(self, conversation_id: uuid.UUID, user_id: uuid.UUID) -> bool:
        conv = await self.get_by_id(conversation_id, user_id)
        if not conv:
            return False
        await self.db.delete(conv)
        await self.db.commit()
        return True

    async def search(self, user_id: uuid.UUID, query: str) -> List[Conversation]:
        """Search conversations by title or message content."""
        search_pattern = f"%{query}%"
        # Search conversations where title matches OR any message matches
        q = (
            select(Conversation)
            .distinct()
            .outerjoin(Message, Conversation.id == Message.conversation_id)
            .where(
                Conversation.user_id == user_id,
                or_(
                    Conversation.title.ilike(search_pattern),
                    Message.content.ilike(search_pattern),
                ),
            )
            .order_by(desc(Conversation.updated_at))
        )
        result = await self.db.execute(q)
        return list(result.scalars().all())

import uuid
from typing import List, Optional
from datetime import datetime, timezone
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload
from sqlalchemy import delete
from app.models.message import Message
from app.models.attachment import Attachment


class MessageRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_by_id(self, message_id: uuid.UUID) -> Optional[Message]:
        query = (
            select(Message)
            .where(Message.id == message_id)
            .options(selectinload(Message.attachments))
        )
        result = await self.db.execute(query)
        return result.scalars().first()

    async def list_for_conversation(self, conversation_id: uuid.UUID) -> List[Message]:
        query = (
            select(Message)
            .where(Message.conversation_id == conversation_id)
            .options(selectinload(Message.attachments))
            .order_by(Message.created_at)
        )
        result = await self.db.execute(query)
        return list(result.scalars().all())

    async def create(
        self,
        conversation_id: uuid.UUID,
        role: str,
        content: str,
        model: Optional[str] = None,
        token_count: Optional[int] = None,
        generation_time: Optional[float] = None,
        sources: Optional[list] = None,
    ) -> Message:
        msg = Message(
            conversation_id=conversation_id,
            role=role,
            content=content,
            model=model,
            token_count=token_count,
            generation_time=generation_time,
            sources=sources,
        )
        self.db.add(msg)
        await self.db.commit()
        await self.db.refresh(msg)
        return msg

    async def add_attachment(
        self,
        message_id: uuid.UUID,
        file_id: uuid.UUID,
        filename: str,
        original_filename: str,
        mime_type: str,
        size: int,
        storage_path: str,
    ) -> Attachment:
        attachment = Attachment(
            id=file_id,
            message_id=message_id,
            filename=filename,
            original_filename=original_filename,
            mime_type=mime_type,
            size=size,
            storage_path=storage_path,
        )
        self.db.add(attachment)
        await self.db.commit()
        await self.db.refresh(attachment)
        return attachment

    async def delete_messages_from(self, conversation_id: uuid.UUID, from_created_at: datetime) -> None:
        """Deletes messages created at or after given timestamp for regeneration/editing."""
        stmt = delete(Message).where(
            Message.conversation_id == conversation_id,
            Message.created_at >= from_created_at,
        )
        await self.db.execute(stmt)
        await self.db.commit()

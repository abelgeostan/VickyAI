import uuid
from typing import Optional
from datetime import datetime, timezone
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import or_
from app.models.user import User


class UserRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_by_id(self, user_id: uuid.UUID) -> Optional[User]:
        result = await self.db.execute(select(User).where(User.id == user_id))
        return result.scalars().first()

    async def get_by_email(self, email: str) -> Optional[User]:
        result = await self.db.execute(select(User).where(User.email == email.lower()))
        return result.scalars().first()

    async def get_by_username(self, username: str) -> Optional[User]:
        result = await self.db.execute(select(User).where(User.username == username))
        return result.scalars().first()

    async def get_by_email_or_username(self, identifier: str) -> Optional[User]:
        ident = identifier.strip()
        result = await self.db.execute(
            select(User).where(or_(User.email == ident.lower(), User.username == ident))
        )
        return result.scalars().first()

    async def create(self, email: str, username: str, password_hash: str) -> User:
        user = User(
            email=email.lower(),
            username=username,
            password_hash=password_hash,
        )
        self.db.add(user)
        await self.db.commit()
        await self.db.refresh(user)
        return user

    async def update_last_login(self, user_id: uuid.UUID) -> None:
        user = await self.get_by_id(user_id)
        if user:
            user.last_login = datetime.now(timezone.utc)
            await self.db.commit()

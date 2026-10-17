from typing import Optional
from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.repositories.user_repo import UserRepository
from app.schemas.auth import UserRegister, UserLogin, Token, UserResponse
from app.auth.jwt import hash_password, verify_password, create_access_token


class AuthService:
    def __init__(self, db: AsyncSession):
        self.db = db
        self.repo = UserRepository(db)

    async def register(self, req: UserRegister) -> Token:
        # Check existing email
        if await self.repo.get_by_email(req.email):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email is already registered",
            )

        # Check existing username
        if await self.repo.get_by_username(req.username):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Username is already taken",
            )

        pwd_hash = hash_password(req.password)
        user = await self.repo.create(req.email, req.username, pwd_hash)

        access_token = create_access_token({"sub": str(user.id), "username": user.username})
        await self.repo.update_last_login(user.id)

        return Token(
            access_token=access_token,
            token_type="bearer",
            user=UserResponse.model_validate(user),
        )

    async def login(self, req: UserLogin) -> Token:
        user = await self.repo.get_by_email_or_username(req.email_or_username)
        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="User not found. Please check your username or create an account.",
            )
        if not verify_password(req.password, user.password_hash):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect password. Please try again.",
            )

        access_token = create_access_token({"sub": str(user.id), "username": user.username})
        await self.repo.update_last_login(user.id)

        return Token(
            access_token=access_token,
            token_type="bearer",
            user=UserResponse.model_validate(user),
        )

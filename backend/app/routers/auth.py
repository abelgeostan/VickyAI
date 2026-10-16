from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.database import get_db
from app.schemas.auth import UserRegister, UserLogin, Token, UserResponse
from app.services.auth_service import AuthService
from app.auth.dependencies import get_current_user
from app.models.user import User

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/register", response_model=Token, status_code=status.HTTP_201_CREATED)
async def register(req: UserRegister, db: AsyncSession = Depends(get_db)):
    service = AuthService(db)
    return await service.register(req)


@router.post("/login", response_model=Token)
async def login(req: UserLogin, db: AsyncSession = Depends(get_db)):
    service = AuthService(db)
    return await service.login(req)


@router.post("/logout")
async def logout(current_user: User = Depends(get_current_user)):
    # Local JWT authentication: client discards token on logout
    return {"message": "Logged out successfully"}


@router.get("/me", response_model=UserResponse)
async def get_me(current_user: User = Depends(get_current_user)):
    return UserResponse.model_validate(current_user)

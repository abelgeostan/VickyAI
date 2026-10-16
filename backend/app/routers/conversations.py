import uuid
from typing import List
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.database import get_db
from app.auth.dependencies import get_current_user
from app.models.user import User
from app.schemas.conversation import (
    ConversationCreate,
    ConversationUpdate,
    ConversationResponse,
    ConversationDetailResponse,
)
from app.services.conversation_service import ConversationService

router = APIRouter(prefix="/conversations", tags=["conversations"])


@router.get("", response_model=List[ConversationResponse])
async def list_conversations(
    include_archived: bool = Query(False),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    service = ConversationService(db)
    return await service.list_conversations(current_user.id, include_archived=include_archived)


@router.post("", response_model=ConversationResponse, status_code=status.HTTP_201_CREATED)
async def create_conversation(
    req: ConversationCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    service = ConversationService(db)
    return await service.create_conversation(current_user.id, req)


@router.get("/search", response_model=List[ConversationResponse])
async def search_conversations(
    q: str = Query(..., min_length=1),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    service = ConversationService(db)
    return await service.search(current_user.id, q)


@router.get("/{id}", response_model=ConversationDetailResponse)
async def get_conversation(
    id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    service = ConversationService(db)
    return await service.get_conversation(id, current_user.id)


@router.patch("/{id}", response_model=ConversationResponse)
async def update_conversation(
    id: uuid.UUID,
    req: ConversationUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    service = ConversationService(db)
    return await service.update_conversation(id, current_user.id, req)


@router.delete("/{id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_conversation(
    id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    service = ConversationService(db)
    await service.delete_conversation(id, current_user.id)
    return None

import uuid
from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel
from app.schemas.message import MessageResponse


class ConversationCreate(BaseModel):
    title: Optional[str] = "New Conversation"
    model: Optional[str] = "gemma3:4b"


class ConversationUpdate(BaseModel):
    title: Optional[str] = None
    model: Optional[str] = None
    archived: Optional[bool] = None


class ConversationResponse(BaseModel):
    id: uuid.UUID
    user_id: uuid.UUID
    title: str
    model: str
    archived: bool
    created_at: datetime
    updated_at: datetime
    message_count: Optional[int] = 0

    model_config = {"from_attributes": True}


class ConversationDetailResponse(ConversationResponse):
    messages: List[MessageResponse] = []

    model_config = {"from_attributes": True}



class ConversationSearchResponse(BaseModel):
    conversations: List[ConversationResponse]
    query: str

import uuid
from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel
from app.schemas.attachment import AttachmentResponse


class MessageCreate(BaseModel):
    role: str = "user"  # 'user', 'assistant', 'system'
    content: str
    model: Optional[str] = None
    attachment_ids: Optional[List[uuid.UUID]] = None


class MessageResponse(BaseModel):
    id: uuid.UUID
    conversation_id: uuid.UUID
    role: str
    content: str
    model: Optional[str] = None
    token_count: Optional[int] = None
    generation_time: Optional[float] = None
    created_at: datetime
    updated_at: datetime
    attachments: List[AttachmentResponse] = []

    model_config = {"from_attributes": True}



class MessageEditRequest(BaseModel):
    content: str

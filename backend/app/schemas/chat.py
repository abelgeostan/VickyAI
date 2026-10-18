import uuid
from typing import Optional, List
from pydantic import BaseModel
from app.schemas.message import MessageResponse


class ChatStreamRequest(BaseModel):
    conversation_id: Optional[uuid.UUID] = None
    message: str
    model: Optional[str] = None
    attachment_ids: Optional[List[uuid.UUID]] = []
    regenerate_message_id: Optional[uuid.UUID] = None
    web_search: bool = False


class ChatNonStreamResponse(BaseModel):
    conversation_id: uuid.UUID
    user_message: MessageResponse
    assistant_message: MessageResponse

import uuid
from datetime import datetime
from pydantic import BaseModel


class AttachmentResponse(BaseModel):
    id: uuid.UUID
    message_id: uuid.UUID
    filename: str
    original_filename: str
    mime_type: str
    size: int
    url: str
    created_at: datetime

    model_config = {"from_attributes": True}



class AttachmentUploadResponse(BaseModel):
    id: uuid.UUID
    filename: str
    original_filename: str
    mime_type: str
    size: int
    url: str

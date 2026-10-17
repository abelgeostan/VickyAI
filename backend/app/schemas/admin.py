import uuid
from datetime import datetime
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field


class AdminStatsResponse(BaseModel):
    total_users: int = 0
    total_conversations: int = 0
    total_messages: int = 0
    user_messages: int = 0
    assistant_messages: int = 0
    total_tokens: int = 0
    avg_generation_time_seconds: float = 0.0
    total_attachments: int = 0
    total_storage_bytes: int = 0
    ollama_status: str = "offline"
    ollama_base_url: str = ""
    ollama_models_count: int = 0


class AdminUserItem(BaseModel):
    id: uuid.UUID
    email: str
    username: str
    created_at: datetime
    last_login: Optional[datetime] = None
    is_admin: bool = False
    conversations_count: int = 0
    messages_count: int = 0
    tokens_consumed: int = 0
    attachments_count: int = 0


class AdminUserListResponse(BaseModel):
    users: List[AdminUserItem]
    total: int


class AdminModelUsageItem(BaseModel):
    model: str
    messages_count: int = 0
    tokens_count: int = 0
    avg_generation_time: float = 0.0


class AdminUsageResponse(BaseModel):
    models: List[AdminModelUsageItem]
    total_tokens: int
    total_messages: int
    storage_bytes: int
    attachments_count: int
    mime_breakdown: Dict[str, int] = Field(default_factory=dict)


class AdminSystemResponse(BaseModel):
    os_platform: str
    python_version: str
    database_connected: bool
    ollama_connected: bool
    ollama_base_url: str
    ollama_models: List[str]
    environment: str
    upload_dir: str
    upload_dir_size_bytes: int


class AdminCleanupResponse(BaseModel):
    orphaned_records_removed: int = 0
    orphaned_files_removed: int = 0
    bytes_freed: int = 0
    message: str = "Cleanup completed"

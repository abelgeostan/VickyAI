from typing import List, Optional
from pydantic import BaseModel


class ModelInfo(BaseModel):
    id: str
    name: str
    badge: str
    description: str
    supports_vision: bool
    supports_thinking: bool
    icon: str
    size_gb: Optional[float] = None
    runner: Optional[str] = None


class ModelListResponse(BaseModel):
    models: List[ModelInfo]
    default_model: str

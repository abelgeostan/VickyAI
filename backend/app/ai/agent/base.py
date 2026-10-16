from abc import ABC, abstractmethod
from enum import Enum
from typing import Any, Dict, Optional
from pydantic import BaseModel


class PermissionLevel(str, Enum):
    READ_ONLY = "read_only"          # Safe inspection (disk usage, system info, logs)
    OPERATIONAL = "operational"      # Mild actions (service restart, cache purge)
    DESTRUCTIVE = "destructive"      # Dangerous operations (file modification, container deletion)
    ADMIN = "admin"                  # Full administrative actions (strictly guarded)


class ApprovalStatus(str, Enum):
    AUTOMATIC = "automatic"
    PENDING = "pending"
    APPROVED = "approved"
    REJECTED = "rejected"


class ToolResult(BaseModel):
    success: bool
    data: Any
    error: Optional[str] = None


class BaseTool(ABC):
    """
    Abstract base class for all VickyAI tools.
    Never allows raw shell command execution directly from an LLM.
    """
    name: str
    description: str
    permission_level: PermissionLevel = PermissionLevel.READ_ONLY
    requires_approval: bool = False

    @abstractmethod
    async def execute(self, params: Dict[str, Any], context: Dict[str, Any]) -> ToolResult:
        """Execute the tool safely."""
        pass

    def to_schema(self) -> Dict[str, Any]:
        """Convert tool to Ollama/OpenAI tool format."""
        return {
            "type": "function",
            "function": {
                "name": self.name,
                "description": self.description,
                "parameters": self.get_parameters_schema(),
            },
        }

    @abstractmethod
    def get_parameters_schema(self) -> Dict[str, Any]:
        pass

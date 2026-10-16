from typing import Dict, List, Optional
from app.ai.agent.base import BaseTool, PermissionLevel


class ToolRegistry:
    """Central registry for managing registered agent tools."""

    def __init__(self):
        self._tools: Dict[str, BaseTool] = {}

    def register(self, tool: BaseTool) -> None:
        self._tools[tool.name] = tool

    def get(self, name: str) -> Optional[BaseTool]:
        return self._tools.get(name)

    def list_all(self) -> List[BaseTool]:
        return list(self._tools.values())

    def list_by_permission(self, max_level: PermissionLevel) -> List[BaseTool]:
        allowed_levels = {
            PermissionLevel.READ_ONLY: [PermissionLevel.READ_ONLY],
            PermissionLevel.OPERATIONAL: [PermissionLevel.READ_ONLY, PermissionLevel.OPERATIONAL],
            PermissionLevel.DESTRUCTIVE: [
                PermissionLevel.READ_ONLY,
                PermissionLevel.OPERATIONAL,
                PermissionLevel.DESTRUCTIVE,
            ],
            PermissionLevel.ADMIN: [
                PermissionLevel.READ_ONLY,
                PermissionLevel.OPERATIONAL,
                PermissionLevel.DESTRUCTIVE,
                PermissionLevel.ADMIN,
            ],
        }
        valid_set = allowed_levels.get(max_level, [PermissionLevel.READ_ONLY])
        return [t for t in self._tools.values() if t.permission_level in valid_set]

    def get_tool_schemas(self) -> List[dict]:
        return [t.to_schema() for t in self._tools.values()]


# Global registry instance
tool_registry = ToolRegistry()

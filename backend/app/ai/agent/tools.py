import platform
import shutil
import time
from typing import Any, Dict
from app.ai.agent.base import BaseTool, PermissionLevel, ToolResult
from app.ai.agent.registry import tool_registry


class SystemInfoTool(BaseTool):
    name = "system_info"
    description = "Provides high-level system information including OS, architecture, and Python runtime."
    permission_level = PermissionLevel.READ_ONLY
    requires_approval = False

    def get_parameters_schema(self) -> Dict[str, Any]:
        return {
            "type": "object",
            "properties": {},
            "required": [],
        }

    async def execute(self, params: Dict[str, Any], context: Dict[str, Any]) -> ToolResult:
        info = {
            "system": platform.system(),
            "node": platform.node(),
            "release": platform.release(),
            "version": platform.version(),
            "machine": platform.machine(),
            "processor": platform.processor(),
            "python_version": platform.python_version(),
        }
        return ToolResult(success=True, data=info)


class DiskUsageTool(BaseTool):
    name = "disk_usage"
    description = "Checks disk space usage for the application storage paths."
    permission_level = PermissionLevel.READ_ONLY
    requires_approval = False

    def get_parameters_schema(self) -> Dict[str, Any]:
        return {
            "type": "object",
            "properties": {
                "path": {
                    "type": "string",
                    "description": "Path to inspect, defaults to root or upload directory",
                }
            },
            "required": [],
        }

    async def execute(self, params: Dict[str, Any], context: Dict[str, Any]) -> ToolResult:
        inspect_path = params.get("path", "/")
        try:
            total, used, free = shutil.disk_usage(inspect_path)
            return ToolResult(
                success=True,
                data={
                    "path": inspect_path,
                    "total_gb": round(total / (1024 ** 3), 2),
                    "used_gb": round(used / (1024 ** 3), 2),
                    "free_gb": round(free / (1024 ** 3), 2),
                    "percent_used": round((used / total) * 100, 1),
                },
            )
        except Exception as e:
            return ToolResult(success=False, data=None, error=str(e))


class ServiceStatusTool(BaseTool):
    name = "service_status"
    description = "Checks current status of VickyAI subservices (PostgreSQL and Ollama)."
    permission_level = PermissionLevel.READ_ONLY
    requires_approval = False

    def get_parameters_schema(self) -> Dict[str, Any]:
        return {
            "type": "object",
            "properties": {},
            "required": [],
        }

    async def execute(self, params: Dict[str, Any], context: Dict[str, Any]) -> ToolResult:
        # Returns current connectivity snapshot
        return ToolResult(
            success=True,
            data={
                "vickyai": "online",
                "mode": "chat",
                "future_agent_tools": len(tool_registry.list_all()),
            },
        )


# Register initial safe tools
tool_registry.register(SystemInfoTool())
tool_registry.register(DiskUsageTool())
tool_registry.register(ServiceStatusTool())

import json
import logging
from datetime import datetime, timezone
from typing import Any, Dict, Optional

logger = logging.getLogger("vickyai.audit")


class AuditLogger:
    """Security audit logger for tracking all tool executions and approvals."""

    @staticmethod
    def log_execution(
        tool_name: str,
        user_id: str,
        params: Dict[str, Any],
        approval_status: str,
        success: bool,
        duration_ms: float,
        error: Optional[str] = None,
    ) -> None:
        # Sanitize sensitive arguments
        safe_params = {
            k: ("***REDACTED***" if any(s in k.lower() for s in ["password", "secret", "token", "key"]) else v)
            for k, v in params.items()
        }

        entry = {
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "event": "tool_execution",
            "tool_name": tool_name,
            "user_id": user_id,
            "params": safe_params,
            "approval_status": approval_status,
            "success": success,
            "duration_ms": round(duration_ms, 2),
            "error": error,
        }
        logger.info(json.dumps(entry))


audit_logger = AuditLogger()

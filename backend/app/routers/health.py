from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text
from app.database import get_db
from app.services.ollama_service import ollama_service

router = APIRouter(prefix="/health", tags=["health"])


@router.get("")
async def health_check(db: AsyncSession = Depends(get_db)):
    """Health check endpoint checking database and Ollama connectivity."""
    db_status = "disconnected"
    try:
        await db.execute(text("SELECT 1"))
        db_status = "connected"
    except Exception:
        db_status = "error"

    ollama_ok = await ollama_service.check_health()
    ollama_status = "connected" if ollama_ok else "disconnected"

    overall_status = "healthy" if (db_status == "connected" and ollama_ok) else "degraded"

    return {
        "status": overall_status,
        "database": db_status,
        "ollama": ollama_status,
    }

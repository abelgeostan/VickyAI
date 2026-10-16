import logging
from typing import List
from fastapi import APIRouter
from app.schemas.model import ModelInfo, ModelListResponse
from app.services.ollama_service import ollama_service
from app.ai.router import ModelRouter, KNOWN_MODELS

router = APIRouter(prefix="/models", tags=["models"])
logger = logging.getLogger("vickyai.models")
model_router = ModelRouter()


@router.get("", response_model=ModelListResponse)
async def list_models():
    """
    Returns available AI models discovered from Ollama LAN service,
    enriched with capability metadata, vision support, and friendly badges.
    """
    raw_models = await ollama_service.list_models()
    model_infos: List[ModelInfo] = []

    if raw_models:
        for rm in raw_models:
            model_id = rm.get("name", rm.get("model", ""))
            if not model_id:
                continue
            info = model_router.get_model_info(model_id, raw_ollama_model=rm)
            model_infos.append(info)
    else:
        # Fallback to configured known models catalog if Ollama tags call is pending
        for m_id, m_data in KNOWN_MODELS.items():
            info = model_router.get_model_info(m_id)
            model_infos.append(info)

    # Ensure default model is first if present
    model_infos.sort(key=lambda m: (0 if m.id == "gemma3:4b" else (1 if m.id == "qwen3:4b" else 2)))

    return ModelListResponse(
        models=model_infos,
        default_model="gemma3:4b",
    )

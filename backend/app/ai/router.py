from typing import Dict, List, Optional
from app.schemas.model import ModelInfo

# Master catalog of model metadata and configurations
KNOWN_MODELS: Dict[str, dict] = {
    "gemma3:4b": {
        "name": "Gemma 3 4B",
        "badge": "Fast • Vision",
        "description": "Fast multimodal model for chat and vision analysis.",
        "supports_vision": True,
        "supports_thinking": False,
        "icon": "⚡",
        "default": True,
    },
    "qwen3:4b": {
        "name": "Qwen 3 4B",
        "badge": "Reasoning • Coding",
        "description": "Deep reasoning model for code and complex logic.",
        "supports_vision": False,
        "supports_thinking": True,
        "icon": "🧠",
        "default": False,
    },
}


class ModelRouter:
    """
    Model abstraction layer for routing, capability checks, and metadata resolution.
    V1 adheres strictly to explicit user selection without unannounced automatic switching.
    Prepared for future agentic routing and tool-based orchestration.
    """

    def __init__(self, default_model: str = "gemma3:4b"):
        self.default_model = default_model

    def get_model_info(self, model_id: str, raw_ollama_model: Optional[dict] = None) -> ModelInfo:
        # Check known registry first
        if model_id in KNOWN_MODELS:
            m = KNOWN_MODELS[model_id]
            size_gb = None
            runner = None
            if raw_ollama_model:
                size_bytes = raw_ollama_model.get("size", 0)
                size_gb = round(size_bytes / (1024 ** 3), 2) if size_bytes else None
                runner = raw_ollama_model.get("details", {}).get("runner")
            return ModelInfo(
                id=model_id,
                name=m["name"],
                badge=m["badge"],
                description=m["description"],
                supports_vision=m["supports_vision"],
                supports_thinking=m["supports_thinking"],
                icon=m["icon"],
                size_gb=size_gb,
                runner=runner,
            )

        # Dynamic fallback for models discovered on Ollama
        supports_vision = False
        supports_thinking = False
        size_gb = None
        runner = None
        if raw_ollama_model:
            caps = raw_ollama_model.get("capabilities", [])
            supports_vision = "vision" in caps or "clip" in raw_ollama_model.get("details", {}).get("families", [])
            supports_thinking = "thinking" in caps
            size_bytes = raw_ollama_model.get("size", 0)
            size_gb = round(size_bytes / (1024 ** 3), 2) if size_bytes else None
            runner = raw_ollama_model.get("details", {}).get("runner")

        icon = "👁️" if supports_vision else ("🧠" if supports_thinking else "🤖")
        return ModelInfo(
            id=model_id,
            name=model_id.capitalize(),
            badge="Local AI Model",
            description=f"Local Ollama model: {model_id}",
            supports_vision=supports_vision,
            supports_thinking=supports_thinking,
            icon=icon,
            size_gb=size_gb,
            runner=runner,
        )

    def validate_vision_support(self, model_id: str) -> bool:
        """Check if model supports image/vision processing."""
        if model_id in KNOWN_MODELS:
            return KNOWN_MODELS[model_id]["supports_vision"]
        return False

    def route_model(self, requested_model: Optional[str]) -> str:
        """
        Resolve target model.
        In V1: Strict adherence to user selection with safe default fallback.
        """
        if requested_model and requested_model.strip():
            return requested_model.strip()
        return self.default_model

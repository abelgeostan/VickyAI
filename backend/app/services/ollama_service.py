import json
import logging
from typing import AsyncGenerator, Dict, Any, List, Optional
import httpx
from app.config import get_settings

logger = logging.getLogger("vickyai.ollama")
settings = get_settings()


class OllamaService:
    """Service to interact with the external LAN Ollama instance."""

    def __init__(self, base_url: Optional[str] = None):
        self.base_url = (base_url or settings.OLLAMA_BASE_URL).rstrip("/")
        # Generous timeout for 4GB VRAM GPU loading models into memory
        self.timeout = httpx.Timeout(180.0, connect=10.0)

    async def check_health(self) -> bool:
        """Check if Ollama service is reachable on the LAN."""
        try:
            async with httpx.AsyncClient(timeout=httpx.Timeout(5.0, connect=3.0)) as client:
                res = await client.get(f"{self.base_url}/api/tags")
                return res.status_code == 200
        except Exception as e:
            logger.warning(f"Ollama health check failed at {self.base_url}: {e}")
            return False

    async def list_models(self) -> List[Dict[str, Any]]:
        """Retrieve list of available models from Ollama."""
        try:
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                res = await client.get(f"{self.base_url}/api/tags")
                if res.status_code == 200:
                    data = res.json()
                    return data.get("models", [])
                logger.error(f"Failed to fetch models from Ollama: HTTP {res.status_code}")
                return []
        except Exception as e:
            logger.error(f"Error connecting to Ollama at {self.base_url}: {e}")
            return []

    async def chat(
        self,
        model: str,
        messages: List[Dict[str, Any]],
        system_prompt: Optional[str] = None,
        tools: Optional[List[Dict[str, Any]]] = None,
    ) -> Dict[str, Any]:
        """Perform non-streaming chat with Ollama."""
        full_messages = []
        if system_prompt:
            full_messages.append({"role": "system", "content": system_prompt})
        full_messages.extend(messages)

        payload: Dict[str, Any] = {
            "model": model,
            "messages": full_messages,
            "stream": False,
        }
        if tools:
            payload["tools"] = tools

        async with httpx.AsyncClient(timeout=self.timeout) as client:
            res = await client.post(f"{self.base_url}/api/chat", json=payload)
            res.raise_for_status()
            return res.json()

    async def stream_chat(
        self,
        model: str,
        messages: List[Dict[str, Any]],
        system_prompt: Optional[str] = None,
        tools: Optional[List[Dict[str, Any]]] = None,
    ) -> AsyncGenerator[Dict[str, Any], None]:
        """
        Stream chat tokens from Ollama using NDJSON.
        Yields parsed dictionaries for each chunk:
        - content tokens
        - thinking tokens
        - final metrics (eval_count, total_duration)
        """
        full_messages = []
        if system_prompt:
            full_messages.append({"role": "system", "content": system_prompt})
        full_messages.extend(messages)

        payload: Dict[str, Any] = {
            "model": model,
            "messages": full_messages,
            "stream": True,
        }
        if tools:
            payload["tools"] = tools

        async with httpx.AsyncClient(timeout=self.timeout) as client:
            async with client.stream(
                "POST",
                f"{self.base_url}/api/chat",
                json=payload,
            ) as response:
                response.raise_for_status()
                async for line in response.aiter_lines():
                    if not line or not line.strip():
                        continue
                    try:
                        chunk = json.loads(line)
                        yield chunk
                    except json.JSONDecodeError:
                        logger.warning(f"Could not parse Ollama stream chunk: {line}")
                        continue


ollama_service = OllamaService()

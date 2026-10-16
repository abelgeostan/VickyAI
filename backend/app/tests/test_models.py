import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_list_models(client: AsyncClient):
    response = await client.get("/api/models")
    assert response.status_code == 200
    data = response.json()
    assert "models" in data
    assert "default_model" in data
    assert data["default_model"] == "gemma3:4b"

    models_by_id = {m["id"]: m for m in data["models"]}
    assert "gemma3:4b" in models_by_id
    assert "qwen3:4b" in models_by_id

    # Verify Gemma vision capability
    gemma = models_by_id["gemma3:4b"]
    assert gemma["supports_vision"] is True

    # Verify Qwen reasoning/thinking capability
    qwen = models_by_id["qwen3:4b"]
    assert qwen["supports_thinking"] is True
    assert qwen["supports_vision"] is False

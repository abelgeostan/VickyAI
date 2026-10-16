import pytest
from httpx import AsyncClient
from app.services.ollama_service import ollama_service


@pytest.mark.asyncio
async def test_ollama_connectivity():
    """Verify backend can communicate with external Ollama instance."""
    is_healthy = await ollama_service.check_health()
    assert is_healthy is True


@pytest.mark.asyncio
async def test_api_health_endpoint(client: AsyncClient):
    response = await client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert "status" in data
    assert "database" in data
    assert "ollama" in data
    assert data["ollama"] == "connected"

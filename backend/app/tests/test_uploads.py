import io
import pytest
from PIL import Image
from httpx import AsyncClient


def create_dummy_png() -> bytes:
    buf = io.BytesIO()
    img = Image.new("RGB", (100, 100), color=(73, 109, 137))
    img.save(buf, format="PNG")
    return buf.getvalue()


@pytest.mark.asyncio
async def test_upload_valid_image(client: AsyncClient, auth_headers: dict):
    png_bytes = create_dummy_png()
    files = {"file": ("test.png", png_bytes, "image/png")}
    response = await client.post("/api/uploads", headers=auth_headers, files=files)
    assert response.status_code == 201
    data = response.json()
    assert "id" in data
    assert "url" in data
    assert data["mime_type"] == "image/png"
    assert data["filename"].endswith(".png")


@pytest.mark.asyncio
async def test_upload_invalid_mime(client: AsyncClient, auth_headers: dict):
    txt_bytes = b"Hello this is not an image"
    files = {"file": ("test.txt", txt_bytes, "text/plain")}
    response = await client.post("/api/uploads", headers=auth_headers, files=files)
    assert response.status_code == 400
    assert "Unsupported file type" in response.json()["detail"]


@pytest.mark.asyncio
async def test_upload_unauthenticated(client: AsyncClient):
    png_bytes = create_dummy_png()
    files = {"file": ("test.png", png_bytes, "image/png")}
    response = await client.post("/api/uploads", files=files)
    assert response.status_code == 401

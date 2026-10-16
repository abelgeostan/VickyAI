import base64
import os
import uuid
import aiofiles
from fastapi import UploadFile, HTTPException, status
from app.config import get_settings
from app.utils.file_validation import validate_image_upload, sanitize_filename

settings = get_settings()


class UploadService:
    def __init__(self):
        self.upload_dir = settings.resolved_upload_dir
        os.makedirs(self.upload_dir, exist_ok=True)

    async def save_upload(self, upload_file: UploadFile) -> dict:
        contents, content_type, extension = await validate_image_upload(upload_file)
        
        file_id = uuid.uuid4()
        storage_filename = f"{file_id}{extension}"
        storage_path = os.path.join(self.upload_dir, storage_filename)
        
        # Asynchronously write to disk
        async with aiofiles.open(storage_path, "wb") as f:
            await f.write(contents)

        orig_name = sanitize_filename(upload_file.filename or "image")

        return {
            "id": file_id,
            "filename": storage_filename,
            "original_filename": orig_name,
            "mime_type": content_type,
            "size": len(contents),
            "storage_path": storage_path,
            "url": f"/api/uploads/{storage_filename}",
        }

    def get_file_path(self, filename: str) -> str:
        # Prevent path traversal
        clean_filename = os.path.basename(filename)
        full_path = os.path.join(self.upload_dir, clean_filename)
        if not os.path.isfile(full_path):
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="File not found")
        return full_path

    def encode_image_base64(self, storage_path: str) -> str:
        """Encode image file to base64 string for multimodal Ollama calls."""
        if not os.path.isfile(storage_path):
            raise FileNotFoundError(f"Image not found at {storage_path}")
        with open(storage_path, "rb") as f:
            return base64.b64encode(f.read()).decode("utf-8")


upload_service = UploadService()

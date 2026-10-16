import os
import io
from typing import Tuple
from PIL import Image
from fastapi import HTTPException, status, UploadFile
from app.config import get_settings

settings = get_settings()

ALLOWED_MIME_TYPES = {
    "image/png": ".png",
    "image/jpeg": ".jpg",
    "image/jpg": ".jpg",
    "image/webp": ".webp",
}

MAX_BYTES = settings.MAX_UPLOAD_SIZE_MB * 1024 * 1024


def sanitize_filename(filename: str) -> str:
    """Strip dangerous characters and directory traversals."""
    basename = os.path.basename(filename)
    safe_chars = [c for c in basename if c.isalnum() or c in "._- "]
    return "".join(safe_chars).strip() or "unnamed_image"


async def validate_image_upload(upload_file: UploadFile) -> Tuple[bytes, str, str]:
    """
    Validates uploaded file against MIME type, size limit, and genuine image content.
    Returns: (file_bytes, content_type, safe_extension)
    """
    content_type = (upload_file.content_type or "").lower()
    if content_type not in ALLOWED_MIME_TYPES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unsupported file type '{content_type}'. Allowed formats: PNG, JPEG, WEBP.",
        )

    # Read content with size check
    contents = await upload_file.read()
    if len(contents) > MAX_BYTES:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail=f"File exceeds maximum allowed size of {settings.MAX_UPLOAD_SIZE_MB}MB.",
        )

    if len(contents) == 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Uploaded file is empty.",
        )

    # Validate image data using Pillow
    try:
        with Image.open(io.BytesIO(contents)) as img:
            img.verify()  # Verifies file integrity
            img_format = img.format.lower() if img.format else ""
            if img_format not in ["png", "jpeg", "webp"]:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Image verification failed. Detected invalid format: {img_format}",
                )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Uploaded file is not a valid or readable image: {str(e)}",
        )

    extension = ALLOWED_MIME_TYPES[content_type]
    return contents, content_type, extension

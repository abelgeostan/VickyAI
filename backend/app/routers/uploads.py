from fastapi import APIRouter, UploadFile, File, Depends, HTTPException, status
from fastapi.responses import FileResponse
from app.auth.dependencies import get_current_user
from app.models.user import User
from app.schemas.attachment import AttachmentUploadResponse
from app.services.upload_service import upload_service

router = APIRouter(prefix="/uploads", tags=["uploads"])


@router.post("", response_model=AttachmentUploadResponse, status_code=status.HTTP_201_CREATED)
async def upload_file(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
):
    """Secure image upload endpoint with MIME validation, size check, and UUID hashing."""
    result = await upload_service.save_upload(file)
    return AttachmentUploadResponse(
        id=result["id"],
        filename=result["filename"],
        original_filename=result["original_filename"],
        mime_type=result["mime_type"],
        size=result["size"],
        url=result["url"],
    )


@router.get("/{filename}")
async def serve_file(filename: str):
    """Safely serve uploaded images."""
    file_path = upload_service.get_file_path(filename)
    return FileResponse(file_path, media_type="image/jpeg")

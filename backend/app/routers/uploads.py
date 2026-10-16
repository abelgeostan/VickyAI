from fastapi import APIRouter, UploadFile, File, Depends, HTTPException, status
from fastapi.responses import FileResponse
from sqlalchemy.ext.asyncio import AsyncSession
from app.database import get_db
from app.auth.dependencies import get_current_user
from app.models.user import User
from app.models.attachment import Attachment
from app.schemas.attachment import AttachmentUploadResponse
from app.services.upload_service import upload_service

router = APIRouter(prefix="/uploads", tags=["uploads"])


@router.post("", response_model=AttachmentUploadResponse, status_code=status.HTTP_201_CREATED)
async def upload_file(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Secure image upload endpoint with MIME validation, size check, and UUID hashing."""
    result = await upload_service.save_upload(file)

    # Persist attachment in database so it can be queried by ID and linked to message
    attachment = Attachment(
        id=result["id"],
        message_id=None,
        filename=result["filename"],
        original_filename=result["original_filename"],
        mime_type=result["mime_type"],
        size=result["size"],
        storage_path=result["storage_path"],
    )
    db.add(attachment)
    await db.commit()
    await db.refresh(attachment)

    return AttachmentUploadResponse(
        id=attachment.id,
        filename=attachment.filename,
        original_filename=attachment.original_filename,
        mime_type=attachment.mime_type,
        size=attachment.size,
        url=result["url"],
    )


@router.get("/{filename}")
async def serve_file(filename: str):
    """Safely serve uploaded images."""
    file_path = upload_service.get_file_path(filename)
    return FileResponse(file_path, media_type="image/jpeg")

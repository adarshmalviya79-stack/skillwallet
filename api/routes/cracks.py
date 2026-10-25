from fastapi import APIRouter, UploadFile, File, Form, HTTPException, status
from typing import Optional
from api.schemas import ApiResponse, CrackAnalysisResult
from api.gemini_service import analyze_crack_image
from api.storage import storage

router = APIRouter()

ALLOWED_MIME_TYPES = {"image/jpeg", "image/png", "image/webp", "image/jpg"}
MAX_FILE_SIZE = 10 * 1024 * 1024  # 10 MB

@router.post("/cracks/analyze", response_model=ApiResponse[CrackAnalysisResult])
async def analyze_cracks(
    file: UploadFile = File(..., description="Photograph of concrete, masonry, or structural surface"),
    surface_context: Optional[str] = Form(None, description="Optional notes on structure age, indoor/outdoor, or load condition"),
    element_name: Optional[str] = Form(None, description="Element name e.g., Basement Wall, Column C3")
):
    # 1. Validate MIME type
    if file.content_type not in ALLOWED_MIME_TYPES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unsupported file format '{file.content_type}'. Please upload a JPEG, PNG, or WEBP image."
        )

    # 2. Read and validate size
    try:
        content = await file.read()
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to read uploaded image: {str(e)}"
        )

    if len(content) > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail="Image size exceeds the 10 MB limit."
        )

    if len(content) == 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Uploaded image file is empty."
        )

    # 3. Multimodal Analysis
    result = await analyze_crack_image(
        image_bytes=content,
        mime_type=file.content_type or "image/jpeg",
        context_notes=surface_context
    )

    # 4. Save report
    title = f"Crack Inspection - {element_name or file.filename or 'Structural Element'}"
    saved_doc = await storage.save_report(
        report_type="crack",
        title=title,
        data=result.model_dump(),
        risk_level=result.overall_severity
    )

    return ApiResponse(
        success=True,
        data=result,
        meta={
            "report_id": saved_doc.get("id"),
            "storage_engine": saved_doc.get("storage_engine"),
            "filename": file.filename
        }
    )

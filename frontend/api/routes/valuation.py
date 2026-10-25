from fastapi import APIRouter, HTTPException, status
from api.schemas import ApiResponse, PropertyValuationRequest, PropertyValuationResult
from api.valuation_service import calculate_indicative_valuation
from api.storage import storage

router = APIRouter()

@router.post("/valuation/estimate", response_model=ApiResponse[PropertyValuationResult])
async def estimate_valuation(request: PropertyValuationRequest):
    if request.built_up_area_sqft <= 0:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Built-up area must be greater than 0 square feet."
        )

    # Calculate transparent indicative valuation
    result = calculate_indicative_valuation(request)

    # Save to reports
    title = f"Valuation: {request.property_type} in {request.location_city} ({request.built_up_area_sqft:,.0f} sqft)"
    saved_doc = await storage.save_report(
        report_type="valuation",
        title=title,
        data=result.model_dump(),
        risk_level="Normal"
    )

    return ApiResponse(
        success=True,
        data=result,
        meta={
            "report_id": saved_doc.get("id"),
            "storage_engine": saved_doc.get("storage_engine")
        }
    )

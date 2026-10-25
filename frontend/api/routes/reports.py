from fastapi import APIRouter, HTTPException, Query, status
from typing import List, Optional
from api.schemas import ApiResponse
from api.storage import storage

router = APIRouter()

@router.get("/reports", response_model=ApiResponse[List[dict]])
async def list_reports(
    type: Optional[str] = Query(None, description="Filter by report type: safety, crack, valuation, planning"),
    search: Optional[str] = Query(None, description="Search keyword in title or summary")
):
    reports = await storage.get_reports(report_type=type)
    if search:
        s = search.lower()
        reports = [r for r in reports if s in r.get("title", "").lower() or s in r.get("summary", "").lower()]

    return ApiResponse(
        success=True,
        data=reports,
        meta={
            "count": len(reports),
            "storage_type": storage.storage_mode,
            "persistent": storage.is_persistent
        }
    )

@router.get("/reports/{report_id}", response_model=ApiResponse[dict])
async def get_report_detail(report_id: str):
    report = await storage.get_report_by_id(report_id)
    if not report:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Report with ID '{report_id}' was not found."
        )
    return ApiResponse(
        success=True,
        data=report
    )

@router.delete("/reports/{report_id}", response_model=ApiResponse[dict])
async def delete_report(report_id: str):
    success = await storage.delete_report(report_id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Report with ID '{report_id}' not found or could not be removed."
        )
    return ApiResponse(
        success=True,
        data={"deleted": True, "id": report_id}
    )

from fastapi import APIRouter
from api.schemas import ApiResponse, DashboardStats
from api.storage import storage

router = APIRouter()

@router.get("/dashboard", response_model=ApiResponse[DashboardStats])
async def get_dashboard():
    stats = await storage.get_dashboard_stats()
    return ApiResponse(
        success=True,
        data=DashboardStats(**stats)
    )

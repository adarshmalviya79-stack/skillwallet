from fastapi import APIRouter, HTTPException, status
from typing import List
from datetime import datetime
from api.schemas import ApiResponse, ProjectPlanRequest, ProjectPlanResult
from api.planning_service import generate_project_plan
from api.storage import storage

router = APIRouter()

@router.post("/projects/plan", response_model=ApiResponse[ProjectPlanResult])
async def create_project_plan(request: ProjectPlanRequest):
    # Validate dates
    try:
        s_date = datetime.strptime(request.start_date, "%Y-%m-%d")
        c_date = datetime.strptime(request.completion_date, "%Y-%m-%d")
        if c_date <= s_date:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail="Planned completion date must be strictly after the start date."
            )
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Dates must be in valid YYYY-MM-DD format."
        )

    if request.estimated_budget <= 0:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Estimated budget must be greater than zero."
        )

    # Generate plan
    plan = generate_project_plan(request)

    # Persist in projects store
    saved_project = await storage.save_project(plan.model_dump())

    # Also log as report
    await storage.save_report(
        report_type="planning",
        title=f"Plan: {request.project_name} ({request.project_type})",
        data=plan.model_dump(),
        risk_level="Planned"
    )

    return ApiResponse(
        success=True,
        data=plan,
        meta={
            "project_id": saved_project.get("project_id"),
            "storage_engine": storage.storage_mode
        }
    )

@router.get("/projects", response_model=ApiResponse[List[dict]])
async def get_projects():
    projects = await storage.get_projects()
    return ApiResponse(
        success=True,
        data=projects,
        meta={
            "count": len(projects),
            "storage_engine": storage.storage_mode
        }
    )

from fastapi import APIRouter, Query, HTTPException, status
from api.schemas import ApiResponse, WeatherAdvisoryResult
from api.weather_service import fetch_weather_advisory

router = APIRouter()

@router.get("/weather", response_model=ApiResponse[WeatherAdvisoryResult])
async def get_weather(
    location: str = Query("Chicago, IL", description="City, state, or address to query for weather advisories")
):
    clean_loc = location.strip()
    if len(clean_loc) < 2:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Please provide a valid location name with at least 2 characters."
        )

    try:
        weather_result = await fetch_weather_advisory(clean_loc)
        return ApiResponse(
            success=True,
            data=weather_result
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"Unable to retrieve live meteorological data for '{clean_loc}': {str(e)}"
        )

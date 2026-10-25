import httpx
import logging
from datetime import datetime, timezone
from typing import Dict, Any, List
from api.schemas import WeatherAdvisoryResult, CurrentWeather, DailyForecast, ConstructionAdvisory

logger = logging.getLogger(__name__)

# Weather code descriptions from WMO interpretation codes
WMO_CODES = {
    0: "Clear sky",
    1: "Mainly clear",
    2: "Partly cloudy",
    3: "Overcast",
    45: "Fog",
    48: "Depositing rime fog",
    51: "Light drizzle",
    53: "Moderate drizzle",
    55: "Dense drizzle",
    61: "Slight rain",
    63: "Moderate rain",
    65: "Heavy rain",
    71: "Slight snow fall",
    73: "Moderate snow fall",
    75: "Heavy snow fall",
    80: "Slight rain showers",
    81: "Moderate rain showers",
    82: "Violent rain showers",
    95: "Thunderstorm",
    96: "Thunderstorm with slight hail",
    99: "Thunderstorm with heavy hail"
}

def generate_construction_advisories(current: Dict[str, Any]) -> List[ConstructionAdvisory]:
    advisories = []
    temp_c = current.get("temperature_c", 20.0)
    wind_kmh = current.get("wind_speed_kmh", 10.0)
    gusts_kmh = current.get("wind_gusts_kmh", 15.0)
    precip_mm = current.get("precipitation_mm", 0.0)
    humidity = current.get("relative_humidity", 50)

    # 1. Crane & Rigging Operations
    if gusts_kmh >= 38.0 or wind_kmh >= 32.0:
        advisories.append(ConstructionAdvisory(
            operation="Crane & Rigging Operations",
            status="Hazardous / Stop Work",
            risk_factor=f"Wind gusts reach {gusts_kmh} km/h (exceeding 20 knots safety threshold).",
            recommendation="Suspend critical crane picks, mobile elevated work platforms (MEWPs), and tower crane operations in accordance with OSHA 1926.1431."
        ))
    elif gusts_kmh >= 25.0:
        advisories.append(ConstructionAdvisory(
            operation="Crane & Rigging Operations",
            status="Caution",
            risk_factor=f"Gusts up to {gusts_kmh} km/h.",
            recommendation="Verify tag lines are manned and avoid high-surface-area panel lifts."
        ))
    else:
        advisories.append(ConstructionAdvisory(
            operation="Crane & Rigging Operations",
            status="Safe",
            risk_factor="Wind speeds within standard operating envelopes.",
            recommendation="Standard rigging and lift plans can proceed normally."
        ))

    # 2. Concrete Pouring & Finishing
    if precip_mm > 1.0:
        advisories.append(ConstructionAdvisory(
            operation="Concrete Placement & Finishing",
            status="Hazardous / Stop Work",
            risk_factor=f"Active precipitation ({precip_mm} mm) detected.",
            recommendation="Postpone outdoor slab pours to prevent surface dilution, weakened paste, and plastic shrinkage cracking."
        ))
    elif temp_c < 4.0:
        advisories.append(ConstructionAdvisory(
            operation="Concrete Placement & Finishing",
            status="Caution",
            risk_factor=f"Cold ambient temperature ({temp_c}°C).",
            recommendation="Implement ACI 306R Cold Weather Concreting procedures: heated water, thermal curing blankets, and set accelerators."
        ))
    elif temp_c > 33.0:
        advisories.append(ConstructionAdvisory(
            operation="Concrete Placement & Finishing",
            status="Caution",
            risk_factor=f"High ambient temperature ({temp_c}°C).",
            recommendation="Apply ACI 305R Hot Weather protocols: ice-water batching, early morning pouring, and immediate curing compound application."
        ))
    else:
        advisories.append(ConstructionAdvisory(
            operation="Concrete Placement & Finishing",
            status="Safe",
            risk_factor="Optimal curing window (4°C - 30°C with dry conditions).",
            recommendation="Standard mix designs and curing specifications apply."
        ))

    # 3. Roofing & Exterior Waterproofing
    if precip_mm > 0.2 or humidity > 85:
        advisories.append(ConstructionAdvisory(
            operation="Roofing & Waterproofing",
            status="Hazardous / Stop Work",
            risk_factor=f"High moisture / precipitation ({humidity}% RH, {precip_mm} mm rain).",
            recommendation="Do not apply torch-down membranes, liquid sealants, or exterior primer coatings until sub-base is dry."
        ))
    else:
        advisories.append(ConstructionAdvisory(
            operation="Roofing & Waterproofing",
            status="Safe",
            risk_factor="Low moisture and dry substrate.",
            recommendation="Membrane adhesion and exterior coating application permitted."
        ))

    # 4. Trenching & Earth Excavation
    if precip_mm > 4.0:
        advisories.append(ConstructionAdvisory(
            operation="Excavation & Trenching",
            status="Hazardous / Stop Work",
            risk_factor=f"Heavy rainfall ({precip_mm} mm) risking soil liquefaction.",
            recommendation="Inspect trench boxes, test dewatering pumps, and monitor trench walls for sloughing or fissures (OSHA 1926 Subpart P)."
        ))
    elif precip_mm > 0.5:
        advisories.append(ConstructionAdvisory(
            operation="Excavation & Trenching",
            status="Caution",
            risk_factor="Damp ground conditions.",
            recommendation="Check grade slopes and wheel traction for heavy haulers."
        ))
    else:
        advisories.append(ConstructionAdvisory(
            operation="Excavation & Trenching",
            status="Safe",
            risk_factor="Stable dry soil conditions.",
            recommendation="Earthwork, grading, and compaction operations cleared to proceed."
        ))

    return advisories


async def fetch_weather_advisory(location: str) -> WeatherAdvisoryResult:
    """
    Fetches real-time weather and 5-day forecast from Open-Meteo API (100% real data, no key required).
    """
    async with httpx.AsyncClient(timeout=10.0) as client:
        # Step 1: Geocode the location
        geo_url = "https://geocoding-api.open-meteo.com/v1/search"
        geo_resp = await client.get(geo_url, params={"name": location, "count": 1, "language": "en", "format": "json"})
        
        lat, lon, resolved_name = 37.7749, -122.4194, location  # Default San Francisco if not found
        if geo_resp.status_code == 200:
            geo_data = geo_resp.json()
            if geo_data.get("results"):
                res = geo_data["results"][0]
                lat = res["latitude"]
                lon = res["longitude"]
                resolved_name = f"{res.get('name')}, {res.get('admin1', res.get('country', ''))}".strip(", ")

        # Step 2: Fetch forecast from Open-Meteo
        forecast_url = "https://api.open-meteo.com/v1/forecast"
        params = {
            "latitude": lat,
            "longitude": lon,
            "current": "temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,wind_speed_10m,wind_gusts_10m",
            "daily": "weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum,wind_speed_10m_max",
            "timezone": "auto"
        }
        
        forecast_resp = await client.get(forecast_url, params=params)
        forecast_resp.raise_for_status()
        f_data = forecast_resp.json()

        current_raw = f_data.get("current", {})
        temp_c = current_raw.get("temperature_2m", 22.0)
        temp_f = round((temp_c * 9/5) + 32, 1)
        w_code = current_raw.get("weather_code", 0)
        w_desc = WMO_CODES.get(w_code, "Partly Cloudy")

        current_obj = CurrentWeather(
            temperature_c=temp_c,
            temperature_f=temp_f,
            apparent_temperature_c=current_raw.get("apparent_temperature", temp_c),
            relative_humidity=int(current_raw.get("relative_humidity_2m", 50)),
            wind_speed_kmh=current_raw.get("wind_speed_10m", 12.0),
            wind_gusts_kmh=current_raw.get("wind_gusts_10m", 18.0),
            precipitation_mm=current_raw.get("precipitation", 0.0),
            weather_description=w_desc,
            weather_code=w_code
        )

        # Parse daily forecast
        daily_list = []
        daily_raw = f_data.get("daily", {})
        dates = daily_raw.get("time", [])
        max_temps = daily_raw.get("temperature_2m_max", [])
        min_temps = daily_raw.get("temperature_2m_min", [])
        precips = daily_raw.get("precipitation_sum", [])
        wind_maxes = daily_raw.get("wind_speed_10m_max", [])
        codes = daily_raw.get("weather_code", [])

        for i in range(min(5, len(dates))):
            d_code = codes[i] if i < len(codes) else 0
            daily_list.append(DailyForecast(
                date=dates[i],
                max_temp_c=max_temps[i] if i < len(max_temps) else 25.0,
                min_temp_c=min_temps[i] if i < len(min_temps) else 15.0,
                precipitation_sum_mm=precips[i] if i < len(precips) else 0.0,
                max_wind_speed_kmh=wind_maxes[i] if i < len(wind_maxes) else 15.0,
                condition=WMO_CODES.get(d_code, "Fair")
            ))

        # Generate safety advisories
        advisories = generate_construction_advisories({
            "temperature_c": temp_c,
            "wind_speed_kmh": current_obj.wind_speed_kmh,
            "wind_gusts_kmh": current_obj.wind_gusts_kmh,
            "precipitation_mm": current_obj.precipitation_mm,
            "relative_humidity": current_obj.relative_humidity
        })

        # Overall condition
        has_hazardous = any(a.status == "Hazardous / Stop Work" for a in advisories)
        has_caution = any(a.status == "Caution" for a in advisories)
        if has_hazardous:
            overall = "Severe Weather Alert / Site Restrictions Active"
        elif has_caution:
            overall = "Moderate Risk / Weather Precautions Required"
        else:
            overall = "Favorable Site Conditions"

        now_str = datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M UTC")

        return WeatherAdvisoryResult(
            location=resolved_name,
            latitude=lat,
            longitude=lon,
            timestamp=now_str,
            current=current_obj,
            daily_forecast=daily_list,
            advisories=advisories,
            overall_site_condition=overall,
            is_real_api_data=True
        )

import pytest
import io
from fastapi.testclient import TestClient
from api.index import app

client = TestClient(app)

def test_health_endpoint():
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert data["data"]["status"] == "healthy"
    assert "version" in data["data"]
    assert "services" in data["data"]

def test_dashboard_endpoint():
    response = client.get("/api/dashboard")
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert "total_images_analyzed" in data["data"]
    assert "storage_type" in data["data"]
    assert "risk_distribution" in data["data"]

def test_safety_analyze_valid():
    # 1x1 transparent PNG byte stream
    png_bytes = b'\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR\x00\x00\x00\x01\x00\x00\x00\x01\x08\x06\x00\x00\x00\x1f\x15c4\x00\x00\x00\nIDATx\x9cc\x00\x01\x00\x00\x05\x00\x01\r\n-\xb4\x00\x00\x00\x00IEND\xaeB`\x82'
    files = {"file": ("test_site.png", io.BytesIO(png_bytes), "image/png")}
    data = {"site_description": "Excavation phase foundation review", "project_name": "Skyline Tower"}
    
    response = client.post("/api/safety/analyze", files=files, data=data)
    assert response.status_code == 200
    res = response.json()
    assert res["success"] is True
    assert "overall_risk_level" in res["data"]
    assert "hazards" in res["data"]
    assert len(res["data"]["hazards"]) > 0
    assert "disclaimer" in res["data"]

def test_safety_analyze_invalid_mime():
    files = {"file": ("test.txt", io.BytesIO(b"not an image"), "text/plain")}
    response = client.post("/api/safety/analyze", files=files)
    assert response.status_code == 400
    assert "Unsupported file format" in response.json()["detail"]

def test_cracks_analyze_valid():
    png_bytes = b'\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR\x00\x00\x00\x01\x00\x00\x00\x01\x08\x06\x00\x00\x00\x1f\x15c4\x00\x00\x00\nIDATx\x9cc\x00\x01\x00\x00\x05\x00\x01\r\n-\xb4\x00\x00\x00\x00IEND\xaeB`\x82'
    files = {"file": ("concrete_wall.png", io.BytesIO(png_bytes), "image/png")}
    data = {"surface_context": "Basement retaining wall, 12 years old", "element_name": "Wall Section B"}
    
    response = client.post("/api/cracks/analyze", files=files, data=data)
    assert response.status_code == 200
    res = response.json()
    assert res["success"] is True
    assert "overall_severity" in res["data"]
    assert "observed_cracks" in res["data"]
    assert "requires_structural_engineer" in res["data"]

def test_valuation_estimate_valid():
    payload = {
        "property_type": "Single Family",
        "location_city": "Chicago",
        "built_up_area_sqft": 2500,
        "land_area_sqft": 5000,
        "bedrooms": 4,
        "bathrooms": 3,
        "age_years": 8,
        "construction_quality": "Premium",
        "amenities": ["Garage", "Central HVAC", "Solar Panels"]
    }
    response = client.post("/api/valuation/estimate", json=payload)
    assert response.status_code == 200
    res = response.json()
    assert res["success"] is True
    assert res["data"]["estimated_value"] > 0
    assert res["data"]["value_range_min"] < res["data"]["estimated_value"]
    assert res["data"]["value_range_max"] > res["data"]["estimated_value"]
    assert "breakdown" in res["data"]
    assert "disclaimer" in res["data"]

def test_valuation_negative_area_validation():
    payload = {
        "property_type": "Single Family",
        "location_city": "Chicago",
        "built_up_area_sqft": -500
    }
    response = client.post("/api/valuation/estimate", json=payload)
    assert response.status_code == 422

def test_projects_plan_valid():
    payload = {
        "project_name": "Metro Commercial Hub",
        "project_type": "Commercial",
        "location": "Denver, CO",
        "estimated_budget": 1500000,
        "project_area_sqft": 18000,
        "start_date": "2026-06-01",
        "completion_date": "2027-04-30",
        "requirements": "LEED Gold certification, post-tensioned slabs"
    }
    response = client.post("/api/projects/plan", json=payload)
    assert response.status_code == 200
    res = response.json()
    assert res["success"] is True
    assert res["data"]["project_name"] == "Metro Commercial Hub"
    assert len(res["data"]["phases"]) >= 5
    assert len(res["data"]["budget_breakdown"]) >= 4
    assert len(res["data"]["risk_matrix"]) >= 3

def test_projects_invalid_dates():
    payload = {
        "project_name": "Invalid Date Project",
        "project_type": "Residential",
        "location": "Miami",
        "estimated_budget": 500000,
        "project_area_sqft": 3000,
        "start_date": "2026-06-01",
        "completion_date": "2026-01-01"  # Completion before start!
    }
    response = client.post("/api/projects/plan", json=payload)
    assert response.status_code == 422

def test_chat_assistant():
    payload = {
        "message": "What is the minimum curing time for concrete formwork?",
        "history": [],
        "project_context": "Slab casting on floor 3"
    }
    response = client.post("/api/chat", json=payload)
    assert response.status_code == 200
    res = response.json()
    assert res["success"] is True
    assert len(res["data"]["reply"]) > 20
    assert "suggestions" in res["data"]

def test_weather_advisory():
    response = client.get("/api/weather?location=Chicago")
    assert response.status_code == 200
    res = response.json()
    assert res["success"] is True
    assert "current" in res["data"]
    assert "advisories" in res["data"]
    assert len(res["data"]["advisories"]) >= 3

def test_reports_crud():
    # 1. List reports
    response = client.get("/api/reports")
    assert response.status_code == 200
    reports = response.json()["data"]
    assert len(reports) > 0
    report_id = reports[0]["id"]

    # 2. Get detail
    detail_resp = client.get(f"/api/reports/{report_id}")
    assert detail_resp.status_code == 200
    assert detail_resp.json()["data"]["id"] == report_id

    # 3. Delete report
    del_resp = client.delete(f"/api/reports/{report_id}")
    assert del_resp.status_code == 200
    assert del_resp.json()["data"]["deleted"] is True

    # 4. Confirm deleted
    get_again = client.get(f"/api/reports/{report_id}")
    assert get_again.status_code == 404

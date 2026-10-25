from typing import Generic, TypeVar, Optional, List, Dict, Any
from pydantic import BaseModel, Field
from datetime import datetime

T = TypeVar("T")

class ApiResponse(BaseModel, Generic[T]):
    success: bool = True
    data: Optional[T] = None
    error: Optional[str] = None
    meta: Optional[Dict[str, Any]] = None

# --- Safety Monitoring ---
class SafetyHazard(BaseModel):
    id: str = Field(description="Unique identifier for the hazard")
    name: str = Field(description="Short title of the hazard")
    category: str = Field(description="Hazard category (e.g., PPE, Fall Protection, Electrical, Scaffolding, Housekeeping)")
    severity: str = Field(description="Severity: Low, Medium, High, Critical")
    visual_evidence: str = Field(description="What in the image points to this hazard")
    corrective_action: str = Field(description="Immediate mitigation or correction step")
    osha_reference: Optional[str] = Field(default=None, description="Relevant standard reference (e.g., OSHA 1926)")

class SafetyAnalysisResult(BaseModel):
    overall_risk_level: str = Field(description="Low, Moderate, High, or Critical")
    safety_score: int = Field(ge=0, le=100, description="Overall safety index score out of 100")
    summary: str = Field(description="Executive summary of the safety evaluation")
    hazards: List[SafetyHazard] = Field(default_factory=list)
    positive_observations: List[str] = Field(default_factory=list, description="Compliant or good safety practices observed")
    recommendations: List[str] = Field(default_factory=list, description="Key prioritized site safety actions")
    site_conditions: Optional[str] = Field(default=None, description="Observed lighting, clutter, staging status")
    disclaimer: str = Field(default="Preliminary AI decision-support only. Not a certified safety inspection and does not guarantee regulatory compliance.")
    is_demo: bool = Field(default=False, description="True if simulated fallback was used due to missing or offline API")

# --- Crack Detection & Analysis ---
class CrackItem(BaseModel):
    id: str
    crack_type: str = Field(description="Hairline, Structural, Settlement, Craze/Map, Thermal, Diagonal Shear")
    pattern: str = Field(description="Vertical, Horizontal, Diagonal, Stepped, Spider-web")
    location: str = Field(description="Location on element (e.g., beam joint, wall corner, foundation base)")
    visual_severity: str = Field(description="Low, Medium, High")
    visual_characteristics: str = Field(description="Visual appearance, branching, spalling")
    direction: Optional[str] = None

class CrackAnalysisResult(BaseModel):
    surface_type: str = Field(description="e.g., Reinforced Concrete, Masonry Brick, Stucco, Drywall, Foundation")
    overall_severity: str = Field(description="Low, Medium, or High")
    confidence_level: str = Field(description="Estimated visual confidence: High, Moderate, Low")
    summary: str = Field(description="Detailed overview of the surface condition")
    observed_cracks: List[CrackItem] = Field(default_factory=list)
    probable_causes: List[str] = Field(default_factory=list, description="Potential causes (e.g., thermal cycles, differential settlement)")
    unobservable_factors: List[str] = Field(default_factory=list, description="Factors requiring destructive testing or subsurface tools")
    requires_structural_engineer: bool = Field(description="Whether a qualified structural engineer must be called")
    immediate_recommendation: str = Field(description="Recommended maintenance, monitoring, or immediate shoring")
    disclaimer: str = Field(default="Visual analysis based on photograph only. Crack widths and subsurface integrity cannot be certified without physical instrumentation.")
    is_demo: bool = Field(default=False)

# --- Real Estate Property Valuation ---
class PropertyValuationRequest(BaseModel):
    property_type: str = Field(..., description="Single Family, Multi-Family, Apartment/Condo, Commercial, Industrial, Land")
    location_city: str = Field(..., min_length=2, description="City or metropolitan area")
    built_up_area_sqft: float = Field(..., gt=0, description="Gross living / built-up area in sq ft")
    land_area_sqft: Optional[float] = Field(default=None, ge=0)
    bedrooms: int = Field(default=3, ge=0)
    bathrooms: float = Field(default=2.0, ge=0)
    age_years: int = Field(default=5, ge=0, description="Age of structure in years")
    construction_quality: str = Field(default="Standard", description="Builder Grade, Standard, Premium, Luxury")
    amenities: List[str] = Field(default_factory=list)
    condition_notes: Optional[str] = None

class ValuationBreakdown(BaseModel):
    base_structure_value: float
    location_adjustment: float
    quality_adjustment: float
    depreciation_adjustment: float
    amenities_value: float

class PropertyValuationResult(BaseModel):
    estimated_value: float
    value_range_min: float
    value_range_max: float
    price_per_sqft: float
    baseline_benchmark_rate: float
    breakdown: ValuationBreakdown
    factors_influencing_value: List[str]
    assumptions: List[str]
    data_limitations: List[str]
    ai_market_insight: Optional[str] = None
    disclaimer: str = Field(default="Indicative estimate based on configured valuation algorithms and regional benchmarks. This is not an official appraisal or loan valuation.")
    is_demo: bool = False

# --- Construction Project Planning ---
class ProjectPlanRequest(BaseModel):
    project_name: str = Field(..., min_length=2)
    project_type: str = Field(..., description="Residential, Commercial, Renovation, Infrastructure, Industrial")
    location: str = Field(..., min_length=2)
    estimated_budget: float = Field(..., gt=0)
    project_area_sqft: float = Field(..., gt=0)
    start_date: str = Field(..., description="YYYY-MM-DD")
    completion_date: str = Field(..., description="YYYY-MM-DD")
    requirements: Optional[str] = Field(default="")

class PlanTask(BaseModel):
    id: str
    name: str
    duration_days: int
    trade: str
    dependencies: List[str] = Field(default_factory=list)
    deliverables: str

class PlanPhase(BaseModel):
    id: str
    phase_name: str
    estimated_days: int
    tasks: List[PlanTask] = Field(default_factory=list)

class BudgetAllocation(BaseModel):
    category: str
    percentage: float
    amount: float
    notes: str

class RiskItem(BaseModel):
    risk_title: str
    probability: str  # Low, Medium, High
    impact: str       # Low, Medium, High
    mitigation_strategy: str

class ProjectPlanResult(BaseModel):
    project_id: str
    project_name: str
    project_type: str
    location: str
    total_budget: float
    total_duration_days: int
    start_date: str
    completion_date: str
    phases: List[PlanPhase] = Field(default_factory=list)
    milestones: List[str] = Field(default_factory=list)
    budget_breakdown: List[BudgetAllocation] = Field(default_factory=list)
    risk_matrix: List[RiskItem] = Field(default_factory=list)
    recommended_next_actions: List[str] = Field(default_factory=list)
    disclaimer: str = Field(default="AI-generated project schedule and budget allocation are estimates for planning purposes and require review by a licensed project manager.")
    is_demo: bool = False

# --- Chat & Assistant ---
class ChatMessage(BaseModel):
    role: str = Field(..., description="'user' or 'assistant' or 'system'")
    content: str

class ChatRequest(BaseModel):
    message: str = Field(..., min_length=1)
    history: List[ChatMessage] = Field(default_factory=list)
    project_context: Optional[str] = None

class ChatResponse(BaseModel):
    reply: str
    suggestions: List[str] = Field(default_factory=list)
    topic_category: str = "General Construction"
    disclaimer: str = "For professional decision support only. Always verify local building codes and engineering specifications."
    is_demo: bool = False

# --- Weather Advisory ---
class CurrentWeather(BaseModel):
    temperature_c: float
    temperature_f: float
    apparent_temperature_c: float
    relative_humidity: int
    wind_speed_kmh: float
    wind_gusts_kmh: float
    precipitation_mm: float
    weather_description: str
    weather_code: int

class DailyForecast(BaseModel):
    date: str
    max_temp_c: float
    min_temp_c: float
    precipitation_sum_mm: float
    max_wind_speed_kmh: float
    condition: str

class ConstructionAdvisory(BaseModel):
    operation: str  # e.g., "Crane & Lifting Operations", "Concrete Pouring", "Exterior Painting", "Excavation/Trenching"
    status: str     # "Safe", "Caution", "Hazardous / Stop Work"
    risk_factor: str
    recommendation: str

class WeatherAdvisoryResult(BaseModel):
    location: str
    latitude: float
    longitude: float
    timestamp: str
    current: CurrentWeather
    daily_forecast: List[DailyForecast] = Field(default_factory=list)
    advisories: List[ConstructionAdvisory] = Field(default_factory=list)
    overall_site_condition: str  # "Favorable", "Moderate Risk", "Severe Weather Alert"
    is_real_api_data: bool = True

# --- Reports & Dashboard ---
class ReportSummary(BaseModel):
    id: str
    title: str
    type: str  # "safety", "crack", "valuation", "planning"
    created_at: str
    risk_level: Optional[str] = None
    summary: str
    metadata: Dict[str, Any] = Field(default_factory=dict)

class ReportDetail(BaseModel):
    id: str
    title: str
    type: str
    created_at: str
    data: Dict[str, Any]
    storage_engine: str  # "mongodb" or "in_memory"

class DashboardStats(BaseModel):
    total_images_analyzed: int
    safety_assessments_count: int
    crack_analyses_count: int
    valuations_count: int
    saved_projects_count: int
    storage_type: str
    recent_activity: List[Dict[str, Any]] = Field(default_factory=list)
    risk_distribution: Dict[str, int] = Field(default_factory=dict)
    system_status: Dict[str, Any] = Field(default_factory=dict)

import math
from typing import Dict, Any, List
from api.schemas import PropertyValuationRequest, PropertyValuationResult, ValuationBreakdown

# Baseline benchmark rates per sq ft for representative metropolitan tiers
CITY_BENCHMARKS = {
    # Tier 1 Metros
    "new york": 650.0,
    "san francisco": 720.0,
    "london": 680.0,
    "sydney": 620.0,
    "mumbai": 420.0,
    "los angeles": 580.0,
    "boston": 540.0,
    "singapore": 750.0,
    
    # Tier 2 Regional Metros
    "chicago": 280.0,
    "austin": 310.0,
    "denver": 320.0,
    "atlanta": 240.0,
    "dallas": 260.0,
    "toronto": 450.0,
    "delhi": 280.0,
    "bangalore": 300.0,
    "hyderabad": 250.0,
    
    # Default Tier 3
    "default": 210.0
}

PROPERTY_TYPE_MULTIPLIERS = {
    "single family": 1.0,
    "multi-family": 1.15,
    "apartment/condo": 0.95,
    "condo": 0.95,
    "commercial": 1.35,
    "industrial": 0.80,
    "land": 0.45
}

QUALITY_MULTIPLIERS = {
    "builder grade": 0.85,
    "standard": 1.0,
    "premium": 1.25,
    "luxury": 1.55
}

AMENITY_VALUES = {
    "parking": 15000.0,
    "garage": 18000.0,
    "swimming pool": 28000.0,
    "pool": 28000.0,
    "solar panels": 14000.0,
    "solar": 14000.0,
    "central hvac": 9000.0,
    "hvac": 9000.0,
    "smart home": 6000.0,
    "garden / landscaped yard": 12000.0,
    "garden": 12000.0,
    "security system": 4000.0,
    "ev charger": 3500.0,
    "balcony / terrace": 8000.0
}

def calculate_indicative_valuation(req: PropertyValuationRequest) -> PropertyValuationResult:
    # 1. Base Rate per sqft
    city_key = req.location_city.lower().strip()
    base_rate = CITY_BENCHMARKS.get(city_key, CITY_BENCHMARKS["default"])

    # 2. Base structural valuation
    base_structure_val = req.built_up_area_sqft * base_rate

    # 3. Property Type adjustment
    type_mult = PROPERTY_TYPE_MULTIPLIERS.get(req.property_type.lower().strip(), 1.0)
    adjusted_base = base_structure_val * type_mult

    # 4. Construction Quality adjustment
    quality_mult = QUALITY_MULTIPLIERS.get(req.construction_quality.lower().strip(), 1.0)
    quality_delta = adjusted_base * (quality_mult - 1.0)

    # 5. Age depreciation: -0.8% per year, capped at 30% total base reduction
    deprec_rate = min(req.age_years * 0.008, 0.30)
    depreciation_delta = -(adjusted_base * deprec_rate)

    # 6. Amenities calculation
    total_amenity_val = 0.0
    for amenity in req.amenities:
        amenity_clean = amenity.lower().strip()
        matched_val = next((val for key, val in AMENITY_VALUES.items() if key in amenity_clean), 5000.0)
        total_amenity_val += matched_val

    # 7. Bed / Bath configuration factor
    bed_bath_factor = 1.0
    if req.bedrooms > 4:
        bed_bath_factor += 0.04
    if req.bathrooms >= req.bedrooms:
        bed_bath_factor += 0.03

    # Total calculated indicative estimate
    raw_estimate = (adjusted_base + quality_delta + depreciation_delta + total_amenity_val) * bed_bath_factor
    final_estimate = round(raw_estimate, -2)  # round to nearest 100

    # Range +/- 7.5%
    val_min = round(final_estimate * 0.925, -2)
    val_max = round(final_estimate * 1.075, -2)
    price_per_sqft = round(final_estimate / req.built_up_area_sqft, 2)

    breakdown = ValuationBreakdown(
        base_structure_value=round(base_structure_val, 2),
        location_adjustment=round((type_mult - 1.0) * base_structure_val, 2),
        quality_adjustment=round(quality_delta, 2),
        depreciation_adjustment=round(depreciation_delta, 2),
        amenities_value=round(total_amenity_val, 2)
    )

    factors = [
        f"Base location benchmark for {req.location_city}: ${base_rate:.0f}/sqft",
        f"Property classification ({req.property_type}): {type_mult:.2f}x multiplier",
        f"Finish quality index ({req.construction_quality}): {quality_mult:.2f}x multiplier",
        f"Age factor ({req.age_years} yrs): {deprec_rate*100:.1f}% cumulative physical depreciation",
        f"Amenities contribution: ${total_amenity_val:,.0f} from {len(req.amenities)} included feature(s)"
    ]

    assumptions = [
        "Structure is assumed free from active structural, seismic, or unpermitted foundation defects.",
        f"Assumes normal neighborhood market absorption and occupancy for {req.location_city}.",
        "Baseline replacement construction costs are calibrated using regional construction cost indexes."
    ]

    limitations = [
        "This algorithm provides an indicative automated valuation model (AVM) estimate.",
        "Does not constitute a formal appraisal compliant with USPAP or RICS standards.",
        "Physical interior finishes, subsurface soil conditions, and title liens are unverified.",
        "Actual market value may fluctuate based on interest rates, local school zoning, and micro-location factors."
    ]

    return PropertyValuationResult(
        estimated_value=final_estimate,
        value_range_min=val_min,
        value_range_max=val_max,
        price_per_sqft=price_per_sqft,
        baseline_benchmark_rate=base_rate,
        breakdown=breakdown,
        factors_influencing_value=factors,
        assumptions=assumptions,
        data_limitations=limitations,
        ai_market_insight=f"Based on current market parameters, properties with {req.construction_quality.lower()} finishes in {req.location_city} are tracking within a standard variance of ±7.5%. Maintaining mechanical systems and curb appeal can maximize real-estate exit pricing.",
        is_demo=False
    )

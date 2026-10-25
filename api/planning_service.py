import uuid
from datetime import datetime
from typing import List, Dict, Any
from api.schemas import (
    ProjectPlanRequest,
    ProjectPlanResult,
    PlanPhase,
    PlanTask,
    BudgetAllocation,
    RiskItem
)

def generate_project_plan(req: ProjectPlanRequest) -> ProjectPlanResult:
    # 1. Date calculation
    try:
        s_date = datetime.strptime(req.start_date, "%Y-%m-%d")
        c_date = datetime.strptime(req.completion_date, "%Y-%m-%d")
        total_days = max((c_date - s_date).days, 30)
    except Exception:
        total_days = 180

    project_id = str(uuid.uuid4())[:8]

    # 2. Phase timeline distribution
    p1_days = max(int(total_days * 0.15), 14)
    p2_days = max(int(total_days * 0.20), 14)
    p3_days = max(int(total_days * 0.25), 20)
    p4_days = max(int(total_days * 0.20), 15)
    p5_days = max(int(total_days * 0.15), 14)
    p6_days = max(total_days - (p1_days + p2_days + p3_days + p4_days + p5_days), 10)

    phases = [
        PlanPhase(
            id=f"PH-1",
            phase_name="1. Pre-Construction, Permitting & Site Prep",
            estimated_days=p1_days,
            tasks=[
                PlanTask(id="T-101", name="Geotechnical Soil Boring & Topographic Survey", duration_days=int(p1_days*0.3), trade="Civil Engineer", dependencies=[], deliverables="Geotech Report & Stamped Survey"),
                PlanTask(id="T-102", name="Municipal Permitting & Environmental Clearance", duration_days=int(p1_days*0.6), trade="Permit Expediter", dependencies=["T-101"], deliverables="Approved Building Permit Set"),
                PlanTask(id="T-103", name="Site Grading, Perimeter Fencing & Temporary Utilities", duration_days=int(p1_days*0.3), trade="Site Superintendent", dependencies=["T-102"], deliverables="Secure Staging Area & Temp Power")
            ]
        ),
        PlanPhase(
            id=f"PH-2",
            phase_name="2. Substructure & Foundation",
            estimated_days=p2_days,
            tasks=[
                PlanTask(id="T-201", name="Foundation Trenching & Subgrade Compaction", duration_days=int(p2_days*0.35), trade="Earthwork / Excavation", dependencies=["T-103"], deliverables="Compacted Subgrade (95% Modified Proctor)"),
                PlanTask(id="T-202", name="Under-Slab Plumbing & Grounding Rough-in", duration_days=int(p2_days*0.25), trade="Plumbing / Electrical", dependencies=["T-201"], deliverables="Passed Under-Slab Inspection"),
                PlanTask(id="T-203", name="Rebar Cage Placement, Formwork & Concrete Pour", duration_days=int(p2_days*0.40), trade="Concrete Contractor", dependencies=["T-202"], deliverables="Cured Foundation (28-day 4000 PSI Break Tests)")
            ]
        ),
        PlanPhase(
            id=f"PH-3",
            phase_name="3. Structural Superstructure & Framing",
            estimated_days=p3_days,
            tasks=[
                PlanTask(id="T-301", name="Structural Framing (Columns, Beams, Shear Walls)", duration_days=int(p3_days*0.5), trade="Framing / Structural Steel", dependencies=["T-203"], deliverables="Erected Structural Skeleton"),
                PlanTask(id="T-302", name="Floor Decking & Truss Installation", duration_days=int(p3_days*0.3), trade="Carpentry / Steel Erection", dependencies=["T-301"], deliverables="Load-Bearing Floor Levels Complete"),
                PlanTask(id="T-303", name="Structural Peer Review & Bolt Torque Certification", duration_days=int(p3_days*0.2), trade="Structural Inspector", dependencies=["T-302"], deliverables="Signed Special Inspection Certificate")
            ]
        ),
        PlanPhase(
            id=f"PH-4",
            phase_name="4. Building Envelope & MEP Rough-In",
            estimated_days=p4_days,
            tasks=[
                PlanTask(id="T-401", name="Roof Waterproofing & Exterior Fenestration", duration_days=int(p4_days*0.4), trade="Roofing & Glazing", dependencies=["T-303"], deliverables="Building Dry-In Milestone Achieved"),
                PlanTask(id="T-402", name="HVAC Ductwork & Mechanical Equipment Setting", duration_days=int(p4_days*0.4), trade="Mechanical (HVAC)", dependencies=["T-401"], deliverables="Duct Pressure Testing Complete"),
                PlanTask(id="T-403", name="Electrical Wiring & Domestic Water Lines", duration_days=int(p4_days*0.4), trade="Electrical / Plumbing", dependencies=["T-401"], deliverables="MEP Rough-in Municipal Sign-off")
            ]
        ),
        PlanPhase(
            id=f"PH-5",
            phase_name="5. Interior Architectural Finishes",
            estimated_days=p5_days,
            tasks=[
                PlanTask(id="T-501", name="Thermal Insulation & Drywall Hang/Tape", duration_days=int(p5_days*0.4), trade="Drywall Contractor", dependencies=["T-403"], deliverables="Level 4 Drywall Finish Complete"),
                PlanTask(id="T-502", name="Flooring, Tile, Millwork & Cabinetry", duration_days=int(p5_days*0.4), trade="Finish Carpentry", dependencies=["T-501"], deliverables="Installed Case Goods & Surfaces"),
                PlanTask(id="T-503", name="Architectural Coatings, Fixtures & Trim", duration_days=int(p5_days*0.3), trade="Painting & Finishing", dependencies=["T-502"], deliverables="Primer & Two Topcoats Applied")
            ]
        ),
        PlanPhase(
            id=f"PH-6",
            phase_name="6. Systems Commissioning & Handover",
            estimated_days=p6_days,
            tasks=[
                PlanTask(id="T-601", name="HVAC Air Balancing & Electrical Load Balancing", duration_days=int(p6_days*0.4), trade="Commissioning Agent", dependencies=["T-503"], deliverables="TAB (Testing, Adjusting, Balancing) Report"),
                PlanTask(id="T-602", name="Fire Suppression & Life Safety Acceptance Tests", duration_days=int(p6_days*0.3), trade="Fire Marshal / Life Safety", dependencies=["T-601"], deliverables="Certificate of Life Safety Compliance"),
                PlanTask(id="T-603", name="Final Municipal Inspection & Certificate of Occupancy", duration_days=int(p6_days*0.3), trade="General Contractor", dependencies=["T-602"], deliverables="Final Certificate of Occupancy (CO)")
            ]
        )
    ]

    milestones = [
        f"M1: Site Mobilization & Permits Granted ({phases[0].estimated_days} days)",
        f"M2: Foundation Pour & 28-Day Curing Complete ({phases[0].estimated_days + phases[1].estimated_days} days)",
        f"M3: Superstructure Topped Out ({phases[0].estimated_days + phases[1].estimated_days + phases[2].estimated_days} days)",
        f"M4: Complete Building Dry-In ({phases[0].estimated_days + phases[1].estimated_days + phases[2].estimated_days + phases[3].estimated_days} days)",
        f"M5: Substantial Completion & Final Occupancy Handover ({total_days} days)"
    ]

    # 3. Budget breakdown
    budget = req.estimated_budget
    allocations = [
        BudgetAllocation(category="Direct Materials & Procurement", percentage=36.0, amount=round(budget * 0.36, 2), notes="Concrete, structural framing, exterior cladding, roofing, MEP distribution"),
        BudgetAllocation(category="Skilled Labor & Trade Contractors", percentage=38.0, amount=round(budget * 0.38, 2), notes="Carpentry, electrical, plumbing, masonry, specialized finishing crews"),
        BudgetAllocation(category="Heavy Equipment & Staging", percentage=10.0, amount=round(budget * 0.10, 2), notes="Tower/mobile cranes, excavators, scaffolding rentals, perimeter hoist"),
        BudgetAllocation(category="Permits, Engineering & Architecture", percentage=7.0, amount=round(budget * 0.07, 2), notes="Municipal review fees, PE structural stamps, environmental impact testing"),
        BudgetAllocation(category="Contingency & Unforeseen Escalation", percentage=9.0, amount=round(budget * 0.09, 2), notes="Weather buffer, material lead time fluctuation, change order reserve")
    ]

    # 4. Risk Matrix
    risks = [
        RiskItem(
            risk_title="Adverse Weather Delay (Substructure Phase)",
            probability="Medium",
            impact="High",
            mitigation_strategy="Include 10 weather delay days in critical path; protect exposed excavations with geotextile covers and redundant sump pump batteries."
        ),
        RiskItem(
            risk_title="Long-Lead MEP Equipment Procurement",
            probability="High",
            impact="High",
            mitigation_strategy="Issue early procurement packages for switchgear and commercial air handling units immediately upon permit approval."
        ),
        RiskItem(
            risk_title="Subsurface Soil Anomaly / Unforeseen Obstructions",
            probability="Medium",
            impact="Moderate",
            mitigation_strategy="Conduct comprehensive soil boring grid prior to bulk excavation; allocate 3% of substructure contingency specifically for unexpected over-excavation."
        ),
        RiskItem(
            risk_title="Subcontractor Trade Stacking & Schedule Clashes",
            probability="Medium",
            impact="Moderate",
            mitigation_strategy="Implement Daily Huddle Standups and 3-week lookahead schedules to prevent trades conflicting in active zones."
        )
    ]

    next_actions = [
        "Finalize and execute contracts with geotechnical testing and surveying firms.",
        "Submit complete architectural and structural plan set to local building department.",
        "Establish formal procurement schedule for long-lead mechanical equipment.",
        "Convene pre-construction kickoff meeting with MEP trade subcontractors."
    ]

    return ProjectPlanResult(
        project_id=project_id,
        project_name=req.project_name,
        project_type=req.project_type,
        location=req.location,
        total_budget=budget,
        total_duration_days=total_days,
        start_date=req.start_date,
        completion_date=req.completion_date,
        phases=phases,
        milestones=milestones,
        budget_breakdown=allocations,
        risk_matrix=risks,
        recommended_next_actions=next_actions,
        disclaimer="AI-generated project schedule and budget allocation are estimates for planning purposes and require review by a licensed project manager.",
        is_demo=False
    )

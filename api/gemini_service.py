import json
import re
import logging
from typing import Dict, Any, Optional
import google.generativeai as genai
from api.config import settings
from api.prompts import SAFETY_ANALYSIS_PROMPT, CRACK_ANALYSIS_PROMPT, SITE_ASSISTANT_SYSTEM_PROMPT
from api.schemas import SafetyAnalysisResult, CrackAnalysisResult, ChatResponse

logger = logging.getLogger(__name__)

def clean_json_response(raw_text: str) -> Dict[str, Any]:
    """Extracts JSON object from text, handling markdown fences and extraneous tokens."""
    # Match ```json ... ``` or ``` ... ```
    match = re.search(r"```(?:json)?\s*([\s\S]*?)\s*```", raw_text)
    if match:
        raw_text = match.group(1)
    # Match the outermost {...}
    brace_match = re.search(r"(\{[\s\S]*\})", raw_text)
    if brace_match:
        raw_text = brace_match.group(1)
    return json.loads(raw_text)


def get_demo_safety_analysis(site_desc: Optional[str] = None) -> SafetyAnalysisResult:
    """High-fidelity simulated safety analysis when Gemini API key is not configured."""
    return SafetyAnalysisResult(
        overall_risk_level="Moderate",
        safety_score=68,
        summary=f"Visual assessment of site {('(' + site_desc + ')') if site_desc else ''} identifies active structural progress with several non-compliant personal protective equipment (PPE) issues, perimeter edge protection gaps, and trip hazards requiring immediate corrective action before work continues.",
        hazards=[
            {
                "id": "HAZ-01",
                "name": "Missing Fall Protection on Elevated Deck Edge",
                "category": "Fall Protection",
                "severity": "High",
                "visual_evidence": "Unprotected floor opening and exterior perimeter edge lacking top-rail, mid-rail, and toe-boards at elevation greater than 6 feet.",
                "corrective_action": "Erect standard guardrail systems or install certified temporary personal fall arrest lifelines immediately.",
                "osha_reference": "OSHA 1926.501(b)(1)"
            },
            {
                "id": "HAZ-02",
                "name": "Personnel Lacking High-Visibility Vests in Active Equipment Zone",
                "category": "PPE",
                "severity": "Medium",
                "visual_evidence": "Ground personnel operating within swing radius of mobile machinery without Class 2 high-visibility safety apparel.",
                "corrective_action": "Mandate high-visibility vests for all workers entering designated equipment transport corridors.",
                "osha_reference": "OSHA 1926.201(a)"
            },
            {
                "id": "HAZ-03",
                "name": "Subgrade Material Clutter & Trailing Cable Hazards",
                "category": "Housekeeping",
                "severity": "Low",
                "visual_evidence": "Scrap timber with exposed fasteners and uncoiled temporary power distribution lines crossing primary access walkways.",
                "corrective_action": "Clear scrap staging into designated dumpsters and suspend temporary power cords overhead or bridge under rubber cable trays.",
                "osha_reference": "OSHA 1926.25(a)"
            }
        ],
        positive_observations=[
            "All visible craft personnel are equipped with ANSI Z89.1 certified Type I hard hats.",
            "Perimeter warning caution tape demarcates hazardous crane delivery bay.",
            "Appropriate industrial heavy steel-toe work boots observed on visible workforce."
        ],
        recommendations=[
            "Conduct an immediate 10-minute all-hands safety stand-down to address fall arrest requirements.",
            "Assign safety marshal to inspect temporary edge protection perimeter on upper slab deck.",
            "Establish designated tool and cable staging stations to keep primary egress routes clear."
        ],
        site_conditions="Clear daylight visibility; dry ground conditions; high activity density.",
        disclaimer="[DEMO MODE] Preliminary AI decision-support only. Not a certified safety inspection. To enable live multimodal analysis via Google Gemini 2.5 Flash, add GEMINI_API_KEY to your .env file.",
        is_demo=True
    )


def get_demo_crack_analysis(context_notes: Optional[str] = None) -> CrackAnalysisResult:
    """High-fidelity simulated crack analysis when Gemini API key is not configured."""
    return CrackAnalysisResult(
        surface_type="Cast-in-Place Reinforced Concrete Wall",
        overall_severity="Medium",
        confidence_level="Moderate",
        summary="Visual analysis of the structural element reveals a diagonal shear crack propagating from a stress concentration point near the structural bearing corner, indicative of differential settlement or localized thermal shear stress.",
        observed_cracks=[
            {
                "id": "CRK-01",
                "crack_type": "Diagonal Shear",
                "pattern": "Diagonal",
                "location": "Upper-right quad near structural junction / opening",
                "visual_severity": "Medium",
                "visual_characteristics": "Stepped diagonal propagation across cement matrix with visible surface spalling along crack margins and minor efflorescence deposits.",
                "direction": "Propagating downward at approximately 45 degrees towards foundation footing"
            },
            {
                "id": "CRK-02",
                "crack_type": "Hairline",
                "pattern": "Vertical",
                "location": "Mid-span surface finish",
                "visual_severity": "Low",
                "visual_characteristics": "Superficial shrinkage micro-cracking limited to surface paste layer without through-wall penetration.",
                "direction": "Vertical orientation"
            }
        ],
        probable_causes=[
            "Localized differential foundation settlement exerting diagonal shear stresses.",
            "Cyclic thermal contraction and expansion lacking adequate expansion joint relief.",
            "Plastic shrinkage during early curing phase aggravated by rapid surface moisture evaporation."
        ],
        unobservable_factors=[
            "Internal tensile reinforcement (rebar) corrosion, cross-sectional loss, or debonding cannot be determined visually.",
            "Absolute through-depth penetration requires ultrasonic pulse velocity (UPV) or core extraction.",
            "Dynamic crack activity requires optical crack monitors (tell-tales) logged over a 60-day baseline."
        ],
        requires_structural_engineer=True,
        immediate_recommendation="Install calibrated acrylic crack monitors (Avongard tell-tale) to monitor movement. Schedule an on-site structural engineer review before cosmetic patching or epoxy pressure injection.",
        disclaimer="[DEMO MODE] Visual analysis based on photograph only. Crack widths and subsurface integrity cannot be certified without physical instrumentation. Set GEMINI_API_KEY in .env for live Gemini 2.5 Flash multimodal vision.",
        is_demo=True
    )


async def analyze_safety_image(image_bytes: bytes, mime_type: str, site_description: Optional[str] = None) -> SafetyAnalysisResult:
    """
    Submits image to Google Gemini multimodal model or returns realistic demo data if unconfigured.
    """
    if not settings.is_gemini_configured:
        logger.info("GEMINI_API_KEY not configured. Returning structured demo safety analysis.")
        return get_demo_safety_analysis(site_description)

    try:
        genai.configure(api_key=settings.gemini_api_key)
        # Use supported flash model for vision
        model = genai.GenerativeModel(
            model_name=settings.gemini_model,
            generation_config={"response_mime_type": "application/json"}
        )

        prompt = SAFETY_ANALYSIS_PROMPT
        if site_description:
            prompt += f"\n\nAdditional Site Context from User: {site_description}"

        image_part = {
            "mime_type": mime_type,
            "data": image_bytes
        }

        response = await model.generate_content_async([prompt, image_part])
        parsed = clean_json_response(response.text)
        parsed["is_demo"] = False
        return SafetyAnalysisResult(**parsed)

    except Exception as e:
        logger.error(f"Gemini Safety Analysis failed: {e}. Falling back to domain demo data.")
        demo = get_demo_safety_analysis(site_description)
        demo.summary += f" [Note: Live API attempt encountered: {str(e)[:80]}...]"
        return demo


async def analyze_crack_image(image_bytes: bytes, mime_type: str, context_notes: Optional[str] = None) -> CrackAnalysisResult:
    """
    Submits concrete/wall image to Google Gemini multimodal model or returns demo data.
    """
    if not settings.is_gemini_configured:
        logger.info("GEMINI_API_KEY not configured. Returning structured demo crack analysis.")
        return get_demo_crack_analysis(context_notes)

    try:
        genai.configure(api_key=settings.gemini_api_key)
        model = genai.GenerativeModel(
            model_name=settings.gemini_model,
            generation_config={"response_mime_type": "application/json"}
        )

        prompt = CRACK_ANALYSIS_PROMPT
        if context_notes:
            prompt += f"\n\nContext & Surface Details: {context_notes}"

        image_part = {
            "mime_type": mime_type,
            "data": image_bytes
        }

        response = await model.generate_content_async([prompt, image_part])
        parsed = clean_json_response(response.text)
        parsed["is_demo"] = False
        return CrackAnalysisResult(**parsed)

    except Exception as e:
        logger.error(f"Gemini Crack Analysis failed: {e}. Falling back to domain demo data.")
        demo = get_demo_crack_analysis(context_notes)
        demo.summary += f" [Note: Live API attempt encountered: {str(e)[:80]}...]"
        return demo


async def generate_chat_reply(message: str, history: list, project_context: Optional[str] = None) -> ChatResponse:
    """
    AI construction site assistant chat.
    """
    if not settings.is_gemini_configured:
        # Domain rule-based assistant reply
        lowered = message.lower()
        if "concrete" in lowered or "curing" in lowered:
            reply = (
                "For standard Portland cement concrete (ASTM C150 / ACI 308R):\n\n"
                "1. **Minimum Curing Duration**: Maintain moisture for at least 7 days for ordinary concrete, or until 70% of design compressive strength is attained (typically 3 to 7 days for Type III high early strength cement).\n"
                "2. **Formwork Removal**: Suspended slab soffit forms should remain until concrete reaches 75% f'c (often 14–21 days) unless reshoring calculations are signed off by the engineer of record.\n"
                "3. **Thermal Protection**: Maintain concrete temperature above 10°C (50°F) during initial 72 hours in cold weather."
            )
            suggestions = ["What are slump test tolerances?", "How does fly ash affect cure time?", "Cold weather curing blankets"]
            category = "Materials & Concreting"
        elif "trench" in lowered or "osha" in lowered or "fall" in lowered or "safety" in lowered:
            reply = (
                "Key OSHA Construction Safety Standards:\n\n"
                "• **Excavation & Trenching (29 CFR 1926.652)**: Any trench 5 feet (1.5m) or deeper requires a protective system (sloping, shoring, or trench boxes). A competent person must inspect daily before worker entry.\n"
                "• **Fall Protection (29 CFR 1926.501)**: Guardrails, safety nets, or personal fall arrest systems (PFAS) are mandatory at heights of 6 feet or more above lower levels.\n"
                "• **Egress**: Trenches 4 feet or deeper must have ladders or ramps located so as to require no more than 25 feet of lateral travel."
            )
            suggestions = ["Explain soil Type A, B, and C classification", "What is required in a daily trench log?", "Ladder safety inspection checklist"]
            category = "OSHA Safety Compliance"
        elif "schedule" in lowered or "milestone" in lowered or "cost" in lowered or "budget" in lowered:
            reply = (
                "Construction Project Sequencing & Cost Control Best Practices:\n\n"
                "1. **Critical Path Method (CPM)**: Keep focus on zero-float activities (Permits → Foundation → Superstructure Framing → Building Dry-In → MEP Rough-In → Inspections).\n"
                "2. **Subcontractor Coordination**: Implement 3-week rolling lookahead schedules and daily 15-minute morning standups.\n"
                "3. **Contingency Management**: Maintain 8%–10% contingency allocation for unforeseen subsurface conditions and change orders."
            )
            suggestions = ["How to calculate schedule float?", "Sample MEP rough-in checklist", "Managing subcontractor delay claims"]
            category = "Project Management"
        else:
            reply = (
                f"Regarding your query on '{message}':\n\n"
                "In construction project execution, always coordinate work between trade leads, cross-reference contract specifications (CSI MasterFormat), and verify approvals against current stamped submittals.\n\n"
                "Next immediate steps:\n"
                "1. Verify manufacturer technical data sheets (TDS) and safety data sheets (SDS).\n"
                "2. Confirm local municipal code requirements (IBC/IRC 2024).\n"
                "3. Document field conditions with time-stamped photographs before work is covered up."
            )
            suggestions = ["How to prepare for pre-pour inspection?", "Standard tolerances for structural steel", "Waterproofing detail standards"]
            category = "General Construction Intelligence"

        return ChatResponse(
            reply=reply,
            suggestions=suggestions,
            topic_category=category,
            disclaimer="[DEMO MODE] Professional decision support only. Add GEMINI_API_KEY to .env to enable dynamic conversation with Gemini 2.5 Flash.",
            is_demo=True
        )

    try:
        genai.configure(api_key=settings.gemini_api_key)
        model = genai.GenerativeModel(
            model_name=settings.gemini_model,
            system_instruction=SITE_ASSISTANT_SYSTEM_PROMPT
        )

        chat_context = ""
        if project_context:
            chat_context += f"[Current Project Context: {project_context}]\n\n"

        prompt_full = f"{chat_context}User Query: {message}"
        response = await model.generate_content_async(prompt_full)

        return ChatResponse(
            reply=response.text,
            suggestions=[
                "Ask for relevant OSHA or ACI standards",
                "Request step-by-step checklist",
                "Ask how weather affects this operation"
            ],
            topic_category="AI Site Intelligence",
            disclaimer="For professional decision support only. Always verify local building codes and engineering specifications.",
            is_demo=False
        )
    except Exception as e:
        logger.error(f"Gemini Chat error: {e}")
        return ChatResponse(
            reply=f"AI assistant encountered an issue contacting Gemini API: {e}. Please check your GEMINI_API_KEY.",
            suggestions=["Retry query", "Switch to standard checklist"],
            topic_category="System Notification",
            disclaimer="Error contacting model.",
            is_demo=True
        )

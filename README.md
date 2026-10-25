# AI-Powered Multimodal Construction Intelligence Platform

[![Python](https://img.shields.io/badge/Python-3.11-blue.svg)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.110+-009688.svg)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/React-18-61DAFB.svg)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-5+-646CFF.svg)](https://vitejs.dev/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-v4-38B2AC.svg)](https://tailwindcss.com/)
[![Gemini AI](https://img.shields.io/badge/Google_Gemini-Multimodal_Vision-4285F4.svg)](https://aistudio.google.com/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

An intelligent, full-stack decision-support system designed to assist construction professionals, site superintendents, civil engineers, and real estate developers across multiple stages of construction planning, execution, and monitoring.

The platform leverages **multimodal artificial intelligence** (Google Gemini 2.5 Flash / 1.5 Flash), enabling it to analyze textual inputs, construction photographs, and structured project data to generate accurate, actionable, and context-aware insights. Strict JSON-based data contracts validated via Pydantic ensure frontend stability and reliable AI integration.

---

## 🏛️ System Architecture

```
                    ┌────────────────────────────────────────────────────────┐
                    │     Multimodal Construction Intelligence Platform      │
                    └───────────────────────────┬────────────────────────────┘
                                                │
                 ┌──────────────────────────────┴──────────────────────────────┐
                 │                                                             │
                 ▼                                                             ▼
       ┌──────────────────────┐                                     ┌──────────────────────┐
       │   React.js Frontend  │                                     │   FastAPI Backend    │
       │  (Vite + Tailwind)   │                                     │  (Python 3.11 / REST)│
       └──────────┬───────────┘                                     └──────────┬───────────┘
                  │                                                            │
                  │ Sends User Inputs (Images, Text, Queries)                  │ Stores / Retrieves
                  ▼                                                            ▼
       ┌────────────────────────────────────────────────────────┐   ┌──────────────────────┐
       │               FastAPI API Application Logic            │───│ Data Storage (MongoDB│
       └──────────────────────────┬─────────────────────────────┘   │  Atlas / In-Memory)  │
                                  │                                 └──────────────────────┘
                                  ▼
       ┌────────────────────────────────────────────────────────┐
       │     Multimodal AI Engine (Google Gemini Vision & LLM)  │
       └──────────────────────────┬─────────────────────────────┘
                                  │
      ┌───────────────────────────┼───────────────────────────┬───────────────────────────┐
      │                           │                           │                           │
      ▼                           ▼                           ▼                           ▼
┌──────────────┐            ┌──────────────┐            ┌──────────────┐            ┌──────────────┐
│  Site Safety │            │  Structural  │            │ Real Estate  │            │ Construction │
│  Monitoring  │            │Crack Analysis│            │  Valuation   │            │   Planning   │
└──────────────┘            └──────────────┘            └──────────────┘            └──────────────┘
```

---

## 🚀 Key Modules & Capabilities

### 1. Construction Site Safety Monitoring (`POST /api/safety/analyze`)
- **Visual Hazard Triage**: Upload job-site photos to analyze visible hazards, worker PPE compliance (hard hats, eye protection, high-visibility apparel), and perimeter fall protection gaps.
- **OSHA Standards Cross-Referencing**: Findings linked directly to relevant OSHA construction standards (e.g., 29 CFR 1926.501 fall protection, 1926.100 head protection, 1926.25 housekeeping).
- **Safety Score Index**: Computes a 0–100 compliance rating alongside positive practices observed and prioritized mitigation actions.
- **Safety Disclaimer**: Prominently notes that results serve as preliminary decision-support and do not replace certified safety officer inspections.

### 2. Structural Crack Detection and Analysis (`POST /api/cracks/analyze`)
- **Forensic Pattern Recognition**: Classifies crack geometries (vertical, horizontal, diagonal shear, stepped, craze/map alligator cracking).
- **Surface Diagnostics**: Evaluates cast-in-place concrete, CMU masonry, stucco, and drywall.
- **Engineering Limitations Callout**: Explicitly documents unobservable factors (internal rebar corrosion, subsurface voiding, dynamic movement) that cannot be determined from a single photograph.
- **Structural Engineer Alerts**: Automatically warns when visual morphology requires immediate on-site inspection by a licensed Professional Engineer (PE).

### 3. Real Estate Property Valuation (`POST /api/valuation/estimate`)
- **Automated Valuation Model (AVM)**: Configured regional cost-per-sqft benchmarks (Tier 1 Metros to regional markets).
- **Multi-Factor Adjustments**: Factors in property classification multipliers, construction quality tiers (Builder Grade, Standard, Premium, Luxury), physical age depreciation curves, and amenity valuations.
- **Transparent Cost Breakdown**: Provides an indicative valuation range (±7.5%), price per square foot, and documented algorithm assumptions.

### 4. Construction Project Planning (`POST /api/projects/plan`)
- **Phased CPM Scheduling**: Generates a 6-phase project schedule (Pre-Construction, Substructure & Foundation, Structural Superstructure, MEP Rough-In, Interior Finishes, Handover & Commissioning).
- **Trade & Task Dependencies**: Assigns specialized trade contractors, durations in days, and tangible deliverables.
- **Budget Allocation Donut**: Visual cost distribution across materials (36%), labor (38%), heavy equipment (10%), permits & engineering (7%), and contingency reserves (9%).
- **Risk Mitigation Matrix**: Identifies weather, procurement, and geotechnical risks with proactive mitigation plans.

### 5. Daily Site & Engineering Assistant (`POST /api/chat`)
- **Technical Guidance**: Conversational AI for concrete curing timelines (ACI 308R / ACI 306R), excavation trench protection (OSHA 1926.650), and material standards.
- **Context Awareness**: Accepts active site context, current temperatures, and structural phases to tailor engineering guidance.

### 6. Weather-Aware Safety Advisory (`GET /api/weather`)
- **Live Meteorological Telemetry**: Queries Open-Meteo API in real-time (100% real live weather, requires no API key).
- **Construction Operating Envelopes**:
  - Crane & Rigging wind speed and gust safety limits (> 20 knots / 38 km/h).
  - Concrete placement temperature boundaries (ACI 305R Hot Weather & ACI 306R Cold Weather).
  - Roofing and exterior waterproofing rain/humidity thresholds.
  - Excavation and trench wall soil saturation risk.
- **5-Day Outlook**: Daily temperature, rain volume, and wind maximums.

### 7. Reports, History & Persistence (`/api/reports`)
- **Unified Audit Registry**: Search and filter past inspections and valuations by type and keyword.
- **Export Formats**: One-click export to formatted JSON, CSV, and printable/PDF reports.
- **Dual Storage Engine**: MongoDB Atlas persistence when configured, with seamless, transparent in-memory session fallback.

---

## 🛠️ Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 18, Vite, Tailwind CSS v4, Lucide React Icons, Recharts Analytics |
| **Backend** | Python 3.11, FastAPI, Pydantic v2, Uvicorn, Python-Multipart |
| **Multimodal AI** | Google Gemini 2.5 Flash / 1.5 Flash (via `google-generativeai`) |
| **Meteorology** | Open-Meteo Global Forecasting & Geocoding API |
| **Data Storage** | MongoDB Atlas (`motor`, `pymongo`) with In-Memory fallback |
| **Deployment** | Vercel Serverless (Python runtime + Vite static build) |

---

## 📦 Directory Structure

```
skillwallet/
├── api/
│   ├── __init__.py
│   ├── index.py              # Main FastAPI app & Vercel serverless entrypoint
│   ├── config.py             # Environment settings & connection checks
│   ├── schemas.py            # Strict Pydantic JSON data contracts
│   ├── prompts.py            # Multimodal AI system prompts
│   ├── gemini_service.py     # Gemini multimodal vision & simulated fallbacks
│   ├── weather_service.py    # Open-Meteo live weather & trade advisories
│   ├── valuation_service.py  # Transparent property valuation algorithms
│   ├── planning_service.py   # Phased CPM project scheduling engine
│   ├── storage.py            # MongoDB Atlas & In-Memory storage manager
│   └── routes/
│       ├── health.py         # GET /api/health
│       ├── dashboard.py      # GET /api/dashboard
│       ├── safety.py         # POST /api/safety/analyze
│       ├── cracks.py         # POST /api/cracks/analyze
│       ├── valuation.py      # POST /api/valuation/estimate
│       ├── projects.py       # POST /api/projects/plan & GET /api/projects
│       ├── assistant.py      # POST /api/chat
│       ├── weather.py        # GET /api/weather
│       └── reports.py        # GET & DELETE /api/reports
├── frontend/
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js        # Vite config with /api proxy to FastAPI
│   ├── postcss.config.js     # PostCSS with @tailwindcss/postcss
│   └── src/
│       ├── main.jsx
│       ├── App.jsx           # Master SPA application router
│       ├── index.css         # Tailwind v4 styles & print CSS
│       ├── api/client.js     # Centralized API client (relative /api)
│       ├── components/       # Layout, Navbar, Sidebar, StatCard, ImageUploader, Modal, ExportButton
│       ├── pages/            # Dashboard, Safety, Cracks, Valuation, Planning, Assistant, Weather, Reports, Settings
│       └── utils/            # Formatters and CSV/JSON/Print export helpers
├── tests/
│   ├── test_api.py           # Automated test suite (12 test cases)
│   └── __init__.py
├── requirements.txt          # Python dependencies
├── vercel.json               # Vercel deployment routing & build config
├── package.json              # Monorepo workspace scripts
├── .env.example              # Documented environment template
└── .gitignore                # Excludes venv, node_modules, dist, and secrets
```

---

## ⚡ Local Setup & Development

### Prerequisites
- **Node.js** v18+ (tested on Node v24)
- **Python** 3.11+
- **Git**

### 1. Clone & Configure Environment
```bash
git clone https://github.com/adarshmalviya79-stack/skillwallet.git
cd skillwallet

# Copy environment template
cp .env.example .env     # On Windows: copy .env.example .env
```

Edit `.env` to optionally set:
```ini
GEMINI_API_KEY=your_gemini_api_key_here
MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/
```
*(If left empty, the application runs in interactive Demo/Simulated mode with clear UI status badges).*

### 2. Backend Setup
```bash
# Create and activate virtual environment
python -m venv .venv
source .venv/bin/activate       # On Windows: .venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Run automated tests
pytest -v

# Start FastAPI development server
uvicorn api.index:app --reload --port 8000
```
- FastAPI API Base: `http://localhost:8000`
- Interactive Swagger UI: `http://localhost:8000/docs`
- Redoc Documentation: `http://localhost:8000/redoc`

### 3. Frontend Setup
In a second terminal:
```bash
cd frontend
npm install
npm run dev
```
- Frontend application runs at: `http://localhost:5173`
- Vite automatically proxies `/api` calls to `http://localhost:8000`.

---

## 🧪 Running Automated Tests

A comprehensive automated test suite validates all API routes, multipart image uploads, format rejections, valuation math, and date sequencing:

```bash
# Activate virtual environment
.venv\Scripts\activate

# Run pytest
pytest -v
```

**Test Results:**
- `test_health_endpoint`: Verified service status and metadata.
- `test_dashboard_endpoint`: Verified real KPI metric generation.
- `test_safety_analyze_valid`: Verified multipart image intake, hazard detection, and OSHA references.
- `test_safety_analyze_invalid_mime`: Verified rejection of non-image uploads (HTTP 400).
- `test_cracks_analyze_valid`: Verified concrete surface analysis and engineering triage.
- `test_valuation_estimate_valid`: Verified formula-driven indicative valuation and range calculation.
- `test_valuation_negative_area_validation`: Verified input bounds validation (HTTP 422).
- `test_projects_plan_valid`: Verified CPM schedule phases, milestones, and budget allocations.
- `test_projects_invalid_dates`: Verified date ordering validation (HTTP 422).
- `test_chat_assistant`: Verified domain engineering chat replies and prompt suggestions.
- `test_weather_advisory`: Verified live Open-Meteo telemetry and trade safety thresholds.
- `test_reports_crud`: Verified list, retrieve, and delete report operations.

---

## 🌐 Vercel Deployment Guide

The repository includes a ready-to-deploy `vercel.json`:

```json
{
  "$schema": "https://openapi.vercel.sh/vercel.json",
  "buildCommand": "cd frontend && npm install && npm run build",
  "outputDirectory": "frontend/dist",
  "rewrites": [
    {
      "source": "/api/(.*)",
      "destination": "/api/index.py"
    }
  ]
}
```

### Steps to Deploy to Vercel:
1. Push this repository to GitHub:
   ```bash
   git add .
   git commit -m "feat: complete Multimodal Construction Intelligence Platform"
   git push origin main
   ```
2. Navigate to [vercel.com](https://vercel.com) and log in.
3. Click **Add New...** → **Project**.
4. Import your GitHub repository: `adarshmalviya79-stack/skillwallet`.
5. Under **Environment Variables**, optionally add:
   - `GEMINI_API_KEY`: Your Google AI Studio API key.
   - `MONGODB_URI`: Your MongoDB Atlas connection string.
6. Click **Deploy**. Vercel will bundle the Vite frontend into `frontend/dist` and mount `api/index.py` as an ASGI Python Serverless Function.

---

## 🔒 Security & Safe File Handling
- Secret API keys are never embedded or exposed in frontend client code.
- Uploaded photographs are processed in memory and never permanently stored on local disk without user authorization.
- Maximum file sizes (10 MB) and MIME types (JPEG, PNG, WEBP) are strictly enforced.
- Exception handlers suppress internal tracebacks in production API responses.

---

## 📄 License
This project is licensed under the MIT License.

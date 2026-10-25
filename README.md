# AI-Powered Multimodal Construction Intelligence Platform

Full-stack decision-support system for construction professionals: a **React (Vite)** frontend and a **FastAPI** backend powered by a multimodal LLM (Claude). All AI responses are validated against strict Pydantic JSON contracts, and every endpoint returns the same envelope:

```json
{ "success": true, "data": { ... }, "error": null }
```

## Features

| Feature | Endpoint | Input |
|---|---|---|
| Site safety monitoring | `POST /api/safety/analyze` | image (+ context) |
| Crack detection & analysis | `POST /api/cracks/analyze` | image (+ context) |
| Real estate valuation | `POST /api/valuation/estimate` | JSON (formula baseline + AI refinement) |
| Project planning | `POST /api/planning/generate` | JSON |
| Daily site assistant | `POST /api/assistant/daily` | JSON |
| Weather-aware advisory | `POST /api/weather/advisory` | JSON (live data from Open-Meteo, no key) |
| Construction knowledge assistant | `POST /api/knowledge/ask` | JSON (with chat history) |
| Health | `GET /api/health` | – |

Interactive API docs: http://localhost:8000/docs

## Quick start

Requirements: Python 3.8+ (3.11 recommended), Node.js 18+, Git.

### 1. Backend
```bash
cd backend
python -m venv .venv
source .venv/bin/activate          # Windows: .venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env               # Windows: copy .env.example .env
# edit .env and set ANTHROPIC_API_KEY
uvicorn app.main:app --reload --port 8000
```
Without an API key the backend runs in **demo mode** (clearly labelled "DEMO" sample data) so the UI can be explored offline.

### 2. Frontend
```bash
cd frontend
npm install
npm run dev                         # http://localhost:5173
```
Vite proxies `/api` to `localhost:8000`. For production set `VITE_API_URL` (see `frontend/.env.example`) and run `npm run build`.

### 3. Tests (backend)
```bash
cd backend && pytest -q
```

## Project structure
```
backend/
  app/
    main.py       FastAPI app, CORS, uniform error envelope
    routes.py     all endpoints, image validation (type + size)
    schemas.py    strict JSON data contracts (Pydantic)
    prompts.py    system prompts that enforce JSON output
    llm.py        Claude multimodal client, JSON extraction, validate-and-retry
    services.py   valuation baseline formula, Open-Meteo weather
    demo.py       offline demo payloads
    config.py     environment configuration
  tests/test_api.py
  Dockerfile
frontend/
  src/ App.jsx, api.js, components.jsx, pages/*, styles.css
```

## Deploying on AWS (outline)
- **Backend:** build `backend/Dockerfile`, push to ECR, run on App Runner / ECS Fargate; store `ANTHROPIC_API_KEY` in Secrets Manager; set `CORS_ORIGINS` to your frontend URL.
- **Frontend:** `npm run build` with `VITE_API_URL` set, upload `dist/` to S3 and serve through CloudFront.

## Design notes & limitations
- Valuation uses a rough city-rate table plus AI refinement - it is **indicative, not a certified valuation**.
- Safety and crack results are decision support, **not a substitute for a qualified engineer or safety officer**.
- No authentication or persistence is included; add auth (e.g. Cognito/JWT) and a database before real deployment.
- Uploaded images are processed in memory and not stored.

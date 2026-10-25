import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError

from api.config import settings
from api.storage import storage
from api.routes import (
    health,
    dashboard,
    safety,
    cracks,
    valuation,
    projects,
    assistant,
    weather,
    reports
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger("construction_platform")

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: attempt to connect to MongoDB if configured
    logger.info("Initializing Construction Intelligence API services...")
    await storage.initialize()
    yield
    # Shutdown
    if storage.client:
        storage.client.close()
        logger.info("MongoDB connection closed.")

app = FastAPI(
    title=settings.app_name,
    version=settings.version,
    description="Full-stack AI-Powered Multimodal Construction Intelligence Platform API",
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json"
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global Request Validation Error Handler
@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    errors = []
    for err in exc.errors():
        field = " -> ".join(str(loc) for loc in err.get("loc", []))
        errors.append(f"{field}: {err.get('msg')}")
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={
            "success": False,
            "data": None,
            "error": "Validation Error: " + "; ".join(errors),
            "meta": {"details": exc.errors()}
        }
    )

# Global Unexpected Exception Handler
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Unhandled error processing {request.method} {request.url.path}: {exc}", exc_info=True)
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "success": False,
            "data": None,
            "error": "An unexpected internal server error occurred while processing your request.",
            "meta": {"type": type(exc).__name__}
        }
    )

# Mount all endpoint routers under /api
app.include_router(health.router, prefix="/api", tags=["Health"])
app.include_router(dashboard.router, prefix="/api", tags=["Dashboard"])
app.include_router(safety.router, prefix="/api", tags=["Safety Monitoring"])
app.include_router(cracks.router, prefix="/api", tags=["Crack Analysis"])
app.include_router(valuation.router, prefix="/api", tags=["Property Valuation"])
app.include_router(projects.router, prefix="/api", tags=["Project Planning"])
app.include_router(assistant.router, prefix="/api", tags=["Site Assistant"])
app.include_router(weather.router, prefix="/api", tags=["Weather Advisory"])
app.include_router(reports.router, prefix="/api", tags=["Reports & History"])

@app.get("/")
async def root():
    return {
        "platform": settings.app_name,
        "status": "online",
        "docs": "/docs",
        "api_base": "/api"
    }

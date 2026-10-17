import os
import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import get_settings
from app.database import init_db
from app.middleware.error_handler import SafeErrorMiddleware
from app.routers import auth, conversations, messages, chat, models, uploads, health, admin

# Configure structured logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)
logger = logging.getLogger("vickyai")
settings = get_settings()


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Initializing VickyAI backend services...")
    # Ensure upload directory exists
    os.makedirs(settings.resolved_upload_dir, exist_ok=True)
    # Ensure DB tables exist
    try:
        await init_db()
        logger.info("Database initialized successfully.")
    except Exception as e:
        logger.warning(f"Database initialization warning (Alembic or DB starting up): {e}")
    yield
    logger.info("VickyAI backend shut down cleanly.")


app = FastAPI(
    title="VickyAI API",
    description="Backend API for VickyAI - Local ChatGPT-style AI companion with avatar character system",
    version="1.0.0",
    lifespan=lifespan,
)

# Safe error middleware
app.add_middleware(SafeErrorMiddleware)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API routers under /api prefix
app.include_router(auth.router, prefix="/api")
app.include_router(conversations.router, prefix="/api")
app.include_router(messages.router, prefix="/api")
app.include_router(chat.router, prefix="/api")
app.include_router(models.router, prefix="/api")
app.include_router(uploads.router, prefix="/api")
app.include_router(health.router, prefix="/api")
app.include_router(admin.router, prefix="/api")


@app.get("/")
async def root():
    return {
        "service": "VickyAI",
        "mascot": "Vicky the Yellow Labrador 🐾",
        "version": "1.0.0",
        "docs_url": "/docs",
    }

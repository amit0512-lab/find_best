from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from app.config import settings
from app.database.session import close_db_connection
from app.routes import auth, products, favorites

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup (e.g., verifying connection could go here)
    yield
    # Shutdown
    await close_db_connection()

app = FastAPI(
    title="PickAI API",
    description="Backend API for PickAI - Smart Product Recommendation System",
    version="1.0.0",
    lifespan=lifespan
)

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router)
app.include_router(products.router)
app.include_router(favorites.router)

@app.get("/")
async def root():
    return {
        "message": "Welcome to PickAI API",
        "version": "1.0.0",
        "docs": "/docs",
        "redoc": "/redoc"
    }

@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "PickAI API"}

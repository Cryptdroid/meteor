from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import sys
import os

# Add the backend directory to the Python path
sys.path.append(os.path.join(os.path.dirname(__file__), '..', 'backend'))

try:
    from backend.routers import simulation, asteroids, deflection
except ImportError:
    # Fallback imports if routers are not available
    simulation = asteroids = deflection = None

app = FastAPI(
    title="Asteroid Impact Simulator API",
    description="Backend API for asteroid impact simulation and planetary defense",
    version="1.0.0",
    docs_url="/api/docs",
    openapi_url="/api/openapi.json"
)

# CORS middleware for Vercel
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:3001",
        "https://*.vercel.app",
        "https://asteroid-defense-grid.vercel.app",
        "https://asteroid-defense-grid-*.vercel.app",
        "https://silizi-956920432803.asia-south1.run.app"
    ],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)

# Include routers if available
if simulation:
    app.include_router(simulation.router, prefix="/api/simulation", tags=["simulation"])
if asteroids:
    app.include_router(asteroids.router, prefix="/api/asteroids", tags=["asteroids"])
if deflection:
    app.include_router(deflection.router, prefix="/api/deflection", tags=["deflection"])

@app.get("/")
@app.get("/api")
async def root():
    return {
        "message": "Asteroid Impact Simulator API",
        "version": "1.0.0",
        "docs": "/api/docs",
        "status": "running on Vercel"
    }

@app.get("/api/health")
async def health_check():
    return {"status": "healthy", "platform": "vercel"}

# Vercel serverless function handler
def handler(request):
    return app(request)
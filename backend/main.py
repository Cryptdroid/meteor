from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import simulation, asteroids, deflection
import uvicorn
import os

app = FastAPI(
    title="Asteroid Impact Simulator API",
    description="Backend API for asteroid impact simulation and planetary defense",
    version="1.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:3001"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(simulation.router, prefix="/api/simulation", tags=["simulation"])
app.include_router(asteroids.router, prefix="/api/asteroids", tags=["asteroids"])
app.include_router(deflection.router, prefix="/api/deflection", tags=["deflection"])

@app.get("/")
async def root():
    return {
        "message": "Asteroid Impact Simulator API",
        "version": "1.0.0",
        "docs": "/docs"
    }

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

if __name__ == "__main__":
    port = int(os.getenv("PORT", 8000))
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=True)

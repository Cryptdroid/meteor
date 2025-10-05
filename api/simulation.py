from fastapi import FastAPI, HTTPException
from fastapi.responses import JSONResponse
from pydantic import BaseModel
import sys
import os
import math

# Add backend to path
sys.path.append(os.path.join(os.path.dirname(__file__), '..', 'backend'))

app = FastAPI()

class SimulationRequest(BaseModel):
    diameter: float  # in meters
    velocity: float  # in km/s
    angle: float  # in degrees
    density: float = 2600  # kg/m³ (typical for rocky asteroids)
    target_location: dict = {"lat": 40.7128, "lng": -74.0060}  # NYC default

@app.post("/impact")
async def simulate_impact(request: SimulationRequest):
    """Simulate asteroid impact with given parameters"""
    try:
        # Basic impact calculations
        mass = (4/3) * math.pi * (request.diameter/2)**3 * request.density
        velocity_ms = request.velocity * 1000  # Convert km/s to m/s
        kinetic_energy = 0.5 * mass * velocity_ms**2
        
        # TNT equivalent (1 ton TNT = 4.184 × 10^9 J)
        tnt_equivalent = kinetic_energy / (4.184e9)
        
        # Crater diameter estimation (simplified)
        # Crater diameter ≈ 1.8 * (energy^0.25) for energy in megatons
        energy_megatons = tnt_equivalent / 1e6
        crater_diameter = 1.8 * (energy_megatons ** 0.25) * 1000  # in meters
        
        # Damage radius estimation
        damage_radius_km = math.sqrt(energy_megatons) * 5  # Rough approximation
        
        # Population impact (simplified)
        population_affected = int(damage_radius_km**2 * math.pi * 1000)  # Very rough estimate
        
        return JSONResponse({
            "input": {
                "diameter": request.diameter,
                "velocity": request.velocity,
                "angle": request.angle,
                "density": request.density,
                "target": request.target_location
            },
            "results": {
                "mass_kg": mass,
                "kinetic_energy_joules": kinetic_energy,
                "tnt_equivalent_tons": tnt_equivalent,
                "energy_megatons": energy_megatons,
                "crater_diameter_m": crater_diameter,
                "damage_radius_km": damage_radius_km,
                "estimated_casualties": population_affected,
                "impact_classification": classify_impact(energy_megatons)
            },
            "warnings": [
                "This is a simplified simulation for educational purposes",
                "Real impact effects depend on many additional factors",
                "Consult scientific literature for accurate assessments"
            ]
        })
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

def classify_impact(energy_megatons):
    """Classify impact severity based on energy"""
    if energy_megatons < 1:
        return "Local damage"
    elif energy_megatons < 100:
        return "Regional damage"
    elif energy_megatons < 10000:
        return "Continental damage"
    elif energy_megatons < 100000000:
        return "Global climate effects"
    else:
        return "Mass extinction event"

@app.get("/presets")
async def get_simulation_presets():
    """Get predefined simulation scenarios"""
    return JSONResponse({
        "presets": [
            {
                "name": "Chelyabinsk (2013)",
                "diameter": 20,
                "velocity": 19.16,
                "angle": 18,
                "description": "Similar to the 2013 Russian fireball"
            },
            {
                "name": "Tunguska (1908)",
                "diameter": 50,
                "velocity": 15,
                "angle": 45,
                "description": "Similar to the 1908 Siberian event"
            },
            {
                "name": "City Killer",
                "diameter": 100,
                "velocity": 20,
                "angle": 45,
                "description": "Hypothetical urban impact scenario"
            },
            {
                "name": "Regional Devastator",
                "diameter": 500,
                "velocity": 25,
                "angle": 45,
                "description": "Major regional impact"
            },
            {
                "name": "Chicxulub-class",
                "diameter": 10000,
                "velocity": 20,
                "angle": 60,
                "description": "Similar to the dinosaur extinction event"
            }
        ]
    })

# Vercel handler
def handler(request):
    return app(request)
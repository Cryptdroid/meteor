from fastapi import FastAPI, HTTPException
from fastapi.responses import JSONResponse
import sys
import os
import requests
from datetime import datetime, timedelta

# Add backend to path
sys.path.append(os.path.join(os.path.dirname(__file__), '..', 'backend'))

app = FastAPI()

NASA_API_BASE = "https://api.nasa.gov/neo/rest/v1"
NASA_API_KEY = os.getenv("NASA_API_KEY", "DEMO_KEY")

@app.get("/")
async def get_asteroids():
    """Get Near-Earth Objects from NASA API"""
    try:
        # Get asteroids for the next 7 days
        start_date = datetime.now().strftime("%Y-%m-%d")
        end_date = (datetime.now() + timedelta(days=7)).strftime("%Y-%m-%d")
        
        url = f"{NASA_API_BASE}/feed"
        params = {
            "start_date": start_date,
            "end_date": end_date,
            "api_key": NASA_API_KEY
        }
        
        response = requests.get(url, params=params, timeout=30)
        
        if response.status_code == 200:
            data = response.json()
            
            # Process and flatten the asteroid data
            asteroids = []
            for date_key, date_asteroids in data.get("near_earth_objects", {}).items():
                asteroids.extend(date_asteroids)
            
            # Sort by size (largest first)
            asteroids.sort(
                key=lambda x: x.get("estimated_diameter", {}).get("kilometers", {}).get("estimated_diameter_max", 0),
                reverse=True
            )
            
            return JSONResponse({
                "count": len(asteroids),
                "asteroids": asteroids[:50],  # Limit to 50 for performance
                "source": "NASA NeoWs API",
                "generated_at": datetime.now().isoformat()
            })
        else:
            raise HTTPException(status_code=response.status_code, detail="NASA API error")
            
    except requests.RequestException as e:
        raise HTTPException(status_code=503, detail=f"Service unavailable: {str(e)}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

@app.get("/potentially-hazardous")
async def get_hazardous_asteroids():
    """Get only potentially hazardous asteroids"""
    try:
        url = f"{NASA_API_BASE}/neo/browse"
        params = {
            "api_key": NASA_API_KEY,
            "is_potentially_hazardous_asteroid": True,
            "size": 20
        }
        
        response = requests.get(url, params=params, timeout=30)
        
        if response.status_code == 200:
            data = response.json()
            return JSONResponse({
                "count": len(data.get("near_earth_objects", [])),
                "asteroids": data.get("near_earth_objects", []),
                "source": "NASA NeoWs API - PHAs only"
            })
        else:
            raise HTTPException(status_code=response.status_code, detail="NASA API error")
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Vercel handler
def handler(request):
    return app(request)
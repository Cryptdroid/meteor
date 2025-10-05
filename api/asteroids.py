from http.server import BaseHTTPRequestHandler
import json
import os
import requests
from datetime import datetime, timedelta
from urllib.parse import urlparse, parse_qs

NASA_API_BASE = "https://api.nasa.gov/neo/rest/v1"
NASA_API_KEY = os.getenv("NASA_API_KEY", os.getenv("NEXT_PUBLIC_NASA_API_KEY", "DEMO_KEY"))

class handler(BaseHTTPRequestHandler):
    def do_GET(self):
        try:
            # Parse the path to determine which endpoint
            parsed_path = urlparse(self.path)
            path = parsed_path.path
            
            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            
            if "potentially-hazardous" in path:
                response = self.get_hazardous_asteroids()
            else:
                response = self.get_asteroids()
            
            self.wfile.write(json.dumps(response).encode())
            
        except Exception as e:
            self.send_response(500)
            self.send_header('Content-type', 'application/json')
            self.end_headers()
            error_response = {"error": str(e), "status": "error"}
            self.wfile.write(json.dumps(error_response).encode())
    
    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()
    
    def get_asteroids(self):
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
            
            # Debug info
            debug_info = {
                "url": url,
                "api_key_set": bool(NASA_API_KEY and NASA_API_KEY != "DEMO_KEY"),
                "params": {k: v if k != "api_key" else "***" for k, v in params.items()}
            }
            
            response = requests.get(url, params=params, timeout=10)
            
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
                
                return {
                    "count": len(asteroids),
                    "asteroids": asteroids[:50],  # Limit to 50 for performance
                    "source": "NASA NeoWs API",
                    "debug": debug_info,
                    "generated_at": datetime.now().isoformat()
                }
            else:
                return {
                    "error": f"NASA API error: {response.status_code}",
                    "debug": debug_info,
                    "response_text": response.text[:500]
                }
        except Exception as e:
            # Fallback with sample data
            return {
                "count": 3,
                "asteroids": [
                    {
                        "id": "sample_1",
                        "name": "Sample Asteroid 1",
                        "estimated_diameter": {
                            "kilometers": {
                                "estimated_diameter_min": 0.1,
                                "estimated_diameter_max": 0.2
                            }
                        },
                        "is_potentially_hazardous_asteroid": False,
                        "close_approach_data": [
                            {
                                "relative_velocity": {"kilometers_per_second": "15.5"},
                                "miss_distance": {"kilometers": "7500000"}
                            }
                        ]
                    }
                ],
                "source": "Fallback data (NASA API unavailable)",
                "error": f"NASA API Error: {str(e)}",
                "debug": {
                    "api_key_set": bool(NASA_API_KEY and NASA_API_KEY != "DEMO_KEY"),
                    "nasa_api_base": NASA_API_BASE
                },
                "generated_at": datetime.now().isoformat()
            }
    
    def get_hazardous_asteroids(self):
        """Get only potentially hazardous asteroids"""
        url = f"{NASA_API_BASE}/neo/browse"
        params = {
            "api_key": NASA_API_KEY,
            "is_potentially_hazardous_asteroid": True,
            "size": 20
        }
        
        response = requests.get(url, params=params, timeout=30)
        
        if response.status_code == 200:
            data = response.json()
            return {
                "count": len(data.get("near_earth_objects", [])),
                "asteroids": data.get("near_earth_objects", []),
                "source": "NASA NeoWs API - PHAs only"
            }
        else:
            raise Exception(f"NASA API error: {response.status_code}")
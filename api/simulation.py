from http.server import BaseHTTPRequestHandler
import json
import math
from urllib.parse import urlparse, parse_qs

class handler(BaseHTTPRequestHandler):
    def do_GET(self):
        try:
            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            
            # Check if requesting presets
            if "presets" in self.path:
                response = self.get_simulation_presets()
            else:
                response = {"message": "Use POST for impact simulation, GET /presets for scenarios"}
            
            self.wfile.write(json.dumps(response).encode())
            
        except Exception as e:
            self.send_response(500)
            self.send_header('Content-type', 'application/json')
            self.end_headers()
            error_response = {"error": str(e), "status": "error"}
            self.wfile.write(json.dumps(error_response).encode())
    
    def do_POST(self):
        try:
            # Read request body
            content_length = int(self.headers['Content-Length'])
            post_data = self.rfile.read(content_length)
            request_data = json.loads(post_data.decode('utf-8'))
            
            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            
            response = self.simulate_impact(request_data)
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
    
    def simulate_impact(self, request_data):
        """Simulate asteroid impact with given parameters"""
        # Default values
        diameter = request_data.get('diameter', 100)  # meters
        velocity = request_data.get('velocity', 20)    # km/s
        angle = request_data.get('angle', 45)          # degrees
        density = request_data.get('density', 2600)    # kg/m³
        target_location = request_data.get('target_location', {"lat": 40.7128, "lng": -74.0060})
        
        # Basic impact calculations
        mass = (4/3) * math.pi * (diameter/2)**3 * density
        velocity_ms = velocity * 1000  # Convert km/s to m/s
        kinetic_energy = 0.5 * mass * velocity_ms**2
        
        # TNT equivalent (1 ton TNT = 4.184 × 10^9 J)
        tnt_equivalent = kinetic_energy / (4.184e9)
        
        # More realistic crater diameter estimation
        energy_megatons = tnt_equivalent / 1e6
        # Using Collins et al. crater scaling law: D ≈ 1.161 * (E^0.22) for land impacts
        crater_diameter = 1.161 * (energy_megatons ** 0.22) if energy_megatons > 0 else 0
        
        # More realistic damage radius (based on overpressure zones)
        # Severe damage radius roughly scales as energy^(1/3)
        damage_radius_km = 0.28 * (energy_megatons ** (1/3)) if energy_megatons > 0 else 0
        
        # More realistic population impact (urban density ~1000 people/km²)
        population_affected = int(damage_radius_km**2 * math.pi * 1000) if damage_radius_km > 0 else 0
        
        # Calculate realistic casualties (not 100% of affected population)
        casualty_rate = 0.5  # 50% casualty rate in damage zone (consistent with backend)
        estimated_casualties = int(population_affected * casualty_rate) if population_affected > 0 else 0
        
        return {
            "input": {
                "diameter": diameter,
                "velocity": velocity,
                "angle": angle,
                "density": density,
                "target": target_location
            },
            "results": {
                "mass_kg": mass,
                "kinetic_energy_joules": kinetic_energy,
                "tnt_equivalent_tons": tnt_equivalent,
                "energy_megatons": energy_megatons,
                "crater_diameter_m": crater_diameter,
                "damage_radius_km": damage_radius_km,
                "estimated_casualties": estimated_casualties,
                "affected_population": population_affected,
                "impact_classification": self.classify_impact(energy_megatons)
            },
            "warnings": [
                "This is a simplified simulation for educational purposes",
                "Real impact effects depend on many additional factors",
                "Consult scientific literature for accurate assessments"
            ],
            "reference_comparisons": {
                "chelyabinsk_2013": "20m asteroid = ~0.5 megatons",
                "tunguska_1908": "50m asteroid = ~10-15 megatons", 
                "city_killer": "100m asteroid = ~100 megatons",
                "chicxulub_extinction": "10km asteroid = ~100 million megatons"
            }
        }
    
    def classify_impact(self, energy_megatons):
        """Classify impact severity based on energy"""
        if energy_megatons < 0.001:
            return "Minimal damage"
        elif energy_megatons < 0.1:
            return "Local damage (building destruction)"
        elif energy_megatons < 10:
            return "City-wide damage"
        elif energy_megatons < 1000:
            return "Regional devastation"
        elif energy_megatons < 100000:
            return "Continental impact"
        elif energy_megatons < 100000000:
            return "Global climate effects"
        else:
            return "Mass extinction event"
    
    def get_simulation_presets(self):
        """Get predefined simulation scenarios"""
        return {
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
        }
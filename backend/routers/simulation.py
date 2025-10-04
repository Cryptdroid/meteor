from fastapi import APIRouter, HTTPException
from models import ImpactParameters, ImpactResults, EnergyResult, CraterResult, SeismicResult, TsunamiResult, AtmosphericResult, CasualtiesResult
from simulation import ImpactSimulator

router = APIRouter()

@router.post("/simulate", response_model=ImpactResults)
async def simulate_impact(params: ImpactParameters):
    """
    Run a complete asteroid impact simulation.
    
    This endpoint calculates:
    - Impact energy
    - Crater dimensions
    - Seismic effects
    - Tsunami effects (if water impact)
    - Atmospheric effects
    - Estimated casualties
    """
    try:
        # Calculate impact energy
        energy_joules, energy_mt = ImpactSimulator.calculate_impact_energy(
            params.size,
            params.density,
            params.velocity,
            getattr(params, 'angle', 45)  # Use angle if provided, default to 45°
        )
        
        # Calculate crater size using proper physics
        crater_diameter, crater_depth = ImpactSimulator.calculate_crater_size(
            params.size,
            params.density,
            params.velocity,
            params.is_water_impact
        )
        
        # Calculate seismic effects
        seismic_magnitude, seismic_radius = ImpactSimulator.calculate_seismic_effects(
            energy_joules
        )
        
        # Calculate tsunami effects (if water impact)
        tsunami_result = None
        if params.is_water_impact:
            wave_height, tsunami_radius = ImpactSimulator.calculate_tsunami_effects(energy_mt)
            tsunami_result = TsunamiResult(
                wave_height=wave_height,
                affected_radius=tsunami_radius
            )
        
        # Calculate atmospheric effects
        fireball, thermal, overpressure = ImpactSimulator.calculate_atmospheric_effects(
            energy_mt
        )
        
        # Estimate casualties
        casualties, affected_pop = ImpactSimulator.estimate_casualties(overpressure)
        
        # Build result
        result = ImpactResults(
            energy=EnergyResult(
                joules=energy_joules,
                megatons_tnt=energy_mt
            ),
            crater=CraterResult(
                diameter=crater_diameter,
                depth=crater_depth
            ),
            seismic=SeismicResult(
                magnitude=seismic_magnitude,
                radius=seismic_radius
            ),
            tsunami=tsunami_result,
            atmospheric=AtmosphericResult(
                fireball_radius=fireball,
                thermal_radiation=thermal,
                overpressure=overpressure
            ),
            casualties=CasualtiesResult(
                estimated=casualties,
                affected_population=affected_pop
            )
        )
        
        return result
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Simulation error: {str(e)}")

@router.get("/energy-estimate")
async def estimate_energy(size: float, density: float, velocity: float, angle: float = 45):
    """
    Quick energy estimation without full simulation.
    """
    try:
        energy_joules, energy_mt = ImpactSimulator.calculate_impact_energy(
            size, density, velocity, angle
        )
        return {
            "joules": energy_joules,
            "megatons_tnt": energy_mt,
            "hiroshima_equivalent": energy_mt / 0.015  # Hiroshima was ~15 kilotons
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Calculation error: {str(e)}")

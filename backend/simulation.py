import math
from typing import Optional, Tuple

class ImpactSimulator:
    """
    Scientific impact simulation calculations based on:
    - Collins et al. (2005) crater scaling laws
    - Holsapple (1993) impact cratering equations
    - Schultz & Gault (1975) seismic effects
    """
    
    # Physical constants
    EARTH_RADIUS = 6371  # km
    GRAVITY = 9.81  # m/s²
    TNT_JOULES = 4.184e9  # joules per kiloton
    WATER_DEPTH_AVG = 3688  # meters
    
    @staticmethod
    def calculate_impact_energy(size: float, density: float, velocity: float, angle: float = 45) -> Tuple[float, float]:
        """
        Calculate impact energy using kinetic energy formula with atmospheric entry corrections.
        E = 0.5 * m * v² * sin(θ) * (1 - ablation_fraction)
        
        Args:
            size: Asteroid diameter in meters
            density: Density in kg/m³
            velocity: Velocity in km/s
            angle: Entry angle in degrees
            
        Returns:
            Tuple of (energy in joules, energy in megatons TNT)
        """
        radius = size / 2
        volume = (4 / 3) * math.pi * (radius ** 3)
        mass = volume * density
        velocity_ms = velocity * 1000  # Convert to m/s
        
        # Atmospheric ablation (smaller objects lose more mass)
        if size < 50:
            ablation_fraction = 0.9  # 90% burned up
        elif size < 100:
            ablation_fraction = 0.7  # 70% burned up
        elif size < 500:
            ablation_fraction = 0.3  # 30% burned up
        else:
            ablation_fraction = 0.1  # 10% burned up for large objects
        
        # Entry angle effect (most energy in vertical component)
        angle_rad = math.radians(angle)
        angle_factor = math.sin(angle_rad)
        
        # Effective energy after atmospheric entry
        effective_mass = mass * (1 - ablation_fraction)
        energy_joules = 0.5 * effective_mass * (velocity_ms ** 2) * angle_factor
        
        # Convert to megatons TNT (1 megaton = 4.184e15 joules)
        megatons_tnt = energy_joules / (ImpactSimulator.TNT_JOULES * 1e6)
        
        return energy_joules, megatons_tnt
    
    @staticmethod
    def calculate_crater_size(size: float, density: float, velocity: float, is_water: bool = False) -> Tuple[float, float]:
        """
        Calculate crater dimensions using proper pi-group scaling laws.
        Based on Holsapple (1993) and Collins et al. (2005).
        
        Args:
            size: Projectile diameter in meters
            density: Projectile density in kg/m³
            velocity: Impact velocity in km/s
            is_water: Whether impact is on water
            
        Returns:
            Tuple of (diameter in meters, depth in meters)
        """
        # Convert units
        projectile_radius = size / 2  # meters
        velocity_ms = velocity * 1000  # m/s
        
        # Target properties
        target_density = 1000 if is_water else 2700  # kg/m³ (water or rock)
        target_strength = 0 if is_water else 1e7  # Pa (cohesive strength)
        gravity = 9.81  # m/s²
        
        # Pi-group scaling parameters
        density_ratio = density / target_density
        
        # Transient crater radius scaling
        # Rt = L * (ρp/ρt)^0.44 * (v²/gL)^0.22 * (Y/ρt*g*L)^-0.11
        # Where L is projectile radius
        
        gravity_term = (velocity_ms ** 2) / (gravity * projectile_radius * 2)  # v²/gL
        strength_term = target_strength / (target_density * gravity * projectile_radius * 2) if not is_water else 1
        
        # Scaling law coefficients
        if is_water:
            # Water impacts: simpler scaling, no strength term
            transient_radius = projectile_radius * 8.0 * (density_ratio ** 0.44) * (gravity_term ** 0.22)
        else:
            # Rock impacts: full pi-scaling
            transient_radius = projectile_radius * 1.6 * (density_ratio ** 0.44) * (gravity_term ** 0.22) * (strength_term ** -0.11)
        
        # Convert to final crater (accounting for rim collapse)
        if transient_radius > 2000:  # >4km diameter = complex crater
            final_radius = transient_radius * 1.25  # Less rim collapse for large craters
        else:
            final_radius = transient_radius * 1.0   # Simple craters
        
        # Physical limits: crater can't be more than 100x projectile diameter
        max_radius = projectile_radius * 50
        final_radius = min(final_radius, max_radius)
        
        diameter = final_radius * 2
        depth = diameter / (8 if diameter > 4000 else 5)  # Depth-diameter ratio
        
        return diameter, depth
    
    @staticmethod
    def calculate_seismic_effects(energy_joules: float) -> Tuple[float, float]:
        """
        Estimate seismic magnitude and affected radius using realistic impact seismology.
        Based on Schultz & Gault (1975) and more recent impact studies.
        
        Args:
            energy_joules: Impact energy in joules
            
        Returns:
            Tuple of (Richter magnitude, affected radius in km)
        """
        # Convert energy to megatons for easier calculation
        energy_mt = energy_joules / (ImpactSimulator.TNT_JOULES * 1e6)
        
        # Seismic efficiency for impacts (much lower than explosions)
        # Only ~0.001% of impact energy goes into seismic waves
        seismic_efficiency = 1e-5
        seismic_energy = energy_joules * seismic_efficiency
        
        # Magnitude calculation using Gutenberg-Richter relation for impacts
        # M = (log10(E) - 5.87) / 1.5  (where E is in joules)
        # This gives more realistic results for impacts
        if seismic_energy <= 0:
            magnitude = 0
        else:
            magnitude = (math.log10(seismic_energy) - 5.87) / 1.5
            magnitude = max(0, min(magnitude, 10))  # Reasonable bounds
        
        # Affected radius using attenuation formula for impact-generated seismic waves
        # Impacts have different attenuation than tectonic earthquakes
        if magnitude < 3:
            radius = 10  # Minimum detectable radius
        elif magnitude < 5:
            # Small impacts: felt radius scales with magnitude
            radius = 50 * (magnitude - 2)  # ~50 km per magnitude unit
        elif magnitude < 7:
            # Medium impacts: felt radius ~100-500 km
            radius = 100 * (magnitude - 3)
        else:
            # Large impacts: can be felt globally but with distance decay
            radius = min(2000, 300 * (magnitude - 5))  # Cap at reasonable distance
        
        return magnitude, radius
    
    @staticmethod
    def calculate_tsunami_effects(energy_mt: float) -> Optional[Tuple[float, float]]:
        """
        Calculate tsunami characteristics for water impacts.
        
        Args:
            energy_mt: Impact energy in megatons TNT
            
        Returns:
            Tuple of (wave height in meters, affected radius in km) or None
        """
        # Tsunami wave height (meters)
        wave_height = (energy_mt / 1000) ** 0.25 * 10
        wave_height = min(wave_height, 500)  # Physical limit
        
        # Affected radius (km)
        affected_radius = math.sqrt(energy_mt) * 15
        affected_radius = min(affected_radius, 10000)  # Pacific Ocean scale
        
        return wave_height, affected_radius
    
    @staticmethod
    def calculate_atmospheric_effects(energy_mt: float) -> Tuple[float, float, float]:
        """
        Calculate atmospheric and thermal effects.
        
        Args:
            energy_mt: Impact energy in megatons TNT
            
        Returns:
            Tuple of (fireball radius, thermal radiation radius, overpressure radius) in km
        """
        # Fireball radius (km)
        fireball_radius = (energy_mt ** 0.4) * 0.28
        
        # Thermal radiation radius (3rd degree burns, km)
        thermal_radiation = (energy_mt ** 0.41) * 2.2
        
        # Overpressure radius (5 psi, structural damage, km)
        overpressure = (energy_mt ** 0.33) * 2.2
        
        return fireball_radius, thermal_radiation, overpressure
    
    @staticmethod
    def estimate_casualties(overpressure_radius: float, population_density: float = 50) -> Tuple[int, int]:
        """
        Estimate casualties based on affected area using realistic zone-based rates.
        
        Args:
            overpressure_radius: Radius of overpressure zone in km
            population_density: Population per km² (default: 50)
            
        Returns:
            Tuple of (estimated casualties, affected population)
        """
        affected_area = math.pi * (overpressure_radius ** 2)
        affected_population = int(affected_area * population_density)
        
        # Use realistic casualty rate based on zone analysis
        # Most people in overpressure zone experience 50% fatality rate
        # This matches the PopulationService calculation for consistency
        casualty_rate = 0.5  # 50% casualty rate for overpressure zone
        
        estimated_casualties = int(affected_population * casualty_rate)
        
        return estimated_casualties, affected_population

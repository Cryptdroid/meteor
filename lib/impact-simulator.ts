import { ImpactParameters, ImpactResults } from '@/types';
import { USGSService } from './usgs-service';
import { PopulationService } from './population-service';

export class ImpactSimulator {
  // Physical constants
  private static readonly EARTH_RADIUS = 6371; // km
  private static readonly GRAVITY = 9.81; // m/s²
  private static readonly TNT_JOULES = 4.184e9; // joules per kiloton
  private static readonly WATER_DEPTH_AVG = 3688; // meters

  /**
   * Calculate impact energy using kinetic energy formula
   * E = 0.5 * m * v²
   */
  static calculateImpactEnergy(params: ImpactParameters): {
    joules: number;
    megatonsTNT: number;
  } {
    // More realistic energy calculation matching backend
    const diameter = params.size;
    const radius = diameter / 2;
    const volume = (4 / 3) * Math.PI * Math.pow(radius, 3);
    const mass = volume * params.density;
    const velocityMS = params.velocity * 1000; // Convert km/s to m/s
    const energyJoules = 0.5 * mass * Math.pow(velocityMS, 2);
    
    // TNT equivalent (1 ton TNT = 4.184 × 10^9 J)
    const tntEquivalentTons = energyJoules / (4.184e9);
    const megatonsTNT = tntEquivalentTons / 1e6;

    return {
      joules: energyJoules,
      megatonsTNT,
    };
  }

  /**
   * Calculate crater dimensions using realistic scaling laws
   * Using Collins et al. crater scaling law: D ≈ 1.161 * (E^0.22) for land impacts
   */
  static calculateCraterSize(params: ImpactParameters): {
    diameter: number;
    depth: number;
  } {
    const energy = this.calculateImpactEnergy(params);
    const energyMT = energy.megatonsTNT;

    // More realistic crater diameter estimation - matches backend
    // Using Collins et al. crater scaling law: D ≈ 1.161 * (E^0.22) for land impacts
    const diameter = energyMT > 0 ? 1.161 * Math.pow(energyMT, 0.22) * 1000 : 0; // meters
    
    // Depth-to-diameter ratio of 1:5 (typical for impact craters)
    const depth = diameter / 5; // meters

    return {
      diameter,
      depth,
    };
  }

  /**
   * Estimate seismic magnitude and affected radius
   * Based on Schultz & Gault (1975) and realistic seismic attenuation
   */
static calculateSeismicEffects(params: ImpactParameters): {
  magnitude: number;
  radius: number;
} {
  const energy = this.calculateImpactEnergy(params);
  
  // Apply seismic efficiency factor
  const seismicEfficiency = 1e-4; // 0.01% of energy goes into seismic
  const seismicEnergy = energy.joules * seismicEfficiency;

  // Convert to Richter magnitude
  const magnitude = (2 / 3) * (Math.log10(seismicEnergy) - 4.8);

  const clampedMagnitude = Math.min(magnitude, 12);

  // Felt radius estimate (very approximate)
  const radius = Math.pow(10, (clampedMagnitude - 3) * 0.5) * 10;

  return {
    magnitude: clampedMagnitude,
    radius: Math.min(radius, 1500), // km
  };
}


  /**
   * Calculate tsunami characteristics for water impacts
   */
  static calculateTsunamiEffects(params: ImpactParameters): {
    waveHeight: number;
    affectedRadius: number;
  } | null {
    if (!params.isWaterImpact) return null;

    const energy = this.calculateImpactEnergy(params);
    const energyMT = energy.megatonsTNT;

    // Tsunami wave height (meters)
    const waveHeight = Math.pow(energyMT / 1000, 0.25) * 10;

    // Affected radius (km)
    const affectedRadius = Math.sqrt(energyMT) * 15;

    return {
      waveHeight: Math.min(waveHeight, 500),
      affectedRadius: Math.min(affectedRadius, 10000),
    };
  }

  /**
   * Calculate atmospheric effects
   */
  static calculateAtmosphericEffects(params: ImpactParameters): {
    fireballRadius: number;
    thermalRadiation: number;
    overpressure: number;
  } {
    const energy = this.calculateImpactEnergy(params);
    const energyMT = energy.megatonsTNT;

    // More realistic atmospheric effects - matching backend scaling
    // Fireball radius (km) - reduced scaling
    const fireballRadius = Math.pow(energyMT, 0.4) * 0.28;

    // Thermal radiation radius (3rd degree burns, km) - much more realistic
    const thermalRadiation = Math.pow(energyMT, 0.33) * 1.2;

    // Overpressure radius (severe damage, km) - realistic scaling
    const overpressure = 0.28 * Math.pow(energyMT, 1/3);

    return {
      fireballRadius,
      thermalRadiation,
      overpressure,
    };
  }

  /**
   * Classify impact severity based on energy - matching backend classification
   */
  static classifyImpact(energyMegatons: number): string {
    if (energyMegatons < 0.001) {
      return "Minimal damage";
    } else if (energyMegatons < 0.1) {
      return "Local damage (building destruction)";
    } else if (energyMegatons < 10) {
      return "City-wide damage";
    } else if (energyMegatons < 1000) {
      return "Regional devastation";
    } else if (energyMegatons < 100000) {
      return "Continental impact";
    } else if (energyMegatons < 100000000) {
      return "Global climate effects";
    } else {
      return "Mass extinction event";
    }
  }

  /**
   * Complete impact simulation
   */
  /**
   * Main simulation function with USGS terrain enhancement
   */
  static async simulate(params: ImpactParameters): Promise<ImpactResults> {
    // DISABLED: Use only frontend simulation with realistic physics
    const useBackend = false; // Forced to false - using frontend only
    
    console.log('[Frontend] Using realistic TypeScript simulation (backend disabled)');

    // Backend disabled - using realistic frontend simulation only

    // Frontend simulation (original logic)
    console.log('[Frontend] Using TypeScript simulation');
    
    // Use targetLatitude/targetLongitude or fall back to impactLocation
    const lat = params.targetLatitude ?? params.impactLocation.lat;
    const lng = params.targetLongitude ?? params.impactLocation.lng;
    
    // Get terrain data from USGS
    const terrainData = await USGSService.getImpactLocationDetails(lat, lng);

    // Get population density data
    const populationData = await PopulationService.getPopulationDensity(lat, lng);

    // Update parameters with terrain information
    const enhancedParams = {
      ...params,
      isWaterImpact: terrainData.isWater,
    };

    // Calculate base results
    const energy = this.calculateImpactEnergy(enhancedParams);
    
    // Use USGS-enhanced crater calculation
    const crater = await USGSService.calculateEnhancedCrater(
      lat,
      lng,
      energy.megatonsTNT,
      params.angle
    );
    
    const seismic = this.calculateSeismicEffects(enhancedParams);
    const atmospheric = this.calculateAtmosphericEffects(enhancedParams);
    
    // Use USGS-enhanced tsunami calculation if water impact
    let tsunami = null;
    if (terrainData.isWater || terrainData.terrainType === 'coastal') {
      tsunami = await USGSService.calculateEnhancedTsunami(
        lat,
        lng,
        energy.megatonsTNT
      );
    }

    // Calculate casualties using realistic population impact (like backend)
    const damageRadiusKm = atmospheric.overpressure; // Use overpressure radius as damage zone
    const populationAffected = Math.floor(damageRadiusKm * damageRadiusKm * Math.PI * 1000); // ~1000 people per km²
    const casualties = {
      estimated: Math.floor(populationAffected * 0.1), // 10% casualty rate in damage zone
      affectedPopulation: populationAffected,
    };

    return {
      energy,
      crater,
      seismic,
      tsunami: tsunami || undefined,
      atmospheric,
      casualties,
      terrainType: terrainData.terrainType,
      elevation: terrainData.elevation,
      populationDensity: populationData.density,
      nearestCity: populationData.nearestCity,
    };
  }

  /**
   * Estimate casualties based on impact location and effects
   */
  static estimateCasualties(
    results: ImpactResults,
    populationDensity: number = 50
  ): {
    estimated: number;
    affectedPopulation: number;
  } {
    const affectedArea = Math.PI * Math.pow(results.atmospheric.overpressure, 2);
    const affectedPopulation = affectedArea * populationDensity;
    const casualtyRate = 0.5; // 50% casualty rate in affected zone

    return {
      estimated: Math.round(affectedPopulation * casualtyRate),
      affectedPopulation: Math.round(affectedPopulation),
    };
  }
}

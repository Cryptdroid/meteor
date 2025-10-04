/**
 * Population Density Service - Updated with 2025 data
 */

import { cachedFetch, apiCache } from './cache-service';

export interface PopulationData {
  density: number; // people per km²
  totalPopulation: number;
  nearestCity?: string;
  urbanArea: boolean;
}

/**
 * Population density data for major regions - Updated 2025 from worldpopulationreview.com and visualcapitalist
 */
const POPULATION_DENSITY_MAP = {
  // Major metropolitan areas (people per km²)
  metros: [
    { name: 'Tokyo', lat: 35.6762, lng: 139.6503, density: 6168, population: 37400000 },
    { name: 'Delhi', lat: 28.7041, lng: 77.1025, density: 11320, population: 30300000 },
    { name: 'Shanghai', lat: 31.2304, lng: 121.4737, density: 3826, population: 27100000 },
    { name: 'São Paulo', lat: -23.5505, lng: -46.6333, density: 7398, population: 22000000 },
    { name: 'Mexico City', lat: 19.4326, lng: -99.1332, density: 6000, population: 21800000 },
    { name: 'Cairo', lat: 30.0444, lng: 31.2357, density: 19376, population: 20900000 },
    { name: 'Mumbai', lat: 19.0760, lng: 72.8777, density: 31700, population: 20400000 },
    { name: 'Beijing', lat: 39.9042, lng: 116.4074, density: 1311, population: 20400000 },
    { name: 'Dhaka', lat: 23.8103, lng: 90.4125, density: 44500, population: 20300000 },
    { name: 'Osaka', lat: 34.6937, lng: 135.5023, density: 12000, population: 19300000 },
    { name: 'New York', lat: 40.7128, lng: -74.0060, density: 10715, population: 18800000 },
    { name: 'Karachi', lat: 24.8607, lng: 67.0011, density: 24000, population: 16100000 },
    { name: 'Buenos Aires', lat: -34.6037, lng: -58.3816, density: 14000, population: 15200000 },
    { name: 'Istanbul', lat: 41.0082, lng: 28.9784, density: 2976, population: 15200000 },
    { name: 'Kolkata', lat: 22.5726, lng: 88.3639, density: 24000, population: 14900000 },
    { name: 'Manila', lat: 14.5995, lng: 120.9842, density: 42857, population: 13900000 },
    { name: 'Lagos', lat: 6.5244, lng: 3.3792, density: 13128, population: 13900000 },
    { name: 'Rio de Janeiro', lat: -22.9068, lng: -43.1729, density: 5265, population: 13400000 },
    { name: 'Guangzhou', lat: 23.1291, lng: 113.2644, density: 1800, population: 13300000 },
    { name: 'Los Angeles', lat: 34.0522, lng: -118.2437, density: 3198, population: 12400000 },
    { name: 'Moscow', lat: 55.7558, lng: 37.6173, density: 4823, population: 12500000 },
    { name: 'Paris', lat: 48.8566, lng: 2.3522, density: 21000, population: 11000000 },
    { name: 'London', lat: 51.5074, lng: -0.1278, density: 5701, population: 9500000 },
    { name: 'Chicago', lat: 41.8781, lng: -87.6298, density: 4447, population: 8900000 },
    { name: 'Bangalore', lat: 12.9716, lng: 77.5946, density: 11000, population: 8400000 },
    { name: 'Hong Kong', lat: 22.3193, lng: 114.1694, density: 7044, population: 7500000 }, // Updated
    { name: 'Singapore', lat: 1.3521, lng: 103.8198, density: 8177, population: 5700000 }, // Updated
    { name: 'Sydney', lat: -33.8688, lng: 151.2093, density: 2058, population: 5300000 },
    { name: 'San Francisco', lat: 37.7749, lng: -122.4194, density: 6658, population: 4700000 },
    { name: 'Toronto', lat: 43.6532, lng: -79.3832, density: 4334, population: 6200000 },
  ],
  
  // Regional average densities by country - Updated 2025
  countries: [
    { name: 'Macau', density: 21946 },
    { name: 'Monaco', density: 19171 },
    { name: 'Singapore', density: 8177 },
    { name: 'Hong Kong', density: 7044 },
    { name: 'Gibraltar', density: 5901 },
    { name: 'Bangladesh', density: 1265 },
    { name: 'Lebanon', density: 669 },
    { name: 'Taiwan', density: 652 },
    { name: 'Rwanda', density: 601 },
    { name: 'South Korea', density: 527 },
    { name: 'Netherlands', density: 508 },
    { name: 'Belgium', density: 383 },
    { name: 'Japan', density: 347 },
    { name: 'India', density: 464 },
    { name: 'Philippines', density: 368 },
    { name: 'Vietnam', density: 314 },
    { name: 'United Kingdom', density: 281 },
    { name: 'Germany', density: 240 },
    { name: 'Italy', density: 206 },
    { name: 'China', density: 153 },
    { name: 'Indonesia', density: 151 },
    { name: 'Nigeria', density: 226 },
    { name: 'Pakistan', density: 287 },
    { name: 'United States', density: 36 },
    { name: 'Brazil', density: 25 },
    { name: 'Mexico', density: 66 },
    { name: 'Russia', density: 9 },
    { name: 'Australia', density: 3 },
    { name: 'Canada', density: 4 },
  ],
};

// ... (rest of the class unchanged, as logic is fine; only data updated)

export class PopulationService {
  private static readonly EARTH_RADIUS = 6371; // km
  private static readonly METRO_RADIUS = 50; // km - radius to consider for metro areas
  private static readonly NOMINATIM_ENDPOINT = 'https://nominatim.openstreetmap.org/reverse';

  /**
   * Calculate distance between two coordinates using Haversine formula
   */
  private static calculateDistance(
    lat1: number,
    lng1: number,
    lat2: number,
    lng2: number
  ): number {
    const dLat = this.toRadians(lat2 - lat1);
    const dLng = this.toRadians(lng2 - lng1);

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRadians(lat1)) *
        Math.cos(this.toRadians(lat2)) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return this.EARTH_RADIUS * c;
  }

  private static toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }

  /**
   * Find nearest major city within radius
   */
  private static findNearestMetro(lat: number, lng: number): {
    metro: typeof POPULATION_DENSITY_MAP.metros[0] | null;
    distance: number;
  } {
    let nearestMetro = null;
    let minDistance = Infinity;

    for (const metro of POPULATION_DENSITY_MAP.metros) {
      const distance = this.calculateDistance(lat, lng, metro.lat, metro.lng);
      if (distance < minDistance) {
        minDistance = distance;
        nearestMetro = metro;
      }
    }

    return { metro: nearestMetro, distance: minDistance };
  }

  /**
   * Get population density estimate using reverse geocoding
   */
  static async getPopulationDensity(
    lat: number,
    lng: number
  ): Promise<PopulationData> {
    try {
      // First check if near a major metro area
      const { metro, distance } = this.findNearestMetro(lat, lng);

      // If within metro radius, use metro density with distance decay
      if (metro && distance < this.METRO_RADIUS) {
        const densityFactor = 1 - distance / this.METRO_RADIUS;
        const effectiveDensity = metro.density * Math.pow(densityFactor, 0.5);

        return {
          density: Math.max(effectiveDensity, 50), // Minimum 50 per km²
          totalPopulation: metro.population,
          nearestCity: metro.name,
          urbanArea: distance < 25,
        };
      }

      // Try to get country/region from Nominatim (with caching and rate limiting)
      try {
        const roundedLat = Math.round(lat * 100) / 100; // Round to 2 decimals for cache key
        const roundedLng = Math.round(lng * 100) / 100;
        const cacheKey = apiCache.generateKey('nominatim:reverse', { lat: roundedLat, lng: roundedLng });
        
        const data = await cachedFetch(cacheKey, async () => {
          const response = await fetch(
            `${this.NOMINATIM_ENDPOINT}?lat=${lat}&lon=${lng}&format=json`,
            {
              headers: {
                'User-Agent': 'AsteroidImpactSimulator/1.0',
              },
            }
          );

          if (!response.ok) {
            throw new Error('Nominatim API failed');
          }

          return await response.json();
        }, 1000 * 60 * 60 * 24 * 7); // 7 day TTL - city locations are static

        const country = data.address?.country;

        // Look up country density
        if (country) {
          const countryData = POPULATION_DENSITY_MAP.countries.find(
            (c) => c.name.toLowerCase() === country.toLowerCase()
          );

          if (countryData) {
            // Check if it's a city/town/village for urban multiplier
            const isUrban =
              data.address?.city ||
              data.address?.town ||
              data.address?.village;

            const urbanMultiplier = isUrban ? 3 : 1;

            return {
              density: countryData.density * urbanMultiplier,
              totalPopulation: 0,
              nearestCity: metro?.name,
              urbanArea: Boolean(isUrban),
            };
          }
        }
      } catch (nominatimError) {
        console.warn('Nominatim API error:', nominatimError);
        // Fall through to default calculation
      }

      // Default: use latitude-based density estimation
      // Higher population near equator and mid-latitudes, lower at poles
      const absLat = Math.abs(lat);
      let baseDensity = 50; // Default global average

      if (absLat < 30) {
        baseDensity = 80; // Tropical/subtropical regions
      } else if (absLat < 50) {
        baseDensity = 60; // Temperate regions
      } else if (absLat < 60) {
        baseDensity = 20; // Subarctic regions
      } else {
        baseDensity = 2; // Arctic regions
      }

      return {
        density: baseDensity,
        totalPopulation: 0,
        nearestCity: metro?.name,
        urbanArea: false,
      };
    } catch (error) {
      console.error('Population density calculation error:', error);
      // Return conservative default
      return {
        density: 50, // Global average
        totalPopulation: 0,
        urbanArea: false,
      };
    }
  }

  /**
   * Calculate casualties based on impact effects and population density
   * Uses realistic fatality rates by distance zone
   */
  static calculateCasualties(
    populationData: PopulationData,
    fireballRadiusKm: number,
    overpressureRadiusKm: number,
    thermalRadiusKm: number
  ): {
    estimated: number;
    affectedPopulation: number;
    breakdown: {
      fireball: number;
      overpressure: number;
      thermal: number;
      injured: number;
    };
  } {
    const { density } = populationData;

    // Calculate affected populations in each zone (non-overlapping rings)
    const fireballArea = Math.PI * Math.pow(fireballRadiusKm, 2);
    const overpressureArea = Math.PI * Math.pow(overpressureRadiusKm, 2) - fireballArea;
    const thermalArea = Math.PI * Math.pow(thermalRadiusKm, 2) - Math.PI * Math.pow(overpressureRadiusKm, 2);

    const fireballPop = fireballArea * density;
    const overpressurePop = overpressureArea * density;
    const thermalPop = thermalArea * density;

    // More realistic casualty rates by zone
    const fireballFatalities = fireballPop * 0.95; // 95% fatality in fireball
    const overpressureFatalities = overpressurePop * 0.50; // 50% fatality from blast
    const thermalFatalities = thermalPop * 0.15; // 15% fatality from burns/fires

    const totalFatalities =
      fireballFatalities + overpressureFatalities + thermalFatalities;
    const totalAffected = fireballPop + overpressurePop + thermalPop;
    const injured = (totalAffected - totalFatalities) * 0.60; // 60% of survivors injured

    return {
      estimated: Math.round(totalFatalities),
      affectedPopulation: Math.round(totalAffected),
      breakdown: {
        fireball: Math.round(fireballFatalities),
        overpressure: Math.round(overpressureFatalities),
        thermal: Math.round(thermalFatalities),
        injured: Math.round(injured),
      },
    };
  }

  /**
   * Get major cities list for regional zoom feature
   */
  static getMajorCities() {
    return POPULATION_DENSITY_MAP.metros.map((metro) => ({
      name: metro.name,
      lat: metro.lat,
      lng: metro.lng,
      population: metro.population,
    }));
  }
}

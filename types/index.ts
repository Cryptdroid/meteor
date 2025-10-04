// NASA NEO API Types
export interface NASAAsteroid {
  id: string;
  name: string;
  nasa_jpl_url: string;
  absolute_magnitude_h: number;
  estimated_diameter: {
    kilometers: {
      estimated_diameter_min: number;
      estimated_diameter_max: number;
    };
  };
  is_potentially_hazardous_asteroid: boolean;
  close_approach_data: CloseApproachData[];
  orbital_data: OrbitalData;
}

export interface CloseApproachData {
  close_approach_date: string;
  epoch_date_close_approach: number;
  relative_velocity: {
    kilometers_per_second: string;
    kilometers_per_hour: string;
  };
  miss_distance: {
    astronomical: string;
    lunar: string;
    kilometers: string;
  };
  orbiting_body: string;
}

export interface OrbitalData {
  orbit_id: string;
  orbit_determination_date: string;
  orbit_uncertainty: string;
  minimum_orbit_intersection: string;
  jupiter_tisserand_invariant: string;
  epoch_osculation: string;
  eccentricity: string;
  semi_major_axis: string;
  inclination: string;
  ascending_node_longitude: string;
  orbital_period: string;
  perihelion_distance: string;
  perihelion_argument: string;
  aphelion_distance: string;
  perihelion_time: string;
  mean_anomaly: string;
  mean_motion: string;
}

// Simulation Types
export interface ImpactParameters {
  asteroidId?: string;
  size: number; // meters
  density: number; // kg/m³
  velocity: number; // km/s
  angle: number; // degrees
  impactLocation: {
    lat: number;
    lng: number;
  };
  targetLatitude?: number; // Optional for USGS (defaults to impactLocation.lat)
  targetLongitude?: number; // Optional for USGS (defaults to impactLocation.lng)
  isWaterImpact?: boolean;
}

export interface ImpactResults {
  energy: {
    joules: number;
    megatonsTNT: number;
  };
  crater: {
    diameter: number; // meters
    depth: number; // meters
  };
  seismic: {
    magnitude: number;
    radius: number; // km
  };
  tsunami?: {
    waveHeight: number; // meters
    affectedRadius: number; // km
  };
  atmospheric: {
    fireballRadius: number; // km
    thermalRadiation: number; // km
    overpressure: number; // km
  };
  casualties?: {
    estimated: number;
    affectedPopulation: number;
  };
  terrainType?: string; // Added for USGS
  elevation?: number; // Added for USGS (meters)
  populationDensity?: number; // Added for PopulationService (people per km²)
  nearestCity?: string; // Added for PopulationService
}

export interface DeflectionStrategy {
  type: 'kinetic-impactor' | 'gravity-tractor' | 'laser-ablation' | 'nuclear';
  name: string;
  description: string;
  effectiveness: number; // 0-1
  timeRequired: number; // days
  deltaV: number; // m/s velocity change
}

export interface SimulationScenario {
  id: string;
  name: string;
  description: string;
  asteroid: NASAAsteroid | CustomAsteroid;
  impactParameters: ImpactParameters;
  deflectionStrategy?: DeflectionStrategy;
  daysUntilImpact: number;
  successRate: number;
}

export interface CustomAsteroid {
  id: string;
  name: string;
  size: number;
  velocity: number;
  composition: string;
  isCustom: true;
}

// 3D Visualization Types
export interface OrbitData {
  a: number; // semi-major axis (AU)
  e: number; // eccentricity
  i: number; // inclination (degrees)
  omega: number; // argument of periapsis (degrees)
  Omega: number; // longitude of ascending node (degrees)
  M: number; // mean anomaly (degrees)
}

export interface Vector3D {
  x: number;
  y: number;
  z: number;
}

// UI State Types
export interface DashboardState {
  selectedAsteroid: NASAAsteroid | null;
  simulationResults: ImpactResults | null;
  activeView: 'simulation' | 'defend-earth';
  isSimulating: boolean;
  showEnvironmentalOverlays: {
    seismic: boolean;
    tsunami: boolean;
    population: boolean;
  };
}

// Game Mode Types
export interface GameState {
  scenario: SimulationScenario;
  timeRemaining: number; // seconds
  score: number;
  interventionTime: number | null;
  damageAvoided: number;
  isComplete: boolean;
  outcome: 'success' | 'failure' | 'partial' | null;
}

/**
 * Advanced Orbital Mechanics Calculator
 * Implements Kepler's laws and real orbital calculations for asteroid trajectories
 */

export interface OrbitalElements {
  semiMajorAxis: number; // AU
  eccentricity: number;
  inclination: number; // degrees
  longitudeOfAscendingNode: number; // degrees
  argumentOfPeriapsis: number; // degrees
  meanAnomalyAtEpoch: number; // degrees
  epoch: Date;
  period: number; // days
}

export interface Position3D {
  x: number;
  y: number;
  z: number;
}

export interface Velocity3D {
  vx: number;
  vy: number;
  vz: number;
}

export interface OrbitalState {
  position: Position3D;
  velocity: Velocity3D;
  trueAnomaly: number;
  radius: number;
  speed: number;
}

export class AdvancedOrbitalMechanics {
  // Constants
  static readonly AU = 149597870.7; // km
  static readonly GM_SUN = 1.32712442018e11; // km³/s²
  static readonly GM_EARTH = 3.986004418e5; // km³/s²
  static readonly EARTH_RADIUS = 6371; // km
  
  /**
   * Calculate orbital elements from NASA close approach data
   */
  static calculateOrbitalElements(asteroid: any): OrbitalElements {
    const approachData = asteroid.close_approach_data[0];
    if (!approachData) {
      throw new Error('No approach data available');
    }

    const velocity = parseFloat(approachData.relative_velocity.kilometers_per_second);
    const distance = parseFloat(approachData.miss_distance.kilometers);
    const approachDate = new Date(approachData.close_approach_date);
    
    // Estimate orbital elements using simplified assumptions
    // Note: In reality, these would come from JPL HORIZONS API or similar
    
    // Semi-major axis estimation from velocity (using vis-viva equation approximation)
    const earthOrbitRadius = 1.0; // AU
    const velocityAtEarth = velocity; // km/s
    const semiMajorAxis = Math.max(0.5, Math.min(5.0, 
      1 / (2/earthOrbitRadius - (velocityAtEarth * velocityAtEarth) / (2 * Math.sqrt(this.GM_SUN / this.AU)))
    ));
    
    // Eccentricity estimation from miss distance and velocity
    const eccentricity = Math.max(0.01, Math.min(0.95, 
      distance / (this.AU * 1000) * 0.1 + (velocity - 15) / 50
    ));
    
    // Inclination estimation (most NEOs have low inclination)
    const inclination = Math.max(0.1, Math.min(35, 
      (velocity - 15) * 1.5 + Math.random() * 10
    ));
    
    // Other orbital elements (simplified estimates)
    const longitudeOfAscendingNode = Math.random() * 360;
    const argumentOfPeriapsis = Math.random() * 360;
    const meanAnomalyAtEpoch = Math.random() * 360;
    
    // Period using Kepler's third law
    const period = Math.pow(semiMajorAxis, 1.5) * 365.25;
    
    return {
      semiMajorAxis,
      eccentricity,
      inclination,
      longitudeOfAscendingNode,
      argumentOfPeriapsis,
      meanAnomalyAtEpoch,
      epoch: approachDate,
      period
    };
  }
  
  /**
   * Calculate mean anomaly at a given time
   */
  static meanAnomalyAtTime(elements: OrbitalElements, time: Date): number {
    const daysSinceEpoch = (time.getTime() - elements.epoch.getTime()) / (1000 * 60 * 60 * 24);
    const meanMotion = 360 / elements.period; // degrees per day
    return (elements.meanAnomalyAtEpoch + meanMotion * daysSinceEpoch) % 360;
  }
  
  /**
   * Solve Kepler's equation for eccentric anomaly
   */
  static solveKeplerEquation(meanAnomaly: number, eccentricity: number): number {
    const M = this.degreesToRadians(meanAnomaly);
    let E = M; // Initial guess
    
    // Newton-Raphson iteration
    for (let i = 0; i < 10; i++) {
      const deltaE = (E - eccentricity * Math.sin(E) - M) / (1 - eccentricity * Math.cos(E));
      E -= deltaE;
      if (Math.abs(deltaE) < 1e-12) break;
    }
    
    return this.radiansToDegrees(E);
  }
  
  /**
   * Calculate true anomaly from eccentric anomaly
   */
  static trueAnomalyFromEccentric(eccentricAnomaly: number, eccentricity: number): number {
    const E = this.degreesToRadians(eccentricAnomaly);
    const trueAnomaly = 2 * Math.atan2(
      Math.sqrt(1 + eccentricity) * Math.sin(E / 2),
      Math.sqrt(1 - eccentricity) * Math.cos(E / 2)
    );
    return this.radiansToDegrees(trueAnomaly);
  }
  
  /**
   * Calculate orbital radius at true anomaly
   */
  static orbitalRadius(elements: OrbitalElements, trueAnomaly: number): number {
    const nu = this.degreesToRadians(trueAnomaly);
    return elements.semiMajorAxis * (1 - elements.eccentricity * elements.eccentricity) / 
           (1 + elements.eccentricity * Math.cos(nu));
  }
  
  /**
   * Calculate 3D position in orbital plane
   */
  static positionInOrbitalPlane(elements: OrbitalElements, trueAnomaly: number): Position3D {
    const nu = this.degreesToRadians(trueAnomaly);
    const r = this.orbitalRadius(elements, trueAnomaly);
    
    return {
      x: r * Math.cos(nu),
      y: r * Math.sin(nu),
      z: 0
    };
  }
  
  /**
   * Transform position from orbital plane to heliocentric coordinates
   */
  static transformToHeliocentric(position: Position3D, elements: OrbitalElements): Position3D {
    const i = this.degreesToRadians(elements.inclination);
    const omega = this.degreesToRadians(elements.longitudeOfAscendingNode);
    const w = this.degreesToRadians(elements.argumentOfPeriapsis);
    
    // Rotation matrices
    const cosOmega = Math.cos(omega);
    const sinOmega = Math.sin(omega);
    const cosI = Math.cos(i);
    const sinI = Math.sin(i);
    const cosW = Math.cos(w);
    const sinW = Math.sin(w);
    
    // Combined rotation matrix elements
    const P11 = cosW * cosOmega - sinW * sinOmega * cosI;
    const P12 = -sinW * cosOmega - cosW * sinOmega * cosI;
    const P21 = cosW * sinOmega + sinW * cosOmega * cosI;
    const P22 = -sinW * sinOmega + cosW * cosOmega * cosI;
    const P31 = sinW * sinI;
    const P32 = cosW * sinI;
    
    return {
      x: P11 * position.x + P12 * position.y,
      y: P21 * position.x + P22 * position.y,
      z: P31 * position.x + P32 * position.y
    };
  }
  
  /**
   * Calculate complete orbital state at a given time
   */
  static calculateOrbitalState(elements: OrbitalElements, time: Date): OrbitalState {
    const meanAnomaly = this.meanAnomalyAtTime(elements, time);
    const eccentricAnomaly = this.solveKeplerEquation(meanAnomaly, elements.eccentricity);
    const trueAnomaly = this.trueAnomalyFromEccentric(eccentricAnomaly, elements.eccentricity);
    
    const positionOrbital = this.positionInOrbitalPlane(elements, trueAnomaly);
    const position = this.transformToHeliocentric(positionOrbital, elements);
    
    // Calculate velocity (simplified)
    const r = this.orbitalRadius(elements, trueAnomaly);
    const speed = Math.sqrt(this.GM_SUN / this.AU * (2/r - 1/elements.semiMajorAxis));
    
    // Velocity direction (perpendicular to radius vector, in orbital plane)
    const nu = this.degreesToRadians(trueAnomaly);
    const velocityOrbital = {
      vx: -Math.sin(nu) * speed,
      vy: Math.cos(nu) * speed * Math.sqrt(1 + elements.eccentricity * Math.cos(nu)),
      vz: 0
    };
    
    // Transform velocity to heliocentric coordinates (same rotation as position)
    const i = this.degreesToRadians(elements.inclination);
    const omega = this.degreesToRadians(elements.longitudeOfAscendingNode);
    const w = this.degreesToRadians(elements.argumentOfPeriapsis);
    
    const cosOmega = Math.cos(omega);
    const sinOmega = Math.sin(omega);
    const cosI = Math.cos(i);
    const sinI = Math.sin(i);
    const cosW = Math.cos(w);
    const sinW = Math.sin(w);
    
    const P11 = cosW * cosOmega - sinW * sinOmega * cosI;
    const P12 = -sinW * cosOmega - cosW * sinOmega * cosI;
    const P21 = cosW * sinOmega + sinW * cosOmega * cosI;
    const P22 = -sinW * sinOmega + cosW * cosOmega * cosI;
    const P31 = sinW * sinI;
    const P32 = cosW * sinI;
    
    const velocity = {
      vx: P11 * velocityOrbital.vx + P12 * velocityOrbital.vy,
      vy: P21 * velocityOrbital.vx + P22 * velocityOrbital.vy,
      vz: P31 * velocityOrbital.vx + P32 * velocityOrbital.vy
    };
    
    return {
      position,
      velocity,
      trueAnomaly,
      radius: r,
      speed
    };
  }
  
  /**
   * Generate orbital trajectory points
   */
  static generateTrajectory(elements: OrbitalElements, numPoints: number = 360): Position3D[] {
    const trajectory: Position3D[] = [];
    
    for (let i = 0; i < numPoints; i++) {
      const trueAnomaly = (i / numPoints) * 360;
      const positionOrbital = this.positionInOrbitalPlane(elements, trueAnomaly);
      const position = this.transformToHeliocentric(positionOrbital, elements);
      trajectory.push(position);
    }
    
    return trajectory;
  }
  
  /**
   * Calculate Earth's position at a given time (simplified circular orbit)
   */
  static earthPosition(time: Date): Position3D {
    const daysSinceJ2000 = (time.getTime() - new Date('2000-01-01T12:00:00Z').getTime()) / (1000 * 60 * 60 * 24);
    const meanLongitude = (280.460 + 0.9856474 * daysSinceJ2000) % 360;
    const angle = this.degreesToRadians(meanLongitude);
    
    return {
      x: Math.cos(angle),
      y: Math.sin(angle),
      z: 0
    };
  }
  
  /**
   * Utility functions
   */
  static degreesToRadians(degrees: number): number {
    return degrees * Math.PI / 180;
  }
  
  static radiansToDegrees(radians: number): number {
    return radians * 180 / Math.PI;
  }
  
  /**
   * Calculate closest approach to Earth
   */
  static findClosestApproach(elements: OrbitalElements, startDate: Date, endDate: Date): {
    date: Date;
    distance: number;
    asteroidPosition: Position3D;
    earthPosition: Position3D;
  } {
    let minDistance = Infinity;
    let closestDate = startDate;
    let closestAsteroidPos: Position3D = { x: 0, y: 0, z: 0 };
    let closestEarthPos: Position3D = { x: 0, y: 0, z: 0 };
    
    const days = (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24);
    const stepSize = Math.max(1, days / 1000); // Check up to 1000 points
    
    for (let day = 0; day <= days; day += stepSize) {
      const currentDate = new Date(startDate.getTime() + day * 24 * 60 * 60 * 1000);
      const asteroidState = this.calculateOrbitalState(elements, currentDate);
      const earthPos = this.earthPosition(currentDate);
      
      const distance = Math.sqrt(
        Math.pow(asteroidState.position.x - earthPos.x, 2) +
        Math.pow(asteroidState.position.y - earthPos.y, 2) +
        Math.pow(asteroidState.position.z - earthPos.z, 2)
      );
      
      if (distance < minDistance) {
        minDistance = distance;
        closestDate = currentDate;
        closestAsteroidPos = asteroidState.position;
        closestEarthPos = earthPos;
      }
    }
    
    return {
      date: closestDate,
      distance: minDistance * this.AU, // Convert to km
      asteroidPosition: closestAsteroidPos,
      earthPosition: closestEarthPos
    };
  }
}
'use client';

import { useRef, useState, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { useXR, Interactive } from '@react-three/xr';
import { Text, Html, Line } from '@react-three/drei';
import * as THREE from 'three';
import { NASAAsteroid } from '@/types';
import ARAsteroidModel from './ARAsteroidModel';
import AREarthModel from './AREarthModel';


interface ARContentProps {
  asteroids: NASAAsteroid[];
  selectedAsteroid: NASAAsteroid | null;
  onAsteroidSelect?: (asteroid: NASAAsteroid) => void;
  scale: number;
  showGrid: boolean;
  showLabels: boolean;
  showOrbitPaths: boolean;
  showImpactSimulation?: boolean; // Not used in orbital view
}

// Simplified orbital path component
function OrbitPath({ 
  centerPosition, 
  semiMajorAxis, 
  eccentricity = 0.1, 
  inclination = 0, 
  color = '#00aaff',
  segments = 100 
}: {
  centerPosition: [number, number, number];
  semiMajorAxis: number;
  eccentricity?: number;
  inclination?: number;
  color?: string;
  segments?: number;
}) {
  const points = [];
  
  for (let i = 0; i <= segments; i++) {
    const theta = (i / segments) * Math.PI * 2;
    
    // Elliptical orbit calculation
    const r = semiMajorAxis * (1 - eccentricity * eccentricity) / (1 + eccentricity * Math.cos(theta));
    
    // Position in orbital plane
    const x = r * Math.cos(theta);
    const y = r * Math.sin(theta) * Math.cos(inclination);
    const z = r * Math.sin(theta) * Math.sin(inclination);
    
    points.push(new THREE.Vector3(
      centerPosition[0] + x * 0.5, // Scale down for AR
      centerPosition[1] + z * 0.5,
      centerPosition[2] + y * 0.5
    ));
  }
  
  return (
    <Line
      points={points}
      color={color}
      lineWidth={2}
      transparent
      opacity={0.8}
    />
  );
}

export default function ARContent({
  asteroids,
  selectedAsteroid,
  onAsteroidSelect,
  scale,
  showGrid,
  showLabels,
  showOrbitPaths,
}: ARContentProps) {
  const xrState = useXR();
  const isPresenting = xrState.session !== null;
  const groupRef = useRef<THREE.Group>(null);
  const [placementPosition, setPlacementPosition] = useState<THREE.Vector3>(
    new THREE.Vector3(0, 0, -2)
  );
  const [isPlaced, setIsPlaced] = useState(false);

  // Handle hit testing for AR placement
  useEffect(() => {
    if (!isPresenting) return;

    const session = (window as any).XRSession;
    if (!session) return;

    // Request hit test source
    session.requestHitTestSource?.({ space: 'viewer' }).then((hitTestSource: any) => {
      // Store hit test source for later use
      (window as any).hitTestSource = hitTestSource;
    });

    return () => {
      const source = (window as any).hitTestSource;
      if (source) {
        source.cancel();
        (window as any).hitTestSource = null;
      }
    };
  }, [isPresenting]);

  // Auto-place content in AR
  useFrame((state) => {
    if (!isPresenting || isPlaced) return;

    const hitTestSource = (window as any).hitTestSource;
    const frame = (state as any).gl?.xr?.getFrame?.();

    if (hitTestSource && frame) {
      const referenceSpace = (state as any).gl?.xr?.getReferenceSpace?.();
      if (referenceSpace) {
        const hitTestResults = frame.getHitTestResults(hitTestSource);
        if (hitTestResults.length > 0) {
          const hit = hitTestResults[0];
          const pose = hit.getPose(referenceSpace);
          if (pose) {
            const position = pose.transform.position;
            setPlacementPosition(new THREE.Vector3(position.x, position.y, position.z));
          }
        }
      }
    }
  });

  const handlePlacement = () => {
    setIsPlaced(true);
  };

  // Generate orbital data for asteroids with realistic mechanics
  const orbitalData = asteroids.slice(0, 3).map((asteroid, index) => {
    // Use real orbital data if available, otherwise generate realistic values
    const closeApproach = asteroid.close_approach_data[0];
    const distance = closeApproach ? parseFloat(closeApproach.miss_distance.astronomical) : 0.1 + index * 0.05;
    
    return {
      asteroid,
      semiMajorAxis: distance * 0.3, // Scale for AR visibility
      eccentricity: 0.1 + Math.random() * 0.3, // Realistic eccentricity
      inclination: (Math.random() - 0.5) * 0.2, // Small inclination for visibility
      currentPosition: distance * 0.5, // Current position on orbit
      size: Math.max(0.02, Math.min(asteroid.estimated_diameter.kilometers.estimated_diameter_max * 0.02 * scale, 0.15)),
    };
  });

  return (
    <group ref={groupRef} position={placementPosition.toArray()}>
      {/* AR Grid for placement reference */}
      {showGrid && !isPlaced && (
        <Interactive onSelect={handlePlacement}>
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
            <planeGeometry args={[1.5, 1.5, 8, 8]} />
            <meshBasicMaterial
              color="#00ffff"
              wireframe
              transparent
              opacity={0.3}
            />
          </mesh>
        </Interactive>
      )}

      {/* Only show orbital content after placement */}
      {(isPlaced || !isPresenting) && (
        <>
          {/* Central Sun (scaled down, golden) */}
          <mesh position={[0, 0, -1]}>
            <sphereGeometry args={[0.05, 16, 16]} />
            <meshBasicMaterial color="#ffaa00" />
          </mesh>
          
          {/* Sun label */}
          {showLabels && (
            <Text
              position={[0, 0.1, -1]}
              fontSize={0.02}
              color="#ffaa00"
              anchorX="center"
              anchorY="middle"
            >
              Sun
            </Text>
          )}

          {/* Earth's orbit (reference) */}
          {showOrbitPaths && (
            <OrbitPath
              centerPosition={[0, 0, -1]}
              semiMajorAxis={0.2}
              eccentricity={0.017}
              color="#4444ff"
            />
          )}

          {/* Earth */}
          <AREarthModel
            position={[0.2, 0, -1]}
            scale={0.03 * scale}
            showLabels={false}
          />

          {/* Earth label */}
          {showLabels && (
            <Text
              position={[0.2, 0.05, -1]}
              fontSize={0.015}
              color="#4444ff"
              anchorX="center"
              anchorY="middle"
            >
              Earth
            </Text>
          )}

          {/* Asteroid orbits and positions */}
          {orbitalData.map(({ asteroid, semiMajorAxis, eccentricity, inclination, currentPosition, size }, index) => {
            // Calculate current asteroid position on elliptical orbit
            const theta = (Date.now() * 0.0001 + index * 2) % (Math.PI * 2); // Slow animation
            const r = semiMajorAxis * (1 - eccentricity * eccentricity) / (1 + eccentricity * Math.cos(theta));
            
            const x = r * Math.cos(theta);
            const y = r * Math.sin(theta) * Math.cos(inclination);
            const z = r * Math.sin(theta) * Math.sin(inclination);
            
            const position: [number, number, number] = [x, z, -1 + y];
            const isSelected = selectedAsteroid?.id === asteroid.id;

            return (
              <group key={asteroid.id}>
                {/* Orbital path */}
                {showOrbitPaths && (
                  <OrbitPath
                    centerPosition={[0, 0, -1]}
                    semiMajorAxis={semiMajorAxis}
                    eccentricity={eccentricity}
                    inclination={inclination}
                    color={isSelected ? '#00ff00' : '#00aaff'}
                  />
                )}

                {/* Asteroid */}
                <Interactive onSelect={() => onAsteroidSelect?.(asteroid)}>
                  <mesh position={position}>
                    <sphereGeometry args={[size, 8, 8]} />
                    <meshPhongMaterial 
                      color={isSelected ? '#00ff00' : asteroid.is_potentially_hazardous_asteroid ? '#ff4444' : '#888888'}
                      emissive={isSelected ? '#004400' : asteroid.is_potentially_hazardous_asteroid ? '#440000' : '#000000'}
                    />
                  </mesh>
                </Interactive>

                {/* Asteroid label */}
                {showLabels && isSelected && (
                  <Text
                    position={[position[0], position[1] + 0.05, position[2]]}
                    fontSize={0.012}
                    color={isSelected ? '#00ff00' : '#ffffff'}
                    anchorX="center"
                    anchorY="middle"
                  >
                    {asteroid.name}
                  </Text>
                )}
              </group>
            );
          })}

          {/* Orbital mechanics info panel */}
          {showLabels && selectedAsteroid && (
            <Html
              position={[0.5, 0.3, -1]}
              center
              distanceFactor={1}
              style={{
                background: 'rgba(0, 20, 40, 0.9)',
                color: 'white',
                padding: '12px',
                borderRadius: '8px',
                fontSize: '11px',
                maxWidth: '250px',
                border: '1px solid #00aaff',
              }}
            >
              <div>
                <h3 className="font-bold text-cyan-400 mb-2 text-sm">
                  {selectedAsteroid.name}
                </h3>
                
                <div className="space-y-1 text-xs">
                  <div className="flex justify-between">
                    <span className="text-gray-300">Diameter:</span>
                    <span>{selectedAsteroid.estimated_diameter.kilometers.estimated_diameter_max.toFixed(3)} km</span>
                  </div>
                  
                  {selectedAsteroid.close_approach_data[0] && (
                    <>
                      <div className="flex justify-between">
                        <span className="text-gray-300">Velocity:</span>
                        <span>{parseFloat(selectedAsteroid.close_approach_data[0].relative_velocity.kilometers_per_second).toFixed(1)} km/s</span>
                      </div>
                      
                      <div className="flex justify-between">
                        <span className="text-gray-300">Distance:</span>
                        <span>{parseFloat(selectedAsteroid.close_approach_data[0].miss_distance.astronomical).toFixed(4)} AU</span>
                      </div>
                    </>
                  )}
                  
                  <div className="flex justify-between">
                    <span className="text-gray-300">Hazardous:</span>
                    <span className={selectedAsteroid.is_potentially_hazardous_asteroid ? 'text-red-400' : 'text-green-400'}>
                      {selectedAsteroid.is_potentially_hazardous_asteroid ? '⚠️ YES' : '✅ NO'}
                    </span>
                  </div>
                </div>
                
                <div className="mt-2 pt-2 border-t border-gray-600 text-xs text-gray-400">
                  AR Orbital Mechanics View
                </div>
              </div>
            </Html>
          )}

          {/* Placement indicator */}
          {!isPlaced && isPresenting && (
            <Text
              position={[0, 0.3, 0]}
              fontSize={0.04}
              color="#00ffff"
              anchorX="center"
              anchorY="middle"
            >
              Tap to place solar system
            </Text>
          )}
        </>
      )}
    </group>
  );
}

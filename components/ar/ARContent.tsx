'use client';

import { useRef, useState, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { useXR, Interactive } from '@react-three/xr';
import { Text, Html } from '@react-three/drei';
import * as THREE from 'three';
import { NASAAsteroid } from '@/types';
import ARAsteroidModel from './ARAsteroidModel';
import AREarthModel from './AREarthModel';
import AROrbitPath from './AROrbitPath';
import ARImpactZone from './ARImpactZone';

interface ARContentProps {
  asteroids: NASAAsteroid[];
  selectedAsteroid: NASAAsteroid | null;
  onAsteroidSelect?: (asteroid: NASAAsteroid) => void;
  scale: number;
  showGrid: boolean;
  showLabels: boolean;
  showOrbitPaths: boolean;
  showImpactSimulation: boolean;
}

export default function ARContent({
  asteroids,
  selectedAsteroid,
  onAsteroidSelect,
  scale,
  showGrid,
  showLabels,
  showOrbitPaths,
  showImpactSimulation,
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

  // Calculate asteroid sizes and positions
  const asteroidData = asteroids.slice(0, 5).map((asteroid, index) => {
    const size = asteroid.estimated_diameter.kilometers.estimated_diameter_max * 0.01 * scale;
    const angle = (index / asteroids.length) * Math.PI * 2;
    const radius = 0.5;
    const position: [number, number, number] = [
      Math.cos(angle) * radius,
      0.2 + index * 0.1,
      Math.sin(angle) * radius - 1.5,
    ];

    return {
      asteroid,
      size: Math.max(0.05, Math.min(size, 0.3)),
      position,
    };
  });

  return (
    <group ref={groupRef} position={placementPosition.toArray()}>
      {/* AR Grid for placement reference */}
      {showGrid && !isPlaced && (
        <Interactive onSelect={handlePlacement}>
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
            <planeGeometry args={[2, 2, 10, 10]} />
            <meshBasicMaterial
              color="#00ffff"
              wireframe
              transparent
              opacity={0.5}
            />
          </mesh>
        </Interactive>
      )}

      {/* Only show content after placement */}
      {(isPlaced || !isPresenting) && (
        <>
          {/* Central Earth Model */}
          <AREarthModel
            position={[0, 0, -1]}
            scale={0.2 * scale}
            showLabels={showLabels}
          />

          {/* Asteroids in orbit around Earth */}
          {asteroidData.map(({ asteroid, size, position }, index) => (
            <group key={asteroid.id}>
              {/* Asteroid Model */}
              <Interactive
                onSelect={() => onAsteroidSelect?.(asteroid)}
              >
                <ARAsteroidModel
                  position={position}
                  size={size}
                  asteroid={asteroid}
                  isSelected={selectedAsteroid?.id === asteroid.id}
                  showLabel={showLabels}
                />
              </Interactive>

              {/* Orbit Path */}
              {showOrbitPaths && (
                <AROrbitPath
                  centerPosition={[0, 0, -1]}
                  radius={0.5 + index * 0.1}
                  height={0.2 + index * 0.1}
                  color={selectedAsteroid?.id === asteroid.id ? '#00ff00' : '#00aaff'}
                />
              )}
            </group>
          ))}

          {/* Impact Simulation Visualization */}
          {showImpactSimulation && selectedAsteroid && (
            <ARImpactZone
              position={[0, -0.1, -1]}
              scale={0.3 * scale}
              asteroid={selectedAsteroid}
            />
          )}

          {/* Info Panel */}
          {showLabels && selectedAsteroid && (
            <Html
              position={[0, 0.5, -1]}
              center
              distanceFactor={1}
              style={{
                background: 'rgba(0, 0, 0, 0.8)',
                color: 'white',
                padding: '10px',
                borderRadius: '8px',
                fontSize: '12px',
                maxWidth: '200px',
              }}
            >
              <div>
                <h3 className="font-bold text-cyan-400 mb-1">
                  {selectedAsteroid.name}
                </h3>
                <p className="text-xs">
                  Size: {selectedAsteroid.estimated_diameter.kilometers.estimated_diameter_max.toFixed(2)} km
                </p>
                <p className="text-xs">
                  Hazardous: {selectedAsteroid.is_potentially_hazardous_asteroid ? '⚠️ Yes' : '✅ No'}
                </p>
                {selectedAsteroid.close_approach_data[0] && (
                  <p className="text-xs">
                    Velocity: {parseFloat(selectedAsteroid.close_approach_data[0].relative_velocity.kilometers_per_second).toFixed(2)} km/s
                  </p>
                )}
              </div>
            </Html>
          )}

          {/* Placement indicator */}
          {!isPlaced && isPresenting && (
            <Text
              position={[0, 0.3, 0]}
              fontSize={0.05}
              color="#00ffff"
              anchorX="center"
              anchorY="middle"
            >
              Tap to place
            </Text>
          )}
        </>
      )}
    </group>
  );
}

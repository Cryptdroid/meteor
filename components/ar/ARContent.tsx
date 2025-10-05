'use client';

import { useRef, useState, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { useXR, Interactive } from '@react-three/xr';
import { Text, Html, Line } from '@react-three/drei';
import * as THREE from 'three';
import { NASAAsteroid } from '@/types';
import ARAsteroidModel from './ARAsteroidModel';
import AREarthModel from './AREarthModel';
import WeaponSystem from './WeaponSystem';
import XRController from './XRController';


interface SpaceContentProps {
  asteroids: NASAAsteroid[];
  selectedAsteroid: NASAAsteroid | null;
  onAsteroidSelect?: (asteroid: NASAAsteroid) => void;
  scale: number;
  showGrid: boolean;
  showLabels: boolean;
  showOrbitPaths: boolean;
  showImpactSimulation?: boolean; // Not used in space orbital view
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

export default function SpaceContent({
  asteroids,
  selectedAsteroid,
  onAsteroidSelect,
  scale,
  showGrid,
  showLabels,
  showOrbitPaths,
}: SpaceContentProps) {
  const xrState = useXR();
  const isPresenting = xrState.session !== null;
  const groupRef = useRef<THREE.Group>(null);
  
  // Space positioning - no placement needed, always visible
  const spacePosition = new THREE.Vector3(0, 0, 0);
  
  // Game state
  const [score, setScore] = useState(0);
  const [meteorsDestroyed, setMeteorsDestroyed] = useState(0);
  const [destroyedMeteors, setDestroyedMeteors] = useState<Set<string>>(new Set());
  const [explosions, setExplosions] = useState<Array<{id: string, position: THREE.Vector3, time: number}>>([]);
  const [gameLevel, setGameLevel] = useState(1);
  const [health, setHealth] = useState(100);
  const [accuracy, setAccuracy] = useState(100);
  const [shotsFired, setShotsFired] = useState(0);
  const [hits, setHits] = useState(0);
  const [gameOver, setGameOver] = useState(false);

  // Game reset function
  const resetGame = () => {
    setScore(0);
    setMeteorsDestroyed(0);
    setDestroyedMeteors(new Set());
    setExplosions([]);
    setGameLevel(1);
    setHealth(100);
    setAccuracy(100);
    setShotsFired(0);
    setHits(0);
    setGameOver(false);
  };

  // Handle weapon fire with collision detection
  const handleWeaponFire = (origin: THREE.Vector3, direction: THREE.Vector3) => {
    setShotsFired(prev => prev + 1);
    let hitDetected = false;

    // Check collision with meteors
    const checkCollisions = () => {
      meteorData.forEach(({ asteroid, distance, angle, elevation, size }) => {
        if (destroyedMeteors.has(asteroid.id)) return;

        // Calculate meteor position at current time
        const time = Date.now() * 0.001;
        const dynamicAngle = angle + time * 0.1;
        
        const meteorX = distance * Math.cos(dynamicAngle) * Math.cos(elevation);
        const meteorY = distance * Math.sin(elevation) + Math.sin(time * 2) * 2;
        const meteorZ = distance * Math.sin(dynamicAngle) * Math.cos(elevation);
        
        const meteorPosition = new THREE.Vector3(meteorX, meteorY, meteorZ);
        
        // Simple raycast collision detection
        const bulletPath = new THREE.Ray(origin, direction);
        const meteorSphere = new THREE.Sphere(meteorPosition, size);
        
        if (bulletPath.intersectsSphere(meteorSphere)) {
          // Meteor hit!
          hitDetected = true;
          setHits(prev => prev + 1);
          setDestroyedMeteors(prev => new Set(Array.from(prev).concat(asteroid.id)));
          setMeteorsDestroyed(prev => prev + 1);
          
          const points = asteroid.is_potentially_hazardous_asteroid ? 100 : 50;
          setScore(prev => prev + points * gameLevel);
          
          // Add explosion effect
          const explosionId = Date.now().toString();
          setExplosions(prev => [...prev, {
            id: explosionId,
            position: meteorPosition.clone(),
            time: 0
          }]);
          
          // Remove explosion after animation
          setTimeout(() => {
            setExplosions(prev => prev.filter(exp => exp.id !== explosionId));
          }, 1000);
        }
      });
    };

    // Check collisions immediately and over the bullet's travel path
    checkCollisions();
    setTimeout(checkCollisions, 50);
    setTimeout(checkCollisions, 100);

    // Update accuracy
    setTimeout(() => {
      setAccuracy(prev => shotsFired > 0 ? Math.round((hits / shotsFired) * 100) : 100);
    }, 200);
  };

  // Handle XR controller trigger press
  const handleXRTriggerPress = (controller: THREE.Object3D) => {
    const origin = new THREE.Vector3();
    const direction = new THREE.Vector3();
    
    controller.getWorldPosition(origin);
    controller.getWorldDirection(direction);
    
    handleWeaponFire(origin, direction);
  };

  // Handle XR controller grip press (reload)
  const handleXRGripPress = (controller: THREE.Object3D) => {
    // Trigger reload action
    console.log('XR Reload triggered');
  };

  // Space environment animation and explosion updates
  useFrame((state, delta) => {
    if (groupRef.current) {
      // Gentle rotation for space effect
      groupRef.current.rotation.y += 0.001;
    }

    // Update explosion animations
    setExplosions(prev => 
      prev.map(explosion => ({
        ...explosion,
        time: explosion.time + delta
      }))
    );

    // Level progression based on meteors destroyed
    const newLevel = Math.floor(meteorsDestroyed / 5) + 1;
    if (newLevel > gameLevel) {
      setGameLevel(newLevel);
      setHealth(prev => Math.min(100, prev + 10)); // Bonus health on level up
    }

    // Reduce health over time (survival challenge)
    if (meteorsDestroyed > 0 && !gameOver) {
      setHealth(prev => {
        const newHealth = Math.max(0, prev - delta * 0.5);
        if (newHealth <= 0 && !gameOver) {
          setGameOver(true);
        }
        return newHealth;
      });
    }
  });

  // Generate single target asteroid for shooting game
  const singleAsteroid = asteroids.length > 0 ? asteroids[0] : null;
  const meteorData = singleAsteroid ? [{
    asteroid: singleAsteroid,
    distance: 8, // Fixed distance in front of player
    angle: 0, // Center position
    elevation: 0, // At eye level
    size: 0.5 * scale, // Large, visible size
    speed: 0.05, // Slow, manageable movement
    rotationSpeed: 0.01,
    threat: singleAsteroid.is_potentially_hazardous_asteroid,
  }] : [];

  return (
    <group ref={groupRef} position={spacePosition.toArray()}>
      {/* Space Grid (optional reference) */}
      {showGrid && (
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -5, 0]}>
          <planeGeometry args={[20, 20, 20, 20]} />
          <meshBasicMaterial
            color="#444499"
            wireframe
            transparent
            opacity={0.1}
          />
        </mesh>
      )}

      {/* Space Content - Always visible */}
          {/* Meteor Field Warning Light */}
          <mesh position={[0, 8, 0]}>
            <sphereGeometry args={[0.3, 16, 16]} />
            <meshStandardMaterial 
              color="#ff0000" 
              emissive="#ff4444"
              emissiveIntensity={0.5}
            />
          </mesh>
          
          {/* Warning Text */}
          {showLabels && (
            <Text
              position={[0, 9, 0]}
              fontSize={0.5}
              color="#ff4444"
              anchorX="center"
              anchorY="middle"
            >
              ⚠️ METEOR FIELD DETECTED
            </Text>
          )}

          {/* Single Target Asteroid */}
          {meteorData.map(({ asteroid, distance, angle, elevation, size, speed, rotationSpeed, threat }: any, index: number) => {
            // Skip destroyed meteors
            if (destroyedMeteors.has(asteroid.id)) return null;

            // Calculate simple floating motion for single asteroid
            const time = Date.now() * 0.001;
            
            // Position directly in front of player with gentle movement
            const x = Math.sin(time * 0.5) * 2; // Gentle side-to-side movement
            const y = Math.cos(time * 0.3) * 1; // Gentle up-down movement
            const z = -distance; // Fixed distance in front
            
            const position: [number, number, number] = [x, y, z];
            const isSelected = selectedAsteroid?.id === asteroid.id;
            const isTargeted = isSelected;

            return (
              <group key={asteroid.id}>
                {/* Enhanced Meteor Target */}
                <Interactive onSelect={() => onAsteroidSelect?.(asteroid)}>
                  <mesh 
                    position={position}
                    onClick={() => onAsteroidSelect?.(asteroid)}
                    rotation={[time * rotationSpeed, time * rotationSpeed * 0.7, time * rotationSpeed * 0.3]}
                  >
                    <sphereGeometry args={[size, 20, 20]} />
                    <meshStandardMaterial 
                      color={isTargeted ? '#00ff00' : threat ? '#ff2222' : '#888888'}
                      emissive={isTargeted ? '#004400' : threat ? '#660000' : '#000000'}
                      emissiveIntensity={isTargeted ? 0.4 : threat ? 0.3 : 0.1}
                      metalness={0.8}
                      roughness={0.3}
                    />
                  </mesh>
                </Interactive>

                {/* Meteor Danger Indicator */}
                {threat && (
                  <mesh position={[position[0], position[1] + size + 0.2, position[2]]}>
                    <sphereGeometry args={[0.05, 8, 8]} />
                    <meshBasicMaterial 
                      color="#ff0000" 
                      transparent
                      opacity={0.8}
                    />
                  </mesh>
                )}

                {/* Meteor Target Label */}
                {showLabels && isTargeted && (
                  <Text
                    position={[position[0], position[1] + size + 0.3, position[2]]}
                    fontSize={0.15}
                    color={threat ? '#ff4444' : '#00ff88'}
                    anchorX="center"
                    anchorY="middle"
                  >
                    {threat ? '🎯 HIGH VALUE TARGET' : '🎯 TARGET LOCKED'}
                  </Text>
                )}
              </group>
            );
          })}

          {/* Enhanced Space Info Panel */}
          {showLabels && selectedAsteroid && (
            <Html
              position={[6, 2, -1]}
              center
              distanceFactor={1}
              style={{
                background: 'rgba(20, 10, 60, 0.95)',
                color: 'white',
                padding: '16px',
                borderRadius: '12px',
                fontSize: '12px',
                maxWidth: '280px',
                border: '2px solid #8844ff',
                boxShadow: '0 0 20px rgba(136, 68, 255, 0.3)',
              }}
            >
              <div>
                <h3 className="font-bold text-purple-300 mb-3 text-base flex items-center gap-2">
                  🌌 {selectedAsteroid.name}
                </h3>
                
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between items-center">
                    <span className="text-purple-200">🔭 Diameter:</span>
                    <span className="text-white font-mono">{selectedAsteroid.estimated_diameter.kilometers.estimated_diameter_max.toFixed(3)} km</span>
                  </div>
                  
                  {selectedAsteroid.close_approach_data[0] && (
                    <>
                      <div className="flex justify-between items-center">
                        <span className="text-purple-200">🚀 Velocity:</span>
                        <span className="text-white font-mono">{parseFloat(selectedAsteroid.close_approach_data[0].relative_velocity.kilometers_per_second).toFixed(1)} km/s</span>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <span className="text-purple-200">📏 Distance:</span>
                        <span className="text-white font-mono">{parseFloat(selectedAsteroid.close_approach_data[0].miss_distance.astronomical).toFixed(4)} AU</span>
                      </div>
                    </>
                  )}
                  
                  <div className="flex justify-between items-center">
                    <span className="text-purple-200">⚠️ Threat Level:</span>
                    <span className={selectedAsteroid.is_potentially_hazardous_asteroid ? 'text-red-400 font-bold' : 'text-green-400 font-bold'}>
                      {selectedAsteroid.is_potentially_hazardous_asteroid ? '🔴 HIGH RISK' : '🟢 SAFE'}
                    </span>
                  </div>
                </div>
                
                <div className="mt-3 pt-3 border-t border-purple-600 text-xs text-purple-300">
                  🌌 Space XR Orbital Mechanics
                </div>
              </div>
            </Html>
          )}

          {/* Space Environment Status */}
          {isPresenting && (
            <Text
              position={[0, 8, 0]}
              fontSize={0.5}
              color="#8888ff"
              anchorX="center"
              anchorY="middle"
            >
              🌌 Space XR Mode Active
            </Text>
          )}

          {/* Weapon System */}
          <WeaponSystem 
            onFire={handleWeaponFire}
            isXRMode={isPresenting}
          />

          {/* XR Controllers */}
          {isPresenting && (
            <XRController 
              onTriggerPress={handleXRTriggerPress}
              onGripPress={handleXRGripPress}
            />
          )}

          {/* Explosion Effects */}
          {explosions.map(explosion => (
            <group key={explosion.id}>
              {/* Main explosion sphere */}
              <mesh position={explosion.position}>
                <sphereGeometry args={[0.5, 8, 8]} />
                <meshBasicMaterial 
                  color="#ff4400" 
                  transparent 
                  opacity={Math.max(0, 1 - explosion.time * 2)}
                />
              </mesh>
              
              {/* Outer explosion ring */}
              <mesh position={explosion.position}>
                <sphereGeometry args={[1.0, 8, 8]} />
                <meshBasicMaterial 
                  color="#ffaa00" 
                  transparent 
                  opacity={Math.max(0, 0.5 - explosion.time * 1.5)}
                />
              </mesh>
              
              {/* Particle sparks */}
              {[...Array(8)].map((_, i) => (
                <mesh 
                  key={i}
                  position={[
                    explosion.position.x + Math.cos(i * Math.PI / 4) * explosion.time * 2,
                    explosion.position.y + Math.sin(i * Math.PI / 4) * explosion.time * 2,
                    explosion.position.z + (Math.random() - 0.5) * explosion.time * 2
                  ]}
                >
                  <sphereGeometry args={[0.05, 4, 4]} />
                  <meshBasicMaterial 
                    color="#ffff00" 
                    transparent 
                    opacity={Math.max(0, 0.8 - explosion.time * 3)}
                  />
                </mesh>
              ))}
            </group>
          ))}

          {/* Game UI */}
          {!gameOver ? (
            <Html
              position={[-8, 6, 0]}
              center
              distanceFactor={1}
              style={{
                background: 'rgba(0, 0, 0, 0.9)',
                color: '#00ff00',
                padding: '20px',
                borderRadius: '12px',
                fontSize: '14px',
                fontFamily: 'monospace',
                border: '2px solid #00ff00',
                boxShadow: '0 0 20px rgba(0, 255, 0, 0.3)',
                minWidth: '250px',
              }}
            >
              <div>
                <div style={{ 
                  marginBottom: '12px', 
                  textAlign: 'center',
                  fontSize: '16px',
                  color: '#ffff00'
                }}>
                  <strong>🎯 METEOR SHOOTER</strong>
                </div>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '12px' }}>
                  <div>Score: <span style={{ color: '#ffff00' }}>{score}</span></div>
                  <div>Level: <span style={{ color: '#ff8800' }}>{gameLevel}</span></div>
                  <div>Destroyed: <span style={{ color: '#ff4444' }}>{meteorsDestroyed}</span></div>
                  <div>Accuracy: <span style={{ color: accuracy > 70 ? '#00ff00' : accuracy > 40 ? '#ffff00' : '#ff4444' }}>{accuracy}%</span></div>
                </div>

                {/* Health Bar */}
                <div style={{ marginBottom: '12px' }}>
                  <div style={{ fontSize: '12px', marginBottom: '4px' }}>Health:</div>
                  <div style={{ 
                    width: '100%', 
                    height: '8px', 
                    background: '#333333', 
                    borderRadius: '4px',
                    overflow: 'hidden'
                  }}>
                    <div style={{ 
                      width: `${health}%`, 
                      height: '100%', 
                      background: health > 60 ? '#00ff00' : health > 30 ? '#ffff00' : '#ff4444',
                      transition: 'all 0.3s ease'
                    }} />
                  </div>
                </div>

                {/* Game Over Warning */}
                {health <= 20 && (
                  <div style={{ 
                    color: '#ff0000', 
                    fontSize: '12px', 
                    textAlign: 'center',
                    animation: 'blink 1s infinite'
                  }}>
                    ⚠️ CRITICAL HEALTH ⚠️
                  </div>
                )}

                <div style={{ marginTop: '12px', fontSize: '11px', color: '#88ff88', textAlign: 'center' }}>
                  🖱️ Click: Shoot | ⌨️ R: Reload<br/>
                  🥽 XR: Trigger to Fire
                </div>
              </div>
            </Html>
          ) : (
            /* Game Over Screen */
            <Html
              position={[0, 2, 0]}
              center
              distanceFactor={1}
              style={{
                background: 'rgba(0, 0, 0, 0.95)',
                color: '#ff0000',
                padding: '30px',
                borderRadius: '20px',
                fontSize: '18px',
                fontFamily: 'monospace',
                border: '3px solid #ff0000',
                boxShadow: '0 0 30px rgba(255, 0, 0, 0.5)',
                textAlign: 'center',
                minWidth: '400px',
              }}
            >
              <div>
                <div style={{ 
                  fontSize: '32px', 
                  marginBottom: '20px',
                  color: '#ff4444'
                }}>
                  💀 GAME OVER 💀
                </div>
                
                <div style={{ marginBottom: '20px', color: '#ffffff' }}>
                  <div style={{ marginBottom: '10px' }}>
                    Final Score: <span style={{ color: '#ffff00', fontSize: '24px' }}>{score}</span>
                  </div>
                  <div>Level Reached: <span style={{ color: '#ff8800' }}>{gameLevel}</span></div>
                  <div>Meteors Destroyed: <span style={{ color: '#ff4444' }}>{meteorsDestroyed}</span></div>
                  <div>Final Accuracy: <span style={{ color: '#88ff88' }}>{accuracy}%</span></div>
                </div>

                <button
                  onClick={resetGame}
                  style={{
                    background: '#00ff00',
                    color: '#000000',
                    border: 'none',
                    padding: '12px 24px',
                    borderRadius: '8px',
                    fontSize: '16px',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    fontFamily: 'monospace'
                  }}
                >
                  🔄 PLAY AGAIN
                </button>
              </div>
            </Html>
          )}
    </group>
  );
}

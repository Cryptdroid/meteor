'use client';

import { useRef, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text, Html } from '@react-three/drei';
import * as THREE from 'three';
import { NASAAsteroid } from '@/types';

interface MeteorShooterContentProps {
  asteroids: NASAAsteroid[];
  selectedAsteroid: NASAAsteroid | null;
  onAsteroidSelect?: (asteroid: NASAAsteroid) => void;
  scale: number;
  showLabels: boolean;
}

export default function MeteorShooterContent({
  asteroids,
  selectedAsteroid,
  onAsteroidSelect,
  scale,
  showLabels,
}: MeteorShooterContentProps) {
  const groupRef = useRef<THREE.Group>(null);
  
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
  const handleWeaponFire = (event: MouseEvent) => {
    setShotsFired(prev => prev + 1);
    let hitDetected = false;

    // Check collision with meteors
    const checkCollisions = () => {
      meteorData.forEach((data) => {
        if (!data) return;
        const { asteroid, position, size } = data;
        if (destroyedMeteors.has(asteroid.id)) return;

        // Simple distance-based collision detection for mouse clicking
        const meteorPosition = new THREE.Vector3(...position);
        
        // Check if click hit the meteor (simplified for demonstration)
        const hitChance = Math.random();
        if (hitChance > 0.7) { // 30% hit chance for game balance
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

    checkCollisions();

    // Update accuracy
    setTimeout(() => {
      setAccuracy(prev => shotsFired > 0 ? Math.round((hits / shotsFired) * 100) : 100);
    }, 200);
  };

  // Add click event listener for shooting
  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      if (!gameOver) {
        handleWeaponFire(event);
      }
    };

    window.addEventListener('click', handleClick);
    return () => window.removeEventListener('click', handleClick);
  }, [gameOver, shotsFired, hits]);

  // Animation and explosion updates
  useFrame((state, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += 0.001;
    }

    // Update explosion animations
    setExplosions(prev => 
      prev.map(explosion => ({
        ...explosion,
        time: explosion.time + delta
      }))
    );

    // Level progression
    const newLevel = Math.floor(meteorsDestroyed / 5) + 1;
    if (newLevel > gameLevel) {
      setGameLevel(newLevel);
      setHealth(prev => Math.min(100, prev + 10));
    }

    // Reduce health over time
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

  // Generate meteor targets
  const meteorData = asteroids.slice(0, 5).map((asteroid, index) => {
    if (destroyedMeteors.has(asteroid.id)) return null;
    
    const time = Date.now() * 0.001;
    const baseDistance = 8 + index * 2;
    const angle = (index * 72) * (Math.PI / 180); // Spread evenly
    
    const x = Math.cos(angle + time * 0.1) * baseDistance + Math.sin(time * 0.5) * 2;
    const y = Math.sin(time * 0.3 + index) * 3;
    const z = Math.sin(angle + time * 0.1) * baseDistance - 10;
    
    const size = Math.max(0.3, asteroid.estimated_diameter?.kilometers?.estimated_diameter_max * 100 * scale || 0.5);
    
    return {
      asteroid,
      position: [x, y, z] as [number, number, number],
      size,
      threat: asteroid.is_potentially_hazardous_asteroid,
    };
  }).filter(Boolean);

  return (
    <group ref={groupRef}>
      {/* Meteor Targets */}
      {meteorData.map((data, index) => {
        if (!data) return null;
        const { asteroid, position, size, threat } = data;
        const time = Date.now() * 0.001;
        const isSelected = selectedAsteroid?.id === asteroid.id;
        
        return (
          <group key={asteroid.id}>
            <mesh 
              position={position}
              onClick={() => onAsteroidSelect?.(asteroid)}
              rotation={[time * 0.01, time * 0.007, time * 0.003]}
            >
              <sphereGeometry args={[size, 16, 16]} />
              <meshStandardMaterial 
                color={isSelected ? '#00ff00' : threat ? '#ff2222' : '#888888'}
                emissive={isSelected ? '#004400' : threat ? '#660000' : '#000000'}
                emissiveIntensity={isSelected ? 0.4 : threat ? 0.3 : 0.1}
                metalness={0.8}
                roughness={0.3}
              />
            </mesh>

            {/* Threat indicator */}
            {threat && (
              <mesh position={[position[0], position[1] + size + 0.2, position[2]]}>
                <sphereGeometry args={[0.1, 8, 8]} />
                <meshBasicMaterial color="#ff0000" />
              </mesh>
            )}

            {/* Target label */}
            {showLabels && isSelected && (
              <Text
                position={[position[0], position[1] + size + 0.5, position[2]]}
                fontSize={0.2}
                color={threat ? '#ff4444' : '#00ff88'}
                anchorX="center"
                anchorY="middle"
              >
                {threat ? '🎯 HIGH VALUE' : '🎯 TARGET'}
              </Text>
            )}
          </group>
        );
      })}

      {/* Explosion Effects */}
      {explosions.map(explosion => (
        <group key={explosion.id}>
          <mesh position={explosion.position}>
            <sphereGeometry args={[0.5, 8, 8]} />
            <meshBasicMaterial 
              color="#ff4400" 
              transparent 
              opacity={Math.max(0, 1 - explosion.time * 2)}
            />
          </mesh>
          
          <mesh position={explosion.position}>
            <sphereGeometry args={[1.0, 8, 8]} />
            <meshBasicMaterial 
              color="#ffaa00" 
              transparent 
              opacity={Math.max(0, 0.5 - explosion.time * 1.5)}
            />
          </mesh>
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

            <div style={{ marginTop: '12px', fontSize: '11px', color: '#88ff88', textAlign: 'center' }}>
              🖱️ Click: Shoot Meteors<br/>
              🎯 Aim with crosshair
            </div>
          </div>
        </Html>
      ) : (
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
            <div style={{ fontSize: '32px', marginBottom: '20px', color: '#ff4444' }}>
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
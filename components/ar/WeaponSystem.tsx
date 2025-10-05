'use client';

import { useRef, useState, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { useXR } from '@react-three/xr';
import * as THREE from 'three';

interface WeaponSystemProps {
  onFire: (origin: THREE.Vector3, direction: THREE.Vector3) => void;
  isXRMode: boolean;
}

interface Bullet {
  id: string;
  position: THREE.Vector3;
  direction: THREE.Vector3;
  speed: number;
  life: number;
}

export default function WeaponSystem({ onFire, isXRMode }: WeaponSystemProps) {
  const gunRef = useRef<THREE.Group>(null);
  const muzzleFlashRef = useRef<THREE.Mesh>(null);
  const [bullets, setBullets] = useState<Bullet[]>([]);
  const [isReloading, setIsReloading] = useState(false);
  const [ammo, setAmmo] = useState(30);
  const [showMuzzleFlash, setShowMuzzleFlash] = useState(false);
  
  const { camera } = useThree();
  const xrState = useXR();

  // Handle firing
  const handleFire = () => {
    if (ammo <= 0 || isReloading) return;

    const gunPosition = new THREE.Vector3();
    const gunDirection = new THREE.Vector3();

    // Always shoot from camera position for now (we'll enhance XR later)
    camera.getWorldPosition(gunPosition);
    camera.getWorldDirection(gunDirection);
    
    // Offset slightly to the right for gun position
    const rightVector = new THREE.Vector3();
    camera.getWorldDirection(rightVector);
    rightVector.cross(camera.up).normalize();
    gunPosition.add(rightVector.multiplyScalar(0.3));

    // Create enhanced visible bullet
    const bulletId = Date.now().toString();
    const newBullet: Bullet = {
      id: bulletId,
      position: gunPosition.clone(),
      direction: gunDirection.clone().normalize(),
      speed: 25, // Slower so they're more visible
      life: 5.0 // Longer life for visibility
    };

    setBullets(prev => [...prev, newBullet]);
    setAmmo(prev => prev - 1);
    
    // Trigger muzzle flash
    setShowMuzzleFlash(true);
    setTimeout(() => setShowMuzzleFlash(false), 100);
    
    // Call parent fire handler
    onFire(gunPosition, gunDirection);
  };

  // Handle reload
  const handleReload = () => {
    if (isReloading || ammo >= 30) return;
    setIsReloading(true);
    setTimeout(() => {
      setAmmo(30);
      setIsReloading(false);
    }, 2000);
  };

  // Update bullets each frame
  useFrame((state, delta) => {
    setBullets(prevBullets => {
      return prevBullets
        .map(bullet => ({
          ...bullet,
          position: bullet.position.clone().add(
            bullet.direction.clone().multiplyScalar(bullet.speed * delta)
          ),
          life: bullet.life - delta
        }))
        .filter(bullet => bullet.life > 0);
    });

    // Update gun position for non-XR mode
    if (!isXRMode && gunRef.current) {
      // Position gun in bottom-right corner of screen
      gunRef.current.position.set(1.5, -1.2, -2);
      gunRef.current.rotation.set(0, 0.3, 0);
    }
  });

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      switch (event.code) {
        case 'Space':
        case 'LeftClick':
          event.preventDefault();
          handleFire();
          break;
        case 'KeyR':
          event.preventDefault();
          handleReload();
          break;
      }
    };

    const handleMouseDown = (event: MouseEvent) => {
      if (event.button === 0) { // Left click
        event.preventDefault();
        handleFire();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('mousedown', handleMouseDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('mousedown', handleMouseDown);
    };
  }, [ammo, isReloading]);

  return (
    <group>
      {/* Enhanced 3D Gun Model */}
      <group ref={gunRef}>
        {/* Main Gun Body */}
        <mesh position={[0.3, -0.2, -0.5]} rotation={[0, 0, 0]}>
          <boxGeometry args={[0.25, 0.12, 0.8]} />
          <meshStandardMaterial 
            color="#2a2a2a" 
            metalness={0.9} 
            roughness={0.1}
          />
        </mesh>
        
        {/* Gun Barrel */}
        <mesh position={[0.3, -0.15, -0.95]} rotation={[Math.PI/2, 0, 0]}>
          <cylinderGeometry args={[0.025, 0.035, 0.4, 16]} />
          <meshStandardMaterial 
            color="#1a1a1a" 
            metalness={1.0} 
            roughness={0.05}
          />
        </mesh>
        
        {/* Barrel Tip */}
        <mesh position={[0.3, -0.15, -1.15]} rotation={[Math.PI/2, 0, 0]}>
          <cylinderGeometry args={[0.035, 0.04, 0.08, 8]} />
          <meshStandardMaterial 
            color="#0a0a0a" 
            metalness={0.8} 
            roughness={0.2}
          />
        </mesh>
        
        {/* Gun Grip */}
        <mesh position={[0.3, -0.35, -0.3]} rotation={[0.2, 0, 0]}>
          <boxGeometry args={[0.08, 0.18, 0.12]} />
          <meshStandardMaterial 
            color="#1a1a1a" 
            metalness={0.4} 
            roughness={0.9}
          />
        </mesh>
        
        {/* Trigger Guard */}
        <mesh position={[0.3, -0.28, -0.4]}>
          <torusGeometry args={[0.05, 0.01, 8, 16]} />
          <meshStandardMaterial 
            color="#333333" 
            metalness={0.8} 
            roughness={0.3}
          />
        </mesh>
        
        {/* Sight/Scope */}
        <mesh position={[0.3, -0.08, -0.5]} rotation={[Math.PI/2, 0, 0]}>
          <cylinderGeometry args={[0.02, 0.02, 0.3, 8]} />
          <meshStandardMaterial 
            color="#444444" 
            metalness={0.9} 
            roughness={0.1}
          />
        </mesh>
        
        {/* Scope Lens */}
        <mesh position={[0.3, -0.08, -0.35]}>
          <sphereGeometry args={[0.025, 8, 8]} />
          <meshStandardMaterial 
            color="#001122" 
            metalness={0.1} 
            roughness={0.0}
            transparent
            opacity={0.8}
          />
        </mesh>
        
        {/* Side Rails */}
        <mesh position={[0.25, -0.12, -0.5]}>
          <boxGeometry args={[0.02, 0.03, 0.6]} />
          <meshStandardMaterial 
            color="#222222" 
            metalness={0.7} 
            roughness={0.4}
          />
        </mesh>
        <mesh position={[0.35, -0.12, -0.5]}>
          <boxGeometry args={[0.02, 0.03, 0.6]} />
          <meshStandardMaterial 
            color="#222222" 
            metalness={0.7} 
            roughness={0.4}
          />
        </mesh>
        
        {/* Energy Core */}
        <mesh position={[0.3, -0.18, -0.2]}>
          <sphereGeometry args={[0.03, 12, 12]} />
          <meshStandardMaterial 
            color="#00aaff" 
            emissive="#004488"
            emissiveIntensity={0.6}
          />
        </mesh>
        
        {/* Enhanced Muzzle Flash */}
        {showMuzzleFlash && (
          <group>
            <mesh ref={muzzleFlashRef} position={[0.3, -0.15, -1.2]}>
              <sphereGeometry args={[0.15, 8, 8]} />
              <meshBasicMaterial 
                color="#ffff00" 
                transparent 
                opacity={0.9}
              />
            </mesh>
            <mesh position={[0.3, -0.15, -1.3]}>
              <sphereGeometry args={[0.08, 6, 6]} />
              <meshBasicMaterial 
                color="#ffffff" 
                transparent 
                opacity={0.7}
              />
            </mesh>
          </group>
        )}
        
        {/* 3D Crosshair for XR */}
        {isXRMode && (
          <group position={[0.3, -0.15, -5]}>
            {/* Horizontal line */}
            <mesh>
              <boxGeometry args={[0.2, 0.01, 0.01]} />
              <meshBasicMaterial color="#ff0000" transparent opacity={0.8} />
            </mesh>
            {/* Vertical line */}
            <mesh>
              <boxGeometry args={[0.01, 0.2, 0.01]} />
              <meshBasicMaterial color="#ff0000" transparent opacity={0.8} />
            </mesh>
            {/* Center dot */}
            <mesh>
              <sphereGeometry args={[0.02, 8, 8]} />
              <meshBasicMaterial color="#ff4444" />
            </mesh>
          </group>
        )}
      </group>

      {/* Enhanced Visible Bullets */}
      {bullets.map(bullet => (
        <group key={bullet.id}>
          {/* Main bullet */}
          <mesh position={bullet.position}>
            <sphereGeometry args={[0.05, 8, 8]} />
            <meshStandardMaterial 
              color="#00ffff" 
              emissive="#00aaff"
              emissiveIntensity={1.0}
              metalness={0.8}
              roughness={0.2}
            />
          </mesh>
          
          {/* Bullet trail/glow */}
          <mesh position={bullet.position}>
            <sphereGeometry args={[0.1, 6, 6]} />
            <meshBasicMaterial 
              color="#00ffff" 
              transparent 
              opacity={0.4}
            />
          </mesh>
          
          {/* Bullet streaks */}
          <mesh position={bullet.position} rotation={[0, 0, Date.now() * 0.01]}>
            <cylinderGeometry args={[0.001, 0.001, 0.3, 4]} />
            <meshBasicMaterial 
              color="#ffffff" 
              transparent 
              opacity={0.8}
            />
          </mesh>
        </group>
      ))}
    </group>
  );
}
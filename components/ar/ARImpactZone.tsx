'use client';

import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { NASAAsteroid } from '@/types';

interface ARImpactZoneProps {
  position: [number, number, number];
  scale: number;
  asteroid: NASAAsteroid;
}

export default function ARImpactZone({
  position,
  scale,
  asteroid,
}: ARImpactZoneProps) {
  const impactRef = useRef<THREE.Mesh>(null);
  const shockwaveRef = useRef<THREE.Mesh>(null);

  // Calculate impact radius based on asteroid size
  const impactRadius = useMemo(() => {
    const size = asteroid.estimated_diameter.kilometers.estimated_diameter_max;
    // Simplified crater scaling: roughly 20x the asteroid diameter
    return Math.min(size * 0.02 * scale, 0.5);
  }, [asteroid, scale]);

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    
    // Animate shockwave
    if (shockwaveRef.current) {
      const pulseScale = 1 + Math.sin(time * 2) * 0.2;
      shockwaveRef.current.scale.set(pulseScale, 1, pulseScale);
      
      // Fade effect
      const material = shockwaveRef.current.material as THREE.MeshBasicMaterial;
      material.opacity = 0.3 + Math.sin(time * 2) * 0.2;
    }

    // Rotate impact crater
    if (impactRef.current) {
      impactRef.current.rotation.z += 0.01;
    }
  });

  return (
    <group position={position}>
      {/* Impact crater visualization */}
      <mesh
        ref={impactRef}
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0.01, 0]}
      >
        <circleGeometry args={[impactRadius, 32]} />
        <meshStandardMaterial
          color="#ff4444"
          transparent
          opacity={0.5}
          emissive="#ff0000"
          emissiveIntensity={0.5}
        />
      </mesh>

      {/* Shockwave rings */}
      <mesh
        ref={shockwaveRef}
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0.02, 0]}
      >
        <ringGeometry args={[impactRadius * 1.2, impactRadius * 1.5, 32]} />
        <meshBasicMaterial
          color="#ff8800"
          transparent
          opacity={0.4}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Secondary shockwave */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0.03, 0]}
      >
        <ringGeometry args={[impactRadius * 1.6, impactRadius * 2, 32]} />
        <meshBasicMaterial
          color="#ffaa00"
          transparent
          opacity={0.2}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Impact point marker */}
      <mesh position={[0, 0.05, 0]}>
        <sphereGeometry args={[0.02, 16, 16]} />
        <meshStandardMaterial
          color="#ffffff"
          emissive="#ffff00"
          emissiveIntensity={1}
        />
      </mesh>

      {/* Damage zone indicator (thermal radiation) */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0.005, 0]}
      >
        <circleGeometry args={[impactRadius * 3, 32]} />
        <meshBasicMaterial
          color="#ffff00"
          transparent
          opacity={0.1}
          side={THREE.DoubleSide}
        />
      </mesh>
    </group>
  );
}

'use client';

import { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Interactive } from '@react-three/xr';
import { Text, Sphere } from '@react-three/drei';
import * as THREE from 'three';
import { NASAAsteroid } from '@/types';

interface ARAsteroidModelProps {
  position: [number, number, number];
  size: number;
  asteroid: NASAAsteroid;
  isSelected: boolean;
  showLabel: boolean;
}

export default function ARAsteroidModel({
  position,
  size,
  asteroid,
  isSelected,
  showLabel,
}: ARAsteroidModelProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);

  useFrame((state, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.x += delta * 0.5;
      meshRef.current.rotation.y += delta * 0.3;
    }
  });

  const color = asteroid.is_potentially_hazardous_asteroid
    ? '#ff4444'
    : isSelected
    ? '#00ff00'
    : hovered
    ? '#ffaa00'
    : '#8B7355';

  return (
    <group position={position}>
      {/* Main asteroid body */}
      <Sphere
        ref={meshRef}
        args={[size, 12, 12]}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        <meshStandardMaterial
          color={color}
          roughness={0.9}
          metalness={0.1}
          emissive={isSelected ? '#00ff00' : '#000000'}
          emissiveIntensity={isSelected ? 0.5 : 0}
        />
      </Sphere>

      {/* Glow effect for selected/hazardous asteroids */}
      {(isSelected || asteroid.is_potentially_hazardous_asteroid) && (
        <Sphere args={[size * 1.3, 12, 12]}>
          <meshBasicMaterial
            color={isSelected ? '#00ff00' : '#ff4444'}
            transparent
            opacity={0.2}
            side={THREE.BackSide}
          />
        </Sphere>
      )}

      {/* Label */}
      {showLabel && (
        <Text
          position={[0, size + 0.05, 0]}
          fontSize={0.03}
          color={color}
          anchorX="center"
          anchorY="bottom"
          outlineWidth={0.002}
          outlineColor="#000000"
        >
          {asteroid.name.replace(/[()]/g, '')}
        </Text>
      )}

      {/* Hazard indicator */}
      {asteroid.is_potentially_hazardous_asteroid && (
        <Text
          position={[0, size + 0.08, 0]}
          fontSize={0.025}
          color="#ff4444"
          anchorX="center"
          anchorY="bottom"
        >
          ⚠
        </Text>
      )}
    </group>
  );
}

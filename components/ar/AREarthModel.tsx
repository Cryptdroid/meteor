'use client';

import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Sphere, Text } from '@react-three/drei';
import * as THREE from 'three';

interface AREarthModelProps {
  position: [number, number, number];
  scale: number;
  showLabels: boolean;
}

export default function AREarthModel({
  position,
  scale,
  showLabels,
}: AREarthModelProps) {
  const earthRef = useRef<THREE.Mesh>(null);
  const cloudsRef = useRef<THREE.Mesh>(null);

  // Load textures with fallback colors
  const earthTexture = useMemo(() => {
    const loader = new THREE.TextureLoader();
    return loader.load(
      '/assets/Gaia_EDR3_darkened.png',
      undefined,
      undefined,
      () => console.log('AR: Using fallback Earth material')
    );
  }, []);

  const cloudTexture = useMemo(() => {
    const loader = new THREE.TextureLoader();
    return loader.load('/assets/Clouds.png');
  }, []);

  useFrame((state, delta) => {
    if (earthRef.current) {
      earthRef.current.rotation.y += delta * 0.1;
    }
    if (cloudsRef.current) {
      cloudsRef.current.rotation.y += delta * 0.12;
    }
  });

  return (
    <group position={position} scale={scale}>
      {/* Earth sphere */}
      <Sphere ref={earthRef} args={[1, 32, 32]}>
        <meshStandardMaterial
          map={earthTexture}
          color="#2277ff"
          roughness={0.8}
          metalness={0.2}
        />
      </Sphere>

      {/* Cloud layer */}
      <Sphere ref={cloudsRef} args={[1.02, 32, 32]}>
        <meshStandardMaterial
          alphaMap={cloudTexture}
          transparent
          opacity={0.4}
          color="#ffffff"
          depthWrite={false}
        />
      </Sphere>

      {/* Atmosphere glow */}
      <Sphere args={[1.1, 24, 24]}>
        <meshBasicMaterial
          color="#88ccff"
          transparent
          opacity={0.15}
          side={THREE.BackSide}
        />
      </Sphere>

      {/* Label */}
      {showLabels && (
        <Text
          position={[0, 1.3, 0]}
          fontSize={0.06}
          color="#00aaff"
          anchorX="center"
          anchorY="middle"
          outlineWidth={0.003}
          outlineColor="#000000"
        >
          Earth
        </Text>
      )}

      {/* Axis helper for orientation */}
      <axesHelper args={[1.5]} />
    </group>
  );
}

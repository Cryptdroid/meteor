'use client';

import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Stars, PerspectiveCamera, Environment } from '@react-three/drei';
import AsteroidField from './AsteroidField';
import EarthModel from './EarthModel';
// import SolarSystemScene from './solar-system/SolarSystemScene';
import { Suspense, useRef } from 'react';
import * as THREE from 'three';

// Tutorial: Enable color management
THREE.ColorManagement.enabled = true;

function Sun() {
  const sunRef = useRef<THREE.Mesh>(null);
  const glowRef = useRef<THREE.Mesh>(null);
  const raysRef = useRef<THREE.Mesh>(null);

  // Add rotation animation to sun rays
  useFrame((state) => {
    if (raysRef.current) {
      raysRef.current.rotation.z += 0.005;
    }
  });

  return (
    <group position={[150, 80, -100]}>
      {/* Core sun sphere - very bright */}
      <mesh ref={sunRef}>
        <sphereGeometry args={[20, 64, 64]} />
        <meshBasicMaterial 
          color="#FFFF00" 
          toneMapped={false}
        />
      </mesh>

      {/* First bright glow layer */}
      <mesh ref={glowRef}>
        <sphereGeometry args={[25, 64, 64]} />
        <meshBasicMaterial
          color="#FFD700"
          transparent
          opacity={0.8}
          side={THREE.BackSide}
          blending={THREE.AdditiveBlending}
          toneMapped={false}
        />
      </mesh>

      {/* Second glow layer */}
      <mesh>
        <sphereGeometry args={[32, 64, 64]} />
        <meshBasicMaterial
          color="#FFA500"
          transparent
          opacity={0.6}
          side={THREE.BackSide}
          blending={THREE.AdditiveBlending}
          toneMapped={false}
        />
      </mesh>

      {/* Third outer corona */}
      <mesh>
        <sphereGeometry args={[45, 64, 64]} />
        <meshBasicMaterial
          color="#FFE4B5"
          transparent
          opacity={0.4}
          side={THREE.BackSide}
          blending={THREE.AdditiveBlending}
          toneMapped={false}
        />
      </mesh>

      {/* Largest glow sphere */}
      <mesh>
        <sphereGeometry args={[65, 64, 64]} />
        <meshBasicMaterial
          color="#FFF5E1"
          transparent
          opacity={0.15}
          side={THREE.BackSide}
          blending={THREE.AdditiveBlending}
          toneMapped={false}
        />
      </mesh>

      {/* Radial sun rays - more prominent */}
      {Array.from({ length: 16 }).map((_, i) => {
        const angle = (i / 16) * Math.PI * 2;
        const length = 80;
        const offsetDistance = 25;
        return (
          <mesh
            key={i}
            position={[Math.cos(angle) * offsetDistance, Math.sin(angle) * offsetDistance, 0]}
            rotation={[0, 0, angle]}
          >
            <planeGeometry args={[8, length]} />
            <meshBasicMaterial
              color="#FFD700"
              transparent
              opacity={0.5}
              side={THREE.DoubleSide}
              blending={THREE.AdditiveBlending}
              toneMapped={false}
            />
          </mesh>
        );
      })}

      {/* Additional shorter rays between main rays */}
      {Array.from({ length: 16 }).map((_, i) => {
        const angle = (i / 16) * Math.PI * 2 + Math.PI / 16;
        const length = 50;
        const offsetDistance = 25;
        return (
          <mesh
            key={`short-${i}`}
            position={[Math.cos(angle) * offsetDistance, Math.sin(angle) * offsetDistance, 0]}
            rotation={[0, 0, angle]}
          >
            <planeGeometry args={[4, length]} />
            <meshBasicMaterial
              color="#FFA500"
              transparent
              opacity={0.35}
              side={THREE.DoubleSide}
              blending={THREE.AdditiveBlending}
              toneMapped={false}
            />
          </mesh>
        );
      })}

      {/* Rotating glow disk */}
      <mesh ref={raysRef} rotation={[0, 0, 0]}>
        <circleGeometry args={[90, 64]} />
        <meshBasicMaterial
          color="#FFA500"
          transparent
          opacity={0.2}
          side={THREE.DoubleSide}
          blending={THREE.AdditiveBlending}
          toneMapped={false}
        />
      </mesh>

      {/* Multiple point lights for radiance - reduced intensity */}
      <pointLight color="#FFFF00" intensity={2} distance={400} decay={2} />
      <pointLight color="#FFA500" intensity={1} distance={350} decay={2.2} />
      <pointLight color="#FFD700" intensity={0.5} distance={300} decay={2.5} />
    </group>
  );
}

export default function LandingScene() {
  return (
    <div className="absolute inset-0 w-full h-full">
      <Canvas gl={{ antialias: true, alpha: false, outputColorSpace: THREE.SRGBColorSpace }}>
        <PerspectiveCamera makeDefault position={[0, 0, 30]} fov={45} />
        <OrbitControls
          enableZoom={true}
          enablePan={false}
          enableDamping
          dampingFactor={0.05}
          minDistance={15}
          maxDistance={50}
          autoRotate
          autoRotateSpeed={0.3}
        />

        {/* Lighting - Tutorial approach - Reduced for better texture visibility */}
        <ambientLight intensity={0.3} />
        <directionalLight 
          position={[-50, 0, 30]} 
          intensity={1.2} 
          color="#ffffff"
        />
        
        {/* Background */}
        <Stars
          radius={300}
          depth={60}
          count={7000}
          factor={7}
          saturation={0}
          fade
          speed={1}
        />
        
        {/* Fog for depth */}
        <fog attach="fog" args={['#000000', 50, 150]} />

        {/* Main Earth */}
        <Suspense fallback={null}>
          <group position={[0, 0, 0]}>
            <EarthModel />
          </group>

          {/* Sun with rays */}
          <Sun />

          {/* Asteroid Field */}
          <AsteroidField count={80} />
        </Suspense>

        {/* Environment map for reflections */}
        <Environment preset="night" />
      </Canvas>
    </div>
  );
}


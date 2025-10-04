'use client';

import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera } from '@react-three/drei';
import { useAppStore } from '@/store/useAppStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Suspense, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';

// Optimized Simple Earth Component
function SimpleEarth({ position }: { position: [number, number, number] }) {
  const earthRef = useRef<THREE.Mesh>(null);
  const cloudsRef = useRef<THREE.Mesh>(null);

  useFrame((state, delta) => {
    if (earthRef.current) earthRef.current.rotation.y += delta * 0.05;
    if (cloudsRef.current) cloudsRef.current.rotation.y += delta * 0.06;
  });

  return (
    <group position={position}>
      {/* Earth - Low poly */}
      <mesh ref={earthRef}>
        <sphereGeometry args={[10, 24, 24]} />
        <meshStandardMaterial
          color="#1e4d8b"
          emissive="#0a1f3d"
          emissiveIntensity={0.2}
          roughness={0.9}
        />
      </mesh>

      {/* Green continents as detail */}
      <mesh ref={cloudsRef}>
        <sphereGeometry args={[10.05, 16, 16]} />
        <meshStandardMaterial
          color="#2d5a3d"
          transparent
          opacity={0.4}
          roughness={0.8}
        />
      </mesh>

      {/* Atmosphere glow */}
      <mesh>
        <sphereGeometry args={[11, 16, 16]} />
        <meshBasicMaterial
          color="#4d9fff"
          transparent
          opacity={0.15}
          side={THREE.BackSide}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {/* Orbit ring */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[99, 100, 32]} />
        <meshBasicMaterial
          color="#00ff9f"
          transparent
          opacity={0.3}
          side={THREE.DoubleSide}
        />
      </mesh>
    </group>
  );
}

// Optimized Simple Asteroid Component
function SimpleAsteroid({ position, size = 2 }: { position: [number, number, number]; size?: number }) {
  const asteroidRef = useRef<THREE.Mesh>(null);

  useFrame(() => {
    if (asteroidRef.current) {
      asteroidRef.current.rotation.x += 0.01;
      asteroidRef.current.rotation.y += 0.005;
    }
  });

  return (
    <group position={position}>
      {/* Asteroid body - Very low poly */}
      <mesh ref={asteroidRef}>
        <dodecahedronGeometry args={[size, 0]} />
        <meshStandardMaterial
          color="#8B7355"
          roughness={0.95}
          metalness={0.05}
        />
      </mesh>

      {/* Subtle glow */}
      <mesh>
        <sphereGeometry args={[size * 1.15, 8, 8]} />
        <meshBasicMaterial
          color="#ff6600"
          transparent
          opacity={0.08}
          side={THREE.BackSide}
        />
      </mesh>
    </group>
  );
}

// Optimized Orbit Path Component
function SimpleOrbitPath({ orbitalData, deflectionApplied }: { orbitalData: any; deflectionApplied: boolean }) {
  const points = useMemo(() => {
    const pts: THREE.Vector3[] = [];
    const segments = 100; // Reduced from 200

    // Simple elliptical orbit
    const a = parseFloat(orbitalData?.semi_major_axis) || 1.5;
    const e = parseFloat(orbitalData?.eccentricity) || 0.2;
    const b = a * Math.sqrt(1 - e * e);

    for (let i = 0; i <= segments; i++) {
      const angle = (i / segments) * Math.PI * 2;
      const x = a * Math.cos(angle) * 100;
      const z = b * Math.sin(angle) * 100;
      pts.push(new THREE.Vector3(x, 0, z));
    }

    return pts;
  }, [orbitalData]);

  const deflectedPoints = useMemo(() => {
    if (!deflectionApplied) return null;
    return points.map((p, i) => {
      const offset = i > 50 ? (i - 50) * 0.15 : 0;
      return new THREE.Vector3(p.x + offset, p.y, p.z + offset * 0.5);
    });
  }, [points, deflectionApplied]);

  return (
    <>
      {/* Original orbit line */}
      <line>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={points.length}
            array={new Float32Array(points.flatMap(p => [p.x, p.y, p.z]))}
            itemSize={3}
          />
        </bufferGeometry>
        <lineBasicMaterial
          color={deflectionApplied ? "#ff6600" : "#00d4ff"}
          transparent
          opacity={deflectionApplied ? 0.5 : 0.8}
        />
      </line>

      {/* Deflected orbit line */}
      {deflectedPoints && (
        <line>
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              count={deflectedPoints.length}
              array={new Float32Array(deflectedPoints.flatMap(p => [p.x, p.y, p.z]))}
              itemSize={3}
            />
          </bufferGeometry>
          <lineBasicMaterial color="#00ff9f" transparent opacity={0.8} />
        </line>
      )}
    </>
  );
}

// Optimized Starfield Component
function SimpleStars() {
  const starsRef = useRef<THREE.Points>(null);

  const starPositions = useMemo(() => {
    const positions = new Float32Array(2000 * 3); // Reduced from 5000
    for (let i = 0; i < 2000; i++) {
      const radius = 200 + Math.random() * 100;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 2 - 1);

      positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = radius * Math.cos(phi);
    }
    return positions;
  }, []);

  useFrame(() => {
    if (starsRef.current) {
      starsRef.current.rotation.y += 0.0001;
    }
  });

  return (
    <points ref={starsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={starPositions.length / 3}
          array={starPositions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial size={0.8} color="#ffffff" transparent opacity={0.8} sizeAttenuation />
    </points>
  );
}

export default function OrbitalView({ embedded = false }: { embedded?: boolean }) {
  const { selectedAsteroid, selectedDeflectionStrategy } = useAppStore();

  const canvasContent = (
    <Canvas 
      className="w-full h-full bg-stellar-void rounded-xl border border-stellar-surface/20"
      gl={{ 
        antialias: false,
        powerPreference: "high-performance"
      }}
      dpr={1}
    >
      <PerspectiveCamera makeDefault position={[0, 50, 150]} fov={60} />
      <OrbitControls 
        enableZoom 
        enablePan 
        enableRotate 
        enableDamping
        dampingFactor={0.05}
        maxDistance={400}
        minDistance={50}
      />

      {/* Enhanced Lighting */}
      <ambientLight intensity={0.3} />
      <pointLight position={[0, 0, 0]} intensity={2} color="#FDB813" decay={2} />
      <pointLight position={[100, 50, 50]} intensity={0.5} color="#00D4FF" decay={2} />

      <Suspense fallback={null}>
        {/* Starfield */}
        <SimpleStars />

        {/* Sun with enhanced glow */}
        <mesh position={[0, 0, 0]}>
          <sphereGeometry args={[5, 16, 16]} />
          <meshBasicMaterial color="#FDB813" />
        </mesh>

        <mesh position={[0, 0, 0]}>
          <sphereGeometry args={[8, 16, 16]} />
          <meshBasicMaterial
            color="#FDB813"
            transparent
            opacity={0.2}
            blending={THREE.AdditiveBlending}
          />
        </mesh>

        {/* Earth */}
        <SimpleEarth position={[100, 0, 0]} />

        {/* Asteroid and Orbit */}
        {selectedAsteroid && (
          <>
            <SimpleAsteroid position={[80, 10, 20]} size={2} />
            <SimpleOrbitPath
              orbitalData={selectedAsteroid.orbital_data}
              deflectionApplied={!!selectedDeflectionStrategy}
            />
          </>
        )}
      </Suspense>
    </Canvas>
  );

  if (embedded) {
    return canvasContent;
  }

  return (
    <div className="w-full h-full">
      {canvasContent}
    </div>
  );
}

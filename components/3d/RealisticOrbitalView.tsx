'use client';

import { useRef, useState, useMemo, useEffect } from 'react';
import { Canvas, useFrame, useLoader } from '@react-three/fiber';
import { OrbitControls, Stars, Ring, Line, Sphere } from '@react-three/drei';
import { Suspense } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { AdvancedOrbitalMechanics, type OrbitalElements, type Position3D } from '@/lib/advanced-orbital-mechanics';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Clock,
  Target,
  Activity
} from 'lucide-react';
import ImpactMap from '@/components/dashboard/ImpactMap';
import InfoTooltip from '@/components/ui/InfoTooltip';
import * as THREE from 'three';

// Simplified NASA-Quality Sun with Procedural Features
function Sun() {
  const sunCoreRef = useRef<THREE.Mesh>(null);
  const chromosphereRef = useRef<THREE.Mesh>(null);
  const coronaParticlesRef = useRef<THREE.Points>(null);
  const coronaMeshRef = useRef<THREE.Mesh>(null);
  const prominenceRef = useRef<THREE.Points>(null);

  // Simplified solar surface shader without vertex displacement
  const solarSurfaceVertexShader = `
    precision highp float;
    
    varying vec2 vUv;
    varying vec3 vNormal;
    varying vec3 vPosition;
    uniform float time;
    
    void main() {
      vUv = uv;
      vNormal = normalize(normalMatrix * normal);
      
      vec3 pos = position;
      
      vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
      vPosition = mvPosition.xyz;
      gl_Position = projectionMatrix * mvPosition;
    }
  `;

  const solarSurfaceFragmentShader = `
    precision highp float;
    
    varying vec2 vUv;
    varying vec3 vNormal;
    varying vec3 vPosition;
    uniform float time;
    
    void main() {
      vec2 uv = vUv;
      
      uv.x += sin(time * 0.5 + uv.y * 10.0) * 0.01;
      uv.y += cos(time * 0.3 + uv.x * 15.0) * 0.008;
      
      vec3 baseColor = vec3(1.0, 0.65, 0.15);
      
      float granulation1 = sin(uv.x * 80.0 + time) * sin(uv.y * 75.0 + time * 0.8) * 0.3;
      float granulation2 = sin(uv.x * 120.0 - time * 0.5) * sin(uv.y * 110.0 - time * 0.3) * 0.2;
      float granulation = (granulation1 + granulation2) * 0.5 + 0.8;
      baseColor *= granulation;
      
      float magneticLines = smoothstep(0.75, 0.85, sin(uv.y * 60.0 + time * 2.0)) * 0.6;
      baseColor += vec3(magneticLines * 1.0, magneticLines * 0.6, magneticLines * 0.2);
      
      float sunspots1 = smoothstep(0.8, 0.9, sin(uv.x * 25.0 + time * 0.1) * sin(uv.y * 20.0));
      baseColor *= (1.0 - sunspots1 * 0.7);
      
      float flares = smoothstep(0.9, 0.95, sin(uv.x * 15.0 + time * 3.0) * cos(uv.y * 12.0 + time * 2.5));
      baseColor += vec3(flares * 2.0, flares * 1.5, flares * 0.5);
      
      baseColor = clamp(baseColor, 0.0, 2.0);
      gl_FragColor = vec4(baseColor, 1.0);
    }
  `;

  // Simplified corona shader without vertex displacement
  const coronaVertexShader = `
    precision highp float;
    
    varying vec3 vNormal;
    varying vec3 vPosition;
    varying vec2 vUv;
    uniform float time;
    
    void main() {
      vUv = uv;
      vNormal = normalize(normalMatrix * normal);
      
      vec3 pos = position;
      
      vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
      vPosition = mvPosition.xyz;
      gl_Position = projectionMatrix * mvPosition;
    }
  `;

  const coronaFragmentShader = `
    precision highp float;
    
    varying vec3 vNormal;
    varying vec3 vPosition;
    varying vec2 vUv;
    uniform float time;
    
    void main() {
      vec3 viewDir = normalize(-vPosition);
      float fresnel = 1.0 - dot(vNormal, viewDir);
      
      float coronaPattern = sin(vUv.x * 8.0 + time * 2.0) * sin(vUv.y * 6.0 + time * 1.5);
      coronaPattern = smoothstep(0.0, 1.0, coronaPattern + 0.5);
      
      vec3 coronaColor = mix(
        vec3(1.0, 0.8, 0.3),
        vec3(0.8, 0.9, 1.0),
        fresnel
      );
      
      float alpha = fresnel * coronaPattern * 0.4;
      gl_FragColor = vec4(coronaColor, alpha);
    }
  `;

  // Points shader for varying size and color
  const pointsVertexShader = `
    precision highp float;
    attribute vec3 color;
    attribute float size;
    varying vec3 vColor;
    void main() {
      vColor = color;
      vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
      gl_Position = projectionMatrix * mvPosition;
      gl_PointSize = size * (300.0 / -mvPosition.z);
    }
  `;

  const pointsFragmentShader = `
    precision highp float;
    varying vec3 vColor;
    void main() {
      if (length(gl_PointCoord - vec2(0.5, 0.5)) > 0.475) discard;
      gl_FragColor = vec4(vColor, 1.0);
    }
  `;

  // Corona particles geometry
  const coronaParticles = useMemo(() => {
    const geometry = new THREE.BufferGeometry();
    const particleCount = 1000;
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    const sizes = new Float32Array(particleCount);
    
    for (let i = 0; i < particleCount; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 2 - 1);
      const radius = 0.12 + Math.random() * 0.25;
      
      positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = radius * Math.cos(phi);
      
      const distance = radius - 0.12;
      const t = Math.min(distance / 0.25, 1);
      colors[i * 3] = 1.0;
      colors[i * 3 + 1] = 1.0 - t * 0.3;
      colors[i * 3 + 2] = 1.0 - t * 0.7;
      
      sizes[i] = Math.random() * 0.008 + 0.002;
    }
    
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
    
    return geometry;
  }, []);

  // Prominence particles geometry
  const prominenceParticles = useMemo(() => {
    const geometry = new THREE.BufferGeometry();
    const particleCount = 200;
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    const sizes = new Float32Array(particleCount);
    const initialPositions = new Float32Array(particleCount * 3);
    
    for (let i = 0; i < particleCount; i++) {
      const angle = (i / particleCount) * Math.PI * 4;
      const height = Math.sin(angle) * 0.15 + 0.08;
      const radius = 0.08 + Math.random() * 0.02;
      
      const x = Math.cos(angle) * radius;
      const y = height;
      const z = Math.sin(angle) * radius;
      
      positions[i * 3] = x;
      positions[i * 3 + 1] = y;
      positions[i * 3 + 2] = z;
      
      initialPositions[i * 3] = x;
      initialPositions[i * 3 + 1] = y;
      initialPositions[i * 3 + 2] = z;
      
      colors[i * 3] = 1.0;
      colors[i * 3 + 1] = 0.3 + Math.random() * 0.4;
      colors[i * 3 + 2] = Math.random() * 0.2;
      
      sizes[i] = Math.random() * 0.006 + 0.003;
    }
    
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
    geometry.userData = { initialPositions };
    
    return geometry;
  }, []);

  useFrame((state) => {
    const time = state.clock.elapsedTime;
    
    if (sunCoreRef.current) {
      sunCoreRef.current.rotation.y = time * 0.03;
      const material = sunCoreRef.current.material as THREE.ShaderMaterial;
      material.uniforms.time.value = time;
    }
    
    if (chromosphereRef.current) {
      chromosphereRef.current.rotation.y = time * 0.035;
    }
    
    if (coronaParticlesRef.current) {
      coronaParticlesRef.current.rotation.y = -time * 0.02;
      coronaParticlesRef.current.rotation.x = Math.sin(time * 0.5) * 0.1;
      
      const sizesArray = coronaParticlesRef.current.geometry.attributes.size.array as Float32Array;
      for (let i = 0; i < sizesArray.length; i++) {
        sizesArray[i] = (Math.sin(time * 3 + i) + 1) * 0.003 + 0.002;
      }
      coronaParticlesRef.current.geometry.attributes.size.needsUpdate = true;
    }
    
    if (coronaMeshRef.current) {
      const material = coronaMeshRef.current.material as THREE.ShaderMaterial;
      material.uniforms.time.value = time;
    }
    
    if (prominenceRef.current) {
      prominenceRef.current.rotation.y = time * 0.05;
      
      const positionsArray = prominenceRef.current.geometry.attributes.position.array as Float32Array;
      const initialPositions = prominenceRef.current.geometry.userData.initialPositions as Float32Array;
      for (let i = 0; i < positionsArray.length; i += 3) {
        positionsArray[i + 1] = initialPositions[i + 1] + Math.sin(time * 2 + i) * 0.02;
      }
      prominenceRef.current.geometry.attributes.position.needsUpdate = true;
    }
  });

  return (
    <group>
      <mesh ref={sunCoreRef}>
        <sphereGeometry args={[0.08, 64, 64]} />
        <shaderMaterial
          vertexShader={solarSurfaceVertexShader}
          fragmentShader={solarSurfaceFragmentShader}
          uniforms={{ time: { value: 0 } }}
        />
      </mesh>
      
      <mesh ref={chromosphereRef}>
        <sphereGeometry args={[0.085, 32, 32]} />
        <meshBasicMaterial 
          color="#FF6600"
          transparent
          opacity={0.6}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
      
      <mesh ref={coronaMeshRef}>
        <sphereGeometry args={[0.15, 32, 32]} />
        <shaderMaterial
          vertexShader={coronaVertexShader}
          fragmentShader={coronaFragmentShader}
          uniforms={{ time: { value: 0 } }}
          transparent
          blending={THREE.AdditiveBlending}
          side={THREE.DoubleSide}
        />
      </mesh>
      
      <points ref={coronaParticlesRef} geometry={coronaParticles}>
        <shaderMaterial
          vertexShader={pointsVertexShader}
          fragmentShader={pointsFragmentShader}
          transparent
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </points>
      
      <points ref={prominenceRef} geometry={prominenceParticles}>
        <shaderMaterial
          vertexShader={pointsVertexShader}
          fragmentShader={pointsFragmentShader}
          transparent
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </points>
      
      <mesh>
        <sphereGeometry args={[0.22, 16, 16]} />
        <meshBasicMaterial 
          color="#FFAA44"
          transparent
          opacity={0.15}
          blending={THREE.AdditiveBlending}
          side={THREE.BackSide}
        />
      </mesh>
      
      <mesh>
        <sphereGeometry args={[0.30, 12, 12]} />
        <meshBasicMaterial 
          color="#FFCC66"
          transparent
          opacity={0.08}
          blending={THREE.AdditiveBlending}
          side={THREE.BackSide}
        />
      </mesh>
      
      <pointLight 
        position={[0, 0, 0]} 
        intensity={3.5} 
        color="#FFAA40" 
        distance={25}
        decay={1.5}
      />
      
      <pointLight 
        position={[0, 0, 0]} 
        intensity={1.5} 
        color="#FF8800" 
        distance={15}
        decay={2.0}
      />
    </group>
  );
}

// Updated Earth with user's model, optimized
function Earth({ position }: { position: Position3D }) {
  const earthRef = useRef<THREE.Mesh>(null);
  const cloudsRef = useRef<THREE.Mesh>(null);
  const atmosphereRef = useRef<THREE.Mesh>(null);

  // Vertex shader for atmosphere (from tutorial)
  const atmosphereVertexShader = `
    varying vec3 vNormal;
    varying vec3 eyeVector;
    
    void main() {
      vec4 mvPos = modelViewMatrix * vec4(position, 1.0);
      vNormal = normalize(normalMatrix * normal);
      eyeVector = normalize(mvPos.xyz);
      gl_Position = projectionMatrix * mvPos;
    }
  `;

  // Fragment shader for atmosphere (from tutorial)
  const atmosphereFragmentShader = `
    varying vec3 vNormal;
    varying vec3 eyeVector;
    uniform float atmOpacity;
    uniform float atmPowFactor;
    uniform float atmMultiplier;
    
    void main() {
      float dotP = dot(vNormal, eyeVector);
      float factor = pow(dotP, atmPowFactor) * atmMultiplier;
      vec3 atmColor = vec3(0.35 + dotP/4.5, 0.35 + dotP/4.5, 1.0);
      gl_FragColor = vec4(atmColor, atmOpacity) * factor;
    }
  `;

  // Load textures using useLoader for suspending
  const [earthTexture, bumpTexture, cloudTexture, oceanTexture, lightsTexture] = useLoader(THREE.TextureLoader, [
    '/assets/Gaia_EDR3_darkened.png',
    '/assets/Bump.jpg',
    '/assets/Clouds.png',
    '/assets/Ocean.png',
    '/assets/night_lights_modified.png'
  ]);

  useEffect(() => {
    if (earthTexture) {
      earthTexture.colorSpace = THREE.SRGBColorSpace;
      earthTexture.wrapS = THREE.RepeatWrapping;
      earthTexture.wrapT = THREE.ClampToEdgeWrapping;
      earthTexture.minFilter = THREE.LinearMipmapLinearFilter;
      earthTexture.magFilter = THREE.LinearFilter;
      earthTexture.generateMipmaps = true;
      earthTexture.anisotropy = 1;
    }

    if (bumpTexture) {
      bumpTexture.wrapS = THREE.RepeatWrapping;
      bumpTexture.wrapT = THREE.ClampToEdgeWrapping;
      bumpTexture.minFilter = THREE.LinearFilter;
      bumpTexture.magFilter = THREE.LinearFilter;
      bumpTexture.generateMipmaps = false;
    }

    if (cloudTexture) {
      cloudTexture.wrapS = THREE.RepeatWrapping;
      cloudTexture.wrapT = THREE.ClampToEdgeWrapping;
      cloudTexture.minFilter = THREE.LinearFilter;
      cloudTexture.magFilter = THREE.LinearFilter;
    }

    if (oceanTexture) {
      oceanTexture.wrapS = THREE.RepeatWrapping;
      oceanTexture.wrapT = THREE.ClampToEdgeWrapping;
      oceanTexture.minFilter = THREE.LinearFilter;
      oceanTexture.magFilter = THREE.LinearFilter;
    }

    if (lightsTexture) {
      lightsTexture.wrapS = THREE.RepeatWrapping;
      lightsTexture.wrapT = THREE.ClampToEdgeWrapping;
      lightsTexture.minFilter = THREE.LinearFilter;
      lightsTexture.magFilter = THREE.LinearFilter;
    }
  }, [earthTexture, bumpTexture, cloudTexture, oceanTexture, lightsTexture]);

  // Set initial rotation positions and animate
  useFrame((state, delta) => {
    const speedFactor = 1.0;
    
    // Set initial rotation once
    if (earthRef.current && !earthRef.current.userData.initialized) {
      earthRef.current.rotateY(-0.3);
      earthRef.current.userData.initialized = true;
    }
    if (cloudsRef.current && !cloudsRef.current.userData.initialized) {
      cloudsRef.current.rotateY(-0.3);
      cloudsRef.current.userData.initialized = true;
    }
    
    // Rotate Earth and clouds
    if (earthRef.current) {
      earthRef.current.rotateY(delta * 0.01 * speedFactor);
    }
    if (cloudsRef.current) {
      cloudsRef.current.rotateY(delta * 0.015 * speedFactor);
    }
  });

  const posArr: [number, number, number] = [position.x, position.z, position.y];

  return (
    <group position={posArr} rotation={[0, 0, 23.5 / 360 * 2 * Math.PI]}>
      {/* Main Earth sphere with all maps - Reduced segments for performance */}
      <Sphere ref={earthRef} args={[0.05, 32, 32]}>
        <meshStandardMaterial
          map={earthTexture}
          bumpMap={bumpTexture}
          bumpScale={0.05}
          roughnessMap={oceanTexture}
          roughness={1.0}
          metalness={0.0}
          emissiveMap={lightsTexture}
          emissive={new THREE.Color(0xffff88)}
          emissiveIntensity={0.8}
        />
      </Sphere>

      {/* Clouds layer - Reduced segments */}
      <Sphere ref={cloudsRef} args={[0.051, 32, 32]}>
        <meshStandardMaterial
          alphaMap={cloudTexture}
          transparent
          opacity={0.6}
          depthWrite={false}
        />
      </Sphere>

      {/* Atmosphere using custom shader - Reduced segments */}
      <Sphere ref={atmosphereRef} args={[0.058, 24, 24]}>
        <shaderMaterial
          vertexShader={atmosphereVertexShader}
          fragmentShader={atmosphereFragmentShader}
          uniforms={{
            atmOpacity: { value: 0.3 },
            atmPowFactor: { value: 3.5 },
            atmMultiplier: { value: 5.0 },
          }}
          side={THREE.BackSide}
          blending={THREE.AdditiveBlending}
          transparent
        />
      </Sphere>

      {/* Orbit ring - Reduced segments */}
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.98, 1.02, 32]} />
        <meshBasicMaterial
          color="#00ff9f"
          transparent
          opacity={0.2}
          side={THREE.DoubleSide}
        />
      </mesh>
    </group>
  );
}

function Asteroid({ 
  position, 
  size = 0.005, 
  color = "#8B7355",
  isSelected = false 
}: { 
  position: Position3D; 
  size?: number;
  color?: string;
  isSelected?: boolean;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x += 0.02;
      meshRef.current.rotation.y += 0.01;
      
      if (isSelected) {
        const scale = 1 + Math.sin(state.clock.elapsedTime * 4) * 0.2;
        meshRef.current.scale.setScalar(scale);
      }
    }
  });

  return (
    <group position={[position.x, position.z, position.y]}>
      <mesh ref={meshRef}>
        <dodecahedronGeometry args={[size, 0]} />
        <meshStandardMaterial 
          color={isSelected ? "#FF6B6B" : color}
          roughness={0.8}
          metalness={0.2}
          emissive={isSelected ? "#FF6B6B" : "#000000"}
          emissiveIntensity={isSelected ? 0.2 : 0}
        />
      </mesh>
      
      {isSelected && (
        <Ring args={[size * 3, size * 3.5, 16]} rotation={[-Math.PI / 2, 0, 0]}>
          <meshBasicMaterial color="#FF6B6B" transparent opacity={0.6} />
        </Ring>
      )}
    </group>
  );
}

function OrbitalPath({ 
  trajectory, 
  color = "#4A90E2", 
  opacity = 0.6,
  isSelected = false 
}: { 
  trajectory: Position3D[];
  color?: string;
  opacity?: number;
  isSelected?: boolean;
}) {
  const points = useMemo(() => {
    return trajectory.map(pos => new THREE.Vector3(pos.x, pos.z, pos.y));
  }, [trajectory]);

  return (
    <Line
      points={points}
      color={isSelected ? "#FF6B6B" : color}
      lineWidth={1}
      transparent
      opacity={isSelected ? 0.9 : opacity}
    />
  );
}

function AnimationController({ 
  timeSpeed, 
  isPlaying, 
  currentTime,
  setCurrentTime 
}: {
  timeSpeed: number;
  isPlaying: boolean;
  currentTime: Date;
  setCurrentTime: React.Dispatch<React.SetStateAction<Date>>;
}) {
  useFrame((_, delta) => {
    if (isPlaying) {
      setCurrentTime((prev: Date) => new Date(prev.getTime() + timeSpeed * delta * 86400000));
    }
  });

  return null;
}

function OrbitalScene() {
  const { selectedAsteroid, asteroidList } = useAppStore();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isPlaying, setIsPlaying] = useState(false);
  const [timeSpeed, setTimeSpeed] = useState(1);
  const [showAllOrbits, setShowAllOrbits] = useState(false);
  
  const selectedOrbitalElements = useMemo(() => {
    if (!selectedAsteroid) return null;
    try {
      return AdvancedOrbitalMechanics.calculateOrbitalElements(selectedAsteroid);
    } catch (error) {
      console.error('Error calculating orbital elements:', error);
      return null;
    }
  }, [selectedAsteroid]);

  const earthPosition = useMemo(() => {
    return AdvancedOrbitalMechanics.earthPosition(currentTime);
  }, [currentTime]);

  const asteroidPosition = useMemo(() => {
    if (!selectedOrbitalElements) return null;
    const state = AdvancedOrbitalMechanics.calculateOrbitalState(selectedOrbitalElements, currentTime);
    return state.position;
  }, [selectedOrbitalElements, currentTime]);

  const selectedTrajectory = useMemo(() => {
    if (!selectedOrbitalElements) return [];
    return AdvancedOrbitalMechanics.generateTrajectory(selectedOrbitalElements, 360);
  }, [selectedOrbitalElements]);

  const otherTrajectories = useMemo(() => {
    if (!showAllOrbits) return [];
    
    return asteroidList.slice(0, 3).filter(ast => ast.id !== selectedAsteroid?.id).map(asteroid => {
      try {
        const elements = AdvancedOrbitalMechanics.calculateOrbitalElements(asteroid);
        const trajectory = AdvancedOrbitalMechanics.generateTrajectory(elements, 180);
        const currentState = AdvancedOrbitalMechanics.calculateOrbitalState(elements, currentTime);
        
        return {
          asteroid,
          elements,
          trajectory,
          position: currentState.position
        };
      } catch (error) {
        return null;
      }
    }).filter(Boolean);
  }, [asteroidList, selectedAsteroid, currentTime, showAllOrbits]);

  return (
    <>
      <div className="h-full">
        <Canvas
          camera={{ 
            position: [3, 2, 3], 
            fov: 60,
            near: 0.001,
            far: 1000
          }}
          gl={{ 
            antialias: true,
            alpha: true,
            powerPreference: "high-performance",
            preserveDrawingBuffer: false
          }}
        >
          <ambientLight intensity={0.2} />
          <pointLight position={[0, 0, 0]} intensity={1} color="#FDB813" />
          <pointLight position={[5, 5, 5]} intensity={0.3} />
          
          <Stars 
            radius={100} 
            depth={50} 
            count={2000}
            factor={4} 
            saturation={0} 
            fade 
          />
          
          <Sun />
          
          <Suspense fallback={null}>
            <Earth position={earthPosition} />
          </Suspense>
          
          {asteroidPosition && (
            <Asteroid 
              position={asteroidPosition} 
              size={0.008}
              isSelected={true}
            />
          )}
          
          {otherTrajectories.map((data) => data && (
            <Asteroid
              key={data.asteroid.id}
              position={data.position}
              size={0.005}
              color="#8B7355"
            />
          ))}
          
          {selectedTrajectory.length > 0 && (
            <OrbitalPath 
              trajectory={selectedTrajectory} 
              color="#FF6B6B"
              opacity={0.8}
              isSelected={true}
            />
          )}
          
          {otherTrajectories.map((data) => data && (
            <OrbitalPath
              key={data.asteroid.id}
              trajectory={data.trajectory}
              color="#666666"
              opacity={0.3}
            />
          ))}
          
          <gridHelper 
            args={[10, 20, "#333333", "#333333"]} 
            rotation={[-Math.PI / 2, 0, 0]}
          />
          
          <OrbitControls 
            enablePan={true}
            enableZoom={true}
            enableRotate={true}
            minDistance={0.5}
            maxDistance={20}
            autoRotate={false}
          />
          
          <AnimationController
            timeSpeed={timeSpeed}
            isPlaying={isPlaying}
            currentTime={currentTime}
            setCurrentTime={setCurrentTime}
          />
        </Canvas>
      </div>
      
      <div className="absolute bottom-4 left-4 right-4">
        <Card variant="glass" className="p-3">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsPlaying(!isPlaying)}
              >
                {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setCurrentTime(new Date());
                  setIsPlaying(false);
                }}
              >
                <RotateCcw className="w-4 h-4" />
              </Button>
              
              <div className="flex items-center gap-2">
                <span className="text-xs text-stellar-light/60">Speed:</span>
                {[0.1, 1, 10, 100].map(speed => (
                  <Button
                    key={speed}
                    variant={timeSpeed === speed ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setTimeSpeed(speed)}
                    className="text-xs px-2"
                  >
                    {speed}x
                  </Button>
                ))}
              </div>
            </div>
            
            <div className="flex items-center gap-2 text-sm">
              <Clock className="w-4 h-4 text-cyber-400" />
              <span className="font-mono text-cyber-400">
                {currentTime.toLocaleDateString()} {currentTime.toLocaleTimeString()}
              </span>
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                variant={showAllOrbits ? "default" : "outline"}
                size="sm"
                onClick={() => setShowAllOrbits(!showAllOrbits)}
              >
                <Activity className="w-4 h-4 mr-1" />
                All Orbits
              </Button>
            </div>
          </div>
        </Card>
      </div>
      
      {selectedAsteroid && selectedOrbitalElements && (
        <div className="absolute top-4 right-4 w-80">
          <Card variant="glass" className="p-4">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-cyber-400">
                  <Target className="w-5 h-5" />
                  {selectedAsteroid.name}
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="mb-4">
                <h3 className="text-sm font-medium text-stellar-light/80 mb-2">Impact Zone Analysis</h3>
                <div className="h-64 w-full rounded-lg overflow-hidden border border-matrix-600/30">
                  <ImpactMap />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-stellar-light/60 flex items-center">
                    Semi-major axis:
                    <InfoTooltip termKey="semi_major_axis" size="sm" />
                  </span>
                  <div className="font-mono text-matrix-400">
                    {selectedOrbitalElements.semiMajorAxis.toFixed(3)} AU
                  </div>
                </div>
                <div>
                  <span className="text-stellar-light/60 flex items-center">
                    Eccentricity:
                    <InfoTooltip termKey="eccentricity" size="sm" />
                  </span>
                  <div className="font-mono text-cyber-400">
                    {selectedOrbitalElements.eccentricity.toFixed(3)}
                  </div>
                </div>
                <div>
                  <span className="text-stellar-light/60 flex items-center">
                    Inclination:
                    <InfoTooltip termKey="inclination" size="sm" />
                  </span>
                  <div className="font-mono text-status-caution">
                    {selectedOrbitalElements.inclination.toFixed(1)}°
                  </div>
                </div>
                <div>
                  <span className="text-stellar-light/60 flex items-center">
                    Period:
                    <InfoTooltip termKey="orbital_period" size="sm" />
                  </span>
                  <div className="font-mono text-status-normal">
                    {selectedOrbitalElements.period.toFixed(0)} days
                  </div>
                </div>
              </div>
              
              {asteroidPosition && (
                <div className="pt-3 border-t border-stellar-surface/30">
                  <div className="text-sm text-stellar-light/60 mb-2">Current Position (AU):</div>
                  <div className="grid grid-cols-3 gap-2 text-xs font-mono">
                    <div>
                      <span className="text-stellar-light/60">X: </span>
                      <span className="text-white">{asteroidPosition.x.toFixed(3)}</span>
                    </div>
                    <div>
                      <span className="text-stellar-light/60">Y: </span>
                      <span className="text-white">{asteroidPosition.y.toFixed(3)}</span>
                    </div>
                    <div>
                      <span className="text-stellar-light/60">Z: </span>
                      <span className="text-white">{asteroidPosition.z.toFixed(3)}</span>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </>
  );
}

export default function RealisticOrbitalView({ embedded = false }: { embedded?: boolean }) {
  const { selectedAsteroid } = useAppStore();

  if (!selectedAsteroid) {
    return (
      <Card variant="glass" className="h-full flex items-center justify-center">
        <CardContent className="text-center py-12">
          <Target className="w-16 h-16 mx-auto mb-4 text-cyber-400/50" />
          <h3 className="text-lg font-semibold text-white mb-2">
            No Asteroid Selected
          </h3>
          <p className="text-stellar-light/60">
            Select an asteroid from the threat radar or database to view its orbital trajectory
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div id="orbital-view" className={`relative ${embedded ? 'h-full' : 'h-screen'} bg-black overflow-hidden`}>
      <OrbitalScene />
    </div>
  );
}
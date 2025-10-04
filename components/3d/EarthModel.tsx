'use client';

import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Sphere, useTexture } from '@react-three/drei';
import * as THREE from 'three';

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
`

interface EarthModelProps {
  position?: [number, number, number];
}

export default function EarthModel({ position = [0, 0, 0] }: EarthModelProps) {
  const earthRef = useRef<THREE.Mesh>(null);
  const cloudsRef = useRef<THREE.Mesh>(null);
  const atmosphereRef = useRef<THREE.Mesh>(null);

  // Load all textures using useTexture for Suspense support and better loading handling
  const textures = useTexture({
    map: '/assets/Gaia_EDR3_darkened.png',
    bumpMap: '/assets/Bump.jpg',
    alphaMap: '/assets/Clouds.png',
    roughnessMap: '/assets/Ocean.png',
    emissiveMap: '/assets/night_lights_modified.png',
  });

  // Apply texture settings in useMemo to avoid re-applying on every render
  useMemo(() => {
    // Earth texture
    const earthTex = textures.map;
    earthTex.colorSpace = THREE.SRGBColorSpace;
    earthTex.wrapS = THREE.RepeatWrapping;
    earthTex.wrapT = THREE.ClampToEdgeWrapping;
    earthTex.minFilter = THREE.LinearMipmapLinearFilter;
    earthTex.magFilter = THREE.LinearFilter;
    earthTex.generateMipmaps = true;
    earthTex.anisotropy = 1;

    // Bump texture
    const bumpTex = textures.bumpMap;
    bumpTex.wrapS = THREE.RepeatWrapping;
    bumpTex.wrapT = THREE.ClampToEdgeWrapping;
    bumpTex.minFilter = THREE.NearestFilter; // Changed to Nearest for faster filtering
    bumpTex.magFilter = THREE.NearestFilter;
    bumpTex.generateMipmaps = false;

    // Cloud texture
    const cloudTex = textures.alphaMap;
    cloudTex.wrapS = THREE.RepeatWrapping;
    cloudTex.wrapT = THREE.ClampToEdgeWrapping;
    cloudTex.minFilter = THREE.NearestFilter; // Changed to Nearest
    cloudTex.magFilter = THREE.NearestFilter;

    // Ocean texture
    const oceanTex = textures.roughnessMap;
    oceanTex.wrapS = THREE.RepeatWrapping;
    oceanTex.wrapT = THREE.ClampToEdgeWrapping;
    oceanTex.minFilter = THREE.NearestFilter; // Changed to Nearest
    oceanTex.magFilter = THREE.NearestFilter;

    // Lights texture
    const lightsTex = textures.emissiveMap;
    lightsTex.wrapS = THREE.RepeatWrapping;
    lightsTex.wrapT = THREE.ClampToEdgeWrapping;
    lightsTex.minFilter = THREE.NearestFilter; // Changed to Nearest
    lightsTex.magFilter = THREE.NearestFilter;
  }, [textures]);

  // Set initial rotation positions and animate
  useFrame((state, delta) => {
    const speedFactor = 1.0;
    
    // Rotate Earth and clouds
    if (earthRef.current) {
      earthRef.current.rotateY(delta * 0.01 * speedFactor);
    }
    if (cloudsRef.current) {
      cloudsRef.current.rotateY(delta * 0.015 * speedFactor);
    }
  });

  // Apply initial rotation outside of useFrame for one-time setup
  useMemo(() => {
    if (earthRef.current) {
      earthRef.current.rotateY(-0.3);
    }
    if (cloudsRef.current) {
      cloudsRef.current.rotateY(-0.3);
    }
  }, []); // Empty dependency array ensures it runs once

  return (
    <group position={position} rotation={[0, 0, 23.5 / 360 * 2 * Math.PI]}>
      {/* Main Earth sphere with all maps - Further reduced segments */}
      <Sphere ref={earthRef} args={[10, 24, 24]}>
        <meshStandardMaterial
          map={textures.map}
          bumpMap={textures.bumpMap}
          bumpScale={0.05}
          roughnessMap={textures.roughnessMap}
          roughness={1.0}
          metalness={0.0}
          emissiveMap={textures.emissiveMap}
          emissive={new THREE.Color(0xffff88)}
          emissiveIntensity={0.8}
        />
      </Sphere>

      {/* Clouds layer - Reduced segments */}
      <Sphere ref={cloudsRef} args={[10.1, 24, 24]}>
        <meshStandardMaterial
          alphaMap={textures.alphaMap}
          transparent
          opacity={0.6}
          depthWrite={false}
        />
      </Sphere>

      {/* Atmosphere using custom shader - Further reduced segments */}
      <Sphere ref={atmosphereRef} args={[12, 12, 12]}>
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
          depthWrite={false}
        />
      </Sphere>

      {/* Orbit ring - Reduced segments */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[99, 101, 16]} />
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
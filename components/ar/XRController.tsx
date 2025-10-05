'use client';

import { useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { useXR, Interactive } from '@react-three/xr';
import * as THREE from 'three';

interface XRControllerProps {
  onTriggerPress: (controller: THREE.Object3D) => void;
  onGripPress: (controller: THREE.Object3D) => void;
}

export default function XRController({ onTriggerPress, onGripPress }: XRControllerProps) {
  const controllerRef = useRef<THREE.Group>(null);
  const xrState = useXR();
  const isPresenting = xrState.session !== null;

  // Handle XR controller events
  useEffect(() => {
    if (!isPresenting) return;

    const handleSelectStart = (event: any) => {
      const controller = event.target;
      onTriggerPress(controller);
    };

    const handleSqueezeStart = (event: any) => {
      const controller = event.target;
      onGripPress(controller);
    };

    // Add event listeners to XR session
    if (xrState.session) {
      const session = xrState.session;
      session.addEventListener('selectstart', handleSelectStart);
      session.addEventListener('squeezestart', handleSqueezeStart);

      return () => {
        session.removeEventListener('selectstart', handleSelectStart);
        session.removeEventListener('squeezestart', handleSqueezeStart);
      };
    }
  }, [isPresenting, onTriggerPress, onGripPress, xrState.session]);

  if (!isPresenting) return null;

  return (
    <group ref={controllerRef}>
      {/* Right Hand Controller Gun */}
      <Interactive>
        <group position={[0.3, -0.1, -0.3]}>
          {/* Futuristic XR Gun */}
          <mesh>
            <boxGeometry args={[0.08, 0.15, 0.25]} />
            <meshStandardMaterial 
              color="#222222" 
              metalness={0.8} 
              roughness={0.2}
            />
          </mesh>
          
          {/* Gun barrel */}
          <mesh position={[0, 0.05, -0.15]}>
            <cylinderGeometry args={[0.01, 0.015, 0.1, 8]} />
            <meshStandardMaterial 
              color="#444444" 
              metalness={0.9} 
              roughness={0.1}
            />
          </mesh>
          
          {/* Targeting laser */}
          <mesh position={[0, 0.05, -0.3]}>
            <cylinderGeometry args={[0.001, 0.001, 5, 4]} />
            <meshBasicMaterial 
              color="#ff0000" 
              transparent 
              opacity={0.5}
            />
          </mesh>
          
          {/* Energy core */}
          <mesh position={[0, 0, 0.05]}>
            <sphereGeometry args={[0.02, 8, 8]} />
            <meshStandardMaterial 
              color="#00ffff" 
              emissive="#004444"
              emissiveIntensity={0.5}
            />
          </mesh>
        </group>
      </Interactive>

      {/* Left Hand Controller (Secondary) */}
      <Interactive>
        <group position={[-0.3, -0.1, -0.2]}>
          {/* Shield generator */}
          <mesh>
            <cylinderGeometry args={[0.05, 0.03, 0.1, 8]} />
            <meshStandardMaterial 
              color="#333333" 
              metalness={0.6} 
              roughness={0.4}
            />
          </mesh>
          
          {/* Shield energy */}
          <mesh position={[0, 0, -0.1]}>
            <circleGeometry args={[0.15, 16]} />
            <meshBasicMaterial 
              color="#0088ff" 
              transparent 
              opacity={0.3}
              side={THREE.DoubleSide}
            />
          </mesh>
        </group>
      </Interactive>
    </group>
  );
}
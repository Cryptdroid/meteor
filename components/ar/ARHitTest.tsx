'use client';

import { useEffect, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useXR } from '@react-three/xr';
import * as THREE from 'three';

interface ARHitTestProps {
  onHitTest?: (position: THREE.Vector3, orientation: THREE.Quaternion) => void;
  showReticle?: boolean;
}

export default function ARHitTest({
  onHitTest,
  showReticle = true,
}: ARHitTestProps) {
  const xrState = useXR();
  const reticleRef = useRef<THREE.Group>(null);
  const hitTestSourceRef = useRef<any>(null);
  const isPresenting = xrState.session !== null;

  useEffect(() => {
    if (!isPresenting || !xrState.session) return;

    const session = xrState.session;

    // Request hit test source for screen center
    session.requestReferenceSpace('viewer').then((referenceSpace: any) => {
      const hitTestMethod = (session as any).requestHitTestSource;
      if (hitTestMethod) {
        hitTestMethod.call(session, { space: referenceSpace }).then((source: any) => {
          hitTestSourceRef.current = source;
        });
      }
    });

    return () => {
      if (hitTestSourceRef.current) {
        hitTestSourceRef.current.cancel();
        hitTestSourceRef.current = null;
      }
    };
  }, [isPresenting, xrState.session]);

  useFrame((state) => {
    if (!isPresenting || !hitTestSourceRef.current) return;

    const frame = (state as any).gl?.xr?.getFrame?.();
    if (!frame) return;

    const referenceSpace = (state as any).gl?.xr?.getReferenceSpace?.();
    if (!referenceSpace) return;

    try {
      const hitTestResults = frame.getHitTestResults(hitTestSourceRef.current);
      
      if (hitTestResults.length > 0) {
        const hit = hitTestResults[0];
        const pose = hit.getPose(referenceSpace);
        
        if (pose) {
          const position = new THREE.Vector3(
            pose.transform.position.x,
            pose.transform.position.y,
            pose.transform.position.z
          );
          
          const orientation = new THREE.Quaternion(
            pose.transform.orientation.x,
            pose.transform.orientation.y,
            pose.transform.orientation.z,
            pose.transform.orientation.w
          );

          // Update reticle position
          if (reticleRef.current) {
            reticleRef.current.position.copy(position);
            reticleRef.current.quaternion.copy(orientation);
            reticleRef.current.visible = true;
          }

          // Callback with hit position
          onHitTest?.(position, orientation);
        }
      } else {
        // Hide reticle if no hit detected
        if (reticleRef.current) {
          reticleRef.current.visible = false;
        }
      }
    } catch (error) {
      console.warn('Hit test error:', error);
    }
  });

  if (!showReticle) return null;

  return (
    <group ref={reticleRef} visible={false}>
      {/* Reticle ring */}
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.08, 0.1, 32]} />
        <meshBasicMaterial
          color="#00ffff"
          transparent
          opacity={0.8}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Center dot */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.001, 0]}>
        <circleGeometry args={[0.03, 32]} />
        <meshBasicMaterial
          color="#00ffff"
          transparent
          opacity={0.6}
        />
      </mesh>

      {/* Crosshair lines */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.002, 0]}>
        <ringGeometry args={[0.01, 0.15, 4, 1]} />
        <meshBasicMaterial
          color="#ffffff"
          transparent
          opacity={0.5}
        />
      </mesh>
    </group>
  );
}

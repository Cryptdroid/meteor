'use client';

import { useMemo } from 'react';
import { Line, Text } from '@react-three/drei';
import * as THREE from 'three';

interface ARDistanceMeasurementProps {
  start: [number, number, number];
  end: [number, number, number];
  color?: string;
  showLabel?: boolean;
}

export default function ARDistanceMeasurement({
  start,
  end,
  color = '#00ff00',
  showLabel = true,
}: ARDistanceMeasurementProps) {
  const distance = useMemo(() => {
    const startVec = new THREE.Vector3(...start);
    const endVec = new THREE.Vector3(...end);
    return startVec.distanceTo(endVec);
  }, [start, end]);

  const midpoint = useMemo(() => {
    return [
      (start[0] + end[0]) / 2,
      (start[1] + end[1]) / 2,
      (start[2] + end[2]) / 2,
    ] as [number, number, number];
  }, [start, end]);

  const points = useMemo(() => [
    new THREE.Vector3(...start),
    new THREE.Vector3(...end),
  ], [start, end]);

  return (
    <group>
      {/* Distance line */}
      <Line
        points={points}
        color={color}
        lineWidth={2}
        dashed
        dashScale={50}
        dashSize={5}
        gapSize={3}
      />

      {/* Start point marker */}
      <mesh position={start}>
        <sphereGeometry args={[0.01, 8, 8]} />
        <meshBasicMaterial color={color} />
      </mesh>

      {/* End point marker */}
      <mesh position={end}>
        <sphereGeometry args={[0.01, 8, 8]} />
        <meshBasicMaterial color={color} />
      </mesh>

      {/* Distance label */}
      {showLabel && (
        <Text
          position={midpoint}
          fontSize={0.03}
          color={color}
          anchorX="center"
          anchorY="middle"
          outlineWidth={0.002}
          outlineColor="#000000"
        >
          {distance.toFixed(2)}m
        </Text>
      )}
    </group>
  );
}

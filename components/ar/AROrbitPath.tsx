'use client';

import { useMemo } from 'react';
import { Line } from '@react-three/drei';
import * as THREE from 'three';

interface AROrbitPathProps {
  centerPosition: [number, number, number];
  radius: number;
  height: number;
  color: string;
  segments?: number;
}

export default function AROrbitPath({
  centerPosition,
  radius,
  height,
  color,
  segments = 64,
}: AROrbitPathProps) {
  const points = useMemo(() => {
    const pts: THREE.Vector3[] = [];
    for (let i = 0; i <= segments; i++) {
      const angle = (i / segments) * Math.PI * 2;
      const x = centerPosition[0] + Math.cos(angle) * radius;
      const y = centerPosition[1] + height;
      const z = centerPosition[2] + Math.sin(angle) * radius;
      pts.push(new THREE.Vector3(x, y, z));
    }
    return pts;
  }, [centerPosition, radius, height, segments]);

  return (
    <Line
      points={points}
      color={color}
      lineWidth={1}
      transparent
      opacity={0.6}
    />
  );
}

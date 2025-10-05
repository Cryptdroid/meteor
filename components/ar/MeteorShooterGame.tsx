'use client';

import { Suspense, useState, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stars } from '@react-three/drei';
import * as THREE from 'three';
import MeteorShooterContent from './MeteorShooterContent';
import { NASAAsteroid } from '@/types';

interface MeteorShooterGameProps {
  asteroids?: NASAAsteroid[];
  selectedAsteroid?: NASAAsteroid | null;
  onAsteroidSelect?: (asteroid: NASAAsteroid) => void;
}

export default function MeteorShooterGame({
  asteroids = [],
  selectedAsteroid = null,
  onAsteroidSelect,
}: MeteorShooterGameProps) {
  const [spaceScale, setSpaceScale] = useState<number>(1);
  const [showGrid, setShowGrid] = useState<boolean>(false);
  const [showLabels, setShowLabels] = useState<boolean>(true);
  const [showOrbitPaths, setShowOrbitPaths] = useState<boolean>(false);

  return (
    <div className="relative w-full h-screen bg-black">
      {/* Main Game Canvas - Direct Meteor Shooter */}
      <Canvas
        camera={{ position: [0, 5, 10], fov: 60 }}
        gl={{
          alpha: false,
          antialias: true,
          powerPreference: 'high-performance',
        }}
        style={{ width: '100%', height: '100%' }}
      >
        <Suspense fallback={null}>
          {/* Space Background */}
          <Stars
            radius={300}
            depth={60}
            count={5000}
            factor={7}
            saturation={0}
            fade
            speed={0.5}
          />

          {/* Space Lighting */}
          <ambientLight intensity={0.3} />
          <directionalLight 
            position={[50, 50, 25]} 
            intensity={1.5} 
            castShadow 
            color="#ffffff"
          />
          <pointLight position={[0, 0, 0]} intensity={2} color="#ffaa00" />

          {/* Meteor Shooter Game Content */}
          <MeteorShooterContent
            asteroids={asteroids}
            selectedAsteroid={selectedAsteroid}
            onAsteroidSelect={onAsteroidSelect}
            scale={spaceScale}
            showLabels={showLabels}
          />

          {/* Game Controls */}
          <OrbitControls 
            enableDamping 
            dampingFactor={0.05}
            enableZoom={true}
            enablePan={true}
            enableRotate={true}
            minDistance={3}
            maxDistance={50}
            target={[0, 0, 0]}
          />
        </Suspense>
      </Canvas>

      {/* Game Crosshair */}
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-30 pointer-events-none">
        <div className="relative">
          {/* Horizontal line */}
          <div className="absolute w-8 h-0.5 bg-red-400 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 opacity-80"></div>
          {/* Vertical line */}
          <div className="absolute w-0.5 h-8 bg-red-400 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 opacity-80"></div>
          {/* Center dot */}
          <div className="absolute w-1 h-1 bg-red-500 rounded-full top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"></div>
          {/* Outer circle */}
          <div className="absolute w-12 h-12 border border-red-400 rounded-full top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 opacity-40"></div>
        </div>
      </div>

      {/* Game Instructions - Bottom */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/80 text-white px-6 py-3 rounded-lg text-sm z-40 border border-red-500/50">
        <div className="text-center">
          <div className="text-red-400 font-semibold mb-1">🎯 METEOR SHOOTER</div>
          <div className="flex gap-4 text-xs">
            <span>🖱️ Click: Shoot</span>
            <span>🔍 Drag: Aim</span>
            <span>⌨️ R: Reload</span>
            <span>🎯 Target: Destroy Meteors</span>
          </div>
        </div>
      </div>
    </div>
  );
}
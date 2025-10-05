'use client';

import { Suspense, useState, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { XR, XRButton, createXRStore } from '@react-three/xr';
import { OrbitControls, Stars } from '@react-three/drei';
import * as THREE from 'three';
import SpaceContent from './ARContent';
import SpaceControls from './ARControls';
import { NASAAsteroid } from '@/types';
import { AlertCircle, Gamepad2 } from 'lucide-react';

interface SpaceXRSceneProps {
  asteroids?: NASAAsteroid[];
  selectedAsteroid?: NASAAsteroid | null;
  onAsteroidSelect?: (asteroid: NASAAsteroid) => void;
}

export default function SpaceXRScene({
  asteroids = [],
  selectedAsteroid = null,
  onAsteroidSelect,
}: SpaceXRSceneProps) {
  const [isXRSupported, setIsXRSupported] = useState<boolean>(false);
  const [isChecking, setIsChecking] = useState<boolean>(true);
  const [spaceScale, setSpaceScale] = useState<number>(1);
  const [showGrid, setShowGrid] = useState<boolean>(true);
  const [showLabels, setShowLabels] = useState<boolean>(true);
  const [showOrbitPaths, setShowOrbitPaths] = useState<boolean>(true);
  const [controlMode, setControlMode] = useState<'mouse' | 'xr'>('mouse');
  
  // Create XR store
  const store = createXRStore();

  useEffect(() => {
    // Check if WebXR is supported
    const checkXRSupport = async () => {
      if ('xr' in navigator) {
        try {
          const isSupported = await (navigator as any).xr?.isSessionSupported('immersive-ar');
          setIsXRSupported(isSupported || false);
        } catch (error) {
          console.error('Error checking XR support:', error);
          setIsXRSupported(false);
        }
      } else {
        setIsXRSupported(false);
      }
      setIsChecking(false);
    };

    checkXRSupport();
  }, []);

  if (isChecking) {
    return (
      <div className="flex items-center justify-center h-screen bg-black">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400 mx-auto mb-4"></div>
          <p className="text-white">Initializing Space XR Environment...</p>
        </div>
      </div>
    );
  }

  // Always allow access - fallback to mouse controls if XR not supported
  const showXRFallbackMessage = !isXRSupported;

  return (
    <div className="relative w-full h-screen bg-black">
      {/* Space XR Controls - Top Bar */}
      <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-50 flex gap-4 items-center">
        {isXRSupported && (
          <XRButton
            mode="immersive-ar"
            store={store}
            className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-lg shadow-lg transition-all flex items-center gap-2"
            onClick={() => setControlMode('xr')}
          >
            <Gamepad2 className="w-4 h-4" />
            Enter Meteor Shooter XR
          </XRButton>
        )}
        
        {showXRFallbackMessage && (
          <div className="px-4 py-2 bg-blue-900/80 text-cyan-200 text-sm rounded-lg border border-cyan-500/50">
            Using Mouse & Keyboard Controls
          </div>
        )}
      </div>

      {/* Space Controls Panel */}
      <SpaceControls
        scale={spaceScale}
        onScaleChange={setSpaceScale}
        showGrid={showGrid}
        onGridToggle={() => setShowGrid(!showGrid)}
        showLabels={showLabels}
        onLabelsToggle={() => setShowLabels(!showLabels)}
        showOrbitPaths={showOrbitPaths}
        onOrbitPathsToggle={() => setShowOrbitPaths(!showOrbitPaths)}
        selectedAsteroid={selectedAsteroid}
      />

      {/* Main Space XR Canvas */}
      <Canvas
        camera={{ position: [0, 5, 10], fov: 60 }}
        gl={{
          alpha: false,
          antialias: true,
          powerPreference: 'high-performance',
        }}
        style={{ width: '100%', height: '100%' }}
      >
        <XR store={store}>
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

            {/* Space Content */}
            <SpaceContent
              asteroids={asteroids}
              selectedAsteroid={selectedAsteroid}
              onAsteroidSelect={onAsteroidSelect}
              scale={spaceScale}
              showGrid={showGrid}
              showLabels={showLabels}
              showOrbitPaths={showOrbitPaths}
            />

            {/* Mouse & Keyboard Controls */}
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
        </XR>
      </Canvas>

      {/* Crosshair */}
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

      {/* Meteor Shooter Instructions */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/80 text-white px-6 py-3 rounded-lg text-sm z-40 border border-red-500/50">
        <div className="text-center">
          <div className="text-red-400 font-semibold mb-1">🎯 METEOR SHOOTER</div>
          <div className="flex gap-4 text-xs">
            <span>🖱️ Click: Shoot</span>
            <span>🔍 Drag: Aim</span>
            <span>⌨️ R: Reload</span>
            <span>🥽 XR: Trigger to Shoot</span>
          </div>
        </div>
      </div>
    </div>
  );
}

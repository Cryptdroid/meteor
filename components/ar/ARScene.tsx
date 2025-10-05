'use client';

import { Suspense, useState, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { XR, XRButton, createXRStore } from '@react-three/xr';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import ARContent from './ARContent';
import ARControls from './ARControls';
import { NASAAsteroid } from '@/types';
import { AlertCircle } from 'lucide-react';

interface ARSceneProps {
  asteroids?: NASAAsteroid[];
  selectedAsteroid?: NASAAsteroid | null;
  onAsteroidSelect?: (asteroid: NASAAsteroid) => void;
}

export default function ARScene({
  asteroids = [],
  selectedAsteroid = null,
  onAsteroidSelect,
}: ARSceneProps) {
  const [isARSupported, setIsARSupported] = useState<boolean>(false);
  const [isChecking, setIsChecking] = useState<boolean>(true);
  const [arScale, setArScale] = useState<number>(1);
  const [showGrid, setShowGrid] = useState<boolean>(true);
  const [showLabels, setShowLabels] = useState<boolean>(true);
  const [showOrbitPaths, setShowOrbitPaths] = useState<boolean>(true);
  
  // Create XR store
  const store = createXRStore();

  useEffect(() => {
    // Check if WebXR is supported
    const checkARSupport = async () => {
      if ('xr' in navigator) {
        try {
          const isSupported = await (navigator as any).xr?.isSessionSupported('immersive-ar');
          setIsARSupported(isSupported || false);
        } catch (error) {
          console.error('Error checking AR support:', error);
          setIsARSupported(false);
        }
      } else {
        setIsARSupported(false);
      }
      setIsChecking(false);
    };

    checkARSupport();
  }, []);

  if (isChecking) {
    return (
      <div className="flex items-center justify-center h-screen bg-space-dark">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400 mx-auto mb-4"></div>
          <p className="text-white">Checking AR Support...</p>
        </div>
      </div>
    );
  }

  if (!isARSupported) {
    return (
      <div className="flex items-center justify-center h-screen bg-space-dark p-6">
        <div className="max-w-md bg-gray-900 border border-red-500 rounded-lg p-6">
          <div className="flex items-center gap-3 mb-4">
            <AlertCircle className="w-6 h-6 text-red-500" />
            <h2 className="text-xl font-bold text-white">AR Not Supported</h2>
          </div>
          <p className="text-gray-300 mb-4">
            Your device does not support WebXR Augmented Reality. AR features require:
          </p>
          <ul className="list-disc list-inside text-gray-400 space-y-2 mb-4">
            <li>A modern mobile browser (Chrome, Safari on iOS 15+)</li>
            <li>ARCore support (Android) or ARKit support (iOS)</li>
            <li>Camera permissions enabled</li>
            <li>HTTPS connection (secure context)</li>
          </ul>
          <p className="text-sm text-gray-500">
            Try accessing this page on a compatible mobile device or update your browser.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-screen bg-black">
      {/* AR Button - positioned at top */}
      <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-50">
        <XRButton
          mode="immersive-ar"
          store={store}
          className="px-6 py-3 bg-cyan-500 hover:bg-cyan-600 text-white font-bold rounded-lg shadow-lg transition-all"
        >
          Enter AR
        </XRButton>
      </div>

      {/* AR Controls Panel */}
      <ARControls
        scale={arScale}
        onScaleChange={setArScale}
        showGrid={showGrid}
        onGridToggle={() => setShowGrid(!showGrid)}
        showLabels={showLabels}
        onLabelsToggle={() => setShowLabels(!showLabels)}
        showOrbitPaths={showOrbitPaths}
        onOrbitPathsToggle={() => setShowOrbitPaths(!showOrbitPaths)}
        selectedAsteroid={selectedAsteroid}
      />

      {/* Main AR Canvas */}
      <Canvas
        camera={{ position: [0, 1.6, 3], fov: 50 }}
        gl={{
          alpha: true,
          antialias: true,
          powerPreference: 'high-performance',
        }}
        style={{ width: '100%', height: '100%' }}
      >
        <XR store={store}>
          <Suspense fallback={null}>
            {/* Lighting */}
            <ambientLight intensity={0.6} />
            <directionalLight position={[10, 10, 5]} intensity={1} castShadow />
            <pointLight position={[-10, -10, -10]} intensity={0.5} />

            {/* AR Content */}
            <ARContent
              asteroids={asteroids}
              selectedAsteroid={selectedAsteroid}
              onAsteroidSelect={onAsteroidSelect}
              scale={arScale}
              showGrid={showGrid}
              showLabels={showLabels}
              showOrbitPaths={showOrbitPaths}
            />

            {/* Fallback camera controls for non-AR mode */}
            <OrbitControls enableDamping dampingFactor={0.05} />
          </Suspense>
        </XR>
      </Canvas>

      {/* Instructions Overlay */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/70 text-white px-4 py-2 rounded-lg text-sm z-40">
        Point your camera at a flat surface to place solar system
      </div>
    </div>
  );
}

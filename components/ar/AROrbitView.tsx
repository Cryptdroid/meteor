'use client';

import { Suspense, useState, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { XR, XRButton, createXRStore } from '@react-three/xr';
import { OrbitControls, Stars } from '@react-three/drei';
import * as THREE from 'three';
import { NASAAsteroid } from '@/types';
import { Smartphone, Eye } from 'lucide-react';
import AREarthModel from './AREarthModel';
import ARAsteroidModel from './ARAsteroidModel';
import AROrbitPath from './AROrbitPath';

interface AROrbitViewProps {
  asteroids?: NASAAsteroid[];
  selectedAsteroid?: NASAAsteroid | null;
  onAsteroidSelect?: (asteroid: NASAAsteroid) => void;
}

export default function AROrbitView({
  asteroids = [],
  selectedAsteroid = null,
  onAsteroidSelect,
}: AROrbitViewProps) {
  const [isXRSupported, setIsXRSupported] = useState<boolean>(false);
  const [isChecking, setIsChecking] = useState<boolean>(true);
  const [spaceScale, setSpaceScale] = useState<number>(1);
  const [showLabels, setShowLabels] = useState<boolean>(true);
  const [showOrbitPaths, setShowOrbitPaths] = useState<boolean>(true);
  
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
          <p className="text-white">Initializing AR Orbital View...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-screen bg-black">
      {/* AR Controls - Top Bar */}
      <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-50 flex gap-4 items-center">
        {isXRSupported ? (
          <XRButton
            mode="immersive-ar"
            store={store}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg shadow-lg transition-all flex items-center gap-2"
          >
            <Eye className="w-4 h-4" />
            Enter AR View
          </XRButton>
        ) : (
          <div className="px-4 py-2 bg-orange-900/80 text-orange-200 text-sm rounded-lg border border-orange-500/50 flex items-center gap-2">
            <Smartphone className="w-4 h-4" />
            AR requires mobile device with camera
          </div>
        )}
      </div>

      {/* Orbital Controls Panel */}
      <div className="absolute top-20 right-4 z-40 bg-black/80 backdrop-blur-lg rounded-lg p-4 border border-cyan-500/30 max-w-xs">
        <h3 className="text-cyan-400 font-semibold mb-3 text-sm">Orbital View Controls</h3>
        
        <div className="space-y-3">
          {/* Scale Control */}
          <div>
            <label className="text-white text-xs block mb-1">Scale: {spaceScale.toFixed(1)}x</label>
            <input
              type="range"
              min="0.1"
              max="3"
              step="0.1"
              value={spaceScale}
              onChange={(e) => setSpaceScale(parseFloat(e.target.value))}
              className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
            />
          </div>

          {/* Toggle Controls */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-white text-xs cursor-pointer">
              <input
                type="checkbox"
                checked={showLabels}
                onChange={(e) => setShowLabels(e.target.checked)}
                className="w-3 h-3 text-cyan-500 bg-gray-700 border-gray-600 rounded focus:ring-cyan-500"
              />
              Show Labels
            </label>
            
            <label className="flex items-center gap-2 text-white text-xs cursor-pointer">
              <input
                type="checkbox"
                checked={showOrbitPaths}
                onChange={(e) => setShowOrbitPaths(e.target.checked)}
                className="w-3 h-3 text-cyan-500 bg-gray-700 border-gray-600 rounded focus:ring-cyan-500"
              />
              Show Orbit Paths
            </label>
          </div>
        </div>

        {/* Selected Asteroid Info */}
        {selectedAsteroid && (
          <div className="mt-4 pt-3 border-t border-cyan-500/30">
            <h4 className="text-cyan-300 font-medium text-xs mb-2">Selected Asteroid</h4>
            <div className="text-white text-xs space-y-1">
              <div className="font-mono">{selectedAsteroid.name}</div>
              <div>Size: ~{Math.round(selectedAsteroid.estimated_diameter.kilometers.estimated_diameter_max * 1000)}m</div>
              <div>Speed: {Math.round(parseFloat(selectedAsteroid.close_approach_data[0]?.relative_velocity.kilometers_per_second || '0'))} km/s</div>
              {selectedAsteroid.is_potentially_hazardous_asteroid && (
                <div className="text-red-400 font-semibold">⚠️ Potentially Hazardous</div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Main AR Canvas - Orbital Mechanics Only */}
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
              speed={0.1}
            />

            {/* Space Lighting */}
            <ambientLight intensity={0.4} />
            <directionalLight 
              position={[50, 50, 25]} 
              intensity={1.2} 
              castShadow 
              color="#ffffff"
            />
            <pointLight position={[0, 0, 0]} intensity={1.5} color="#ffaa00" />

            {/* Earth Model */}
            <AREarthModel 
              position={[0, 0, 0]} 
              scale={spaceScale} 
              showLabels={showLabels}
            />

            {/* Asteroid Models and Orbits */}
            {asteroids.map((asteroid, index) => {
              // Calculate orbital position based on asteroid data
              const distance = 5 + (index * 2); // Simple orbital spacing
              const angle = (index * 45) * (Math.PI / 180); // Spread around orbit
              const position: [number, number, number] = [
                Math.cos(angle) * distance * spaceScale,
                0,
                Math.sin(angle) * distance * spaceScale
              ];
              const size = Math.max(0.1, asteroid.estimated_diameter.kilometers.estimated_diameter_max * 100 * spaceScale);

              return (
                <group key={asteroid.id}>
                  {/* Orbit Path */}
                  {showOrbitPaths && (
                    <AROrbitPath
                      centerPosition={[0, 0, 0]}
                      radius={distance * spaceScale}
                      height={0}
                      color={selectedAsteroid?.id === asteroid.id ? '#ff6b35' : '#4fc3f7'}
                      segments={64}
                    />
                  )}
                  
                  {/* Asteroid Model */}
                  <ARAsteroidModel
                    position={position}
                    size={size}
                    asteroid={asteroid}
                    isSelected={selectedAsteroid?.id === asteroid.id}
                    showLabel={showLabels}
                  />
                </group>
              );
            })}

            {/* Orbital Controls - Static view, no auto-rotation */}
            <OrbitControls 
              enableDamping 
              dampingFactor={0.05}
              enableZoom={true}
              enablePan={true}
              enableRotate={true}
              autoRotate={false}
              minDistance={3}
              maxDistance={50}
              target={[0, 0, 0]}
            />
          </Suspense>
        </XR>
      </Canvas>

      {/* AR Instructions */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/80 text-white px-6 py-3 rounded-lg text-sm z-40 border border-cyan-500/50">
        <div className="text-center">
          <div className="text-cyan-400 font-semibold mb-1">🌍 ORBITAL MECHANICS AR</div>
          <div className="flex gap-4 text-xs">
            <span>🖱️ Click: Select Asteroid</span>
            <span>🔍 Drag: Rotate View</span>
            <span>📱 AR: Real-world Scale</span>
          </div>
        </div>
      </div>
    </div>
  );
}
'use client';

import { motion } from 'framer-motion';
import { useEffect, useRef } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { Play, RotateCcw, AlertTriangle, Keyboard } from 'lucide-react';
import { ImpactSimulator } from '@/lib/impact-simulator';
import InfoTooltip from '@/components/ui/InfoTooltip';
import { keyboardHandler } from '@/lib/keyboard-handler';

export default function ControlPanel() {
  const {
    impactParameters,
    setImpactParameters,
    setSimulationResults,
    setIsSimulating,
    selectedAsteroid,
    showKeyboardHints,
    setShowKeyboardHints,
  } = useAppStore();

  const simulateButtonRef = useRef<HTMLButtonElement>(null);

  // Register keyboard shortcuts
  useEffect(() => {
    // Enter: Run simulation
    keyboardHandler.register({
      key: 'Enter',
      ctrl: true,
      description: 'Run simulation',
      action: () => {
        if (simulateButtonRef.current) {
          simulateButtonRef.current.click();
        }
      },
    });

    // R: Reset
    keyboardHandler.register({
      key: 'r',
      ctrl: true,
      description: 'Reset parameters',
      action: handleReset,
    });

    // H: Toggle keyboard hints
    keyboardHandler.register({
      key: 'h',
      ctrl: true,
      shift: true,
      description: 'Toggle keyboard hints',
      action: () => setShowKeyboardHints(!showKeyboardHints),
    });

    return () => {
      // Cleanup is handled by keyboard handler internally
    };
  }, [showKeyboardHints, setShowKeyboardHints]);

  // Auto-populate parameters when asteroid is selected
  useEffect(() => {
    if (selectedAsteroid) {
      // Get asteroid's actual data
      const diameterKm = selectedAsteroid.estimated_diameter.kilometers.estimated_diameter_max;
      const diameterMeters = Math.round(diameterKm * 1000); // Convert to meters
      
      // Get velocity from close approach data
      const velocityKmS = selectedAsteroid.close_approach_data[0]
        ? parseFloat(selectedAsteroid.close_approach_data[0].relative_velocity.kilometers_per_second)
        : 20;

      // Intelligent density estimation based on asteroid characteristics
      // NASA classifies asteroids by absolute magnitude and albedo
      let density = 3000; // Default for S-type (stony)
      
      // Use absolute magnitude as a proxy for composition
      const absoluteMagnitude = selectedAsteroid.absolute_magnitude_h;
      
      if (absoluteMagnitude < 17) {
        // Large, bright objects - likely rocky or metallic
        density = diameterMeters > 500 ? 3500 : 3000; // Larger = denser core
      } else if (absoluteMagnitude > 22) {
        // Small, dark objects - likely carbonaceous
        density = 1500; // C-type (carbonaceous)
      } else {
        // Medium range - estimate based on size
        if (diameterMeters < 100) {
          density = 2000; // Small rubble pile
        } else if (diameterMeters < 500) {
          density = 2800; // S-type (stony)
        } else {
          density = 3200; // Larger consolidated body
        }
      }
      
      // Estimate impact angle based on orbital characteristics
      // Most impacts are at shallow angles due to Earth's gravitational focusing
      // Use velocity as a proxy: faster = steeper possible
      let angle = 45; // Default statistically most common
      
      if (velocityKmS < 15) {
        // Slow approach - likely grazing impact
        angle = 30;
      } else if (velocityKmS > 40) {
        // Fast approach - more perpendicular possible
        angle = 55;
      } else if (velocityKmS > 25) {
        // Medium-fast
        angle = 50;
      }
      
      // Add randomness to reflect uncertainty (±5 degrees)
      angle = Math.max(15, Math.min(75, angle + Math.floor(Math.random() * 11) - 5));

      setImpactParameters({
        asteroidId: selectedAsteroid.id,
        size: Math.max(10, Math.min(10000, diameterMeters)), // Clamp to slider range
        density: density,
        velocity: Math.max(5, Math.min(72, Math.round(velocityKmS))), // Clamp to slider range
        angle: angle,
        impactLocation: impactParameters.impactLocation, // Keep existing location
        isWaterImpact: impactParameters.isWaterImpact,
      });
    }
  }, [selectedAsteroid?.id]); // Only trigger when asteroid ID changes

  const handleSimulate = async () => {
    setIsSimulating(true);
    
    try {
      // Add targetLatitude and targetLongitude from impactLocation
      const paramsWithCoords = {
        ...impactParameters,
        targetLatitude: impactParameters.impactLocation.lat,
        targetLongitude: impactParameters.impactLocation.lng,
      };
      
      const results = await ImpactSimulator.simulate(paramsWithCoords);
      setSimulationResults(results);
    } catch (error) {
      console.error('Simulation error:', error);
      // Fallback to basic simulation if USGS fails
      const results = await ImpactSimulator.simulate({
        ...impactParameters,
        targetLatitude: impactParameters.impactLocation.lat,
        targetLongitude: impactParameters.impactLocation.lng,
      });
      setSimulationResults(results);
    } finally {
      setIsSimulating(false);
    }
  };

  const handleReset = () => {
    setImpactParameters({
      size: 500,
      density: 3000,
      velocity: 20,
      angle: 45,
      impactLocation: { lat: 35.6762, lng: 139.6503 }, // Tokyo
      isWaterImpact: false,
    });
    setSimulationResults(null);
  };

  return (
    <Card variant="glass">
      <CardHeader className="pb-3">
        <CardTitle className="text-cyber-400">Impact Parameters</CardTitle>
        {selectedAsteroid && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-2 mt-2 p-2 rounded-lg bg-cyber-500/10 border border-cyber-500/30"
          >
            <AlertTriangle className="w-4 h-4 text-cyber-400" />
            <p className="text-xs text-stellar-light/80">
              Auto-loaded: <strong className="text-white">{selectedAsteroid.name}</strong>
            </p>
          </motion.div>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Size Slider */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <label className="text-xs font-medium flex items-center text-stellar-light/80">
              Asteroid Size (meters)
              <InfoTooltip 
                termKey="crater_diameter"
                size="sm"
              />
            </label>
            <span className="text-sm text-cyber-400 font-bold">{impactParameters.size.toLocaleString()}m</span>
          </div>
          <Slider
            value={[impactParameters.size]}
            onValueChange={(value: any[]) => setImpactParameters({ size: value[0] })}
            min={10}
            max={10000}
            step={10}
            aria-label="Asteroid size in meters"
          />
          {selectedAsteroid && (
            <p className="text-xs text-gray-400">
              Real diameter: {(selectedAsteroid.estimated_diameter.kilometers.estimated_diameter_max * 1000).toFixed(0)}m
            </p>
          )}
          <p className="text-xs text-gray-500">
            &lt; 100m: Local damage • 100-1000m: City threat • &gt; 1000m: Regional catastrophe
          </p>
        </div>

        {/* Density Slider */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <label className="text-sm font-medium flex items-center">
              Density (kg/m³)
              <InfoTooltip 
                termKey="density"
                size="sm"
              />
            </label>
            <span className="text-sm text-space-cyan font-bold">{impactParameters.density.toLocaleString()}</span>
          </div>
          <Slider
            value={[impactParameters.density]}
            onValueChange={(value: any[]) => setImpactParameters({ density: value[0] })}
            min={1000}
            max={8000}
            step={100}
            aria-label="Asteroid density in kg per cubic meter"
          />
          <p className="text-xs text-gray-500">
            C-type (carbonaceous): 1500 • S-type (stony): 3000 • M-type (metallic): 7000
          </p>
        </div>

        {/* Velocity Slider */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <label className="text-sm font-medium flex items-center">
              Velocity (km/s)
              <InfoTooltip 
                termKey="velocity"
                size="sm"
              />
            </label>
            <span className="text-sm text-space-cyan font-bold">{impactParameters.velocity}</span>
          </div>
          <Slider
            value={[impactParameters.velocity]}
            onValueChange={(value: any[]) => setImpactParameters({ velocity: value[0] })}
            min={5}
            max={72}
            step={1}
            aria-label="Impact velocity in kilometers per second"
          />
          {selectedAsteroid && selectedAsteroid.close_approach_data[0] && (
            <p className="text-xs text-gray-400">
              Real velocity: {parseFloat(selectedAsteroid.close_approach_data[0].relative_velocity.kilometers_per_second).toFixed(1)} km/s
            </p>
          )}
          <p className="text-xs text-gray-500">
            Slow: 10-20 • Average: 20-40 • Fast: 40-70 km/s
          </p>
        </div>

        {/* Entry Angle Slider */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <label className="text-sm font-medium flex items-center">
              Entry Angle (degrees)
              <InfoTooltip 
                termKey="impact_angle"
                size="sm"
              />
            </label>
            <span className="text-sm text-space-cyan font-bold">{impactParameters.angle}°</span>
          </div>
          <Slider
            value={[impactParameters.angle]}
            onValueChange={(value: any[]) => setImpactParameters({ angle: value[0] })}
            min={0}
            max={90}
            step={1}
            aria-label="Entry angle in degrees"
          />
          <p className="text-xs text-gray-500">
            Shallow (15-30°): Maximum destruction • Steep (60-90°): Smaller crater, deeper penetration
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 pt-4">
          <Button
            ref={simulateButtonRef}
            variant="neon"
            className="flex-1"
            onClick={handleSimulate}
            aria-label="Run simulation (Ctrl+Enter)"
          >
            <Play className="w-4 h-4 mr-2" />
            Run Simulation
            {showKeyboardHints && (
              <kbd className="ml-2 px-1.5 py-0.5 text-xs bg-black/30 rounded border border-white/20">
                Ctrl+Enter
              </kbd>
            )}
          </Button>
          <Button
            variant="outline"
            onClick={handleReset}
            aria-label="Reset parameters (Ctrl+R)"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Reset
            {showKeyboardHints && (
              <kbd className="ml-2 px-1.5 py-0.5 text-xs bg-black/30 rounded border border-white/20">
                Ctrl+R
              </kbd>
            )}
          </Button>
        </div>

        {/* Keyboard Shortcuts Help */}
        {showKeyboardHints && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="pt-4 border-t border-gray-700"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Keyboard className="w-4 h-4 text-space-cyan" />
                <span className="text-xs font-medium text-gray-300">Keyboard Shortcuts</span>
              </div>
              <button
                onClick={() => setShowKeyboardHints(false)}
                className="text-xs text-gray-500 hover:text-gray-300"
                aria-label="Hide keyboard hints"
              >
                Hide (Ctrl+Shift+H)
              </button>
            </div>
            <div className="space-y-1 text-xs text-gray-400">
              <div className="flex justify-between">
                <span>Run Simulation:</span>
                <kbd className="px-1.5 py-0.5 bg-black/30 rounded border border-white/20">Ctrl+Enter</kbd>
              </div>
              <div className="flex justify-between">
                <span>Reset Parameters:</span>
                <kbd className="px-1.5 py-0.5 bg-black/30 rounded border border-white/20">Ctrl+R</kbd>
              </div>
              <div className="flex justify-between">
                <span>Navigate Controls:</span>
                <kbd className="px-1.5 py-0.5 bg-black/30 rounded border border-white/20">Tab</kbd>
              </div>
              <div className="flex justify-between">
                <span>Adjust Sliders:</span>
                <kbd className="px-1.5 py-0.5 bg-black/30 rounded border border-white/20">←/→</kbd>
              </div>
            </div>
          </motion.div>
        )}
      </CardContent>
    </Card>
  );
}

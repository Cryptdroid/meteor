'use client';

import { useState } from 'react';
import { Settings, Grid3x3, Tag, GitBranch, ZoomIn, ZoomOut, Info, X } from 'lucide-react';
import { NASAAsteroid } from '@/types';

interface ARControlsProps {
  scale: number;
  onScaleChange: (scale: number) => void;
  showGrid: boolean;
  onGridToggle: () => void;
  showLabels: boolean;
  onLabelsToggle: () => void;
  showOrbitPaths: boolean;
  onOrbitPathsToggle: () => void;
  selectedAsteroid: NASAAsteroid | null;
}

export default function ARControls({
  scale,
  onScaleChange,
  showGrid,
  onGridToggle,
  showLabels,
  onLabelsToggle,
  showOrbitPaths,
  onOrbitPathsToggle,
  selectedAsteroid,
}: ARControlsProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <>
      {/* Control Panel Toggle Button */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="absolute top-20 right-4 z-50 bg-gray-900/90 text-white p-3 rounded-full shadow-lg hover:bg-gray-800 transition-all"
        aria-label="Toggle AR Controls"
      >
        {isExpanded ? <X size={24} /> : <Settings size={24} />}
      </button>

      {/* Expanded Control Panel */}
      {isExpanded && (
        <div className="absolute top-32 right-4 z-50 bg-gray-900/95 text-white p-4 rounded-lg shadow-xl max-w-xs border border-cyan-500/50">
          <h3 className="text-lg font-bold mb-4 text-cyan-400">AR Controls</h3>

          {/* Scale Control */}
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">
              Scale: {scale.toFixed(1)}x
            </label>
            <div className="flex items-center gap-2">
              <button
                onClick={() => onScaleChange(Math.max(0.1, scale - 0.1))}
                className="p-2 bg-gray-800 rounded hover:bg-gray-700"
                aria-label="Decrease scale"
              >
                <ZoomOut size={16} />
              </button>
              <input
                type="range"
                min="0.1"
                max="5"
                step="0.1"
                value={scale}
                onChange={(e) => onScaleChange(parseFloat(e.target.value))}
                className="flex-1 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
              />
              <button
                onClick={() => onScaleChange(Math.min(5, scale + 0.1))}
                className="p-2 bg-gray-800 rounded hover:bg-gray-700"
                aria-label="Increase scale"
              >
                <ZoomIn size={16} />
              </button>
            </div>
          </div>

          {/* Toggle Controls */}
          <div className="space-y-3">
            <button
              onClick={onGridToggle}
              className={`w-full flex items-center gap-3 p-3 rounded transition-all ${
                showGrid
                  ? 'bg-cyan-600 hover:bg-cyan-700'
                  : 'bg-gray-800 hover:bg-gray-700'
              }`}
            >
              <Grid3x3 size={18} />
              <span className="text-sm">Placement Grid</span>
            </button>

            <button
              onClick={onLabelsToggle}
              className={`w-full flex items-center gap-3 p-3 rounded transition-all ${
                showLabels
                  ? 'bg-cyan-600 hover:bg-cyan-700'
                  : 'bg-gray-800 hover:bg-gray-700'
              }`}
            >
              <Tag size={18} />
              <span className="text-sm">Labels</span>
            </button>

            <button
              onClick={onOrbitPathsToggle}
              className={`w-full flex items-center gap-3 p-3 rounded transition-all ${
                showOrbitPaths
                  ? 'bg-cyan-600 hover:bg-cyan-700'
                  : 'bg-gray-800 hover:bg-gray-700'
              }`}
            >
              <GitBranch size={18} />
              <span className="text-sm">Orbit Paths</span>
            </button>
          </div>

          {/* Selected Asteroid Info */}
          {selectedAsteroid && (
            <div className="mt-4 p-3 bg-gray-800 rounded border border-cyan-500/30">
              <div className="flex items-center gap-2 mb-2">
                <Info size={16} className="text-cyan-400" />
                <h4 className="text-sm font-semibold text-cyan-400">Selected Asteroid</h4>
              </div>
              <p className="text-xs mb-1">{selectedAsteroid.name}</p>
              <div className="text-xs text-gray-400 space-y-1">
                <p>
                  Size: {selectedAsteroid.estimated_diameter.kilometers.estimated_diameter_max.toFixed(2)} km
                </p>
                {selectedAsteroid.close_approach_data[0] && (
                  <>
                    <p>
                      Velocity: {parseFloat(selectedAsteroid.close_approach_data[0].relative_velocity.kilometers_per_second).toFixed(2)} km/s
                    </p>
                    <p>
                      Distance: {parseFloat(selectedAsteroid.close_approach_data[0].miss_distance.kilometers).toFixed(0)} km
                    </p>
                  </>
                )}
                <p className={selectedAsteroid.is_potentially_hazardous_asteroid ? 'text-red-400' : 'text-green-400'}>
                  {selectedAsteroid.is_potentially_hazardous_asteroid ? '⚠️ Potentially Hazardous' : '✅ Non-Hazardous'}
                </p>
              </div>
            </div>
          )}

          {/* Instructions */}
          <div className="mt-4 p-3 bg-blue-900/30 rounded border border-blue-500/30">
            <p className="text-xs text-blue-200">
              💡 Tap asteroids to select them. Use pinch gestures to scale. Move your device to explore different angles.
            </p>
          </div>
        </div>
      )}

      {/* Quick Info Display (always visible) */}
      {!isExpanded && selectedAsteroid && (
        <div className="absolute top-20 right-16 z-40 bg-gray-900/90 text-white px-3 py-2 rounded shadow-lg text-xs max-w-xs">
          <p className="font-semibold text-cyan-400">{selectedAsteroid.name}</p>
          <p className="text-gray-300">
            {selectedAsteroid.estimated_diameter.kilometers.estimated_diameter_max.toFixed(2)} km
          </p>
        </div>
      )}
    </>
  );
}

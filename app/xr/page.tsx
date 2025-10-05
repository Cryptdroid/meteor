'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { ArrowLeft, Loader2, Target } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { NASAAsteroid } from '@/types';
import { NASAService } from '@/lib/nasa-service';
import LoadingScreen from '@/components/ui/LoadingScreen';

// Dynamic import for meteor shooter game
const MeteorShooterGame = dynamic(() => import('@/components/ar/MeteorShooterGame'), {
  ssr: false,
  loading: () => <LoadingScreen />,
});

export default function XRPage() {
  const router = useRouter();
  const [asteroids, setAsteroids] = useState<NASAAsteroid[]>([]);
  const [selectedAsteroid, setSelectedAsteroid] = useState<NASAAsteroid | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadAsteroids();
  }, []);

  const loadAsteroids = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch asteroids from NASA API
      const data = await NASAService.fetchNearEarthAsteroids(7);
      
      if (data.length === 0) {
        setError('No asteroid data available. Using demo data.');
        // You could set demo data here if needed
      } else {
        // Sort by size and get top 10 for XR game
        const sortedAsteroids = NASAService.sortBySize(data).slice(0, 10);
        setAsteroids(sortedAsteroids);
        
        // Auto-select the first hazardous asteroid or the largest one
        const hazardous = sortedAsteroids.find(a => a.is_potentially_hazardous_asteroid);
        setSelectedAsteroid(hazardous || sortedAsteroids[0]);
      }
    } catch (err) {
      console.error('Error loading asteroids:', err);
      setError('Failed to load asteroid data. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  const handleAsteroidSelect = (asteroid: NASAAsteroid) => {
    setSelectedAsteroid(asteroid);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-space-dark">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-purple-400 animate-spin mx-auto mb-4" />
          <p className="text-white text-lg">Loading XR Meteor Shooter...</p>
          <p className="text-gray-400 text-sm mt-2">Preparing asteroid targets from NASA data</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-screen bg-black overflow-hidden mobile-safe-area">
      {/* Back Button */}
      <button
        onClick={() => router.back()}
        className="absolute top-4 left-4 z-50 flex items-center gap-2 bg-gray-900/90 hover:bg-gray-800 text-white px-3 sm:px-4 py-2 rounded-lg shadow-lg transition-all touch-target"
      >
        <ArrowLeft size={18} className="sm:w-5 sm:h-5" />
        <span className="text-sm sm:text-base">Back</span>
      </button>

      {/* XR Game Title */}
      <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-50 bg-purple-900/90 text-purple-100 px-4 py-2 rounded-lg shadow-lg">
        <div className="flex items-center gap-2">
          <Target className="w-5 h-5" />
          <span className="font-bold text-sm sm:text-base">XR METEOR SHOOTER</span>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="absolute top-20 left-4 right-4 sm:left-1/2 sm:right-auto sm:transform sm:-translate-x-1/2 z-50 bg-yellow-900/90 text-yellow-100 px-4 py-2 rounded-lg shadow-lg text-sm sm:text-base max-w-sm sm:max-w-md mx-auto sm:mx-0">
          ⚠️ {error}
        </div>
      )}

      {/* Meteor Shooter Game - Direct Access */}
      <MeteorShooterGame
        asteroids={asteroids}
        selectedAsteroid={selectedAsteroid}
        onAsteroidSelect={handleAsteroidSelect}
      />

      {/* Game Instructions Footer */}
      <div className="absolute bottom-16 sm:bottom-20 left-4 right-4 sm:left-0 sm:right-0 z-30 flex justify-center">
        <div className="bg-purple-900/80 text-white px-4 sm:px-6 py-3 rounded-lg text-sm max-w-sm sm:max-w-md text-center border border-purple-500/50">
          <p className="font-semibold text-purple-300 mb-1 text-sm sm:text-base">
            🎯 {asteroids.length} Meteor Targets Loaded
          </p>
          <p className="text-xs text-purple-200">
            Enter XR mode to defend Earth from incoming asteroids!
          </p>
        </div>
      </div>

      {/* Game Stats HUD */}
      <div className="absolute top-20 right-4 z-40 bg-black/80 backdrop-blur-lg rounded-lg p-3 border border-purple-500/30 max-w-xs">
        <h3 className="text-purple-400 font-semibold mb-2 text-sm flex items-center gap-2">
          <Target className="w-4 h-4" />
          Mission Status
        </h3>
        
        <div className="space-y-2 text-xs text-white">
          <div className="flex justify-between">
            <span>Targets:</span>
            <span className="text-purple-300">{asteroids.length}</span>
          </div>
          <div className="flex justify-between">
            <span>Hazardous:</span>
            <span className="text-red-400">
              {asteroids.filter(a => a.is_potentially_hazardous_asteroid).length}
            </span>
          </div>
          {selectedAsteroid && (
            <>
              <div className="border-t border-purple-500/30 pt-2 mt-2">
                <div className="text-purple-300 font-medium mb-1">Current Target</div>
                <div className="font-mono text-xs">{selectedAsteroid.name}</div>
                <div>Size: ~{Math.round(selectedAsteroid.estimated_diameter.kilometers.estimated_diameter_max * 1000)}m</div>
                <div>Speed: {Math.round(parseFloat(selectedAsteroid.close_approach_data[0]?.relative_velocity.kilometers_per_second || '0'))} km/s</div>
                {selectedAsteroid.is_potentially_hazardous_asteroid && (
                  <div className="text-red-400 font-semibold mt-1">⚠️ HIGH PRIORITY</div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
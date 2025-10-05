'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { NASAAsteroid } from '@/types';
import { NASAService } from '@/lib/nasa-service';
import LoadingScreen from '@/components/ui/LoadingScreen';

// Dynamic import to avoid SSR issues with WebXR - Orbital view only
const AROrbitView = dynamic(() => import('../../components/ar/AROrbitView'), {
  ssr: false,
  loading: () => <LoadingScreen />,
});

export default function ARPage() {
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
        // Sort by size and get top 10 for AR view
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
          <Loader2 className="w-12 h-12 text-cyan-400 animate-spin mx-auto mb-4" />
          <p className="text-white text-lg">Loading Asteroid Data...</p>
          <p className="text-gray-400 text-sm mt-2">Fetching real-time NEO data from NASA</p>
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



      {/* Error Message */}
      {error && (
        <div className="absolute top-16 sm:top-20 left-4 right-4 sm:left-1/2 sm:right-auto sm:transform sm:-translate-x-1/2 z-50 bg-yellow-900/90 text-yellow-100 px-4 py-2 rounded-lg shadow-lg text-sm sm:text-base max-w-sm sm:max-w-md mx-auto sm:mx-0">
          ⚠️ {error}
        </div>
      )}

      {/* AR Orbital View - No Game Elements */}
      <AROrbitView
        asteroids={asteroids}
        selectedAsteroid={selectedAsteroid}
        onAsteroidSelect={handleAsteroidSelect}
      />

      {/* Info Footer */}
      <div className="absolute bottom-16 sm:bottom-20 left-4 right-4 sm:left-0 sm:right-0 z-30 flex justify-center">
        <div className="bg-black/70 text-white px-4 sm:px-6 py-3 rounded-lg text-sm max-w-sm sm:max-w-md text-center">
          <p className="font-semibold text-cyan-400 mb-1 text-sm sm:text-base">
            {asteroids.length} Asteroid Orbits Loaded
          </p>
          <p className="text-xs text-gray-300">
            Tap "Enter AR" to view orbital mechanics in augmented reality
          </p>
        </div>
      </div>
    </div>
  );
}

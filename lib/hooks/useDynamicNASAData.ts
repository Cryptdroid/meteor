'use client';

import { useEffect, useState, useCallback } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { NASAService } from '@/lib/nasa-service';

export function useDynamicNASAData() {
  const { setAsteroidList } = useAppStore();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchAsteroids = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Fetch asteroids from NASA API
      const asteroids = await NASAService.fetchNearEarthAsteroids();
      
      if (asteroids && asteroids.length > 0) {
        setAsteroidList(asteroids);
        setLastUpdated(new Date());
      } else {
        setError('No asteroids found');
      }
    } catch (err) {
      console.error('Error fetching NASA data:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch asteroid data');
    } finally {
      setIsLoading(false);
    }
  }, [setAsteroidList]);

  useEffect(() => {
    // Initial fetch
    fetchAsteroids();

    // Auto-refresh every 5 minutes
    const interval = setInterval(fetchAsteroids, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, [fetchAsteroids]);

  return {
    isLoading,
    error,
    lastUpdated,
    refetch: fetchAsteroids,
  };
}

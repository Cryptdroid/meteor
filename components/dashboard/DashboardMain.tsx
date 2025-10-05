'use client';

import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAppStore } from '@/store/useAppStore';
import AsteroidList from './AsteroidList';
import ControlPanel from './ControlPanel';
import ImpactResults from './ImpactResults';
import ImpactMap from './ImpactMap';
import { NASAService } from '@/lib/nasa-service';

export default function DashboardMain() {
  const { setAsteroidList } = useAppStore();

  useEffect(() => {
    loadAsteroids();
  }, []);

  const loadAsteroids = async () => {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 7);

    const startDate = today.toISOString().split('T')[0];
    const endDate = tomorrow.toISOString().split('T')[0];

    const asteroids = await NASAService.fetchNearEarthObjects(startDate, endDate);
    setAsteroidList(asteroids);
  };

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        {/* Top Row - Control Panel */}
        <div>
          <ControlPanel />
        </div>

        {/* Main Row - 2 Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <div className="h-full">
              <AsteroidList />
            </div>
          </div>
          <div className="lg:col-span-2">
            <div className="space-y-6">
              <ImpactResults />
              <ImpactMap />
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

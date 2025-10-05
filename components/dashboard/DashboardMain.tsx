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
        className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6"
      >
        {/* Asteroid List - Left Column / Top on mobile */}
        <div className="lg:col-span-1 order-1 lg:order-1">
          <AsteroidList />
        </div>

        {/* Main Content - Middle & Right Columns / Below on mobile */}
        <div className="lg:col-span-2 space-y-4 sm:space-y-6 order-2 lg:order-2"> 
          <ControlPanel />
          <ImpactResults />                   
          <ImpactMap />      
        </div>
      </motion.div>
    </div>
  );
}

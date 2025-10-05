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
    <div className="container mx-auto px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid grid-cols-1 lg:grid-cols-3 gap-6"
      >
        {/* Asteroid List - Left Column */}
        <div className="lg:col-span-1">
          <AsteroidList />
        </div>

        {/* Main Content - Middle & Right Columns */}
        <div className="lg:col-span-2 space-y-6"> 
          <ControlPanel />
          <ImpactResults />                   
          <ImpactMap />      
        </div>
      </motion.div>
    </div>
  );
}

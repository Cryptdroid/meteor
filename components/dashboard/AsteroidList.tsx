'use client';

import { motion } from 'framer-motion';
import { useAppStore } from '@/store/useAppStore';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { AlertTriangle, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import InfoTooltip from '@/components/ui/InfoTooltip';
import { useState } from 'react';

export default function AsteroidList() {
  const { asteroidList, selectedAsteroid, setSelectedAsteroid } = useAppStore();
  const [searchTerm, setSearchTerm] = useState('');

  const filteredAsteroids = asteroidList.filter((asteroid) =>
    asteroid.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const sortedAsteroids = filteredAsteroids.sort((a, b) => {
    const sizeA = a.estimated_diameter.kilometers.estimated_diameter_max;
    const sizeB = b.estimated_diameter.kilometers.estimated_diameter_max;
    return sizeB - sizeA;
  });

  return (
    <Card variant="glass" className="h-[400px] sm:h-[500px] lg:h-[560px] flex flex-col">
      <CardHeader className="pb-3 px-4 sm:px-6">
        <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
          <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5 text-cyber-400" />
          <span className="hidden sm:inline">Near-Earth Objects</span>
          <span className="sm:hidden">NEOs</span>
        </CardTitle>
        <CardDescription className="text-sm">
          {asteroidList.length} asteroid{asteroidList.length !== 1 ? 's' : ''} detected
        </CardDescription>
        
        <div className="relative mt-3 sm:mt-4">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Search asteroids..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 text-sm"
          />
        </div>
      </CardHeader>

      <CardContent className="flex-1 overflow-y-auto space-y-2 px-4 sm:px-6 custom-scrollbar">
        {sortedAsteroids.map((asteroid, index) => {
          const size = asteroid.estimated_diameter.kilometers.estimated_diameter_max;
          const velocity = asteroid.close_approach_data[0]?.relative_velocity.kilometers_per_second || '0';
          const isHazardous = asteroid.is_potentially_hazardous_asteroid;
          const isSelected = selectedAsteroid?.id === asteroid.id;

          return (
            <motion.div
              key={asteroid.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              onClick={() => setSelectedAsteroid(asteroid)}
              className={`p-3 rounded-lg cursor-pointer transition-all touch-target ${
                isSelected
                  ? 'bg-gradient-to-r from-cyber-500/20 to-matrix-500/20 border border-cyber-500/50'
                  : 'bg-stellar-surface/30 hover:bg-stellar-surface/50 active:bg-stellar-surface/60'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-white truncate text-sm sm:text-base">{asteroid.name}</h3>
                  <div className="mt-1 space-y-1 text-xs">
                    <p className="text-stellar-light/60 flex items-center flex-wrap">
                      <span>Size:</span>
                      <span className="text-cyber-400 ml-1">{(size * 1000).toFixed(0)}m</span>
                      <InfoTooltip 
                        title="Asteroid Diameter"
                        description="Larger asteroids cause exponentially more damage. A 100m asteroid destroys a city, while a 10km asteroid causes mass extinction."
                        size="sm"
                      />
                    </p>
                    <p className="text-stellar-light/60 flex items-center flex-wrap">
                      <span>Velocity:</span>
                      <span className="text-matrix-400 ml-1">{parseFloat(velocity).toFixed(1)} km/s</span>
                      <InfoTooltip 
                        termKey="velocity"
                        size="sm"
                      />
                    </p>
                  </div>
                </div>
                {isHazardous && (
                  <div className="ml-2 px-2 py-1 rounded bg-red-500/20 border border-red-500/50 flex-shrink-0">
                    <AlertTriangle className="w-3 h-3 sm:w-4 sm:h-4 text-red-400" />
                  </div>
                )}
              </div>
            </motion.div>
          );
        })}

        {sortedAsteroids.length === 0 && (
          <div className="text-center py-8 text-gray-400">
            <p>No asteroids found</p>
            <p className="text-sm mt-2">Try adjusting your search</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

'use client';

import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart3, PieChart, TrendingUp, Activity, RefreshCw } from 'lucide-react';

export function ScientificChartsPanel() {
  const { asteroidList } = useAppStore();
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const [isAnimating, setIsAnimating] = useState(false);

  // Auto-refresh data every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setLastUpdate(new Date());
      setIsAnimating(true);
      setTimeout(() => setIsAnimating(false), 1000);
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  // Process data for charts
  const getSizeDistribution = () => {
    const sizeRanges = [
      { label: '< 50m', min: 0, max: 50, count: 0, color: 'bg-status-normal' },
      { label: '50-100m', min: 50, max: 100, count: 0, color: 'bg-status-caution' },
      { label: '100-500m', min: 100, max: 500, count: 0, color: 'bg-status-warning' },
      { label: '500m+', min: 500, max: Infinity, count: 0, color: 'bg-status-critical' }
    ];

    asteroidList.forEach(asteroid => {
      const diameter = (asteroid.estimated_diameter?.kilometers?.estimated_diameter_max || 0) * 1000;
      const range = sizeRanges.find(r => diameter >= r.min && diameter < r.max);
      if (range) range.count++;
    });

    return sizeRanges;
  };

  const getVelocityDistribution = () => {
    const velocityRanges = [
      { label: '< 20 km/s', min: 0, max: 20, count: 0, color: 'bg-cyber-500' },
      { label: '20-30 km/s', min: 20, max: 30, count: 0, color: 'bg-matrix-500' },
      { label: '30-40 km/s', min: 30, max: 40, count: 0, color: 'bg-status-warning' },
      { label: '40+ km/s', min: 40, max: Infinity, count: 0, color: 'bg-status-critical' }
    ];

    asteroidList.forEach(asteroid => {
      const velocity = parseFloat(asteroid.close_approach_data[0]?.relative_velocity?.kilometers_per_second || '0');
      const range = velocityRanges.find(r => velocity >= r.min && velocity < r.max);
      if (range) range.count++;
    });

    return velocityRanges;
  };

  const sizeData = getSizeDistribution();
  const velocityData = getVelocityDistribution();
  const maxSizeCount = Math.max(...sizeData.map(d => d.count));
  const maxVelocityCount = Math.max(...velocityData.map(d => d.count));
  
  const phaCount = asteroidList.filter(a => a.is_potentially_hazardous_asteroid).length;
  const phaPercentage = asteroidList.length > 0 ? (phaCount / asteroidList.length) * 100 : 0;

  return (
    <Card variant="glass" className="p-4">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-matrix-400">
            <BarChart3 className="w-5 h-5" />
            Scientific Analysis & Data Charts
          </CardTitle>
          <div className="flex items-center gap-2 text-xs text-stellar-light/60">
            <RefreshCw className={`w-3 h-3 ${isAnimating ? 'animate-spin' : ''}`} />
            <span>Updated: {lastUpdate.toLocaleTimeString()}</span>
          </div>
        </div>
        <p className="text-sm text-stellar-light/60">
          Live statistical analysis of {asteroidList.length} near-Earth objects
        </p>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Size Distribution Chart */}
        <div className="space-y-3">
          <h4 className="text-sm font-semibold text-stellar-light flex items-center gap-2">
            <PieChart className="w-4 h-4" />
            Size Distribution Analysis
          </h4>
          
          <div className="space-y-2">
            {sizeData.map((range, index) => (
              <motion.div
                key={range.label}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center gap-3"
              >
                <div className="w-16 text-xs text-stellar-light/70 font-mono">
                  {range.label}
                </div>
                
                <div className="flex-1 relative h-6 bg-stellar-surface/20 rounded-full overflow-hidden">
                  <motion.div
                    className={`h-full ${range.color} rounded-full`}
                    initial={{ width: 0 }}
                    animate={{ width: maxSizeCount > 0 ? `${(range.count / maxSizeCount) * 100}%` : '0%' }}
                    transition={{ duration: 1, delay: index * 0.1 }}
                  />
                  
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-xs font-bold text-white drop-shadow">
                      {range.count}
                    </span>
                  </div>
                </div>
                
                <div className="w-12 text-xs text-stellar-light/70 font-mono text-right">
                  {asteroidList.length > 0 ? ((range.count / asteroidList.length) * 100).toFixed(0) : 0}%
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Velocity Distribution Chart */}
        <div className="space-y-3">
          <h4 className="text-sm font-semibold text-stellar-light flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            Velocity Distribution Analysis
          </h4>
          
          <div className="space-y-2">
            {velocityData.map((range, index) => (
              <motion.div
                key={range.label}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 + 0.5 }}
                className="flex items-center gap-3"
              >
                <div className="w-20 text-xs text-stellar-light/70 font-mono">
                  {range.label}
                </div>
                
                <div className="flex-1 relative h-6 bg-stellar-surface/20 rounded-full overflow-hidden">
                  <motion.div
                    className={`h-full ${range.color} rounded-full`}
                    initial={{ width: 0 }}
                    animate={{ width: maxVelocityCount > 0 ? `${(range.count / maxVelocityCount) * 100}%` : '0%' }}
                    transition={{ duration: 1, delay: index * 0.1 + 0.5 }}
                  />
                  
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-xs font-bold text-white drop-shadow">
                      {range.count}
                    </span>
                  </div>
                </div>
                
                <div className="w-12 text-xs text-stellar-light/70 font-mono text-right">
                  {asteroidList.length > 0 ? ((range.count / asteroidList.length) * 100).toFixed(0) : 0}%
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* PHA Analysis */}
        <div className="space-y-3">
          <h4 className="text-sm font-semibold text-stellar-light flex items-center gap-2">
            <Activity className="w-4 h-4" />
            Potentially Hazardous Asteroids (PHA)
          </h4>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-4 rounded bg-status-critical/10 border border-status-critical/30">
              <div className="text-status-critical text-3xl font-bold font-mono mb-1">
                {phaCount}
              </div>
              <div className="text-sm text-stellar-light/80">PHAs Detected</div>
              <div className="text-xs text-stellar-light/60 mt-1">
                {phaPercentage.toFixed(1)}% of total
              </div>
            </div>
            
            <div className="text-center p-4 rounded bg-status-normal/10 border border-status-normal/30">
              <div className="text-status-normal text-3xl font-bold font-mono mb-1">
                {asteroidList.length - phaCount}
              </div>
              <div className="text-sm text-stellar-light/80">Non-Hazardous</div>
              <div className="text-xs text-stellar-light/60 mt-1">
                {(100 - phaPercentage).toFixed(1)}% of total
              </div>
            </div>
          </div>
          
          {/* PHA Percentage Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs text-stellar-light/70">
              <span>Risk Assessment</span>
              <span>{phaPercentage.toFixed(1)}% PHAs</span>
            </div>
            
            <div className="relative h-3 bg-stellar-surface/20 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-status-normal to-status-critical rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${phaPercentage}%` }}
                transition={{ duration: 1.5, delay: 1 }}
              />
            </div>
          </div>
        </div>

        {/* Scientific Summary */}
        <div className="p-3 rounded bg-matrix-500/10 border border-matrix-500/30">
          <div className="text-matrix-400 font-semibold text-sm mb-2">
            Statistical Summary
          </div>
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div>
              <span className="text-stellar-light/60">Mean diameter: </span>
              <span className="font-mono text-white">
                {asteroidList.length > 0 ? 
                  (asteroidList.reduce((sum, a) => sum + (a.estimated_diameter?.kilometers?.estimated_diameter_max || 0), 0) / asteroidList.length * 1000).toFixed(0) : 0
                }m
              </span>
            </div>
            <div>
              <span className="text-stellar-light/60">Mean velocity: </span>
              <span className="font-mono text-white">
                {asteroidList.length > 0 ? 
                  (asteroidList.reduce((sum, a) => sum + parseFloat(a.close_approach_data[0]?.relative_velocity?.kilometers_per_second || '0'), 0) / asteroidList.length).toFixed(1) : 0
                } km/s
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
'use client';

import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Radar, AlertTriangle, Target, Zap } from 'lucide-react';
import { QuickShareButton } from '@/components/ui/SocialSharing';

export function ThreatRadar() {
  const { asteroidList } = useAppStore();
  const [scanActive, setScanActive] = useState(true);
  const [pulseKey, setPulseKey] = useState(0);

  // Simulate radar scanning
  useEffect(() => {
    const interval = setInterval(() => {
      setPulseKey(prev => prev + 1);
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  // Calculate threat levels for asteroids
  const calculateThreatLevel = (asteroid: any) => {
    const diameter = asteroid.estimated_diameter.kilometers.estimated_diameter_max;
    const velocity = asteroid.close_approach_data[0]?.relative_velocity.kilometers_per_second || 20;
    const distance = parseFloat(asteroid.close_approach_data[0]?.miss_distance.kilometers || '1000000');
    
    // Simple threat calculation
    const sizeScore = Math.min(diameter * 100, 100);
    const velocityScore = Math.min(velocity * 2, 100);
    const proximityScore = Math.max(0, 100 - (distance / 10000));
    
    return Math.min((sizeScore + velocityScore + proximityScore) / 3, 100);
  };

  const threatsWithLevels = asteroidList.map(asteroid => ({
    ...asteroid,
    threatLevel: calculateThreatLevel(asteroid)
  })).sort((a, b) => b.threatLevel - a.threatLevel);

  const getThreatColor = (level: number) => {
    if (level > 80) return 'text-status-critical';
    if (level > 60) return 'text-status-warning';
    if (level > 40) return 'text-status-caution';
    return 'text-status-normal';
  };

  const getThreatBg = (level: number) => {
    if (level > 80) return 'bg-status-critical/10 border-status-critical/30';
    if (level > 60) return 'bg-status-warning/10 border-status-warning/30';
    if (level > 40) return 'bg-status-caution/10 border-status-caution/30';
    return 'bg-status-normal/10 border-status-normal/30';
  };

  return (
    <Card variant="glass" className="p-4" id="threat-radar">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-cyber-400">
            <motion.div
              key={pulseKey}
              animate={{ rotate: 360 }}
              transition={{ duration: 2, ease: "linear" }}
            >
              <Radar className="w-5 h-5" />
            </motion.div>
            Global Threat Radar
            <div className="flex items-center gap-1 ml-2">
              <motion.div
                className="w-2 h-2 rounded-full bg-cyber-400"
                animate={{ opacity: [0.3, 1, 0.3] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              />
              <span className="text-xs text-cyber-400">SCANNING</span>
            </div>
          </CardTitle>
          <QuickShareButton
            type="radar"
            data={threatsWithLevels.slice(0, 10)}
            elementId="threat-radar"
          />
        </div>
        <p className="text-sm text-stellar-light/60">
          Live threat assessment of {asteroidList.length} tracked near-Earth objects
        </p>
      </CardHeader>
      <CardContent>
        {/* Threat Summary Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="text-center p-3 rounded bg-status-critical/10 border border-status-critical/30">
            <div className="text-status-critical text-2xl font-bold font-mono">
              {threatsWithLevels.filter(t => t.threatLevel > 80).length}
            </div>
            <div className="text-xs text-stellar-light/60 mt-1">Extreme Threats</div>
          </div>
          
          <div className="text-center p-3 rounded bg-status-warning/10 border border-status-warning/30">
            <div className="text-status-warning text-2xl font-bold font-mono">
              {threatsWithLevels.filter(t => t.threatLevel > 60 && t.threatLevel <= 80).length}
            </div>
            <div className="text-xs text-stellar-light/60 mt-1">High Threats</div>
          </div>
          
          <div className="text-center p-3 rounded bg-status-caution/10 border border-status-caution/30">
            <div className="text-status-caution text-2xl font-bold font-mono">
              {threatsWithLevels.filter(t => t.threatLevel > 40 && t.threatLevel <= 60).length}
            </div>
            <div className="text-xs text-stellar-light/60 mt-1">Moderate Threats</div>
          </div>
          
          <div className="text-center p-3 rounded bg-status-normal/10 border border-status-normal/30">
            <div className="text-status-normal text-2xl font-bold font-mono">
              {threatsWithLevels.filter(t => t.threatLevel <= 40).length}
            </div>
            <div className="text-xs text-stellar-light/60 mt-1">Low Threats</div>
          </div>
        </div>

        {/* Threat List */}
        <div className="space-y-2 max-h-60 overflow-y-auto">
          {threatsWithLevels.slice(0, 10).map((asteroid, index) => (
            <motion.div
              key={asteroid.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`flex items-center justify-between p-3 rounded border ${getThreatBg(asteroid.threatLevel)}`}
            >
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <AlertTriangle className={`w-4 h-4 ${getThreatColor(asteroid.threatLevel)}`} />
                  <span className="text-sm font-semibold text-white">
                    {asteroid.name}
                  </span>
                </div>
                
                <div className="flex gap-4 text-xs text-stellar-light/70">
                  <span>
                    ⌀ {(asteroid.estimated_diameter.kilometers.estimated_diameter_max * 1000).toFixed(0)}m
                  </span>
                  <span>
                    🚀 {parseFloat(asteroid.close_approach_data[0]?.relative_velocity.kilometers_per_second || '0').toFixed(1)} km/s
                  </span>
                  <span>
                    📅 {new Date(asteroid.close_approach_data[0]?.close_approach_date).toLocaleDateString()}
                  </span>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <div className={`text-right font-mono ${getThreatColor(asteroid.threatLevel)}`}>
                  <div className="text-lg font-bold">
                    {asteroid.threatLevel.toFixed(0)}%
                  </div>
                  <div className="text-xs text-stellar-light/60">threat</div>
                </div>
                
                <Target className="w-4 h-4 text-stellar-light/40" />
              </div>
            </motion.div>
          ))}
        </div>

        {threatsWithLevels.length > 10 && (
          <div className="mt-3 text-center text-xs text-stellar-light/60">
            Showing top 10 threats of {threatsWithLevels.length} tracked objects
          </div>
        )}
      </CardContent>
    </Card>
  );
}
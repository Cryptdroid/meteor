'use client';

import { motion } from 'framer-motion';
import { useAppStore } from '@/store/useAppStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Target, Zap, Calendar } from 'lucide-react';

interface TopThreatCardProps {
  asteroid: any;
  rank: number;
}

export function TopThreatCard({ asteroid, rank }: TopThreatCardProps) {
  const { setSelectedAsteroid, setImpactParameters } = useAppStore();

  if (!asteroid) {
    return (
      <Card variant="outline" className="p-4 h-48">
        <CardContent className="flex items-center justify-center h-full">
          <div className="text-center text-stellar-light/50">
            <Target className="w-8 h-8 mx-auto mb-2" />
            <p className="text-sm">No threat detected</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const calculateThreatLevel = (asteroid: any) => {
    const diameter = asteroid.estimated_diameter.kilometers.estimated_diameter_max;
    const velocity = parseFloat(asteroid.close_approach_data[0]?.relative_velocity.kilometers_per_second || '20');
    const distance = parseFloat(asteroid.close_approach_data[0]?.miss_distance.kilometers || '1000000');
    
    const sizeScore = Math.min(diameter * 100, 100);
    const velocityScore = Math.min(velocity * 2, 100);
    const proximityScore = Math.max(0, 100 - (distance / 10000));
    
    return Math.min((sizeScore + velocityScore + proximityScore) / 3, 100);
  };

  const threatLevel = calculateThreatLevel(asteroid);
  
  const getThreatColor = (level: number) => {
    if (level > 80) return 'status-critical';
    if (level > 60) return 'status-warning';
    if (level > 40) return 'status-caution';
    return 'status-normal';
  };

  const getThreatLabel = (level: number) => {
    if (level > 80) return 'EXTREME';
    if (level > 60) return 'HIGH';
    if (level > 40) return 'MODERATE';
    return 'LOW';
  };

  const handleSimulate = () => {
    setSelectedAsteroid(asteroid);
    // Set impact parameters for a major city scenario
    setImpactParameters({
      size: asteroid.estimated_diameter.kilometers.estimated_diameter_max * 1000,
      density: asteroid.is_potentially_hazardous_asteroid ? 3000 : 2500,
      velocity: parseFloat(asteroid.close_approach_data[0]?.relative_velocity.kilometers_per_second || '20'),
      angle: 45,
      impactLocation: { lat: 40.7128, lng: -74.0060 } // NYC as default major city
    });
  };

  const threatColorClass = getThreatColor(threatLevel);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: rank * 0.1 }}
    >
      <Card variant="glass" className={`p-4 border-${threatColorClass}/30 hover:border-${threatColorClass}/50 transition-colors`}>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className={`w-6 h-6 rounded-full bg-${threatColorClass}/20 flex items-center justify-center`}>
                <span className={`text-${threatColorClass} font-bold text-sm`}>#{rank}</span>
              </div>
              <CardTitle className="text-sm font-semibold text-white truncate">
                {asteroid.name}
              </CardTitle>
            </div>
            <AlertTriangle className={`w-4 h-4 text-${threatColorClass}`} />
          </div>
          
          <div className={`inline-flex px-2 py-1 rounded-full text-xs font-bold bg-${threatColorClass}/20 text-${threatColorClass}`}>
            {getThreatLabel(threatLevel)} THREAT
          </div>
        </CardHeader>
        
        <CardContent className="space-y-3">
          {/* Key Metrics */}
          <div className="grid grid-cols-2 gap-2">
            <div className="text-center p-2 rounded bg-stellar-surface/20">
              <div className="text-cyber-400 text-lg font-bold font-mono">
                {(asteroid.estimated_diameter.kilometers.estimated_diameter_max * 1000).toFixed(0)}m
              </div>
              <div className="text-xs text-stellar-light/60">Diameter</div>
            </div>
            
            <div className="text-center p-2 rounded bg-stellar-surface/20">
              <div className="text-matrix-400 text-lg font-bold font-mono">
                {parseFloat(asteroid.close_approach_data[0]?.relative_velocity.kilometers_per_second || '0').toFixed(1)}
              </div>
              <div className="text-xs text-stellar-light/60">km/s</div>
            </div>
          </div>

          {/* Threat Level Indicator */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-stellar-light/60">Threat Level</span>
              <span className={`font-mono font-bold text-${threatColorClass}`}>
                {threatLevel.toFixed(0)}%
              </span>
            </div>
            
            <div className="relative h-2 bg-stellar-surface/30 rounded-full overflow-hidden">
              <motion.div
                className={`h-full bg-${threatColorClass} rounded-full`}
                initial={{ width: 0 }}
                animate={{ width: `${threatLevel}%` }}
                transition={{ duration: 1, delay: rank * 0.1 }}
              />
            </div>
          </div>

          {/* Approach Date */}
          <div className="flex items-center gap-2 text-xs text-stellar-light/70">
            <Calendar className="w-3 h-3" />
            <span>
              Closest: {new Date(asteroid.close_approach_data[0]?.close_approach_date).toLocaleDateString()}
            </span>
          </div>

          {/* Quick Simulate Button */}
          <Button
            variant="neon"
            size="sm"
            onClick={handleSimulate}
            className="w-full gap-2"
          >
            <Zap className="w-3 h-3" />
            Simulate Impact
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
}
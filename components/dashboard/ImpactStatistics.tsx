'use client';

import { motion } from 'framer-motion';
import { 
  CircularGauge, 
  LinearGauge, 
  ThreatLevelIndicator 
} from '@/components/ui/DataVisualization';
import { 
  AlertTriangle, 
  Zap, 
  Target, 
  Users, 
  Globe,
  Mountain,
  Waves,
  ThermometerSun,
  Wind
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface ImpactStatisticsProps {
  asteroidData: {
    diameter: number;
    velocity: number;
    mass: number;
    composition: string;
  };
  impactResults: {
    kineticEnergy: number;
    craterDiameter: number;
    casualties: number;
    affectedArea: number;
    seismicMagnitude: number;
    airblast: number;
    thermalEffects: number;
    debris: number;
  };
  threatLevel: 'minimal' | 'low' | 'moderate' | 'high' | 'extreme';
}

export function ImpactStatistics({ 
  asteroidData, 
  impactResults, 
  threatLevel 
}: ImpactStatisticsProps) {
  
  // Determine color coding based on values
  const getEnergyColor = (energy: number) => {
    if (energy < 1000) return 'normal';
    if (energy < 10000) return 'cyber';
    if (energy < 100000) return 'warning';
    return 'critical';
  };

  const getCasualtiesColor = (casualties: number) => {
    if (casualties < 1000) return 'normal';
    if (casualties < 100000) return 'warning';
    return 'critical';
  };

  const getSizeColor = (diameter: number) => {
    if (diameter < 50) return 'cyber';
    if (diameter < 200) return 'warning';
    return 'critical';
  };

  const getThreatDescription = (level: string) => {
    switch (level) {
      case 'minimal':
        return 'Impact would cause minimal local damage. Suitable for scientific observation and public education.';
      case 'low':
        return 'Limited regional effects. Moderate property damage in impact zone with minimal casualties.';
      case 'moderate':
        return 'Significant regional destruction. Major urban damage if populated area is hit.';
      case 'high':
        return 'Catastrophic regional effects. Massive destruction across multiple cities and provinces.';
      case 'extreme':
        return 'Global catastrophe. Worldwide climate effects, mass extinctions, and civilization-ending damage.';
      default:
        return 'Impact assessment pending...';
    }
  };

  return (
    <div className="space-y-4">
      {/* Threat Level Assessment */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <ThreatLevelIndicator 
          level={threatLevel}
          description={getThreatDescription(threatLevel)}
        />
      </motion.div>

      {/* Primary Impact Metrics */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        <Card variant="glass" className="p-4">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-cyber-400">
              <Zap className="w-5 h-5" />
              Primary Impact Assessment
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <CircularGauge
                value={impactResults.kineticEnergy}
                max={1000000}
                label="Kinetic Energy"
                unit="MT TNT"
                color={getEnergyColor(impactResults.kineticEnergy)}
                icon={Zap}
                size="lg"
              />
              
              <CircularGauge
                value={asteroidData.diameter}
                max={1000}
                label="Asteroid Size"
                unit="m"
                color={getSizeColor(asteroidData.diameter)}
                icon={Mountain}
                size="lg"
              />
              
              <CircularGauge
                value={impactResults.casualties}
                max={10000000}
                label="Est. Casualties"
                unit=""
                color={getCasualtiesColor(impactResults.casualties)}
                icon={Users}
                size="lg"
              />
              
              <CircularGauge
                value={impactResults.craterDiameter}
                max={50000}
                label="Crater Diameter"
                unit="m"
                color="matrix"
                icon={Target}
                size="lg"
              />
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Detailed Effects Analysis */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
      >
        <Card variant="glass" className="p-4">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-matrix-400">
              <Globe className="w-5 h-5" />
              Environmental Effects Analysis
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <LinearGauge
                value={impactResults.seismicMagnitude}
                max={10}
                label="Seismic Magnitude"
                unit=" Richter"
                color="warning"
                icon={Mountain}
              />
              
              <LinearGauge
                value={impactResults.airblast}
                max={100}
                label="Airblast Pressure"
                unit=" PSI"
                color="critical"
                icon={Wind}
              />
              
              <LinearGauge
                value={impactResults.thermalEffects}
                max={1000}
                label="Thermal Radiation"
                unit=" km range"
                color="warning"
                icon={ThermometerSun}
              />
              
              <LinearGauge
                value={impactResults.debris}
                max={10000}
                label="Debris Field"
                unit=" km²"
                color="cyber"
                icon={Waves}
              />
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Asteroid Physical Properties */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.6 }}
      >
        <Card variant="glass" className="p-4">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-cyber-400">
              <Mountain className="w-5 h-5" />
              Asteroid Physical Properties
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="space-y-2">
                <div className="text-stellar-light/60 text-sm font-medium">Mass</div>
                <div className="text-cyber-400 text-xl font-bold font-mono">
                  {(asteroidData.mass / 1e12).toFixed(2)} 
                  <span className="text-xs text-stellar-light/60 ml-1">GT</span>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="text-stellar-light/60 text-sm font-medium">Velocity</div>
                <div className="text-matrix-400 text-xl font-bold font-mono">
                  {(asteroidData.velocity / 1000).toFixed(1)}
                  <span className="text-xs text-stellar-light/60 ml-1">km/s</span>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="text-stellar-light/60 text-sm font-medium">Composition</div>
                <div className="text-status-warning text-xl font-bold">
                  {asteroidData.composition}
                </div>
              </div>
            </div>
            
            {/* Affected Area Visualization */}
            <div className="mt-6 pt-6 border-t border-stellar-surface/30">
              <div className="flex items-center justify-between mb-3">
                <span className="text-stellar-light/80 font-medium">Total Affected Area</span>
                <span className="text-status-warning font-bold font-mono">
                  {(impactResults.affectedArea / 1000).toFixed(0)}K km²
                </span>
              </div>
              
              <div className="relative h-4 bg-stellar-surface/30 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-status-warning to-status-critical rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(100, (impactResults.affectedArea / 100000) * 100)}%` }}
                  transition={{ duration: 2, ease: [0.23, 1, 0.32, 1] }}
                />
                
                <motion.div
                  className="absolute top-0 h-full bg-gradient-to-r from-status-warning to-status-critical rounded-full opacity-50 blur-sm"
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(100, (impactResults.affectedArea / 100000) * 100)}%` }}
                  transition={{ duration: 2, ease: [0.23, 1, 0.32, 1] }}
                />
              </div>
              
              <div className="flex justify-between text-xs text-stellar-light/60 font-mono mt-2">
                <span>0 km²</span>
                <span>100K km²</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
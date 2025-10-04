'use client';

import { motion } from 'framer-motion';
import { useAppStore } from '@/store/useAppStore';
import { Card, CardContent } from '@/components/ui/card';
import { AlertTriangle, Calculator, Target } from 'lucide-react';
import { ImpactStatistics } from './ImpactStatistics';
import LoadingScreen from '@/components/ui/LoadingScreen';

export default function ImpactResults() {
  const { simulationResults, selectedAsteroid, isSimulating } = useAppStore();

  if (!simulationResults && !isSimulating) {
    return (
      <Card variant="glass" className="h-full flex items-center justify-center">
        <CardContent className="py-12 text-center text-stellar-light/60">
          <Target className="w-16 h-16 mx-auto mb-4 opacity-30" />
          <h3 className="text-lg font-semibold mb-2 text-white">Ready for Impact Analysis</h3>
          <p>Select an asteroid and run a simulation to see detailed impact results</p>
        </CardContent>
      </Card>
    );
  }

  if (isSimulating) {
    return (
      <Card variant="glass" className="h-full flex items-center justify-center">
        <CardContent className="py-12 text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="w-16 h-16 mx-auto mb-6 border-4 border-cyber-500 border-t-transparent rounded-full"
          />
          <div className="flex items-center justify-center gap-2 mb-2">
            <Calculator className="w-5 h-5 text-cyber-400" />
            <span className="font-semibold text-white">Computing Impact Effects</span>
          </div>
          <p className="text-stellar-light/60">Analyzing collision dynamics and environmental consequences...</p>
        </CardContent>
      </Card>
    );
  }

  const { energy, crater, seismic, tsunami, atmospheric, casualties, terrainType, elevation, populationDensity, nearestCity } = simulationResults!;

  // Determine threat level based on energy and casualties
  const getThreatLevel = () => {
    const energyMT = energy.megatonsTNT;
    const casualtyCount = casualties?.estimated || 0;
    
    if (energyMT > 100000 || casualtyCount > 1000000) return 'extreme';
    if (energyMT > 10000 || casualtyCount > 100000) return 'high';
    if (energyMT > 1000 || casualtyCount > 10000) return 'moderate';
    if (energyMT > 100 || casualtyCount > 1000) return 'low';
    return 'minimal';
  };

  // Prepare data for the enhanced statistics component
  const asteroidData = selectedAsteroid ? {
    diameter: selectedAsteroid.estimated_diameter.kilometers.estimated_diameter_max * 1000, // Convert to meters
    velocity: 30000, // Default velocity in m/s, could be enhanced with real data
    mass: Math.pow((selectedAsteroid.estimated_diameter.kilometers.estimated_diameter_max * 1000) / 2, 3) * (4/3) * Math.PI * 2700, // Rough mass calculation
    composition: selectedAsteroid.is_potentially_hazardous_asteroid ? 'Rocky (PHO)' : 'Rocky'
  } : {
    diameter: 100,
    velocity: 30000,
    mass: 1.4e12,
    composition: 'Rocky'
  };

  const impactResults = {
    kineticEnergy: energy.megatonsTNT,
    craterDiameter: crater.diameter,
    casualties: casualties?.estimated || 0,
    affectedArea: Math.PI * Math.pow(seismic.radius, 2), // Area affected by seismic activity
    seismicMagnitude: seismic.magnitude,
    airblast: atmospheric.overpressure || 0,
    thermalEffects: atmospheric.thermalRadiation,
    debris: atmospheric.fireballRadius * 100 // Estimated debris field
  };

  return (
    <div className="space-y-6">
      <ImpactStatistics
        asteroidData={asteroidData}
        impactResults={impactResults}
        threatLevel={getThreatLevel()}
      />
      
      {/* Additional Impact Location Details */}
      {terrainType && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
        >
          <Card variant="glass" className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <Target className="w-5 h-5 text-cyber-400" />
              <h3 className="text-lg font-semibold text-white">Impact Site Analysis</h3>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="space-y-2">
                <div className="text-stellar-light/60 text-sm font-medium">Terrain Type</div>
                <div className="text-cyber-400 text-lg font-bold capitalize">{terrainType}</div>
              </div>
              
              {elevation !== undefined && (
                <div className="space-y-2">
                  <div className="text-stellar-light/60 text-sm font-medium">Elevation</div>
                  <div className="text-matrix-400 text-lg font-bold font-mono">
                    {elevation.toFixed(0)}
                    <span className="text-xs text-stellar-light/60 ml-1">m</span>
                  </div>
                </div>
              )}
              
              {populationDensity !== undefined && (
                <div className="space-y-2">
                  <div className="text-stellar-light/60 text-sm font-medium">Population Density</div>
                  <div className="text-status-warning text-lg font-bold font-mono">
                    {populationDensity.toFixed(0)}
                    <span className="text-xs text-stellar-light/60 ml-1">/km²</span>
                  </div>
                </div>
              )}
              
              {nearestCity && (
                <div className="space-y-2">
                  <div className="text-stellar-light/60 text-sm font-medium">Nearest City</div>
                  <div className="text-status-critical text-lg font-bold">{nearestCity}</div>
                </div>
              )}
            </div>
          </Card>
        </motion.div>
      )}
    </div>
  );
}

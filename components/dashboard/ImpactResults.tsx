'use client';

import { motion } from 'framer-motion';
import { useAppStore } from '@/store/useAppStore';
import { Card, CardContent } from '@/components/ui/card';
import { AlertTriangle, Calculator, Target } from 'lucide-react';
import { ImpactStatistics } from './ImpactStatistics';
import LoadingScreen from '@/components/ui/LoadingScreen';
import { QuickShareButton } from '@/components/ui/SocialSharing';
import InfoTooltip from '@/components/ui/InfoTooltip';
import { formatLargeNumber } from '@/lib/number-utils';

export default function ImpactResults() {
  const { simulationResults, selectedAsteroid, isSimulating, impactParameters } = useAppStore();

  if (!simulationResults && !isSimulating) {
    return (
      <Card variant="glass" className="p-4">
        <div className="flex items-center gap-3 mb-3">
          <Target className="w-5 h-5 text-cyber-400" />
          <h3 className="text-lg font-semibold text-white">Impact Parameters</h3>
        </div>
        
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-3 rounded bg-stellar-surface/20">
              <div className="text-cyber-400 text-xl font-bold font-mono">
                {impactParameters.size.toLocaleString()}
              </div>
              <div className="text-xs text-stellar-light/60 mt-1">meters diameter</div>
            </div>
            
            <div className="text-center p-3 rounded bg-stellar-surface/20">
              <div className="text-matrix-400 text-xl font-bold font-mono">
                {impactParameters.density.toLocaleString()}
              </div>
              <div className="text-xs text-stellar-light/60 mt-1">kg/m³ density</div>
            </div>
            
            <div className="text-center p-3 rounded bg-stellar-surface/20">
              <div className="text-status-warning text-xl font-bold font-mono">
                {impactParameters.velocity}
              </div>
              <div className="text-xs text-stellar-light/60 mt-1">km/s velocity</div>
            </div>
            
            <div className="text-center p-3 rounded bg-stellar-surface/20">
              <div className="text-status-caution text-xl font-bold font-mono">
                {impactParameters.angle}°
              </div>
              <div className="text-xs text-stellar-light/60 mt-1">entry angle</div>
            </div>
          </div>
          
          <div className="text-center p-3 rounded bg-cyber-500/10 border border-cyber-500/30">
            <div className="text-cyber-400 font-mono text-sm">
              Impact Location: {impactParameters.impactLocation.lat.toFixed(2)}°, {impactParameters.impactLocation.lng.toFixed(2)}°
            </div>
          </div>
          
          {selectedAsteroid && (
            <div className="text-center p-2 rounded bg-matrix-500/10 border border-matrix-500/30">
              <div className="text-matrix-400 text-sm font-medium">
                Selected: {selectedAsteroid.name}
              </div>
            </div>
          )}
        </div>
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
    <div className="space-y-4">
      {/* Compact Impact Summary */}
      <Card variant="glass" className="p-4" id="impact-results">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <AlertTriangle className={`w-5 h-5 ${
              getThreatLevel() === 'extreme' ? 'text-status-critical' :
              getThreatLevel() === 'high' ? 'text-status-warning' :
              getThreatLevel() === 'moderate' ? 'text-status-caution' :
              'text-cyber-400'
            }`} />
            <h3 className="text-lg font-semibold text-white">Impact Analysis Results</h3>
          </div>
          <QuickShareButton
            type="impact"
            data={{
              simulationResults,
              asteroidName: selectedAsteroid?.name || 'Unknown Asteroid'
            }}
            elementId="impact-results"
          />
          <div className={`px-3 py-1 rounded-full text-xs font-bold ${
            getThreatLevel() === 'extreme' ? 'bg-status-critical/20 text-status-critical' :
            getThreatLevel() === 'high' ? 'bg-status-warning/20 text-status-warning' :
            getThreatLevel() === 'moderate' ? 'bg-status-caution/20 text-status-caution' :
            'bg-cyber-500/20 text-cyber-400'
          }`}>
            {getThreatLevel().toUpperCase()} THREAT
          </div>
        </div>
        
        {/* Impact Metrics Grid - 2x2 Layout */}
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-4 rounded bg-stellar-surface/20 border border-cyber-500/20">
            <div className="text-cyber-400 text-2xl font-bold font-mono mb-1">
              {energy.megatonsTNT.toFixed(1)}
            </div>
            <div className="text-sm text-stellar-light/80 font-medium">MT TNT</div>
            <div className="text-xs text-stellar-light/60 mt-1 flex items-center justify-center">
              Kinetic Energy
              <InfoTooltip termKey="impact_energy" size="sm" />
            </div>
          </div>
          
          <div className="text-center p-4 rounded bg-stellar-surface/20 border border-matrix-500/20">
            <div className="text-matrix-400 text-2xl font-bold font-mono mb-1">
              {(crater.diameter / 1000).toFixed(1)}
            </div>
            <div className="text-sm text-stellar-light/80 font-medium">km diameter</div>
            <div className="text-xs text-stellar-light/60 mt-1 flex items-center justify-center">
              Crater Size
              <InfoTooltip termKey="crater_diameter" size="sm" />
            </div>
          </div>
          
          <div className="text-center p-4 rounded bg-stellar-surface/20 border border-status-warning/20">
            <div className="text-status-warning text-2xl font-bold font-mono mb-1">
              {seismic.magnitude.toFixed(1)}
            </div>
            <div className="text-sm text-stellar-light/80 font-medium">magnitude</div>
            <div className="text-xs text-stellar-light/60 mt-1 flex items-center justify-center">
              Seismic Impact
              <InfoTooltip termKey="seismic_magnitude" size="sm" />
            </div>
          </div>
          
          <div className="text-center p-4 rounded bg-stellar-surface/20 border border-status-critical/20">
            <div className="text-status-critical text-2xl font-bold font-mono mb-1">
              {casualties?.estimated ? formatLargeNumber(casualties.estimated) : '0'}
            </div>
            <div className="text-sm text-stellar-light/80 font-medium">casualties</div>
            <div className="text-xs text-stellar-light/60 mt-1">Estimated Impact</div>
          </div>
        </div>
        
        {/* Secondary Effects */}
        <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t border-stellar-surface/30">
          <div className="text-center p-3 rounded bg-stellar-deep/30">
            <div className="text-cyber-400 text-xl font-bold font-mono mb-1">
              {atmospheric.thermalRadiation.toFixed(0)} km
            </div>
            <div className="text-sm text-stellar-light/80 flex items-center justify-center">
              Thermal Radius
              <InfoTooltip termKey="thermal_radiation" size="sm" />
            </div>
          </div>
          
          <div className="text-center p-3 rounded bg-stellar-deep/30">
            <div className="text-matrix-400 text-xl font-bold font-mono mb-1">
              {atmospheric.fireballRadius.toFixed(1)} km
            </div>
            <div className="text-sm text-stellar-light/80 flex items-center justify-center">
              Fireball Radius
              <InfoTooltip termKey="fireball_radius" size="sm" />
            </div>
          </div>
        </div>
      </Card>
      
      {/* Additional Impact Location Details */}
      {terrainType && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
        >
          <Card variant="glass" className="p-4">
            <div className="flex items-center gap-3 mb-3">
              <Target className="w-5 h-5 text-cyber-400" />
              <h3 className="font-semibold text-white">Impact Site</h3>
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="text-center">
                <div className="text-cyber-400 font-bold capitalize">{terrainType}</div>
                <div className="text-xs text-stellar-light/60">Terrain</div>
              </div>
              
              {elevation !== undefined && (
                <div className="text-center">
                  <div className="text-matrix-400 font-bold font-mono">
                    {elevation.toFixed(0)}m
                  </div>
                  <div className="text-xs text-stellar-light/60">Elevation</div>
                </div>
              )}
              
              {populationDensity !== undefined && (
                <div className="text-center">
                  <div className="text-status-warning font-bold font-mono">
                    {populationDensity.toFixed(0)}/km²
                  </div>
                  <div className="text-xs text-stellar-light/60">Population</div>
                </div>
              )}
              
              {nearestCity && (
                <div className="text-center">
                  <div className="text-status-critical font-bold">{nearestCity}</div>
                  <div className="text-xs text-stellar-light/60">Nearest City</div>
                </div>
              )}
            </div>
          </Card>
        </motion.div>
      )}
    </div>
  );
}

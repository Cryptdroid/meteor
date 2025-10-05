'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from '@/store/useAppStore';
import { NASAService } from '@/lib/nasa-service';
import { 
  Satellite, 
  Target, 
  Globe, 
  Activity, 
  AlertTriangle, 
  Zap,
  Eye,
  EyeOff,
  Maximize2,
  Minimize2,
  ArrowLeft
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardMetric } from '@/components/ui/card';
import AsteroidList from './AsteroidList';
import ControlPanel from './ControlPanel';
import ImpactResults from './ImpactResults';
import ImpactMap from './ImpactMap';
import RealisticOrbitalView from '../3d/RealisticOrbitalView';
import { RealTimeDataPanel } from './RealTimeDataPanel';
import { ThreatRadar } from './ThreatRadar';
import { TopThreatCard } from './TopThreatCard';


import { HistoricalComparison } from './HistoricalComparison';
import { ScientificChartsPanel } from './ScientificChartsPanel';

export default function UnifiedSimulationView() {
  const { 
    selectedAsteroid, 
    simulationResults, 
    isSimulating,
    asteroidList,
    setAsteroidList,
    setSelectedAsteroid,
    setSimulationResults
  } = useAppStore();
  
  const [viewMode, setViewMode] = useState<'overview' | '3d-focus' | 'data-focus'>('overview');
  const [showOrbitalView, setShowOrbitalView] = useState(true);

  const handleBackToSelection = () => {
    setSimulationResults(null);
    setSelectedAsteroid(null);
  };

  useEffect(() => {
    loadAsteroids();
  }, []);

  const loadAsteroids = async () => {
    const today = new Date();
    const nextWeek = new Date(today);
    nextWeek.setDate(nextWeek.getDate() + 7);

    const startDate = today.toISOString().split('T')[0];
    const endDate = nextWeek.toISOString().split('T')[0];

    const asteroids = await NASAService.fetchNearEarthObjects(startDate, endDate);
    setAsteroidList(asteroids);
  };

  const getSimulationStatus = () => {
    if (isSimulating) {
      return { status: 'warning', label: 'SIMULATION RUNNING', color: 'text-status-warning' };
    }
    if (simulationResults) {
      const energy = simulationResults.energy.megatonsTNT;
      if (energy > 100) return { status: 'critical', label: 'EXTREME THREAT', color: 'text-status-critical' };
      if (energy > 10) return { status: 'warning', label: 'HIGH THREAT', color: 'text-status-warning' };
      if (energy > 1) return { status: 'caution', label: 'MODERATE THREAT', color: 'text-status-caution' };
      return { status: 'normal', label: 'LOW THREAT', color: 'text-status-normal' };
    }
    return { status: 'normal', label: 'SYSTEM READY', color: 'text-cyber-400' };
  };

  const status = getSimulationStatus();

  // Helper to get top threats sorted by threat level
  const getTopThreats = () => {
    const getThreatLevel = (ast: any) => {
      const diameter = ast.estimated_diameter?.kilometers?.estimated_diameter_max || 0;
      const velocity = parseFloat(ast.close_approach_data[0]?.relative_velocity?.kilometers_per_second || '20');
      const distance = parseFloat(ast.close_approach_data[0]?.miss_distance?.kilometers || '1000000');
      const sizeScore = Math.min(diameter * 100, 100);
      const velocityScore = Math.min(velocity * 2, 100);
      const proximityScore = Math.max(0, 100 - (distance / 10000));
      return Math.min((sizeScore + velocityScore + proximityScore) / 3, 100);
    };
    
    return [...asteroidList].sort((a, b) => getThreatLevel(b) - getThreatLevel(a));
  };

  const topThreats = getTopThreats();

  return (
    <div className="container mx-auto px-3 sm:px-4 lg:px-6">
      {/* Simulation Status Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-3 sm:mb-4"
      >
        <Card variant="glass" className="p-3 sm:p-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
            {/* Status Information */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3">
                <div className={`w-4 h-4 rounded-full animate-pulse ${
                  status.status === 'critical' ? 'bg-status-critical shadow-lg shadow-status-critical/50' :
                  status.status === 'warning' ? 'bg-status-warning shadow-lg shadow-status-warning/50' :
                  status.status === 'caution' ? 'bg-status-caution shadow-lg shadow-status-caution/50' :
                  'bg-status-normal shadow-lg shadow-status-normal/50'
                }`} />
                <span className={`font-bold font-mono tracking-wider ${status.color}`}>
                  {status.label}
                </span>
              </div>
              
              {selectedAsteroid && (
                <div className="text-stellar-light">
                  <span className="text-stellar-light/60 text-sm">Target: </span>
                  <span className="font-semibold">{selectedAsteroid.name}</span>
                </div>
              )}
            </div>

            {/* View Mode Controls */}
            <div className="flex flex-wrap gap-1 sm:gap-2">
              <Button
                variant={viewMode === 'overview' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('overview')}
                className="gap-1 sm:gap-2 text-xs sm:text-sm"
              >
                <Globe className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="hidden xs:inline">Overview</span>
              </Button>
              
              <Button
                variant={viewMode === '3d-focus' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('3d-focus')}
                className="gap-1 sm:gap-2 text-xs sm:text-sm"
              >
                <Satellite className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="hidden xs:inline">3D</span>
              </Button>
              
              <Button
                variant={viewMode === 'data-focus' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('data-focus')}
                className="gap-1 sm:gap-2 text-xs sm:text-sm"
              >
                <Activity className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="hidden xs:inline">Data</span>
              </Button>
            </div>
          </div>

          {/* Quick Stats */}
          {simulationResults && (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mt-4 pt-4 border-t border-stellar-surface/20">
              <CardMetric 
                label="Impact Energy" 
                value={`${simulationResults.energy.megatonsTNT.toFixed(1)}MT`}
                trend={simulationResults.energy.megatonsTNT > 10 ? 'up' : simulationResults.energy.megatonsTNT > 1 ? 'neutral' : 'down'}
              />
              <CardMetric 
                label="Crater Diameter" 
                value={`${(simulationResults.crater.diameter / 1000).toFixed(1)}km`}
              />
              <CardMetric 
                label="Seismic Magnitude" 
                value={simulationResults.seismic.magnitude.toFixed(1)}
              />
              <CardMetric 
                label="Affected Population" 
                value={simulationResults.casualties?.affectedPopulation 
                  ? (simulationResults.casualties.affectedPopulation / 1000000).toFixed(1) + 'M'
                  : 'Unknown'
                }
                trend={simulationResults.casualties?.affectedPopulation && simulationResults.casualties.affectedPopulation > 1000000 ? 'up' : 'neutral'}
              />
            </div>
          )}
        </Card>
      </motion.div>

      {/* Main Content Layout */}
      <AnimatePresence mode="wait">
        <motion.div
          key={viewMode}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
        >
          {viewMode === 'overview' && (
            <>
              {!simulationResults ? (
                // Pre-simulation: Mission Control Dashboard Layout
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 sm:gap-4">
                  {/* Threat Radar - Full width on all screens */}
                  <div className="lg:col-span-12">
                    <ThreatRadar />
                  </div>
                  
                  {/* Mobile-first responsive layout */}
                  <div className="lg:col-span-4 order-2 lg:order-1">
                    <AsteroidList />
                  </div>
                  <div className="lg:col-span-8 order-1 lg:order-2">
                    <ImpactMap />
                  </div>
                  <div className="lg:col-span-4 order-3">
                    <ControlPanel />
                  </div>
                  
                </div>
              ) : (
                // Post-simulation: Impact Summary Dashboard
                <div className="space-y-3 sm:space-y-4">
                  {/* Back Button */}
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    <Button
                      variant="outline"
                      onClick={handleBackToSelection}
                      className="gap-2 mb-3 sm:mb-4 w-full sm:w-auto"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      New Simulation
                    </Button>
                  </motion.div>

                  {/* Impact Summary Dashboard */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
                    <ImpactResults />
                    <ImpactMap />
                  </div>
                  
                  {/* Historical Comparison */}
                  <HistoricalComparison />
                  
                  {/* Optional 3D View */}
                  {showOrbitalView && (
                    <Card variant="glass" className="h-[400px]">
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <CardTitle className="flex items-center gap-2">
                            <Target className="w-5 h-5 text-cyber-400" />
                            Orbital Mechanics
                          </CardTitle>
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            onClick={() => setViewMode('3d-focus')}
                          >
                            <Maximize2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent className="h-[calc(100%-4rem)]">
                        <div className="h-full">
                          <RealisticOrbitalView embedded />
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>
              )}
            </>
          )}

          {viewMode === '3d-focus' && (
            <div className="space-y-4">
              <Card variant="glass" className="h-[calc(100vh-14rem)]">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <Satellite className="w-5 h-5 text-cyber-400" />
                      3D Orbital Simulation
                    </CardTitle>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => setViewMode('overview')}
                    >
                      <Minimize2 className="w-4 h-4" />
                    </Button>
                  </div>
                  {selectedAsteroid && (
                    <p className="text-stellar-light/70">
                      Analyzing trajectory for {selectedAsteroid.name}
                    </p>
                  )}
                </CardHeader>
                <CardContent className="h-[calc(100%-5rem)]">
                  <RealisticOrbitalView embedded />
                </CardContent>
              </Card>
              
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <AsteroidList />
                <ControlPanel />
                <ImpactResults />
              </div>
            </div>
          )}

          {viewMode === 'data-focus' && (
            // Data Focus: Scientific Analysis Lab Layout
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
              {/* Global Detection Network Status */}
              <div className="lg:col-span-5">
                <RealTimeDataPanel />
              </div>
              
              {/* Asteroid Database & Composition */}
              <div className="lg:col-span-7">
                <Card variant="glass" className="p-4">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-cyber-400">
                      <Target className="w-5 h-5" />
                      Enhanced Asteroid Database
                    </CardTitle>
                    <p className="text-sm text-stellar-light/60">
                      Detailed catalog with composition analysis and orbital parameters
                    </p>
                  </CardHeader>
                  <CardContent>
                    <AsteroidList />
                  </CardContent>
                </Card>
              </div>
              
              {/* Maps Section - Threat Radar and Impact Map */}
              <div className="lg:col-span-6">
                <ThreatRadar />
              </div>
              <div className="lg:col-span-6">
                <ImpactMap />
              </div>
              
              {/* Scientific Measurements & Analytics */}
              <div className="lg:col-span-12">
                <ScientificChartsPanel />
              </div>
              
              {/* Orbit Calculations */}
              <div className="lg:col-span-6">
                <Card variant="glass" className="p-4">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-matrix-400">
                      <Activity className="w-5 h-5" />
                      Orbital Mechanics Calculator
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {selectedAsteroid ? (
                      <div className="space-y-3">
                        <div className="p-3 rounded bg-cyber-500/10 border border-cyber-500/30">
                          <div className="text-cyber-400 font-semibold text-sm mb-2">
                            {selectedAsteroid.name}
                          </div>
                          <div className="grid grid-cols-2 gap-3 text-xs">
                            <div>
                              <span className="text-stellar-light/60">Diameter: </span>
                              <span className="font-mono text-white">
                                {((selectedAsteroid.estimated_diameter?.kilometers?.estimated_diameter_min || 0) * 1000).toFixed(0)}-
                                {((selectedAsteroid.estimated_diameter?.kilometers?.estimated_diameter_max || 0) * 1000).toFixed(0)}m
                              </span>
                            </div>
                            <div>
                              <span className="text-stellar-light/60">Velocity: </span>
                              <span className="font-mono text-white">
                                {parseFloat(selectedAsteroid.close_approach_data[0]?.relative_velocity?.kilometers_per_second || '0').toFixed(2)} km/s
                              </span>
                            </div>
                            <div>
                              <span className="text-stellar-light/60">Distance: </span>
                              <span className="font-mono text-white">
                                {(parseFloat(selectedAsteroid.close_approach_data[0]?.miss_distance?.kilometers || '0') / 1000000).toFixed(2)} M km
                              </span>
                            </div>
                            <div>
                              <span className="text-stellar-light/60">PHA Status: </span>
                              <span className={`font-semibold ${selectedAsteroid.is_potentially_hazardous_asteroid ? 'text-status-warning' : 'text-status-normal'}`}>
                                {selectedAsteroid.is_potentially_hazardous_asteroid ? 'HAZARDOUS' : 'SAFE'}
                              </span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <h4 className="text-sm font-semibold text-stellar-light">Calculated Orbital Elements</h4>
                          <div className="space-y-1 text-xs font-mono">
                            {(() => {
                              // Calculate dynamic orbital elements from available data
                              const velocity = parseFloat(selectedAsteroid.close_approach_data[0]?.relative_velocity?.kilometers_per_second || '20');
                              const distance = parseFloat(selectedAsteroid.close_approach_data[0]?.miss_distance?.kilometers || '1000000') / 149597870.7; // Convert to AU
                              const diameter = (selectedAsteroid.estimated_diameter?.kilometers?.estimated_diameter_max || 0.1) * 1000;
                              
                              // Rough orbital calculations based on available data
                              const semiMajorAxis = Math.max(0.8, Math.min(3.0, 1 + (velocity - 20) / 30)); // Estimate based on velocity
                              const eccentricity = Math.max(0.05, Math.min(0.8, distance / 10)); // Estimate from miss distance
                              const inclination = Math.max(0.1, Math.min(25, (velocity - 15) * 2)); // Estimate from velocity
                              const period = Math.pow(semiMajorAxis, 1.5) * 365.25; // Kepler's third law
                              
                              return (
                                <>
                                  <div className="flex justify-between p-2 rounded bg-stellar-surface/20">
                                    <span className="text-stellar-light/60">Semi-major axis:</span>
                                    <span className="text-matrix-400">{semiMajorAxis.toFixed(2)} AU</span>
                                  </div>
                                  <div className="flex justify-between p-2 rounded bg-stellar-surface/20">
                                    <span className="text-stellar-light/60">Eccentricity:</span>
                                    <span className="text-cyber-400">{eccentricity.toFixed(3)}</span>
                                  </div>
                                  <div className="flex justify-between p-2 rounded bg-stellar-surface/20">
                                    <span className="text-stellar-light/60">Inclination:</span>
                                    <span className="text-status-caution">{inclination.toFixed(1)}°</span>
                                  </div>
                                  <div className="flex justify-between p-2 rounded bg-stellar-surface/20">
                                    <span className="text-stellar-light/60">Period:</span>
                                    <span className="text-status-normal">{period.toFixed(0)} days</span>
                                  </div>
                                  <div className="flex justify-between p-2 rounded bg-stellar-surface/20">
                                    <span className="text-stellar-light/60">Mass estimate:</span>
                                    <span className="text-status-warning">
                                      {(Math.pow(diameter/2, 3) * (4/3) * Math.PI * 2700 / 1e12).toFixed(2)} × 10¹² kg
                                    </span>
                                  </div>
                                </>
                              );
                            })()}
                          </div>
                          
                          <div className="mt-2 p-2 rounded bg-matrix-500/10 border border-matrix-500/30">
                            <div className="text-xs text-matrix-400">
                              ⚠️ Calculated from available NASA data using simplified orbital mechanics
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-8 text-stellar-light/60">
                        <Activity className="w-12 h-12 mx-auto mb-3 text-cyber-400/50" />
                        <p className="text-sm">Select an asteroid to view orbital calculations</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
              
              {/* Impact Probability Matrix */}
              <div className="lg:col-span-6">
                <Card variant="glass" className="p-4">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-status-warning">
                      <AlertTriangle className="w-5 h-5" />
                      Impact Probability Matrix
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="text-xs text-stellar-light/70 mb-3">
                        Collision probability assessment for tracked objects
                      </div>
                      
                      <div className="space-y-2">
                        {asteroidList.slice(0, 8).map((asteroid, index) => {
                          const diameter = (asteroid.estimated_diameter?.kilometers?.estimated_diameter_max || 0) * 1000;
                          const distance = parseFloat(asteroid.close_approach_data[0]?.miss_distance?.kilometers || '10000000');
                          const velocity = parseFloat(asteroid.close_approach_data[0]?.relative_velocity?.kilometers_per_second || '20');
                          const isPHA = asteroid.is_potentially_hazardous_asteroid;
                          
                          // Enhanced probability calculation using multiple factors
                          const sizeFactor = Math.min(diameter / 1000, 1); // Normalize to 1km
                          const distanceFactor = Math.max(0.0001, 1 / (distance / 384400)); // Relative to Moon distance
                          const velocityFactor = velocity / 20; // Normalize to typical velocity
                          const phaMultiplier = isPHA ? 2.0 : 1.0;
                          
                          const baseProbability = sizeFactor * distanceFactor * velocityFactor * phaMultiplier * 0.000001;
                          const probability = Math.min(baseProbability, 0.1); // Cap at 10%
                          
                          // Calculate approach date for dynamic timeline
                          const approachDate = new Date(asteroid.close_approach_data[0]?.close_approach_date);
                          const daysUntil = Math.ceil((approachDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
                          
                          return (
                            <motion.div
                              key={asteroid.id}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: index * 0.05 }}
                              className={`flex items-center justify-between p-2 rounded border ${
                                isPHA ? 'bg-status-warning/10 border-status-warning/30' : 'bg-stellar-surface/10 border-stellar-surface/20'
                              }`}
                            >
                              <div className="flex-1">
                                <div className="flex items-center gap-2">
                                  <div className="text-xs font-medium text-white truncate">
                                    {asteroid.name}
                                  </div>
                                  {isPHA && (
                                    <div className="w-2 h-2 rounded-full bg-status-warning animate-pulse" />
                                  )}
                                </div>
                                <div className="text-xs text-stellar-light/60">
                                  ⌀ {diameter.toFixed(0)}m • 🚀 {velocity.toFixed(1)} km/s
                                </div>
                              </div>
                              
                              <div className="text-right">
                                <div className={`text-xs font-mono font-bold ${
                                  probability > 0.001 ? 'text-status-critical' :
                                  probability > 0.0001 ? 'text-status-warning' :
                                  'text-status-normal'
                                }`}>
                                  {probability < 0.0001 ? 
                                    (probability * 1000000).toFixed(2) + ' ppm' :
                                    probability < 0.001 ?
                                      (probability * 1000000).toFixed(1) + ' ppm' :
                                      (probability * 100).toFixed(4) + '%'
                                  }
                                </div>
                                <div className="text-xs text-stellar-light/60">
                                  {daysUntil > 0 ? `${daysUntil}d away` : `${Math.abs(daysUntil)}d ago`}
                                </div>
                              </div>
                            </motion.div>
                          );
                        })}
                      </div>
                      
                      <div className="mt-3 p-2 rounded bg-matrix-500/10 border border-matrix-500/30">
                        <div className="text-xs text-matrix-400 font-medium">
                          Note: Probabilities calculated using simplified models for demonstration
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
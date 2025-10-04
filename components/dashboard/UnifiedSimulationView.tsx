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
  Minimize2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardMetric } from '@/components/ui/card';
import AsteroidList from './AsteroidList';
import ControlPanel from './ControlPanel';
import ImpactResults from './ImpactResults';
import ImpactMap from './ImpactMap';
import OrbitalView from './OrbitalView';
import { RealTimeDataPanel } from './RealTimeDataPanel';

export default function UnifiedSimulationView() {
  const { 
    selectedAsteroid, 
    simulationResults, 
    isSimulating,
    setAsteroidList 
  } = useAppStore();
  
  const [viewMode, setViewMode] = useState<'overview' | '3d-focus' | 'data-focus'>('overview');
  const [showOrbitalView, setShowOrbitalView] = useState(true);

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

  return (
    <div className="container mx-auto px-4 lg:px-6">
      {/* Simulation Status Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-4"
      >
        <Card variant="glass" className="p-4">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
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
            <div className="flex items-center gap-2">
              <Button
                variant={viewMode === 'overview' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('overview')}
                className="gap-2"
              >
                <Globe className="w-4 h-4" />
                <span className="hidden sm:inline">Overview</span>
              </Button>
              
              <Button
                variant={viewMode === '3d-focus' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('3d-focus')}
                className="gap-2"
              >
                <Satellite className="w-4 h-4" />
                <span className="hidden sm:inline">3D Focus</span>
              </Button>
              
              <Button
                variant={viewMode === 'data-focus' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('data-focus')}
                className="gap-2"
              >
                <Activity className="w-4 h-4" />
                <span className="hidden sm:inline">Data</span>
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowOrbitalView(!showOrbitalView)}
                className="gap-2"
              >
                {showOrbitalView ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                <span className="hidden sm:inline">3D View</span>
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
                // Pre-simulation layout - optimized grid
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                  {/* Left Column - Asteroid List & Controls */}
                  <div className="space-y-4">
                    <AsteroidList />
                    <ControlPanel />
                  </div>

                  {/* Right 2 Columns - Global Detection Network spanning 2 columns horizontally */}
                  <div className="lg:col-span-2">
                    <RealTimeDataPanel />
                  </div>
                </div>
              ) : (
                // Post-simulation layout - horizontal for results
                <div className="space-y-4">
                  {/* Top Row - Controls and Asteroid List */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <AsteroidList />
                    <ControlPanel />
                  </div>
                  
                  {/* Bottom Row - Results and Map side by side */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <ImpactResults />
                    <ImpactMap />
                  </div>
                  
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
                          <OrbitalView embedded />
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
                  <OrbitalView embedded />
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
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {/* Left Column */}
              <div className="space-y-4">
                <AsteroidList />
                <ControlPanel />
              </div>
              
              {/* Middle Column */}
              <div className="space-y-4">
                <ImpactResults />
                <ImpactMap />
              </div>
              
              {/* Right Column - Real-time Data Panel */}
              <div>
                <RealTimeDataPanel />
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
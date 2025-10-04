'use client';

import { motion } from 'framer-motion';
import { useAppStore } from '@/store/useAppStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CircularGauge, LinearGauge } from '@/components/ui/DataVisualization';
import { 
  Globe, 
  Shield, 
  Target, 
  TrendingUp, 
  AlertTriangle,
  Clock,
  Activity,
  Eye
} from 'lucide-react';

export function MissionOverviewStats() {
  const { asteroidList, simulationResults, selectedAsteroid } = useAppStore();

  // Calculate global statistics
  const getGlobalStats = () => {
    const totalAsteroids = asteroidList.length;
    const phaCount = asteroidList.filter(a => a.is_potentially_hazardous_asteroid).length;
    const averageSize = asteroidList.reduce((sum, a) => 
      sum + (a.estimated_diameter?.kilometers?.estimated_diameter_max || 0), 0) / totalAsteroids;
    
    const upcomingThisWeek = asteroidList.filter(a => {
      const approachDate = new Date(a.close_approach_data[0]?.close_approach_date);
      const nextWeek = new Date();
      nextWeek.setDate(nextWeek.getDate() + 7);
      return approachDate <= nextWeek;
    }).length;

    return {
      totalAsteroids,
      phaCount,
      averageSize: averageSize * 1000, // Convert to meters
      upcomingThisWeek,
      threatLevel: Math.min((phaCount / totalAsteroids) * 100, 100),
      systemHealth: Math.max(85, 100 - (phaCount / totalAsteroids) * 50)
    };
  };

  const stats = getGlobalStats();

  return (
    <Card variant="glass" className="p-4">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-matrix-400">
          <Globe className="w-5 h-5" />
          Mission Overview & Global Status
        </CardTitle>
        <p className="text-sm text-stellar-light/60">
          Real-time planetary defense metrics and system overview
        </p>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* System Health Gauges */}
        <div className="grid grid-cols-2 gap-4">
          <CircularGauge
            value={stats.systemHealth}
            max={100}
            label="System Health"
            unit="%"
            color="normal"
            icon={Shield}
            size="md"
          />
          
          <CircularGauge
            value={stats.threatLevel}
            max={100}
            label="Global Threat"
            unit="%"
            color={stats.threatLevel > 20 ? 'warning' : 'normal'}
            icon={AlertTriangle}
            size="md"
          />
        </div>

        {/* Key Statistics */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="text-center p-3 rounded bg-stellar-surface/20">
            <div className="text-cyber-400 text-xl font-bold font-mono">
              {stats.totalAsteroids}
            </div>
            <div className="text-xs text-stellar-light/60 mt-1">Total Tracked</div>
          </div>
          
          <div className="text-center p-3 rounded bg-stellar-surface/20">
            <div className="text-status-warning text-xl font-bold font-mono">
              {stats.phaCount}
            </div>
            <div className="text-xs text-stellar-light/60 mt-1">PHAs</div>
          </div>
          
          <div className="text-center p-3 rounded bg-stellar-surface/20">
            <div className="text-matrix-400 text-xl font-bold font-mono">
              {stats.averageSize.toFixed(0)}m
            </div>
            <div className="text-xs text-stellar-light/60 mt-1">Avg. Diameter</div>
          </div>
          
          <div className="text-center p-3 rounded bg-stellar-surface/20">
            <div className="text-status-caution text-xl font-bold font-mono">
              {stats.upcomingThisWeek}
            </div>
            <div className="text-xs text-stellar-light/60 mt-1">This Week</div>
          </div>
        </div>

        {/* Current Mission Status */}
        <div className="space-y-3">
          <h4 className="text-sm font-semibold text-stellar-light flex items-center gap-2">
            <Target className="w-4 h-4" />
            Current Mission Status
          </h4>
          
          <div className="grid grid-cols-1 gap-3">
            {selectedAsteroid ? (
              <div className="p-3 rounded bg-cyber-500/10 border border-cyber-500/30">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-cyber-400 font-semibold text-sm">Active Target</span>
                  <div className="w-2 h-2 rounded-full bg-cyber-400 animate-pulse" />
                </div>
                <div className="text-white font-mono text-sm mb-1">
                  {selectedAsteroid.name}
                </div>
                <div className="grid grid-cols-3 gap-2 text-xs text-stellar-light/70">
                  <span>⌀ {(selectedAsteroid.estimated_diameter?.kilometers?.estimated_diameter_max ? selectedAsteroid.estimated_diameter.kilometers.estimated_diameter_max * 1000 : 0).toFixed(0)}m</span>
                  <span>🚀 {parseFloat(selectedAsteroid.close_approach_data[0]?.relative_velocity?.kilometers_per_second || '0').toFixed(1)} km/s</span>
                  <span>🛡️ {selectedAsteroid.is_potentially_hazardous_asteroid ? 'PHA' : 'Safe'}</span>
                </div>
              </div>
            ) : (
              <div className="p-3 rounded bg-stellar-surface/20 border border-stellar-surface/30">
                <div className="text-stellar-light/60 text-sm text-center">
                  No target selected • Select from threat radar to begin mission
                </div>
              </div>
            )}

            {simulationResults && (
              <div className="p-3 rounded bg-matrix-500/10 border border-matrix-500/30">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-matrix-400 font-semibold text-sm">Last Simulation</span>
                  <Activity className="w-4 h-4 text-matrix-400" />
                </div>
                <div className="grid grid-cols-3 gap-2 text-xs">
                  <div>
                    <div className="text-matrix-400 font-mono font-bold">
                      {simulationResults.energy.megatonsTNT.toFixed(1)}MT
                    </div>
                    <div className="text-stellar-light/60">Energy</div>
                  </div>
                  <div>
                    <div className="text-status-warning font-mono font-bold">
                      {(simulationResults.crater.diameter / 1000).toFixed(1)}km
                    </div>
                    <div className="text-stellar-light/60">Crater</div>
                  </div>
                  <div>
                    <div className="text-status-critical font-mono font-bold">
                      {simulationResults.casualties?.estimated ? 
                        (simulationResults.casualties.estimated / 1000000).toFixed(1) + 'M' : '0'
                      }
                    </div>
                    <div className="text-stellar-light/60">Casualties</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Planetary Defense Readiness */}
        <div className="space-y-3">
          <h4 className="text-sm font-semibold text-stellar-light flex items-center gap-2">
            <Shield className="w-4 h-4" />
            Planetary Defense Readiness
          </h4>
          
          <div className="space-y-2">
            <LinearGauge
              value={Math.min(100, 85 + (stats.totalAsteroids / 10))} // Detection based on tracked objects
              max={100}
              label="Detection Network"
              unit="%"
              color="normal"
              icon={Eye}
            />
            
            <LinearGauge
              value={Math.max(60, 100 - (stats.phaCount * 2))} // Response capability decreases with more PHAs
              max={100}
              label="Response Capability"
              unit="%"
              color="cyber"
              icon={Target}
            />
            
            <LinearGauge
              value={stats.systemHealth}
              max={100}
              label="System Integration"
              unit="%"
              color={stats.systemHealth > 90 ? 'normal' : 'warning'}
              icon={Activity}
            />
          </div>
        </div>

        {/* Quick Actions Info */}
        <div className="p-3 rounded bg-stellar-deep/30 border border-stellar-surface/20">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-4 h-4 text-cyber-400" />
            <span className="text-cyber-400 text-sm font-semibold">Mission Efficiency</span>
          </div>
          <div className="text-xs text-stellar-light/70">
            {simulationResults ? 
              'Simulation complete • Analysis ready for deployment planning' :
              selectedAsteroid ?
                'Target acquired • Ready for impact simulation' :
                'Standby mode • Select target from threat radar to begin'
            }
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
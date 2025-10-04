'use client';

import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CircularGauge, LinearGauge } from '@/components/ui/DataVisualization';
import { 
  Satellite, 
  Globe, 
  Clock, 
  Activity,
  Eye,
  Shield,
  Radar,
  TrendingUp
} from 'lucide-react';

interface RealTimeMetrics {
  trackedObjects: number;
  newDiscoveries: number;
  threatLevel: number;
  systemStatus: number;
  scanningProgress: number;
  dataQuality: number;
  lastUpdate: Date;
  activeObservatories: number;
}

export function RealTimeDataPanel() {
  const [metrics, setMetrics] = useState<RealTimeMetrics>({
    trackedObjects: 28450,
    newDiscoveries: 156,
    threatLevel: 15,
    systemStatus: 98,
    scanningProgress: 73,
    dataQuality: 94,
    lastUpdate: new Date(),
    activeObservatories: 47
  });

  // Simulate real-time data updates
  useEffect(() => {
    const interval = setInterval(() => {
      setMetrics(prev => ({
        ...prev,
        trackedObjects: prev.trackedObjects + Math.floor(Math.random() * 3),
        newDiscoveries: prev.newDiscoveries + (Math.random() > 0.7 ? 1 : 0),
        threatLevel: Math.max(0, Math.min(100, prev.threatLevel + (Math.random() - 0.5) * 5)),
        systemStatus: Math.max(85, Math.min(100, prev.systemStatus + (Math.random() - 0.5) * 2)),
        scanningProgress: (prev.scanningProgress + 1) % 100,
        dataQuality: Math.max(80, Math.min(100, prev.dataQuality + (Math.random() - 0.5) * 3)),
        lastUpdate: new Date(),
        activeObservatories: Math.max(40, Math.min(50, prev.activeObservatories + Math.floor((Math.random() - 0.5) * 2)))
      }));
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  const getSystemStatusColor = (status: number) => {
    if (status >= 95) return 'normal';
    if (status >= 85) return 'warning';
    return 'critical';
  };

  const getThreatLevelColor = (level: number) => {
    if (level <= 20) return 'normal';
    if (level <= 50) return 'cyber';
    if (level <= 75) return 'warning';
    return 'critical';
  };

  return (
    <div className="space-y-6">
      {/* System Status Overview */}
      <Card variant="glass" className="p-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-cyber-400">
            <Activity className="w-5 h-5" />
            Global Detection Network Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <CircularGauge
              value={metrics.systemStatus}
              max={100}
              label="System Health"
              unit="%"
              color={getSystemStatusColor(metrics.systemStatus)}
              icon={Shield}
              size="md"
            />
            
            <CircularGauge
              value={metrics.threatLevel}
              max={100}
              label="Threat Level"
              unit="%"
              color={getThreatLevelColor(metrics.threatLevel)}
              icon={Activity}
              size="md"
            />
            
            <CircularGauge
              value={metrics.dataQuality}
              max={100}
              label="Data Quality"
              unit="%"
              color="matrix"
              icon={Eye}
              size="md"
            />
            
            <CircularGauge
              value={metrics.activeObservatories}
              max={50}
              label="Active Sites"
              unit=""
              color="cyber"
              icon={Satellite}
              size="md"
            />
          </div>
        </CardContent>
      </Card>

      {/* Detection Statistics */}
      <Card variant="glass" className="p-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-matrix-400">
            <Radar className="w-5 h-5" />
            Detection & Discovery Metrics
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <LinearGauge
              value={metrics.scanningProgress}
              max={100}
              label="Sky Survey Progress"
              unit="%"
              color="cyber"
              icon={Globe}
            />
            
            <LinearGauge
              value={metrics.newDiscoveries}
              max={200}
              label="New Discoveries (24h)"
              unit=""
              color="matrix"
              icon={TrendingUp}
            />
          </div>
          
          {/* Key Statistics */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6 pt-6 border-t border-stellar-surface/30">
            <div className="text-center space-y-2">
              <div className="text-cyber-400 text-2xl font-bold font-mono">
                {metrics.trackedObjects.toLocaleString()}
              </div>
              <div className="text-stellar-light/60 text-sm">
                Total Tracked Objects
              </div>
            </div>
            
            <div className="text-center space-y-2">
              <div className="text-matrix-400 text-2xl font-bold font-mono">
                {metrics.newDiscoveries}
              </div>
              <div className="text-stellar-light/60 text-sm">
                Discoveries Today
              </div>
            </div>
            
            <div className="text-center space-y-2">
              <div className="text-status-warning text-2xl font-bold font-mono">
                {metrics.activeObservatories}
              </div>
              <div className="text-stellar-light/60 text-sm">
                Active Observatories
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* System Information */}
      <Card variant="glass" className="p-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-status-normal">
            <Clock className="w-5 h-5" />
            System Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <div className="text-stellar-light/60 text-sm font-medium mb-1">
                  Last Data Update
                </div>
                <div className="text-cyber-400 font-mono">
                  {metrics.lastUpdate.toLocaleTimeString()}
                </div>
              </div>
              
              <div>
                <div className="text-stellar-light/60 text-sm font-medium mb-1">
                  Next Scan Cycle
                </div>
                <div className="text-matrix-400 font-mono">
                  {new Date(Date.now() + 300000).toLocaleTimeString()}
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <div>
                <div className="text-stellar-light/60 text-sm font-medium mb-1">
                  Detection Network
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-status-normal animate-pulse" />
                  <span className="text-status-normal font-medium">OPERATIONAL</span>
                </div>
              </div>
              
              <div>
                <div className="text-stellar-light/60 text-sm font-medium mb-1">
                  Data Processing
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-cyber-500 animate-pulse" />
                  <span className="text-cyber-400 font-medium">ANALYZING</span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Network Status Indicator */}
          <div className="mt-6 pt-6 border-t border-stellar-surface/30">
            <div className="flex items-center justify-between mb-3">
              <span className="text-stellar-light/80 font-medium">Global Network Coverage</span>
              <span className="text-status-normal font-bold font-mono">
                {((metrics.activeObservatories / 50) * 100).toFixed(0)}%
              </span>
            </div>
            
            <div className="relative h-3 bg-stellar-surface/30 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-status-normal to-matrix-500 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${(metrics.activeObservatories / 50) * 100}%` }}
                transition={{ duration: 1.5, ease: [0.23, 1, 0.32, 1] }}
              />
              
              <motion.div
                className="absolute top-0 h-full bg-gradient-to-r from-status-normal to-matrix-500 rounded-full opacity-50 blur-sm"
                initial={{ width: 0 }}
                animate={{ width: `${(metrics.activeObservatories / 50) * 100}%` }}
                transition={{ duration: 1.5, ease: [0.23, 1, 0.32, 1] }}
              />
            </div>
            
            <div className="flex justify-between text-xs text-stellar-light/60 font-mono mt-2">
              <span>0 sites</span>
              <span>50 sites</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
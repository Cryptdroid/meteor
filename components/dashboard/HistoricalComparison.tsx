'use client';

import { motion } from 'framer-motion';
import { useAppStore } from '@/store/useAppStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { History, TrendingUp, AlertCircle } from 'lucide-react';

interface HistoricalEvent {
  name: string;
  year: string;
  energy: number; // Megatons TNT
  diameter: number; // meters
  location: string;
  type: 'impact' | 'airburst' | 'extinction';
  casualties?: number;
  description: string;
}

const historicalEvents: HistoricalEvent[] = [
  {
    name: 'Chicxulub Impact',
    year: '66 MYA',
    energy: 100000000, // 100 million MT
    diameter: 10000,
    location: 'Yucatan Peninsula, Mexico',
    type: 'extinction',
    description: 'Ended the Cretaceous period and dinosaur era'
  },
  {
    name: 'Tunguska Event',
    year: '1908',
    energy: 15,
    diameter: 60,
    location: 'Siberia, Russia',
    type: 'airburst',
    description: 'Flattened 2,000 km² of forest'
  },
  {
    name: 'Chelyabinsk Meteor',
    year: '2013',
    energy: 0.5,
    diameter: 20,
    location: 'Chelyabinsk, Russia',
    type: 'airburst',
    casualties: 1500,
    description: 'Injured ~1,500 people from glass fragments'
  },
  {
    name: 'Barringer Crater',
    year: '50,000 YA',
    energy: 10,
    diameter: 50,
    location: 'Arizona, USA',
    type: 'impact',
    description: 'Created 1.2 km diameter crater'
  }
];

export function HistoricalComparison() {
  const { simulationResults } = useAppStore();

  if (!simulationResults) {
    return null;
  }

  const currentEnergy = simulationResults.energy.megatonsTNT;

  // Find closest historical comparison
  const getClosestComparison = () => {
    return historicalEvents.reduce((closest, event) => {
      const currentDiff = Math.abs(Math.log10(currentEnergy) - Math.log10(event.energy));
      const closestDiff = Math.abs(Math.log10(currentEnergy) - Math.log10(closest.energy));
      return currentDiff < closestDiff ? event : closest;
    });
  };

  const closestEvent = getClosestComparison();
  
  const getComparisonRatio = (eventEnergy: number) => {
    if (currentEnergy > eventEnergy) {
      return `${(currentEnergy / eventEnergy).toFixed(1)}x more powerful`;
    } else {
      return `${(eventEnergy / currentEnergy).toFixed(1)}x less powerful`;
    }
  };

  const getSeverityColor = (energy: number) => {
    if (energy >= 100000) return 'text-status-extreme';
    if (energy >= 1000) return 'text-status-critical';
    if (energy >= 10) return 'text-status-warning';
    if (energy >= 1) return 'text-status-caution';
    return 'text-status-normal';
  };

  const getSeverityBg = (energy: number) => {
    if (energy >= 100000) return 'bg-status-extreme/10 border-status-extreme/30';
    if (energy >= 1000) return 'bg-status-critical/10 border-status-critical/30';
    if (energy >= 10) return 'bg-status-warning/10 border-status-warning/30';
    if (energy >= 1) return 'bg-status-caution/10 border-status-caution/30';
    return 'bg-status-normal/10 border-status-normal/30';
  };

  return (
    <Card variant="glass" className="p-4">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-matrix-400">
          <History className="w-5 h-5" />
          Historical Impact Comparison
        </CardTitle>
        <p className="text-sm text-stellar-light/60">
          Compare current simulation with known impact events
        </p>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Closest Match Highlight */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className={`p-4 rounded-lg border ${getSeverityBg(closestEvent.energy)}`}
        >
          <div className="flex items-center gap-3 mb-3">
            <AlertCircle className={`w-5 h-5 ${getSeverityColor(closestEvent.energy)}`} />
            <div>
              <div className="font-semibold text-white">Closest Historical Match</div>
              <div className="text-sm text-stellar-light/70">
                {getComparisonRatio(closestEvent.energy)}
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div>
              <div className="text-sm font-medium text-stellar-light mb-2">{closestEvent.name} ({closestEvent.year})</div>
              <div className="text-xs text-stellar-light/70 mb-2">{closestEvent.description}</div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-stellar-light/60">Energy: </span>
                  <span className={`font-mono font-bold ${getSeverityColor(closestEvent.energy)}`}>
                    {closestEvent.energy >= 1000000 ? 
                      `${(closestEvent.energy / 1000000).toFixed(0)}M MT` :
                      closestEvent.energy >= 1000 ?
                        `${(closestEvent.energy / 1000).toFixed(0)}K MT` :
                        `${closestEvent.energy.toFixed(1)} MT`
                    }
                  </span>
                </div>
                <div>
                  <span className="text-stellar-light/60">Size: </span>
                  <span className="font-mono font-bold text-cyber-400">
                    ~{closestEvent.diameter}m
                  </span>
                </div>
              </div>
            </div>
            
            <div>
              <div className="text-sm font-medium text-stellar-light mb-2">Current Simulation</div>
              <div className="text-xs text-stellar-light/70 mb-2">
                Impact energy: {currentEnergy.toFixed(1)} MT TNT equivalent
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-stellar-light/60">Crater: </span>
                  <span className="font-mono font-bold text-matrix-400">
                    {(simulationResults.crater.diameter / 1000).toFixed(1)} km
                  </span>
                </div>
                <div>
                  <span className="text-stellar-light/60">Casualties: </span>
                  <span className="font-mono font-bold text-status-critical">
                    {simulationResults.casualties?.estimated ? 
                      (simulationResults.casualties.estimated / 1000000).toFixed(1) + 'M' : '0'
                    }
                  </span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Historical Events Timeline */}
        <div className="space-y-2">
          <h4 className="text-sm font-semibold text-stellar-light flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            Impact Event Scale
          </h4>
          
          <div className="space-y-2">
            {historicalEvents
              .sort((a, b) => b.energy - a.energy)
              .map((event, index) => (
                <motion.div
                  key={event.name}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`flex items-center justify-between p-3 rounded border ${
                    event.name === closestEvent.name ? 
                      'bg-cyber-500/20 border-cyber-500/50' : 
                      'bg-stellar-surface/10 border-stellar-surface/20'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${
                      event.type === 'extinction' ? 'bg-status-extreme' :
                      event.type === 'impact' ? 'bg-status-critical' : 'bg-status-warning'
                    }`} />
                    <div>
                      <div className="text-sm font-medium text-white">
                        {event.name}
                      </div>
                      <div className="text-xs text-stellar-light/60">
                        {event.location} • {event.year}
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className={`text-sm font-mono font-bold ${getSeverityColor(event.energy)}`}>
                      {event.energy >= 1000000 ? 
                        `${(event.energy / 1000000).toFixed(0)}M MT` :
                        event.energy >= 1000 ?
                          `${(event.energy / 1000).toFixed(0)}K MT` :
                          `${event.energy.toFixed(1)} MT`
                      }
                    </div>
                    <div className="text-xs text-stellar-light/60">
                      {getComparisonRatio(event.energy)}
                    </div>
                  </div>
                </motion.div>
              ))}
          </div>
        </div>

        {/* Current Event Classification */}
        <div className={`p-3 rounded border ${getSeverityBg(currentEnergy)}`}>
          <div className="text-center">
            <div className={`text-lg font-bold font-mono ${getSeverityColor(currentEnergy)}`}>
              Current Simulation: {currentEnergy.toFixed(1)} MT
            </div>
            <div className="text-sm text-stellar-light/70 mt-1">
              {currentEnergy >= 100000 ? 'Extinction-level event' :
               currentEnergy >= 1000 ? 'Global catastrophe' :
               currentEnergy >= 100 ? 'Regional disaster' :
               currentEnergy >= 10 ? 'City-destroying impact' :
               currentEnergy >= 1 ? 'Significant local damage' :
               'Minor impact event'}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
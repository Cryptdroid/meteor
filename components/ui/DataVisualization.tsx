'use client';

import { motion, useSpring, useTransform } from 'framer-motion';
import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, Zap, Target, Users, Globe } from 'lucide-react';

interface GaugeProps {
  value: number;
  max: number;
  min?: number;
  label: string;
  unit: string;
  color: 'cyber' | 'matrix' | 'warning' | 'critical' | 'normal';
  icon: React.ComponentType<{ className?: string }>;
  size?: 'sm' | 'md' | 'lg';
  showValue?: boolean;
}

const colorMap = {
  cyber: {
    gradient: 'from-cyber-500 to-cyan-400',
    glow: 'shadow-cyber-500/30',
    text: 'text-cyber-400',
    bg: 'bg-cyber-500'
  },
  matrix: {
    gradient: 'from-matrix-500 to-green-400', 
    glow: 'shadow-matrix-500/30',
    text: 'text-matrix-400',
    bg: 'bg-matrix-500'
  },
  warning: {
    gradient: 'from-status-warning to-orange-400',
    glow: 'shadow-status-warning/30', 
    text: 'text-status-warning',
    bg: 'bg-status-warning'
  },
  critical: {
    gradient: 'from-status-critical to-red-400',
    glow: 'shadow-status-critical/30',
    text: 'text-status-critical', 
    bg: 'bg-status-critical'
  },
  normal: {
    gradient: 'from-status-normal to-green-400',
    glow: 'shadow-status-normal/30',
    text: 'text-status-normal',
    bg: 'bg-status-normal'
  }
};

const sizeMap = {
  sm: {
    container: 'w-24 h-24',
    stroke: 4,
    radius: 40,
    text: 'text-sm',
    iconSize: 'w-4 h-4'
  },
  md: {
    container: 'w-32 h-32', 
    stroke: 6,
    radius: 56,
    text: 'text-base',
    iconSize: 'w-5 h-5'
  },
  lg: {
    container: 'w-40 h-40',
    stroke: 8, 
    radius: 72,
    text: 'text-lg',
    iconSize: 'w-6 h-6'
  }
};

export function CircularGauge({ 
  value, 
  max, 
  min = 0, 
  label, 
  unit, 
  color, 
  icon: Icon, 
  size = 'md',
  showValue = true 
}: GaugeProps) {
  const [animatedValue, setAnimatedValue] = useState(0);
  const spring = useSpring(animatedValue, { stiffness: 100, damping: 15 });
  const progress = useTransform(spring, [min, max], [0, 1]);
  
  const colors = colorMap[color];
  const sizing = sizeMap[size];
  const normalizedValue = Math.max(min, Math.min(max, value));
  const percentage = ((normalizedValue - min) / (max - min)) * 100;
  
  // Calculate stroke dash array for progress
  const circumference = 2 * Math.PI * sizing.radius;
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  useEffect(() => {
    setAnimatedValue(normalizedValue);
  }, [normalizedValue]);

  return (
    <Card variant="glass" className="p-6 text-center hover:shadow-lg hover:shadow-current/10 transition-all duration-500">
      <CardContent className="space-y-4">
        {/* Circular Progress */}
        <div className="relative mx-auto" style={{ width: '160px', height: '160px' }}>
          {/* Background Circle */}
          <svg className="w-full h-full -rotate-90" viewBox="0 0 160 160">
            <circle
              cx="80"
              cy="80"
              r={sizing.radius}
              stroke="currentColor"
              strokeWidth={sizing.stroke}
              fill="none"
              className="text-stellar-surface/30"
            />
            
            {/* Progress Circle */}
            <motion.circle
              cx="80"
              cy="80"
              r={sizing.radius}
              stroke="url(#gradient)"
              strokeWidth={sizing.stroke}
              fill="none"
              strokeLinecap="round"
              strokeDasharray={strokeDasharray}
              initial={{ strokeDashoffset: circumference }}
              animate={{ strokeDashoffset }}
              transition={{ duration: 1.5, ease: [0.23, 1, 0.32, 1] }}
              className={`drop-shadow-lg ${colors.glow}`}
            />
            
            {/* Gradient Definition */}
            <defs>
              <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" className={colors.text} />
                <stop offset="100%" className={colors.text} style={{ stopOpacity: 0.6 }} />
              </linearGradient>
            </defs>
          </svg>
          
          {/* Center Content */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <div className={`${sizing.iconSize} ${colors.text} mb-2`}>
              <Icon className="w-full h-full" />
            </div>
            
            {showValue && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.5, duration: 0.5 }}
                className={`font-bold font-mono ${sizing.text} ${colors.text}`}
              >
                {typeof value === 'number' && value < 1000 
                  ? value.toFixed(1)
                  : typeof value === 'number' 
                    ? (value / 1000).toFixed(1) + 'K'
                    : value
                }
                <span className="text-xs text-stellar-light/60 ml-1">{unit}</span>
              </motion.div>
            )}
          </div>
        </div>
        
        {/* Label */}
        <div>
          <h3 className="text-white font-semibold mb-1">{label}</h3>
          <div className="text-xs text-stellar-light/60 font-mono">
            {percentage.toFixed(0)}% of max threshold
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function LinearGauge({ 
  value, 
  max, 
  min = 0, 
  label, 
  unit, 
  color, 
  icon: Icon,
  showValue = true 
}: GaugeProps) {
  const colors = colorMap[color];
  const normalizedValue = Math.max(min, Math.min(max, value));
  const percentage = ((normalizedValue - min) / (max - min)) * 100;

  return (
    <Card variant="glass" className="p-4">
      <CardContent className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Icon className={`w-5 h-5 ${colors.text}`} />
            <span className="text-white font-medium">{label}</span>
          </div>
          
          {showValue && (
            <div className={`font-bold font-mono ${colors.text}`}>
              {typeof value === 'number' && value < 1000 
                ? value.toFixed(1)
                : typeof value === 'number' 
                  ? (value / 1000).toFixed(1) + 'K'
                  : value
              }
              <span className="text-xs text-stellar-light/60 ml-1">{unit}</span>
            </div>
          )}
        </div>
        
        {/* Progress Bar */}
        <div className="relative h-3 bg-stellar-surface/30 rounded-full overflow-hidden">
          <motion.div
            className={`h-full bg-gradient-to-r ${colors.gradient} rounded-full`}
            initial={{ width: 0 }}
            animate={{ width: `${percentage}%` }}
            transition={{ duration: 1.5, ease: [0.23, 1, 0.32, 1] }}
          />
          
          {/* Glow Effect */}
          <motion.div
            className={`absolute top-0 h-full bg-gradient-to-r ${colors.gradient} rounded-full opacity-50 blur-sm`}
            initial={{ width: 0 }}
            animate={{ width: `${percentage}%` }}
            transition={{ duration: 1.5, ease: [0.23, 1, 0.32, 1] }}
          />
        </div>
        
        <div className="flex justify-between text-xs text-stellar-light/60 font-mono">
          <span>{min}</span>
          <span>{max}{unit}</span>
        </div>
      </CardContent>
    </Card>
  );
}

interface ThreatLevelIndicatorProps {
  level: 'minimal' | 'low' | 'moderate' | 'high' | 'extreme';
  description: string;
}

export function ThreatLevelIndicator({ level, description }: ThreatLevelIndicatorProps) {
  const getLevelConfig = (level: string) => {
    switch (level) {
      case 'minimal':
        return { 
          color: 'normal', 
          label: 'MINIMAL THREAT', 
          progress: 20,
          bgColor: 'bg-status-normal/20',
          textColor: 'text-status-normal' 
        };
      case 'low':
        return { 
          color: 'cyber', 
          label: 'LOW THREAT', 
          progress: 35,
          bgColor: 'bg-cyber-500/20',
          textColor: 'text-cyber-400' 
        };
      case 'moderate':
        return { 
          color: 'warning', 
          label: 'MODERATE THREAT', 
          progress: 55,
          bgColor: 'bg-status-caution/20',
          textColor: 'text-status-caution' 
        };
      case 'high':
        return { 
          color: 'warning', 
          label: 'HIGH THREAT', 
          progress: 75,
          bgColor: 'bg-status-warning/20',
          textColor: 'text-status-warning' 
        };
      case 'extreme':
        return { 
          color: 'critical', 
          label: 'EXTREME THREAT', 
          progress: 95,
          bgColor: 'bg-status-critical/20',
          textColor: 'text-status-critical' 
        };
      default:
        return { 
          color: 'normal', 
          label: 'UNKNOWN', 
          progress: 0,
          bgColor: 'bg-stellar-surface/20',
          textColor: 'text-stellar-light' 
        };
    }
  };

  const config = getLevelConfig(level);

  return (
    <Card variant="glass" className={`p-6 border-l-4 border-l-${config.color === 'normal' ? 'status-normal' : config.color === 'critical' ? 'status-critical' : config.color === 'warning' ? 'status-warning' : 'cyber-500'}`}>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-4 h-4 rounded-full animate-pulse ${
              config.color === 'normal' ? 'bg-status-normal shadow-lg shadow-status-normal/50' :
              config.color === 'critical' ? 'bg-status-critical shadow-lg shadow-status-critical/50' :
              config.color === 'warning' ? 'bg-status-warning shadow-lg shadow-status-warning/50' :
              'bg-cyber-500 shadow-lg shadow-cyber-500/50'
            }`} />
            <span className={`font-bold font-mono tracking-wider ${config.textColor}`}>
              {config.label}
            </span>
          </div>
          
          <AlertTriangle className={`w-5 h-5 ${config.textColor}`} />
        </div>
        
        <p className="text-stellar-light/80 leading-relaxed">
          {description}
        </p>
        
        {/* Threat Level Bar */}
        <div className="relative h-2 bg-stellar-surface/30 rounded-full overflow-hidden">
          <motion.div
            className={`h-full bg-gradient-to-r ${
              config.color === 'normal' ? 'from-status-normal to-green-400' :
              config.color === 'critical' ? 'from-status-critical to-red-400' :
              config.color === 'warning' ? 'from-status-warning to-orange-400' :
              'from-cyber-500 to-cyan-400'
            } rounded-full`}
            initial={{ width: 0 }}
            animate={{ width: `${config.progress}%` }}
            transition={{ duration: 2, ease: [0.23, 1, 0.32, 1] }}
          />
        </div>
        
        <div className="flex justify-between text-xs text-stellar-light/60 font-mono">
          <span>Safe</span>
          <span>Catastrophic</span>
        </div>
      </CardContent>
    </Card>
  );
}
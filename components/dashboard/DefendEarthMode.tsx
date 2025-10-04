'use client';

import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { 
  Shield, 
  AlertTriangle, 
  Trophy, 
  Play, 
  RotateCcw, 
  Zap, 
  Target, 
  Clock, 
  Activity,
  Rocket,
  Crosshair,
  TrendingUp,
  Globe,
  Radio,
  Gauge,
  Atom,
  Orbit,
  Timer
} from 'lucide-react';

// Game phases
type GamePhase = 'intro' | 'briefing' | 'strategy' | 'execution' | 'outcome';
type DifficultyLevel = 'easy' | 'medium' | 'hard' | 'expert';
type DeflectionMethod = 'kinetic' | 'nuclear' | 'gravity' | 'ion';

interface GameScenario {
  id: string;
  name: string;
  size: number; // meters
  velocity: number; // km/s
  distance: number; // days until impact
  composition: string;
  impactLocation: { lat: number; lng: number; name: string };
  difficulty: DifficultyLevel;
  timeLimit: number; // seconds for strategy phase
}

interface DeflectionStrategy {
  method: DeflectionMethod;
  power: number; // 0-100
  timing: number; // 0-100 (when to execute)
  angle: number; // 0-360 degrees
}

interface MissionOutcome {
  success: 'complete' | 'partial' | 'failed';
  missDistance: number; // km
  damageReduction: number; // percentage
  score: number;
  timeRemaining: number;
}

// Generate random scenarios
const generateScenario = (difficulty: DifficultyLevel): GameScenario => {
  const scenarios = {
    easy: {
      size: [100, 300],
      velocity: [15, 25],
      distance: [30, 60],
      timeLimit: 300, // 5 minutes
    },
    medium: {
      size: [300, 800],
      velocity: [20, 35],
      distance: [14, 30],
      timeLimit: 240, // 4 minutes
    },
    hard: {
      size: [800, 1500],
      velocity: [30, 50],
      distance: [7, 14],
      timeLimit: 180, // 3 minutes
    },
    expert: {
      size: [1500, 5000],
      velocity: [40, 72],
      distance: [3, 7],
      timeLimit: 120, // 2 minutes
    }
  };

  const config = scenarios[difficulty];
  const cities = [
    { name: 'New York', lat: 40.7128, lng: -74.0060 },
    { name: 'Tokyo', lat: 35.6762, lng: 139.6503 },
    { name: 'London', lat: 51.5074, lng: -0.1278 },
    { name: 'Los Angeles', lat: 34.0522, lng: -118.2437 },
    { name: 'Sydney', lat: -33.8688, lng: 151.2093 },
    { name: 'Mumbai', lat: 19.0760, lng: 72.8777 },
  ];

  const city = cities[Math.floor(Math.random() * cities.length)];
  const compositions = ['Carbonaceous', 'Stony', 'Metallic', 'Mixed'];

  return {
    id: `impactor-${Date.now()}`,
    name: `IMPACTOR-${difficulty.toUpperCase()}`,
    size: Math.floor(Math.random() * (config.size[1] - config.size[0]) + config.size[0]),
    velocity: Math.floor(Math.random() * (config.velocity[1] - config.velocity[0]) + config.velocity[0]),
    distance: Math.floor(Math.random() * (config.distance[1] - config.distance[0]) + config.distance[0]),
    composition: compositions[Math.floor(Math.random() * compositions.length)],
    impactLocation: city,
    difficulty,
    timeLimit: config.timeLimit,
  };
};

export default function DefendEarthMode() {
  const [gamePhase, setGamePhase] = useState<GamePhase>('intro');
  const [difficulty, setDifficulty] = useState<DifficultyLevel>('medium');
  const [scenario, setScenario] = useState<GameScenario | null>(null);
  const [strategy, setStrategy] = useState<DeflectionStrategy>({
    method: 'kinetic',
    power: 50,
    timing: 50,
    angle: 0
  });
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [missionTimer, setMissionTimer] = useState(72 * 3600); // 72 hours in seconds
  const [outcome, setOutcome] = useState<MissionOutcome | null>(null);
  const [successProbability, setSuccessProbability] = useState(0);

  // Calculate success probability based on strategy
  const calculateSuccessProbability = useCallback((strat: DeflectionStrategy, scen: GameScenario) => {
    if (!scen) return 0;
    
    let baseSuccess = 50;
    
    // Method effectiveness
    const methodBonus = {
      kinetic: scen.size < 500 ? 30 : scen.size < 1000 ? 20 : 10,
      nuclear: scen.size > 1000 ? 35 : 25,
      gravity: scen.distance > 14 ? 40 : 15,
      ion: scen.distance > 30 ? 45 : 10,
    };
    
    baseSuccess += methodBonus[strat.method];
    
    // Power scaling
    baseSuccess += (strat.power - 50) * 0.3;
    
    // Timing optimization (best at 60-80%)
    const timingOptimal = Math.abs(strat.timing - 70);
    baseSuccess -= timingOptimal * 0.2;
    
    // Distance factor
    baseSuccess += Math.min(scen.distance * 2, 40);
    
    // Velocity penalty
    baseSuccess -= (scen.velocity - 20) * 0.5;
    
    return Math.max(0, Math.min(100, baseSuccess));
  }, []);

  // Update success probability when strategy changes
  useEffect(() => {
    if (scenario) {
      setSuccessProbability(calculateSuccessProbability(strategy, scenario));
    }
  }, [strategy, scenario, calculateSuccessProbability]);

  // Mission countdown timer
  useEffect(() => {
    if (gamePhase === 'strategy' && timeRemaining > 0) {
      const interval = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            // Time's up - auto execute with current strategy
            executeStrategy();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [gamePhase, timeRemaining]);

  // Mission timer (72 hours)
  useEffect(() => {
    if (gamePhase === 'strategy' || gamePhase === 'execution') {
      const interval = setInterval(() => {
        setMissionTimer(prev => Math.max(0, prev - 60)); // Speed up for demo
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [gamePhase]);

  const startNewGame = (selectedDifficulty: DifficultyLevel) => {
    const newScenario = generateScenario(selectedDifficulty);
    setScenario(newScenario);
    setDifficulty(selectedDifficulty);
    setGamePhase('briefing');
    setTimeRemaining(newScenario.timeLimit);
    setMissionTimer(72 * 3600);
    setOutcome(null);
  };

  const executeStrategy = () => {
    if (!scenario) return;
    
    setGamePhase('execution');
    
    // Calculate final outcome based on strategy and scenario
    const finalProbability = calculateSuccessProbability(strategy, scenario);
    const roll = Math.random() * 100;
    
    setTimeout(() => {
      let missDistance = 0;
      let damageReduction = 0;
      let success: 'complete' | 'partial' | 'failed' = 'failed';
      
      if (roll < finalProbability) {
        success = 'complete';
        missDistance = Math.random() * 50000 + 10000; // 10-60km miss
        damageReduction = 100;
      } else if (roll < finalProbability + 20) {
        success = 'partial';
        missDistance = Math.random() * 5000 + 1000; // 1-6km miss
        damageReduction = Math.floor(60 + Math.random() * 30); // 60-90% reduction
      } else {
        success = 'failed';
        missDistance = 0;
        damageReduction = 0;
      }
      
      const score = Math.floor(
        (finalProbability * 100) + 
        (timeRemaining * 10) + 
        (damageReduction * 50) +
        (scenario.difficulty === 'expert' ? 5000 : 
         scenario.difficulty === 'hard' ? 3000 :
         scenario.difficulty === 'medium' ? 1000 : 0)
      );
      
      setOutcome({
        success,
        missDistance,
        damageReduction,
        score,
        timeRemaining: missionTimer,
      });
      
      setGamePhase('outcome');
    }, 5000); // 5 second execution animation
  };

  const resetGame = () => {
    setGamePhase('intro');
    setScenario(null);
    setOutcome(null);
    setTimeRemaining(0);
    setMissionTimer(72 * 3600);
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const formatMissionTime = (seconds: number) => {
    const days = Math.floor(seconds / (24 * 3600));
    const hours = Math.floor((seconds % (24 * 3600)) / 3600);
    return `${days}d ${hours}h`;
  };

  // Intro Phase - Difficulty Selection
  if (gamePhase === 'intro') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 via-blue-900 to-black relative overflow-hidden">
        {/* Background stars */}
        <div className="absolute inset-0 opacity-30">
          {[...Array(50)].map((_, i) => (
            <div
              key={i}
              className="absolute bg-white rounded-full animate-pulse"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                width: `${Math.random() * 3 + 1}px`,
                height: `${Math.random() * 3 + 1}px`,
                animationDelay: `${Math.random() * 3}s`,
              }}
            />
          ))}
        </div>

        <div className="relative z-10 container mx-auto px-4 py-20 text-center">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
          >
            <Shield className="w-32 h-32 mx-auto mb-8 text-space-neon" />
            <h1 className="text-6xl font-bold mb-4 bg-gradient-to-r from-space-cyan to-space-neon bg-clip-text text-transparent">
              DEFEND EARTH
            </h1>
            <p className="text-xl text-gray-300 mb-12 max-w-3xl mx-auto">
              You are the Mission Commander of the Planetary Defense Coalition. 
              An asteroid has been detected on a collision course with Earth. 
              Choose your difficulty and prepare to save humanity.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {(['easy', 'medium', 'hard', 'expert'] as DifficultyLevel[]).map((diff, index) => (
              <motion.div
                key={diff}
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Card className="h-full cursor-pointer transition-all duration-300 hover:scale-105 hover:border-space-neon">
                  <CardHeader>
                    <CardTitle className="text-2xl capitalize text-center">
                      {diff}
                      {diff === 'easy' && <Target className="w-6 h-6 mx-auto mt-2 text-green-400" />}
                      {diff === 'medium' && <Activity className="w-6 h-6 mx-auto mt-2 text-yellow-400" />}
                      {diff === 'hard' && <AlertTriangle className="w-6 h-6 mx-auto mt-2 text-orange-400" />}
                      {diff === 'expert' && <Zap className="w-6 h-6 mx-auto mt-2 text-red-400" />}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="text-center">
                    {diff === 'easy' && (
                      <div className="space-y-2 text-sm text-gray-400">
                        <p>Size: 100-300m</p>
                        <p>Time: 30-60 days</p>
                        <p>Strategy Time: 5 min</p>
                      </div>
                    )}
                    {diff === 'medium' && (
                      <div className="space-y-2 text-sm text-gray-400">
                        <p>Size: 300-800m</p>
                        <p>Time: 14-30 days</p>
                        <p>Strategy Time: 4 min</p>
                      </div>
                    )}
                    {diff === 'hard' && (
                      <div className="space-y-2 text-sm text-gray-400">
                        <p>Size: 800-1500m</p>
                        <p>Time: 7-14 days</p>
                        <p>Strategy Time: 3 min</p>
                      </div>
                    )}
                    {diff === 'expert' && (
                      <div className="space-y-2 text-sm text-gray-400">
                        <p>Size: 1500-5000m</p>
                        <p>Time: 3-7 days</p>
                        <p>Strategy Time: 2 min</p>
                      </div>
                    )}
                    <Button
                      variant="neon"
                      className="mt-4 w-full"
                      onClick={() => startNewGame(diff)}
                    >
                      Select Mission
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Briefing Phase - Emergency Alert
  if (gamePhase === 'briefing') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-red-900 via-gray-900 to-black relative">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute inset-0 bg-red-500/10 animate-pulse"
        />
        
        <div className="relative z-10 container mx-auto px-4 py-20">
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", duration: 0.8 }}
            className="text-center mb-12"
          >
            <AlertTriangle className="w-32 h-32 mx-auto mb-6 text-red-400 animate-pulse" />
            <h1 className="text-6xl font-bold text-red-400 mb-4 animate-pulse">
              PLANETARY EMERGENCY
            </h1>
            <p className="text-2xl text-red-300 mb-8">
              ASTEROID IMPACT IMMINENT
            </p>
          </motion.div>

          {scenario && (
            <motion.div
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 1, duration: 0.8 }}
            >
              <Card className="max-w-4xl mx-auto border-red-500 bg-red-950/20">
                <CardHeader>
                  <CardTitle className="text-3xl text-center text-red-400">
                    MISSION BRIEFING: {scenario.name}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <h3 className="text-xl font-bold text-space-cyan">Asteroid Profile</h3>
                      <div className="space-y-2">
                        <p><span className="text-gray-400">Diameter:</span> <span className="text-white">{scenario.size}m</span></p>
                        <p><span className="text-gray-400">Velocity:</span> <span className="text-white">{scenario.velocity} km/s</span></p>
                        <p><span className="text-gray-400">Composition:</span> <span className="text-white">{scenario.composition}</span></p>
                        <p><span className="text-gray-400">Impact Zone:</span> <span className="text-white">{scenario.impactLocation.name}</span></p>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <h3 className="text-xl font-bold text-space-cyan">Mission Status</h3>
                      <div className="space-y-2">
                        <p><span className="text-gray-400">Time Until Impact:</span> <span className="text-red-400">{scenario.distance} days</span></p>
                        <p><span className="text-gray-400">Strategy Time Limit:</span> <span className="text-yellow-400">{Math.floor(scenario.timeLimit / 60)} minutes</span></p>
                        <p><span className="text-gray-400">Difficulty:</span> <span className="text-white capitalize">{scenario.difficulty}</span></p>
                        <p><span className="text-gray-400">Mission Timer:</span> <span className="text-space-cyan">{formatMissionTime(missionTimer)}</span></p>
                      </div>
                    </div>
                  </div>

                  <div className="text-center pt-6 border-t border-gray-700">
                    <p className="text-lg text-gray-300 mb-6">
                      Commander, you have {Math.floor(scenario.timeLimit / 60)} minutes to analyze the situation 
                      and select your deflection strategy. The fate of Earth is in your hands.
                    </p>
                    <Button
                      variant="neon"
                      size="lg"
                      onClick={() => setGamePhase('strategy')}
                    >
                      Begin Strategic Analysis
                      <Crosshair className="w-5 h-5 ml-2" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </div>
      </div>
    );
  }

  // Strategy Phase - Mission Control Interface
  if (gamePhase === 'strategy') {
    const urgencyColor = timeRemaining < 60 ? 'text-red-400' : 
                        timeRemaining < 120 ? 'text-yellow-400' : 'text-space-cyan';
    
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-900 via-gray-900 to-black">
        <div className="container mx-auto px-4 py-8">
          {/* Mission Control Header */}
          <div className="mb-8">
            <Card className="border-space-cyan bg-blue-950/20">
              <CardContent className="py-4">
                <div className="flex justify-between items-center">
                  <div>
                    <h1 className="text-2xl font-bold text-space-cyan">MISSION CONTROL</h1>
                    <p className="text-gray-400">{scenario?.name} - Strategic Analysis Phase</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-400">Strategy Time Remaining</p>
                    <p className={`text-3xl font-bold ${urgencyColor}`}>
                      {formatTime(timeRemaining)}
                    </p>
                  </div>
                </div>
                
                {/* Mission Timer */}
                <div className="mt-4 pt-4 border-t border-gray-700">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Mission Timer (Time Until Impact):</span>
                    <span className="text-red-400 font-bold">{formatMissionTime(missionTimer)}</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2 mt-2">
                    <div 
                      className="bg-gradient-to-r from-red-600 to-red-400 h-2 rounded-full transition-all duration-1000"
                      style={{ width: `${(missionTimer / (72 * 3600)) * 100}%` }}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Deflection Method Selection */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Rocket className="w-6 h-6" />
                  Deflection Strategy Configuration
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Method Selection */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Deflection Method</h3>
                  <div className="grid grid-cols-2 gap-4">
                    {[
                      { method: 'kinetic' as DeflectionMethod, name: 'Kinetic Impactor', icon: Target, description: 'High-speed spacecraft collision' },
                      { method: 'nuclear' as DeflectionMethod, name: 'Nuclear Device', icon: Atom, description: 'Nuclear detonation near surface' },
                      { method: 'gravity' as DeflectionMethod, name: 'Gravity Tractor', icon: Orbit, description: 'Gravitational pull over time' },
                      { method: 'ion' as DeflectionMethod, name: 'Ion Beam', icon: Zap, description: 'Focused ion beam deflection' },
                    ].map(({ method, name, icon: Icon, description }) => (
                      <Card
                        key={method}
                        className={`cursor-pointer transition-all duration-300 ${
                          strategy.method === method ? 'border-space-neon bg-space-neon/10' : 'hover:border-space-cyan'
                        }`}
                        onClick={() => setStrategy(prev => ({ ...prev, method }))}
                      >
                        <CardContent className="p-4 text-center">
                          <Icon className="w-8 h-8 mx-auto mb-2 text-space-cyan" />
                          <h4 className="font-semibold">{name}</h4>
                          <p className="text-xs text-gray-400 mt-1">{description}</p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>

                {/* Power Setting */}
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-semibold">Power Level</h3>
                    <span className="text-space-neon font-bold">{strategy.power}%</span>
                  </div>
                  <Slider
                    value={[strategy.power]}
                    onValueChange={([value]) => setStrategy(prev => ({ ...prev, power: value }))}
                    max={100}
                    step={1}
                    className="w-full"
                  />
                  <p className="text-sm text-gray-400">
                    Higher power increases effectiveness but may cause fragmentation
                  </p>
                </div>

                {/* Timing Setting */}
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-semibold">Execution Timing</h3>
                    <span className="text-space-neon font-bold">{strategy.timing}%</span>
                  </div>
                  <Slider
                    value={[strategy.timing]}
                    onValueChange={([value]) => setStrategy(prev => ({ ...prev, timing: value }))}
                    max={100}
                    step={1}
                    className="w-full"
                  />
                  <p className="text-sm text-gray-400">
                    Timing affects deflection efficiency (60-80% is optimal)
                  </p>
                </div>

                {/* Execute Button */}
                <div className="pt-6 border-t border-gray-700">
                  <Button
                    variant="neon"
                    size="lg"
                    className="w-full"
                    onClick={executeStrategy}
                  >
                    Execute Deflection Strategy
                    <Crosshair className="w-5 h-5 ml-2" />
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Success Probability & Mission Status */}
            <div className="space-y-6">
              {/* Success Probability */}
              <Card className="border-space-cyan">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Gauge className="w-6 h-6" />
                    Success Probability
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center">
                    <div className="relative w-32 h-32 mx-auto mb-4">
                      <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                        <circle
                          cx="50"
                          cy="50"
                          r="40"
                          stroke="currentColor"
                          strokeWidth="8"
                          fill="none"
                          className="text-gray-700"
                        />
                        <circle
                          cx="50"
                          cy="50"
                          r="40"
                          stroke="currentColor"
                          strokeWidth="8"
                          fill="none"
                          strokeDasharray={`${2 * Math.PI * 40}`}
                          strokeDashoffset={`${2 * Math.PI * 40 * (1 - successProbability / 100)}`}
                          className="text-space-neon transition-all duration-500"
                        />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-2xl font-bold text-space-neon">
                          {Math.round(successProbability)}%
                        </span>
                      </div>
                    </div>
                    <p className="text-sm text-gray-400">
                      Based on current strategy configuration
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Mission Status */}
              {scenario && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Globe className="w-6 h-6" />
                      Target Analysis
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Size:</span>
                      <span className="text-white">{scenario.size}m</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Velocity:</span>
                      <span className="text-white">{scenario.velocity} km/s</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Distance:</span>
                      <span className="text-white">{scenario.distance} days</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Impact Zone:</span>
                      <span className="text-white">{scenario.impactLocation.name}</span>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Execution Phase - Cinematic Launch
  if (gamePhase === 'execution') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black relative overflow-hidden">
        {/* Animated background */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute inset-0"
        >
          {[...Array(100)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute bg-white rounded-full"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                width: `${Math.random() * 2 + 1}px`,
                height: `${Math.random() * 2 + 1}px`,
              }}
              animate={{
                x: [0, -1000],
                opacity: [0, 1, 0],
              }}
              transition={{
                duration: Math.random() * 3 + 2,
                repeat: Infinity,
                delay: Math.random() * 5,
              }}
            />
          ))}
        </motion.div>

        <div className="relative z-10 container mx-auto px-4 py-20 text-center">
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", duration: 1 }}
          >
            <Rocket className="w-32 h-32 mx-auto mb-8 text-space-neon animate-pulse" />
            <h1 className="text-6xl font-bold mb-8 bg-gradient-to-r from-space-cyan to-space-neon bg-clip-text text-transparent">
              DEFLECTION IN PROGRESS
            </h1>
          </motion.div>

          <motion.div
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 1, duration: 0.8 }}
            className="space-y-6"
          >
            <p className="text-2xl text-gray-300">
              {strategy.method === 'kinetic' && "Kinetic impactor launched and en route to target..."}
              {strategy.method === 'nuclear' && "Nuclear device deployed and approaching detonation point..."}
              {strategy.method === 'gravity' && "Gravity tractor positioned and applying gravitational force..."}
              {strategy.method === 'ion' && "Ion beam system activated and focusing on target..."}
            </p>

            <div className="max-w-2xl mx-auto">
              <div className="flex justify-between text-sm text-gray-400 mb-2">
                <span>Deployment Progress</span>
                <span>Calculating trajectory...</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-4">
                <motion.div
                  className="bg-gradient-to-r from-space-cyan to-space-neon h-4 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: "100%" }}
                  transition={{ duration: 5 }}
                />
              </div>
            </div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 2 }}
              className="text-space-cyan font-mono text-lg"
            >
              <p>Strategy: {strategy.method.toUpperCase()}</p>
              <p>Power Level: {strategy.power}%</p>
              <p>Timing: {strategy.timing}%</p>
              <p>Success Probability: {Math.round(successProbability)}%</p>
            </motion.div>
          </motion.div>
        </div>
      </div>
    );
  }

  // Outcome Phase - Results
  if (gamePhase === 'outcome' && outcome) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black relative">
        <div className="container mx-auto px-4 py-20 text-center">
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", duration: 1 }}
          >
            {outcome.success === 'complete' ? (
              <Trophy className="w-32 h-32 mx-auto mb-8 text-space-neon" />
            ) : outcome.success === 'partial' ? (
              <Shield className="w-32 h-32 mx-auto mb-8 text-yellow-400" />
            ) : (
              <AlertTriangle className="w-32 h-32 mx-auto mb-8 text-red-400" />
            )}

            <h1 className="text-6xl font-bold mb-8">
              {outcome.success === 'complete' && (
                <span className="bg-gradient-to-r from-green-400 to-space-neon bg-clip-text text-transparent">
                  MISSION SUCCESS
                </span>
              )}
              {outcome.success === 'partial' && (
                <span className="bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">
                  PARTIAL SUCCESS
                </span>
              )}
              {outcome.success === 'failed' && (
                <span className="bg-gradient-to-r from-red-400 to-red-600 bg-clip-text text-transparent">
                  MISSION FAILED
                </span>
              )}
            </h1>
          </motion.div>

          <motion.div
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 1, duration: 0.8 }}
            className="max-w-4xl mx-auto"
          >
            <Card className="mb-8">
              <CardHeader>
                <CardTitle className="text-2xl">Mission Report</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                  <div className="text-center p-6 bg-gradient-to-b from-space-cyan/20 to-transparent rounded-lg">
                    <TrendingUp className="w-12 h-12 mx-auto mb-4 text-space-cyan" />
                    <h3 className="text-lg font-semibold mb-2">Final Score</h3>
                    <p className="text-3xl font-bold text-space-neon">{outcome.score.toLocaleString()}</p>
                  </div>
                  
                  <div className="text-center p-6 bg-gradient-to-b from-green-500/20 to-transparent rounded-lg">
                    <Target className="w-12 h-12 mx-auto mb-4 text-green-400" />
                    <h3 className="text-lg font-semibold mb-2">Miss Distance</h3>
                    <p className="text-2xl font-bold">
                      {outcome.missDistance > 0 ? `${Math.round(outcome.missDistance)} km` : 'Direct Impact'}
                    </p>
                  </div>
                  
                  <div className="text-center p-6 bg-gradient-to-b from-yellow-500/20 to-transparent rounded-lg">
                    <Shield className="w-12 h-12 mx-auto mb-4 text-yellow-400" />
                    <h3 className="text-lg font-semibold mb-2">Damage Reduction</h3>
                    <p className="text-2xl font-bold">{outcome.damageReduction}%</p>
                  </div>
                </div>

                <div className="text-left space-y-4 mb-8">
                  {outcome.success === 'complete' && (
                    <p className="text-lg text-gray-300">
                      Outstanding work, Commander! The asteroid has been successfully deflected away from Earth. 
                      Your strategic analysis and precise execution have saved millions of lives. The deflection 
                      resulted in a miss distance of {Math.round(outcome.missDistance)} kilometers, ensuring complete 
                      safety for our planet.
                    </p>
                  )}
                  {outcome.success === 'partial' && (
                    <p className="text-lg text-gray-300">
                      Good work, Commander. While the asteroid was not completely deflected, your intervention 
                      significantly reduced the impact severity. The damage has been reduced by {outcome.damageReduction}%, 
                      saving countless lives. The impact zone has been minimized, and emergency response teams 
                      are prepared for the reduced threat.
                    </p>
                  )}
                  {outcome.success === 'failed' && (
                    <p className="text-lg text-gray-300">
                      Despite your best efforts, Commander, the deflection attempt was not successful. 
                      The asteroid will impact Earth as originally predicted. However, your courage and 
                      dedication in the face of impossible odds will not be forgotten. Emergency response 
                      protocols are now in effect.
                    </p>
                  )}
                </div>

                <div className="flex justify-center gap-4">
                  <Button variant="neon" onClick={resetGame}>
                    <RotateCcw className="w-4 h-4 mr-2" />
                    New Mission
                  </Button>
                  <Button variant="outline" onClick={() => {
                    // Share functionality could be added here
                    console.log('Share result:', outcome);
                  }}>
                    <Radio className="w-4 h-4 mr-2" />
                    Share Result
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    );
  }

  return null;
}

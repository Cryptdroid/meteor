'use client';

import { motion, useScroll, useTransform, useInView } from 'framer-motion';
import { ArrowRight, Shield, Telescope, AlertTriangle, Rocket, Sparkles, Zap, Target, Globe, Clock, Satellite, Brain, Database, Eye } from 'lucide-react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { Suspense, useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardMetric } from '@/components/ui/card';

const LandingScene = dynamic(() => import('@/components/3d/LandingScene'), {
  ssr: false,
  loading: () => (
    <div className="absolute inset-0 stellar-gradient flex items-center justify-center">
      <div className="text-stellar-light text-xl font-mono">Initializing stellar environment...</div>
    </div>
  ),
});

export default function StorytellingLanding() {
  const [currentSection, setCurrentSection] = useState(0);
  const { scrollYProgress } = useScroll();
  const heroRef = useRef<HTMLDivElement>(null);
  const featuresRef = useRef<HTMLDivElement>(null);
  const dataRef = useRef<HTMLDivElement>(null);
  
  const heroInView = useInView(heroRef, { amount: 0.3 });
  const featuresInView = useInView(featuresRef, { amount: 0.2 });
  const dataInView = useInView(dataRef, { amount: 0.2 });

  // Parallax transforms
  const backgroundY = useTransform(scrollYProgress, [0, 1], ['0%', '50%']);
  const headerOpacity = useTransform(scrollYProgress, [0, 0.2], [1, 0]);

  // Counter animation hook
  const useCounter = (target: number, inView: boolean) => {
    const [count, setCount] = useState(0);
    
    useEffect(() => {
      if (!inView) return;
      
      const duration = 2000;
      const steps = 60;
      const increment = target / steps;
      let current = 0;
      
      const timer = setInterval(() => {
        current += increment;
        if (current >= target) {
          setCount(target);
          clearInterval(timer);
        } else {
          setCount(Math.floor(current));
        }
      }, duration / steps);
      
      return () => clearInterval(timer);
    }, [target, inView]);
    
    return count;
  };

  return (
    <div className="relative w-full overflow-x-hidden bg-stellar-void">
      {/* Animated Background */}
      <motion.div 
        className="fixed inset-0 z-0"
        style={{ y: backgroundY }}
      >
        <Suspense fallback={<div className="w-full h-full stellar-gradient" />}>
          <LandingScene />
        </Suspense>
      </motion.div>

      {/* Stellar Grid Overlay */}
      <div className="fixed inset-0 z-10 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-b from-stellar-void/40 via-transparent to-stellar-void" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.8)_100%)]" />
      </div>

      {/* Hero Section */}
      <motion.div 
        ref={heroRef}
        className="relative z-20 min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8"
        style={{ opacity: headerOpacity }}
      >
        <div className="max-w-7xl mx-auto w-full">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12 lg:gap-20 items-center">
            {/* Left Column - Hero Content */}
            <div className="space-y-6 sm:space-y-8 text-center lg:text-left order-2 lg:order-1">
              {/* Status Badge */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="inline-flex items-center gap-3 glass-card px-6 py-3 rounded-2xl border border-cyber-500/30"
              >
                <div className="w-3 h-3 rounded-full bg-cyber-500 animate-pulse" />
                <span className="text-cyber-400 font-mono text-sm tracking-wider">
                  PLANETARY DEFENSE SYSTEM
                </span>
              </motion.div>

              {/* Main Headline */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, delay: 0.4 }}
                className="space-y-4"
              >
                <h1 className="heading-display text-3xl sm:text-4xl md:text-5xl lg:text-7xl xl:text-8xl text-white leading-tight">
                  <span className="block">Asteroid Defense</span>
                  <span className="block text-gradient-cyber">
                    Grid System
                  </span>
                </h1>
                
                <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-stellar-light/80 leading-relaxed max-w-2xl mx-auto lg:mx-0">
                  Advanced simulation platform for planetary impact scenarios. 
                  Train. Analyze. Defend.
                </p>
              </motion.div>

              {/* Action Buttons */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.8 }}
                className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start"
              >
                <Link href="/dashboard">
                  <Button size="xl" className="group gap-3 shadow-2xl shadow-cyber-500/25">
                    <Zap className="w-5 h-5" />
                    Launch Simulation
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
                
                <Link href="/ar">
                  <Button variant="outline" size="xl" className="gap-3">
                    <Eye className="w-5 h-5" />
                    AR Experience
                  </Button>
                </Link>
              </motion.div>

              {/* Key Stats */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 1.0 }}
                className="grid grid-cols-3 gap-3 sm:gap-6 pt-8 max-w-md mx-auto lg:max-w-none"
              >
                <div className="text-center">
                  <div className="text-2xl sm:text-3xl lg:text-4xl font-bold text-cyber-400 font-mono">
                    30K+
                  </div>
                  <p className="text-stellar-light/60 text-xs sm:text-sm mt-1">
                    Tracked Objects
                  </p>
                </div>
                <div className="text-center">
                  <div className="text-2xl sm:text-3xl lg:text-4xl font-bold text-matrix-400 font-mono">
                    99.7%
                  </div>
                  <p className="text-stellar-light/60 text-xs sm:text-sm mt-1">
                    Accuracy Rate
                  </p>
                </div>
                <div className="text-center">
                  <div className="text-2xl sm:text-3xl lg:text-4xl font-bold text-status-warning font-mono">
                    24/7
                  </div>
                  <p className="text-stellar-light/60 text-xs sm:text-sm mt-1">
                    Monitoring
                  </p>
                </div>
              </motion.div>
            </div>

            {/* Right Column - Feature Highlights */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 1, delay: 0.6 }}
              className="space-y-4 sm:space-y-6 order-1 lg:order-2"
            >
              <Card variant="glass" className="p-6 hover:cyber-glow transition-all duration-500">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-cyber-500/20 flex items-center justify-center">
                      <Target className="w-6 h-6 text-cyber-400" />
                    </div>
                    <CardTitle className="text-lg">Real-Time Tracking</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-stellar-light/70">
                    Monitor actual Near-Earth Objects using live NASA data feeds and advanced orbital mechanics.
                  </p>
                </CardContent>
              </Card>

              <Card variant="glass" className="p-6 hover:matrix-glow transition-all duration-500">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-matrix-500/20 flex items-center justify-center">
                      <Brain className="w-6 h-6 text-matrix-400" />
                    </div>
                    <CardTitle className="text-lg">AI-Powered Analysis</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-stellar-light/70">
                    Machine learning algorithms predict impact scenarios and optimize deflection strategies.
                  </p>
                </CardContent>
              </Card>

              <Card variant="glass" className="p-6 hover:shadow-lg hover:shadow-status-warning/20 transition-all duration-500">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-status-warning/20 flex items-center justify-center">
                      <Shield className="w-6 h-6 text-status-warning" />
                    </div>
                    <CardTitle className="text-lg">Defense Protocols</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-stellar-light/70">
                    Test multiple planetary defense scenarios with realistic physics simulations.
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* Features Section */}
      <div ref={featuresRef} className="relative z-20 py-12 sm:py-16 md:py-20 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section Header */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16 lg:mb-24"
          >
            <div className="inline-flex items-center gap-3 glass-card px-6 py-3 rounded-2xl border border-matrix-500/30 mb-8">
              <Database className="w-5 h-5 text-matrix-400" />
              <span className="text-matrix-400 font-mono text-sm tracking-wider">
                SYSTEM CAPABILITIES
              </span>
            </div>
            
            <h2 className="heading-display text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-white mb-6">
              <span className="block">Advanced Defense</span>
              <span className="block text-gradient-matrix">Simulation Suite</span>
            </h2>
            
            <p className="text-base sm:text-lg md:text-xl text-stellar-light/80 max-w-3xl mx-auto leading-relaxed px-4 sm:px-0">
              Comprehensive planetary protection tools powered by real astronomical data 
              and cutting-edge simulation technology.
            </p>
          </motion.div>

          {/* Feature Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 lg:gap-12">
            {/* Real-Time Monitoring */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              viewport={{ once: true }}
            >
              <Card variant="glass" className="p-8 h-full hover:cyber-glow transition-all duration-500">
                <CardHeader>
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-16 h-16 rounded-2xl bg-cyber-500/20 flex items-center justify-center">
                      <Satellite className="w-8 h-8 text-cyber-400" />
                    </div>
                    <div>
                      <CardTitle className="text-2xl mb-2">Real-Time Monitoring</CardTitle>
                      <p className="text-stellar-light/60 font-mono text-sm">NASA NEO Feed Integration</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  <p className="text-stellar-light/80 text-lg leading-relaxed">
                    Track over 30,000 Near-Earth Objects using live data from NASA's Jet Propulsion Laboratory. 
                    Monitor orbital trajectories, velocity changes, and potential collision courses in real-time.
                  </p>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <CardMetric label="Objects Tracked" value="30,127" />
                    <CardMetric label="Update Frequency" value="15min" />
                  </div>
                  
                  <div className="flex items-center gap-2 pt-4 border-t border-stellar-surface/20">
                    <div className="w-3 h-3 rounded-full bg-status-normal animate-pulse" />
                    <span className="text-status-normal text-sm font-medium">Live Data Stream Active</span>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Impact Simulation */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              viewport={{ once: true }}
            >
              <Card variant="glass" className="p-8 h-full hover:shadow-lg hover:shadow-status-warning/20 transition-all duration-500">
                <CardHeader>
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-16 h-16 rounded-2xl bg-status-warning/20 flex items-center justify-center">
                      <Target className="w-8 h-8 text-status-warning" />
                    </div>
                    <div>
                      <CardTitle className="text-2xl mb-2">Impact Analysis</CardTitle>
                      <p className="text-stellar-light/60 font-mono text-sm">Physics-Based Modeling</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  <p className="text-stellar-light/80 text-lg leading-relaxed">
                    Calculate detailed impact scenarios including energy release, crater formation, 
                    tsunami generation, and global climate effects using advanced physics models.
                  </p>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <CardMetric label="Accuracy Rate" value="99.7%" />
                    <CardMetric label="Sim Speed" value="1000x" />
                  </div>
                  
                  <div className="flex items-center gap-2 pt-4 border-t border-stellar-surface/20">
                    <div className="w-3 h-3 rounded-full bg-status-warning animate-pulse" />
                    <span className="text-status-warning text-sm font-medium">High-Precision Calculations</span>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Defense Strategies */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              viewport={{ once: true }}
            >
              <Card variant="glass" className="p-8 h-full hover:matrix-glow transition-all duration-500">
                <CardHeader>
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-16 h-16 rounded-2xl bg-matrix-500/20 flex items-center justify-center">
                      <Shield className="w-8 h-8 text-matrix-400" />
                    </div>
                    <div>
                      <CardTitle className="text-2xl mb-2">Defense Systems</CardTitle>
                      <p className="text-stellar-light/60 font-mono text-sm">Multi-Vector Approach</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  <p className="text-stellar-light/80 text-lg leading-relaxed">
                    Test kinetic impactors, nuclear deflection, gravity tractors, and ion beam shepherd missions. 
                    Compare effectiveness across different asteroid compositions and sizes.
                  </p>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <CardMetric label="Strategies" value="8" />
                    <CardMetric label="Success Rate" value="94%" />
                  </div>
                  
                  <div className="flex items-center gap-2 pt-4 border-t border-stellar-surface/20">
                    <div className="w-3 h-3 rounded-full bg-matrix-500 animate-pulse" />
                    <span className="text-matrix-400 text-sm font-medium">Multi-Mission Planning</span>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* AR Visualization */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.8 }}
              viewport={{ once: true }}
            >
              <Card variant="glass" className="p-8 h-full hover:shadow-lg hover:shadow-cyber-500/20 transition-all duration-500">
                <CardHeader>
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-16 h-16 rounded-2xl bg-cyber-500/20 flex items-center justify-center">
                      <Eye className="w-8 h-8 text-cyber-400" />
                    </div>
                    <div>
                      <CardTitle className="text-2xl mb-2">AR Experience</CardTitle>
                      <p className="text-stellar-light/60 font-mono text-sm">Immersive Visualization</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  <p className="text-stellar-light/80 text-lg leading-relaxed">
                    Experience asteroid approaches and impacts in augmented reality. 
                    Visualize scale, trajectories, and defense missions in your physical environment.
                  </p>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <CardMetric label="AR Modes" value="6" />
                    <CardMetric label="Compatibility" value="WebXR" />
                  </div>
                  
                  <div className="flex items-center gap-2 pt-4 border-t border-stellar-surface/20">
                    <div className="w-3 h-3 rounded-full bg-cyber-500 animate-pulse" />
                    <span className="text-cyber-400 text-sm font-medium">WebXR Compatible</span>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Data Section */} 
      <div ref={dataRef} className="relative z-20 py-12 sm:py-16 md:py-20 lg:py-32 bg-gradient-to-b from-transparent via-stellar-dark/50 to-transparent">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section Header */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <div className="inline-flex items-center gap-3 glass-card px-6 py-3 rounded-2xl border border-status-critical/30 mb-8">
              <AlertTriangle className="w-5 h-5 text-status-critical animate-pulse" />
              <span className="text-status-critical font-mono text-sm tracking-wider">
                THREAT ASSESSMENT
              </span>
            </div>
            
            <h2 className="heading-display text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-white mb-6">
              <span className="block">Real Asteroid</span>
              <span className="block text-gradient-stellar">Threat Data</span>
            </h2>
            
            <p className="text-base sm:text-lg md:text-xl text-stellar-light/80 max-w-3xl mx-auto leading-relaxed px-4 sm:px-0">
              Current near-Earth object statistics and historical impact data 
              from NASA's Center for Near Earth Object Studies.
            </p>
          </motion.div>

          {/* Statistics Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-12 sm:mb-16">
            {[
              { 
                value: useCounter(34738, dataInView), 
                label: "Known NEOs", 
                description: "Currently tracked objects",
                color: "cyber" 
              },
              { 
                value: useCounter(2347, dataInView), 
                label: "PHAs", 
                description: "Potentially hazardous asteroids",
                color: "warning" 
              },
              { 
                value: useCounter(160, dataInView), 
                label: "New discoveries", 
                description: "Found this year",
                color: "matrix" 
              },
              { 
                value: useCounter(66, dataInView), 
                label: "Million years", 
                description: "Since last major impact",
                color: "critical" 
              }
            ].map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card variant="glass" className="p-4 sm:p-6 text-center hover:interactive-element transition-all duration-300">
                  <CardContent>
                    <div className={`text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold font-mono mb-2 text-${stat.color}-400`}>
                      {stat.value.toLocaleString()}
                    </div>
                    <div className="text-white font-semibold mb-1 text-sm sm:text-base">
                      {stat.label}
                    </div>
                    <p className="text-stellar-light/60 text-xs sm:text-sm">
                      {stat.description}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Historical Context */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            viewport={{ once: true }}
          >
            <Card variant="status" statusColor="warning" className="p-8 max-w-4xl mx-auto">
              <CardHeader>
                <CardTitle className="text-2xl text-center mb-6">
                  Historical Impact Events
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8">
                  <div className="text-center">
                    <div className="text-2xl sm:text-3xl font-bold text-status-critical mb-2">
                      65 MYA
                    </div>
                    <p className="font-semibold text-white mb-2 text-sm sm:text-base">Chicxulub Impact</p>
                    <p className="text-stellar-light/70 text-sm">
                      10km asteroid ended dinosaur era
                    </p>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl sm:text-3xl font-bold text-status-warning mb-2">
                      1908
                    </div>
                    <p className="font-semibold text-white mb-2 text-sm sm:text-base">Tunguska Event</p>
                    <p className="text-stellar-light/70 text-sm">
                      50m object flattened 2,000 km² of forest
                    </p>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl sm:text-3xl font-bold text-status-caution mb-2">
                      2013
                    </div>
                    <p className="font-semibold text-white mb-2 text-sm sm:text-base">Chelyabinsk</p>
                    <p className="text-stellar-light/70 text-sm">
                      20m object injured 1,500 people
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>

      {/* Call to Action Section */}
      <div className="relative z-20 py-12 sm:py-16 md:py-20 lg:py-32">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <div className="inline-flex items-center gap-3 glass-card px-6 py-3 rounded-2xl border border-cyber-500/30 mb-8">
              <Sparkles className="w-5 h-5 text-cyber-400 animate-pulse" />
              <span className="text-cyber-400 font-mono text-sm tracking-wider">
                MISSION BRIEFING
              </span>
            </div>
            
            <h2 className="heading-display text-3xl sm:text-4xl md:text-5xl lg:text-7xl text-white mb-6 sm:mb-8 leading-tight">
              <span className="block">Defend</span>
              <span className="block text-gradient-cyber">Earth</span>
            </h2>
            
            <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-stellar-light/80 max-w-3xl mx-auto leading-relaxed mb-8 sm:mb-12 px-4 sm:px-0">
              Take command of humanity's most advanced planetary defense systems. 
              Use real NASA data and cutting-edge simulations to protect 
              <span className="text-cyber-400 font-bold"> 8 billion lives</span>.
            </p>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12 sm:mb-16">
              <Link href="/dashboard" className="w-full sm:w-auto">
                <Button size="xl" className="w-full sm:w-auto group gap-3 sm:gap-4 text-base sm:text-lg px-8 sm:px-12 py-3 sm:py-4 shadow-2xl shadow-cyber-500/25">
                  <Rocket className="w-5 h-5 sm:w-6 sm:h-6" />
                  Launch Simulation
                  <ArrowRight className="w-5 h-5 sm:w-6 sm:h-6 group-hover:translate-x-2 transition-transform" />
                </Button>
              </Link>
              
              <Link href="/ar" className="w-full sm:w-auto">
                <Button variant="outline" size="xl" className="w-full sm:w-auto gap-3 sm:gap-4 text-base sm:text-lg px-8 sm:px-12 py-3 sm:py-4">
                  <Eye className="w-5 h-5 sm:w-6 sm:h-6" />
                  AR Experience
                </Button>
              </Link>
            </div>

            {/* Feature Highlights */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 max-w-5xl mx-auto">
              {[
                { 
                  icon: Telescope, 
                  title: "Real-Time Data", 
                  description: "Live NASA NEO feeds",
                  color: "cyber"
                },
                { 
                  icon: Target, 
                  title: "Impact Modeling", 
                  description: "Physics-based simulations",
                  color: "status-warning"
                },
                { 
                  icon: Shield, 
                  title: "Defense Systems", 
                  description: "Multi-vector strategies",
                  color: "matrix"
                },
                { 
                  icon: Brain, 
                  title: "AI Analysis", 
                  description: "Machine learning insights",
                  color: "status-extreme"
                }
              ].map((feature, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: idx * 0.1 }}
                  viewport={{ once: true }}
                  whileHover={{ scale: 1.05, y: -5 }}
                  className="glass-card p-4 sm:p-6 rounded-2xl border border-stellar-surface/30 hover:border-cyber-500/50 transition-all duration-300"
                >
                  <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-${feature.color}-500/20 flex items-center justify-center mx-auto mb-3 sm:mb-4`}>
                    <feature.icon className={`w-5 h-5 sm:w-6 sm:h-6 text-${feature.color}-400`} />
                  </div>
                  <h3 className="text-white font-semibold mb-2 text-sm sm:text-base">{feature.title}</h3>
                  <p className="text-stellar-light/70 text-xs sm:text-sm">{feature.description}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Footer */}
      <footer className="relative z-20 border-t border-stellar-surface/30 py-8 sm:py-12 bg-stellar-deep/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 items-center text-center md:text-left">
            {/* Logo & Description */}
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyber-500 to-matrix-500 flex items-center justify-center">
                  <Satellite className="w-5 h-5 text-stellar-void" />
                </div>
                <div>
                  <h3 className="text-white font-bold">Asteroid Defense Grid</h3>
                  <p className="text-stellar-light/60 text-sm font-mono">Planetary Protection Systems</p>
                </div>
              </div>
              <p className="text-stellar-light/70 text-sm leading-relaxed">
                Advanced simulation platform for planetary defense training and asteroid impact analysis.
              </p>
            </div>

            {/* Data Sources */}
            <div className="text-center">
              <h4 className="text-white font-semibold mb-4">Powered By</h4>
              <div className="space-y-2 text-stellar-light/70 text-sm">
                <p>NASA NEO Observations Program</p>
                <p>JPL Center for NEO Studies</p>
                <p>ESA Space Situational Awareness</p>
              </div>
            </div>

            {/* Legal */}
            <div className="text-center md:text-right">
              <p className="text-stellar-light/60 text-sm mb-2">
                Educational simulation for research purposes
              </p>
              <p className="text-stellar-light/40 text-xs">
                &copy; 2025 Asteroid Defense Grid Systems
              </p>
              <div className="flex justify-center md:justify-end items-center gap-2 mt-4">
                <div className="w-2 h-2 rounded-full bg-status-normal animate-pulse" />
                <span className="text-status-normal text-xs font-mono">
                  System Operational
                </span>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

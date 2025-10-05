'use client';

import { motion } from 'framer-motion';
import { Satellite, Shield, BarChart3, Home, ScanEye, Menu, X, Target, Zap } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import { useAppStore } from '@/store/useAppStore';
import Link from 'next/link';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import ColorblindModeToggle from '@/components/ui/ColorblindModeToggle';

export default function Header() {
  const { activeView, setActiveView } = useAppStore();
  const pathname = usePathname();
  const router = useRouter();
  const isOnDashboard = pathname === '/dashboard';
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Updated navigation structure - unified simulation view
  const navItems = [
    { id: 'simulation', label: 'Simulation', icon: Target, description: 'Interactive asteroid impact modeling' },
    { id: 'defend-earth', label: 'Defense Systems', icon: Shield, description: 'Planetary defense scenarios' },
  ] as const;

  const handleNavClick = (viewId: string) => {
    if (!isOnDashboard) {
      router.push('/dashboard');
    }
    setActiveView(viewId as any);
    setMobileMenuOpen(false);
  };

  return (
    <>
      <motion.header
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: [0.23, 1, 0.32, 1] }}
        className="fixed top-0 left-0 right-0 z-50 glass-panel border-b border-stellar-surface/30 backdrop-blur-xl"
      >
        <div className="container mx-auto px-3 sm:px-4 lg:px-6">
          <div className="flex items-center justify-between h-14 sm:h-16 lg:h-20">
            {/* Logo Section */}
            <Link href="/">
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex items-center gap-3 cursor-pointer group"
              >
                {/* Animated Logo Icon */}
                <div className="relative">
                  <motion.div
                    animate={{
                      rotate: [0, 360],
                    }}
                    transition={{
                      rotate: { duration: 20, repeat: Infinity, ease: 'linear' },
                    }}
                    className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 rounded-xl bg-gradient-to-br from-cyber-500 to-matrix-500 flex items-center justify-center relative overflow-hidden"
                  >
                    <Satellite className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-stellar-void z-10" />
                    {/* Holographic sweep effect */}
                    <motion.div
                      animate={{ x: [-100, 100] }}
                      transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent skew-x-12"
                    />
                  </motion.div>
                  {/* Orbital rings */}
                  <motion.div
                    animate={{ rotate: [0, -360] }}
                    transition={{ duration: 15, repeat: Infinity, ease: 'linear' }}
                    className="absolute -inset-2 border border-cyber-500/30 rounded-full"
                  />
                </div>

                {/* Brand Text */}
                <div className="hidden sm:block">
                  <h1 className="heading-display text-base sm:text-lg lg:text-xl text-white group-hover:text-gradient-cyber transition-all duration-300">
                    <span className="hidden md:inline">Asteroid Defense Grid</span>
                    <span className="md:hidden">Defense Grid</span>
                  </h1>
                  <p className="text-xs text-stellar-light/60 font-mono tracking-wider hidden lg:block">
                    Planetary Impact Simulator
                  </p>
                </div>
              </motion.div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-1">
              {/* Navigation Items */}
              {isOnDashboard && navItems.map((item, index) => {
                const Icon = item.icon;
                const isActive = activeView === item.id;

                return (
                  <motion.button
                    key={item.id}
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1, duration: 0.5 }}
                    onClick={() => handleNavClick(item.id)}
                    className={`relative px-4 py-2 rounded-xl flex items-center gap-2 transition-all duration-300 group ${
                      isActive
                        ? 'text-stellar-void bg-cyber-500 shadow-lg shadow-cyber-500/25'
                        : 'text-stellar-light hover:text-cyber-400 hover:bg-stellar-dark/50'
                    }`}
                    title={item.description}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="font-medium">{item.label}</span>

                    {/* Holographic sweep on hover */}
                    {!isActive && (
                      <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-cyber-500/20 to-transparent rounded-xl" />
                    )}
                  </motion.button>
                );
              })}

              {/* Utility Buttons */}
              <div className="flex items-center gap-2 ml-4 pl-4 border-l border-stellar-surface/30">
                <ColorblindModeToggle />
                
                {/* AR Mode */}
                <Link href="/ar">
                  <Button variant="outline" size="sm" className="gap-2">
                    <ScanEye className="w-4 h-4" />
                    <span>AR Mode</span>
                  </Button>
                </Link>
                
                {/* Home/Launch Button */}
                {!isOnDashboard ? (
                  <Link href="/dashboard">
                    <Button className="gap-2 shadow-lg">
                      <Zap className="w-4 h-4" />
                      <span>Launch Simulation</span>
                    </Button>
                  </Link>
                ) : (
                  <Link href="/">
                    <Button variant="ghost" size="sm" className="gap-2">
                      <Home className="w-4 h-4" />
                      <span>Home</span>
                    </Button>
                  </Link>
                )}
              </div>
            </nav>

            {/* Mobile Menu Button */}
            <div className="lg:hidden flex items-center gap-2">
              <ColorblindModeToggle />
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="relative"
              >
                <motion.div
                  animate={{ rotate: mobileMenuOpen ? 180 : 0 }}
                  transition={{ duration: 0.3 }}
                >
                  {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                </motion.div>
              </Button>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Mobile Menu Overlay */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ 
          opacity: mobileMenuOpen ? 1 : 0, 
          y: mobileMenuOpen ? 0 : -20,
          pointerEvents: mobileMenuOpen ? 'all' : 'none'
        }}
        transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
        className="fixed top-14 sm:top-16 left-0 right-0 z-40 lg:hidden max-h-[80vh] overflow-y-auto"
      >
        <div className="glass-panel border-b border-stellar-surface/30 backdrop-blur-xl">
          <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-6 space-y-3 sm:space-y-4">
            {/* Mobile Brand */}
            <div className="sm:hidden mb-6">
              <h2 className="heading-display text-lg text-white">
                Asteroid Defense Grid
              </h2>
              <p className="text-xs text-stellar-light/60 font-mono">
                Planetary Impact Simulator
              </p>
            </div>

            {/* Mobile Navigation */}
            {isOnDashboard && (
              <div className="space-y-2">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeView === item.id;

                  return (
                    <button
                      key={item.id}
                      onClick={() => handleNavClick(item.id)}
                      className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all duration-300 ${
                        isActive
                          ? 'bg-cyber-500 text-stellar-void shadow-lg'
                          : 'text-stellar-light hover:bg-stellar-dark/50 hover:text-cyber-400'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      <div className="text-left">
                        <div className="font-medium">{item.label}</div>
                        <div className="text-xs opacity-60">{item.description}</div>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}

            {/* Mobile Actions */}
            <div className="flex flex-col gap-3 pt-4 border-t border-stellar-surface/30">
              <Link href="/ar">
                <Button variant="outline" className="w-full gap-2" onClick={() => setMobileMenuOpen(false)}>
                  <ScanEye className="w-4 h-4" />
                  <span>AR Experience</span>
                </Button>
              </Link>
              
              {!isOnDashboard ? (
                <Link href="/dashboard">
                  <Button className="w-full gap-2" onClick={() => setMobileMenuOpen(false)}>
                    <Zap className="w-4 h-4" />
                    <span>Launch Simulation</span>
                  </Button>
                </Link>
              ) : (
                <Link href="/">
                  <Button variant="ghost" className="w-full gap-2" onClick={() => setMobileMenuOpen(false)}>
                    <Home className="w-4 h-4" />
                    <span>Back to Home</span>
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Mobile menu backdrop */}
      {mobileMenuOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setMobileMenuOpen(false)}
          className="fixed inset-0 bg-stellar-void/50 backdrop-blur-sm z-30 lg:hidden"
        />
      )}
    </>
  );
}

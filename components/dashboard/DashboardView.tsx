'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from '@/store/useAppStore';
import { useDynamicNASAData } from '@/lib/hooks/useDynamicNASAData';
import UnifiedSimulationView from './UnifiedSimulationView';
import DefendEarthMode from './DefendEarthMode';
import { RefreshCw, AlertCircle } from 'lucide-react';

const viewVariants = {
  enter: { opacity: 0, x: 50, scale: 0.95 },
  center: { opacity: 1, x: 0, scale: 1 },
  exit: { opacity: 0, x: -50, scale: 0.95 },
};

export default function DashboardView() {
  const { activeView } = useAppStore();
  const { isLoading, error, lastUpdated, refetch } = useDynamicNASAData();

  return (
    <div className="pt-24 pb-8 min-h-screen bg-stellar-void">
      {/* Status Bar */}
      <div className="container mx-auto px-4 lg:px-6 mb-6">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-panel border border-stellar-surface/30 rounded-2xl p-4 flex items-center justify-between"
        >
          <div className="flex items-center gap-4">
            {isLoading ? (
              <>
                <RefreshCw className="w-5 h-5 text-cyber-500 animate-spin" />
                <span className="text-stellar-light font-mono">Synchronizing NASA feed...</span>
              </>
            ) : error ? (
              <>
                <AlertCircle className="w-5 h-5 text-status-critical animate-pulse" />
                <span className="text-status-critical font-medium">{error}</span>
              </>
            ) : (
              <>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-status-normal animate-pulse shadow-lg shadow-status-normal/50" />
                  <span className="text-status-normal font-medium">SYSTEM ACTIVE</span>
                </div>
                <div className="text-stellar-light/70 font-mono text-sm">
                  Last sync: {lastUpdated ? new Date(lastUpdated).toLocaleTimeString() : 'Initializing...'}
                </div>
              </>
            )}
          </div>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={refetch}
            disabled={isLoading}
            className="glass-card px-4 py-2 border border-cyber-500/30 rounded-xl text-cyber-400 hover:border-cyber-500 hover:cyber-glow transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 font-medium"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Refresh Data</span>
          </motion.button>
        </motion.div>
      </div>

      {/* Main Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeView}
          variants={viewVariants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
        >
          {activeView === 'simulation' && <UnifiedSimulationView />}
          {activeView === 'defend-earth' && <DefendEarthMode />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

'use client';

import { motion } from 'framer-motion';
import { ScanEye, Smartphone, Globe, Zap, Shield, Camera } from 'lucide-react';
import Link from 'next/link';

export default function ARShowcase() {
  const features = [
    {
      icon: ScanEye,
      title: 'Augmented Reality',
      description: 'View asteroids in your real-world space using your mobile device',
    },
    {
      icon: Smartphone,
      title: 'Mobile First',
      description: 'Optimized for iOS ARKit and Android ARCore devices',
    },
    {
      icon: Globe,
      title: 'Real NASA Data',
      description: 'Live Near-Earth Object data rendered in 3D AR',
    },
    {
      icon: Zap,
      title: 'Interactive',
      description: 'Select, scale, and explore asteroids with touch gestures',
    },
    {
      icon: Shield,
      title: 'Impact Simulation',
      description: 'Visualize impact zones and damage radius in AR',
    },
    {
      icon: Camera,
      title: 'Surface Detection',
      description: 'Advanced hit-testing for precise placement',
    },
  ];

  return (
    <section className="relative py-20 px-4 overflow-hidden bg-gradient-to-b from-space-dark to-space-blue">
      {/* Background Effects */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-20 left-10 w-64 h-64 bg-space-cyan/30 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-space-neon/20 rounded-full blur-3xl"></div>
      </div>

      <div className="relative max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <motion.div
            animate={{
              rotate: [0, 360],
            }}
            transition={{
              duration: 20,
              repeat: Infinity,
              ease: 'linear',
            }}
            className="inline-block mb-6"
          >
            <ScanEye className="w-16 h-16 text-cyan-400" strokeWidth={1.5} />
          </motion.div>

          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Experience Asteroids in
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-green-400">
              Augmented Reality
            </span>
          </h2>

          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Step into the future of space education. View real NASA asteroid data
            in your physical environment using cutting-edge WebXR technology.
          </p>
        </motion.div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ scale: 1.05, y: -5 }}
                className="bg-gray-900/50 backdrop-blur-sm border border-cyan-500/30 rounded-xl p-6 hover:border-cyan-500/60 transition-all"
              >
                <div className="bg-gradient-to-br from-cyan-500/20 to-green-500/20 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                  <Icon className="w-6 h-6 text-cyan-400" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">{feature.title}</h3>
                <p className="text-gray-400">{feature.description}</p>
              </motion.div>
            );
          })}
        </div>

        {/* Demo Video/Screenshot Placeholder */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="relative bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl border border-cyan-500/30 p-8 mb-12"
        >
          <div className="aspect-video bg-gray-800 rounded-lg flex items-center justify-center relative overflow-hidden">
            {/* Placeholder for AR demo */}
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 to-green-500/10"></div>
            <div className="relative z-10 text-center">
              <ScanEye className="w-24 h-24 text-cyan-400/50 mx-auto mb-4" />
              <p className="text-xl text-gray-400">AR Demo Preview</p>
              <p className="text-sm text-gray-500 mt-2">
                Experience on mobile device to see AR in action
              </p>
            </div>

            {/* Animated grid overlay */}
            <div className="absolute inset-0 grid grid-cols-8 grid-rows-8 gap-2 opacity-20">
              {Array.from({ length: 64 }).map((_, i) => (
                <motion.div
                  key={i}
                  className="border border-cyan-500/30"
                  animate={{
                    opacity: [0.2, 0.5, 0.2],
                  }}
                  transition={{
                    duration: 2,
                    delay: i * 0.05,
                    repeat: Infinity,
                  }}
                />
              ))}
            </div>
          </div>
        </motion.div>

        {/* Device Requirements */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="bg-gradient-to-r from-blue-900/30 to-purple-900/30 rounded-xl border border-blue-500/30 p-6 mb-12"
        >
          <h3 className="text-2xl font-bold text-white mb-4">Device Requirements</h3>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="text-lg font-semibold text-cyan-400 mb-2">📱 iOS Devices</h4>
              <ul className="text-gray-300 space-y-1 text-sm">
                <li>• iPhone 6S or newer</li>
                <li>• iOS 15.0 or later</li>
                <li>• Safari 15+</li>
                <li>• ARKit support (built-in)</li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-semibold text-green-400 mb-2">🤖 Android Devices</h4>
              <ul className="text-gray-300 space-y-1 text-sm">
                <li>• ARCore compatible device</li>
                <li>• Android 8.0 or later</li>
                <li>• Chrome 90+ or Samsung Internet</li>
                <li>• Google Play Services for AR</li>
              </ul>
            </div>
          </div>
        </motion.div>

        {/* CTA Button */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center"
        >
          <Link href="/ar">
            <motion.button
              whileHover={{
                scale: 1.05,
                boxShadow: '0 0 40px rgba(0, 255, 255, 0.5)',
              }}
              whileTap={{ scale: 0.95 }}
              className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-cyan-500 to-green-500 rounded-xl text-black font-bold text-lg shadow-lg shadow-cyan-500/30 hover:shadow-cyan-500/50 transition-all"
            >
              <ScanEye className="w-6 h-6" />
              <span>Launch AR Experience</span>
            </motion.button>
          </Link>

          <p className="text-sm text-gray-400 mt-4">
            Best experienced on a mobile device • Camera permissions required
          </p>
        </motion.div>
      </div>
    </section>
  );
}

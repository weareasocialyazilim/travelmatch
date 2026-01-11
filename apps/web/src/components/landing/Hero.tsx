'use client';

import { motion } from 'framer-motion';
import { HERO_CONTENT } from '@/constants/content';
import { AppStoreBadges } from '@/components/ui/AppStoreBadges';

/**
 * Hero Section - "Anı Hediye Et"
 *
 * Features:
 * - Fluid typography with clamp()
 * - Smooth animations
 * - Mobile responsive
 */

export function Hero() {
  const content = HERO_CONTENT.tr;

  return (
    <section
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
      style={{ padding: 'clamp(2rem, 5vw, 4rem)' }}
    >
      <div className="container mx-auto max-w-6xl text-center">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <span
            className="inline-block px-6 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm"
            style={{ fontSize: 'clamp(0.875rem, 2vw, 1rem)' }}
          >
            {content.badge}
          </span>
        </motion.div>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="font-syne font-extrabold leading-tight mb-6"
          style={{ fontSize: 'clamp(2.5rem, 10vw, 7rem)' }}
        >
          <span className="text-stroke hover:text-[#ccff00] transition-all duration-300">
            {content.headline.split(' ')[0]}
          </span>
          <br />
          <span className="text-[#ccff00]">
            {content.headline.split(' ').slice(1).join(' ')}
          </span>
        </motion.h1>

        {/* Subheadline */}
        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="text-gray-400 max-w-2xl mx-auto mb-12"
          style={{ fontSize: 'clamp(1rem, 2.5vw, 1.25rem)' }}
        >
          {content.subheadline}
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.3 }}
          className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16"
        >
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.98 }}
            className="sticker bg-[#ccff00] text-black font-bold rounded-none border-2 border-black"
            style={{
              padding: 'clamp(0.875rem, 2vw, 1.25rem) clamp(2rem, 4vw, 3rem)',
              fontSize: 'clamp(1rem, 2vw, 1.125rem)',
            }}
            data-cursor-hover
          >
            {content.cta.primary}
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.98 }}
            className="sticker bg-transparent text-white font-bold rounded-none border-2 border-white hover:bg-white hover:text-black transition-colors"
            style={{
              padding: 'clamp(0.875rem, 2vw, 1.25rem) clamp(2rem, 4vw, 3rem)',
              fontSize: 'clamp(1rem, 2vw, 1.125rem)',
            }}
            data-cursor-hover
          >
            {content.cta.secondary}
          </motion.button>
        </motion.div>

        {/* App Store Badges */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.4 }}
        >
          <AppStoreBadges />
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.5 }}
          className="grid grid-cols-3 gap-8 mt-20 max-w-2xl mx-auto"
        >
          {[
            { value: '50K+', label: content.stats.connections },
            { value: '100K+', label: content.stats.gifts },
            { value: '50+', label: content.stats.cities },
          ].map((stat, index) => (
            <motion.div
              key={index}
              whileHover={{ scale: 1.05 }}
              className="text-center"
            >
              <div
                className="font-syne font-bold text-[#ccff00]"
                style={{ fontSize: 'clamp(1.5rem, 5vw, 3rem)' }}
              >
                {stat.value}
              </div>
              <div
                className="text-gray-500"
                style={{ fontSize: 'clamp(0.75rem, 2vw, 0.875rem)' }}
              >
                {stat.label}
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 0.5 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
      >
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="w-6 h-10 rounded-full border-2 border-white/30 flex items-start justify-center p-2"
        >
          <div className="w-1 h-2 bg-white/50 rounded-full" />
        </motion.div>
      </motion.div>
    </section>
  );
}

export default Hero;

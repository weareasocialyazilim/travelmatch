'use client';

import { motion } from 'framer-motion';
import { FEATURES_CONTENT } from '@/constants/content';

/**
 * Features Section
 *
 * Features:
 * - Staggered animations
 * - Fluid typography with clamp()
 * - Gen Z brutalist design
 */

export function Features() {
  const features = FEATURES_CONTENT.tr;

  return (
    <section
      className="relative py-32 overflow-hidden"
      style={{ padding: 'clamp(4rem, 10vw, 8rem) clamp(1rem, 5vw, 4rem)' }}
    >
      <div className="container mx-auto max-w-6xl">
        {/* Section Title */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.6 }}
          className="text-center mb-20"
        >
          <span
            className="inline-block px-4 py-1 bg-[#ff0099] text-black font-bold transform -rotate-2"
            style={{ fontSize: 'clamp(0.75rem, 2vw, 0.875rem)' }}
          >
            NEDEN TRAVELMATCH?
          </span>
          <h2
            className="font-syne font-bold mt-4"
            style={{ fontSize: 'clamp(2rem, 6vw, 4rem)' }}
          >
            <span className="text-stroke">Gerçek</span>{' '}
            <span className="text-[#ccff00]">Bağlantılar</span>
          </h2>
        </motion.div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
            >
              <motion.div
                whileHover={{ x: 10, y: -5 }}
                className="sticker bg-white/5 backdrop-blur-sm border border-white/10 p-8 h-full"
              >
                {/* Icon */}
                <div
                  className="mb-4"
                  style={{ fontSize: 'clamp(2.5rem, 5vw, 3.5rem)' }}
                >
                  {feature.icon}
                </div>

                {/* Title */}
                <h3
                  className="font-syne font-bold text-white mb-3"
                  style={{ fontSize: 'clamp(1.25rem, 3vw, 1.5rem)' }}
                >
                  {feature.title}
                </h3>

                {/* Description */}
                <p
                  className="text-gray-400"
                  style={{ fontSize: 'clamp(0.875rem, 2vw, 1rem)' }}
                >
                  {feature.description}
                </p>
              </motion.div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default Features;

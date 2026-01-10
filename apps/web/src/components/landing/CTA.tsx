'use client';

import { motion } from 'framer-motion';
import { CTA_CONTENT } from '@/constants/content';
import { AppStoreBadges } from '@/components/ui/AppStoreBadges';

/**
 * CTA Section
 *
 * Features:
 * - Strong call to action
 * - App store badges
 * - Fluid typography
 */

export function CTA() {
  const content = CTA_CONTENT.tr;

  return (
    <section
      className="relative overflow-hidden"
      style={{ padding: 'clamp(4rem, 10vw, 8rem) clamp(1rem, 5vw, 4rem)' }}
    >
      {/* Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-r from-[#ccff00]/10 via-[#ff0099]/10 to-[#00f0ff]/10 blur-3xl" />

      <div className="container mx-auto max-w-4xl relative">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          {/* Title */}
          <h2
            className="font-syne font-bold mb-6"
            style={{ fontSize: 'clamp(2rem, 6vw, 3.5rem)' }}
          >
            {content.title}
          </h2>

          {/* Subtitle */}
          <p
            className="text-gray-400 max-w-2xl mx-auto mb-10"
            style={{ fontSize: 'clamp(1rem, 2.5vw, 1.25rem)' }}
          >
            {content.subtitle}
          </p>

          {/* App Store Badges */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mb-8"
          >
            <AppStoreBadges />
          </motion.div>

          {/* Note */}
          <p
            className="text-gray-500"
            style={{ fontSize: 'clamp(0.75rem, 2vw, 0.875rem)' }}
          >
            {content.note}
          </p>
        </motion.div>
      </div>
    </section>
  );
}

export default CTA;

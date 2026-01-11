'use client';

import { motion } from 'framer-motion';
import { HOW_IT_WORKS_CONTENT } from '@/constants/content';

/**
 * How It Works Section
 *
 * Features:
 * - Step-by-step timeline
 * - Fluid typography
 * - Animated connectors
 */

export function HowItWorks() {
  const content = HOW_IT_WORKS_CONTENT.tr;

  return (
    <section
      className="relative overflow-hidden bg-gradient-to-b from-transparent via-[#0a0a0a] to-transparent"
      style={{ padding: 'clamp(4rem, 10vw, 8rem) clamp(1rem, 5vw, 4rem)' }}
    >
      <div className="container mx-auto max-w-5xl">
        {/* Section Title */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.6 }}
          className="text-center mb-20"
        >
          <h2
            className="font-syne font-bold"
            style={{ fontSize: 'clamp(2rem, 6vw, 4rem)' }}
          >
            {content.title.split('?')[0]}
            <span className="text-[#00f0ff]">?</span>
          </h2>
        </motion.div>

        {/* Steps */}
        <div className="relative">
          {/* Connection Line */}
          <div className="absolute left-8 md:left-1/2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-[#ccff00] via-[#ff0099] to-[#00f0ff] hidden md:block" />

          {content.steps.map((step, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: index % 2 === 0 ? -30 : 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.6, delay: index * 0.15 }}
              className={`relative flex items-center mb-12 last:mb-0 ${
                index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'
              }`}
            >
              {/* Step Number Circle */}
              <div className="absolute left-8 md:left-1/2 -translate-x-1/2 z-10">
                <motion.div
                  whileHover={{ scale: 1.2, rotate: 10 }}
                  className="w-16 h-16 bg-black border-2 border-[#ccff00] flex items-center justify-center font-syne font-bold text-[#ccff00]"
                  style={{ fontSize: 'clamp(1rem, 2vw, 1.25rem)' }}
                >
                  {step.number}
                </motion.div>
              </div>

              {/* Content Card */}
              <div
                className={`w-full md:w-5/12 pl-24 md:pl-0 ${index % 2 === 0 ? 'md:pr-20' : 'md:pl-20'}`}
              >
                <motion.div
                  whileHover={{ y: -5 }}
                  className="sticker bg-white/5 backdrop-blur-sm border border-white/10 p-6"
                >
                  <h3
                    className="font-syne font-bold text-white mb-2"
                    style={{ fontSize: 'clamp(1.125rem, 2.5vw, 1.375rem)' }}
                  >
                    {step.title}
                  </h3>
                  <p
                    className="text-gray-400"
                    style={{ fontSize: 'clamp(0.875rem, 2vw, 1rem)' }}
                  >
                    {step.description}
                  </p>
                </motion.div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default HowItWorks;

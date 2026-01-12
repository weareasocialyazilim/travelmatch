'use client';

import { motion } from 'framer-motion';
import { LiquidCard } from './LiquidCard';

/**
 * SacredMoments - Bento Grid Gallery
 *
 * Features:
 * - Asymmetric grid layout (Bento style)
 * - LiquidCard hover effects
 * - Staggered animations
 * - Tesla/Nvidia showcase aesthetic
 */

const MOMENTS = [
  {
    title: 'Neon Nights in Tokyo',
    category: 'Urban Ritual',
    size: 'md:col-span-2 md:row-span-2',
  },
  {
    title: 'Cappadocia Sunrise',
    category: 'Sacred Air',
    size: 'md:col-span-1 md:row-span-1',
  },
  {
    title: 'Bali Silence',
    category: 'Earth Connection',
    size: 'md:col-span-1 md:row-span-2',
  },
  {
    title: 'Icelandic Void',
    category: 'Pure Spirit',
    size: 'md:col-span-2 md:row-span-1',
  },
  {
    title: 'Marrakech Maze',
    category: 'Ancient Pulse',
    size: 'md:col-span-1 md:row-span-1',
  },
  {
    title: 'Patagonia Wild',
    category: 'Edge of World',
    size: 'md:col-span-1 md:row-span-1',
  },
];

export function SacredMoments() {
  return (
    <section id="sacred-moments" className="section-padding">
      <div className="section-container">
        {/* Header */}
        <div className="flex flex-col md:flex-row items-start md:items-end justify-between mb-16 gap-8">
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <span className="text-primary text-xs font-bold uppercase tracking-[0.3em] mb-4 block">
              Community Verified
            </span>
            <h2 className="font-clash text-fluid-display font-black text-foreground uppercase italic leading-[0.85] tracking-tighter">
              Sacred
              <br />
              <span className="text-muted/20">Artifacts</span>
            </h2>
          </motion.div>

          <motion.p
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-muted max-w-sm text-sm leading-relaxed border-l border-border pl-6"
          >
            Real stories leaked from the app. Each one a gift, each one community approved.
            These are the artifacts of human connection.
          </motion.p>
        </div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 md:gap-6">
          {MOMENTS.map((moment, idx) => (
            <LiquidCard
              key={idx}
              title={moment.title}
              category={moment.category}
              className={moment.size}
              index={idx}
            />
          ))}
        </div>

        {/* View All Link */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-12 text-center"
        >
          <button
            className="group inline-flex items-center gap-3 text-muted hover:text-primary
                       font-bold uppercase tracking-widest text-xs transition-colors"
          >
            <span>Explore All Artifacts</span>
            <svg
              className="w-4 h-4 transition-transform group-hover:translate-x-1"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M14 5l7 7m0 0l-7 7m7-7H3"
              />
            </svg>
          </button>
        </motion.div>
      </div>
    </section>
  );
}

export default SacredMoments;

'use client';

import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';

/**
 * RitualSection - The Process / How It Works
 *
 * Features:
 * - Scroll-triggered step animations
 * - Tesla X-Ray style technical presentation
 * - Alternating layout (zig-zag)
 * - Gradient glow backgrounds
 */

const STEPS = [
  {
    num: '01',
    title: 'Discover the Sacred',
    desc: 'Forget ordinary trips. Discover community-verified "Moments" that have soul. Each one curated, each one real.',
    color: 'from-primary',
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
    ),
  },
  {
    num: '02',
    title: 'Secure the Exchange',
    desc: 'Our Escrow protocol protects your gift funds in the digital void until the ritual is complete. Zero risk, maximum trust.',
    color: 'from-secondary',
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
          d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
      </svg>
    ),
  },
  {
    num: '03',
    title: 'Complete the Ceremony',
    desc: 'The experience happens, proofs are submitted, and the trust ring completes. Take your first step into a passport-less world.',
    color: 'from-accent',
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
          d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
];

function RitualStep({
  step,
  index,
}: {
  step: typeof STEPS[0];
  index: number;
}) {
  const ref = useRef(null);
  const isInView = useInView(ref, { margin: '-20%', once: true });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 60 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 60 }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      className={`flex flex-col ${
        index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'
      } items-center gap-12 md:gap-20`}
    >
      {/* Text Content */}
      <div className="flex-1 max-w-lg">
        {/* Step Number */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.8 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className={`text-6xl md:text-7xl font-clash font-black mb-6 bg-gradient-to-br ${step.color}
                      to-transparent bg-clip-text text-transparent opacity-40`}
        >
          {step.num}
        </motion.div>

        {/* Title */}
        <h3 className="text-3xl md:text-4xl font-clash font-bold text-foreground uppercase italic leading-tight mb-6">
          {step.title}
        </h3>

        {/* Description */}
        <p className="text-muted text-lg leading-relaxed">
          {step.desc}
        </p>

        {/* Progress Line */}
        <motion.div
          initial={{ scaleX: 0 }}
          animate={isInView ? { scaleX: 1 } : { scaleX: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className={`mt-8 h-px w-32 bg-gradient-to-r ${step.color} to-transparent origin-left`}
        />
      </div>

      {/* Visual Placeholder */}
      <div className="flex-1 w-full max-w-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.9 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="relative aspect-square group"
        >
          {/* Background Glow */}
          <div
            className={`absolute inset-0 bg-gradient-to-br ${step.color} opacity-5
                        blur-[80px] group-hover:opacity-10 transition-opacity duration-700`}
          />

          {/* Card */}
          <div
            className="w-full h-full border border-border rounded-[2.5rem] bg-card/50
                       backdrop-blur-xl flex items-center justify-center overflow-hidden
                       group-hover:border-border-hover transition-colors duration-500"
          >
            {/* Icon */}
            <div className={`text-muted group-hover:text-primary transition-colors duration-500`}>
              {step.icon}
            </div>

            {/* Large Background Number */}
            <div
              className="absolute text-[15rem] font-clash font-black text-foreground/[0.02]
                         rotate-12 select-none pointer-events-none"
            >
              {step.num}
            </div>

            {/* Corner Decoration */}
            <div className="absolute bottom-6 right-6 w-12 h-12 border-b border-r border-border/50 rounded-br-xl" />
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}

export function RitualSection() {
  return (
    <section id="ritual" className="section-padding relative overflow-hidden">
      {/* Center Line Decoration */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-px h-full bg-gradient-to-b from-transparent via-border to-transparent" />

      <div className="section-container">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-24"
        >
          <span className="text-primary text-xs font-bold uppercase tracking-[0.3em] mb-4 block">
            The Protocol
          </span>
          <h2 className="font-clash text-fluid-display font-black text-foreground uppercase italic leading-[0.85] tracking-tighter">
            The Ritual of
            <br />
            <span className="gradient-text">Gifting</span>
          </h2>
        </motion.div>

        {/* Steps */}
        <div className="space-y-32 md:space-y-40">
          {STEPS.map((step, idx) => (
            <RitualStep key={idx} step={step} index={idx} />
          ))}
        </div>
      </div>
    </section>
  );
}

export default RitualSection;

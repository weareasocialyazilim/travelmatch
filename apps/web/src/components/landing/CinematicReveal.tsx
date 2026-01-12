'use client';

import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

/**
 * CinematicReveal - Apple-style text mask reveal section
 *
 * Features:
 * - Scroll-linked text scaling
 * - Reveal effect through giant text
 * - Nvidia-style minimal side text
 * - Immersive video/visual background
 */

export function CinematicReveal() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start end', 'end start'],
  });

  // Transform values for the reveal effect
  const scale = useTransform(scrollYProgress, [0, 0.4], [1, 40]);
  const textOpacity = useTransform(scrollYProgress, [0, 0.15, 0.35], [0, 1, 0]);
  const backgroundOpacity = useTransform(scrollYProgress, [0.25, 0.45, 0.8], [0, 1, 0.9]);
  const sideTextOpacity = useTransform(scrollYProgress, [0.4, 0.55], [0, 1]);

  return (
    <section
      ref={containerRef}
      className="relative h-[350vh]"
      id="cinematic"
    >
      <div className="sticky top-0 h-screen w-full flex items-center justify-center overflow-hidden">
        {/* Background Visual Layer */}
        <motion.div
          style={{ opacity: backgroundOpacity }}
          className="absolute inset-0 z-0"
        >
          {/* Gradient background representing platform essence */}
          <div className="w-full h-full bg-gradient-to-b from-primary/10 via-background to-background relative">
            {/* Abstract visual elements */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="relative">
                {/* Concentric rings */}
                {[...Array(5)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2
                               border border-primary/20 rounded-full"
                    style={{
                      width: `${(i + 1) * 150}px`,
                      height: `${(i + 1) * 150}px`,
                    }}
                    animate={{
                      scale: [1, 1.1, 1],
                      opacity: [0.2, 0.4, 0.2],
                    }}
                    transition={{
                      duration: 3,
                      delay: i * 0.3,
                      repeat: Infinity,
                      ease: 'easeInOut',
                    }}
                  />
                ))}
                {/* Center glow */}
                <div className="w-32 h-32 bg-primary/30 rounded-full blur-3xl" />
              </div>
            </div>

            {/* Large background text */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <span className="text-foreground/[0.03] font-clash font-black text-[25vw] uppercase italic select-none whitespace-nowrap">
                EXPERIENCE
              </span>
            </div>
          </div>
        </motion.div>

        {/* Masking Text Layer */}
        <motion.div
          style={{ scale, opacity: textOpacity }}
          className="z-10 flex items-center justify-center pointer-events-none"
        >
          <h2 className="font-clash text-[18vw] font-black text-foreground leading-none uppercase italic tracking-tighter">
            DIVE
          </h2>
        </motion.div>

        {/* Side Text - Nvidia Style */}
        <motion.div
          style={{ opacity: sideTextOpacity }}
          className="absolute bottom-16 left-8 md:left-16 z-20"
        >
          <p className="text-[10px] font-bold text-primary uppercase tracking-[0.4em] mb-4">
            Phase 04: Transmutation
          </p>
          <h4 className="text-xl md:text-2xl text-foreground font-clash italic uppercase font-medium leading-tight max-w-xs">
            Go beyond the experience.
            <br />
            <span className="text-muted">The ritual awaits you.</span>
          </h4>
        </motion.div>

        {/* Right side indicator */}
        <motion.div
          style={{ opacity: sideTextOpacity }}
          className="absolute bottom-16 right-8 md:right-16 z-20 text-right"
        >
          <div className="flex flex-col items-end gap-2">
            <div className="w-8 h-px bg-primary" />
            <span className="text-[9px] text-muted uppercase tracking-widest">
              Scroll to reveal
            </span>
          </div>
        </motion.div>

        {/* Progress indicator */}
        <motion.div
          className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20"
          style={{ opacity: textOpacity }}
        >
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="w-px h-8 bg-gradient-to-b from-primary to-transparent"
          />
        </motion.div>
      </div>
    </section>
  );
}

export default CinematicReveal;

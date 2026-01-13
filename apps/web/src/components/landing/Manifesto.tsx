'use client';

import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';
import { useRitual } from '@/context/RitualContext';

/**
 * Manifesto - Kinetic Typography Page
 *
 * Large, flowing text that moves with scroll
 * Creates a sense of movement and philosophy
 * "No Passports, Just Rituals" manifesto
 */

export function Manifesto() {
  const containerRef = useRef(null);
  const { t } = useRitual();

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start end', 'end start'],
  });

  const x1 = useTransform(scrollYProgress, [0, 1], [0, -500]);
  const x2 = useTransform(scrollYProgress, [0, 1], [0, 500]);
  const opacity = useTransform(scrollYProgress, [0, 0.5, 1], [0, 1, 0.3]);

  return (
    <section
      ref={containerRef}
      className="relative py-40 bg-background overflow-hidden border-t border-white/5"
    >
      {/* Ambient background glow */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[500px] bg-gradient-to-r from-primary/5 via-secondary/5 to-transparent blur-[100px] rounded-full" />
      </div>

      <div className="relative z-10 flex flex-col gap-16">
        {/* First flowing text - Right to Left */}
        <motion.div style={{ x: x1 }} className="whitespace-nowrap">
          <h2 className="text-[10vw] md:text-[12vw] font-clash font-black uppercase italic text-white/8 tracking-tighter leading-none">
            {t.manifesto.title} {t.manifesto.title}
          </h2>
        </motion.div>

        {/* Central manifesto statement */}
        <motion.div
          style={{ opacity }}
          className="container mx-auto px-6 text-center z-10 py-20"
        >
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1 }}
            className="font-clash text-3xl md:text-6xl text-white italic max-w-5xl mx-auto leading-tight tracking-tight"
          >
            {t.manifesto.content.split('\n')[0]}
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-secondary to-primary">
              {t.manifesto.content.split('\n')[1]}
            </span>
          </motion.p>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1, delay: 0.2 }}
            className="mt-12 text-neutral-400 text-base md:text-lg max-w-3xl mx-auto leading-relaxed font-light"
          >
            {t.manifesto.sub_content}
          </motion.p>
        </motion.div>

        {/* Second flowing text - Left to Right */}
        <motion.div style={{ x: x2 }} className="whitespace-nowrap">
          <h2 className="text-[10vw] md:text-[12vw] font-clash font-black uppercase italic text-secondary/8 tracking-tighter leading-none">
            {t.manifesto.title_line2} {t.manifesto.title_line2}
          </h2>
        </motion.div>
      </div>
    </section>
  );
}

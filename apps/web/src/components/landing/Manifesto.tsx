'use client';

import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';

/**
 * Manifesto - Kinetic Typography Page
 *
 * Large, flowing text that moves with scroll
 * Creates a sense of movement and philosophy
 * "No Passports, Just Rituals" manifesto
 */

export function Manifesto() {
  const containerRef = useRef(null);
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
            NO PASSPORTS JUST RITUALS NO PASSPORTS JUST RITUALS
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
            We erased borders from maps.
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-secondary to-primary">
              Now we return them to heartbeats.
            </span>
          </motion.p>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1, delay: 0.2 }}
            className="mt-12 text-neutral-400 text-base md:text-lg max-w-3xl mx-auto leading-relaxed font-light"
          >
            TravelMatch isn't an app. It's a ritual. A moment. A promise that
            somewhere in the world, someone is thinking of you enough to send a
            gift—a moment—across impossible distances.
          </motion.p>
        </motion.div>

        {/* Second flowing text - Left to Right */}
        <motion.div style={{ x: x2 }} className="whitespace-nowrap">
          <h2 className="text-[10vw] md:text-[12vw] font-clash font-black uppercase italic text-secondary/8 tracking-tighter leading-none">
            SACRED MOMENTS EXCHANGE SACRED MOMENTS EXCHANGE
          </h2>
        </motion.div>

        {/* Bottom highlight */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1, delay: 0.3 }}
          className="container mx-auto px-6 text-center z-10 py-10"
        >
          <div className="inline-block px-6 py-4 border border-primary/30 rounded-full">
            <p className="text-primary text-sm md:text-base font-bold uppercase tracking-widest">
              ✨ Every gift is a time machine. Every moment, a bridge.
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

export default Manifesto;

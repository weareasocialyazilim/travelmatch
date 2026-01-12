'use client';

import { useRef } from 'react';
import { motion, useScroll, useTransform, MotionValue } from 'framer-motion';

/**
 * TrustRing - Scrollytelling Section
 *
 * Features:
 * - Scroll-linked ring animation
 * - Nvidia-style glow effects
 * - Side notes that appear/disappear with scroll
 * - Represents the Escrow protocol
 */

interface ScrollNoteProps {
  progress: MotionValue<number>;
  range: [number, number];
  title: string;
  desc: string;
  position: 'left' | 'right';
}

const ScrollNote = ({ progress, range, title, desc, position }: ScrollNoteProps) => {
  const opacity = useTransform(
    progress,
    [range[0] - 0.1, range[0], range[1], range[1] + 0.1],
    [0, 1, 1, 0]
  );
  const x = useTransform(
    progress,
    [range[0], range[1]],
    [position === 'left' ? -30 : 30, 0]
  );

  return (
    <motion.div
      style={{ opacity, x }}
      className={`absolute top-1/2 -translate-y-1/2 w-64 md:w-80 ${
        position === 'left'
          ? 'left-6 md:left-20'
          : 'right-6 md:right-20 text-right'
      }`}
    >
      <h4 className="font-clash text-xl md:text-2xl text-foreground font-bold uppercase leading-tight mb-3">
        {title}
      </h4>
      <p className="text-muted text-sm leading-relaxed">{desc}</p>
    </motion.div>
  );
};

const SCROLL_NOTES = [
  {
    range: [0.1, 0.3] as [number, number],
    title: 'Trust Integrated',
    desc: "We don't trust passports, we trust smart contracts. Your identity is your actions.",
    position: 'left' as const,
  },
  {
    range: [0.4, 0.6] as [number, number],
    title: 'Liquid Economy',
    desc: 'Gifting happens instantly, releases with your approval. Zero friction, maximum security.',
    position: 'right' as const,
  },
  {
    range: [0.7, 0.9] as [number, number],
    title: 'Global Protection',
    desc: "Wherever you are, your 'Moment' is secured. Escrow protocol active 24/7.",
    position: 'left' as const,
  },
];

export function TrustRing() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start end', 'end start'],
  });

  // Transform values for the ring
  const rotate = useTransform(scrollYProgress, [0, 1], [0, 360]);
  const scale = useTransform(scrollYProgress, [0, 0.3, 0.7, 1], [0.6, 1.2, 1.2, 0.6]);
  const opacity = useTransform(scrollYProgress, [0, 0.15, 0.85, 1], [0, 1, 1, 0]);
  const pathLength = useTransform(scrollYProgress, [0.1, 0.5], [0, 1]);

  return (
    <section
      ref={containerRef}
      className="relative h-[250vh] w-full"
      id="trust-ring"
    >
      <div className="sticky top-0 h-screen w-full flex items-center justify-center overflow-hidden">
        {/* Background Glow - Nvidia Style */}
        <motion.div
          style={{ opacity }}
          className="absolute w-[400px] h-[400px] md:w-[600px] md:h-[600px] bg-primary/15 blur-[150px] rounded-full"
        />
        <motion.div
          style={{ opacity, scale: useTransform(scrollYProgress, [0, 0.5], [0.5, 1]) }}
          className="absolute w-[300px] h-[300px] md:w-[400px] md:h-[400px] bg-secondary/10 blur-[120px] rounded-full"
        />

        {/* The Ring */}
        <motion.div
          style={{ rotate, scale, opacity }}
          className="relative w-72 h-72 md:w-[450px] md:h-[450px]"
        >
          <svg viewBox="0 0 100 100" className="w-full h-full">
            {/* Outer static ring */}
            <circle
              cx="50"
              cy="50"
              r="48"
              fill="none"
              stroke="currentColor"
              strokeWidth="0.3"
              className="text-border"
            />

            {/* Animated path ring */}
            <motion.circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke="url(#ringGradient)"
              strokeWidth="1"
              strokeLinecap="round"
              style={{ pathLength }}
            />

            {/* Inner dashed ring */}
            <circle
              cx="50"
              cy="50"
              r="40"
              fill="none"
              stroke="url(#ringGradient)"
              strokeWidth="0.5"
              strokeDasharray="4 3"
              className="opacity-50"
            />

            {/* Gradient definition */}
            <defs>
              <linearGradient id="ringGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#00FF88" />
                <stop offset="50%" stopColor="#8B5CF6" />
                <stop offset="100%" stopColor="#FACC15" />
              </linearGradient>
            </defs>
          </svg>

          {/* Center Content */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-8">
            <motion.span
              className="font-mono text-primary text-[10px] uppercase tracking-[0.3em] mb-3"
              animate={{ opacity: [0.4, 1, 0.4] }}
              transition={{ repeat: Infinity, duration: 2.5, ease: 'easeInOut' }}
            >
              Escrow Protocol Active
            </motion.span>
            <h3 className="text-2xl md:text-4xl font-clash font-black text-foreground uppercase italic leading-none">
              The Invisible
              <br />
              <span className="text-primary">Guardian</span>
            </h3>
          </div>

          {/* Orbiting Dots */}
          {[0, 90, 180, 270].map((angle, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 bg-primary rounded-full"
              style={{
                top: '50%',
                left: '50%',
                transform: `rotate(${angle}deg) translateX(140px) translateY(-50%)`,
              }}
              animate={{
                scale: [1, 1.5, 1],
                opacity: [0.5, 1, 0.5],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                delay: i * 0.5,
                ease: 'easeInOut',
              }}
            />
          ))}
        </motion.div>

        {/* Scroll Notes */}
        <div className="absolute inset-0 pointer-events-none section-container">
          {SCROLL_NOTES.map((note, idx) => (
            <ScrollNote
              key={idx}
              progress={scrollYProgress}
              range={note.range}
              title={note.title}
              desc={note.desc}
              position={note.position}
            />
          ))}
        </div>

        {/* Progress Indicator */}
        <motion.div
          className="absolute bottom-12 left-1/2 -translate-x-1/2 w-32 h-1 bg-border rounded-full overflow-hidden"
          style={{ opacity }}
        >
          <motion.div
            className="h-full bg-primary rounded-full"
            style={{ scaleX: scrollYProgress, transformOrigin: 'left' }}
          />
        </motion.div>
      </div>
    </section>
  );
}

export default TrustRing;

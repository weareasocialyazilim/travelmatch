'use client';

/**
 * AwardWinningScroll - Fluid Scroll Experience
 *
 * Awwwards/FWA quality scroll mechanics:
 * - Sticky portal that shrinks and moves to corner
 * - Floating Moments with parallax
 * - Melting transitions between sections
 * - Floating gift particles on scroll
 */

import { useRef } from 'react';
import {
  motion,
  useScroll,
  useTransform,
  useSpring,
  MotionValue,
} from 'framer-motion';
import Image from 'next/image';
import { Gift, Star } from 'lucide-react';

interface AwardWinningScrollProps {
  children: React.ReactNode;
}

export function AwardWinningScrollWrapper({
  children,
}: AwardWinningScrollProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end end'],
  });

  return (
    <div ref={containerRef} className="relative">
      {/* Sticky Mini Portal - Follows scroll */}
      <StickyMiniPortal scrollProgress={scrollYProgress} />

      {/* Floating Gift Particles */}
      <FloatingGiftParticles scrollProgress={scrollYProgress} />

      {children}
    </div>
  );
}

// Mini portal that sticks to corner during scroll
function StickyMiniPortal({
  scrollProgress,
}: {
  scrollProgress: MotionValue<number>;
}) {
  // Transform values
  const scale = useTransform(scrollProgress, [0, 0.1], [0, 1]);
  const opacity = useTransform(
    scrollProgress,
    [0, 0.05, 0.1, 0.9, 1],
    [0, 0, 0.8, 0.8, 0],
  );
  const rotate = useTransform(scrollProgress, [0, 1], [0, 360]);

  const smoothScale = useSpring(scale, { stiffness: 100, damping: 20 });
  const smoothRotate = useSpring(rotate, { stiffness: 50, damping: 30 });

  return (
    <motion.div
      style={{
        scale: smoothScale,
        opacity,
        rotate: smoothRotate,
      }}
      className="fixed bottom-8 right-8 w-20 h-20 z-50 pointer-events-none"
    >
      {/* Mini Portal Glow */}
      <div className="absolute inset-0 rounded-full bg-gradient-to-r from-purple-500 via-rose-500 to-amber-400 blur-lg opacity-60" />

      {/* Core */}
      <motion.div
        animate={{
          scale: [1, 1.1, 1],
        }}
        transition={{ duration: 2, repeat: Infinity }}
        className="absolute inset-2 rounded-full bg-gradient-to-br from-rose-500 via-purple-600 to-amber-500"
      />

      {/* Inner Highlight */}
      <div className="absolute inset-4 rounded-full bg-gradient-to-br from-white/30 to-transparent" />
    </motion.div>
  );
}

// Seed-based pseudo-random for consistent renders
function seededRandom(seed: number): number {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

// Floating gift particles that appear during scroll
function FloatingGiftParticles({
  scrollProgress,
}: {
  scrollProgress: MotionValue<number>;
}) {
  const particles = Array.from({ length: 20 }, (_, i) => ({
    id: i,
    x: seededRandom(i * 4 + 1) * 100,
    delay: seededRandom(i * 4 + 2) * 2,
    duration: 3 + seededRandom(i * 4 + 3) * 2,
    size: 8 + seededRandom(i * 4 + 4) * 8,
  }));

  const opacity = useTransform(
    scrollProgress,
    [0.1, 0.2, 0.8, 0.9],
    [0, 1, 1, 0],
  );

  return (
    <motion.div
      style={{ opacity }}
      className="fixed inset-0 pointer-events-none z-40 overflow-hidden"
    >
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          initial={{
            x: `${particle.x}vw`,
            y: '110vh',
            opacity: 0,
          }}
          animate={{
            y: '-10vh',
            opacity: [0, 0.6, 0],
          }}
          transition={{
            duration: particle.duration,
            repeat: Infinity,
            delay: particle.delay,
            ease: 'linear',
          }}
          className="absolute"
          style={{
            width: particle.size,
            height: particle.size,
          }}
        >
          <div
            className="w-full h-full rounded-full bg-gradient-to-r from-amber-300 to-yellow-200"
            style={{
              boxShadow: '0 0 10px rgba(251, 191, 36, 0.4)',
            }}
          />
        </motion.div>
      ))}
    </motion.div>
  );
}

// Melting Section Transition
export function MeltingTransition({ from, to }: { from: string; to: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  });

  const clipPath = useTransform(
    scrollYProgress,
    [0, 0.5, 1],
    [
      'polygon(0 100%, 100% 100%, 100% 100%, 0 100%)',
      'polygon(0 50%, 100% 30%, 100% 100%, 0 100%)',
      'polygon(0 0%, 100% 0%, 100% 100%, 0 100%)',
    ],
  );

  return (
    <div ref={ref} className="relative h-40 overflow-hidden">
      {/* From Color */}
      <div className={`absolute inset-0 ${from}`} />

      {/* To Color with Melting Effect */}
      <motion.div style={{ clipPath }} className={`absolute inset-0 ${to}`} />

      {/* Liquid Drip Effect */}
      <svg
        className="absolute bottom-0 left-0 w-full h-16 text-current"
        style={{ color: to.includes('purple') ? '#581c87' : '#000' }}
        viewBox="0 0 1200 120"
        preserveAspectRatio="none"
      >
        <motion.path
          d="M0,0 C150,100 350,0 600,50 C850,100 1050,0 1200,50 L1200,120 L0,120 Z"
          fill="currentColor"
          animate={{
            d: [
              'M0,0 C150,100 350,0 600,50 C850,100 1050,0 1200,50 L1200,120 L0,120 Z',
              'M0,50 C150,0 350,100 600,50 C850,0 1050,100 1200,50 L1200,120 L0,120 Z',
              'M0,0 C150,100 350,0 600,50 C850,100 1050,0 1200,50 L1200,120 L0,120 Z',
            ],
          }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
        />
      </svg>
    </div>
  );
}

// Floating Moment Card - Parallax Effect
export function FloatingMomentCard({
  image,
  title,
  location,
  user,
  index,
}: {
  image: string;
  title: string;
  location: string;
  user: string;
  index: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  });

  // Different parallax speeds based on index
  const yOffset = useTransform(
    scrollYProgress,
    [0, 1],
    [100 * ((index % 3) + 1), -100 * ((index % 3) + 1)],
  );

  const scale = useTransform(scrollYProgress, [0, 0.5, 1], [0.8, 1, 0.8]);
  const opacity = useTransform(scrollYProgress, [0, 0.3, 0.7, 1], [0, 1, 1, 0]);
  const rotateY = useTransform(scrollYProgress, [0, 0.5, 1], [-15, 0, 15]);

  const smoothY = useSpring(yOffset, { stiffness: 100, damping: 30 });

  return (
    <motion.div
      ref={ref}
      style={{
        y: smoothY,
        scale,
        opacity,
        rotateY,
        transformPerspective: 1000,
      }}
      className="relative group cursor-pointer"
    >
      {/* Card Shadow */}
      <div className="absolute inset-0 translate-x-4 translate-y-4 rounded-3xl bg-gradient-to-br from-purple-600/30 to-rose-600/30 blur-xl group-hover:blur-2xl transition-all" />

      {/* Main Card */}
      <div className="relative bg-black/80 backdrop-blur-xl border border-white/10 rounded-3xl overflow-hidden group-hover:border-amber-400/30 transition-colors">
        {/* Image */}
        <div className="relative aspect-[4/5] overflow-hidden">
          <Image
            src={image}
            alt={title}
            fill
            className="object-cover grayscale-[30%] group-hover:grayscale-0 group-hover:scale-110 transition-all duration-700"
            unoptimized
          />

          {/* Overlay Gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />

          {/* User Badge */}
          <div className="absolute top-4 left-4 flex items-center gap-2 bg-black/50 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10">
            <div className="w-6 h-6 rounded-full bg-gradient-to-r from-amber-400 to-rose-400" />
            <span className="text-xs font-mono text-white/80">{user}</span>
          </div>

          {/* Live Indicator */}
          <motion.div
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="absolute top-4 right-4 flex items-center gap-1 bg-rose-500/20 backdrop-blur-md px-3 py-1 rounded-full border border-rose-500/30"
          >
            <span className="w-2 h-2 rounded-full bg-rose-400" />
            <span className="text-xs font-mono text-rose-300">LIVE</span>
          </motion.div>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="flex items-center gap-2 text-amber-400/80 text-xs font-mono mb-2">
            <Star size={12} fill="currentColor" />
            <span>{location}</span>
          </div>

          <h3 className="text-2xl font-syne font-black text-white group-hover:text-amber-400 transition-colors">
            {title}
          </h3>

          {/* Action Hint */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileHover={{ opacity: 1, y: 0 }}
            className="mt-4 flex items-center gap-2 text-sm text-white/50"
          >
            <Gift size={14} />
            <span>Send a gift to unlock</span>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}

// Liquid Section Divider
export function LiquidDivider() {
  return (
    <div className="relative h-24 overflow-hidden">
      <svg
        className="absolute bottom-0 left-0 w-full"
        viewBox="0 0 1200 100"
        preserveAspectRatio="none"
      >
        <motion.path
          fill="url(#liquidGradient)"
          animate={{
            d: [
              'M0,50 Q300,0 600,50 T1200,50 L1200,100 L0,100 Z',
              'M0,50 Q300,100 600,50 T1200,50 L1200,100 L0,100 Z',
              'M0,50 Q300,0 600,50 T1200,50 L1200,100 L0,100 Z',
            ],
          }}
          transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
        />
        <defs>
          <linearGradient id="liquidGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="rgba(168, 85, 247, 0.3)" />
            <stop offset="50%" stopColor="rgba(251, 113, 133, 0.3)" />
            <stop offset="100%" stopColor="rgba(251, 191, 36, 0.3)" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
}

export default AwardWinningScrollWrapper;

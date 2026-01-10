'use client';

/**
 * VelvetExperience - Award-Winning Scroll Experience
 *
 * Awwwards/FWA quality immersive scroll mechanics:
 * - Sacred Scroll with gravity-based content distortion
 * - Portal that shrinks and follows to corner
 * - Liquid dissolve transitions between sections
 * - Content "sucked" toward portal on scroll
 * - Parallax depth layers
 * - Ambient heartbeat sound cue (optional)
 */

import { useRef, useState, useEffect, ReactNode } from 'react';
import {
  motion,
  useScroll,
  useTransform,
  useSpring,
  useMotionValue,
  MotionValue,
  AnimatePresence,
} from 'framer-motion';
import { LovePortal2D } from '../3d/LovePortal3D';
import { Gift, Heart, Zap, Sparkles, Star } from 'lucide-react';

interface VelvetExperienceProps {
  children: ReactNode;
}

export function VelvetExperience({ children }: VelvetExperienceProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [showPortalFollower, setShowPortalFollower] = useState(false);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end end'],
  });

  // Portal transforms
  const portalScale = useTransform(scrollYProgress, [0, 0.1, 0.15], [1, 0.8, 0.3]);
  const portalX = useTransform(scrollYProgress, [0, 0.15], ['0%', '40%']);
  const portalY = useTransform(scrollYProgress, [0, 0.15], ['0%', '35%']);
  const portalOpacity = useTransform(scrollYProgress, [0, 0.05, 0.15], [1, 0.9, 0.7]);

  // Spring physics for smooth following
  const smoothScale = useSpring(portalScale, { stiffness: 100, damping: 30 });
  const smoothX = useSpring(portalX, { stiffness: 80, damping: 25 });
  const smoothY = useSpring(portalY, { stiffness: 80, damping: 25 });

  // Content distortion based on scroll
  const contentSkewX = useTransform(scrollYProgress, [0, 0.1], [0, -3]);
  const contentSkewY = useTransform(scrollYProgress, [0, 0.1], [0, 2]);

  // Track when portal should become follower
  useEffect(() => {
    const unsubscribe = scrollYProgress.on('change', (value) => {
      setShowPortalFollower(value > 0.12);
    });
    return () => unsubscribe();
  }, [scrollYProgress]);

  return (
    <div ref={containerRef} className="relative">
      {/* Main Portal - Transforms on scroll */}
      <motion.div
        style={{
          scale: smoothScale,
          x: smoothX,
          y: smoothY,
          opacity: portalOpacity,
        }}
        className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] md:w-[800px] md:h-[800px] z-10 pointer-events-none"
      >
        <LovePortal2D className="w-full h-full" />
      </motion.div>

      {/* Sticky Mini Portal Follower */}
      <AnimatePresence>
        {showPortalFollower && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            className="fixed bottom-8 right-8 w-24 h-24 z-50 pointer-events-none"
          >
            <MiniPortalFollower scrollProgress={scrollYProgress} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Gift Particles on Scroll */}
      <ScrollGiftParticles scrollProgress={scrollYProgress} />

      {/* Liquid Ripple Effect Layer */}
      <LiquidRippleLayer scrollProgress={scrollYProgress} />

      {/* Content with gravity distortion */}
      <motion.div
        style={{
          skewX: contentSkewX,
          skewY: contentSkewY,
        }}
      >
        {children}
      </motion.div>
    </div>
  );
}

// Mini portal that follows in corner
function MiniPortalFollower({ scrollProgress }: { scrollProgress: MotionValue<number> }) {
  const rotation = useTransform(scrollProgress, [0, 1], [0, 720]);
  const pulseScale = useTransform(scrollProgress, (v) => 1 + Math.sin(v * Math.PI * 10) * 0.1);

  return (
    <motion.div
      style={{ rotate: rotation, scale: pulseScale }}
      className="relative w-full h-full"
    >
      {/* Glow */}
      <div className="absolute inset-0 bg-gradient-to-r from-purple-500 via-rose-500 to-amber-400 rounded-full blur-xl opacity-60" />

      {/* Core */}
      <motion.div
        animate={{ scale: [1, 1.1, 1] }}
        transition={{ duration: 2, repeat: Infinity }}
        className="absolute inset-2 rounded-full bg-gradient-conic from-purple-600 via-rose-500 via-amber-400 to-purple-600"
      />

      {/* Inner ring */}
      <div className="absolute inset-4 rounded-full border border-white/30" />

      {/* Center dot */}
      <div className="absolute inset-[40%] rounded-full bg-white/50 blur-sm" />
    </motion.div>
  );
}

// Floating gift particles during scroll
function ScrollGiftParticles({ scrollProgress }: { scrollProgress: MotionValue<number> }) {
  const opacity = useTransform(scrollProgress, [0.1, 0.2, 0.8, 0.9], [0, 1, 1, 0]);
  const particles = Array.from({ length: 30 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    delay: Math.random() * 3,
    duration: 4 + Math.random() * 3,
    size: 6 + Math.random() * 10,
    type: ['gift', 'heart', 'sparkle', 'star'][Math.floor(Math.random() * 4)],
  }));

  return (
    <motion.div
      style={{ opacity }}
      className="fixed inset-0 pointer-events-none z-30 overflow-hidden"
    >
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          initial={{ x: `${particle.x}vw`, y: '110vh', opacity: 0, rotate: 0 }}
          animate={{
            y: '-10vh',
            opacity: [0, 0.8, 0],
            rotate: 360,
          }}
          transition={{
            duration: particle.duration,
            repeat: Infinity,
            delay: particle.delay,
            ease: 'linear',
          }}
          className="absolute text-amber-400/60"
          style={{ fontSize: particle.size }}
        >
          {particle.type === 'gift' && <Gift size={particle.size} />}
          {particle.type === 'heart' && <Heart size={particle.size} fill="currentColor" />}
          {particle.type === 'sparkle' && <Sparkles size={particle.size} />}
          {particle.type === 'star' && <Star size={particle.size} fill="currentColor" />}
        </motion.div>
      ))}
    </motion.div>
  );
}

// Liquid ripple effect on scroll
function LiquidRippleLayer({ scrollProgress }: { scrollProgress: MotionValue<number> }) {
  const [ripples, setRipples] = useState<{ id: number; x: number; y: number }[]>([]);

  useEffect(() => {
    let lastValue = 0;
    const unsubscribe = scrollProgress.on('change', (value) => {
      // Create ripple on significant scroll changes
      if (Math.abs(value - lastValue) > 0.02) {
        const newRipple = {
          id: Date.now(),
          x: 50 + (Math.random() - 0.5) * 30,
          y: 50 + (Math.random() - 0.5) * 30,
        };
        setRipples((prev) => [...prev.slice(-3), newRipple]);
        lastValue = value;
      }
    });
    return () => unsubscribe();
  }, [scrollProgress]);

  return (
    <div className="fixed inset-0 pointer-events-none z-5 overflow-hidden">
      <AnimatePresence>
        {ripples.map((ripple) => (
          <motion.div
            key={ripple.id}
            initial={{
              left: `${ripple.x}%`,
              top: `${ripple.y}%`,
              scale: 0,
              opacity: 0.5,
            }}
            animate={{
              scale: 3,
              opacity: 0,
            }}
            exit={{ opacity: 0 }}
            transition={{ duration: 2, ease: 'easeOut' }}
            className="absolute w-40 h-40 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-amber-400/30"
          />
        ))}
      </AnimatePresence>
    </div>
  );
}

// Section with liquid dissolve transition
interface LiquidSectionProps {
  children: ReactNode;
  className?: string;
  id?: string;
}

export function LiquidSection({ children, className = '', id }: LiquidSectionProps) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'end start'],
  });

  const opacity = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0, 1, 1, 0]);
  const y = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [100, 0, 0, -100]);
  const blur = useTransform(scrollYProgress, [0, 0.1, 0.9, 1], [10, 0, 0, 10]);

  const smoothY = useSpring(y, { stiffness: 100, damping: 30 });

  return (
    <motion.section
      ref={sectionRef}
      id={id}
      style={{
        opacity,
        y: smoothY,
        filter: useTransform(blur, (v) => `blur(${v}px)`),
      }}
      className={className}
    >
      {children}
    </motion.section>
  );
}

// Gravity-affected content block
interface GravityContentProps {
  children: ReactNode;
  className?: string;
  intensity?: number;
}

export function GravityContent({ children, className = '', intensity = 1 }: GravityContentProps) {
  const contentRef = useRef<HTMLDivElement>(null);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [5 * intensity, -5 * intensity]), {
    stiffness: 100,
    damping: 30,
  });
  const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-5 * intensity, 5 * intensity]), {
    stiffness: 100,
    damping: 30,
  });

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!contentRef.current) return;
    const rect = contentRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    mouseX.set(x);
    mouseY.set(y);
  };

  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
  };

  return (
    <motion.div
      ref={contentRef}
      style={{
        rotateX,
        rotateY,
        transformPerspective: 1000,
      }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// Liquid transition divider
export function LiquidTransitionDivider({ fromColor = 'black', toColor = 'purple-950' }) {
  return (
    <div className="relative h-32 overflow-hidden">
      <svg
        className="absolute bottom-0 left-0 w-full"
        viewBox="0 0 1440 120"
        preserveAspectRatio="none"
      >
        <motion.path
          fill={`var(--${toColor}, #1a0a2e)`}
          animate={{
            d: [
              'M0,60 Q360,0 720,60 T1440,60 L1440,120 L0,120 Z',
              'M0,60 Q360,120 720,60 T1440,60 L1440,120 L0,120 Z',
              'M0,60 Q360,0 720,60 T1440,60 L1440,120 L0,120 Z',
            ],
          }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        />
      </svg>
    </div>
  );
}

export default VelvetExperience;

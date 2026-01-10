'use client';

/**
 * LiquidMatchPortal - The Heartbeat Portal
 *
 * Awwwards/FWA quality liquid portal with:
 * - Organic heartbeat pulsing animation
 * - Deep Crimson & Champagne Gold color scheme
 * - Interactive ripple effects on hover
 * - Scroll-responsive shrinking behavior
 */

import { useRef, useEffect, useState } from 'react';
import {
  motion,
  useScroll,
  useTransform,
  useSpring,
  useMotionValue,
} from 'framer-motion';

interface LiquidMatchPortalProps {
  className?: string;
  isScrolled?: boolean;
  intensity?: number;
}

export function LiquidMatchPortal({
  className = '',
  isScrolled: _isScrolled = false,
  intensity: _intensity = 1,
}: LiquidMatchPortalProps) {
  void _isScrolled;
  void _intensity;
  const containerRef = useRef<HTMLDivElement>(null);
  const [_mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  void _mousePosition;
  const [isHovered, setIsHovered] = useState(false);

  // Smooth mouse tracking
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const smoothMouseX = useSpring(mouseX, { stiffness: 50, damping: 20 });
  const smoothMouseY = useSpring(mouseY, { stiffness: 50, damping: 20 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        const x = (e.clientX - rect.left - rect.width / 2) / rect.width;
        const y = (e.clientY - rect.top - rect.height / 2) / rect.height;
        mouseX.set(x * 30);
        mouseY.set(y * 30);
        setMousePosition({ x, y });
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [mouseX, mouseY]);

  return (
    <div
      ref={containerRef}
      className={`relative ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Outer Glow - Champagne Gold */}
      <motion.div
        animate={{
          scale: isHovered ? [1, 1.15, 1.1] : [1, 1.08, 1],
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{
          duration: isHovered ? 1.5 : 3,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        style={{
          x: smoothMouseX,
          y: smoothMouseY,
        }}
        className="absolute inset-0 rounded-full bg-gradient-to-r from-amber-400/30 via-yellow-300/20 to-amber-500/30 blur-[80px]"
      />

      {/* Middle Glow - Deep Orchid */}
      <motion.div
        animate={{
          scale: isHovered ? [1, 1.2, 1.15] : [1, 1.1, 1],
          opacity: [0.4, 0.6, 0.4],
        }}
        transition={{
          duration: isHovered ? 1.2 : 2.5,
          repeat: Infinity,
          ease: 'easeInOut',
          delay: 0.3,
        }}
        style={{
          x: useTransform(smoothMouseX, (v) => v * 0.7),
          y: useTransform(smoothMouseY, (v) => v * 0.7),
        }}
        className="absolute inset-[10%] rounded-full bg-gradient-to-br from-purple-600/40 via-fuchsia-500/30 to-pink-600/40 blur-[60px]"
      />

      {/* Inner Core - Crimson Heart */}
      <motion.div
        animate={{
          scale: isHovered ? [1, 1.25, 1.2] : [1, 1.15, 1],
          opacity: [0.5, 0.8, 0.5],
        }}
        transition={{
          duration: isHovered ? 0.8 : 2,
          repeat: Infinity,
          ease: 'easeInOut',
          delay: 0.1,
        }}
        style={{
          x: useTransform(smoothMouseX, (v) => v * 0.4),
          y: useTransform(smoothMouseY, (v) => v * 0.4),
        }}
        className="absolute inset-[25%] rounded-full bg-gradient-to-br from-rose-500/50 via-red-600/40 to-pink-500/50 blur-[40px]"
      />

      {/* The Heartbeat Core */}
      <motion.div
        animate={{
          scale: [1, 1.08, 1.02, 1.1, 1],
        }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: [0.4, 0, 0.2, 1],
          times: [0, 0.2, 0.4, 0.6, 1],
        }}
        className="absolute inset-[35%] rounded-full"
      >
        {/* Liquid Surface */}
        <motion.div
          animate={{
            rotate: [0, 360],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: 'linear',
          }}
          className="absolute inset-0 rounded-full overflow-hidden"
        >
          <div
            className="absolute inset-0 bg-gradient-conic from-purple-600 via-rose-500 via-amber-400 via-pink-500 to-purple-600"
            style={{
              filter: 'blur(8px)',
            }}
          />
        </motion.div>

        {/* Inner Highlight */}
        <div className="absolute inset-[15%] rounded-full bg-gradient-to-br from-white/20 via-transparent to-transparent" />
      </motion.div>

      {/* Ripple Effects on Hover */}
      {isHovered && (
        <>
          <motion.div
            initial={{ scale: 0.8, opacity: 0.6 }}
            animate={{ scale: 1.5, opacity: 0 }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="absolute inset-[20%] rounded-full border-2 border-amber-400/40"
          />
          <motion.div
            initial={{ scale: 0.8, opacity: 0.6 }}
            animate={{ scale: 1.5, opacity: 0 }}
            transition={{ duration: 1.5, repeat: Infinity, delay: 0.5 }}
            className="absolute inset-[20%] rounded-full border-2 border-rose-400/40"
          />
        </>
      )}

      {/* Floating Particles - Gift Sparkles */}
      <FloatingSparkles isActive={isHovered} />
    </div>
  );
}

// Floating golden sparkles representing gifting
function FloatingSparkles({ isActive }: { isActive: boolean }) {
  const particles = Array.from({ length: 12 }, (_, i) => i);

  return (
    <div className="absolute inset-0 pointer-events-none">
      {particles.map((i) => (
        <motion.div
          key={i}
          initial={{
            opacity: 0,
            scale: 0,
            x: '50%',
            y: '50%',
          }}
          animate={
            isActive
              ? {
                  opacity: [0, 1, 0],
                  scale: [0, 1, 0.5],
                  x: `${50 + Math.cos((i * 30 * Math.PI) / 180) * 60}%`,
                  y: `${50 + Math.sin((i * 30 * Math.PI) / 180) * 60}%`,
                }
              : {
                  opacity: [0, 0.5, 0],
                  scale: [0, 0.5, 0],
                  x: `${50 + Math.cos((i * 30 * Math.PI) / 180) * 40}%`,
                  y: `${50 + Math.sin((i * 30 * Math.PI) / 180) * 40}%`,
                }
          }
          transition={{
            duration: isActive ? 2 : 4,
            repeat: Infinity,
            delay: i * 0.15,
            ease: 'easeOut',
          }}
          className="absolute w-2 h-2 rounded-full bg-gradient-to-r from-amber-300 to-yellow-200"
          style={{
            boxShadow: '0 0 10px rgba(251, 191, 36, 0.6)',
          }}
        />
      ))}
    </div>
  );
}

// Sticky Portal that follows scroll
export function StickyMatchPortal() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll();

  // Portal shrinks and moves to corner as user scrolls
  const portalScale = useTransform(scrollYProgress, [0, 0.15], [1, 0.25]);
  const portalX = useTransform(scrollYProgress, [0, 0.15], [0, 300]);
  const portalY = useTransform(scrollYProgress, [0, 0.15], [0, 200]);
  const portalOpacity = useTransform(
    scrollYProgress,
    [0, 0.1, 0.15],
    [1, 0.8, 0.6],
  );

  // Smooth spring animations
  const smoothScale = useSpring(portalScale, { stiffness: 100, damping: 30 });
  const smoothX = useSpring(portalX, { stiffness: 100, damping: 30 });
  const smoothY = useSpring(portalY, { stiffness: 100, damping: 30 });

  return (
    <motion.div
      ref={containerRef}
      style={{
        scale: smoothScale,
        x: smoothX,
        y: smoothY,
        opacity: portalOpacity,
      }}
      className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] z-10 pointer-events-none"
    >
      <LiquidMatchPortal className="w-full h-full" />
    </motion.div>
  );
}

export default LiquidMatchPortal;

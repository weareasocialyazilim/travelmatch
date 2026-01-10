'use client';

/**
 * LiquidAuraCursor - Soft Aura Cursor
 *
 * Elegant cursor with soft purple glow and golden sparkle.
 * No dots, no crosshairs - just a feeling of warmth following you.
 */

import { useEffect } from 'react';
import { motion, useSpring, useMotionValue } from 'framer-motion';

export function LiquidAuraCursor() {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // Spring config for smooth, liquid-like following
  const springConfig = { damping: 30, stiffness: 200 };
  const cursorX = useSpring(mouseX, springConfig);
  const cursorY = useSpring(mouseY, springConfig);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mouseX.set(e.clientX - 32); // Center the 64px element
      mouseY.set(e.clientY - 32);
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [mouseX, mouseY]);

  return (
    <>
      {/* Hide on mobile, show on desktop */}
      <div className="pointer-events-none fixed inset-0 z-[9999] mix-blend-screen hidden md:block">
        {/* Outer Aura - Soft Purple Glow */}
        <motion.div
          style={{ x: cursorX, y: cursorY }}
          className="w-16 h-16 rounded-full blur-3xl bg-[#7E22CE]/40"
        />

        {/* Inner Core - Misty Golden Sparkle (Not a dot) */}
        <motion.div
          style={{
            x: cursorX,
            y: cursorY,
            translateX: 28, // Center the 8px element within 64px
            translateY: 28,
          }}
          className="w-2 h-2 bg-[#FDE047] rounded-full blur-[6px] opacity-60"
        />
      </div>

      {/* Hide default cursor on desktop */}
      <style jsx global>{`
        @media (min-width: 768px) {
          * {
            cursor: none !important;
          }
        }
      `}</style>
    </>
  );
}

export default LiquidAuraCursor;

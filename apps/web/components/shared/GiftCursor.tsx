'use client';

/**
 * GiftCursor - Premium Custom Cursor
 *
 * Features:
 * - Golden glow on hover over moments
 * - Portal-like ripple effect on links
 * - Smooth magnetic following
 */

import { useEffect, useRef, useState } from 'react';
import { motion, useSpring, useMotionValue } from 'framer-motion';

export function GiftCursor() {
  const cursorRef = useRef<HTMLDivElement>(null);
  const [isHovering, setIsHovering] = useState(false);
  const [isClicking, setIsClicking] = useState(false);
  const [cursorVariant, setCursorVariant] = useState<'default' | 'link' | 'moment' | 'button'>('default');

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const springConfig = { stiffness: 500, damping: 28 };
  const cursorX = useSpring(mouseX, springConfig);
  const cursorY = useSpring(mouseY, springConfig);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
    };

    const handleMouseDown = () => setIsClicking(true);
    const handleMouseUp = () => setIsClicking(false);

    // Detect hoverable elements
    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;

      if (target.closest('[data-cursor="moment"]')) {
        setCursorVariant('moment');
        setIsHovering(true);
      } else if (target.closest('button') || target.closest('[data-cursor="button"]')) {
        setCursorVariant('button');
        setIsHovering(true);
      } else if (target.closest('a') || target.closest('[data-cursor="link"]')) {
        setCursorVariant('link');
        setIsHovering(true);
      } else {
        setCursorVariant('default');
        setIsHovering(false);
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('mouseover', handleMouseOver);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('mouseover', handleMouseOver);
    };
  }, [mouseX, mouseY]);

  const variants = {
    default: {
      width: 12,
      height: 12,
      backgroundColor: 'rgba(251, 191, 36, 0.8)',
      mixBlendMode: 'difference' as const,
    },
    link: {
      width: 40,
      height: 40,
      backgroundColor: 'rgba(168, 85, 247, 0.3)',
      mixBlendMode: 'normal' as const,
    },
    moment: {
      width: 60,
      height: 60,
      backgroundColor: 'rgba(251, 191, 36, 0.2)',
      mixBlendMode: 'normal' as const,
    },
    button: {
      width: 50,
      height: 50,
      backgroundColor: 'rgba(251, 113, 133, 0.3)',
      mixBlendMode: 'normal' as const,
    },
  };

  return (
    <>
      {/* Main Cursor */}
      <motion.div
        ref={cursorRef}
        className="fixed top-0 left-0 pointer-events-none z-[9999] rounded-full hidden md:block"
        style={{
          x: cursorX,
          y: cursorY,
          translateX: '-50%',
          translateY: '-50%',
        }}
        animate={{
          ...variants[cursorVariant],
          scale: isClicking ? 0.8 : 1,
        }}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      >
        {/* Inner Dot */}
        {cursorVariant === 'default' && (
          <div className="absolute inset-0 rounded-full bg-amber-400" />
        )}

        {/* Glow Ring for Moment */}
        {cursorVariant === 'moment' && (
          <>
            <motion.div
              className="absolute inset-0 rounded-full border-2 border-amber-400/50"
              animate={{ scale: [1, 1.5], opacity: [0.5, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            />
            <div className="absolute inset-2 rounded-full bg-gradient-to-r from-amber-400/30 to-rose-400/30" />
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-amber-400 text-xs font-mono">GIFT</span>
            </div>
          </>
        )}

        {/* Portal Ring for Link */}
        {cursorVariant === 'link' && (
          <motion.div
            className="absolute inset-0 rounded-full border border-purple-400/50"
            animate={{ rotate: 360 }}
            transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
          />
        )}

        {/* Pulse for Button */}
        {cursorVariant === 'button' && (
          <motion.div
            className="absolute inset-0 rounded-full bg-gradient-to-r from-rose-500/20 to-amber-500/20"
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 1, repeat: Infinity }}
          />
        )}
      </motion.div>

      {/* Follower */}
      <motion.div
        className="fixed top-0 left-0 pointer-events-none z-[9998] rounded-full border border-white/20 hidden md:block"
        style={{
          x: cursorX,
          y: cursorY,
          translateX: '-50%',
          translateY: '-50%',
        }}
        animate={{
          width: isHovering ? 60 : 40,
          height: isHovering ? 60 : 40,
          opacity: isHovering ? 0 : 0.5,
        }}
        transition={{ type: 'spring', stiffness: 150, damping: 15, delay: 0.05 }}
      />
    </>
  );
}

export default GiftCursor;

'use client';

/**
 * LiquidAuraCursor - Award-Winning Premium Cursor
 *
 * Awwwards/FWA quality custom cursor with:
 * - Outer liquid halo (orchid/crimson gradient)
 * - Inner golden core that follows with spring physics
 * - Magnetic snap to buttons and interactive elements
 * - Lens/zoom effect on moment cards
 * - Ripple pulse on click
 * - Context-aware transformations
 */

import { useEffect, useRef, useState, useCallback } from 'react';
import { motion, useSpring, useMotionValue, AnimatePresence } from 'framer-motion';

type CursorVariant = 'default' | 'button' | 'moment' | 'link' | 'text' | 'gift';

interface RippleEffect {
  id: number;
  x: number;
  y: number;
}

export function LiquidAuraCursor() {
  const cursorOuterRef = useRef<HTMLDivElement>(null);
  const [variant, setVariant] = useState<CursorVariant>('default');
  const [isClicking, setIsClicking] = useState(false);
  const [ripples, setRipples] = useState<RippleEffect[]>([]);
  const [magnetTarget, setMagnetTarget] = useState<DOMRect | null>(null);

  // Mouse position
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // Spring configs for different feels
  const outerSpringConfig = { damping: 25, stiffness: 120 };
  const innerSpringConfig = { damping: 35, stiffness: 200 };

  // Outer halo follows slowly (liquid feel)
  const outerX = useSpring(mouseX, outerSpringConfig);
  const outerY = useSpring(mouseY, outerSpringConfig);

  // Inner core follows faster
  const innerX = useSpring(mouseX, innerSpringConfig);
  const innerY = useSpring(mouseY, innerSpringConfig);

  // Handle mouse movement
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (magnetTarget) {
        // Magnetic snap: blend between mouse and target center
        const targetX = magnetTarget.left + magnetTarget.width / 2;
        const targetY = magnetTarget.top + magnetTarget.height / 2;
        const blendFactor = 0.7; // How strong the magnet is

        mouseX.set(e.clientX * (1 - blendFactor) + targetX * blendFactor);
        mouseY.set(e.clientY * (1 - blendFactor) + targetY * blendFactor);
      } else {
        mouseX.set(e.clientX);
        mouseY.set(e.clientY);
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [mouseX, mouseY, magnetTarget]);

  // Handle click effects
  useEffect(() => {
    const handleMouseDown = (e: MouseEvent) => {
      setIsClicking(true);
      // Create ripple effect
      const newRipple: RippleEffect = {
        id: Date.now(),
        x: e.clientX,
        y: e.clientY,
      };
      setRipples((prev) => [...prev.slice(-5), newRipple]);
    };

    const handleMouseUp = () => setIsClicking(false);

    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);

  // Detect hoverable elements
  useEffect(() => {
    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;

      // Check for data-cursor attributes first
      if (target.closest('[data-cursor="moment"]')) {
        setVariant('moment');
        return;
      }
      if (target.closest('[data-cursor="gift"]')) {
        setVariant('gift');
        return;
      }

      // Check for buttons with magnetic snap
      const button = target.closest('button, [role="button"]');
      if (button) {
        setVariant('button');
        setMagnetTarget(button.getBoundingClientRect());
        return;
      }

      // Check for links
      if (target.closest('a')) {
        setVariant('link');
        return;
      }

      // Check for text inputs
      if (target.closest('input, textarea')) {
        setVariant('text');
        return;
      }

      // Default state
      setVariant('default');
      setMagnetTarget(null);
    };

    const handleMouseOut = () => {
      setVariant('default');
      setMagnetTarget(null);
    };

    document.addEventListener('mouseover', handleMouseOver);
    document.addEventListener('mouseout', handleMouseOut);
    return () => {
      document.removeEventListener('mouseover', handleMouseOver);
      document.removeEventListener('mouseout', handleMouseOut);
    };
  }, []);

  // Variant-based styles
  const getOuterStyles = () => {
    switch (variant) {
      case 'button':
        return {
          width: magnetTarget ? magnetTarget.width + 20 : 80,
          height: magnetTarget ? magnetTarget.height + 20 : 80,
          borderRadius: magnetTarget ? 20 : 40,
          borderColor: 'rgba(251, 191, 36, 0.6)',
          backgroundColor: 'rgba(251, 191, 36, 0.1)',
        };
      case 'moment':
        return {
          width: 120,
          height: 120,
          borderRadius: 60,
          borderColor: 'rgba(190, 18, 60, 0.5)',
          backgroundColor: 'rgba(126, 34, 206, 0.15)',
        };
      case 'gift':
        return {
          width: 100,
          height: 100,
          borderRadius: 50,
          borderColor: 'rgba(251, 191, 36, 0.8)',
          backgroundColor: 'rgba(251, 191, 36, 0.2)',
        };
      case 'link':
        return {
          width: 60,
          height: 60,
          borderRadius: 30,
          borderColor: 'rgba(126, 34, 206, 0.6)',
          backgroundColor: 'rgba(126, 34, 206, 0.1)',
        };
      case 'text':
        return {
          width: 4,
          height: 30,
          borderRadius: 2,
          borderColor: 'rgba(255, 255, 255, 0.8)',
          backgroundColor: 'rgba(255, 255, 255, 0.8)',
        };
      default:
        return {
          width: 48,
          height: 48,
          borderRadius: 24,
          borderColor: 'rgba(126, 34, 206, 0.4)',
          backgroundColor: 'transparent',
        };
    }
  };

  const getInnerStyles = () => {
    if (variant === 'text') {
      return { width: 0, height: 0, opacity: 0 };
    }
    return {
      width: variant === 'button' || variant === 'gift' ? 8 : 6,
      height: variant === 'button' || variant === 'gift' ? 8 : 6,
      opacity: 1,
    };
  };

  return (
    <>
      {/* Hide on mobile */}
      <div className="hidden md:block pointer-events-none fixed inset-0 z-[9999]">
        {/* Outer Aura Halo */}
        <motion.div
          ref={cursorOuterRef}
          style={{
            x: outerX,
            y: outerY,
            translateX: '-50%',
            translateY: '-50%',
          }}
          animate={{
            ...getOuterStyles(),
            scale: isClicking ? 0.9 : 1,
          }}
          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          className="absolute border-2"
        >
          {/* Inner gradient glow */}
          <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-purple-600/20 via-rose-500/10 to-amber-400/20 blur-sm" />

          {/* Rotating ring for moment variant */}
          {variant === 'moment' && (
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
              className="absolute inset-2 rounded-full border border-dashed border-amber-400/30"
            />
          )}

          {/* Gift icon for gift variant */}
          {variant === 'gift' && (
            <div className="absolute inset-0 flex items-center justify-center text-amber-400/60 text-xs font-mono font-bold">
              GIFT
            </div>
          )}

          {/* Lens zoom indicator for moment */}
          {variant === 'moment' && (
            <div className="absolute inset-0 flex items-center justify-center">
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="w-8 h-8 rounded-full border-2 border-rose-400/40 flex items-center justify-center"
              >
                <div className="w-2 h-2 rounded-full bg-rose-400/60" />
              </motion.div>
            </div>
          )}
        </motion.div>

        {/* Inner Golden Core */}
        <motion.div
          style={{
            x: innerX,
            y: innerY,
            translateX: '-50%',
            translateY: '-50%',
          }}
          animate={{
            ...getInnerStyles(),
            scale: isClicking ? 1.5 : 1,
          }}
          transition={{ type: 'spring', stiffness: 400, damping: 30 }}
          className="absolute rounded-full bg-gradient-to-r from-amber-300 to-yellow-200"
          style={{
            boxShadow: '0 0 20px rgba(251, 191, 36, 0.6), 0 0 40px rgba(251, 191, 36, 0.3)',
          }}
        />

        {/* Click Ripple Effects */}
        <AnimatePresence>
          {ripples.map((ripple) => (
            <motion.div
              key={ripple.id}
              initial={{ scale: 0, opacity: 0.8 }}
              animate={{ scale: 3, opacity: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              style={{
                left: ripple.x,
                top: ripple.y,
                translateX: '-50%',
                translateY: '-50%',
              }}
              className="absolute w-20 h-20 rounded-full border-2 border-amber-400/50"
              onAnimationComplete={() => {
                setRipples((prev) => prev.filter((r) => r.id !== ripple.id));
              }}
            />
          ))}
        </AnimatePresence>
      </div>

      {/* Global style to hide default cursor */}
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

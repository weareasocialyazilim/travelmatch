'use client';

import { useEffect, useState, useCallback } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';

/**
 * CustomCursor - Gen Z Style Interactive Cursor
 *
 * Features:
 * - z-[9999] ensures visibility on all backgrounds
 * - mix-blend-difference for visibility on both light and dark surfaces
 * - Smooth spring animations
 * - Scale on hover effects
 * - Hidden on mobile devices
 */

interface CursorState {
  isHovering: boolean;
  isClicking: boolean;
  isHidden: boolean;
}

export function CustomCursor() {
  const [state, setState] = useState<CursorState>({
    isHovering: false,
    isClicking: false,
    isHidden: true,
  });

  const cursorX = useMotionValue(-100);
  const cursorY = useMotionValue(-100);

  // Smooth spring animation for cursor movement
  const springConfig = { damping: 25, stiffness: 400, mass: 0.5 };
  const cursorXSpring = useSpring(cursorX, springConfig);
  const cursorYSpring = useSpring(cursorY, springConfig);

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      cursorX.set(e.clientX);
      cursorY.set(e.clientY);

      if (state.isHidden) {
        setState((prev) => ({ ...prev, isHidden: false }));
      }
    },
    [cursorX, cursorY, state.isHidden],
  );

  const handleMouseEnter = useCallback(() => {
    setState((prev) => ({ ...prev, isHidden: false }));
  }, []);

  const handleMouseLeave = useCallback(() => {
    setState((prev) => ({ ...prev, isHidden: true }));
  }, []);

  const handleMouseDown = useCallback(() => {
    setState((prev) => ({ ...prev, isClicking: true }));
  }, []);

  const handleMouseUp = useCallback(() => {
    setState((prev) => ({ ...prev, isClicking: false }));
  }, []);

  useEffect(() => {
    // Check if device is touch-enabled (mobile/tablet)
    const isTouchDevice =
      'ontouchstart' in window || navigator.maxTouchPoints > 0;

    if (isTouchDevice) {
      return; // Don't show custom cursor on touch devices
    }

    // Add event listeners
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseenter', handleMouseEnter);
    document.addEventListener('mouseleave', handleMouseLeave);
    document.addEventListener('mousedown', handleMouseDown);
    document.addEventListener('mouseup', handleMouseUp);

    // Add hover detection for interactive elements
    const interactiveElements = document.querySelectorAll(
      'a, button, [role="button"], input, textarea, select, [data-cursor-hover]',
    );

    const handleHoverStart = () =>
      setState((prev) => ({ ...prev, isHovering: true }));
    const handleHoverEnd = () =>
      setState((prev) => ({ ...prev, isHovering: false }));

    interactiveElements.forEach((el) => {
      el.addEventListener('mouseenter', handleHoverStart);
      el.addEventListener('mouseleave', handleHoverEnd);
    });

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseenter', handleMouseEnter);
      document.removeEventListener('mouseleave', handleMouseLeave);
      document.removeEventListener('mousedown', handleMouseDown);
      document.removeEventListener('mouseup', handleMouseUp);

      interactiveElements.forEach((el) => {
        el.removeEventListener('mouseenter', handleHoverStart);
        el.removeEventListener('mouseleave', handleHoverEnd);
      });
    };
  }, [
    handleMouseMove,
    handleMouseEnter,
    handleMouseLeave,
    handleMouseDown,
    handleMouseUp,
  ]);

  // Re-query interactive elements on DOM changes
  useEffect(() => {
    const observer = new MutationObserver(() => {
      const interactiveElements = document.querySelectorAll(
        'a, button, [role="button"], input, textarea, select, [data-cursor-hover]',
      );

      const handleHoverStart = () =>
        setState((prev) => ({ ...prev, isHovering: true }));
      const handleHoverEnd = () =>
        setState((prev) => ({ ...prev, isHovering: false }));

      interactiveElements.forEach((el) => {
        el.addEventListener('mouseenter', handleHoverStart);
        el.addEventListener('mouseleave', handleHoverEnd);
      });
    });

    observer.observe(document.body, { childList: true, subtree: true });

    return () => observer.disconnect();
  }, []);

  // Don't render on mobile
  if (
    typeof window !== 'undefined' &&
    ('ontouchstart' in window || navigator.maxTouchPoints > 0)
  ) {
    return null;
  }

  return (
    <>
      {/* Main cursor dot */}
      <motion.div
        className="fixed pointer-events-none z-[9999] mix-blend-difference"
        style={{
          x: cursorXSpring,
          y: cursorYSpring,
          translateX: '-50%',
          translateY: '-50%',
        }}
        animate={{
          scale: state.isClicking ? 0.8 : state.isHovering ? 1.5 : 1,
          opacity: state.isHidden ? 0 : 1,
        }}
        transition={{ duration: 0.15 }}
      >
        <div
          className="rounded-full bg-white"
          style={{
            width: 'clamp(12px, 2vw, 20px)',
            height: 'clamp(12px, 2vw, 20px)',
          }}
        />
      </motion.div>

      {/* Outer ring */}
      <motion.div
        className="fixed pointer-events-none z-[9998] mix-blend-difference"
        style={{
          x: cursorXSpring,
          y: cursorYSpring,
          translateX: '-50%',
          translateY: '-50%',
        }}
        animate={{
          scale: state.isClicking ? 1.2 : state.isHovering ? 2 : 1,
          opacity: state.isHidden ? 0 : 0.5,
        }}
        transition={{ duration: 0.2, delay: 0.05 }}
      >
        <div
          className="rounded-full border-2 border-white"
          style={{
            width: 'clamp(32px, 4vw, 48px)',
            height: 'clamp(32px, 4vw, 48px)',
          }}
        />
      </motion.div>
    </>
  );
}

export default CustomCursor;

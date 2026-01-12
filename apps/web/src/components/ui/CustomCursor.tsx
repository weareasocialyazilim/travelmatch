'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';

/**
 * TravelMatch Premium Custom Cursor
 *
 * Features:
 * - Smooth spring physics
 * - Hover states for interactive elements
 * - Click feedback
 * - Text cursor mode for inputs
 * - Magnetic attraction hint
 * - Hidden on mobile/touch devices
 */

interface CursorState {
  isHovering: boolean;
  isClicking: boolean;
  isHidden: boolean;
  cursorText: string;
  cursorVariant: 'default' | 'text' | 'link' | 'button' | 'magnetic';
}

export function CustomCursor() {
  const mounted = true;
  const [state, setState] = useState<CursorState>({
    isHovering: false,
    isClicking: false,
    isHidden: true,
    cursorText: '',
    cursorVariant: 'default',
  });

  const cursorX = useMotionValue(-100);
  const cursorY = useMotionValue(-100);
  const cursorRef = useRef<HTMLDivElement>(null);

  // Smooth spring animation for cursor movement
  const springConfig = { damping: 25, stiffness: 300, mass: 0.5 };
  const cursorXSpring = useSpring(cursorX, springConfig);
  const cursorYSpring = useSpring(cursorY, springConfig);

  // Outer ring has slightly slower spring for trail effect
  const outerSpringConfig = { damping: 20, stiffness: 200, mass: 0.8 };
  const outerXSpring = useSpring(cursorX, outerSpringConfig);
  const outerYSpring = useSpring(cursorY, outerSpringConfig);

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

  // Setup cursor variant detection
  useEffect(() => {
    if (!mounted) return;

    const isTouchDevice =
      'ontouchstart' in window || navigator.maxTouchPoints > 0;

    if (isTouchDevice) return;

    const handleElementHover = (e: MouseEvent) => {
      const target = e.target as HTMLElement;

      // Check for specific cursor variants
      const cursorVariant = target
        .closest('[data-cursor]')
        ?.getAttribute('data-cursor') as CursorState['cursorVariant'] | null;
      const cursorText =
        target
          .closest('[data-cursor-text]')
          ?.getAttribute('data-cursor-text') || '';

      if (cursorVariant) {
        setState((prev) => ({
          ...prev,
          isHovering: true,
          cursorVariant,
          cursorText,
        }));
        return;
      }

      // Check for interactive elements
      const isButton = target.closest('button, [role="button"]');
      const isLink = target.closest('a');
      const isInput = target.closest('input, textarea, select');
      const isMagnetic = target.closest('[data-magnetic]');

      if (isMagnetic) {
        setState((prev) => ({
          ...prev,
          isHovering: true,
          cursorVariant: 'magnetic',
          cursorText: '',
        }));
      } else if (isButton) {
        setState((prev) => ({
          ...prev,
          isHovering: true,
          cursorVariant: 'button',
          cursorText: '',
        }));
      } else if (isLink) {
        setState((prev) => ({
          ...prev,
          isHovering: true,
          cursorVariant: 'link',
          cursorText: '',
        }));
      } else if (isInput) {
        setState((prev) => ({
          ...prev,
          isHovering: true,
          cursorVariant: 'text',
          cursorText: '',
        }));
      }
    };

    const handleElementLeave = () => {
      setState((prev) => ({
        ...prev,
        isHovering: false,
        cursorVariant: 'default',
        cursorText: '',
      }));
    };

    // Event listeners
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseenter', handleMouseEnter);
    document.addEventListener('mouseleave', handleMouseLeave);
    document.addEventListener('mousedown', handleMouseDown);
    document.addEventListener('mouseup', handleMouseUp);

    // Hover detection with event delegation
    document.addEventListener('mouseover', handleElementHover);
    document.addEventListener('mouseout', (e) => {
      const relatedTarget = e.relatedTarget as HTMLElement | null;
      if (
        !relatedTarget?.closest(
          'a, button, [role="button"], input, textarea, select, [data-cursor], [data-magnetic]',
        )
      ) {
        handleElementLeave();
      }
    });

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseenter', handleMouseEnter);
      document.removeEventListener('mouseleave', handleMouseLeave);
      document.removeEventListener('mousedown', handleMouseDown);
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('mouseover', handleElementHover);
    };
  }, [
    mounted,
    handleMouseMove,
    handleMouseEnter,
    handleMouseLeave,
    handleMouseDown,
    handleMouseUp,
  ]);

  // Don't render on mobile
  if (!mounted) return null;

  if (
    typeof window !== 'undefined' &&
    ('ontouchstart' in window || navigator.maxTouchPoints > 0)
  ) {
    return null;
  }

  // Cursor sizes based on state
  const getCursorSize = () => {
    if (state.cursorVariant === 'text') return { dot: 2, ring: 0 };
    if (state.cursorVariant === 'magnetic') return { dot: 8, ring: 80 };
    if (state.isClicking) return { dot: 6, ring: 30 };
    if (state.isHovering) return { dot: 10, ring: 60 };
    return { dot: 8, ring: 40 };
  };

  const sizes = getCursorSize();

  return (
    <>
      {/* Main cursor dot */}
      <motion.div
        ref={cursorRef}
        className="fixed pointer-events-none z-[9999]"
        style={{
          x: cursorXSpring,
          y: cursorYSpring,
          translateX: '-50%',
          translateY: '-50%',
        }}
        animate={{
          scale: state.isClicking ? 0.8 : 1,
          opacity: state.isHidden ? 0 : 1,
        }}
        transition={{ duration: 0.15 }}
      >
        <motion.div
          className="rounded-full bg-primary mix-blend-difference"
          animate={{
            width: sizes.dot,
            height: sizes.dot,
          }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
        />
      </motion.div>

      {/* Outer ring */}
      <motion.div
        className="fixed pointer-events-none z-[9998]"
        style={{
          x: outerXSpring,
          y: outerYSpring,
          translateX: '-50%',
          translateY: '-50%',
        }}
        animate={{
          scale: state.isClicking ? 0.9 : 1,
          opacity: state.isHidden
            ? 0
            : state.cursorVariant === 'text'
              ? 0
              : 0.5,
        }}
        transition={{ duration: 0.2 }}
      >
        <motion.div
          className="rounded-full border border-primary/50 mix-blend-difference"
          animate={{
            width: sizes.ring,
            height: sizes.ring,
            borderWidth: state.cursorVariant === 'magnetic' ? 2 : 1,
          }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
        />
      </motion.div>

      {/* Cursor text (for special interactions) */}
      {state.cursorText && (
        <motion.div
          className="fixed pointer-events-none z-[9999] text-xs font-bold uppercase tracking-wider text-background"
          style={{
            x: cursorXSpring,
            y: cursorYSpring,
            translateX: '-50%',
            translateY: '-50%',
          }}
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.5 }}
        >
          {state.cursorText}
        </motion.div>
      )}
    </>
  );
}

export default CustomCursor;

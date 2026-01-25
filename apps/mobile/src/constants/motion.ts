/**
 * Motion System Constants
 * Lovendo Ultimate Design System 2026
 *
 * Centralized animation timing and easing for consistent motion design.
 * All components should use these constants for animation.
 *
 * Supports reduced motion preferences via useReducedMotion hook.
 */

import { Easing } from 'react-native-reanimated';

// ═══════════════════════════════════════════════════════════════════
// DURATION TOKENS
// ═══════════════════════════════════════════════════════════════════

/**
 * Animation durations in milliseconds
 * Based on Material Design motion guidelines
 */
export const DURATION = {
  /** Ultra-quick feedback (e.g., button press) */
  instant: 80,
  /** Quick transitions (e.g., icon changes, small UI updates) */
  fast: 120,
  /** Standard transitions (e.g., modal, drawer) */
  normal: 200,
  /** Slower transitions (e.g., page transitions, complex animations) */
  slow: 260,
  /** Complex animations (e.g., onboarding, celebrations) */
  complex: 400,
  /** Extended animations (e.g., progress, loading states) */
  extended: 600,
} as const;

// ═══════════════════════════════════════════════════════════════════
// EASING TOKENS
// ═══════════════════════════════════════════════════════════════════

/**
 * Easing functions for different use cases
 */
export const EASING = {
  /** Standard easing for most animations */
  standard: Easing.bezier(0.4, 0, 0.2, 1),
  /** Deceleration (entering elements) */
  decelerate: Easing.bezier(0, 0, 0.2, 1),
  /** Acceleration (exiting elements) */
  accelerate: Easing.bezier(0.4, 0, 1, 1),
  /** Sharp (quick snapping) */
  sharp: Easing.bezier(0.4, 0, 0.6, 1),
  /** Elastic (playful bounce) */
  elastic: Easing.bezier(0.68, -0.55, 0.265, 1.55),
  /** Smooth (liquid feel) */
  smooth: Easing.bezier(0.25, 0.1, 0.25, 1),
  /** Bounce (celebration) */
  bounce: Easing.bounce,
  /** Linear (progress indicators) */
  linear: Easing.linear,
} as const;

// ═══════════════════════════════════════════════════════════════════
// SPRING CONFIGS
// ═══════════════════════════════════════════════════════════════════

/**
 * Spring configurations for physics-based animations
 */
export const SPRING = {
  /** Default spring (balanced) */
  default: {
    damping: 15,
    stiffness: 150,
    mass: 1,
  },
  /** Gentle spring (slower, more fluid) */
  gentle: {
    damping: 20,
    stiffness: 100,
    mass: 1,
  },
  /** Snappy spring (quick, responsive) */
  snappy: {
    damping: 12,
    stiffness: 300,
    mass: 0.8,
  },
  /** Bouncy spring (playful) */
  bouncy: {
    damping: 8,
    stiffness: 200,
    mass: 1,
  },
  /** Stiff spring (minimal overshoot) */
  stiff: {
    damping: 25,
    stiffness: 400,
    mass: 1,
  },
  /** Wobbly spring (exaggerated) */
  wobbly: {
    damping: 6,
    stiffness: 180,
    mass: 1,
  },
} as const;

// ═══════════════════════════════════════════════════════════════════
// DELAY TOKENS
// ═══════════════════════════════════════════════════════════════════

/**
 * Stagger delays for sequential animations
 */
export const DELAY = {
  /** No delay */
  none: 0,
  /** Minimal stagger (list items) */
  stagger: 50,
  /** Short delay */
  short: 100,
  /** Medium delay */
  medium: 200,
  /** Long delay (dramatic reveal) */
  long: 400,
} as const;

// ═══════════════════════════════════════════════════════════════════
// REDUCED MOTION SUPPORT
// ═══════════════════════════════════════════════════════════════════

/**
 * Get duration respecting reduced motion preference
 */
export function getAccessibleDuration(
  duration: number,
  prefersReducedMotion: boolean,
): number {
  if (prefersReducedMotion) {
    // Reduce all durations to instant for reduced motion
    return Math.min(duration, DURATION.instant);
  }
  return duration;
}

/**
 * Get spring config respecting reduced motion preference
 */
export function getAccessibleSpring(
  spring: typeof SPRING.default,
  prefersReducedMotion: boolean,
): typeof SPRING.default {
  if (prefersReducedMotion) {
    // Use very stiff spring with no overshoot
    return {
      damping: 50,
      stiffness: 500,
      mass: 1,
    };
  }
  return spring;
}

// ═══════════════════════════════════════════════════════════════════
// PRESET ANIMATION CONFIGS
// ═══════════════════════════════════════════════════════════════════

/**
 * Preset animation configurations for common use cases
 */
export const ANIMATION_PRESETS = {
  /** Button press feedback */
  buttonPress: {
    duration: DURATION.instant,
    easing: EASING.sharp,
  },
  /** Modal enter/exit */
  modal: {
    duration: DURATION.normal,
    easing: EASING.decelerate,
  },
  /** Drawer slide */
  drawer: {
    duration: DURATION.slow,
    easing: EASING.standard,
  },
  /** Toast notification */
  toast: {
    duration: DURATION.fast,
    easing: EASING.decelerate,
  },
  /** Card hover/focus */
  cardFocus: {
    duration: DURATION.fast,
    easing: EASING.standard,
  },
  /** Page transition */
  pageTransition: {
    duration: DURATION.slow,
    easing: EASING.standard,
  },
  /** Celebration/success */
  celebration: {
    duration: DURATION.complex,
    easing: EASING.elastic,
  },
  /** Loading spinner */
  loading: {
    duration: DURATION.extended,
    easing: EASING.linear,
  },
  /** Skeleton shimmer */
  skeleton: {
    duration: 1500,
    easing: EASING.linear,
  },
} as const;

// ═══════════════════════════════════════════════════════════════════
// TRANSFORM HELPERS
// ═══════════════════════════════════════════════════════════════════

/**
 * Common transform values for animations
 */
export const TRANSFORM = {
  /** Scale values */
  scale: {
    pressed: 0.95,
    hover: 1.02,
    pop: 1.1,
    hidden: 0,
    full: 1,
  },
  /** Translate values */
  translate: {
    offscreenBottom: 100,
    offscreenRight: 100,
    offscreenLeft: -100,
    offscreenTop: -100,
    subtle: 8,
  },
  /** Rotation values in degrees */
  rotate: {
    subtle: 3,
    quarter: 90,
    half: 180,
    full: 360,
  },
} as const;

export default {
  DURATION,
  EASING,
  SPRING,
  DELAY,
  ANIMATION_PRESETS,
  TRANSFORM,
  getAccessibleDuration,
  getAccessibleSpring,
};

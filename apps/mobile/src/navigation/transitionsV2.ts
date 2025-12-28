/**
 * TravelMatch Awwwards Design System 2026 - Navigation Transitions V2
 *
 * Premium page transitions for Awwwards-level polish:
 * - Modal slide from bottom
 * - Fade transitions
 * - Scale fade for detail screens
 * - iOS-style card transitions
 *
 * Based on @react-navigation/stack
 */

import {
  StackCardInterpolationProps,
  StackCardStyleInterpolator,
  TransitionSpecs,
  TransitionPresets,
} from '@react-navigation/stack';
import { Easing } from 'react-native-reanimated';

// ============================================
// TRANSITION SPECS
// ============================================
export const TRANSITION_SPECS_V2 = {
  /**
   * Spring-based open transition
   */
  springOpen: {
    animation: 'spring' as const,
    config: {
      stiffness: 300,
      damping: 30,
      mass: 1,
    },
  },

  /**
   * Spring-based close transition
   */
  springClose: {
    animation: 'spring' as const,
    config: {
      stiffness: 400,
      damping: 35,
      mass: 0.8,
    },
  },

  /**
   * Timing-based open transition
   */
  timingOpen: {
    animation: 'timing' as const,
    config: {
      duration: 350,
      easing: Easing.out(Easing.poly(4)),
    },
  },

  /**
   * Timing-based close transition
   */
  timingClose: {
    animation: 'timing' as const,
    config: {
      duration: 250,
      easing: Easing.in(Easing.ease),
    },
  },

  /**
   * Fast timing for modals
   */
  modalOpen: {
    animation: 'timing' as const,
    config: {
      duration: 300,
      easing: Easing.out(Easing.ease),
    },
  },

  modalClose: {
    animation: 'timing' as const,
    config: {
      duration: 200,
      easing: Easing.in(Easing.ease),
    },
  },
};

// ============================================
// CUSTOM CARD STYLE INTERPOLATORS
// ============================================

/**
 * Fade transition - Elements fade in/out
 */
export const forFade: StackCardStyleInterpolator = ({
  current,
}: StackCardInterpolationProps) => ({
  cardStyle: {
    opacity: current.progress,
  },
});

/**
 * Scale fade - Elements scale up and fade in
 * Perfect for detail screens
 */
export const forScaleFade: StackCardStyleInterpolator = ({
  current,
}: StackCardInterpolationProps) => ({
  cardStyle: {
    opacity: current.progress,
    transform: [
      {
        scale: current.progress.interpolate({
          inputRange: [0, 1],
          outputRange: [0.92, 1],
        }),
      },
    ],
  },
});

/**
 * Slide up fade - Elements slide up and fade in
 * Perfect for modals and bottom sheets
 */
export const forSlideUpFade: StackCardStyleInterpolator = ({
  current,
  layouts,
}: StackCardInterpolationProps) => ({
  cardStyle: {
    opacity: current.progress.interpolate({
      inputRange: [0, 0.5, 1],
      outputRange: [0, 0.5, 1],
    }),
    transform: [
      {
        translateY: current.progress.interpolate({
          inputRange: [0, 1],
          outputRange: [layouts.screen.height * 0.1, 0],
        }),
      },
    ],
  },
});

/**
 * Horizontal slide with parallax effect
 */
export const forHorizontalSlide: StackCardStyleInterpolator = ({
  current,
  next,
  layouts,
}: StackCardInterpolationProps) => {
  const translateX = current.progress.interpolate({
    inputRange: [0, 1],
    outputRange: [layouts.screen.width, 0],
  });

  const translateXNext = next
    ? next.progress.interpolate({
        inputRange: [0, 1],
        outputRange: [0, -layouts.screen.width * 0.3],
      })
    : 0;

  return {
    cardStyle: {
      transform: [{ translateX }, { translateX: translateXNext }],
    },
    overlayStyle: {
      opacity: current.progress.interpolate({
        inputRange: [0, 1],
        outputRange: [0, 0.5],
      }),
    },
  };
};

/**
 * Modal presentation style
 */
export const forModalPresentation: StackCardStyleInterpolator = ({
  current,
  layouts,
}: StackCardInterpolationProps) => ({
  cardStyle: {
    transform: [
      {
        translateY: current.progress.interpolate({
          inputRange: [0, 1],
          outputRange: [layouts.screen.height, 0],
        }),
      },
    ],
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    overflow: 'hidden' as const,
  },
  overlayStyle: {
    opacity: current.progress.interpolate({
      inputRange: [0, 1],
      outputRange: [0, 0.5],
    }),
  },
});

// ============================================
// COMPLETE TRANSITION PRESETS
// ============================================
export const TRANSITIONS_V2 = {
  /**
   * Default horizontal slide (iOS-like)
   */
  default: {
    gestureEnabled: true,
    gestureDirection: 'horizontal' as const,
    transitionSpec: {
      open: TRANSITION_SPECS_V2.springOpen,
      close: TRANSITION_SPECS_V2.springClose,
    },
    cardStyleInterpolator: forHorizontalSlide,
    headerMode: 'screen' as const,
  },

  /**
   * Fade transition
   */
  fade: {
    gestureEnabled: false,
    cardStyleInterpolator: forFade,
    transitionSpec: {
      open: TRANSITION_SPECS_V2.timingOpen,
      close: TRANSITION_SPECS_V2.timingClose,
    },
  },

  /**
   * Scale fade - for detail screens
   */
  scaleFade: {
    gestureEnabled: true,
    gestureDirection: 'horizontal' as const,
    cardStyleInterpolator: forScaleFade,
    transitionSpec: {
      open: TRANSITION_SPECS_V2.timingOpen,
      close: TRANSITION_SPECS_V2.timingClose,
    },
  },

  /**
   * Modal slide from bottom
   */
  modalSlideFromBottom: {
    gestureEnabled: true,
    gestureDirection: 'vertical' as const,
    cardStyleInterpolator: forModalPresentation,
    transitionSpec: {
      open: TRANSITION_SPECS_V2.modalOpen,
      close: TRANSITION_SPECS_V2.modalClose,
    },
    presentation: 'modal' as const,
  },

  /**
   * Bottom sheet style
   */
  bottomSheet: {
    gestureEnabled: true,
    gestureDirection: 'vertical' as const,
    cardStyleInterpolator: forSlideUpFade,
    transitionSpec: {
      open: TRANSITION_SPECS_V2.springOpen,
      close: TRANSITION_SPECS_V2.timingClose,
    },
    presentation: 'transparentModal' as const,
    cardOverlayEnabled: true,
  },

  /**
   * No animation - instant transition
   */
  none: {
    gestureEnabled: false,
    animationEnabled: false,
  },
};

// ============================================
// SCREEN OPTIONS HELPERS
// ============================================

/**
 * Get screen options for a standard push screen
 */
export const getStandardScreenOptions = () => ({
  ...TRANSITIONS_V2.default,
  headerShown: false,
});

/**
 * Get screen options for a modal screen
 */
export const getModalScreenOptions = () => ({
  ...TRANSITIONS_V2.modalSlideFromBottom,
  headerShown: false,
});

/**
 * Get screen options for a detail screen (scale fade)
 */
export const getDetailScreenOptions = () => ({
  ...TRANSITIONS_V2.scaleFade,
  headerShown: false,
});

/**
 * Get screen options for auth screens (fade)
 */
export const getAuthScreenOptions = () => ({
  ...TRANSITIONS_V2.fade,
  headerShown: false,
});

// ============================================
// NAVIGATOR OPTIONS
// ============================================
export const DEFAULT_NAVIGATOR_OPTIONS = {
  screenOptions: {
    headerShown: false,
    cardStyle: {
      backgroundColor: 'transparent',
    },
    ...TRANSITIONS_V2.default,
  },
};

export const MODAL_NAVIGATOR_OPTIONS = {
  screenOptions: {
    headerShown: false,
    presentation: 'modal' as const,
    ...TRANSITIONS_V2.modalSlideFromBottom,
  },
};

export const AUTH_NAVIGATOR_OPTIONS = {
  screenOptions: {
    headerShown: false,
    ...TRANSITIONS_V2.fade,
  },
};

export default TRANSITIONS_V2;

/**
 * Accessibility Configuration
 * WCAG 2.1 Level AA Compliance
 * 
 * Standards:
 * - Perceivable: Color contrast, text alternatives, adaptable content
 * - Operable: Keyboard accessible, enough time, seizures prevention
 * - Understandable: Readable, predictable, input assistance
 * - Robust: Compatible with assistive technologies
 */

import { logger } from '../utils/logger';

// WCAG 2.1 AA Requirements
export const WCAG_STANDARDS = {
  // Color Contrast Ratios
  contrast: {
    normalText: 4.5, // 4.5:1 for normal text
    largeText: 3.0, // 3:1 for large text (18pt+ or 14pt+ bold)
    uiComponents: 3.0, // 3:1 for UI components and graphics
  },

  // Text Size
  textSize: {
    minimum: 12, // Minimum readable size
    base: 16, // Base font size (1rem)
    large: 18, // Large text threshold
  },

  // Touch Targets
  touchTarget: {
    minimum: 44, // 44x44 pixels minimum (iOS HIG)
    recommended: 48, // 48x48 pixels (Material Design)
  },

  // Animation
  animation: {
    maxFlashRate: 3, // Maximum 3 flashes per second
    reducedMotion: true, // Respect prefers-reduced-motion
  },

  // Timing
  timing: {
    minimumActionTime: 20000, // 20 seconds minimum for timed actions
    warningBeforeTimeout: 20000, // 20 seconds warning before timeout
  },
} as const;

// ARIA Roles and Labels
export const ARIA_LABELS = {
  // Navigation
  mainNav: 'Main navigation',
  breadcrumb: 'Breadcrumb',
  pagination: 'Pagination',
  
  // Actions
  search: 'Search',
  filter: 'Filter options',
  sort: 'Sort options',
  
  // Content
  momentCard: 'Moment card',
  userProfile: 'User profile',
  giftButton: 'Send gift',
  
  // Forms
  required: 'Required field',
  error: 'Error message',
  success: 'Success message',
} as const;

// Semantic HTML elements mapping
export const SEMANTIC_ELEMENTS = {
  header: 'header',
  nav: 'nav',
  main: 'main',
  section: 'section',
  article: 'article',
  aside: 'aside',
  footer: 'footer',
} as const;

/**
 * Check color contrast ratio (WCAG 2.1)
 */
export function checkContrastRatio(foreground: string, background: string): {
  ratio: number;
  passesAA: boolean;
  passesAAA: boolean;
} {
  const fgLuminance = getRelativeLuminance(foreground);
  const bgLuminance = getRelativeLuminance(background);

  const lighter = Math.max(fgLuminance, bgLuminance);
  const darker = Math.min(fgLuminance, bgLuminance);

  const ratio = (lighter + 0.05) / (darker + 0.05);

  return {
    ratio: parseFloat(ratio.toFixed(2)),
    passesAA: ratio >= WCAG_STANDARDS.contrast.normalText,
    passesAAA: ratio >= 7.0,
  };
}

/**
 * Calculate relative luminance
 */
function getRelativeLuminance(color: string): number {
  // Convert hex to RGB
  const rgb = hexToRgb(color);
  if (!rgb) return 0;

  // Apply gamma correction
  const values = [rgb.r, rgb.g, rgb.b].map((val) => {
    const normalized = val / 255;
    return normalized <= 0.03928
      ? normalized / 12.92
      : Math.pow((normalized + 0.055) / 1.055, 2.4);
  });

  const r = values[0] ?? 0;
  const g = values[1] ?? 0;
  const b = values[2] ?? 0;

  // Calculate luminance
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result || !result[1] || !result[2] || !result[3]) return null;
  return {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16),
  };
}

/**
 * Validate accessibility of a component
 */
export function validateAccessibility(element: HTMLElement): {
  passed: boolean;
  violations: string[];
  warnings: string[];
} {
  const violations: string[] = [];
  const warnings: string[] = [];

  // Check for alt text on images
  const images = element.querySelectorAll('img');
  images.forEach((img) => {
    if (!img.alt) {
      violations.push(`Image missing alt text: ${img.src}`);
    }
  });

  // Check for labels on form inputs
  const inputs = element.querySelectorAll('input, textarea, select');
  inputs.forEach((input) => {
    const id = input.getAttribute('id');
    const ariaLabel = input.getAttribute('aria-label');
    const ariaLabelledBy = input.getAttribute('aria-labelledby');

    if (!id && !ariaLabel && !ariaLabelledBy) {
      violations.push(`Form input missing label: ${input.tagName}`);
    }
  });

  // Check for keyboard accessibility
  const interactiveElements = element.querySelectorAll('button, a, input, select, textarea');
  interactiveElements.forEach((el) => {
    const tabindex = el.getAttribute('tabindex');
    if (tabindex && parseInt(tabindex) < 0) {
      warnings.push(`Interactive element not keyboard accessible: ${el.tagName}`);
    }
  });

  // Check heading hierarchy
  const headings = element.querySelectorAll('h1, h2, h3, h4, h5, h6');
  let previousLevel = 0;
  headings.forEach((heading) => {
    const level = parseInt(heading.tagName.substring(1));
    if (previousLevel > 0 && level > previousLevel + 1) {
      warnings.push(`Heading hierarchy skipped from H${previousLevel} to H${level}`);
    }
    previousLevel = level;
  });

  // Check for ARIA landmarks
  const landmarks = element.querySelectorAll('[role="main"], [role="navigation"], [role="complementary"]');
  if (landmarks.length === 0 && element.children.length > 5) {
    warnings.push('Consider adding ARIA landmarks for better navigation');
  }

  return {
    passed: violations.length === 0,
    violations,
    warnings,
  };
}

/**
 * Accessibility utilities for React components
 */
export const a11yUtils = {
  /**
   * Generate unique ID for form fields
   */
  generateId: (prefix = 'field') => {
    return `${prefix}-${Math.random().toString(36).substr(2, 9)}`;
  },

  /**
   * Get accessible label props
   */
  getLabelProps: (label: string, required = false) => ({
    'aria-label': label,
    'aria-required': required,
  }),

  /**
   * Get error props
   */
  getErrorProps: (errorId: string, hasError: boolean) => ({
    'aria-invalid': hasError,
    'aria-describedby': hasError ? errorId : undefined,
  }),

  /**
   * Announce to screen reader (React Native)
   * Uses AccessibilityInfo for mobile
   */
  announce: (message: string, _priority: 'polite' | 'assertive' = 'polite') => {
    // React Native uses AccessibilityInfo.announceForAccessibility
    // Import AccessibilityInfo from react-native to use this
    // AccessibilityInfo.announceForAccessibility(message);
    if (__DEV__) {
      logger.debug('[Accessibility Announce]:', message);
    }
  },

  /**
   * Focus trap for modals - Not applicable for React Native
   * React Native handles focus differently via accessible and focusable props
   */
  trapFocus: (_container: unknown) => {
    // React Native doesn't use DOM focus traps
    // Use Modal's accessible prop and focusable props instead
    return () => {};
  },
};

/**
 * Keyboard navigation hooks
 */
export const KeyboardNav = {
  KEYS: {
    ENTER: 'Enter',
    SPACE: ' ',
    ESCAPE: 'Escape',
    ARROW_UP: 'ArrowUp',
    ARROW_DOWN: 'ArrowDown',
    ARROW_LEFT: 'ArrowLeft',
    ARROW_RIGHT: 'ArrowRight',
    TAB: 'Tab',
    HOME: 'Home',
    END: 'End',
  },

  /**
   * Handle list navigation
   */
  handleListNav: (
    event: KeyboardEvent,
    currentIndex: number,
    itemCount: number,
    onSelect: (index: number) => void
  ) => {
    const { key } = event;
    let newIndex = currentIndex;

    switch (key) {
      case KeyboardNav.KEYS.ARROW_UP:
        event.preventDefault();
        newIndex = currentIndex > 0 ? currentIndex - 1 : itemCount - 1;
        break;
      case KeyboardNav.KEYS.ARROW_DOWN:
        event.preventDefault();
        newIndex = currentIndex < itemCount - 1 ? currentIndex + 1 : 0;
        break;
      case KeyboardNav.KEYS.HOME:
        event.preventDefault();
        newIndex = 0;
        break;
      case KeyboardNav.KEYS.END:
        event.preventDefault();
        newIndex = itemCount - 1;
        break;
      case KeyboardNav.KEYS.ENTER:
      case KeyboardNav.KEYS.SPACE:
        event.preventDefault();
        onSelect(currentIndex);
        return;
    }

    if (newIndex !== currentIndex) {
      onSelect(newIndex);
    }
  },
};

/**
 * Screen reader only text
 */
export const srOnly = {
  position: 'absolute' as const,
  width: 1,
  height: 1,
  padding: 0,
  margin: -1,
  overflow: 'hidden',
  clip: 'rect(0, 0, 0, 0)',
  whiteSpace: 'nowrap' as const,
  borderWidth: 0,
};

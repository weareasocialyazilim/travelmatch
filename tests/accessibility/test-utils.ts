/**
 * Accessibility Testing Utilities
 * Comprehensive testing helpers for WCAG 2.1 AA compliance
 */

import { render, fireEvent, waitFor } from '@testing-library/react-native';
import {
  checkContrastRatio,
  validateAccessibility,
} from '@/config/accessibility';

/**
 * Test Suite: Screen Reader Compatibility
 */
export const screenReaderTests = {
  /**
   * Check if element has accessible label
   */
  hasAccessibleLabel: (element: any): { passed: boolean; message: string } => {
    const label = element.props.accessibilityLabel;
    const hint = element.props.accessibilityHint;

    if (!label && !hint) {
      return {
        passed: false,
        message:
          'Element missing both accessibilityLabel and accessibilityHint',
      };
    }

    return {
      passed: true,
      message: `Element has accessible label: "${label}"`,
    };
  },

  /**
   * Check if interactive element has proper role
   */
  hasProperRole: (element: any): { passed: boolean; message: string } => {
    const role = element.props.accessibilityRole;
    const validRoles = [
      'button',
      'link',
      'search',
      'image',
      'imagebutton',
      'text',
      'adjustable',
      'header',
      'summary',
      'none',
    ];

    if (!role) {
      return {
        passed: false,
        message: 'Element missing accessibilityRole',
      };
    }

    if (!validRoles.includes(role)) {
      return {
        passed: false,
        message: `Invalid role: ${role}. Valid roles: ${validRoles.join(', ')}`,
      };
    }

    return {
      passed: true,
      message: `Element has valid role: ${role}`,
    };
  },

  /**
   * Check if element has proper states
   */
  hasProperStates: (element: any): { passed: boolean; message: string } => {
    const state = element.props.accessibilityState;

    if (!state) {
      return {
        passed: true,
        message: 'Element has no accessibility state (may be OK)',
      };
    }

    const validStateKeys = [
      'disabled',
      'selected',
      'checked',
      'busy',
      'expanded',
    ];
    const invalidKeys = Object.keys(state).filter(
      (key) => !validStateKeys.includes(key),
    );

    if (invalidKeys.length > 0) {
      return {
        passed: false,
        message: `Invalid state keys: ${invalidKeys.join(', ')}`,
      };
    }

    return {
      passed: true,
      message: `Element has valid states: ${JSON.stringify(state)}`,
    };
  },

  /**
   * Run all screen reader tests on component
   */
  testComponent: (component: any) => {
    const results = {
      label: screenReaderTests.hasAccessibleLabel(component),
      role: screenReaderTests.hasProperRole(component),
      states: screenReaderTests.hasProperStates(component),
    };

    const passed = Object.values(results).every((r) => r.passed);

    return {
      passed,
      results,
      summary: passed
        ? 'All screen reader tests passed ✅'
        : 'Some screen reader tests failed ❌',
    };
  },
};

/**
 * Test Suite: Color Contrast
 */
export const colorContrastTests = {
  /**
   * Test all design token colors
   */
  testDesignTokens: () => {
    const { colors } = require('@lovendo/design-system/tokens');
    const violations: string[] = [];

    // Test primary colors on white background
    Object.entries(colors.primary).forEach(([shade, color]) => {
      const result = checkContrastRatio(color as string, '#FFFFFF');
      if (!result.passesAA) {
        violations.push(
          `Primary ${shade} (${color}) on white: ${result.ratio}:1`,
        );
      }
    });

    // Test text colors
    Object.entries(colors.text).forEach(([type, color]) => {
      const result = checkContrastRatio(
        color as string,
        colors.background.primary,
      );
      if (!result.passesAA) {
        violations.push(`Text ${type} (${color}) on bg: ${result.ratio}:1`);
      }
    });

    return {
      passed: violations.length === 0,
      violations,
      summary:
        violations.length === 0
          ? 'All color contrasts pass WCAG AA ✅'
          : `${violations.length} color contrast violations ❌`,
    };
  },

  /**
   * Test specific color combination
   */
  testColorPair: (
    foreground: string,
    background: string,
    context: string = '',
  ) => {
    const result = checkContrastRatio(foreground, background);

    return {
      passed: result.passesAA,
      ratio: result.ratio,
      message: result.passesAA
        ? `${context} passes WCAG AA (${result.ratio}:1) ✅`
        : `${context} fails WCAG AA (${result.ratio}:1, needs 4.5:1) ❌`,
    };
  },
};

/**
 * Test Suite: Keyboard Navigation
 */
export const keyboardNavigationTests = {
  /**
   * Test if component responds to keyboard events
   */
  testKeyboardInteraction: async (
    component: any,
    keyEvent: string,
    expectedBehavior: () => boolean,
  ) => {
    const { getByRole } = render(component);
    const element = getByRole('button'); // or other role

    // Simulate keyboard event
    fireEvent(element, keyEvent);

    await waitFor(() => {
      const passed = expectedBehavior();
      return {
        passed,
        message: passed
          ? `Keyboard event ${keyEvent} handled correctly ✅`
          : `Keyboard event ${keyEvent} not handled ❌`,
      };
    });
  },

  /**
   * Test focus management
   */
  testFocusManagement: (component: any) => {
    const { getAllByRole } = render(component);
    const interactiveElements = getAllByRole(/button|link/);

    if (interactiveElements.length === 0) {
      return {
        passed: false,
        message: 'No interactive elements found ❌',
      };
    }

    // Check if elements are focusable
    const unfocusable = interactiveElements.filter(
      (el) => el.props.accessible === false || el.props.tabIndex === -1,
    );

    return {
      passed: unfocusable.length === 0,
      message:
        unfocusable.length === 0
          ? 'All interactive elements are focusable ✅'
          : `${unfocusable.length} elements not focusable ❌`,
    };
  },
};

/**
 * Test Suite: Touch Target Size
 */
export const touchTargetTests = {
  /**
   * Check if touch target meets minimum size (48x48)
   */
  checkTouchTarget: (element: any): { passed: boolean; message: string } => {
    const style = element.props.style || {};
    const minSize = 48;

    const width = style.width || style.minWidth;
    const height = style.height || style.minHeight;

    if (!width || !height) {
      return {
        passed: false,
        message: 'Touch target size not specified ⚠️',
      };
    }

    const passed = width >= minSize && height >= minSize;

    return {
      passed,
      message: passed
        ? `Touch target size OK (${width}x${height}) ✅`
        : `Touch target too small (${width}x${height}, needs 48x48) ❌`,
    };
  },
};

/**
 * Comprehensive Accessibility Test Runner
 */
export async function runAccessibilityTests(component: any) {
  console.log('\n🔍 Running Accessibility Tests...\n');

  const results = {
    screenReader: screenReaderTests.testComponent(component),
    colorContrast: colorContrastTests.testDesignTokens(),
    keyboardNav: keyboardNavigationTests.testFocusManagement(component),
    touchTarget: touchTargetTests.checkTouchTarget(component),
  };

  // Print results
  console.log('📱 Screen Reader:', results.screenReader.summary);
  console.log('🎨 Color Contrast:', results.colorContrast.summary);
  console.log('⌨️  Keyboard Nav:', results.keyboardNav.message);
  console.log('👆 Touch Target:', results.touchTarget.message);

  // Overall result
  const allPassed = Object.values(results).every((r) => r.passed);

  console.log(
    '\n' + (allPassed ? '✅ All tests passed!' : '❌ Some tests failed'),
  );
  console.log('─────────────────────────────────\n');

  return {
    passed: allPassed,
    results,
  };
}

/**
 * Jest matcher for accessibility
 */
export const toBeAccessible = (component: any) => {
  const result = runAccessibilityTests(component);

  return {
    pass: result.passed,
    message: () =>
      result.passed
        ? 'Component is accessible'
        : 'Component has accessibility violations',
  };
};

// Extend Jest matchers
if (typeof expect !== 'undefined') {
  expect.extend({
    toBeAccessible,
  });
}

/**
 * Accessibility Utilities Tests
 * Comprehensive tests for a11y helper functions
 */

import { Platform } from 'react-native';
import {
  a11yProps,
  MIN_TOUCH_TARGET,
  isTouchTargetSufficient,
  getContrastRatio,
} from '../accessibility';

describe('Accessibility Utilities', () => {
  // ==================== A11Y PROPS GENERATORS ====================
  describe('a11yProps', () => {
    describe('button', () => {
      it('should generate correct button props', () => {
        const props = a11yProps.button('Submit', 'Tap to submit form');
        expect(props).toEqual({
          accessible: true,
          accessibilityRole: 'button',
          accessibilityLabel: 'Submit',
          accessibilityHint: 'Tap to submit form',
          accessibilityState: { disabled: false },
        });
      });

      it('should handle disabled state', () => {
        const props = a11yProps.button('Submit', 'Tap to submit', true);
        expect(props.accessibilityState.disabled).toBe(true);
      });

      it('should work without hint', () => {
        const props = a11yProps.button('Click me');
        expect(props.accessibilityHint).toBeUndefined();
      });
    });

    describe('link', () => {
      it('should generate correct link props', () => {
        const props = a11yProps.link('Learn more', 'Opens in browser');
        expect(props).toEqual({
          accessible: true,
          accessibilityRole: 'link',
          accessibilityLabel: 'Learn more',
          accessibilityHint: 'Opens in browser',
        });
      });
    });

    describe('image', () => {
      it('should generate correct image props', () => {
        const props = a11yProps.image('Profile photo of John');
        expect(props).toEqual({
          accessible: true,
          accessibilityRole: 'image',
          accessibilityLabel: 'Profile photo of John',
        });
      });

      it('should handle decorative images', () => {
        const props = a11yProps.image('Decorative icon', true);
        expect(props.accessible).toBe(false);
        expect(props.accessibilityLabel).toBeUndefined();
      });
    });

    describe('textInput', () => {
      it('should generate correct text input props', () => {
        const props = a11yProps.textInput('Email address');
        expect(props).toEqual({
          accessible: true,
          accessibilityLabel: 'Email address',
          accessibilityHint: 'Double tap to edit',
          accessibilityState: { disabled: false },
        });
      });

      it('should handle required fields', () => {
        const props = a11yProps.textInput('Password', undefined, true);
        expect(props.accessibilityLabel).toBe('Password (required)');
      });

      it('should handle error state', () => {
        const props = a11yProps.textInput('Email', 'Invalid email format');
        expect(props.accessibilityHint).toBe('Invalid email format');
        expect(props.accessibilityState).toEqual({
          disabled: false,
          invalid: true,
        });
      });
    });

    describe('header', () => {
      it('should generate correct header props', () => {
        const props = a11yProps.header(1, 'Welcome');
        expect(props).toEqual({
          accessible: true,
          accessibilityRole: 'header',
          accessibilityLevel: 1,
          accessibilityLabel: 'Welcome',
        });
      });

      it('should support different heading levels', () => {
        const h2 = a11yProps.header(2, 'Section Title');
        expect(h2.accessibilityLevel).toBe(2);

        const h6 = a11yProps.header(6, 'Small heading');
        expect(h6.accessibilityLevel).toBe(6);
      });
    });

    describe('checkbox', () => {
      it('should generate correct checkbox props when unchecked', () => {
        const props = a11yProps.checkbox('Accept terms', false);
        expect(props).toEqual({
          accessible: true,
          accessibilityRole: 'checkbox',
          accessibilityLabel: 'Accept terms',
          accessibilityHint: undefined,
          accessibilityState: { checked: false },
        });
      });

      it('should generate correct checkbox props when checked', () => {
        const props = a11yProps.checkbox('Accept terms', true, 'Required');
        expect(props.accessibilityState.checked).toBe(true);
        expect(props.accessibilityHint).toBe('Required');
      });
    });

    describe('radio', () => {
      it('should generate correct radio props', () => {
        const props = a11yProps.radio('Option A', false);
        expect(props).toEqual({
          accessible: true,
          accessibilityRole: 'radio',
          accessibilityLabel: 'Option A',
          accessibilityHint: undefined,
          accessibilityState: { selected: false },
        });
      });

      it('should handle selected state', () => {
        const props = a11yProps.radio('Option A', true);
        expect(props.accessibilityState.selected).toBe(true);
      });
    });

    describe('tab', () => {
      it('should generate correct tab props', () => {
        const props = a11yProps.tab('Home', true, 0, 4);
        expect(props).toEqual({
          accessible: true,
          accessibilityRole: 'tab',
          accessibilityLabel: 'Home, tab 1 of 4',
          accessibilityState: { selected: true },
        });
      });

      it('should generate correct position info', () => {
        const props = a11yProps.tab('Settings', false, 3, 5);
        expect(props.accessibilityLabel).toBe('Settings, tab 4 of 5');
        expect(props.accessibilityState.selected).toBe(false);
      });
    });

    describe('listItem', () => {
      it('should generate correct list item props', () => {
        const props = a11yProps.listItem('Item content', 1, 10);
        expect(props).toEqual({
          accessible: true,
          accessibilityLabel: 'Item content, item 1 of 10',
        });
      });
    });
  });

  // ==================== TOUCH TARGET ====================
  describe('MIN_TOUCH_TARGET', () => {
    it('should be at least 44 points', () => {
      expect(MIN_TOUCH_TARGET).toBeGreaterThanOrEqual(44);
    });
  });

  describe('isTouchTargetSufficient', () => {
    it('should return true for sufficient touch targets', () => {
      expect(isTouchTargetSufficient(44, 44)).toBe(true);
      expect(isTouchTargetSufficient(48, 48)).toBe(true);
      expect(isTouchTargetSufficient(100, 100)).toBe(true);
    });

    it('should return false for insufficient touch targets', () => {
      expect(isTouchTargetSufficient(30, 30)).toBe(false);
      expect(isTouchTargetSufficient(44, 20)).toBe(false);
      expect(isTouchTargetSufficient(20, 44)).toBe(false);
    });
  });

  // ==================== COLOR CONTRAST ====================
  describe('getContrastRatio', () => {
    it('should calculate contrast ratio between black and white', () => {
      const ratio = getContrastRatio('#000000', '#FFFFFF');
      expect(ratio).toBeCloseTo(21, 0); // Maximum contrast ratio
    });

    it('should calculate contrast ratio for identical colors', () => {
      const ratio = getContrastRatio('#808080', '#808080');
      expect(ratio).toBeCloseTo(1, 0); // Same color = 1:1
    });

    it('should calculate contrast ratio for accessible color pairs', () => {
      // Dark blue on white - should be > 4.5:1
      const ratio = getContrastRatio('#0066CC', '#FFFFFF');
      expect(ratio).toBeGreaterThan(4.5);
    });

    it('should be symmetric', () => {
      const ratio1 = getContrastRatio('#FF0000', '#FFFFFF');
      const ratio2 = getContrastRatio('#FFFFFF', '#FF0000');
      expect(ratio1).toBeCloseTo(ratio2, 5);
    });
  });
});

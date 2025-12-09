/**
 * Badge Component Test Suite
 * Tests badge UI component with variants, sizes, icons, and notification badges
 */

import React from 'react';
import { render } from '@testing-library/react-native';
import { Badge, NotificationBadge } from '../Badge';

describe('Badge Component', () => {
  // ============================================
  // Basic Rendering Tests
  // ============================================

  describe('Basic Rendering', () => {
    it('renders with label', () => {
      const { getByText } = render(<Badge label="Test Badge" />);
      expect(getByText('Test Badge')).toBeTruthy();
    });

    it('renders with default variant', () => {
      const { getByText } = render(<Badge label="Default" />);
      expect(getByText('Default')).toBeTruthy();
    });

    it('renders with default size', () => {
      const { getByText } = render(<Badge label="Medium" />);
      expect(getByText('Medium')).toBeTruthy();
    });

    it('renders without optional props', () => {
      const { getByText } = render(<Badge label="Simple" />);
      expect(getByText('Simple')).toBeTruthy();
    });
  });

  // ============================================
  // Variant Tests
  // ============================================

  describe('Variants', () => {
    it('renders success variant', () => {
      const { getByText } = render(<Badge label="Success" variant="success" />);
      expect(getByText('Success')).toBeTruthy();
    });

    it('renders warning variant', () => {
      const { getByText } = render(<Badge label="Warning" variant="warning" />);
      expect(getByText('Warning')).toBeTruthy();
    });

    it('renders error variant', () => {
      const { getByText } = render(<Badge label="Error" variant="error" />);
      expect(getByText('Error')).toBeTruthy();
    });

    it('renders info variant', () => {
      const { getByText } = render(<Badge label="Info" variant="info" />);
      expect(getByText('Info')).toBeTruthy();
    });

    it('renders primary variant', () => {
      const { getByText } = render(<Badge label="Primary" variant="primary" />);
      expect(getByText('Primary')).toBeTruthy();
    });

    it('renders default variant explicitly', () => {
      const { getByText } = render(<Badge label="Default" variant="default" />);
      expect(getByText('Default')).toBeTruthy();
    });

    it('renders all variants correctly', () => {
      const variants: Array<'default' | 'success' | 'warning' | 'error' | 'info' | 'primary'> = [
        'default',
        'success',
        'warning',
        'error',
        'info',
        'primary',
      ];

      variants.forEach((variant) => {
        const { getByText } = render(<Badge label={variant} variant={variant} />);
        expect(getByText(variant)).toBeTruthy();
      });
    });
  });

  // ============================================
  // Size Tests
  // ============================================

  describe('Sizes', () => {
    it('renders small size', () => {
      const { getByText } = render(<Badge label="Small" size="sm" />);
      expect(getByText('Small')).toBeTruthy();
    });

    it('renders medium size', () => {
      const { getByText } = render(<Badge label="Medium" size="md" />);
      expect(getByText('Medium')).toBeTruthy();
    });

    it('renders large size', () => {
      const { getByText } = render(<Badge label="Large" size="lg" />);
      expect(getByText('Large')).toBeTruthy();
    });

    it('renders all sizes correctly', () => {
      const sizes: Array<'sm' | 'md' | 'lg'> = ['sm', 'md', 'lg'];

      sizes.forEach((size) => {
        const { getByText } = render(<Badge label={size} size={size} />);
        expect(getByText(size)).toBeTruthy();
      });
    });
  });

  // ============================================
  // Icon Tests
  // ============================================

  describe('Icons', () => {
    it('renders with icon', () => {
      const { getByText, UNSAFE_root } = render(
        <Badge label="Icon Badge" icon="check" />
      );
      expect(getByText('Icon Badge')).toBeTruthy();
      expect(UNSAFE_root).toBeTruthy();
    });

    it('renders without icon when not provided', () => {
      const { getByText } = render(<Badge label="No Icon" />);
      expect(getByText('No Icon')).toBeTruthy();
    });

    it('renders with different icons', () => {
      const icons: Array<'check' | 'alert' | 'information' | 'star'> = [
        'check',
        'alert',
        'information',
        'star',
      ];

      icons.forEach((icon) => {
        const { getByText } = render(<Badge label="Icon" icon={icon} />);
        expect(getByText('Icon')).toBeTruthy();
      });
    });

    it('renders icon with small size', () => {
      const { getByText } = render(<Badge label="Small Icon" size="sm" icon="check" />);
      expect(getByText('Small Icon')).toBeTruthy();
    });

    it('renders icon with large size', () => {
      const { getByText } = render(<Badge label="Large Icon" size="lg" icon="check" />);
      expect(getByText('Large Icon')).toBeTruthy();
    });
  });

  // ============================================
  // Dot Tests
  // ============================================

  describe('Dot Indicator', () => {
    it('renders with dot', () => {
      const { getByText } = render(<Badge label="Dot Badge" dot={true} />);
      expect(getByText('Dot Badge')).toBeTruthy();
    });

    it('renders without dot by default', () => {
      const { getByText } = render(<Badge label="No Dot" />);
      expect(getByText('No Dot')).toBeTruthy();
    });

    it('renders dot with different variants', () => {
      const variants: Array<'success' | 'warning' | 'error'> = ['success', 'warning', 'error'];

      variants.forEach((variant) => {
        const { getByText } = render(<Badge label="Dot" variant={variant} dot={true} />);
        expect(getByText('Dot')).toBeTruthy();
      });
    });

    it('renders both dot and icon', () => {
      const { getByText } = render(<Badge label="Both" dot={true} icon="check" />);
      expect(getByText('Both')).toBeTruthy();
    });
  });

  // ============================================
  // Combination Tests
  // ============================================

  describe('Combinations', () => {
    it('renders with all props', () => {
      const { getByText } = render(
        <Badge
          label="Full Badge"
          variant="success"
          size="lg"
          icon="check"
          dot={true}
          style={{ marginTop: 10 }}
        />
      );
      expect(getByText('Full Badge')).toBeTruthy();
    });

    it('combines variant and size', () => {
      const { getByText } = render(
        <Badge label="Combo" variant="primary" size="sm" />
      );
      expect(getByText('Combo')).toBeTruthy();
    });

    it('combines icon and size', () => {
      const { getByText } = render(
        <Badge label="Icon Size" icon="star" size="lg" />
      );
      expect(getByText('Icon Size')).toBeTruthy();
    });

    it('combines dot and variant', () => {
      const { getByText } = render(
        <Badge label="Dot Variant" dot={true} variant="error" />
      );
      expect(getByText('Dot Variant')).toBeTruthy();
    });

    it('renders multiple badges independently', () => {
      const { getByText } = render(
        <>
          <Badge label="Badge 1" variant="success" />
          <Badge label="Badge 2" variant="error" />
          <Badge label="Badge 3" variant="info" />
        </>
      );

      expect(getByText('Badge 1')).toBeTruthy();
      expect(getByText('Badge 2')).toBeTruthy();
      expect(getByText('Badge 3')).toBeTruthy();
    });
  });

  // ============================================
  // Custom Style Tests
  // ============================================

  describe('Custom Styles', () => {
    it('accepts custom style prop', () => {
      const { getByText } = render(
        <Badge label="Styled" style={{ marginTop: 20 }} />
      );
      expect(getByText('Styled')).toBeTruthy();
    });

    it('renders with multiple custom styles', () => {
      const { getByText } = render(
        <Badge label="Multi Style" style={{ margin: 10, opacity: 0.8 }} />
      );
      expect(getByText('Multi Style')).toBeTruthy();
    });
  });

  // ============================================
  // Edge Cases Tests
  // ============================================

  describe('Edge Cases', () => {
    it('renders with empty label', () => {
      const { getByText } = render(<Badge label="" />);
      expect(getByText('')).toBeTruthy();
    });

    it('renders with very long label', () => {
      const longLabel = 'This is a very long badge label that might wrap or truncate';
      const { getByText } = render(<Badge label={longLabel} />);
      expect(getByText(longLabel)).toBeTruthy();
    });

    it('renders with numeric label', () => {
      const { getByText } = render(<Badge label="42" />);
      expect(getByText('42')).toBeTruthy();
    });

    it('renders with special characters', () => {
      const { getByText } = render(<Badge label="Badge @ #1!" />);
      expect(getByText('Badge @ #1!')).toBeTruthy();
    });

    it('handles undefined style gracefully', () => {
      const { getByText } = render(<Badge label="No Style" style={undefined} />);
      expect(getByText('No Style')).toBeTruthy();
    });
  });
});

// ============================================
// NotificationBadge Component Tests
// ============================================

describe('NotificationBadge Component', () => {
  describe('Basic Rendering', () => {
    it('renders with count', () => {
      const { getByText } = render(<NotificationBadge count={5} />);
      expect(getByText('5')).toBeTruthy();
    });

    it('does not render when count is 0', () => {
      const { queryByText } = render(<NotificationBadge count={0} />);
      expect(queryByText('0')).toBeNull();
    });

    it('does not render when count is negative', () => {
      const { queryByText } = render(<NotificationBadge count={-1} />);
      expect(queryByText('-1')).toBeNull();
    });

    it('renders single digit count', () => {
      const { getByText } = render(<NotificationBadge count={7} />);
      expect(getByText('7')).toBeTruthy();
    });

    it('renders double digit count', () => {
      const { getByText } = render(<NotificationBadge count={42} />);
      expect(getByText('42')).toBeTruthy();
    });
  });

  describe('Max Count Handling', () => {
    it('shows max indicator when count exceeds max', () => {
      const { getByText } = render(<NotificationBadge count={150} max={99} />);
      expect(getByText('99+')).toBeTruthy();
    });

    it('shows exact count when under max', () => {
      const { getByText } = render(<NotificationBadge count={50} max={99} />);
      expect(getByText('50')).toBeTruthy();
    });

    it('uses default max of 99', () => {
      const { getByText } = render(<NotificationBadge count={150} />);
      expect(getByText('99+')).toBeTruthy();
    });

    it('handles custom max value', () => {
      const { getByText } = render(<NotificationBadge count={500} max={999} />);
      expect(getByText('500')).toBeTruthy();
    });

    it('shows max+ when count equals max + 1', () => {
      const { getByText } = render(<NotificationBadge count={100} max={99} />);
      expect(getByText('99+')).toBeTruthy();
    });

    it('handles small custom max', () => {
      const { getByText } = render(<NotificationBadge count={20} max={9} />);
      expect(getByText('9+')).toBeTruthy();
    });
  });

  describe('Custom Styles', () => {
    it('accepts custom style prop', () => {
      const { getByText } = render(
        <NotificationBadge count={3} style={{ top: 5, right: 5 }} />
      );
      expect(getByText('3')).toBeTruthy();
    });

    it('renders without style prop', () => {
      const { getByText } = render(<NotificationBadge count={8} />);
      expect(getByText('8')).toBeTruthy();
    });
  });

  describe('Edge Cases', () => {
    it('handles very large counts', () => {
      const { getByText } = render(<NotificationBadge count={9999} max={999} />);
      expect(getByText('999+')).toBeTruthy();
    });

    it('renders count equal to max', () => {
      const { getByText } = render(<NotificationBadge count={99} max={99} />);
      expect(getByText('99')).toBeTruthy();
    });

    it('handles count of 1', () => {
      const { getByText } = render(<NotificationBadge count={1} />);
      expect(getByText('1')).toBeTruthy();
    });

    it('does not render for zero count', () => {
      const { UNSAFE_root } = render(<NotificationBadge count={0} />);
      // Component returns null, so root should be minimal
      expect(UNSAFE_root).toBeTruthy();
    });

    it('handles multiple notification badges', () => {
      const { getByText } = render(
        <>
          <NotificationBadge count={3} />
          <NotificationBadge count={10} />
          <NotificationBadge count={150} />
        </>
      );

      expect(getByText('3')).toBeTruthy();
      expect(getByText('10')).toBeTruthy();
      expect(getByText('99+')).toBeTruthy();
    });
  });

  describe('Visibility Toggles', () => {
    it('changes visibility based on count updates', () => {
      const { rerender, queryByText } = render(<NotificationBadge count={0} />);
      expect(queryByText('0')).toBeNull();

      rerender(<NotificationBadge count={5} />);
      expect(queryByText('5')).toBeTruthy();

      rerender(<NotificationBadge count={0} />);
      expect(queryByText('0')).toBeNull();
    });

    it('updates display when count changes', () => {
      const { rerender, getByText } = render(<NotificationBadge count={5} />);
      expect(getByText('5')).toBeTruthy();

      rerender(<NotificationBadge count={10} />);
      expect(getByText('10')).toBeTruthy();

      rerender(<NotificationBadge count={150} />);
      expect(getByText('99+')).toBeTruthy();
    });
  });
});

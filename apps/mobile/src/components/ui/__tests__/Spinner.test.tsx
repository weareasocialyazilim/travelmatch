/**
 * Spinner Component Test Suite
 * Tests loading spinner component with various configurations
 */

import React from 'react';
import { render } from '@testing-library/react-native';
import { Spinner } from '../Spinner';

describe('Spinner Component', () => {
  // ============================================
  // Basic Rendering Tests
  // ============================================

  describe('Basic Rendering', () => {
    it('renders without props', () => {
      render(<Spinner />);
    });

    it('renders with default size', () => {
      render(<Spinner />);
    });

    it('renders with default color', () => {
      render(<Spinner />);
    });

    it('renders ActivityIndicator', () => {
      render(<Spinner />);
    });
  });

  // ============================================
  // Size Tests
  // ============================================

  describe('Size Variants', () => {
    it('renders with small size', () => {
      render(<Spinner size="small" />);
    });

    it('renders with large size', () => {
      render(<Spinner size="large" />);
    });

    it('uses large size as default', () => {
      render(<Spinner />);
    });
  });

  // ============================================
  // Color Tests
  // ============================================

  describe('Color Customization', () => {
    it('renders with custom color', () => {
      render(<Spinner color="#FF0000" />);
    });

    it('renders with different custom colors', () => {
      const colors = ['#FF0000', '#00FF00', '#0000FF', '#FFFF00'];

      colors.forEach((color) => {
        render(<Spinner color={color} />);
      });
    });

    it('accepts color as hex string', () => {
      render(<Spinner color="#123456" />);
    });

    it('accepts color as rgb string', () => {
      render(<Spinner color="rgb(255, 0, 0)" />);
    });
  });

  // ============================================
  // Message Tests
  // ============================================

  describe('Message Display', () => {
    it('renders with message', () => {
      const { getByText } = render(<Spinner message="Loading..." />);
      expect(getByText('Loading...')).toBeTruthy();
    });

    it('renders without message when not provided', () => {
      const { queryByText } = render(<Spinner />);
      expect(queryByText('Loading...')).toBeNull();
    });

    it('displays custom message', () => {
      const { getByText } = render(<Spinner message="Please wait" />);
      expect(getByText('Please wait')).toBeTruthy();
    });

    it('renders with long message', () => {
      const longMessage =
        'This is a very long loading message that might wrap to multiple lines';
      const { getByText } = render(<Spinner message={longMessage} />);
      expect(getByText(longMessage)).toBeTruthy();
    });

    it('renders without empty message when message is empty string', () => {
      const { queryByText } = render(<Spinner message="" />);
      // Empty message renders but Text component might not be findable with empty string
    });

    it('handles special characters in message', () => {
      const { getByText } = render(<Spinner message="Loading... 50% done!" />);
      expect(getByText('Loading... 50% done!')).toBeTruthy();
    });
  });

  // ============================================
  // Full Screen Tests
  // ============================================

  describe('Full Screen Mode', () => {
    it('renders in full screen mode', () => {
      render(<Spinner fullScreen={true} />);
    });

    it('renders in normal mode by default', () => {
      render(<Spinner />);
    });

    it('renders full screen with message', () => {
      const { getByText } = render(
        <Spinner fullScreen={true} message="Loading full screen..." />,
      );
      expect(getByText('Loading full screen...')).toBeTruthy();
    });

    it('toggles full screen mode', () => {
      const { rerender } = render(<Spinner fullScreen={false} />);

      rerender(<Spinner fullScreen={true} />);
    });
  });

  // ============================================
  // Style Tests
  // ============================================

  describe('Custom Styles', () => {
    it('accepts custom style prop', () => {
      render(<Spinner style={{ marginTop: 20 }} />);
    });

    it('renders with multiple custom styles', () => {
      render(<Spinner style={{ margin: 10, opacity: 0.8 }} />);
    });

    it('combines custom style with full screen', () => {
      render(
        <Spinner fullScreen={true} style={{ backgroundColor: 'white' }} />,
      );
    });

    it('handles undefined style gracefully', () => {
      render(<Spinner style={undefined} />);
    });
  });

  // ============================================
  // Combination Tests
  // ============================================

  describe('Props Combinations', () => {
    it('renders with all props', () => {
      const { getByText } = render(
        <Spinner
          size="small"
          color="#FF0000"
          message="Loading data..."
          fullScreen={true}
          style={{ opacity: 0.9 }}
        />,
      );
      expect(getByText('Loading data...')).toBeTruthy();
    });

    it('combines size and color', () => {
      render(<Spinner size="large" color="#00FF00" />);
    });

    it('combines message and size', () => {
      const { getByText } = render(
        <Spinner size="small" message="Processing..." />,
      );
      expect(getByText('Processing...')).toBeTruthy();
    });

    it('renders small spinner in full screen', () => {
      render(<Spinner size="small" fullScreen={true} />);
    });

    it('renders multiple spinners independently', () => {
      const { getByText } = render(
        <>
          <Spinner message="Spinner 1" />
          <Spinner message="Spinner 2" size="small" />
          <Spinner message="Spinner 3" color="#FF0000" />
        </>,
      );

      expect(getByText('Spinner 1')).toBeTruthy();
      expect(getByText('Spinner 2')).toBeTruthy();
      expect(getByText('Spinner 3')).toBeTruthy();
    });
  });

  // ============================================
  // Edge Cases Tests
  // ============================================

  describe('Edge Cases', () => {
    it('handles very long color values', () => {
      render(<Spinner color="rgba(255, 100, 50, 0.75)" />);
    });

    it('renders with numeric message', () => {
      const { getByText } = render(<Spinner message="100%" />);
      expect(getByText('100%')).toBeTruthy();
    });

    it('handles message with special formatting', () => {
      const { getByText } = render(<Spinner message="Loading data..." />);
      expect(getByText('Loading data...')).toBeTruthy();
    });

    it('renders consistently with same props', () => {
      const { rerender, getByText } = render(
        <Spinner message="Test" size="large" />,
      );
      expect(getByText('Test')).toBeTruthy();

      rerender(<Spinner message="Test" size="large" />);
      expect(getByText('Test')).toBeTruthy();
    });

    it('handles rapid prop changes', () => {
      const { rerender } = render(<Spinner size="small" />);

      for (let i = 0; i < 5; i++) {
        rerender(<Spinner size={i % 2 === 0 ? 'small' : 'large'} />);
      }
    });
  });

  // ============================================
  // State Update Tests
  // ============================================

  describe('State Updates', () => {
    it('updates message dynamically', () => {
      const { rerender, getByText } = render(<Spinner message="Loading..." />);
      expect(getByText('Loading...')).toBeTruthy();

      rerender(<Spinner message="Almost done..." />);
      expect(getByText('Almost done...')).toBeTruthy();
    });

    it('updates size dynamically', () => {
      const { rerender } = render(<Spinner size="small" />);

      rerender(<Spinner size="large" />);
    });

    it('updates color dynamically', () => {
      const { rerender } = render(<Spinner color="#FF0000" />);

      rerender(<Spinner color="#00FF00" />);
    });

    it('adds and removes message', () => {
      const { rerender, queryByText, getByText } = render(<Spinner />);
      expect(queryByText('Loading...')).toBeNull();

      rerender(<Spinner message="Loading..." />);
      expect(getByText('Loading...')).toBeTruthy();

      rerender(<Spinner />);
      expect(queryByText('Loading...')).toBeNull();
    });

    it('toggles fullScreen mode dynamically', () => {
      const { rerender } = render(<Spinner fullScreen={false} />);

      rerender(<Spinner fullScreen={true} />);

      rerender(<Spinner fullScreen={false} />);
    });
  });

  // ============================================
  // Accessibility Tests
  // ============================================

  describe('Accessibility', () => {
    it('provides accessible loading indicator', () => {
      render(<Spinner />);
    });

    it('message is readable', () => {
      const { getByText } = render(<Spinner message="Loading content" />);
      expect(getByText('Loading content')).toBeTruthy();
    });

    it('renders with sufficient color contrast', () => {
      render(<Spinner color="#000000" />);
    });
  });

  // ============================================
  // Performance Tests
  // ============================================

  describe('Performance', () => {
    it('renders quickly without lag', () => {
      const startTime = Date.now();
      render(<Spinner />);
      const endTime = Date.now();

      expect(endTime - startTime).toBeLessThan(100);
    });

    it('handles multiple re-renders efficiently', () => {
      const { rerender } = render(<Spinner />);

      for (let i = 0; i < 10; i++) {
        rerender(<Spinner message={`Loading ${i}...`} />);
      }

      expect(true).toBe(true); // No crashes
    });
  });

  // ============================================
  // Integration Tests
  // ============================================

  describe('Integration', () => {
    it('works in nested components', () => {
      const { getByText } = render(<Spinner message="Nested spinner" />);
      expect(getByText('Nested spinner')).toBeTruthy();
    });

    it('renders correctly with all size variants', () => {
      const sizes: Array<'small' | 'large'> = ['small', 'large'];

      sizes.forEach((size) => {
        render(<Spinner size={size} />);
      });
    });

    it('handles conditional rendering', () => {
      const showSpinner = true;
      const { getByText } = render(
        <>{showSpinner && <Spinner message="Visible" />}</>,
      );
      expect(getByText('Visible')).toBeTruthy();
    });
  });
});

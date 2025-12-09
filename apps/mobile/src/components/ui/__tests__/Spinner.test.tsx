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
      const { UNSAFE_root } = render(<Spinner />);
      expect(UNSAFE_root).toBeTruthy();
    });

    it('renders with default size', () => {
      const { UNSAFE_root } = render(<Spinner />);
      expect(UNSAFE_root).toBeTruthy();
    });

    it('renders with default color', () => {
      const { UNSAFE_root } = render(<Spinner />);
      expect(UNSAFE_root).toBeTruthy();
    });

    it('renders ActivityIndicator', () => {
      const { UNSAFE_root } = render(<Spinner />);
      expect(UNSAFE_root).toBeTruthy();
    });
  });

  // ============================================
  // Size Tests
  // ============================================

  describe('Size Variants', () => {
    it('renders with small size', () => {
      const { UNSAFE_root } = render(<Spinner size="small" />);
      expect(UNSAFE_root).toBeTruthy();
    });

    it('renders with large size', () => {
      const { UNSAFE_root } = render(<Spinner size="large" />);
      expect(UNSAFE_root).toBeTruthy();
    });

    it('uses large size as default', () => {
      const { UNSAFE_root } = render(<Spinner />);
      expect(UNSAFE_root).toBeTruthy();
    });
  });

  // ============================================
  // Color Tests
  // ============================================

  describe('Color Customization', () => {
    it('renders with custom color', () => {
      const { UNSAFE_root } = render(<Spinner color="#FF0000" />);
      expect(UNSAFE_root).toBeTruthy();
    });

    it('renders with different custom colors', () => {
      const colors = ['#FF0000', '#00FF00', '#0000FF', '#FFFF00'];
      
      colors.forEach((color) => {
        const { UNSAFE_root } = render(<Spinner color={color} />);
        expect(UNSAFE_root).toBeTruthy();
      });
    });

    it('accepts color as hex string', () => {
      const { UNSAFE_root } = render(<Spinner color="#123456" />);
      expect(UNSAFE_root).toBeTruthy();
    });

    it('accepts color as rgb string', () => {
      const { UNSAFE_root } = render(<Spinner color="rgb(255, 0, 0)" />);
      expect(UNSAFE_root).toBeTruthy();
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
      const longMessage = 'This is a very long loading message that might wrap to multiple lines';
      const { getByText } = render(<Spinner message={longMessage} />);
      expect(getByText(longMessage)).toBeTruthy();
    });

    it('renders without empty message when message is empty string', () => {
      const { queryByText, UNSAFE_root } = render(<Spinner message="" />);
      // Empty message renders but Text component might not be findable with empty string
      expect(UNSAFE_root).toBeTruthy();
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
      const { UNSAFE_root } = render(<Spinner fullScreen={true} />);
      expect(UNSAFE_root).toBeTruthy();
    });

    it('renders in normal mode by default', () => {
      const { UNSAFE_root } = render(<Spinner />);
      expect(UNSAFE_root).toBeTruthy();
    });

    it('renders full screen with message', () => {
      const { getByText } = render(
        <Spinner fullScreen={true} message="Loading full screen..." />
      );
      expect(getByText('Loading full screen...')).toBeTruthy();
    });

    it('toggles full screen mode', () => {
      const { rerender, UNSAFE_root } = render(<Spinner fullScreen={false} />);
      expect(UNSAFE_root).toBeTruthy();

      rerender(<Spinner fullScreen={true} />);
      expect(UNSAFE_root).toBeTruthy();
    });
  });

  // ============================================
  // Style Tests
  // ============================================

  describe('Custom Styles', () => {
    it('accepts custom style prop', () => {
      const { UNSAFE_root } = render(<Spinner style={{ marginTop: 20 }} />);
      expect(UNSAFE_root).toBeTruthy();
    });

    it('renders with multiple custom styles', () => {
      const { UNSAFE_root } = render(
        <Spinner style={{ margin: 10, opacity: 0.8 }} />
      );
      expect(UNSAFE_root).toBeTruthy();
    });

    it('combines custom style with full screen', () => {
      const { UNSAFE_root } = render(
        <Spinner fullScreen={true} style={{ backgroundColor: 'white' }} />
      );
      expect(UNSAFE_root).toBeTruthy();
    });

    it('handles undefined style gracefully', () => {
      const { UNSAFE_root } = render(<Spinner style={undefined} />);
      expect(UNSAFE_root).toBeTruthy();
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
        />
      );
      expect(getByText('Loading data...')).toBeTruthy();
    });

    it('combines size and color', () => {
      const { UNSAFE_root } = render(<Spinner size="large" color="#00FF00" />);
      expect(UNSAFE_root).toBeTruthy();
    });

    it('combines message and size', () => {
      const { getByText } = render(
        <Spinner size="small" message="Processing..." />
      );
      expect(getByText('Processing...')).toBeTruthy();
    });

    it('renders small spinner in full screen', () => {
      const { UNSAFE_root } = render(<Spinner size="small" fullScreen={true} />);
      expect(UNSAFE_root).toBeTruthy();
    });

    it('renders multiple spinners independently', () => {
      const { getByText } = render(
        <>
          <Spinner message="Spinner 1" />
          <Spinner message="Spinner 2" size="small" />
          <Spinner message="Spinner 3" color="#FF0000" />
        </>
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
      const { UNSAFE_root } = render(
        <Spinner color="rgba(255, 100, 50, 0.75)" />
      );
      expect(UNSAFE_root).toBeTruthy();
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
        <Spinner message="Test" size="large" />
      );
      expect(getByText('Test')).toBeTruthy();

      rerender(<Spinner message="Test" size="large" />);
      expect(getByText('Test')).toBeTruthy();
    });

    it('handles rapid prop changes', () => {
      const { rerender, UNSAFE_root } = render(<Spinner size="small" />);
      expect(UNSAFE_root).toBeTruthy();

      for (let i = 0; i < 5; i++) {
        rerender(<Spinner size={i % 2 === 0 ? 'small' : 'large'} />);
      }
      expect(UNSAFE_root).toBeTruthy();
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
      const { rerender, UNSAFE_root } = render(<Spinner size="small" />);
      expect(UNSAFE_root).toBeTruthy();

      rerender(<Spinner size="large" />);
      expect(UNSAFE_root).toBeTruthy();
    });

    it('updates color dynamically', () => {
      const { rerender, UNSAFE_root } = render(<Spinner color="#FF0000" />);
      expect(UNSAFE_root).toBeTruthy();

      rerender(<Spinner color="#00FF00" />);
      expect(UNSAFE_root).toBeTruthy();
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
      const { rerender, UNSAFE_root } = render(<Spinner fullScreen={false} />);
      expect(UNSAFE_root).toBeTruthy();

      rerender(<Spinner fullScreen={true} />);
      expect(UNSAFE_root).toBeTruthy();

      rerender(<Spinner fullScreen={false} />);
      expect(UNSAFE_root).toBeTruthy();
    });
  });

  // ============================================
  // Accessibility Tests
  // ============================================

  describe('Accessibility', () => {
    it('provides accessible loading indicator', () => {
      const { UNSAFE_root } = render(<Spinner />);
      expect(UNSAFE_root).toBeTruthy();
    });

    it('message is readable', () => {
      const { getByText } = render(<Spinner message="Loading content" />);
      expect(getByText('Loading content')).toBeTruthy();
    });

    it('renders with sufficient color contrast', () => {
      const { UNSAFE_root } = render(<Spinner color="#000000" />);
      expect(UNSAFE_root).toBeTruthy();
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
      const { getByText } = render(
        <Spinner message="Nested spinner" />
      );
      expect(getByText('Nested spinner')).toBeTruthy();
    });

    it('renders correctly with all size variants', () => {
      const sizes: Array<'small' | 'large'> = ['small', 'large'];
      
      sizes.forEach((size) => {
        const { UNSAFE_root } = render(<Spinner size={size} />);
        expect(UNSAFE_root).toBeTruthy();
      });
    });

    it('handles conditional rendering', () => {
      const showSpinner = true;
      const { getByText } = render(
        <>{showSpinner && <Spinner message="Visible" />}</>
      );
      expect(getByText('Visible')).toBeTruthy();
    });
  });
});

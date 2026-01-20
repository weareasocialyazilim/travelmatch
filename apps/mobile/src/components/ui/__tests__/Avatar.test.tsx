/**
 * Avatar Component Test Suite
 * Tests avatar component with images, initials, badges, and verification
 * Updated to use Avatar (renamed from Avatar)
 */

import React from 'react';
import { render } from '@testing-library/react-native';
import { Avatar as Avatar } from '../Avatar';

describe('Avatar Component', () => {
  // ============================================
  // Basic Rendering Tests
  // ============================================

  describe('Basic Rendering', () => {
    it('renders without props', () => {
      render(<Avatar />);
    });

    it('renders with default size', () => {
      render(<Avatar />);
    });

    it('renders with placeholder when no source provided', () => {
      const { getByText } = render(<Avatar />);
      expect(getByText('?')).toBeTruthy();
    });

    it('renders with accessibility label', () => {
      const { getByLabelText } = render(<Avatar name="John Doe" />);
      expect(getByLabelText("John Doe's avatar")).toBeTruthy();
    });

    it('renders with default accessibility label when no name', () => {
      const { getByLabelText } = render(<Avatar />);
      expect(getByLabelText('User avatar')).toBeTruthy();
    });
  });

  // ============================================
  // Image Source Tests
  // ============================================

  describe('Image Source', () => {
    it('renders with image source', () => {
      render(<Avatar source="https://example.com/avatar.jpg" />);
    });

    it('renders image when source is provided', () => {
      const { queryByText } = render(
        <Avatar source="https://example.com/avatar.jpg" name="John Doe" />,
      );
      // When source is provided, initials should not be shown
      expect(queryByText('JD')).toBeNull();
    });

    it('handles different image URLs', () => {
      const urls = [
        'https://example.com/avatar1.jpg',
        'https://example.com/avatar2.png',
        'https://example.com/avatar3.gif',
      ];

      urls.forEach((url) => {
        render(<Avatar source={url} />);
      });
    });
  });

  // ============================================
  // Initials Fallback Tests
  // ============================================

  describe('Initials Fallback', () => {
    it('displays initials from name', () => {
      const { getByText } = render(<Avatar name="John Doe" />);
      expect(getByText('JD')).toBeTruthy();
    });

    it('displays two chars for single name', () => {
      const { getByText } = render(<Avatar name="John" />);
      expect(getByText('JO')).toBeTruthy(); // Avatar uses first 2 chars
    });

    it('displays two initials for full name', () => {
      const { getByText } = render(<Avatar name="Jane Smith" />);
      expect(getByText('JS')).toBeTruthy();
    });

    it('displays two initials for multiple names', () => {
      const { getByText } = render(<Avatar name="John William Smith" />);
      expect(getByText('JW')).toBeTruthy();
    });

    it('displays uppercase initials', () => {
      const { getByText } = render(<Avatar name="alice bob" />);
      expect(getByText('AB')).toBeTruthy();
    });

    it('displays question mark when no name or source', () => {
      const { getByText } = render(<Avatar />);
      expect(getByText('?')).toBeTruthy();
    });

    it('handles names with special characters', () => {
      const { getByText } = render(<Avatar name="José María" />);
      expect(getByText('JM')).toBeTruthy();
    });

    it('handles very long names', () => {
      const { getByText } = render(
        <Avatar name="Alexander Benjamin Christopher" />,
      );
      expect(getByText('AB')).toBeTruthy();
    });
  });

  // ============================================
  // Size Tests
  // ============================================

  describe('Sizes', () => {
    it('renders extra small size', () => {
      render(<Avatar size="xs" />);
    });

    it('renders small size', () => {
      render(<Avatar size="sm" />);
    });

    it('renders medium size', () => {
      render(<Avatar size="md" />);
    });

    it('renders large size', () => {
      render(<Avatar size="lg" />);
    });

    it('renders extra large size', () => {
      render(<Avatar size="xl" />);
    });

    it('renders all sizes correctly', () => {
      const sizes: Array<'xs' | 'sm' | 'md' | 'lg' | 'xl'> = [
        'xs',
        'sm',
        'md',
        'lg',
        'xl',
      ];

      sizes.forEach((size) => {
        render(<Avatar size={size} name="Test" />);
      });
    });

    it('uses medium as default size', () => {
      render(<Avatar />);
    });
  });

  // ============================================
  // Badge Tests
  // ============================================

  describe('Status Indicator', () => {
    it('renders with status', () => {
      render(<Avatar showStatus={true} status="online" />);
    });

    it('does not render status by default', () => {
      render(<Avatar />);
    });

    it('renders different statuses', () => {
      const statuses: Array<'online' | 'offline' | 'away'> = [
        'online',
        'offline',
        'away',
      ];

      statuses.forEach((status) => {
        render(<Avatar showStatus={true} status={status} />);
      });
    });

    it('renders status with all sizes', () => {
      const sizes: Array<'xs' | 'sm' | 'md' | 'lg' | 'xl'> = [
        'xs',
        'sm',
        'md',
        'lg',
        'xl',
      ];

      sizes.forEach((size) => {
        render(<Avatar size={size} showStatus={true} status="online" />);
      });
    });
  });

  // ============================================
  // Verified Indicator Tests
  // ============================================

  describe('Verified Indicator', () => {
    it('renders with verified checkmark', () => {
      render(<Avatar showVerified={true} />);
    });

    it('does not render verified by default', () => {
      render(<Avatar />);
    });

    it('renders verified with all sizes', () => {
      const sizes: Array<'xs' | 'sm' | 'md' | 'lg' | 'xl'> = [
        'xs',
        'sm',
        'md',
        'lg',
        'xl',
      ];

      sizes.forEach((size) => {
        render(<Avatar size={size} showVerified={true} />);
      });
    });

    it('renders verified with image', () => {
      render(
        <Avatar source="https://example.com/avatar.jpg" showVerified={true} />,
      );
    });

    it('renders verified with initials', () => {
      const { getByText } = render(
        <Avatar name="John Doe" showVerified={true} />,
      );
      expect(getByText('JD')).toBeTruthy();
    });
  });

  // ============================================
  // Combination Tests
  // ============================================

  describe('Combinations', () => {
    it('renders with all props', () => {
      render(
        <Avatar
          source="https://example.com/avatar.jpg"
          name="John Doe"
          size="lg"
          showStatus={true}
          
          showVerified={true}
          style={{ margin: 10 }}
        />,
      );
    });

    it('renders badge and verified together', () => {
      render(<Avatar showStatus={true} showVerified={true} />);
    });

    it('renders image with badge and verified', () => {
      render(
        <Avatar
          source="https://example.com/avatar.jpg"
          showStatus={true}
          showVerified={true}
        />,
      );
    });

    it('renders initials with badge and verified', () => {
      const { getByText } = render(
        <Avatar name="Jane Smith" showStatus={true} showVerified={true} />,
      );
      expect(getByText('JS')).toBeTruthy();
    });

    it('combines size, badge, and verified', () => {
      render(<Avatar size="xl" showStatus={true} showVerified={true} />);
    });

    it('renders multiple avatars independently', () => {
      const { getByText } = render(
        <>
          <Avatar name="Alice" />
          <Avatar name="Bob" size="sm" />
          <Avatar name="Charlie" showStatus={true} />
        </>,
      );

      expect(getByText('AL')).toBeTruthy();
      expect(getByText('BO')).toBeTruthy();
      expect(getByText('CH')).toBeTruthy();
    });
  });

  // ============================================
  // Custom Style Tests
  // ============================================

  describe('Custom Styles', () => {
    it('accepts custom style prop', () => {
      render(<Avatar style={{ marginTop: 20 }} />);
    });

    it('renders with multiple custom styles', () => {
      render(<Avatar style={{ margin: 10, opacity: 0.8 }} />);
    });

    it('handles undefined style gracefully', () => {
      render(<Avatar style={undefined} />);
    });
  });

  // ============================================
  // Edge Cases Tests
  // ============================================

  describe('Edge Cases', () => {
    it('handles empty name string', () => {
      const { getByText } = render(<Avatar name="" />);
      expect(getByText('?')).toBeTruthy();
    });

    it('handles single character name', () => {
      const { getByText } = render(<Avatar name="A" />);
      expect(getByText('A')).toBeTruthy();
    });

    it('handles name with extra spaces', () => {
      const { getByText } = render(<Avatar name="  John   Doe  " />);
      expect(getByText('JD')).toBeTruthy();
    });

    it('handles name with numbers', () => {
      const { getByText } = render(<Avatar name="User123" />);
      expect(getByText('US')).toBeTruthy();
    });

    it('renders with very small size and status', () => {
      render(<Avatar size="xs" showStatus={true} status="online" />);
    });

    it('renders with very large size and all features', () => {
      render(
        <Avatar
          size="xl"
          name="John Doe"
          showStatus={true}
          showVerified={true}
        />,
      );
    });

    it('handles invalid image URL gracefully', () => {
      render(<Avatar source="invalid-url" />);
    });
  });

  // ============================================
  // State Update Tests
  // ============================================

  describe('State Updates', () => {
    it('updates from placeholder to image', () => {
      const { rerender, queryByText } = render(<Avatar name="John Doe" />);
      expect(queryByText('JD')).toBeTruthy();

      rerender(
        <Avatar source="https://example.com/avatar.jpg" name="John Doe" />,
      );
      expect(queryByText('JD')).toBeNull();
    });

    it('updates size dynamically', () => {
      const { rerender } = render(<Avatar size="sm" />);

      rerender(<Avatar size="xl" />);
    });

    it('toggles badge visibility', () => {
      const { rerender } = render(<Avatar showStatus={false} />);

      rerender(<Avatar showStatus={true} />);
    });

    it('toggles verified status', () => {
      const { rerender } = render(<Avatar showVerified={false} />);

      rerender(<Avatar showVerified={true} />);
    });

    it('updates name and initials', () => {
      const { rerender, getByText } = render(<Avatar name="John Doe" />);
      expect(getByText('JD')).toBeTruthy();

      rerender(<Avatar name="Jane Smith" />);
      expect(getByText('JS')).toBeTruthy();
    });
  });

  // ============================================
  // Accessibility Tests
  // ============================================

  describe('Accessibility', () => {
    it('provides accessible label with name', () => {
      const { getByLabelText } = render(<Avatar name="John Doe" />);
      expect(getByLabelText("John Doe's avatar")).toBeTruthy();
    });

    it('provides default accessible label without name', () => {
      const { getByLabelText } = render(<Avatar />);
      expect(getByLabelText('User avatar')).toBeTruthy();
    });

    it('maintains accessibility with image', () => {
      const { getByLabelText } = render(
        <Avatar source="https://example.com/avatar.jpg" name="John Doe" />,
      );
      expect(getByLabelText("John Doe's avatar")).toBeTruthy();
    });

    it('maintains accessibility with all features', () => {
      const { getByLabelText } = render(
        <Avatar name="Jane Smith" showStatus={true} showVerified={true} />,
      );
      expect(getByLabelText("Jane Smith's avatar")).toBeTruthy();
    });
  });

  // ============================================
  // Integration Tests
  // ============================================

  describe('Integration', () => {
    it('works in list rendering', () => {
      const users = [
        { name: 'Alice', source: 'https://example.com/alice.jpg' },
        { name: 'Bob', source: undefined },
        { name: 'Charlie', source: 'https://example.com/charlie.jpg' },
      ];

      const { getByText } = render(
        <>
          {users.map((user, index) => (
            <Avatar key={index} name={user.name} source={user.source} />
          ))}
        </>,
      );

      expect(getByText('BO')).toBeTruthy(); // Bob has no source, shows initials
    });

    it('handles rapid prop changes', () => {
      const { rerender } = render(<Avatar />);

      for (let i = 0; i < 5; i++) {
        rerender(
          <Avatar
            size={i % 2 === 0 ? 'sm' : 'lg'}
            showStatus={i % 2 === 0}
            showVerified={i % 3 === 0}
          />,
        );
      }
    });
  });
});

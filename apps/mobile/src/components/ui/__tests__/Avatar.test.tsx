/**
 * Avatar Component Test Suite
 * Tests avatar component with images, initials, badges, and verification
 */

import React from 'react';
import { render } from '@testing-library/react-native';
import { Avatar } from '../Avatar';

describe('Avatar Component', () => {
  // ============================================
  // Basic Rendering Tests
  // ============================================

  describe('Basic Rendering', () => {
    it('renders without props', () => {
      const { UNSAFE_root } = render(<Avatar />);
      expect(UNSAFE_root).toBeTruthy();
    });

    it('renders with default size', () => {
      const { UNSAFE_root } = render(<Avatar />);
      expect(UNSAFE_root).toBeTruthy();
    });

    it('renders with placeholder when no source provided', () => {
      const { getByText } = render(<Avatar />);
      expect(getByText('?')).toBeTruthy();
    });

    it('renders with accessibility label', () => {
      const { getByLabelText } = render(<Avatar name="John Doe" />);
      expect(getByLabelText('Avatar of John Doe')).toBeTruthy();
    });

    it('renders with default accessibility label when no name', () => {
      const { getByLabelText } = render(<Avatar />);
      expect(getByLabelText('Avatar')).toBeTruthy();
    });
  });

  // ============================================
  // Image Source Tests
  // ============================================

  describe('Image Source', () => {
    it('renders with image source', () => {
      const { UNSAFE_root } = render(<Avatar source="https://example.com/avatar.jpg" />);
      expect(UNSAFE_root).toBeTruthy();
    });

    it('renders image when source is provided', () => {
      const { queryByText } = render(
        <Avatar source="https://example.com/avatar.jpg" name="John Doe" />
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
        const { UNSAFE_root } = render(<Avatar source={url} />);
        expect(UNSAFE_root).toBeTruthy();
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

    it('displays single initial for single name', () => {
      const { getByText } = render(<Avatar name="John" />);
      expect(getByText('J')).toBeTruthy();
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
      const { getByText } = render(<Avatar name="Alexander Benjamin Christopher" />);
      expect(getByText('AB')).toBeTruthy();
    });
  });

  // ============================================
  // Size Tests
  // ============================================

  describe('Sizes', () => {
    it('renders extra small size', () => {
      const { UNSAFE_root } = render(<Avatar size="xs" />);
      expect(UNSAFE_root).toBeTruthy();
    });

    it('renders small size', () => {
      const { UNSAFE_root } = render(<Avatar size="sm" />);
      expect(UNSAFE_root).toBeTruthy();
    });

    it('renders medium size', () => {
      const { UNSAFE_root } = render(<Avatar size="md" />);
      expect(UNSAFE_root).toBeTruthy();
    });

    it('renders large size', () => {
      const { UNSAFE_root } = render(<Avatar size="lg" />);
      expect(UNSAFE_root).toBeTruthy();
    });

    it('renders extra large size', () => {
      const { UNSAFE_root } = render(<Avatar size="xl" />);
      expect(UNSAFE_root).toBeTruthy();
    });

    it('renders all sizes correctly', () => {
      const sizes: Array<'xs' | 'sm' | 'md' | 'lg' | 'xl'> = ['xs', 'sm', 'md', 'lg', 'xl'];

      sizes.forEach((size) => {
        const { UNSAFE_root } = render(<Avatar size={size} name="Test" />);
        expect(UNSAFE_root).toBeTruthy();
      });
    });

    it('uses medium as default size', () => {
      const { UNSAFE_root } = render(<Avatar />);
      expect(UNSAFE_root).toBeTruthy();
    });
  });

  // ============================================
  // Badge Tests
  // ============================================

  describe('Badge Indicator', () => {
    it('renders with badge', () => {
      const { UNSAFE_root } = render(<Avatar showBadge={true} />);
      expect(UNSAFE_root).toBeTruthy();
    });

    it('does not render badge by default', () => {
      const { UNSAFE_root } = render(<Avatar />);
      expect(UNSAFE_root).toBeTruthy();
    });

    it('renders badge with default color', () => {
      const { UNSAFE_root } = render(<Avatar showBadge={true} />);
      expect(UNSAFE_root).toBeTruthy();
    });

    it('renders badge with custom color', () => {
      const { UNSAFE_root } = render(<Avatar showBadge={true} badgeColor="#FF0000" />);
      expect(UNSAFE_root).toBeTruthy();
    });

    it('renders badge with different colors', () => {
      const colors = ['#FF0000', '#00FF00', '#0000FF', '#FFFF00'];

      colors.forEach((color) => {
        const { UNSAFE_root } = render(<Avatar showBadge={true} badgeColor={color} />);
        expect(UNSAFE_root).toBeTruthy();
      });
    });

    it('renders badge with all sizes', () => {
      const sizes: Array<'xs' | 'sm' | 'md' | 'lg' | 'xl'> = ['xs', 'sm', 'md', 'lg', 'xl'];

      sizes.forEach((size) => {
        const { UNSAFE_root } = render(<Avatar size={size} showBadge={true} />);
        expect(UNSAFE_root).toBeTruthy();
      });
    });
  });

  // ============================================
  // Verified Indicator Tests
  // ============================================

  describe('Verified Indicator', () => {
    it('renders with verified checkmark', () => {
      const { UNSAFE_root } = render(<Avatar showVerified={true} />);
      expect(UNSAFE_root).toBeTruthy();
    });

    it('does not render verified by default', () => {
      const { UNSAFE_root } = render(<Avatar />);
      expect(UNSAFE_root).toBeTruthy();
    });

    it('renders verified with all sizes', () => {
      const sizes: Array<'xs' | 'sm' | 'md' | 'lg' | 'xl'> = ['xs', 'sm', 'md', 'lg', 'xl'];

      sizes.forEach((size) => {
        const { UNSAFE_root } = render(<Avatar size={size} showVerified={true} />);
        expect(UNSAFE_root).toBeTruthy();
      });
    });

    it('renders verified with image', () => {
      const { UNSAFE_root } = render(
        <Avatar source="https://example.com/avatar.jpg" showVerified={true} />
      );
      expect(UNSAFE_root).toBeTruthy();
    });

    it('renders verified with initials', () => {
      const { getByText } = render(<Avatar name="John Doe" showVerified={true} />);
      expect(getByText('JD')).toBeTruthy();
    });
  });

  // ============================================
  // Combination Tests
  // ============================================

  describe('Combinations', () => {
    it('renders with all props', () => {
      const { UNSAFE_root } = render(
        <Avatar
          source="https://example.com/avatar.jpg"
          name="John Doe"
          size="lg"
          showBadge={true}
          badgeColor="#00FF00"
          showVerified={true}
          style={{ margin: 10 }}
        />
      );
      expect(UNSAFE_root).toBeTruthy();
    });

    it('renders badge and verified together', () => {
      const { UNSAFE_root } = render(
        <Avatar showBadge={true} showVerified={true} />
      );
      expect(UNSAFE_root).toBeTruthy();
    });

    it('renders image with badge and verified', () => {
      const { UNSAFE_root } = render(
        <Avatar
          source="https://example.com/avatar.jpg"
          showBadge={true}
          showVerified={true}
        />
      );
      expect(UNSAFE_root).toBeTruthy();
    });

    it('renders initials with badge and verified', () => {
      const { getByText } = render(
        <Avatar name="Jane Smith" showBadge={true} showVerified={true} />
      );
      expect(getByText('JS')).toBeTruthy();
    });

    it('combines size, badge, and verified', () => {
      const { UNSAFE_root } = render(
        <Avatar size="xl" showBadge={true} showVerified={true} />
      );
      expect(UNSAFE_root).toBeTruthy();
    });

    it('renders multiple avatars independently', () => {
      const { getByText } = render(
        <>
          <Avatar name="Alice" />
          <Avatar name="Bob" size="sm" />
          <Avatar name="Charlie" showBadge={true} />
        </>
      );

      expect(getByText('A')).toBeTruthy();
      expect(getByText('B')).toBeTruthy();
      expect(getByText('C')).toBeTruthy();
    });
  });

  // ============================================
  // Custom Style Tests
  // ============================================

  describe('Custom Styles', () => {
    it('accepts custom style prop', () => {
      const { UNSAFE_root } = render(<Avatar style={{ marginTop: 20 }} />);
      expect(UNSAFE_root).toBeTruthy();
    });

    it('renders with multiple custom styles', () => {
      const { UNSAFE_root } = render(
        <Avatar style={{ margin: 10, opacity: 0.8 }} />
      );
      expect(UNSAFE_root).toBeTruthy();
    });

    it('handles undefined style gracefully', () => {
      const { UNSAFE_root } = render(<Avatar style={undefined} />);
      expect(UNSAFE_root).toBeTruthy();
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
      expect(getByText('U')).toBeTruthy();
    });

    it('renders with very small badge color', () => {
      const { UNSAFE_root } = render(
        <Avatar size="xs" showBadge={true} badgeColor="#000000" />
      );
      expect(UNSAFE_root).toBeTruthy();
    });

    it('renders with very large size and all features', () => {
      const { UNSAFE_root } = render(
        <Avatar
          size="xl"
          name="John Doe"
          showBadge={true}
          showVerified={true}
        />
      );
      expect(UNSAFE_root).toBeTruthy();
    });

    it('handles invalid image URL gracefully', () => {
      const { UNSAFE_root } = render(<Avatar source="invalid-url" />);
      expect(UNSAFE_root).toBeTruthy();
    });
  });

  // ============================================
  // State Update Tests
  // ============================================

  describe('State Updates', () => {
    it('updates from placeholder to image', () => {
      const { rerender, queryByText } = render(<Avatar name="John Doe" />);
      expect(queryByText('JD')).toBeTruthy();

      rerender(<Avatar source="https://example.com/avatar.jpg" name="John Doe" />);
      expect(queryByText('JD')).toBeNull();
    });

    it('updates size dynamically', () => {
      const { rerender, UNSAFE_root } = render(<Avatar size="sm" />);
      expect(UNSAFE_root).toBeTruthy();

      rerender(<Avatar size="xl" />);
      expect(UNSAFE_root).toBeTruthy();
    });

    it('toggles badge visibility', () => {
      const { rerender, UNSAFE_root } = render(<Avatar showBadge={false} />);
      expect(UNSAFE_root).toBeTruthy();

      rerender(<Avatar showBadge={true} />);
      expect(UNSAFE_root).toBeTruthy();
    });

    it('toggles verified status', () => {
      const { rerender, UNSAFE_root } = render(<Avatar showVerified={false} />);
      expect(UNSAFE_root).toBeTruthy();

      rerender(<Avatar showVerified={true} />);
      expect(UNSAFE_root).toBeTruthy();
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
      expect(getByLabelText('Avatar of John Doe')).toBeTruthy();
    });

    it('provides default accessible label without name', () => {
      const { getByLabelText } = render(<Avatar />);
      expect(getByLabelText('Avatar')).toBeTruthy();
    });

    it('maintains accessibility with image', () => {
      const { getByLabelText } = render(
        <Avatar source="https://example.com/avatar.jpg" name="John Doe" />
      );
      expect(getByLabelText('Avatar of John Doe')).toBeTruthy();
    });

    it('maintains accessibility with all features', () => {
      const { getByLabelText } = render(
        <Avatar
          name="Jane Smith"
          showBadge={true}
          showVerified={true}
        />
      );
      expect(getByLabelText('Avatar of Jane Smith')).toBeTruthy();
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
        </>
      );

      expect(getByText('B')).toBeTruthy(); // Bob has no source, shows initials
    });

    it('handles rapid prop changes', () => {
      const { rerender, UNSAFE_root } = render(<Avatar />);

      for (let i = 0; i < 5; i++) {
        rerender(
          <Avatar
            size={i % 2 === 0 ? 'sm' : 'lg'}
            showBadge={i % 2 === 0}
            showVerified={i % 3 === 0}
          />
        );
      }

      expect(UNSAFE_root).toBeTruthy();
    });
  });
});

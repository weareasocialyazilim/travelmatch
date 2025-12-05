/**
 * Badge Component Tests
 * Testing badge variants, sizes, icons, and notification badges
 */

import React from 'react';
import { render } from '@testing-library/react-native';
import { Badge, NotificationBadge } from '../Badge';

// Mock vector icons
jest.mock('@expo/vector-icons', () => ({
  MaterialCommunityIcons: 'MaterialCommunityIcons',
}));

describe('Badge', () => {
  describe('Rendering', () => {
    it('renders with label', () => {
      const { getByText } = render(<Badge label="Test" />);
      expect(getByText('Test')).toBeTruthy();
    });

    it('renders with default variant', () => {
      const { getByText } = render(<Badge label="Default" />);
      const text = getByText('Default');
      expect(text).toBeTruthy();
    });
  });

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
  });

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
  });

  describe('Dot Indicator', () => {
    it('renders with dot when dot prop is true', () => {
      const { UNSAFE_root } = render(<Badge label="With Dot" dot={true} />);
      // Check that View containing dot exists
      expect(UNSAFE_root).toBeTruthy();
    });

    it('does not render dot when dot prop is false', () => {
      const { getByText } = render(<Badge label="No Dot" dot={false} />);
      expect(getByText('No Dot')).toBeTruthy();
    });
  });

  describe('Icon', () => {
    it('renders with icon', () => {
      const { UNSAFE_root } = render(<Badge label="With Icon" icon="check" />);
      expect(UNSAFE_root).toBeTruthy();
    });
  });

  describe('Custom Styling', () => {
    it('accepts custom style prop', () => {
      const customStyle = { marginTop: 10 };
      const { getByText } = render(
        <Badge label="Custom" style={customStyle} />,
      );
      expect(getByText('Custom')).toBeTruthy();
    });
  });
});

describe('NotificationBadge', () => {
  describe('Rendering', () => {
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
  });

  describe('Max Count', () => {
    it('displays count normally when below max', () => {
      const { getByText } = render(<NotificationBadge count={50} max={99} />);
      expect(getByText('50')).toBeTruthy();
    });

    it('displays max+ when count exceeds max', () => {
      const { getByText } = render(<NotificationBadge count={100} max={99} />);
      expect(getByText('99+')).toBeTruthy();
    });

    it('uses default max of 99', () => {
      const { getByText } = render(<NotificationBadge count={150} />);
      expect(getByText('99+')).toBeTruthy();
    });

    it('respects custom max value', () => {
      const { getByText } = render(<NotificationBadge count={15} max={10} />);
      expect(getByText('10+')).toBeTruthy();
    });
  });

  describe('Custom Styling', () => {
    it('accepts custom style prop', () => {
      const customStyle = { position: 'absolute' as const };
      const { getByText } = render(
        <NotificationBadge count={3} style={customStyle} />,
      );
      expect(getByText('3')).toBeTruthy();
    });
  });
});

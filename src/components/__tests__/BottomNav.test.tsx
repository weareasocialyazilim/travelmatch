/**
 * BottomNav Component Tests
 * Tests for the bottom navigation bar
 */
/* eslint-disable @typescript-eslint/no-var-requires */

import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';

// Mock navigation
const mockNavigate = jest.fn();
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({
    navigate: mockNavigate,
  }),
}));

// Mock haptics
jest.mock('../../hooks/useHaptics', () => ({
  useHaptics: () => ({
    impact: jest.fn(),
  }),
}));

// Mock vector icons
jest.mock('@expo/vector-icons', () => ({
  MaterialCommunityIcons: 'MaterialCommunityIcons',
}));

// Mock colors
jest.mock('../../constants/colors', () => ({
  COLORS: {
    primary: '#3B82F6',
    textSecondary: '#6B6B6B',
    white: '#FFFFFF',
    background: '#FFFFFF',
    border: '#E5E5E5',
    error: '#EF4444',
  },
}));

import BottomNav from '../BottomNav';

describe('BottomNav', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders all navigation tabs', () => {
      const { getByText } = render(<BottomNav activeTab="Discover" />);

      expect(getByText('Discover')).toBeTruthy();
      expect(getByText('Requests')).toBeTruthy();
      expect(getByText('Messages')).toBeTruthy();
      expect(getByText('Profile')).toBeTruthy();
    });

    it('renders with Discover tab active', () => {
      const { getByLabelText } = render(<BottomNav activeTab="Discover" />);

      const discoverTab = getByLabelText('Discover tab');
      expect(discoverTab.props.accessibilityState.selected).toBe(true);
    });

    it('renders with Requests tab active', () => {
      const { getByLabelText } = render(<BottomNav activeTab="Requests" />);

      const requestsTab = getByLabelText('Requests tab');
      expect(requestsTab.props.accessibilityState.selected).toBe(true);
    });

    it('renders with Messages tab active', () => {
      const { getByLabelText } = render(<BottomNav activeTab="Messages" />);

      const messagesTab = getByLabelText('Messages tab');
      expect(messagesTab.props.accessibilityState.selected).toBe(true);
    });

    it('renders with Profile tab active', () => {
      const { getByLabelText } = render(<BottomNav activeTab="Profile" />);

      const profileTab = getByLabelText('Profile tab');
      expect(profileTab.props.accessibilityState.selected).toBe(true);
    });
  });

  describe('Badge Display', () => {
    it('shows requests badge when count > 0', () => {
      const { getByText } = render(
        <BottomNav activeTab="Discover" requestsBadge={5} />,
      );

      expect(getByText('5')).toBeTruthy();
    });

    it('shows messages badge when count > 0', () => {
      const { getByText } = render(
        <BottomNav activeTab="Discover" messagesBadge={3} />,
      );

      expect(getByText('3')).toBeTruthy();
    });

    it('does not show badge when count is 0', () => {
      const { queryByText } = render(
        <BottomNav activeTab="Discover" requestsBadge={0} messagesBadge={0} />,
      );

      // No badge numbers should be visible
      expect(queryByText('0')).toBeNull();
    });
  });

  describe('Navigation', () => {
    it('navigates to Discover when Discover tab pressed', () => {
      const { getByLabelText } = render(<BottomNav activeTab="Profile" />);

      fireEvent.press(getByLabelText('Discover tab'));

      expect(mockNavigate).toHaveBeenCalledWith('Discover');
    });

    it('navigates to Requests when Requests tab pressed', () => {
      const { getByLabelText } = render(<BottomNav activeTab="Discover" />);

      fireEvent.press(getByLabelText('Requests tab'));

      expect(mockNavigate).toHaveBeenCalledWith('Requests');
    });

    it('navigates to Messages when Messages tab pressed', () => {
      const { getByLabelText } = render(<BottomNav activeTab="Discover" />);

      fireEvent.press(getByLabelText('Messages tab'));

      expect(mockNavigate).toHaveBeenCalledWith('Messages');
    });

    it('navigates to Profile when Profile tab pressed', () => {
      const { getByLabelText } = render(<BottomNav activeTab="Discover" />);

      fireEvent.press(getByLabelText('Profile tab'));

      expect(mockNavigate).toHaveBeenCalledWith('Profile');
    });
  });

  describe('Accessibility', () => {
    it('has tab role for navigation items', () => {
      const { getByLabelText } = render(<BottomNav activeTab="Discover" />);

      expect(getByLabelText('Discover tab').props.accessibilityRole).toBe(
        'tab',
      );
      expect(getByLabelText('Requests tab').props.accessibilityRole).toBe(
        'tab',
      );
    });

    it('has accessibility hints', () => {
      const { getByLabelText } = render(<BottomNav activeTab="Discover" />);

      expect(
        getByLabelText('Discover tab').props.accessibilityHint,
      ).toBeDefined();
    });
  });
});

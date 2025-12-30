// Unmock BottomNav since jest.setup.afterEnv.js mocks it globally
// Note: Using relative path since that's what Jest resolves
jest.unmock('../BottomNav');

// Mock expo-blur as it's not available in test environment
jest.mock('expo-blur', () => {
  const React = require('react');
  const { View } = require('react-native');
  return {
    BlurView: (props: { children?: React.ReactNode }) =>
      React.createElement(View, props, props.children),
  };
});

// Mock expo-linear-gradient
jest.mock('expo-linear-gradient', () => {
  const React = require('react');
  const { View } = require('react-native');
  return {
    LinearGradient: (props: { children?: React.ReactNode }) =>
      React.createElement(View, props, props.children),
  };
});

// Mock expo-haptics
jest.mock('expo-haptics', () => ({
  impactAsync: jest.fn(),
  ImpactFeedbackStyle: {
    Light: 'light',
    Medium: 'medium',
    Heavy: 'heavy',
  },
}));

import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';

import BottomNav from '../BottomNav';

// Set up navigation mock via global test utility
const mockNavigate = jest.fn();

// Override the global navigation mock for this test file
beforeAll(() => {
  global.__TEST_NAVIGATION__ = {
    navigate: mockNavigate,
    goBack: jest.fn(),
    replace: jest.fn(),
    dispatch: jest.fn(),
    setOptions: jest.fn(),
    addListener: jest.fn(() => jest.fn()),
  };
});

afterAll(() => {
  delete global.__TEST_NAVIGATION__;
});

describe('BottomNav', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders all 5 tabs', () => {
      const { getByText } = render(<BottomNav activeTab="Discover" />);
      // Component uses Turkish labels: Dilekler, Hediyeler, Mesajlar, Profil
      expect(getByText('Dilekler')).toBeTruthy();
      expect(getByText('Hediyeler')).toBeTruthy();
      expect(getByText('Mesajlar')).toBeTruthy();
      expect(getByText('Profil')).toBeTruthy();
    });

    it('renders all tab icons', () => {
      const { UNSAFE_getAllByType } = render(
        <BottomNav activeTab="Discover" />,
      );
      const { MaterialCommunityIcons } = require('@expo/vector-icons');
      const icons = UNSAFE_getAllByType(MaterialCommunityIcons);
      // 5 icons (Discover, Requests, Create button, Messages, Profile)
      expect(icons.length).toBe(5);
    });

    it('highlights active tab with filled icon', () => {
      const { UNSAFE_getAllByType } = render(
        <BottomNav activeTab="Discover" />,
      );
      const { MaterialCommunityIcons } = require('@expo/vector-icons');
      const icons = UNSAFE_getAllByType(MaterialCommunityIcons);
      expect(icons[0].props.name).toBe('gift'); // Active = filled (Wishes tab)
    });

    it('shows outlined icon for inactive tabs', () => {
      const { UNSAFE_getAllByType } = render(
        <BottomNav activeTab="Discover" />,
      );
      const { MaterialCommunityIcons } = require('@expo/vector-icons');
      const icons = UNSAFE_getAllByType(MaterialCommunityIcons);
      expect(icons[1].props.name).toBe('heart-outline'); // Inactive = outline (Gifts tab)
      expect(icons[3].props.name).toBe('chat-outline');
      expect(icons[4].props.name).toBe('account-outline');
    });

    it('renders create button with plus icon', () => {
      const { UNSAFE_getAllByType } = render(
        <BottomNav activeTab="Discover" />,
      );
      const { MaterialCommunityIcons } = require('@expo/vector-icons');
      const icons = UNSAFE_getAllByType(MaterialCommunityIcons);
      expect(icons[2].props.name).toBe('plus');
    });

    it('has correct accessibility roles', () => {
      const { UNSAFE_queryAllByType } = render(
        <BottomNav activeTab="Discover" />,
      );
      const { TouchableOpacity } = require('react-native');
      const buttons = UNSAFE_queryAllByType(TouchableOpacity);
      // Filter by accessibilityRole='tab'
      const tabs = buttons.filter(
        (btn: { props: { accessibilityRole?: string } }) => btn.props.accessibilityRole === 'tab',
      );
      expect(tabs.length).toBe(5);
    });

    it('has correct accessibility state for active tab', () => {
      const { getByLabelText } = render(<BottomNav activeTab="Discover" />);
      const discoverTab = getByLabelText('Dilekler tab');
      expect(discoverTab.props.accessibilityState.selected).toBe(true);
    });

    it('has correct accessibility state for inactive tabs', () => {
      const { getByLabelText } = render(<BottomNav activeTab="Discover" />);
      const requestsTab = getByLabelText('Hediyeler tab');
      expect(requestsTab.props.accessibilityState.selected).toBe(false);
    });
  });

  describe('Badge Display', () => {
    it('shows requests badge when count > 0', () => {
      const { getByText } = render(
        <BottomNav activeTab="Discover" requestsBadge={3} />,
      );
      expect(getByText('3')).toBeTruthy();
    });

    it('shows messages badge when count > 0', () => {
      const { getByText } = render(
        <BottomNav activeTab="Discover" messagesBadge={5} />,
      );
      expect(getByText('5')).toBeTruthy();
    });

    it('does not show badge when count is 0', () => {
      const { queryByText } = render(
        <BottomNav activeTab="Discover" requestsBadge={0} messagesBadge={0} />,
      );
      // No badge numbers should be visible
      expect(queryByText('0')).toBeNull();
    });

    it('shows "9+" for requests badge when count > 9', () => {
      const { getByText } = render(
        <BottomNav activeTab="Discover" requestsBadge={15} />,
      );
      expect(getByText('9+')).toBeTruthy();
    });

    it('shows "9+" for messages badge when count > 9', () => {
      const { getByText } = render(
        <BottomNav activeTab="Discover" messagesBadge={42} />,
      );
      expect(getByText('9+')).toBeTruthy();
    });

    it('shows both badges simultaneously', () => {
      const { getByText } = render(
        <BottomNav activeTab="Discover" requestsBadge={3} messagesBadge={7} />,
      );
      expect(getByText('3')).toBeTruthy();
      expect(getByText('7')).toBeTruthy();
    });

    it('handles exactly 9 requests badge', () => {
      const { getByText } = render(
        <BottomNav activeTab="Discover" requestsBadge={9} />,
      );
      expect(getByText('9')).toBeTruthy();
    });

    it('handles exactly 10 requests badge as 9+', () => {
      const { getByText } = render(
        <BottomNav activeTab="Discover" requestsBadge={10} />,
      );
      expect(getByText('9+')).toBeTruthy();
    });
  });

  describe('Tab Navigation', () => {
    it('navigates to Discover when Discover tab pressed', () => {
      const { getByLabelText } = render(<BottomNav activeTab="Profile" />);
      const discoverTab = getByLabelText('Dilekler tab');
      fireEvent.press(discoverTab);
      expect(mockNavigate).toHaveBeenCalledWith('Discover');
    });

    it('navigates to Requests when Requests tab pressed', () => {
      const { getByLabelText } = render(<BottomNav activeTab="Discover" />);
      const requestsTab = getByLabelText('Hediyeler tab');
      fireEvent.press(requestsTab);
      expect(mockNavigate).toHaveBeenCalledWith('Requests');
    });

    it('navigates to CreateMoment when Create button pressed', () => {
      const { getByLabelText } = render(<BottomNav activeTab="Discover" />);
      const createButton = getByLabelText('Yeni dilek oluştur');
      fireEvent.press(createButton);
      expect(mockNavigate).toHaveBeenCalledWith('CreateMoment');
    });

    it('navigates to Messages when Messages tab pressed', () => {
      const { getByLabelText } = render(<BottomNav activeTab="Discover" />);
      const messagesTab = getByLabelText('Mesajlar tab');
      fireEvent.press(messagesTab);
      expect(mockNavigate).toHaveBeenCalledWith('Messages');
    });

    it('navigates to Profile when Profile tab pressed', () => {
      const { getByLabelText } = render(<BottomNav activeTab="Discover" />);
      const profileTab = getByLabelText('Profil tab');
      fireEvent.press(profileTab);
      expect(mockNavigate).toHaveBeenCalledWith('Profile');
    });

    it('allows pressing same tab again', () => {
      const { getByLabelText } = render(<BottomNav activeTab="Discover" />);
      const discoverTab = getByLabelText('Dilekler tab');
      fireEvent.press(discoverTab);
      expect(mockNavigate).toHaveBeenCalledWith('Discover');
    });
  });

  describe('Active Tab States', () => {
    it('highlights Discover when active', () => {
      const { getByLabelText } = render(<BottomNav activeTab="Discover" />);
      const discoverTab = getByLabelText('Dilekler tab');
      expect(discoverTab.props.accessibilityState.selected).toBe(true);
    });

    it('highlights Requests when active', () => {
      const { getByLabelText } = render(<BottomNav activeTab="Requests" />);
      const requestsTab = getByLabelText('Hediyeler tab');
      expect(requestsTab.props.accessibilityState.selected).toBe(true);
    });

    it('highlights Create when active', () => {
      const { getByLabelText } = render(<BottomNav activeTab="Create" />);
      const createButton = getByLabelText('Yeni dilek oluştur');
      expect(createButton.props.accessibilityState.selected).toBe(true);
    });

    it('highlights Messages when active', () => {
      const { getByLabelText } = render(<BottomNav activeTab="Messages" />);
      const messagesTab = getByLabelText('Mesajlar tab');
      expect(messagesTab.props.accessibilityState.selected).toBe(true);
    });

    it('highlights Profile when active', () => {
      const { getByLabelText } = render(<BottomNav activeTab="Profile" />);
      const profileTab = getByLabelText('Profil tab');
      expect(profileTab.props.accessibilityState.selected).toBe(true);
    });

    it('shows filled icon for active Requests tab', () => {
      const { UNSAFE_getAllByType } = render(
        <BottomNav activeTab="Requests" />,
      );
      const { MaterialCommunityIcons } = require('@expo/vector-icons');
      const icons = UNSAFE_getAllByType(MaterialCommunityIcons);
      expect(icons[1].props.name).toBe('heart'); // Gifts tab uses heart icon now
    });

    it('shows filled icon for active Messages tab', () => {
      const { UNSAFE_getAllByType } = render(
        <BottomNav activeTab="Messages" />,
      );
      const { MaterialCommunityIcons } = require('@expo/vector-icons');
      const icons = UNSAFE_getAllByType(MaterialCommunityIcons);
      expect(icons[3].props.name).toBe('chat');
    });

    it('shows filled icon for active Profile tab', () => {
      const { UNSAFE_getAllByType } = render(<BottomNav activeTab="Profile" />);
      const { MaterialCommunityIcons } = require('@expo/vector-icons');
      const icons = UNSAFE_getAllByType(MaterialCommunityIcons);
      expect(icons[4].props.name).toBe('account');
    });
  });

  describe('Edge Cases', () => {
    it('handles rapid tab switching', () => {
      const { getByLabelText } = render(<BottomNav activeTab="Discover" />);

      fireEvent.press(getByLabelText('Hediyeler tab'));
      fireEvent.press(getByLabelText('Mesajlar tab'));
      fireEvent.press(getByLabelText('Profil tab'));

      expect(mockNavigate).toHaveBeenCalledTimes(3);
    });

    it('handles badge with undefined values', () => {
      const { queryByText } = render(
        <BottomNav
          activeTab="Discover"
          requestsBadge={undefined}
          messagesBadge={undefined}
        />,
      );
      // Should not crash, no badges shown
      expect(queryByText('0')).toBeNull();
    });

    it('handles very large badge numbers', () => {
      const { getByText } = render(
        <BottomNav activeTab="Discover" requestsBadge={999} />,
      );
      expect(getByText('9+')).toBeTruthy();
    });

    it('re-renders when activeTab changes', () => {
      const { rerender, getByLabelText } = render(
        <BottomNav activeTab="Discover" />,
      );
      expect(
        getByLabelText('Dilekler tab').props.accessibilityState.selected,
      ).toBe(true);

      rerender(<BottomNav activeTab="Profile" />);
      expect(
        getByLabelText('Profil tab').props.accessibilityState.selected,
      ).toBe(true);
      expect(
        getByLabelText('Dilekler tab').props.accessibilityState.selected,
      ).toBe(false);
    });

    it('re-renders when badge counts change', () => {
      const { rerender, getByText, queryByText } = render(
        <BottomNav activeTab="Discover" requestsBadge={0} />,
      );
      expect(queryByText('5')).toBeNull();

      rerender(<BottomNav activeTab="Discover" requestsBadge={5} />);
      expect(getByText('5')).toBeTruthy();
    });

    it('handles all tabs having badges', () => {
      const { getByText } = render(
        <BottomNav activeTab="Discover" requestsBadge={2} messagesBadge={8} />,
      );
      expect(getByText('2')).toBeTruthy();
      expect(getByText('8')).toBeTruthy();
    });
  });
});

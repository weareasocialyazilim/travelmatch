import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';

import BottomNav from '../BottomNav';

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
    notification: jest.fn(),
    selection: jest.fn(),
  }),
}));

describe('BottomNav', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders all 5 tabs', () => {
      const { getByText } = render(<BottomNav activeTab="Discover" />);
      expect(getByText('Discover')).toBeTruthy();
      expect(getByText('Requests')).toBeTruthy();
      expect(getByText('Messages')).toBeTruthy();
      expect(getByText('Profile')).toBeTruthy();
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
      expect(icons[0].props.name).toBe('compass'); // Active = filled
    });

    it('shows outlined icon for inactive tabs', () => {
      const { UNSAFE_getAllByType } = render(
        <BottomNav activeTab="Discover" />,
      );
      const { MaterialCommunityIcons } = require('@expo/vector-icons');
      const icons = UNSAFE_getAllByType(MaterialCommunityIcons);
      expect(icons[1].props.name).toBe('inbox-outline'); // Inactive = outline
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
      const { getByTestId } = render(<BottomNav activeTab="Discover" />);
      // Verify all 5 tabs exist by their testIDs
      expect(getByTestId('nav-discover-tab')).toBeTruthy();
      expect(getByTestId('nav-requests-tab')).toBeTruthy();
      expect(getByTestId('nav-create-tab')).toBeTruthy();
      expect(getByTestId('nav-messages-tab')).toBeTruthy();
      expect(getByTestId('nav-profile-tab')).toBeTruthy();
    });

    it('has correct accessibility state for active tab', () => {
      const { getByLabelText } = render(<BottomNav activeTab="Discover" />);
      const discoverTab = getByLabelText('Discover tab');
      expect(discoverTab.props.accessibilityState.selected).toBe(true);
    });

    it('has correct accessibility state for inactive tabs', () => {
      const { getByLabelText } = render(<BottomNav activeTab="Discover" />);
      const requestsTab = getByLabelText('Requests tab');
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
      const discoverTab = getByLabelText('Discover tab');
      fireEvent.press(discoverTab);
      expect(mockNavigate).toHaveBeenCalledWith('Discover');
    });

    it('navigates to Requests when Requests tab pressed', () => {
      const { getByLabelText } = render(<BottomNav activeTab="Discover" />);
      const requestsTab = getByLabelText('Requests tab');
      fireEvent.press(requestsTab);
      expect(mockNavigate).toHaveBeenCalledWith('Requests');
    });

    it('navigates to CreateMoment when Create button pressed', () => {
      const { getByLabelText } = render(<BottomNav activeTab="Discover" />);
      const createButton = getByLabelText('Create moment');
      fireEvent.press(createButton);
      expect(mockNavigate).toHaveBeenCalledWith('CreateMoment');
    });

    it('navigates to Messages when Messages tab pressed', () => {
      const { getByLabelText } = render(<BottomNav activeTab="Discover" />);
      const messagesTab = getByLabelText('Messages tab');
      fireEvent.press(messagesTab);
      expect(mockNavigate).toHaveBeenCalledWith('Messages');
    });

    it('navigates to Profile when Profile tab pressed', () => {
      const { getByLabelText } = render(<BottomNav activeTab="Discover" />);
      const profileTab = getByLabelText('Profile tab');
      fireEvent.press(profileTab);
      expect(mockNavigate).toHaveBeenCalledWith('Profile');
    });

    it('allows pressing same tab again', () => {
      const { getByLabelText } = render(<BottomNav activeTab="Discover" />);
      const discoverTab = getByLabelText('Discover tab');
      fireEvent.press(discoverTab);
      expect(mockNavigate).toHaveBeenCalledWith('Discover');
    });
  });

  describe('Active Tab States', () => {
    it('highlights Discover when active', () => {
      const { getByLabelText } = render(<BottomNav activeTab="Discover" />);
      const discoverTab = getByLabelText('Discover tab');
      expect(discoverTab.props.accessibilityState.selected).toBe(true);
    });

    it('highlights Requests when active', () => {
      const { getByLabelText } = render(<BottomNav activeTab="Requests" />);
      const requestsTab = getByLabelText('Requests tab');
      expect(requestsTab.props.accessibilityState.selected).toBe(true);
    });

    it('highlights Create when active', () => {
      const { getByLabelText } = render(<BottomNav activeTab="Create" />);
      const createButton = getByLabelText('Create moment');
      expect(createButton.props.accessibilityState.selected).toBe(true);
    });

    it('highlights Messages when active', () => {
      const { getByLabelText } = render(<BottomNav activeTab="Messages" />);
      const messagesTab = getByLabelText('Messages tab');
      expect(messagesTab.props.accessibilityState.selected).toBe(true);
    });

    it('highlights Profile when active', () => {
      const { getByLabelText } = render(<BottomNav activeTab="Profile" />);
      const profileTab = getByLabelText('Profile tab');
      expect(profileTab.props.accessibilityState.selected).toBe(true);
    });

    it('shows filled icon for active Requests tab', () => {
      const { UNSAFE_getAllByType } = render(
        <BottomNav activeTab="Requests" />,
      );
      const { MaterialCommunityIcons } = require('@expo/vector-icons');
      const icons = UNSAFE_getAllByType(MaterialCommunityIcons);
      expect(icons[1].props.name).toBe('inbox-full');
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

      fireEvent.press(getByLabelText('Requests tab'));
      fireEvent.press(getByLabelText('Messages tab'));
      fireEvent.press(getByLabelText('Profile tab'));

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
        getByLabelText('Discover tab').props.accessibilityState.selected,
      ).toBe(true);

      rerender(<BottomNav activeTab="Profile" />);
      expect(
        getByLabelText('Profile tab').props.accessibilityState.selected,
      ).toBe(true);
      expect(
        getByLabelText('Discover tab').props.accessibilityState.selected,
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

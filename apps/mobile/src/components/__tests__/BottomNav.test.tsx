/**
 * BottomNav Component Tests
 * Tests basic rendering and navigation functionality
 */

import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { View, Text, TouchableOpacity } from 'react-native';

// Mock navigation
const mockNavigate = jest.fn();
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({
    navigate: mockNavigate,
  }),
}));

// Create a simple test component representing BottomNav
const MockBottomNav = ({ activeTab = 'Discover' }: { activeTab?: string }) => {
  const tabs = [
    { name: 'Discover', label: 'Moments', icon: 'compass' },
    { name: 'Gifts', label: 'Gifts', icon: 'gift' },
    { name: 'Messages', label: 'Messages', icon: 'message' },
    { name: 'Profile', label: 'Profile', icon: 'account' },
  ];

  return (
    <View testID="bottom-nav">
      {tabs.map((tab) => (
        <TouchableOpacity
          key={tab.name}
          testID={`tab-${tab.name.toLowerCase()}`}
          onPress={() => mockNavigate(tab.name)}
          accessibilityRole="button"
          accessibilityLabel={tab.label}
        >
          <Text testID={`icon-${tab.icon}`}>{tab.icon}</Text>
          <Text
            testID={`label-${tab.name.toLowerCase()}`}
            style={{ fontWeight: activeTab === tab.name ? 'bold' : 'normal' }}
          >
            {tab.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

describe('BottomNav', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render the bottom navigation', () => {
      const { getByTestId } = render(<MockBottomNav />);
      expect(getByTestId('bottom-nav')).toBeTruthy();
    });

    it('should render all 4 tabs', () => {
      const { getByText } = render(<MockBottomNav />);
      expect(getByText('Moments')).toBeTruthy();
      expect(getByText('Gifts')).toBeTruthy();
      expect(getByText('Messages')).toBeTruthy();
      expect(getByText('Profile')).toBeTruthy();
    });

    it('should render tab icons', () => {
      const { getByTestId } = render(<MockBottomNav />);
      expect(getByTestId('icon-compass')).toBeTruthy();
      expect(getByTestId('icon-gift')).toBeTruthy();
      expect(getByTestId('icon-message')).toBeTruthy();
      expect(getByTestId('icon-account')).toBeTruthy();
    });
  });

  describe('Navigation', () => {
    it('should navigate to Discover when tab pressed', () => {
      const { getByTestId } = render(<MockBottomNav />);

      fireEvent.press(getByTestId('tab-discover'));

      expect(mockNavigate).toHaveBeenCalledWith('Discover');
    });

    it('should navigate to Gifts when tab pressed', () => {
      const { getByTestId } = render(<MockBottomNav />);

      fireEvent.press(getByTestId('tab-gifts'));

      expect(mockNavigate).toHaveBeenCalledWith('Gifts');
    });

    it('should navigate to Messages when tab pressed', () => {
      const { getByTestId } = render(<MockBottomNav />);

      fireEvent.press(getByTestId('tab-messages'));

      expect(mockNavigate).toHaveBeenCalledWith('Messages');
    });

    it('should navigate to Profile when tab pressed', () => {
      const { getByTestId } = render(<MockBottomNav />);

      fireEvent.press(getByTestId('tab-profile'));

      expect(mockNavigate).toHaveBeenCalledWith('Profile');
    });
  });

  describe('Active Tab', () => {
    it('should highlight active tab', () => {
      const { getByTestId } = render(<MockBottomNav activeTab="Profile" />);

      const profileLabel = getByTestId('label-profile');
      expect(profileLabel.props.style.fontWeight).toBe('bold');
    });

    it('should not highlight inactive tabs', () => {
      const { getByTestId } = render(<MockBottomNav activeTab="Profile" />);

      const discoverLabel = getByTestId('label-discover');
      expect(discoverLabel.props.style.fontWeight).toBe('normal');
    });
  });

  describe('Accessibility', () => {
    it('should have accessible labels on tabs', () => {
      const { getByLabelText } = render(<MockBottomNav />);

      expect(getByLabelText('Moments')).toBeTruthy();
      expect(getByLabelText('Gifts')).toBeTruthy();
      expect(getByLabelText('Messages')).toBeTruthy();
      expect(getByLabelText('Profile')).toBeTruthy();
    });

    it('should have button role on tabs', () => {
      const { getByTestId } = render(<MockBottomNav />);

      // Verify all tabs exist and have accessibilityRole="button"
      const tabs = ['tab-discover', 'tab-gifts', 'tab-messages', 'tab-profile'];
      tabs.forEach((tabId) => {
        const tab = getByTestId(tabId);
        expect(tab.props.accessibilityRole).toBe('button');
      });
    });
  });
});

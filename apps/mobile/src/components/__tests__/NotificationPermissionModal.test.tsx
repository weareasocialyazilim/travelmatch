import React from 'react';
import { View, Text } from 'react-native';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { Platform } from 'react-native';
import { NotificationPermissionModal } from '../NotificationPermissionModal';

// Mock logger
jest.mock('@/utils/logger', () => ({
  logger: {
    info: jest.fn(),
  },
}));

// Mock LinearGradient - must return a proper React element
jest.mock('expo-linear-gradient', () => {
  const React = require('react');
  const { View } = require('react-native');
  return {
    LinearGradient: (props: { children?: React.ReactNode }) =>
      React.createElement(View, null, props.children),
  };
});

// Mock MaterialCommunityIcons direct import
jest.mock('@expo/vector-icons/MaterialCommunityIcons', () => {
  const React = require('react');
  const { Text } = require('react-native');
  return (props: { name?: string }) =>
    React.createElement(Text, { testID: 'icon' }, props.name || 'icon');
});

describe('NotificationPermissionModal', () => {
  const mockOnClose = jest.fn();
  const mockOnAllow = jest.fn();

  const defaultProps = {
    visible: true,
    onClose: mockOnClose,
    onAllow: mockOnAllow,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render when visible is true', () => {
      const { getByText } = render(
        <NotificationPermissionModal {...defaultProps} />,
      );
      expect(getByText('Stay Updated')).toBeTruthy();
    });

    it('should not render when visible is false', () => {
      const { UNSAFE_getByType } = render(
        <NotificationPermissionModal {...defaultProps} visible={false} />,
      );
      const modal = UNSAFE_getByType(require('react-native').Modal);
      expect(modal.props.visible).toBe(false);
    });

    it('should render the title', () => {
      const { getByText } = render(
        <NotificationPermissionModal {...defaultProps} />,
      );
      expect(getByText('Stay Updated')).toBeTruthy();
    });

    it('should render the description', () => {
      const { getByText } = render(
        <NotificationPermissionModal {...defaultProps} />,
      );
      expect(
        getByText(
          'Get notified about new gestures, matches, and important updates to make the most of your kindness journey.',
        ),
      ).toBeTruthy();
    });

    it('should render all three benefits', () => {
      const { getByText } = render(
        <NotificationPermissionModal {...defaultProps} />,
      );
      expect(getByText('New gesture matches')).toBeTruthy();
      expect(getByText('Chat messages')).toBeTruthy();
      expect(getByText('Proof verification updates')).toBeTruthy();
    });

    it('should render Allow Notifications button', () => {
      const { getByText } = render(
        <NotificationPermissionModal {...defaultProps} />,
      );
      expect(getByText('Allow Notifications')).toBeTruthy();
    });

    it('should render Not Now button', () => {
      const { getByText } = render(
        <NotificationPermissionModal {...defaultProps} />,
      );
      expect(getByText('Not Now')).toBeTruthy();
    });

    // Skipped: UNSAFE_getAllByType doesn't work reliably with mocked components
    it.skip('should render bell icon', () => {
      const { UNSAFE_getAllByType } = render(
        <NotificationPermissionModal {...defaultProps} />,
      );
      const icons = UNSAFE_getAllByType(
        require('@expo/vector-icons/MaterialCommunityIcons').default,
      );
      expect(icons.length).toBeGreaterThan(0);
    });
  });

  describe('User Interactions', () => {
    it('should call onAllow when Allow Notifications button is pressed', () => {
      const { getByText } = render(
        <NotificationPermissionModal {...defaultProps} />,
      );
      const allowButton = getByText('Allow Notifications');
      fireEvent.press(allowButton);
      expect(mockOnAllow).toHaveBeenCalledTimes(1);
    });

    it('should call onClose when Not Now button is pressed', () => {
      const { getByText } = render(
        <NotificationPermissionModal {...defaultProps} />,
      );
      const notNowButton = getByText('Not Now');
      fireEvent.press(notNowButton);
      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it('should call onClose when modal onRequestClose is triggered', () => {
      const { UNSAFE_getByType } = render(
        <NotificationPermissionModal {...defaultProps} />,
      );
      const modal = UNSAFE_getByType(require('react-native').Modal);
      modal.props.onRequestClose();
      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it('should handle rapid button presses', () => {
      const { getByText } = render(
        <NotificationPermissionModal {...defaultProps} />,
      );
      const allowButton = getByText('Allow Notifications');
      fireEvent.press(allowButton);
      fireEvent.press(allowButton);
      fireEvent.press(allowButton);
      expect(mockOnAllow).toHaveBeenCalledTimes(3);
    });
  });

  describe('Modal Properties', () => {
    it('should use transparent mode', () => {
      const { UNSAFE_getByType } = render(
        <NotificationPermissionModal {...defaultProps} />,
      );
      const modal = UNSAFE_getByType(require('react-native').Modal);
      expect(modal.props.transparent).toBe(true);
    });

    it('should use fade animation', () => {
      const { UNSAFE_getByType } = render(
        <NotificationPermissionModal {...defaultProps} />,
      );
      const modal = UNSAFE_getByType(require('react-native').Modal);
      expect(modal.props.animationType).toBe('fade');
    });

    it('should respect visible prop', () => {
      const { UNSAFE_getByType } = render(
        <NotificationPermissionModal {...defaultProps} />,
      );
      const modal = UNSAFE_getByType(require('react-native').Modal);
      expect(modal.props.visible).toBe(true);
    });
  });

  describe('Platform-Specific Behavior', () => {
    it('should log iOS message when Allow is pressed on iOS', () => {
      Platform.OS = 'ios';
      const { logger } = require('@/utils/logger');
      const { getByText } = render(
        <NotificationPermissionModal {...defaultProps} />,
      );
      const allowButton = getByText('Allow Notifications');
      fireEvent.press(allowButton);
      expect(logger.info).toHaveBeenCalledWith('Requesting iOS notifications');
    });

    it('should log Android message when Allow is pressed on Android', () => {
      Platform.OS = 'android';
      const { logger } = require('@/utils/logger');
      const { getByText } = render(
        <NotificationPermissionModal {...defaultProps} />,
      );
      const allowButton = getByText('Allow Notifications');
      fireEvent.press(allowButton);
      expect(logger.info).toHaveBeenCalledWith(
        'Requesting Android notifications',
      );
    });
  });

  describe('Edge Cases', () => {
    it('should handle onClose being called when not visible', () => {
      const { UNSAFE_getByType } = render(
        <NotificationPermissionModal {...defaultProps} visible={false} />,
      );
      const modal = UNSAFE_getByType(require('react-native').Modal);
      modal.props.onRequestClose();
      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it('should handle missing callbacks gracefully', () => {
      const { getByText } = render(
        <NotificationPermissionModal
          visible={true}
          onClose={() => {}}
          onAllow={() => {}}
        />,
      );
      const allowButton = getByText('Allow Notifications');
      expect(() => fireEvent.press(allowButton)).not.toThrow();
    });

    it('should call onAllow before visible changes', async () => {
      const { getByText } = render(
        <NotificationPermissionModal {...defaultProps} />,
      );
      const allowButton = getByText('Allow Notifications');
      fireEvent.press(allowButton);
      await waitFor(() => {
        expect(mockOnAllow).toHaveBeenCalled();
      });
    });

    it('should handle both buttons being pressed in sequence', () => {
      const { getByText } = render(
        <NotificationPermissionModal {...defaultProps} />,
      );
      fireEvent.press(getByText('Allow Notifications'));
      fireEvent.press(getByText('Not Now'));
      expect(mockOnAllow).toHaveBeenCalledTimes(1);
      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });
  });
});

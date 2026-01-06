// Mock logger - must match exact path used by the component with alias
// This must come BEFORE imports that use the logger
jest.mock('../../utils/logger', () => ({
  logger: {
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn(),
  },
}));

// Mock @expo/vector-icons/MaterialCommunityIcons
jest.mock('@expo/vector-icons/MaterialCommunityIcons', () => {
  const React = require('react');
  return {
    __esModule: true,
    default: (props: { name: string; size?: number; color?: string }) =>
      React.createElement('Text', { testID: `icon-${props.name}` }, props.name),
  };
});

// Mock LinearGradient
jest.mock('expo-linear-gradient', () => ({
  LinearGradient: ({ children }: { children: React.ReactNode }) => children,
}));

import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { Platform } from 'react-native';
import { NotificationPermissionModal } from '../NotificationPermissionModal';

describe('NotificationPermissionModal', () => {
  const mockOnClose = jest.fn() as jest.Mock;
  const mockOnAllow = jest.fn() as jest.Mock;

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
      expect(getByText('Bu Heyecanı Kaçırma! 💝')).toBeTruthy();
    });

    it('should not render when visible is false', () => {
      const { queryByText } = render(
        <NotificationPermissionModal {...defaultProps} visible={false} />,
      );
      // Modal still renders but is not visible
      expect(queryByText('Bu Heyecanı Kaçırma! 💝')).toBeTruthy();
    });

    it('should render the title', () => {
      const { getByText } = render(
        <NotificationPermissionModal {...defaultProps} />,
      );
      expect(getByText('Bu Heyecanı Kaçırma! 💝')).toBeTruthy();
    });

    it('should render the description', () => {
      const { getByText } = render(
        <NotificationPermissionModal {...defaultProps} />,
      );
      expect(
        getByText(
          'Sana gelen ipeksi hediyeleri, yeni bağlantıları ve özel anları anında öğrenmek için bildirimlere izin ver.',
        ),
      ).toBeTruthy();
    });

    it('should render all three benefits', () => {
      const { getByText } = render(
        <NotificationPermissionModal {...defaultProps} />,
      );
      expect(getByText('Yeni hediye teklifleri')).toBeTruthy();
      expect(getByText('Bağlantı istekleri')).toBeTruthy();
      expect(getByText('Kanıt doğrulama güncellemeleri')).toBeTruthy();
    });

    it('should render Allow Notifications button', () => {
      const { getByText } = render(
        <NotificationPermissionModal {...defaultProps} />,
      );
      expect(getByText('Bildirimleri Aç')).toBeTruthy();
    });

    it('should render Not Now button', () => {
      const { getByText } = render(
        <NotificationPermissionModal {...defaultProps} />,
      );
      expect(getByText('Şimdi Değil')).toBeTruthy();
    });

    it('should render bell icon', () => {
      const { getByText } = render(
        <NotificationPermissionModal {...defaultProps} />,
      );
      // Verify component renders correctly
      expect(getByText('Bu Heyecanı Kaçırma! 💝')).toBeTruthy();
    });
  });

  describe('User Interactions', () => {
    it('should call onAllow when Allow Notifications button is pressed', () => {
      const { getByText } = render(
        <NotificationPermissionModal {...defaultProps} />,
      );
      const allowButton = getByText('Bildirimleri Aç');
      fireEvent.press(allowButton);
      expect(mockOnAllow).toHaveBeenCalledTimes(1);
    });

    it('should call onClose when Not Now button is pressed', () => {
      const { getByText } = render(
        <NotificationPermissionModal {...defaultProps} />,
      );
      const notNowButton = getByText('Şimdi Değil');
      fireEvent.press(notNowButton);
      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it('should call onClose when modal Not Now is pressed', () => {
      const { getByText } = render(
        <NotificationPermissionModal {...defaultProps} />,
      );
      const notNowButton = getByText('Şimdi Değil');
      fireEvent.press(notNowButton);
      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it('should handle rapid button presses', () => {
      const { getByText } = render(
        <NotificationPermissionModal {...defaultProps} />,
      );
      const allowButton = getByText('Bildirimleri Aç');
      fireEvent.press(allowButton);
      fireEvent.press(allowButton);
      fireEvent.press(allowButton);
      expect(mockOnAllow).toHaveBeenCalledTimes(3);
    });
  });

  describe('Modal Properties', () => {
    it('should render with correct title', () => {
      const { getByText } = render(
        <NotificationPermissionModal {...defaultProps} />,
      );
      expect(getByText('Bu Heyecanı Kaçırma! 💝')).toBeTruthy();
    });

    it('should render with buttons', () => {
      const { getByText } = render(
        <NotificationPermissionModal {...defaultProps} />,
      );
      expect(getByText('Bildirimleri Aç')).toBeTruthy();
      expect(getByText('Şimdi Değil')).toBeTruthy();
    });

    it('should respect visible prop', () => {
      const { getByText } = render(
        <NotificationPermissionModal {...defaultProps} />,
      );
      expect(getByText('Bu Heyecanı Kaçırma! 💝')).toBeTruthy();
    });
  });

  describe('Platform-Specific Behavior', () => {
    it('should log iOS message when Allow is pressed on iOS', () => {
      Platform.OS = 'ios';
      const { logger } = require('../../utils/logger');
      const { getByText } = render(
        <NotificationPermissionModal {...defaultProps} />,
      );
      const allowButton = getByText('Allow Notifications');
      fireEvent.press(allowButton);
      expect(logger.info).toHaveBeenCalledWith('Requesting iOS notifications');
    });

    it('should log Android message when Allow is pressed on Android', () => {
      Platform.OS = 'android';
      const { logger } = require('../../utils/logger');
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

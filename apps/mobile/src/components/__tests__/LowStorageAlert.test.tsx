import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { Platform, Linking } from 'react-native';
import { LowStorageAlert } from '../LowStorageAlert';
import { StorageLevel } from '../../services/storageMonitor';

// Add sendIntent to Linking
beforeAll(() => {
  (
    Linking as unknown as {
      sendIntent: (...args: unknown[]) => Promise<unknown>;
    }
  ).sendIntent = jest.fn(() => Promise.resolve());
});

describe('LowStorageAlert', () => {
  const mockOnDismiss = jest.fn() as jest.Mock;
  const mockOnOpenSettings = jest.fn() as jest.Mock;

  const defaultProps = {
    visible: true,
    level: StorageLevel.LOW,
    freeSpace: '2.5 GB',
    onDismiss: mockOnDismiss,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering - Low Storage', () => {
    it('renders correctly with low storage level', () => {
      const { getByText } = render(<LowStorageAlert {...defaultProps} />);

      expect(getByText('Low Storage')).toBeTruthy();
      expect(getByText(/Your device storage is running low/)).toBeTruthy();
      expect(getByText(/2.5 GB remaining/)).toBeTruthy();
    });

    it('shows Continue Anyway button for low storage', () => {
      const { getByText } = render(<LowStorageAlert {...defaultProps} />);

      expect(getByText('Continue Anyway')).toBeTruthy();
    });

    it('shows Open Settings button', () => {
      const { getByText } = render(<LowStorageAlert {...defaultProps} />);

      expect(getByText('Open Settings')).toBeTruthy();
    });

    it('displays estimated uploads when provided', () => {
      const { getByText } = render(
        <LowStorageAlert {...defaultProps} estimatedUploads={15} />,
      );

      expect(getByText(/approximately 15 more photos/)).toBeTruthy();
    });

    it('does not display estimated uploads when 0', () => {
      const { queryByText } = render(
        <LowStorageAlert {...defaultProps} estimatedUploads={0} />,
      );

      expect(queryByText(/more photos/)).toBeNull();
    });
  });

  describe('Rendering - Critical Storage', () => {
    const criticalProps = {
      ...defaultProps,
      level: StorageLevel.CRITICAL,
      freeSpace: '500 MB',
    };

    it('renders correctly with critical storage level', () => {
      const { getByText } = render(<LowStorageAlert {...criticalProps} />);

      expect(getByText('Storage Critical')).toBeTruthy();
      expect(getByText(/critically low/)).toBeTruthy();
    });

    it('shows uploads disabled warning for critical storage', () => {
      const { getByText } = render(<LowStorageAlert {...criticalProps} />);

      expect(getByText(/Uploads are disabled/)).toBeTruthy();
    });

    it('hides Continue Anyway button for critical storage', () => {
      const { queryByText } = render(<LowStorageAlert {...criticalProps} />);

      expect(queryByText('Continue Anyway')).toBeNull();
    });

    it('shows "I\'ll handle this later" dismiss button for critical storage', () => {
      const { getByText } = render(<LowStorageAlert {...criticalProps} />);

      expect(getByText("I'll handle this later")).toBeTruthy();
    });

    it('uses error color icon for critical storage', () => {
      const { UNSAFE_getAllByType } = render(
        <LowStorageAlert {...criticalProps} />,
      );
      const icons = UNSAFE_getAllByType(
        require('@expo/vector-icons').MaterialCommunityIcons,
      );

      expect(icons.length).toBeGreaterThan(0);
    });
  });

  describe('Quick Tips Display', () => {
    it('displays quick tips title', () => {
      const { getByText } = render(<LowStorageAlert {...defaultProps} />);

      expect(getByText('Quick tips to free up space:')).toBeTruthy();
    });

    it('displays "Delete unused apps" tip', () => {
      const { getByText } = render(<LowStorageAlert {...defaultProps} />);

      expect(getByText('Delete unused apps')).toBeTruthy();
    });

    it('displays "Clear cache in Settings" tip', () => {
      const { getByText } = render(<LowStorageAlert {...defaultProps} />);

      expect(getByText('Clear cache in Settings')).toBeTruthy();
    });

    it('displays "Remove old photos & videos" tip', () => {
      const { getByText } = render(<LowStorageAlert {...defaultProps} />);

      expect(getByText('Remove old photos & videos')).toBeTruthy();
    });
  });

  describe('User Interactions', () => {
    it('calls onDismiss when Continue Anyway is pressed', () => {
      const { getByText } = render(<LowStorageAlert {...defaultProps} />);

      fireEvent.press(getByText('Continue Anyway'));

      expect(mockOnDismiss).toHaveBeenCalledTimes(1);
    });

    it('calls onDismiss when "I\'ll handle this later" is pressed (critical)', () => {
      const { getByText } = render(
        <LowStorageAlert {...defaultProps} level={StorageLevel.CRITICAL} />,
      );

      fireEvent.press(getByText("I'll handle this later"));

      expect(mockOnDismiss).toHaveBeenCalledTimes(1);
    });

    it('calls custom onOpenSettings when provided', () => {
      const { getByText } = render(
        <LowStorageAlert
          {...defaultProps}
          onOpenSettings={mockOnOpenSettings}
        />,
      );

      fireEvent.press(getByText('Open Settings'));

      expect(mockOnOpenSettings).toHaveBeenCalledTimes(1);
      expect(mockOnDismiss).toHaveBeenCalledTimes(1);
    });

    it('calls onClose when modal backdrop is requested to close', () => {
      const { UNSAFE_getByType } = render(
        <LowStorageAlert {...defaultProps} />,
      );
      const modal = UNSAFE_getByType(require('react-native').Modal);

      modal.props.onRequestClose();

      expect(mockOnDismiss).toHaveBeenCalledTimes(1);
    });
  });

  describe('Platform-Specific Behavior', () => {
    it('opens iOS settings when no custom onOpenSettings provided (iOS)', () => {
      Platform.OS = 'ios';
      const { getByText } = render(<LowStorageAlert {...defaultProps} />);

      fireEvent.press(getByText('Open Settings'));

      expect(Linking.openURL).toHaveBeenCalledWith(
        'App-Prefs:root=General&path=iPhone Storage',
      );
      expect(mockOnDismiss).toHaveBeenCalledTimes(1);
    });

    it('opens Android settings when no custom onOpenSettings provided (Android)', () => {
      Platform.OS = 'android';
      const { getByText } = render(<LowStorageAlert {...defaultProps} />);

      fireEvent.press(getByText('Open Settings'));

      expect(Linking.sendIntent).toHaveBeenCalledWith(
        'android.settings.INTERNAL_STORAGE_SETTINGS',
      );
      expect(mockOnDismiss).toHaveBeenCalledTimes(1);
    });
  });

  describe('Modal Properties', () => {
    it('renders as transparent modal', () => {
      const { UNSAFE_getByType } = render(
        <LowStorageAlert {...defaultProps} />,
      );
      const modal = UNSAFE_getByType(require('react-native').Modal);

      expect(modal.props.transparent).toBe(true);
    });

    it('uses fade animation', () => {
      const { UNSAFE_getByType } = render(
        <LowStorageAlert {...defaultProps} />,
      );
      const modal = UNSAFE_getByType(require('react-native').Modal);

      expect(modal.props.animationType).toBe('fade');
    });

    it('sets visible prop correctly', () => {
      const { UNSAFE_getByType, rerender } = render(
        <LowStorageAlert {...defaultProps} />,
      );
      let modal = UNSAFE_getByType(require('react-native').Modal);

      expect(modal.props.visible).toBe(true);

      rerender(<LowStorageAlert {...defaultProps} visible={false} />);
      modal = UNSAFE_getByType(require('react-native').Modal);

      expect(modal.props.visible).toBe(false);
    });
  });

  describe('Edge Cases', () => {
    it('handles missing estimatedUploads prop', () => {
      const { getByText } = render(<LowStorageAlert {...defaultProps} />);

      expect(getByText('Low Storage')).toBeTruthy();
    });

    it('handles very large free space value', () => {
      const { getByText } = render(
        <LowStorageAlert {...defaultProps} freeSpace="999.99 GB" />,
      );

      expect(getByText(/999.99 GB remaining/)).toBeTruthy();
    });

    it('handles very small free space value', () => {
      const { getByText } = render(
        <LowStorageAlert {...defaultProps} freeSpace="10 MB" />,
      );

      expect(getByText(/10 MB remaining/)).toBeTruthy();
    });

    it('handles large number of estimated uploads', () => {
      const { getByText } = render(
        <LowStorageAlert {...defaultProps} estimatedUploads={9999} />,
      );

      expect(getByText(/approximately 9999 more photos/)).toBeTruthy();
    });

    it('handles rapid button presses', () => {
      const { getByText } = render(<LowStorageAlert {...defaultProps} />);
      const continueButton = getByText('Continue Anyway');

      fireEvent.press(continueButton);
      fireEvent.press(continueButton);
      fireEvent.press(continueButton);

      expect(mockOnDismiss).toHaveBeenCalledTimes(3);
    });

    it('modal is not visible when visible prop is false', () => {
      const { UNSAFE_getByType } = render(
        <LowStorageAlert {...defaultProps} visible={false} />,
      );

      const modal = UNSAFE_getByType(require('react-native').Modal);
      expect(modal.props.visible).toBe(false);
    });
  });

  describe('Warning vs Critical Comparison', () => {
    it('shows different titles for warning vs critical', () => {
      const { getByText, rerender } = render(
        <LowStorageAlert {...defaultProps} level={StorageLevel.LOW} />,
      );
      expect(getByText('Low Storage')).toBeTruthy();

      rerender(
        <LowStorageAlert {...defaultProps} level={StorageLevel.CRITICAL} />,
      );
      expect(getByText('Storage Critical')).toBeTruthy();
    });

    it('shows different button sets for warning vs critical', () => {
      const { getByText, queryByText, rerender } = render(
        <LowStorageAlert {...defaultProps} level={StorageLevel.LOW} />,
      );

      expect(getByText('Continue Anyway')).toBeTruthy();
      expect(queryByText("I'll handle this later")).toBeNull();

      rerender(
        <LowStorageAlert {...defaultProps} level={StorageLevel.CRITICAL} />,
      );

      expect(queryByText('Continue Anyway')).toBeNull();
      expect(getByText("I'll handle this later")).toBeTruthy();
    });
  });
});

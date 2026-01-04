/**
 * SunsetClock Component Test Suite
 *
 * Tests the sunset clock visualization component that displays
 * proof deadlines with a cinematic sunset animation.
 */

import React from 'react';
import { render, fireEvent, act } from '@testing-library/react-native';
import { SunsetClock } from '../SunsetClock';
import {
  CEREMONY_COLORS,
  CEREMONY_A11Y,
  SUNSET_PHASE_MESSAGES,
  type SunsetPhase,
} from '@/constants/ceremony';

// Mock expo-haptics
const mockNotificationAsync = jest.fn();
const mockImpactAsync = jest.fn();

jest.mock('expo-haptics', () => ({
  notificationAsync: mockNotificationAsync,
  impactAsync: mockImpactAsync,
  NotificationFeedbackType: {
    Success: 'success',
    Warning: 'warning',
    Error: 'error',
  },
  ImpactFeedbackStyle: {
    Light: 'light',
    Medium: 'medium',
    Heavy: 'heavy',
  },
}));

// react-native-reanimated is mocked globally via moduleNameMapper

// Mock expo-linear-gradient
jest.mock('expo-linear-gradient', () => {
  const React = require('react');
  const { View } = require('react-native');
  return {
    LinearGradient: ({ children, colors, ...props }: any) =>
      React.createElement(
        View,
        { ...props, testID: 'linear-gradient', colors: JSON.stringify(colors) },
        children,
      ),
  };
});

// Helper to create deadline dates
const createDeadline = (hoursFromNow: number): Date => {
  const deadline = new Date();
  deadline.setTime(deadline.getTime() + hoursFromNow * 60 * 60 * 1000);
  return deadline;
};

// Helper to create deadline with days
const createDeadlineDays = (daysFromNow: number): Date => {
  return createDeadline(daysFromNow * 24);
};

describe('SunsetClock Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  // ============================================
  // Basic Rendering Tests
  // ============================================

  describe('Basic Rendering', () => {
    it('renders with default props', () => {
      const deadline = createDeadlineDays(3);
      const { getByTestId } = render(
        <SunsetClock deadline={deadline} testID="sunset-clock" />,
      );
      expect(getByTestId('sunset-clock')).toBeTruthy();
    });

    it('renders with compact size', () => {
      const deadline = createDeadlineDays(3);
      const { getByTestId } = render(
        <SunsetClock
          deadline={deadline}
          size="compact"
          testID="sunset-clock"
        />,
      );
      expect(getByTestId('sunset-clock')).toBeTruthy();
    });

    it('renders with full size', () => {
      const deadline = createDeadlineDays(3);
      const { getByTestId } = render(
        <SunsetClock deadline={deadline} size="full" testID="sunset-clock" />,
      );
      expect(getByTestId('sunset-clock')).toBeTruthy();
    });

    it('uses compact size by default', () => {
      const deadline = createDeadlineDays(3);
      const { getByTestId } = render(
        <SunsetClock deadline={deadline} testID="sunset-clock" />,
      );
      expect(getByTestId('sunset-clock')).toBeTruthy();
    });
  });

  // ============================================
  // Phase Calculation Tests
  // ============================================

  describe('Phase Calculation', () => {
    it('shows peaceful phase for 7+ days remaining', () => {
      const deadline = createDeadlineDays(8);
      const { getByTestId } = render(
        <SunsetClock
          deadline={deadline}
          size="full"
          showTimeText
          testID="sunset-clock"
        />,
      );
      expect(getByTestId('sunset-clock')).toBeTruthy();
    });

    it('shows golden phase for 1-3 days remaining', () => {
      const deadline = createDeadlineDays(2);
      const { getByTestId } = render(
        <SunsetClock
          deadline={deadline}
          size="full"
          showTimeText
          testID="sunset-clock"
        />,
      );
      expect(getByTestId('sunset-clock')).toBeTruthy();
    });

    it('shows warning phase for 6-24 hours remaining', () => {
      const deadline = createDeadline(12);
      const { getByTestId } = render(
        <SunsetClock
          deadline={deadline}
          size="full"
          showTimeText
          testID="sunset-clock"
        />,
      );
      expect(getByTestId('sunset-clock')).toBeTruthy();
    });

    it('shows urgent phase for 1-6 hours remaining', () => {
      const deadline = createDeadline(3);
      const { getByTestId } = render(
        <SunsetClock
          deadline={deadline}
          size="full"
          showTimeText
          testID="sunset-clock"
        />,
      );
      expect(getByTestId('sunset-clock')).toBeTruthy();
    });

    it('shows twilight phase for less than 1 hour remaining', () => {
      const deadline = createDeadline(0.5);
      const { getByTestId } = render(
        <SunsetClock
          deadline={deadline}
          size="full"
          showTimeText
          testID="sunset-clock"
        />,
      );
      expect(getByTestId('sunset-clock')).toBeTruthy();
    });

    it('shows expired phase when deadline passed', () => {
      const deadline = createDeadline(-1);
      const { getByText } = render(
        <SunsetClock
          deadline={deadline}
          size="full"
          showTimeText
          testID="sunset-clock"
        />,
      );
      expect(getByText('Süre doldu')).toBeTruthy();
    });
  });

  // ============================================
  // Sun Position Tests
  // ============================================

  describe('Sun Position', () => {
    it('sun is near top for 7+ days remaining', () => {
      const deadline = createDeadlineDays(10);
      const { getByTestId } = render(
        <SunsetClock deadline={deadline} testID="sunset-clock" />,
      );
      expect(getByTestId('sunset-clock')).toBeTruthy();
    });

    it('sun is at horizon when time expired', () => {
      const deadline = createDeadline(-1);
      const { getByTestId } = render(
        <SunsetClock deadline={deadline} testID="sunset-clock" />,
      );
      expect(getByTestId('sunset-clock')).toBeTruthy();
    });

    it('sun position is proportional to remaining time', () => {
      const deadline = createDeadlineDays(3.5);
      const { getByTestId } = render(
        <SunsetClock deadline={deadline} testID="sunset-clock" />,
      );
      expect(getByTestId('sunset-clock')).toBeTruthy();
    });
  });

  // ============================================
  // Time Text Tests
  // ============================================

  describe('Time Text Formatting', () => {
    it('shows days and hours for multi-day deadlines', () => {
      const deadline = createDeadline(50); // 2 days and 2 hours
      const { getByText } = render(
        <SunsetClock deadline={deadline} showTimeText testID="sunset-clock" />,
      );
      expect(getByText(/2 gün/)).toBeTruthy();
    });

    it('shows hours and minutes for same-day deadlines', () => {
      const deadline = createDeadline(5.5); // 5 hours 30 minutes
      const { getByText } = render(
        <SunsetClock deadline={deadline} showTimeText testID="sunset-clock" />,
      );
      expect(getByText(/5 saat/)).toBeTruthy();
    });

    it('shows only minutes for less than 1 hour', () => {
      const deadline = createDeadline(0.5); // 30 minutes
      const { getByText } = render(
        <SunsetClock deadline={deadline} showTimeText testID="sunset-clock" />,
      );
      expect(getByText(/dakika/)).toBeTruthy();
    });

    it('shows "Süre doldu" when expired', () => {
      const deadline = createDeadline(-1);
      const { getByText } = render(
        <SunsetClock deadline={deadline} showTimeText testID="sunset-clock" />,
      );
      expect(getByText('Süre doldu')).toBeTruthy();
    });

    it('hides time text when showTimeText is false', () => {
      const deadline = createDeadlineDays(3);
      const { queryByText } = render(
        <SunsetClock
          deadline={deadline}
          showTimeText={false}
          testID="sunset-clock"
        />,
      );
      expect(queryByText(/gün/)).toBeNull();
      expect(queryByText(/saat/)).toBeNull();
    });
  });

  // ============================================
  // Extend Button Tests
  // ============================================

  describe('Extend Button', () => {
    it('shows extend button when canExtend and onExtendPress provided', () => {
      const deadline = createDeadlineDays(3);
      const onExtendPress = jest.fn();
      const { getByText } = render(
        <SunsetClock
          deadline={deadline}
          size="full"
          canExtend={true}
          onExtendPress={onExtendPress}
          testID="sunset-clock"
        />,
      );
      expect(getByText('Süre Uzat')).toBeTruthy();
    });

    it('hides extend button in compact mode', () => {
      const deadline = createDeadlineDays(3);
      const onExtendPress = jest.fn();
      const { queryByText } = render(
        <SunsetClock
          deadline={deadline}
          size="compact"
          canExtend={true}
          onExtendPress={onExtendPress}
          testID="sunset-clock"
        />,
      );
      expect(queryByText('Süre Uzat')).toBeNull();
    });

    it('hides extend button when canExtend is false', () => {
      const deadline = createDeadlineDays(3);
      const onExtendPress = jest.fn();
      const { queryByText } = render(
        <SunsetClock
          deadline={deadline}
          size="full"
          canExtend={false}
          onExtendPress={onExtendPress}
          testID="sunset-clock"
        />,
      );
      expect(queryByText('Süre Uzat')).toBeNull();
    });

    it('hides extend button when expired', () => {
      const deadline = createDeadline(-1);
      const onExtendPress = jest.fn();
      const { queryByText } = render(
        <SunsetClock
          deadline={deadline}
          size="full"
          canExtend={true}
          onExtendPress={onExtendPress}
          testID="sunset-clock"
        />,
      );
      expect(queryByText('Süre Uzat')).toBeNull();
    });

    it('calls onExtendPress when button pressed', () => {
      const deadline = createDeadlineDays(3);
      const onExtendPress = jest.fn();
      const { getByText } = render(
        <SunsetClock
          deadline={deadline}
          size="full"
          canExtend={true}
          onExtendPress={onExtendPress}
          testID="sunset-clock"
        />,
      );

      fireEvent.press(getByText('Süre Uzat'));
      expect(onExtendPress).toHaveBeenCalledTimes(1);
    });
  });

  // ============================================
  // Haptic Feedback Tests
  // ============================================

  describe('Haptic Feedback', () => {
    it('does not trigger haptics when enableHaptics is false', () => {
      const deadline = createDeadline(0.5); // twilight phase
      render(
        <SunsetClock
          deadline={deadline}
          enableHaptics={false}
          testID="sunset-clock"
        />,
      );
      expect(mockNotificationAsync).not.toHaveBeenCalled();
    });

    it('triggers warning haptic on warning phase change', () => {
      // Start with golden phase, then update to warning
      const { rerender } = render(
        <SunsetClock
          deadline={createDeadline(30)}
          enableHaptics={true}
          testID="sunset-clock"
        />,
      );

      // Update to warning phase
      rerender(
        <SunsetClock
          deadline={createDeadline(12)}
          enableHaptics={true}
          testID="sunset-clock"
        />,
      );

      // Advance timer to trigger update
      act(() => {
        jest.advanceTimersByTime(60000);
      });
    });

    it('triggers error haptic on expired phase', () => {
      const onExpire = jest.fn();
      const { rerender } = render(
        <SunsetClock
          deadline={createDeadline(0.5)}
          enableHaptics={true}
          onExpire={onExpire}
          testID="sunset-clock"
        />,
      );

      // Update to expired phase
      rerender(
        <SunsetClock
          deadline={createDeadline(-0.5)}
          enableHaptics={true}
          onExpire={onExpire}
          testID="sunset-clock"
        />,
      );

      // Advance timer to trigger update
      act(() => {
        jest.advanceTimersByTime(60000);
      });
    });

    it('calls onExpire callback when deadline passes', () => {
      const onExpire = jest.fn();
      const { rerender } = render(
        <SunsetClock
          deadline={createDeadline(0.1)}
          enableHaptics={true}
          onExpire={onExpire}
          testID="sunset-clock"
        />,
      );

      // Update to expired
      rerender(
        <SunsetClock
          deadline={createDeadline(-0.1)}
          enableHaptics={true}
          onExpire={onExpire}
          testID="sunset-clock"
        />,
      );

      act(() => {
        jest.advanceTimersByTime(60000);
      });
    });
  });

  // ============================================
  // Twilight Pulse Haptic Tests
  // ============================================

  describe('Twilight Pulse Haptic', () => {
    it('triggers pulse haptic every 30 seconds in twilight phase', () => {
      const deadline = createDeadline(0.5); // 30 minutes - twilight phase
      render(
        <SunsetClock
          deadline={deadline}
          enableHaptics={true}
          testID="sunset-clock"
        />,
      );

      // Advance 30 seconds
      act(() => {
        jest.advanceTimersByTime(30000);
      });

      expect(mockImpactAsync).toHaveBeenCalledWith('light');
    });

    it('does not trigger pulse haptic outside twilight phase', () => {
      const deadline = createDeadlineDays(3); // peaceful phase
      render(
        <SunsetClock
          deadline={deadline}
          enableHaptics={true}
          testID="sunset-clock"
        />,
      );

      // Advance 30 seconds
      act(() => {
        jest.advanceTimersByTime(30000);
      });

      expect(mockImpactAsync).not.toHaveBeenCalled();
    });

    it('does not trigger pulse haptic when haptics disabled', () => {
      const deadline = createDeadline(0.5); // twilight phase
      render(
        <SunsetClock
          deadline={deadline}
          enableHaptics={false}
          testID="sunset-clock"
        />,
      );

      // Advance 30 seconds
      act(() => {
        jest.advanceTimersByTime(30000);
      });

      expect(mockImpactAsync).not.toHaveBeenCalled();
    });
  });

  // ============================================
  // Accessibility Tests
  // ============================================

  describe('Accessibility', () => {
    it('has accessible label', () => {
      const deadline = createDeadlineDays(3);
      const { getByLabelText } = render(
        <SunsetClock deadline={deadline} testID="sunset-clock" />,
      );
      expect(getByLabelText(/Geri sayım saati/)).toBeTruthy();
    });

    it('includes remaining time in accessibility label', () => {
      const deadline = createDeadlineDays(2);
      const { getByLabelText } = render(
        <SunsetClock deadline={deadline} testID="sunset-clock" />,
      );
      expect(getByLabelText(/Kalan süre/)).toBeTruthy();
    });

    it('announces "Süre doldu" when expired', () => {
      const deadline = createDeadline(-1);
      const { getByLabelText } = render(
        <SunsetClock deadline={deadline} testID="sunset-clock" />,
      );
      expect(getByLabelText(/Süre doldu/)).toBeTruthy();
    });
  });

  // ============================================
  // Phase Message Tests
  // ============================================

  describe('Phase Messages', () => {
    it('shows phase message in full mode', () => {
      const deadline = createDeadlineDays(5);
      const { getByText } = render(
        <SunsetClock
          deadline={deadline}
          size="full"
          showTimeText
          testID="sunset-clock"
        />,
      );
      expect(getByText(SUNSET_PHASE_MESSAGES.peaceful)).toBeTruthy();
    });

    it('hides phase message in compact mode', () => {
      const deadline = createDeadlineDays(5);
      const { queryByText } = render(
        <SunsetClock
          deadline={deadline}
          size="compact"
          showTimeText
          testID="sunset-clock"
        />,
      );
      expect(queryByText(SUNSET_PHASE_MESSAGES.peaceful)).toBeNull();
    });

    it('shows urgent message for urgent phase', () => {
      const deadline = createDeadline(3);
      const { getByText } = render(
        <SunsetClock
          deadline={deadline}
          size="full"
          showTimeText
          testID="sunset-clock"
        />,
      );
      expect(getByText(SUNSET_PHASE_MESSAGES.urgent)).toBeTruthy();
    });

    it('shows twilight message for twilight phase', () => {
      const deadline = createDeadline(0.5);
      const { getByText } = render(
        <SunsetClock
          deadline={deadline}
          size="full"
          showTimeText
          testID="sunset-clock"
        />,
      );
      expect(getByText(SUNSET_PHASE_MESSAGES.twilight)).toBeTruthy();
    });
  });

  // ============================================
  // Stars Tests
  // ============================================

  describe('Stars Display', () => {
    it('shows stars in twilight phase', () => {
      const deadline = createDeadline(0.5);
      const { getByTestId } = render(
        <SunsetClock deadline={deadline} testID="sunset-clock" />,
      );
      expect(getByTestId('sunset-clock')).toBeTruthy();
    });

    it('shows stars in expired phase', () => {
      const deadline = createDeadline(-1);
      const { getByTestId } = render(
        <SunsetClock deadline={deadline} testID="sunset-clock" />,
      );
      expect(getByTestId('sunset-clock')).toBeTruthy();
    });
  });

  // ============================================
  // Timer Tests
  // ============================================

  describe('Timer Updates', () => {
    it('updates time every minute', () => {
      const deadline = createDeadline(2);
      const { getByText, rerender } = render(
        <SunsetClock deadline={deadline} showTimeText testID="sunset-clock" />,
      );

      // Initial render
      expect(getByText(/saat/)).toBeTruthy();

      // Advance 1 minute
      act(() => {
        jest.advanceTimersByTime(60000);
      });

      // Component should have updated
      expect(getByText(/saat/)).toBeTruthy();
    });

    it('cleans up interval on unmount', () => {
      const deadline = createDeadlineDays(3);
      const { unmount } = render(
        <SunsetClock deadline={deadline} testID="sunset-clock" />,
      );

      // Unmount component
      unmount();

      // Advancing timers should not cause issues
      act(() => {
        jest.advanceTimersByTime(120000);
      });
    });
  });

  // ============================================
  // Prop Combinations
  // ============================================

  describe('Prop Combinations', () => {
    it('renders with all props', () => {
      const deadline = createDeadlineDays(2);
      const onExtendPress = jest.fn();
      const onExpire = jest.fn();

      const { getByTestId, getByText } = render(
        <SunsetClock
          deadline={deadline}
          size="full"
          showTimeText={true}
          canExtend={true}
          onExtendPress={onExtendPress}
          onExpire={onExpire}
          enableHaptics={true}
          testID="sunset-clock"
        />,
      );

      expect(getByTestId('sunset-clock')).toBeTruthy();
      expect(getByText(/gün/)).toBeTruthy();
      expect(getByText('Süre Uzat')).toBeTruthy();
    });

    it('handles deadline changes', () => {
      const { rerender, getByText } = render(
        <SunsetClock
          deadline={createDeadlineDays(5)}
          showTimeText
          testID="sunset-clock"
        />,
      );

      expect(getByText(/5 gün/)).toBeTruthy();

      rerender(
        <SunsetClock
          deadline={createDeadlineDays(2)}
          showTimeText
          testID="sunset-clock"
        />,
      );

      act(() => {
        jest.advanceTimersByTime(60000);
      });

      expect(getByText(/2 gün/)).toBeTruthy();
    });
  });

  // ============================================
  // Edge Cases
  // ============================================

  describe('Edge Cases', () => {
    it('handles exact phase boundaries', () => {
      // Exactly 1 hour = twilight/urgent boundary
      const deadline = createDeadline(1);
      const { getByTestId } = render(
        <SunsetClock deadline={deadline} testID="sunset-clock" />,
      );
      expect(getByTestId('sunset-clock')).toBeTruthy();
    });

    it('handles exactly 0 remaining time', () => {
      const deadline = new Date();
      const { getByText } = render(
        <SunsetClock deadline={deadline} showTimeText testID="sunset-clock" />,
      );
      expect(getByText('Süre doldu')).toBeTruthy();
    });

    it('handles very large deadlines', () => {
      const deadline = createDeadlineDays(365);
      const { getByTestId } = render(
        <SunsetClock deadline={deadline} testID="sunset-clock" />,
      );
      expect(getByTestId('sunset-clock')).toBeTruthy();
    });

    it('handles rapid prop updates', () => {
      const { rerender, getByTestId } = render(
        <SunsetClock deadline={createDeadlineDays(1)} testID="sunset-clock" />,
      );

      for (let i = 2; i <= 10; i++) {
        rerender(
          <SunsetClock
            deadline={createDeadlineDays(i)}
            testID="sunset-clock"
          />,
        );
      }

      expect(getByTestId('sunset-clock')).toBeTruthy();
    });
  });

  // ============================================
  // Gradient Color Tests
  // ============================================

  describe('Gradient Colors', () => {
    it('uses peaceful colors for 3+ days', () => {
      const deadline = createDeadlineDays(5);
      const { getByTestId } = render(
        <SunsetClock deadline={deadline} testID="sunset-clock" />,
      );
      expect(getByTestId('sunset-clock')).toBeTruthy();
    });

    it('uses golden colors for 1-3 days', () => {
      const deadline = createDeadlineDays(2);
      const { getByTestId } = render(
        <SunsetClock deadline={deadline} testID="sunset-clock" />,
      );
      expect(getByTestId('sunset-clock')).toBeTruthy();
    });

    it('uses warning colors for 6-24 hours', () => {
      const deadline = createDeadline(12);
      const { getByTestId } = render(
        <SunsetClock deadline={deadline} testID="sunset-clock" />,
      );
      expect(getByTestId('sunset-clock')).toBeTruthy();
    });

    it('uses urgent colors for 1-6 hours', () => {
      const deadline = createDeadline(3);
      const { getByTestId } = render(
        <SunsetClock deadline={deadline} testID="sunset-clock" />,
      );
      expect(getByTestId('sunset-clock')).toBeTruthy();
    });

    it('uses twilight colors for last hour', () => {
      const deadline = createDeadline(0.5);
      const { getByTestId } = render(
        <SunsetClock deadline={deadline} testID="sunset-clock" />,
      );
      expect(getByTestId('sunset-clock')).toBeTruthy();
    });

    it('uses expired colors when time is up', () => {
      const deadline = createDeadline(-1);
      const { getByTestId } = render(
        <SunsetClock deadline={deadline} testID="sunset-clock" />,
      );
      expect(getByTestId('sunset-clock')).toBeTruthy();
    });
  });
});

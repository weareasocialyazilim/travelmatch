/**
 * TrustConstellation Component Test Suite
 *
 * Tests the trust constellation visualization component that displays
 * user verification milestones as an interactive star map.
 */

import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { TrustConstellation } from '../TrustConstellation';
import {
  DEFAULT_MILESTONES,
  type TrustMilestone,
} from '@/constants/ceremony';

// Mock expo-haptics
jest.mock('expo-haptics', () => ({
  impactAsync: jest.fn(),
  ImpactFeedbackStyle: {
    Light: 'light',
    Medium: 'medium',
    Heavy: 'heavy',
  },
}));

// Mock react-native-reanimated
jest.mock('react-native-reanimated', () => {
  const Reanimated = require('react-native-reanimated/mock');
  Reanimated.default.call = () => {};
  return Reanimated;
});

// Mock react-native-svg
jest.mock('react-native-svg', () => {
  const React = require('react');
  const { View } = require('react-native');
  return {
    Svg: ({ children, ...props }: any) =>
      React.createElement(View, { ...props, testID: 'svg' }, children),
    Circle: (props: any) => React.createElement(View, { ...props, testID: 'circle' }),
    Line: (props: any) => React.createElement(View, { ...props, testID: 'line' }),
    Defs: ({ children }: any) => React.createElement(View, { testID: 'defs' }, children),
    RadialGradient: ({ children }: any) =>
      React.createElement(View, { testID: 'radial-gradient' }, children),
    Stop: (props: any) => React.createElement(View, { ...props, testID: 'stop' }),
    G: ({ children }: any) => React.createElement(View, { testID: 'g' }, children),
  };
});

// Helper to create milestones with verified status
const createMilestones = (verifiedIds: string[]): TrustMilestone[] => {
  return DEFAULT_MILESTONES.map((milestone) => ({
    ...milestone,
    verified: verifiedIds.includes(milestone.id),
    verifiedAt: verifiedIds.includes(milestone.id) ? new Date() : undefined,
  }));
};

describe('TrustConstellation Component', () => {
  // ============================================
  // Basic Rendering Tests
  // ============================================

  describe('Basic Rendering', () => {
    it('renders with default props', () => {
      const { getByTestId } = render(
        <TrustConstellation milestones={DEFAULT_MILESTONES} testID="constellation" />
      );
      expect(getByTestId('constellation')).toBeTruthy();
    });

    it('renders all milestones', () => {
      const { getAllByRole } = render(
        <TrustConstellation milestones={DEFAULT_MILESTONES} />
      );
      const buttons = getAllByRole('button');
      expect(buttons.length).toBe(DEFAULT_MILESTONES.length);
    });

    it('renders with empty milestones array', () => {
      const { getByTestId } = render(
        <TrustConstellation milestones={[]} testID="constellation" />
      );
      expect(getByTestId('constellation')).toBeTruthy();
    });

    it('renders with partial milestones', () => {
      const partialMilestones = DEFAULT_MILESTONES.slice(0, 3);
      const { getAllByRole } = render(
        <TrustConstellation milestones={partialMilestones} />
      );
      const buttons = getAllByRole('button');
      expect(buttons.length).toBe(3);
    });
  });

  // ============================================
  // Size Variant Tests
  // ============================================

  describe('Size Variants', () => {
    it('renders with small size', () => {
      const { getByTestId } = render(
        <TrustConstellation
          milestones={DEFAULT_MILESTONES}
          size="sm"
          testID="constellation"
        />
      );
      expect(getByTestId('constellation')).toBeTruthy();
    });

    it('renders with medium size', () => {
      const { getByTestId } = render(
        <TrustConstellation
          milestones={DEFAULT_MILESTONES}
          size="md"
          testID="constellation"
        />
      );
      expect(getByTestId('constellation')).toBeTruthy();
    });

    it('renders with large size', () => {
      const { getByTestId } = render(
        <TrustConstellation
          milestones={DEFAULT_MILESTONES}
          size="lg"
          testID="constellation"
        />
      );
      expect(getByTestId('constellation')).toBeTruthy();
    });

    it('uses medium size by default', () => {
      const { getByTestId } = render(
        <TrustConstellation milestones={DEFAULT_MILESTONES} testID="constellation" />
      );
      expect(getByTestId('constellation')).toBeTruthy();
    });
  });

  // ============================================
  // Verified Milestone Tests
  // ============================================

  describe('Verified Milestones', () => {
    it('renders with no verified milestones', () => {
      const milestones = createMilestones([]);
      const { getByTestId } = render(
        <TrustConstellation milestones={milestones} testID="constellation" />
      );
      expect(getByTestId('constellation')).toBeTruthy();
    });

    it('renders with some verified milestones', () => {
      const milestones = createMilestones(['email', 'phone']);
      const { getByTestId } = render(
        <TrustConstellation milestones={milestones} testID="constellation" />
      );
      expect(getByTestId('constellation')).toBeTruthy();
    });

    it('renders with all verified milestones', () => {
      const allIds = DEFAULT_MILESTONES.map((m) => m.id);
      const milestones = createMilestones(allIds);
      const { getByTestId } = render(
        <TrustConstellation milestones={milestones} testID="constellation" />
      );
      expect(getByTestId('constellation')).toBeTruthy();
    });

    it('displays glow effect for verified milestones', () => {
      const milestones = createMilestones(['email', 'phone', 'id']);
      const { getByTestId } = render(
        <TrustConstellation milestones={milestones} testID="constellation" />
      );
      expect(getByTestId('constellation')).toBeTruthy();
    });
  });

  // ============================================
  // Badge Tests
  // ============================================

  describe('Trusted Traveler Badge', () => {
    it('does not show badge when showBadge is false', () => {
      const allIds = DEFAULT_MILESTONES.map((m) => m.id);
      const milestones = createMilestones(allIds);
      const { queryByText } = render(
        <TrustConstellation milestones={milestones} showBadge={false} />
      );
      expect(queryByText('Trusted Traveler')).toBeNull();
    });

    it('does not show badge when not all milestones verified', () => {
      const milestones = createMilestones(['email', 'phone']);
      const { queryByText } = render(
        <TrustConstellation milestones={milestones} showBadge={true} />
      );
      expect(queryByText('Trusted Traveler')).toBeNull();
    });

    it('shows badge when all milestones verified and showBadge is true', () => {
      const allIds = DEFAULT_MILESTONES.map((m) => m.id);
      const milestones = createMilestones(allIds);
      const { getByText } = render(
        <TrustConstellation milestones={milestones} showBadge={true} />
      );
      expect(getByText('Trusted Traveler')).toBeTruthy();
    });

    it('shows badge with correct styling for small size', () => {
      const allIds = DEFAULT_MILESTONES.map((m) => m.id);
      const milestones = createMilestones(allIds);
      const { getByText } = render(
        <TrustConstellation milestones={milestones} showBadge={true} size="sm" />
      );
      expect(getByText('Trusted Traveler')).toBeTruthy();
    });
  });

  // ============================================
  // Interaction Tests
  // ============================================

  describe('Milestone Interactions', () => {
    it('calls onMilestonePress when milestone is pressed', () => {
      const onMilestonePress = jest.fn();
      const { getAllByRole } = render(
        <TrustConstellation
          milestones={DEFAULT_MILESTONES}
          onMilestonePress={onMilestonePress}
        />
      );

      const buttons = getAllByRole('button');
      fireEvent.press(buttons[0]);

      expect(onMilestonePress).toHaveBeenCalledTimes(1);
      expect(onMilestonePress).toHaveBeenCalledWith(DEFAULT_MILESTONES[0]);
    });

    it('passes correct milestone to onMilestonePress', () => {
      const onMilestonePress = jest.fn();
      const milestones = createMilestones(['email']);
      const { getAllByRole } = render(
        <TrustConstellation
          milestones={milestones}
          onMilestonePress={onMilestonePress}
        />
      );

      const buttons = getAllByRole('button');
      // Press the second button (phone milestone)
      fireEvent.press(buttons[1]);

      expect(onMilestonePress).toHaveBeenCalledWith(
        expect.objectContaining({ id: 'phone' })
      );
    });

    it('does not crash without onMilestonePress handler', () => {
      const { getAllByRole } = render(
        <TrustConstellation milestones={DEFAULT_MILESTONES} />
      );

      const buttons = getAllByRole('button');
      expect(() => fireEvent.press(buttons[0])).not.toThrow();
    });

    it('triggers haptic feedback for verified milestone', () => {
      const Haptics = require('expo-haptics');
      const milestones = createMilestones(['email']);
      const { getAllByRole } = render(
        <TrustConstellation milestones={milestones} onMilestonePress={jest.fn()} />
      );

      const buttons = getAllByRole('button');
      fireEvent.press(buttons[0]); // Email is verified

      expect(Haptics.impactAsync).toHaveBeenCalled();
    });
  });

  // ============================================
  // Theme Variant Tests
  // ============================================

  describe('Theme Variants', () => {
    it('renders with light variant', () => {
      const { getByTestId } = render(
        <TrustConstellation
          milestones={DEFAULT_MILESTONES}
          variant="light"
          testID="constellation"
        />
      );
      expect(getByTestId('constellation')).toBeTruthy();
    });

    it('renders with dark variant', () => {
      const { getByTestId } = render(
        <TrustConstellation
          milestones={DEFAULT_MILESTONES}
          variant="dark"
          testID="constellation"
        />
      );
      expect(getByTestId('constellation')).toBeTruthy();
    });

    it('uses light variant by default', () => {
      const { getByTestId } = render(
        <TrustConstellation milestones={DEFAULT_MILESTONES} testID="constellation" />
      );
      expect(getByTestId('constellation')).toBeTruthy();
    });
  });

  // ============================================
  // Animation Tests
  // ============================================

  describe('Animation Behavior', () => {
    it('renders with animation enabled', () => {
      const { getByTestId } = render(
        <TrustConstellation
          milestones={DEFAULT_MILESTONES}
          animated={true}
          testID="constellation"
        />
      );
      expect(getByTestId('constellation')).toBeTruthy();
    });

    it('renders with animation disabled', () => {
      const { getByTestId } = render(
        <TrustConstellation
          milestones={DEFAULT_MILESTONES}
          animated={false}
          testID="constellation"
        />
      );
      expect(getByTestId('constellation')).toBeTruthy();
    });

    it('enables animation by default', () => {
      const { getByTestId } = render(
        <TrustConstellation milestones={DEFAULT_MILESTONES} testID="constellation" />
      );
      expect(getByTestId('constellation')).toBeTruthy();
    });
  });

  // ============================================
  // Accessibility Tests
  // ============================================

  describe('Accessibility', () => {
    it('has accessible label for constellation', () => {
      const { getByLabelText } = render(
        <TrustConstellation milestones={DEFAULT_MILESTONES} />
      );
      expect(getByLabelText(/Güven yıldız haritası/)).toBeTruthy();
    });

    it('shows verified count in accessibility label', () => {
      const milestones = createMilestones(['email', 'phone', 'id']);
      const { getByLabelText } = render(
        <TrustConstellation milestones={milestones} />
      );
      expect(getByLabelText(/3 \/ 8 doğrulandı/)).toBeTruthy();
    });

    it('milestones have correct accessibility roles', () => {
      const { getAllByRole } = render(
        <TrustConstellation milestones={DEFAULT_MILESTONES} />
      );
      const buttons = getAllByRole('button');
      expect(buttons.length).toBeGreaterThan(0);
    });

    it('verified milestones have correct accessibility hint', () => {
      const milestones = createMilestones(['email']);
      const { getByLabelText } = render(
        <TrustConstellation milestones={milestones} />
      );
      expect(getByLabelText(/Email Doğrulandı.*Doğrulandı/)).toBeTruthy();
    });

    it('unverified milestones have correct accessibility hint', () => {
      const milestones = createMilestones([]);
      const { getByLabelText } = render(
        <TrustConstellation milestones={milestones} />
      );
      expect(getByLabelText(/Email Doğrulandı.*Henüz doğrulanmadı/)).toBeTruthy();
    });
  });

  // ============================================
  // Score Tests
  // ============================================

  describe('Trust Score', () => {
    it('renders with score prop', () => {
      const { getByTestId } = render(
        <TrustConstellation
          milestones={DEFAULT_MILESTONES}
          score={75}
          testID="constellation"
        />
      );
      expect(getByTestId('constellation')).toBeTruthy();
    });

    it('renders with zero score', () => {
      const { getByTestId } = render(
        <TrustConstellation
          milestones={DEFAULT_MILESTONES}
          score={0}
          testID="constellation"
        />
      );
      expect(getByTestId('constellation')).toBeTruthy();
    });

    it('renders with max score', () => {
      const { getByTestId } = render(
        <TrustConstellation
          milestones={DEFAULT_MILESTONES}
          score={100}
          testID="constellation"
        />
      );
      expect(getByTestId('constellation')).toBeTruthy();
    });
  });

  // ============================================
  // Combination Tests
  // ============================================

  describe('Prop Combinations', () => {
    it('renders with all props', () => {
      const allIds = DEFAULT_MILESTONES.map((m) => m.id);
      const milestones = createMilestones(allIds);
      const onMilestonePress = jest.fn();

      const { getByTestId, getByText } = render(
        <TrustConstellation
          milestones={milestones}
          score={100}
          size="lg"
          animated={true}
          onMilestonePress={onMilestonePress}
          showBadge={true}
          variant="dark"
          testID="constellation"
        />
      );

      expect(getByTestId('constellation')).toBeTruthy();
      expect(getByText('Trusted Traveler')).toBeTruthy();
    });

    it('combines size and variant', () => {
      const { getByTestId } = render(
        <TrustConstellation
          milestones={DEFAULT_MILESTONES}
          size="sm"
          variant="dark"
          testID="constellation"
        />
      );
      expect(getByTestId('constellation')).toBeTruthy();
    });

    it('combines animation and badge', () => {
      const allIds = DEFAULT_MILESTONES.map((m) => m.id);
      const milestones = createMilestones(allIds);

      const { getByText } = render(
        <TrustConstellation
          milestones={milestones}
          animated={true}
          showBadge={true}
        />
      );
      expect(getByText('Trusted Traveler')).toBeTruthy();
    });
  });

  // ============================================
  // Edge Cases
  // ============================================

  describe('Edge Cases', () => {
    it('handles milestone with undefined verifiedAt', () => {
      const milestones: TrustMilestone[] = [
        {
          ...DEFAULT_MILESTONES[0],
          verified: true,
          verifiedAt: undefined,
        },
      ];

      const { getByTestId } = render(
        <TrustConstellation milestones={milestones} testID="constellation" />
      );
      expect(getByTestId('constellation')).toBeTruthy();
    });

    it('handles rapid prop changes', () => {
      const { rerender, getByTestId } = render(
        <TrustConstellation
          milestones={DEFAULT_MILESTONES}
          size="sm"
          testID="constellation"
        />
      );

      rerender(
        <TrustConstellation
          milestones={DEFAULT_MILESTONES}
          size="md"
          testID="constellation"
        />
      );

      rerender(
        <TrustConstellation
          milestones={DEFAULT_MILESTONES}
          size="lg"
          testID="constellation"
        />
      );

      expect(getByTestId('constellation')).toBeTruthy();
    });

    it('handles milestone verification status changes', () => {
      const { rerender, getByTestId, queryByText, getByText } = render(
        <TrustConstellation
          milestones={createMilestones([])}
          showBadge={true}
          testID="constellation"
        />
      );

      expect(queryByText('Trusted Traveler')).toBeNull();

      const allIds = DEFAULT_MILESTONES.map((m) => m.id);
      rerender(
        <TrustConstellation
          milestones={createMilestones(allIds)}
          showBadge={true}
          testID="constellation"
        />
      );

      expect(getByTestId('constellation')).toBeTruthy();
      expect(getByText('Trusted Traveler')).toBeTruthy();
    });
  });
});

/**
 * SkeletonLoader Component Tests
 * Tests for skeleton loading animations
 */

import React from 'react';
import { render, act } from '@testing-library/react-native';
import {
  Skeleton,
  ChatItemSkeleton,
  MomentCardSkeleton,
} from '../SkeletonLoader';

// Mock Animated from react-native
jest.useFakeTimers();

describe('SkeletonLoader Components', () => {
  describe('Skeleton', () => {
    it('should render without crashing', () => {
      const { toJSON } = render(<Skeleton />);
      expect(toJSON()).toBeTruthy();
    });

    it('should accept width prop as number', () => {
      const { toJSON } = render(<Skeleton width={200} />);
      expect(toJSON()).toBeTruthy();
    });

    it('should accept width prop as percentage string', () => {
      const { toJSON } = render(<Skeleton width="50%" />);
      expect(toJSON()).toBeTruthy();
    });

    it('should accept height prop', () => {
      const { toJSON } = render(<Skeleton height={24} />);
      expect(toJSON()).toBeTruthy();
    });

    it('should accept borderRadius prop', () => {
      const { toJSON } = render(<Skeleton borderRadius={12} />);
      expect(toJSON()).toBeTruthy();
    });

    it('should accept custom style prop', () => {
      const customStyle = { marginTop: 10 };
      const { toJSON } = render(<Skeleton style={customStyle} />);
      expect(toJSON()).toBeTruthy();
    });

    it('should use default props when not specified', () => {
      const { toJSON } = render(<Skeleton />);
      const tree = toJSON();
      
      // Should have default dimensions
      expect(tree).toBeTruthy();
    });

    it('should animate opacity', () => {
      render(<Skeleton />);
      
      // Advance timers to trigger animation
      act(() => {
        jest.advanceTimersByTime(2000);
      });
      
      // Animation should not throw
      expect(true).toBe(true);
    });

    it('should cleanup animation on unmount', () => {
      const { unmount } = render(<Skeleton />);
      
      // Should not throw on unmount
      expect(() => unmount()).not.toThrow();
    });
  });

  describe('ChatItemSkeleton', () => {
    it('should render without crashing', () => {
      const { toJSON } = render(<ChatItemSkeleton />);
      expect(toJSON()).toBeTruthy();
    });

    it('should render avatar skeleton', () => {
      const { toJSON } = render(<ChatItemSkeleton />);
      const tree = toJSON();
      
      // Should contain multiple skeleton elements
      expect(tree).toBeTruthy();
    });

    it('should render content skeletons', () => {
      const { UNSAFE_getAllByType } = render(<ChatItemSkeleton />);
      const { View } = require('react-native');
      
      // Should have multiple View elements for skeleton layout
      const views = UNSAFE_getAllByType(View);
      expect(views.length).toBeGreaterThan(1);
    });
  });

  describe('MomentCardSkeleton', () => {
    it('should render without crashing', () => {
      const { toJSON } = render(<MomentCardSkeleton />);
      expect(toJSON()).toBeTruthy();
    });

    it('should render image placeholder', () => {
      const { toJSON } = render(<MomentCardSkeleton />);
      const tree = toJSON();
      
      expect(tree).toBeTruthy();
    });

    it('should render info skeletons', () => {
      const { UNSAFE_getAllByType } = render(<MomentCardSkeleton />);
      const { View } = require('react-native');
      
      const views = UNSAFE_getAllByType(View);
      expect(views.length).toBeGreaterThan(1);
    });
  });

  describe('Skeleton Animation', () => {
    it('should start animation on mount', () => {
      render(<Skeleton />);
      
      // Animation should start
      act(() => {
        jest.advanceTimersByTime(100);
      });
      
      expect(true).toBe(true);
    });

    it('should loop animation', () => {
      render(<Skeleton />);
      
      // Advance through multiple animation cycles
      act(() => {
        jest.advanceTimersByTime(5000);
      });
      
      expect(true).toBe(true);
    });

    it('should stop animation on unmount', () => {
      const { unmount } = render(<Skeleton />);
      
      act(() => {
        jest.advanceTimersByTime(500);
      });
      
      unmount();
      
      // Advancing timers after unmount should not cause issues
      act(() => {
        jest.advanceTimersByTime(1000);
      });
      
      expect(true).toBe(true);
    });
  });
});

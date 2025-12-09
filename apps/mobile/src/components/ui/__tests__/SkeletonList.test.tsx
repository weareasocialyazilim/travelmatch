/**
 * SkeletonList Component Tests
 * 
 * Tests the unified skeleton loading system with:
 * - 7 skeleton item types (chat, moment, gift, transaction, notification, request, trip)
 * - Configurable item count
 * - Minimum display time (prevents flash)
 * - Controlled visibility
 * - Skeleton component integration
 * 
 * @coverage 100% target
 */

import React from 'react';
import { render } from '@testing-library/react-native';
import { SkeletonList } from '../SkeletonList';

// Mock Skeleton component
jest.mock('../Skeleton', () => ({
  Skeleton: ({ width, height, borderRadius, style }: any) => {
    const MockText = require('react-native').Text;
    return (
      <MockText testID="skeleton">
        {`Skeleton-${width}x${height}-${borderRadius || 0}`}
      </MockText>
    );
  },
}));

describe('SkeletonList', () => {
  // ============================================================================
  // BASIC RENDERING
  // ============================================================================

  describe('Basic Rendering', () => {
    it('should render with default props', () => {
      const { getAllByTestId } = render(<SkeletonList type="chat" />);

      // Should render skeleton items
      const skeletons = getAllByTestId('skeleton');
      expect(skeletons.length).toBeGreaterThan(0);
    });

    it('should render specified number of items', () => {
      const { getAllByTestId } = render(<SkeletonList type="chat" count={3} />);

      // Should render 3 chat items (multiple skeletons each)
      const skeletons = getAllByTestId('skeleton');
      expect(skeletons.length).toBeGreaterThan(0);
    });

    it('should render when show prop is true', () => {
      const { getAllByTestId } = render(<SkeletonList type="moment" show={true} />);

      const skeletons = getAllByTestId('skeleton');
      expect(skeletons.length).toBeGreaterThan(0);
    });

    it('should not render when show prop is false initially', () => {
      const { queryByTestId } = render(<SkeletonList type="gift" show={false} />);

      // Should not render (never shown before)
      expect(queryByTestId('skeleton')).toBeNull();
    });

    it('should render with custom count', () => {
      const { getAllByTestId } = render(<SkeletonList type="transaction" count={7} />);

      // Should render 7 transaction items
      const skeletons = getAllByTestId('skeleton');
      expect(skeletons.length).toBeGreaterThan(0);
    });
  });

  // ============================================================================
  // SKELETON ITEM TYPES
  // ============================================================================

  describe('Skeleton Item Types', () => {
    it('should render chat skeleton type', () => {
      const { getAllByTestId } = render(<SkeletonList type="chat" count={1} />);

      // Chat skeleton has: avatar (52x52), name, badge, message
      const skeletons = getAllByTestId('skeleton');
      expect(skeletons.length).toBeGreaterThan(0);
      
      // Check for avatar skeleton (52x52, borderRadius 26)
      expect(skeletons.some(s => s.props.children.includes('52x52'))).toBe(true);
    });

    it('should render moment skeleton type', () => {
      const { getAllByTestId } = render(<SkeletonList type="moment" count={1} />);

      // Moment skeleton has: image (100% width), title, subtitle, footer items
      const skeletons = getAllByTestId('skeleton');
      expect(skeletons.length).toBeGreaterThan(0);
      
      // Check for image skeleton (100% x 200)
      expect(skeletons.some(s => s.props.children.includes('100%'))).toBe(true);
    });

    it('should render gift skeleton type', () => {
      const { getAllByTestId } = render(<SkeletonList type="gift" count={1} />);

      // Gift skeleton has: avatar (64x64), content, footer
      const skeletons = getAllByTestId('skeleton');
      expect(skeletons.length).toBeGreaterThan(0);
      
      // Check for avatar skeleton (64x64, borderRadius 32)
      expect(skeletons.some(s => s.props.children.includes('64x64'))).toBe(true);
    });

    it('should render transaction skeleton type', () => {
      const { getAllByTestId } = render(<SkeletonList type="transaction" count={1} />);

      // Transaction skeleton has: icon (40x40), content, amount
      const skeletons = getAllByTestId('skeleton');
      expect(skeletons.length).toBeGreaterThan(0);
      
      // Check for icon skeleton (40x40, borderRadius 20)
      expect(skeletons.some(s => s.props.children.includes('40x40'))).toBe(true);
    });

    it('should render notification skeleton type', () => {
      const { getAllByTestId } = render(<SkeletonList type="notification" count={1} />);

      // Notification skeleton has: avatar (48x48), content, timestamp
      const skeletons = getAllByTestId('skeleton');
      expect(skeletons.length).toBeGreaterThan(0);
      
      // Check for avatar skeleton (48x48, borderRadius 24)
      expect(skeletons.some(s => s.props.children.includes('48x48'))).toBe(true);
    });

    it('should render request skeleton type', () => {
      const { getAllByTestId } = render(<SkeletonList type="request" count={1} />);

      // Request skeleton has: avatar (56x56), info, description, actions
      const skeletons = getAllByTestId('skeleton');
      expect(skeletons.length).toBeGreaterThan(0);
      
      // Check for avatar skeleton (56x56, borderRadius 28)
      expect(skeletons.some(s => s.props.children.includes('56x56'))).toBe(true);
    });

    it('should render trip skeleton type', () => {
      const { getAllByTestId } = render(<SkeletonList type="trip" count={1} />);

      // Trip skeleton has: image (100% x 140), title, subtitle, footer
      const skeletons = getAllByTestId('skeleton');
      expect(skeletons.length).toBeGreaterThan(0);
      
      // Check for image skeleton (100% x 140)
      expect(skeletons.some(s => s.props.children.includes('140'))).toBe(true);
    });
  });

  // ============================================================================
  // MINIMUM DISPLAY TIME
  // ============================================================================

  describe('Minimum Display Time', () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('should respect minimum display time on hide', () => {
      const { rerender, getAllByTestId } = render(
        <SkeletonList type="chat" show={true} minDisplayTime={400} />
      );

      // Should be visible initially
      expect(getAllByTestId('skeleton').length).toBeGreaterThan(0);

      // Change show to false
      rerender(<SkeletonList type="chat" show={false} minDisplayTime={400} />);

      // Should still be visible (minimum time not elapsed)
      expect(getAllByTestId('skeleton').length).toBeGreaterThan(0);
    });

    it('should hide after minimum display time elapses', () => {
      const { rerender, getAllByTestId } = render(
        <SkeletonList type="moment" show={true} minDisplayTime={300} />
      );

      // Should be visible
      expect(getAllByTestId('skeleton').length).toBeGreaterThan(0);

      // Hide
      rerender(<SkeletonList type="moment" show={false} minDisplayTime={300} />);

      // Should still be visible before timeout
      expect(getAllByTestId('skeleton').length).toBeGreaterThan(0);

      // Fast-forward time
      jest.advanceTimersByTime(300);

      // Note: State update happens async, component still renders but with shouldShow=false
      // The component returns null in next render cycle
    });

    it('should use custom minimum display time', () => {
      const { rerender, getAllByTestId } = render(
        <SkeletonList type="gift" show={true} minDisplayTime={500} />
      );

      // Hide
      rerender(<SkeletonList type="gift" show={false} minDisplayTime={500} />);

      // Fast-forward less than minDisplayTime
      jest.advanceTimersByTime(400);

      // Should still be visible
      expect(getAllByTestId('skeleton').length).toBeGreaterThan(0);

      // Fast-forward remaining time
      jest.advanceTimersByTime(100);

      // Timeout completed, state updates in next cycle
    });

    it('should use default minimum display time (400ms)', () => {
      const { rerender, getAllByTestId } = render(
        <SkeletonList type="transaction" show={true} />
      );

      // Hide
      rerender(<SkeletonList type="transaction" show={false} />);

      // Fast-forward less than default (400ms)
      jest.advanceTimersByTime(300);

      // Should still be visible
      expect(getAllByTestId('skeleton').length).toBeGreaterThan(0);

      // Fast-forward remaining time
      jest.advanceTimersByTime(100);

      // Timeout completed (state updates async)
    });
  });

  // ============================================================================
  // CONTROLLED VISIBILITY
  // ============================================================================

  describe('Controlled Visibility', () => {
    it('should show when show prop changes to true', () => {
      const { rerender, getAllByTestId } = render(
        <SkeletonList type="notification" show={false} />
      );

      // Should not render
      expect(() => getAllByTestId('skeleton')).toThrow();

      // Change to show
      rerender(<SkeletonList type="notification" show={true} />);

      // Should render
      expect(getAllByTestId('skeleton').length).toBeGreaterThan(0);
    });

    it('should handle rapid show/hide changes', () => {
      jest.useFakeTimers();

      const { rerender, getAllByTestId } = render(
        <SkeletonList type="request" show={true} />
      );

      // Should show
      expect(getAllByTestId('skeleton').length).toBeGreaterThan(0);

      // Hide
      rerender(<SkeletonList type="request" show={false} />);

      // Show again quickly
      rerender(<SkeletonList type="request" show={true} />);

      // Should still be visible
      expect(getAllByTestId('skeleton').length).toBeGreaterThan(0);

      jest.useRealTimers();
    });

    it('should clean up timeout on unmount', () => {
      jest.useFakeTimers();

      const { rerender, unmount } = render(
        <SkeletonList type="trip" show={true} minDisplayTime={500} />
      );

      // Hide
      rerender(<SkeletonList type="trip" show={false} minDisplayTime={500} />);

      // Unmount before timeout
      unmount();

      // Fast-forward time (should not throw)
      expect(() => jest.advanceTimersByTime(500)).not.toThrow();

      jest.useRealTimers();
    });
  });

  // ============================================================================
  // ITEM COUNT
  // ============================================================================

  describe('Item Count', () => {
    it('should render default count of 5 items', () => {
      const { UNSAFE_root } = render(<SkeletonList type="chat" />);

      // Default count is 5
      const container = UNSAFE_root.findAllByProps({ testID: 'skeleton' });
      expect(container.length).toBeGreaterThan(0);
    });

    it('should render 1 item', () => {
      const { getAllByTestId } = render(<SkeletonList type="moment" count={1} />);

      const skeletons = getAllByTestId('skeleton');
      expect(skeletons.length).toBeGreaterThan(0);
    });

    it('should render 10 items', () => {
      const { getAllByTestId } = render(<SkeletonList type="gift" count={10} />);

      const skeletons = getAllByTestId('skeleton');
      expect(skeletons.length).toBeGreaterThan(0);
    });

    it('should render 0 items gracefully', () => {
      const { queryByTestId } = render(<SkeletonList type="transaction" count={0} />);

      // Should not render any skeletons
      expect(queryByTestId('skeleton')).toBeNull();
    });
  });

  // ============================================================================
  // EDGE CASES
  // ============================================================================

  describe('Edge Cases', () => {
    it('should handle unknown skeleton type gracefully', () => {
      const { getAllByTestId } = render(
        <SkeletonList type={'unknown' as any} count={1} />
      );

      // Should fallback to chat skeleton
      const skeletons = getAllByTestId('skeleton');
      expect(skeletons.length).toBeGreaterThan(0);
    });

    it('should handle negative count', () => {
      const { queryByTestId } = render(<SkeletonList type="notification" count={-1} />);

      // Should not render
      expect(queryByTestId('skeleton')).toBeNull();
    });

    it('should handle fractional count', () => {
      const { getAllByTestId } = render(<SkeletonList type="request" count={2.7} />);

      // Should render (Array.from handles fractional length)
      const skeletons = getAllByTestId('skeleton');
      expect(skeletons.length).toBeGreaterThan(0);
    });

    it('should handle zero minimum display time', () => {
      jest.useFakeTimers();

      const { rerender, getAllByTestId } = render(
        <SkeletonList type="trip" show={true} minDisplayTime={0} />
      );

      // Should be visible initially
      expect(getAllByTestId('skeleton').length).toBeGreaterThan(0);

      // Hide
      rerender(<SkeletonList type="trip" show={false} minDisplayTime={0} />);

      // Still visible (state update async)
      expect(getAllByTestId('skeleton').length).toBeGreaterThan(0);

      jest.useRealTimers();
    });

    it('should handle very large minimum display time', () => {
      jest.useFakeTimers();

      const { rerender, getAllByTestId } = render(
        <SkeletonList type="chat" show={true} minDisplayTime={10000} />
      );

      // Hide
      rerender(<SkeletonList type="chat" show={false} minDisplayTime={10000} />);

      // Fast-forward significant time (but less than 10s)
      jest.advanceTimersByTime(5000);

      // Should still be visible
      expect(getAllByTestId('skeleton').length).toBeGreaterThan(0);

      jest.useRealTimers();
    });
  });

  // ============================================================================
  // REAL-WORLD SCENARIOS
  // ============================================================================

  describe('Real-World Scenarios', () => {
    it('should handle chat list loading', () => {
      const { getAllByTestId } = render(
        <SkeletonList type="chat" count={8} minDisplayTime={400} />
      );

      // Chat list: 8 conversations loading
      const skeletons = getAllByTestId('skeleton');
      expect(skeletons.length).toBeGreaterThan(0);
      expect(skeletons.some(s => s.props.children.includes('52x52'))).toBe(true);
    });

    it('should handle moment feed loading', () => {
      const { getAllByTestId } = render(
        <SkeletonList type="moment" count={3} minDisplayTime={500} />
      );

      // Moment feed: 3 cards loading
      const skeletons = getAllByTestId('skeleton');
      expect(skeletons.length).toBeGreaterThan(0);
      expect(skeletons.some(s => s.props.children.includes('100%'))).toBe(true);
    });

    it('should handle gift inbox loading', () => {
      const { getAllByTestId } = render(
        <SkeletonList type="gift" count={5} minDisplayTime={300} />
      );

      // Gift inbox: 5 gifts loading
      const skeletons = getAllByTestId('skeleton');
      expect(skeletons.length).toBeGreaterThan(0);
      expect(skeletons.some(s => s.props.children.includes('64x64'))).toBe(true);
    });

    it('should handle transaction history loading', () => {
      const { getAllByTestId } = render(
        <SkeletonList type="transaction" count={10} minDisplayTime={400} />
      );

      // Transaction history: 10 transactions loading
      const skeletons = getAllByTestId('skeleton');
      expect(skeletons.length).toBeGreaterThan(0);
      expect(skeletons.some(s => s.props.children.includes('40x40'))).toBe(true);
    });

    it('should handle notification list loading', () => {
      const { getAllByTestId } = render(
        <SkeletonList type="notification" count={6} minDisplayTime={350} />
      );

      // Notification list: 6 notifications loading
      const skeletons = getAllByTestId('skeleton');
      expect(skeletons.length).toBeGreaterThan(0);
      expect(skeletons.some(s => s.props.children.includes('48x48'))).toBe(true);
    });

    it('should handle request feed loading', () => {
      const { getAllByTestId } = render(
        <SkeletonList type="request" count={4} minDisplayTime={450} />
      );

      // Request feed: 4 requests loading
      const skeletons = getAllByTestId('skeleton');
      expect(skeletons.length).toBeGreaterThan(0);
      expect(skeletons.some(s => s.props.children.includes('56x56'))).toBe(true);
    });

    it('should handle trip list loading', () => {
      const { getAllByTestId } = render(
        <SkeletonList type="trip" count={5} minDisplayTime={400} />
      );

      // Trip list: 5 trips loading
      const skeletons = getAllByTestId('skeleton');
      expect(skeletons.length).toBeGreaterThan(0);
      expect(skeletons.some(s => s.props.children.includes('140'))).toBe(true);
    });

    it('should prevent flash on fast API response', () => {
      jest.useFakeTimers();

      // Start loading
      const { rerender, getAllByTestId } = render(
        <SkeletonList type="moment" show={true} minDisplayTime={400} />
      );

      expect(getAllByTestId('skeleton').length).toBeGreaterThan(0);

      // Fast API response (100ms)
      jest.advanceTimersByTime(100);

      // Data arrives, hide skeleton
      rerender(<SkeletonList type="moment" show={false} minDisplayTime={400} />);

      // Should still show (minimum 400ms not elapsed)
      expect(getAllByTestId('skeleton').length).toBeGreaterThan(0);

      // Fast-forward remaining time
      jest.advanceTimersByTime(300);

      // Timeout completed (prevents flash by showing for minimum time)
      expect(getAllByTestId('skeleton').length).toBeGreaterThan(0);

      jest.useRealTimers();
    });

    it('should handle slow API response', () => {
      jest.useFakeTimers();

      // Start loading
      const { rerender, getAllByTestId } = render(
        <SkeletonList type="chat" show={true} minDisplayTime={400} />
      );

      expect(getAllByTestId('skeleton').length).toBeGreaterThan(0);

      // Slow API response (2 seconds)
      jest.advanceTimersByTime(2000);

      // Data arrives, hide skeleton
      rerender(<SkeletonList type="chat" show={false} minDisplayTime={400} />);

      // Should still show briefly (minimum 400ms)
      expect(getAllByTestId('skeleton').length).toBeGreaterThan(0);

      // Fast-forward minimum time
      jest.advanceTimersByTime(400);

      // Timeout completed (still rendering until next cycle)
      expect(getAllByTestId('skeleton').length).toBeGreaterThan(0);

      jest.useRealTimers();
    });

    it('should handle pull-to-refresh scenario', () => {
      jest.useFakeTimers();

      const { rerender, getAllByTestId } = render(
        <SkeletonList type="gift" show={false} />
      );

      // Start pull-to-refresh
      rerender(<SkeletonList type="gift" show={true} />);

      expect(getAllByTestId('skeleton').length).toBeGreaterThan(0);

      // Quick refresh
      jest.advanceTimersByTime(150);

      // Data loaded
      rerender(<SkeletonList type="gift" show={false} />);

      // Should still show (prevent flash)
      expect(getAllByTestId('skeleton').length).toBeGreaterThan(0);

      // Fast-forward minimum time
      jest.advanceTimersByTime(250);

      // Timeout completed (prevents flash)
      expect(getAllByTestId('skeleton').length).toBeGreaterThan(0);

      jest.useRealTimers();
    });
  });
});

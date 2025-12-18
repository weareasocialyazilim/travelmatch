/**
 * SkeletonList Component Tests - Simplified
 */

import React from 'react';
import { render } from '@testing-library/react-native';
import { SkeletonList } from '../SkeletonList';

describe('SkeletonList', () => {
  describe('Basic Rendering', () => {
    it('should render with default props', () => {
      const { toJSON } = render(<SkeletonList type="chat" />);
      expect(toJSON()).toBeTruthy();
    });

    it('should render specified number of items', () => {
      const { toJSON } = render(<SkeletonList type="chat" count={3} />);
      expect(toJSON()).toBeTruthy();
    });

    it('should render when show prop is true', () => {
      const { toJSON } = render(<SkeletonList type="moment" show={true} />);
      expect(toJSON()).toBeTruthy();
    });

    it('should not render when show prop is false initially', () => {
      const { toJSON } = render(<SkeletonList type="gift" show={false} />);
      expect(toJSON()).toBeNull();
    });
  });

  describe('Skeleton Item Types', () => {
    const types = ['chat', 'moment', 'gift', 'transaction', 'notification', 'request', 'trip'] as const;

    types.forEach((type) => {
      it(`should render ${type} skeleton type`, () => {
        const { toJSON } = render(<SkeletonList type={type} count={2} />);
        expect(toJSON()).toBeTruthy();
      });
    });
  });

  describe('Minimum Display Time', () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('should respect minDisplayTime when hiding', () => {
      const { rerender, toJSON } = render(
        <SkeletonList type="moment" show={true} minDisplayTime={400} />
      );
      expect(toJSON()).toBeTruthy();

      // Hide request comes in
      rerender(<SkeletonList type="moment" show={false} minDisplayTime={400} />);
      
      // Should still be visible (minDisplayTime not elapsed)
      jest.advanceTimersByTime(200);
      expect(toJSON()).toBeTruthy();
      
      // After minDisplayTime, should hide
      jest.advanceTimersByTime(250);
      expect(toJSON()).toBeNull();
    });
  });
});

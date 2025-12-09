/**
 * LoadingState Component Tests
 */

import React from 'react';
import { render } from '@testing-library/react-native';
import { LoadingState } from '../LoadingState';

describe('LoadingState', () => {
  describe('Spinner Type', () => {
    it('should render spinner type', () => {
      const { UNSAFE_root } = render(<LoadingState type="spinner" />);
      
      expect(UNSAFE_root).toBeTruthy();
    });

    it('should render small spinner', () => {
      const { UNSAFE_root } = render(
        <LoadingState type="spinner" size="small" />
      );
      
      expect(UNSAFE_root).toBeTruthy();
    });

    it('should render large spinner', () => {
      const { UNSAFE_root } = render(
        <LoadingState type="spinner" size="large" />
      );
      
      expect(UNSAFE_root).toBeTruthy();
    });

    it('should render spinner with custom color', () => {
      const { UNSAFE_root } = render(
        <LoadingState type="spinner" color="#FF0000" />
      );
      
      expect(UNSAFE_root).toBeTruthy();
    });
  });

  describe('Skeleton Type', () => {
    it('should render skeleton type with default count', () => {
      const { UNSAFE_root } = render(<LoadingState type="skeleton" />);
      
      expect(UNSAFE_root).toBeTruthy();
    });

    it('should render skeleton type with custom count', () => {
      const { UNSAFE_root } = render(
        <LoadingState type="skeleton" count={5} />
      );
      
      expect(UNSAFE_root).toBeTruthy();
    });

    it('should render skeleton type with zero count', () => {
      const { UNSAFE_root } = render(
        <LoadingState type="skeleton" count={0} />
      );
      
      expect(UNSAFE_root).toBeTruthy();
    });

    it('should render skeleton type with large count', () => {
      const { UNSAFE_root } = render(
        <LoadingState type="skeleton" count={10} />
      );
      
      expect(UNSAFE_root).toBeTruthy();
    });
  });

  describe('Overlay Type', () => {
    it('should render overlay type', () => {
      const { UNSAFE_root } = render(<LoadingState type="overlay" />);
      
      expect(UNSAFE_root).toBeTruthy();
    });

    it('should render overlay with message', () => {
      const message = 'Loading data...';
      const { getByText } = render(
        <LoadingState type="overlay" message={message} />
      );
      
      expect(getByText(message)).toBeTruthy();
    });

    it('should render overlay without message', () => {
      const { queryByText } = render(<LoadingState type="overlay" />);
      
      // No default message should be rendered
      expect(queryByText('Loading')).toBeNull();
    });

    it('should render overlay with custom color', () => {
      const { UNSAFE_root } = render(
        <LoadingState type="overlay" color="#00FF00" />
      );
      
      expect(UNSAFE_root).toBeTruthy();
    });
  });

  describe('Edge Cases', () => {
    it('should handle undefined type gracefully', () => {
      // @ts-expect-error Testing invalid type
      const { UNSAFE_root } = render(<LoadingState type={undefined} />);
      
      expect(UNSAFE_root).toBeTruthy();
    });

    it('should handle negative count in skeleton', () => {
      const { UNSAFE_root } = render(
        <LoadingState type="skeleton" count={-1} />
      );
      
      expect(UNSAFE_root).toBeTruthy();
    });

    it('should handle very long message in overlay', () => {
      const longMessage = 'This is a very long loading message that should wrap properly and not break the layout';
      const { getByText } = render(
        <LoadingState type="overlay" message={longMessage} />
      );
      
      expect(getByText(longMessage)).toBeTruthy();
    });
  });

  describe('Type Combinations', () => {
    it('should render spinner with all props', () => {
      const { UNSAFE_root } = render(
        <LoadingState
          type="spinner"
          size="large"
          color="#FF5733"
        />
      );
      
      expect(UNSAFE_root).toBeTruthy();
    });

    it('should render skeleton with all props', () => {
      const { UNSAFE_root } = render(
        <LoadingState
          type="skeleton"
          count={7}
          color="#3498db"
        />
      );
      
      expect(UNSAFE_root).toBeTruthy();
    });

    it('should render overlay with all props', () => {
      const { getByText } = render(
        <LoadingState
          type="overlay"
          message="Please wait..."
          color="#2ecc71"
          size="large"
        />
      );
      
      expect(getByText('Please wait...')).toBeTruthy();
    });
  });
});

/**
 * LoadingState Component Tests
 */

import React from 'react';
import { render } from '@testing-library/react-native';
import { LoadingState } from '../LoadingState';

describe('LoadingState', () => {
  describe('Spinner Type', () => {
    it('should render spinner type', () => {
      render(<LoadingState type="spinner" />);
    });

    it('should render small spinner', () => {
      render(<LoadingState type="spinner" size="small" />);
    });

    it('should render large spinner', () => {
      render(<LoadingState type="spinner" size="large" />);
    });

    it('should render spinner with custom color', () => {
      render(<LoadingState type="spinner" color="#FF0000" />);
    });
  });

  describe('Skeleton Type', () => {
    it('should render skeleton type with default count', () => {
      render(<LoadingState type="skeleton" />);
    });

    it('should render skeleton type with custom count', () => {
      render(<LoadingState type="skeleton" count={5} />);
    });

    it('should render skeleton type with zero count', () => {
      render(<LoadingState type="skeleton" count={0} />);
    });

    it('should render skeleton type with large count', () => {
      render(<LoadingState type="skeleton" count={10} />);
    });
  });

  describe('Overlay Type', () => {
    it('should render overlay type', () => {
      render(<LoadingState type="overlay" />);
    });

    it('should render overlay with message', () => {
      const message = 'Loading data...';
      const { getByText } = render(
        <LoadingState type="overlay" message={message} />,
      );

      expect(getByText(message)).toBeTruthy();
    });

    it('should render overlay without message', () => {
      const { queryByText } = render(<LoadingState type="overlay" />);

      // No default message should be rendered
      expect(queryByText('Loading')).toBeNull();
    });

    it('should render overlay with custom color', () => {
      render(<LoadingState type="overlay" color="#00FF00" />);
    });
  });

  describe('Edge Cases', () => {
    it('should handle undefined type gracefully', () => {
      // @ts-expect-error Testing invalid type
      render(<LoadingState type={undefined} />);
    });

    it('should handle negative count in skeleton', () => {
      render(<LoadingState type="skeleton" count={-1} />);
    });

    it('should handle very long message in overlay', () => {
      const longMessage =
        'This is a very long loading message that should wrap properly and not break the layout';
      const { getByText } = render(
        <LoadingState type="overlay" message={longMessage} />,
      );

      expect(getByText(longMessage)).toBeTruthy();
    });
  });

  describe('Type Combinations', () => {
    it('should render spinner with all props', () => {
      render(<LoadingState type="spinner" size="large" color="#FF5733" />);
    });

    it('should render skeleton with all props', () => {
      render(<LoadingState type="skeleton" count={7} color="#3498db" />);
    });

    it('should render overlay with all props', () => {
      const { getByText } = render(
        <LoadingState
          type="overlay"
          message="Please wait..."
          color="#2ecc71"
          size="large"
        />,
      );

      expect(getByText('Please wait...')).toBeTruthy();
    });
  });
});

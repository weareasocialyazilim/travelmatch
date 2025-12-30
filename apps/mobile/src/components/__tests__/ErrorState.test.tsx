/**
 * ErrorState Component Tests
 */

import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { ErrorState } from '../ErrorState';

describe('ErrorState', () => {
  describe('Rendering', () => {
    it('should render with default props', () => {
      const { getByText } = render(<ErrorState />);
      
      expect(getByText('Oops!')).toBeTruthy();
      expect(getByText('Something went wrong')).toBeTruthy();
    });

    it('should render custom error message', () => {
      const customMessage = 'Failed to load data';
      const { getByText } = render(<ErrorState message={customMessage} />);
      
      expect(getByText(customMessage)).toBeTruthy();
      expect(getByText('Oops!')).toBeTruthy();
    });

    it('should render custom retry text', () => {
      const customRetryText = 'Reload';
      const { getByText } = render(
        <ErrorState onRetry={jest.fn()} retryText={customRetryText} />
      );
      
      expect(getByText(customRetryText)).toBeTruthy();
    });

    it('should not render retry button when onRetry is not provided', () => {
      const { queryByText } = render(<ErrorState />);
      
      expect(queryByText('Try Again')).toBeNull();
    });

    it('should render retry button when onRetry is provided', () => {
      const { getByText } = render(<ErrorState onRetry={jest.fn()} />);
      
      expect(getByText('Try Again')).toBeTruthy();
    });
  });

  describe('Retry Functionality', () => {
    it('should call onRetry when retry button is pressed', () => {
      const mockOnRetry = jest.fn() as jest.Mock;
      const { getByText } = render(<ErrorState onRetry={mockOnRetry} />);
      
      const retryButton = getByText('Try Again');
      fireEvent.press(retryButton);
      
      expect(mockOnRetry).toHaveBeenCalledTimes(1);
    });

    it('should call onRetry multiple times when pressed multiple times', () => {
      const mockOnRetry = jest.fn() as jest.Mock;
      const { getByText } = render(<ErrorState onRetry={mockOnRetry} />);
      
      const retryButton = getByText('Try Again');
      fireEvent.press(retryButton);
      fireEvent.press(retryButton);
      fireEvent.press(retryButton);
      
      expect(mockOnRetry).toHaveBeenCalledTimes(3);
    });
  });

  describe('Custom Styling', () => {
    it('should apply custom style', () => {
      const customStyle = { backgroundColor: 'red', padding: 20 };
      const { UNSAFE_root } = render(<ErrorState style={customStyle} />);
      
      expect(UNSAFE_root).toBeTruthy();
    });
  });

  describe('Icon Variations', () => {
    it('should render with custom icon', () => {
      const { UNSAFE_root } = render(
        <ErrorState icon="cloud-off-outline" />
      );
      
      expect(UNSAFE_root).toBeTruthy();
    });

    it('should render with default icon when not specified', () => {
      const { UNSAFE_root } = render(<ErrorState />);
      
      expect(UNSAFE_root).toBeTruthy();
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty message', () => {
      const { getByText } = render(<ErrorState message="" />);
      
      expect(getByText('Oops!')).toBeTruthy();
    });

    it('should handle long error messages', () => {
      const longMessage = 'This is a very long error message that should still render correctly even though it contains many words and might wrap to multiple lines';
      const { getByText } = render(<ErrorState message={longMessage} />);
      
      expect(getByText(longMessage)).toBeTruthy();
    });

    it('should handle special characters in message', () => {
      const specialMessage = 'Error: 404 - Not Found! @#$%';
      const { getByText } = render(<ErrorState message={specialMessage} />);
      
      expect(getByText(specialMessage)).toBeTruthy();
    });
  });
});

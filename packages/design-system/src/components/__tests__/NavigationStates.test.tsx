/**
 * Navigation States Component Tests
 *
 * Complete test coverage for EmptyState, OfflineState, ErrorState, LoadingState
 */

import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import {
  EmptyState,
  OfflineState,
  ErrorState,
  LoadingState,
} from '../NavigationStates';

describe('NavigationStates', () => {
  describe('EmptyState', () => {
    it('should render with default empty type', () => {
      const { getByText } = render(<EmptyState />);

      expect(getByText('No Content')).toBeTruthy();
      expect(getByText('There is no content to display')).toBeTruthy();
    });

    it('should render all empty state types', () => {
      const types = [
        'empty',
        'no-results',
        'no-matches',
        'no-messages',
        'no-trips',
        'no-notifications',
        'no-favorites',
      ];

      types.forEach((type) => {
        const { getByTestId } = render(
          <EmptyState type={type} testID={`empty-${type}`} />,
        );
        expect(getByTestId(`empty-${type}`)).toBeTruthy();
      });
    });

    it('should render custom title and message', () => {
      const customTitle = 'Custom Title';
      const customMessage = 'Custom message text';

      const { getByText } = render(
        <EmptyState title={customTitle} message={customMessage} />,
      );

      expect(getByText(customTitle)).toBeTruthy();
      expect(getByText(customMessage)).toBeTruthy();
    });

    it('should render action button with custom label', () => {
      const actionLabel = 'Click Me';
      const onAction = jest.fn();

      const { getByText } = render(
        <EmptyState actionLabel={actionLabel} onAction={onAction} />,
      );

      const button = getByText(actionLabel);
      expect(button).toBeTruthy();
      fireEvent.press(button);
      expect(onAction).toHaveBeenCalledTimes(1);
    });

    it('should render secondary action button', () => {
      const primaryAction = jest.fn();
      const secondaryAction = jest.fn();

      const { getByText } = render(
        <EmptyState
          actionLabel="Primary"
          onAction={primaryAction}
          secondaryActionLabel="Secondary"
          onSecondaryAction={secondaryAction}
        />,
      );

      fireEvent.press(getByText('Primary'));
      expect(primaryAction).toHaveBeenCalled();

      fireEvent.press(getByText('Secondary'));
      expect(secondaryAction).toHaveBeenCalled();
    });

    it('should render in compact mode', () => {
      const { getByTestId } = render(
        <EmptyState compact testID="compact-empty" />,
      );

      expect(getByTestId('compact-empty')).toBeTruthy();
    });

    it('should render custom icon', () => {
      const { getByTestId } = render(
        <EmptyState icon="custom-icon" testID="icon-empty" />,
      );

      expect(getByTestId('icon-empty')).toBeTruthy();
    });

    it('should not render action when no onAction provided', () => {
      const { queryByText } = render(<EmptyState actionLabel="Action" />);

      expect(queryByText('Action')).toBeNull();
    });
  });

  describe('OfflineState', () => {
    it('should render full screen mode by default', () => {
      const { getByText } = render(<OfflineState />);

      expect(getByText('No Internet Connection')).toBeTruthy();
      expect(getByText(/Please check your connection/)).toBeTruthy();
    });

    it('should render banner mode', () => {
      const { getByText } = render(<OfflineState showBanner />);

      expect(getByText('No Internet')).toBeTruthy();
    });

    it('should call retry callback', () => {
      const onRetry = jest.fn();

      const { getByText } = render(<OfflineState onRetry={onRetry} />);

      fireEvent.press(getByText('Try Again'));
      expect(onRetry).toHaveBeenCalledTimes(1);
    });

    it('should render custom message', () => {
      const customMessage = 'Custom offline message';

      const { getByText } = render(<OfflineState message={customMessage} />);

      expect(getByText(customMessage)).toBeTruthy();
    });

    it('should hide retry button when onRetry not provided', () => {
      const { queryByText } = render(<OfflineState />);

      expect(queryByText('Try Again')).toBeNull();
    });

    it('should render in compact mode', () => {
      const { getByTestId } = render(
        <OfflineState compact testID="compact-offline" />,
      );

      expect(getByTestId('compact-offline')).toBeTruthy();
    });
  });

  describe('ErrorState', () => {
    it('should render generic error by default', () => {
      const { getByText } = render(<ErrorState />);

      expect(getByText('Something Went Wrong')).toBeTruthy();
    });

    it('should render error message from Error object', () => {
      const error = new Error('Custom error message');

      const { getByText } = render(<ErrorState error={error} />);

      expect(getByText('Custom error message')).toBeTruthy();
    });

    it('should render error message from string', () => {
      const errorMessage = 'String error message';

      const { getByText } = render(<ErrorState error={errorMessage} />);

      expect(getByText(errorMessage)).toBeTruthy();
    });

    it('should call retry callback', () => {
      const onRetry = jest.fn();

      const { getByText } = render(<ErrorState onRetry={onRetry} />);

      fireEvent.press(getByText('Try Again'));
      expect(onRetry).toHaveBeenCalledTimes(1);
    });

    it('should call report callback', () => {
      const onReport = jest.fn();

      const { getByText } = render(<ErrorState onReport={onReport} />);

      fireEvent.press(getByText('Report Issue'));
      expect(onReport).toHaveBeenCalledTimes(1);
    });

    it('should render custom title', () => {
      const customTitle = 'Custom Error Title';

      const { getByText } = render(<ErrorState title={customTitle} />);

      expect(getByText(customTitle)).toBeTruthy();
    });

    it('should hide retry button when onRetry not provided', () => {
      const { queryByText } = render(<ErrorState />);

      expect(queryByText('Try Again')).toBeNull();
    });

    it('should hide report button when onReport not provided', () => {
      const { queryByText } = render(<ErrorState />);

      expect(queryByText('Report Issue')).toBeNull();
    });

    it('should render in compact mode', () => {
      const { getByTestId } = render(
        <ErrorState compact testID="compact-error" />,
      );

      expect(getByTestId('compact-error')).toBeTruthy();
    });

    it('should handle both retry and report actions', () => {
      const onRetry = jest.fn();
      const onReport = jest.fn();

      const { getByText } = render(
        <ErrorState onRetry={onRetry} onReport={onReport} />,
      );

      fireEvent.press(getByText('Try Again'));
      expect(onRetry).toHaveBeenCalledTimes(1);

      fireEvent.press(getByText('Report Issue'));
      expect(onReport).toHaveBeenCalledTimes(1);
    });
  });

  describe('LoadingState', () => {
    it('should render with default message', () => {
      const { getByText } = render(<LoadingState />);

      expect(getByText('Loading...')).toBeTruthy();
    });

    it('should render custom message', () => {
      const customMessage = 'Please wait...';

      const { getByText } = render(<LoadingState message={customMessage} />);

      expect(getByText(customMessage)).toBeTruthy();
    });

    it('should render without message', () => {
      const { queryByText } = render(<LoadingState message={null} />);

      expect(queryByText('Loading...')).toBeNull();
    });

    it('should render activity indicator', () => {
      const { getByTestId } = render(<LoadingState testID="loading" />);

      expect(getByTestId('loading')).toBeTruthy();
    });

    it('should render in compact mode', () => {
      const { getByTestId } = render(
        <LoadingState compact testID="compact-loading" />,
      );

      expect(getByTestId('compact-loading')).toBeTruthy();
    });

    it('should render with custom size', () => {
      const { getByTestId } = render(
        <LoadingState size="large" testID="large-loading" />,
      );

      expect(getByTestId('large-loading')).toBeTruthy();
    });

    it('should render with custom color', () => {
      const customColor = '#FF0000';

      const { getByTestId } = render(
        <LoadingState color={customColor} testID="colored-loading" />,
      );

      expect(getByTestId('colored-loading')).toBeTruthy();
    });
  });

  describe('Accessibility', () => {
    it('EmptyState should have accessible label', () => {
      const { getByLabelText } = render(
        <EmptyState accessibilityLabel="Empty state" />,
      );

      expect(getByLabelText('Empty state')).toBeTruthy();
    });

    it('OfflineState should have accessible label', () => {
      const { getByLabelText } = render(
        <OfflineState accessibilityLabel="Offline state" />,
      );

      expect(getByLabelText('Offline state')).toBeTruthy();
    });

    it('ErrorState should have accessible label', () => {
      const { getByLabelText } = render(
        <ErrorState accessibilityLabel="Error state" />,
      );

      expect(getByLabelText('Error state')).toBeTruthy();
    });

    it('LoadingState should have accessible label', () => {
      const { getByLabelText } = render(
        <LoadingState accessibilityLabel="Loading state" />,
      );

      expect(getByLabelText('Loading state')).toBeTruthy();
    });

    it('Action buttons should have accessible roles', () => {
      const { getByRole } = render(
        <EmptyState actionLabel="Action" onAction={() => {}} />,
      );

      expect(getByRole('button')).toBeTruthy();
    });
  });

  describe('Edge Cases', () => {
    it('should handle undefined error gracefully', () => {
      const { getByText } = render(<ErrorState error={undefined} />);

      expect(getByText(/went wrong/i)).toBeTruthy();
    });

    it('should handle empty string error', () => {
      const { getByText } = render(<ErrorState error="" />);

      expect(getByText(/went wrong/i)).toBeTruthy();
    });

    it('should handle very long messages', () => {
      const longMessage = 'A'.repeat(500);

      const { getByText } = render(<EmptyState message={longMessage} />);

      expect(getByText(longMessage)).toBeTruthy();
    });

    it('should handle rapid action button clicks', () => {
      const onAction = jest.fn();

      const { getByText } = render(
        <EmptyState actionLabel="Click" onAction={onAction} />,
      );

      const button = getByText('Click');
      fireEvent.press(button);
      fireEvent.press(button);
      fireEvent.press(button);

      expect(onAction).toHaveBeenCalledTimes(3);
    });
  });

  describe('Styling', () => {
    it('should apply custom style', () => {
      const customStyle = { backgroundColor: 'red' };

      const { getByTestId } = render(
        <EmptyState style={customStyle} testID="styled-empty" />,
      );

      expect(getByTestId('styled-empty')).toBeTruthy();
    });

    it('should render different sizes in compact mode', () => {
      const { rerender, getByTestId } = render(
        <LoadingState compact={false} testID="normal" />,
      );
      expect(getByTestId('normal')).toBeTruthy();

      rerender(<LoadingState compact={true} testID="compact" />);
      expect(getByTestId('compact')).toBeTruthy();
    });
  });

  describe('Integration', () => {
    it('should work with navigation', () => {
      const mockNavigate = jest.fn();

      const { getByText } = render(
        <EmptyState
          actionLabel="Go Back"
          onAction={() => mockNavigate('Home')}
        />,
      );

      fireEvent.press(getByText('Go Back'));
      expect(mockNavigate).toHaveBeenCalledWith('Home');
    });

    it('should work in list empty component', () => {
      const { getByText } = render(<EmptyState type="no-results" />);

      expect(getByText(/no results/i)).toBeTruthy();
    });

    it('should work with retry logic', async () => {
      const mockRetry = jest.fn().mockResolvedValue(true);

      const { getByText } = render(<ErrorState onRetry={mockRetry} />);

      fireEvent.press(getByText('Try Again'));
      expect(mockRetry).toHaveBeenCalled();
    });
  });
});

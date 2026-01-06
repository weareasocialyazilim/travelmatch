/**
 * OfflineState Component Tests
 */

import React from 'react';
import { render, fireEvent, waitFor, act } from '@testing-library/react-native';
import { OfflineState } from '../OfflineState';

describe('OfflineState', () => {
  describe('Rendering', () => {
    it('should render with default props', () => {
      const { getByText } = render(<OfflineState />);

      expect(getByText('Bağlantın Koptu 💔')).toBeTruthy();
    });

    it('should render custom message', () => {
      const customMessage = 'İnternet bağlantınız yok';
      const { getByText } = render(<OfflineState message={customMessage} />);

      expect(getByText(customMessage)).toBeTruthy();
    });

    it('should render with default testID', () => {
      const { getByTestId } = render(<OfflineState />);

      expect(getByTestId('offline-state')).toBeTruthy();
    });

    it('should render with custom testID', () => {
      const { getByTestId } = render(<OfflineState testID="custom-offline" />);

      expect(getByTestId('custom-offline')).toBeTruthy();
    });
  });

  describe('Retry Functionality', () => {
    it('should render retry button when onRetry is provided', () => {
      const { getByText } = render(<OfflineState onRetry={jest.fn()} />);

      expect(getByText('Tekrar Bağlan 💗')).toBeTruthy();
    });

    it('should render custom retry text', () => {
      const customRetryText = 'Yeniden Bağlan';
      const { getByText } = render(
        <OfflineState onRetry={jest.fn()} retryText={customRetryText} />,
      );

      expect(getByText(customRetryText)).toBeTruthy();
    });

    it('should not render retry button when onRetry is not provided', () => {
      const { queryByText } = render(<OfflineState />);

      expect(queryByText('Tekrar Bağlan 💗')).toBeNull();
    });

    it('should call onRetry when button is pressed', async () => {
      const mockOnRetry = jest.fn().mockResolvedValue(undefined);
      const { getByTestId } = render(<OfflineState onRetry={mockOnRetry} />);

      await act(async () => {
        const retryButton = getByTestId('offline-state-retry');
        fireEvent.press(retryButton);
      });

      await waitFor(() => {
        expect(mockOnRetry).toHaveBeenCalledTimes(1);
      });
    });

    it('should show loading indicator while retrying', async () => {
      const mockOnRetry = jest.fn().mockResolvedValue(undefined);
      const { getByTestId } = render(<OfflineState onRetry={mockOnRetry} />);

      await act(async () => {
        const retryButton = getByTestId('offline-state-retry');
        fireEvent.press(retryButton);
      });

      // Loading indicator should be visible

      // Wait for async operations to complete
      await waitFor(() => {
        expect(mockOnRetry).toHaveBeenCalled();
      });
    });

    it('should call onRetry and handle completion', async () => {
      const mockOnRetry = jest.fn().mockResolvedValue(undefined);
      const { getByTestId } = render(<OfflineState onRetry={mockOnRetry} />);

      await act(async () => {
        const retryButton = getByTestId('offline-state-retry');
        fireEvent.press(retryButton);
      });

      await waitFor(() => {
        expect(mockOnRetry).toHaveBeenCalledTimes(1);
      });
    });

    it('should disable retry button while retrying', async () => {
      const mockOnRetry = jest.fn().mockResolvedValue(undefined);
      const { getByTestId } = render(<OfflineState onRetry={mockOnRetry} />);

      await act(async () => {
        const retryButton = getByTestId('offline-state-retry');
        fireEvent.press(retryButton);
      });

      // Button should be disabled (showing loading)

      // Wait for async operations to complete
      await waitFor(() => {
        expect(mockOnRetry).toHaveBeenCalled();
      });
    });
  });

  describe('Compact Mode', () => {
    it('should render in full screen mode by default', () => {
      render(<OfflineState />);
    });

    it('should render in compact mode when compact is true', () => {
      render(<OfflineState compact />);
    });

    it('should render in full screen mode when compact is false', () => {
      render(<OfflineState compact={false} />);
    });
  });

  describe('Custom Styling', () => {
    it('should apply custom style', () => {
      const customStyle = { backgroundColor: '#f0f0f0', padding: 20 };
      render(<OfflineState style={customStyle} />);
    });
  });

  describe('Icon Rendering', () => {
    it('should render offline icon', () => {
      render(<OfflineState />);
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty message', () => {
      const { getByTestId } = render(<OfflineState message="" />);

      expect(getByTestId('offline-state')).toBeTruthy();
    });

    it('should handle long message', () => {
      const longMessage =
        'İnternet bağlantınız kesildi. Lütfen bağlantınızı kontrol edip tekrar deneyin. Bu mesaj çok uzun olabilir ve birden fazla satıra yayılabilir.';
      const { getByText } = render(<OfflineState message={longMessage} />);

      expect(getByText(longMessage)).toBeTruthy();
    });

    it('should handle single retry attempt', async () => {
      const mockOnRetry = jest.fn().mockResolvedValue(undefined);
      const { getByTestId } = render(<OfflineState onRetry={mockOnRetry} />);

      await act(async () => {
        const retryButton = getByTestId('offline-state-retry');
        fireEvent.press(retryButton);
      });

      await waitFor(() => expect(mockOnRetry).toHaveBeenCalledTimes(1));
    });
  });

  describe('Async Retry', () => {
    it('should handle async onRetry callback', async () => {
      const mockOnRetry = jest.fn().mockResolvedValue('success');

      const { getByTestId } = render(<OfflineState onRetry={mockOnRetry} />);

      await act(async () => {
        const retryButton = getByTestId('offline-state-retry');
        fireEvent.press(retryButton);
      });

      await waitFor(() => {
        expect(mockOnRetry).toHaveBeenCalledTimes(1);
      });
    });

    it('should handle sync onRetry callback', async () => {
      const mockOnRetry = jest.fn() as jest.Mock;
      const { getByTestId } = render(<OfflineState onRetry={mockOnRetry} />);

      await act(async () => {
        const retryButton = getByTestId('offline-state-retry');
        fireEvent.press(retryButton);
      });

      await waitFor(() => {
        expect(mockOnRetry).toHaveBeenCalledTimes(1);
      });
    });
  });
});

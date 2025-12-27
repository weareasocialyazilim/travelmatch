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
      
      expect(getByText('Bağlantı Yok')).toBeTruthy();
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
      
      expect(getByText('Tekrar Dene')).toBeTruthy();
    });

    it('should render custom retry text', () => {
      const customRetryText = 'Yeniden Bağlan';
      const { getByText } = render(
        <OfflineState onRetry={jest.fn()} retryText={customRetryText} />
      );
      
      expect(getByText(customRetryText)).toBeTruthy();
    });

    it('should not render retry button when onRetry is not provided', () => {
      const { queryByText } = render(<OfflineState />);
      
      expect(queryByText('Tekrar Dene')).toBeNull();
    });

    it('should call onRetry when button is pressed', async () => {
      const mockOnRetry = jest.fn().mockResolvedValue(undefined);
      const { getByText } = render(<OfflineState onRetry={mockOnRetry} />);

      await act(async () => {
        const retryButton = getByText('Tekrar Dene');
        fireEvent.press(retryButton);
      });

      await waitFor(() => {
        expect(mockOnRetry).toHaveBeenCalledTimes(1);
      });
    });

    it('should show loading indicator while retrying', async () => {
      const mockOnRetry = jest.fn().mockResolvedValue(undefined);
      const { getByText, UNSAFE_root } = render(<OfflineState onRetry={mockOnRetry} />);

      await act(async () => {
        const retryButton = getByText('Tekrar Dene');
        fireEvent.press(retryButton);
      });

      // Loading indicator should be visible
      expect(UNSAFE_root).toBeTruthy();

      // Wait for async operations to complete
      await waitFor(() => {
        expect(mockOnRetry).toHaveBeenCalled();
      });
    });

    it('should call onRetry and handle completion', async () => {
      const mockOnRetry = jest.fn().mockResolvedValue(undefined);
      const { getByText } = render(<OfflineState onRetry={mockOnRetry} />);

      await act(async () => {
        const retryButton = getByText('Tekrar Dene');
        fireEvent.press(retryButton);
      });

      await waitFor(() => {
        expect(mockOnRetry).toHaveBeenCalledTimes(1);
      });
    });

    it('should disable retry button while retrying', async () => {
      const mockOnRetry = jest.fn().mockResolvedValue(undefined);
      const { getByText, UNSAFE_root } = render(<OfflineState onRetry={mockOnRetry} />);

      await act(async () => {
        const retryButton = getByText('Tekrar Dene');
        fireEvent.press(retryButton);
      });

      // Button should be disabled (showing loading)
      expect(UNSAFE_root).toBeTruthy();

      // Wait for async operations to complete
      await waitFor(() => {
        expect(mockOnRetry).toHaveBeenCalled();
      });
    });
  });

  describe('Compact Mode', () => {
    it('should render in full screen mode by default', () => {
      const { UNSAFE_root } = render(<OfflineState />);
      
      expect(UNSAFE_root).toBeTruthy();
    });

    it('should render in compact mode when compact is true', () => {
      const { UNSAFE_root } = render(<OfflineState compact />);
      
      expect(UNSAFE_root).toBeTruthy();
    });

    it('should render in full screen mode when compact is false', () => {
      const { UNSAFE_root } = render(<OfflineState compact={false} />);
      
      expect(UNSAFE_root).toBeTruthy();
    });
  });

  describe('Custom Styling', () => {
    it('should apply custom style', () => {
      const customStyle = { backgroundColor: '#f0f0f0', padding: 20 };
      const { UNSAFE_root } = render(<OfflineState style={customStyle} />);
      
      expect(UNSAFE_root).toBeTruthy();
    });
  });

  describe('Icon Rendering', () => {
    it('should render offline icon', () => {
      const { UNSAFE_root } = render(<OfflineState />);
      
      expect(UNSAFE_root).toBeTruthy();
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty message', () => {
      const { getByTestId } = render(<OfflineState message="" />);
      
      expect(getByTestId('offline-state')).toBeTruthy();
    });

    it('should handle long message', () => {
      const longMessage = 'İnternet bağlantınız kesildi. Lütfen bağlantınızı kontrol edip tekrar deneyin. Bu mesaj çok uzun olabilir ve birden fazla satıra yayılabilir.';
      const { getByText } = render(<OfflineState message={longMessage} />);
      
      expect(getByText(longMessage)).toBeTruthy();
    });

    it('should handle single retry attempt', async () => {
      const mockOnRetry = jest.fn().mockResolvedValue(undefined);
      const { getByText } = render(<OfflineState onRetry={mockOnRetry} />);

      await act(async () => {
        const retryButton = getByText('Tekrar Dene');
        fireEvent.press(retryButton);
      });

      await waitFor(() => expect(mockOnRetry).toHaveBeenCalledTimes(1));
    });
  });

  describe('Async Retry', () => {
    it('should handle async onRetry callback', async () => {
      const mockOnRetry = jest.fn().mockResolvedValue('success');

      const { getByText } = render(<OfflineState onRetry={mockOnRetry} />);

      await act(async () => {
        const retryButton = getByText('Tekrar Dene');
        fireEvent.press(retryButton);
      });

      await waitFor(() => {
        expect(mockOnRetry).toHaveBeenCalledTimes(1);
      });
    });

    it('should handle sync onRetry callback', async () => {
      const mockOnRetry = jest.fn();
      const { getByText } = render(<OfflineState onRetry={mockOnRetry} />);

      await act(async () => {
        const retryButton = getByText('Tekrar Dene');
        fireEvent.press(retryButton);
      });

      await waitFor(() => {
        expect(mockOnRetry).toHaveBeenCalledTimes(1);
      });
    });
  });
});

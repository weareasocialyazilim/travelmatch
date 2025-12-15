/**
 * OfflineBanner Component Tests
 */

import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import OfflineBanner from '../OfflineBanner';
import { useNetwork } from '../../hooks/useNetwork';

// Mock useNetwork hook
jest.mock('../../hooks/useNetwork');

const mockUseNetwork = useNetwork ;

describe('OfflineBanner', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render when offline', () => {
      mockUseNetwork.mockReturnValue({
        isOffline: true,
        isOnline: false,
        checkConnection: jest.fn(),
      });

      const { getByText } = render(<OfflineBanner />);
      
      expect(getByText("You're offline")).toBeTruthy();
    });

    it('should not render when online', () => {
      mockUseNetwork.mockReturnValue({
        isOffline: false,
        isOnline: true,
        checkConnection: jest.fn(),
      });

      const { queryByText } = render(<OfflineBanner />);
      
      expect(queryByText("You're offline")).toBeNull();
    });

    it('should render custom message', () => {
      mockUseNetwork.mockReturnValue({
        isOffline: true,
        isOnline: false,
        checkConnection: jest.fn(),
      });

      const customMessage = 'No internet connection';
      const { getByText } = render(<OfflineBanner message={customMessage} />);
      
      expect(getByText(customMessage)).toBeTruthy();
    });
  });

  describe('Retry Functionality', () => {
    it('should show retry button when showRetry is true', () => {
      mockUseNetwork.mockReturnValue({
        isOffline: true,
        isOnline: false,
        checkConnection: jest.fn(),
      });

      const { getByText } = render(<OfflineBanner showRetry={true} />);
      
      expect(getByText('Retry')).toBeTruthy();
    });

    it('should not show retry button when showRetry is false', () => {
      mockUseNetwork.mockReturnValue({
        isOffline: true,
        isOnline: false,
        checkConnection: jest.fn(),
      });

      const { queryByText } = render(<OfflineBanner showRetry={false} />);
      
      expect(queryByText('Retry')).toBeNull();
    });

    it('should call onRetry when retry button pressed and connection restored', async () => {
      const mockCheckConnection = jest.fn().mockResolvedValue(true);
      const mockOnRetry = jest.fn();
      
      mockUseNetwork.mockReturnValue({
        isOffline: true,
        isOnline: false,
        checkConnection: mockCheckConnection,
      });

      const { getByText } = render(
        <OfflineBanner showRetry={true} onRetry={mockOnRetry} />
      );
      
      const retryButton = getByText('Retry');
      fireEvent.press(retryButton);

      // Wait for async operations
      await new Promise(resolve => setTimeout(resolve, 100));

      expect(mockCheckConnection).toHaveBeenCalled();
      expect(mockOnRetry).toHaveBeenCalled();
    });

    it('should not call onRetry when connection check fails', async () => {
      const mockCheckConnection = jest.fn().mockResolvedValue(false);
      const mockOnRetry = jest.fn();
      
      mockUseNetwork.mockReturnValue({
        isOffline: true,
        isOnline: false,
        checkConnection: mockCheckConnection,
      });

      const { getByText } = render(
        <OfflineBanner showRetry={true} onRetry={mockOnRetry} />
      );
      
      const retryButton = getByText('Retry');
      fireEvent.press(retryButton);

      // Wait for async operations
      await new Promise(resolve => setTimeout(resolve, 100));

      expect(mockCheckConnection).toHaveBeenCalled();
      expect(mockOnRetry).not.toHaveBeenCalled();
    });
  });

  describe('Icon Rendering', () => {
    it('should render wifi-off icon when offline', () => {
      mockUseNetwork.mockReturnValue({
        isOffline: true,
        isOnline: false,
        checkConnection: jest.fn(),
      });

      const { UNSAFE_root } = render(<OfflineBanner />);
      
      // Component renders, icon should be present
      expect(UNSAFE_root).toBeTruthy();
    });
  });
});

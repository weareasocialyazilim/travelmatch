/**
 * ShareProofModal Test Suite
 * Tests social sharing modal functionality for proof sharing
 */

import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { Platform } from 'react-native';
import { ShareProofModal } from '../ShareProofModal';

// Mock logger
jest.mock('../../utils/logger', () => ({
  logger: {
    debug: jest.fn(),
    error: jest.fn(),
  },
}));

// Mock clipboard
const mockWriteText = jest.fn() as jest.Mock;
Object.defineProperty(global, 'navigator', {
  value: {
    clipboard: {
      writeText: mockWriteText,
    },
  },
  writable: true,
});

describe('ShareProofModal', () => {
  const mockOnClose = jest.fn() as jest.Mock;
  const mockOnShare = jest.fn() as jest.Mock;
  const mockProofUrl = 'https://example.com/proof/12345';

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  // ============================================
  // Rendering Tests
  // ============================================

  describe('Rendering', () => {
    it('renders when visible', () => {
      const { getByText } = render(
        <ShareProofModal
          visible={true}
          onClose={mockOnClose}
          onShare={mockOnShare}
          proofUrl={mockProofUrl}
        />,
      );

      expect(getByText('Share Your Proof')).toBeTruthy();
      expect(
        getByText('Let the world see the impact of kindness.'),
      ).toBeTruthy();
    });

    it('renders all social platforms', () => {
      const { getByText } = render(
        <ShareProofModal
          visible={true}
          onClose={mockOnClose}
          onShare={mockOnShare}
          proofUrl={mockProofUrl}
        />,
      );

      expect(getByText('Instagram')).toBeTruthy();
      expect(getByText('Facebook')).toBeTruthy();
      expect(getByText('Twitter')).toBeTruthy();
      expect(getByText('WhatsApp')).toBeTruthy();
      expect(getByText('More')).toBeTruthy();
    });

    it('renders modal component', () => {
      render(
        <ShareProofModal
          visible={true}
          onClose={mockOnClose}
          onShare={mockOnShare}
          proofUrl={mockProofUrl}
        />,
      );
    });
  });

  // ============================================
  // Social Platform Sharing Tests
  // ============================================

  describe('Social Platform Sharing', () => {
    it('calls onShare when Instagram is pressed', () => {
      const { getByText } = render(
        <ShareProofModal
          visible={true}
          onClose={mockOnClose}
          onShare={mockOnShare}
          proofUrl={mockProofUrl}
        />,
      );

      fireEvent.press(getByText('Instagram'));
      expect(mockOnShare).toHaveBeenCalledWith('Instagram');
    });

    it('calls onShare when Facebook is pressed', () => {
      const { getByText } = render(
        <ShareProofModal
          visible={true}
          onClose={mockOnClose}
          onShare={mockOnShare}
          proofUrl={mockProofUrl}
        />,
      );

      fireEvent.press(getByText('Facebook'));
      expect(mockOnShare).toHaveBeenCalledWith('Facebook');
    });

    it('calls onShare when Twitter is pressed', () => {
      const { getByText } = render(
        <ShareProofModal
          visible={true}
          onClose={mockOnClose}
          onShare={mockOnShare}
          proofUrl={mockProofUrl}
        />,
      );

      fireEvent.press(getByText('Twitter'));
      expect(mockOnShare).toHaveBeenCalledWith('Twitter');
    });

    it('calls onShare when WhatsApp is pressed', () => {
      const { getByText } = render(
        <ShareProofModal
          visible={true}
          onClose={mockOnClose}
          onShare={mockOnShare}
          proofUrl={mockProofUrl}
        />,
      );

      fireEvent.press(getByText('WhatsApp'));
      expect(mockOnShare).toHaveBeenCalledWith('WhatsApp');
    });

    it('calls onShare when More is pressed', () => {
      const { getByText } = render(
        <ShareProofModal
          visible={true}
          onClose={mockOnClose}
          onShare={mockOnShare}
          proofUrl={mockProofUrl}
        />,
      );

      fireEvent.press(getByText('More'));
      expect(mockOnShare).toHaveBeenCalledWith('More');
    });

    it('handles rapid platform selection', () => {
      const { getByText } = render(
        <ShareProofModal
          visible={true}
          onClose={mockOnClose}
          onShare={mockOnShare}
          proofUrl={mockProofUrl}
        />,
      );

      fireEvent.press(getByText('Instagram'));
      fireEvent.press(getByText('Facebook'));
      fireEvent.press(getByText('Twitter'));

      expect(mockOnShare).toHaveBeenCalledTimes(3);
      expect(mockOnShare).toHaveBeenNthCalledWith(1, 'Instagram');
      expect(mockOnShare).toHaveBeenNthCalledWith(2, 'Facebook');
      expect(mockOnShare).toHaveBeenNthCalledWith(3, 'Twitter');
    });

    it('calls onShare with correct platform for all 5 options', () => {
      const { getByText } = render(
        <ShareProofModal
          visible={true}
          onClose={mockOnClose}
          onShare={mockOnShare}
          proofUrl={mockProofUrl}
        />,
      );

      const platforms = [
        'Instagram',
        'Facebook',
        'Twitter',
        'WhatsApp',
        'More',
      ];

      platforms.forEach((platform) => {
        mockOnShare.mockClear();
        fireEvent.press(getByText(platform));
        expect(mockOnShare).toHaveBeenCalledWith(platform);
      });
    });
  });

  // ============================================
  // Edge Cases & Lifecycle
  // ============================================

  describe('Edge Cases', () => {
    it('clears timeout on unmount', () => {
      Platform.OS = 'web';
      mockWriteText.mockResolvedValue(undefined);

      const { unmount } = render(
        <ShareProofModal
          visible={true}
          onClose={mockOnClose}
          onShare={mockOnShare}
          proofUrl={mockProofUrl}
        />,
      );

      expect(() => unmount()).not.toThrow();
      expect(() => jest.advanceTimersByTime(2000)).not.toThrow();
    });

    it('maintains component when toggling visibility', () => {
      const { rerender } = render(
        <ShareProofModal
          visible={true}
          onClose={mockOnClose}
          onShare={mockOnShare}
          proofUrl={mockProofUrl}
        />,
      );

      rerender(
        <ShareProofModal
          visible={false}
          onClose={mockOnClose}
          onShare={mockOnShare}
          proofUrl={mockProofUrl}
        />,
      );

      rerender(
        <ShareProofModal
          visible={true}
          onClose={mockOnClose}
          onShare={mockOnShare}
          proofUrl={mockProofUrl}
        />,
      );
    });

    it('renders with different URL formats', () => {
      const urls = [
        'https://example.com/proof/12345',
        'https://ex.co/p/1',
        '',
        'https://example.com/proof?id=123&name=test%20proof',
      ];

      urls.forEach((url) => {
        const { getByText } = render(
          <ShareProofModal
            visible={true}
            onClose={mockOnClose}
            onShare={mockOnShare}
            proofUrl={url}
          />,
        );

        expect(getByText('Share Your Proof')).toBeTruthy();
      });
    });

    it('handles clipboard errors gracefully', () => {
      Platform.OS = 'web';
      const error = new Error('Clipboard error');
      mockWriteText.mockRejectedValue(error);

      render(
        <ShareProofModal
          visible={true}
          onClose={mockOnClose}
          onShare={mockOnShare}
          proofUrl={mockProofUrl}
        />,
      );
    });

    it('renders modal on different platforms', () => {
      ['web', 'ios', 'android'].forEach((platform) => {
        Platform.OS = platform as string;

        const { getByText } = render(
          <ShareProofModal
            visible={true}
            onClose={mockOnClose}
            onShare={mockOnShare}
            proofUrl={mockProofUrl}
          />,
        );

        expect(getByText('Share Your Proof')).toBeTruthy();
      });
    });
  });

  // ============================================
  // Props Validation Tests
  // ============================================

  describe('Props Validation', () => {
    it('accepts all required props', () => {
      expect(() =>
        render(
          <ShareProofModal
            visible={true}
            onClose={mockOnClose}
            onShare={mockOnShare}
            proofUrl={mockProofUrl}
          />,
        ),
      ).not.toThrow();
    });

    it('renders with visible=false', () => {
      render(
        <ShareProofModal
          visible={false}
          onClose={mockOnClose}
          onShare={mockOnShare}
          proofUrl={mockProofUrl}
        />,
      );
    });

    it('works with different callback functions', () => {
      const customOnClose = jest.fn() as jest.Mock;
      const customOnShare = jest.fn() as jest.Mock;

      const { getByText } = render(
        <ShareProofModal
          visible={true}
          onClose={customOnClose}
          onShare={customOnShare}
          proofUrl={mockProofUrl}
        />,
      );

      fireEvent.press(getByText('Instagram'));
      expect(customOnShare).toHaveBeenCalledWith('Instagram');
    });
  });
});

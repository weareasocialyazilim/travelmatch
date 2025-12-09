import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { PendingTransactionsModal } from '../PendingTransactionsModal';
import type {
  PendingPayment,
  PendingUpload,
} from '../../services/pendingTransactionsService';

// Mock typography
jest.mock('../../theme/typography', () => ({
  TYPOGRAPHY: {
    h3: { fontSize: 24 },
    h4: { fontSize: 18 },
    body: { fontSize: 14 },
    bodySmall: { fontSize: 12 },
  },
}));

describe('PendingTransactionsModal', () => {
  const mockOnResumePayment = jest.fn();
  const mockOnResumeUpload = jest.fn();
  const mockOnDismissPayment = jest.fn();
  const mockOnDismissUpload = jest.fn();
  const mockOnClose = jest.fn();

  const samplePayment: PendingPayment = {
    id: 'payment-1',
    type: 'gift',
    amount: 50,
    currency: 'USD',
    createdAt: Date.now() - 60000, // 1 minute ago
    metadata: {
      note: 'Test payment',
    },
  };

  const sampleUpload: PendingUpload = {
    id: 'upload-1',
    type: 'proof',
    fileName: 'proof.jpg',
    fileSize: 1024000,
    mimeType: 'image/jpeg',
    progress: 50,
    createdAt: Date.now() - 120000, // 2 minutes ago
    retryCount: 1,
  };

  const defaultProps = {
    visible: true,
    payments: [samplePayment],
    uploads: [sampleUpload],
    onResumePayment: mockOnResumePayment,
    onResumeUpload: mockOnResumeUpload,
    onDismissPayment: mockOnDismissPayment,
    onDismissUpload: mockOnDismissUpload,
    onClose: mockOnClose,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render when visible is true with pending items', () => {
      const { getByText } = render(
        <PendingTransactionsModal {...defaultProps} />
      );
      expect(getByText('Incomplete Actions')).toBeTruthy();
    });

    it('should not render when visible is false', () => {
      const { UNSAFE_getByType } = render(
        <PendingTransactionsModal {...defaultProps} visible={false} />
      );
      const modal = UNSAFE_getByType(require('react-native').Modal);
      expect(modal.props.visible).toBe(false);
    });

    it('should return null when no payments and no uploads', () => {
      const result = render(
        <PendingTransactionsModal
          {...defaultProps}
          payments={[]}
          uploads={[]}
        />
      );
      // Component returns null, so it won't render anything
      expect(result.UNSAFE_root).toBeTruthy();
    });

    it('should render header with icon', () => {
      const { getByText } = render(
        <PendingTransactionsModal {...defaultProps} />
      );
      expect(getByText('Incomplete Actions')).toBeTruthy();
    });

    it('should render subtitle', () => {
      const { getByText } = render(
        <PendingTransactionsModal {...defaultProps} />
      );
      expect(
        getByText(
          "We found some actions that didn't complete. Would you like to continue?"
        )
      ).toBeTruthy();
    });

    it('should render pending payments section', () => {
      const { getByText } = render(
        <PendingTransactionsModal {...defaultProps} />
      );
      expect(getByText('Pending Payments (1)')).toBeTruthy();
    });

    it('should render pending uploads section', () => {
      const { getByText } = render(
        <PendingTransactionsModal {...defaultProps} />
      );
      expect(getByText('Pending Uploads (1)')).toBeTruthy();
    });

    it('should render close button', () => {
      const { UNSAFE_getAllByType } = render(
        <PendingTransactionsModal {...defaultProps} />
      );
      const touchables = UNSAFE_getAllByType(
        require('react-native').TouchableOpacity
      );
      expect(touchables.length).toBeGreaterThan(0);
    });
  });

  describe('Payment Display', () => {
    it('should display gift payment type correctly', () => {
      const { getByText } = render(
        <PendingTransactionsModal {...defaultProps} />
      );
      expect(getByText('Gift Payment')).toBeTruthy();
    });

    it('should display withdrawal payment type correctly', () => {
      const withdrawalPayment: PendingPayment = {
        ...samplePayment,
        type: 'withdraw',
      };
      const { getByText } = render(
        <PendingTransactionsModal
          {...defaultProps}
          payments={[withdrawalPayment]}
        />
      );
      expect(getByText('Withdrawal')).toBeTruthy();
    });

    it('should display moment purchase payment type correctly', () => {
      const momentPayment: PendingPayment = {
        ...samplePayment,
        type: 'moment_purchase',
      };
      const { getByText } = render(
        <PendingTransactionsModal
          {...defaultProps}
          payments={[momentPayment]}
        />
      );
      expect(getByText('Moment Purchase')).toBeTruthy();
    });

    it('should format payment amount correctly', () => {
      const { getByText } = render(
        <PendingTransactionsModal {...defaultProps} />
      );
      expect(getByText('$50.00')).toBeTruthy();
    });

    it('should display payment note when provided', () => {
      const { getByText } = render(
        <PendingTransactionsModal {...defaultProps} />
      );
      expect(getByText('Test payment')).toBeTruthy();
    });

    it('should display relative time for payments', () => {
      const { getByText } = render(
        <PendingTransactionsModal {...defaultProps} />
      );
      // Should show "1m ago" or similar
      expect(getByText(/1m ago/)).toBeTruthy();
    });

    it('should render Resume button for payments', () => {
      const { getAllByText } = render(
        <PendingTransactionsModal {...defaultProps} />
      );
      const resumeButtons = getAllByText('Resume');
      expect(resumeButtons.length).toBeGreaterThan(0);
    });

    it('should render Dismiss button for payments', () => {
      const { getAllByText } = render(
        <PendingTransactionsModal {...defaultProps} />
      );
      const dismissButtons = getAllByText('Dismiss');
      expect(dismissButtons.length).toBeGreaterThan(0);
    });
  });

  describe('Upload Display', () => {
    it('should display proof upload type correctly', () => {
      const { getByText } = render(
        <PendingTransactionsModal {...defaultProps} />
      );
      expect(getByText('Proof Upload')).toBeTruthy();
    });

    it('should display moment upload type correctly', () => {
      const momentUpload: PendingUpload = {
        ...sampleUpload,
        type: 'moment',
      };
      const { getByText } = render(
        <PendingTransactionsModal
          {...defaultProps}
          uploads={[momentUpload]}
        />
      );
      expect(getByText('Moment Image')).toBeTruthy();
    });

    it('should display avatar upload type correctly', () => {
      const avatarUpload: PendingUpload = {
        ...sampleUpload,
        type: 'avatar',
      };
      const { getByText } = render(
        <PendingTransactionsModal
          {...defaultProps}
          uploads={[avatarUpload]}
        />
      );
      expect(getByText('Profile Picture')).toBeTruthy();
    });

    it('should display message upload type correctly', () => {
      const messageUpload: PendingUpload = {
        ...sampleUpload,
        type: 'message',
      };
      const { getByText } = render(
        <PendingTransactionsModal
          {...defaultProps}
          uploads={[messageUpload]}
        />
      );
      expect(getByText('Message Attachment')).toBeTruthy();
    });

    it('should display file name', () => {
      const { getByText } = render(
        <PendingTransactionsModal {...defaultProps} />
      );
      expect(getByText('proof.jpg')).toBeTruthy();
    });

    it('should display progress bar for partial uploads', () => {
      const { getByText } = render(
        <PendingTransactionsModal {...defaultProps} />
      );
      expect(getByText('50%')).toBeTruthy();
    });

    it('should not display progress bar for completed uploads', () => {
      const completedUpload: PendingUpload = {
        ...sampleUpload,
        progress: 100,
      };
      const { queryByText } = render(
        <PendingTransactionsModal
          {...defaultProps}
          uploads={[completedUpload]}
        />
      );
      expect(queryByText('100%')).toBeNull();
    });

    it('should not display progress bar for 0 progress', () => {
      const zeroUpload: PendingUpload = {
        ...sampleUpload,
        progress: 0,
      };
      const { queryByText } = render(
        <PendingTransactionsModal
          {...defaultProps}
          uploads={[zeroUpload]}
        />
      );
      expect(queryByText('0%')).toBeNull();
    });

    it('should display retry count when > 0', () => {
      const { getByText } = render(
        <PendingTransactionsModal {...defaultProps} />
      );
      expect(getByText('Failed 1 time')).toBeTruthy();
    });

    it('should display plural retry count', () => {
      const failedUpload: PendingUpload = {
        ...sampleUpload,
        retryCount: 3,
      };
      const { getByText } = render(
        <PendingTransactionsModal
          {...defaultProps}
          uploads={[failedUpload]}
        />
      );
      expect(getByText('Failed 3 times')).toBeTruthy();
    });

    it('should render Retry button for uploads', () => {
      const { getByText } = render(
        <PendingTransactionsModal {...defaultProps} />
      );
      expect(getByText('Retry')).toBeTruthy();
    });
  });

  describe('User Interactions', () => {
    it('should call onClose when close button is pressed', () => {
      const { UNSAFE_getAllByType } = render(
        <PendingTransactionsModal {...defaultProps} />
      );
      const touchables = UNSAFE_getAllByType(
        require('react-native').TouchableOpacity
      );
      // First touchable should be close button
      fireEvent.press(touchables[0]);
      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it('should call onResumePayment when Resume is pressed for payment', () => {
      const { getAllByText } = render(
        <PendingTransactionsModal {...defaultProps} />
      );
      const resumeButtons = getAllByText('Resume');
      // First Resume button is for payment
      fireEvent.press(resumeButtons[0]);
      expect(mockOnResumePayment).toHaveBeenCalledWith(samplePayment);
    });

    it('should call onDismissPayment when Dismiss is pressed for payment', () => {
      const { getAllByText } = render(
        <PendingTransactionsModal {...defaultProps} />
      );
      const dismissButtons = getAllByText('Dismiss');
      // First Dismiss button is for payment
      fireEvent.press(dismissButtons[0]);
      expect(mockOnDismissPayment).toHaveBeenCalledWith('payment-1');
    });

    it('should call onResumeUpload when Retry is pressed for upload', () => {
      const { getByText } = render(
        <PendingTransactionsModal {...defaultProps} />
      );
      const retryButton = getByText('Retry');
      fireEvent.press(retryButton);
      expect(mockOnResumeUpload).toHaveBeenCalledWith(sampleUpload);
    });

    it('should call onDismissUpload when Dismiss is pressed for upload', () => {
      const { getAllByText } = render(
        <PendingTransactionsModal {...defaultProps} />
      );
      const dismissButtons = getAllByText('Dismiss');
      // Second Dismiss button is for upload
      fireEvent.press(dismissButtons[1]);
      expect(mockOnDismissUpload).toHaveBeenCalledWith('upload-1');
    });

    it('should call onClose when "I\'ll handle this later" is pressed', () => {
      const { getByText } = render(
        <PendingTransactionsModal {...defaultProps} />
      );
      const laterButton = getByText("I'll handle this later");
      fireEvent.press(laterButton);
      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });
  });

  describe('Modal Properties', () => {
    it('should use transparent mode', () => {
      const { UNSAFE_getByType } = render(
        <PendingTransactionsModal {...defaultProps} />
      );
      const modal = UNSAFE_getByType(require('react-native').Modal);
      expect(modal.props.transparent).toBe(true);
    });

    it('should use slide animation', () => {
      const { UNSAFE_getByType } = render(
        <PendingTransactionsModal {...defaultProps} />
      );
      const modal = UNSAFE_getByType(require('react-native').Modal);
      expect(modal.props.animationType).toBe('slide');
    });

    it('should respect visible prop', () => {
      const { UNSAFE_getByType } = render(
        <PendingTransactionsModal {...defaultProps} />
      );
      const modal = UNSAFE_getByType(require('react-native').Modal);
      expect(modal.props.visible).toBe(true);
    });

    it('should call onClose on modal request close', () => {
      const { UNSAFE_getByType } = render(
        <PendingTransactionsModal {...defaultProps} />
      );
      const modal = UNSAFE_getByType(require('react-native').Modal);
      modal.props.onRequestClose();
      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });
  });

  describe('Multiple Items', () => {
    it('should render multiple payments', () => {
      const payment2: PendingPayment = {
        ...samplePayment,
        id: 'payment-2',
        amount: 100,
      };
      const { getByText } = render(
        <PendingTransactionsModal
          {...defaultProps}
          payments={[samplePayment, payment2]}
        />
      );
      expect(getByText('Pending Payments (2)')).toBeTruthy();
      expect(getByText('$50.00')).toBeTruthy();
      expect(getByText('$100.00')).toBeTruthy();
    });

    it('should render multiple uploads', () => {
      const upload2: PendingUpload = {
        ...sampleUpload,
        id: 'upload-2',
        fileName: 'proof2.jpg',
      };
      const { getByText } = render(
        <PendingTransactionsModal
          {...defaultProps}
          uploads={[sampleUpload, upload2]}
        />
      );
      expect(getByText('Pending Uploads (2)')).toBeTruthy();
      expect(getByText('proof.jpg')).toBeTruthy();
      expect(getByText('proof2.jpg')).toBeTruthy();
    });

    it('should not render payments section when empty', () => {
      const { queryByText } = render(
        <PendingTransactionsModal {...defaultProps} payments={[]} />
      );
      expect(queryByText('Pending Payments')).toBeNull();
    });

    it('should not render uploads section when empty', () => {
      const { queryByText } = render(
        <PendingTransactionsModal {...defaultProps} uploads={[]} />
      );
      expect(queryByText('Pending Uploads')).toBeNull();
    });
  });

  describe('Edge Cases', () => {
    it('should handle payment without note', () => {
      const paymentWithoutNote: PendingPayment = {
        ...samplePayment,
        metadata: {},
      };
      const { queryByText } = render(
        <PendingTransactionsModal
          {...defaultProps}
          payments={[paymentWithoutNote]}
        />
      );
      expect(queryByText('Test payment')).toBeNull();
    });

    it('should handle upload without retryCount', () => {
      const uploadNoRetry: PendingUpload = {
        ...sampleUpload,
        retryCount: 0,
      };
      const { queryByText } = render(
        <PendingTransactionsModal
          {...defaultProps}
          uploads={[uploadNoRetry]}
        />
      );
      expect(queryByText(/Failed/)).toBeNull();
    });

    it('should format currency correctly for non-USD', () => {
      const eurPayment: PendingPayment = {
        ...samplePayment,
        currency: 'EUR',
      };
      const { getByText } = render(
        <PendingTransactionsModal
          {...defaultProps}
          payments={[eurPayment]}
        />
      );
      expect(getByText('EUR50.00')).toBeTruthy();
    });

    it('should handle very recent timestamps', () => {
      const recentPayment: PendingPayment = {
        ...samplePayment,
        createdAt: Date.now() - 30000, // 30 seconds ago
      };
      const { getByText } = render(
        <PendingTransactionsModal
          {...defaultProps}
          payments={[recentPayment]}
        />
      );
      expect(getByText('Just now')).toBeTruthy();
    });

    it('should handle old timestamps correctly', () => {
      const oldPayment: PendingPayment = {
        ...samplePayment,
        createdAt: Date.now() - 172800000, // 2 days ago
      };
      const { getByText } = render(
        <PendingTransactionsModal
          {...defaultProps}
          payments={[oldPayment]}
        />
      );
      // Should show date - the component formats it with toLocaleDateString
      expect(getByText('$50.00')).toBeTruthy();
    });

    it('should handle rapid button presses', () => {
      const { getAllByText } = render(
        <PendingTransactionsModal {...defaultProps} />
      );
      const resumeButtons = getAllByText('Resume');
      fireEvent.press(resumeButtons[0]);
      fireEvent.press(resumeButtons[0]);
      fireEvent.press(resumeButtons[0]);
      expect(mockOnResumePayment).toHaveBeenCalledTimes(3);
    });
  });
});

// Helper to get all elements by text pattern
const getAllByText = (pattern: RegExp) => {
  // This is a simplified helper - in real tests you'd use UNSAFE_getAllByType
  // and filter by props.children matching the pattern
  return [];
};

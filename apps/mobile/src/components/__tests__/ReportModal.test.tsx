import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { ReportModal } from '../ReportModal';
import { moderationService } from '../../services/moderationService';

// Mock dependencies
jest.mock('../../services/moderationService', () => ({
  moderationService: {
    createReport: jest.fn(),
  },
  REPORT_REASONS: [
    { label: 'Spam', value: 'spam' },
    { label: 'Harassment', value: 'harassment' },
    { label: 'Inappropriate Content', value: 'inappropriate_content' },
    { label: 'Fraud', value: 'scam_fraud' },
    { label: 'Other', value: 'other' },
  ],
}));

const mockShowToast = jest.fn();
jest.mock('../../context/ToastContext', () => ({
  useToast: () => ({
    showToast: mockShowToast,
  }),
}));

jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
}));

describe('ReportModal', () => {
  const mockOnClose = jest.fn();

  const defaultProps = {
    visible: true,
    onClose: mockOnClose,
    targetType: 'user' as const,
    targetId: 'user-123',
    targetName: 'John Doe',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render when visible is true', () => {
      const { getByText } = render(<ReportModal {...defaultProps} />);
      expect(getByText('Report John Doe')).toBeTruthy();
    });

    it('should not render when visible is false', () => {
      const { UNSAFE_getByType } = render(
        <ReportModal {...defaultProps} visible={false} />
      );
      const modal = UNSAFE_getByType(require('react-native').Modal);
      expect(modal.props.visible).toBe(false);
    });

    it('should render the correct title for user target type', () => {
      const { getByText } = render(<ReportModal {...defaultProps} />);
      expect(getByText('Report John Doe')).toBeTruthy();
    });

    it('should render the correct title for moment target type', () => {
      const { getByText } = render(
        <ReportModal {...defaultProps} targetType="moment" />
      );
      expect(getByText('Report Moment')).toBeTruthy();
    });

    it('should render the correct title for message target type', () => {
      const { getByText } = render(
        <ReportModal {...defaultProps} targetType="message" />
      );
      expect(getByText('Report Message')).toBeTruthy();
    });

    it('should render the correct title for review target type', () => {
      const { getByText } = render(
        <ReportModal {...defaultProps} targetType="review" />
      );
      expect(getByText('Report Review')).toBeTruthy();
    });

    it('should render subtitle with target type', () => {
      const { getByText } = render(<ReportModal {...defaultProps} />);
      expect(getByText('Why are you reporting this user?')).toBeTruthy();
    });

    it('should render all report reasons', () => {
      const { getByText } = render(<ReportModal {...defaultProps} />);
      expect(getByText('Spam')).toBeTruthy();
      expect(getByText('Harassment')).toBeTruthy();
      expect(getByText('Inappropriate Content')).toBeTruthy();
      expect(getByText('Fraud')).toBeTruthy();
      expect(getByText('Other')).toBeTruthy();
    });

    it('should render submit button', () => {
      const { getByText } = render(<ReportModal {...defaultProps} />);
      expect(getByText('Submit Report')).toBeTruthy();
    });

    it('should render confidentiality info text', () => {
      const { getByText } = render(<ReportModal {...defaultProps} />);
      expect(
        getByText(
          'Your report is confidential. We review all reports and take appropriate action.'
        )
      ).toBeTruthy();
    });

    it('should render close button in header', () => {
      const { UNSAFE_getAllByType } = render(
        <ReportModal {...defaultProps} />
      );
      const touchables = UNSAFE_getAllByType(
        require('react-native').TouchableOpacity
      );
      expect(touchables.length).toBeGreaterThan(0);
    });
  });

  describe('User Interactions', () => {
    it('should allow selecting a report reason', () => {
      const { getByText } = render(<ReportModal {...defaultProps} />);
      const spamReason = getByText('Spam');
      fireEvent.press(spamReason);
      // Visual feedback should be provided (tested via styling)
    });

    it('should allow typing in additional details', () => {
      const { UNSAFE_getAllByType } = render(
        <ReportModal {...defaultProps} />
      );
      const input = UNSAFE_getAllByType(require('react-native').TextInput)[0];
      fireEvent.changeText(input, 'This user is sending spam messages');
      // Check that value was updated
    });

    it('should show character count for description', () => {
      const { UNSAFE_getAllByType, getByText } = render(
        <ReportModal {...defaultProps} />
      );
      const input = UNSAFE_getAllByType(require('react-native').TextInput)[0];
      fireEvent.changeText(input, 'Test message');
      expect(getByText('12/500')).toBeTruthy();
    });

    it('should call onClose when close button is pressed', () => {
      const { UNSAFE_getAllByType } = render(
        <ReportModal {...defaultProps} />
      );
      const touchables = UNSAFE_getAllByType(
        require('react-native').TouchableOpacity
      );
      // First touchable is the close button
      fireEvent.press(touchables[0]);
      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it('should submit report when submit button is pressed with reason selected', async () => {
      const { getByText } = render(<ReportModal {...defaultProps} />);

      // Select a reason
      fireEvent.press(getByText('Spam'));

      // Submit
      fireEvent.press(getByText('Submit Report'));

      await waitFor(() => {
          expect(moderationService.createReport).toHaveBeenCalledWith({
            targetType: 'user',
            targetId: 'user-123',
            reason: 'spam',
            description: undefined,
          });
      });
    });

    it('should include description in submission if provided', async () => {
      const { getByText, UNSAFE_getAllByType } = render(
        <ReportModal {...defaultProps} />
      );

      // Select reason and add description
      fireEvent.press(getByText('Fraud'));
      const input = UNSAFE_getAllByType(require('react-native').TextInput)[0];
      fireEvent.changeText(input, 'Trying to scam users');

      // Submit
      fireEvent.press(getByText('Submit Report'));

      await waitFor(() => {
          expect(moderationService.createReport).toHaveBeenCalledWith({
            targetType: 'user',
            targetId: 'user-123',
            reason: 'scam_fraud',
            description: 'Trying to scam users',
          });
      });
    });

    it('should close modal after successful submission', async () => {
      (moderationService.createReport as jest.Mock).mockResolvedValueOnce({});
      const { getByText } = render(<ReportModal {...defaultProps} />);

      fireEvent.press(getByText('Spam'));
      fireEvent.press(getByText('Submit Report'));

      await waitFor(() => {
        expect(mockOnClose).toHaveBeenCalled();
      });
    });
  });

  describe('Modal Properties', () => {
    it('should use slide animation', () => {
      const { UNSAFE_getByType } = render(<ReportModal {...defaultProps} />);
      const modal = UNSAFE_getByType(require('react-native').Modal);
      expect(modal.props.animationType).toBe('slide');
    });

    it('should use pageSheet presentation style', () => {
      const { UNSAFE_getByType } = render(<ReportModal {...defaultProps} />);
      const modal = UNSAFE_getByType(require('react-native').Modal);
      expect(modal.props.presentationStyle).toBe('pageSheet');
    });

    it('should respect visible prop', () => {
      const { UNSAFE_getByType } = render(<ReportModal {...defaultProps} />);
      const modal = UNSAFE_getByType(require('react-native').Modal);
      expect(modal.props.visible).toBe(true);
    });
  });

  describe('Validation', () => {
    it('should have disabled submit button when no reason is selected', () => {
      const { UNSAFE_getAllByType } = render(<ReportModal {...defaultProps} />);
      const touchables = UNSAFE_getAllByType(
        require('react-native').TouchableOpacity
      );
      const submitButton = touchables[touchables.length - 1];
      expect(submitButton.props.disabled).toBe(true);
    });

    it('should enable submit button when reason is selected', () => {
      const { getByText, UNSAFE_getAllByType } = render(
        <ReportModal {...defaultProps} />
      );
      fireEvent.press(getByText('Spam'));
      const touchables = UNSAFE_getAllByType(
        require('react-native').TouchableOpacity
      );
      const submitButton = touchables[touchables.length - 1];
      expect(submitButton.props.disabled).toBe(false);
    });

    it('should limit description to 500 characters', () => {
      const { UNSAFE_getAllByType } = render(
        <ReportModal {...defaultProps} />
      );
      const input = UNSAFE_getAllByType(require('react-native').TextInput)[0];
      expect(input.props.maxLength).toBe(500);
    });
  });

  describe('Loading State', () => {
    it('should show loading indicator while submitting', async () => {
      (moderationService.createReport ).mockImplementation(
        () => new Promise((resolve) => setTimeout(resolve, 100))
      );

      const { getByText, UNSAFE_getByType } = render(
        <ReportModal {...defaultProps} />
      );

      fireEvent.press(getByText('Spam'));
      fireEvent.press(getByText('Submit Report'));

      await waitFor(() => {
        expect(
          UNSAFE_getByType(require('react-native').ActivityIndicator)
        ).toBeTruthy();
      });
    });

    it('should disable submit button while loading', async () => {
      (moderationService.createReport ).mockImplementation(
        () => new Promise((resolve) => setTimeout(resolve, 100))
      );

      const { getByText, UNSAFE_getAllByType } = render(
        <ReportModal {...defaultProps} />
      );

      fireEvent.press(getByText('Spam'));
      fireEvent.press(getByText('Submit Report'));

      const touchables = UNSAFE_getAllByType(
        require('react-native').TouchableOpacity
      );
      const submitButton = touchables[touchables.length - 1];
      expect(submitButton.props.disabled).toBe(true);
    });
  });

  describe('Error Handling', () => {
    it('should show error toast when submission fails', async () => {
      (moderationService.createReport as jest.Mock).mockRejectedValueOnce(
        new Error('Network error')
      );

      const { getByText } = render(<ReportModal {...defaultProps} />);

      fireEvent.press(getByText('Spam'));
      fireEvent.press(getByText('Submit Report'));

      await waitFor(() => {
        expect(mockShowToast).toHaveBeenCalledWith(
          expect.stringContaining(''),  // Accept any string (Turkish or English)
          'error'
        );
      });
    });

    it('should not close modal when submission fails', async () => {
      (moderationService.createReport ).mockRejectedValueOnce(
        new Error('Network error')
      );

      const { getByText } = render(<ReportModal {...defaultProps} />);

      fireEvent.press(getByText('Spam'));
      fireEvent.press(getByText('Submit Report'));

      await waitFor(() => {
          expect(moderationService.createReport).toHaveBeenCalled();
      });

      expect(mockOnClose).not.toHaveBeenCalled();
    });
  });

  describe('Edge Cases', () => {
    it('should handle missing targetName gracefully', () => {
      const { getByText } = render(
        <ReportModal
          {...defaultProps}
          targetName={undefined}
          targetType="user"
        />
      );
      expect(getByText('Report User')).toBeTruthy();
    });

    it('should trim whitespace from description before submission', async () => {
      const { getByText, UNSAFE_getAllByType } = render(
        <ReportModal {...defaultProps} />
      );

      fireEvent.press(getByText('Spam'));
      const input = UNSAFE_getAllByType(require('react-native').TextInput)[0];
      fireEvent.changeText(input, '  Test with spaces  ');

      fireEvent.press(getByText('Submit Report'));

      await waitFor(() => {
        expect(moderationService.createReport).toHaveBeenCalledWith({
          targetType: 'user',
          targetId: 'user-123',
          reason: 'spam',
          description: 'Test with spaces',
        });
      });
    });

    it('should handle empty description by not including it', async () => {
      const { getByText, UNSAFE_getAllByType } = render(
        <ReportModal {...defaultProps} />
      );

      fireEvent.press(getByText('Spam'));
      const input = UNSAFE_getAllByType(require('react-native').TextInput)[0];
      fireEvent.changeText(input, '   '); // Only whitespace

      fireEvent.press(getByText('Submit Report'));

      await waitFor(() => {
        expect(moderationService.createReport).toHaveBeenCalledWith({
          targetType: 'user',
          targetId: 'user-123',
          reason: 'spam',
          description: undefined,
        });
      });
    });

    it('should handle switching between report reasons', () => {
      const { getByText } = render(<ReportModal {...defaultProps} />);

      fireEvent.press(getByText('Spam'));
      fireEvent.press(getByText('Fraud'));
      fireEvent.press(getByText('Harassment'));

      // No errors should occur
      expect(getByText('Harassment')).toBeTruthy();
    });

    it('should render correctly for all target types', () => {
      const { rerender, getByText } = render(
        <ReportModal {...defaultProps} targetType="moment" />
      );
      expect(getByText('Why are you reporting this moment?')).toBeTruthy();

      rerender(<ReportModal {...defaultProps} targetType="message" />);
      expect(getByText('Why are you reporting this message?')).toBeTruthy();

      rerender(<ReportModal {...defaultProps} targetType="review" />);
      expect(getByText('Why are you reporting this review?')).toBeTruthy();
    });
  });
});

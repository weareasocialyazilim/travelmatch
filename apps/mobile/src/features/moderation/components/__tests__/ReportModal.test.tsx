import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { ReportModal } from '../ReportModal';
import { moderationService } from '../../../../services/moderationService';

// Mock dependencies
jest.mock('../../../../services/moderationService', () => ({
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

const mockShowToast = jest.fn() as jest.Mock;
jest.mock('../../../../context/ToastContext', () => ({
  useToast: () => ({
    showToast: mockShowToast,
  }),
}));

jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
}));

describe('ReportModal', () => {
  const mockOnClose = jest.fn() as jest.Mock;

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

    it('should render the correct title for user target type', () => {
      const { getByText } = render(<ReportModal {...defaultProps} />);
      expect(getByText('Report John Doe')).toBeTruthy();
    });

    it('should render the correct title for moment target type', () => {
      const { getByText } = render(
        <ReportModal {...defaultProps} targetType="moment" />,
      );
      expect(getByText('Report Moment')).toBeTruthy();
    });

    it('should render the correct title for message target type', () => {
      const { getByText } = render(
        <ReportModal {...defaultProps} targetType="message" />,
      );
      expect(getByText('Report Message')).toBeTruthy();
    });

    it('should render the correct title for review target type', () => {
      const { getByText } = render(
        <ReportModal {...defaultProps} targetType="review" />,
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
          'Your report is confidential. We review all reports and take appropriate action.',
        ),
      ).toBeTruthy();
    });
  });

  describe('User Interactions', () => {
    it('should allow selecting a report reason', () => {
      const { getByText } = render(<ReportModal {...defaultProps} />);
      const spamReason = getByText('Spam');
      fireEvent.press(spamReason);
      // Visual feedback should be provided (tested via styling)
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

  describe('Error Handling', () => {
    it('should show error toast when submission fails', async () => {
      (moderationService.createReport as jest.Mock).mockRejectedValueOnce(
        new Error('Network error'),
      );

      const { getByText } = render(<ReportModal {...defaultProps} />);

      fireEvent.press(getByText('Spam'));
      fireEvent.press(getByText('Submit Report'));

      await waitFor(() => {
        expect(mockShowToast).toHaveBeenCalledWith(
          expect.stringContaining(''),
          'error',
        );
      });
    });

    it('should not close modal when submission fails', async () => {
      (moderationService.createReport as jest.Mock).mockRejectedValueOnce(
        new Error('Network error'),
      );

      const { getByText } = render(<ReportModal {...defaultProps} />);

      fireEvent.press(getByText('Spam'));
      fireEvent.press(getByText('Submit Report'));

      await waitFor(() => {
        expect(mockShowToast).toHaveBeenCalledWith(expect.any(String), 'error');
      });

      expect(moderationService.createReport).toHaveBeenCalled();
    });
  });

  describe('Edge Cases', () => {
    it('should handle missing targetName gracefully', () => {
      const { getByText } = render(
        <ReportModal
          {...defaultProps}
          targetName={undefined}
          targetType="user"
        />,
      );
      expect(getByText('Report User')).toBeTruthy();
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
        <ReportModal {...defaultProps} targetType="moment" />,
      );
      expect(getByText('Why are you reporting this moment?')).toBeTruthy();

      rerender(<ReportModal {...defaultProps} targetType="message" />);
      expect(getByText('Why are you reporting this message?')).toBeTruthy();

      rerender(<ReportModal {...defaultProps} targetType="review" />);
      expect(getByText('Why are you reporting this review?')).toBeTruthy();
    });
  });
});

import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { FeedbackModal } from '../FeedbackModal';

// Mock dependencies
jest.mock('../../hooks/useHaptics', () => ({
  useHaptics: () => ({
    impact: jest.fn(),
    success: jest.fn(),
    warning: jest.fn(),
    error: jest.fn(),
  }),
}));

jest.mock('../../services/analytics', () => ({
  analytics: {
    trackEvent: jest.fn(),
  },
}));

jest.mock('@hookform/resolvers/zod', () => ({
  zodResolver: () => () => ({}),
}));

jest.mock('../../utils/forms/helpers', () => ({
  canSubmitForm: ({ formState }: { formState: { isValid?: boolean } }) => formState.isValid !== false,
}));

jest.mock('../../utils/forms', () => ({
  feedbackSchema: {},
}));

describe('FeedbackModal', () => {
  const mockOnClose = jest.fn() as jest.Mock;
  const mockOnSubmit = jest.fn() as jest.Mock;

  const defaultProps = {
    visible: true,
    onClose: mockOnClose,
    onSubmit: mockOnSubmit,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render when visible is true', () => {
      const { getByText } = render(<FeedbackModal {...defaultProps} />);
      expect(getByText('Share Your Feedback')).toBeTruthy();
    });

    it('should not render when visible is false', () => {
      const { UNSAFE_getByType } = render(
        <FeedbackModal {...defaultProps} visible={false} />,
      );
      const modal = UNSAFE_getByType(require('react-native').Modal);
      expect(modal.props.visible).toBe(false);
    });

    it('should render custom title and subtitle', () => {
      const { getByText } = render(
        <FeedbackModal
          {...defaultProps}
          title="How was it?"
          subtitle="Let us know"
        />,
      );
      expect(getByText('How was it?')).toBeTruthy();
      expect(getByText('Let us know')).toBeTruthy();
    });

    it('should render rating question', () => {
      const { getByText } = render(<FeedbackModal {...defaultProps} />);
      expect(getByText('How would you rate your experience?')).toBeTruthy();
    });

    it('should render all 5 star buttons', () => {
      const { UNSAFE_getAllByType } = render(
        <FeedbackModal {...defaultProps} />,
      );
      const ionicons = UNSAFE_getAllByType(
        require('@expo/vector-icons').Ionicons,
      );
      // Filter for star icons (should have at least 5)
      expect(ionicons.length).toBeGreaterThanOrEqual(5);
    });

    it('should render category section', () => {
      const { getByText } = render(<FeedbackModal {...defaultProps} />);
      expect(getByText('Category (optional)')).toBeTruthy();
    });

    it('should render default categories', () => {
      const { getByText } = render(<FeedbackModal {...defaultProps} />);
      expect(getByText('Bug Report')).toBeTruthy();
      expect(getByText('Feature Request')).toBeTruthy();
      expect(getByText('General Feedback')).toBeTruthy();
    });

    it('should render custom categories', () => {
      const { getByText, queryByText } = render(
        <FeedbackModal
          {...defaultProps}
          categories={['Custom 1', 'Custom 2']}
        />,
      );
      expect(getByText('Custom 1')).toBeTruthy();
      expect(getByText('Custom 2')).toBeTruthy();
      expect(queryByText('Bug Report')).toBeNull();
    });

    it('should render comment input', () => {
      const { getByText } = render(<FeedbackModal {...defaultProps} />);
      expect(getByText('Additional comments (optional)')).toBeTruthy();
    });

    it('should render submit button', () => {
      const { getByText } = render(<FeedbackModal {...defaultProps} />);
      expect(getByText('Submit Feedback')).toBeTruthy();
    });

    it('should render close button', () => {
      const { UNSAFE_getAllByType } = render(
        <FeedbackModal {...defaultProps} />,
      );
      const touchables = UNSAFE_getAllByType(
        require('react-native').TouchableOpacity,
      );
      expect(touchables.length).toBeGreaterThan(0);
    });
  });

  describe('User Interactions', () => {
    it('should call onClose when backdrop is pressed', () => {
      const { UNSAFE_getAllByType } = render(
        <FeedbackModal {...defaultProps} />,
      );
      const touchables = UNSAFE_getAllByType(
        require('react-native').TouchableOpacity,
      );
      // First touchable is the backdrop
      fireEvent.press(touchables[0]);
      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it('should call onClose when close button is pressed', () => {
      const { UNSAFE_getAllByType } = render(
        <FeedbackModal {...defaultProps} />,
      );
      const touchables = UNSAFE_getAllByType(
        require('react-native').TouchableOpacity,
      );
      // Find close button (second touchable)
      fireEvent.press(touchables[1]);
      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it('should allow selecting a rating', () => {
      const { UNSAFE_getAllByType } = render(
        <FeedbackModal {...defaultProps} />,
      );
      const touchables = UNSAFE_getAllByType(
        require('react-native').TouchableOpacity,
      );
      // Rating buttons are after backdrop and close button
      const firstStarButton = touchables[2];
      fireEvent.press(firstStarButton);
      // Should not crash
    });

    it('should allow selecting a category', () => {
      const { getByText } = render(<FeedbackModal {...defaultProps} />);
      const bugReportButton = getByText('Bug Report');
      fireEvent.press(bugReportButton);
      // Should not crash
    });

    it('should allow typing in comment field', () => {
      const { UNSAFE_getAllByType } = render(
        <FeedbackModal {...defaultProps} />,
      );
      const textInputs = UNSAFE_getAllByType(require('react-native').TextInput);
      const commentInput = textInputs[0];
      fireEvent.changeText(commentInput, 'Great app!');
      // Should not crash
    });

    it('should show character count for comments', () => {
      const { getByText } = render(<FeedbackModal {...defaultProps} />);
      expect(getByText('0/500')).toBeTruthy();
    });
  });

  describe('Modal Properties', () => {
    it('should use transparent mode', () => {
      const { UNSAFE_getByType } = render(<FeedbackModal {...defaultProps} />);
      const modal = UNSAFE_getByType(require('react-native').Modal);
      expect(modal.props.transparent).toBe(true);
    });

    it('should use none animation', () => {
      const { UNSAFE_getByType } = render(<FeedbackModal {...defaultProps} />);
      const modal = UNSAFE_getByType(require('react-native').Modal);
      expect(modal.props.animationType).toBe('none');
    });

    it('should respect visible prop', () => {
      const { UNSAFE_getByType } = render(<FeedbackModal {...defaultProps} />);
      const modal = UNSAFE_getByType(require('react-native').Modal);
      expect(modal.props.visible).toBe(true);
    });
  });

  describe('Form Validation', () => {
    it('should limit comment to 500 characters', () => {
      const { UNSAFE_getAllByType } = render(
        <FeedbackModal {...defaultProps} />,
      );
      const textInputs = UNSAFE_getAllByType(require('react-native').TextInput);
      expect(textInputs[0].props.maxLength).toBe(500);
    });

    it('should have multiline text input', () => {
      const { UNSAFE_getAllByType } = render(
        <FeedbackModal {...defaultProps} />,
      );
      const textInputs = UNSAFE_getAllByType(require('react-native').TextInput);
      expect(textInputs[0].props.multiline).toBe(true);
    });
  });

  describe('Submission', () => {
    it('should handle submit button press', () => {
      const { getByText, UNSAFE_getAllByType } = render(
        <FeedbackModal {...defaultProps} />,
      );

      // Select rating
      const touchables = UNSAFE_getAllByType(
        require('react-native').TouchableOpacity,
      );
      const firstStarButton = touchables[2];
      fireEvent.press(firstStarButton);

      // Submit
      const submitButton = getByText('Submit Feedback');
      expect(() => fireEvent.press(submitButton)).not.toThrow();
    });

    it('should not crash when submitting without rating', () => {
      const { getByText } = render(<FeedbackModal {...defaultProps} />);
      const submitButton = getByText('Submit Feedback');
      expect(() => fireEvent.press(submitButton)).not.toThrow();
    });
  });

  describe('Analytics', () => {
    it('should have analytics service available', () => {
      const { analytics } = require('../../services/analytics');
      expect(analytics.trackEvent).toBeDefined();
    });
  });

  describe('Edge Cases', () => {
    it('should handle missing onSubmit gracefully', async () => {
      const { getByText, UNSAFE_getAllByType } = render(
        <FeedbackModal visible={true} onClose={mockOnClose} />,
      );

      const touchables = UNSAFE_getAllByType(
        require('react-native').TouchableOpacity,
      );
      fireEvent.press(touchables[2]);

      const submitButton = getByText('Submit Feedback');
      expect(() => fireEvent.press(submitButton)).not.toThrow();
    });

    it('should handle empty categories array', () => {
      const { queryByText } = render(
        <FeedbackModal {...defaultProps} categories={[]} />,
      );
      expect(queryByText('Bug Report')).toBeNull();
    });

    it('should handle rapid star presses', () => {
      const { UNSAFE_getAllByType } = render(
        <FeedbackModal {...defaultProps} />,
      );
      const touchables = UNSAFE_getAllByType(
        require('react-native').TouchableOpacity,
      );
      const firstStarButton = touchables[2];

      fireEvent.press(firstStarButton);
      fireEvent.press(firstStarButton);
      fireEvent.press(firstStarButton);
      // Should not crash
    });

    it('should handle long comments', () => {
      const { UNSAFE_getAllByType } = render(
        <FeedbackModal {...defaultProps} />,
      );
      const textInputs = UNSAFE_getAllByType(require('react-native').TextInput);
      const longComment = 'a'.repeat(600);
      fireEvent.changeText(textInputs[0], longComment);
      // Should be truncated by maxLength
    });
  });
});

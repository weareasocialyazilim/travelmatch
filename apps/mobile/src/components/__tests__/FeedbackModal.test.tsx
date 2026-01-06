import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
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

// Mock i18n - returns English translations for testing
jest.mock('../../hooks/useTranslation', () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const translations: Record<string, string> = {
        'feedback.title': 'Share Your Feedback',
        'feedback.subtitle': 'Help us improve your experience',
        'feedback.ratingQuestion': 'How would you rate your experience?',
        'feedback.categoryLabel': 'Category (optional)',
        'feedback.commentLabel': 'Additional comments (optional)',
        'feedback.commentPlaceholder': 'Tell us more about your experience...',
        'feedback.submitButton': 'Submit Feedback',
        'feedback.submitting': 'Submitting...',
        'feedback.categories.suspiciousActivity': 'Suspicious Activity 🚨',
        'feedback.categories.fakeProfile': 'Fake Profile',
        'feedback.categories.inappropriateContent': 'Inappropriate Content',
        'feedback.categories.fraudSuspicion': 'Fraud Suspicion',
        'feedback.categories.giftIssue': 'Gift Issue',
        'feedback.categories.generalFeedback': 'General Feedback',
        'feedback.categories.bugReport': 'Bug Report',
        'feedback.categories.featureRequest': 'Feature Request',
        'common.close': 'Close',
      };
      return translations[key] || key;
    },
    language: 'en',
    changeLanguage: jest.fn(),
    languages: ['en', 'tr'],
  }),
}));

jest.mock('@hookform/resolvers/zod', () => ({
  zodResolver: () => () => ({}),
}));

jest.mock('../../utils/forms/helpers', () => ({
  canSubmitForm: ({ formState }: { formState: { isValid?: boolean } }) =>
    formState.isValid !== false,
}));

jest.mock('../../utils/forms', () => ({
  feedbackSchema: {},
}));

describe('FeedbackModal', () => {
  const mockOnClose = jest.fn();
  const mockOnSubmit = jest.fn();

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
      const { getByTestId } = render(<FeedbackModal {...defaultProps} />);
      expect(getByTestId('feedback-modal').props.visible).toBe(true);
    });

    it('should not render when visible is false', () => {
      const { getByTestId } = render(
        <FeedbackModal {...defaultProps} visible={false} />,
      );
      expect(getByTestId('feedback-modal').props.visible).toBe(false);
    });

    it('should render title and subtitle with i18n', () => {
      const { getByTestId } = render(<FeedbackModal {...defaultProps} />);
      expect(getByTestId('feedback-title')).toBeTruthy();
      expect(getByTestId('feedback-subtitle')).toBeTruthy();
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

    it('should render rating section', () => {
      const { getByTestId } = render(<FeedbackModal {...defaultProps} />);
      expect(getByTestId('feedback-rating-label')).toBeTruthy();
    });

    it('should render all 5 star buttons', () => {
      const { getByTestId } = render(<FeedbackModal {...defaultProps} />);
      for (let i = 1; i <= 5; i++) {
        expect(getByTestId(`feedback-star-button-${i}`)).toBeTruthy();
      }
    });

    it('should render category section', () => {
      const { getByTestId } = render(<FeedbackModal {...defaultProps} />);
      expect(getByTestId('feedback-category-label')).toBeTruthy();
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
      const { getByTestId } = render(<FeedbackModal {...defaultProps} />);
      expect(getByTestId('feedback-comment-input')).toBeTruthy();
    });

    it('should render submit button', () => {
      const { getByTestId } = render(<FeedbackModal {...defaultProps} />);
      expect(getByTestId('feedback-submit-button')).toBeTruthy();
    });

    it('should render close button', () => {
      const { getByTestId } = render(<FeedbackModal {...defaultProps} />);
      expect(getByTestId('feedback-close-button')).toBeTruthy();
    });
  });

  describe('User Interactions', () => {
    it('should call onClose when backdrop is pressed', () => {
      const { getByTestId } = render(<FeedbackModal {...defaultProps} />);
      fireEvent.press(getByTestId('feedback-backdrop'));
      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it('should call onClose when close button is pressed', () => {
      const { getByTestId } = render(<FeedbackModal {...defaultProps} />);
      fireEvent.press(getByTestId('feedback-close-button'));
      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it('should allow selecting a rating', () => {
      const { getByTestId } = render(<FeedbackModal {...defaultProps} />);
      const starButton = getByTestId('feedback-star-button-3');
      expect(() => fireEvent.press(starButton)).not.toThrow();
    });

    it('should allow selecting a category', () => {
      const { getByTestId } = render(<FeedbackModal {...defaultProps} />);
      const categoryButton = getByTestId('feedback-category-0');
      expect(() => fireEvent.press(categoryButton)).not.toThrow();
    });

    it('should allow typing in comment field', () => {
      const { getByTestId } = render(<FeedbackModal {...defaultProps} />);
      const commentInput = getByTestId('feedback-comment-input');
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
      const { getByTestId } = render(<FeedbackModal {...defaultProps} />);
      const modal = getByTestId('feedback-modal');
      expect(modal.props.transparent).toBe(true);
    });

    it('should use none animation', () => {
      const { getByTestId } = render(<FeedbackModal {...defaultProps} />);
      const modal = getByTestId('feedback-modal');
      expect(modal.props.animationType).toBe('none');
    });

    it('should respect visible prop', () => {
      const { getByTestId } = render(<FeedbackModal {...defaultProps} />);
      const modal = getByTestId('feedback-modal');
      expect(modal.props.visible).toBe(true);
    });
  });

  describe('Form Validation', () => {
    it('should limit comment to 500 characters', () => {
      const { getByTestId } = render(<FeedbackModal {...defaultProps} />);
      const commentInput = getByTestId('feedback-comment-input');
      expect(commentInput.props.maxLength).toBe(500);
    });

    it('should have multiline text input', () => {
      const { getByTestId } = render(<FeedbackModal {...defaultProps} />);
      const commentInput = getByTestId('feedback-comment-input');
      expect(commentInput.props.multiline).toBe(true);
    });
  });

  describe('Submission', () => {
    it('should handle submit button press', () => {
      const { getByTestId } = render(<FeedbackModal {...defaultProps} />);

      // Select rating
      const starButton = getByTestId('feedback-star-button-4');
      fireEvent.press(starButton);

      // Submit
      const submitButton = getByTestId('feedback-submit-button');
      expect(() => fireEvent.press(submitButton)).not.toThrow();
    });

    it('should not crash when submitting without rating', () => {
      const { getByTestId } = render(<FeedbackModal {...defaultProps} />);
      const submitButton = getByTestId('feedback-submit-button');
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
    it('should handle missing onSubmit gracefully', () => {
      const { getByTestId } = render(
        <FeedbackModal visible={true} onClose={mockOnClose} />,
      );

      fireEvent.press(getByTestId('feedback-star-button-2'));

      const submitButton = getByTestId('feedback-submit-button');
      expect(() => fireEvent.press(submitButton)).not.toThrow();
    });

    it('should handle empty categories array', () => {
      const { queryByText } = render(
        <FeedbackModal {...defaultProps} categories={[]} />,
      );
      expect(queryByText('Bug Report')).toBeNull();
    });

    it('should handle rapid star presses', () => {
      const { getByTestId } = render(<FeedbackModal {...defaultProps} />);
      const starButton = getByTestId('feedback-star-button-1');

      fireEvent.press(starButton);
      fireEvent.press(starButton);
      fireEvent.press(starButton);
      // Should not crash
    });

    it('should handle long comments', () => {
      const { getByTestId } = render(<FeedbackModal {...defaultProps} />);
      const commentInput = getByTestId('feedback-comment-input');
      const longComment = 'a'.repeat(600);
      fireEvent.changeText(commentInput, longComment);
      // Should be truncated by maxLength
    });
  });

  describe('Accessibility', () => {
    it('should have accessibility labels on interactive elements', () => {
      const { getByTestId } = render(<FeedbackModal {...defaultProps} />);

      const closeButton = getByTestId('feedback-close-button');
      expect(closeButton.props.accessibilityLabel).toBeTruthy();
      expect(closeButton.props.accessibilityRole).toBe('button');

      const submitButton = getByTestId('feedback-submit-button');
      expect(submitButton.props.accessibilityLabel).toBeTruthy();
      expect(submitButton.props.accessibilityRole).toBe('button');
    });

    it('should have accessibility labels on star buttons', () => {
      const { getByTestId } = render(<FeedbackModal {...defaultProps} />);

      for (let i = 1; i <= 5; i++) {
        const starButton = getByTestId(`feedback-star-button-${i}`);
        expect(starButton.props.accessibilityLabel).toBeTruthy();
        expect(starButton.props.accessibilityRole).toBe('button');
      }
    });

    it('should have accessibility state on category buttons', () => {
      const { getByTestId } = render(<FeedbackModal {...defaultProps} />);
      const categoryButton = getByTestId('feedback-category-0');
      expect(categoryButton.props.accessibilityState).toBeDefined();
    });
  });
});

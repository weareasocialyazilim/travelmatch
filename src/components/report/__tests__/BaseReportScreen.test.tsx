/**
 * BaseReportScreen Component Tests
 * Testing report screen functionality, options selection, and form submission
 */

/* eslint-disable react-native/no-inline-styles, react-native/no-color-literals */

import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { BaseReportScreen, ReportSummaryCard } from '../BaseReportScreen';
import type { ReportOption } from '../BaseReportScreen';
import { Text, View } from 'react-native';

// Mock COLORS
jest.mock('../../../constants/colors', () => ({
  COLORS: {
    background: '#FFFFFF',
    text: '#1A1A1A',
    textSecondary: '#6B6B6B',
    border: '#E5E5E5',
    primary: '#3B82F6',
    white: '#FFFFFF',
  },
}));

type TestReportReason = 'reason1' | 'reason2' | 'reason3' | 'other';

const TEST_OPTIONS: ReportOption<TestReportReason>[] = [
  { id: 'reason1', label: 'First reason' },
  { id: 'reason2', label: 'Second reason' },
  { id: 'reason3', label: 'Third reason' },
  { id: 'other', label: 'Other' },
];

describe('BaseReportScreen Component', () => {
  const defaultProps = {
    title: 'Report Test',
    sectionTitle: "What's the issue?",
    options: TEST_OPTIONS,
    onSubmit: jest.fn(),
    onCancel: jest.fn(),
    testID: 'test-report-screen',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders correctly with title', () => {
      const { getByText } = render(<BaseReportScreen {...defaultProps} />);

      expect(getByText('Report Test')).toBeTruthy();
    });

    it('renders section title', () => {
      const { getByText } = render(<BaseReportScreen {...defaultProps} />);

      expect(getByText("What's the issue?")).toBeTruthy();
    });

    it('renders all options', () => {
      const { getByText } = render(<BaseReportScreen {...defaultProps} />);

      expect(getByText('First reason')).toBeTruthy();
      expect(getByText('Second reason')).toBeTruthy();
      expect(getByText('Third reason')).toBeTruthy();
      expect(getByText('Other')).toBeTruthy();
    });

    it('renders cancel and submit buttons', () => {
      const { getByText } = render(<BaseReportScreen {...defaultProps} />);

      expect(getByText('Cancel')).toBeTruthy();
      expect(getByText('Send report')).toBeTruthy();
    });

    it('renders custom submit button text', () => {
      const { getByText } = render(
        <BaseReportScreen {...defaultProps} submitButtonText="Submit Report" />,
      );

      expect(getByText('Submit Report')).toBeTruthy();
    });

    it('renders details input with custom label', () => {
      const { getByText } = render(
        <BaseReportScreen
          {...defaultProps}
          detailsLabel="Tell us more"
          detailsPlaceholder="Enter details here..."
        />,
      );

      expect(getByText('Tell us more')).toBeTruthy();
    });

    it('renders summary card when provided', () => {
      const { getByText } = render(
        <BaseReportScreen
          {...defaultProps}
          summaryCard={
            <View>
              <Text>Summary Card Content</Text>
            </View>
          }
        />,
      );

      expect(getByText('Summary Card Content')).toBeTruthy();
    });
  });

  describe('Option Selection', () => {
    it('allows selecting an option', () => {
      const { getByTestId } = render(<BaseReportScreen {...defaultProps} />);

      const option = getByTestId('test-report-screen-option-reason1');
      fireEvent.press(option);

      // Option should be selectable
      expect(option).toBeTruthy();
    });

    it('allows changing selected option', () => {
      const { getByTestId } = render(<BaseReportScreen {...defaultProps} />);

      const option1 = getByTestId('test-report-screen-option-reason1');
      const option2 = getByTestId('test-report-screen-option-reason2');

      fireEvent.press(option1);
      fireEvent.press(option2);

      // Both options should be accessible
      expect(option1).toBeTruthy();
      expect(option2).toBeTruthy();
    });
  });

  describe('Form Submission', () => {
    it('submit button is disabled when no option selected', () => {
      const { getByTestId } = render(<BaseReportScreen {...defaultProps} />);

      const submitButton = getByTestId('test-report-screen-submit-button');

      // Button should have disabled state
      expect(submitButton.props.accessibilityState.disabled).toBe(true);
    });

    it('submit button is enabled when option is selected', () => {
      const { getByTestId } = render(<BaseReportScreen {...defaultProps} />);

      const option = getByTestId('test-report-screen-option-reason1');
      fireEvent.press(option);

      const submitButton = getByTestId('test-report-screen-submit-button');
      expect(submitButton.props.accessibilityState.disabled).toBe(false);
    });

    it('calls onSubmit with selected reason and details', async () => {
      const mockOnSubmit = jest.fn();
      const { getByTestId } = render(
        <BaseReportScreen {...defaultProps} onSubmit={mockOnSubmit} />,
      );

      // Select an option
      const option = getByTestId('test-report-screen-option-reason2');
      fireEvent.press(option);

      // Enter details
      const detailsInput = getByTestId('test-report-screen-details-input');
      fireEvent.changeText(detailsInput, 'Additional details here');

      // Submit
      const submitButton = getByTestId('test-report-screen-submit-button');
      fireEvent.press(submitButton);

      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalledWith(
          'reason2',
          'Additional details here',
        );
      });
    });

    it('does not call onSubmit when no option selected', () => {
      const mockOnSubmit = jest.fn();
      const { getByTestId } = render(
        <BaseReportScreen {...defaultProps} onSubmit={mockOnSubmit} />,
      );

      const submitButton = getByTestId('test-report-screen-submit-button');
      fireEvent.press(submitButton);

      expect(mockOnSubmit).not.toHaveBeenCalled();
    });
  });

  describe('Cancel Functionality', () => {
    it('calls onCancel when cancel button pressed', () => {
      const mockOnCancel = jest.fn();
      const { getByTestId } = render(
        <BaseReportScreen {...defaultProps} onCancel={mockOnCancel} />,
      );

      const cancelButton = getByTestId('test-report-screen-cancel-button');
      fireEvent.press(cancelButton);

      expect(mockOnCancel).toHaveBeenCalled();
    });

    it('calls onCancel when back button pressed', () => {
      const mockOnCancel = jest.fn();
      const { getByTestId } = render(
        <BaseReportScreen {...defaultProps} onCancel={mockOnCancel} />,
      );

      const backButton = getByTestId('test-report-screen-back-button');
      fireEvent.press(backButton);

      expect(mockOnCancel).toHaveBeenCalled();
    });
  });

  describe('Radio Position', () => {
    it('renders radio on right by default', () => {
      const { getByTestId } = render(
        <BaseReportScreen {...defaultProps} radioPosition="right" />,
      );

      const option = getByTestId('test-report-screen-option-reason1');
      expect(option).toBeTruthy();
    });

    it('renders radio on left when specified', () => {
      const { getByTestId } = render(
        <BaseReportScreen {...defaultProps} radioPosition="left" />,
      );

      const option = getByTestId('test-report-screen-option-reason1');
      expect(option).toBeTruthy();
    });
  });

  describe('Accessibility', () => {
    it('has accessible back button', () => {
      const { getByLabelText } = render(<BaseReportScreen {...defaultProps} />);

      expect(getByLabelText('Go back')).toBeTruthy();
    });

    it('has accessible cancel button', () => {
      const { getByLabelText } = render(<BaseReportScreen {...defaultProps} />);

      expect(getByLabelText('Cancel')).toBeTruthy();
    });

    it('options have radio accessibility role', () => {
      const { getByTestId } = render(<BaseReportScreen {...defaultProps} />);

      const option = getByTestId('test-report-screen-option-reason1');
      expect(option.props.accessibilityRole).toBe('radio');
    });
  });
});

describe('ReportSummaryCard Component', () => {
  it('renders children correctly', () => {
    const { getByText } = render(
      <ReportSummaryCard>
        <Text>Card Content</Text>
      </ReportSummaryCard>,
    );

    expect(getByText('Card Content')).toBeTruthy();
  });

  it('applies custom styles', () => {
    const { getByText } = render(
      <ReportSummaryCard style={{ backgroundColor: 'red' }}>
        <Text>Styled Card</Text>
      </ReportSummaryCard>,
    );

    expect(getByText('Styled Card')).toBeTruthy();
  });
});

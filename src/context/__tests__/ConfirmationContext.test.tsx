/**
 * ConfirmationContext Tests
 * Tests for the global confirmation dialog system
 */

import React from 'react';
import { render, fireEvent, waitFor, act } from '@testing-library/react-native';
import {
  ConfirmationProvider,
  useConfirmation,
  type ConfirmationType,
} from '../ConfirmationContext';
import { Text, TouchableOpacity } from 'react-native';

// Mock dependencies
jest.mock('../../utils/logger', () => ({
  logger: {
    error: jest.fn(),
    warn: jest.fn(),
    info: jest.fn(),
    debug: jest.fn(),
  },
}));

// Test component that uses the confirmation context
const TestComponent: React.FC<{
  onConfirm?: () => void | Promise<void>;
  onCancel?: () => void;
  type?: ConfirmationType;
  title?: string;
  message?: string;
  confirmText?: string;
  cancelText?: string;
}> = ({
  onConfirm = jest.fn(),
  onCancel,
  type = 'info',
  title = 'Test Title',
  message = 'Test Message',
  confirmText,
  cancelText,
}) => {
  const { showConfirmation, hideConfirmation } = useConfirmation();

  return (
    <>
      <TouchableOpacity
        testID="show-confirmation"
        onPress={() =>
          showConfirmation({
            title,
            message,
            type,
            onConfirm,
            onCancel,
            confirmText,
            cancelText,
          })
        }
      >
        <Text>Show Confirmation</Text>
      </TouchableOpacity>
      <TouchableOpacity testID="hide-confirmation" onPress={hideConfirmation}>
        <Text>Hide Confirmation</Text>
      </TouchableOpacity>
    </>
  );
};

const renderWithProvider = (component: React.ReactElement) => {
  return render(<ConfirmationProvider>{component}</ConfirmationProvider>);
};

describe('ConfirmationContext', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('ConfirmationProvider', () => {
    it('renders children correctly', () => {
      const { getByText } = renderWithProvider(<Text>Child Content</Text>);
      expect(getByText('Child Content')).toBeTruthy();
    });

    it('provides context values', () => {
      const { getByTestId } = renderWithProvider(<TestComponent />);
      expect(getByTestId('show-confirmation')).toBeTruthy();
      expect(getByTestId('hide-confirmation')).toBeTruthy();
    });
  });

  describe('useConfirmation hook', () => {
    it('throws error when used outside provider', () => {
      const consoleError = jest
        .spyOn(console, 'error')
        .mockImplementation(() => {});

      expect(() => {
        const TestOutsideProvider = () => {
          useConfirmation();
          return null;
        };
        render(<TestOutsideProvider />);
      }).toThrow('useConfirmation must be used within ConfirmationProvider');

      consoleError.mockRestore();
    });
  });

  describe('showConfirmation', () => {
    it('shows confirmation dialog with correct title and message', async () => {
      const { getByTestId, getByText } = renderWithProvider(
        <TestComponent title="Delete Item" message="Are you sure?" />,
      );

      fireEvent.press(getByTestId('show-confirmation'));
      act(() => {
        jest.runAllTimers();
      });

      await waitFor(() => {
        expect(getByText('Delete Item')).toBeTruthy();
        expect(getByText('Are you sure?')).toBeTruthy();
      });
    });

    it('shows confirmation with custom button text', async () => {
      const { getByTestId, getByText } = renderWithProvider(
        <TestComponent confirmText="Yes, Delete" cancelText="No, Keep" />,
      );

      fireEvent.press(getByTestId('show-confirmation'));
      act(() => {
        jest.runAllTimers();
      });

      await waitFor(() => {
        expect(getByText('Yes, Delete')).toBeTruthy();
        expect(getByText('No, Keep')).toBeTruthy();
      });
    });

    it('shows danger type confirmation', async () => {
      const { getByTestId, getByText } = renderWithProvider(
        <TestComponent type="danger" title="Danger Action" />,
      );

      fireEvent.press(getByTestId('show-confirmation'));
      act(() => {
        jest.runAllTimers();
      });

      await waitFor(() => {
        expect(getByText('Danger Action')).toBeTruthy();
      });
    });

    it('shows warning type confirmation', async () => {
      const { getByTestId, getByText } = renderWithProvider(
        <TestComponent type="warning" title="Warning Action" />,
      );

      fireEvent.press(getByTestId('show-confirmation'));
      act(() => {
        jest.runAllTimers();
      });

      await waitFor(() => {
        expect(getByText('Warning Action')).toBeTruthy();
      });
    });

    it('shows success type confirmation', async () => {
      const { getByTestId, getByText } = renderWithProvider(
        <TestComponent type="success" title="Success Action" />,
      );

      fireEvent.press(getByTestId('show-confirmation'));
      act(() => {
        jest.runAllTimers();
      });

      await waitFor(() => {
        expect(getByText('Success Action')).toBeTruthy();
      });
    });

    it('shows info type confirmation by default', async () => {
      const { getByTestId, getByText } = renderWithProvider(
        <TestComponent title="Info Action" />,
      );

      fireEvent.press(getByTestId('show-confirmation'));
      act(() => {
        jest.runAllTimers();
      });

      await waitFor(() => {
        expect(getByText('Info Action')).toBeTruthy();
      });
    });
  });

  describe('confirmation actions', () => {
    it('calls onConfirm when confirm button is pressed', async () => {
      const mockConfirm = jest.fn();
      const { getByTestId, getByText } = renderWithProvider(
        <TestComponent onConfirm={mockConfirm} confirmText="Confirm" />,
      );

      fireEvent.press(getByTestId('show-confirmation'));
      act(() => {
        jest.runAllTimers();
      });

      await waitFor(() => {
        expect(getByText('Confirm')).toBeTruthy();
      });

      fireEvent.press(getByText('Confirm'));
      act(() => {
        jest.runAllTimers();
      });

      await waitFor(() => {
        expect(mockConfirm).toHaveBeenCalled();
      });
    });

    it('calls onCancel when cancel button is pressed', async () => {
      const mockCancel = jest.fn();
      const { getByTestId, getByText } = renderWithProvider(
        <TestComponent onCancel={mockCancel} cancelText="Cancel" />,
      );

      fireEvent.press(getByTestId('show-confirmation'));
      act(() => {
        jest.runAllTimers();
      });

      await waitFor(() => {
        expect(getByText('Cancel')).toBeTruthy();
      });

      fireEvent.press(getByText('Cancel'));
      act(() => {
        jest.runAllTimers();
      });

      await waitFor(() => {
        expect(mockCancel).toHaveBeenCalled();
      });
    });

    it('handles async onConfirm', async () => {
      const mockConfirm = jest.fn().mockResolvedValue(undefined);
      const { getByTestId, getByText } = renderWithProvider(
        <TestComponent onConfirm={mockConfirm} confirmText="Confirm" />,
      );

      fireEvent.press(getByTestId('show-confirmation'));
      act(() => {
        jest.runAllTimers();
      });

      await waitFor(() => {
        expect(getByText('Confirm')).toBeTruthy();
      });

      fireEvent.press(getByText('Confirm'));
      act(() => {
        jest.runAllTimers();
      });

      await waitFor(() => {
        expect(mockConfirm).toHaveBeenCalled();
      });
    });

    it('handles onConfirm error gracefully', async () => {
      const mockError = new Error('Confirm failed');
      const mockConfirm = jest.fn().mockRejectedValue(mockError);
      const { getByTestId, getByText } = renderWithProvider(
        <TestComponent onConfirm={mockConfirm} confirmText="Confirm" />,
      );

      fireEvent.press(getByTestId('show-confirmation'));
      act(() => {
        jest.runAllTimers();
      });

      await waitFor(() => {
        expect(getByText('Confirm')).toBeTruthy();
      });

      fireEvent.press(getByText('Confirm'));
      act(() => {
        jest.runAllTimers();
      });

      await waitFor(() => {
        expect(mockConfirm).toHaveBeenCalled();
      });

      // Should log error
      const { logger } = require('../../utils/logger');
      expect(logger.error).toHaveBeenCalledWith(
        'Confirmation action failed:',
        mockError,
      );
    });
  });

  describe('hideConfirmation', () => {
    it('hides confirmation dialog', async () => {
      const { getByTestId, getByText, queryByText } = renderWithProvider(
        <TestComponent title="Test Dialog" />,
      );

      // Show dialog
      fireEvent.press(getByTestId('show-confirmation'));
      act(() => {
        jest.runAllTimers();
      });

      await waitFor(() => {
        expect(getByText('Test Dialog')).toBeTruthy();
      });

      // Hide dialog
      fireEvent.press(getByTestId('hide-confirmation'));
      act(() => {
        jest.runAllTimers();
      });

      await waitFor(() => {
        expect(queryByText('Test Dialog')).toBeNull();
      });
    });
  });

  describe('modal behavior', () => {
    it('closes dialog on backdrop press', async () => {
      const mockCancel = jest.fn();
      const { getByTestId, queryByText } = renderWithProvider(
        <TestComponent title="Backdrop Test" onCancel={mockCancel} />,
      );

      fireEvent.press(getByTestId('show-confirmation'));
      act(() => {
        jest.runAllTimers();
      });

      // Dialog should be visible
      await waitFor(() => {
        expect(queryByText('Backdrop Test')).toBeTruthy();
      });
    });
  });

  describe('confirmation types styling', () => {
    it.each([
      ['danger', 'Danger Title'],
      ['warning', 'Warning Title'],
      ['success', 'Success Title'],
      ['info', 'Info Title'],
    ] as [ConfirmationType, string][])(
      'renders %s type confirmation correctly',
      async (type, title) => {
        const { getByTestId, getByText } = renderWithProvider(
          <TestComponent type={type} title={title} />,
        );

        fireEvent.press(getByTestId('show-confirmation'));
        act(() => {
          jest.runAllTimers();
        });

        await waitFor(() => {
          expect(getByText(title)).toBeTruthy();
        });
      },
    );
  });

  describe('multiple confirmations', () => {
    it('replaces previous confirmation with new one', async () => {
      const MultiTestComponent = () => {
        const { showConfirmation } = useConfirmation();

        return (
          <>
            <TouchableOpacity
              testID="show-first"
              onPress={() =>
                showConfirmation({
                  title: 'First Dialog',
                  message: 'First message',
                  onConfirm: jest.fn(),
                })
              }
            >
              <Text>First</Text>
            </TouchableOpacity>
            <TouchableOpacity
              testID="show-second"
              onPress={() =>
                showConfirmation({
                  title: 'Second Dialog',
                  message: 'Second message',
                  onConfirm: jest.fn(),
                })
              }
            >
              <Text>Second</Text>
            </TouchableOpacity>
          </>
        );
      };

      const { getByTestId, getByText, queryByText } = renderWithProvider(
        <MultiTestComponent />,
      );

      // Show first dialog
      fireEvent.press(getByTestId('show-first'));
      act(() => {
        jest.runAllTimers();
      });

      await waitFor(() => {
        expect(getByText('First Dialog')).toBeTruthy();
      });

      // Show second dialog (should replace first)
      fireEvent.press(getByTestId('show-second'));
      act(() => {
        jest.runAllTimers();
      });

      await waitFor(() => {
        expect(getByText('Second Dialog')).toBeTruthy();
        expect(queryByText('First Dialog')).toBeNull();
      });
    });
  });
});

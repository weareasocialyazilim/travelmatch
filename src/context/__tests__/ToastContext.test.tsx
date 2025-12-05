/**
 * ToastContext Tests
 */
import React from 'react';
import { render, act, waitFor, fireEvent } from '@testing-library/react-native';
import { Text, TouchableOpacity, View } from 'react-native';
import { ToastProvider, useToast } from '../ToastContext';

const TestComponent: React.FC = () => {
  const { showToast, success, error, warning, info } = useToast();

  return (
    <View>
      <TouchableOpacity
        testID="showSuccess"
        onPress={() => success('Success message')}
      >
        <Text>Success</Text>
      </TouchableOpacity>
      <TouchableOpacity
        testID="showError"
        onPress={() => error('Error message')}
      >
        <Text>Error</Text>
      </TouchableOpacity>
      <TouchableOpacity
        testID="showWarning"
        onPress={() => warning('Warning message')}
      >
        <Text>Warning</Text>
      </TouchableOpacity>
      <TouchableOpacity testID="showInfo" onPress={() => info('Info message')}>
        <Text>Info</Text>
      </TouchableOpacity>
      <TouchableOpacity
        testID="showCustom"
        onPress={() => showToast('Custom message', 'success', 5000)}
      >
        <Text>Custom</Text>
      </TouchableOpacity>
    </View>
  );
};

describe('ToastContext', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('ToastProvider', () => {
    it('should render children', () => {
      const { getByTestId } = render(
        <ToastProvider>
          <Text testID="child">Child</Text>
        </ToastProvider>,
      );

      expect(getByTestId('child')).toBeTruthy();
    });
  });

  describe('useToast', () => {
    it('should throw error when used outside provider', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      expect(() => {
        render(<TestComponent />);
      }).toThrow('useToast must be used within ToastProvider');

      consoleSpy.mockRestore();
    });

    it('should provide toast functions', () => {
      const { getByTestId } = render(
        <ToastProvider>
          <TestComponent />
        </ToastProvider>,
      );

      expect(getByTestId('showSuccess')).toBeTruthy();
      expect(getByTestId('showError')).toBeTruthy();
      expect(getByTestId('showWarning')).toBeTruthy();
      expect(getByTestId('showInfo')).toBeTruthy();
    });
  });

  describe('success', () => {
    it('should show success toast', async () => {
      const { getByTestId, queryByText } = render(
        <ToastProvider>
          <TestComponent />
        </ToastProvider>,
      );

      await act(async () => {
        fireEvent.press(getByTestId('showSuccess'));
      });

      await waitFor(() => {
        expect(queryByText('Success message')).toBeTruthy();
      });
    });
  });

  describe('error', () => {
    it('should show error toast', async () => {
      const { getByTestId, queryByText } = render(
        <ToastProvider>
          <TestComponent />
        </ToastProvider>,
      );

      await act(async () => {
        fireEvent.press(getByTestId('showError'));
      });

      await waitFor(() => {
        expect(queryByText('Error message')).toBeTruthy();
      });
    });
  });

  describe('warning', () => {
    it('should show warning toast', async () => {
      const { getByTestId, queryByText } = render(
        <ToastProvider>
          <TestComponent />
        </ToastProvider>,
      );

      await act(async () => {
        fireEvent.press(getByTestId('showWarning'));
      });

      await waitFor(() => {
        expect(queryByText('Warning message')).toBeTruthy();
      });
    });
  });

  describe('info', () => {
    it('should show info toast', async () => {
      const { getByTestId, queryByText } = render(
        <ToastProvider>
          <TestComponent />
        </ToastProvider>,
      );

      await act(async () => {
        fireEvent.press(getByTestId('showInfo'));
      });

      await waitFor(() => {
        expect(queryByText('Info message')).toBeTruthy();
      });
    });
  });

  describe('auto-dismiss', () => {
    it('should auto-dismiss after duration', async () => {
      const { getByTestId, queryByText } = render(
        <ToastProvider>
          <TestComponent />
        </ToastProvider>,
      );

      await act(async () => {
        fireEvent.press(getByTestId('showSuccess'));
      });

      expect(queryByText('Success message')).toBeTruthy();

      // Advance time past default duration (3000ms)
      await act(async () => {
        jest.advanceTimersByTime(3500);
      });

      // Toast should be gone
      expect(queryByText('Success message')).toBeNull();
    });
  });

  describe('showToast with custom duration', () => {
    it('should show custom toast with specified duration', async () => {
      const { getByTestId, queryByText } = render(
        <ToastProvider>
          <TestComponent />
        </ToastProvider>,
      );

      await act(async () => {
        fireEvent.press(getByTestId('showCustom'));
      });

      expect(queryByText('Custom message')).toBeTruthy();

      // Advance time less than custom duration (5000ms)
      await act(async () => {
        jest.advanceTimersByTime(4000);
      });

      // Toast should still be visible
      expect(queryByText('Custom message')).toBeTruthy();

      // Advance past duration
      await act(async () => {
        jest.advanceTimersByTime(2000);
      });

      // Toast should be gone
      expect(queryByText('Custom message')).toBeNull();
    });
  });
});

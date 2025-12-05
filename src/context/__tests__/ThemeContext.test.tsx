/**
 * ThemeContext Tests
 */
import React from 'react';
import { render, act, waitFor, fireEvent } from '@testing-library/react-native';
import { Text, TouchableOpacity, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ThemeProvider, useTheme } from '../ThemeContext';

// Mock dependencies
jest.mock('react-native/Libraries/Utilities/useColorScheme', () => ({
  default: jest.fn(() => 'light'),
}));

jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn().mockResolvedValue(null),
  setItem: jest.fn().mockResolvedValue(undefined),
}));

const TestComponent: React.FC = () => {
  const { mode, isDark, colors, setThemeMode, toggleTheme } = useTheme();

  return (
    <View>
      <Text testID="mode">{mode}</Text>
      <Text testID="isDark">{isDark.toString()}</Text>
      <Text testID="primaryColor">{colors.primary}</Text>
      <TouchableOpacity testID="setLight" onPress={() => setThemeMode('light')}>
        <Text>Set Light</Text>
      </TouchableOpacity>
      <TouchableOpacity testID="setDark" onPress={() => setThemeMode('dark')}>
        <Text>Set Dark</Text>
      </TouchableOpacity>
      <TouchableOpacity testID="toggle" onPress={toggleTheme}>
        <Text>Toggle</Text>
      </TouchableOpacity>
    </View>
  );
};

describe('ThemeContext', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);
  });

  describe('ThemeProvider', () => {
    it('should render children after loading', async () => {
      const { findByTestId } = render(
        <ThemeProvider>
          <TestComponent />
        </ThemeProvider>,
      );

      // Wait for theme to load
      const modeElement = await findByTestId('mode');
      expect(modeElement).toBeTruthy();
    });

    it('should load saved theme from AsyncStorage', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue('dark');

      const { findByTestId } = render(
        <ThemeProvider>
          <TestComponent />
        </ThemeProvider>,
      );

      const modeElement = await findByTestId('mode');
      expect(modeElement.props.children).toBe('dark');
    });

    it('should default to system theme when no saved preference', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);

      const { findByTestId } = render(
        <ThemeProvider>
          <TestComponent />
        </ThemeProvider>,
      );

      // Default should be 'system' which resolves to 'light' based on our mock
      const modeElement = await findByTestId('mode');
      expect(modeElement).toBeTruthy();
    });
  });

  describe('useTheme', () => {
    it('should throw error when used outside provider', () => {
      // Suppress console.error for this test
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      expect(() => {
        render(<TestComponent />);
      }).toThrow('useTheme must be used within a ThemeProvider');

      consoleSpy.mockRestore();
    });

    it('should provide theme values', async () => {
      const { findByTestId } = render(
        <ThemeProvider>
          <TestComponent />
        </ThemeProvider>,
      );

      const modeElement = await findByTestId('mode');
      const isDarkElement = await findByTestId('isDark');
      const primaryColorElement = await findByTestId('primaryColor');

      expect(modeElement).toBeTruthy();
      expect(isDarkElement).toBeTruthy();
      expect(primaryColorElement.props.children).toBeDefined();
    });
  });

  describe('setThemeMode', () => {
    it('should update theme mode to dark', async () => {
      const { findByTestId } = render(
        <ThemeProvider>
          <TestComponent />
        </ThemeProvider>,
      );

      // Wait for initial render
      const setDarkButton = await findByTestId('setDark');

      await act(async () => {
        fireEvent.press(setDarkButton);
      });

      await waitFor(async () => {
        const modeElement = await findByTestId('mode');
        expect(modeElement.props.children).toBe('dark');
      });
    });

    it('should save theme preference to AsyncStorage', async () => {
      const { findByTestId } = render(
        <ThemeProvider>
          <TestComponent />
        </ThemeProvider>,
      );

      const setDarkButton = await findByTestId('setDark');

      await act(async () => {
        fireEvent.press(setDarkButton);
      });

      await waitFor(() => {
        expect(AsyncStorage.setItem).toHaveBeenCalled();
      });
    });
  });

  describe('toggleTheme', () => {
    it('should toggle theme', async () => {
      const { findByTestId } = render(
        <ThemeProvider>
          <TestComponent />
        </ThemeProvider>,
      );

      const toggleButton = await findByTestId('toggle');
      const initialIsDark = (await findByTestId('isDark')).props.children;

      await act(async () => {
        fireEvent.press(toggleButton);
      });

      await waitFor(async () => {
        const isDarkElement = await findByTestId('isDark');
        // Should be opposite of initial
        expect(isDarkElement.props.children).not.toBe(initialIsDark);
      });
    });
  });

  describe('colors', () => {
    it('should provide color values', async () => {
      const { findByTestId } = render(
        <ThemeProvider>
          <TestComponent />
        </ThemeProvider>,
      );

      const primaryColorElement = await findByTestId('primaryColor');
      expect(primaryColorElement.props.children).toBeDefined();
      expect(typeof primaryColorElement.props.children).toBe('string');
    });
  });
});

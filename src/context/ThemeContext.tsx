/**
 * Theme Context - Dark Mode Support
 * Manages app-wide theme state with system preference detection
 */
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useMemo,
  useCallback,
  type ReactNode,
} from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLORS } from '../constants/colors';

// Theme types
export type ThemeMode = 'light' | 'dark' | 'system';

interface ThemeColors {
  // Primary
  primary: string;
  primaryDark: string;
  primaryLight: string;
  primaryMuted: string;

  // Background
  background: string;
  backgroundSecondary: string;
  surface: string;
  card: string;

  // Text
  text: string;
  textSecondary: string;
  textTertiary: string;
  textInverse: string;

  // UI Elements
  border: string;
  divider: string;
  overlay: string;
  shadow: string;

  // Status
  success: string;
  warning: string;
  error: string;
  info: string;

  // Common
  white: string;
  black: string;
}

interface ThemeContextValue {
  mode: ThemeMode;
  isDark: boolean;
  colors: ThemeColors;
  setThemeMode: (mode: ThemeMode) => void;
  toggleTheme: () => void;
}

// Light theme colors
const lightColors: ThemeColors = {
  primary: '#A6E5C1',
  primaryDark: '#8BD4A8',
  primaryLight: '#C4F0D5',
  primaryMuted: 'rgba(166, 229, 193, 0.15)',

  background: '#F8F8F8',
  backgroundSecondary: '#F5F5F5',
  surface: '#FFFFFF',
  card: '#FFFFFF',

  text: '#1A1A1A',
  textSecondary: '#666666',
  textTertiary: '#999999',
  textInverse: '#FFFFFF',

  border: '#E5E5E5',
  divider: '#EEEEEE',
  overlay: COLORS.overlay50,
  shadow: '#000000',

  success: '#28A745',
  warning: '#F59E0B',
  error: '#EF4444',
  info: '#3B82F6',

  white: '#FFFFFF',
  black: '#000000',
};

// Dark theme colors
const darkColors: ThemeColors = {
  primary: '#A6E5C1',
  primaryDark: '#8BD4A8',
  primaryLight: '#2D5A3F',
  primaryMuted: 'rgba(166, 229, 193, 0.2)',

  background: '#0E1B14',
  backgroundSecondary: '#1A2F23',
  surface: '#1A2F23',
  card: '#243D2F',

  text: '#FFFFFF',
  textSecondary: '#B0B0B0',
  textTertiary: '#808080',
  textInverse: '#1A1A1A',

  border: '#2D4A3A',
  divider: '#2D4A3A',
  overlay: 'rgba(0, 0, 0, 0.7)',
  shadow: '#000000',

  success: '#34D058',
  warning: '#FFAB00',
  error: '#FF6B6B',
  info: '#58A6FF',

  white: '#FFFFFF',
  black: '#000000',
};

const THEME_STORAGE_KEY = '@travelmatch_theme_mode';

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const systemColorScheme = useColorScheme();
  const [mode, setMode] = useState<ThemeMode>('system');
  const [isLoaded, setIsLoaded] = useState(false);

  // Load saved theme preference
  useEffect(() => {
    const loadTheme = async () => {
      try {
        const savedMode = await AsyncStorage.getItem(THEME_STORAGE_KEY);
        if (savedMode && ['light', 'dark', 'system'].includes(savedMode)) {
          setMode(savedMode as ThemeMode);
        }
      } catch {
        // Use default
      } finally {
        setIsLoaded(true);
      }
    };
    void loadTheme();
  }, []);

  // Determine if dark mode is active
  const isDark = useMemo(() => {
    if (mode === 'system') {
      return systemColorScheme === 'dark';
    }
    return mode === 'dark';
  }, [mode, systemColorScheme]);

  // Get current colors based on theme
  const colors = useMemo(() => {
    return isDark ? darkColors : lightColors;
  }, [isDark]);

  // Save and set theme mode
  const setThemeMode = useCallback(async (newMode: ThemeMode) => {
    setMode(newMode);
    try {
      await AsyncStorage.setItem(THEME_STORAGE_KEY, newMode);
    } catch {
      // Silent fail
    }
  }, []);

  // Toggle between light and dark
  const toggleTheme = useCallback(() => {
    const newMode = isDark ? 'light' : 'dark';
    void setThemeMode(newMode);
  }, [isDark, setThemeMode]);

  const value = useMemo(
    () => ({
      mode,
      isDark,
      colors,
      setThemeMode,
      toggleTheme,
    }),
    [mode, isDark, colors, setThemeMode, toggleTheme],
  );

  // Don't render until theme is loaded to prevent flash
  if (!isLoaded) {
    return null;
  }

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
};

// Hook to use theme
export const useTheme = (): ThemeContextValue => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

// Export colors for static usage
export { lightColors, darkColors };
export type { ThemeColors };

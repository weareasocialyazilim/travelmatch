/**
 * Dark Mode Color Palette
 * Complete color system for light and dark themes
 */

export const LIGHT_COLORS = {
  // Primary colors
  primary: '#FF6B6B',
  primaryLight: '#FF8E8E',
  primaryDark: '#E85555',

  // Secondary colors
  secondary: '#4ECDC4',
  secondaryLight: '#6FD9D1',
  secondaryDark: '#3AAFA7',

  // Neutral colors
  background: '#FFFFFF',
  surface: '#F8F9FA',
  card: '#FFFFFF',

  // Text colors
  text: '#212529',
  textSecondary: '#6C757D',
  textTertiary: '#ADB5BD',

  // Border colors
  border: '#DEE2E6',
  divider: '#E9ECEF',

  // Status colors
  success: '#51CF66',
  warning: '#FFD43B',
  error: '#FF6B6B',
  info: '#339AF0',

  // Utility colors
  white: '#FFFFFF',
  black: '#000000',
  overlay: 'rgba(0, 0, 0, 0.5)',
  disabled: '#CED4DA',

  // Chart colors
  chart1: '#FF6B6B',
  chart2: '#4ECDC4',
  chart3: '#FFD43B',
  chart4: '#51CF66',
  chart5: '#339AF0',
} as const;

export const DARK_COLORS = {
  // Primary colors
  primary: '#FF8E8E',
  primaryLight: '#FFB1B1',
  primaryDark: '#FF6B6B',

  // Secondary colors
  secondary: '#6FD9D1',
  secondaryLight: '#92E3DC',
  secondaryDark: '#4ECDC4',

  // Neutral colors
  background: '#121212',
  surface: '#1E1E1E',
  card: '#2A2A2A',

  // Text colors
  text: '#E9ECEF',
  textSecondary: '#ADB5BD',
  textTertiary: '#6C757D',

  // Border colors
  border: '#343A40',
  divider: '#2C3135',

  // Status colors
  success: '#69DB7C',
  warning: '#FFE066',
  error: '#FF8787',
  info: '#4DABF7',

  // Utility colors
  white: '#FFFFFF',
  black: '#000000',
  overlay: 'rgba(0, 0, 0, 0.7)',
  disabled: '#495057',

  // Chart colors
  chart1: '#FF8787',
  chart2: '#6FD9D1',
  chart3: '#FFE066',
  chart4: '#69DB7C',
  chart5: '#4DABF7',
} as const;

// ColorPalette type - uses string for color values to support both themes
export type ColorPalette = {
  [K in keyof typeof LIGHT_COLORS]: string;
};
export type ColorName = keyof ColorPalette;

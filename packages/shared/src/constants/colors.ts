/**
 * Color Palette
 * Design system colors used across all platforms
 */

export const COLORS = {
  // Primary
  primary: '#FF6B6B',
  primaryDark: '#E85555',
  primaryLight: '#FF8A8A',
  
  // Semantic
  success: '#4ECDC4',
  warning: '#FFE66D',
  error: '#FF6B6B',
  info: '#4A90E2',
  
  // Text
  text: '#2D3436',
  textSecondary: '#636E72',
  textDisabled: '#B2BEC3',
  
  // Neutral
  white: '#FFFFFF',
  black: '#000000',
  background: '#F8F9FA',
  border: '#DFE6E9',
  
  // Grayscale
  gray50: '#F8F9FA',
  gray100: '#F1F3F5',
  gray200: '#E9ECEF',
  gray300: '#DEE2E6',
  gray400: '#CED4DA',
  gray500: '#ADB5BD',
  gray600: '#6C757D',
  gray700: '#495057',
  gray800: '#343A40',
  gray900: '#212529',
  
  // Accent colors
  coral: '#FF6B6B',
  mint: '#4ECDC4',
  lavender: '#9B59B6',
  sky: '#3498DB',
  peach: '#FFEAA7',
} as const;

export type ColorKey = keyof typeof COLORS;
export type ColorValue = typeof COLORS[ColorKey];

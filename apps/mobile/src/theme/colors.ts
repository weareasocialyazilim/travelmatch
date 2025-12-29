/**
 * TravelMatch Awwwards Design System - Colors
 *
 * Premium color palette designed for modern travel experiences
 * with careful attention to contrast ratios and accessibility
 */

// ============================================
// 1. BRAND COLORS
// ============================================
export const COLORS = {
  brand: {
    primary: '#FF6B6B',
    primaryLight: '#FF8E8E',
    primaryDark: '#E85555',
    secondary: '#4ECDC4',
    secondaryLight: '#6FD9D1',
    secondaryDark: '#3AAFA7',
    accent: '#FFD43B',
  },

  // ============================================
  // 2. TEXT COLORS
  // ============================================
  text: {
    primary: '#212529',
    secondary: '#6C757D',
    tertiary: '#ADB5BD',
    muted: '#CED4DA',
    link: '#FF6B6B',
    // On dark backgrounds
    onDark: '#FFFFFF',
    onDarkSecondary: 'rgba(255, 255, 255, 0.85)',
    onDarkMuted: 'rgba(255, 255, 255, 0.6)',
  },

  // ============================================
  // 3. BACKGROUND COLORS
  // ============================================
  background: {
    primary: '#FFFFFF',
    secondary: '#F8F9FA',
    tertiary: '#E9ECEF',
    elevated: '#FFFFFF',
  },

  // ============================================
  // 4. SURFACE COLORS
  // ============================================
  surface: {
    card: '#FFFFFF',
    modal: '#FFFFFF',
    overlay: 'rgba(0, 0, 0, 0.5)',
  },

  // ============================================
  // 5. BORDER COLORS
  // ============================================
  border: {
    default: '#DEE2E6',
    light: '#E9ECEF',
    dark: '#ADB5BD',
    focus: '#FF6B6B',
  },

  // ============================================
  // 6. FEEDBACK COLORS
  // ============================================
  feedback: {
    success: '#51CF66',
    successLight: '#D3F9D8',
    warning: '#FFD43B',
    warningLight: '#FFF3BF',
    error: '#FF6B6B',
    errorLight: '#FFE3E3',
    info: '#339AF0',
    infoLight: '#D0EBFF',
  },

  // ============================================
  // 7. UTILITY COLORS
  // ============================================
  utility: {
    white: '#FFFFFF',
    black: '#000000',
    transparent: 'transparent',
    disabled: '#CED4DA',
  },

  // ============================================
  // 8. GRADIENT COLORS
  // ============================================
  gradient: {
    primary: ['#FF6B6B', '#FF8E8E'],
    secondary: ['#4ECDC4', '#6FD9D1'],
    warm: ['#FFD43B', '#FF6B6B'],
    cool: ['#339AF0', '#4ECDC4'],
    dark: ['#212529', '#495057'],
  },
} as const;

// ============================================
// 9. DARK MODE COLORS
// ============================================
export const COLORS_DARK = {
  brand: {
    primary: '#FF8E8E',
    primaryLight: '#FFB1B1',
    primaryDark: '#FF6B6B',
    secondary: '#6FD9D1',
    secondaryLight: '#92E3DC',
    secondaryDark: '#4ECDC4',
    accent: '#FFE066',
  },

  text: {
    primary: '#E9ECEF',
    secondary: '#ADB5BD',
    tertiary: '#6C757D',
    muted: '#495057',
    link: '#FF8E8E',
    onDark: '#FFFFFF',
    onDarkSecondary: 'rgba(255, 255, 255, 0.85)',
    onDarkMuted: 'rgba(255, 255, 255, 0.6)',
  },

  background: {
    primary: '#121212',
    secondary: '#1E1E1E',
    tertiary: '#2A2A2A',
    elevated: '#2A2A2A',
  },

  surface: {
    card: '#2A2A2A',
    modal: '#1E1E1E',
    overlay: 'rgba(0, 0, 0, 0.7)',
  },

  border: {
    default: '#343A40',
    light: '#2C3135',
    dark: '#495057',
    focus: '#FF8E8E',
  },

  feedback: {
    success: '#69DB7C',
    successLight: '#1A3B23',
    warning: '#FFE066',
    warningLight: '#3B3510',
    error: '#FF8787',
    errorLight: '#3B1A1A',
    info: '#4DABF7',
    infoLight: '#102A40',
  },

  utility: {
    white: '#FFFFFF',
    black: '#000000',
    transparent: 'transparent',
    disabled: '#495057',
  },

  gradient: {
    primary: ['#FF8E8E', '#FFB1B1'],
    secondary: ['#6FD9D1', '#92E3DC'],
    warm: ['#FFE066', '#FF8E8E'],
    cool: ['#4DABF7', '#6FD9D1'],
    dark: ['#2A2A2A', '#1E1E1E'],
  },
} as const;

// Type exports
export type Colors = typeof COLORS;
export type ColorCategory = keyof Colors;

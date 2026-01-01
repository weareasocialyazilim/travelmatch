/**
 * TravelMatch: The Rebirth - Design System
 *
 * "Neon Lime + Ultra Black" aesthetic
 * Inspired by TikTok, premium fashion apps, and nightclub vibes
 *
 * Core Philosophy:
 * - Dark-first, immersive experience
 * - High contrast neon accents
 * - Glassmorphism UI elements
 */

// ============================================
// 1. BRAND COLORS - Neon Lime + Ultra Black
// ============================================
export const COLORS = {
  brand: {
    primary: '#CCFF00',      // Neon Lime - Main action color
    primaryLight: '#E0FF4D', // Lighter lime for hover states
    primaryDark: '#A3CC00',  // Darker lime for pressed states
    secondary: '#FF00FF',    // Electric Magenta - Accent
    secondaryLight: '#FF4DFF',
    secondaryDark: '#CC00CC',
    accent: '#00FFFF',       // Cyan - Discovery/Explore
  },

  // ============================================
  // 2. TEXT COLORS
  // ============================================
  text: {
    primary: '#FFFFFF',
    secondary: 'rgba(255, 255, 255, 0.7)',
    tertiary: 'rgba(255, 255, 255, 0.5)',
    muted: 'rgba(255, 255, 255, 0.4)',
    link: '#CCFF00',
    // On light backgrounds
    onLight: '#0A0A0A',
    onLightSecondary: 'rgba(10, 10, 10, 0.7)',
    // On dark backgrounds
    onDark: '#FFFFFF',
    onDarkSecondary: 'rgba(255, 255, 255, 0.85)',
    onDarkMuted: 'rgba(255, 255, 255, 0.6)',
  },

  // ============================================
  // 3. BACKGROUND COLORS - Ultra Black
  // ============================================
  background: {
    primary: '#0A0A0A',      // Ultra Black
    secondary: '#121212',    // Slightly lighter
    tertiary: '#1A1A1A',     // Card backgrounds
    elevated: '#1F1F1F',     // Elevated surfaces
    glass: 'rgba(20, 20, 20, 0.75)', // Glassmorphism base
  },

  // ============================================
  // 4. SURFACE COLORS
  // ============================================
  surface: {
    card: 'rgba(30, 30, 30, 0.8)',
    cardSolid: '#1E1E1E',
    modal: 'rgba(20, 20, 20, 0.95)',
    overlay: 'rgba(0, 0, 0, 0.6)',
    overlayHeavy: 'rgba(0, 0, 0, 0.85)',
    glass: 'rgba(255, 255, 255, 0.08)',
    glassBorder: 'rgba(255, 255, 255, 0.1)',
  },

  // ============================================
  // 5. BORDER COLORS
  // ============================================
  border: {
    default: 'rgba(255, 255, 255, 0.1)',
    light: 'rgba(255, 255, 255, 0.05)',
    dark: 'rgba(255, 255, 255, 0.2)',
    focus: '#CCFF00',
    glow: 'rgba(204, 255, 0, 0.3)',
  },

  // ============================================
  // 6. FEEDBACK COLORS
  // ============================================
  feedback: {
    success: '#00FF88',      // Neon Green
    successLight: 'rgba(0, 255, 136, 0.15)',
    warning: '#FFB800',      // Amber
    warningLight: 'rgba(255, 184, 0, 0.15)',
    error: '#FF4757',        // Neon Red
    errorLight: 'rgba(255, 71, 87, 0.15)',
    info: '#00D4FF',         // Cyan
    infoLight: 'rgba(0, 212, 255, 0.15)',
  },

  // ============================================
  // 7. UTILITY COLORS
  // ============================================
  utility: {
    white: '#FFFFFF',
    black: '#000000',
    ultraBlack: '#0A0A0A',
    transparent: 'transparent',
    disabled: 'rgba(255, 255, 255, 0.3)',
  },

  // ============================================
  // 8. GRADIENT COLORS
  // ============================================
  gradient: {
    primary: ['#CCFF00', '#00FFFF'],       // Lime to Cyan
    secondary: ['#FF00FF', '#00FFFF'],     // Magenta to Cyan
    warm: ['#CCFF00', '#FF00FF'],          // Lime to Magenta
    dark: ['transparent', 'rgba(0,0,0,0.4)', 'rgba(0,0,0,0.95)'], // Card overlay
    glass: ['rgba(255,255,255,0.1)', 'rgba(255,255,255,0.05)'],
    cardOverlay: ['transparent', 'rgba(0,0,0,0.4)', 'rgba(0,0,0,0.95)'],
  },

  // ============================================
  // 9. SPECIAL EFFECTS
  // ============================================
  glow: {
    primary: 'rgba(204, 255, 0, 0.4)',     // Lime glow
    secondary: 'rgba(255, 0, 255, 0.4)',   // Magenta glow
    accent: 'rgba(0, 255, 255, 0.4)',      // Cyan glow
  },
} as const;

// ============================================
// LIGHT MODE (for specific screens if needed)
// ============================================
export const COLORS_LIGHT = {
  brand: {
    primary: '#CCFF00',
    primaryLight: '#E0FF4D',
    primaryDark: '#A3CC00',
    secondary: '#FF00FF',
    secondaryLight: '#FF4DFF',
    secondaryDark: '#CC00CC',
    accent: '#00CCCC',
  },

  text: {
    primary: '#0A0A0A',
    secondary: 'rgba(10, 10, 10, 0.7)',
    tertiary: 'rgba(10, 10, 10, 0.5)',
    muted: 'rgba(10, 10, 10, 0.4)',
    link: '#A3CC00',
    onLight: '#0A0A0A',
    onLightSecondary: 'rgba(10, 10, 10, 0.7)',
    onDark: '#FFFFFF',
    onDarkSecondary: 'rgba(255, 255, 255, 0.85)',
    onDarkMuted: 'rgba(255, 255, 255, 0.6)',
  },

  background: {
    primary: '#FFFFFF',
    secondary: '#F8F9FA',
    tertiary: '#E9ECEF',
    elevated: '#FFFFFF',
    glass: 'rgba(255, 255, 255, 0.9)',
  },

  surface: {
    card: '#FFFFFF',
    cardSolid: '#FFFFFF',
    modal: '#FFFFFF',
    overlay: 'rgba(0, 0, 0, 0.5)',
    overlayHeavy: 'rgba(0, 0, 0, 0.7)',
    glass: 'rgba(255, 255, 255, 0.8)',
    glassBorder: 'rgba(0, 0, 0, 0.1)',
  },

  border: {
    default: 'rgba(0, 0, 0, 0.1)',
    light: 'rgba(0, 0, 0, 0.05)',
    dark: 'rgba(0, 0, 0, 0.2)',
    focus: '#A3CC00',
    glow: 'rgba(163, 204, 0, 0.3)',
  },

  feedback: {
    success: '#00CC6A',
    successLight: 'rgba(0, 204, 106, 0.15)',
    warning: '#CC9300',
    warningLight: 'rgba(204, 147, 0, 0.15)',
    error: '#CC3A47',
    errorLight: 'rgba(204, 58, 71, 0.15)',
    info: '#00A8CC',
    infoLight: 'rgba(0, 168, 204, 0.15)',
  },

  utility: {
    white: '#FFFFFF',
    black: '#000000',
    ultraBlack: '#0A0A0A',
    transparent: 'transparent',
    disabled: 'rgba(0, 0, 0, 0.3)',
  },

  gradient: {
    primary: ['#CCFF00', '#00CCCC'],
    secondary: ['#CC00CC', '#00CCCC'],
    warm: ['#A3CC00', '#CC00CC'],
    dark: ['#212529', '#495057'],
    glass: ['rgba(255,255,255,0.9)', 'rgba(255,255,255,0.7)'],
    cardOverlay: ['transparent', 'rgba(0,0,0,0.3)', 'rgba(0,0,0,0.7)'],
  },

  glow: {
    primary: 'rgba(163, 204, 0, 0.4)',
    secondary: 'rgba(204, 0, 204, 0.4)',
    accent: 'rgba(0, 204, 204, 0.4)',
  },
} as const;

// Backward compatibility alias
export const COLORS_DARK = COLORS;

// Type exports
export type Colors = typeof COLORS;
export type ColorCategory = keyof Colors;

/**
 * TravelMatch Mobile - Awwwards Edition Color Palette
 *
 * Felsefe: Twilight Zinc (Yumuşak Koyu) zemin üzerinde
 * GenZ enerjisini temsil eden yüksek kontrastlı Neon dokunuşlar.
 *
 * Core Principles:
 * - Soft Dark: Ultra siyah değil, derinliği olan antrasit
 * - Neon Energy: Cesur, yüksek kontrastlı aksiyon renkleri
 * - Liquid Glass: Şeffaflık ve blur efektleri ile derinlik
 * - High Legibility: Okunabilirlik öncelikli metin kontrastları
 */

// ============================================
// 1. BRAND COLORS - Neon Lime + Twilight Zinc
// ============================================
export const COLORS = {
  brand: {
    primary: '#DFFF00',      // Neon Lime - Ana aksiyon rengi
    primaryLight: '#E8FF4D', // Hover state
    primaryDark: '#C8E600',  // Pressed state
    secondary: '#A855F7',    // Electric Violet - Premium/AI
    secondaryLight: '#C084FC',
    secondaryDark: '#9333EA',
    accent: '#06B6D4',       // Cyan - Trust/Verified
  },

  // ============================================
  // 2. TEXT COLORS
  // ============================================
  text: {
    primary: '#F8FAFC',      // Neredeyse beyaz
    secondary: '#94A3B8',    // Yardımcı metinler
    tertiary: '#64748B',     // Üçüncül metinler
    muted: '#475569',        // Pasif metinler
    link: '#DFFF00',         // Link rengi
    // On light backgrounds
    onLight: '#121214',
    onLightSecondary: '#475569',
    // On dark backgrounds
    onDark: '#FFFFFF',
    onDarkSecondary: 'rgba(255, 255, 255, 0.72)',
    onDarkMuted: 'rgba(255, 255, 255, 0.48)',
  },

  // ============================================
  // 3. BACKGROUND COLORS - Twilight Zinc
  // ============================================
  background: {
    primary: '#121214',      // Ana zemin - derin antrasit
    secondary: '#1E1E20',    // Kartlar ve yüzeyler
    tertiary: '#27272A',     // Yükseltilmiş yüzeyler
    elevated: '#27272A',     // Elevated surfaces
    glass: 'rgba(255, 255, 255, 0.03)', // Liquid Glass
  },

  // ============================================
  // 4. SURFACE COLORS
  // ============================================
  surface: {
    card: '#1E1E20',
    cardSolid: '#1E1E20',
    modal: 'rgba(18, 18, 20, 0.95)',
    overlay: 'rgba(0, 0, 0, 0.6)',
    overlayHeavy: 'rgba(0, 0, 0, 0.85)',
    glass: 'rgba(255, 255, 255, 0.03)',
    glassBorder: 'rgba(255, 255, 255, 0.08)',
  },

  // ============================================
  // 5. BORDER COLORS
  // ============================================
  border: {
    default: 'rgba(255, 255, 255, 0.08)',
    light: 'rgba(255, 255, 255, 0.05)',
    dark: 'rgba(255, 255, 255, 0.15)',
    focus: '#DFFF00',
    glow: 'rgba(223, 255, 0, 0.3)',
  },

  // ============================================
  // 6. FEEDBACK COLORS
  // ============================================
  feedback: {
    success: '#10B981',      // Emerald
    successLight: 'rgba(16, 185, 129, 0.15)',
    warning: '#F59E0B',      // Amber
    warningLight: 'rgba(245, 158, 11, 0.15)',
    error: '#F43F5E',        // Rose
    errorLight: 'rgba(244, 63, 94, 0.15)',
    info: '#06B6D4',         // Cyan
    infoLight: 'rgba(6, 182, 212, 0.15)',
  },

  // ============================================
  // 7. UTILITY COLORS
  // ============================================
  utility: {
    white: '#FFFFFF',
    black: '#000000',
    ultraBlack: '#121214',
    transparent: 'transparent',
    disabled: '#52525B',
  },

  // ============================================
  // 8. GRADIENT COLORS
  // ============================================
  gradient: {
    primary: ['#DFFF00', '#C8E600'],           // Lime gradient
    secondary: ['#A855F7', '#9333EA'],         // Violet gradient
    warm: ['#DFFF00', '#F43F5E'],              // Lime to Rose
    dark: ['transparent', 'rgba(0,0,0,0.4)', 'rgba(0,0,0,0.95)'],
    glass: ['rgba(255,255,255,0.08)', 'rgba(255,255,255,0.03)'],
    cardOverlay: ['transparent', 'rgba(0,0,0,0.4)', 'rgba(0,0,0,0.85)'],
  },

  // ============================================
  // 9. SPECIAL EFFECTS - Neon Glows
  // ============================================
  glow: {
    primary: 'rgba(223, 255, 0, 0.4)',     // Lime glow
    secondary: 'rgba(168, 85, 247, 0.4)',  // Violet glow
    accent: 'rgba(6, 182, 212, 0.4)',      // Cyan glow
    rose: 'rgba(244, 63, 94, 0.4)',        // Rose glow
  },
} as const;

// ============================================
// LIGHT MODE (for specific screens if needed)
// ============================================
export const COLORS_LIGHT = {
  brand: {
    primary: '#C8E600',      // Darker lime for better contrast
    primaryLight: '#DFFF00',
    primaryDark: '#A3CC00',
    secondary: '#9333EA',
    secondaryLight: '#A855F7',
    secondaryDark: '#7C3AED',
    accent: '#0891B2',
  },

  text: {
    primary: '#121214',
    secondary: '#475569',
    tertiary: '#64748B',
    muted: '#94A3B8',
    link: '#C8E600',
    onLight: '#121214',
    onLightSecondary: '#475569',
    onDark: '#FFFFFF',
    onDarkSecondary: 'rgba(255, 255, 255, 0.85)',
    onDarkMuted: 'rgba(255, 255, 255, 0.6)',
  },

  background: {
    primary: '#FAFAFA',
    secondary: '#F4F4F5',
    tertiary: '#E4E4E7',
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
    focus: '#C8E600',
    glow: 'rgba(200, 230, 0, 0.3)',
  },

  feedback: {
    success: '#059669',
    successLight: 'rgba(5, 150, 105, 0.15)',
    warning: '#D97706',
    warningLight: 'rgba(217, 119, 6, 0.15)',
    error: '#E11D48',
    errorLight: 'rgba(225, 29, 72, 0.15)',
    info: '#0891B2',
    infoLight: 'rgba(8, 145, 178, 0.15)',
  },

  utility: {
    white: '#FFFFFF',
    black: '#000000',
    ultraBlack: '#121214',
    transparent: 'transparent',
    disabled: '#A1A1AA',
  },

  gradient: {
    primary: ['#C8E600', '#A3CC00'],
    secondary: ['#9333EA', '#7C3AED'],
    warm: ['#C8E600', '#E11D48'],
    dark: ['#27272A', '#3F3F46'],
    glass: ['rgba(255,255,255,0.9)', 'rgba(255,255,255,0.7)'],
    cardOverlay: ['transparent', 'rgba(0,0,0,0.3)', 'rgba(0,0,0,0.7)'],
  },

  glow: {
    primary: 'rgba(200, 230, 0, 0.4)',
    secondary: 'rgba(147, 51, 234, 0.4)',
    accent: 'rgba(8, 145, 178, 0.4)',
    rose: 'rgba(225, 29, 72, 0.4)',
  },
} as const;

// Backward compatibility alias
export const COLORS_DARK = COLORS;

// Type exports
export type Colors = typeof COLORS;
export type ColorCategory = keyof Colors;

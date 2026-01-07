/**
 * TravelMatch - Awwwards Edition Color Palette
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

// ═══════════════════════════════════════════════════════════════════
// PRIMITIVES - Raw color values (internal use only)
// ═══════════════════════════════════════════════════════════════════
const primitives = {
  // Zinc Scale (Twilight Base)
  zinc: {
    50: '#FAFAFA',
    100: '#F4F4F5',
    200: '#E4E4E7',
    300: '#D4D4D8',
    400: '#A1A1AA',
    500: '#71717A',
    600: '#52525B',
    700: '#3F3F46',
    800: '#27272A',
    900: '#18181B',
    950: '#09090B',
  },

  // Neon Lime (Gift-Lime - Primary Action)
  lime: {
    50: '#F7FEE7',
    100: '#ECFCCB',
    200: '#D9F99D',
    300: '#BEF264',
    400: '#A3E635',
    500: '#DFFF00', // ← Ana Primary (Neon)
    600: '#C8E600',
    700: '#A3CC00',
    800: '#84A300',
    900: '#657A00',
  },

  // Electric Violet (Premium & AI)
  violet: {
    50: '#FAF5FF',
    100: '#F3E8FF',
    200: '#E9D5FF',
    300: '#D8B4FE',
    400: '#C084FC',
    500: '#A855F7', // ← Ana Secondary
    600: '#9333EA',
    700: '#7C3AED',
    800: '#6B21A8',
    900: '#581C87',
  },

  // Soft Neon Rose (Hearts & Errors)
  rose: {
    50: '#FFF1F2',
    100: '#FFE4E6',
    200: '#FECDD3',
    300: '#FDA4AF',
    400: '#FB7185',
    500: '#F43F5E', // ← Accent Rose
    600: '#E11D48',
    700: '#BE123C',
    800: '#9F1239',
    900: '#881337',
  },

  // Cyan (Verified & Trust)
  cyan: {
    50: '#ECFEFF',
    100: '#CFFAFE',
    200: '#A5F3FC',
    300: '#67E8F9',
    400: '#22D3EE',
    500: '#06B6D4', // ← Trust/Verified
    600: '#0891B2',
    700: '#0E7490',
    800: '#155E75',
    900: '#164E63',
  },

  // Amber (Warnings & Countdowns)
  amber: {
    50: '#FFFBEB',
    100: '#FEF3C7',
    200: '#FDE68A',
    300: '#FCD34D',
    400: '#FBBF24',
    500: '#F59E0B', // ← Warning
    600: '#D97706',
    700: '#B45309',
    800: '#92400E',
    900: '#78350F',
  },

  // Emerald (Success)
  emerald: {
    50: '#ECFDF5',
    100: '#D1FAE5',
    200: '#A7F3D0',
    300: '#6EE7B7',
    400: '#34D399',
    500: '#10B981',
    600: '#059669',
    700: '#047857',
    800: '#065F46',
    900: '#064E3B',
  },

  // Red (Errors)
  red: {
    50: '#FEF2F2',
    100: '#FEE2E2',
    200: '#FECACA',
    300: '#FCA5A5',
    400: '#F87171',
    500: '#EF4444',
    600: '#DC2626',
    700: '#B91C1C',
    800: '#991B1B',
    900: '#7F1D1D',
  },

  // Blue (Info)
  blue: {
    50: '#EFF6FF',
    100: '#DBEAFE',
    200: '#BFDBFE',
    300: '#93C5FD',
    400: '#60A5FA',
    500: '#3B82F6',
    600: '#2563EB',
    700: '#1D4ED8',
    800: '#1E40AF',
    900: '#1E3A8A',
  },

  white: '#FFFFFF',
  black: '#000000',
} as const;

// ═══════════════════════════════════════════════════════════════════
// SEMANTIC COLORS - The Twilight Zinc & Neon Energy System
// ═══════════════════════════════════════════════════════════════════
export const COLORS = {
  // ─────────────────────────────────────────────────
  // Zemin Renkleri (Twilight Zinc)
  // Ultra siyah değil, derinliği olan antrasit
  // ─────────────────────────────────────────────────
  background: {
    main: '#121214', // Ana zemin - derin antrasit
    surface: '#1E1E20', // Kartlar ve yüzeyler
    elevated: '#27272A', // Yükseltilmiş yüzeyler
    overlay: 'rgba(18, 18, 20, 0.85)',
    glass: 'rgba(255, 255, 255, 0.03)', // Liquid Glass etkisi
  },

  // Flat background aliases
  backgroundMain: '#121214',
  backgroundSurface: '#1E1E20',
  backgroundElevated: '#27272A',
  backgroundOverlay: 'rgba(18, 18, 20, 0.85)',
  backgroundGlass: 'rgba(255, 255, 255, 0.03)',

  // Legacy background aliases
  backgroundPrimary: '#121214',
  backgroundSecondary: '#1E1E20',
  backgroundTertiary: '#27272A',
  backgroundDark: '#121214',
  backgroundDarkSecondary: '#1E1E20',
  backgroundDarkTertiary: '#27272A',
  backgroundLight: '#FAFAFA',

  // ─────────────────────────────────────────────────
  // Primary - Aksiyon ve Enerji (Gift-Lime Neon)
  // Gift gönder, Create, Continue, Confirm
  // ─────────────────────────────────────────────────
  primary: {
    main: '#DFFF00', // Neon Lime - Ana aksiyon rengi
    dark: '#C8E600', // Pressed state
    light: '#E8FF4D', // Hover state
    glow: 'rgba(223, 255, 0, 0.3)', // Glow efekti
    muted: 'rgba(223, 255, 0, 0.12)',
  },

  // Flat primary aliases
  primaryMain: '#DFFF00',
  primaryDark: '#C8E600',
  primaryLight: '#E8FF4D',
  primaryGlow: 'rgba(223, 255, 0, 0.3)',
  primaryMuted: 'rgba(223, 255, 0, 0.12)',

  // ─────────────────────────────────────────────────
  // Secondary - Premium & AI (Electric Violet)
  // Premium özellikler, AI özellikleri
  // ─────────────────────────────────────────────────
  secondary: {
    main: '#A855F7', // Electric Violet
    dark: '#9333EA', // Pressed state
    light: '#C084FC', // Hover state
    glow: 'rgba(168, 85, 247, 0.3)',
    muted: 'rgba(168, 85, 247, 0.12)',
  },

  // Flat secondary aliases
  secondaryMain: '#A855F7',
  secondaryDark: '#9333EA',
  secondaryLight: '#C084FC',
  secondaryGlow: 'rgba(168, 85, 247, 0.3)',
  secondaryMuted: 'rgba(168, 85, 247, 0.12)',

  // ─────────────────────────────────────────────────
  // Accent - Fonksiyonel Renkler
  // ─────────────────────────────────────────────────
  accent: {
    rose: '#F43F5E', // Kalpler, beğeniler ve hatalar
    roseGlow: 'rgba(244, 63, 94, 0.3)',
    cyan: '#06B6D4', // Doğrulanmış hesaplar & Güven
    cyanGlow: 'rgba(6, 182, 212, 0.3)',
    amber: '#F59E0B', // Uyarılar & Geri sayımlar
    amberGlow: 'rgba(245, 158, 11, 0.3)',
  },

  // Flat accent aliases
  accentRose: '#F43F5E',
  accentCyan: '#06B6D4',
  accentAmber: '#F59E0B',

  // ─────────────────────────────────────────────────
  // Text - Yüksek Okunabilirlik
  // ─────────────────────────────────────────────────
  text: {
    primary: '#F8FAFC', // Neredeyse beyaz (Zinc 50)
    secondary: '#94A3B8', // Yardımcı metinler (Slate 400)
    muted: '#475569', // Pasif metinler (Slate 600)
    disabled: '#334155', // Devre dışı metinler
    inverse: '#121214', // Koyu zemin üzerine açık buton metinleri
    link: '#DFFF00', // Link rengi (Primary)
  },

  // Flat text aliases
  textPrimary: '#F8FAFC',
  textSecondary: '#94A3B8',
  textMuted: '#475569',
  textDisabled: '#334155',
  textInverse: '#121214',
  textTertiary: '#64748B',
  textOnDark: '#FFFFFF',
  textOnDarkSecondary: 'rgba(255, 255, 255, 0.72)',
  textOnDarkMuted: 'rgba(255, 255, 255, 0.48)',

  // ─────────────────────────────────────────────────
  // Border - Kenarlıklar ve Ayrıştırıcılar
  // ─────────────────────────────────────────────────
  border: {
    light: 'rgba(255, 255, 255, 0.08)',
    medium: 'rgba(255, 255, 255, 0.15)',
    strong: 'rgba(255, 255, 255, 0.25)',
    focus: '#DFFF00', // Focus state (Primary)
  },

  // Flat border aliases
  borderLight: 'rgba(255, 255, 255, 0.08)',
  borderMedium: 'rgba(255, 255, 255, 0.15)',
  borderDefault: 'rgba(255, 255, 255, 0.08)',
  borderStrong: 'rgba(255, 255, 255, 0.25)',
  borderFocus: '#DFFF00',
  hairline: 'rgba(255, 255, 255, 0.08)',
  hairlineLight: 'rgba(255, 255, 255, 0.05)',

  // ─────────────────────────────────────────────────
  // Surface - Kartlar ve Glassmorphism
  // ─────────────────────────────────────────────────
  surface: {
    base: '#1E1E20',
    elevated: '#27272A',
    glass: 'rgba(255, 255, 255, 0.03)',
    glassBorder: 'rgba(255, 255, 255, 0.08)',
    glassHover: 'rgba(255, 255, 255, 0.06)',
  },

  // Flat surface aliases
  surfaceBase: '#1E1E20',
  surfaceLight: primitives.white,
  surfaceMuted: primitives.zinc[800],
  surfaceSubtle: primitives.zinc[700],
  surfaceDark: '#121214',

  // Glass effects
  glass: 'rgba(255, 255, 255, 0.03)',
  glassBorder: 'rgba(255, 255, 255, 0.08)',
  glassLight: 'rgba(255, 255, 255, 0.06)',
  glassDark: 'rgba(18, 18, 20, 0.88)',
  glassDarkBorder: 'rgba(255, 255, 255, 0.08)',

  // ─────────────────────────────────────────────────
  // Semantic Feedback
  // ─────────────────────────────────────────────────
  success: primitives.emerald[500],
  successLight: primitives.emerald[400],
  successDark: primitives.emerald[600],
  successMuted: 'rgba(16, 185, 129, 0.15)',
  successGlow: 'rgba(16, 185, 129, 0.3)',

  error: primitives.rose[500],
  errorLight: primitives.rose[400],
  errorDark: primitives.rose[600],
  errorMuted: 'rgba(244, 63, 94, 0.15)',
  danger: primitives.rose[500],
  destructive: primitives.rose[600],

  warning: primitives.amber[500],
  warningLight: primitives.amber[400],
  warningDark: primitives.amber[600],
  warningMuted: 'rgba(245, 158, 11, 0.15)',

  info: primitives.blue[500],
  infoLight: primitives.blue[400],
  infoDark: primitives.blue[600],
  infoMuted: 'rgba(59, 130, 246, 0.15)',

  // ─────────────────────────────────────────────────
  // Trust - Doğrulama & Güvenilirlik
  // ─────────────────────────────────────────────────
  trust: {
    primary: primitives.cyan[500],
    light: primitives.cyan[400],
    dark: primitives.cyan[600],
    muted: 'rgba(6, 182, 212, 0.15)',
    glow: 'rgba(6, 182, 212, 0.3)',
  },

  // Trust Score Levels (Jewelry tiers)
  trustPlatinum: '#E5E4E2',
  trustGold: '#FFD700',
  trustSilver: '#C0C0C0',
  trustBronze: '#CD7F32',
  trustLight: primitives.cyan[400],
  trustDark: primitives.cyan[600],
  trustMuted: 'rgba(6, 182, 212, 0.15)',

  // KYC Badge Colors
  kycBronze: '#CD7F32',
  kycSilver: '#C0C0C0',
  kycGold: '#FFD700',
  kycPlatinum: '#E5E4E2',

  // ─────────────────────────────────────────────────
  // Overlay
  // ─────────────────────────────────────────────────
  overlay: {
    default: 'rgba(0, 0, 0, 0.5)',
    light: 'rgba(0, 0, 0, 0.3)',
    medium: 'rgba(0, 0, 0, 0.5)',
    heavy: 'rgba(0, 0, 0, 0.7)',
    dark: 'rgba(0, 0, 0, 0.85)',
    backdrop: 'rgba(0, 0, 0, 0.6)',
  },

  // Flat overlay aliases
  overlayLight: 'rgba(0, 0, 0, 0.3)',
  overlayMedium: 'rgba(0, 0, 0, 0.5)',
  overlayDark: 'rgba(0, 0, 0, 0.7)',
  backdrop: 'rgba(0, 0, 0, 0.6)',
  modalBackdrop: 'rgba(0, 0, 0, 0.6)',

  // ─────────────────────────────────────────────────
  // Brand (Backward compatibility)
  // ─────────────────────────────────────────────────
  brand: {
    primary: '#DFFF00',
    primaryLight: '#E8FF4D',
    primaryDark: '#C8E600',
    secondary: '#A855F7',
    secondaryLight: '#C084FC',
    secondaryDark: '#9333EA',
    accent: '#06B6D4',
  },

  // ─────────────────────────────────────────────────
  // Feedback (Backward compatibility)
  // ─────────────────────────────────────────────────
  feedback: {
    success: primitives.emerald[500],
    successLight: primitives.emerald[400],
    error: primitives.rose[500],
    errorLight: primitives.rose[400],
    warning: primitives.amber[500],
    warningLight: primitives.amber[400],
    info: primitives.blue[500],
    infoLight: primitives.blue[400],
  },

  // ─────────────────────────────────────────────────
  // Utility
  // ─────────────────────────────────────────────────
  utility: {
    white: primitives.white,
    black: primitives.black,
    transparent: 'transparent',
  },

  // UI Essentials
  white: primitives.white,
  black: primitives.black,
  transparent: 'transparent',
  disabled: primitives.zinc[600],
  shadow: primitives.black,
  shadowColor: primitives.black,

  // Gray Scale
  gray: primitives.zinc,

  // ─────────────────────────────────────────────────
  // Card
  // ─────────────────────────────────────────────────
  card: '#1E1E20',
  cardBackground: '#1E1E20',
  cardDark: '#27272A',
  cardBorder: 'rgba(255, 255, 255, 0.08)',

  // ─────────────────────────────────────────────────
  // Input
  // ─────────────────────────────────────────────────
  inputBackground: '#27272A',
  inputBorder: 'rgba(255, 255, 255, 0.08)',
  inputBorderFocus: '#DFFF00',
  inputText: '#F8FAFC',
  inputPlaceholder: '#64748B',

  // ─────────────────────────────────────────────────
  // Button
  // ─────────────────────────────────────────────────
  buttonPrimary: '#DFFF00',
  buttonPrimaryText: '#121214',
  buttonSecondary: '#A855F7',
  buttonSecondaryText: '#FFFFFF',
  buttonDark: primitives.zinc[800],
  buttonDisabled: primitives.zinc[700],
  buttonDisabledText: primitives.zinc[500],

  // ─────────────────────────────────────────────────
  // Social/Brand Colors
  // ─────────────────────────────────────────────────
  facebook: '#1877F2',
  google: '#4285F4',
  apple: primitives.white,
  twitter: '#1DA1F2',
  whatsapp: '#25D366',
  instagram: '#E4405F',
  telegram: '#0088CC',
  linkedin: '#0A66C2',
  tiktok: primitives.white,
  visa: '#1A1F71',
  mastercard: '#EB001B',

  // ─────────────────────────────────────────────────
  // Named Colors (for convenience)
  // ─────────────────────────────────────────────────
  lime: '#DFFF00',
  violet: primitives.violet[500],
  rose: primitives.rose[500],
  cyan: primitives.cyan[500],
  amber: primitives.amber[500],
  emerald: primitives.emerald[500],
  blue: primitives.blue[500],
  gold: '#FFD700',
  coral: primitives.rose[400],
  mint: primitives.emerald[400],
  purple: primitives.violet[500],
  pink: primitives.rose[400],
  magenta: '#FF00FF',
  teal: primitives.cyan[600],
  seafoam: primitives.cyan[400],
  indigo: '#6366F1',
  orange: primitives.amber[500],
  orangeDark: primitives.amber[600],
  orangeBright: primitives.amber[400],

  // ═══════════════════════════════════════════════════
  // LEGACY ALIASES (Deprecated - for backwards compatibility)
  // ═══════════════════════════════════════════════════

  // Legacy glow
  glow: {
    primary: 'rgba(223, 255, 0, 0.3)',
    secondary: 'rgba(168, 85, 247, 0.3)',
    accent: 'rgba(6, 182, 212, 0.3)',
    rose: 'rgba(244, 63, 94, 0.3)',
  },

  // Legacy transparency
  primaryTransparent: 'rgba(223, 255, 0, 0.15)',
  secondaryTransparent: 'rgba(168, 85, 247, 0.15)',
  whiteTransparent: 'rgba(255, 255, 255, 0.18)',
  blackTransparent: 'rgba(0, 0, 0, 0.5)',
  coralTransparent: 'rgba(244, 63, 94, 0.15)',
  mintTransparent: 'rgba(16, 185, 129, 0.15)',
  successTransparent: 'rgba(16, 185, 129, 0.15)',
  errorTransparent10: 'rgba(244, 63, 94, 0.1)',
  errorTransparent20: 'rgba(244, 63, 94, 0.2)',

  // Legacy overlay variants
  overlay30: 'rgba(0, 0, 0, 0.3)',
  overlay40: 'rgba(0, 0, 0, 0.4)',
  overlay50: 'rgba(0, 0, 0, 0.5)',
  overlay60: 'rgba(0, 0, 0, 0.6)',
  overlay70: 'rgba(0, 0, 0, 0.7)',
  overlay75: 'rgba(0, 0, 0, 0.75)',
  darkOverlay: 'rgba(18, 18, 20, 0.4)',

  // Legacy text
  textWhite70: 'rgba(255, 255, 255, 0.7)',
  textWhite80: 'rgba(255, 255, 255, 0.8)',
  subtitle: 'rgba(255, 255, 255, 0.9)',

  // Legacy white overlays
  whiteOverlay20: 'rgba(255, 255, 255, 0.2)',
  whiteOverlay30: 'rgba(255, 255, 255, 0.3)',
  whiteOverlay70: 'rgba(255, 255, 255, 0.7)',
  whiteOverlay80: 'rgba(255, 255, 255, 0.8)',
  whiteTransparentLight: 'rgba(255, 255, 255, 0.3)',
  whiteTransparentDark: 'rgba(255, 255, 255, 0.2)',
  whiteTransparentDarker: 'rgba(255, 255, 255, 0.1)',
  whiteTransparentDarkest: 'rgba(255, 255, 255, 0.05)',
  transparentWhite: 'rgba(255, 255, 255, 0.18)',

  // Legacy black overlays
  blackTransparentLight: 'rgba(0, 0, 0, 0.3)',
  blackTransparentDark: 'rgba(0, 0, 0, 0.1)',
  blackTransparentDarker: 'rgba(0, 0, 0, 0.08)',

  // Legacy bg (Light mode support)
  bg: {
    primary: '#FAFAFA',
    primaryLight: '#FFFFFF',
    primaryDark: '#F4F4F5',
    secondary: '#F4F4F5',
    tertiary: '#E4E4E7',
  },

  // Trust ring levels (legacy)
  trustLow: primitives.rose[500],
  trustMedium: primitives.amber[500],
  trustHigh: primitives.cyan[500],

  // Legacy misc
  glassBackground: 'rgba(18, 18, 20, 0.85)',
  mapHeader: 'rgba(18, 18, 20, 0.95)',
  filterPillActive: 'rgba(223, 255, 0, 0.2)',
  filterPillActiveBorder: 'rgba(223, 255, 0, 0.5)',
  beige: '#27272A',
  beigeLight: '#3F3F46',
  brown: '#52525B',
  brownDark: '#18181B',
  brownGray: '#71717A',
  greenSuccess: primitives.emerald[500],
  greenBright: '#22C55E',
  greenDark: '#15803D',
  orangeAlt: primitives.amber[500],
  softOrange: primitives.amber[400],
  softRed: primitives.rose[400],
  softGray: primitives.zinc[500],
  grayMedium: primitives.zinc[500],
  grayLight: primitives.zinc[400],
  darkGray: primitives.zinc[300],
  lightGray: primitives.zinc[600],
  amberLight: primitives.amber[100],
  amberDark: primitives.amber[600],
  amberBright: primitives.amber[400],
  mintDark: primitives.emerald[600],
  mintBorder: primitives.emerald[700],
  mintBackground: primitives.emerald[900],
  errorRed: primitives.rose[500],
  errorRedLight: primitives.rose[300],
  errorBackground: primitives.rose[900],
  backgroundGradient: '#121214',
  surfaceSurface: '#1E1E20',
  borderDark: primitives.zinc[700],
} as const;

// ═══════════════════════════════════════════════════════════════════
// GRADIENTS - Neon Energy Transitions
// ═══════════════════════════════════════════════════════════════════
export const GRADIENTS = {
  // Primary Neon Gradients
  primary: ['#DFFF00', '#C8E600'] as const,
  secondary: ['#A855F7', '#9333EA'] as const,

  // Hero / Splash - Neon Energy
  hero: ['#DFFF00', '#A855F7'] as const,
  heroVertical: ['#DFFF00', '#A855F7', '#121214'] as const,

  // Gift CTA - Maximum Impact
  gift: ['#DFFF00', '#A855F7'] as const,
  giftButton: ['#DFFF00', '#C8E600'] as const,
  giftSoft: ['#E8FF4D', '#C084FC'] as const,

  // Trust - Cyan Shimmer
  trust: ['#22D3EE', '#06B6D4'] as const,
  trustShimmer: ['#67E8F9', '#06B6D4', '#67E8F9'] as const,

  // Discovery - Violet Flow
  discover: ['#A855F7', '#7C3AED'] as const,

  // Decorative
  celebration: ['#A855F7', '#F43F5E'] as const,
  sunset: ['#DFFF00', '#A855F7', '#F43F5E'] as const,
  sunsetSoft: ['rgba(223, 255, 0, 0.3)', 'rgba(168, 85, 247, 0.2)'] as const,
  aurora: ['#A855F7', '#06B6D4'] as const,

  // Card Overlays
  cardOverlay: [
    'transparent',
    'rgba(0, 0, 0, 0.4)',
    'rgba(0, 0, 0, 0.85)',
  ] as const,
  cardOverlayLight: [
    'transparent',
    'rgba(0, 0, 0, 0.2)',
    'rgba(0, 0, 0, 0.6)',
  ] as const,
  heroLight: ['transparent', 'rgba(0, 0, 0, 0.6)'] as const,

  // Glass
  glassLight: [
    'rgba(255, 255, 255, 0.08)',
    'rgba(255, 255, 255, 0.03)',
  ] as const,
  glassDark: ['rgba(18, 18, 20, 0.9)', 'rgba(18, 18, 20, 0.7)'] as const,

  // Neon Glow
  neonLime: ['rgba(223, 255, 0, 0.4)', 'rgba(223, 255, 0, 0)'] as const,
  neonViolet: ['rgba(168, 85, 247, 0.4)', 'rgba(168, 85, 247, 0)'] as const,
  neonCyan: ['rgba(6, 182, 212, 0.4)', 'rgba(6, 182, 212, 0)'] as const,

  // Map/location peek
  mapPeek: ['rgba(18, 18, 20, 0)', 'rgba(18, 18, 20, 1)'] as const,

  // Disabled
  disabled: [primitives.zinc[700], primitives.zinc[600]] as const,

  // Legacy warm gradient
  warm: ['#DFFF00', '#F43F5E'] as const,
  dark: ['transparent', 'rgba(0,0,0,0.4)', 'rgba(0,0,0,0.95)'] as const,
  glass: ['rgba(255,255,255,0.08)', 'rgba(255,255,255,0.03)'] as const,
} as const;

// ═══════════════════════════════════════════════════════════════════
// SHADOWS - Neon Glow & Soft Elevation
// ═══════════════════════════════════════════════════════════════════
export const SHADOWS = {
  // None
  none: {
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },

  // Subtle
  subtle: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 1,
  },

  // Small
  sm: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.25,
    shadowRadius: 2,
    elevation: 1,
  },

  // Medium
  md: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },

  // Large
  lg: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 5,
  },

  // Cards - Soft elevation
  card: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 4,
  },
  cardHover: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 8,
  },

  // Primary Button - Neon Lime Glow
  button: {
    shadowColor: '#DFFF00',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 6,
  },
  buttonPressed: {
    shadowColor: '#DFFF00',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 3,
  },

  // Secondary Button - Violet Glow
  buttonSecondary: {
    shadowColor: '#A855F7',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 6,
  },

  // Trust - Cyan Glow
  trustGlow: {
    shadowColor: '#06B6D4',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 16,
    elevation: 8,
  },

  // Rose Glow (Hearts, Likes)
  roseGlow: {
    shadowColor: '#F43F5E',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 6,
  },

  // Elevated surfaces
  elevated: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.4,
    shadowRadius: 24,
    elevation: 12,
  },

  // Neon Glows
  neonLime: {
    shadowColor: '#DFFF00',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 10,
  },
  neonViolet: {
    shadowColor: '#A855F7',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 10,
  },
  neonCyan: {
    shadowColor: '#06B6D4',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 10,
  },
} as const;

// Legacy shadow exports
export const CARD_SHADOW = SHADOWS.card;
export const CARD_SHADOW_LIGHT = SHADOWS.subtle;
export const CARD_SHADOW_HEAVY = SHADOWS.elevated;

// Export primitives for advanced use cases
export { primitives };

// PALETTE export for backwards compatibility
export const PALETTE = {
  ...primitives,
} as const;

// Type exports
export type ColorKey = keyof typeof COLORS;
export type GradientKey = keyof typeof GRADIENTS;
export type ShadowKey = keyof typeof SHADOWS;
export type ColorName = keyof typeof COLORS;
export type GradientName = keyof typeof GRADIENTS;
export type ShadowName = keyof typeof SHADOWS;

// Trust level types and helper functions
export type TrustLevel = 'low' | 'medium' | 'high' | 'platinum';

export const getTrustLevel = (score: number): TrustLevel => {
  if (score >= 90) return 'platinum';
  if (score >= 70) return 'high';
  if (score >= 50) return 'medium';
  return 'low';
};

export const getTrustRingColors = (score: number): [string, string] => {
  const level = getTrustLevel(score);
  switch (level) {
    case 'platinum':
      return [COLORS.trustPlatinum, COLORS.trustGold];
    case 'high':
      return [COLORS.trustGold, primitives.amber[400]];
    case 'medium':
      return [primitives.amber[400], primitives.amber[500]];
    default:
      return [COLORS.trustLow, primitives.rose[400]];
  }
};

export default COLORS;

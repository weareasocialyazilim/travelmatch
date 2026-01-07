/**
 * TravelMatch Vibe Room - Awwwards Edition Theme
 *
 * Twilight Zinc & Neon Energy aesthetic for the inbox experience.
 * Premium dark theme with liquid glass and neon accents.
 */

export const VIBE_ROOM_COLORS = {
  // Background layers (Twilight Zinc)
  background: {
    primary: '#121214', // Main background - deep anthracite
    secondary: '#1E1E20', // Card surfaces
    tertiary: '#27272A', // Elevated surfaces
    elevated: '#3F3F46', // Hover/pressed states
  },

  // Glass effects (Liquid Glass)
  glass: {
    background: 'rgba(30, 30, 32, 0.85)',
    backgroundLight: 'rgba(255, 255, 255, 0.03)',
    backgroundMedium: 'rgba(255, 255, 255, 0.06)',
    border: 'rgba(255, 255, 255, 0.08)',
    borderLight: 'rgba(255, 255, 255, 0.05)',
    borderActive: 'rgba(255, 255, 255, 0.15)',
  },

  // Text on dark (High Legibility)
  text: {
    primary: '#F8FAFC',
    secondary: '#94A3B8',
    tertiary: '#64748B',
    muted: '#475569',
    inverse: '#121214',
  },

  // Neon accent colors (Neon Energy)
  neon: {
    lime: '#DFFF00', // Primary action (Gift-Lime)
    violet: '#A855F7', // Premium/AI features
    cyan: '#06B6D4', // Verified & Trust
    rose: '#F43F5E', // Hearts & Notifications
    amber: '#F59E0B', // Warnings & Offers
    emerald: '#10B981', // Success & Online status
    // Legacy aliases
    magenta: '#A855F7',
    purple: '#A855F7',
    seafoam: '#06B6D4',
    red: '#F43F5E',
  },

  // Status-specific glows
  glow: {
    lime: 'rgba(223, 255, 0, 0.3)',
    violet: 'rgba(168, 85, 247, 0.3)',
    cyan: 'rgba(6, 182, 212, 0.3)',
    rose: 'rgba(244, 63, 94, 0.3)',
    amber: 'rgba(245, 158, 11, 0.3)',
    emerald: 'rgba(16, 185, 129, 0.3)',
    // Legacy aliases
    magenta: 'rgba(168, 85, 247, 0.3)',
    purple: 'rgba(168, 85, 247, 0.3)',
  },

  // Gradient presets for dark mode
  gradients: {
    cardOverlay: ['transparent', 'rgba(0, 0, 0, 0.85)'] as const,
    momentStrip: ['transparent', 'rgba(18, 18, 20, 0.95)'] as const,
    header: ['rgba(18, 18, 20, 0.98)', 'rgba(18, 18, 20, 0)'] as const,
    neonGlow: ['rgba(223, 255, 0, 0.2)', 'rgba(168, 85, 247, 0.2)'] as const,
    hero: ['#DFFF00', '#A855F7'] as const,
  },
} as const;

// Spacing constants for inbox
export const INBOX_SPACING = {
  screenPadding: 20,
  cardGap: 12,
  cardPadding: 16,
  headerHeight: 120,
  tabHeight: 48,
  momentStripWidth: 60,
  avatarSize: 32,
  statusBadgeHeight: 24,
} as const;

// Animation spring configs (Silky Smooth)
export const INBOX_SPRINGS = {
  snappy: { damping: 20, stiffness: 300, mass: 0.5 },
  bouncy: { damping: 15, stiffness: 150, mass: 0.5 },
  gentle: { damping: 20, stiffness: 120, mass: 0.5 },
  default: { damping: 15, stiffness: 150, mass: 0.5 },
} as const;

// Typography scale for inbox
export const INBOX_TYPOGRAPHY = {
  pageTitle: {
    fontSize: 32,
    fontWeight: '800' as const,
    letterSpacing: -1,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '600' as const,
    letterSpacing: -0.3,
  },
  cardSubtitle: {
    fontSize: 13,
    fontWeight: '400' as const,
    letterSpacing: 0,
  },
  caption: {
    fontSize: 12,
    fontWeight: '500' as const,
    letterSpacing: 0.2,
  },
  badge: {
    fontSize: 11,
    fontWeight: '700' as const,
    letterSpacing: 0.3,
  },
} as const;

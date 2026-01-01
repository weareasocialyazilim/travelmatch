/**
 * TravelMatch Vibe Room - Dark Theme Constants
 *
 * Premium dark theme with glass morphism and neon accents.
 * "Glass & Neon" aesthetic for the inbox experience.
 */

export const VIBE_ROOM_COLORS = {
  // Background layers
  background: {
    primary: '#0C0A09',      // Midnight black
    secondary: '#1C1917',    // Elevated surface
    tertiary: '#292524',     // Card background
    elevated: '#44403C',     // Hover/pressed states
  },

  // Glass effects
  glass: {
    background: 'rgba(28, 25, 23, 0.85)',
    backgroundLight: 'rgba(255, 255, 255, 0.03)',
    backgroundMedium: 'rgba(255, 255, 255, 0.05)',
    border: 'rgba(255, 255, 255, 0.08)',
    borderLight: 'rgba(255, 255, 255, 0.05)',
    borderActive: 'rgba(255, 255, 255, 0.12)',
  },

  // Text on dark
  text: {
    primary: '#FFFFFF',
    secondary: 'rgba(255, 255, 255, 0.6)',
    tertiary: 'rgba(255, 255, 255, 0.4)',
    muted: 'rgba(255, 255, 255, 0.3)',
    inverse: '#0C0A09',
  },

  // Neon accent colors (for badges & highlights)
  neon: {
    amber: '#F59E0B',         // Primary action
    magenta: '#EC4899',       // Offers & emotion
    emerald: '#10B981',       // Success & trust
    seafoam: '#14B8A6',       // Discovery
    purple: '#8B5CF6',        // Proof status
    red: '#EF4444',           // Urgent/error
  },

  // Status-specific glows
  glow: {
    amber: 'rgba(245, 158, 11, 0.3)',
    magenta: 'rgba(236, 72, 153, 0.3)',
    emerald: 'rgba(16, 185, 129, 0.3)',
    purple: 'rgba(139, 92, 246, 0.3)',
  },

  // Gradient presets for dark mode
  gradients: {
    cardOverlay: ['transparent', 'rgba(0, 0, 0, 0.8)'] as const,
    momentStrip: ['transparent', 'rgba(0, 0, 0, 0.9)'] as const,
    header: ['rgba(12, 10, 9, 0.95)', 'rgba(12, 10, 9, 0)'] as const,
    neonGlow: ['rgba(245, 158, 11, 0.2)', 'rgba(236, 72, 153, 0.2)'] as const,
  },
} as const;

// Spacing constants for inbox
export const INBOX_SPACING = {
  screenPadding: 20,
  cardGap: 12,
  cardPadding: 12,
  headerHeight: 120,
  tabHeight: 48,
  momentStripWidth: 56,
  avatarSize: 28,
  statusBadgeHeight: 22,
} as const;

// Animation spring configs
export const INBOX_SPRINGS = {
  snappy: { damping: 20, stiffness: 300 },
  bouncy: { damping: 15, stiffness: 200 },
  gentle: { damping: 20, stiffness: 150 },
} as const;

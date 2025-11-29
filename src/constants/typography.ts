import { COLORS } from './colors';

export const TYPOGRAPHY = {
  h1: {
    fontSize: 28,
    fontWeight: '700' as const,
    color: COLORS.text,
  },
  h2: {
    fontSize: 20,
    fontWeight: '600' as const,
    color: COLORS.text,
  },
  h3: {
    fontSize: 17,
    fontWeight: '600' as const,
    color: COLORS.text,
  },
  body: {
    fontSize: 15,
    fontWeight: '400' as const,
    color: COLORS.text,
  },
  bodySmall: {
    fontSize: 13,
    fontWeight: '400' as const,
    color: COLORS.textSecondary,
  },
  caption: {
    fontSize: 12,
    fontWeight: '400' as const,
    color: COLORS.textTertiary,
  },
} as const;

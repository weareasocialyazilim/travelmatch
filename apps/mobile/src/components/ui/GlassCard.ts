/**
 * GlassCard - Barrel export for backward compatibility
 *
 * This file provides a clean import path for GlassCard component.
 * GlassCard is actually defined in Card.tsx as a backward-compatible
 * alias for <Card variant="glass" />.
 *
 * @deprecated Consider using import { GlassCard } from '@/components/ui' or
 *             <Card variant="glass" /> directly for new code.
 */
export { GlassCard, GlassView, GlassButton } from './Card';

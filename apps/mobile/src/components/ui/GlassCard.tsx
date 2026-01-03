/**
 * @deprecated This file is deprecated. Use Card with variant="glass" instead.
 *
 * Migration Guide:
 * ================
 *
 * BEFORE:
 * ```tsx
 * import { GlassCard, GlassView, GlassButton } from '@/components/ui/GlassCard';
 *
 * <GlassCard intensity={40} tint="dark">
 *   <Text>Content</Text>
 * </GlassCard>
 * ```
 *
 * AFTER:
 * ```tsx
 * import { Card, GlassView, GlassButton } from '@/components/ui/Card';
 *
 * <Card variant="glass" intensity={40} tint="dark">
 *   <Text>Content</Text>
 * </Card>
 * ```
 *
 * Or use the deprecated alias (same behavior):
 * ```tsx
 * import { GlassCard } from '@/components/ui/Card';
 * ```
 *
 * This file re-exports from Card.tsx for backward compatibility.
 * Will be removed in a future major version.
 */

// Re-export everything from Card for backward compatibility
export { GlassCard, GlassView, GlassButton } from './Card';
export type { GlassTint } from './Card';

// Default export for backward compatibility
import { GlassCard } from './Card';
export default GlassCard;

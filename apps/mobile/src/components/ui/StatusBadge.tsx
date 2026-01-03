/**
 * @deprecated This component is deprecated. Use TMBadge with type="status" instead.
 *
 * Migration Guide:
 * ================
 *
 * BEFORE:
 * ```tsx
 * import { StatusBadge, LiveStatusBadge, VerifiedBadge, PremiumBadge } from '@/components/ui/StatusBadge';
 *
 * <StatusBadge label="Active" type="success" size="md" pulse showDot />
 * <LiveStatusBadge />
 * ```
 *
 * AFTER:
 * ```tsx
 * import { TMBadge } from '@/components/ui/TMBadge';
 *
 * <TMBadge type="status" label="Active" variant="success" size="md" pulse showDot />
 * <TMBadge type="status" variant="error" label="CANLI" size="sm" showDot pulse />
 * ```
 *
 * This file re-exports from TMBadge for backward compatibility.
 */

// Re-export from TMBadge for backward compatibility
export { TMBadge as StatusBadge, LiveStatusBadge, VerifiedBadge, PremiumBadge } from './TMBadge';
export type { BadgeSize, StatusVariant } from './TMBadge';

import { TMBadge } from './TMBadge';
export default TMBadge;

import {
  getEntitlements,
  type PlanTier,
  type BackendTier,
} from '@lovendo/entitlements';

// Convert PlanTier to BackendTier for getEntitlements
const PLAN_TO_BACKEND_TIER: Record<PlanTier, BackendTier> = {
  GUEST: 'free',
  FREE: 'free',
  PAID: 'premium',
  VIP: 'platinum',
};

export const requireAuthOr = (
  tier: PlanTier,
  action: () => void,
  onRequireAuth: () => void,
) => {
  if (tier === 'GUEST') return onRequireAuth();
  return action();
};

export const requireEntitlementOr = (
  tier: PlanTier,
  predicate: (e: ReturnType<typeof getEntitlements>) => boolean,
  action: () => void,
  onBlocked: () => void,
) => {
  const backendTier = PLAN_TO_BACKEND_TIER[tier];
  const e = getEntitlements(backendTier);
  if (!predicate(e)) return onBlocked();
  return action();
};

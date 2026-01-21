import { getEntitlements, type PlanTier } from '@lovendo/entitlements';

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
  const e = getEntitlements(tier);
  if (!predicate(e)) return onBlocked();
  return action();
};

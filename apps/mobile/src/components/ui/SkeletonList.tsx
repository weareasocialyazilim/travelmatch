/**
 * @deprecated This component is deprecated. Use TMSkeleton with type="list" instead.
 *
 * Migration Guide:
 * ================
 *
 * BEFORE:
 * ```tsx
 * import { SkeletonList } from '@/components/ui/SkeletonList';
 *
 * <SkeletonList type="chat" count={5} show={isLoading} />
 * ```
 *
 * AFTER:
 * ```tsx
 * import { TMSkeleton } from '@/components/ui/TMSkeleton';
 *
 * <TMSkeleton type="list" listType="chat" count={5} show={isLoading} />
 * ```
 *
 * This file re-exports from TMSkeleton for backward compatibility.
 */

import React from 'react';
import { TMSkeleton, SkeletonListType } from './TMSkeleton';

export type SkeletonItemType = SkeletonListType;

interface SkeletonListProps {
  type: SkeletonItemType;
  count?: number;
  minDisplayTime?: number;
  show?: boolean;
}

/**
 * @deprecated Use TMSkeleton with type="list" instead
 */
export const SkeletonList: React.FC<SkeletonListProps> = ({
  type,
  count = 5,
  minDisplayTime = 400,
  show = true,
}) => (
  <TMSkeleton
    type="list"
    listType={type}
    count={count}
    minDisplayTime={minDisplayTime}
    show={show}
  />
);

export default SkeletonList;

// Re-export type for consumers
export type { SkeletonListType } from './TMSkeleton';

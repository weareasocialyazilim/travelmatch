/**
 * @deprecated This component is deprecated. Use TMSkeleton with type="screen" instead.
 *
 * Migration Guide:
 * ================
 *
 * BEFORE:
 * ```tsx
 * import { ScreenSkeleton, ProfileSkeleton, ChatSkeleton } from '@/components/ui/NavigationSkeleton';
 *
 * <ScreenSkeleton showHeader showTabBar contentType="list" />
 * <ProfileSkeleton />
 * <ChatSkeleton />
 * ```
 *
 * AFTER:
 * ```tsx
 * import { TMSkeleton } from '@/components/ui/TMSkeleton';
 *
 * <TMSkeleton type="screen" screenType="generic" showHeader showTabBar />
 * <TMSkeleton type="screen" screenType="profile" />
 * <TMSkeleton type="screen" screenType="chat" />
 * ```
 *
 * This file re-exports from TMSkeleton for backward compatibility.
 */

import React from 'react';
import { TMSkeleton, SkeletonScreenType } from './TMSkeleton';

/**
 * @deprecated Use TMSkeleton with type="screen" instead
 */
export const ScreenSkeleton: React.FC<{
  showHeader?: boolean;
  showTabBar?: boolean;
  contentType?: 'list' | 'grid' | 'detail' | 'form';
}> = ({ showHeader = true, showTabBar = true, contentType = 'list' }) => (
  <TMSkeleton
    type="screen"
    screenType={contentType as SkeletonScreenType}
    showHeader={showHeader}
    showTabBar={showTabBar}
  />
);

/**
 * @deprecated Use TMSkeleton type="screen" screenType="generic" showHeader={false} showTabBar={false}
 */
export const HeaderSkeleton: React.FC = () => (
  <TMSkeleton type="screen" screenType="generic" showHeader showTabBar={false} />
);

/**
 * @deprecated Use TMSkeleton type="screen" screenType="generic" showHeader={false}
 */
export const TabBarSkeleton: React.FC = () => (
  <TMSkeleton type="screen" screenType="generic" showHeader={false} showTabBar />
);

/**
 * @deprecated Use TMSkeleton type="screen" screenType="generic"
 */
export const ListSkeleton: React.FC<{ count?: number }> = () => (
  <TMSkeleton type="screen" screenType="generic" showHeader={false} showTabBar={false} />
);

/**
 * @deprecated Use TMSkeleton type="screen" screenType="grid"
 */
export const GridSkeleton: React.FC<{ columns?: number }> = () => (
  <TMSkeleton type="screen" screenType="grid" showHeader={false} showTabBar={false} />
);

/**
 * @deprecated Use TMSkeleton type="screen" screenType="detail"
 */
export const DetailSkeleton: React.FC = () => (
  <TMSkeleton type="screen" screenType="detail" showHeader={false} showTabBar={false} />
);

/**
 * @deprecated Use TMSkeleton type="screen" screenType="form"
 */
export const FormSkeleton: React.FC = () => (
  <TMSkeleton type="screen" screenType="form" showHeader={false} showTabBar={false} />
);

/**
 * @deprecated Use TMSkeleton type="screen" screenType="profile"
 */
export const ProfileSkeleton: React.FC = () => (
  <TMSkeleton type="screen" screenType="profile" showHeader={false} showTabBar={false} />
);

/**
 * @deprecated Use TMSkeleton type="screen" screenType="chat"
 */
export const ChatSkeleton: React.FC = () => (
  <TMSkeleton type="screen" screenType="chat" showHeader={false} showTabBar={false} />
);

export default ScreenSkeleton;

// Re-export types
export type { SkeletonScreenType } from './TMSkeleton';

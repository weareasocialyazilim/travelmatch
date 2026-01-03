/**
 * @deprecated Import from '@/features/profile/components/createMoment' instead.
 *
 * Migration Guide:
 * ================
 *
 * BEFORE:
 * ```tsx
 * import { PhotoSection, CategorySelector } from '@/components/createMoment';
 * ```
 *
 * AFTER:
 * ```tsx
 * import { PhotoSection, CategorySelector } from '@/features/profile/components/createMoment';
 * ```
 *
 * This file re-exports for backward compatibility.
 */

export {
  default as PhotoSection,
  AwwwardsPhotoSection,
} from '@/features/profile/components/createMoment/PhotoSection';

export {
  default as TitleInput,
  AwwwardsTitleInput,
} from '@/features/profile/components/createMoment/TitleInput';

export {
  default as CategorySelector,
  CATEGORIES,
  getCategoryEmoji,
  type Category,
} from '@/features/profile/components/createMoment/CategorySelector';

export {
  default as DetailsSection,
  type Place,
} from '@/features/profile/components/createMoment/DetailsSection';

export { default as StorySection } from '@/features/profile/components/createMoment/StorySection';
export { default as MomentPreview } from '@/features/profile/components/createMoment/MomentPreview';

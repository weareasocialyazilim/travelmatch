// Discover Screen Types
import type { Moment } from '../../types';
import type { MaterialCommunityIcons } from '@expo/vector-icons';

export type ViewMode = 'single' | 'grid';

export interface Story {
  id: string;
  imageUrl: string;
  title: string;
  description: string;
  location: string;
  distance: string;
  price: number;
  time: string;
}

export interface UserStory {
  id: string;
  name: string;
  avatar: string;
  hasStory: boolean;
  isNew: boolean;
  stories: Story[];
}

export interface Category {
  id: string;
  label: string;
  emoji: string;
}

export interface SortOption {
  id: string;
  label: string;
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
}

export interface City {
  id: string;
  name: string;
  country: string;
  emoji: string;
}

export interface PriceRange {
  min: number;
  max: number;
}

export interface DiscoverFilters {
  category: string;
  sortBy: string;
  maxDistance: number;
  priceRange: PriceRange;
  location: string;
}

// Props types for sub-components
export interface StoryItemProps {
  item: UserStory;
  onPress: (user: UserStory) => void;
}

export interface MomentCardProps {
  item: Moment;
  onPress: (moment: Moment) => void;
}

export interface GridCardProps extends MomentCardProps {
  index: number;
}

export interface StoryViewerProps {
  visible: boolean;
  user: UserStory | null;
  userIndex: number;
  storyIndex: number;
  isPaused: boolean;
  onClose: () => void;
  onNext: () => void;
  onPrevious: () => void;
  onPause: () => void;
  onResume: () => void;
}

export interface FilterModalProps {
  visible: boolean;
  categories: Category[];
  sortOptions: SortOption[];
  selectedCategory: string;
  sortBy: string;
  maxDistance: number;
  priceRange: PriceRange;
  onSelectCategory: (id: string) => void;
  onSelectSort: (id: string) => void;
  onDistanceChange: (value: number) => void;
  onPriceRangeChange: (range: PriceRange) => void;
  onApply: () => void;
  onReset: () => void;
  onClose: () => void;
}

export interface LocationModalProps {
  visible: boolean;
  selectedLocation: string;
  recentLocations: string[];
  popularCities: City[];
  onSelectLocation: (location: string) => void;
  onClose: () => void;
}

export interface DiscoverHeaderProps {
  location: string;
  activeFiltersCount: number;
  onLocationPress: () => void;
  onFilterPress: () => void;
}

export interface CategoryFilterProps {
  categories: Category[];
  selectedCategory: string;
  onSelect: (id: string) => void;
}

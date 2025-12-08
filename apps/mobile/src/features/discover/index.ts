/**
 * Discover Feature - Public API
 * 
 * Exports all public components, hooks, and types
 */

// Screens
export { default as DiscoverScreen } from './screens/DiscoverScreen';
export { default as FiltersScreen } from './screens/FiltersScreen';
export { default as SearchResultsScreen } from './screens/SearchResultsScreen';

// Components
export { default as ProfileCard } from './components/ProfileCard';
export { default as MatchAnimation } from './components/MatchAnimation';
export { default as FilterBottomSheet } from './components/FilterBottomSheet';
export { default as ActiveFilters } from './components/ActiveFilters';

// Hooks
export { useDiscover } from './hooks/useDiscover';
export { useSwipe } from './hooks/useSwipe';
export { useFilters } from './hooks/useFilters';
export { useMatches } from './hooks/useMatches';

// Types
export * from './types/discover.types';

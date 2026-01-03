/**
 * Layout Components - Barrel exports
 * TravelMatch: The Rebirth Design System
 *
 * Note: FloatingDock is now exported from @/components/navigation
 * This ensures proper React Navigation integration
 */

export {
  LiquidScreenWrapper,
  LiquidScreenHeader,
  LiquidScreenBody,
} from './LiquidScreenWrapper';

// Re-export FloatingDock from navigation for backward compatibility
export { FloatingDock } from '../navigation/FloatingDock';

/**
 * Moments Feature - Public API
 *
 * Phase 3: The Drop - Story Mode Moment Creation
 */

// Types
export * from './types/moments.types';

// Screens - Re-exported from profile feature for navigation compatibility
// The CreateMomentScreen uses an immersive "Story Mode" UI
export { default as CreateMomentScreen } from '../profile/screens/CreateMomentScreen';

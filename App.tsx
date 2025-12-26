/**
 * Root App.tsx - Re-export for Expo monorepo compatibility
 *
 * This file exists because Expo's Metro bundler looks for App.tsx
 * at the monorepo root when using hoisted node_modules.
 * It simply re-exports the actual App from apps/mobile.
 */
export { default } from './apps/mobile/App';

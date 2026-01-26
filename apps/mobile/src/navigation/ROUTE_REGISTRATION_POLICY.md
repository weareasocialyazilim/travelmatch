/**
 * Route Registration Policy
 *
 * PATCH-007: Route Registration Policy
 *
 * This document outlines the policies for registering and managing routes
 * in the Lovendo mobile application.
 *
 * ============================================
 * ROUTE FILES
 * ============================================
 *
 * Primary Route Definition:
 * - /apps/mobile/src/navigation/routeParams.ts
 *   - Contains all RootStackParamList type definitions
 *   - All route parameters and types must be defined here
 *   - NO business logic, only type definitions
 *
 * Navigation Configuration:
 * - /apps/mobile/src/navigation/AppNavigator.tsx
 *   - Contains Stack.Navigator and Tab.Navigator configuration
 *   - Route registration with screen options
 *   - Deep linking configuration
 *
 * ============================================
 * ROUTE NAMING CONVENTIONS
 * ============================================
 *
 * ✅ CORRECT:
 * - ProfileDetail (PascalCase, descriptive)
 * - GiftInbox (domain-specific, clear)
 * - MomentProofCeremony (feature + purpose)
 *
 * ❌ INCORRECT:
 * - profile_detail (snake_case)
 * - Profile (too generic, conflicts with Profile tab)
 * - screen_1 (unnamed, unclear purpose)
 *
 * ============================================
 * DUPLICATE ROUTE DETECTION
 * ============================================
 *
 * Common duplicate patterns to avoid:
 *
 * 1. Screen Duplicates:
 *    - InboxScreen vs MessagesScreen (consolidated to MessagesScreen)
 *    - Login vs UnifiedAuth (use UnifiedAuth)
 *    - SuccessConfirmation vs SuccessScreen (use SuccessScreen)
 *
 * 2. Parameter Duplicates:
 *    - momentId should be used consistently
 *    - userId should be used consistently
 *    - conversationId should be used consistently
 *
 * 3. Route Aliases:
 *    - Avoid creating aliases for existing routes
 *    - Use params for variations, not new routes
 *
 * ============================================
 * SCREEN DEPRECIATION PROCESS
 * ============================================
 *
 * When deprecating a screen:
 *
 * 1. Add deprecation header to the screen file:
 *    ```typescript
 *    /**
 *     * [ScreenName]
 *     *
 *     * DEPRECATED: [PATCH-XXX]
 *     * This screen has been consolidated into [CanonicalScreen].
 *     *
 *     * @deprecated Use [CanonicalScreen] instead
 *     * @see [CanonicalScreen]
 *     * /
 *    ```
 *
 * 2. Update routeParams.ts comment:
 *    ```typescript
 *    // DEPRECATED: PATCH-XXX - Use [CanonicalRoute] instead
 *    [OldRouteName]: undefined;
 *    ```
 *
 * 3. Update navigator to redirect or show warning:
 *    - Option A: Keep route for backward compatibility
 *    - Option B: Remove and let navigation fail (breaking change)
 *
 * ============================================
 * PARAMETER MANAGEMENT
 * ============================================
 *
 * Route Parameters Should:
 *
 * 1. Be serializable (JSON-safe)
 * 2. Use interfaces defined in routeParams.ts
 * 3. Be optional when possible (undefined | Type)
 * 4. Have clear names (momentId, not just "id")
 *
 * Example:
 * ```typescript
 * // ✅ CORRECT
 * MomentDetail: { moment: Moment; isOwner?: boolean };
 *
 * // ❌ INCORRECT
 * MomentDetail: { data: any; flag: boolean };
 * ```
 *
 * ============================================
 * NESTED NAVIGATION
 * ============================================
 *
 * Use NavigatorScreenParams for nested navigators:
 *
 * ```typescript
 * import type { NavigatorScreenParams } from '@react-navigation/native';
 *
 * MainTabs: NavigatorScreenParams<MainTabParamList> | undefined;
 * ```
 *
 * ============================================
 * DEEP LINKING
 * ============================================
 *
 * Deep link configuration in AppNavigator:
 *
 * ```typescript
 * linking: {
 *   prefixes: ['lovendo://', 'https://lovendo.app'],
 *   config: {
 *     screens: {
 *       ProfileDetail: 'user/:userId',
 *       MomentDetail: 'moment/:momentId',
 *     },
 *   },
 * },
 * ```
 *
 * ============================================
 * TESTING ROUTES
 * ============================================
 *
 * Test new routes in:
 * - /apps/mobile/src/__tests__/integration/ (navigation tests)
 * - /apps/mobile/src/navigation/__tests__/ (unit tests)
 *
 * Check for:
 * - Navigation works correctly
 * - Parameters pass through correctly
 * - Deep links resolve correctly
 * - Back button handling works
 */

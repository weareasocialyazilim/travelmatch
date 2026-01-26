/**
 * Service Naming Convention Policy
 *
 * PATCH-006: Service Naming Conventions
 *
 * This document outlines the naming conventions for all services in the Lovendo codebase.
 * Following these conventions ensures consistency and prevents duplicate service creation.
 *
 * ============================================
 * SERVICE FILE NAMING
 * ============================================
 *
 * ✅ CORRECT:
 * - cacheService.ts (camelCase + Service suffix)
 * - notificationService.ts (camelCase + Service suffix)
 * - imageUploadService.ts (descriptive + Service suffix)
 * - supabaseStorageService.ts (purpose + Service suffix)
 *
 * ❌ INCORRECT:
 * - cache.ts (missing Service suffix)
 * - CacheManager.ts (PascalCase Service, not file naming)
 * - cache_management.ts (snake_case)
 * - image_cdn.ts (mixed conventions)
 *
 * ============================================
 * SERVICE CLASS/OBJECT NAMING
 * ============================================
 *
 * ✅ CORRECT:
 * - export const cacheService = new CacheService()
 * - export const notificationService = { ... }
 * - export const supabase = createClient(...)
 *
 * ❌ INCORRECT:
 * - export const CacheService = { ... } (confusing with class)
 * - export const cache = { ... } (too generic)
 * - export const Notif = { ... } (abbreviations)
 *
 * ============================================
 * FUNCTION/METHOD NAMING
 * ============================================
 *
 * ✅ CORRECT:
 * - getUserById(userId: string)
 * - createPaymentIntent(amount: number)
 * - invalidateCacheByTag(tag: string)
 *
 * ❌ INCORRECT:
 * - get_user_by_id (snake_case)
 * - getUser (too generic)
 * - doPayment() (unclear action)
 *
 * ============================================
 * DUPLICATE DETECTION
 * ============================================
 *
 * Before creating a new service, check for existing services:
 *
 * 1. Search for similar functionality:
 *    - grep -r "similarFunction" apps/mobile/src/services/
 *
 * 2. Check for duplicate naming patterns:
 *    - cache* (cacheService, cacheManager, cacheHandler)
 *    - upload* (uploadService, imageUpload, MediaService)
 *    - notification* (notificationService, notificationNavigator)
 *
 * 3. Use the canonical service location:
 *    - /apps/mobile/src/services/ (mobile services)
 *    - /apps/admin/src/services/ (admin services)
 *    - /apps/web/src/services/ (web services)
 *
 * ============================================
 * MERGE PROCESS FOR DUPLICATES
 * ============================================
 *
 * When duplicates are found:
 *
 * 1. Create new consolidated methods in the canonical service
 * 2. Add @deprecated JSDoc with replacement instructions
 * 3. Re-export from old service for backward compatibility
 * 4. Update all imports across the codebase
 * 5. Delete old service file after migration period
 *
 * Example deprecation header:
 * ```typescript
 * /**
 *  * [ServiceName]
 *  *
 *  * DEPRECATED: [PATCH-XXX]
 *  * This service has been merged into [CanonicalService]
 *  *
 *  * @deprecated Use [CanonicalService.method]() instead
 *  * @see [CanonicalService]
 *  * /
 * ```
 *
 * ============================================
 * TEST FILES
 * ============================================
 *
 * ✅ CORRECT:
 * - __tests__/cacheService.test.ts (next to source)
 * - __tests__/notificationService.test.ts
 *
 * ❌ INCORRECT:
 * - tests/unit/cache.test.ts (wrong location)
 * - __tests__/CacheService.spec.ts (wrong naming)
 *
 * ============================================
 * TYPE EXPORTS
 * ============================================
 *
 * ✅ CORRECT:
 * - export interface CacheConfig { ... }
 * - export type CacheKey = string
 * - export { CacheEntry, CacheStats }
 *
 * ❌ INCORRECT:
 * - type cache_config (snake_case)
 * - interface ICacheConfig (Hungarian notation)
 * - class CacheData (class for types)
 */

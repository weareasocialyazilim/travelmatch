/**
 * Dashboard Route Configuration
 *
 * Forces dynamic rendering for all dashboard pages to prevent
 * build-time pre-rendering issues with client-side components.
 *
 * Required for:
 * - shadcn/ui Button and other client components
 * - Turbopack compatibility
 * - Server-side auth checks
 */
export const dynamic = 'force-dynamic';
export const revalidate = 0;

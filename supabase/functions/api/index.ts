/**
 * API Edge Function - Main Entry Point
 * 
 * Serves all versioned API endpoints through a centralized router
 * 
 * Routes:
 *   - /api/v1/*  - API version 1 endpoints
 * 
 * To deploy:
 *   supabase functions deploy api
 * 
 * To test locally:
 *   supabase functions serve api
 */

// Re-export the v1 API handler
export { default } from './v1/index.ts';

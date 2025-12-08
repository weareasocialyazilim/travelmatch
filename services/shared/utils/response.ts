/**
 * Response Utilities
 * Helper functions for creating standardized responses
 */

import { corsHeaders } from '../middleware/cors.ts';

export const successResponse = (data: unknown, status = 200): Response => {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
};

export const createdResponse = (data: unknown): Response => {
  return successResponse(data, 201);
};

export const noContentResponse = (): Response => {
  return new Response(null, {
    status: 204,
    headers: corsHeaders,
  });
};

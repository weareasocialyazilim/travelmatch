/**
 * Error Handler Middleware
 * Centralized error handling for all edge functions
 */

import { corsHeaders } from './cors.ts';
import { UnauthorizedError } from './auth.ts';
import { ValidationError } from '../utils/validation.ts';

export const handleError = (error: unknown): Response => {
  console.error('Error:', error);

  // Unauthorized
  if (error instanceof UnauthorizedError) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 401,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  // Validation error
  if (error instanceof ValidationError) {
    return new Response(
      JSON.stringify({
        error: 'Validation failed',
        details: error.errors,
      }),
      {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }

  // Generic error
  const message =
    error instanceof Error ? error.message : 'Internal server error';
  return new Response(JSON.stringify({ error: message }), {
    status: 500,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
};

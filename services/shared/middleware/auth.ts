/**
 * Authentication Middleware
 * Validates JWT tokens and returns authenticated user
 */

import { createClient } from '@supabase/supabase-js';

export class UnauthorizedError extends Error {
  constructor(message = 'Unauthorized') {
    super(message);
    this.name = 'UnauthorizedError';
  }
}

export const validateAuth = async (req: Request) => {
  const authHeader = req.headers.get('Authorization');

  if (!authHeader) {
    throw new UnauthorizedError('Missing authorization header');
  }

  const token = authHeader.replace('Bearer ', '');

  // Create Supabase client with auth token
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_ANON_KEY') ?? '',
    { global: { headers: { Authorization: authHeader } } }
  );

  // Verify token
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser(token);

  if (error || !user) {
    throw new UnauthorizedError('Invalid token');
  }

  return { user, token, supabase };
};

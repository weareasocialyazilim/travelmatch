/**
 * API v1 Main Entry Point
 * 
 * Centralized API router for all v1 endpoints
 * 
 * Routes:
 *   - /api/v1/auth/*     - Authentication endpoints
 *   - /api/v1/users/*    - User management
 *   - /api/v1/moments/*  - Moments/Gestures
 *   - /api/v1/requests/* - Requests
 *   - /api/v1/payments/* - Payment operations
 */

import { createRouter, serveRouter } from '../_shared/router.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import {
  ErrorCode,
  createErrorResponse,
  createSuccessResponse,
  toHttpResponse,
  toHttpSuccessResponse,
  handleSupabaseAuthError,
  handleUnexpectedError,
} from '../../_shared/errorHandler.ts';

// Initialize Supabase client
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

function getSupabaseClient(authHeader?: string) {
  if (authHeader) {
    return createClient(supabaseUrl, supabaseServiceKey, {
      global: { headers: { Authorization: authHeader } },
    });
  }
  return createClient(supabaseUrl, supabaseServiceKey);
}

// Create router
const router = createRouter();

// ============================================
// HEALTH CHECK
// ============================================
router.get('/api/v1/health', async () => {
  const success = createSuccessResponse({
    status: 'healthy',
    version: 'v1',
    timestamp: new Date().toISOString(),
  });
  return toHttpSuccessResponse(success);
});

// ============================================
// AUTH ROUTES
// ============================================

/**
 * POST /api/v1/auth/login
 * Login with email/password
 */
router.post('/api/v1/auth/login', async (req) => {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      const error = createErrorResponse(
        'Email and password are required',
        ErrorCode.MISSING_REQUIRED_FIELD,
      );
      return toHttpResponse(error);
    }

    const supabase = getSupabaseClient();
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return toHttpResponse(handleSupabaseAuthError(error));
    }

    const success = createSuccessResponse(
      {
        user: data.user,
        session: data.session,
      },
      'Login successful',
    );
    return toHttpSuccessResponse(success);
  } catch (error) {
    return toHttpResponse(handleUnexpectedError(error));
  }
});

/**
 * POST /api/v1/auth/logout
 * Logout current user
 */
router.post('/api/v1/auth/logout', async (req) => {
  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      const error = createErrorResponse(
        'Authorization header required',
        ErrorCode.UNAUTHORIZED,
      );
      return toHttpResponse(error);
    }

    const supabase = getSupabaseClient(authHeader);
    const { error } = await supabase.auth.signOut();

    if (error) {
      return toHttpResponse(handleSupabaseAuthError(error));
    }

    const success = createSuccessResponse(null, 'Logout successful');
    return toHttpSuccessResponse(success);
  } catch (error) {
    return toHttpResponse(handleUnexpectedError(error));
  }
});

// ============================================
// USER ROUTES
// ============================================

/**
 * GET /api/v1/users/:id
 * Get user by ID
 */
router.get('/api/v1/users/:id', async (req, params) => {
  try {
    const authHeader = req.headers.get('Authorization');
    const supabase = getSupabaseClient(authHeader);

    const { data, error } = await supabase
      .from('users')
      .select('id, full_name, avatar_url, bio, rating, verified')
      .eq('id', params.id)
      .single();

    if (error || !data) {
      const errorResponse = createErrorResponse(
        'User not found',
        ErrorCode.NOT_FOUND,
      );
      return toHttpResponse(errorResponse);
    }

    const success = createSuccessResponse(data);
    return toHttpSuccessResponse(success);
  } catch (error) {
    return toHttpResponse(handleUnexpectedError(error));
  }
});

/**
 * GET /api/v1/users/:id/moments
 * Get user's moments
 */
router.get('/api/v1/users/:id/moments', async (req, params) => {
  try {
    const authHeader = req.headers.get('Authorization');
    const supabase = getSupabaseClient(authHeader);

    const { data, error } = await supabase
      .from('moments')
      .select(`
        id,
        title,
        description,
        price,
        category,
        status,
        created_at
      `)
      .eq('user_id', params.id)
      .eq('status', 'active')
      .order('created_at', { ascending: false });

    if (error) {
      return toHttpResponse(handleUnexpectedError(error));
    }

    const success = createSuccessResponse({
      moments: data || [],
      count: data?.length || 0,
    });
    return toHttpSuccessResponse(success);
  } catch (error) {
    return toHttpResponse(handleUnexpectedError(error));
  }
});

// ============================================
// MOMENTS ROUTES
// ============================================

/**
 * GET /api/v1/moments
 * List all active moments
 */
router.get('/api/v1/moments', async (req) => {
  try {
    const url = new URL(req.url);
    const limit = parseInt(url.searchParams.get('limit') || '20');
    const offset = parseInt(url.searchParams.get('offset') || '0');
    const category = url.searchParams.get('category');

    const authHeader = req.headers.get('Authorization');
    const supabase = getSupabaseClient(authHeader);

    let query = supabase
      .from('moments')
      .select(`
        id,
        title,
        description,
        price,
        category,
        created_at,
        user:users(
          id,
          full_name,
          avatar_url,
          verified
        )
      `, { count: 'exact' })
      .eq('status', 'active')
      .range(offset, offset + limit - 1)
      .order('created_at', { ascending: false });

    if (category) {
      query = query.eq('category', category);
    }

    const { data, count, error } = await query;

    if (error) {
      return toHttpResponse(handleUnexpectedError(error));
    }

    const success = createSuccessResponse({
      moments: data || [],
      pagination: {
        total: count || 0,
        limit,
        offset,
        hasMore: (count || 0) > offset + limit,
      },
    });
    return toHttpSuccessResponse(success);
  } catch (error) {
    return toHttpResponse(handleUnexpectedError(error));
  }
});

/**
 * GET /api/v1/moments/:id
 * Get moment by ID
 */
router.get('/api/v1/moments/:id', async (req, params) => {
  try {
    const authHeader = req.headers.get('Authorization');
    const supabase = getSupabaseClient(authHeader);

    const { data, error } = await supabase
      .from('moments')
      .select(`
        *,
        user:users(
          id,
          full_name,
          avatar_url,
          verified,
          rating
        ),
        requests(count),
        favorites(count)
      `)
      .eq('id', params.id)
      .single();

    if (error || !data) {
      const errorResponse = createErrorResponse(
        'Moment not found',
        ErrorCode.NOT_FOUND,
      );
      return toHttpResponse(errorResponse);
    }

    const success = createSuccessResponse(data);
    return toHttpSuccessResponse(success);
  } catch (error) {
    return toHttpResponse(handleUnexpectedError(error));
  }
});

// ============================================
// REQUESTS ROUTES
// ============================================

/**
 * GET /api/v1/requests
 * List requests (filtered by query params)
 */
router.get('/api/v1/requests', async (req) => {
  try {
    const url = new URL(req.url);
    const momentId = url.searchParams.get('moment_id');
    const userId = url.searchParams.get('user_id');
    const status = url.searchParams.get('status');

    const authHeader = req.headers.get('Authorization');
    const supabase = getSupabaseClient(authHeader);

    let query = supabase
      .from('requests')
      .select(`
        id,
        message,
        status,
        created_at,
        requester:users!requests_user_id_fkey(
          id,
          full_name,
          avatar_url,
          rating,
          verified
        ),
        moment:moments(
          id,
          title,
          price,
          category
        )
      `, { count: 'exact' })
      .order('created_at', { ascending: false });

    if (momentId) query = query.eq('moment_id', momentId);
    if (userId) query = query.eq('user_id', userId);
    if (status) query = query.eq('status', status);

    const { data, count, error } = await query;

    if (error) {
      return toHttpResponse(handleUnexpectedError(error));
    }

    const success = createSuccessResponse({
      requests: data || [],
      count: count || 0,
    });
    return toHttpSuccessResponse(success);
  } catch (error) {
    return toHttpResponse(handleUnexpectedError(error));
  }
});

// ============================================
// ERROR HANDLERS
// ============================================

router.setNotFoundHandler(() => {
  const error = createErrorResponse(
    'API endpoint not found',
    ErrorCode.NOT_FOUND,
    {
      hint: 'Check the API documentation for available endpoints',
    },
  );
  return toHttpResponse(error);
});

router.setErrorHandler((error) => {
  return toHttpResponse(handleUnexpectedError(error));
});

// Export handler as default for Deno Deploy
export default (req: Request) => router.handle(req);

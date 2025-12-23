/// <reference types="https://esm.sh/@supabase/functions-js/src/edge-runtime.d.ts" />

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { createUpstashRateLimiter, RateLimitPresets } from '../_shared/upstashRateLimit.ts';
import { getCorsHeaders } from '../_shared/security-middleware.ts';
import {
  ErrorCode,
  createErrorResponse,
  createSuccessResponse,
  toHttpResponse,
  toHttpSuccessResponse,
  handleUnexpectedError,
} from '../_shared/errorHandler.ts';
import {
  exportDataCache,
  CACHE_TTL,
  rateLimiter,
} from '../_shared/redisCache.ts';

/**
 * GDPR Data Export Edge Function
 * 
 * Exports all user data in compliance with GDPR Article 20 (Right to Data Portability)
 * 
 * Returns:
 * - User profile data
 * - Moments created
 * - Requests made/received
 * - Messages sent/received
 * - Transactions history
 * - Reviews written/received
 * - Notifications
 * - Favorites
 * - Blocks
 * - Reports filed
 * 
 * Format: JSON (can be extended to CSV)
 */

interface UserDataExport {
  exportDate: string;
  userId: string;
  profile: Record<string, unknown> | null;
  moments: Record<string, unknown>[];
  requests: {
    sent: Record<string, unknown>[];
    received: Record<string, unknown>[];
  };
  messages: Record<string, unknown>[];
  conversations: Record<string, unknown>[];
  transactions: Record<string, unknown>[];
  reviews: {
    written: Record<string, unknown>[];
    received: Record<string, unknown>[];
  };
  notifications: Record<string, unknown>[];
  favorites: Record<string, unknown>[];
  blocks: Record<string, unknown>[];
  reports: Record<string, unknown>[];
  metadata: {
    totalMoments: number;
    totalRequests: number;
    totalMessages: number;
    totalTransactions: number;
    totalReviews: number;
    accountCreatedAt: string;
    lastActivityAt: string;
  };
}

// Rate limiter: 3 requests per hour (GDPR exports are heavy)
const exportLimiter = createUpstashRateLimiter(RateLimitPresets.STANDARD);

serve(async (req) => {
  const origin = req.headers.get('origin');
  const corsHeaders = getCorsHeaders(origin);

  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Check rate limit first (Redis-based)
    const authHeader = req.headers.get('Authorization') || '';
    const userToken = authHeader.replace('Bearer ', '').substring(0, 20);
    const rateLimit = await rateLimiter.check(
      `export:${userToken}`,
      3, // 3 requests
      3600, // per hour
    );

    if (!rateLimit.allowed) {
      const retryAfter = Math.ceil((rateLimit.resetAt - Date.now()) / 1000);
      return new Response(
        JSON.stringify({
          error: 'Rate limit exceeded',
          retryAfter,
        }),
        {
          status: 429,
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
            'Retry-After': String(retryAfter),
            'X-RateLimit-Remaining': String(rateLimit.remaining),
          },
        },
      );
    }

    // Create Supabase client with user auth
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      },
    );

    // Verify authentication
    const {
      data: { user },
    } = await supabaseClient.auth.getUser();

    if (!user) {
      const error = createErrorResponse(
        'Authentication required',
        ErrorCode.UNAUTHORIZED,
      );
      return toHttpResponse(error, corsHeaders);
    }

    const userId = user.id;

    console.log(`[GDPR Export] Starting data export for user: ${userId}`);

    // Check Redis cache first
    const cachedExport = await exportDataCache.get(userId);
    if (cachedExport) {
      console.log(`[GDPR Export] Serving from cache for user: ${userId}`);
      const success = createSuccessResponse(
        cachedExport,
        'Export retrieved from cache',
      );
      return new Response(JSON.stringify(success.data, null, 2), {
        status: 200,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
          'Content-Disposition': `attachment; filename="travelmatch-data-export-${userId}-${Date.now()}.json"`,
          'X-Cache': 'HIT',
        },
      });
    }

    console.log(`[GDPR Export] Cache miss, generating fresh export for user: ${userId}`);

    // 1. Get user profile
    const { data: profile } = await supabaseClient
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    // 2. Get moments
    const { data: moments } = await supabaseClient
      .from('moments')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    // 3. Get requests (sent and received)
    const { data: sentRequests } = await supabaseClient
      .from('requests')
      .select('*, moment:moments(title, location)')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    const { data: receivedRequests } = await supabaseClient
      .from('requests')
      .select('*, moment:moments!inner(title, location)')
      .eq('moments.user_id', userId)
      .order('created_at', { ascending: false });

    // 4. Get conversations
    const { data: conversations } = await supabaseClient
      .from('conversations')
      .select('*')
      .contains('participant_ids', [userId])
      .order('updated_at', { ascending: false });

    // 5. Get messages
    const conversationIds = conversations?.map((c) => c.id) || [];
    const { data: messages } = conversationIds.length > 0
      ? await supabaseClient
          .from('messages')
          .select('*')
          .in('conversation_id', conversationIds)
          .order('created_at', { ascending: false })
      : { data: [] };

    // 6. Get transactions
    const { data: transactions } = await supabaseClient
      .from('transactions')
      .select('*')
      .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`)
      .order('created_at', { ascending: false });

    // 7. Get reviews written
    const { data: writtenReviews } = await supabaseClient
      .from('reviews')
      .select('*')
      .eq('reviewer_id', userId)
      .order('created_at', { ascending: false });

    // 8. Get reviews received
    const { data: receivedReviews } = await supabaseClient
      .from('reviews')
      .select('*')
      .eq('reviewed_id', userId)
      .order('created_at', { ascending: false });

    // 9. Get notifications
    const { data: notifications } = await supabaseClient
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    // 10. Get favorites
    const { data: favorites } = await supabaseClient
      .from('favorites')
      .select('*, moment:moments(title, location, images)')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    // 11. Get blocks
    const { data: blocks } = await supabaseClient
      .from('blocks')
      .select('*')
      .eq('blocker_id', userId)
      .order('created_at', { ascending: false });

    // 12. Get reports
    const { data: reports } = await supabaseClient
      .from('reports')
      .select('*')
      .eq('reporter_id', userId)
      .order('created_at', { ascending: false });

    // Prepare export data
    const exportData: UserDataExport = {
      exportDate: new Date().toISOString(),
      userId: userId,
      profile: {
        ...profile,
        // Remove sensitive fields that shouldn't be exported
        password: undefined,
      },
      moments: moments || [],
      requests: {
        sent: sentRequests || [],
        received: receivedRequests || [],
      },
      messages: messages || [],
      conversations: conversations || [],
      transactions: transactions || [],
      reviews: {
        written: writtenReviews || [],
        received: receivedReviews || [],
      },
      notifications: notifications || [],
      favorites: favorites || [],
      blocks: blocks || [],
      reports: reports || [],
      metadata: {
        totalMoments: moments?.length || 0,
        totalRequests:
          (sentRequests?.length || 0) + (receivedRequests?.length || 0),
        totalMessages: messages?.length || 0,
        totalTransactions: transactions?.length || 0,
        totalReviews:
          (writtenReviews?.length || 0) + (receivedReviews?.length || 0),
        accountCreatedAt: profile?.created_at || '',
        lastActivityAt: profile?.updated_at || '',
      },
    };

    console.log(
      `[GDPR Export] Export completed for user: ${userId}`,
      `- Moments: ${exportData.metadata.totalMoments}`,
      `- Requests: ${exportData.metadata.totalRequests}`,
      `- Messages: ${exportData.metadata.totalMessages}`,
      `- Transactions: ${exportData.metadata.totalTransactions}`,
    );

    // Cache the export data (1 week TTL)
    await exportDataCache.set(userId, exportData);
    console.log(`[GDPR Export] Cached export for user: ${userId}`);

    // Log the export request for compliance
    await supabaseClient.from('audit_logs').insert({
      user_id: userId,
      action: 'gdpr_data_export',
      details: {
        exportDate: exportData.exportDate,
        itemCounts: exportData.metadata,
        cached: true,
      },
      ip_address: req.headers.get('x-forwarded-for'),
      user_agent: req.headers.get('user-agent'),
    });

    // Return the data with cache headers
    const success = createSuccessResponse(exportData, 'Export generated successfully');
    return new Response(JSON.stringify(success.data, null, 2), {
      status: 200,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="travelmatch-data-export-${userId}-${Date.now()}.json"`,
        'X-Cache': 'MISS',
      },
    });
  } catch (error) {
    console.error('[GDPR Export] Error:', error);
    return toHttpResponse(handleUnexpectedError(error), corsHeaders);
  }
});

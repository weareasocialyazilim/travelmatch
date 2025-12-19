/// <reference types="https://esm.sh/@supabase/functions-js/src/edge-runtime.d.ts" />

/**
 * Audit Logging Edge Function
 *
 * Handles SOC 2 compliant audit logging with service role access
 *
 * SECURITY: This function runs server-side with service_role access
 * Client calls this via authenticated HTTP request
 *
 * Features:
 * - Immutable audit log entries
 * - User action tracking
 * - Security event logging
 * - Compliance reporting support
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4';
import { getCorsHeaders } from '../_shared/security-middleware.ts';

// Audit event categories
const AUDIT_CATEGORIES = [
  'authentication',
  'authorization',
  'data_access',
  'data_modification',
  'system',
  'security',
  'compliance',
] as const;

serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Verify JWT token
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Missing authorization header' }),
        {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        },
      );
    }

    // Create Supabase client with user's token for RLS
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: { headers: { Authorization: authHeader } },
      },
    );

    // Verify user is authenticated
    const {
      data: { user },
      error: authError,
    } = await supabaseClient.auth.getUser();
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Invalid or expired token' }),
        {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        },
      );
    }

    // Create admin client for service operations (bypasses RLS)
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );

    // Parse request
    const url = new URL(req.url);
    const action = url.pathname.split('/').pop();

    switch (action) {
      case 'log':
        return await handleLogEvent(req, user, supabaseAdmin);
      case 'query':
        return await handleQueryLogs(req, user, supabaseAdmin);
      case 'export':
        return await handleExportLogs(req, user, supabaseAdmin);
      default:
        return new Response(JSON.stringify({ error: 'Invalid action' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
    }
  } catch (error) {
    console.error('Audit logging error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

/**
 * Log an audit event
 */
async function handleLogEvent(
  req: Request,
  user: { id: string; email?: string },
  supabase: ReturnType<typeof createClient>,
): Promise<Response> {
  const body = await req.json();
  const { event, category, resource, action, result, metadata } = body;

  // Validate required fields
  if (!event || !category || !resource || !action || !result) {
    return new Response(JSON.stringify({ error: 'Missing required fields' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  // Validate category
  if (!AUDIT_CATEGORIES.includes(category)) {
    return new Response(
      JSON.stringify({
        error: `Invalid category. Must be one of: ${AUDIT_CATEGORIES.join(', ')}`,
      }),
      {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    );
  }

  // Get client info
  const ipAddress =
    req.headers.get('x-forwarded-for') ||
    req.headers.get('x-real-ip') ||
    'unknown';
  const userAgent = req.headers.get('user-agent') || 'unknown';

  // Insert audit log entry
  const { error: insertError } = await supabase.from('audit_logs').insert({
    id: crypto.randomUUID(),
    timestamp: new Date().toISOString(),
    user_id: user.id,
    user_email: user.email || 'unknown',
    event,
    category,
    resource,
    action,
    result,
    ip_address: ipAddress,
    user_agent: userAgent,
    metadata: metadata || {},
  });

  if (insertError) {
    console.error('Failed to insert audit log:', insertError);
    // Don't fail the request - audit logging shouldn't break the app
    return new Response(
      JSON.stringify({ success: false, warning: 'Audit log insert failed' }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    );
  }

  return new Response(JSON.stringify({ success: true }), {
    status: 200,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

/**
 * Query audit logs (admin only)
 */
async function handleQueryLogs(
  req: Request,
  user: { id: string },
  supabase: ReturnType<typeof createClient>,
): Promise<Response> {
  // Check if user is admin
  const { data: profile, error: profileError } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single();

  if (profileError || profile?.role !== 'admin') {
    return new Response(JSON.stringify({ error: 'Admin access required' }), {
      status: 403,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  const url = new URL(req.url);
  const filters = {
    userId: url.searchParams.get('userId'),
    event: url.searchParams.get('event'),
    category: url.searchParams.get('category'),
    startDate: url.searchParams.get('startDate'),
    endDate: url.searchParams.get('endDate'),
    limit: parseInt(url.searchParams.get('limit') || '100'),
  };

  // SECURITY: Even in Edge Functions, prefer explicit column selection
  let query = supabase
    .from('audit_logs')
    .select(
      `
      id,
      timestamp,
      user_id,
      event,
      category,
      resource,
      resource_id,
      action,
      result,
      ip_address,
      user_agent,
      metadata
    `,
    )
    .order('timestamp', { ascending: false })
    .limit(filters.limit);

  if (filters.userId) query = query.eq('user_id', filters.userId);
  if (filters.event) query = query.eq('event', filters.event);
  if (filters.category) query = query.eq('category', filters.category);
  if (filters.startDate) query = query.gte('timestamp', filters.startDate);
  if (filters.endDate) query = query.lte('timestamp', filters.endDate);

  const { data, error } = await query;

  if (error) {
    return new Response(
      JSON.stringify({ error: 'Failed to query audit logs' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    );
  }

  return new Response(JSON.stringify({ success: true, data }), {
    status: 200,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

/**
 * Export audit logs for compliance reporting (admin only)
 */
async function handleExportLogs(
  req: Request,
  user: { id: string },
  supabase: ReturnType<typeof createClient>,
): Promise<Response> {
  // Check if user is admin
  const { data: profile, error: profileError } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single();

  if (profileError || profile?.role !== 'admin') {
    return new Response(JSON.stringify({ error: 'Admin access required' }), {
      status: 403,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  const body = await req.json();
  const { startDate, endDate, format = 'json' } = body;

  if (!startDate || !endDate) {
    return new Response(
      JSON.stringify({ error: 'startDate and endDate required' }),
      {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    );
  }

  // SECURITY: Even in Edge Functions, prefer explicit column selection
  const { data, error } = await supabase
    .from('audit_logs')
    .select(
      `
      id,
      timestamp,
      user_id,
      event,
      category,
      resource,
      resource_id,
      action,
      result,
      ip_address,
      user_agent,
      metadata
    `,
    )
    .gte('timestamp', startDate)
    .lte('timestamp', endDate)
    .order('timestamp', { ascending: true });

  if (error) {
    return new Response(
      JSON.stringify({ error: 'Failed to export audit logs' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    );
  }

  // Log the export action itself
  await supabase.from('audit_logs').insert({
    id: crypto.randomUUID(),
    timestamp: new Date().toISOString(),
    user_id: user.id,
    event: 'audit_logs_export',
    category: 'compliance',
    resource: 'audit_logs',
    action: 'export',
    result: 'success',
    ip_address: req.headers.get('x-forwarded-for') || 'unknown',
    user_agent: req.headers.get('user-agent') || 'unknown',
    metadata: { startDate, endDate, recordCount: data?.length || 0 },
  });

  if (format === 'csv') {
    // Convert to CSV
    const headers = [
      'id',
      'timestamp',
      'user_id',
      'user_email',
      'event',
      'category',
      'resource',
      'action',
      'result',
      'ip_address',
    ];
    const csv = [
      headers.join(','),
      ...(data || []).map((row) =>
        headers.map((h) => JSON.stringify(row[h] || '')).join(','),
      ),
    ].join('\n');

    return new Response(csv, {
      status: 200,
      headers: {
        ...corsHeaders,
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="audit_logs_${startDate}_${endDate}.csv"`,
      },
    });
  }

  return new Response(JSON.stringify({ success: true, data }), {
    status: 200,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

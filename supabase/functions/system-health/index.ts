/**
 * System Health Dashboard Edge Function
 *
 * Provides comprehensive system health metrics for monitoring dashboards.
 * Supports multiple output formats:
 * - JSON: Full dashboard data
 * - Prometheus: Metrics in Prometheus format
 * - Simple: Quick health check status
 *
 * Endpoints:
 * - GET /system-health - Full dashboard (JSON)
 * - GET /system-health?format=prometheus - Prometheus metrics
 * - GET /system-health?format=simple - Simple health status
 * - POST /system-health/maintenance - Toggle maintenance mode
 *
 * @example
 * // Grafana data source
 * fetch('/functions/v1/system-health?format=prometheus')
 *
 * // Quick health check for load balancer
 * fetch('/functions/v1/system-health?format=simple')
 */

import { serve } from 'https://deno.land/std@0.208.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { createLogger } from '../_shared/logger.ts';
import { resilience, CircuitState } from '../_shared/resilience.ts';
import { healthChecker } from '../_shared/observability.ts';

const logger = createLogger('system-health');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
};

// Register health checks for core services
healthChecker.register('database', async () => {
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  );

  const start = performance.now();
  const { error } = await supabase.from('users').select('count').limit(1).single();
  const latencyMs = performance.now() - start;

  return {
    pass: !error,
    message: error ? error.message : 'OK',
    latencyMs,
  };
});

healthChecker.register('auth', async () => {
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_ANON_KEY') ?? ''
  );

  const start = performance.now();
  // Just check if auth service is reachable
  try {
    await supabase.auth.getSession();
    return {
      pass: true,
      message: 'OK',
      latencyMs: performance.now() - start,
    };
  } catch (e) {
    return {
      pass: false,
      message: (e as Error).message,
      latencyMs: performance.now() - start,
    };
  }
});

serve(async (req) => {
  // CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  const url = new URL(req.url);
  const format = url.searchParams.get('format') || 'json';

  try {
    // Admin authentication for sensitive operations
    const authHeader = req.headers.get('Authorization');
    const isAdmin = await checkAdminAuth(authHeader);

    // POST: Maintenance mode toggle (requires admin)
    if (req.method === 'POST' && url.pathname.endsWith('/maintenance')) {
      if (!isAdmin) {
        return new Response(
          JSON.stringify({ error: 'Admin access required' }),
          { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const body = await req.json();
      const { service, enabled } = body;

      if (!service || typeof enabled !== 'boolean') {
        return new Response(
          JSON.stringify({ error: 'Invalid request. Provide service and enabled fields.' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      resilience.setMaintenance(service, enabled);

      return new Response(
        JSON.stringify({
          success: true,
          message: `Service ${service} maintenance mode: ${enabled ? 'enabled' : 'disabled'}`,
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // GET: Return health data in requested format
    switch (format) {
      case 'prometheus': {
        const metrics = resilience.getPrometheusMetrics();
        return new Response(metrics, {
          headers: {
            ...corsHeaders,
            'Content-Type': 'text/plain; version=0.0.4; charset=utf-8',
          },
        });
      }

      case 'simple': {
        const probe = await resilience.probe();
        const status = probe.healthy ? 'healthy' : 'unhealthy';
        const statusCode = probe.healthy ? 200 : 503;

        return new Response(
          JSON.stringify({
            status,
            issues: probe.issues.length,
            timestamp: Date.now(),
          }),
          {
            status: statusCode,
            headers: {
              ...corsHeaders,
              'Content-Type': 'application/json',
              'Cache-Control': 'no-cache, no-store, must-revalidate',
            },
          }
        );
      }

      case 'json':
      default: {
        const dashboard = await resilience.getDashboard();

        // Add recommendations if admin
        let response: Record<string, unknown> = dashboard;
        if (isAdmin) {
          const probe = await resilience.probe();
          response = {
            ...dashboard,
            diagnostics: {
              issues: probe.issues,
              recommendations: probe.recommendations,
            },
          };
        }

        return new Response(JSON.stringify(response, null, 2), {
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
            'Cache-Control': 'no-cache, no-store, must-revalidate',
          },
        });
      }
    }
  } catch (error) {
    logger.error('System health check failed', error as Error);

    return new Response(
      JSON.stringify({
        status: 'error',
        message: (error as Error).message,
        timestamp: Date.now(),
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});

/**
 * Check if request has admin access
 */
async function checkAdminAuth(authHeader: string | null): Promise<boolean> {
  if (!authHeader) return false;

  try {
    const token = authHeader.replace('Bearer ', '');
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: `Bearer ${token}` } } }
    );

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;

    // Check admin role
    const adminClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { data: profile } = await adminClient
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single();

    return profile?.role === 'admin' || profile?.role === 'super_admin';
  } catch {
    return false;
  }
}

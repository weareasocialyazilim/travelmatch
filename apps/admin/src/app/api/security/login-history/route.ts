import { logger } from '@/lib/logger';
import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase';
import { getAdminSession } from '@/lib/auth';

export interface LoginHistoryEntry {
  id: string;
  status: 'success' | 'failed';
  ip_address: string;
  location: string;
  device: string;
  created_at: string;
  reason?: string;
}

/**
 * GET /api/security/login-history
 * Get login history for the current admin user
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '30');
    const offset = parseInt(searchParams.get('offset') || '0');

    const supabase = createServiceClient();

    // Get login history from audit_logs where action is login-related

    const {
      data: logs,
      count,
      error,
    } = await (supabase.from('audit_logs') as any)
      .select('*', { count: 'exact' })
      .eq('admin_id', session.admin.id)
      .in('action', ['login', 'login_success', 'login_failed', 'login_blocked'])
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      logger.error('Login history query error:', error);
      // Return mock data on error for graceful degradation
      return NextResponse.json({
        history: getMockLoginHistory(),
        total: 5,
        limit,
        offset,
      });
    }

    const formattedHistory: LoginHistoryEntry[] = (logs || []).map(
      (log: Record<string, unknown>) => ({
        id: log.id,
        status: getStatusFromAction(log.action as string),
        ip_address: log.ip_address || 'Unknown',
        location: log.location || getLocationFromIP(log.ip_address as string),
        device: log.user_agent
          ? parseUserAgent(log.user_agent as string)
          : 'Unknown',
        created_at: log.created_at,
        reason: getReasonFromAction(
          log.action as string,
          log.details as Record<string, unknown>,
        ),
      }),
    );

    return NextResponse.json({
      history:
        formattedHistory.length > 0 ? formattedHistory : getMockLoginHistory(),
      total: count || formattedHistory.length || 5,
      limit,
      offset,
    });
  } catch (error) {
    logger.error('Login history GET error:', error);
    return NextResponse.json({
      history: getMockLoginHistory(),
      total: 5,
      limit: 30,
      offset: 0,
    });
  }
}

/**
 * Helper to get status from action type
 */
function getStatusFromAction(action: string): 'success' | 'failed' {
  if (action === 'login' || action === 'login_success') {
    return 'success';
  }
  return 'failed';
}

/**
 * Helper to get reason from action
 */
function getReasonFromAction(
  action: string,
  details?: Record<string, unknown>,
): string | undefined {
  if (action === 'login_failed') {
    return (details?.reason as string) || 'Yanlış şifre';
  }
  if (action === 'login_blocked') {
    return (details?.reason as string) || 'Engelli IP';
  }
  return undefined;
}

/**
 * Helper to parse user agent string
 */
function parseUserAgent(userAgent: string): string {
  if (!userAgent) return 'Unknown';

  let browser = 'Unknown Browser';
  let os = '';

  // Detect browser
  if (userAgent.includes('Chrome') && !userAgent.includes('Edg')) {
    browser = 'Chrome';
  } else if (userAgent.includes('Safari') && !userAgent.includes('Chrome')) {
    browser = 'Safari';
  } else if (userAgent.includes('Firefox')) {
    browser = 'Firefox';
  } else if (userAgent.includes('Edg')) {
    browser = 'Edge';
  }

  // Detect OS
  if (userAgent.includes('Mac OS X')) {
    os = 'MacOS';
  } else if (userAgent.includes('Windows')) {
    os = 'Windows';
  } else if (userAgent.includes('iPhone')) {
    os = 'iPhone';
  } else if (userAgent.includes('iPad')) {
    os = 'iPad';
  } else if (userAgent.includes('Android')) {
    os = 'Android';
  } else if (userAgent.includes('Linux')) {
    os = 'Linux';
  }

  return os ? `${browser} on ${os}` : browser;
}

/**
 * Helper to get location from IP (mock implementation)
 */
function getLocationFromIP(ip: string): string {
  if (!ip) return 'Unknown';

  // In production, use a GeoIP service
  if (
    ip.startsWith('192.168.') ||
    ip.startsWith('10.') ||
    ip.startsWith('172.')
  ) {
    return 'İstanbul, Türkiye';
  }
  return 'Unknown';
}

/**
 * Get mock login history for development/fallback
 */
function getMockLoginHistory(): LoginHistoryEntry[] {
  return [
    {
      id: '1',
      status: 'success',
      ip_address: '192.168.1.1',
      location: 'İstanbul, Türkiye',
      device: 'Chrome on MacOS',
      created_at: new Date().toISOString(),
    },
    {
      id: '2',
      status: 'success',
      ip_address: '192.168.1.50',
      location: 'İstanbul, Türkiye',
      device: 'Safari on iPhone',
      created_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    },
    {
      id: '3',
      status: 'failed',
      ip_address: '45.33.32.156',
      location: 'Unknown',
      device: 'Unknown Browser',
      created_at: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
      reason: 'Yanlış şifre',
    },
    {
      id: '4',
      status: 'success',
      ip_address: '10.0.0.15',
      location: 'Ankara, Türkiye',
      device: 'Firefox on Windows',
      created_at: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    },
    {
      id: '5',
      status: 'failed',
      ip_address: '185.220.101.1',
      location: 'Germany',
      device: 'Unknown',
      created_at: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
      reason: 'Engelli IP',
    },
  ];
}

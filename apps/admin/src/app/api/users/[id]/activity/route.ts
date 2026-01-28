import { logger } from '@/lib/logger';
import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase.server';
import { getAdminSession } from '@/lib/auth';
import type { Json } from '@/types/database';

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/users/[id]/activity
 * Fetch user activity log (logins, actions, events)
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: 'Oturum bulunamadı' }, { status: 401 });
    }

    const { id: userId } = await params;
    const searchParams = request.nextUrl.searchParams;
    const limit = parseInt(searchParams.get('limit') || '20', 10);
    const offset = parseInt(searchParams.get('offset') || '0', 10);

    const supabase = createServiceClient();

    // Fetch from audit_logs and notifications tables
    const [auditResult, notificationsResult] = await Promise.all([
      supabase
        .from('audit_logs')
        .select('*')
        .eq('resource_id', userId)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1),
      supabase
        .from('notifications')
        .select('id, type, title, body, created_at, read')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(10),
    ]);

    // Transform audit logs to activity format
    const auditActivities = (auditResult.data || []).map((log) => ({
      id: log.id,
      type: mapAuditActionToType(log.action),
      description: formatAuditDescription(log),
      timestamp: log.created_at,
      metadata: log.metadata,
    }));

    // Transform notifications to activity format
    const notificationActivities = (notificationsResult.data || []).map(
      (notif) => ({
        id: notif.id,
        type: 'notification',
        description: notif.title || notif.body,
        timestamp: notif.created_at,
        metadata: { read: notif.read, type: notif.type },
      }),
    );

    // Merge and sort by timestamp
    const allActivities = [...auditActivities, ...notificationActivities]
      .sort((a, b) => {
        const dateA = a.timestamp ? new Date(a.timestamp).getTime() : 0;
        const dateB = b.timestamp ? new Date(b.timestamp).getTime() : 0;
        return dateB - dateA;
      })
      .slice(0, limit);

    return NextResponse.json({
      activities: allActivities,
      total: auditResult.data?.length || 0,
    });
  } catch (error) {
    logger.error('User activity API error:', error);
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 });
  }
}

function mapAuditActionToType(action: string): string {
  const typeMap: Record<string, string> = {
    user_login: 'login',
    user_logout: 'logout',
    moment_created: 'moment_created',
    moment_updated: 'moment_updated',
    match_created: 'match',
    payment_completed: 'payment',
    report_submitted: 'report_submitted',
    report_received: 'report_received',
    kyc_submitted: 'kyc',
    kyc_verified: 'kyc',
    profile_updated: 'profile',
  };
  return typeMap[action] || action;
}

function formatAuditDescription(log: {
  action: string;
  metadata?: Json | null;
}): string {
  const descriptionMap: Record<string, string> = {
    user_login: 'Giriş yaptı',
    user_logout: 'Çıkış yaptı',
    moment_created: 'Yeni moment paylaştı',
    match_created: 'Yeni eşleşme',
    payment_completed: 'Ödeme tamamlandı',
    report_submitted: 'Rapor gönderildi',
    kyc_verified: 'KYC doğrulandı',
    profile_updated: 'Profil güncellendi',
  };

  let desc = descriptionMap[log.action] || log.action;

  // Add context from metadata if available
  const meta = log.metadata as Record<string, unknown> | null | undefined;
  if (meta) {
    if (meta.amount) {
      desc += ` - ₺${meta.amount}`;
    }
    if (meta.title) {
      desc += `: "${meta.title}"`;
    }
  }

  return desc;
}

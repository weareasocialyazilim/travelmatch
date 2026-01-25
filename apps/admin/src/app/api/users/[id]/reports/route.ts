import { logger } from '@/lib/logger';
import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase.server';
import { getAdminSession, hasPermission } from '@/lib/auth';

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/users/[id]/reports
 * Fetch reports related to user (submitted and received)
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json(
        { error: 'Oturum bulunamadı' },
        { status: 401 }
      );
    }

    // Check permission for viewing reports
    if (!hasPermission(session, 'reports', 'view')) {
      return NextResponse.json(
        { error: 'Bu işlem için yetkiniz yok' },
        { status: 403 }
      );
    }

    const { id: userId } = await params;
    const searchParams = request.nextUrl.searchParams;
    const type = searchParams.get('type'); // submitted, received, all
    const limit = parseInt(searchParams.get('limit') || '20', 10);

    const supabase = createServiceClient();

    // Fetch reports submitted by user
    const submittedQuery = supabase
      .from('reports')
      .select(`
        id,
        reason,
        description,
        status,
        created_at,
        resolved_at,
        reported_user:reported_user_id(id, display_name, avatar_url)
      `)
      .eq('reporter_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);

    // Fetch reports received by user
    const receivedQuery = supabase
      .from('reports')
      .select(`
        id,
        reason,
        description,
        status,
        created_at,
        resolved_at,
        reporter:reporter_id(id, display_name, avatar_url)
      `)
      .eq('reported_user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);

    let submitted: unknown[] = [];
    let received: unknown[] = [];

    if (!type || type === 'all' || type === 'submitted') {
      const { data } = await submittedQuery;
      submitted = data || [];
    }

    if (!type || type === 'all' || type === 'received') {
      const { data } = await receivedQuery;
      received = data || [];
    }

    // Transform reports
    const transformSubmitted = (reports: unknown[]) =>
      reports.map((r: Record<string, unknown>) => ({
        id: r.id,
        type: 'submitted',
        reason: r.reason,
        description: r.description,
        status: r.status,
        created_at: r.created_at,
        resolved_at: r.resolved_at,
        other_party: r.reported_user,
      }));

    const transformReceived = (reports: unknown[]) =>
      reports.map((r: Record<string, unknown>) => ({
        id: r.id,
        type: 'received',
        reason: r.reason,
        description: r.description,
        status: r.status,
        created_at: r.created_at,
        resolved_at: r.resolved_at,
        other_party: r.reporter || { display_name: 'Anonim' },
      }));

    // Calculate stats
    const stats = {
      submitted_total: submitted.length,
      submitted_resolved: submitted.filter((r: Record<string, unknown>) => r.status === 'resolved').length,
      received_total: received.length,
      received_resolved: received.filter((r: Record<string, unknown>) => r.status === 'resolved').length,
      received_dismissed: received.filter((r: Record<string, unknown>) => r.status === 'dismissed').length,
    };

    return NextResponse.json({
      reports: {
        submitted: transformSubmitted(submitted),
        received: transformReceived(received),
      },
      stats,
    });
  } catch (error) {
    logger.error('User reports API error:', error);
    return NextResponse.json(
      { error: 'Sunucu hatası' },
      { status: 500 }
    );
  }
}

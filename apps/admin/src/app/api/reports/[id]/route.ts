import { logger } from '@/lib/logger';
import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase.server';
import { getAdminSession, hasPermission } from '@/lib/auth';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    // Auth check - P0 Security Fix
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 401 });
    }

    if (!hasPermission(session, 'reports', 'view')) {
      return NextResponse.json({ error: 'Yetersiz yetki' }, { status: 403 });
    }

    const { id } = await params;
    const supabase = createServiceClient();

    const { data: report, error } = await (supabase.from('reports') as any)
      .select(
        `
        *,
        reporter:users!reporter_id(id, full_name, avatar_url, email),
        reported:users!reported_id(id, full_name, avatar_url, email),
        assigned_to:admin_users!assigned_to(id, full_name),
        actions:report_actions(*)
      `,
      )
      .eq('id', id)
      .single();

    if (error) throw error;

    if (!report) {
      return NextResponse.json({ error: 'Report not found' }, { status: 404 });
    }

    return NextResponse.json(report);
  } catch (error) {
    logger.error('Get report error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch report' },
      { status: 500 },
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    // Auth check - P0 Security Fix
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 401 });
    }

    if (!hasPermission(session, 'reports', 'update')) {
      return NextResponse.json({ error: 'Yetersiz yetki' }, { status: 403 });
    }

    const { id } = await params;
    const supabase = createServiceClient();
    const body = await request.json();

    const { data, error } = await (supabase.from('reports') as any)
      .update({
        status: body.status,
        priority: body.priority,
        assigned_to: body.assigned_to,
        resolution: body.resolution,
        resolved_at:
          body.status === 'resolved' ? new Date().toISOString() : null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error) {
    logger.error('Update report error:', error);
    return NextResponse.json(
      { error: 'Failed to update report' },
      { status: 500 },
    );
  }
}

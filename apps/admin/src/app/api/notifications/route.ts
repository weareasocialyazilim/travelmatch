import { logger } from '@/lib/logger';
import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase';
import { getAdminSession, hasPermission } from '@/lib/auth';
import type { Database } from '@/types/database';

type NotificationCampaignStatus =
  Database['public']['Tables']['notification_campaigns']['Row']['status'];
type NotificationCampaignType =
  Database['public']['Tables']['notification_campaigns']['Row']['type'];

export async function GET(request: NextRequest) {
  try {
    // SECURITY FIX: Require admin authentication
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!hasPermission(session, 'notifications', 'view')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const supabase = createServiceClient();
    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get('status') as NotificationCampaignStatus | null;
    const type = searchParams.get('type') as NotificationCampaignType | null;

    let query = supabase
      .from('notification_campaigns')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false });

    if (status) {
      query = query.eq('status', status);
    }
    if (type) {
      query = query.eq('type', type);
    }

    const { data: campaigns, error, count } = await query.limit(50);

    if (error) throw error;

    return NextResponse.json({
      campaigns,
      total: count,
    });
  } catch (error) {
    logger.error('Notifications API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch notifications' },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // SECURITY FIX: Require admin authentication
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!hasPermission(session, 'notifications', 'create')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const supabase = createServiceClient();
    const body = await request.json();

    const { data, error } = await supabase
      .from('notification_campaigns')
      .insert({
        title: body.title,
        message: body.message,
        type: body.type,
        target_audience: body.target_audience,
        scheduled_at: body.scheduled_at,
        status: body.scheduled_at ? 'scheduled' : 'draft',
        created_by: session.admin_id, // Use authenticated admin ID
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    logger.error('Create notification error:', error);
    return NextResponse.json(
      { error: 'Failed to create notification' },
      { status: 500 },
    );
  }
}

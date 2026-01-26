import { logger } from '@/lib/logger';
import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase.server';
import { getAdminSession } from '@/lib/auth';

/**
 * Thank You Moderation API
 *
 * GET: List flagged thank you events for moderation
 * PATCH: Approve or reject a flagged thank you
 *
 * Moderation statuses:
 * - approved: Visible to recipients
 * - flagged: Pending review (contains warning words or auto-flagged)
 * - rejected: Hidden, author may be notified
 * - pending_review: Requires manual review
 */

export async function GET(request: NextRequest) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || 'flagged';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = (page - 1) * limit;

    const supabase = createServiceClient();

    // Build query
    let query = supabase
      .from('thank_you_events')
      .select(`
        id,
        moment_id,
        author_id,
        recipient_id,
        gift_id,
        message,
        message_type,
        moderation_status,
        flagged_reason,
        created_at,
        author:author_id(full_name, avatar_url, username),
        recipient:recipient_id(full_name, avatar_url, username),
        moment:moments(id, title, creator_id)
      `, { count: 'exact' });

    // Filter by status
    if (status !== 'all') {
      query = query.eq('moderation_status', status);
    }

    // For non-admins, only show flagged items
    const { data, error, count } = await query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      logger.error('Failed to fetch thank you events:', error);
      return NextResponse.json(
        { error: 'Teşekkür etkinlikleri alınamadı' },
        { status: 500 },
      );
    }

    return NextResponse.json({
      data: data || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
      },
    });
  } catch (error) {
    logger.error('Thank you GET error:', error);
    return NextResponse.json({ error: 'Bir hata oluştu' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 401 });
    }

    const body = await request.json();
    const { id, action, reason } = body;

    if (!id || !action) {
      return NextResponse.json(
        { error: 'ID ve action gereklidir' },
        { status: 400 },
      );
    }

    // Validate action
    const validActions = ['approve', 'reject', 'flag'];
    if (!validActions.includes(action)) {
      return NextResponse.json(
        { error: 'Geçersiz action' },
        { status: 400 },
      );
    }

    const supabase = createServiceClient();

    // Map action to moderation_status
    const statusMap: Record<string, string> = {
      approve: 'approved',
      reject: 'rejected',
      flag: 'flagged',
    };

    const newStatus = statusMap[action];

    // Update the thank you event
    const { error: updateError } = await supabase
      .from('thank_you_events')
      .update({
        moderation_status: newStatus,
        flagged_reason: action === 'reject' || action === 'flag' ? reason : null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id);

    if (updateError) {
      logger.error('Failed to update thank you event:', updateError);
      return NextResponse.json(
        { error: 'Teşekkür etkinliği güncellenemedi' },
        { status: 500 },
      );
    }

    // Log the moderation action
    await supabase.from('audit_logs').insert({
      admin_id: session.admin.id,
      action: `thank_you_moderation_${action}`,
      resource_type: 'thank_you_event',
      resource_id: id,
      details: {
        new_status: newStatus,
        reason,
        moderator_id: session.admin.id,
      },
    });

    // If rejected, notify the author (optional)
    if (action === 'reject') {
      // TODO: Send notification to author about rejection
      logger.info('Thank you rejected:', { id, reason });
    }

    return NextResponse.json({
      success: true,
      message: `Teşekkür ${action === 'approve' ? 'onaylandı' : action === 'reject' ? 'reddedildi' : 'işaretlendi'}`,
    });
  } catch (error) {
    logger.error('Thank you PATCH error:', error);
    return NextResponse.json({ error: 'Bir hata oluştu' }, { status: 500 });
  }
}

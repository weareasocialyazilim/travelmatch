import { logger } from '@/lib/logger';
import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase.server';
import { getAdminSession } from '@/lib/auth';

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/users/[id]/moments
 * Fetch user's moments
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
    const status = searchParams.get('status'); // active, pending_review, rejected, expired

    const supabase = createServiceClient();

    // Build query
    let query = supabase
      .from('moments')
      .select(
        `
        id,
        title,
        description,
        status,
        image_id,
        location,
        date,
        created_at,
        updated_at
      `,
        { count: 'exact' },
      )
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (status) {
      query = query.eq('status', status);
    }

    const { data: moments, error, count } = await query;

    if (error) {
      logger.error('Failed to fetch user moments:', error);
      return NextResponse.json(
        { error: 'Momentler alınamadı' },
        { status: 500 },
      );
    }

    // Get moment stats
    const stats = {
      total: count || 0,
      active: 0,
      pending_review: 0,
      rejected: 0,
      expired: 0,
    };

    // Count by status
    const { data: statusCounts } = await supabase
      .from('moments')
      .select('status')
      .eq('user_id', userId);

    if (statusCounts) {
      statusCounts.forEach((m) => {
        const s = m.status as string;
        if (s && s in stats) {
          stats[s as keyof typeof stats]++;
        }
      });
    }

    // Transform moments for response
    const transformedMoments = (moments || []).map((moment) => ({
      id: moment.id,
      title: moment.title,
      description: moment.description,
      status: moment.status,
      thumbnail: moment.image_id,
      location: moment.location,
      date: moment.date,
      created_at: moment.created_at,
      updated_at: moment.updated_at,
    }));

    return NextResponse.json({
      moments: transformedMoments,
      stats,
      total: count || 0,
      limit,
      offset,
    });
  } catch (error) {
    logger.error('User moments API error:', error);
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 });
  }
}

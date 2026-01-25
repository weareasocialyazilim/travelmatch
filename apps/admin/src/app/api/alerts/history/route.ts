import { logger } from '@/lib/logger';
import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase.server';
import { getAdminSession } from '@/lib/auth';

/**
 * GET /api/alerts/history
 * Fetch resolved alerts history
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json(
        { error: 'Oturum bulunamadı' },
        { status: 401 }
      );
    }

    const searchParams = request.nextUrl.searchParams;
    const limit = parseInt(searchParams.get('limit') || '50', 10);
    const offset = parseInt(searchParams.get('offset') || '0', 10);
    const severity = searchParams.get('severity');
    const category = searchParams.get('category');

    const supabase = createServiceClient();

    let query = supabase
      .from('alert_history')
      .select('*', { count: 'exact' })
      .order('resolved_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (severity) {
      query = query.eq('severity', severity);
    }

    if (category) {
      query = query.eq('category', category);
    }

    const { data: history, error, count } = await query;

    if (error) {
      logger.error('Failed to fetch alert history:', error);
      return NextResponse.json(
        { error: 'Alert geçmişi alınamadı' },
        { status: 500 }
      );
    }

    // Transform to match expected format
    const transformedHistory = (history || []).map(item => {
      const durationSeconds = item.duration_seconds || 0;
      let duration = '';
      if (durationSeconds < 60) {
        duration = `${durationSeconds} saniye`;
      } else if (durationSeconds < 3600) {
        duration = `${Math.floor(durationSeconds / 60)} dakika`;
      } else {
        const hours = Math.floor(durationSeconds / 3600);
        const mins = Math.floor((durationSeconds % 3600) / 60);
        duration = mins > 0 ? `${hours} saat ${mins} dakika` : `${hours} saat`;
      }

      return {
        id: item.id,
        title: item.title,
        severity: item.severity,
        category: item.category,
        resolvedAt: item.resolved_at,
        duration,
        resolvedBy: item.resolved_by_name || 'System',
        resolutionType: item.resolution_type
      };
    });

    return NextResponse.json({
      history: transformedHistory,
      total: count || 0,
      limit,
      offset
    });
  } catch (error) {
    logger.error('Alert history API error:', error);
    return NextResponse.json(
      { error: 'Sunucu hatası' },
      { status: 500 }
    );
  }
}

import { logger } from '@/lib/logger';
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient();
    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get('status');
    const type = searchParams.get('type');
    const priority = searchParams.get('priority');

    let query = supabase
      .from('reports')
      .select(`
        *,
        reporter:profiles!reporter_id(id, full_name, avatar_url),
        reported:profiles!reported_id(id, full_name, avatar_url),
        assigned_to:admin_users!assigned_to(id, full_name)
      `, { count: 'exact' })
      .order('created_at', { ascending: false });

    if (status) {
      query = query.eq('status', status);
    }
    if (type) {
      query = query.eq('type', type);
    }
    if (priority) {
      query = query.eq('priority', priority);
    }

    const { data: reports, error, count } = await query.limit(50);

    if (error) throw error;

    return NextResponse.json({
      reports,
      total: count,
    });
  } catch (error) {
    logger.error('Reports API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch reports' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient();
    const body = await request.json();

    const { data, error } = await supabase
      .from('reports')
      .insert({
        reporter_id: body.reporter_id,
        reported_id: body.reported_id,
        type: body.type,
        reason: body.reason,
        description: body.description,
        evidence: body.evidence,
        status: 'pending',
        priority: body.priority || 'medium',
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    logger.error('Create report error:', error);
    return NextResponse.json(
      { error: 'Failed to create report' },
      { status: 500 }
    );
  }
}

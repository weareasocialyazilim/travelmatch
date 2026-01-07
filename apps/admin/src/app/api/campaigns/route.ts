import { logger } from '@/lib/logger';
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient();
    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get('status');
    const type = searchParams.get('type');

    let query = supabase
      .from('marketing_campaigns')
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
    logger.error('Campaigns API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch campaigns' },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient();
    const body = await request.json();

    const { data, error } = await supabase
      .from('marketing_campaigns')
      .insert({
        name: body.name,
        description: body.description,
        type: body.type,
        target_audience: body.target_audience,
        budget: body.budget,
        start_date: body.start_date,
        end_date: body.end_date,
        status: 'draft',
        created_by: body.created_by,
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    logger.error('Create campaign error:', error);
    return NextResponse.json(
      { error: 'Failed to create campaign' },
      { status: 500 },
    );
  }
}

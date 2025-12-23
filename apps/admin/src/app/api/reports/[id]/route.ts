import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const supabase = createClient();

    const { data: report, error } = await supabase
      .from('reports')
      .select(
        `
        *,
        reporter:profiles!reporter_id(id, full_name, avatar_url, email),
        reported:profiles!reported_id(id, full_name, avatar_url, email),
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
    console.error('Get report error:', error);
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
    const { id } = await params;
    const supabase = createClient();
    const body = await request.json();

    const { data, error } = await supabase
      .from('reports')
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
    console.error('Update report error:', error);
    return NextResponse.json(
      { error: 'Failed to update report' },
      { status: 500 },
    );
  }
}

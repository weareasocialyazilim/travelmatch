import { z } from 'zod';
import { logger } from '@/lib/logger';
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase';
import { getAdminSession, hasPermission, createAuditLog } from '@/lib/auth';

// Input validation schemas
const reportFilterSchema = z.object({
  status: z.enum(['pending', 'investigating', 'resolved', 'closed']).optional(),
  type: z
    .enum([
      'spam',
      'harassment',
      'fake_profile',
      'inappropriate_content',
      'scam',
      'other',
    ])
    .optional(),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).optional(),
});

const createReportSchema = z.object({
  reporter_id: z.string().uuid(),
  reported_id: z.string().uuid(),
  type: z.enum([
    'spam',
    'harassment',
    'fake_profile',
    'inappropriate_content',
    'scam',
    'other',
  ]),
  reason: z.string().min(1).max(500),
  description: z.string().max(2000).optional(),
  evidence: z.array(z.string().url()).optional(),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).optional(),
});

export async function GET(request: NextRequest) {
  try {
    // Authentication check
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Permission check
    if (!hasPermission(session, 'reports', 'view')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const supabase = createClient();
    const searchParams = request.nextUrl.searchParams;

    // Validate query parameters
    const filterResult = reportFilterSchema.safeParse({
      status: searchParams.get('status') || undefined,
      type: searchParams.get('type') || undefined,
      priority: searchParams.get('priority') || undefined,
    });

    if (!filterResult.success) {
      return NextResponse.json(
        {
          error: 'Invalid filter parameters',
          details: filterResult.error.errors,
        },
        { status: 400 },
      );
    }

    const { status, type, priority } = filterResult.data;

    let query = supabase
      .from('reports')
      .select(
        `
        *,
        reporter:users!reporter_id(id, full_name, avatar_url),
        reported:users!reported_id(id, full_name, avatar_url),
        assigned_to:admin_users!assigned_to(id, full_name)
      `,
        { count: 'exact' },
      )
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
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Authentication check
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Permission check
    if (!hasPermission(session, 'reports', 'create')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const supabase = createClient();
    const body = await request.json();

    // Validate request body
    const parseResult = createReportSchema.safeParse(body);
    if (!parseResult.success) {
      return NextResponse.json(
        { error: 'Invalid request body', details: parseResult.error.errors },
        { status: 400 },
      );
    }

    const validatedData = parseResult.data;

    const { data, error } = await supabase
      .from('reports')
      .insert({
        reporter_id: validatedData.reporter_id,
        reported_id: validatedData.reported_id,
        type: validatedData.type,
        reason: validatedData.reason,
        description: validatedData.description,
        evidence: validatedData.evidence,
        status: 'pending',
        priority: validatedData.priority || 'medium',
      })
      .select()
      .single();

    if (error) throw error;

    // Audit log
    await createAuditLog(
      session.admin.id,
      'create',
      'report',
      data.id,
      null,
      data,
      request.headers.get('x-forwarded-for') || request.ip || 'unknown',
      request.headers.get('user-agent') || 'unknown',
    );

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    logger.error('Create report error:', error);
    return NextResponse.json(
      { error: 'Failed to create report' },
      { status: 500 },
    );
  }
}

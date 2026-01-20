import { logger } from '@/lib/logger';
import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase';
import { getAdminSession } from '@/lib/auth';
import {
  validatePagination,
  sanitizeUUID,
  buildSafeUUIDFilter,
  buildSafeArrayContainsFilter,
} from '@/lib/query-utils';

// Whitelist of valid status values
const VALID_STATUSES = ['pending', 'in_progress', 'completed', 'cancelled'];
// Whitelist of valid priority values
const VALID_PRIORITIES = ['low', 'medium', 'high', 'urgent'];

export async function GET(request: NextRequest) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const rawStatus = searchParams.get('status');
    const rawPriority = searchParams.get('priority');
    const assignedTo = searchParams.get('assigned_to');
    const { limit, offset } = validatePagination(
      searchParams.get('limit'),
      searchParams.get('offset'),
    );

    // SECURITY: Validate status and priority against whitelists
    const status =
      rawStatus && VALID_STATUSES.includes(rawStatus) ? rawStatus : null;
    const priority =
      rawPriority && VALID_PRIORITIES.includes(rawPriority)
        ? rawPriority
        : null;

    const supabase = createServiceClient();

    let query = (supabase.from('tasks') as any)
      .select(
        '*, assigned_to_user:admin_users!tasks_assigned_to_fkey(id, name, email, avatar_url)',
        {
          count: 'exact',
        },
      )
      .order('priority', { ascending: false })
      .order('created_at', { ascending: true })
      .range(offset, offset + limit - 1);

    // Filter by status
    if (status) {
      query = query.eq('status', status);
    } else {
      query = query.in('status', ['pending', 'in_progress']);
    }

    // Filter by priority
    if (priority) {
      query = query.eq('priority', priority);
    }

    // Filter by assignee
    if (assignedTo === 'me') {
      query = query.eq('assigned_to', session.admin.id);
    } else if (assignedTo === 'unassigned') {
      query = query.is('assigned_to', null);
    } else if (assignedTo) {
      // SECURITY: Validate assignedTo UUID
      const sanitizedAssignee = sanitizeUUID(assignedTo);
      if (sanitizedAssignee) {
        query = query.eq('assigned_to', sanitizedAssignee);
      }
    }

    // Role-based filtering for non-admin roles
    // SECURITY: Use safe filter builders for session data (VULN-001)
    if (!['super_admin', 'manager'].includes(session.admin.role)) {
      const uuidFilter = buildSafeUUIDFilter('assigned_to', session.admin.id);
      const roleFilter = buildSafeArrayContainsFilter(
        'assigned_roles',
        session.admin.role,
      );

      if (uuidFilter && roleFilter) {
        query = query.or(`${uuidFilter},${roleFilter}`);
      } else if (uuidFilter) {
        query = query.eq('assigned_to', session.admin.id);
      }
    }

    const { data: tasks, count, error } = await query;

    if (error) {
      logger.error('Tasks query error:', error);
      return NextResponse.json(
        { error: 'Görevler yüklenemedi' },
        { status: 500 },
      );
    }

    return NextResponse.json({
      tasks,
      total: count || 0,
      limit,
      offset,
    });
  } catch (error) {
    logger.error('Tasks GET error:', error);
    return NextResponse.json({ error: 'Bir hata oluştu' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 401 });
    }

    const body = await request.json();
    const {
      type,
      title,
      description,
      priority = 'medium',
      resource_type,
      resource_id,
      assigned_to,
      assigned_roles,
      due_date,
      metadata,
    } = body;

    if (!type || !title || !resource_type || !resource_id) {
      return NextResponse.json(
        { error: 'Gerekli alanlar eksik' },
        { status: 400 },
      );
    }

    const supabase = createServiceClient();

    const { data: task, error } = await (supabase.from('tasks') as any)
      .insert({
        type,
        title,
        description,
        priority,
        resource_type,
        resource_id,
        assigned_to,
        assigned_roles: assigned_roles || [],
        due_date,
        metadata: metadata || {},
      })
      .select()
      .single();

    if (error) {
      logger.error('Task creation error:', error);
      return NextResponse.json(
        { error: 'Görev oluşturulamadı' },
        { status: 500 },
      );
    }

    // Create audit log

    await (supabase.from('audit_logs') as any).insert({
      admin_id: session.admin.id,
      action: 'create_task',
      resource_type: 'task',
      resource_id: task.id,
      new_value: task,
      ip_address:
        request.headers.get('x-forwarded-for') ||
        request.headers.get('x-real-ip') ||
        undefined,
      user_agent: request.headers.get('user-agent'),
    });

    return NextResponse.json({ task }, { status: 201 });
  } catch (error) {
    logger.error('Tasks POST error:', error);
    return NextResponse.json({ error: 'Bir hata oluştu' }, { status: 500 });
  }
}

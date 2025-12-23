import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase';
import { getAdminSession } from '@/lib/auth';
import type { Database } from '@/types/database';

type TaskStatus = Database['public']['Enums']['task_status'];
type TaskPriority = Database['public']['Enums']['task_priority'];

export async function GET(request: NextRequest) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const priority = searchParams.get('priority');
    const assignedTo = searchParams.get('assigned_to');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    const supabase = createServiceClient();

    let query = supabase
      .from('tasks')
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
      query = query.eq('status', status as TaskStatus);
    } else {
      query = query.in('status', ['pending', 'in_progress'] as TaskStatus[]);
    }

    // Filter by priority
    if (priority) {
      query = query.eq('priority', priority as TaskPriority);
    }

    // Filter by assignee
    if (assignedTo === 'me') {
      query = query.eq('assigned_to', session.admin.id);
    } else if (assignedTo === 'unassigned') {
      query = query.is('assigned_to', null);
    } else if (assignedTo) {
      query = query.eq('assigned_to', assignedTo);
    }

    // Role-based filtering for non-admin roles
    if (!['super_admin', 'manager'].includes(session.admin.role)) {
      query = query.or(
        `assigned_to.eq.${session.admin.id},assigned_roles.cs.{${session.admin.role}}`,
      );
    }

    const { data: tasks, count, error } = await query;

    if (error) {
      console.error('Tasks query error:', error);
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
    console.error('Tasks GET error:', error);
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

    const { data: task, error } = await supabase
      .from('tasks')
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
      console.error('Task creation error:', error);
      return NextResponse.json(
        { error: 'Görev oluşturulamadı' },
        { status: 500 },
      );
    }

    // Create audit log
    await supabase.from('audit_logs').insert({
      admin_id: session.admin.id,
      action: 'create_task',
      resource_type: 'task',
      resource_id: task.id,
      new_value: task as Record<string, unknown>,
      ip_address:
        request.headers.get('x-forwarded-for') ||
        request.headers.get('x-real-ip') ||
        'unknown',
      user_agent: request.headers.get('user-agent'),
    });

    return NextResponse.json({ task }, { status: 201 });
  } catch (error) {
    console.error('Tasks POST error:', error);
    return NextResponse.json({ error: 'Bir hata oluştu' }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase';
import { getAdminSession } from '@/lib/auth';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 401 });
    }

    const { id } = await params;
    const supabase = createServiceClient();

    const { data: task, error } = await supabase
      .from('tasks')
      .select(
        '*, assigned_to_user:admin_users!tasks_assigned_to_fkey(id, name, email, avatar_url)',
      )
      .eq('id', id)
      .single();

    if (error || !task) {
      return NextResponse.json({ error: 'Görev bulunamadı' }, { status: 404 });
    }

    return NextResponse.json({ task });
  } catch (error) {
    console.error('Task GET error:', error);
    return NextResponse.json({ error: 'Bir hata oluştu' }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const supabase = createServiceClient();

    // Get current task
    const { data: currentTask, error: fetchError } = await supabase
      .from('tasks')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError || !currentTask) {
      return NextResponse.json({ error: 'Görev bulunamadı' }, { status: 404 });
    }

    // Prepare update data
    const updateData: Record<string, unknown> = {};

    if (body.status) updateData.status = body.status;
    if (body.priority) updateData.priority = body.priority;
    if (body.assigned_to !== undefined)
      updateData.assigned_to = body.assigned_to;
    if (body.assigned_roles) updateData.assigned_roles = body.assigned_roles;
    if (body.due_date !== undefined) updateData.due_date = body.due_date;
    if (body.metadata) {
      const existingMetadata =
        typeof currentTask.metadata === 'object' &&
        currentTask.metadata !== null
          ? (currentTask.metadata as Record<string, unknown>)
          : {};
      updateData.metadata = { ...existingMetadata, ...body.metadata };
    }

    // Handle completion
    if (body.status === 'completed') {
      updateData.completed_at = new Date().toISOString();
      updateData.completed_by = session.admin.id;
    }

    const { data: task, error } = await supabase
      .from('tasks')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Task update error:', error);
      return NextResponse.json(
        { error: 'Görev güncellenemedi' },
        { status: 500 },
      );
    }

    // Create audit log
    await (
      supabase as unknown as {
        from: (table: string) => {
          insert: (data: Record<string, unknown>) => Promise<unknown>;
        };
      }
    )
      .from('admin_audit_logs')
      .insert({
        admin_id: session.admin.id,
        action: 'update_task',
        resource_type: 'task',
        resource_id: id,
        old_value: currentTask,
        new_value: task,
        ip_address:
          request.headers.get('x-forwarded-for') ||
          request.headers.get('x-real-ip') ||
          'unknown',
        user_agent: request.headers.get('user-agent'),
      });

    return NextResponse.json({ task });
  } catch (error) {
    console.error('Task PATCH error:', error);
    return NextResponse.json({ error: 'Bir hata oluştu' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 401 });
    }

    // Only admins can delete tasks
    if (!['super_admin', 'manager'].includes(session.admin.role)) {
      return NextResponse.json({ error: 'Yetersiz yetki' }, { status: 403 });
    }

    const { id } = await params;
    const supabase = createServiceClient();

    // Get current task for audit log
    const { data: currentTask } = await supabase
      .from('tasks')
      .select('*')
      .eq('id', id)
      .single();

    const { error } = await supabase.from('tasks').delete().eq('id', id);

    if (error) {
      console.error('Task delete error:', error);
      return NextResponse.json({ error: 'Görev silinemedi' }, { status: 500 });
    }

    // Create audit log
    if (currentTask) {
      await (
        supabase as unknown as {
          from: (table: string) => {
            insert: (data: Record<string, unknown>) => Promise<unknown>;
          };
        }
      )
        .from('admin_audit_logs')
        .insert({
          admin_id: session.admin.id,
          action: 'delete_task',
          resource_type: 'task',
          resource_id: id,
          old_value: currentTask,
          ip_address:
            request.headers.get('x-forwarded-for') ||
            request.headers.get('x-real-ip') ||
            'unknown',
          user_agent: request.headers.get('user-agent'),
        });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Task DELETE error:', error);
    return NextResponse.json({ error: 'Bir hata oluştu' }, { status: 500 });
  }
}

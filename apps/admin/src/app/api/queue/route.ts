import { createClient } from '@/lib/supabase';
import { logger } from '@/lib/logger';
import { NextResponse } from 'next/server';

/**
 * Task Queue API Endpoint
 * Manages admin tasks and queue
 */

export async function GET(request: Request) {
  try {
    const supabase = createClient();
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const type = searchParams.get('type');
    const priority = searchParams.get('priority');
    const limit = parseInt(searchParams.get('limit') || '50');

    // Build query
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let query = (supabase.from('tasks') as any)
      .select(
        `
        id,
        title,
        description,
        type,
        status,
        priority,
        assigned_to,
        due_date,
        created_at,
        updated_at,
        metadata,
        assignee:profiles!tasks_assigned_to_fkey (
          id,
          full_name,
          avatar_url
        )
      `,
      )
      .order('priority', { ascending: false })
      .order('created_at', { ascending: false })
      .limit(limit);

    if (status && status !== 'all') {
      query = query.eq('status', status);
    }
    if (type && type !== 'all') {
      query = query.eq('type', type);
    }
    if (priority && priority !== 'all') {
      query = query.eq('priority', priority);
    }

    const { data: tasks, error: tasksError } = await query;

    if (tasksError) {
      logger.error('Tasks fetch error:', tasksError);
    }

    // Get stats
    const [
      pendingCount,
      inProgressCount,
      completedCount,
      urgentCount,
      overdueCount,
    ] = await Promise.all([
      (supabase.from('tasks') as any)
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending'),
      (supabase.from('tasks') as any)
        .select('*', { count: 'exact', head: true })
        .eq('status', 'in_progress'),
      (supabase.from('tasks') as any)
        .select('*', { count: 'exact', head: true })
        .eq('status', 'completed'),
      (supabase.from('tasks') as any)
        .select('*', { count: 'exact', head: true })
        .eq('priority', 'urgent'),
      (supabase.from('tasks') as any)
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending')
        .lt('due_date', new Date().toISOString()),
    ]);

    // Get task types for filter
    const { data: taskTypes } = await (supabase.from('tasks') as any)
      .select('type')
      .not('type', 'is', null);

    const uniqueTypes = [...new Set(taskTypes?.map((t: any) => t.type) || [])];

    return NextResponse.json({
      tasks: tasks || [],
      stats: {
        pending: pendingCount.count || 0,
        inProgress: inProgressCount.count || 0,
        completed: completedCount.count || 0,
        urgent: urgentCount.count || 0,
        overdue: overdueCount.count || 0,
        total:
          (pendingCount.count || 0) +
          (inProgressCount.count || 0) +
          (completedCount.count || 0),
      },
      taskTypes: uniqueTypes,
      meta: {
        generatedAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    logger.error('Queue API Error:', error);
    return NextResponse.json(
      {
        tasks: [],
        stats: {
          pending: 0,
          inProgress: 0,
          completed: 0,
          urgent: 0,
          overdue: 0,
          total: 0,
        },
        taskTypes: [],
        meta: {
          generatedAt: new Date().toISOString(),
          error: 'Failed to fetch queue data',
        },
      },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const supabase = createClient();
    const body = await request.json();

    const { data, error } = await (supabase.from('tasks') as any)
      .insert({
        title: body.title,
        description: body.description,
        type: body.type || 'general',
        status: 'pending',
        priority: body.priority || 'medium',
        assigned_to: body.assigned_to,
        due_date: body.due_date,
        metadata: body.metadata || {},
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    return NextResponse.json({ task: data });
  } catch (error) {
    logger.error('Create task error:', error);
    return NextResponse.json(
      { error: 'Failed to create task' },
      { status: 500 },
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const supabase = createClient();
    const body = await request.json();
    const { id, ...updates } = body;

    const { data, error } = await (supabase.from('tasks') as any)
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw error;
    }

    return NextResponse.json({ task: data });
  } catch (error) {
    logger.error('Update task error:', error);
    return NextResponse.json(
      { error: 'Failed to update task' },
      { status: 500 },
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const supabase = createClient();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Task ID required' }, { status: 400 });
    }

    const { error } = await (supabase.from('tasks') as any)
      .delete()
      .eq('id', id);

    if (error) {
      throw error;
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    logger.error('Delete task error:', error);
    return NextResponse.json(
      { error: 'Failed to delete task' },
      { status: 500 },
    );
  }
}

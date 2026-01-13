import { createClient } from '@/lib/supabase';
import { logger } from '@/lib/logger';
import { NextResponse } from 'next/server';
import type { Database } from '@/types/database';

type SupportTicketRow = Database['public']['Tables']['support_tickets']['Row'];

/**
 * Support Tickets API Endpoint
 * Fetches support tickets and related data
 */

export async function GET(request: Request) {
  try {
    const supabase = createClient();
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const priority = searchParams.get('priority');
    const limit = parseInt(searchParams.get('limit') || '50');

    // Build query
    let query = supabase
      .from('support_tickets')
      .select(
        `
        id,
        subject,
        description,
        status,
        priority,
        category,
        created_at,
        updated_at,
        assigned_to,
        user_id,
        profiles!support_tickets_user_id_fkey (
          id,
          full_name,
          avatar_url,
          email
        )
      `,
      )
      .order('created_at', { ascending: false })
      .limit(limit);

    if (status && status !== 'all') {
      query = query.eq('status', status as SupportTicketRow['status']);
    }
    if (priority && priority !== 'all') {
      query = query.eq('priority', priority as SupportTicketRow['priority']);
    }

    const { data: tickets, error: ticketsError } = await query;

    if (ticketsError) {
      logger.error('Tickets fetch error:', ticketsError);
    }

    // Get ticket stats
    const [openCount, pendingCount, resolvedCount, totalCount] =
      await Promise.all([
        supabase
          .from('support_tickets')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'open'),
        supabase
          .from('support_tickets')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'pending'),
        supabase
          .from('support_tickets')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'resolved'),
        supabase
          .from('support_tickets')
          .select('*', { count: 'exact', head: true }),
      ]);

    // Get canned responses
    const { data: cannedResponses } = await supabase
      .from('canned_responses')
      .select('id, title, content, category')
      .order('title');

    return NextResponse.json({
      tickets: tickets || [],
      stats: {
        open: openCount.count || 0,
        pending: pendingCount.count || 0,
        resolved: resolvedCount.count || 0,
        total: totalCount.count || 0,
      },
      cannedResponses: cannedResponses || [],
      meta: {
        generatedAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    logger.error('Support API Error:', error);
    return NextResponse.json(
      {
        tickets: [],
        stats: { open: 0, pending: 0, resolved: 0, total: 0 },
        cannedResponses: [],
        meta: {
          generatedAt: new Date().toISOString(),
          error: 'Failed to fetch support data',
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

    const { data, error } = await supabase
      .from('support_tickets')
      .insert({
        subject: body.subject,
        description: body.description,
        priority: (body.priority || 'medium') as SupportTicketRow['priority'],
        category: body.category || 'general',
        status: 'open',
        user_id: body.user_id,
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    return NextResponse.json({ ticket: data });
  } catch (error) {
    logger.error('Create ticket error:', error);
    return NextResponse.json(
      { error: 'Failed to create ticket' },
      { status: 500 },
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const supabase = createClient();
    const body = await request.json();
    const { id, ...updates } = body;

    const { data, error } = await supabase
      .from('support_tickets')
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

    return NextResponse.json({ ticket: data });
  } catch (error) {
    logger.error('Update ticket error:', error);
    return NextResponse.json(
      { error: 'Failed to update ticket' },
      { status: 500 },
    );
  }
}

import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

/**
 * Feature Flags API Endpoint
 * Manages feature flags for the application
 */

export async function GET() {
  try {
    const supabase = await createClient();

    const { data: flags, error } = await supabase
      .from('feature_flags')
      .select('*')
      .order('name');

    if (error) {
      console.error('Feature flags fetch error:', error);
    }

    // Group flags by category
    const groupedFlags = (flags || []).reduce((acc, flag) => {
      const category = flag.category || 'general';
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(flag);
      return acc;
    }, {} as Record<string, typeof flags>);

    // Calculate stats
    const totalFlags = flags?.length || 0;
    const enabledFlags = flags?.filter(f => f.enabled).length || 0;
    const betaFlags = flags?.filter(f => f.rollout_percentage < 100 && f.rollout_percentage > 0).length || 0;

    return NextResponse.json({
      flags: flags || [],
      groupedFlags,
      stats: {
        total: totalFlags,
        enabled: enabledFlags,
        disabled: totalFlags - enabledFlags,
        beta: betaFlags,
      },
      meta: {
        generatedAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('Feature Flags API Error:', error);
    return NextResponse.json({
      flags: [],
      groupedFlags: {},
      stats: { total: 0, enabled: 0, disabled: 0, beta: 0 },
      meta: {
        generatedAt: new Date().toISOString(),
        error: 'Failed to fetch feature flags',
      },
    }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const body = await request.json();

    const { data, error } = await supabase
      .from('feature_flags')
      .insert({
        name: body.name,
        description: body.description,
        enabled: body.enabled ?? false,
        category: body.category || 'general',
        rollout_percentage: body.rollout_percentage ?? 100,
        environments: body.environments || ['production'],
        metadata: body.metadata || {},
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    return NextResponse.json({ flag: data });
  } catch (error) {
    console.error('Create flag error:', error);
    return NextResponse.json({ error: 'Failed to create flag' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const supabase = await createClient();
    const body = await request.json();
    const { id, ...updates } = body;

    const { data, error } = await supabase
      .from('feature_flags')
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

    return NextResponse.json({ flag: data });
  } catch (error) {
    console.error('Update flag error:', error);
    return NextResponse.json({ error: 'Failed to update flag' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const supabase = await createClient();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Flag ID required' }, { status: 400 });
    }

    const { error } = await supabase
      .from('feature_flags')
      .delete()
      .eq('id', id);

    if (error) {
      throw error;
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete flag error:', error);
    return NextResponse.json({ error: 'Failed to delete flag' }, { status: 500 });
  }
}

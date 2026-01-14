import { createServiceClient } from '@/lib/supabase';
import { logger } from '@/lib/logger';
import { NextRequest, NextResponse } from 'next/server';
import { getAdminSession, hasPermission, createAuditLog } from '@/lib/auth';
import type { Database } from '@/types/database';

type FeatureFlagRow = Database['public']['Tables']['feature_flags']['Row'];

/**
 * Feature Flags API Endpoint
 * Manages feature flags for the application
 * PROTECTED: Requires admin session and settings permission
 */

export async function GET() {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 401 });
    }

    if (!hasPermission(session, 'settings', 'view')) {
      return NextResponse.json({ error: 'Yetersiz yetki' }, { status: 403 });
    }

    const supabase = createServiceClient();

    const { data: flags, error } = await supabase
      .from('feature_flags')
      .select('*')
      .order('name');

    if (error) {
      logger.error('Feature flags fetch error:', error);
    }

    // Group flags by category
    const groupedFlags = (flags || []).reduce(
      (acc: Record<string, FeatureFlagRow[]>, flag) => {
        const category = flag.category || 'general';
        if (!acc[category]) {
          acc[category] = [];
        }
        acc[category].push(flag);
        return acc;
      },
      {} as Record<string, FeatureFlagRow[]>,
    );

    // Calculate stats
    const totalFlags = flags?.length || 0;
    const enabledFlags = flags?.filter((f) => f.enabled).length || 0;
    const betaFlags =
      flags?.filter(
        (f) => f.rollout_percentage < 100 && f.rollout_percentage > 0,
      ).length || 0;

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
    logger.error('Feature Flags API Error:', error);
    return NextResponse.json(
      {
        flags: [],
        groupedFlags: {},
        stats: { total: 0, enabled: 0, disabled: 0, beta: 0 },
        meta: {
          generatedAt: new Date().toISOString(),
          error: 'Failed to fetch feature flags',
        },
      },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 401 });
    }

    if (!hasPermission(session, 'settings', 'update')) {
      return NextResponse.json({ error: 'Yetersiz yetki' }, { status: 403 });
    }

    const supabase = createServiceClient();
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

    // Audit log for feature flag creation
    await createAuditLog(
      session.admin.id,
      'feature_flag.create',
      'feature_flag',
      data.id,
      null,
      data,
      request.headers.get('x-forwarded-for') || undefined,
      request.headers.get('user-agent') || undefined,
    );

    return NextResponse.json({ flag: data });
  } catch (error) {
    logger.error('Create flag error:', error);
    return NextResponse.json(
      { error: 'Failed to create flag' },
      { status: 500 },
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 401 });
    }

    if (!hasPermission(session, 'settings', 'update')) {
      return NextResponse.json({ error: 'Yetersiz yetki' }, { status: 403 });
    }

    const supabase = createServiceClient();
    const body = await request.json();
    const { id, ...updates } = body;

    // Get old value for audit log
    const { data: oldFlag } = await supabase
      .from('feature_flags')
      .select('*')
      .eq('id', id)
      .single();

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

    // Audit log for feature flag update
    await createAuditLog(
      session.admin.id,
      'feature_flag.update',
      'feature_flag',
      id,
      oldFlag,
      data,
      request.headers.get('x-forwarded-for') || undefined,
      request.headers.get('user-agent') || undefined,
    );

    return NextResponse.json({ flag: data });
  } catch (error) {
    logger.error('Update flag error:', error);
    return NextResponse.json(
      { error: 'Failed to update flag' },
      { status: 500 },
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 401 });
    }

    // Only super_admin can delete feature flags
    if (session.admin.role !== 'super_admin') {
      return NextResponse.json(
        { error: 'Bu işlem için super_admin yetkisi gerekli' },
        { status: 403 },
      );
    }

    const supabase = createServiceClient();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Flag ID required' }, { status: 400 });
    }

    // Get old value for audit log
    const { data: oldFlag } = await supabase
      .from('feature_flags')
      .select('*')
      .eq('id', id)
      .single();

    const { error } = await supabase
      .from('feature_flags')
      .delete()
      .eq('id', id);

    if (error) {
      throw error;
    }

    // Audit log for feature flag deletion
    await createAuditLog(
      session.admin.id,
      'feature_flag.delete',
      'feature_flag',
      id,
      oldFlag,
      null,
      request.headers.get('x-forwarded-for') || undefined,
      request.headers.get('user-agent') || undefined,
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    logger.error('Delete flag error:', error);
    return NextResponse.json(
      { error: 'Failed to delete flag' },
      { status: 500 },
    );
  }
}

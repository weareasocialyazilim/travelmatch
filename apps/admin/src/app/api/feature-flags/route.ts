import { createServiceClient } from '@/lib/supabase';
import { getAdminSession, hasPermission, createAuditLog } from '@/lib/auth';
import { logger } from '@/lib/logger';
import { checkRateLimit, rateLimits, createRateLimitHeaders } from '@/lib/rate-limit';
import { NextRequest, NextResponse } from 'next/server';
import type { Database } from '@/types/database';

type FeatureFlagRow = Database['public']['Tables']['feature_flags']['Row'];

/**
 * Feature Flags API Endpoint
 * Manages feature flags for the application
 *
 * Security:
 * - Requires admin authentication
 * - Permission-based access control
 * - Rate limiting
 * - Audit logging for mutations
 */

// Helper to get client IP
function getClientIP(request: NextRequest): string {
  return (
    request.headers.get('x-forwarded-for')?.split(',')[0] ||
    request.headers.get('x-real-ip') ||
    'unknown'
  );
}

export async function GET(request: NextRequest) {
  try {
    // Rate limiting
    const ip = getClientIP(request);
    const rateLimit = await checkRateLimit(`feature-flags:${ip}`, rateLimits.api);

    if (!rateLimit.success) {
      return NextResponse.json(
        { error: 'Çok fazla istek', retryAfter: rateLimit.retryAfter },
        { status: 429, headers: createRateLimitHeaders(rateLimit) },
      );
    }

    // Authentication check
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json(
        { error: 'Yetkilendirme gerekli' },
        { status: 401 },
      );
    }

    // Permission check - require 'view' permission on 'settings' resource
    if (!hasPermission(session, 'settings', 'view')) {
      return NextResponse.json(
        { error: 'Bu işlem için yetkiniz bulunmuyor' },
        { status: 403 },
      );
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

    return NextResponse.json(
      {
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
      },
      { headers: createRateLimitHeaders(rateLimit) },
    );
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
    // Rate limiting for sensitive operations
    const ip = getClientIP(request);
    const rateLimit = await checkRateLimit(`feature-flags-create:${ip}`, rateLimits.sensitive);

    if (!rateLimit.success) {
      return NextResponse.json(
        { error: 'Çok fazla istek', retryAfter: rateLimit.retryAfter },
        { status: 429, headers: createRateLimitHeaders(rateLimit) },
      );
    }

    // Authentication check
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json(
        { error: 'Yetkilendirme gerekli' },
        { status: 401 },
      );
    }

    // Permission check - require 'create' permission on 'settings' resource
    if (!hasPermission(session, 'settings', 'create')) {
      return NextResponse.json(
        { error: 'Bu işlem için yetkiniz bulunmuyor' },
        { status: 403 },
      );
    }

    const supabase = createServiceClient();
    const body = await request.json();

    // Validate required fields
    if (!body.name || typeof body.name !== 'string' || body.name.trim().length === 0) {
      return NextResponse.json(
        { error: 'Flag adı gerekli' },
        { status: 400 },
      );
    }

    // Validate rollout percentage
    const rolloutPercentage = body.rollout_percentage ?? 100;
    if (rolloutPercentage < 0 || rolloutPercentage > 100) {
      return NextResponse.json(
        { error: 'Rollout yüzdesi 0-100 arasında olmalı' },
        { status: 400 },
      );
    }

    const { data, error } = await supabase
      .from('feature_flags')
      .insert({
        name: body.name.trim(),
        description: body.description?.trim() || null,
        enabled: body.enabled ?? false,
        category: body.category || 'general',
        rollout_percentage: rolloutPercentage,
        environments: body.environments || ['production'],
        metadata: body.metadata || {},
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    // Audit log
    await createAuditLog(
      session.admin.id,
      'feature_flag.create',
      'feature_flag',
      data.id,
      null,
      data,
      ip,
      request.headers.get('user-agent') || undefined,
    );

    return NextResponse.json(
      { flag: data },
      { headers: createRateLimitHeaders(rateLimit) },
    );
  } catch (error) {
    logger.error('Create flag error:', error);
    return NextResponse.json(
      { error: 'Flag oluşturulamadı' },
      { status: 500 },
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const ip = getClientIP(request);
    const rateLimit = await checkRateLimit(`feature-flags-update:${ip}`, rateLimits.sensitive);

    if (!rateLimit.success) {
      return NextResponse.json(
        { error: 'Çok fazla istek', retryAfter: rateLimit.retryAfter },
        { status: 429, headers: createRateLimitHeaders(rateLimit) },
      );
    }

    // Authentication check
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json(
        { error: 'Yetkilendirme gerekli' },
        { status: 401 },
      );
    }

    // Permission check
    if (!hasPermission(session, 'settings', 'update')) {
      return NextResponse.json(
        { error: 'Bu işlem için yetkiniz bulunmuyor' },
        { status: 403 },
      );
    }

    const supabase = createServiceClient();
    const body = await request.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Flag ID gerekli' },
        { status: 400 },
      );
    }

    // Get old value for audit
    const { data: oldFlag } = await supabase
      .from('feature_flags')
      .select('*')
      .eq('id', id)
      .single();

    // Validate rollout percentage if provided
    if (updates.rollout_percentage !== undefined) {
      if (updates.rollout_percentage < 0 || updates.rollout_percentage > 100) {
        return NextResponse.json(
          { error: 'Rollout yüzdesi 0-100 arasında olmalı' },
          { status: 400 },
        );
      }
    }

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

    // Audit log
    await createAuditLog(
      session.admin.id,
      'feature_flag.update',
      'feature_flag',
      id,
      oldFlag,
      data,
      ip,
      request.headers.get('user-agent') || undefined,
    );

    return NextResponse.json(
      { flag: data },
      { headers: createRateLimitHeaders(rateLimit) },
    );
  } catch (error) {
    logger.error('Update flag error:', error);
    return NextResponse.json(
      { error: 'Flag güncellenemedi' },
      { status: 500 },
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const ip = getClientIP(request);
    const rateLimit = await checkRateLimit(`feature-flags-delete:${ip}`, rateLimits.sensitive);

    if (!rateLimit.success) {
      return NextResponse.json(
        { error: 'Çok fazla istek', retryAfter: rateLimit.retryAfter },
        { status: 429, headers: createRateLimitHeaders(rateLimit) },
      );
    }

    // Authentication check
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json(
        { error: 'Yetkilendirme gerekli' },
        { status: 401 },
      );
    }

    // Permission check - require 'delete' permission
    if (!hasPermission(session, 'settings', 'delete')) {
      return NextResponse.json(
        { error: 'Bu işlem için yetkiniz bulunmuyor' },
        { status: 403 },
      );
    }

    const supabase = createServiceClient();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Flag ID gerekli' }, { status: 400 });
    }

    // Get old value for audit
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

    // Audit log
    await createAuditLog(
      session.admin.id,
      'feature_flag.delete',
      'feature_flag',
      id,
      oldFlag,
      null,
      ip,
      request.headers.get('user-agent') || undefined,
    );

    return NextResponse.json(
      { success: true },
      { headers: createRateLimitHeaders(rateLimit) },
    );
  } catch (error) {
    logger.error('Delete flag error:', error);
    return NextResponse.json(
      { error: 'Flag silinemedi' },
      { status: 500 },
    );
  }
}

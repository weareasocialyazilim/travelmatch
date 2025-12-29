import { logger } from '@/lib/logger';
/**
 * Compliance API Routes
 *
 * Handles SAR (Suspicious Activity Reports) and user risk management
 */

import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase';
import { getAdminSession, hasPermission, createAuditLog } from '@/lib/auth';

// =============================================================================
// GET - List SARs and Risk Profiles
// =============================================================================

export async function GET(request: NextRequest) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 401 });
    }

    if (!hasPermission(session, 'compliance', 'view')) {
      return NextResponse.json({ error: 'Yetersiz yetki' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'sar'; // 'sar' | 'risk_profiles' | 'aml_thresholds' | 'fraud_rules'
    const status = searchParams.get('status');
    const riskLevel = searchParams.get('risk_level');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    const supabase = createServiceClient();

    // Different queries based on type
    if (type === 'sar') {
      let query = supabase
        .from('suspicious_activity_reports')
        .select(
          `
          *,
          user:users!suspicious_activity_reports_user_id_fkey(
            id, email, kyc_status, created_at
          )
        `,
          { count: 'exact' }
        )
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (status) {
        query = query.eq('status', status);
      }

      const { data: reports, count, error } = await query;

      if (error) {
        logger.error('SAR query error:', error);
        return NextResponse.json(
          { error: 'SAR kayıtları yüklenemedi' },
          { status: 500 }
        );
      }

      return NextResponse.json({
        reports,
        total: count || 0,
        limit,
        offset,
      });
    }

    if (type === 'risk_profiles') {
      let query = supabase
        .from('user_risk_profiles')
        .select(
          `
          *,
          user:users!user_risk_profiles_user_id_fkey(
            id, email, kyc_status, created_at
          )
        `,
          { count: 'exact' }
        )
        .order('risk_score', { ascending: false })
        .range(offset, offset + limit - 1);

      if (riskLevel) {
        query = query.eq('risk_level', riskLevel);
      }

      const { data: profiles, count, error } = await query;

      if (error) {
        logger.error('Risk profiles query error:', error);
        return NextResponse.json(
          { error: 'Risk profilleri yüklenemedi' },
          { status: 500 }
        );
      }

      return NextResponse.json({
        profiles,
        total: count || 0,
        limit,
        offset,
      });
    }

    if (type === 'aml_thresholds') {
      const { data: thresholds, error } = await supabase
        .from('aml_thresholds')
        .select('*')
        .order('currency', { ascending: true })
        .order('risk_score', { ascending: false });

      if (error) {
        logger.error('AML thresholds query error:', error);
        return NextResponse.json(
          { error: 'AML eşikleri yüklenemedi' },
          { status: 500 }
        );
      }

      return NextResponse.json({ thresholds });
    }

    if (type === 'fraud_rules') {
      const { data: rules, error } = await supabase
        .from('fraud_rules')
        .select('*')
        .order('rule_type', { ascending: true })
        .order('risk_score', { ascending: false });

      if (error) {
        logger.error('Fraud rules query error:', error);
        return NextResponse.json(
          { error: 'Fraud kuralları yüklenemedi' },
          { status: 500 }
        );
      }

      return NextResponse.json({ rules });
    }

    return NextResponse.json({ error: 'Geçersiz tip' }, { status: 400 });
  } catch (error) {
    logger.error('Compliance GET error:', error);
    return NextResponse.json({ error: 'Bir hata oluştu' }, { status: 500 });
  }
}

// =============================================================================
// POST - Create SAR or Update Risk Profile
// =============================================================================

export async function POST(request: NextRequest) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 401 });
    }

    if (!hasPermission(session, 'compliance', 'create')) {
      return NextResponse.json({ error: 'Yetersiz yetki' }, { status: 403 });
    }

    const body = await request.json();
    const { action, ...data } = body;

    const supabase = createServiceClient();

    if (action === 'create_sar') {
      const { user_id, report_type, triggered_rules, risk_score, total_amount, currency } = data;

      const { data: sar, error } = await supabase
        .from('suspicious_activity_reports')
        .insert({
          user_id,
          report_type: report_type || 'sar',
          triggered_rules: triggered_rules || [],
          risk_score: risk_score || 0,
          total_amount,
          currency: currency || 'TRY',
          status: 'pending',
          assigned_to: session.admin.id,
        })
        .select()
        .single();

      if (error) {
        logger.error('SAR creation error:', error);
        return NextResponse.json(
          { error: 'SAR oluşturulamadı' },
          { status: 500 }
        );
      }

      await createAuditLog(
        session.admin.id,
        'create_sar',
        'suspicious_activity_reports',
        sar.id,
        null,
        sar,
        request.headers.get('x-forwarded-for') || undefined,
        request.headers.get('user-agent') || undefined
      );

      return NextResponse.json({ sar }, { status: 201 });
    }

    if (action === 'block_user') {
      const { user_id, block_reason } = data;

      const { error } = await supabase
        .from('user_risk_profiles')
        .upsert({
          user_id,
          is_blocked: true,
          block_reason,
          blocked_at: new Date().toISOString(),
        });

      if (error) {
        logger.error('User block error:', error);
        return NextResponse.json(
          { error: 'Kullanıcı engellenemedi' },
          { status: 500 }
        );
      }

      await createAuditLog(
        session.admin.id,
        'block_user',
        'user_risk_profiles',
        user_id,
        { is_blocked: false },
        { is_blocked: true, block_reason },
        request.headers.get('x-forwarded-for') || undefined,
        request.headers.get('user-agent') || undefined
      );

      return NextResponse.json({ success: true });
    }

    if (action === 'unblock_user') {
      const { user_id } = data;

      const { error } = await supabase
        .from('user_risk_profiles')
        .update({
          is_blocked: false,
          block_reason: null,
          blocked_at: null,
        })
        .eq('user_id', user_id);

      if (error) {
        logger.error('User unblock error:', error);
        return NextResponse.json(
          { error: 'Kullanıcı engeli kaldırılamadı' },
          { status: 500 }
        );
      }

      await createAuditLog(
        session.admin.id,
        'unblock_user',
        'user_risk_profiles',
        user_id,
        { is_blocked: true },
        { is_blocked: false },
        request.headers.get('x-forwarded-for') || undefined,
        request.headers.get('user-agent') || undefined
      );

      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Geçersiz işlem' }, { status: 400 });
  } catch (error) {
    logger.error('Compliance POST error:', error);
    return NextResponse.json({ error: 'Bir hata oluştu' }, { status: 500 });
  }
}

// =============================================================================
// PATCH - Update SAR Status
// =============================================================================

export async function PATCH(request: NextRequest) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 401 });
    }

    if (!hasPermission(session, 'compliance', 'update')) {
      return NextResponse.json({ error: 'Yetersiz yetki' }, { status: 403 });
    }

    const body = await request.json();
    const { id, status, investigation_notes, reported_to } = body;

    if (!id) {
      return NextResponse.json({ error: 'SAR ID gerekli' }, { status: 400 });
    }

    const supabase = createServiceClient();

    // Get current state
    const { data: currentSar } = await supabase
      .from('suspicious_activity_reports')
      .select('*')
      .eq('id', id)
      .single();

    const updateData: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };

    if (status) {
      updateData.status = status;
      if (status === 'reported') {
        updateData.reported_at = new Date().toISOString();
      }
      if (status === 'cleared' || status === 'confirmed') {
        updateData.resolved_at = new Date().toISOString();
      }
    }

    if (investigation_notes !== undefined) {
      updateData.investigation_notes = investigation_notes;
    }

    if (reported_to) {
      updateData.reported_to = reported_to;
    }

    const { data: sar, error } = await supabase
      .from('suspicious_activity_reports')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      logger.error('SAR update error:', error);
      return NextResponse.json(
        { error: 'SAR güncellenemedi' },
        { status: 500 }
      );
    }

    await createAuditLog(
      session.admin.id,
      'update_sar',
      'suspicious_activity_reports',
      id,
      currentSar,
      sar,
      request.headers.get('x-forwarded-for') || undefined,
      request.headers.get('user-agent') || undefined
    );

    return NextResponse.json({ sar });
  } catch (error) {
    logger.error('Compliance PATCH error:', error);
    return NextResponse.json({ error: 'Bir hata oluştu' }, { status: 500 });
  }
}

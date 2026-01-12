import { logger } from '@/lib/logger';
import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase';
import { getAdminSession, hasPermission, createAuditLog } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 401 });
    }

    if (!hasPermission(session, 'users', 'view')) {
      return NextResponse.json({ error: 'Yetersiz yetki' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const userId = searchParams.get('user_id');
    const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 100);
    const offset = Math.max(parseInt(searchParams.get('offset') || '0'), 0);

    const supabase = createServiceClient();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let query = (supabase.from('kyc_submissions') as any)
      .select(
        `
        *,
        user:users!kyc_submissions_user_id_fkey(
          id,
          display_name,
          avatar_url,
          email,
          phone,
          created_at,
          kyc_status
        ),
        reviewed_by_admin:admin_users!kyc_submissions_reviewed_by_fkey(id, name)
      `,
        { count: 'exact' },
      )
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (status) {
      query = query.eq('status', status);
    } else {
      // Default to showing pending submissions
      query = query.eq('status', 'pending');
    }

    if (userId) {
      query = query.eq('user_id', userId);
    }

    const { data: submissions, count, error } = await query;

    if (error) {
      logger.error('KYC query error:', error);
      // If table doesn't exist, query users for KYC status
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const usersQuery = (supabase.from('users') as any)
        .select(
          'id, display_name, avatar_url, email, phone, kyc_status, kyc_submitted_at, kyc_reviewed_at, created_at',
          { count: 'exact' },
        )
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (status === 'pending') {
        usersQuery.eq('kyc_status', 'pending');
      } else if (status) {
        usersQuery.eq('kyc_status', status);
      }

      const {
        data: users,
        count: userCount,
        error: userError,
      } = await usersQuery;

      if (userError) {
        return NextResponse.json(
          { error: 'KYC verileri yüklenemedi' },
          { status: 500 },
        );
      }

      type UserKyc = {
        id: string;
        kyc_status?: string;
        kyc_submitted_at?: string;
        kyc_reviewed_at?: string;
        created_at: string;
        display_name?: string;
        avatar_url?: string;
        email?: string;
        phone?: string;
      };
      return NextResponse.json({
        submissions: users?.map((p: UserKyc) => ({
          id: p.id,
          user_id: p.id,
          status: p.kyc_status,
          created_at: p.kyc_submitted_at || p.created_at,
          reviewed_at: p.kyc_reviewed_at,
          user: {
            id: p.id,
            display_name: p.display_name,
            avatar_url: p.avatar_url,
            email: p.email,
            phone: p.phone,
          },
        })),
        total: userCount || 0,
        limit,
        offset,
      });
    }

    // Calculate summary
    type Submission = { status?: string };
    const summary = {
      total: count || 0,
      pending:
        submissions?.filter((s: Submission) => s.status === 'pending').length ||
        0,
      approved:
        submissions?.filter(
          (s: Submission) => s.status === 'approved' || s.status === 'verified',
        ).length || 0,
      rejected:
        submissions?.filter((s: Submission) => s.status === 'rejected')
          .length || 0,
    };

    return NextResponse.json({
      submissions,
      summary,
      total: count || 0,
      limit,
      offset,
    });
  } catch (error) {
    logger.error('KYC GET error:', error);
    return NextResponse.json({ error: 'Bir hata oluştu' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 401 });
    }

    if (!hasPermission(session, 'users', 'update')) {
      return NextResponse.json({ error: 'Yetersiz yetki' }, { status: 403 });
    }

    const body = await request.json();
    const { user_id, action, rejection_reason, notes } = body;

    if (!user_id || !action) {
      return NextResponse.json(
        { error: 'user_id ve action gerekli' },
        { status: 400 },
      );
    }

    if (!['approve', 'reject'].includes(action)) {
      return NextResponse.json(
        { error: 'Geçersiz action. Geçerli değerler: approve, reject' },
        { status: 400 },
      );
    }

    if (action === 'reject' && !rejection_reason) {
      return NextResponse.json(
        { error: 'Reddetme sebebi gerekli' },
        { status: 400 },
      );
    }

    const supabase = createServiceClient();

    // Get current user data
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: profile, error: fetchError } = await (
      supabase.from('users') as any
    )
      .select('*')
      .eq('id', user_id)
      .single();

    if (fetchError || !profile) {
      return NextResponse.json(
        { error: 'Kullanıcı bulunamadı' },
        { status: 404 },
      );
    }

    // Update profile KYC status
    const updates: Record<string, unknown> = {
      kyc_status: action === 'approve' ? 'verified' : 'rejected',
      kyc_reviewed_at: new Date().toISOString(),
      kyc_reviewed_by: session.admin.id,
      is_verified: action === 'approve',
    };

    if (action === 'reject') {
      updates.kyc_rejection_reason = rejection_reason;
    }

    if (notes) {
      updates.kyc_admin_notes = notes;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: updated, error: updateError } = await (
      supabase.from('users') as any
    )
      .update(updates)
      .eq('id', user_id)
      .select()
      .single();

    if (updateError) {
      logger.error('KYC update error:', updateError);
      return NextResponse.json(
        { error: 'KYC güncellenemedi' },
        { status: 500 },
      );
    }

    // Try to update kyc_submissions table if it exists
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase.from('kyc_submissions') as any)
      .update({
        status: action === 'approve' ? 'approved' : 'rejected',
        reviewed_by: session.admin.id,
        reviewed_at: new Date().toISOString(),
        rejection_reason: action === 'reject' ? rejection_reason : null,
        notes,
      })
      .eq('user_id', user_id)
      .eq('status', 'pending');

    // Create audit log
    await createAuditLog(
      session.admin.id,
      action === 'approve' ? 'approve_kyc' : 'reject_kyc',
      'user',
      user_id,
      { kyc_status: profile.kyc_status },
      { kyc_status: updates.kyc_status },
      request.headers.get('x-forwarded-for') || undefined,
      request.headers.get('user-agent') || undefined,
    );

    return NextResponse.json({
      user: updated,
      message: action === 'approve' ? 'KYC onaylandı' : 'KYC reddedildi',
    });
  } catch (error) {
    logger.error('KYC PUT error:', error);
    return NextResponse.json({ error: 'Bir hata oluştu' }, { status: 500 });
  }
}

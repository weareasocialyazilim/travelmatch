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

    if (!hasPermission(session, 'moments', 'view')) {
      return NextResponse.json({ error: 'Yetersiz yetki' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const type = searchParams.get('type');
    const userId = searchParams.get('user_id');
    const momentId = searchParams.get('moment_id');
    const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 100);
    const offset = Math.max(parseInt(searchParams.get('offset') || '0'), 0);

    const supabase = createServiceClient();

    let query = supabase
      .from('proofs')
      .select(
        `
        *,
        user:users!proofs_user_id_fkey(id, display_name, avatar_url, email),
        moment:moments(id, title, price, user_id),
        verified_by_admin:admin_users!proofs_verified_by_fkey(id, name)
      `,
        { count: 'exact' }
      )
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (status) {
      query = query.eq('status', status);
    } else {
      // Default to showing pending proofs
      query = query.eq('status', 'pending');
    }

    if (type) {
      query = query.eq('type', type);
    }

    if (userId) {
      query = query.eq('user_id', userId);
    }

    if (momentId) {
      query = query.eq('moment_id', momentId);
    }

    const { data: proofs, count, error } = await query;

    if (error) {
      logger.error('Proofs query error:', error);
      return NextResponse.json({ error: 'Kanıtlar yüklenemedi' }, { status: 500 });
    }

    // Calculate summary
    type Proof = { status?: string; type?: string };
    const summary = {
      total: count || 0,
      pending: proofs?.filter((p: Proof) => p.status === 'pending').length || 0,
      verified: proofs?.filter((p: Proof) => p.status === 'verified').length || 0,
      rejected: proofs?.filter((p: Proof) => p.status === 'rejected').length || 0,
      byType: {
        'micro-kindness': proofs?.filter((p: Proof) => p.type === 'micro-kindness').length || 0,
        'verified-experience': proofs?.filter((p: Proof) => p.type === 'verified-experience').length || 0,
        'community-proof': proofs?.filter((p: Proof) => p.type === 'community-proof').length || 0,
        'milestone': proofs?.filter((p: Proof) => p.type === 'milestone').length || 0,
      },
    };

    return NextResponse.json({
      proofs,
      summary,
      total: count || 0,
      limit,
      offset,
    });
  } catch (error) {
    logger.error('Proofs GET error:', error);
    return NextResponse.json({ error: 'Bir hata oluştu' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 401 });
    }

    if (!hasPermission(session, 'moments', 'update')) {
      return NextResponse.json({ error: 'Yetersiz yetki' }, { status: 403 });
    }

    const body = await request.json();
    const { proof_id, action, rejection_reason } = body;

    if (!proof_id || !action) {
      return NextResponse.json(
        { error: 'proof_id ve action gerekli' },
        { status: 400 }
      );
    }

    if (!['verify', 'reject'].includes(action)) {
      return NextResponse.json(
        { error: 'Geçersiz action. Geçerli değerler: verify, reject' },
        { status: 400 }
      );
    }

    if (action === 'reject' && !rejection_reason) {
      return NextResponse.json(
        { error: 'Reddetme sebebi gerekli' },
        { status: 400 }
      );
    }

    const supabase = createServiceClient();

    // Get current proof
    const { data: proof, error: fetchError } = await supabase
      .from('proofs')
      .select('*')
      .eq('id', proof_id)
      .single();

    if (fetchError || !proof) {
      return NextResponse.json({ error: 'Kanıt bulunamadı' }, { status: 404 });
    }

    if (proof.status !== 'pending') {
      return NextResponse.json(
        { error: 'Bu işlem sadece bekleyen kanıtlar için yapılabilir' },
        { status: 400 }
      );
    }

    const updates: Record<string, unknown> = {
      status: action === 'verify' ? 'verified' : 'rejected',
      verified_by: session.admin.id,
      verified_at: new Date().toISOString(),
    };

    if (action === 'reject') {
      updates.rejection_reason = rejection_reason;
    }

    const { data: updated, error: updateError } = await supabase
      .from('proofs')
      .update(updates)
      .eq('id', proof_id)
      .select()
      .single();

    if (updateError) {
      logger.error('Proof update error:', updateError);
      return NextResponse.json({ error: 'Kanıt güncellenemedi' }, { status: 500 });
    }

    // Create audit log
    await createAuditLog(
      session.admin.id,
      action === 'verify' ? 'verify_proof' : 'reject_proof',
      'proof',
      proof_id,
      proof,
      updated,
      request.headers.get('x-forwarded-for') || undefined,
      request.headers.get('user-agent') || undefined
    );

    return NextResponse.json({ proof: updated, message: 'İşlem başarılı' });
  } catch (error) {
    logger.error('Proofs PUT error:', error);
    return NextResponse.json({ error: 'Bir hata oluştu' }, { status: 500 });
  }
}

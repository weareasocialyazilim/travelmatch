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

    if (!hasPermission(session, 'transactions', 'view')) {
      return NextResponse.json({ error: 'Yetersiz yetki' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const userId = searchParams.get('user_id');
    const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 100);
    const offset = Math.max(parseInt(searchParams.get('offset') || '0'), 0);

    const supabase = createServiceClient();

    let query = supabase
      .from('escrow_transactions')
      .select(
        `
        *,
        sender:users!escrow_transactions_sender_id_fkey(id, display_name, avatar_url, email),
        recipient:users!escrow_transactions_recipient_id_fkey(id, display_name, avatar_url, email),
        moment:moments(id, title, price)
      `,
        { count: 'exact' },
      )
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (status) {
      query = query.eq('status', status);
    }

    if (userId) {
      query = query.or(`sender_id.eq.${userId},recipient_id.eq.${userId}`);
    }

    const { data: escrowTransactions, count, error } = await query;

    if (error) {
      logger.error('Escrow query error:', error);
      return NextResponse.json(
        { error: 'Escrow işlemleri yüklenemedi' },
        { status: 500 },
      );
    }

    // Calculate summary
    type EscrowTransaction = { status?: string; amount?: number };
    const summary = {
      total: count || 0,
      pending:
        escrowTransactions?.filter(
          (e: EscrowTransaction) => e.status === 'pending',
        ).length || 0,
      released:
        escrowTransactions?.filter(
          (e: EscrowTransaction) => e.status === 'released',
        ).length || 0,
      refunded:
        escrowTransactions?.filter(
          (e: EscrowTransaction) => e.status === 'refunded',
        ).length || 0,
      expired:
        escrowTransactions?.filter(
          (e: EscrowTransaction) => e.status === 'expired',
        ).length || 0,
      totalAmount:
        escrowTransactions?.reduce(
          (sum: number, e: EscrowTransaction) => sum + (e.amount || 0),
          0,
        ) || 0,
      pendingAmount:
        escrowTransactions
          ?.filter((e: EscrowTransaction) => e.status === 'pending')
          .reduce(
            (sum: number, e: EscrowTransaction) => sum + (e.amount || 0),
            0,
          ) || 0,
    };

    return NextResponse.json({
      escrowTransactions,
      summary,
      total: count || 0,
      limit,
      offset,
    });
  } catch (error) {
    logger.error('Escrow GET error:', error);
    return NextResponse.json({ error: 'Bir hata oluştu' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 401 });
    }

    if (!hasPermission(session, 'transactions', 'update')) {
      return NextResponse.json({ error: 'Yetersiz yetki' }, { status: 403 });
    }

    const body = await request.json();
    const { escrow_id, action, reason } = body;

    if (!escrow_id || !action) {
      return NextResponse.json(
        { error: 'escrow_id ve action gerekli' },
        { status: 400 },
      );
    }

    if (!['release', 'refund', 'extend'].includes(action)) {
      return NextResponse.json(
        { error: 'Geçersiz action. Geçerli değerler: release, refund, extend' },
        { status: 400 },
      );
    }

    const supabase = createServiceClient();

    // Get current escrow transaction
    const { data: escrow, error: fetchError } = await supabase
      .from('escrow_transactions')
      .select('*')
      .eq('id', escrow_id)
      .single();

    if (fetchError || !escrow) {
      return NextResponse.json(
        { error: 'Escrow işlemi bulunamadı' },
        { status: 404 },
      );
    }

    if (escrow.status !== 'pending') {
      return NextResponse.json(
        { error: "Bu işlem sadece bekleyen escrow'lar için yapılabilir" },
        { status: 400 },
      );
    }

    let updates: Record<string, unknown> = {};
    let auditAction = '';

    switch (action) {
      case 'release':
        updates = {
          status: 'released',
          released_at: new Date().toISOString(),
          released_by: session.admin.id,
          admin_notes: reason,
        };
        auditAction = 'release_escrow';
        break;

      case 'refund':
        updates = {
          status: 'refunded',
          refunded_at: new Date().toISOString(),
          refunded_by: session.admin.id,
          refund_reason: reason,
          admin_notes: reason,
        };
        auditAction = 'refund_escrow';
        break;

      case 'extend':
        const newExpiry = new Date();
        newExpiry.setDate(newExpiry.getDate() + 7); // Extend by 7 days
        updates = {
          expires_at: newExpiry.toISOString(),
          admin_notes: reason,
        };
        auditAction = 'extend_escrow';
        break;
    }

    const { data: updated, error: updateError } = await supabase
      .from('escrow_transactions')
      .update(updates)
      .eq('id', escrow_id)
      .select()
      .single();

    if (updateError) {
      logger.error('Escrow update error:', updateError);
      return NextResponse.json(
        { error: 'Escrow güncellenemedi' },
        { status: 500 },
      );
    }

    // Create audit log
    await createAuditLog(
      session.admin.id,
      auditAction,
      'escrow_transaction',
      escrow_id,
      escrow,
      updated,
      request.headers.get('x-forwarded-for') || undefined,
      request.headers.get('user-agent') || undefined,
    );

    return NextResponse.json({ escrow: updated, message: 'İşlem başarılı' });
  } catch (error) {
    logger.error('Escrow POST error:', error);
    return NextResponse.json({ error: 'Bir hata oluştu' }, { status: 500 });
  }
}

import { logger } from '@/lib/logger';
import { NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase';
import { getAdminSession, hasPermission } from '@/lib/auth';

/**
 * GET /api/escrow/stats
 * Fetch escrow and payment statistics
 */
export async function GET() {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: 'Oturum bulunamadı' }, { status: 401 });
    }

    if (!hasPermission(session, 'transactions', 'view')) {
      return NextResponse.json(
        { error: 'Bu işlem için yetkiniz yok' },
        { status: 403 },
      );
    }

    const supabase = createServiceClient();
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayISO = today.toISOString();

    // Get escrow stats (real data)
    const [
      totalEscrowResult,
      pendingReleaseResult,
      releasedTodayResult,
      refundedTodayResult,
      activeCountResult,
      disputedCountResult,
      releasedCountResult,
      totalCountResult,
      durationResult,
    ] = await Promise.all([
      // Total escrow amount (funds currently held)
      supabase
        .from('escrow_transactions')
        .select('amount')
        .in('status', ['pending', 'disputed']),
      // Pending release (proof verified but still pending)
      supabase
        .from('escrow_transactions')
        .select('amount')
        .eq('status', 'pending')
        .eq('proof_verified', true),
      // Released today
      supabase
        .from('escrow_transactions')
        .select('amount')
        .eq('status', 'released')
        .gte('released_at', todayISO),
      // Refunded today
      supabase
        .from('escrow_transactions')
        .select('amount')
        .eq('status', 'refunded')
        .gte('refunded_at', todayISO),
      // Active transaction count
      supabase
        .from('escrow_transactions')
        .select('id', { count: 'exact', head: true })
        .in('status', ['pending', 'disputed']),
      // Disputed count
      supabase
        .from('escrow_transactions')
        .select('id', { count: 'exact', head: true })
        .eq('status', 'disputed'),
      // Released count
      supabase
        .from('escrow_transactions')
        .select('id', { count: 'exact', head: true })
        .eq('status', 'released'),
      // Total count
      supabase
        .from('escrow_transactions')
        .select('id', { count: 'exact', head: true }),
      // Duration samples for completed escrows
      supabase
        .from('escrow_transactions')
        .select('created_at, released_at, refunded_at')
        .in('status', ['released', 'refunded']),
    ]);

    const sumAmounts = (data: { amount: number }[] | null) =>
      (data || []).reduce((sum, item) => sum + (item.amount || 0), 0);

    // Get payment stats
    const [
      todayVolumeResult,
      todayTransactionsResult,
      failedTodayResult,
      subscriptionResult,
      giftResult,
      pendingKycResult,
    ] = await Promise.all([
      // Today's volume
      supabase
        .from('transactions')
        .select('amount')
        .eq('status', 'completed')
        .gte('created_at', todayISO),
      // Today's transaction count
      supabase
        .from('transactions')
        .select('id', { count: 'exact', head: true })
        .gte('created_at', todayISO),
      // Failed today
      supabase
        .from('transactions')
        .select('id', { count: 'exact', head: true })
        .eq('status', 'failed')
        .gte('created_at', todayISO),
      // Subscription revenue
      supabase
        .from('transactions')
        .select('amount')
        .eq('type', 'subscription')
        .eq('status', 'completed')
        .gte('created_at', todayISO),
      // Gift revenue
      supabase
        .from('transactions')
        .select('amount')
        .eq('type', 'gift')
        .eq('status', 'completed')
        .gte('created_at', todayISO),
      // Pending KYC count
      supabase
        .from('kyc_verifications')
        .select('id', { count: 'exact', head: true })
        .in('status', ['pending', 'in_review']),
    ]);

    const todayVolume = sumAmounts(todayVolumeResult.data);
    const todayTransactions = todayTransactionsResult.count || 0;
    const failedTransactions = failedTodayResult.count || 0;
    const successRate =
      todayTransactions > 0
        ? (
            ((todayTransactions - failedTransactions) / todayTransactions) *
            100
          ).toFixed(1)
        : '100.0';

    const totalEscrowCount = totalCountResult.count || 0;
    const disputedCount = disputedCountResult.count || 0;
    const releasedCount = releasedCountResult.count || 0;

    const avgEscrowDurationDays = (() => {
      const rows = durationResult.data || [];
      if (rows.length === 0) return 0;
      const totalMs = rows.reduce((sum, row) => {
        const createdAt = row.created_at
          ? new Date(row.created_at).getTime()
          : 0;
        const completedAt = row.released_at
          ? new Date(row.released_at).getTime()
          : row.refunded_at
            ? new Date(row.refunded_at).getTime()
            : 0;
        if (!createdAt || !completedAt) return sum;
        return sum + (completedAt - createdAt);
      }, 0);
      const avgMs = totalMs / rows.length;
      return avgMs > 0 ? Number((avgMs / (1000 * 60 * 60 * 24)).toFixed(2)) : 0;
    })();

    const disputeRate =
      totalEscrowCount > 0
        ? Number(((disputedCount / totalEscrowCount) * 100).toFixed(1))
        : 0;

    const escrowSuccessRate =
      totalEscrowCount > 0
        ? Number(((releasedCount / totalEscrowCount) * 100).toFixed(1))
        : 0;

    return NextResponse.json({
      escrow: {
        totalEscrow: sumAmounts(totalEscrowResult.data),
        pendingRelease: sumAmounts(pendingReleaseResult.data),
        releasedToday: sumAmounts(releasedTodayResult.data),
        refundedToday: sumAmounts(refundedTodayResult.data),
        activeTransactions: activeCountResult.count || 0,
        avgEscrowDuration: avgEscrowDurationDays,
        disputeRate,
        successRate: escrowSuccessRate,
      },
      payment: {
        todayVolume,
        todayTransactions,
        avgTransactionValue:
          todayTransactions > 0
            ? Math.round(todayVolume / todayTransactions)
            : 0,
        successRate: parseFloat(successRate),
        failedTransactions,
        pendingKYC: pendingKycResult.count || 0,
        subscriptionRevenue: sumAmounts(subscriptionResult.data),
        giftRevenue: sumAmounts(giftResult.data),
      },
    });
  } catch (error) {
    logger.error('Escrow stats API error:', error);
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 });
  }
}

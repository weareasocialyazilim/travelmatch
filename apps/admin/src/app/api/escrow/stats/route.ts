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
      return NextResponse.json(
        { error: 'Oturum bulunamadı' },
        { status: 401 }
      );
    }

    if (!hasPermission(session, 'transactions', 'view')) {
      return NextResponse.json(
        { error: 'Bu işlem için yetkiniz yok' },
        { status: 403 }
      );
    }

    const supabase = createServiceClient();
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayISO = today.toISOString();

    // Get escrow stats
    const [
      totalEscrowResult,
      pendingReleaseResult,
      releasedTodayResult,
      refundedTodayResult,
      activeCountResult,
    ] = await Promise.all([
      // Total escrow amount (funds currently held)
      supabase
        .from('escrows')
        .select('amount')
        .in('status', ['awaiting_proof', 'proof_submitted', 'ready_to_release']),
      // Pending release (ready to release)
      supabase
        .from('escrows')
        .select('amount')
        .eq('status', 'ready_to_release'),
      // Released today
      supabase
        .from('escrows')
        .select('amount')
        .eq('status', 'released')
        .gte('released_at', todayISO),
      // Refunded today
      supabase
        .from('escrows')
        .select('amount')
        .eq('status', 'refunded')
        .gte('refunded_at', todayISO),
      // Active transaction count
      supabase
        .from('escrows')
        .select('id', { count: 'exact', head: true })
        .in('status', ['awaiting_proof', 'proof_submitted', 'ready_to_release', 'disputed']),
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
    ]);

    const todayVolume = sumAmounts(todayVolumeResult.data);
    const todayTransactions = todayTransactionsResult.count || 0;
    const failedTransactions = failedTodayResult.count || 0;
    const successRate = todayTransactions > 0
      ? ((todayTransactions - failedTransactions) / todayTransactions * 100).toFixed(1)
      : '100.0';

    return NextResponse.json({
      escrow: {
        totalEscrow: sumAmounts(totalEscrowResult.data),
        pendingRelease: sumAmounts(pendingReleaseResult.data),
        releasedToday: sumAmounts(releasedTodayResult.data),
        refundedToday: sumAmounts(refundedTodayResult.data),
        activeTransactions: activeCountResult.count || 0,
        avgEscrowDuration: 3.2, // TODO: Calculate from actual data
        disputeRate: 2.3, // TODO: Calculate from actual data
        successRate: 97.7, // TODO: Calculate from actual data
      },
      payment: {
        todayVolume,
        todayTransactions,
        avgTransactionValue: todayTransactions > 0 ? Math.round(todayVolume / todayTransactions) : 0,
        successRate: parseFloat(successRate),
        failedTransactions,
        pendingKYC: 0, // TODO: Add KYC pending count
        subscriptionRevenue: sumAmounts(subscriptionResult.data),
        giftRevenue: sumAmounts(giftResult.data),
      },
    });
  } catch (error) {
    logger.error('Escrow stats API error:', error);
    return NextResponse.json(
      { error: 'Sunucu hatası' },
      { status: 500 }
    );
  }
}

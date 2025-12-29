/**
 * VIP Users Stats API
 *
 * GET - Get VIP statistics
 */

import { NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase';
import { getAdminSession, hasPermission } from '@/lib/auth';

export async function GET() {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 401 });
    }

    if (!hasPermission(session, 'users', 'view')) {
      return NextResponse.json({ error: 'Yetersiz yetki' }, { status: 403 });
    }

    const supabase = createServiceClient();

    // Get counts by tier
    const [vipResult, influencerResult, partnerResult] = await Promise.all([
      supabase
        .from('user_commission_settings')
        .select('id', { count: 'exact', head: true })
        .eq('tier', 'vip'),
      supabase
        .from('user_commission_settings')
        .select('id', { count: 'exact', head: true })
        .eq('tier', 'influencer'),
      supabase
        .from('user_commission_settings')
        .select('id', { count: 'exact', head: true })
        .eq('tier', 'partner'),
    ]);

    // Calculate commission saved this month
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const { data: commissionData } = await supabase
      .from('commission_ledger')
      .select('total_commission, base_amount')
      .gte('created_at', startOfMonth.toISOString())
      .eq('status', 'collected')
      .not('giver_id', 'is', null);

    // Calculate theoretical commission vs actual
    let commissionSaved = 0;
    if (commissionData) {
      for (const entry of commissionData) {
        // Theoretical commission (10% for amounts < 100, 8% for >= 100)
        const theoreticalRate = entry.base_amount < 100 ? 0.1 : 0.08;
        const theoreticalCommission = entry.base_amount * theoreticalRate;
        const actualCommission = entry.total_commission || 0;
        commissionSaved += theoreticalCommission - actualCommission;
      }
    }

    return NextResponse.json({
      totalVIP: vipResult.count || 0,
      totalInfluencer: influencerResult.count || 0,
      totalPartner: partnerResult.count || 0,
      commissionSaved: Math.max(0, commissionSaved),
    });
  } catch (error) {
    console.error('VIP stats error:', error);
    return NextResponse.json({ error: 'Bir hata oluştu' }, { status: 500 });
  }
}

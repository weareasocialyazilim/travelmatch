import { NextResponse } from 'next/server';
import { getAdminSession, hasPermission } from '@/lib/auth';

/**
 * Referrals API - Placeholder
 * Returns empty data until referral system is implemented
 */

export async function GET() {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 401 });
    }

    if (!hasPermission(session, 'users', 'view')) {
      return NextResponse.json({ error: 'Yetersiz yetki' }, { status: 403 });
    }

    // Return empty data - referral system not yet implemented
    return NextResponse.json({
      referrals: [],
      stats: {
        total_referrals: 0,
        successful_referrals: 0,
        pending_referrals: 0,
        total_rewards_paid: 0,
      },
      total: 0,
      limit: 50,
      offset: 0,
    });
  } catch {
    return NextResponse.json({ error: 'Bir hata oluştu' }, { status: 500 });
  }
}

import { logger } from '@/lib/logger';
import { NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/auth';

/**
 * GET /api/auth/session
 * Server-side session check - returns current admin user if authenticated
 * Uses service role key to bypass RLS safely
 */
export async function GET() {
  try {
    const session = await getAdminSession();

    if (!session) {
      return NextResponse.json({ user: null }, { status: 200 });
    }

    return NextResponse.json({
      user: session.admin,
      permissions: session.permissions,
    });
  } catch (error) {
    logger.error('Session check error:', error);
    return NextResponse.json({ user: null }, { status: 200 });
  }
}

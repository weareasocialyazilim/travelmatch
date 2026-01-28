import { NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/auth';

/**
 * GET /api/admin/me
 * Returns current admin session info (for client-side use)
 */
export async function GET() {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    return NextResponse.json({
      id: session.admin.id,
      email: session.admin.email,
      name: session.admin.name,
      role: session.admin.role,
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to get admin info' },
      { status: 500 },
    );
  }
}

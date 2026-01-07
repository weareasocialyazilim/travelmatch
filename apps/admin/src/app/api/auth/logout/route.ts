import { logger } from '@/lib/logger';
import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase';
import { cookies } from 'next/headers';
import crypto from 'crypto';

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get('admin_session')?.value;

    if (sessionToken) {
      const supabase = createServiceClient();
      const sessionHash = crypto
        .createHash('sha256')
        .update(sessionToken)
        .digest('hex');

      // Delete the session
      await supabase
        .from('admin_sessions')
        .delete()
        .eq('token_hash', sessionHash);
    }

    // Clear the cookie
    const response = NextResponse.json({ success: true });
    response.cookies.delete('admin_session');

    return response;
  } catch (error) {
    logger.error('Logout error:', error);
    return NextResponse.json(
      { error: 'Çıkış yapılırken bir hata oluştu' },
      { status: 500 },
    );
  }
}

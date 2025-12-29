import { logger } from '@/lib/logger';
import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase';
import { cookies } from 'next/headers';
import { authenticator } from 'otplib';
import crypto from 'crypto';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email ve şifre gerekli' },
        { status: 400 }
      );
    }

    const supabase = createServiceClient();

    // Find admin user by email
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: adminUserData, error: userError } = await (supabase as any)
      .from('admin_users')
      .select('*')
      .eq('email', email)
      .eq('is_active', true)
      .single();

    if (userError || !adminUserData) {
      return NextResponse.json(
        { error: 'Geçersiz kimlik bilgileri' },
        { status: 401 }
      );
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const adminUser = adminUserData as any;

    // Authenticate with Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      return NextResponse.json(
        { error: 'Geçersiz kimlik bilgileri' },
        { status: 401 }
      );
    }

    // Check if 2FA is required
    if (adminUser.totp_enabled) {
      // Create temporary session token for 2FA verification
      const tempToken = crypto.randomBytes(32).toString('hex');
      const tokenHash = crypto.createHash('sha256').update(tempToken).digest('hex');

      // Store temp session
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (supabase as any).from('admin_sessions').insert({
        admin_id: adminUser.id,
        token_hash: tokenHash,
        ip_address: request.headers.get('x-forwarded-for') || request.ip,
        user_agent: request.headers.get('user-agent'),
        expires_at: new Date(Date.now() + 5 * 60 * 1000).toISOString(), // 5 minutes for 2FA
      });

      return NextResponse.json({
        requires_2fa: true,
        temp_token: tempToken,
        admin_id: adminUser.id,
      });
    }

    // Create session token
    const sessionToken = crypto.randomBytes(32).toString('hex');
    const sessionHash = crypto.createHash('sha256').update(sessionToken).digest('hex');

    // Store session
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase as any).from('admin_sessions').insert({
      admin_id: adminUser.id,
      token_hash: sessionHash,
      ip_address: request.headers.get('x-forwarded-for') || request.ip,
      user_agent: request.headers.get('user-agent'),
      expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours
    });

    // Update last login
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase as any)
      .from('admin_users')
      .update({ last_login_at: new Date().toISOString() })
      .eq('id', adminUser.id);

    // Set session cookie with strict security settings
    const cookieStore = await cookies();
    cookieStore.set('admin_session', sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict', // Strict for admin panel to prevent CSRF
      maxAge: 24 * 60 * 60, // 24 hours
      path: '/',
    });

    // Get role permissions
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: permissions } = await (supabase as any)
      .from('role_permissions')
      .select('resource, action')
      .eq('role', adminUser.role);

    return NextResponse.json({
      user: {
        id: adminUser.id,
        email: adminUser.email,
        name: adminUser.name,
        avatar_url: adminUser.avatar_url,
        role: adminUser.role,
      },
      permissions: permissions || [],
    });
  } catch (error) {
    logger.error('Login error:', error);
    return NextResponse.json(
      { error: 'Giriş yapılırken bir hata oluştu' },
      { status: 500 }
    );
  }
}

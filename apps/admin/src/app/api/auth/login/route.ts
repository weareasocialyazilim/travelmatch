import { logger } from '@/lib/logger';
import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase';
import { createAuditLog } from '@/lib/auth';
import {
  checkRateLimit,
  rateLimits,
  createRateLimitHeaders,
} from '@/lib/rate-limit';
import crypto from 'crypto';
import type { Database } from '@/types/database';

type AdminUserRow = Database['public']['Tables']['admin_users']['Row'];

// Helper to get client IP
function getClientIP(request: NextRequest): string {
  return (
    request.headers.get('x-forwarded-for')?.split(',')[0] ||
    request.headers.get('x-real-ip') ||
    'unknown'
  );
}

export async function POST(request: NextRequest) {
  const ip = getClientIP(request);

  try {
    // Rate limiting - strict for auth endpoints
    const rateLimit = await checkRateLimit(`auth:login:${ip}`, rateLimits.auth);

    if (!rateLimit.success) {
      logger.warn(`Login rate limit exceeded for IP: ${ip}`);
      return NextResponse.json(
        {
          error: 'Çok fazla başarısız deneme. Lütfen bekleyin.',
          retryAfter: rateLimit.retryAfter,
        },
        { status: 429, headers: createRateLimitHeaders(rateLimit) },
      );
    }

    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email ve şifre gerekli' },
        { status: 400, headers: createRateLimitHeaders(rateLimit) },
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Geçerli bir email adresi girin' },
        { status: 400, headers: createRateLimitHeaders(rateLimit) },
      );
    }

    const supabase = createServiceClient();

    // Find admin user by email
    const { data: adminUser, error: userError } = await supabase
      .from('admin_users')
      .select('*')
      .eq('email', email)
      .eq('is_active', true)
      .single();

    if (userError || !adminUser) {
      return NextResponse.json(
        { error: 'Geçersiz kimlik bilgileri' },
        { status: 401 },
      );
    }

    // Authenticate with Supabase Auth
    const { data: authData, error: authError } =
      await supabase.auth.signInWithPassword({
        email,
        password,
      });

    if (authError) {
      return NextResponse.json(
        { error: 'Geçersiz kimlik bilgileri' },
        { status: 401 },
      );
    }

    // Check if 2FA is required
    if (adminUser.totp_enabled) {
      // Create temporary session token for 2FA verification
      const tempToken = crypto.randomBytes(32).toString('hex');
      const tokenHash = crypto
        .createHash('sha256')
        .update(tempToken)
        .digest('hex');

      // Store temp session
      await supabase.from('admin_sessions').insert({
        admin_id: adminUser.id,
        token_hash: tokenHash,
        ip_address:
          request.headers.get('x-forwarded-for') ||
          request.headers.get('x-real-ip') ||
          'unknown',
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
    const sessionHash = crypto
      .createHash('sha256')
      .update(sessionToken)
      .digest('hex');

    // Store session
    await supabase.from('admin_sessions').insert({
      admin_id: adminUser.id,
      token_hash: sessionHash,
      ip_address:
        request.headers.get('x-forwarded-for') ||
        request.headers.get('x-real-ip') ||
        'unknown',
      user_agent: request.headers.get('user-agent'),
      expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours
    });

    // Update last login
    await supabase
      .from('admin_users')
      .update({ last_login_at: new Date().toISOString() })
      .eq('id', adminUser.id);

    // Get role permissions
    const { data: permissions } = await supabase
      .from('role_permissions')
      .select('resource, action')
      .eq('role', adminUser.role);

    // Create response with cookie
    const response = NextResponse.json({
      user: {
        id: adminUser.id,
        email: adminUser.email,
        name: adminUser.name,
        avatar_url: adminUser.avatar_url,
        role: adminUser.role,
      },
      permissions: permissions || [],
    });

    // Set session cookie on the response object
    response.cookies.set('admin_session', sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax', // Changed from strict to lax for redirect compatibility
      maxAge: 24 * 60 * 60, // 24 hours
      path: '/',
    });

    return response;
  } catch (error) {
    logger.error('Login error:', error);
    return NextResponse.json(
      { error: 'Giriş yapılırken bir hata oluştu' },
      { status: 500 },
    );
  }
}

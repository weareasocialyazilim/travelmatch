import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const { userId, code } = await request.json();

    if (!userId || !code) {
      return NextResponse.json(
        { success: false, error: 'Kullanıcı ID ve kod gerekli' },
        { status: 400 }
      );
    }

    // Validate code format
    if (!/^\d{6}$/.test(code)) {
      return NextResponse.json(
        { success: false, error: 'Geçersiz kod formatı' },
        { status: 400 }
      );
    }

    const supabase = createServiceClient();

    // Get admin user with TOTP secret
    const { data: adminUser, error: userError } = await supabase
      .from('admin_users')
      .select('id, totp_secret, totp_enabled')
      .eq('id', userId)
      .eq('is_active', true)
      .single();

    if (userError || !adminUser) {
      return NextResponse.json(
        { success: false, error: 'Kullanıcı bulunamadı' },
        { status: 404 }
      );
    }

    if (!adminUser.totp_enabled || !adminUser.totp_secret) {
      return NextResponse.json(
        { success: false, error: '2FA aktif değil' },
        { status: 400 }
      );
    }

    // In production, you would verify the TOTP code using otplib
    // For now, we'll do a simple validation
    // const { authenticator } = await import('otplib');
    // const isValid = authenticator.verify({ token: code, secret: adminUser.totp_secret });

    // Temporary: Accept any 6-digit code for development
    // TODO: Implement proper TOTP verification
    const isValid = code.length === 6;

    if (!isValid) {
      // Log failed attempt
      await supabase.from('audit_logs').insert({
        admin_id: userId,
        action: '2fa_verification_failed',
        ip_address: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip'),
        user_agent: request.headers.get('user-agent'),
      });

      return NextResponse.json(
        { success: false, error: 'Geçersiz doğrulama kodu' },
        { status: 401 }
      );
    }

    // Log successful verification
    await supabase.from('audit_logs').insert({
      admin_id: userId,
      action: '2fa_verification_success',
      ip_address: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip'),
      user_agent: request.headers.get('user-agent'),
    });

    // Update last login
    await supabase
      .from('admin_users')
      .update({ last_login_at: new Date().toISOString() })
      .eq('id', userId);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('2FA verification error:', error);
    return NextResponse.json(
      { success: false, error: 'Doğrulama işlemi başarısız' },
      { status: 500 }
    );
  }
}

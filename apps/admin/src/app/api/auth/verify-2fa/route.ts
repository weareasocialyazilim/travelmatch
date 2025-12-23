import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase';
import { authenticator } from 'otplib';
import crypto from 'crypto';

// Encryption helpers for TOTP secret
const ALGORITHM = 'aes-256-gcm';

// Security: Encryption key and salt MUST be set via environment variables
// Generate with: openssl rand -base64 32
function getEncryptionConfig() {
  const key = process.env.TOTP_ENCRYPTION_KEY;
  const salt = process.env.TOTP_ENCRYPTION_SALT;

  if (!key || key.length < 32) {
    throw new Error(
      'TOTP_ENCRYPTION_KEY must be set and at least 32 characters',
    );
  }

  if (!salt || salt.length < 16) {
    throw new Error(
      'TOTP_ENCRYPTION_SALT must be set and at least 16 characters',
    );
  }

  return { key, salt };
}

function decrypt(encryptedData: string): string {
  try {
    const { key, salt } = getEncryptionConfig();
    const parts = encryptedData.split(':');
    if (parts.length !== 3) {
      throw new Error('Invalid encrypted data format');
    }
    const [ivHex, authTagHex, encryptedHex] = parts;
    const iv = Buffer.from(ivHex!, 'hex');
    const authTag = Buffer.from(authTagHex!, 'hex');
    const encrypted = Buffer.from(encryptedHex!, 'hex');

    const derivedKey = crypto.scryptSync(key, salt, 32);
    const decipher = crypto.createDecipheriv(ALGORITHM, derivedKey, iv);
    decipher.setAuthTag(authTag);

    let decrypted = decipher.update(encrypted);
    decrypted = Buffer.concat([decrypted, decipher.final()]);

    return decrypted.toString('utf8');
  } catch {
    throw new Error('Failed to decrypt TOTP secret');
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId, code } = await request.json();

    if (!userId || !code) {
      return NextResponse.json(
        { success: false, error: 'Kullanıcı ID ve kod gerekli' },
        { status: 400 },
      );
    }

    // Validate code format (6 digits)
    if (!/^\d{6}$/.test(code)) {
      return NextResponse.json(
        { success: false, error: 'Geçersiz kod formatı' },
        { status: 400 },
      );
    }

    const supabase = createServiceClient();

    // Get admin user with TOTP secret
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: adminUserData, error: userError } = await (supabase as any)
      .from('admin_users')
      .select('id, totp_secret, totp_enabled')
      .eq('id', userId)
      .eq('is_active', true)
      .single();

    if (userError || !adminUserData) {
      return NextResponse.json(
        { success: false, error: 'Kullanıcı bulunamadı' },
        { status: 404 },
      );
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const adminUser = adminUserData as any;

    if (!adminUser.totp_enabled || !adminUser.totp_secret) {
      return NextResponse.json(
        { success: false, error: '2FA aktif değil' },
        { status: 400 },
      );
    }

    // Decrypt the TOTP secret and verify the code
    let isValid = false;
    try {
      const decryptedSecret = decrypt(adminUser.totp_secret);

      // Configure authenticator options
      authenticator.options = {
        window: 1, // Allow 1 step before/after for clock drift
      };

      isValid = authenticator.verify({
        token: code,
        secret: decryptedSecret,
      });
    } catch (decryptError) {
      console.error('TOTP decryption error:', decryptError);
      return NextResponse.json(
        { success: false, error: 'Doğrulama işlemi başarısız' },
        { status: 500 },
      );
    }

    const clientIp =
      request.headers.get('x-forwarded-for') ||
      request.headers.get('x-real-ip');
    const userAgent = request.headers.get('user-agent');

    if (!isValid) {
      // Log failed attempt
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (supabase as any).from('audit_logs').insert({
        admin_id: userId,
        action: '2fa_verification_failed',
        ip_address: clientIp,
        user_agent: userAgent,
      });

      return NextResponse.json(
        { success: false, error: 'Geçersiz doğrulama kodu' },
        { status: 401 },
      );
    }

    // Log successful verification
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase as any).from('audit_logs').insert({
      admin_id: userId,
      action: '2fa_verification_success',
      ip_address: clientIp,
      user_agent: userAgent,
    });

    // Update last login timestamp
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase as any)
      .from('admin_users')
      .update({ last_login_at: new Date().toISOString() })
      .eq('id', userId);

    // Create session token
    const sessionToken = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // Store session
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase as any).from('admin_sessions').insert({
      admin_id: userId,
      session_token: crypto
        .createHash('sha256')
        .update(sessionToken)
        .digest('hex'),
      ip_address: clientIp,
      user_agent: userAgent,
      expires_at: expiresAt.toISOString(),
    });

    // Set session cookie
    const response = NextResponse.json({ success: true });
    response.cookies.set('admin_session', sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      expires: expiresAt,
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('2FA verification error:', error);
    return NextResponse.json(
      { success: false, error: 'Doğrulama işlemi başarısız' },
      { status: 500 },
    );
  }
}

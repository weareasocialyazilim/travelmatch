import { logger } from '@/lib/logger';
import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase.server';
import { getAdminSession } from '@/lib/auth';
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

/**
 * Encrypt TOTP secret using AES-256-GCM
 */
function encrypt(plaintext: string): string {
  const { key, salt } = getEncryptionConfig();
  const iv = crypto.randomBytes(16);
  const derivedKey = crypto.scryptSync(key, salt, 32);
  const cipher = crypto.createCipheriv(ALGORITHM, derivedKey, iv);

  let encrypted = cipher.update(plaintext, 'utf8');
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  const authTag = cipher.getAuthTag();

  // Format: iv:authTag:encryptedData (all hex encoded)
  return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted.toString('hex')}`;
}

/**
 * Generate QR code URL for authenticator app
 */
function generateQRCodeURL(secret: string, email: string): string {
  const issuer = 'Lovendo Admin';
  const otpauthURL = authenticator.keyuri(email, issuer, secret);
  return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(otpauthURL)}`;
}

/**
 * GET /api/auth/setup-2fa
 * Generate new TOTP secret and QR code for admin user
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getAdminSession();

    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Oturum açmanız gerekiyor' },
        { status: 401 },
      );
    }

    const supabase = createServiceClient();

    // Get admin user
    const { data: adminUser, error: userError } = await supabase
      .from('admin_users')
      .select('id, email, totp_enabled')
      .eq('id', session.admin.id)
      .eq('is_active', true)
      .single();

    if (userError || !adminUser) {
      return NextResponse.json(
        { success: false, error: 'Kullanıcı bulunamadı' },
        { status: 404 },
      );
    }

    if (adminUser.totp_enabled) {
      return NextResponse.json(
        { success: false, error: '2FA zaten aktif' },
        { status: 400 },
      );
    }

    // Generate new TOTP secret
    const secret = authenticator.generateSecret();
    const qrCodeURL = generateQRCodeURL(secret, adminUser.email);

    // Encrypt and store the secret temporarily (not enabled yet)
    const encryptedSecret = encrypt(secret);

    await supabase
      .from('admin_users')
      .update({
        totp_secret: encryptedSecret,
        totp_enabled: false, // Will be enabled after verification
      })
      .eq('id', session.admin.id);

    // Log audit event
    const clientIp =
      request.headers.get('x-forwarded-for') ||
      request.headers.get('x-real-ip');
    const userAgent = request.headers.get('user-agent');

    await supabase.from('audit_logs').insert({
      admin_id: session.admin.id,
      action: '2fa_setup_initiated',
      resource_type: 'auth',
      ip_address: clientIp,
      user_agent: userAgent,
    });

    return NextResponse.json({
      success: true,
      secret, // Show secret to user for manual entry
      qrCodeURL,
      message: 'QR kodu authenticator uygulamanız ile tarayın',
    });
  } catch (error) {
    logger.error('2FA setup error:', error);
    return NextResponse.json(
      { success: false, error: '2FA kurulumu başarısız' },
      { status: 500 },
    );
  }
}

/**
 * POST /api/auth/setup-2fa
 * Verify TOTP code and enable 2FA for admin user
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getAdminSession();

    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Oturum açmanız gerekiyor' },
        { status: 401 },
      );
    }

    const { code } = await request.json();

    if (!code || !/^\d{6}$/.test(code)) {
      return NextResponse.json(
        { success: false, error: 'Geçerli bir 6 haneli kod girin' },
        { status: 400 },
      );
    }

    const supabase = createServiceClient();

    // Get admin user with pending TOTP secret
    const { data: adminUser, error: userError } = await supabase
      .from('admin_users')
      .select('id, totp_secret, totp_enabled')
      .eq('id', session.admin.id)
      .eq('is_active', true)
      .single();

    if (userError || !adminUser) {
      return NextResponse.json(
        { success: false, error: 'Kullanıcı bulunamadı' },
        { status: 404 },
      );
    }

    if (adminUser.totp_enabled) {
      return NextResponse.json(
        { success: false, error: '2FA zaten aktif' },
        { status: 400 },
      );
    }

    if (!adminUser.totp_secret) {
      return NextResponse.json(
        { success: false, error: 'Önce 2FA kurulumunu başlatın' },
        { status: 400 },
      );
    }

    // Decrypt and verify the TOTP code
    let isValid = false;
    try {
      const { key, salt } = getEncryptionConfig();
      const [ivHex, authTagHex, encryptedHex] =
        adminUser.totp_secret.split(':');
      const iv = Buffer.from(ivHex, 'hex');
      const authTag = Buffer.from(authTagHex, 'hex');
      const encrypted = Buffer.from(encryptedHex, 'hex');

      const derivedKey = crypto.scryptSync(key, salt, 32);
      const decipher = crypto.createDecipheriv(ALGORITHM, derivedKey, iv);
      decipher.setAuthTag(authTag);

      let decrypted = decipher.update(encrypted);
      decrypted = Buffer.concat([decrypted, decipher.final()]);
      const secret = decrypted.toString('utf8');

      // Configure authenticator options
      authenticator.options = {
        window: 1, // Allow 1 step before/after for clock drift
      };

      isValid = authenticator.verify({
        token: code,
        secret,
      });
    } catch (decryptError) {
      logger.error('TOTP decryption error:', decryptError);
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
      await supabase.from('audit_logs').insert({
        admin_id: session.admin.id,
        action: '2fa_setup_verification_failed',
        resource_type: 'auth',
        ip_address: clientIp,
        user_agent: userAgent,
      });

      return NextResponse.json(
        { success: false, error: 'Geçersiz doğrulama kodu' },
        { status: 401 },
      );
    }

    // Enable 2FA
    await supabase
      .from('admin_users')
      .update({ totp_enabled: true })
      .eq('id', session.admin.id);

    // Log successful setup
    await supabase.from('audit_logs').insert({
      admin_id: session.admin.id,
      action: '2fa_enabled',
      resource_type: 'auth',
      ip_address: clientIp,
      user_agent: userAgent,
    });

    return NextResponse.json({
      success: true,
      message: '2FA başarıyla aktifleştirildi',
    });
  } catch (error) {
    logger.error('2FA setup verification error:', error);
    return NextResponse.json(
      { success: false, error: '2FA doğrulama işlemi başarısız' },
      { status: 500 },
    );
  }
}

/**
 * DELETE /api/auth/setup-2fa
 * Disable 2FA for admin user (requires current TOTP code)
 */
export async function DELETE(request: NextRequest) {
  try {
    const session = await getAdminSession();

    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Oturum açmanız gerekiyor' },
        { status: 401 },
      );
    }

    const { code } = await request.json();

    if (!code || !/^\d{6}$/.test(code)) {
      return NextResponse.json(
        { success: false, error: 'Geçerli bir 6 haneli kod girin' },
        { status: 400 },
      );
    }

    const supabase = createServiceClient();

    // Get admin user
    const { data: adminUser, error: userError } = await supabase
      .from('admin_users')
      .select('id, totp_secret, totp_enabled')
      .eq('id', session.admin.id)
      .eq('is_active', true)
      .single();

    if (userError || !adminUser) {
      return NextResponse.json(
        { success: false, error: 'Kullanıcı bulunamadı' },
        { status: 404 },
      );
    }

    if (!adminUser.totp_enabled || !adminUser.totp_secret) {
      return NextResponse.json(
        { success: false, error: '2FA zaten kapalı' },
        { status: 400 },
      );
    }

    // Decrypt and verify the TOTP code before disabling
    let isValid = false;
    try {
      const { key, salt } = getEncryptionConfig();
      const [ivHex, authTagHex, encryptedHex] =
        adminUser.totp_secret.split(':');
      const iv = Buffer.from(ivHex, 'hex');
      const authTag = Buffer.from(authTagHex, 'hex');
      const encrypted = Buffer.from(encryptedHex, 'hex');

      const derivedKey = crypto.scryptSync(key, salt, 32);
      const decipher = crypto.createDecipheriv(ALGORITHM, derivedKey, iv);
      decipher.setAuthTag(authTag);

      let decrypted = decipher.update(encrypted);
      decrypted = Buffer.concat([decrypted, decipher.final()]);
      const secret = decrypted.toString('utf8');

      authenticator.options = { window: 1 };
      isValid = authenticator.verify({ token: code, secret });
    } catch (verifyError) {
      return NextResponse.json(
        { success: false, error: 'Doğrulama işlemi başarısız' },
        { status: 500 },
      );
    }

    if (!isValid) {
      return NextResponse.json(
        { success: false, error: 'Geçersiz doğrulama kodu' },
        { status: 401 },
      );
    }

    // Disable 2FA
    await supabase
      .from('admin_users')
      .update({
        totp_enabled: false,
        totp_secret: null,
      })
      .eq('id', session.admin.id);

    // Log
    const clientIp =
      request.headers.get('x-forwarded-for') ||
      request.headers.get('x-real-ip');
    const userAgent = request.headers.get('user-agent');

    await supabase.from('audit_logs').insert({
      admin_id: session.admin.id,
      action: '2fa_disabled',
      resource_type: 'auth',
      ip_address: clientIp,
      user_agent: userAgent,
    });

    return NextResponse.json({
      success: true,
      message: '2FA başarıyla devre dışı bırakıldı',
    });
  } catch (error) {
    logger.error('2FA disable error:', error);
    return NextResponse.json(
      { success: false, error: '2FA devre dışı bırakma başarısız' },
      { status: 500 },
    );
  }
}

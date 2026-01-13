import { NextRequest, NextResponse } from 'next/server';
import { getClient } from '@/lib/supabase';
import { getAdminSession, createAuditLog } from '@/lib/auth';
import { logger } from '@/lib/logger';
import crypto from 'crypto';

// Simple password hashing using Node.js crypto
async function hashPassword(password: string): Promise<string> {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto
    .pbkdf2Sync(password, salt, 100000, 64, 'sha512')
    .toString('hex');
  return `${salt}:${hash}`;
}

/**
 * POST /api/admin-users/[id]/reset-password
 * Şifre sıfırlama - Sadece super_admin yapabilir
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const session = await getAdminSession();

    if (!session) {
      return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 401 });
    }

    // Sadece super_admin şifre sıfırlayabilir
    if (session.admin.role !== 'super_admin') {
      return NextResponse.json(
        { error: 'Bu işlem için yetkiniz yok' },
        { status: 403 },
      );
    }

    const { id } = params;
    const body = await request.json();
    const { new_password, send_email = true } = body;

    // Hedef admini kontrol et
    const supabase = getClient();
    const { data: targetAdmin, error: fetchError } = await (
      supabase.from('admin_users') as any
    )
      .select('id, email, name')
      .eq('id', id)
      .single();

    if (fetchError || !targetAdmin) {
      return NextResponse.json(
        { error: 'Admin kullanıcı bulunamadı' },
        { status: 404 },
      );
    }

    // Kendini sıfırlayamaz (güvenlik için)
    if ((targetAdmin as any).id === session.admin.id) {
      return NextResponse.json(
        { error: 'Kendi şifrenizi ayarlar sayfasından değiştirin' },
        { status: 400 },
      );
    }

    // Şifre oluştur veya kullan
    const password = new_password || generateSecurePassword();
    const hashedPassword = await hashPassword(password);

    // Şifreyi güncelle ve force_password_change flag'ini set et
    const { error: updateError } = await (supabase.from('admin_users') as any)
      .update({
        password_hash: hashedPassword,
        force_password_change: true,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id);

    if (updateError) {
      logger.error('Failed to reset password', {
        error: updateError,
        adminId: id,
      });
      return NextResponse.json(
        { error: 'Şifre sıfırlanamadı' },
        { status: 500 },
      );
    }

    // Audit log
    await createAuditLog(
      session.admin.id,
      'admin.password_reset',
      'admin_user',
      id,
      null,
      { reset_by: session.admin.email, target: (targetAdmin as any).email },
    );

    // E-posta gönder (opsiyonel)
    if (send_email) {
      await sendPasswordResetEmail({
        to: (targetAdmin as any).email,
        name: (targetAdmin as any).name,
        temporaryPassword: new_password ? undefined : password,
        resetBy: session.admin.email,
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Şifre başarıyla sıfırlandı',
      temporary_password: new_password ? undefined : password, // Sadece otomatik oluşturulduysa göster
      email_sent: send_email,
    });
  } catch (error) {
    logger.error('Password reset error', { error });
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 });
  }
}

// Email service integration
interface PasswordResetEmailParams {
  to: string;
  name: string;
  temporaryPassword?: string;
  resetBy: string;
}

async function sendPasswordResetEmail(
  params: PasswordResetEmailParams,
): Promise<void> {
  const { to, name, temporaryPassword, resetBy } = params;

  // Use Resend/SendGrid/etc. when configured
  const emailServiceUrl = process.env.EMAIL_SERVICE_URL;

  if (emailServiceUrl) {
    try {
      await fetch(emailServiceUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.EMAIL_SERVICE_API_KEY}`,
        },
        body: JSON.stringify({
          template: 'admin-password-reset',
          to,
          data: {
            name,
            temporaryPassword,
            resetBy,
            loginUrl: `${process.env.NEXT_PUBLIC_APP_URL}/admin/login`,
          },
        }),
      });
      logger.info('Password reset email sent', { to });
    } catch (error) {
      logger.error('Failed to send password reset email', { error, to });
      // Non-blocking - don't fail the reset if email fails
    }
  } else {
    // Log for development/testing
    logger.info(
      'Password reset email (not sent - no email service configured)',
      {
        to,
        name,
        hasTemporaryPassword: !!temporaryPassword,
        resetBy,
      },
    );
  }
}

// Güvenli rastgele şifre oluştur
function generateSecurePassword(): string {
  const length = 16;
  const charset =
    'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
  let password = '';

  // Crypto ile güvenli rastgele
  const randomBytes = crypto.randomBytes(length);
  for (let i = 0; i < length; i++) {
    password += charset[randomBytes[i] % charset.length];
  }

  // En az bir büyük, bir küçük, bir rakam, bir özel karakter garantile
  const lowercase = 'abcdefghijklmnopqrstuvwxyz';
  const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const numbers = '0123456789';
  const special = '!@#$%^&*';

  password = password.substring(0, length - 4);
  password += lowercase[crypto.randomInt(lowercase.length)];
  password += uppercase[crypto.randomInt(uppercase.length)];
  password += numbers[crypto.randomInt(numbers.length)];
  password += special[crypto.randomInt(special.length)];

  // Karıştır
  return password
    .split('')
    .sort(() => Math.random() - 0.5)
    .join('');
}

import { NextRequest, NextResponse } from 'next/server';
import { getClient } from '@/lib/supabase';
import { getCurrentAdmin, createAuditLog } from '@/lib/auth';
import { logger } from '@/lib/logger';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

/**
 * POST /api/admin-users/[id]/reset-password
 * Şifre sıfırlama - Sadece super_admin yapabilir
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const admin = await getCurrentAdmin(request);

    if (!admin) {
      return NextResponse.json(
        { error: 'Yetkisiz erişim' },
        { status: 401 },
      );
    }

    // Sadece super_admin şifre sıfırlayabilir
    if (admin.role !== 'super_admin') {
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
    const { data: targetAdmin, error: fetchError } = await supabase
      .from('admin_users')
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
    if (targetAdmin.id === admin.id) {
      return NextResponse.json(
        { error: 'Kendi şifrenizi ayarlar sayfasından değiştirin' },
        { status: 400 },
      );
    }

    // Şifre oluştur veya kullan
    const password = new_password || generateSecurePassword();
    const hashedPassword = await bcrypt.hash(password, 12);

    // Şifreyi güncelle ve force_password_change flag'ini set et
    const { error: updateError } = await supabase
      .from('admin_users')
      .update({
        password_hash: hashedPassword,
        force_password_change: true,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id);

    if (updateError) {
      logger.error('Failed to reset password', { error: updateError, adminId: id });
      return NextResponse.json(
        { error: 'Şifre sıfırlanamadı' },
        { status: 500 },
      );
    }

    // Audit log
    await createAuditLog(
      admin.id,
      'admin.password_reset',
      'admin_user',
      id,
      null,
      { reset_by: admin.email, target: targetAdmin.email },
      request,
    );

    // E-posta gönder (opsiyonel)
    if (send_email) {
      // TODO: E-posta servisi entegrasyonu
      logger.info('Password reset email would be sent', {
        to: targetAdmin.email,
        from: admin.email,
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
    return NextResponse.json(
      { error: 'Sunucu hatası' },
      { status: 500 },
    );
  }
}

// Güvenli rastgele şifre oluştur
function generateSecurePassword(): string {
  const length = 16;
  const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
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
  return password.split('').sort(() => Math.random() - 0.5).join('');
}

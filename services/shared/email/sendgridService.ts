/**
 * SendGrid Email Service
 *
 * Handles transactional emails for:
 * - Email verification
 * - Password reset
 * - Welcome emails
 * - Transaction notifications
 * - Weekly digests
 *
 * @packageDocumentation
 */

import sgMail from '@sendgrid/mail';

// Environment variables (stored in Infisical)
const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY;
const SENDGRID_FROM_EMAIL =
  process.env.SENDGRID_FROM_EMAIL || 'noreply@travelmatch.app';
const SENDGRID_FROM_NAME = process.env.SENDGRID_FROM_NAME || 'TravelMatch';

// Template IDs (create these in SendGrid dashboard)
const TEMPLATE_IDS = {
  WELCOME: process.env.SENDGRID_TEMPLATE_WELCOME || '',
  EMAIL_VERIFICATION: process.env.SENDGRID_TEMPLATE_EMAIL_VERIFICATION || '',
  PASSWORD_RESET: process.env.SENDGRID_TEMPLATE_PASSWORD_RESET || '',
  GIFT_RECEIVED: process.env.SENDGRID_TEMPLATE_GIFT_RECEIVED || '',
  GIFT_SENT: process.env.SENDGRID_TEMPLATE_GIFT_SENT || '',
  PAYMENT_RECEIPT: process.env.SENDGRID_TEMPLATE_PAYMENT_RECEIPT || '',
  WEEKLY_DIGEST: process.env.SENDGRID_TEMPLATE_WEEKLY_DIGEST || '',
  SECURITY_ALERT: process.env.SENDGRID_TEMPLATE_SECURITY_ALERT || '',
  MOMENT_APPROVED: process.env.SENDGRID_TEMPLATE_MOMENT_APPROVED || '',
  NEW_MESSAGE: process.env.SENDGRID_TEMPLATE_NEW_MESSAGE || '',
};

// Initialize SendGrid
if (SENDGRID_API_KEY) {
  sgMail.setApiKey(SENDGRID_API_KEY);
}

export interface SendEmailResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

export interface EmailRecipient {
  email: string;
  name?: string;
}

/**
 * Send a simple text/HTML email
 */
export async function sendEmail(
  to: EmailRecipient | EmailRecipient[],
  subject: string,
  content: { text?: string; html?: string },
): Promise<SendEmailResult> {
  if (!SENDGRID_API_KEY) {
    console.error('[SendGrid] API key not configured');
    return { success: false, error: 'Email service not configured' };
  }

  try {
    const recipients = Array.isArray(to) ? to : [to];

    const msg = {
      to: recipients.map((r) => ({ email: r.email, name: r.name })),
      from: { email: SENDGRID_FROM_EMAIL, name: SENDGRID_FROM_NAME },
      subject,
      text: content.text || '',
      html: content.html || content.text || '',
    };

    const [response] = await sgMail.send(msg);

    console.log('[SendGrid] Email sent', {
      to: recipients.map((r) => r.email),
      subject,
      statusCode: response.statusCode,
    });

    return {
      success: true,
      messageId: response.headers['x-message-id'] as string,
    };
  } catch (error) {
    console.error('[SendGrid] Send email error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to send email',
    };
  }
}

/**
 * Send email using a SendGrid template
 */
export async function sendTemplateEmail(
  to: EmailRecipient | EmailRecipient[],
  templateId: string,
  dynamicData: Record<string, unknown>,
): Promise<SendEmailResult> {
  if (!SENDGRID_API_KEY) {
    console.error('[SendGrid] API key not configured');
    return { success: false, error: 'Email service not configured' };
  }

  try {
    const recipients = Array.isArray(to) ? to : [to];

    const msg = {
      to: recipients.map((r) => ({ email: r.email, name: r.name })),
      from: { email: SENDGRID_FROM_EMAIL, name: SENDGRID_FROM_NAME },
      templateId,
      dynamicTemplateData: {
        ...dynamicData,
        // Common variables available in all templates
        appName: 'TravelMatch',
        supportEmail: 'support@travelmatch.app',
        currentYear: new Date().getFullYear(),
      },
    };

    const [response] = await sgMail.send(msg);

    console.log('[SendGrid] Template email sent', {
      to: recipients.map((r) => r.email),
      templateId,
      statusCode: response.statusCode,
    });

    return {
      success: true,
      messageId: response.headers['x-message-id'] as string,
    };
  } catch (error) {
    console.error('[SendGrid] Send template email error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to send email',
    };
  }
}

// ============================================
// Pre-built Email Functions
// ============================================

/**
 * Send welcome email to new user
 */
export async function sendWelcomeEmail(
  to: EmailRecipient,
  data: { firstName: string },
): Promise<SendEmailResult> {
  if (TEMPLATE_IDS.WELCOME) {
    return sendTemplateEmail(to, TEMPLATE_IDS.WELCOME, {
      firstName: data.firstName,
      loginUrl: 'https://travelmatch.app/login',
    });
  }

  // Fallback to inline template
  return sendEmail(to, "TravelMatch'a Hoş Geldiniz! 🎉", {
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #A6E5C1;">Hoş Geldiniz, ${data.firstName}! 🎉</h1>
        <p>TravelMatch ailesine katıldığınız için çok mutluyuz!</p>
        <p>Şimdi:</p>
        <ul>
          <li>Profilinizi tamamlayın</li>
          <li>Yakınlarınızdaki anları keşfedin</li>
          <li>İlk hediyenizi gönderin veya alın</li>
        </ul>
        <a href="https://travelmatch.app" style="display: inline-block; background: #A6E5C1; color: #1A1A1A; padding: 12px 24px; text-decoration: none; border-radius: 8px; margin: 16px 0;">Keşfetmeye Başla</a>
        <p style="color: #666; font-size: 14px;">Herhangi bir sorunuz varsa, support@travelmatch.app adresinden bize ulaşabilirsiniz.</p>
      </div>
    `,
  });
}

/**
 * Send email verification code
 */
export async function sendEmailVerification(
  to: EmailRecipient,
  data: { code: string; expiresInMinutes?: number },
): Promise<SendEmailResult> {
  const expiresIn = data.expiresInMinutes || 10;

  if (TEMPLATE_IDS.EMAIL_VERIFICATION) {
    return sendTemplateEmail(to, TEMPLATE_IDS.EMAIL_VERIFICATION, {
      code: data.code,
      expiresInMinutes: expiresIn,
    });
  }

  return sendEmail(to, 'TravelMatch - E-posta Doğrulama Kodu', {
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; text-align: center;">
        <h1 style="color: #A6E5C1;">E-posta Doğrulama</h1>
        <p>Doğrulama kodunuz:</p>
        <div style="background: #F5F5F5; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <span style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #1A1A1A;">${data.code}</span>
        </div>
        <p style="color: #666;">Bu kod ${expiresIn} dakika içinde geçerliliğini yitirecektir.</p>
        <p style="color: #999; font-size: 12px;">Bu e-postayı siz talep etmediyseniz, lütfen dikkate almayın.</p>
      </div>
    `,
  });
}

/**
 * Send password reset email
 */
export async function sendPasswordReset(
  to: EmailRecipient,
  data: { resetLink: string; expiresInHours?: number },
): Promise<SendEmailResult> {
  const expiresIn = data.expiresInHours || 1;

  if (TEMPLATE_IDS.PASSWORD_RESET) {
    return sendTemplateEmail(to, TEMPLATE_IDS.PASSWORD_RESET, {
      resetLink: data.resetLink,
      expiresInHours: expiresIn,
    });
  }

  return sendEmail(to, 'TravelMatch - Şifre Sıfırlama', {
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; text-align: center;">
        <h1 style="color: #A6E5C1;">Şifre Sıfırlama</h1>
        <p>Şifrenizi sıfırlamak için aşağıdaki butona tıklayın:</p>
        <a href="${data.resetLink}" style="display: inline-block; background: #A6E5C1; color: #1A1A1A; padding: 12px 24px; text-decoration: none; border-radius: 8px; margin: 16px 0;">Şifremi Sıfırla</a>
        <p style="color: #666;">Bu link ${expiresIn} saat içinde geçerliliğini yitirecektir.</p>
        <p style="color: #999; font-size: 12px;">Bu e-postayı siz talep etmediyseniz, lütfen dikkate almayın.</p>
      </div>
    `,
  });
}

/**
 * Send gift received notification
 */
export async function sendGiftReceivedEmail(
  to: EmailRecipient,
  data: {
    senderName: string;
    amount: number;
    currency: string;
    momentTitle: string;
    giftType?: string;
  },
): Promise<SendEmailResult> {
  if (TEMPLATE_IDS.GIFT_RECEIVED) {
    return sendTemplateEmail(to, TEMPLATE_IDS.GIFT_RECEIVED, data);
  }

  return sendEmail(to, `🎁 ${data.senderName} size bir hediye gönderdi!`, {
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #A6E5C1;">🎁 Yeni Hediye!</h1>
        <p><strong>${data.senderName}</strong> size <strong>${data.amount} ${data.currency}</strong> değerinde bir hediye gönderdi!</p>
        <div style="background: #F5F5F5; padding: 16px; border-radius: 8px; margin: 16px 0;">
          <p style="margin: 0;"><strong>An:</strong> ${data.momentTitle}</p>
          ${data.giftType ? `<p style="margin: 8px 0 0 0;"><strong>Hediye:</strong> ${data.giftType}</p>` : ''}
        </div>
        <a href="https://travelmatch.app/wallet" style="display: inline-block; background: #A6E5C1; color: #1A1A1A; padding: 12px 24px; text-decoration: none; border-radius: 8px;">Cüzdanımı Görüntüle</a>
      </div>
    `,
  });
}

/**
 * Send payment receipt
 */
export async function sendPaymentReceipt(
  to: EmailRecipient,
  data: {
    transactionId: string;
    amount: number;
    currency: string;
    description: string;
    date: string;
  },
): Promise<SendEmailResult> {
  if (TEMPLATE_IDS.PAYMENT_RECEIPT) {
    return sendTemplateEmail(to, TEMPLATE_IDS.PAYMENT_RECEIPT, data);
  }

  return sendEmail(
    to,
    `TravelMatch - Ödeme Makbuzu #${data.transactionId.slice(0, 8)}`,
    {
      html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #A6E5C1;">Ödeme Makbuzu</h1>
        <div style="background: #F5F5F5; padding: 16px; border-radius: 8px; margin: 16px 0;">
          <p><strong>İşlem No:</strong> ${data.transactionId}</p>
          <p><strong>Tutar:</strong> ${data.amount} ${data.currency}</p>
          <p><strong>Açıklama:</strong> ${data.description}</p>
          <p><strong>Tarih:</strong> ${data.date}</p>
        </div>
        <p style="color: #666; font-size: 14px;">Bu makbuzu kayıtlarınız için saklayınız.</p>
      </div>
    `,
    },
  );
}

/**
 * Send security alert email
 */
export async function sendSecurityAlertEmail(
  to: EmailRecipient,
  data: {
    alertType: 'new_device' | 'password_changed' | 'suspicious_activity';
    device?: string;
    location?: string;
    ip?: string;
    timestamp: string;
  },
): Promise<SendEmailResult> {
  const alertMessages = {
    new_device: 'Hesabınıza yeni bir cihazdan giriş yapıldı',
    password_changed: 'Şifreniz değiştirildi',
    suspicious_activity: 'Hesabınızda şüpheli aktivite tespit edildi',
  };

  if (TEMPLATE_IDS.SECURITY_ALERT) {
    return sendTemplateEmail(to, TEMPLATE_IDS.SECURITY_ALERT, {
      ...data,
      alertMessage: alertMessages[data.alertType],
    });
  }

  return sendEmail(to, `⚠️ TravelMatch Güvenlik Uyarısı`, {
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #FF6F61;">⚠️ Güvenlik Uyarısı</h1>
        <p><strong>${alertMessages[data.alertType]}</strong></p>
        <div style="background: #FFF3F2; padding: 16px; border-radius: 8px; margin: 16px 0; border-left: 4px solid #FF6F61;">
          ${data.device ? `<p><strong>Cihaz:</strong> ${data.device}</p>` : ''}
          ${data.location ? `<p><strong>Konum:</strong> ${data.location}</p>` : ''}
          ${data.ip ? `<p><strong>IP Adresi:</strong> ${data.ip}</p>` : ''}
          <p><strong>Zaman:</strong> ${data.timestamp}</p>
        </div>
        <p>Bu işlemi siz yapmadıysanız:</p>
        <ol>
          <li>Hemen şifrenizi değiştirin</li>
          <li>Aktif oturumlarınızı kontrol edin</li>
          <li>İki faktörlü doğrulamayı etkinleştirin</li>
        </ol>
        <a href="https://travelmatch.app/settings/security" style="display: inline-block; background: #FF6F61; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px;">Güvenlik Ayarları</a>
      </div>
    `,
  });
}

/**
 * Send new message notification
 */
export async function sendNewMessageEmail(
  to: EmailRecipient,
  data: {
    senderName: string;
    senderAvatar?: string;
    messagePreview: string;
    conversationId: string;
  },
): Promise<SendEmailResult> {
  if (TEMPLATE_IDS.NEW_MESSAGE) {
    return sendTemplateEmail(to, TEMPLATE_IDS.NEW_MESSAGE, data);
  }

  return sendEmail(to, `💬 ${data.senderName} size mesaj gönderdi`, {
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #A6E5C1;">Yeni Mesaj</h1>
        <div style="background: #F5F5F5; padding: 16px; border-radius: 8px; margin: 16px 0;">
          <p style="margin: 0;"><strong>${data.senderName}:</strong></p>
          <p style="margin: 8px 0 0 0; color: #666;">"${data.messagePreview}"</p>
        </div>
        <a href="https://travelmatch.app/messages/${data.conversationId}" style="display: inline-block; background: #A6E5C1; color: #1A1A1A; padding: 12px 24px; text-decoration: none; border-radius: 8px;">Mesajı Görüntüle</a>
      </div>
    `,
  });
}

export const sendgridService = {
  sendEmail,
  sendTemplateEmail,
  sendWelcomeEmail,
  sendEmailVerification,
  sendPasswordReset,
  sendGiftReceivedEmail,
  sendPaymentReceipt,
  sendSecurityAlertEmail,
  sendNewMessageEmail,
  TEMPLATE_IDS,
};

export default sendgridService;

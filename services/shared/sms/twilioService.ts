/**
 * Twilio SMS Service
 *
 * Handles SMS sending for:
 * - Phone verification (OTP)
 * - Transaction notifications
 * - Security alerts
 *
 * @packageDocumentation
 */

import twilio from 'twilio';

// Environment variables (stored in Infisical)
const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID;
const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN;
const TWILIO_PHONE_NUMBER = process.env.TWILIO_PHONE_NUMBER;
const TWILIO_VERIFY_SERVICE_SID = process.env.TWILIO_VERIFY_SERVICE_SID;

// Initialize Twilio client
const client =
  TWILIO_ACCOUNT_SID && TWILIO_AUTH_TOKEN
    ? twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN)
    : null;

export interface SendSmsResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

export interface VerifyOtpResult {
  success: boolean;
  valid?: boolean;
  error?: string;
}

/**
 * Send a verification OTP via Twilio Verify
 */
export async function sendVerificationOtp(
  phoneNumber: string,
  channel: 'sms' | 'whatsapp' = 'sms',
): Promise<SendSmsResult> {
  if (!client || !TWILIO_VERIFY_SERVICE_SID) {
    console.error('[Twilio] Service not configured');
    return { success: false, error: 'SMS service not configured' };
  }

  try {
    // Format phone number to E.164
    const formattedPhone = formatPhoneNumber(phoneNumber);

    const verification = await client.verify.v2
      .services(TWILIO_VERIFY_SERVICE_SID)
      .verifications.create({
        to: formattedPhone,
        channel,
      });

    console.log('[Twilio] Verification sent', {
      phone: formattedPhone.slice(-4),
      status: verification.status,
      sid: verification.sid,
    });

    return {
      success: true,
      messageId: verification.sid,
    };
  } catch (error) {
    console.error('[Twilio] Send verification error:', error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : 'Failed to send verification',
    };
  }
}

/**
 * Verify OTP code
 */
export async function verifyOtp(
  phoneNumber: string,
  code: string,
): Promise<VerifyOtpResult> {
  if (!client || !TWILIO_VERIFY_SERVICE_SID) {
    console.error('[Twilio] Service not configured');
    return { success: false, error: 'SMS service not configured' };
  }

  try {
    const formattedPhone = formatPhoneNumber(phoneNumber);

    const verificationCheck = await client.verify.v2
      .services(TWILIO_VERIFY_SERVICE_SID)
      .verificationChecks.create({
        to: formattedPhone,
        code,
      });

    const isValid = verificationCheck.status === 'approved';

    console.log('[Twilio] Verification check', {
      phone: formattedPhone.slice(-4),
      status: verificationCheck.status,
      valid: isValid,
    });

    return {
      success: true,
      valid: isValid,
    };
  } catch (error) {
    console.error('[Twilio] Verify OTP error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to verify code',
    };
  }
}

/**
 * Send a direct SMS (for notifications, not OTP)
 */
export async function sendSms(
  to: string,
  body: string,
): Promise<SendSmsResult> {
  if (!client || !TWILIO_PHONE_NUMBER) {
    console.error('[Twilio] Service not configured');
    return { success: false, error: 'SMS service not configured' };
  }

  try {
    const formattedPhone = formatPhoneNumber(to);

    const message = await client.messages.create({
      body,
      from: TWILIO_PHONE_NUMBER,
      to: formattedPhone,
    });

    console.log('[Twilio] SMS sent', {
      to: formattedPhone.slice(-4),
      sid: message.sid,
      status: message.status,
    });

    return {
      success: true,
      messageId: message.sid,
    };
  } catch (error) {
    console.error('[Twilio] Send SMS error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to send SMS',
    };
  }
}

/**
 * Send transaction notification SMS
 */
export async function sendTransactionNotification(
  phoneNumber: string,
  type: 'gift_received' | 'gift_sent' | 'payment_completed' | 'escrow_released',
  details: {
    amount: number;
    currency: string;
    senderName?: string;
    receiverName?: string;
    momentTitle?: string;
  },
): Promise<SendSmsResult> {
  const messages: Record<typeof type, string> = {
    gift_received: `🎁 TravelMatch: ${details.senderName} size ${details.amount} ${details.currency} değerinde bir hediye gönderdi! "${details.momentTitle}"`,
    gift_sent: `✅ TravelMatch: ${details.receiverName}'e ${details.amount} ${details.currency} değerinde hediye başarıyla gönderildi.`,
    payment_completed: `💳 TravelMatch: ${details.amount} ${details.currency} ödemeniz başarıyla tamamlandı.`,
    escrow_released: `💰 TravelMatch: ${details.amount} ${details.currency} cüzdanınıza aktarıldı.`,
  };

  return sendSms(phoneNumber, messages[type]);
}

/**
 * Send security alert SMS
 */
export async function sendSecurityAlert(
  phoneNumber: string,
  alertType: 'new_device' | 'password_changed' | 'suspicious_activity',
  details?: { device?: string; location?: string; ip?: string },
): Promise<SendSmsResult> {
  const messages: Record<typeof alertType, string> = {
    new_device: `🔐 TravelMatch: Hesabınıza yeni bir cihazdan giriş yapıldı${details?.device ? ` (${details.device})` : ''}. Siz değilseniz hemen şifrenizi değiştirin.`,
    password_changed: `🔐 TravelMatch: Şifreniz başarıyla değiştirildi. Bunu siz yapmadıysanız hemen bize ulaşın.`,
    suspicious_activity: `⚠️ TravelMatch: Hesabınızda şüpheli aktivite tespit edildi. Güvenliğiniz için hesabınızı kontrol edin.`,
  };

  return sendSms(phoneNumber, messages[alertType]);
}

/**
 * Format phone number to E.164 format
 */
function formatPhoneNumber(phone: string): string {
  // Remove all non-digit characters
  let cleaned = phone.replace(/\D/g, '');

  // Handle Turkish numbers
  if (cleaned.startsWith('0') && cleaned.length === 11) {
    // Turkish format: 05XX XXX XXXX -> +90 5XX XXX XXXX
    cleaned = '90' + cleaned.slice(1);
  } else if (cleaned.length === 10 && cleaned.startsWith('5')) {
    // Turkish without leading 0: 5XX XXX XXXX -> +90 5XX XXX XXXX
    cleaned = '90' + cleaned;
  }

  // Add + prefix if not present
  if (!cleaned.startsWith('+')) {
    cleaned = '+' + cleaned;
  }

  return cleaned;
}

export const twilioService = {
  sendVerificationOtp,
  verifyOtp,
  sendSms,
  sendTransactionNotification,
  sendSecurityAlert,
};

export default twilioService;

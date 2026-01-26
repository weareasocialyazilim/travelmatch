/**
 * Trust Notes Rules & Validation
 * Lovendo - One-way gratitude system (not reviews)
 *
 * Philosophy: Gift receiver → Gift sender only
 * This is a thank-you system, not a review system
 *
 * PII Blocking: Phone, email, URL, social handles are blocked
 * Rate Limiting: 5/day per user, 1/week per moment
 */

// ============================================
// PII PATTERNS (Block personal information)
// ============================================
export const PII_PATTERNS = {
  // Turkish phone formats: 0555 123 4567, +90 555 123 4567, 05551234567
  PHONE:
    /(?:(?:\+?90)|0)?\s*(?:5[0-9]{2})\s*(?:[0-9]{3})\s*(?:[0-9]{2})\s*(?:[0-9]{2})/g,

  // Email pattern
  EMAIL: /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g,

  // URL pattern (http, https, www)
  URL: /(?:https?:\/\/|www\.)[^\s<>"{}|\\^`]+/gi,

  // Social media handles (@username)
  SOCIAL_HANDLE: /@[a-zA-Z0-9_]{3,30}/g,
};

// ============================================
// ELIGIBILITY RULES
// ============================================
export const TRUST_NOTES_ELIGIBILITY = {
  // Who can write?
  writerMustBe: 'gift_receiver' as const,
  recipientMustBe: 'gift_sender' as const,

  // Only after escrow is released
  requiredStatus: 'escrow_released' as const,

  // One note per gift
  oneNotePerGift: true,

  // Account age requirement (anti-spam)
  accountAgeRequiredDays: 7,
} as const;

// ============================================
// THANK YOU RATE LIMITS (NEW)
// ============================================
export const THANK_YOU_RATE_LIMITS = {
  // Max thank yous per user per day
  DAILY_PER_USER: 5,

  // Max thank yous per user per moment (per week)
  PER_MOMENT_PER_USER: 1,

  // Snooze duration in hours after dismiss
  SNOOZE_HOURS: 24,

  // Bulk thank you cooldown in days
  BULK_COOLDOWN_DAYS: 7,

  // Minimum message length
  MIN_LENGTH: 10,

  // Maximum message length
  MAX_LENGTH: 280,
} as const;

// ============================================
// CONTENT RULES
// ============================================
export const TRUST_NOTES_CONTENT = {
  // Only positive notes (this is a thank-you system, not reviews)
  sentiment: 'positive_only' as const,

  // Character limits (Turkish)
  minLength: THANK_YOU_RATE_LIMITS.MIN_LENGTH,
  maxLength: THANK_YOU_RATE_LIMITS.MAX_LENGTH,

  // Emoji allowed
  allowEmoji: true,

  // Auto-block negative words (Turkish)
  blockedWords: [
    // Negative sentiment
    'kötü',
    'berbat',
    'pişman',
    'dolandırıcı',
    'sahtekarlık',
    'yalan',
    'rezalet',
    'iğrenç',
    'korkunç',
    'dehşet',
    'felaket',
    'lanet',
    'küfür',
    'hakaret',

    // Spam indicators
    'takip et',
    'para gönder',
    'ödeme yap',
    'link',
    'http',
    'www',

    // Inappropriate content
    'seks',
    'cinsel',
    'çıplak',
  ],

  // Warning words (flag for review, don't block)
  warningWords: ['para', 'ödeme', 'iade', 'şikayet', 'sorun'],
} as const;

// ============================================
// ANTI-SPAM RULES
// ============================================
export const TRUST_NOTES_ANTI_SPAM = {
  // Max notes per recipient per day
  maxNotesPerRecipientPerDay: 1,

  // Block similar notes
  similarityCheck: true,
  similarityThreshold: 0.8,

  // Cooldown between notes
  cooldownMinutes: 5,

  // Max notes a user can write per day
  maxNotesPerUserPerDay: THANK_YOU_RATE_LIMITS.DAILY_PER_USER,
} as const;

// ============================================
// VISIBILITY RULES
// ============================================
export const TRUST_NOTES_VISIBILITY = {
  // Show on profile
  showOnProfile: true,

  // Max notes displayed on profile
  maxDisplayedOnProfile: 10,

  // Show writer name
  showWriterName: true,

  // Show moment context
  showMomentContext: true,

  // Show date
  showDate: true,

  // Allow hiding by recipient
  recipientCanHide: true,

  // Public by default
  defaultPublic: true,
} as const;

// ============================================
// MODERATION
// ============================================
export const TRUST_NOTES_MODERATION = {
  // Auto-approve if no blocked words
  autoApprove: true,

  // Flag for manual review if warning words
  flagForReviewOnWarningWords: true,

  // Report options
  reportReasons: [
    'spam',
    'inappropriate',
    'harassment',
    'fake',
    'other',
  ] as const,

  // Auto-hide after X reports
  autoHideAfterReports: 3,
} as const;

// ============================================
// PROMPTS & UI TEXT (Turkish)
// ============================================
export const TRUST_NOTES_UI = {
  // Bottom sheet title
  sheetTitle: 'Teşekkür Bırak',

  // Subtitle template
  sheetSubtitle: '{recipientName} için, {momentTitle} sonrası',

  // Placeholder
  placeholder: 'Bu deneyimde neyi beğendiğini paylaş...',

  // Submit button
  submitButton: 'Teşekkür Et',

  // Cancel button
  cancelButton: 'Vazgeç',

  // Success message
  successMessage: 'Teşekkür gönderildi! 🎁',

  // Error messages
  errors: {
    tooShort: 'Mesaj en az 10 karakter olmalı',
    tooLong: 'Mesaj 280 karakteri geçemez',
    blockedContent: 'Bu içerik uygun değil',
    phoneBlocked: 'Telefon numarası paylaşılamaz',
    emailBlocked: 'E-posta adresi paylaşılamaz',
    urlBlocked: 'URL paylaşılamaz',
    socialBlocked: 'Sosyal medya hesabı paylaşılamaz',
    alreadyWritten: 'Bu hediye için zaten teşekkür bıraktınız',
    rateLimited: 'Bugün çok fazla teşekkür gönderdin',
    escrowNotReleased: 'Hediye işlemi henüz tamamlanmadı',
  },

  // Thank You Flow specific
  thankYouFlow: {
    title: 'Teşekkür Etmek İster misin?',
    subtitleSingle: '{giverName} hediye gönderdi.',
    subtitleBulk: '{count} kişi bu moment için hediye gönderdi.',
    optionSingle: 'Bireysel Teşekkür',
    optionSingleDesc: "Sadece {name}'a özel mesaj",
    optionBulk: 'Toplu Teşekkür',
    optionBulkDesc: 'Tüm {count} hediye gönderene tek mesaj',
    skipButton: 'Şimli değil',
    recipientBadgeSingle: 'Sadece {name} görür',
    recipientBadgeBulk: 'Tüm {count} hediye gönderen görür',
    tipsTitle: 'İpuçları:',
    tip1: 'Dürüst ve samimi olun',
    tip2: 'Deneyiminizi kısaca paylaşın',
    tip3: 'Telefon veya email paylaşmayın',
  },
} as const;

// ============================================
// VALIDATION HELPERS
// ============================================

/**
 * Check if text contains phone number
 */
export const containsPhone = (text: string): boolean => {
  return PII_PATTERNS.PHONE.test(text);
};

/**
 * Check if text contains email
 */
export const containsEmail = (text: string): boolean => {
  return PII_PATTERNS.EMAIL.test(text);
};

/**
 * Check if text contains URL
 */
export const containsUrl = (text: string): boolean => {
  return PII_PATTERNS.URL.test(text);
};

/**
 * Check if text contains social media handle
 */
export const containsSocialHandle = (text: string): boolean => {
  return PII_PATTERNS.SOCIAL_HANDLE.test(text);
};

/**
 * Check if text contains any PII
 */
export const containsPII = (
  text: string,
): {
  hasPII: boolean;
  type?: 'phone' | 'email' | 'url' | 'social';
} => {
  if (containsPhone(text)) {
    return { hasPII: true, type: 'phone' };
  }
  if (containsEmail(text)) {
    return { hasPII: true, type: 'email' };
  }
  if (containsUrl(text)) {
    return { hasPII: true, type: 'url' };
  }
  if (containsSocialHandle(text)) {
    return { hasPII: true, type: 'social' };
  }
  return { hasPII: false };
};

/**
 * Get PII error message
 */
export const getPIIErrorMessage = (
  piiType?: 'phone' | 'email' | 'url' | 'social',
): string => {
  switch (piiType) {
    case 'phone':
      return TRUST_NOTES_UI.errors.phoneBlocked;
    case 'email':
      return TRUST_NOTES_UI.errors.emailBlocked;
    case 'url':
      return TRUST_NOTES_UI.errors.urlBlocked;
    case 'social':
      return TRUST_NOTES_UI.errors.socialBlocked;
    default:
      return TRUST_NOTES_UI.errors.blockedContent;
  }
};

/**
 * Check if note content is valid (full validation)
 */
export const validateNoteContent = (
  note: string,
): { valid: boolean; error?: string } => {
  // Trim whitespace
  const trimmed = note.trim();

  // Check length
  if (trimmed.length < TRUST_NOTES_CONTENT.minLength) {
    return { valid: false, error: TRUST_NOTES_UI.errors.tooShort };
  }

  if (trimmed.length > TRUST_NOTES_CONTENT.maxLength) {
    return { valid: false, error: TRUST_NOTES_UI.errors.tooLong };
  }

  // Check for PII (priority over blocked words)
  const piiCheck = containsPII(trimmed);
  if (piiCheck.hasPII) {
    return { valid: false, error: getPIIErrorMessage(piiCheck.type) };
  }

  // Check blocked words (case insensitive)
  const lowerNote = trimmed.toLowerCase();
  for (const word of TRUST_NOTES_CONTENT.blockedWords) {
    if (lowerNote.includes(word.toLowerCase())) {
      return { valid: false, error: TRUST_NOTES_UI.errors.blockedContent };
    }
  }

  return { valid: true };
};

/**
 * Check if note contains warning words (flag for review)
 */
export const hasWarningWords = (note: string): boolean => {
  const lowerNote = note.toLowerCase();
  return TRUST_NOTES_CONTENT.warningWords.some((word) =>
    lowerNote.includes(word.toLowerCase()),
  );
};

/**
 * Sanitize text by removing PII (for display purposes)
 */
export const sanitizePII = (text: string): string => {
  const sanitized = text
    .replace(PII_PATTERNS.PHONE, '[TELEFON]')
    .replace(PII_PATTERNS.EMAIL, '[EMAIL]')
    .replace(PII_PATTERNS.URL, '[URL]')
    .replace(PII_PATTERNS.SOCIAL_HANDLE, '[HESAP]');

  return sanitized;
};

export default {
  PII_PATTERNS,
  TRUST_NOTES_ELIGIBILITY,
  THANK_YOU_RATE_LIMITS,
  TRUST_NOTES_CONTENT,
  TRUST_NOTES_ANTI_SPAM,
  TRUST_NOTES_VISIBILITY,
  TRUST_NOTES_MODERATION,
  TRUST_NOTES_UI,
  validateNoteContent,
  hasWarningWords,
  containsPII,
  sanitizePII,
};

/**
 * Trust Notes Rules & Validation
 * Lovendo - One-way gratitude system (not reviews)
 *
 * Philosophy: Gift receiver → Gift sender only
 * This is a thank-you system, not a review system
 */

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
// CONTENT RULES
// ============================================
export const TRUST_NOTES_CONTENT = {
  // Only positive notes (this is a thank-you system, not reviews)
  sentiment: 'positive_only' as const,

  // Character limits (Turkish)
  minLength: 10, // "Teşekkürler" = 11 chars
  maxLength: 280, // Twitter-like limit

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
    'instagram',
    'tiktok',
    'youtube',
    'telegram',
    'whatsapp',
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
  maxNotesPerUserPerDay: 5,
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
  sheetTitle: 'Güven Notu Bırak',

  // Subtitle template
  sheetSubtitle: '{recipientName} için, {momentTitle} sonrası',

  // Placeholder
  placeholder: 'Bu deneyimde neyi beğendiğini paylaş...',

  // Submit button
  submitButton: 'Notu Gönder',

  // Cancel button
  cancelButton: 'Vazgeç',

  // Success message
  successMessage: 'Notun gönderildi! 🙏',

  // Error messages
  errors: {
    tooShort: 'Not en az 10 karakter olmalı',
    tooLong: 'Not 280 karakteri geçemez',
    blockedContent: 'Bu içerik uygun değil',
    alreadyWritten: 'Bu hediye için zaten not yazdınız',
    rateLimited: 'Çok fazla not yazdınız, biraz bekleyin',
  },

  // Empty state (on profile)
  emptyState: {
    title: 'Henüz güven notu yok',
    description: 'Destekçilerinizden gelen notlar burada görünecek.',
  },
} as const;

// ============================================
// VALIDATION HELPERS
// ============================================

/**
 * Check if note content is valid
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
 * Check if note contains warning words
 */
export const hasWarningWords = (note: string): boolean => {
  const lowerNote = note.toLowerCase();
  return TRUST_NOTES_CONTENT.warningWords.some((word) =>
    lowerNote.includes(word.toLowerCase()),
  );
};

export default {
  TRUST_NOTES_ELIGIBILITY,
  TRUST_NOTES_CONTENT,
  TRUST_NOTES_ANTI_SPAM,
  TRUST_NOTES_VISIBILITY,
  TRUST_NOTES_MODERATION,
  TRUST_NOTES_UI,
  validateNoteContent,
  hasWarningWords,
};

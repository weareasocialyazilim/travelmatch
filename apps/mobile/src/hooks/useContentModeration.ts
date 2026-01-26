/**
 * Content Moderation Hook (Bilingual - Turkish & English)
 *
 * Real-time content validation for messages and comments.
 * Prevents bad words, phone numbers, and PII from being sent.
 *
 * Usage:
 * const { validateContent, isValid, error, sanitized } = useContentModeration();
 *
 * // In your send handler:
 * const result = validateContent(message);
 * if (!result.canSend) {
 *   // Show error to user
 *   return;
 * }
 * // Proceed with sending
 */

import { useState, useCallback, useMemo, useRef } from 'react';
import { Alert } from 'react-native';

// =============================================================================
// Types
// =============================================================================

export type SupportedLanguage = 'tr' | 'en' | 'auto';

export interface ModerationResult {
  canSend: boolean;
  severity: 'none' | 'low' | 'medium' | 'high' | 'critical';
  errors: string[];
  warnings: string[];
  sanitizedText?: string;
}

export interface ModerationOptions {
  language?: SupportedLanguage;
  blockBadWords?: boolean;
  blockPhoneNumbers?: boolean;
  blockPII?: boolean;
  blockSpam?: boolean;
  blockExternalLinks?: boolean;
  showAlerts?: boolean;
  allowWarnings?: boolean;
}

// =============================================================================
// Messages (Bilingual)
// =============================================================================

const MESSAGES = {
  tr: {
    badWord: 'Uygunsuz kelime tespit edildi',
    phoneNumber: 'Telefon numarası paylaşımı yasaktır',
    writtenPhone: 'Yazıyla yazılmış telefon numarası tespit edildi',
    email: 'E-posta adresi paylaşımı yasaktır',
    tcKimlik: 'TC Kimlik numarası paylaşımı yasaktır',
    ssn: 'Sosyal güvenlik numarası paylaşımı yasaktır',
    iban: 'IBAN paylaşımı yasaktır',
    creditCard: 'Kredi kartı numarası paylaşımı yasaktır',
    spam: 'Spam içerik olabilir',
    externalLink: 'Harici link paylaşımı yasaktır',
    telegram: 'Telegram linki paylaşımı yasaktır',
    whatsapp: 'WhatsApp linki paylaşımı yasaktır',
    socialMedia: 'Sosyal medya hesabı paylaşımı yasaktır',
    alertTitle: 'Mesaj Gönderilemedi',
    alertOk: 'Tamam',
  },
  en: {
    badWord: 'Inappropriate language detected',
    phoneNumber: 'Phone number sharing is not allowed',
    writtenPhone: 'Written phone number detected',
    email: 'Email address sharing is not allowed',
    tcKimlik: 'National ID number sharing is not allowed',
    ssn: 'Social security number sharing is not allowed',
    iban: 'IBAN sharing is not allowed',
    creditCard: 'Credit card number sharing is not allowed',
    spam: 'Possible spam content',
    externalLink: 'External link sharing is not allowed',
    telegram: 'Telegram link sharing is not allowed',
    whatsapp: 'WhatsApp link sharing is not allowed',
    socialMedia: 'Social media account sharing is not allowed',
    alertTitle: 'Message Cannot Be Sent',
    alertOk: 'OK',
  },
};

// =============================================================================
// Bad Words Dictionary (Turkish & English)
// =============================================================================

const BAD_WORDS_TR = new Set([
  'orospu',
  'piç',
  'sik',
  'amcık',
  'yarrak',
  'göt',
  'kancık',
  'pezevenk',
  'kahpe',
  'şerefsiz',
  'ibne',
  'am',
  'taşşak',
  'daşşak',
  'yarak',
  'çük',
  'siktir',
  'sikik',
  'amk',
  'aq',
  'salak',
  'aptal',
  'gerizekalı',
  'mal',
  'dangalak',
  'ahmak',
  'embesil',
  'budala',
  'hıyar',
  'öküz',
  'eşek',
]);

const BAD_WORDS_EN = new Set([
  'fuck',
  'shit',
  'ass',
  'bitch',
  'bastard',
  'cunt',
  'dick',
  'cock',
  'pussy',
  'whore',
  'slut',
  'nigger',
  'faggot',
  'retard',
  'damn',
  'crap',
  'idiot',
  'stupid',
  'moron',
  'dumb',
  'jerk',
  'loser',
]);

// Leetspeak variations
const LEETSPEAK: Record<string, string> = {
  '4': 'a',
  '@': 'a',
  '3': 'e',
  '1': 'i',
  '!': 'i',
  '0': 'o',
  '5': 's',
  $: 's',
  '9': 'g',
  '7': 't',
};

// Number words for written phone detection
const NUMBER_WORDS = {
  tr: {
    sıfır: '0',
    bir: '1',
    iki: '2',
    üç: '3',
    dört: '4',
    beş: '5',
    altı: '6',
    yedi: '7',
    sekiz: '8',
    dokuz: '9',
  } as Record<string, string>,
  en: {
    zero: '0',
    one: '1',
    two: '2',
    three: '3',
    four: '4',
    five: '5',
    six: '6',
    seven: '7',
    eight: '8',
    nine: '9',
  } as Record<string, string>,
};

// =============================================================================
// Validation Functions
// =============================================================================

/**
 * Detect language from text
 */
function detectLanguage(text: string): 'tr' | 'en' {
  const turkishChars = /[ğüşöçıİĞÜŞÖÇ]/;
  if (turkishChars.test(text)) return 'tr';

  const turkishWords = ['ve', 'ile', 'için', 'bir', 'bu', 'şu', 'ne', 'var'];
  const words = text.toLowerCase().split(/\s+/);
  const turkishCount = words.filter((w) => turkishWords.includes(w)).length;

  return turkishCount > 0 ? 'tr' : 'en';
}

/**
 * Normalize text for comparison (handles Turkish chars and leetspeak)
 */
function normalizeText(text: string): string {
  let normalized = text.toLowerCase();

  // Convert leetspeak
  for (const [leet, char] of Object.entries(LEETSPEAK)) {
    normalized = normalized.split(leet).join(char);
  }

  // Normalize Turkish characters
  normalized = normalized
    .replace(/ı/g, 'i')
    .replace(/ğ/g, 'g')
    .replace(/ü/g, 'u')
    .replace(/ş/g, 's')
    .replace(/ö/g, 'o')
    .replace(/ç/g, 'c');

  // Remove spaces and special chars that might be used to evade
  normalized = normalized.replace(/[\s._-]/g, '');

  return normalized;
}

/**
 * Check for bad words in both languages
 * @deprecated Use validateMessage or the hook instead
 */
export function checkBadWords(text: string, lang: 'tr' | 'en'): string[] {
  const errors: string[] = [];
  const normalized = normalizeText(text);
  const msgs = MESSAGES[lang];

  // Check Turkish bad words
  for (const badWord of BAD_WORDS_TR) {
    if (normalized.includes(badWord)) {
      errors.push(msgs.badWord);
      break;
    }
  }

  // Check English bad words
  if (errors.length === 0) {
    for (const badWord of BAD_WORDS_EN) {
      if (normalized.includes(badWord)) {
        errors.push(msgs.badWord);
        break;
      }
    }
  }

  // Also check word by word
  if (errors.length === 0) {
    const words = text.toLowerCase().split(/\s+/);
    for (const word of words) {
      const cleanWord = word.replace(/[^a-zA-ZğüşöçıĞÜŞÖÇİ]/g, '');
      if (BAD_WORDS_TR.has(cleanWord) || BAD_WORDS_EN.has(cleanWord)) {
        errors.push(msgs.badWord);
        break;
      }
    }
  }

  return errors;
}

/**
 * Check for phone numbers (numeric)
 * @deprecated Use validateMessage or the hook instead
 */
export function checkPhoneNumbers(text: string, lang: 'tr' | 'en'): string[] {
  const errors: string[] = [];
  const msgs = MESSAGES[lang];

  // Turkish patterns
  const turkishPatterns = [
    /\b0?\s*5\s*[0-9]{2}\s*[0-9]{3}\s*[0-9]{2}\s*[0-9]{2}\b/,
    /\+?\s*9?\s*0?\s*5[0-9]{9}/,
    /5[0-9]{2}[\s.-]*[0-9]{3}[\s.-]*[0-9]{2}[\s.-]*[0-9]{2}/,
    /0?\s*(212|216|312|232|242|322)\s*[0-9]{3}\s*[0-9]{2}\s*[0-9]{2}/,
  ];

  // US/International patterns
  const intlPatterns = [
    /\b\+?1?\s*\(?[0-9]{3}\)?[\s.-]*[0-9]{3}[\s.-]*[0-9]{4}\b/,
    /\b\+?[0-9]{1,3}[\s.-]*[0-9]{3,4}[\s.-]*[0-9]{3,4}[\s.-]*[0-9]{3,4}\b/,
  ];

  for (const pattern of [...turkishPatterns, ...intlPatterns]) {
    if (pattern.test(text)) {
      errors.push(msgs.phoneNumber);
      break;
    }
  }

  return errors;
}

/**
 * Check for phone numbers written in words
 */
function checkWrittenPhoneNumbers(text: string, lang: 'tr' | 'en'): string[] {
  const errors: string[] = [];
  const lowerText = text.toLowerCase();
  const msgs = MESSAGES[lang];

  // Check both languages
  for (const numLang of ['tr', 'en'] as const) {
    const numberWordKeys = Object.keys(NUMBER_WORDS[numLang]);
    let consecutiveNumbers = 0;
    const words = lowerText.split(/\s+/);

    for (const word of words) {
      const cleanWord = word.replace(/[^a-zA-ZğüşöçıĞÜŞÖÇİ]/g, '');
      if (numberWordKeys.includes(cleanWord)) {
        consecutiveNumbers++;
        if (consecutiveNumbers >= 7) {
          errors.push(msgs.writtenPhone);
          return errors;
        }
      } else {
        consecutiveNumbers = 0;
      }
    }
  }

  return errors;
}

/**
 * Check for PII (email, TC kimlik, SSN, IBAN, credit card)
 * @deprecated Use validateMessage or the hook instead
 */
export function checkPII(text: string, lang: 'tr' | 'en'): string[] {
  const errors: string[] = [];
  const msgs = MESSAGES[lang];

  // Email - supports @ and [at] obfuscation, . and [dot] obfuscation
  if (
    /[a-zA-Z0-9._%+-]+\s*(?:@|\[at\])\s*[a-zA-Z0-9.-]+(?:\s*(?:\.|\[dot\])\s*[a-zA-Z]{2,})/i.test(
      text,
    )
  ) {
    errors.push(msgs.email);
  }

  // TC Kimlik (11 digits starting with non-zero)
  const tcMatch = text.match(/\b[1-9][0-9]{10}\b/);
  if (tcMatch && isValidTCKimlik(tcMatch[0])) {
    errors.push(msgs.tcKimlik);
  }

  // SSN (US)
  const ssnMatch = text.match(/\b[0-9]{3}[-\s]?[0-9]{2}[-\s]?[0-9]{4}\b/);
  if (ssnMatch && isValidSSN(ssnMatch[0])) {
    errors.push(msgs.ssn);
  }

  // IBAN
  if (/[A-Z]{2}\s*[0-9]{2}\s*[0-9A-Z\s]{12,30}/i.test(text)) {
    errors.push(msgs.iban);
  }

  // Credit card (basic check)
  const ccMatch = text.match(
    /\b[0-9]{4}[\s.-]*[0-9]{4}[\s.-]*[0-9]{4}[\s.-]*[0-9]{4}\b/,
  );
  if (ccMatch && isValidCreditCard(ccMatch[0])) {
    errors.push(msgs.creditCard);
  }

  return errors;
}

/**
 * Check for spam patterns
 */
function checkSpam(text: string, lang: 'tr' | 'en'): string[] {
  const warnings: string[] = [];
  const msgs = MESSAGES[lang];

  const spamPatterns = [
    // Turkish
    /kazandın|kazandin/i,
    /ücretsiz.*hediye/i,
    /tıkla.*kazan/i,
    /hemen.*ara/i,
    /acele.*et/i,
    /son\s*(şans|fırsat)/i,
    // English
    /you\s*(have\s*)?won/i,
    /free\s*gift/i,
    /click\s*(here\s*)?to\s*win/i,
    /call\s*now/i,
    /act\s*fast/i,
    /last\s*chance/i,
    /limited\s*time\s*offer/i,
    // Common
    /%\s*\d{2,3}\s*(indirim|off|discount)/i,
  ];

  for (const pattern of spamPatterns) {
    if (pattern.test(text)) {
      warnings.push(msgs.spam);
      break;
    }
  }

  return warnings;
}

/**
 * Check for external contact attempts
 * @deprecated Use validateMessage or the hook instead
 */
export function checkExternalLinks(text: string, lang: 'tr' | 'en'): string[] {
  const errors: string[] = [];
  const msgs = MESSAGES[lang];

  // URLs
  if (/https?:\/\/|www\./i.test(text)) {
    errors.push(msgs.externalLink);
  }

  // Telegram
  if (/t\.me\//i.test(text)) {
    errors.push(msgs.telegram);
  }

  // WhatsApp
  if (/wa\.me\//i.test(text)) {
    errors.push(msgs.whatsapp);
  }

  // Instagram handle (allow official handle)
  const allowedHandles = ['@lovendo'];
  const lower = text.toLowerCase();
  if (
    /@[a-zA-Z0-9._]{3,}/.test(text) &&
    !allowedHandles.some((h) => lower.includes(h))
  ) {
    errors.push(msgs.socialMedia);
  }

  return errors;
}

/**
 * Validate TC Kimlik checksum
 */
export function isValidTCKimlik(tc: string): boolean {
  const digits = tc.replace(/\D/g, '');
  if (digits.length !== 11 || digits[0] === '0') return false;

  const d = digits.split('').map(Number);
  if (d.length !== 11) return false;

  const check1 =
    ((d[0]! + d[2]! + d[4]! + d[6]! + d[8]!) * 7 -
      (d[1]! + d[3]! + d[5]! + d[7]!)) %
    10;
  const check2 =
    (d[0]! +
      d[1]! +
      d[2]! +
      d[3]! +
      d[4]! +
      d[5]! +
      d[6]! +
      d[7]! +
      d[8]! +
      d[9]!) %
    10;

  return check1 === d[9] && check2 === d[10];
}

/**
 * Validate US SSN (basic format check)
 */
function isValidSSN(ssn: string): boolean {
  const digits = ssn.replace(/\D/g, '');
  if (digits.length !== 9) return false;

  const area = parseInt(digits.substring(0, 3), 10);
  if (area === 0 || area === 666 || area >= 900) return false;

  const group = parseInt(digits.substring(3, 5), 10);
  if (group === 0) return false;

  const serial = parseInt(digits.substring(5, 9), 10);
  if (serial === 0) return false;

  return true;
}

/**
 * Validate credit card with Luhn algorithm
 */
export function isValidCreditCard(cc: string): boolean {
  const digits = cc.replace(/\D/g, '');
  if (digits.length < 13 || digits.length > 19) return false;

  let sum = 0;
  let isEven = false;

  for (let i = digits.length - 1; i >= 0; i--) {
    let digit = parseInt(digits[i]!, 10);
    if (isEven) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }
    sum += digit;
    isEven = !isEven;
  }

  return sum % 10 === 0;
}

/**
 * Sanitize text by replacing sensitive content with asterisks
 */
function sanitizeText(text: string): string {
  let result = text;

  // Replace phone numbers
  result = result.replace(
    /\b0?\s*5\s*[0-9]{2}\s*[0-9]{3}\s*[0-9]{2}\s*[0-9]{2}\b/g,
    '***',
  );
  result = result.replace(/5[0-9]{9}/g, '***');
  result = result.replace(
    /\b\+?1?\s*\(?[0-9]{3}\)?[\s.-]*[0-9]{3}[\s.-]*[0-9]{4}\b/g,
    '***',
  );

  // Replace emails
  result = result.replace(
    /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g,
    '***',
  );

  // Replace URLs
  result = result.replace(/https?:\/\/[^\s]+/g, '***');
  result = result.replace(/www\.[^\s]+/g, '***');

  return result;
}

// =============================================================================
// Main Hook
// =============================================================================

const DEFAULT_OPTIONS: ModerationOptions = {
  language: 'auto',
  blockBadWords: true,
  blockPhoneNumbers: true,
  blockPII: true,
  blockSpam: true,
  blockExternalLinks: true,
  showAlerts: true,
  allowWarnings: true,
};

export function useContentModeration(options: ModerationOptions = {}) {
  const opts = useMemo(() => ({ ...DEFAULT_OPTIONS, ...options }), [options]);

  const [lastResult, setLastResult] = useState<ModerationResult | null>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  /**
   * Validate content and return result
   */
  const validateContent = useCallback(
    (text: string): ModerationResult => {
      const errors: string[] = [];
      const warnings: string[] = [];

      if (!text || text.trim().length === 0) {
        return {
          canSend: true,
          severity: 'none',
          errors: [],
          warnings: [],
        };
      }

      // Detect language or use specified
      const lang =
        opts.language === 'auto' ? detectLanguage(text) : opts.language || 'en';
      const msgs = MESSAGES[lang];

      // Check bad words
      if (opts.blockBadWords) {
        errors.push(...checkBadWords(text, lang));
      }

      // Check phone numbers
      if (opts.blockPhoneNumbers) {
        errors.push(...checkPhoneNumbers(text, lang));
        errors.push(...checkWrittenPhoneNumbers(text, lang));
      }

      // Check PII
      if (opts.blockPII) {
        errors.push(...checkPII(text, lang));
      }

      // Check spam
      if (opts.blockSpam) {
        warnings.push(...checkSpam(text, lang));
      }

      // Check external links
      if (opts.blockExternalLinks) {
        errors.push(...checkExternalLinks(text, lang));
      }

      // Determine severity
      let severity: ModerationResult['severity'] = 'none';
      if (errors.length > 0) {
        severity = errors.some(
          (e) =>
            e.includes('TC Kimlik') ||
            e.includes('Kredi kartı') ||
            e.includes('National ID') ||
            e.includes('Credit card') ||
            e.includes('SSN') ||
            e.includes('Social security'),
        )
          ? 'critical'
          : 'high';
      } else if (warnings.length > 0) {
        severity = 'medium';
      }

      // Determine if can send
      const canSend =
        errors.length === 0 && (opts.allowWarnings || warnings.length === 0);

      const result: ModerationResult = {
        canSend,
        severity,
        errors: [...new Set(errors)],
        warnings: [...new Set(warnings)],
        sanitizedText: sanitizeText(text),
      };

      setLastResult(result);

      // Show alert if blocking
      if (!canSend && opts.showAlerts) {
        Alert.alert(msgs.alertTitle, result.errors[0] || result.warnings[0], [
          { text: msgs.alertOk },
        ]);
      }

      return result;
    },
    [opts],
  );

  /**
   * Real-time validation with debounce (for typing feedback)
   */
  const validateRealtime = useCallback(
    (text: string, onResult?: (result: ModerationResult) => void) => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }

      debounceRef.current = setTimeout(() => {
        const result = validateContent(text);
        onResult?.(result);
      }, 300);
    },
    [validateContent],
  );

  /**
   * Quick check - just returns boolean
   */
  const isValid = useCallback(
    (text: string): boolean => {
      return validateContent(text).canSend;
    },
    [validateContent],
  );

  /**
   * Check if text contains phone number (helper)
   */
  const containsPhoneNumber = useCallback((text: string): boolean => {
    const lang = detectLanguage(text);
    const phoneErrors = checkPhoneNumbers(text, lang);
    const writtenErrors = checkWrittenPhoneNumbers(text, lang);
    return phoneErrors.length > 0 || writtenErrors.length > 0;
  }, []);

  /**
   * Check if text contains bad words (helper)
   */
  const containsBadWords = useCallback((text: string): boolean => {
    const lang = detectLanguage(text);
    return checkBadWords(text, lang).length > 0;
  }, []);

  return {
    // Main validation
    validateContent,
    validateRealtime,
    isValid,

    // Last result
    result: lastResult,
    errors: lastResult?.errors || [],
    warnings: lastResult?.warnings || [],
    severity: lastResult?.severity || 'none',

    // Helpers
    containsPhoneNumber,
    containsBadWords,
    sanitizeText,
  };
}

// =============================================================================
// Standalone utility for server-side use
// =============================================================================

export function validateMessage(
  text: string,
  language: SupportedLanguage = 'auto',
): ModerationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  const lang = language === 'auto' ? detectLanguage(text) : language;

  errors.push(...checkBadWords(text, lang));
  errors.push(...checkPhoneNumbers(text, lang));
  errors.push(...checkWrittenPhoneNumbers(text, lang));
  errors.push(...checkPII(text, lang));
  errors.push(...checkExternalLinks(text, lang));
  warnings.push(...checkSpam(text, lang));

  let severity: ModerationResult['severity'] = 'none';
  if (errors.length > 0) {
    severity = errors.some(
      (e) =>
        e.includes('TC Kimlik') ||
        e.includes('Kredi kartı') ||
        e.includes('National ID') ||
        e.includes('Credit card') ||
        e.includes('SSN'),
    )
      ? 'critical'
      : 'high';
  } else if (warnings.length > 0) {
    severity = 'medium';
  }

  return {
    canSend: errors.length === 0,
    severity,
    errors: [...new Set(errors)],
    warnings: [...new Set(warnings)],
    sanitizedText: sanitizeText(text),
  };
}

export default useContentModeration;

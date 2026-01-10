/**
 * Content Moderation Hook
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

export interface ModerationResult {
  canSend: boolean;
  severity: 'none' | 'low' | 'medium' | 'high' | 'critical';
  errors: string[];
  warnings: string[];
  sanitizedText?: string;
}

export interface ModerationOptions {
  blockBadWords?: boolean;
  blockPhoneNumbers?: boolean;
  blockPII?: boolean;
  blockSpam?: boolean;
  blockExternalLinks?: boolean;
  showAlerts?: boolean;
  allowWarnings?: boolean;
}

// =============================================================================
// Bad Words Dictionary (Turkish)
// =============================================================================

const BAD_WORDS = new Set([
  // Severe
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
  // Moderate
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
  'inek',
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
};

// Turkish number words for written phone detection
const TURKISH_NUMBERS: Record<string, string> = {
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
};

// =============================================================================
// Validation Functions
// =============================================================================

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
 * Check for bad words
 */
function checkBadWords(text: string): string[] {
  const errors: string[] = [];
  const normalized = normalizeText(text);

  // Check direct matches
  for (const badWord of BAD_WORDS) {
    if (normalized.includes(badWord)) {
      errors.push('Uygunsuz kelime tespit edildi');
      break;
    }
  }

  // Check word by word
  const words = text.toLowerCase().split(/\s+/);
  for (const word of words) {
    const cleanWord = word.replace(/[^a-zA-ZğüşöçıĞÜŞÖÇİ]/g, '');
    if (BAD_WORDS.has(cleanWord)) {
      if (!errors.length) {
        errors.push('Uygunsuz kelime tespit edildi');
      }
      break;
    }
  }

  return errors;
}

/**
 * Check for phone numbers (numeric)
 */
function checkPhoneNumbers(text: string): string[] {
  const errors: string[] = [];

  // Turkish mobile: starts with 5, 10 digits
  const patterns = [
    /\b0?\s*5\s*[0-9]{2}\s*[0-9]{3}\s*[0-9]{2}\s*[0-9]{2}\b/,
    /\+?\s*9?\s*0?\s*5[0-9]{9}/,
    /5[0-9]{2}[\s.-]*[0-9]{3}[\s.-]*[0-9]{2}[\s.-]*[0-9]{2}/,
    // City codes
    /0?\s*(212|216|312|232|242|322)\s*[0-9]{3}\s*[0-9]{2}\s*[0-9]{2}/,
  ];

  for (const pattern of patterns) {
    if (pattern.test(text)) {
      errors.push('Telefon numarası paylaşımı yasaktır');
      break;
    }
  }

  return errors;
}

/**
 * Check for phone numbers written in Turkish
 */
function checkWrittenPhoneNumbers(text: string): string[] {
  const errors: string[] = [];
  const lowerText = text.toLowerCase();
  const numberWords = Object.keys(TURKISH_NUMBERS);

  let consecutiveNumbers = 0;
  const words = lowerText.split(/\s+/);

  for (const word of words) {
    const cleanWord = word.replace(/[^a-zA-ZğüşöçıĞÜŞÖÇİ]/g, '');
    if (numberWords.includes(cleanWord)) {
      consecutiveNumbers++;
      // 7 or more consecutive number words = likely a phone number
      if (consecutiveNumbers >= 7) {
        errors.push('Yazıyla yazılmış telefon numarası tespit edildi');
        break;
      }
    } else {
      consecutiveNumbers = 0;
    }
  }

  return errors;
}

/**
 * Check for PII (email, TC kimlik, IBAN, credit card)
 */
function checkPII(text: string): string[] {
  const errors: string[] = [];

  // Email
  if (
    /[a-zA-Z0-9._%+-]+\s*[@\[at\]]\s*[a-zA-Z0-9.-]+\s*[.\[dot\]]\s*[a-zA-Z]{2,}/i.test(
      text,
    )
  ) {
    errors.push('E-posta adresi paylaşımı yasaktır');
  }

  // TC Kimlik (11 digits starting with non-zero)
  const tcMatch = text.match(/\b[1-9][0-9]{10}\b/);
  if (tcMatch && isValidTCKimlik(tcMatch[0])) {
    errors.push('TC Kimlik numarası paylaşımı yasaktır');
  }

  // IBAN
  if (
    /TR\s*[0-9]{2}\s*[0-9]{4}\s*[0-9]{4}\s*[0-9]{4}\s*[0-9]{4}\s*[0-9]{4}\s*[0-9]{2}/i.test(
      text,
    )
  ) {
    errors.push('IBAN paylaşımı yasaktır');
  }

  // Credit card (basic check)
  const ccMatch = text.match(
    /\b[0-9]{4}[\s.-]*[0-9]{4}[\s.-]*[0-9]{4}[\s.-]*[0-9]{4}\b/,
  );
  if (ccMatch && isValidCreditCard(ccMatch[0])) {
    errors.push('Kredi kartı numarası paylaşımı yasaktır');
  }

  return errors;
}

/**
 * Check for spam patterns
 */
function checkSpam(text: string): string[] {
  const warnings: string[] = [];

  const spamPatterns = [
    /kazandın|kazandin/i,
    /ücretsiz.*hediye/i,
    /tıkla.*kazan/i,
    /hemen.*ara/i,
    /acele.*et/i,
    /son\s*(şans|fırsat)/i,
    /%\s*\d{2,3}\s*(indirim|off)/i,
  ];

  for (const pattern of spamPatterns) {
    if (pattern.test(text)) {
      warnings.push('Spam içerik olabilir');
      break;
    }
  }

  return warnings;
}

/**
 * Check for external contact attempts
 */
function checkExternalLinks(text: string): string[] {
  const errors: string[] = [];

  // URLs
  if (/https?:\/\/|www\./i.test(text)) {
    errors.push('Harici link paylaşımı yasaktır');
  }

  // Telegram
  if (/t\.me\//i.test(text)) {
    errors.push('Telegram linki paylaşımı yasaktır');
  }

  // WhatsApp
  if (/wa\.me\//i.test(text)) {
    errors.push('WhatsApp linki paylaşımı yasaktır');
  }

  // Instagram handle
  if (/@[a-zA-Z0-9._]{3,}/.test(text) && !text.includes('@travelmatch')) {
    errors.push('Sosyal medya hesabı paylaşımı yasaktır');
  }

  return errors;
}

/**
 * Validate TC Kimlik checksum
 */
function isValidTCKimlik(tc: string): boolean {
  const digits = tc.replace(/\D/g, '');
  if (digits.length !== 11 || digits[0] === '0') return false;

  const d = digits.split('').map(Number);
  const check1 =
    ((d[0] + d[2] + d[4] + d[6] + d[8]) * 7 - (d[1] + d[3] + d[5] + d[7])) % 10;
  const check2 =
    (d[0] + d[1] + d[2] + d[3] + d[4] + d[5] + d[6] + d[7] + d[8] + d[9]) % 10;

  return check1 === d[9] && check2 === d[10];
}

/**
 * Validate credit card with Luhn algorithm
 */
function isValidCreditCard(cc: string): boolean {
  const digits = cc.replace(/\D/g, '');
  if (digits.length < 13 || digits.length > 19) return false;

  let sum = 0;
  let isEven = false;

  for (let i = digits.length - 1; i >= 0; i--) {
    let digit = parseInt(digits[i], 10);
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

      // Check bad words
      if (opts.blockBadWords) {
        errors.push(...checkBadWords(text));
      }

      // Check phone numbers
      if (opts.blockPhoneNumbers) {
        errors.push(...checkPhoneNumbers(text));
        errors.push(...checkWrittenPhoneNumbers(text));
      }

      // Check PII
      if (opts.blockPII) {
        errors.push(...checkPII(text));
      }

      // Check spam
      if (opts.blockSpam) {
        warnings.push(...checkSpam(text));
      }

      // Check external links
      if (opts.blockExternalLinks) {
        errors.push(...checkExternalLinks(text));
      }

      // Determine severity
      let severity: ModerationResult['severity'] = 'none';
      if (errors.length > 0) {
        severity = errors.some(
          (e) => e.includes('TC Kimlik') || e.includes('Kredi kartı'),
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
        errors: [...new Set(errors)], // Remove duplicates
        warnings: [...new Set(warnings)],
        sanitizedText: sanitizeText(text),
      };

      setLastResult(result);

      // Show alert if blocking
      if (!canSend && opts.showAlerts) {
        Alert.alert(
          'Mesaj Gönderilemedi',
          result.errors[0] || result.warnings[0],
          [{ text: 'Tamam' }],
        );
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
    const phoneErrors = checkPhoneNumbers(text);
    const writtenErrors = checkWrittenPhoneNumbers(text);
    return phoneErrors.length > 0 || writtenErrors.length > 0;
  }, []);

  /**
   * Check if text contains bad words (helper)
   */
  const containsBadWords = useCallback((text: string): boolean => {
    return checkBadWords(text).length > 0;
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

export function validateMessage(text: string): ModerationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  errors.push(...checkBadWords(text));
  errors.push(...checkPhoneNumbers(text));
  errors.push(...checkWrittenPhoneNumbers(text));
  errors.push(...checkPII(text));
  errors.push(...checkExternalLinks(text));
  warnings.push(...checkSpam(text));

  let severity: ModerationResult['severity'] = 'none';
  if (errors.length > 0) {
    severity = errors.some(
      (e) => e.includes('TC Kimlik') || e.includes('Kredi kartı'),
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

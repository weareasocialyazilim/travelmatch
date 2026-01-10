/**
 * Server-Side Content Moderation
 *
 * Real-time content validation middleware for Edge Functions.
 * Second line of defense after client-side validation.
 */

// =============================================================================
// Types
// =============================================================================

export interface ModerationResult {
  allowed: boolean;
  severity: 'none' | 'low' | 'medium' | 'high' | 'critical';
  violations: Violation[];
  sanitizedContent?: string;
}

export interface Violation {
  type: 'bad_word' | 'phone_number' | 'pii' | 'spam' | 'external_contact';
  matched: string;
  message: string;
}

export interface ModerationConfig {
  blockBadWords?: boolean;
  blockPhoneNumbers?: boolean;
  blockPII?: boolean;
  blockSpam?: boolean;
  blockExternalLinks?: boolean;
  strictMode?: boolean;
}

// =============================================================================
// Bad Words Dictionary
// =============================================================================

const BAD_WORDS = new Set([
  // Severe
  'orospu', 'piç', 'sik', 'amcık', 'yarrak', 'göt', 'kancık',
  'pezevenk', 'kahpe', 'şerefsiz', 'ibne', 'am', 'taşşak',
  'daşşak', 'yarak', 'çük', 'siktir', 'sikik', 'amk', 'aq',
  // Moderate
  'salak', 'aptal', 'gerizekalı', 'mal', 'dangalak', 'ahmak',
  'embesil', 'budala', 'hıyar', 'öküz', 'eşek',
]);

// Leetspeak mapping
const LEETSPEAK: Record<string, string> = {
  '4': 'a', '@': 'a', '3': 'e', '1': 'i', '!': 'i',
  '0': 'o', '5': 's', '$': 's', '9': 'g',
};

// Turkish number words
const TURKISH_NUMBERS: Record<string, string> = {
  sıfır: '0', bir: '1', iki: '2', üç: '3', dört: '4',
  beş: '5', altı: '6', yedi: '7', sekiz: '8', dokuz: '9',
};

// =============================================================================
// Validation Functions
// =============================================================================

function normalizeText(text: string): string {
  let normalized = text.toLowerCase();

  for (const [leet, char] of Object.entries(LEETSPEAK)) {
    normalized = normalized.split(leet).join(char);
  }

  normalized = normalized
    .replace(/ı/g, 'i')
    .replace(/ğ/g, 'g')
    .replace(/ü/g, 'u')
    .replace(/ş/g, 's')
    .replace(/ö/g, 'o')
    .replace(/ç/g, 'c')
    .replace(/[\s._-]/g, '');

  return normalized;
}

function checkBadWords(text: string): Violation[] {
  const violations: Violation[] = [];
  const normalized = normalizeText(text);

  for (const badWord of BAD_WORDS) {
    if (normalized.includes(badWord)) {
      violations.push({
        type: 'bad_word',
        matched: badWord,
        message: 'Uygunsuz kelime tespit edildi',
      });
      break;
    }
  }

  const words = text.toLowerCase().split(/\s+/);
  for (const word of words) {
    const cleanWord = word.replace(/[^a-zA-ZğüşöçıĞÜŞÖÇİ]/g, '');
    if (BAD_WORDS.has(cleanWord) && violations.length === 0) {
      violations.push({
        type: 'bad_word',
        matched: cleanWord,
        message: 'Uygunsuz kelime tespit edildi',
      });
      break;
    }
  }

  return violations;
}

function checkPhoneNumbers(text: string): Violation[] {
  const violations: Violation[] = [];

  const patterns = [
    /\b0?\s*5\s*[0-9]{2}\s*[0-9]{3}\s*[0-9]{2}\s*[0-9]{2}\b/,
    /\+?\s*9?\s*0?\s*5[0-9]{9}/,
    /5[0-9]{2}[\s.-]*[0-9]{3}[\s.-]*[0-9]{2}[\s.-]*[0-9]{2}/,
    /0?\s*(212|216|312|232|242|322)\s*[0-9]{3}\s*[0-9]{2}\s*[0-9]{2}/,
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) {
      violations.push({
        type: 'phone_number',
        matched: match[0],
        message: 'Telefon numarası paylaşımı yasaktır',
      });
      break;
    }
  }

  // Check written phone numbers
  const lowerText = text.toLowerCase();
  const numberWords = Object.keys(TURKISH_NUMBERS);
  let consecutiveNumbers = 0;
  let matchedText = '';

  const words = lowerText.split(/\s+/);
  for (const word of words) {
    const cleanWord = word.replace(/[^a-zA-ZğüşöçıĞÜŞÖÇİ]/g, '');
    if (numberWords.includes(cleanWord)) {
      consecutiveNumbers++;
      matchedText += (matchedText ? ' ' : '') + word;
      if (consecutiveNumbers >= 7) {
        violations.push({
          type: 'phone_number',
          matched: matchedText,
          message: 'Yazıyla yazılmış telefon numarası tespit edildi',
        });
        break;
      }
    } else {
      consecutiveNumbers = 0;
      matchedText = '';
    }
  }

  return violations;
}

function checkPII(text: string): Violation[] {
  const violations: Violation[] = [];

  // Email
  const emailMatch = text.match(
    /[a-zA-Z0-9._%+-]+\s*[@\[at\]]\s*[a-zA-Z0-9.-]+\s*[.\[dot\]]\s*[a-zA-Z]{2,}/i
  );
  if (emailMatch) {
    violations.push({
      type: 'pii',
      matched: emailMatch[0],
      message: 'E-posta adresi paylaşımı yasaktır',
    });
  }

  // TC Kimlik
  const tcMatch = text.match(/\b[1-9][0-9]{10}\b/);
  if (tcMatch && isValidTCKimlik(tcMatch[0])) {
    violations.push({
      type: 'pii',
      matched: tcMatch[0],
      message: 'TC Kimlik numarası paylaşımı yasaktır',
    });
  }

  // IBAN
  const ibanMatch = text.match(
    /TR\s*[0-9]{2}\s*[0-9]{4}\s*[0-9]{4}\s*[0-9]{4}\s*[0-9]{4}\s*[0-9]{4}\s*[0-9]{2}/i
  );
  if (ibanMatch) {
    violations.push({
      type: 'pii',
      matched: ibanMatch[0],
      message: 'IBAN paylaşımı yasaktır',
    });
  }

  // Credit Card
  const ccMatch = text.match(
    /\b[0-9]{4}[\s.-]*[0-9]{4}[\s.-]*[0-9]{4}[\s.-]*[0-9]{4}\b/
  );
  if (ccMatch && isValidCreditCard(ccMatch[0])) {
    violations.push({
      type: 'pii',
      matched: ccMatch[0],
      message: 'Kredi kartı numarası paylaşımı yasaktır',
    });
  }

  return violations;
}

function checkSpam(text: string): Violation[] {
  const violations: Violation[] = [];

  const spamPatterns = [
    /kazandın|kazandin/i,
    /ücretsiz.*hediye/i,
    /tıkla.*kazan/i,
    /hemen.*ara/i,
    /acele.*et/i,
    /son\s*(şans|fırsat)/i,
  ];

  for (const pattern of spamPatterns) {
    const match = text.match(pattern);
    if (match) {
      violations.push({
        type: 'spam',
        matched: match[0],
        message: 'Spam içerik tespit edildi',
      });
      break;
    }
  }

  return violations;
}

function checkExternalLinks(text: string): Violation[] {
  const violations: Violation[] = [];

  // URLs
  const urlMatch = text.match(/https?:\/\/[^\s]+|www\.[^\s]+/i);
  if (urlMatch) {
    violations.push({
      type: 'external_contact',
      matched: urlMatch[0],
      message: 'Harici link paylaşımı yasaktır',
    });
  }

  // Telegram
  const tgMatch = text.match(/t\.me\/[a-zA-Z0-9_]+/i);
  if (tgMatch) {
    violations.push({
      type: 'external_contact',
      matched: tgMatch[0],
      message: 'Telegram linki paylaşımı yasaktır',
    });
  }

  // WhatsApp
  const waMatch = text.match(/wa\.me\/[0-9]+/i);
  if (waMatch) {
    violations.push({
      type: 'external_contact',
      matched: waMatch[0],
      message: 'WhatsApp linki paylaşımı yasaktır',
    });
  }

  // Instagram
  const igMatch = text.match(/@[a-zA-Z0-9._]{3,30}/);
  if (igMatch && !text.includes('@travelmatch')) {
    violations.push({
      type: 'external_contact',
      matched: igMatch[0],
      message: 'Sosyal medya hesabı paylaşımı yasaktır',
    });
  }

  return violations;
}

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

function sanitizeContent(text: string): string {
  let result = text;

  // Replace phone numbers
  result = result.replace(
    /\b0?\s*5\s*[0-9]{2}\s*[0-9]{3}\s*[0-9]{2}\s*[0-9]{2}\b/g,
    '***'
  );
  result = result.replace(/5[0-9]{9}/g, '***');

  // Replace emails
  result = result.replace(
    /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g,
    '***'
  );

  // Replace URLs
  result = result.replace(/https?:\/\/[^\s]+/g, '***');
  result = result.replace(/www\.[^\s]+/g, '***');

  return result;
}

// =============================================================================
// Main Moderation Function
// =============================================================================

const DEFAULT_CONFIG: ModerationConfig = {
  blockBadWords: true,
  blockPhoneNumbers: true,
  blockPII: true,
  blockSpam: true,
  blockExternalLinks: true,
  strictMode: false,
};

export function moderateContent(
  content: string,
  config: ModerationConfig = {}
): ModerationResult {
  const opts = { ...DEFAULT_CONFIG, ...config };
  const violations: Violation[] = [];

  if (!content || content.trim().length === 0) {
    return {
      allowed: true,
      severity: 'none',
      violations: [],
    };
  }

  // Run all checks
  if (opts.blockBadWords) {
    violations.push(...checkBadWords(content));
  }

  if (opts.blockPhoneNumbers) {
    violations.push(...checkPhoneNumbers(content));
  }

  if (opts.blockPII) {
    violations.push(...checkPII(content));
  }

  if (opts.blockSpam) {
    violations.push(...checkSpam(content));
  }

  if (opts.blockExternalLinks) {
    violations.push(...checkExternalLinks(content));
  }

  // Calculate severity
  let severity: ModerationResult['severity'] = 'none';

  const hasCritical = violations.some(
    (v) =>
      v.type === 'pii' &&
      (v.message.includes('TC Kimlik') || v.message.includes('Kredi kartı'))
  );
  const hasHigh = violations.some(
    (v) => v.type === 'bad_word' || v.type === 'phone_number'
  );
  const hasMedium = violations.some(
    (v) => v.type === 'spam' || v.type === 'external_contact'
  );

  if (hasCritical) severity = 'critical';
  else if (hasHigh) severity = 'high';
  else if (hasMedium) severity = 'medium';
  else if (violations.length > 0) severity = 'low';

  // Determine if allowed
  const blockingSeverities = ['high', 'critical'];
  const allowed =
    violations.length === 0 ||
    (!opts.strictMode && !blockingSeverities.includes(severity));

  return {
    allowed,
    severity,
    violations,
    sanitizedContent: sanitizeContent(content),
  };
}

// =============================================================================
// Middleware Helper
// =============================================================================

/**
 * Create a moderation middleware for Edge Functions
 */
export function createModerationMiddleware(config?: ModerationConfig) {
  return (content: string) => moderateContent(content, config);
}

/**
 * Quick check function
 */
export function isContentAllowed(content: string): boolean {
  return moderateContent(content).allowed;
}

/**
 * Get error message for violations
 */
export function getViolationMessage(result: ModerationResult): string | null {
  if (result.violations.length === 0) return null;
  return result.violations[0].message;
}

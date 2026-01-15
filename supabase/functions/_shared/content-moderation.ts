/**
 * Server-Side Content Moderation (Bilingual - Turkish & English)
 *
 * Real-time content validation middleware for Edge Functions.
 * Second line of defense after client-side validation.
 */

// =============================================================================
// Types
// =============================================================================

export type SupportedLanguage = 'tr' | 'en' | 'auto';

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
  messageEn: string;
}

export interface ModerationConfig {
  language?: SupportedLanguage;
  blockBadWords?: boolean;
  blockPhoneNumbers?: boolean;
  blockPII?: boolean;
  blockSpam?: boolean;
  blockExternalLinks?: boolean;
  strictMode?: boolean;
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
    spam: 'Spam içerik tespit edildi',
    externalLink: 'Harici link paylaşımı yasaktır',
    telegram: 'Telegram linki paylaşımı yasaktır',
    whatsapp: 'WhatsApp linki paylaşımı yasaktır',
    socialMedia: 'Sosyal medya hesabı paylaşımı yasaktır',
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
    spam: 'Spam content detected',
    externalLink: 'External link sharing is not allowed',
    telegram: 'Telegram link sharing is not allowed',
    whatsapp: 'WhatsApp link sharing is not allowed',
    socialMedia: 'Social media account sharing is not allowed',
  },
};

// =============================================================================
// Bad Words Dictionary (Turkish & English)
// =============================================================================

const BAD_WORDS_TR = new Set([
  'orospu', 'piç', 'sik', 'amcık', 'yarrak', 'göt', 'kancık',
  'pezevenk', 'kahpe', 'şerefsiz', 'ibne', 'am', 'taşşak',
  'daşşak', 'yarak', 'çük', 'siktir', 'sikik', 'amk', 'aq',
  'salak', 'aptal', 'gerizekalı', 'mal', 'dangalak', 'ahmak',
  'embesil', 'budala', 'hıyar', 'öküz', 'eşek',
]);

const BAD_WORDS_EN = new Set([
  'fuck', 'shit', 'ass', 'bitch', 'bastard', 'cunt', 'dick',
  'cock', 'pussy', 'whore', 'slut', 'nigger', 'faggot', 'retard',
  'damn', 'crap', 'idiot', 'stupid', 'moron', 'dumb', 'jerk', 'loser',
]);

// Leetspeak mapping
const LEETSPEAK: Record<string, string> = {
  '4': 'a', '@': 'a', '3': 'e', '1': 'i', '!': 'i',
  '0': 'o', '5': 's', '$': 's', '9': 'g', '7': 't',
};

// Number words
const NUMBER_WORDS = {
  tr: {
    sıfır: '0', bir: '1', iki: '2', üç: '3', dört: '4',
    beş: '5', altı: '6', yedi: '7', sekiz: '8', dokuz: '9',
  } as Record<string, string>,
  en: {
    zero: '0', one: '1', two: '2', three: '3', four: '4',
    five: '5', six: '6', seven: '7', eight: '8', nine: '9',
  } as Record<string, string>,
};

// =============================================================================
// Validation Functions
// =============================================================================

function detectLanguage(text: string): 'tr' | 'en' {
  const turkishChars = /[ğüşöçıİĞÜŞÖÇ]/;
  if (turkishChars.test(text)) return 'tr';

  const turkishWords = ['ve', 'ile', 'için', 'bir', 'bu', 'şu', 'ne', 'var'];
  const words = text.toLowerCase().split(/\s+/);
  const turkishCount = words.filter((w) => turkishWords.includes(w)).length;

  return turkishCount > 0 ? 'tr' : 'en';
}

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

function checkBadWords(text: string, msgs: typeof MESSAGES['tr']): Violation[] {
  const violations: Violation[] = [];
  const normalized = normalizeText(text);

  // Check Turkish bad words
  for (const badWord of BAD_WORDS_TR) {
    if (normalized.includes(badWord)) {
      violations.push({
        type: 'bad_word',
        matched: badWord,
        message: msgs.badWord,
        messageEn: MESSAGES.en.badWord,
      });
      break;
    }
  }

  // Check English bad words
  if (violations.length === 0) {
    for (const badWord of BAD_WORDS_EN) {
      if (normalized.includes(badWord)) {
        violations.push({
          type: 'bad_word',
          matched: badWord,
          message: msgs.badWord,
          messageEn: MESSAGES.en.badWord,
        });
        break;
      }
    }
  }

  // Word by word check
  if (violations.length === 0) {
    const words = text.toLowerCase().split(/\s+/);
    for (const word of words) {
      const cleanWord = word.replace(/[^a-zA-ZğüşöçıĞÜŞÖÇİ]/g, '');
      if (BAD_WORDS_TR.has(cleanWord) || BAD_WORDS_EN.has(cleanWord)) {
        violations.push({
          type: 'bad_word',
          matched: cleanWord,
          message: msgs.badWord,
          messageEn: MESSAGES.en.badWord,
        });
        break;
      }
    }
  }

  return violations;
}

function checkPhoneNumbers(text: string, msgs: typeof MESSAGES['tr']): Violation[] {
  const violations: Violation[] = [];

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
    const match = text.match(pattern);
    if (match) {
      violations.push({
        type: 'phone_number',
        matched: match[0],
        message: msgs.phoneNumber,
        messageEn: MESSAGES.en.phoneNumber,
      });
      break;
    }
  }

  // Written phone numbers
  if (violations.length === 0) {
    for (const lang of ['tr', 'en'] as const) {
      const numberWordKeys = Object.keys(NUMBER_WORDS[lang]);
      let consecutiveNumbers = 0;
      let matchedText = '';

      const words = text.toLowerCase().split(/\s+/);
      for (const word of words) {
        const cleanWord = word.replace(/[^a-zA-ZğüşöçıĞÜŞÖÇİ]/g, '');
        if (numberWordKeys.includes(cleanWord)) {
          consecutiveNumbers++;
          matchedText += (matchedText ? ' ' : '') + word;
          if (consecutiveNumbers >= 7) {
            violations.push({
              type: 'phone_number',
              matched: matchedText,
              message: msgs.writtenPhone,
              messageEn: MESSAGES.en.writtenPhone,
            });
            break;
          }
        } else {
          consecutiveNumbers = 0;
          matchedText = '';
        }
      }
      if (violations.length > 0) break;
    }
  }

  return violations;
}

function checkPII(text: string, msgs: typeof MESSAGES['tr']): Violation[] {
  const violations: Violation[] = [];

  // Email
  const emailMatch = text.match(
    /[a-zA-Z0-9._%+-]+\s*[@\[at\]]\s*[a-zA-Z0-9.-]+\s*[.\[dot\]]\s*[a-zA-Z]{2,}/i
  );
  if (emailMatch) {
    violations.push({
      type: 'pii',
      matched: emailMatch[0],
      message: msgs.email,
      messageEn: MESSAGES.en.email,
    });
  }

  // TC Kimlik
  const tcMatch = text.match(/\b[1-9][0-9]{10}\b/);
  if (tcMatch && isValidTCKimlik(tcMatch[0])) {
    violations.push({
      type: 'pii',
      matched: tcMatch[0],
      message: msgs.tcKimlik,
      messageEn: MESSAGES.en.tcKimlik,
    });
  }

  // SSN (US)
  const ssnMatch = text.match(/\b[0-9]{3}[-\s]?[0-9]{2}[-\s]?[0-9]{4}\b/);
  if (ssnMatch && isValidSSN(ssnMatch[0])) {
    violations.push({
      type: 'pii',
      matched: ssnMatch[0],
      message: msgs.ssn,
      messageEn: MESSAGES.en.ssn,
    });
  }

  // IBAN
  const ibanMatch = text.match(
    /[A-Z]{2}\s*[0-9]{2}\s*[0-9A-Z\s]{12,30}/i
  );
  if (ibanMatch) {
    violations.push({
      type: 'pii',
      matched: ibanMatch[0],
      message: msgs.iban,
      messageEn: MESSAGES.en.iban,
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
      message: msgs.creditCard,
      messageEn: MESSAGES.en.creditCard,
    });
  }

  // Instagram
  const igMatch = text.match(/@[a-zA-Z0-9._]{3,30}/);
  if (igMatch && !text.includes('@lovendo')) {
    violations.push({
      type: 'external_contact',
      matched: igMatch[0],
      message: msgs.socialMedia,
      messageEn: MESSAGES.en.socialMedia,
    });
  }

  return violations;
}

function checkSpam(text: string, msgs: typeof MESSAGES['tr']): Violation[] {
  const violations: Violation[] = [];

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
  ];

  for (const pattern of spamPatterns) {
    const match = text.match(pattern);
    if (match) {
      violations.push({
        type: 'spam',
        matched: match[0],
        message: msgs.spam,
        messageEn: MESSAGES.en.spam,
      });
      break;
    }
  }

  return violations;
}

function checkExternalLinks(text: string, msgs: typeof MESSAGES['tr']): Violation[] {
  const violations: Violation[] = [];

  // URLs
  const urlMatch = text.match(/https?:\/\/[^\s]+|www\.[^\s]+/i);
  if (urlMatch) {
    violations.push({
      type: 'external_contact',
      matched: urlMatch[0],
      message: msgs.externalLink,
      messageEn: MESSAGES.en.externalLink,
    });
  }

  // Telegram
  const tgMatch = text.match(/t\.me\/[a-zA-Z0-9_]+/i);
  if (tgMatch) {
    violations.push({
      type: 'external_contact',
      matched: tgMatch[0],
      message: msgs.telegram,
      messageEn: MESSAGES.en.telegram,
    });
  }

  // WhatsApp
  const waMatch = text.match(/wa\.me\/[0-9]+/i);
  if (waMatch) {
    violations.push({
      type: 'external_contact',
      matched: waMatch[0],
      message: msgs.whatsapp,
      messageEn: MESSAGES.en.whatsapp,
    });
  }

  return violations;
}

function isValidTCKimlik(tc: string): boolean {
  const digits = tc.replace(/\D/g, '');
  if (digits.length !== 11 || digits[0] === '0') return false;

  const d = digits.split('').map(Number);
  if (d.length !== 11) return false;

  const check1 =
    ((d[0]! + d[2]! + d[4]! + d[6]! + d[8]!) * 7 -
      (d[1]! + d[3]! + d[5]! + d[7]!)) % 10;
  const check2 =
    (d[0]! + d[1]! + d[2]! + d[3]! + d[4]! + d[5]! + d[6]! + d[7]! + d[8]! + d[9]!) % 10;

  return check1 === d[9] && check2 === d[10];
}

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

function isValidCreditCard(cc: string): boolean {
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

function sanitizeContent(text: string): string {
  let result = text;

  // Phone numbers
  result = result.replace(
    /\b0?\s*5\s*[0-9]{2}\s*[0-9]{3}\s*[0-9]{2}\s*[0-9]{2}\b/g,
    '***'
  );
  result = result.replace(/5[0-9]{9}/g, '***');
  result = result.replace(
    /\b\+?1?\s*\(?[0-9]{3}\)?[\s.-]*[0-9]{3}[\s.-]*[0-9]{4}\b/g,
    '***'
  );

  // Emails
  result = result.replace(
    /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g,
    '***'
  );

  // URLs
  result = result.replace(/https?:\/\/[^\s]+/g, '***');
  result = result.replace(/www\.[^\s]+/g, '***');

  return result;
}

// =============================================================================
// Main Moderation Function
// =============================================================================

const DEFAULT_CONFIG: ModerationConfig = {
  language: 'auto',
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

  // Detect language
  const lang = opts.language === 'auto' ? detectLanguage(content) : opts.language || 'en';
  const msgs = MESSAGES[lang];

  // Run all checks
  if (opts.blockBadWords) {
    violations.push(...checkBadWords(content, msgs));
  }

  if (opts.blockPhoneNumbers) {
    violations.push(...checkPhoneNumbers(content, msgs));
  }

  if (opts.blockPII) {
    violations.push(...checkPII(content, msgs));
  }

  if (opts.blockSpam) {
    violations.push(...checkSpam(content, msgs));
  }

  if (opts.blockExternalLinks) {
    violations.push(...checkExternalLinks(content, msgs));
  }

  // Calculate severity
  let severity: ModerationResult['severity'] = 'none';

  const hasCritical = violations.some(
    (v) =>
      v.type === 'pii' &&
      (v.message.includes('TC Kimlik') ||
        v.message.includes('National ID') ||
        v.message.includes('Kredi kartı') ||
        v.message.includes('Credit card') ||
        v.message.includes('SSN') ||
        v.message.includes('Sosyal güvenlik'))
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
export function getViolationMessage(
  result: ModerationResult,
  lang: SupportedLanguage = 'auto'
): string | null {
  if (result.violations.length === 0) return null;

  // If auto, return the message in the detected language
  if (lang === 'auto') {
    return result.violations[0].message;
  }

  // Return English if requested
  if (lang === 'en') {
    return result.violations[0].messageEn || result.violations[0].message;
  }

  return result.violations[0].message;
}

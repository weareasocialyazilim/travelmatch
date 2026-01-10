/**
 * Turkish Content Moderation Library
 *
 * Real-time content filtering for:
 * - Bad words / profanity (Turkish)
 * - Phone numbers (numeric & written)
 * - Personal information (email, TC kimlik, IBAN)
 * - Spam patterns
 * - External links / contact attempts
 *
 * Designed for both client-side and server-side use.
 */

// =============================================================================
// Turkish Bad Words Dictionary
// =============================================================================

// Note: This is a sanitized list with common patterns.
// In production, this should be loaded from a secure, updateable source.
const BAD_WORDS_BASE = [
  // Level 1 - Severe (always block)
  'orospu',
  'piç',
  'sik',
  'amcık',
  'yarrak',
  'göt',
  'meme',
  'kancık',
  'pezevenk',
  'kahpe',
  'şerefsiz',
  'ibne',
  'top',
  'am',
  'taşşak',
  'daşşak',
  'yarak',
  'çük',
  'siktir',
  // Level 2 - Moderate
  'salak',
  'aptal',
  'gerizekalı',
  'mal',
  'dangalak',
  'geri zekalı',
  'ahmak',
  'embesil',
  'budala',
  'hıyar',
  'öküz',
  'eşek',
  // Level 3 - Mild (context-dependent)
  'lanet',
  'kahrolası',
  'allah belasını',
  'cehenneme',
];

// Leetspeak and evasion patterns
const LEETSPEAK_MAP: Record<string, string[]> = {
  a: ['4', '@', 'α', 'а', 'ä'],
  e: ['3', '€', 'є', 'е', 'ë'],
  i: ['1', '!', 'ı', 'і', 'î'],
  o: ['0', 'ο', 'о', 'ö'],
  u: ['μ', 'υ', 'ü', 'û'],
  s: ['5', '$', 'ş', 'ѕ'],
  g: ['9', 'ğ'],
  c: ['(', 'ç', 'с'],
};

// =============================================================================
// Phone Number Patterns
// =============================================================================

// Turkish phone number patterns
const PHONE_PATTERNS = {
  // Standard formats
  numeric: [
    /\b0?\s*5\s*[0-9]{2}\s*[0-9]{3}\s*[0-9]{2}\s*[0-9]{2}\b/g, // 0532 123 45 67
    /\b\+?\s*9?\s*0?\s*5\s*[0-9]{2}[\s.-]*[0-9]{3}[\s.-]*[0-9]{2}[\s.-]*[0-9]{2}\b/g, // +90 532 123 45 67
    /\b5[0-9]{9}\b/g, // 5321234567
    /\b0?[0-9]{3}[\s.-]*[0-9]{3}[\s.-]*[0-9]{2}[\s.-]*[0-9]{2}\b/g, // City codes 0212 xxx xx xx
  ],
  // Obfuscated patterns
  obfuscated: [
    /\b\d[\s._-]*\d[\s._-]*\d[\s._-]*\d[\s._-]*\d[\s._-]*\d[\s._-]*\d[\s._-]*\d[\s._-]*\d[\s._-]*\d\b/g, // Spaced numbers
    /beş\s*(üç|iki|dört|bir|sıfır|altı|yedi|sekiz|dokuz)/gi, // Written Turkish numbers starting with 5
  ],
};

// Turkish number words
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
  on: '10',
  yirmi: '20',
  otuz: '30',
  kırk: '40',
  elli: '50',
  altmış: '60',
  yetmiş: '70',
  seksen: '80',
  doksan: '90',
};

// =============================================================================
// PII Patterns
// =============================================================================

const PII_PATTERNS = {
  email:
    /\b[A-Za-z0-9._%+-]+\s*[@\[at\]]\s*[A-Za-z0-9.-]+\s*[.\[dot\]]\s*[A-Za-z]{2,}\b/gi,
  tcKimlik: /\b[1-9][0-9]{10}\b/g, // 11 digits starting with non-zero
  iban: /\bTR\s*[0-9]{2}\s*[0-9]{4}\s*[0-9]{4}\s*[0-9]{4}\s*[0-9]{4}\s*[0-9]{4}\s*[0-9]{2}\b/gi,
  creditCard: /\b[0-9]{4}[\s.-]*[0-9]{4}[\s.-]*[0-9]{4}[\s.-]*[0-9]{4}\b/g,
  instagram: /@[a-zA-Z0-9._]{1,30}/g,
  telegram: /t\.me\/[a-zA-Z0-9_]+/gi,
  whatsapp: /wa\.me\/[0-9]+/gi,
};

// =============================================================================
// Spam Patterns
// =============================================================================

const SPAM_PATTERNS = [
  /kazandın|kazandin/gi,
  /ücretsiz.*hediye/gi,
  /tıkla.*kazan/gi,
  /hemen.*ara/gi,
  /acele.*et/gi,
  /son\s*(şans|fırsat)/gi,
  /%\s*\d{2,3}\s*(indirim|off)/gi,
  /www\.[a-z]+\.[a-z]+/gi,
  /http[s]?:\/\//gi,
  /bit\.ly|tinyurl|goo\.gl/gi,
];

// =============================================================================
// Content Filter Class
// =============================================================================

export interface FilterResult {
  isBlocked: boolean;
  severity: 'none' | 'low' | 'medium' | 'high' | 'critical';
  violations: Violation[];
  sanitizedText?: string;
  suggestions?: string[];
}

export interface Violation {
  type: 'bad_word' | 'phone_number' | 'pii' | 'spam' | 'external_contact';
  matched: string;
  position: { start: number; end: number };
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
}

export interface FilterOptions {
  blockBadWords?: boolean;
  blockPhoneNumbers?: boolean;
  blockPII?: boolean;
  blockSpam?: boolean;
  blockExternalLinks?: boolean;
  sanitize?: boolean;
  strictMode?: boolean;
}

const DEFAULT_OPTIONS: FilterOptions = {
  blockBadWords: true,
  blockPhoneNumbers: true,
  blockPII: true,
  blockSpam: true,
  blockExternalLinks: true,
  sanitize: false,
  strictMode: false,
};

class TurkishContentFilter {
  private badWordsSet: Set<string>;
  private badWordsRegex: RegExp;
  private options: FilterOptions;

  constructor(options: FilterOptions = {}) {
    this.options = { ...DEFAULT_OPTIONS, ...options };
    this.badWordsSet = new Set(BAD_WORDS_BASE.map((w) => w.toLowerCase()));
    this.badWordsRegex = this.buildBadWordsRegex();
  }

  /**
   * Build regex that catches leetspeak variations
   */
  private buildBadWordsRegex(): RegExp {
    const patterns = BAD_WORDS_BASE.map((word) => {
      let pattern = '';
      for (const char of word.toLowerCase()) {
        const variations = LEETSPEAK_MAP[char];
        if (variations) {
          pattern += `[${char}${variations.join('')}]`;
        } else {
          pattern += char;
        }
        // Allow spaces/dots/dashes between characters (evasion attempt)
        pattern += '[\\s._-]*';
      }
      return pattern;
    });

    return new RegExp(`\\b(${patterns.join('|')})`, 'gi');
  }

  /**
   * Main filter method - checks content for violations
   */
  filter(text: string): FilterResult {
    const violations: Violation[] = [];
    let sanitizedText = text;

    // Check bad words
    if (this.options.blockBadWords) {
      violations.push(...this.checkBadWords(text));
    }

    // Check phone numbers
    if (this.options.blockPhoneNumbers) {
      violations.push(...this.checkPhoneNumbers(text));
    }

    // Check PII
    if (this.options.blockPII) {
      violations.push(...this.checkPII(text));
    }

    // Check spam
    if (this.options.blockSpam) {
      violations.push(...this.checkSpam(text));
    }

    // Check external links
    if (this.options.blockExternalLinks) {
      violations.push(...this.checkExternalLinks(text));
    }

    // Sanitize if requested
    if (this.options.sanitize && violations.length > 0) {
      sanitizedText = this.sanitizeText(text, violations);
    }

    // Determine overall severity
    const severity = this.calculateSeverity(violations);
    const isBlocked =
      severity === 'high' ||
      severity === 'critical' ||
      (this.options.strictMode === true && violations.length > 0);

    return {
      isBlocked,
      severity,
      violations,
      sanitizedText: this.options.sanitize ? sanitizedText : undefined,
      suggestions: this.generateSuggestions(violations),
    };
  }

  /**
   * Quick check - returns true if content should be blocked
   */
  shouldBlock(text: string): boolean {
    return this.filter(text).isBlocked;
  }

  /**
   * Check for bad words
   */
  private checkBadWords(text: string): Violation[] {
    const violations: Violation[] = [];
    const normalizedText = this.normalizeText(text);

    // Check with regex (catches leetspeak)
    let match;
    const regex = new RegExp(this.badWordsRegex.source, 'gi');
    while ((match = regex.exec(normalizedText)) !== null) {
      violations.push({
        type: 'bad_word',
        matched: match[0],
        position: { start: match.index, end: match.index + match[0].length },
        severity: this.getBadWordSeverity(match[0]),
        message: 'Uygunsuz kelime tespit edildi',
      });
    }

    // Also check word by word for exact matches
    const words = normalizedText.split(/\s+/);
    words.forEach((word) => {
      const cleanWord = word
        .replace(/[^a-zA-ZğüşöçıĞÜŞÖÇİ]/g, '')
        .toLowerCase();
      if (this.badWordsSet.has(cleanWord)) {
        const existingViolation = violations.find((v) =>
          v.matched.toLowerCase().includes(cleanWord),
        );
        if (!existingViolation) {
          violations.push({
            type: 'bad_word',
            matched: word,
            position: { start: 0, end: word.length },
            severity: this.getBadWordSeverity(cleanWord),
            message: 'Uygunsuz kelime tespit edildi',
          });
        }
      }
    });

    return violations;
  }

  /**
   * Check for phone numbers
   */
  private checkPhoneNumbers(text: string): Violation[] {
    const violations: Violation[] = [];

    // Check numeric patterns
    for (const pattern of PHONE_PATTERNS.numeric) {
      let match;
      const regex = new RegExp(pattern.source, 'g');
      while ((match = regex.exec(text)) !== null) {
        violations.push({
          type: 'phone_number',
          matched: match[0],
          position: { start: match.index, end: match.index + match[0].length },
          severity: 'high',
          message: 'Telefon numarası paylaşımı yasaktır',
        });
      }
    }

    // Check for written numbers (Turkish)
    const writtenPhone = this.detectWrittenPhoneNumber(text);
    if (writtenPhone) {
      violations.push({
        type: 'phone_number',
        matched: writtenPhone.text,
        position: { start: 0, end: writtenPhone.text.length },
        severity: 'high',
        message: 'Yazıyla yazılmış telefon numarası tespit edildi',
      });
    }

    return violations;
  }

  /**
   * Detect phone numbers written in Turkish words
   */
  private detectWrittenPhoneNumber(
    text: string,
  ): { text: string; number: string } | null {
    const lowerText = text.toLowerCase();
    const numberWords = Object.keys(TURKISH_NUMBERS);

    // Find sequences of number words
    let foundNumbers = '';
    let matchedText = '';
    let consecutiveCount = 0;

    const words = lowerText.split(/\s+/);
    for (const word of words) {
      // Remove punctuation
      const cleanWord = word.replace(/[^a-zA-ZğüşöçıĞÜŞÖÇİ]/g, '');

      if (numberWords.includes(cleanWord)) {
        foundNumbers += TURKISH_NUMBERS[cleanWord];
        matchedText += (matchedText ? ' ' : '') + word;
        consecutiveCount++;
      } else {
        // If we found at least 7 consecutive number words, it's likely a phone
        if (consecutiveCount >= 7) {
          return { text: matchedText, number: foundNumbers };
        }
        foundNumbers = '';
        matchedText = '';
        consecutiveCount = 0;
      }
    }

    // Check final sequence
    if (consecutiveCount >= 7) {
      return { text: matchedText, number: foundNumbers };
    }

    return null;
  }

  /**
   * Check for PII
   */
  private checkPII(text: string): Violation[] {
    const violations: Violation[] = [];

    // Email
    let match;
    while ((match = PII_PATTERNS.email.exec(text)) !== null) {
      violations.push({
        type: 'pii',
        matched: match[0],
        position: { start: match.index, end: match.index + match[0].length },
        severity: 'high',
        message: 'E-posta adresi paylaşımı yasaktır',
      });
    }

    // TC Kimlik
    const tcPattern = new RegExp(PII_PATTERNS.tcKimlik.source, 'g');
    while ((match = tcPattern.exec(text)) !== null) {
      // Validate TC Kimlik checksum
      if (this.isValidTCKimlik(match[0])) {
        violations.push({
          type: 'pii',
          matched: match[0],
          position: { start: match.index, end: match.index + match[0].length },
          severity: 'critical',
          message: 'TC Kimlik numarası paylaşımı yasaktır',
        });
      }
    }

    // IBAN
    const ibanPattern = new RegExp(PII_PATTERNS.iban.source, 'gi');
    while ((match = ibanPattern.exec(text)) !== null) {
      violations.push({
        type: 'pii',
        matched: match[0],
        position: { start: match.index, end: match.index + match[0].length },
        severity: 'critical',
        message: 'IBAN paylaşımı yasaktır',
      });
    }

    // Credit Card
    const ccPattern = new RegExp(PII_PATTERNS.creditCard.source, 'g');
    while ((match = ccPattern.exec(text)) !== null) {
      if (this.isValidCreditCard(match[0])) {
        violations.push({
          type: 'pii',
          matched: match[0],
          position: { start: match.index, end: match.index + match[0].length },
          severity: 'critical',
          message: 'Kredi kartı numarası paylaşımı yasaktır',
        });
      }
    }

    // Social media handles
    const igPattern = new RegExp(PII_PATTERNS.instagram.source, 'g');
    while ((match = igPattern.exec(text)) !== null) {
      violations.push({
        type: 'external_contact',
        matched: match[0],
        position: { start: match.index, end: match.index + match[0].length },
        severity: 'medium',
        message: 'Sosyal medya hesabı paylaşımı yasaktır',
      });
    }

    return violations;
  }

  /**
   * Check for spam patterns
   */
  private checkSpam(text: string): Violation[] {
    const violations: Violation[] = [];

    for (const pattern of SPAM_PATTERNS) {
      let match;
      const regex = new RegExp(pattern.source, 'gi');
      while ((match = regex.exec(text)) !== null) {
        violations.push({
          type: 'spam',
          matched: match[0],
          position: { start: match.index, end: match.index + match[0].length },
          severity: 'medium',
          message: 'Spam içerik tespit edildi',
        });
      }
    }

    return violations;
  }

  /**
   * Check for external links
   */
  private checkExternalLinks(text: string): Violation[] {
    const violations: Violation[] = [];

    // URLs
    const urlPattern = /https?:\/\/[^\s]+|www\.[^\s]+/gi;
    let match;
    while ((match = urlPattern.exec(text)) !== null) {
      violations.push({
        type: 'external_contact',
        matched: match[0],
        position: { start: match.index, end: match.index + match[0].length },
        severity: 'medium',
        message: 'Harici link paylaşımı yasaktır',
      });
    }

    // Telegram, WhatsApp links
    const tgPattern = new RegExp(PII_PATTERNS.telegram.source, 'gi');
    while ((match = tgPattern.exec(text)) !== null) {
      violations.push({
        type: 'external_contact',
        matched: match[0],
        position: { start: match.index, end: match.index + match[0].length },
        severity: 'high',
        message: 'Telegram linki paylaşımı yasaktır',
      });
    }

    const waPattern = new RegExp(PII_PATTERNS.whatsapp.source, 'gi');
    while ((match = waPattern.exec(text)) !== null) {
      violations.push({
        type: 'external_contact',
        matched: match[0],
        position: { start: match.index, end: match.index + match[0].length },
        severity: 'high',
        message: 'WhatsApp linki paylaşımı yasaktır',
      });
    }

    return violations;
  }

  /**
   * Validate TC Kimlik number with checksum
   */
  private isValidTCKimlik(tc: string): boolean {
    const digits = tc.replace(/\D/g, '');
    if (digits.length !== 11 || digits[0] === '0') return false;

    const d = digits.split('').map(Number);

    // Ensure we have all 11 digits
    if (d.length !== 11) return false;

    // Algorithm check
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
   * Validate credit card with Luhn algorithm
   */
  private isValidCreditCard(cc: string): boolean {
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
   * Normalize text for comparison
   */
  private normalizeText(text: string): string {
    return text
      .toLowerCase()
      .replace(/ı/g, 'i')
      .replace(/ğ/g, 'g')
      .replace(/ü/g, 'u')
      .replace(/ş/g, 's')
      .replace(/ö/g, 'o')
      .replace(/ç/g, 'c');
  }

  /**
   * Get severity level for a bad word
   */
  private getBadWordSeverity(
    word: string,
  ): 'low' | 'medium' | 'high' | 'critical' {
    const severeWords = ['orospu', 'piç', 'sik', 'amcık', 'yarrak'];
    const normalized = word.toLowerCase();

    if (severeWords.some((w) => normalized.includes(w))) {
      return 'critical';
    }
    return 'high';
  }

  /**
   * Calculate overall severity
   */
  private calculateSeverity(violations: Violation[]): FilterResult['severity'] {
    if (violations.length === 0) return 'none';

    const hasCritical = violations.some((v) => v.severity === 'critical');
    const hasHigh = violations.some((v) => v.severity === 'high');
    const hasMedium = violations.some((v) => v.severity === 'medium');

    if (hasCritical) return 'critical';
    if (hasHigh) return 'high';
    if (hasMedium) return 'medium';
    return 'low';
  }

  /**
   * Sanitize text by replacing violations
   */
  private sanitizeText(text: string, violations: Violation[]): string {
    let result = text;

    // Sort by position descending to replace from end
    const sorted = [...violations].sort(
      (a, b) => b.position.start - a.position.start,
    );

    for (const violation of sorted) {
      const replacement = '*'.repeat(violation.matched.length);
      result =
        result.slice(0, violation.position.start) +
        replacement +
        result.slice(violation.position.end);
    }

    return result;
  }

  /**
   * Generate user-friendly suggestions
   */
  private generateSuggestions(violations: Violation[]): string[] {
    const suggestions: string[] = [];

    const types = new Set(violations.map((v) => v.type));

    if (types.has('bad_word')) {
      suggestions.push('Lütfen uygunsuz kelimeler kullanmayın.');
    }
    if (types.has('phone_number')) {
      suggestions.push(
        'Güvenliğiniz için telefon numarası paylaşımı engellenmiştir.',
      );
    }
    if (types.has('pii')) {
      suggestions.push(
        'Kişisel bilgilerinizi korumak için bu tür bilgilerin paylaşımı engellenmiştir.',
      );
    }
    if (types.has('spam')) {
      suggestions.push(
        'Spam içerik tespit edildi, lütfen mesajınızı düzenleyin.',
      );
    }
    if (types.has('external_contact')) {
      suggestions.push('Platform dışı iletişim bilgileri paylaşılamaz.');
    }

    return suggestions;
  }
}

// =============================================================================
// Exports
// =============================================================================

export const contentFilter = new TurkishContentFilter();

export function createContentFilter(
  options?: FilterOptions,
): TurkishContentFilter {
  return new TurkishContentFilter(options);
}

export { TurkishContentFilter };

// Quick utility functions
export const filterContent = (text: string) => contentFilter.filter(text);
export const shouldBlockContent = (text: string) =>
  contentFilter.shouldBlock(text);

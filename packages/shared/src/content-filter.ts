/**
 * Bilingual Content Moderation Library (Turkish & English)
 *
 * Real-time content filtering for:
 * - Bad words / profanity (Turkish & English)
 * - Phone numbers (numeric & written in both languages)
 * - Personal information (email, TC kimlik, IBAN, SSN)
 * - Spam patterns
 * - External links / contact attempts
 *
 * Designed for both client-side and server-side use.
 */

// =============================================================================
// Supported Languages
// =============================================================================

export type SupportedLanguage = 'tr' | 'en' | 'auto';

// =============================================================================
// Bad Words Dictionaries
// =============================================================================

const BAD_WORDS_TR = [
  // Level 1 - Severe (always block)
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
  // Level 3 - Mild
  'lanet',
  'kahrolası',
];

const BAD_WORDS_EN = [
  // Level 1 - Severe
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
  // Level 2 - Moderate
  'damn',
  'crap',
  'idiot',
  'stupid',
  'moron',
  'dumb',
  'jerk',
  'loser',
  'sucker',
  'douche',
];

// Leetspeak mapping (works for both languages)
const LEETSPEAK_MAP: Record<string, string[]> = {
  a: ['4', '@', 'α', 'а', 'ä'],
  e: ['3', '€', 'є', 'е', 'ë'],
  i: ['1', '!', 'ı', 'і', 'î'],
  o: ['0', 'ο', 'о', 'ö'],
  u: ['μ', 'υ', 'ü', 'û'],
  s: ['5', '$', 'ş', 'ѕ'],
  g: ['9', 'ğ'],
  c: ['(', 'ç', 'с'],
  t: ['7', '+'],
};

// =============================================================================
// Phone Number Patterns
// =============================================================================

const PHONE_PATTERNS = {
  // Turkish patterns
  tr: [
    /\b0?\s*5\s*[0-9]{2}\s*[0-9]{3}\s*[0-9]{2}\s*[0-9]{2}\b/g,
    /\b\+?\s*9?\s*0?\s*5\s*[0-9]{2}[\s.-]*[0-9]{3}[\s.-]*[0-9]{2}[\s.-]*[0-9]{2}\b/g,
    /\b5[0-9]{9}\b/g,
    /\b0?[0-9]{3}[\s.-]*[0-9]{3}[\s.-]*[0-9]{2}[\s.-]*[0-9]{2}\b/g,
  ],
  // US/International patterns
  en: [
    /\b\+?1?\s*\(?[0-9]{3}\)?[\s.-]*[0-9]{3}[\s.-]*[0-9]{4}\b/g, // US format
    /\b\+?[0-9]{1,3}[\s.-]*[0-9]{3,4}[\s.-]*[0-9]{3,4}[\s.-]*[0-9]{3,4}\b/g, // International
  ],
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
// PII Patterns
// =============================================================================

const PII_PATTERNS = {
  email:
    /\b[A-Za-z0-9._%+-]+\s*[@\[at\]]\s*[A-Za-z0-9.-]+\s*[.\[dot\]]\s*[A-Za-z]{2,}\b/gi,
  tcKimlik: /\b[1-9][0-9]{10}\b/g, // Turkish ID
  ssn: /\b[0-9]{3}[-\s]?[0-9]{2}[-\s]?[0-9]{4}\b/g, // US SSN
  iban: /\b[A-Z]{2}\s*[0-9]{2}\s*[0-9A-Z\s]{12,30}\b/gi,
  creditCard: /\b[0-9]{4}[\s.-]*[0-9]{4}[\s.-]*[0-9]{4}[\s.-]*[0-9]{4}\b/g,
  instagram: /@[a-zA-Z0-9._]{1,30}/g,
  telegram: /t\.me\/[a-zA-Z0-9_]+/gi,
  whatsapp: /wa\.me\/[0-9]+/gi,
};

// =============================================================================
// Spam Patterns (Both Languages)
// =============================================================================

const SPAM_PATTERNS = [
  // Turkish
  /kazandın|kazandin/gi,
  /ücretsiz.*hediye/gi,
  /tıkla.*kazan/gi,
  /hemen.*ara/gi,
  /acele.*et/gi,
  /son\s*(şans|fırsat)/gi,
  // English
  /you\s*(have\s*)?won/gi,
  /free\s*gift/gi,
  /click\s*(here\s*)?to\s*win/gi,
  /call\s*now/gi,
  /act\s*fast/gi,
  /last\s*chance/gi,
  /limited\s*time\s*offer/gi,
  // Common
  /%\s*\d{2,3}\s*(indirim|off|discount)/gi,
  /www\.[a-z]+\.[a-z]+/gi,
  /http[s]?:\/\//gi,
  /bit\.ly|tinyurl|goo\.gl/gi,
];

// =============================================================================
// Messages (Bilingual)
// =============================================================================

export const MESSAGES = {
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
    suggestions: {
      badWord: 'Lütfen uygunsuz kelimeler kullanmayın.',
      phone: 'Güvenliğiniz için telefon numarası paylaşımı engellenmiştir.',
      pii: 'Kişisel bilgilerinizi korumak için bu tür bilgilerin paylaşımı engellenmiştir.',
      spam: 'Spam içerik tespit edildi, lütfen mesajınızı düzenleyin.',
      external: 'Platform dışı iletişim bilgileri paylaşılamaz.',
    },
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
    suggestions: {
      badWord: 'Please avoid using inappropriate language.',
      phone: 'Phone number sharing is blocked for your safety.',
      pii: 'Personal information sharing is blocked to protect your privacy.',
      spam: 'Spam content detected, please edit your message.',
      external: 'External contact information cannot be shared.',
    },
  },
};

// =============================================================================
// Types
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
  messageEn?: string;
}

export interface FilterOptions {
  language?: SupportedLanguage;
  blockBadWords?: boolean;
  blockPhoneNumbers?: boolean;
  blockPII?: boolean;
  blockSpam?: boolean;
  blockExternalLinks?: boolean;
  sanitize?: boolean;
  strictMode?: boolean;
}

const DEFAULT_OPTIONS: FilterOptions = {
  language: 'auto',
  blockBadWords: true,
  blockPhoneNumbers: true,
  blockPII: true,
  blockSpam: true,
  blockExternalLinks: true,
  sanitize: false,
  strictMode: false,
};

// =============================================================================
// Content Filter Class
// =============================================================================

class BilingualContentFilter {
  private badWordsTr: Set<string>;
  private badWordsEn: Set<string>;
  private badWordsRegexTr: RegExp;
  private badWordsRegexEn: RegExp;
  private options: FilterOptions;

  constructor(options: FilterOptions = {}) {
    this.options = { ...DEFAULT_OPTIONS, ...options };
    this.badWordsTr = new Set(BAD_WORDS_TR.map((w) => w.toLowerCase()));
    this.badWordsEn = new Set(BAD_WORDS_EN.map((w) => w.toLowerCase()));
    this.badWordsRegexTr = this.buildBadWordsRegex(BAD_WORDS_TR);
    this.badWordsRegexEn = this.buildBadWordsRegex(BAD_WORDS_EN);
  }

  /**
   * Build regex that catches leetspeak variations
   */
  private buildBadWordsRegex(words: string[]): RegExp {
    const patterns = words.map((word) => {
      let pattern = '';
      for (const char of word.toLowerCase()) {
        const variations = LEETSPEAK_MAP[char];
        if (variations) {
          pattern += `[${char}${variations.join('')}]`;
        } else {
          pattern += char;
        }
        pattern += '[\\s._-]*';
      }
      return pattern;
    });

    return new RegExp(`\\b(${patterns.join('|')})`, 'gi');
  }

  /**
   * Detect language from text
   */
  private detectLanguage(text: string): 'tr' | 'en' {
    const turkishChars = /[ğüşöçıİĞÜŞÖÇ]/;
    if (turkishChars.test(text)) return 'tr';

    // Check for Turkish words
    const turkishWords = ['ve', 'ile', 'için', 'bir', 'bu', 'şu', 'ne', 'var'];
    const words = text.toLowerCase().split(/\s+/);
    const turkishCount = words.filter((w) => turkishWords.includes(w)).length;

    return turkishCount > 0 ? 'tr' : 'en';
  }

  /**
   * Get messages for the current language
   */
  private getMessages(lang: 'tr' | 'en') {
    return MESSAGES[lang];
  }

  /**
   * Main filter method - checks content for violations
   */
  filter(text: string): FilterResult {
    const violations: Violation[] = [];
    let sanitizedText = text;

    const lang =
      this.options.language === 'auto'
        ? this.detectLanguage(text)
        : this.options.language || 'en';
    const msgs = this.getMessages(lang);

    // Check bad words (both languages always checked)
    if (this.options.blockBadWords) {
      violations.push(...this.checkBadWords(text, msgs));
    }

    // Check phone numbers
    if (this.options.blockPhoneNumbers) {
      violations.push(...this.checkPhoneNumbers(text, msgs));
    }

    // Check PII
    if (this.options.blockPII) {
      violations.push(...this.checkPII(text, msgs));
    }

    // Check spam
    if (this.options.blockSpam) {
      violations.push(...this.checkSpam(text, msgs));
    }

    // Check external links
    if (this.options.blockExternalLinks) {
      violations.push(...this.checkExternalLinks(text, msgs));
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
      suggestions: this.generateSuggestions(violations, lang),
    };
  }

  /**
   * Quick check - returns true if content should be blocked
   */
  shouldBlock(text: string): boolean {
    return this.filter(text).isBlocked;
  }

  /**
   * Check for bad words in both languages
   */
  private checkBadWords(
    text: string,
    msgs: (typeof MESSAGES)['tr'],
  ): Violation[] {
    const violations: Violation[] = [];
    const normalizedText = this.normalizeText(text);

    // Check Turkish bad words
    let match;
    const regexTr = new RegExp(this.badWordsRegexTr.source, 'gi');
    while ((match = regexTr.exec(normalizedText)) !== null) {
      violations.push({
        type: 'bad_word',
        matched: match[0],
        position: { start: match.index, end: match.index + match[0].length },
        severity: this.getBadWordSeverity(match[0], 'tr'),
        message: msgs.badWord,
        messageEn: MESSAGES.en.badWord,
      });
    }

    // Check English bad words
    const regexEn = new RegExp(this.badWordsRegexEn.source, 'gi');
    while ((match = regexEn.exec(normalizedText)) !== null) {
      violations.push({
        type: 'bad_word',
        matched: match[0],
        position: { start: match.index, end: match.index + match[0].length },
        severity: this.getBadWordSeverity(match[0], 'en'),
        message: msgs.badWord,
        messageEn: MESSAGES.en.badWord,
      });
    }

    // Also check word by word
    const words = normalizedText.split(/\s+/);
    words.forEach((word) => {
      const cleanWord = word
        .replace(/[^a-zA-ZğüşöçıĞÜŞÖÇİ]/g, '')
        .toLowerCase();

      if (this.badWordsTr.has(cleanWord) || this.badWordsEn.has(cleanWord)) {
        const existingViolation = violations.find((v) =>
          v.matched.toLowerCase().includes(cleanWord),
        );
        if (!existingViolation) {
          const lang = this.badWordsTr.has(cleanWord) ? 'tr' : 'en';
          violations.push({
            type: 'bad_word',
            matched: word,
            position: { start: 0, end: word.length },
            severity: this.getBadWordSeverity(cleanWord, lang),
            message: msgs.badWord,
            messageEn: MESSAGES.en.badWord,
          });
        }
      }
    });

    return violations;
  }

  /**
   * Check for phone numbers in both formats
   */
  private checkPhoneNumbers(
    text: string,
    msgs: (typeof MESSAGES)['tr'],
  ): Violation[] {
    const violations: Violation[] = [];

    // Check Turkish patterns
    for (const pattern of PHONE_PATTERNS.tr) {
      let match;
      const regex = new RegExp(pattern.source, 'g');
      while ((match = regex.exec(text)) !== null) {
        violations.push({
          type: 'phone_number',
          matched: match[0],
          position: { start: match.index, end: match.index + match[0].length },
          severity: 'high',
          message: msgs.phoneNumber,
          messageEn: MESSAGES.en.phoneNumber,
        });
      }
    }

    // Check US/International patterns
    for (const pattern of PHONE_PATTERNS.en) {
      let match;
      const regex = new RegExp(pattern.source, 'g');
      while ((match = regex.exec(text)) !== null) {
        violations.push({
          type: 'phone_number',
          matched: match[0],
          position: { start: match.index, end: match.index + match[0].length },
          severity: 'high',
          message: msgs.phoneNumber,
          messageEn: MESSAGES.en.phoneNumber,
        });
      }
    }

    // Check written numbers (Turkish)
    const writtenPhoneTr = this.detectWrittenPhoneNumber(text, 'tr');
    if (writtenPhoneTr) {
      violations.push({
        type: 'phone_number',
        matched: writtenPhoneTr.text,
        position: { start: 0, end: writtenPhoneTr.text.length },
        severity: 'high',
        message: msgs.writtenPhone,
        messageEn: MESSAGES.en.writtenPhone,
      });
    }

    // Check written numbers (English)
    const writtenPhoneEn = this.detectWrittenPhoneNumber(text, 'en');
    if (writtenPhoneEn) {
      violations.push({
        type: 'phone_number',
        matched: writtenPhoneEn.text,
        position: { start: 0, end: writtenPhoneEn.text.length },
        severity: 'high',
        message: msgs.writtenPhone,
        messageEn: MESSAGES.en.writtenPhone,
      });
    }

    return violations;
  }

  /**
   * Detect phone numbers written in words
   */
  private detectWrittenPhoneNumber(
    text: string,
    lang: 'tr' | 'en',
  ): { text: string; number: string } | null {
    const lowerText = text.toLowerCase();
    const numberWords = NUMBER_WORDS[lang];
    const numberWordKeys = Object.keys(numberWords);

    let foundNumbers = '';
    let matchedText = '';
    let consecutiveCount = 0;

    const words = lowerText.split(/\s+/);
    for (const word of words) {
      const cleanWord = word.replace(/[^a-zA-ZğüşöçıĞÜŞÖÇİ]/g, '');

      if (numberWordKeys.includes(cleanWord)) {
        foundNumbers += numberWords[cleanWord];
        matchedText += (matchedText ? ' ' : '') + word;
        consecutiveCount++;
      } else {
        if (consecutiveCount >= 7) {
          return { text: matchedText, number: foundNumbers };
        }
        foundNumbers = '';
        matchedText = '';
        consecutiveCount = 0;
      }
    }

    if (consecutiveCount >= 7) {
      return { text: matchedText, number: foundNumbers };
    }

    return null;
  }

  /**
   * Check for PII
   */
  private checkPII(text: string, msgs: (typeof MESSAGES)['tr']): Violation[] {
    const violations: Violation[] = [];

    // Email
    let match;
    const emailRegex = new RegExp(PII_PATTERNS.email.source, 'gi');
    while ((match = emailRegex.exec(text)) !== null) {
      violations.push({
        type: 'pii',
        matched: match[0],
        position: { start: match.index, end: match.index + match[0].length },
        severity: 'high',
        message: msgs.email,
        messageEn: MESSAGES.en.email,
      });
    }

    // TC Kimlik (Turkish ID)
    const tcPattern = new RegExp(PII_PATTERNS.tcKimlik.source, 'g');
    while ((match = tcPattern.exec(text)) !== null) {
      if (this.isValidTCKimlik(match[0])) {
        violations.push({
          type: 'pii',
          matched: match[0],
          position: { start: match.index, end: match.index + match[0].length },
          severity: 'critical',
          message: msgs.tcKimlik,
          messageEn: MESSAGES.en.tcKimlik,
        });
      }
    }

    // SSN (US)
    const ssnPattern = new RegExp(PII_PATTERNS.ssn.source, 'g');
    while ((match = ssnPattern.exec(text)) !== null) {
      if (this.isValidSSN(match[0])) {
        violations.push({
          type: 'pii',
          matched: match[0],
          position: { start: match.index, end: match.index + match[0].length },
          severity: 'critical',
          message: msgs.ssn,
          messageEn: MESSAGES.en.ssn,
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
        message: msgs.iban,
        messageEn: MESSAGES.en.iban,
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
          message: msgs.creditCard,
          messageEn: MESSAGES.en.creditCard,
        });
      }
    }

    // Social media handles
    const igPattern = new RegExp(PII_PATTERNS.instagram.source, 'g');
    while ((match = igPattern.exec(text)) !== null) {
      // Skip if it's the app's own handle
      if (
        !match[0].toLowerCase().includes('travelmatch') &&
        match[0].length > 2
      ) {
        violations.push({
          type: 'external_contact',
          matched: match[0],
          position: { start: match.index, end: match.index + match[0].length },
          severity: 'medium',
          message: msgs.socialMedia,
          messageEn: MESSAGES.en.socialMedia,
        });
      }
    }

    return violations;
  }

  /**
   * Check for spam patterns
   */
  private checkSpam(text: string, msgs: (typeof MESSAGES)['tr']): Violation[] {
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
          message: msgs.spam,
          messageEn: MESSAGES.en.spam,
        });
      }
    }

    return violations;
  }

  /**
   * Check for external links
   */
  private checkExternalLinks(
    text: string,
    msgs: (typeof MESSAGES)['tr'],
  ): Violation[] {
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
        message: msgs.externalLink,
        messageEn: MESSAGES.en.externalLink,
      });
    }

    // Telegram
    const tgPattern = new RegExp(PII_PATTERNS.telegram.source, 'gi');
    while ((match = tgPattern.exec(text)) !== null) {
      violations.push({
        type: 'external_contact',
        matched: match[0],
        position: { start: match.index, end: match.index + match[0].length },
        severity: 'high',
        message: msgs.telegram,
        messageEn: MESSAGES.en.telegram,
      });
    }

    // WhatsApp
    const waPattern = new RegExp(PII_PATTERNS.whatsapp.source, 'gi');
    while ((match = waPattern.exec(text)) !== null) {
      violations.push({
        type: 'external_contact',
        matched: match[0],
        position: { start: match.index, end: match.index + match[0].length },
        severity: 'high',
        message: msgs.whatsapp,
        messageEn: MESSAGES.en.whatsapp,
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
  private isValidSSN(ssn: string): boolean {
    const digits = ssn.replace(/\D/g, '');
    if (digits.length !== 9) return false;

    // SSN cannot start with 000, 666, or 900-999
    const area = parseInt(digits.substring(0, 3), 10);
    if (area === 0 || area === 666 || area >= 900) return false;

    // Group cannot be 00
    const group = parseInt(digits.substring(3, 5), 10);
    if (group === 0) return false;

    // Serial cannot be 0000
    const serial = parseInt(digits.substring(5, 9), 10);
    if (serial === 0) return false;

    return true;
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
    lang: 'tr' | 'en',
  ): 'low' | 'medium' | 'high' | 'critical' {
    const severeWordsTr = ['orospu', 'piç', 'sik', 'amcık', 'yarrak'];
    const severeWordsEn = ['fuck', 'cunt', 'nigger', 'faggot', 'shit', 'bitch'];
    const normalized = word.toLowerCase();

    const severeWords = lang === 'tr' ? severeWordsTr : severeWordsEn;
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
  private generateSuggestions(
    violations: Violation[],
    lang: 'tr' | 'en',
  ): string[] {
    const suggestions: string[] = [];
    const msgs = MESSAGES[lang].suggestions;
    const types = new Set(violations.map((v) => v.type));

    if (types.has('bad_word')) {
      suggestions.push(msgs.badWord);
    }
    if (types.has('phone_number')) {
      suggestions.push(msgs.phone);
    }
    if (types.has('pii')) {
      suggestions.push(msgs.pii);
    }
    if (types.has('spam')) {
      suggestions.push(msgs.spam);
    }
    if (types.has('external_contact')) {
      suggestions.push(msgs.external);
    }

    return suggestions;
  }
}

// =============================================================================
// Exports
// =============================================================================

export const contentFilter = new BilingualContentFilter();

export function createContentFilter(
  options?: FilterOptions,
): BilingualContentFilter {
  return new BilingualContentFilter(options);
}

export { BilingualContentFilter };

// Quick utility functions
export const filterContent = (text: string) => contentFilter.filter(text);
export const shouldBlockContent = (text: string) =>
  contentFilter.shouldBlock(text);

// Type alias for backward compatibility
export type TurkishContentFilter = BilingualContentFilter;

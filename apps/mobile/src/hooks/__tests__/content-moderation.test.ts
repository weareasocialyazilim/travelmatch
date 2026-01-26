/**
 * Content Moderation Tests
 */
import {
  validateMessage,
  checkBadWords,
  checkPhoneNumbers,
  checkPII,
  checkExternalLinks,
  isValidTCKimlik,
  isValidCreditCard,
} from '../useContentModeration';

describe('Content Moderation', () => {
  describe('checkBadWords', () => {
    it('should detect Turkish bad words', () => {
      const errors = checkBadWords('Seni sikeyim!', 'tr');
      expect(errors.length).toBeGreaterThan(0);
    });

    it('should detect English bad words', () => {
      const errors = checkBadWords('You are a faggot', 'en');
      expect(errors.length).toBeGreaterThan(0);
    });

    it('should handle leetspeak variations', () => {
      // f4gg0t -> faggot via 4->a and 0->o leetspeak mappings
      const errors = checkBadWords('He is such a f4gg0t', 'en');
      expect(errors.length).toBeGreaterThan(0);
    });

    it('should allow clean text', () => {
      const errors = checkBadWords('Merhaba, nasılsın?', 'tr');
      expect(errors.length).toBe(0);
    });
  });

  describe('checkPhoneNumbers', () => {
    it('should detect Turkish phone numbers', () => {
      const errors = checkPhoneNumbers('İletişim: 0555 123 45 67', 'tr');
      expect(errors.length).toBeGreaterThan(0);
    });

    it('should detect Turkish phone with country code', () => {
      const errors = checkPhoneNumbers('+90 555 123 4567', 'tr');
      expect(errors.length).toBeGreaterThan(0);
    });

    it('should detect US phone numbers', () => {
      const errors = checkPhoneNumbers('Call me: (555) 123-4567', 'en');
      expect(errors.length).toBeGreaterThan(0);
    });

    it('should allow text without phone numbers', () => {
      const errors = checkPhoneNumbers('Merhaba, bugün hava güzel', 'tr');
      expect(errors.length).toBe(0);
    });
  });

  describe('checkPII', () => {
    it('should detect email addresses', () => {
      const errors = checkPII('Contact test@example.com for info', 'en');
      expect(errors.length).toBeGreaterThan(0);
    });

    it('should detect TC Kimlik numbers', () => {
      // Valid TC Kimlik that passes checksum validation
      const errors = checkPII('TC Kimlik: 10000000146', 'tr');
      expect(errors.length).toBeGreaterThan(0);
    });

    it('should detect credit card numbers', () => {
      const errors = checkPII('Card: 4111 1111 1111 1111', 'en');
      expect(errors.length).toBeGreaterThan(0);
    });

    it('should detect IBAN', () => {
      const errors = checkPII('IBAN: TR12 3456 7890 1234 5678 9012 34', 'tr');
      expect(errors.length).toBeGreaterThan(0);
    });
  });

  describe('checkExternalLinks', () => {
    it('should detect HTTP URLs', () => {
      const errors = checkExternalLinks('Check this: https://example.com', 'en');
      expect(errors.length).toBeGreaterThan(0);
    });

    it('should detect Telegram links', () => {
      const errors = checkExternalLinks('Telegram: t.me/myuser', 'en');
      expect(errors.length).toBeGreaterThan(0);
    });

    it('should detect WhatsApp links', () => {
      const errors = checkExternalLinks('WhatsApp: wa.me/1234567890', 'en');
      expect(errors.length).toBeGreaterThan(0);
    });

    it('should detect Instagram handles', () => {
      const errors = checkExternalLinks('Follow me @someuser', 'en');
      expect(errors.length).toBeGreaterThan(0);
    });

    it('should allow clean text', () => {
      const errors = checkExternalLinks('Bugün çok güzel bir gün', 'tr');
      expect(errors.length).toBe(0);
    });
  });

  describe('isValidTCKimlik', () => {
    it('should validate correct TC Kimlik checksum', () => {
      // Valid test number that passes checksum validation
      // 10000000146: check1=4, check2=6 - both match
      expect(isValidTCKimlik('10000000146')).toBe(true);
    });

    it('should reject invalid TC Kimlik', () => {
      expect(isValidTCKimlik('123')).toBe(false);
    });

    it('should reject non-numeric', () => {
      expect(isValidTCKimlik('abc')).toBe(false);
    });
  });

  describe('isValidCreditCard', () => {
    it('should validate correct credit card (Luhn algorithm)', () => {
      // Valid Visa test number
      expect(isValidCreditCard('4111111111111111')).toBe(true);
    });

    it('should reject invalid credit card', () => {
      expect(isValidCreditCard('1234567890123456')).toBe(false);
    });
  });

  describe('validateMessage', () => {
    it('should reject message with phone number', () => {
      const result = validateMessage('Call me: 0555 123 45 67', 'tr');
      expect(result.canSend).toBe(false);
      expect(result.severity).toBe('high');
    });

    it('should reject message with bad words', () => {
      const result = validateMessage('Seni siktir git', 'tr');
      expect(result.canSend).toBe(false);
      expect(result.severity).toBe('high');
    });

    it('should reject message with external links', () => {
      const result = validateMessage('Visit https://spam.com', 'en');
      expect(result.canSend).toBe(false);
    });

    it('should reject message with critical PII', () => {
      const result = validateMessage('Card: 4111 1111 1111 1111', 'en');
      expect(result.canSend).toBe(false);
      expect(result.severity).toBe('critical');
    });

    it('should allow clean message', () => {
      const result = validateMessage('Merhaba, nasılsın?', 'tr');
      expect(result.canSend).toBe(true);
      expect(result.severity).toBe('none');
    });

    it('should sanitize sensitive content', () => {
      const result = validateMessage('Email: test@example.com', 'en');
      expect(result.sanitizedText).toBe('Email: ***');
    });
  });
});

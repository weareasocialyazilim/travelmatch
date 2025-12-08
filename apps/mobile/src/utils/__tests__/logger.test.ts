/**
 * Logger Sensitive Data Filtering Tests
 * Tests GDPR-compliant data sanitization
 */

import { Logger } from '../logger';

describe('Logger - Sensitive Data Filtering', () => {
  let logger: Logger;

  beforeEach(() => {
    logger = new Logger({ enableInProduction: true });
  });

  describe('sanitizeData - Object filtering', () => {
    it('should redact password fields', () => {
      const testData = { username: 'john', password: 'secret123' };
      // Access private method via any for testing
      const sanitized = (logger as any).sanitizeData(testData);
      expect(sanitized.password).toBe('[REDACTED]');
      expect(sanitized.username).toBe('john');
    });

    it('should redact token fields', () => {
      const testData = { user: 'john', access_token: 'abc123xyz' };
      const sanitized = (logger as any).sanitizeData(testData);
      expect(sanitized.access_token).toBe('[REDACTED]');
      expect(sanitized.user).toBe('john');
    });

    it('should redact email fields', () => {
      const testData = { name: 'John', email: 'john@example.com' };
      const sanitized = (logger as any).sanitizeData(testData);
      expect(sanitized.email).toBe('[REDACTED]');
      expect(sanitized.name).toBe('John');
    });

    it('should redact phone fields', () => {
      const testData = { name: 'John', phone: '+905551234567' };
      const sanitized = (logger as any).sanitizeData(testData);
      expect(sanitized.phone).toBe('[REDACTED]');
      expect(sanitized.name).toBe('John');
    });

    it('should redact credit card fields', () => {
      const testData = { amount: 100, credit_card: '4111111111111111' };
      const sanitized = (logger as any).sanitizeData(testData);
      expect(sanitized.credit_card).toBe('[REDACTED]');
      expect(sanitized.amount).toBe(100);
    });

    it('should handle nested objects', () => {
      const testData = {
        user: {
          name: 'John',
          credentials: {
            password: 'secret',
            api_key: 'key123',
          },
        },
      };
      const sanitized = (logger as any).sanitizeData(testData);
      expect(sanitized.user.name).toBe('John');
      expect(sanitized.user.credentials.password).toBe('[REDACTED]');
      expect(sanitized.user.credentials.api_key).toBe('[REDACTED]');
    });

    it('should handle arrays', () => {
      const testData = [
        { id: 1, password: 'secret1' },
        { id: 2, password: 'secret2' },
      ];
      const sanitized = (logger as any).sanitizeData(testData) as any[];
      expect(sanitized[0].password).toBe('[REDACTED]');
      expect(sanitized[1].password).toBe('[REDACTED]');
      expect(sanitized[0].id).toBe(1);
      expect(sanitized[1].id).toBe(2);
    });

    it('should handle case-insensitive matching', () => {
      const testData = {
        PASSWORD: 'secret',
        Password: 'secret',
        ApiKey: 'key123',
      };
      const sanitized = (logger as any).sanitizeData(testData);
      expect(sanitized.PASSWORD).toBe('[REDACTED]');
      expect(sanitized.Password).toBe('[REDACTED]');
      expect(sanitized.ApiKey).toBe('[REDACTED]');
    });
  });

  describe('sanitizeMessage - String pattern filtering', () => {
    it('should redact JWT tokens', () => {
      const message =
        'Auth token: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIn0.dozjgNryP4J3jVmNHl0w5N_XgL0n3I9PlFUP0THsR8U';
      const sanitized = (logger as any).sanitizeMessage(message);
      expect(sanitized).toContain('[JWT_REDACTED]');
      expect(sanitized).not.toContain('eyJ');
    });

    it('should redact Bearer tokens', () => {
      const message = 'Authorization: Bearer abc123def456';
      const sanitized = (logger as any).sanitizeMessage(message);
      expect(sanitized).toContain('Bearer [REDACTED]');
      expect(sanitized).not.toContain('abc123def456');
    });

    it('should redact email addresses', () => {
      const message = 'User email: john.doe@example.com sent request';
      const sanitized = (logger as any).sanitizeMessage(message);
      expect(sanitized).toContain('[EMAIL_REDACTED]');
      expect(sanitized).not.toContain('john.doe@example.com');
    });

    it('should redact phone numbers', () => {
      const message = 'Contact: +905551234567';
      const sanitized = (logger as any).sanitizeMessage(message);
      expect(sanitized).toContain('[PHONE_REDACTED]');
      expect(sanitized).not.toContain('+905551234567');
    });

    it('should redact credit card numbers', () => {
      const message = 'Card: 4111 1111 1111 1111';
      const sanitized = (logger as any).sanitizeMessage(message);
      expect(sanitized).toContain('[CARD_REDACTED]');
      expect(sanitized).not.toContain('4111 1111 1111 1111');
    });

    it('should redact API keys', () => {
      const message =
        'API key: sk_test_4eC39HqLyjWDarjtT1zdp7dc used for request';
      const sanitized = (logger as any).sanitizeMessage(message);
      expect(sanitized).toContain('[KEY_REDACTED]');
      expect(sanitized).not.toContain('sk_test_4eC39HqLyjWDarjtT1zdp7dc');
    });

    it('should preserve non-sensitive content', () => {
      const message = 'User logged in successfully';
      const sanitized = (logger as any).sanitizeMessage(message);
      expect(sanitized).toBe(message);
    });
  });

  describe('GDPR Compliance', () => {
    it('should redact all PII in complex log entry', () => {
      const message = 'User john@example.com registered with phone +905551234567';
      const data = {
        email: 'john@example.com',
        password: 'Secret123!',
        phone: '+905551234567',
        credit_card: '4111111111111111',
        cvv: '123',
        address: '123 Main St',
        token: 'Bearer abc123xyz',
      };

      const sanitizedMsg = (logger as any).sanitizeMessage(message);
      const sanitizedData = (logger as any).sanitizeData(data);

      // Check message sanitization
      expect(sanitizedMsg).not.toContain('john@example.com');
      expect(sanitizedMsg).not.toContain('+905551234567');

      // Check data sanitization
      expect(sanitizedData.email).toBe('[REDACTED]');
      expect(sanitizedData.password).toBe('[REDACTED]');
      expect(sanitizedData.phone).toBe('[REDACTED]');
      expect(sanitizedData.credit_card).toBe('[REDACTED]');
      expect(sanitizedData.cvv).toBe('[REDACTED]');
      expect(sanitizedData.address).toBe('[REDACTED]');
      expect(sanitizedData.token).toBe('[REDACTED]');
    });

    it('should sanitize data before remote logging', () => {
      const consoleSpy = jest.spyOn(console, 'info').mockImplementation();
      const testLogger = new Logger({
        enableInProduction: true,
        enableRemoteLogging: true,
      });

      testLogger.info('Login attempt', {
        email: 'user@example.com',
        password: 'secret123',
      });

      // Verify queueRemoteLog was called with sanitized data
      const remoteQueue = (testLogger as any).remoteLogQueue;
      expect(remoteQueue.length).toBe(1);
      expect(remoteQueue[0].args[0].email).toBe('[REDACTED]');
      expect(remoteQueue[0].args[0].password).toBe('[REDACTED]');

      consoleSpy.mockRestore();
    });
  });

  describe('Performance', () => {
    it('should handle large objects efficiently', () => {
      const largeData = {
        users: Array.from({ length: 1000 }, (_, i) => ({
          id: i,
          email: `user${i}@example.com`,
          password: `secret${i}`,
          token: `token${i}`,
        })),
      };

      const start = performance.now();
      (logger as any).sanitizeData(largeData);
      const duration = performance.now() - start;

      // Should complete in reasonable time (< 100ms for 1000 items)
      expect(duration).toBeLessThan(100);
    });
  });
});

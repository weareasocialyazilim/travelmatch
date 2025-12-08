/**
 * Logger Utility Tests (Simplified)
 * Tests for Logger class with PII redaction and log levels
 * Target Coverage: 80%+
 */

import { Logger } from '@/utils/logger';

// Mock console methods
const mockConsoleLog = jest.spyOn(console, 'log').mockImplementation();
const mockConsoleInfo = jest.spyOn(console, 'info').mockImplementation();
const mockConsoleWarn = jest.spyOn(console, 'warn').mockImplementation();
const mockConsoleError = jest.spyOn(console, 'error').mockImplementation();

// Save original __DEV__
const originalDEV = global.__DEV__;

describe('logger.ts - simplified', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Ensure __DEV__ is false so we can control logging via enableInProduction
    global.__DEV__ = false;
  });

  afterAll(() => {
    global.__DEV__ = originalDEV;
    mockConsoleLog.mockRestore();
    mockConsoleInfo.mockRestore();
    mockConsoleWarn.mockRestore();
    mockConsoleError.mockRestore();
  });

  describe('basic logging', () => {
    it('should create logger instance', () => {
      const logger = new Logger();
      expect(logger).toBeInstanceOf(Logger);
    });

    it('should log with production flag', () => {
      const logger = new Logger({ enableInProduction: true, jsonFormat: false });
      logger.info('test');
      expect(mockConsoleLog).toHaveBeenCalled();
    });

    it('should log warnings', () => {
      const logger = new Logger({ enableInProduction: true, jsonFormat: false });
      logger.warn('warning');
      expect(mockConsoleWarn).toHaveBeenCalled();
    });

    it('should log errors', () => {
      const logger = new Logger({ enableInProduction: true, jsonFormat: false });
      logger.error('error');
      expect(mockConsoleError).toHaveBeenCalled();
    });
  });

  describe('PII redaction', () => {
    it('should redact passwords', () => {
      const logger = new Logger({ enableInProduction: true, jsonFormat: false });
      logger.info('data', { password: 'secret123' });
      
      const logOutput = mockConsoleLog.mock.calls[0][0];
      expect(logOutput).not.toContain('secret123');
      expect(logOutput).toContain('[REDACTED]');
    });

    it('should redact tokens', () => {
      const logger = new Logger({ enableInProduction: true, jsonFormat: false });
      logger.info('data', { token: 'abc123', apiKey: 'xyz789' });
      
      const logOutput = mockConsoleLog.mock.calls[0][0];
      expect(logOutput).not.toContain('abc123');
      expect(logOutput).not.toContain('xyz789');
    });

    it('should redact nested sensitive data', () => {
      const logger = new Logger({ enableInProduction: true, jsonFormat: false });
      const data = {
        user: {
          name: 'John',
          password: 'secret',
        },
      };
      logger.info('nested', data);
      
      const logOutput = mockConsoleLog.mock.calls[0][0];
      expect(logOutput).toContain('John');
      expect(logOutput).not.toContain('secret');
    });

    it('should redact JWT tokens in strings', () => {
      const logger = new Logger({ enableInProduction: true, jsonFormat: false });
      const jwt = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.test.test';
      logger.info(`Token: ${jwt}`);
      
      const logOutput = mockConsoleLog.mock.calls[0][0];
      expect(logOutput).toContain('[JWT_REDACTED]');
      expect(logOutput).not.toContain('eyJhbGci');
    });

    it('should redact emails in strings', () => {
      const logger = new Logger({ enableInProduction: true, jsonFormat: false });
      logger.info('Email: john@example.com');
      
      const logOutput = mockConsoleLog.mock.calls[0][0];
      expect(logOutput).toContain('[EMAIL_REDACTED]');
      expect(logOutput).not.toContain('john@example.com');
    });
  });

  describe('log levels', () => {
    it('should respect minimum log level', () => {
      const logger = new Logger({ 
        enableInProduction: true,
        jsonFormat: false,
        minLevel: 'warn' 
      });
      
      logger.debug('debug');
      logger.info('info');
      
      expect(mockConsoleLog).not.toHaveBeenCalled();
    });

    it('should always log errors regardless of level', () => {
      const logger = new Logger({ 
        enableInProduction: true,
        jsonFormat: false,
        minLevel: 'warn' 
      });
      
      logger.error('error');
      expect(mockConsoleError).toHaveBeenCalled();
    });

    it('should allow changing minimum level', () => {
      const logger = new Logger({ enableInProduction: true, jsonFormat: false });
      logger.setMinLevel('error');
      
      logger.info('should not log');
      expect(mockConsoleLog).not.toHaveBeenCalled();
    });
  });

  describe('child loggers', () => {
    it('should create child logger', () => {
      const parent = new Logger({ prefix: '[Parent]' });
      const child = parent.child('[Child]');
      
      expect(child).toBeInstanceOf(Logger);
    });

    it('should combine prefixes', () => {
      const parent = new Logger({ 
        prefix: '[Parent]',
        enableInProduction: true,
        jsonFormat: false
      });
      const child = parent.child('[Child]');
      
      child.info('test');
      const logOutput = mockConsoleLog.mock.calls[0][0];
      expect(logOutput).toContain('[Parent]');
      expect(logOutput).toContain('[Child]');
    });
  });

  describe('performance timing', () => {
    it('should track time for operations', () => {
      const logger = new Logger({ enableInProduction: true, jsonFormat: false });
      logger.time('operation');
      const duration = logger.timeEnd('operation');
      
      expect(duration).toBeGreaterThanOrEqual(0);
      expect(typeof duration).toBe('number');
    });

    it('should return undefined for non-existent timer', () => {
      const logger = new Logger({ enableInProduction: true, jsonFormat: false });
      const duration = logger.timeEnd('non-existent');
      
      expect(duration).toBeUndefined();
    });
  });

  describe('context logging', () => {
    it('should add context to logs', () => {
      const logger = new Logger({ enableInProduction: true, jsonFormat: false });
      const contextLogger = logger.withContext({ userId: '123' });
      
      contextLogger.info('action');
      const logOutput = mockConsoleLog.mock.calls[0][0];
      expect(logOutput).toContain('123');
    });

    it('should sanitize context data', () => {
      const logger = new Logger({ enableInProduction: true, jsonFormat: false });
      const contextLogger = logger.withContext({ password: 'secret' });
      
      contextLogger.info('action');
      const logOutput = mockConsoleLog.mock.calls[0][0];
      expect(logOutput).not.toContain('secret');
    });
  });

  describe('error handling', () => {
    it('should log Error objects', () => {
      const logger = new Logger({ enableInProduction: true, jsonFormat: false });
      const error = new Error('Test error');
      
      logger.error('Error occurred', error);
      expect(mockConsoleError).toHaveBeenCalled();
    });

    it('should handle null data', () => {
      const logger = new Logger({ enableInProduction: true, jsonFormat: false });
      expect(() => logger.info('Null', null as any)).not.toThrow();
    });

    it('should handle undefined data', () => {
      const logger = new Logger({ enableInProduction: true, jsonFormat: false });
      expect(() => logger.info('Undefined', undefined)).not.toThrow();
    });

    it('should handle empty strings', () => {
      const logger = new Logger({ enableInProduction: true, jsonFormat: false });
      expect(() => logger.info('')).not.toThrow();
    });
  });

  describe('configuration', () => {
    it('should use custom prefix', () => {
      const logger = new Logger({ 
        prefix: '[CustomApp]',
        enableInProduction: true,
        jsonFormat: false
      });
      
      logger.info('test');
      const logOutput = mockConsoleLog.mock.calls[0][0];
      expect(logOutput).toContain('[CustomApp]');
    });

    it('should not log in production by default', () => {
      const logger = new Logger();
      logger.info('test');
      
      // Should not log since enableInProduction is false and __DEV__ is false
      expect(mockConsoleLog).not.toHaveBeenCalled();
    });
  });

  describe('remote logging', () => {
    it('should create logger with remote logging enabled', () => {
      const logger = new Logger({ 
        enableRemoteLogging: true,
        enableInProduction: true,
        jsonFormat: false
      });
      
      expect(logger).toBeInstanceOf(Logger);
    });

    it('should call destroy without errors', () => {
      const logger = new Logger({ enableRemoteLogging: true });
      expect(() => logger.destroy()).not.toThrow();
    });
  });
});

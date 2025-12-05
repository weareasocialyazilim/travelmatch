/**
 * Logger Utilities Tests
 * Tests for logging functionality
 */

import { Logger, logger } from '../logger';

describe('Logger Utilities', () => {
  let consoleSpy: {
    log: jest.SpyInstance;
    info: jest.SpyInstance;
    warn: jest.SpyInstance;
    error: jest.SpyInstance;
    group: jest.SpyInstance;
    groupEnd: jest.SpyInstance;
    table: jest.SpyInstance;
    time: jest.SpyInstance;
    timeEnd: jest.SpyInstance;
  };

  beforeEach(() => {
    consoleSpy = {
      log: jest.spyOn(console, 'log').mockImplementation(),
      info: jest.spyOn(console, 'info').mockImplementation(),
      warn: jest.spyOn(console, 'warn').mockImplementation(),
      error: jest.spyOn(console, 'error').mockImplementation(),
      group: jest.spyOn(console, 'group').mockImplementation(),
      groupEnd: jest.spyOn(console, 'groupEnd').mockImplementation(),
      table: jest.spyOn(console, 'table').mockImplementation(),
      time: jest.spyOn(console, 'time').mockImplementation(),
      timeEnd: jest.spyOn(console, 'timeEnd').mockImplementation(),
    };
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('Logger class', () => {
    describe('debug', () => {
      it('should log debug messages in development', () => {
        const testLogger = new Logger();
        testLogger.debug('Debug message');

        expect(consoleSpy.log).toHaveBeenCalled();
        expect(consoleSpy.log.mock.calls[0][0]).toContain('[DEBUG]');
        expect(consoleSpy.log.mock.calls[0][0]).toContain('Debug message');
      });

      it('should include timestamp in log message', () => {
        const testLogger = new Logger();
        testLogger.debug('Test message');

        const loggedMessage = consoleSpy.log.mock.calls[0][0];
        // Check for ISO date format
        expect(loggedMessage).toMatch(/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
      });
    });

    describe('info', () => {
      it('should log info messages', () => {
        const testLogger = new Logger();
        testLogger.info('Info message');

        expect(consoleSpy.info).toHaveBeenCalled();
        expect(consoleSpy.info.mock.calls[0][0]).toContain('[INFO]');
      });
    });

    describe('warn', () => {
      it('should always log warnings', () => {
        const testLogger = new Logger({ enableInProduction: false });
        testLogger.warn('Warning message');

        expect(consoleSpy.warn).toHaveBeenCalled();
        expect(consoleSpy.warn.mock.calls[0][0]).toContain('[WARN]');
      });
    });

    describe('error', () => {
      it('should always log errors', () => {
        const testLogger = new Logger({ enableInProduction: false });
        const error = new Error('Test error');
        testLogger.error('Error occurred', error);

        expect(consoleSpy.error).toHaveBeenCalled();
        expect(consoleSpy.error.mock.calls[0][0]).toContain('[ERROR]');
        expect(consoleSpy.error.mock.calls[0][1]).toBe(error);
      });

      it('should handle errors without Error object', () => {
        const testLogger = new Logger();
        testLogger.error('Simple error message');

        expect(consoleSpy.error).toHaveBeenCalled();
      });
    });

    describe('group', () => {
      it('should create log group', () => {
        const testLogger = new Logger();
        const callback = jest.fn();

        testLogger.group('Test Group', callback);

        expect(consoleSpy.group).toHaveBeenCalled();
        expect(callback).toHaveBeenCalled();
        expect(consoleSpy.groupEnd).toHaveBeenCalled();
      });
    });

    describe('data', () => {
      it('should log data with table', () => {
        const testLogger = new Logger();
        const testData = [{ id: 1, name: 'Test' }];

        testLogger.data('Test Data', testData);

        expect(consoleSpy.log).toHaveBeenCalled();
        expect(consoleSpy.table).toHaveBeenCalledWith(testData);
      });
    });

    describe('time/timeEnd', () => {
      it('should use console.time and console.timeEnd', () => {
        const testLogger = new Logger();

        testLogger.time('Performance Test');
        testLogger.timeEnd('Performance Test');

        expect(consoleSpy.time).toHaveBeenCalled();
        expect(consoleSpy.timeEnd).toHaveBeenCalled();
      });
    });

    describe('custom prefix', () => {
      it('should use custom prefix', () => {
        const testLogger = new Logger({ prefix: '[CustomApp]' });
        testLogger.debug('Message');

        expect(consoleSpy.log.mock.calls[0][0]).toContain('[CustomApp]');
      });
    });
  });

  describe('logger singleton', () => {
    it('should be a Logger instance', () => {
      expect(logger).toBeInstanceOf(Logger);
    });

    it('should use default TravelMatch prefix', () => {
      logger.debug('Test');

      expect(consoleSpy.log.mock.calls[0][0]).toContain('[TravelMatch]');
    });
  });
});

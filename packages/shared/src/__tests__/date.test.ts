/**
 * Date Utilities - Comprehensive Tests
 *
 * Tests for date functions:
 * - Relative time formatting
 * - Date formatting (short, long, time, datetime)
 * - Date checks (isToday, isYesterday)
 * - Date manipulation (startOfDay, endOfDay, addDays, subtractDays)
 * - Date calculations (daysBetween)
 * - Duration formatting
 */

import {
  formatRelativeTime,
  formatShortDate,
  formatLongDate,
  formatTime,
  formatDateTime,
  isToday,
  isYesterday,
  startOfDay,
  endOfDay,
  addDays,
  subtractDays,
  daysBetween,
  formatDuration,
} from '../utils/date';

describe('Date Utilities', () => {
  // Mock current date for consistent testing
  const NOW = new Date('2024-06-15T12:00:00Z');

  beforeAll(() => {
    jest.useFakeTimers();
    jest.setSystemTime(NOW);
  });

  afterAll(() => {
    jest.useRealTimers();
  });

  describe('formatRelativeTime', () => {
    it('should return "just now" for recent times', () => {
      const justNow = new Date(NOW.getTime() - 30 * 1000); // 30 seconds ago
      expect(formatRelativeTime(justNow)).toBe('just now');
    });

    it('should return minutes ago for times within an hour', () => {
      const fiveMinutesAgo = new Date(NOW.getTime() - 5 * 60 * 1000);
      expect(formatRelativeTime(fiveMinutesAgo)).toBe('5m ago');

      const thirtyMinutesAgo = new Date(NOW.getTime() - 30 * 60 * 1000);
      expect(formatRelativeTime(thirtyMinutesAgo)).toBe('30m ago');
    });

    it('should return hours ago for times within a day', () => {
      const twoHoursAgo = new Date(NOW.getTime() - 2 * 60 * 60 * 1000);
      expect(formatRelativeTime(twoHoursAgo)).toBe('2h ago');

      const twentyThreeHoursAgo = new Date(NOW.getTime() - 23 * 60 * 60 * 1000);
      expect(formatRelativeTime(twentyThreeHoursAgo)).toBe('23h ago');
    });

    it('should return days ago for times within a week', () => {
      const twoDaysAgo = new Date(NOW.getTime() - 2 * 24 * 60 * 60 * 1000);
      expect(formatRelativeTime(twoDaysAgo)).toBe('2d ago');

      const sixDaysAgo = new Date(NOW.getTime() - 6 * 24 * 60 * 60 * 1000);
      expect(formatRelativeTime(sixDaysAgo)).toBe('6d ago');
    });

    it('should return weeks ago for times within a month', () => {
      const twoWeeksAgo = new Date(NOW.getTime() - 14 * 24 * 60 * 60 * 1000);
      expect(formatRelativeTime(twoWeeksAgo)).toBe('2w ago');
    });

    it('should return months ago for times within a year', () => {
      const twoMonthsAgo = new Date(NOW.getTime() - 60 * 24 * 60 * 60 * 1000);
      expect(formatRelativeTime(twoMonthsAgo)).toBe('2mo ago');
    });

    it('should return years ago for older times', () => {
      const twoYearsAgo = new Date(NOW.getTime() - 730 * 24 * 60 * 60 * 1000);
      expect(formatRelativeTime(twoYearsAgo)).toBe('2y ago');
    });

    it('should handle string date input', () => {
      const dateString = new Date(NOW.getTime() - 5 * 60 * 1000).toISOString();
      expect(formatRelativeTime(dateString)).toBe('5m ago');
    });
  });

  describe('formatShortDate', () => {
    it('should format date in short format', () => {
      const result = formatShortDate('2024-01-15');
      expect(result).toBe('Jan 15, 2024');
    });

    it('should handle Date objects', () => {
      const date = new Date('2024-06-20');
      const result = formatShortDate(date);
      expect(result).toBe('Jun 20, 2024');
    });

    it('should respect locale', () => {
      const result = formatShortDate('2024-01-15', 'de-DE');
      expect(result).toContain('2024');
      expect(result).toContain('15');
    });
  });

  describe('formatLongDate', () => {
    it('should format date in long format', () => {
      const result = formatLongDate('2024-01-15');
      expect(result).toBe('January 15, 2024');
    });

    it('should handle Date objects', () => {
      const date = new Date('2024-06-20');
      const result = formatLongDate(date);
      expect(result).toBe('June 20, 2024');
    });

    it('should respect locale', () => {
      const result = formatLongDate('2024-01-15', 'de-DE');
      expect(result).toContain('2024');
    });
  });

  describe('formatTime', () => {
    it('should format time with AM/PM', () => {
      const result = formatTime('2024-01-15T14:30:00');
      expect(result).toBe('2:30 PM');
    });

    it('should handle morning times', () => {
      const result = formatTime('2024-01-15T09:15:00');
      expect(result).toBe('9:15 AM');
    });

    it('should handle midnight', () => {
      const result = formatTime('2024-01-15T00:00:00');
      expect(result).toBe('12:00 AM');
    });

    it('should handle noon', () => {
      const result = formatTime('2024-01-15T12:00:00');
      expect(result).toBe('12:00 PM');
    });
  });

  describe('formatDateTime', () => {
    it('should format date and time together', () => {
      const result = formatDateTime('2024-01-15T14:30:00');
      expect(result).toBe('Jan 15, 2024 at 2:30 PM');
    });

    it('should handle Date objects', () => {
      const date = new Date('2024-06-20T09:00:00');
      const result = formatDateTime(date);
      expect(result).toContain('Jun 20, 2024');
      expect(result).toContain('at');
    });
  });

  describe('isToday', () => {
    it('should return true for today', () => {
      expect(isToday(NOW)).toBe(true);
      expect(isToday(NOW.toISOString())).toBe(true);
    });

    it('should return true for different times today', () => {
      const morningToday = new Date(NOW);
      morningToday.setHours(6, 0, 0, 0);
      expect(isToday(morningToday)).toBe(true);

      const eveningToday = new Date(NOW);
      eveningToday.setHours(23, 59, 59, 999);
      expect(isToday(eveningToday)).toBe(true);
    });

    it('should return false for yesterday', () => {
      const yesterday = new Date(NOW.getTime() - 24 * 60 * 60 * 1000);
      expect(isToday(yesterday)).toBe(false);
    });

    it('should return false for tomorrow', () => {
      const tomorrow = new Date(NOW.getTime() + 24 * 60 * 60 * 1000);
      expect(isToday(tomorrow)).toBe(false);
    });
  });

  describe('isYesterday', () => {
    it('should return true for yesterday', () => {
      const yesterday = new Date(NOW.getTime() - 24 * 60 * 60 * 1000);
      expect(isYesterday(yesterday)).toBe(true);
    });

    it('should return false for today', () => {
      expect(isYesterday(NOW)).toBe(false);
    });

    it('should return false for two days ago', () => {
      const twoDaysAgo = new Date(NOW.getTime() - 2 * 24 * 60 * 60 * 1000);
      expect(isYesterday(twoDaysAgo)).toBe(false);
    });

    it('should handle string dates', () => {
      const yesterday = new Date(NOW.getTime() - 24 * 60 * 60 * 1000);
      expect(isYesterday(yesterday.toISOString())).toBe(true);
    });
  });

  describe('startOfDay', () => {
    it('should return start of day for given date', () => {
      const date = new Date('2024-06-15T14:30:45.123Z');
      const result = startOfDay(date);
      expect(result.getHours()).toBe(0);
      expect(result.getMinutes()).toBe(0);
      expect(result.getSeconds()).toBe(0);
      expect(result.getMilliseconds()).toBe(0);
    });

    it('should use current date when no argument provided', () => {
      const result = startOfDay();
      expect(result.getDate()).toBe(NOW.getDate());
      expect(result.getHours()).toBe(0);
    });

    it('should not modify original date', () => {
      const original = new Date('2024-06-15T14:30:45.123Z');
      const originalTime = original.getTime();
      startOfDay(original);
      expect(original.getTime()).toBe(originalTime);
    });
  });

  describe('endOfDay', () => {
    it('should return end of day for given date', () => {
      const date = new Date('2024-06-15T14:30:45.123Z');
      const result = endOfDay(date);
      expect(result.getHours()).toBe(23);
      expect(result.getMinutes()).toBe(59);
      expect(result.getSeconds()).toBe(59);
      expect(result.getMilliseconds()).toBe(999);
    });

    it('should use current date when no argument provided', () => {
      const result = endOfDay();
      expect(result.getDate()).toBe(NOW.getDate());
      expect(result.getHours()).toBe(23);
    });

    it('should not modify original date', () => {
      const original = new Date('2024-06-15T14:30:45.123Z');
      const originalTime = original.getTime();
      endOfDay(original);
      expect(original.getTime()).toBe(originalTime);
    });
  });

  describe('addDays', () => {
    it('should add days correctly', () => {
      const date = new Date('2024-06-15');
      expect(addDays(date, 5).getDate()).toBe(20);
      expect(addDays(date, 1).getDate()).toBe(16);
    });

    it('should handle month boundaries', () => {
      const date = new Date('2024-06-28');
      const result = addDays(date, 5);
      expect(result.getMonth()).toBe(6); // July (0-indexed)
      expect(result.getDate()).toBe(3);
    });

    it('should handle year boundaries', () => {
      const date = new Date('2024-12-30');
      const result = addDays(date, 5);
      expect(result.getFullYear()).toBe(2025);
      expect(result.getMonth()).toBe(0); // January
      expect(result.getDate()).toBe(4);
    });

    it('should handle zero days', () => {
      const date = new Date('2024-06-15');
      expect(addDays(date, 0).getDate()).toBe(15);
    });

    it('should not modify original date', () => {
      const original = new Date('2024-06-15');
      const originalTime = original.getTime();
      addDays(original, 5);
      expect(original.getTime()).toBe(originalTime);
    });
  });

  describe('subtractDays', () => {
    it('should subtract days correctly', () => {
      const date = new Date('2024-06-15');
      expect(subtractDays(date, 5).getDate()).toBe(10);
      expect(subtractDays(date, 1).getDate()).toBe(14);
    });

    it('should handle month boundaries', () => {
      const date = new Date('2024-06-05');
      const result = subtractDays(date, 10);
      expect(result.getMonth()).toBe(4); // May (0-indexed)
      expect(result.getDate()).toBe(26);
    });

    it('should handle year boundaries', () => {
      const date = new Date('2024-01-05');
      const result = subtractDays(date, 10);
      expect(result.getFullYear()).toBe(2023);
      expect(result.getMonth()).toBe(11); // December
    });

    it('should not modify original date', () => {
      const original = new Date('2024-06-15');
      const originalTime = original.getTime();
      subtractDays(original, 5);
      expect(original.getTime()).toBe(originalTime);
    });
  });

  describe('daysBetween', () => {
    it('should calculate days between dates correctly', () => {
      const date1 = new Date('2024-06-01');
      const date2 = new Date('2024-06-15');
      expect(daysBetween(date1, date2)).toBe(14);
    });

    it('should return absolute difference regardless of order', () => {
      const date1 = new Date('2024-06-15');
      const date2 = new Date('2024-06-01');
      expect(daysBetween(date1, date2)).toBe(14);
    });

    it('should return 0 for same date', () => {
      const date = new Date('2024-06-15');
      expect(daysBetween(date, date)).toBe(0);
    });

    it('should handle large differences', () => {
      const date1 = new Date('2020-01-01');
      const date2 = new Date('2024-01-01');
      expect(daysBetween(date1, date2)).toBe(1461); // Including leap year
    });
  });

  describe('formatDuration', () => {
    it('should format seconds', () => {
      expect(formatDuration(30 * 1000)).toBe('30s');
      expect(formatDuration(59 * 1000)).toBe('59s');
    });

    it('should format minutes', () => {
      expect(formatDuration(60 * 1000)).toBe('1m');
      expect(formatDuration(5 * 60 * 1000)).toBe('5m');
      expect(formatDuration(59 * 60 * 1000)).toBe('59m');
    });

    it('should format hours and minutes', () => {
      expect(formatDuration(60 * 60 * 1000)).toBe('1h 0m');
      expect(formatDuration(2 * 60 * 60 * 1000 + 30 * 60 * 1000)).toBe('2h 30m');
    });

    it('should format days and hours', () => {
      expect(formatDuration(24 * 60 * 60 * 1000)).toBe('1d 0h');
      expect(formatDuration(2 * 24 * 60 * 60 * 1000 + 5 * 60 * 60 * 1000)).toBe('2d 5h');
    });

    it('should handle zero duration', () => {
      expect(formatDuration(0)).toBe('0s');
    });
  });
});

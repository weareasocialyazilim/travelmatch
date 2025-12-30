import {
  cn,
  formatDate,
  formatRelativeDate,
  formatCurrency,
  formatNumber,
  truncate,
  generateId,
  getInitials,
  sleep,
  debounce,
  parseError,
} from '../utils';

describe('Utils', () => {
  describe('cn (className merger)', () => {
    it('merges class names correctly', () => {
      expect(cn('class1', 'class2')).toBe('class1 class2');
    });

    it('handles conditional classes', () => {
      expect(cn('base', true && 'included', false && 'excluded')).toBe(
        'base included'
      );
    });

    it('handles undefined values', () => {
      expect(cn('base', undefined, 'other')).toBe('base other');
    });

    it('deduplicates Tailwind classes', () => {
      // twMerge should handle conflicting Tailwind classes
      expect(cn('px-2', 'px-4')).toBe('px-4');
    });
  });

  describe('formatDate', () => {
    it('formats Date object correctly', () => {
      const date = new Date('2024-03-15T14:30:00');
      const result = formatDate(date);
      expect(result).toMatch(/15/);
      expect(result).toMatch(/03/);
      expect(result).toMatch(/2024/);
    });

    it('formats string date correctly', () => {
      const result = formatDate('2024-03-15T14:30:00');
      expect(result).toMatch(/15/);
      expect(result).toMatch(/03/);
      expect(result).toMatch(/2024/);
    });
  });

  describe('formatRelativeDate', () => {
    beforeEach(() => {
      jest.useFakeTimers();
      jest.setSystemTime(new Date('2024-03-15T12:00:00'));
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('returns "şimdi" for very recent dates', () => {
      const date = new Date('2024-03-15T11:59:30');
      expect(formatRelativeDate(date)).toBe('şimdi');
    });

    it('returns minutes ago for recent dates', () => {
      const date = new Date('2024-03-15T11:30:00');
      expect(formatRelativeDate(date)).toBe('30 dakika önce');
    });

    it('returns hours ago for same day', () => {
      const date = new Date('2024-03-15T09:00:00');
      expect(formatRelativeDate(date)).toBe('3 saat önce');
    });

    it('returns days ago for recent days', () => {
      const date = new Date('2024-03-13T12:00:00');
      expect(formatRelativeDate(date)).toBe('2 gün önce');
    });

    it('returns formatted date for older dates', () => {
      const date = new Date('2024-03-01T12:00:00');
      const result = formatRelativeDate(date);
      expect(result).toMatch(/01/);
      expect(result).toMatch(/03/);
      expect(result).toMatch(/2024/);
    });
  });

  describe('formatCurrency', () => {
    it('formats TRY currency correctly', () => {
      const result = formatCurrency(1234.56);
      expect(result).toContain('1.234');
      expect(result).toContain('₺');
    });

    it('formats USD currency correctly', () => {
      const result = formatCurrency(1234.56, 'USD');
      expect(result).toContain('$');
    });

    it('formats EUR currency correctly', () => {
      const result = formatCurrency(1234.56, 'EUR');
      expect(result).toContain('€');
    });
  });

  describe('formatNumber', () => {
    it('returns number as string for small numbers', () => {
      expect(formatNumber(123)).toBe('123');
    });

    it('formats thousands with K suffix', () => {
      expect(formatNumber(1500)).toBe('1.5K');
    });

    it('formats millions with M suffix', () => {
      expect(formatNumber(2500000)).toBe('2.5M');
    });

    it('handles exact boundaries', () => {
      expect(formatNumber(1000)).toBe('1.0K');
      expect(formatNumber(1000000)).toBe('1.0M');
    });
  });

  describe('truncate', () => {
    it('does not truncate short strings', () => {
      expect(truncate('Hello', 10)).toBe('Hello');
    });

    it('truncates long strings with ellipsis', () => {
      expect(truncate('Hello World', 5)).toBe('Hello...');
    });

    it('handles exact length', () => {
      expect(truncate('Hello', 5)).toBe('Hello');
    });
  });

  describe('generateId', () => {
    it('generates a string', () => {
      expect(typeof generateId()).toBe('string');
    });

    it('generates different IDs on each call', () => {
      const id1 = generateId();
      const id2 = generateId();
      expect(id1).not.toBe(id2);
    });

    it('generates IDs of expected length', () => {
      const id = generateId();
      expect(id.length).toBe(7); // substring(2, 9) = 7 chars
    });
  });

  describe('getInitials', () => {
    it('gets initials from two word name', () => {
      expect(getInitials('John Doe')).toBe('JD');
    });

    it('gets initials from single word name', () => {
      expect(getInitials('John')).toBe('J');
    });

    it('limits to two initials', () => {
      expect(getInitials('John William Doe')).toBe('JW');
    });

    it('handles lowercase names', () => {
      expect(getInitials('john doe')).toBe('JD');
    });
  });

  describe('sleep', () => {
    it('resolves after specified time', async () => {
      jest.useFakeTimers();
      const promise = sleep(1000);
      jest.advanceTimersByTime(1000);
      await expect(promise).resolves.toBeUndefined();
      jest.useRealTimers();
    });
  });

  describe('debounce', () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('debounces function calls', () => {
      const fn = jest.fn() as jest.Mock;
      const debouncedFn = debounce(fn, 100);

      debouncedFn();
      debouncedFn();
      debouncedFn();

      expect(fn).not.toHaveBeenCalled();

      jest.advanceTimersByTime(100);

      expect(fn).toHaveBeenCalledTimes(1);
    });

    it('passes arguments to debounced function', () => {
      const fn = jest.fn() as jest.Mock;
      const debouncedFn = debounce(fn, 100);

      debouncedFn('arg1', 'arg2');
      jest.advanceTimersByTime(100);

      expect(fn).toHaveBeenCalledWith('arg1', 'arg2');
    });
  });

  describe('parseError', () => {
    it('extracts message from Error object', () => {
      const error = new Error('Test error message');
      expect(parseError(error)).toBe('Test error message');
    });

    it('returns string as-is', () => {
      expect(parseError('String error')).toBe('String error');
    });

    it('returns default message for unknown types', () => {
      expect(parseError(null)).toBe('Bilinmeyen bir hata oluştu');
      expect(parseError({})).toBe('Bilinmeyen bir hata oluştu');
      expect(parseError(123)).toBe('Bilinmeyen bir hata oluştu');
    });
  });
});

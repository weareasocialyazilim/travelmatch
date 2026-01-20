/* eslint-env jest */
/* eslint-disable @typescript-eslint/no-require-imports */
// Jest setup file for admin app
require('@testing-library/jest-dom');

// Ensure jsdom environment globals are available
if (typeof window === 'undefined') {
  global.window = {};
}
if (typeof document === 'undefined') {
  const { JSDOM } = require('jsdom');
  const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>', {
    url: 'http://localhost',
    pretendToBeVisual: true,
  });
  global.document = dom.window.document;
  global.window = dom.window;
  global.navigator = dom.window.navigator;
}

// Mock date-fns/locale with proper formatDistance function
jest.mock('date-fns/locale', () => ({
  tr: {
    code: 'tr',
    formatDistance: (token, count) => {
      const formatDistanceLocale = {
        lessThanXSeconds: 'az önce',
        xSeconds: '{{count}} saniye',
        halfAMinute: 'yarım dakika',
        lessThanXMinutes: '{{count}} dakikadan az',
        xMinutes: '{{count}} dakika',
        aboutXHours: 'yaklaşık {{count}} saat',
        xHours: '{{count}} saat',
        xDays: '{{count}} gün',
        aboutXWeeks: 'yaklaşık {{count}} hafta',
        xWeeks: '{{count}} hafta',
        aboutXMonths: 'yaklaşık {{count}} ay',
        xMonths: '{{count}} ay',
        aboutXYears: 'yaklaşık {{count}} yıl',
        xYears: '{{count}} yıl',
        overXYears: '{{count}} yıldan fazla',
        almostXYears: 'neredeyse {{count}} yıl',
      };
      const result = formatDistanceLocale[token] || token;
      return result.replace('{{count}}', String(count));
    },
    formatLong: {
      date: () => 'dd/MM/yyyy',
      time: () => 'HH:mm',
      dateTime: () => 'dd/MM/yyyy HH:mm',
    },
    localize: {
      ordinalNumber: (number) => `${number}.`,
      era: (era) => ['M.Ö.', 'M.S.'][era],
      quarter: (quarter) => `${quarter}. çeyrek`,
      month: (month) =>
        [
          'Oca',
          'Şub',
          'Mar',
          'Nis',
          'May',
          'Haz',
          'Tem',
          'Ağu',
          'Eyl',
          'Eki',
          'Kas',
          'Ara',
        ][month],
      day: (day) => ['Paz', 'Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt'][day],
      dayPeriod: (dayPeriod) => (dayPeriod === 'am' ? 'ÖÖ' : 'ÖS'),
    },
    formatRelative: () => 'dd/MM/yyyy',
    match: {
      ordinalNumber: () => ({ value: 0, rest: '' }),
      era: () => ({ value: 0, rest: '' }),
      quarter: () => ({ value: 0, rest: '' }),
      month: () => ({ value: 0, rest: '' }),
      day: () => ({ value: 0, rest: '' }),
      dayPeriod: () => ({ value: 'am', rest: '' }),
    },
    options: {
      weekStartsOn: 1,
      firstWeekContainsDate: 1,
    },
  },
}));

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    refresh: jest.fn(),
  }),
  usePathname: () => '/admin',
  useSearchParams: () => new URLSearchParams(),
}));

// Set timezone to UTC for consistent date tests
process.env.TZ = 'UTC';

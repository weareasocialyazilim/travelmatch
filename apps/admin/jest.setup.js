// Jest setup file for admin app

// Mock date-fns/locale with proper formatDistance function
jest.mock('date-fns/locale', () => ({
  tr: {
    code: 'tr',
    formatDistance: (token, count) => {
      const formatDistanceLocale = {
        lessThanXSeconds: 'az \u00F6nce',
        xSeconds: '{{count}} saniye',
        halfAMinute: 'yar\u0131m dakika',
        lessThanXMinutes: '{{count}} dakikadan az',
        xMinutes: '{{count}} dakika',
        aboutXHours: 'yakla\u015F\u0131k {{count}} saat',
        xHours: '{{count}} saat',
        xDays: '{{count}} g\u00FCn',
        aboutXWeeks: 'yakla\u015F\u0131k {{count}} hafta',
        xWeeks: '{{count}} hafta',
        aboutXMonths: 'yakla\u015F\u0131k {{count}} ay',
        xMonths: '{{count}} ay',
        aboutXYears: 'yakla\u015F\u0131k {{count}} y\u0131l',
        xYears: '{{count}} y\u0131l',
        overXYears: '{{count}} y\u0131ldan fazla',
        almostXYears: 'neredeyse {{count}} y\u0131l',
      };
      const result = formatDistanceLocale[token] || token;
      return result.replace('{{count}}', String(count));
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

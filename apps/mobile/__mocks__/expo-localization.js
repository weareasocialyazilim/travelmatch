/**
 * Mock for expo-localization
 * Provides consistent locale data for tests
 */
module.exports = {
  getLocales: () => [
    {
      languageCode: 'tr',
      languageTag: 'tr-TR',
      textDirection: 'ltr',
      digitGroupingSeparator: '.',
      decimalSeparator: ',',
      measurementSystem: 'metric',
      currencyCode: 'TRY',
      currencySymbol: '₺',
      regionCode: 'TR',
    },
  ],
  getCalendars: () => [
    {
      calendar: 'gregorian',
      timeZone: 'Europe/Istanbul',
      uses24hourClock: true,
      firstWeekday: 1,
    },
  ],
  locale: 'tr-TR',
  locales: ['tr-TR'],
  timezone: 'Europe/Istanbul',
  isRTL: false,
  region: 'TR',
  isoCurrencyCodes: ['TRY', 'USD', 'EUR'],
};

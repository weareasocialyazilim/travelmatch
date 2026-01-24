/**
 * Format Helpers
 */
export const formatDate = (date: Date): string => {
  return date.toLocaleDateString('tr-TR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

export const formatTime = (date: Date): string => {
  return date.toLocaleTimeString('tr-TR', {
    hour: '2-digit',
    minute: '2-digit',
  });
};

/**
 * @deprecated Use formatCurrency from @/utils/currencyFormatter instead
 * This provides basic formatting - for advanced options use currencyFormatter
 */
export const formatCurrency = (amount: number, currency = 'USD'): string => {
  return new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency,
  }).format(amount);
};

export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

/**
 * Validation Helpers
 * @deprecated Use isValidEmail from @/utils/security instead
 */
export { isValidEmail as validateEmail } from './security';

/**
 * @deprecated Use isValidPhone from @/utils/security instead
 */
export { isValidPhone as validatePhone } from './security';

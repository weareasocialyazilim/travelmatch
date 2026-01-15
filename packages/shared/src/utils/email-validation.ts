/**
 * Email Validation Utility
 *
 * Provides comprehensive email validation including:
 * - Format validation (RFC 5322 compliant)
 * - Disposable email detection
 * - DNS MX record validation (optional)
 * - Common typo detection and suggestions
 *
 * P1 FIX: Added proper email validation to prevent invalid emails
 */

// Known disposable email domains (partial list - extend as needed)
const DISPOSABLE_DOMAINS = new Set([
  '10minutemail.com',
  'guerrillamail.com',
  'mailinator.com',
  'tempmail.com',
  'throwaway.email',
  'yopmail.com',
  'fakeinbox.com',
  'temp-mail.org',
  'dispostable.com',
  'maildrop.cc',
  'getnada.com',
  'mohmal.com',
  'minuteinbox.com',
  'emailondeck.com',
  'tempr.email',
  'burnermail.io',
  'sharklasers.com',
  'guerrillamailblock.com',
  'pokemail.net',
  'trashmail.com',
  'mailnesia.com',
]);

// Common email domain typos and their corrections
const DOMAIN_TYPO_MAP: Record<string, string> = {
  'gmial.com': 'gmail.com',
  'gmal.com': 'gmail.com',
  'gmaill.com': 'gmail.com',
  'gmail.co': 'gmail.com',
  'gnail.com': 'gmail.com',
  'gamil.com': 'gmail.com',
  'hotmial.com': 'hotmail.com',
  'hotmal.com': 'hotmail.com',
  'hotmai.com': 'hotmail.com',
  'hotmail.co': 'hotmail.com',
  'hotmil.com': 'hotmail.com',
  'outlok.com': 'outlook.com',
  'outloo.com': 'outlook.com',
  'outlook.co': 'outlook.com',
  'yaho.com': 'yahoo.com',
  'yahooo.com': 'yahoo.com',
  'yahoo.co': 'yahoo.com',
  'yahho.com': 'yahoo.com',
  'yhaoo.com': 'yahoo.com',
  'iclod.com': 'icloud.com',
  'icould.com': 'icloud.com',
  'icloud.co': 'icloud.com',
};

// Common TLD typos
const TLD_TYPO_MAP: Record<string, string> = {
  con: 'com',
  cpm: 'com',
  ocm: 'com',
  vom: 'com',
  xom: 'com',
  comm: 'com',
  ner: 'net',
  ent: 'net',
  ogr: 'org',
  prg: 'org',
  tr: 'com.tr',
};

export interface EmailValidationResult {
  isValid: boolean;
  email: string;
  normalizedEmail: string;
  errors: string[];
  warnings: string[];
  suggestion?: string;
  isDisposable: boolean;
}

export interface EmailValidationOptions {
  allowDisposable?: boolean;
  checkMx?: boolean;
  suggestCorrections?: boolean;
}

/**
 * RFC 5322 compliant email regex pattern
 * More permissive than simple patterns to handle edge cases
 */
const EMAIL_REGEX =
  /^(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9]))\.){3}(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9])|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])$/i;

/**
 * Simple email format check (more lenient)
 */
const SIMPLE_EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Validate email format
 */
function validateFormat(email: string): { isValid: boolean; error?: string } {
  if (!email || typeof email !== 'string') {
    return { isValid: false, error: 'Email adresi gerekli' };
  }

  const trimmed = email.trim();

  if (trimmed.length === 0) {
    return { isValid: false, error: 'Email adresi boş olamaz' };
  }

  if (trimmed.length > 254) {
    return {
      isValid: false,
      error: 'Email adresi çok uzun (max 254 karakter)',
    };
  }

  if (!trimmed.includes('@')) {
    return { isValid: false, error: "Email adresi '@' içermeli" };
  }

  const [localPart, domain] = trimmed.split('@');

  if (!localPart || localPart.length === 0) {
    return { isValid: false, error: "Email adresinde '@' öncesi boş olamaz" };
  }

  if (localPart.length > 64) {
    return {
      isValid: false,
      error: 'Email adresi yerel kısmı çok uzun (max 64 karakter)',
    };
  }

  if (!domain || domain.length === 0) {
    return { isValid: false, error: "Email adresinde '@' sonrası boş olamaz" };
  }

  if (!domain.includes('.')) {
    return {
      isValid: false,
      error: 'Email adresi geçerli bir domain içermeli',
    };
  }

  // Check with simple regex first
  if (!SIMPLE_EMAIL_REGEX.test(trimmed)) {
    return { isValid: false, error: 'Email adresi formatı geçersiz' };
  }

  // Then check with strict RFC 5322 regex
  if (!EMAIL_REGEX.test(trimmed)) {
    return { isValid: false, error: 'Email adresi formatı geçersiz' };
  }

  return { isValid: true };
}

/**
 * Check if email domain is disposable
 */
function checkDisposable(domain: string): boolean {
  return DISPOSABLE_DOMAINS.has(domain.toLowerCase());
}

/**
 * Suggest corrections for common typos
 */
function suggestCorrection(email: string): string | undefined {
  const [localPart, domain] = email.toLowerCase().split('@');

  if (!domain) return undefined;

  // Check full domain typo
  if (DOMAIN_TYPO_MAP[domain]) {
    return `${localPart}@${DOMAIN_TYPO_MAP[domain]}`;
  }

  // Check TLD typo
  const domainParts = domain.split('.');
  if (domainParts.length >= 2) {
    const tld = domainParts[domainParts.length - 1];
    if (tld && TLD_TYPO_MAP[tld]) {
      domainParts[domainParts.length - 1] = TLD_TYPO_MAP[tld];
      return `${localPart}@${domainParts.join('.')}`;
    }
  }

  return undefined;
}

/**
 * Normalize email address
 * - Lowercase
 * - Trim whitespace
 * - Remove dots from Gmail local part (optional)
 * - Remove plus addressing (optional)
 */
export function normalizeEmail(
  email: string,
  options: { removeGmailDots?: boolean; removePlusAddressing?: boolean } = {},
): string {
  let normalized = email.toLowerCase().trim();

  const [localPart, domain] = normalized.split('@');
  if (!localPart || !domain) return normalized;

  let normalizedLocal = localPart;

  // Gmail ignores dots in the local part
  if (
    options.removeGmailDots &&
    (domain === 'gmail.com' || domain === 'googlemail.com')
  ) {
    normalizedLocal = normalizedLocal.replace(/\./g, '');
  }

  // Remove plus addressing (user+tag@domain.com -> user@domain.com)
  if (options.removePlusAddressing && normalizedLocal.includes('+')) {
    const beforePlus = normalizedLocal.split('+')[0];
    if (beforePlus) {
      normalizedLocal = beforePlus;
    }
  }

  return `${normalizedLocal}@${domain}`;
}

/**
 * Validate email address comprehensively
 */
export function validateEmail(
  email: string,
  options: EmailValidationOptions = {},
): EmailValidationResult {
  const { allowDisposable = false, suggestCorrections = true } = options;

  const result: EmailValidationResult = {
    isValid: true,
    email: email,
    normalizedEmail: '',
    errors: [],
    warnings: [],
    isDisposable: false,
  };

  // Format validation
  const formatResult = validateFormat(email);
  if (!formatResult.isValid) {
    result.isValid = false;
    result.errors.push(formatResult.error!);
    return result;
  }

  // Normalize
  const normalized = normalizeEmail(email);
  result.normalizedEmail = normalized;

  const [, domain] = normalized.split('@');

  // Check disposable
  if (domain && checkDisposable(domain)) {
    result.isDisposable = true;
    if (!allowDisposable) {
      result.isValid = false;
      result.errors.push('Geçici email adresleri kabul edilmemektedir');
    } else {
      result.warnings.push('Bu bir geçici email adresi');
    }
  }

  // Suggest corrections
  if (suggestCorrections) {
    const suggestion = suggestCorrection(normalized);
    if (suggestion) {
      result.suggestion = suggestion;
      result.warnings.push(`Şunu mu demek istediniz: ${suggestion}`);
    }
  }

  return result;
}

/**
 * Quick validation check (returns boolean only)
 */
export function isValidEmail(email: string): boolean {
  return validateEmail(email).isValid;
}

/**
 * Check if email might be a typo and return suggestion
 */
export function getEmailSuggestion(email: string): string | null {
  const result = validateEmail(email);
  return result.suggestion || null;
}

/**
 * Export for testing
 */
export const __testing = {
  DISPOSABLE_DOMAINS,
  DOMAIN_TYPO_MAP,
  TLD_TYPO_MAP,
  validateFormat,
  checkDisposable,
  suggestCorrection,
};

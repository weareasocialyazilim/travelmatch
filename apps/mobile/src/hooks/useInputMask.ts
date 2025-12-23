/**
 * Input Masking Hook
 * Provides formatted input for phone numbers, credit cards, etc.
 *
 * DEFCON 3.1 FIX: Implements input masking for better UX
 */

import { useState, useCallback, useMemo } from 'react';

export type MaskType = 'phone' | 'creditCard' | 'expiry' | 'cvv' | 'currency' | 'date';

interface InputMaskOptions {
  /** Type of mask to apply */
  type: MaskType;
  /** Country code for phone formatting (default: US) */
  countryCode?: 'US' | 'TR' | 'GB' | 'DE' | 'FR';
  /** Currency symbol (default: $) */
  currencySymbol?: string;
  /** Allow decimal places for currency */
  allowDecimals?: boolean;
  /** Initial value */
  initialValue?: string;
}

interface InputMaskResult {
  /** Formatted display value */
  value: string;
  /** Raw unformatted value */
  rawValue: string;
  /** Handler for text input */
  onChangeText: (text: string) => void;
  /** Whether input is complete/valid */
  isComplete: boolean;
  /** Placeholder text */
  placeholder: string;
  /** Keyboard type for input */
  keyboardType: 'default' | 'numeric' | 'phone-pad' | 'number-pad';
  /** Maximum length */
  maxLength: number;
}

/**
 * Phone number masks by country
 */
const PHONE_MASKS: Record<string, { mask: string; placeholder: string }> = {
  US: { mask: '(###) ###-####', placeholder: '(555) 555-5555' },
  TR: { mask: '+90 (###) ###-####', placeholder: '+90 (555) 555-5555' },
  GB: { mask: '+44 #### ######', placeholder: '+44 7911 123456' },
  DE: { mask: '+49 ### #######', placeholder: '+49 151 1234567' },
  FR: { mask: '+33 # ## ## ## ##', placeholder: '+33 6 12 34 56 78' },
};

/**
 * Hook for applying input masks
 *
 * @example
 * ```tsx
 * function PhoneInput() {
 *   const { value, onChangeText, placeholder, keyboardType, maxLength } = useInputMask({
 *     type: 'phone',
 *     countryCode: 'US',
 *   });
 *
 *   return (
 *     <TextInput
 *       value={value}
 *       onChangeText={onChangeText}
 *       placeholder={placeholder}
 *       keyboardType={keyboardType}
 *       maxLength={maxLength}
 *     />
 *   );
 * }
 * ```
 */
export const useInputMask = (options: InputMaskOptions): InputMaskResult => {
  const {
    type,
    countryCode = 'US',
    currencySymbol = '$',
    allowDecimals = true,
    initialValue = '',
  } = options;

  const [rawValue, setRawValue] = useState(
    stripNonNumeric(initialValue)
  );

  /**
   * Strip non-numeric characters
   */
  function stripNonNumeric(text: string): string {
    return text.replace(/\D/g, '');
  }

  /**
   * Apply mask to raw value
   */
  const applyMask = useCallback(
    (raw: string): string => {
      switch (type) {
        case 'phone':
          return formatPhone(raw, countryCode);
        case 'creditCard':
          return formatCreditCard(raw);
        case 'expiry':
          return formatExpiry(raw);
        case 'cvv':
          return raw.slice(0, 4);
        case 'currency':
          return formatCurrency(raw, currencySymbol, allowDecimals);
        case 'date':
          return formatDate(raw);
        default:
          return raw;
      }
    },
    [type, countryCode, currencySymbol, allowDecimals]
  );

  /**
   * Handle text change
   */
  const onChangeText = useCallback(
    (text: string) => {
      const stripped = stripNonNumeric(text);
      setRawValue(stripped);
    },
    []
  );

  /**
   * Get formatted value
   */
  const value = useMemo(() => applyMask(rawValue), [applyMask, rawValue]);

  /**
   * Check if input is complete
   */
  const isComplete = useMemo(() => {
    switch (type) {
      case 'phone':
        return rawValue.length >= 10;
      case 'creditCard':
        return rawValue.length >= 15;
      case 'expiry':
        return rawValue.length === 4;
      case 'cvv':
        return rawValue.length >= 3;
      case 'date':
        return rawValue.length === 8;
      default:
        return true;
    }
  }, [type, rawValue]);

  /**
   * Get placeholder
   */
  const placeholder = useMemo(() => {
    switch (type) {
      case 'phone':
        return PHONE_MASKS[countryCode]?.placeholder || '(555) 555-5555';
      case 'creditCard':
        return '1234 5678 9012 3456';
      case 'expiry':
        return 'MM/YY';
      case 'cvv':
        return '123';
      case 'currency':
        return `${currencySymbol}0.00`;
      case 'date':
        return 'MM/DD/YYYY';
      default:
        return '';
    }
  }, [type, countryCode, currencySymbol]);

  /**
   * Get keyboard type
   */
  const keyboardType = useMemo(() => {
    switch (type) {
      case 'phone':
        return 'phone-pad' as const;
      case 'creditCard':
      case 'expiry':
      case 'cvv':
      case 'date':
        return 'number-pad' as const;
      case 'currency':
        return 'numeric' as const;
      default:
        return 'default' as const;
    }
  }, [type]);

  /**
   * Get max length
   */
  const maxLength = useMemo(() => {
    switch (type) {
      case 'phone':
        return 17; // With formatting
      case 'creditCard':
        return 19; // With spaces
      case 'expiry':
        return 5; // MM/YY
      case 'cvv':
        return 4;
      case 'date':
        return 10; // MM/DD/YYYY
      default:
        return 50;
    }
  }, [type]);

  return {
    value,
    rawValue,
    onChangeText,
    isComplete,
    placeholder,
    keyboardType,
    maxLength,
  };
};

/**
 * Format phone number
 */
function formatPhone(raw: string, countryCode: string): string {
  const digits = raw.slice(0, 11);
  const mask = PHONE_MASKS[countryCode]?.mask || '(###) ###-####';

  let result = '';
  let digitIndex = 0;

  for (const char of mask) {
    if (digitIndex >= digits.length) break;

    if (char === '#') {
      result += digits[digitIndex];
      digitIndex++;
    } else {
      result += char;
    }
  }

  return result;
}

/**
 * Format credit card number
 */
function formatCreditCard(raw: string): string {
  const digits = raw.slice(0, 16);
  const groups = digits.match(/.{1,4}/g) || [];
  return groups.join(' ');
}

/**
 * Format expiry date (MM/YY)
 */
function formatExpiry(raw: string): string {
  const digits = raw.slice(0, 4);
  if (digits.length <= 2) {
    return digits;
  }
  return `${digits.slice(0, 2)}/${digits.slice(2)}`;
}

/**
 * Format currency
 */
function formatCurrency(
  raw: string,
  symbol: string,
  allowDecimals: boolean
): string {
  if (!raw) return '';

  const number = parseInt(raw, 10);
  if (isNaN(number)) return '';

  if (allowDecimals) {
    // Last 2 digits are cents
    const dollars = Math.floor(number / 100);
    const cents = number % 100;
    return `${symbol}${dollars.toLocaleString()}.${cents.toString().padStart(2, '0')}`;
  }

  return `${symbol}${number.toLocaleString()}`;
}

/**
 * Format date (MM/DD/YYYY)
 */
function formatDate(raw: string): string {
  const digits = raw.slice(0, 8);

  if (digits.length <= 2) {
    return digits;
  } else if (digits.length <= 4) {
    return `${digits.slice(0, 2)}/${digits.slice(2)}`;
  } else {
    return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`;
  }
}

export default useInputMask;

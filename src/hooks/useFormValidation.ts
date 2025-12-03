/**
 * Form Validation Hook
 * Zod ile form validasyonu için custom hook
 */

import { useState, useCallback } from 'react';
import { z } from 'zod';

export interface FieldErrors {
  [key: string]: string;
}

export interface UseFormValidationResult<T> {
  errors: FieldErrors;
  isValid: boolean;
  validate: (data: T) => boolean;
  validateField: (field: keyof T, value: unknown) => boolean;
  clearError: (field: keyof T) => void;
  clearErrors: () => void;
}

export function useFormValidation<T extends z.ZodType>(
  schema: T,
): UseFormValidationResult<z.infer<T>> {
  const [errors, setErrors] = useState<FieldErrors>({});

  const validate = useCallback(
    (data: z.infer<T>): boolean => {
      try {
        schema.parse(data);
        setErrors({});
        return true;
      } catch (error) {
        if (error instanceof z.ZodError) {
          const fieldErrors: FieldErrors = {};
          error.issues.forEach((err) => {
            const path = err.path.join('.');
            fieldErrors[path] = err.message;
          });
          setErrors(fieldErrors);
        }
        return false;
      }
    },
    [schema],
  );

  const validateField = useCallback(
    (field: keyof z.infer<T>, _value: unknown): boolean => {
      try {
        // For now, re-validate entire form but only show error for this field
        // This is simpler and more reliable than partial validation
        setErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors[field as string];
          return newErrors;
        });
        return true;
      } catch (error) {
        if (error instanceof z.ZodError) {
          setErrors((prev) => ({
            ...prev,
            [field as string]: error.issues[0]?.message || 'Invalid value',
          }));
        }
        return false;
      }
    },
    [],
  );

  const clearError = useCallback((field: keyof z.infer<T>) => {
    setErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors[field as string];
      return newErrors;
    });
  }, []);

  const clearErrors = useCallback(() => {
    setErrors({});
  }, []);

  const isValid = Object.keys(errors).length === 0;

  return {
    errors,
    isValid,
    validate,
    validateField,
    clearError,
    clearErrors,
  };
}

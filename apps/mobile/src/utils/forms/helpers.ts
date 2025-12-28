/**
 * Centralized Form Utilities
 *
 * Common form helpers, hooks, and utilities
 * For consistent form handling across the app
 */

import { useState, useCallback, useEffect, useRef } from 'react';
import { Alert } from 'react-native';
import type { UseFormReturn, FieldValues, Path } from 'react-hook-form';
import { useToast } from '../../context/ToastContext';
import { logger } from '../logger';

// ============================================================================
// FORM STATE UTILITIES
// ============================================================================

/**
 * Get form state summary
 * Useful for debugging and conditional rendering
 */
export function getFormState<T extends FieldValues>(form: UseFormReturn<T>) {
  return {
    isValid: form.formState.isValid,
    isDirty: form.formState.isDirty,
    isSubmitting: form.formState.isSubmitting,
    isSubmitted: form.formState.isSubmitted,
    isSubmitSuccessful: form.formState.isSubmitSuccessful,
    errorCount: Object.keys(form.formState.errors).length,
    touchedCount: Object.keys(form.formState.touchedFields).length,
    dirtyCount: Object.keys(form.formState.dirtyFields).length,
  };
}

/**
 * Minimal FormState interface for canSubmitForm
 */
export interface MinimalFormState {
  isSubmitting: boolean;
  isValid: boolean;
  isDirty: boolean;
}

/**
 * Check if form can be submitted
 * Common validation for submit button state
 *
 * @param form - Either a full UseFormReturn object or an object with just { formState }
 * @param options - Options for validation
 */
export function canSubmitForm<T extends FieldValues>(
  form: UseFormReturn<T> | { formState: MinimalFormState },
  options: {
    requireDirty?: boolean;
    requireValid?: boolean;
  } = {},
): boolean {
  const { requireDirty = true, requireValid = true } = options;
  const formState = 'formState' in form ? form.formState : form;

  if (formState.isSubmitting) return false;
  if (requireValid && !formState.isValid) return false;
  if (requireDirty && !formState.isDirty) return false;

  return true;
}

// ============================================================================
// FORM ERROR HANDLING
// ============================================================================

/**
 * Get first error message from form
 */
export function getFirstErrorMessage<T extends FieldValues>(
  form: UseFormReturn<T>,
): string | null {
  const errors = form.formState.errors;
  const firstError = Object.values(errors)[0];
  return firstError?.message as string | null;
}

/**
 * Get all error messages from form
 */
export function getAllErrorMessages<T extends FieldValues>(
  form: UseFormReturn<T>,
): Record<string, string> {
  const errors = form.formState.errors;
  const messages: Record<string, string> = {};

  Object.keys(errors).forEach((key) => {
    const error = errors[key as Path<T>];
    if (error?.message) {
      messages[key] = error.message as string;
    }
  });

  return messages;
}

/**
 * Check if specific field has error
 */
export function hasFieldError<T extends FieldValues>(
  form: UseFormReturn<T>,
  fieldName: Path<T>,
): boolean {
  return !!form.formState.errors[fieldName];
}

/**
 * Get field error message
 */
export function getFieldError<T extends FieldValues>(
  form: UseFormReturn<T>,
  fieldName: Path<T>,
): string | undefined {
  return form.formState.errors[fieldName]?.message as string | undefined;
}

// ============================================================================
// FORM SUBMISSION HELPERS
// ============================================================================

/**
 * Handle form submission with error toast
 * Shows toast on error, optionally on success
 */
export function useFormSubmitHandler() {
  const toast = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = useCallback(
    async <T>(
      submitFn: () => Promise<T>,
      options: {
        successMessage?: string;
        errorMessage?: string;
        onSuccess?: (data: T) => void;
        onError?: (error: Error) => void;
      } = {},
    ): Promise<T | null> => {
      setIsSubmitting(true);
      try {
        const result = await submitFn();

        if (options.successMessage) {
          toast.success(options.successMessage);
        }

        options.onSuccess?.(result);
        return result;
      } catch (error) {
        const errorMessage =
          options.errorMessage ||
          (error instanceof Error ? error.message : 'forms.errors.generic');

        toast.error(errorMessage);
        options.onError?.(error as Error);
        return null;
      } finally {
        setIsSubmitting(false);
      }
    },
    [toast],
  );

  return { handleSubmit, isSubmitting };
}

/**
 * Wrap form submit handler with offline check
 * Uses NetInfo to check network connectivity
 */
export function useOfflineAwareSubmit() {
  const toast = useToast();
  const [isOnline, setIsOnline] = useState(true);

  // Subscribe to network state changes
  useEffect(() => {
    let unsubscribe: (() => void) | undefined;

    const setupNetworkListener = async () => {
      try {
        const NetInfo = await import('@react-native-community/netinfo');
        unsubscribe = NetInfo.default.addEventListener((state) => {
          setIsOnline(state.isConnected ?? true);
        });
      } catch {
        // NetInfo not available - assume online
        logger.debug('NetInfo not available, assuming online');
      }
    };

    setupNetworkListener();

    return () => {
      unsubscribe?.();
    };
  }, []);

  const wrapSubmit = useCallback(
    <T>(submitFn: () => Promise<T>) => {
      return async (): Promise<T | null> => {
        if (!isOnline) {
          toast.error('You are offline. Please check your connection.');
          return null;
        }
        return submitFn();
      };
    },
    [isOnline, toast],
  );

  return { wrapSubmit, isOnline };
}

// ============================================================================
// FIELD VALIDATION HELPERS
// ============================================================================

/**
 * Trigger field validation on blur
 */
export function useFieldValidation<T extends FieldValues>(
  form: UseFormReturn<T>,
) {
  const validateField = useCallback(
    (fieldName: Path<T>) => {
      form.trigger(fieldName);
    },
    [form],
  );

  const validateAllFields = useCallback(() => {
    form.trigger();
  }, [form]);

  return { validateField, validateAllFields };
}

/**
 * Watch field value and trigger validation
 */
export function useWatchAndValidate<T extends FieldValues>(
  form: UseFormReturn<T>,
  fieldName: Path<T>,
) {
  const value = form.watch(fieldName);
  const error = getFieldError(form, fieldName);
  const hasError = hasFieldError(form, fieldName);

  const validateOnBlur = useCallback(() => {
    form.trigger(fieldName);
  }, [form, fieldName]);

  return { value, error, hasError, validateOnBlur };
}

// ============================================================================
// FORM RESET UTILITIES
// ============================================================================

/**
 * Reset form with confirmation
 */
export function useFormReset<T extends FieldValues>(form: UseFormReturn<T>) {
  const resetForm = useCallback(
    (values?: Partial<T>) => {
      form.reset(values as T);
    },
    [form],
  );

  const resetField = useCallback(
    (fieldName: Path<T>) => {
      form.resetField(fieldName);
    },
    [form],
  );

  return { resetForm, resetField };
}

// ============================================================================
// FORM DIRTY STATE MANAGEMENT
// ============================================================================

/**
 * Check if form has unsaved changes
 */
export function useUnsavedChanges<T extends FieldValues>(
  form: UseFormReturn<T>,
) {
  const hasUnsavedChanges =
    form.formState.isDirty && !form.formState.isSubmitSuccessful;

  const confirmLeave = useCallback(
    (message = 'You have unsaved changes. Are you sure you want to leave?') => {
      if (hasUnsavedChanges) {
        // React Native Alert - returns void, use Promise wrapper if needed
        Alert.alert('Unsaved Changes', message);
        return false; // Conservative approach - don't leave
      }
      return true;
    },
    [hasUnsavedChanges],
  );

  return { hasUnsavedChanges, confirmLeave };
}

// ============================================================================
// FORM ACCESSIBILITY HELPERS
// ============================================================================

/**
 * Get accessibility props for form field
 */
export function getFieldA11yProps<T extends FieldValues>(
  form: UseFormReturn<T>,
  fieldName: Path<T>,
  label: string,
) {
  const error = getFieldError(form, fieldName);
  const hasError = hasFieldError(form, fieldName);

  return {
    accessibilityLabel: label,
    accessibilityHint: error,
    accessibilityInvalid: hasError,
    accessibilityRequired: true,
  };
}

// ============================================================================
// FORM AUTO-SAVE
// ============================================================================

/**
 * Auto-save form on change with debounce
 * Automatically saves form data after user stops typing
 */
export function useFormAutoSave<T extends FieldValues>(
  form: UseFormReturn<T>,
  onSave: (data: T) => Promise<void>,
  options: {
    debounceMs?: number;
    enabled?: boolean;
    onError?: (error: Error) => void;
    onSuccess?: () => void;
  } = {},
) {
  const { debounceMs = 2000, enabled = true, onError, onSuccess } = options;
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastValuesRef = useRef<string>('');

  // Watch form values
  const values = form.watch();

  useEffect(() => {
    if (!enabled) return;

    // Serialize current values to compare
    const serialized = JSON.stringify(values);

    // Skip if values haven't changed
    if (serialized === lastValuesRef.current) return;

    // Skip if form is not dirty
    if (!form.formState.isDirty) return;

    // Clear previous timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Set new timeout for auto-save
    timeoutRef.current = setTimeout(async () => {
      // Validate before saving
      const isValid = await form.trigger();
      if (!isValid) return;

      setIsSaving(true);
      setSaveError(null);

      try {
        await onSave(values as T);
        lastValuesRef.current = serialized;
        setLastSaved(new Date());
        onSuccess?.();
        logger.debug('Form auto-saved successfully');
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : 'Auto-save failed';
        setSaveError(errorMessage);
        onError?.(error as Error);
        logger.error('Form auto-save failed:', error);
      } finally {
        setIsSaving(false);
      }
    }, debounceMs);

    // Cleanup
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [values, enabled, debounceMs, form, onSave, onError, onSuccess]);

  // Force save (bypass debounce)
  const forceSave = useCallback(async () => {
    if (!form.formState.isDirty) return;

    const isValid = await form.trigger();
    if (!isValid) return;

    setIsSaving(true);
    setSaveError(null);

    try {
      const currentValues = form.getValues();
      await onSave(currentValues);
      lastValuesRef.current = JSON.stringify(currentValues);
      setLastSaved(new Date());
      onSuccess?.();
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Save failed';
      setSaveError(errorMessage);
      onError?.(error as Error);
    } finally {
      setIsSaving(false);
    }
  }, [form, onSave, onError, onSuccess]);

  return { isSaving, lastSaved, saveError, forceSave };
}

// ============================================================================
// FORM FIELD FOCUS MANAGEMENT
// ============================================================================

/**
 * Focus first error field
 */
export function focusFirstErrorField<T extends FieldValues>(
  form: UseFormReturn<T>,
) {
  const errors = form.formState.errors;
  const firstErrorField = Object.keys(errors)[0] as Path<T>;

  if (firstErrorField) {
    form.setFocus(firstErrorField);
  }
}

/**
 * Focus field by name
 */
export function focusField<T extends FieldValues>(
  form: UseFormReturn<T>,
  fieldName: Path<T>,
) {
  form.setFocus(fieldName);
}

// ============================================================================
// FORM DEBUG UTILITIES
// ============================================================================

/**
 * Log form state to console (development only)
 */
export function debugFormState<T extends FieldValues>(
  form: UseFormReturn<T>,
  label = 'Form State',
) {
  if (__DEV__) {
    logger.debug(`[${label}]`, {
      values: form.getValues(),
      errors: form.formState.errors,
      isDirty: form.formState.isDirty,
      isValid: form.formState.isValid,
      isSubmitting: form.formState.isSubmitting,
      touchedFields: form.formState.touchedFields,
      dirtyFields: form.formState.dirtyFields,
    });
  }
}

/**
 * Watch all form changes and log
 */
export function useFormDebug<T extends FieldValues>(
  form: UseFormReturn<T>,
  enabled = __DEV__,
) {
  if (!enabled) return;

  // Watch all values
  const values = form.watch();

  if (__DEV__) {
    logger.debug('[Form Watch]', values);
  }
}

/**
 * Centralized Form Utilities
 * 
 * Common form helpers, hooks, and utilities
 * For consistent form handling across the app
 */

import { useState, useCallback } from 'react';
import { Alert } from 'react-native';
import type { UseFormReturn, FieldValues, Path } from 'react-hook-form';
import { useToast } from '@/context/ToastContext';

// ============================================================================
// FORM STATE UTILITIES
// ============================================================================

/**
 * Get form state summary
 * Useful for debugging and conditional rendering
 */
export function getFormState<T extends FieldValues>(
  form: UseFormReturn<T>
) {
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
 * Check if form can be submitted
 * Common validation for submit button state
 * 
 * @param form - Either a full UseFormReturn object or an object with just { formState }
 * @param options - Options for validation
 */
export function canSubmitForm<T extends FieldValues>(
  form: UseFormReturn<T> | { formState: UseFormReturn<T>['formState'] },
  options: {
    requireDirty?: boolean;
    requireValid?: boolean;
  } = {}
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
  form: UseFormReturn<T>
): string | null {
  const errors = form.formState.errors;
  const firstError = Object.values(errors)[0];
  return firstError?.message as string | null;
}

/**
 * Get all error messages from form
 */
export function getAllErrorMessages<T extends FieldValues>(
  form: UseFormReturn<T>
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
  fieldName: Path<T>
): boolean {
  return !!form.formState.errors[fieldName];
}

/**
 * Get field error message
 */
export function getFieldError<T extends FieldValues>(
  form: UseFormReturn<T>,
  fieldName: Path<T>
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
    async <T,>(
      submitFn: () => Promise<T>,
      options: {
        successMessage?: string;
        errorMessage?: string;
        onSuccess?: (data: T) => void;
        onError?: (error: Error) => void;
      } = {}
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
    [toast]
  );

  return { handleSubmit, isSubmitting };
}

/**
 * Wrap form submit handler with offline check
 */
export function useOfflineAwareSubmit() {
  const toast = useToast();
  const [isOnline] = useState(true);

  // TODO: Hook into network state from NetworkGuard
  // For now, assume online

  const wrapSubmit = useCallback(
    <T,>(submitFn: () => Promise<T>) => {
      return async (): Promise<T | null> => {
        if (!isOnline) {
          toast.error('forms.errors.offline');
          return null;
        }
        return submitFn();
      };
    },
    [isOnline, toast]
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
  form: UseFormReturn<T>
) {
  const validateField = useCallback(
    (fieldName: Path<T>) => {
      form.trigger(fieldName);
    },
    [form]
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
  fieldName: Path<T>
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
export function useFormReset<T extends FieldValues>(
  form: UseFormReturn<T>
) {
  const resetForm = useCallback(
    (values?: Partial<T>) => {
      form.reset(values as T);
    },
    [form]
  );

  const resetField = useCallback(
    (fieldName: Path<T>) => {
      form.resetField(fieldName);
    },
    [form]
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
  form: UseFormReturn<T>
) {
  const hasUnsavedChanges = form.formState.isDirty && !form.formState.isSubmitSuccessful;

  const confirmLeave = useCallback(
    (message = 'You have unsaved changes. Are you sure you want to leave?') => {
      if (hasUnsavedChanges) {
        // React Native Alert - returns void, use Promise wrapper if needed
        Alert.alert('Unsaved Changes', message);
        return false; // Conservative approach - don't leave
      }
      return true;
    },
    [hasUnsavedChanges]
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
  label: string
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
 */
export function useFormAutoSave<T extends FieldValues>(
  _form: UseFormReturn<T>,
  _onSave: (data: T) => Promise<void>,
  _options: {
    debounceMs?: number;
    enabled?: boolean;
  } = {}
) {
  const [isSaving] = useState(false);
  const [lastSaved] = useState<Date | null>(null);

  // TODO: Implement debounced auto-save
  // Watch form values and trigger save after debounce

  return { isSaving, lastSaved };
}

// ============================================================================
// FORM FIELD FOCUS MANAGEMENT
// ============================================================================

/**
 * Focus first error field
 */
export function focusFirstErrorField<T extends FieldValues>(
  form: UseFormReturn<T>
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
  fieldName: Path<T>
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
  label = 'Form State'
) {
  if (__DEV__) {
    console.log(`[${label}]`, {
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
  enabled = __DEV__
) {
  if (!enabled) return;

  // Watch all values
  const values = form.watch();
  
  if (__DEV__) {
    console.log('[Form Watch]', values);
  }
}

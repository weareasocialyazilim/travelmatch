/**
 * React Hook Form Utilities
 * Form state management ve validation helpers
 */

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm as useHookForm } from 'react-hook-form';
import { logger } from '../utils/logger';
import type { UseFormProps, UseFormReturn, FieldValues } from 'react-hook-form';
import type { ZodTypeAny } from 'zod';

/**
 * Zod schema ile entegre form hook
 * Automatically configures react-hook-form with Zod resolver
 *
 * @example
 * const form = useZodForm({
 *   schema: loginSchema,
 *   defaultValues: { email: '', password: '' }
 * });
 */
export function useZodForm<TOutput extends FieldValues = FieldValues>(
  options: Omit<UseFormProps<TOutput>, 'resolver'> & {
    schema: ZodTypeAny;
  },
): UseFormReturn<TOutput> {
  const { schema, ...formOptions } = options;

  return useHookForm<TOutput>({
    ...formOptions,
    resolver: zodResolver(schema as any) as UseFormProps<TOutput>['resolver'],
    mode: formOptions.mode || 'onChange',
  });
}

/**
 * Form submission wrapper with error handling
 * Handles async form submissions with loading states
 *
 * @example
 * const { handleSubmit, isSubmitting } = useFormSubmission();
 *
 * <Button
 *   onPress={handleSubmit(async (data) => {
 *     await api.login(data);
 *   })}
 *   loading={isSubmitting}
 * />
 */
export function useFormSubmission<TData extends FieldValues>(
  onSubmit: (data: TData) => Promise<void>,
  onError?: (error: Error) => void,
) {
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const handleSubmit = async (data: TData) => {
    if (isSubmitting) return;

    setIsSubmitting(true);
    try {
      await onSubmit(data);
    } catch (error) {
      onError?.(
        error instanceof Error ? error : new Error('Submission failed'),
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    handleSubmit,
    isSubmitting,
  };
}

import React from 'react';

/**
 * Form field array helper
 * Simplifies working with dynamic form fields (arrays)
 *
 * @example
 * const { fields, append, remove } = useFieldArray({
 *   control,
 *   name: 'travelers'
 * });
 */
export { useFieldArray } from 'react-hook-form';

/**
 * Watch specific form field changes
 * Subscribe to individual field changes without re-rendering entire form
 *
 * @example
 * const email = useWatch({ control, name: 'email' });
 */
export { useWatch } from 'react-hook-form';

/**
 * Form controller for custom inputs
 * Wraps custom components to work with react-hook-form
 *
 * @example
 * <Controller
 *   control={control}
 *   name="category"
 *   render={({ field }) => (
 *     <CustomPicker {...field} />
 *   )}
 * />
 */
export { Controller } from 'react-hook-form';

/**
 * Enhanced form submission hook with toast notifications and retry logic
 * Combines form submission with UI feedback
 *
 * @example
 * const { submit, isSubmitting, error } = useFormSubmit({
 *   onSubmit: async (data) => await api.createMoment(data),
 *   onSuccess: () => navigation.goBack(),
 *   successMessage: 'Moment created successfully!',
 * });
 */
export function useFormSubmit<TData extends FieldValues>({
  onSubmit,
  onSuccess,
  onError,
  successMessage,
  errorMessage,
  resetOnSuccess = false,
  form,
}: {
  onSubmit: (data: TData) => Promise<unknown>;
  onSuccess?: () => void;
  onError?: (error: Error) => void;
  successMessage?: string;
  errorMessage?: string;
  resetOnSuccess?: boolean;
  form?: { reset: () => void };
}) {
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [error, setError] = React.useState<Error | null>(null);
  const [isSuccess, setIsSuccess] = React.useState(false);

  const submit = React.useCallback(
    async (data: TData) => {
      if (isSubmitting) return;

      setIsSubmitting(true);
      setError(null);
      setIsSuccess(false);

      try {
        await onSubmit(data);
        setIsSuccess(true);

        if (resetOnSuccess && form) {
          form.reset();
        }

        // Log success message if provided
        if (successMessage) {
          // Could integrate with toast system here
          logger.info(successMessage);
        }

        onSuccess?.();
      } catch (err) {
        const error =
          err instanceof Error
            ? err
            : new Error(errorMessage || 'Submission failed');
        setError(error);
        onError?.(error);
      } finally {
        setIsSubmitting(false);
      }
    },
    [
      isSubmitting,
      onSubmit,
      onSuccess,
      onError,
      successMessage,
      errorMessage,
      resetOnSuccess,
      form,
    ],
  );

  const reset = React.useCallback(() => {
    setError(null);
    setIsSuccess(false);
  }, []);

  return {
    submit,
    isSubmitting,
    error,
    isSuccess,
    reset,
  };
}

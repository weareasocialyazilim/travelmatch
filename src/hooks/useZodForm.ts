/**
 * React Hook Form Utilities
 * Form state management ve validation helpers
 */

import type { UseFormProps, UseFormReturn, FieldValues } from 'react-hook-form';
import { useForm as useHookForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import type { ZodType, TypeOf } from 'zod';

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
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function useZodForm<TSchema extends ZodType<any, any, any>>(
  options: Omit<UseFormProps<TypeOf<TSchema>>, 'resolver'> & {
    schema: TSchema;
  },
): UseFormReturn<TypeOf<TSchema>> {
  const { schema, ...formOptions } = options;

  return useHookForm<TypeOf<TSchema>>({
    ...formOptions,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(schema) as any,
    mode: formOptions.mode || 'onChange', // Default to real-time validation
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

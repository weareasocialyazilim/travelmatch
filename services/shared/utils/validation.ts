/**
 * Validation Utilities
 * Request validation using Zod schemas
 */

import { z } from 'zod';

export class ValidationError extends Error {
  constructor(public errors: z.ZodError) {
    super('Validation failed');
    this.name = 'ValidationError';
  }
}

export const validateRequest = <T>(
  schema: z.ZodSchema<T>,
  data: unknown
): T => {
  const result = schema.safeParse(data);

  if (!result.success) {
    throw new ValidationError(result.error);
  }

  return result.data;
};

export const parseJsonBody = async (req: Request): Promise<unknown> => {
  try {
    return await req.json();
  } catch {
    throw new Error('Invalid JSON body');
  }
};

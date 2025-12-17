import type { Json } from '../types/database.types';

/**
 * Safely coerce a value to the `Json` type used by generated DB types.
 * Returns `undefined` when input is `undefined` to allow optional DB fields.
 * This centralizes the unchecked cast so callers don't scatter `as any`.
 */
export function toJson(value: any): Json | undefined {
  if (value === undefined) return undefined;
  return value as Json;
}

export default toJson;

/**
 * If the value is an object (plain record), return it as `Record<string, any>`;
 * otherwise return `undefined`.
 */
export function toRecord(value: any): Record<string, any> | undefined {
  if (value && typeof value === 'object' && !Array.isArray(value)) {
    return value as Record<string, any>;
  }
  return undefined;
}

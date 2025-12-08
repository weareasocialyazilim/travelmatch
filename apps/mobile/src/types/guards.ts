/**
 * Type Guards
 * Runtime type checking functions for type narrowing
 */

import { Message, TextMessage, ImageMessage, LocationMessage, SystemMessage } from './message.types';

/**
 * Message Type Guards
 */
export function isTextMessage(msg: Message): msg is TextMessage {
  return msg.type === 'text' && 'content' in msg;
}

export function isImageMessage(msg: Message): msg is ImageMessage {
  return msg.type === 'image' && 'image_url' in msg;
}

export function isLocationMessage(msg: Message): msg is LocationMessage {
  return msg.type === 'location' && 'location' in msg;
}

export function isSystemMessage(msg: Message): msg is SystemMessage {
  return msg.type === 'system' && 'system_type' in msg;
}

/**
 * Generic Type Guards
 */
export function isString(value: unknown): value is string {
  return typeof value === 'string';
}

export function isNumber(value: unknown): value is number {
  return typeof value === 'number' && !isNaN(value);
}

export function isBoolean(value: unknown): value is boolean {
  return typeof value === 'boolean';
}

export function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export function isArray<T>(value: unknown): value is T[] {
  return Array.isArray(value);
}

/**
 * Nullable Type Guard
 */
export function isNotNull<T>(value: T | null | undefined): value is T {
  return value !== null && value !== undefined;
}

/**
 * UUID Validator
 */
export function isUUID(value: unknown): value is string {
  if (!isString(value)) return false;
  
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(value);
}

/**
 * Email Validator
 */
export function isEmail(value: unknown): value is string {
  if (!isString(value)) return false;
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(value);
}

/**
 * URL Validator
 */
export function isURL(value: unknown): value is string {
  if (!isString(value)) return false;
  
  try {
    new URL(value);
    return true;
  } catch {
    return false;
  }
}

/**
 * Date String Validator (ISO 8601)
 */
export function isDateString(value: unknown): value is string {
  if (!isString(value)) return false;
  
  const date = new Date(value);
  return !isNaN(date.getTime());
}

/**
 * Has Property Type Guard
 */
export function hasProperty<K extends string>(
  obj: unknown,
  key: K
): obj is Record<K, unknown> {
  return isObject(obj) && key in obj;
}

/**
 * Array of specific type guard
 */
export function isArrayOf<T>(
  value: unknown,
  guard: (item: unknown) => item is T
): value is T[] {
  return isArray(value) && value.every(guard);
}

/**
 * Query Utilities for Safe Database Operations
 *
 * Provides utilities to prevent PostgREST filter injection attacks by
 * sanitizing user input before building query filters.
 *
 * @security CRITICAL - These functions prevent SQL/PostgREST injection
 */

/**
 * Characters that have special meaning in PostgREST filter syntax
 * and must be escaped or removed from user input
 */
const POSTGREST_SPECIAL_CHARS = /[%_,().'"\[\]{}\\;:*?<>|&=!]/g;

/**
 * Sanitize a string for use in PostgREST ilike/like filters
 * Removes all special characters that could be used for injection
 *
 * @param input - User-provided search string
 * @param maxLength - Maximum allowed length (default: 100)
 * @returns Sanitized string safe for use in filters
 *
 * @example
 * sanitizeSearchTerm("john%,id.eq.123")  // Returns: "johnideq123"
 * sanitizeSearchTerm("normal search")     // Returns: "normal search"
 */
export function sanitizeSearchTerm(input: string | null | undefined, maxLength = 100): string {
  if (!input || typeof input !== 'string') {
    return '';
  }

  return input
    .replace(POSTGREST_SPECIAL_CHARS, '')
    .trim()
    .slice(0, maxLength);
}

/**
 * Validate and sanitize a UUID string
 *
 * @param input - User-provided UUID
 * @returns Sanitized UUID or null if invalid
 */
export function sanitizeUUID(input: string | null | undefined): string | null {
  if (!input || typeof input !== 'string') {
    return null;
  }

  // Standard UUID regex
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

  const trimmed = input.trim().toLowerCase();
  return uuidRegex.test(trimmed) ? trimmed : null;
}

/**
 * Build a safe ilike search filter for multiple columns
 *
 * @param columns - Array of column names to search
 * @param searchTerm - User-provided search term (will be sanitized)
 * @returns PostgREST filter string or null if search term is empty
 *
 * @example
 * buildSafeSearchFilter(['name', 'email'], "john")
 * // Returns: "name.ilike.%john%,email.ilike.%john%"
 */
export function buildSafeSearchFilter(
  columns: string[],
  searchTerm: string | null | undefined
): string | null {
  const sanitized = sanitizeSearchTerm(searchTerm);

  if (!sanitized) {
    return null;
  }

  // Validate column names (alphanumeric and underscore only)
  const validColumns = columns.filter(col => /^[a-zA-Z_][a-zA-Z0-9_]*$/.test(col));

  if (validColumns.length === 0) {
    return null;
  }

  return validColumns
    .map(col => `${col}.ilike.%${sanitized}%`)
    .join(',');
}

/**
 * Build a safe OR filter for UUID equality checks
 *
 * @param column - Column name
 * @param uuid - User-provided UUID (will be validated)
 * @returns PostgREST filter string or null if UUID is invalid
 *
 * @example
 * buildSafeUUIDFilter('user_id', "123e4567-e89b-12d3-a456-426614174000")
 * // Returns: "user_id.eq.123e4567-e89b-12d3-a456-426614174000"
 */
export function buildSafeUUIDFilter(
  column: string,
  uuid: string | null | undefined
): string | null {
  const sanitizedUUID = sanitizeUUID(uuid);

  if (!sanitizedUUID) {
    return null;
  }

  // Validate column name
  if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(column)) {
    return null;
  }

  return `${column}.eq.${sanitizedUUID}`;
}

/**
 * Build a safe multi-column UUID OR filter
 *
 * @param columns - Array of column names
 * @param uuid - User-provided UUID (will be validated)
 * @returns PostgREST filter string or null if UUID is invalid
 *
 * @example
 * buildSafeMultiColumnUUIDFilter(['user1_id', 'user2_id'], "123e4567-...")
 * // Returns: "user1_id.eq.123e4567-...,user2_id.eq.123e4567-..."
 */
export function buildSafeMultiColumnUUIDFilter(
  columns: string[],
  uuid: string | null | undefined
): string | null {
  const sanitizedUUID = sanitizeUUID(uuid);

  if (!sanitizedUUID) {
    return null;
  }

  // Validate column names
  const validColumns = columns.filter(col => /^[a-zA-Z_][a-zA-Z0-9_]*$/.test(col));

  if (validColumns.length === 0) {
    return null;
  }

  return validColumns
    .map(col => `${col}.eq.${sanitizedUUID}`)
    .join(',');
}

/**
 * Whitelist-based column name validator for ORDER BY
 *
 * @param column - User-provided column name
 * @param allowedColumns - Array of allowed column names
 * @param defaultColumn - Default column if validation fails
 * @returns Safe column name
 */
export function validateSortColumn(
  column: string | null | undefined,
  allowedColumns: string[],
  defaultColumn: string
): string {
  if (!column || typeof column !== 'string') {
    return defaultColumn;
  }

  const trimmed = column.trim().toLowerCase();
  return allowedColumns.includes(trimmed) ? trimmed : defaultColumn;
}

/**
 * Validate sort order parameter
 *
 * @param order - User-provided sort order
 * @returns 'asc' or 'desc'
 */
export function validateSortOrder(order: string | null | undefined): 'asc' | 'desc' {
  if (!order || typeof order !== 'string') {
    return 'desc';
  }

  return order.toLowerCase() === 'asc' ? 'asc' : 'desc';
}

/**
 * Validate and constrain pagination parameters
 *
 * @param limit - User-provided limit
 * @param offset - User-provided offset
 * @param maxLimit - Maximum allowed limit (default: 100)
 * @returns Safe pagination parameters
 */
export function validatePagination(
  limit: string | null | undefined,
  offset: string | null | undefined,
  maxLimit = 100
): { limit: number; offset: number } {
  const parsedLimit = parseInt(limit || '50', 10);
  const parsedOffset = parseInt(offset || '0', 10);

  return {
    limit: Math.min(Math.max(1, isNaN(parsedLimit) ? 50 : parsedLimit), maxLimit),
    offset: Math.max(0, isNaN(parsedOffset) ? 0 : parsedOffset),
  };
}

/**
 * Build safe array contains filter for role-based access
 *
 * @param column - Column name
 * @param value - Value to check
 * @returns Safe PostgREST array contains filter
 */
export function buildSafeArrayContainsFilter(
  column: string,
  value: string | null | undefined
): string | null {
  if (!value || typeof value !== 'string') {
    return null;
  }

  // Validate column name
  if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(column)) {
    return null;
  }

  // Sanitize the value (alphanumeric, underscore, hyphen only)
  const sanitized = value.replace(/[^a-zA-Z0-9_-]/g, '');

  if (!sanitized) {
    return null;
  }

  return `${column}.cs.{${sanitized}}`;
}

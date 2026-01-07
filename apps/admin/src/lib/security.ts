/**
 * Security utilities for input sanitization
 * Prevents injection attacks in Supabase queries and other contexts
 */

/**
 * Escape special characters for Supabase PostgREST filters
 * Used with .or(), .ilike(), .like() methods to prevent query manipulation
 *
 * @param input - User-provided input string
 * @param maxLength - Maximum allowed length (default: 100)
 * @returns Sanitized string safe for use in Supabase filters
 *
 * @example
 * const safeSearch = escapeSupabaseFilter(userInput);
 * query.or(`name.ilike.%${safeSearch}%,email.ilike.%${safeSearch}%`);
 */
export function escapeSupabaseFilter(
  input: string,
  maxLength: number = 100,
): string {
  if (!input || typeof input !== 'string') {
    return '';
  }

  return (
    input
      // Remove null bytes
      .replace(/\0/g, '')
      // Escape SQL LIKE wildcards
      .replace(/%/g, '\\%')
      .replace(/_/g, '\\_')
      // Remove PostgREST special operators
      .replace(/[*(),]/g, '')
      // Remove potential SQL injection characters
      .replace(/['";]/g, '')
      // Trim whitespace
      .trim()
      // Limit length to prevent DoS
      .slice(0, maxLength)
  );
}

/**
 * Validate and sanitize a search query string
 * More permissive than escapeSupabaseFilter, allows common search characters
 *
 * @param query - User search query
 * @returns Sanitized search query
 */
export function sanitizeSearchQuery(query: string): string {
  if (!query || typeof query !== 'string') {
    return '';
  }

  return (
    query
      // Remove null bytes
      .replace(/\0/g, '')
      // Remove control characters
      // eslint-disable-next-line no-control-regex
      .replace(/[\x00-\x1F\x7F]/g, '')
      // Limit to alphanumeric, spaces, and common punctuation
      .replace(/[^\w\s\-@.]/g, '')
      // Trim and limit length
      .trim()
      .slice(0, 200)
  );
}

/**
 * Validate UUID format
 * @param uuid - String to validate
 * @returns True if valid UUID v4 format
 */
export function isValidUUID(uuid: string): boolean {
  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}

/**
 * Validate email format
 * @param email - String to validate
 * @returns True if valid email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Sanitize a string for safe logging (removes sensitive patterns)
 * @param message - Log message
 * @returns Sanitized message safe for logging
 */
export function sanitizeForLogging(message: string): string {
  return (
    message
      // Mask potential API keys
      .replace(/[a-zA-Z0-9]{32,}/g, '[REDACTED]')
      // Mask emails
      .replace(/[^\s@]+@[^\s@]+\.[^\s@]+/g, '[EMAIL]')
      // Mask potential tokens
      .replace(/Bearer\s+[^\s]+/gi, 'Bearer [REDACTED]')
      // Mask potential passwords in URLs
      .replace(/password=[^&\s]+/gi, 'password=[REDACTED]')
  );
}

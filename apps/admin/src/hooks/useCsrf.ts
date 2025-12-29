/**
 * CSRF Token Hook
 * Automatically includes CSRF token in state-changing requests
 */

'use client';

import { useEffect, useState, useCallback } from 'react';
import { logger } from '@/lib/logger';

const CSRF_HEADER_NAME = 'x-csrf-token';

/**
 * Hook to get and manage CSRF token for secure form submissions
 */
export function useCsrf() {
  const [csrfToken, setCsrfToken] = useState<string | null>(null);

  // Fetch CSRF token from response headers on mount
  useEffect(() => {
    const fetchCsrfToken = async () => {
      try {
        // Make a simple request to get the CSRF token from response headers
        const response = await fetch('/api/csrf', {
          method: 'GET',
          credentials: 'include',
        });

        const token = response.headers.get(CSRF_HEADER_NAME);
        if (token) {
          setCsrfToken(token);
        }
      } catch (error) {
        logger.error('[CSRF] Failed to fetch token', error);
      }
    };

    fetchCsrfToken();
  }, []);

  /**
   * Get headers with CSRF token included
   */
  const getHeaders = useCallback(
    (additionalHeaders?: HeadersInit): HeadersInit => {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };

      if (csrfToken) {
        headers[CSRF_HEADER_NAME] = csrfToken;
      }

      if (additionalHeaders) {
        const additional =
          additionalHeaders instanceof Headers
            ? Object.fromEntries(additionalHeaders.entries())
            : Array.isArray(additionalHeaders)
              ? Object.fromEntries(additionalHeaders)
              : additionalHeaders;
        Object.assign(headers, additional);
      }

      return headers;
    },
    [csrfToken],
  );

  /**
   * Make a fetch request with CSRF token automatically included
   */
  const secureFetch = useCallback(
    async (url: string, options: RequestInit = {}): Promise<Response> => {
      const headers = getHeaders(options.headers);

      return fetch(url, {
        ...options,
        headers,
        credentials: 'include',
      });
    },
    [getHeaders],
  );

  return {
    csrfToken,
    getHeaders,
    secureFetch,
    isReady: csrfToken !== null,
  };
}

/**
 * Higher-order component props type
 */
export interface WithCsrfProps {
  csrfToken: string | null;
  secureFetch: (url: string, options?: RequestInit) => Promise<Response>;
}

import { useState, useEffect, useCallback } from 'react';
import { AppError, getErrorMessage } from '../utils/errors';

interface UseFetchResult<T> {
  data: T | null;
  loading: boolean;
  error: AppError | null;
  refetch: () => void;
}

interface UseFetchOptions<T = unknown> {
  skip?: boolean;
  onSuccess?: (data: T) => void;
  onError?: (error: AppError) => void;
}

export function useFetch<T>(
  url: string,
  options: UseFetchOptions = {},
): UseFetchResult<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(!options.skip);
  const [error, setError] = useState<AppError | null>(null);

  const fetchData = useCallback(
    async (abortController?: AbortController) => {
      if (options.skip) return;

      try {
        setLoading(true);
        setError(null);

        const response = await fetch(url, {
          signal: abortController?.signal,
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          const errorMessage =
            errorData.message || `HTTP error! status: ${response.status}`;

          const apiError = new AppError(errorMessage);
          throw apiError;
        }

        const jsonData = await response.json();
        setData(jsonData);
        options.onSuccess?.(jsonData);
      } catch (err) {
        // Ignore abort errors, which are expected when a component unmounts during a fetch.
        if ((err as Error).name !== 'AbortError') {
          const appError =
            err instanceof AppError ? err : new AppError(getErrorMessage(err));

          setError(appError);
          options.onError?.(appError);
        }
      } finally {
        setLoading(false);
      }
    },
    [url, options],
  );

  useEffect(() => {
    const abortController = new AbortController();
    fetchData(abortController);

    return () => {
      abortController.abort();
    };
  }, [url, fetchData]);

  const refetch = () => {
    fetchData();
  };

  return { data, loading, error, refetch };
}

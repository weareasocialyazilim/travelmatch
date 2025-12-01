import { useState, useEffect, useCallback } from 'react';

interface UseFetchResult<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
  refetch: () => void;
}

export function useFetch<T>(url: string): UseFetchResult<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(
    async (abortController?: AbortController) => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(url, {
          signal: abortController?.signal,
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const jsonData = await response.json();
        setData(jsonData);
      } catch (err) {
        // Ignore abort errors, which are expected when a component unmounts during a fetch.
        if ((err as Error).name !== 'AbortError') {
          setError(err instanceof Error ? err : new Error('An error occurred'));
        }
      } finally {
        setLoading(false);
      }
    },
    [url],
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

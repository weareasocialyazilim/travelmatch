/**
 * API Service with Error Recovery
 * Enhanced API service with automatic retry and error recovery
 */
import { logger } from '../utils/logger';

import { api } from '../utils/api';
import { fetchWithRetry, isRetryableError } from '../utils/errorRecovery';
import { PerformanceMonitor } from '../utils/performance';
import type { Moment } from '../types';

/**
 * Moments API with Error Recovery
 */
export const getMomentsWithRetry = async (): Promise<Moment[]> => {
  const startTime = Date.now();

  try {
    const data = await fetchWithRetry(() => api.get<Moment[]>('/moments'), {
      maxRetries: 3,
      backoff: 'exponential',
      shouldRetry: isRetryableError,
      onRetry: (attempt, error) => {
        logger.debug(`Retrying getMoments (${attempt}/3):`, error.message);
      },
    });

    // Track API latency
    PerformanceMonitor.trackAPILatency('getMoments', startTime);

    return data;
  } catch (error) {
    logger.error('Failed to fetch moments after retries:', error);
    throw error;
  }
};

export const getMomentByIdWithRetry = async (
  id: string,
): Promise<Moment | null> => {
  const startTime = Date.now();

  try {
    const data = await fetchWithRetry(() => api.get<Moment>(`/moments/${id}`), {
      maxRetries: 3,
      backoff: 'exponential',
      shouldRetry: isRetryableError,
    });

    PerformanceMonitor.trackAPILatency('getMomentById', startTime, { id });

    return data;
  } catch (error) {
    logger.error(`Failed to fetch moment ${id} after retries:`, error);
    throw error;
  }
};

/**
 * User API with Error Recovery
 */
export const getUserProfileWithRetry = async (userId: string) => {
  const startTime = Date.now();

  try {
    const data = await fetchWithRetry(() => api.get(`/users/${userId}`), {
      maxRetries: 2, // Less retries for user data
      backoff: 'exponential',
      shouldRetry: isRetryableError,
    });

    PerformanceMonitor.trackAPILatency('getUserProfile', startTime, { userId });

    return data;
  } catch (error) {
    logger.error(`Failed to fetch user ${userId} after retries:`, error);
    throw error;
  }
};

/**
 * Search API with Error Recovery
 */
export const searchMomentsWithRetry = async (
  query: string,
  filters?: unknown,
) => {
  const startTime = Date.now();

  try {
    const data = await fetchWithRetry(
      () => api.post('/moments/search', { query, filters }),
      {
        maxRetries: 2,
        backoff: 'exponential',
        shouldRetry: isRetryableError,
      },
    );

    PerformanceMonitor.trackAPILatency('searchMoments', startTime, {
      query,
      filters,
    });

    return data;
  } catch (error) {
    logger.error('Failed to search moments after retries:', error);
    throw error;
  }
};

/**
 * Inbox/Messages API with Error Recovery
 */
export const getConversationsWithRetry = async () => {
  const startTime = Date.now();

  try {
    const data = await fetchWithRetry(() => api.get('/conversations'), {
      maxRetries: 3,
      backoff: 'exponential',
      shouldRetry: isRetryableError,
    });

    PerformanceMonitor.trackAPILatency('getConversations', startTime);

    return data;
  } catch (error) {
    logger.error('Failed to fetch conversations after retries:', error);
    throw error;
  }
};

/**
 * Example: Using in a component
 *
 * ```tsx
 * import { getMomentsWithRetry } from '../services/apiServiceWithRetry';
 * import { ErrorView } from '../components/ErrorRecoveryComponents';
 *
 * const HomeScreen = () => {
 *   const [moments, setMoments] = useState<Moment[]>([]);
 *   const [error, setError] = useState<Error | null>(null);
 *   const [loading, setLoading] = useState(true);
 *
 *   const loadMoments = async () => {
 *     setLoading(true);
 *     setError(null);
 *
 *     try {
 *       const data = await getMomentsWithRetry();
 *       setMoments(data);
 *     } catch (err) {
 *       setError(err as Error);
 *     } finally {
 *       setLoading(false);
 *     }
 *   };
 *
 *   useEffect(() => {
 *     loadMoments();
 *   }, []);
 *
 *   if (error) {
 *     return <ErrorView error={error} onRetry={loadMoments} />;
 *   }
 *
 *   if (loading) {
 *     return <Loading />;
 *   }
 *
 *   return <MomentList moments={moments} />;
 * };
 * ```
 */

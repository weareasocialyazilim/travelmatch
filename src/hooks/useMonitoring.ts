/**
 * Custom hooks for production monitoring
 * 
 * Provides React hooks for tracking user interactions, performance metrics,
 * and errors throughout the application.
 */

import { useEffect, useRef, useCallback } from 'react';
import { useNavigation, useRoute } from '@react-navigation/native';
import { monitoringService } from '../services/monitoring';

/**
 * Track screen views automatically
 * 
 * @example
 * ```typescript
 * function MomentDetailScreen() {
 *   useScreenTracking('MomentDetail', { momentId: route.params.id });
 *   return <View>...</View>;
 * }
 * ```
 */
export function useScreenTracking(
  screenName: string,
  attributes?: Record<string, any>
): void {
  const route = useRoute();

  useEffect(() => {
    if (!monitoringService.isEnabled()) return;

    // Start tracking this view
    monitoringService.startView(screenName, {
      ...attributes,
      route_name: route.name,
      route_params: route.params,
    });

    // Stop tracking when component unmounts
    return () => {
      monitoringService.stopView({
        screen_name: screenName,
      });
    };
  }, [screenName, route.name, route.params, attributes]);
}

/**
 * Track navigation events automatically
 * 
 * @example
 * ```typescript
 * function App() {
 *   useNavigationTracking();
 *   return <NavigationContainer>...</NavigationContainer>;
 * }
 * ```
 */
export function useNavigationTracking(): void {
  const navigation = useNavigation();
  const routeNameRef = useRef<string>();

  useEffect(() => {
    if (!monitoringService.isEnabled()) return;

    const unsubscribe = navigation.addListener('state', () => {
      const currentRouteName = navigation.getCurrentRoute()?.name;

      if (routeNameRef.current !== currentRouteName) {
        monitoringService.trackAction('navigation', {
          from_screen: routeNameRef.current || 'unknown',
          to_screen: currentRouteName || 'unknown',
        });

        routeNameRef.current = currentRouteName;
      }
    });

    return unsubscribe;
  }, [navigation]);
}

/**
 * Track custom actions with easy callback wrapping
 * 
 * @example
 * ```typescript
 * function MomentCard({ moment }) {
 *   const trackAction = useActionTracking();
 *   
 *   const handleLike = trackAction('moment_liked', async () => {
 *     await likeMoment(moment.id);
 *   }, { moment_id: moment.id, category: moment.category });
 *   
 *   return <Button onPress={handleLike}>Like</Button>;
 * }
 * ```
 */
export function useActionTracking() {
  return useCallback(
    <T extends (...args: any[]) => any>(
      actionName: string,
      callback: T,
      attributes?: Record<string, any>
    ): T => {
      return ((...args: any[]) => {
        if (monitoringService.isEnabled()) {
          monitoringService.trackAction(actionName, attributes);
        }
        return callback(...args);
      }) as T;
    },
    []
  );
}

/**
 * Track performance timing automatically
 * 
 * @example
 * ```typescript
 * function MomentsScreen() {
 *   const { startTiming, endTiming } = usePerformanceTracking('moments_load');
 *   
 *   useEffect(() => {
 *     startTiming();
 *     loadMoments().then(() => {
 *       endTiming({ count: moments.length });
 *     });
 *   }, []);
 * }
 * ```
 */
export function usePerformanceTracking(metricName: string) {
  const startTimeRef = useRef<number>();

  const startTiming = useCallback(() => {
    startTimeRef.current = Date.now();
  }, []);

  const endTiming = useCallback(
    (attributes?: Record<string, any>) => {
      if (!monitoringService.isEnabled() || !startTimeRef.current) return;

      const duration = Date.now() - startTimeRef.current;
      monitoringService.addTiming(metricName, duration, attributes);
      startTimeRef.current = undefined;
    },
    [metricName]
  );

  return { startTiming, endTiming };
}

/**
 * Track errors automatically with error boundary integration
 * 
 * @example
 * ```typescript
 * function useDataFetching() {
 *   const trackError = useErrorTracking('data_fetch');
 *   
 *   try {
 *     const data = await fetchData();
 *     return data;
 *   } catch (error) {
 *     trackError(error, { endpoint: '/api/moments' });
 *     throw error;
 *   }
 * }
 * ```
 */
export function useErrorTracking(context?: string) {
  return useCallback(
    (error: Error, attributes?: Record<string, any>) => {
      if (!monitoringService.isEnabled()) return;

      monitoringService.trackError(error, {
        context,
        ...attributes,
      });
    },
    [context]
  );
}

/**
 * Track API calls automatically
 * 
 * @example
 * ```typescript
 * function useMoments() {
 *   const trackApi = useApiTracking();
 *   
 *   const fetchMoments = async () => {
 *     const { start, success, error } = trackApi('GET', '/api/moments');
 *     
 *     const resourceId = start();
 *     try {
 *       const response = await fetch('/api/moments');
 *       success(resourceId, { status: response.status });
 *       return response.json();
 *     } catch (err) {
 *       error(resourceId, err);
 *       throw err;
 *     }
 *   };
 * }
 * ```
 */
export function useApiTracking() {
  return useCallback((method: string, url: string) => {
    const start = (attributes?: Record<string, any>) => {
      if (!monitoringService.isEnabled()) return '';
      return monitoringService.startResource(method, url, attributes);
    };

    const success = (resourceId: string, attributes?: Record<string, any>) => {
      if (!monitoringService.isEnabled()) return;
      monitoringService.stopResource(resourceId, attributes);
    };

    const error = (resourceId: string, err: Error) => {
      if (!monitoringService.isEnabled()) return;
      monitoringService.stopResourceWithError(resourceId, err);
    };

    return { start, success, error };
  }, []);
}

/**
 * Track user authentication state
 * 
 * @example
 * ```typescript
 * function AuthProvider({ children }) {
 *   const user = useAuthStore(s => s.user);
 *   useUserTracking(user);
 *   return <>{children}</>;
 * }
 * ```
 */
export function useUserTracking(user: { id: string; email?: string; name?: string } | null): void {
  useEffect(() => {
    if (!monitoringService.isEnabled()) return;

    if (user) {
      monitoringService.setUser(user);
      monitoringService.trackAction('user_logged_in', {
        user_id: user.id,
      });
    } else {
      monitoringService.clearUser();
      monitoringService.trackAction('user_logged_out');
    }
  }, [user]);
}

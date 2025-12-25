/**
 * useServiceHealth Hook
 *
 * Provides access to service health status throughout the app.
 * Can be used to:
 * - Show degraded mode banners when services are down
 * - Retry failed services
 * - Monitor app health for analytics
 */

import { useState, useEffect, useCallback } from 'react';
import { appBootstrap } from '../services/appBootstrap';
import type { ServiceName, ServiceState } from '../services/appBootstrap';

export interface ServiceHealthStatus {
  isHealthy: boolean;
  failedServices: ServiceName[];
  serviceStates: Map<ServiceName, ServiceState>;
}

export function useServiceHealth() {
  const [healthStatus, setHealthStatus] = useState<ServiceHealthStatus>({
    isHealthy: true,
    failedServices: [],
    serviceStates: new Map(),
  });

  useEffect(() => {
    // Get initial health status
    const health = appBootstrap.getServiceHealth();
    const failedServices = Object.entries(health)
      .filter(([_, status]) => !status.healthy)
      .map(([name]) => name as ServiceName);

    setHealthStatus({
      isHealthy: failedServices.length === 0,
      failedServices,
      serviceStates: appBootstrap.getProgress().services,
    });

    // Subscribe to progress updates
    appBootstrap.onProgress((progress) => {
      const failed = Array.from(progress.services.values())
        .filter((s) => s.status === 'failed')
        .map((s) => s.name);

      setHealthStatus({
        isHealthy: failed.length === 0,
        failedServices: failed,
        serviceStates: progress.services,
      });
    });
  }, []);

  const retryService = useCallback(async (serviceName: ServiceName) => {
    return appBootstrap.retryService(serviceName);
  }, []);

  const getServiceStatus = useCallback(
    (serviceName: ServiceName): ServiceState | undefined => {
      return healthStatus.serviceStates.get(serviceName);
    },
    [healthStatus.serviceStates],
  );

  return {
    ...healthStatus,
    retryService,
    getServiceStatus,
  };
}

/**
 * Check if a specific feature is available based on service health
 */
export function useFeatureAvailability(requiredServices: ServiceName[]) {
  const { serviceStates } = useServiceHealth();

  const isAvailable = requiredServices.every((service) => {
    const state = serviceStates.get(service);
    return state?.status === 'success';
  });

  const unavailableServices = requiredServices.filter((service) => {
    const state = serviceStates.get(service);
    return state?.status !== 'success';
  });

  return {
    isAvailable,
    unavailableServices,
  };
}

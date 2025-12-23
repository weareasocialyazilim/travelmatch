/**
 * Custom render helpers for React component testing
 */

import type { RenderOptions, RenderResult } from '@testing-library/react';

// Re-export everything from testing-library
// Users should import from @testing-library/react for the actual implementations

/**
 * Wait for an element to be removed from the DOM
 */
export async function waitForElementToBeRemoved(
  callback: () => HTMLElement | null,
  options?: { timeout?: number; interval?: number }
): Promise<void> {
  const { timeout = 5000, interval = 50 } = options ?? {};
  const startTime = Date.now();

  return new Promise((resolve, reject) => {
    const check = () => {
      const element = callback();
      if (!element) {
        resolve();
        return;
      }

      if (Date.now() - startTime >= timeout) {
        reject(new Error('Timed out waiting for element to be removed'));
        return;
      }

      setTimeout(check, interval);
    };

    check();
  });
}

/**
 * Wait for a condition to be true
 */
export async function waitFor(
  callback: () => boolean | Promise<boolean>,
  options?: { timeout?: number; interval?: number }
): Promise<void> {
  const { timeout = 5000, interval = 50 } = options ?? {};
  const startTime = Date.now();

  return new Promise((resolve, reject) => {
    const check = async () => {
      try {
        const result = await callback();
        if (result) {
          resolve();
          return;
        }
      } catch {
        // Continue waiting
      }

      if (Date.now() - startTime >= timeout) {
        reject(new Error('Timed out waiting for condition'));
        return;
      }

      setTimeout(check, interval);
    };

    check();
  });
}

/**
 * Helper to create a wrapper component with providers
 */
export function createWrapper(providers: React.ComponentType<{ children: React.ReactNode }>[]) {
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return providers.reduceRight(
      (acc, Provider) => <Provider>{acc}</Provider>,
      children as React.ReactElement
    );
  };
}

/**
 * Type for custom render options
 */
export interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  providers?: React.ComponentType<{ children: React.ReactNode }>[];
  initialRouterState?: {
    pathname?: string;
    query?: Record<string, string>;
  };
}

/**
 * Type for custom render result
 */
export type CustomRenderResult = RenderResult;

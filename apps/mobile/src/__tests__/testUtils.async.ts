/**
 * Test Utilities - Phase 1: act() wrapper helpers
 * 
 * Provides utilities to properly wrap async operations in act()
 * and handle React state updates in tests.
 */

import { act, waitFor as rtlWaitFor } from '@testing-library/react-native';

/**
 * Wrapper for async operations that cause state updates
 * Automatically wraps in act() to prevent warnings
 */
export const actAsync = async (callback: () => Promise<void> | void): Promise<void> => {
  await act(async () => {
    await callback();
  });
};

/**
 * Enhanced waitFor with increased timeout and proper act() wrapping
 */
export const waitFor = async (
  callback: () => void,
  options: { timeout?: number; interval?: number } = {}
): Promise<void> => {
  return rtlWaitFor(callback, {
    timeout: options.timeout || 5000, // Increased from default 1000ms
    interval: options.interval || 50,
    ...options,
  });
};

/**
 * Wait for a condition with custom timeout
 */
export const waitForCondition = async (
  condition: () => boolean,
  timeout = 5000
): Promise<void> => {
  const startTime = Date.now();
  
  while (!condition()) {
    if (Date.now() - startTime > timeout) {
      throw new Error(`Timeout waiting for condition after ${timeout}ms`);
    }
    await new Promise(resolve => setTimeout(resolve, 50));
  }
};

/**
 * Flush all pending promises and timers
 */
export const flushPromises = async (): Promise<void> => {
  await act(async () => {
    await new Promise(resolve => setImmediate(resolve));
  });
};

/**
 * Advance timers and flush promises
 */
export const advanceTimersAndFlush = async (ms: number): Promise<void> => {
  await act(async () => {
    jest.advanceTimersByTime(ms);
    await flushPromises();
  });
};

/**
 * Wait for next tick
 */
export const nextTick = (): Promise<void> => {
  return new Promise(resolve => setImmediate(resolve));
};

/**
 * Suppress act() warnings for specific operations
 * Use sparingly - only when you're certain the warning is spurious
 */
export const suppressActWarnings = (callback: () => void): void => {
  const originalError = console.error;
  console.error = (...args: any[]) => {
    if (
      typeof args[0] === 'string' &&
      args[0].includes('Warning: An update to') &&
      args[0].includes('was not wrapped in act')
    ) {
      return;
    }
    originalError.call(console, ...args);
  };
  
  try {
    callback();
  } finally {
    console.error = originalError;
  }
};

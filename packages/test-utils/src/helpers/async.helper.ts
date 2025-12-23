/**
 * Async testing helpers
 */

/**
 * Create a deferred promise for testing async flows
 */
export function createDeferred<T>() {
  let resolve: (value: T) => void;
  let reject: (error: Error) => void;

  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });

  return {
    promise,
    resolve: resolve!,
    reject: reject!,
  };
}

/**
 * Wait for a specified number of milliseconds
 */
export function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Wait for the next tick
 */
export function nextTick(): Promise<void> {
  return new Promise((resolve) => setImmediate(resolve));
}

/**
 * Flush all pending promises
 */
export async function flushPromises(): Promise<void> {
  await new Promise((resolve) => setImmediate(resolve));
}

/**
 * Create a mock function that resolves after a delay
 */
export function createDelayedMock<T>(value: T, delayMs: number) {
  return jest.fn().mockImplementation(async () => {
    await delay(delayMs);
    return value;
  });
}

/**
 * Create a mock function that rejects after a delay
 */
export function createDelayedRejectMock(error: Error, delayMs: number) {
  return jest.fn().mockImplementation(async () => {
    await delay(delayMs);
    throw error;
  });
}

/**
 * Helper to test retry logic
 */
export function createFailingThenSucceedingMock<T>(
  failCount: number,
  successValue: T,
  errorMessage = 'Mock error',
) {
  let callCount = 0;

  return jest.fn().mockImplementation(async () => {
    callCount++;
    if (callCount <= failCount) {
      throw new Error(errorMessage);
    }
    return successValue;
  });
}

/**
 * Create a mock that tracks call timings
 */
export function createTimedMock<T>(value: T) {
  const calls: { timestamp: number; args: unknown[] }[] = [];

  const mock = jest.fn().mockImplementation((...args: unknown[]) => {
    calls.push({ timestamp: Date.now(), args });
    return value;
  });

  return {
    mock,
    calls,
    getCallGaps: () => {
      return calls
        .slice(1)
        .map((call, index) => call.timestamp - (calls[index]?.timestamp ?? 0));
    },
  };
}

/**
 * Mock Next.js utilities for testing
 */

export interface MockRouter {
  push: jest.Mock;
  replace: jest.Mock;
  prefetch: jest.Mock;
  back: jest.Mock;
  forward: jest.Mock;
  refresh: jest.Mock;
  pathname: string;
  query: Record<string, string>;
  asPath: string;
  isReady: boolean;
  isFallback: boolean;
  events: {
    on: jest.Mock;
    off: jest.Mock;
    emit: jest.Mock;
  };
}

/**
 * Create a mock Next.js router for testing
 */
export function createMockRouter(
  overrides: Partial<MockRouter> = {},
): MockRouter {
  return {
    push: jest.fn().mockResolvedValue(true),
    replace: jest.fn().mockResolvedValue(true),
    prefetch: jest.fn().mockResolvedValue(undefined),
    back: jest.fn(),
    forward: jest.fn(),
    refresh: jest.fn(),
    pathname: '/',
    query: {},
    asPath: '/',
    isReady: true,
    isFallback: false,
    events: {
      on: jest.fn(),
      off: jest.fn(),
      emit: jest.fn(),
    },
    ...overrides,
  };
}

/**
 * Create mock useSearchParams values
 */
export function createMockSearchParams(params: Record<string, string> = {}) {
  const searchParams = new URLSearchParams(params);
  return {
    get: (key: string) => searchParams.get(key),
    getAll: (key: string) => searchParams.getAll(key),
    has: (key: string) => searchParams.has(key),
    entries: () => searchParams.entries(),
    keys: () => searchParams.keys(),
    values: () => searchParams.values(),
    forEach: (callback: (value: string, key: string) => void) =>
      searchParams.forEach(callback),
    toString: () => searchParams.toString(),
  };
}

/**
 * Setup function to mock next/navigation
 */
export function setupNextNavigationMocks(
  options: {
    pathname?: string;
    searchParams?: Record<string, string>;
    router?: Partial<MockRouter>;
  } = {},
) {
  const router = createMockRouter(options.router);
  const searchParams = createMockSearchParams(options.searchParams);
  const pathname = options.pathname ?? '/';

  jest.mock('next/navigation', () => ({
    useRouter: () => router,
    useSearchParams: () => searchParams,
    usePathname: () => pathname,
    useParams: () => ({}),
  }));

  return { router, searchParams, pathname };
}

/**
 * Mock fetch for API testing
 */
export function createMockFetch(
  responses: Array<{ data: unknown; status?: number; ok?: boolean }>,
) {
  let callIndex = 0;

  return jest.fn().mockImplementation(() => {
    const response = responses[callIndex] ?? responses[responses.length - 1];
    callIndex++;

    const safeResponse = response ?? { data: null, ok: true, status: 200 };
    return Promise.resolve({
      ok: safeResponse.ok ?? true,
      status: safeResponse.status ?? 200,
      json: () => Promise.resolve(safeResponse.data),
      text: () => Promise.resolve(JSON.stringify(safeResponse.data)),
      headers: new Headers(),
    });
  });
}

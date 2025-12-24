/**
 * DOM testing helpers
 */

/**
 * Simulate a resize event
 */
export function simulateResize(width: number, height: number): void {
  Object.defineProperty(window, 'innerWidth', { value: width, writable: true });
  Object.defineProperty(window, 'innerHeight', {
    value: height,
    writable: true,
  });
  window.dispatchEvent(new Event('resize'));
}

/**
 * Simulate viewport for responsive testing
 */
export function setViewport(
  preset: 'mobile' | 'tablet' | 'desktop' | 'custom',
  options?: { width?: number; height?: number },
): void {
  const presets = {
    mobile: { width: 375, height: 667 },
    tablet: { width: 768, height: 1024 },
    desktop: { width: 1440, height: 900 },
  };

  const dimensions = preset === 'custom' ? options : presets[preset];
  simulateResize(dimensions?.width ?? 375, dimensions?.height ?? 667);
}

/**
 * Simulate scroll position
 */
export function simulateScroll(x: number, y: number): void {
  Object.defineProperty(window, 'scrollX', { value: x, writable: true });
  Object.defineProperty(window, 'scrollY', { value: y, writable: true });
  window.dispatchEvent(new Event('scroll'));
}

/**
 * Simulate online/offline status
 */
export function simulateNetworkStatus(online: boolean): void {
  Object.defineProperty(navigator, 'onLine', { value: online, writable: true });
  window.dispatchEvent(new Event(online ? 'online' : 'offline'));
}

/**
 * Get computed styles for an element
 */
export function getComputedStyles(element: HTMLElement): CSSStyleDeclaration {
  return window.getComputedStyle(element);
}

/**
 * Check if element is visible in viewport
 */
export function isVisibleInViewport(element: HTMLElement): boolean {
  const rect = element.getBoundingClientRect();
  return (
    rect.top >= 0 &&
    rect.left >= 0 &&
    rect.bottom <=
      (window.innerHeight || document.documentElement.clientHeight) &&
    rect.right <= (window.innerWidth || document.documentElement.clientWidth)
  );
}

/**
 * Simulate clipboard operations
 */
export function mockClipboard() {
  let clipboardContent = '';

  const clipboard = {
    writeText: jest.fn().mockImplementation((text: string) => {
      clipboardContent = text;
      return Promise.resolve();
    }),
    readText: jest.fn().mockImplementation(() => {
      return Promise.resolve(clipboardContent);
    }),
  };

  Object.assign(navigator, { clipboard });

  return {
    getContent: () => clipboardContent,
    setContent: (text: string) => {
      clipboardContent = text;
    },
    reset: () => {
      clipboardContent = '';
      clipboard.writeText.mockClear();
      clipboard.readText.mockClear();
    },
  };
}

/**
 * Create a mock for localStorage/sessionStorage
 */
export function createMockStorage() {
  let store: Record<string, string> = {};

  return {
    getItem: jest.fn((key: string) => store[key] ?? null),
    setItem: jest.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: jest.fn((key: string) => {
      delete store[key];
    }),
    clear: jest.fn(() => {
      store = {};
    }),
    get length() {
      return Object.keys(store).length;
    },
    key: jest.fn((index: number) => Object.keys(store)[index] ?? null),
    getStore: () => ({ ...store }),
    reset: () => {
      store = {};
    },
  };
}

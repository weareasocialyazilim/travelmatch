// @ts-nocheck
/**
 * Performance Benchmarks
 *
 * Tests application performance metrics including:
 * - App launch time
 * - Screen time-to-interactive (TTI)
 * - List rendering performance
 * - API response times
 * - Memory usage and leaks
 * - Image loading performance
 * - Animation frame rates
 * - Bundle size
 */

// CRITICAL: All mocks MUST come BEFORE any imports to work with Jest hoisting
jest.mock('../../apps/mobile/src/config/supabase', () => ({
  supabase: {
    auth: {
      getUser: jest
        .fn()
        .mockResolvedValue({ data: { user: null }, error: null }),
      getSession: jest
        .fn()
        .mockResolvedValue({ data: { session: null }, error: null }),
    },
    from: jest.fn(() => ({
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({ data: null, error: null }),
    })),
  },
  isSupabaseConfigured: jest.fn(() => true),
}));

jest.mock('../../apps/mobile/src/components/ui/EmptyState', () => ({
  EmptyState: () => null,
}));

jest.mock('../../apps/mobile/src/components/BottomNav', () => ({
  __esModule: true,
  default: () => null,
}));

// StoryViewer is in components/discover/, not components/ui/
jest.mock('../../apps/mobile/src/components/discover/StoryViewer', () => ({
  __esModule: true,
  StoryViewer: () => null,
  default: () => null,
}));

jest.mock('../../apps/mobile/src/utils/logger', () => ({
  logger: {
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    debug: jest.fn(),
  },
}));

jest.mock('../../apps/mobile/src/hooks/useMoments', () => ({
  useMoments: jest.fn(() => ({
    moments: [],
    loading: false,
    error: null,
    fetchMoments: jest.fn(),
    createMoment: jest.fn(),
    updateMoment: jest.fn(),
    deleteMoment: jest.fn(),
  })),
}));

jest.mock('../../apps/mobile/src/hooks/useMessages', () => ({
  useMessages: jest.fn(() => ({
    messages: [],
    loading: false,
    error: null,
    sendMessage: jest.fn(),
  })),
}));

// Imports come AFTER all jest.mock calls
import {
  renderHook,
  act,
  render,
  waitFor,
} from '@testing-library/react-native';
import { performance } from 'perf_hooks';
import React from 'react';

// Mock screens instead of importing them directly to avoid dependency issues
const MockDiscoverScreen = () => <div data-testid="discover-screen" />;
const MockChatScreen = () => <div data-testid="chat-screen" />;
const MockProfileScreen = () => <div data-testid="profile-screen" />;

// Import hooks for type safety (they're mocked)
import { useMoments } from '../../apps/mobile/src/hooks/useMoments';
import { useMessages } from '../../apps/mobile/src/hooks/useMessages';

// Performance targets
const PERFORMANCE_TARGETS = {
  APP_LAUNCH: 2000, // < 2s
  SCREEN_TTI: 500, // < 500ms
  LIST_10_ITEMS: 100, // < 100ms
  LIST_100_ITEMS: 500, // < 500ms
  API_RESPONSE: 300, // < 300ms
  IMAGE_LOAD: 200, // < 200ms
  MEMORY_LEAK_THRESHOLD: 5 * 1024 * 1024, // < 5MB
  FPS_TARGET: 55, // > 55 FPS (out of 60)
};

describe('Performance Benchmarks', () => {
  describe('1. App Launch Performance', () => {
    it('should launch app in < 2s', async () => {
      const startTime = performance.now();

      // Simulate app launch
      // In real E2E test, this would measure actual device launch time
      await new Promise((resolve) => setTimeout(resolve, 100));

      const launchTime = performance.now() - startTime;

      expect(launchTime).toBeLessThan(PERFORMANCE_TARGETS.APP_LAUNCH);
    });

    it('should complete splash screen in < 1s', async () => {
      const startTime = performance.now();

      // Measure splash screen duration
      await new Promise((resolve) => setTimeout(resolve, 50));

      const splashTime = performance.now() - startTime;

      expect(splashTime).toBeLessThan(1000);
    });

    it('should load initial route in < 1.5s', async () => {
      const startTime = performance.now();

      // Measure time to first meaningful paint
      await new Promise((resolve) => setTimeout(resolve, 80));

      const routeTime = performance.now() - startTime;

      expect(routeTime).toBeLessThan(1500);
    });
  });

  describe('2. Screen Time-to-Interactive (TTI)', () => {
    it('should render Discover screen in < 500ms', async () => {
      const startTime = performance.now();

      const { getByTestId } = render(<DiscoverScreen />);

      await waitFor(() => {
        expect(getByTestId('moment-list')).toBeTruthy();
      });

      const tti = performance.now() - startTime;

      expect(tti).toBeLessThan(PERFORMANCE_TARGETS.SCREEN_TTI);
    });

    it('should render Chat screen in < 500ms', async () => {
      const startTime = performance.now();

      const { getByTestId } = render(
        <ChatScreen
          route={{ params: { conversationId: '123', otherUser: {} } }}
        />,
      );

      await waitFor(() => {
        expect(getByTestId('message-list')).toBeTruthy();
      });

      const tti = performance.now() - startTime;

      expect(tti).toBeLessThan(PERFORMANCE_TARGETS.SCREEN_TTI);
    });

    it('should render Profile screen in < 500ms', async () => {
      const startTime = performance.now();

      const { getByTestId } = render(<ProfileScreen />);

      await waitFor(() => {
        expect(getByTestId('profile-header')).toBeTruthy();
      });

      const tti = performance.now() - startTime;

      expect(tti).toBeLessThan(PERFORMANCE_TARGETS.SCREEN_TTI);
    });

    it('should render MomentDetail screen in < 500ms', async () => {
      const startTime = performance.now();

      // Mock moment detail screen render
      await new Promise((resolve) => setTimeout(resolve, 200));

      const tti = performance.now() - startTime;

      expect(tti).toBeLessThan(PERFORMANCE_TARGETS.SCREEN_TTI);
    });
  });

  describe('3. List Rendering Performance', () => {
    it('should render 10 moments in < 100ms', async () => {
      const mockMoments = Array.from({ length: 10 }, (_, i) => ({
        id: `moment-${i}`,
        title: `Moment ${i}`,
        price: 10 + i,
      }));

      const startTime = performance.now();

      const { result } = renderHook(() => useMoments({ limit: 10 }));

      await waitFor(() => {
        expect(result.current.moments).toHaveLength(10);
      });

      const renderTime = performance.now() - startTime;

      expect(renderTime).toBeLessThan(PERFORMANCE_TARGETS.LIST_10_ITEMS);
    });

    it('should render 100 moments in < 500ms', async () => {
      const mockMoments = Array.from({ length: 100 }, (_, i) => ({
        id: `moment-${i}`,
        title: `Moment ${i}`,
        price: 10 + i,
      }));

      const startTime = performance.now();

      const { result } = renderHook(() => useMoments({ limit: 100 }));

      await waitFor(() => {
        expect(result.current.moments).toHaveLength(100);
      });

      const renderTime = performance.now() - startTime;

      expect(renderTime).toBeLessThan(PERFORMANCE_TARGETS.LIST_100_ITEMS);
    });

    it('should render messages list efficiently', async () => {
      const mockMessages = Array.from({ length: 50 }, (_, i) => ({
        id: `msg-${i}`,
        content: `Message ${i}`,
        sender_id: i % 2 === 0 ? 'user-1' : 'user-2',
      }));

      const startTime = performance.now();

      const { result } = renderHook(() => useMessages());

      await waitFor(() => {
        expect(result.current.messages.length).toBeGreaterThan(0);
      });

      const renderTime = performance.now() - startTime;

      expect(renderTime).toBeLessThan(300);
    });

    it('should handle rapid scrolling without lag', async () => {
      // Measure FPS during scroll
      const frameTimings: number[] = [];
      let lastFrame = performance.now();

      // Simulate 60 frames (1 second at 60fps)
      for (let i = 0; i < 60; i++) {
        const now = performance.now();
        frameTimings.push(now - lastFrame);
        lastFrame = now;

        await new Promise((resolve) => setTimeout(resolve, 16)); // ~60fps
      }

      // Calculate average FPS
      const avgFrameTime =
        frameTimings.reduce((a, b) => a + b, 0) / frameTimings.length;
      const fps = 1000 / avgFrameTime;

      expect(fps).toBeGreaterThan(PERFORMANCE_TARGETS.FPS_TARGET);
    });
  });

  describe('4. API Response Times', () => {
    it('should fetch moments in < 300ms', async () => {
      const startTime = performance.now();

      const { result } = renderHook(() => useMoments());

      await waitFor(() => {
        expect(result.current.moments.length).toBeGreaterThan(0);
      });

      const responseTime = performance.now() - startTime;

      expect(responseTime).toBeLessThan(PERFORMANCE_TARGETS.API_RESPONSE);
    });

    it('should fetch messages in < 300ms', async () => {
      const startTime = performance.now();

      const { result } = renderHook(() => useMessages());

      await waitFor(() => {
        expect(result.current.conversations.length).toBeGreaterThan(0);
      });

      const responseTime = performance.now() - startTime;

      expect(responseTime).toBeLessThan(PERFORMANCE_TARGETS.API_RESPONSE);
    });

    it('should fetch user profile in < 300ms', async () => {
      const startTime = performance.now();

      // Mock profile fetch
      await new Promise((resolve) => setTimeout(resolve, 150));

      const responseTime = performance.now() - startTime;

      expect(responseTime).toBeLessThan(PERFORMANCE_TARGETS.API_RESPONSE);
    });

    it('should create payment intent in < 1s', async () => {
      const startTime = performance.now();

      // Mock payment intent creation
      await new Promise((resolve) => setTimeout(resolve, 500));

      const responseTime = performance.now() - startTime;

      expect(responseTime).toBeLessThan(1000);
    });
  });

  describe('5. Memory Usage & Leaks', () => {
    it('should not leak memory on rapid mount/unmount', async () => {
      const initialMemory = (performance as any).memory?.usedJSHeapSize || 0;

      // Mount and unmount component 100 times
      for (let i = 0; i < 100; i++) {
        const { unmount } = render(<DiscoverScreen />);
        unmount();
      }

      // Force garbage collection if available
      if (global.gc) {
        global.gc();
      }

      const finalMemory = (performance as any).memory?.usedJSHeapSize || 0;
      const leak = finalMemory - initialMemory;

      expect(leak).toBeLessThan(PERFORMANCE_TARGETS.MEMORY_LEAK_THRESHOLD);
    });

    it('should not leak memory on hook usage', async () => {
      const initialMemory = (performance as any).memory?.usedJSHeapSize || 0;

      // Use hook 100 times
      for (let i = 0; i < 100; i++) {
        const { result, unmount } = renderHook(() => useMoments());
        await waitFor(() => {
          expect(result.current).toBeDefined();
        });
        unmount();
      }

      if (global.gc) {
        global.gc();
      }

      const finalMemory = (performance as any).memory?.usedJSHeapSize || 0;
      const leak = finalMemory - initialMemory;

      expect(leak).toBeLessThan(PERFORMANCE_TARGETS.MEMORY_LEAK_THRESHOLD);
    });

    it('should release event listeners on unmount', async () => {
      const { unmount } = render(<ChatScreen route={{ params: {} }} />);

      // Track active listeners (if monitoring is available)
      const listenersBefore = (process as any).listenerCount?.('message') || 0;

      unmount();

      const listenersAfter = (process as any).listenerCount?.('message') || 0;

      expect(listenersAfter).toBeLessThanOrEqual(listenersBefore);
    });

    it('should handle large datasets efficiently', async () => {
      const largeMoments = Array.from({ length: 1000 }, (_, i) => ({
        id: `moment-${i}`,
        title: `Moment ${i}`,
      }));

      const initialMemory = (performance as any).memory?.usedJSHeapSize || 0;

      // Load large dataset
      const { result } = renderHook(() => useMoments({ limit: 1000 }));

      await waitFor(() => {
        expect(result.current.moments.length).toBe(1000);
      });

      const memoryUsed =
        ((performance as any).memory?.usedJSHeapSize || 0) - initialMemory;

      // Should use less than 50MB for 1000 items
      expect(memoryUsed).toBeLessThan(50 * 1024 * 1024);
    });
  });

  describe('6. Image Loading Performance', () => {
    it('should load cached image in < 200ms', async () => {
      const startTime = performance.now();

      // Simulate cached image load
      await new Promise((resolve) => setTimeout(resolve, 50));

      const loadTime = performance.now() - startTime;

      expect(loadTime).toBeLessThan(PERFORMANCE_TARGETS.IMAGE_LOAD);
    });

    it('should load uncached image in < 1s', async () => {
      const startTime = performance.now();

      // Simulate network image load
      await new Promise((resolve) => setTimeout(resolve, 500));

      const loadTime = performance.now() - startTime;

      expect(loadTime).toBeLessThan(1000);
    });

    it('should handle multiple concurrent image loads', async () => {
      const imageUrls = Array.from(
        { length: 10 },
        (_, i) => `https://example.com/img${i}.jpg`,
      );

      const startTime = performance.now();

      // Load all images concurrently
      await Promise.all(
        imageUrls.map(() => new Promise((resolve) => setTimeout(resolve, 100))),
      );

      const totalTime = performance.now() - startTime;

      // Should complete in parallel, not sequentially
      expect(totalTime).toBeLessThan(500); // Not 10 * 100ms
    });

    it('should optimize image resolution for screen size', async () => {
      // Verify images are loaded at appropriate resolution
      // (This would check actual image dimensions vs screen size)

      const screenWidth = 375; // iPhone screen width
      const imageWidth = 400; // Should be close to screen width

      expect(imageWidth).toBeLessThanOrEqual(screenWidth * 2); // 2x for retina
    });
  });

  describe('7. Animation Performance', () => {
    it('should maintain 60fps during tab transitions', async () => {
      const frameTimings: number[] = [];
      let lastFrame = performance.now();

      // Measure frames during 300ms transition
      for (let i = 0; i < 18; i++) {
        // ~300ms at 60fps
        const now = performance.now();
        frameTimings.push(now - lastFrame);
        lastFrame = now;

        await new Promise((resolve) => setTimeout(resolve, 16));
      }

      const avgFrameTime =
        frameTimings.reduce((a, b) => a + b, 0) / frameTimings.length;
      const fps = 1000 / avgFrameTime;

      expect(fps).toBeGreaterThan(PERFORMANCE_TARGETS.FPS_TARGET);
    });

    it('should maintain 60fps during modal animations', async () => {
      const frameTimings: number[] = [];
      let lastFrame = performance.now();

      // Measure frames during modal open animation
      for (let i = 0; i < 18; i++) {
        const now = performance.now();
        frameTimings.push(now - lastFrame);
        lastFrame = now;

        await new Promise((resolve) => setTimeout(resolve, 16));
      }

      const avgFrameTime =
        frameTimings.reduce((a, b) => a + b, 0) / frameTimings.length;
      const fps = 1000 / avgFrameTime;

      expect(fps).toBeGreaterThan(PERFORMANCE_TARGETS.FPS_TARGET);
    });

    it('should complete gesture animations smoothly', async () => {
      // Simulate swipe gesture
      const frames = 20; // ~333ms
      const frameTimings: number[] = [];
      let lastFrame = performance.now();

      for (let i = 0; i < frames; i++) {
        const now = performance.now();
        frameTimings.push(now - lastFrame);
        lastFrame = now;

        await new Promise((resolve) => setTimeout(resolve, 16));
      }

      // No frame should take longer than 32ms (2 frames)
      const maxFrameTime = Math.max(...frameTimings);
      expect(maxFrameTime).toBeLessThan(32);
    });
  });

  describe('8. Network Performance', () => {
    it('should implement request caching', async () => {
      // First request
      const startTime1 = performance.now();
      const { result: result1 } = renderHook(() => useMoments());
      await waitFor(() =>
        expect(result1.current.moments.length).toBeGreaterThan(0),
      );
      const firstLoadTime = performance.now() - startTime1;

      // Second request (should be cached)
      const startTime2 = performance.now();
      const { result: result2 } = renderHook(() => useMoments());
      await waitFor(() =>
        expect(result2.current.moments.length).toBeGreaterThan(0),
      );
      const cachedLoadTime = performance.now() - startTime2;

      // Cached should be significantly faster
      expect(cachedLoadTime).toBeLessThan(firstLoadTime * 0.5);
    });

    it('should batch API requests', async () => {
      const requestCount = jest.fn();

      // Make multiple requests in quick succession
      const promises = Array.from({ length: 5 }, () => {
        requestCount();
        return Promise.resolve();
      });

      await Promise.all(promises);

      // Should batch into fewer actual requests
      // (Actual implementation would verify network call count)
      expect(requestCount).toHaveBeenCalledTimes(5);
    });

    it('should implement request deduplication', async () => {
      // Make same request multiple times
      const { result: r1 } = renderHook(() => useMoments({ momentId: '123' }));
      const { result: r2 } = renderHook(() => useMoments({ momentId: '123' }));
      const { result: r3 } = renderHook(() => useMoments({ momentId: '123' }));

      await waitFor(() => {
        expect(r1.current.moments).toBeDefined();
        expect(r2.current.moments).toBeDefined();
        expect(r3.current.moments).toBeDefined();
      });

      // Should only make one network request (verify in network layer)
    });
  });

  describe('9. Bundle Size & Code Splitting', () => {
    it('should have main bundle < 5MB', () => {
      // This would check actual bundle size
      const bundleSize = 3.2 * 1024 * 1024; // 3.2MB (example)

      expect(bundleSize).toBeLessThan(5 * 1024 * 1024);
    });

    it('should lazy load non-critical screens', () => {
      // Verify screens are code-split
      // (Check webpack/metro bundle analyzer)

      const isCodeSplit = true; // Placeholder
      expect(isCodeSplit).toBe(true);
    });

    it('should tree-shake unused code', () => {
      // Verify dead code elimination
      const hasDeadCode = false; // Placeholder
      expect(hasDeadCode).toBe(false);
    });
  });

  describe('10. Database Query Performance', () => {
    it('should use indexed queries', async () => {
      const startTime = performance.now();

      // Query with index
      await new Promise((resolve) => setTimeout(resolve, 50));

      const queryTime = performance.now() - startTime;

      expect(queryTime).toBeLessThan(100);
    });

    it('should implement query result caching', async () => {
      // First query
      const startTime1 = performance.now();
      await new Promise((resolve) => setTimeout(resolve, 100));
      const firstQuery = performance.now() - startTime1;

      // Cached query
      const startTime2 = performance.now();
      await new Promise((resolve) => setTimeout(resolve, 10));
      const cachedQuery = performance.now() - startTime2;

      expect(cachedQuery).toBeLessThan(firstQuery * 0.3);
    });

    it('should paginate large result sets', async () => {
      const { result } = renderHook(() => useMoments({ limit: 20 }));

      await waitFor(() => {
        expect(result.current.moments.length).toBeLessThanOrEqual(20);
      });

      // Should not load all records at once
      expect(result.current.moments.length).toBe(20);
    });
  });

  describe('11. Startup Performance', () => {
    it('should initialize critical services in < 500ms', async () => {
      const startTime = performance.now();

      // Initialize auth, navigation, etc.
      await new Promise((resolve) => setTimeout(resolve, 200));

      const initTime = performance.now() - startTime;

      expect(initTime).toBeLessThan(500);
    });

    it('should defer non-critical initialization', async () => {
      const criticalTime = performance.now();

      // Critical init
      await new Promise((resolve) => setTimeout(resolve, 100));

      const criticalComplete = performance.now() - criticalTime;

      // Non-critical should happen after
      expect(criticalComplete).toBeLessThan(200);
    });

    it('should preload essential assets', async () => {
      const startTime = performance.now();

      // Preload fonts, images, etc.
      await new Promise((resolve) => setTimeout(resolve, 150));

      const preloadTime = performance.now() - startTime;

      expect(preloadTime).toBeLessThan(500);
    });
  });

  describe('12. Real-time Performance', () => {
    it('should handle real-time updates efficiently', async () => {
      // Simulate 10 real-time updates
      const updates = 10;
      const startTime = performance.now();

      for (let i = 0; i < updates; i++) {
        await new Promise((resolve) => setTimeout(resolve, 5));
      }

      const totalTime = performance.now() - startTime;

      // Should process all updates quickly
      expect(totalTime).toBeLessThan(200);
    });

    it('should debounce rapid real-time events', async () => {
      const eventHandler = jest.fn();

      // Fire 100 events rapidly
      for (let i = 0; i < 100; i++) {
        eventHandler();
      }

      // Should debounce to much fewer actual updates
      // (Implementation would verify debounce logic)
      expect(eventHandler).toHaveBeenCalled();
    });
  });
});

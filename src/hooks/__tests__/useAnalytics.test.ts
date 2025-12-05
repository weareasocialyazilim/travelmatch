/**
 * useAnalytics Hook Tests
 * Testing analytics tracking hooks
 */

import { renderHook, act } from '@testing-library/react-native';

// Mock analytics service - needs to match path alias
jest.mock('@/services/analytics', () => ({
  analytics: {
    screen: jest.fn(),
    trackEvent: jest.fn(),
    trackError: jest.fn(),
    identify: jest.fn(),
    setUserProperties: jest.fn(),
  },
}));

// Mock navigation hooks
const mockRoute = {
  name: 'TestScreen',
  params: { id: '123' },
  key: 'test-key',
};

const mockNavigationState = {
  routes: [{ name: 'Home' }, { name: 'TestScreen' }],
  index: 1,
};

jest.mock('@react-navigation/native', () => ({
  useRoute: () => mockRoute,
  useNavigationState: (
    selector: (state: typeof mockNavigationState) => number,
  ) => selector(mockNavigationState),
}));

// Import after mocks
import { analytics } from '@/services/analytics';

import {
  useScreenTracking,
  useActionTracking,
  useFunnelTracking,
} from '../useAnalytics';

// Cast analytics to mocked type
const mockAnalytics = analytics as jest.Mocked<typeof analytics>;

describe('useScreenTracking', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should track screen view on mount', () => {
    renderHook(() => useScreenTracking());

    expect(mockAnalytics.screen).toHaveBeenCalledWith(
      'TestScreen',
      expect.objectContaining({
        screen: 'TestScreen',
        route: 'TestScreen',
        stackDepth: 2,
      }),
    );
  });

  it('should use custom screen name when provided', () => {
    renderHook(() => useScreenTracking({ screenName: 'CustomScreen' }));

    expect(mockAnalytics.screen).toHaveBeenCalledWith(
      'CustomScreen',
      expect.objectContaining({
        screen: 'CustomScreen',
        route: 'TestScreen',
      }),
    );
  });

  it('should include custom properties', () => {
    renderHook(() =>
      useScreenTracking({
        properties: { customProp: 'value' },
      }),
    );

    expect(mockAnalytics.screen).toHaveBeenCalledWith(
      'TestScreen',
      expect.objectContaining({
        customProp: 'value',
      }),
    );
  });

  it('should not track when disabled', () => {
    renderHook(() => useScreenTracking({ disabled: true }));

    expect(mockAnalytics.screen).not.toHaveBeenCalled();
  });

  it('should include route params in tracking', () => {
    renderHook(() => useScreenTracking());

    expect(mockAnalytics.screen).toHaveBeenCalledWith(
      'TestScreen',
      expect.objectContaining({
        params: JSON.stringify({ id: '123' }),
      }),
    );
  });
});

describe('useActionTracking', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return a tracking function', () => {
    const { result } = renderHook(() => useActionTracking());

    expect(typeof result.current).toBe('function');
  });

  it('should track action with screen context', () => {
    const { result } = renderHook(() => useActionTracking());

    act(() => {
      result.current('button_clicked');
    });

    expect(mockAnalytics.trackEvent).toHaveBeenCalledWith(
      'button_clicked',
      expect.objectContaining({
        screen: 'TestScreen',
        timestamp: expect.any(Number),
      }),
    );
  });

  it('should include custom properties', () => {
    const { result } = renderHook(() => useActionTracking());

    act(() => {
      result.current('button_clicked', { buttonName: 'Submit' });
    });

    expect(mockAnalytics.trackEvent).toHaveBeenCalledWith(
      'button_clicked',
      expect.objectContaining({
        buttonName: 'Submit',
      }),
    );
  });
});

describe('useFunnelTracking', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return funnel tracking methods', () => {
    const { result } = renderHook(() => useFunnelTracking('checkout'));

    expect(result.current).toHaveProperty('start');
    expect(result.current).toHaveProperty('step');
    expect(result.current).toHaveProperty('complete');
    expect(result.current).toHaveProperty('abandon');
  });

  it('should track funnel start', () => {
    const { result } = renderHook(() => useFunnelTracking('checkout'));

    act(() => {
      result.current.start({ productId: '123' });
    });

    expect(mockAnalytics.trackEvent).toHaveBeenCalledWith(
      'checkout_started',
      expect.objectContaining({
        funnel: 'checkout',
        productId: '123',
        screen: 'TestScreen',
      }),
    );
  });

  it('should track funnel steps', () => {
    const { result } = renderHook(() => useFunnelTracking('checkout'));

    act(() => {
      result.current.start();
      result.current.step('payment_info');
    });

    expect(mockAnalytics.trackEvent).toHaveBeenCalledWith(
      'checkout_step',
      expect.objectContaining({
        funnel: 'checkout',
        step: 'payment_info',
        stepNumber: 1,
      }),
    );
  });

  it('should increment step number', () => {
    const { result } = renderHook(() => useFunnelTracking('checkout'));

    act(() => {
      result.current.start();
      result.current.step('cart_review');
      result.current.step('payment_info');
      result.current.step('confirmation');
    });

    expect(mockAnalytics.trackEvent).toHaveBeenLastCalledWith(
      'checkout_step',
      expect.objectContaining({
        stepNumber: 3,
      }),
    );
  });

  it('should track funnel completion', () => {
    const { result } = renderHook(() => useFunnelTracking('checkout'));

    act(() => {
      result.current.start();
      result.current.step('payment');
      result.current.complete({ revenue: 99.99 });
    });

    expect(mockAnalytics.trackEvent).toHaveBeenCalledWith(
      'checkout_completed',
      expect.objectContaining({
        funnel: 'checkout',
        steps: 1,
        revenue: 99.99,
      }),
    );
  });

  it('should track funnel abandonment', () => {
    const { result } = renderHook(() => useFunnelTracking('checkout'));

    act(() => {
      result.current.start();
      result.current.step('cart_review');
      result.current.abandon({ reason: 'payment_failed' });
    });

    expect(mockAnalytics.trackEvent).toHaveBeenCalledWith(
      'checkout_abandoned',
      expect.objectContaining({
        funnel: 'checkout',
        lastStep: 1,
        reason: 'payment_failed',
      }),
    );
  });

  it('should reset state after completion', () => {
    const { result } = renderHook(() => useFunnelTracking('checkout'));

    act(() => {
      result.current.start();
      result.current.step('step1');
      result.current.complete();
    });

    // Start new funnel
    act(() => {
      result.current.start();
      result.current.step('new_step');
    });

    expect(mockAnalytics.trackEvent).toHaveBeenLastCalledWith(
      'checkout_step',
      expect.objectContaining({
        stepNumber: 1, // Should be reset to 1
      }),
    );
  });

  it('should track time elapsed in steps', () => {
    jest.useFakeTimers();

    const { result } = renderHook(() => useFunnelTracking('checkout'));

    act(() => {
      result.current.start();
    });

    jest.advanceTimersByTime(5000);

    act(() => {
      result.current.step('delayed_step');
    });

    expect(mockAnalytics.trackEvent).toHaveBeenCalledWith(
      'checkout_step',
      expect.objectContaining({
        timeElapsed: expect.any(Number),
      }),
    );

    jest.useRealTimers();
  });
});

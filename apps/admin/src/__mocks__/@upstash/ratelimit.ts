/**
 * Mock for @upstash/ratelimit
 * Used in Jest tests to avoid ESM compatibility issues
 */

export class Ratelimit {
  static slidingWindow(_limit: number, _window: string) {
    return {};
  }

  constructor(_config: Record<string, unknown>) {
    // Mock constructor
  }

  async limit(_identifier: string) {
    return {
      success: true,
      limit: 100,
      remaining: 99,
      reset: Date.now() + 60000,
    };
  }
}

export default { Ratelimit };

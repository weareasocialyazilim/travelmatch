/**
 * Mock for @upstash/redis
 * Used in Jest tests to avoid ESM compatibility issues
 */

export class Redis {
  constructor(_config: { url: string; token: string }) {
    // Mock constructor
  }

  async get(_key: string) {
    return null;
  }

  async set(_key: string, _value: unknown) {
    return 'OK';
  }

  async del(_key: string) {
    return 1;
  }

  async incr(_key: string) {
    return 1;
  }

  async expire(_key: string, _seconds: number) {
    return 1;
  }
}

export default { Redis };

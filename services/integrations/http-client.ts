export type HttpOptions = {
  timeoutMs: number;
  retries: number;
  retryDelayMs: number;
};

export const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export async function withRetry<T>(
  fn: () => Promise<T>,
  opt: HttpOptions,
): Promise<T> {
  let lastErr: unknown = null;
  for (let i = 0; i <= opt.retries; i++) {
    try {
      return await Promise.race([
        fn(),
        new Promise<T>((_, rej) =>
          setTimeout(() => rej(new Error('PROVIDER_TIMEOUT')), opt.timeoutMs),
        ),
      ]);
    } catch (e) {
      lastErr = e;
      if (i < opt.retries) await sleep(opt.retryDelayMs * Math.pow(2, i));
    }
  }
  throw lastErr;
}

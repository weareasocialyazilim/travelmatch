import type { ErrorCode } from './error-codes';

export type ApiResponse<T> =
  | {
      success: true;
      code: 'OK';
      message: string;
      data: T;
      meta?: Record<string, unknown>;
    }
  | {
      success: false;
      code: ErrorCode;
      message: string;
      meta?: Record<string, unknown>;
    };

export const ok = <T>(
  data: T,
  message = 'OK',
  meta?: Record<string, unknown>,
): ApiResponse<T> => ({
  success: true,
  code: 'OK',
  message,
  data,
  meta,
});

export const fail = (
  code: ErrorCode,
  message: string,
  meta?: Record<string, unknown>,
): ApiResponse<never> => ({
  success: false,
  code,
  message,
  meta,
});

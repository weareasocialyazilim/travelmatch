import { supabase } from '../config/supabase';

/**
 * Typed RPC helper. Keep a single localized cast but avoid `any`.
 */
export async function callRpc<T = unknown>(
  fn: string,
  params?: unknown,
): Promise<{ data: T | null; error: unknown }> {
  const client = supabase as unknown as {
    rpc: (
      fn: string,
      params?: unknown,
    ) => Promise<{ data: unknown; error: unknown }>;
  };

  const { data, error } = await client.rpc(fn, params);
  return { data: data as T | null, error };
}

export default callRpc;

/**
 * Mock Supabase client for testing
 */

type QueryBuilder = {
  select: jest.Mock;
  insert: jest.Mock;
  update: jest.Mock;
  delete: jest.Mock;
  eq: jest.Mock;
  neq: jest.Mock;
  gt: jest.Mock;
  gte: jest.Mock;
  lt: jest.Mock;
  lte: jest.Mock;
  like: jest.Mock;
  ilike: jest.Mock;
  is: jest.Mock;
  in: jest.Mock;
  contains: jest.Mock;
  containedBy: jest.Mock;
  range: jest.Mock;
  order: jest.Mock;
  limit: jest.Mock;
  single: jest.Mock;
  maybeSingle: jest.Mock;
};

export function createMockQueryBuilder(
  defaultData: unknown = null,
  defaultError: unknown = null,
): QueryBuilder {
  const resolvedValue = { data: defaultData, error: defaultError };

  const builder: QueryBuilder = {
    select: jest.fn().mockReturnThis(),
    insert: jest.fn().mockReturnThis(),
    update: jest.fn().mockReturnThis(),
    delete: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    neq: jest.fn().mockReturnThis(),
    gt: jest.fn().mockReturnThis(),
    gte: jest.fn().mockReturnThis(),
    lt: jest.fn().mockReturnThis(),
    lte: jest.fn().mockReturnThis(),
    like: jest.fn().mockReturnThis(),
    ilike: jest.fn().mockReturnThis(),
    is: jest.fn().mockReturnThis(),
    in: jest.fn().mockReturnThis(),
    contains: jest.fn().mockReturnThis(),
    containedBy: jest.fn().mockReturnThis(),
    range: jest.fn().mockReturnThis(),
    order: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
    single: jest.fn().mockResolvedValue(resolvedValue),
    maybeSingle: jest.fn().mockResolvedValue(resolvedValue),
  };

  return builder;
}

export interface MockSupabaseAuth {
  getSession: jest.Mock;
  getUser: jest.Mock;
  signInWithPassword: jest.Mock;
  signUp: jest.Mock;
  signOut: jest.Mock;
  resetPasswordForEmail: jest.Mock;
  updateUser: jest.Mock;
  onAuthStateChange: jest.Mock;
}

export function createMockSupabaseAuth(
  options: {
    session?: unknown;
    user?: unknown;
  } = {},
): MockSupabaseAuth {
  const { session = null, user = null } = options;

  return {
    getSession: jest.fn().mockResolvedValue({ data: { session }, error: null }),
    getUser: jest.fn().mockResolvedValue({ data: { user }, error: null }),
    signInWithPassword: jest
      .fn()
      .mockResolvedValue({ data: { session, user }, error: null }),
    signUp: jest
      .fn()
      .mockResolvedValue({ data: { session, user }, error: null }),
    signOut: jest.fn().mockResolvedValue({ error: null }),
    resetPasswordForEmail: jest
      .fn()
      .mockResolvedValue({ data: {}, error: null }),
    updateUser: jest.fn().mockResolvedValue({ data: { user }, error: null }),
    onAuthStateChange: jest.fn().mockReturnValue({
      data: { subscription: { unsubscribe: jest.fn() } },
    }),
  };
}

export interface MockSupabaseClient {
  auth: MockSupabaseAuth;
  from: jest.Mock;
  storage: {
    from: jest.Mock;
  };
  channel: jest.Mock;
  removeChannel: jest.Mock;
}

export function createMockSupabaseClient(
  options: {
    auth?: Partial<MockSupabaseAuth>;
    defaultQueryData?: unknown;
  } = {},
): MockSupabaseClient {
  const auth = {
    ...createMockSupabaseAuth(),
    ...options.auth,
  };

  const queryBuilder = createMockQueryBuilder(options.defaultQueryData);

  return {
    auth,
    from: jest.fn().mockReturnValue(queryBuilder),
    storage: {
      from: jest.fn().mockReturnValue({
        upload: jest
          .fn()
          .mockResolvedValue({ data: { path: 'test-path' }, error: null }),
        download: jest
          .fn()
          .mockResolvedValue({ data: new Blob(), error: null }),
        remove: jest.fn().mockResolvedValue({ data: [], error: null }),
        getPublicUrl: jest.fn().mockReturnValue({
          data: { publicUrl: 'https://example.com/image.jpg' },
        }),
        list: jest.fn().mockResolvedValue({ data: [], error: null }),
      }),
    },
    channel: jest.fn().mockReturnValue({
      on: jest.fn().mockReturnThis(),
      subscribe: jest.fn().mockReturnThis(),
      unsubscribe: jest.fn(),
    }),
    removeChannel: jest.fn(),
  };
}

/**
 * Helper to mock Supabase responses
 */
export function mockSupabaseResponse<T>(data: T, error: Error | null = null) {
  return { data, error };
}

/**
 * Helper to mock Supabase error
 */
export function mockSupabaseError(message: string, code?: string) {
  return {
    data: null,
    error: {
      message,
      code: code ?? 'UNKNOWN_ERROR',
    },
  };
}

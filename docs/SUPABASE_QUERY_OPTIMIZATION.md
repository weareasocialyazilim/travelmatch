/**
 * Supabase Query Optimization Guide
 * 
 * N+1 Query Prevention & Best Practices
 */

// ============================================
// COMMON N+1 PROBLEMS & SOLUTIONS
// ============================================

/**
 * ❌ BAD: N+1 Query - Fetching related data in a loop
 * 
 * const moments = await supabase.from('moments').select('*');
 * for (const moment of moments) {
 *   const user = await supabase.from('users').select('*').eq('id', moment.user_id).single();
 *   // N+1: 1 query for moments + N queries for users
 * }
 */

/**
 * ✅ GOOD: Use JOIN to fetch related data in one query
 * 
 * const { data } = await supabase
 *   .from('moments')
 *   .select(`
 *     *,
 *     user:users(*)
 *   `);
 * // Result: moments with nested user data
 */

// ============================================
// OPTIMIZATION PATTERNS
// ============================================

/**
 * Pattern 1: Simple One-to-One Join
 */
export const getOptimizedMoments = async (supabase: any) => {
  const { data, error } = await supabase
    .from('moments')
    .select(`
      id,
      title,
      description,
      price,
      user:users(
        id,
        full_name,
        avatar_url,
        verified
      )
    `);
  
  return { data, error };
};

/**
 * Pattern 2: One-to-Many Join (with count)
 */
export const getMomentsWithRequests = async (supabase: any) => {
  const { data, error } = await supabase
    .from('moments')
    .select(`
      *,
      user:users(*),
      requests(count)
    `);
  
  return { data, error };
};

/**
 * Pattern 3: Multiple Joins
 */
export const getRequestsWithDetails = async (supabase: any, userId: string) => {
  const { data, error } = await supabase
    .from('requests')
    .select(`
      id,
      status,
      message,
      created_at,
      moment:moments(
        id,
        title,
        price,
        user:users(
          id,
          full_name,
          avatar_url
        )
      ),
      requester:users!requests_user_id_fkey(
        id,
        full_name,
        avatar_url,
        rating,
        verified
      )
    `)
    .eq('moment.user_id', userId);
  
  return { data, error };
};

/**
 * Pattern 4: Nested Joins with Filtering
 */
export const getConversationsWithLastMessage = async (
  supabase: any,
  userId: string,
) => {
  const { data, error } = await supabase
    .from('conversations')
    .select(`
      id,
      participant_ids,
      created_at,
      updated_at,
      messages!inner(
        id,
        content,
        sender_id,
        created_at
      )
    `)
    .contains('participant_ids', [userId])
    .order('created_at', { foreignTable: 'messages', ascending: false })
    .limit(1, { foreignTable: 'messages' });
  
  return { data, error };
};

/**
 * Pattern 5: Aggregate Functions (count, sum, avg)
 */
export const getUserStats = async (supabase: any, userId: string) => {
  // Instead of multiple queries, use one query with aggregates
  const { data, error } = await supabase
    .from('users')
    .select(`
      id,
      full_name,
      avatar_url,
      moments(count),
      reviews_received:reviews!reviews_reviewed_id_fkey(
        rating
      ),
      transactions:transactions!transactions_receiver_id_fkey(
        amount
      )
    `)
    .eq('id', userId)
    .single();
  
  // Calculate stats on client
  if (data) {
    const avgRating = data.reviews_received?.length
      ? data.reviews_received.reduce((sum: number, r: any) => sum + r.rating, 0) / data.reviews_received.length
      : 0;
    
    const totalEarnings = data.transactions?.reduce(
      (sum: number, t: any) => sum + Number(t.amount),
      0,
    ) || 0;
    
    return {
      ...data,
      stats: {
        momentCount: data.moments?.[0]?.count || 0,
        avgRating,
        totalEarnings,
      },
    };
  }
  
  return { data, error };
};

/**
 * Pattern 6: Paginated Joins
 */
export const getPaginatedMoments = async (
  supabase: any,
  page: number = 0,
  pageSize: number = 20,
) => {
  const from = page * pageSize;
  const to = from + pageSize - 1;
  
  const { data, error, count } = await supabase
    .from('moments')
    .select(`
      *,
      user:users(*),
      requests(count),
      favorites(count)
    `, { count: 'exact' })
    .range(from, to)
    .order('created_at', { ascending: false });
  
  return {
    data,
    error,
    pagination: {
      total: count || 0,
      page,
      pageSize,
      totalPages: Math.ceil((count || 0) / pageSize),
    },
  };
};

// ============================================
// ANTI-PATTERNS TO AVOID
// ============================================

/**
 * ❌ ANTI-PATTERN 1: Fetching all data then filtering client-side
 * 
 * const { data } = await supabase.from('moments').select('*');
 * const filtered = data.filter(m => m.status === 'active');
 * 
 * ✅ SOLUTION: Filter on server
 * const { data } = await supabase
 *   .from('moments')
 *   .select('*')
 *   .eq('status', 'active');
 */

/**
 * ❌ ANTI-PATTERN 2: Multiple separate queries
 * 
 * const moments = await supabase.from('moments').select('*');
 * const users = await supabase.from('users').select('*');
 * const reviews = await supabase.from('reviews').select('*');
 * 
 * ✅ SOLUTION: Use joins
 * const { data } = await supabase
 *   .from('moments')
 *   .select('*, user:users(*), reviews(*)');
 */

/**
 * ❌ ANTI-PATTERN 3: Not using indexes
 * Make sure foreign keys and commonly queried fields have indexes
 * 
 * CREATE INDEX idx_moments_user_id ON moments(user_id);
 * CREATE INDEX idx_requests_moment_id ON requests(moment_id);
 * CREATE INDEX idx_messages_conversation_id ON messages(conversation_id);
 */

// ============================================
// PERFORMANCE TIPS
// ============================================

/**
 * 1. Select only needed fields
 * ❌ .select('*')
 * ✅ .select('id, title, price')
 */

/**
 * 2. Use count wisely
 * If you don't need the count, don't request it
 * ❌ .select('*', { count: 'exact' })
 * ✅ .select('*') // when count not needed
 */

/**
 * 3. Limit results
 * ✅ .limit(20)
 */

/**
 * 4. Use proper ordering
 * Order by indexed columns when possible
 * ✅ .order('created_at', { ascending: false })
 */

/**
 * 5. Batch operations
 * Use .in() for multiple IDs instead of multiple queries
 * ❌ Multiple .eq('id', id) queries
 * ✅ .in('id', [id1, id2, id3])
 */

// ============================================
// SPECIFIC OPTIMIZATIONS FOR CURRENT CODEBASE
// ============================================

/**
 * requests.list() - OPTIMIZED
 * Was: Separate queries for user and moment data
 * Now: Single query with joins
 */
export const getOptimizedRequests = async (
  supabase: any,
  filters: {
    momentId?: string;
    userId?: string;
    status?: string;
  },
) => {
  let query = supabase
    .from('requests')
    .select(`
      id,
      message,
      status,
      created_at,
      requester:users!requests_user_id_fkey(
        id,
        full_name,
        avatar_url,
        rating,
        verified,
        location
      ),
      moment:moments(
        id,
        title,
        price,
        category,
        user:users(
          id,
          full_name,
          avatar_url
        )
      )
    `, { count: 'exact' });

  if (filters.momentId) query = query.eq('moment_id', filters.momentId);
  if (filters.userId) query = query.eq('user_id', filters.userId);
  if (filters.status) query = query.eq('status', filters.status);

  return await query.order('created_at', { ascending: false });
};

/**
 * conversations.list() - OPTIMIZED
 * Was: Basic join, could be improved
 * Now: Better structured with last message
 */
export const getOptimizedConversations = async (
  supabase: any,
  userId: string,
) => {
  const { data, error } = await supabase
    .from('conversations')
    .select(`
      id,
      participant_ids,
      created_at,
      updated_at,
      last_message:messages(
        id,
        content,
        sender_id,
        created_at,
        read_at
      )
    `)
    .contains('participant_ids', [userId])
    .order('updated_at', { ascending: false });
  
  return { data, error };
};

/**
 * reviews.listByUser() - ALREADY OPTIMIZED ✅
 * Current implementation uses proper joins
 */

/**
 * moments.getSaved() - OPTIMIZED
 * Was: Extracting moments from join
 * Now: Direct join structure
 */
export const getOptimizedSavedMoments = async (
  supabase: any,
  userId: string,
) => {
  const { data, error, count } = await supabase
    .from('favorites')
    .select(`
      created_at,
      moment:moments(
        *,
        user:users(
          id,
          full_name,
          avatar_url,
          verified
        ),
        requests(count),
        favorites(count)
      )
    `, { count: 'exact' })
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  return { data, error, count };
};

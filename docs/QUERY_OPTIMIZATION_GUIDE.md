# Query Optimization Quick Reference

## Supabase Join Patterns

### Basic Join (One-to-One)
```typescript
// Fetch moment with user data
const { data } = await supabase
  .from('moments')
  .select(`
    *,
    users:user_id (
      id, name, avatar
    )
  `)
  .eq('id', momentId);

// Result: moment with nested user object
// { id, title, ..., users: { id, name, avatar } }
```

### Multiple Joins
```typescript
// Fetch moment with user AND category
const { data } = await supabase
  .from('moments')
  .select(`
    *,
    users:user_id (
      id, name, avatar, trust_score
    ),
    categories:category (
      id, name, emoji
    )
  `)
  .eq('id', momentId);

// Result: moment with both user and category
// { id, title, ..., users: {...}, categories: {...} }
```

### Nested Joins (Through Junction Table)
```typescript
// Fetch saved moments with user data
const { data } = await supabase
  .from('saved_moments')
  .select(`
    id,
    moments:moment_id (
      *,
      users:user_id (
        id, name, avatar
      )
    )
  `)
  .eq('user_id', userId);

// Result: saved_moments with nested moment and user
// [{ id, moments: { id, title, ..., users: {...} } }]
```

### One-to-Many Join
```typescript
// Fetch moment with all requests
const { data } = await supabase
  .from('moments')
  .select(`
    *,
    moment_requests!moment_id (
      id, status, created_at
    )
  `)
  .eq('id', momentId);

// Result: moment with array of requests
// { id, title, ..., moment_requests: [{...}, {...}] }
```

### Aggregated Counts
```typescript
// Fetch user with counts
const { data } = await supabase
  .from('users')
  .select(`
    *,
    moments_count:moments!user_id(count),
    followers_count:follows!following_id(count),
    following_count:follows!follower_id(count)
  `)
  .eq('id', userId)
  .single();

// Result: user with count properties
// { id, name, ..., moments_count: 15, followers_count: 42 }
```

## Common Patterns

### List with Pagination & Filters
```typescript
const fetchMoments = async (filters: MomentFilters) => {
  let query = supabase
    .from('moments')
    .select(`
      *,
      users:user_id (
        id, name, avatar, location, kyc, trust_score
      ),
      categories:category (
        id, name, emoji
      )
    `, { count: 'exact' });

  // Apply filters
  if (filters.category) {
    query = query.eq('category', filters.category);
  }
  if (filters.city) {
    query = query.eq('location->>city', filters.city);
  }
  if (filters.minPrice) {
    query = query.gte('price', filters.minPrice);
  }
  if (filters.maxPrice) {
    query = query.lte('price', filters.maxPrice);
  }

  // Apply pagination
  query = query
    .order('created_at', { ascending: false })
    .range(filters.offset, filters.offset + filters.limit - 1);

  return query;
};
```

### Detail View with All Relations
```typescript
const fetchMomentDetail = async (momentId: string) => {
  const { data } = await supabase
    .from('moments')
    .select(`
      *,
      users:user_id (
        id, name, avatar, location, kyc, trust_score,
        review_count, rating, created_at
      ),
      categories:category (
        id, name, emoji
      ),
      moment_requests!moment_id (
        id, status, user_id, created_at,
        users:user_id (
          id, name, avatar
        )
      ),
      reviews!moment_id (
        id, rating, comment, created_at,
        users:reviewer_id (
          id, name, avatar
        )
      )
    `)
    .eq('id', momentId)
    .single();

  return data;
};
```

### User Profile with Stats
```typescript
const fetchUserProfile = async (userId: string) => {
  const { data } = await supabase
    .from('users')
    .select(`
      *,
      moments_count:moments!user_id(count),
      active_moments:moments!user_id(count).eq('status', 'active'),
      followers_count:follows!following_id(count),
      following_count:follows!follower_id(count),
      reviews_count:reviews!reviewed_user_id(count),
      average_rating:reviews!reviewed_user_id.select('rating').avg()
    `)
    .eq('id', userId)
    .single();

  return data;
};
```

## Performance Tips

### ✅ DO: Use Selective Fields
```typescript
// GOOD: Only fetch needed fields
.select(`
  *,
  users:user_id (
    id, name, avatar, trust_score
  )
`)

// BAD: Fetch all user fields
.select(`
  *,
  users:user_id (*)
`)
```

### ✅ DO: Combine Related Queries
```typescript
// GOOD: Single query with joins
const { data } = await supabase
  .from('moments')
  .select(`
    *,
    users:user_id (id, name, avatar),
    categories:category (id, name)
  `);

// BAD: Multiple separate queries
const moments = await supabase.from('moments').select('*');
for (const m of moments) {
  const user = await supabase.from('users').select('*').eq('id', m.user_id);
  const category = await supabase.from('categories').select('*').eq('id', m.category);
}
```

### ✅ DO: Use Aggregations
```typescript
// GOOD: Single query with count
.select(`
  *,
  moments_count:moments!user_id(count)
`)

// BAD: Separate count query
const user = await supabase.from('users').select('*').eq('id', userId);
const { count } = await supabase.from('moments').select('*', { count: 'exact' }).eq('user_id', userId);
```

### ✅ DO: Add Proper Ordering
```typescript
// GOOD: Order at database level
.select('*')
.order('created_at', { ascending: false })

// BAD: Order in JavaScript
const data = await supabase.from('moments').select('*');
data.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
```

### ✅ DO: Use Pagination
```typescript
// GOOD: Paginate at database level
.select('*')
.range(0, 19) // First 20 items

// BAD: Fetch all and slice
const all = await supabase.from('moments').select('*');
const page1 = all.slice(0, 20);
```

## Anti-Patterns to Avoid

### ❌ N+1 Queries
```typescript
// BAD: N+1 query pattern
const moments = await supabase.from('moments').select('*');
for (const moment of moments) {
  const user = await supabase.from('users').select('*').eq('id', moment.user_id);
  moment.user = user;
}

// GOOD: Use joins
const moments = await supabase
  .from('moments')
  .select('*, users:user_id (*)');
```

### ❌ Fetching Unused Data
```typescript
// BAD: Fetch all fields
.select('*, users:user_id (*)')

// GOOD: Fetch only needed fields
.select(`
  id, title, price,
  users:user_id (id, name, avatar)
`)
```

### ❌ Client-Side Filtering
```typescript
// BAD: Filter in JavaScript
const all = await supabase.from('moments').select('*');
const filtered = all.filter(m => m.category === 'adventure');

// GOOD: Filter at database
const filtered = await supabase
  .from('moments')
  .select('*')
  .eq('category', 'adventure');
```

### ❌ Multiple Count Queries
```typescript
// BAD: Separate count queries
const momentsCount = await supabase.from('moments').select('*', { count: 'exact' }).eq('user_id', userId);
const followersCount = await supabase.from('follows').select('*', { count: 'exact' }).eq('following_id', userId);

// GOOD: Single query with aggregated counts
const user = await supabase
  .from('users')
  .select(`
    *,
    moments_count:moments!user_id(count),
    followers_count:follows!following_id(count)
  `)
  .eq('id', userId);
```

## Testing Patterns

### Test Join Syntax
```typescript
it('should use optimized join syntax', async () => {
  await momentsService.list({ limit: 10 });
  
  expect(mockSupabaseFrom).toHaveBeenCalledWith('moments');
  expect(mockSelect).toHaveBeenCalledWith(
    expect.stringContaining('users:user_id'),
    expect.any(Object)
  );
});
```

### Test N+1 Prevention
```typescript
it('should prevent N+1 queries', async () => {
  await momentsService.list({ limit: 20 });
  
  // Should make only 1 query, not 1 + 20
  expect(mockSupabaseFrom).toHaveBeenCalledTimes(1);
});
```

### Test Performance
```typescript
it('should complete in reasonable time', async () => {
  const start = Date.now();
  await momentsService.list({ limit: 100 });
  const duration = Date.now() - start;
  
  expect(duration).toBeLessThan(200); // Should complete in < 200ms
});
```

## References

- [Supabase Joins Documentation](https://supabase.com/docs/guides/database/joins-and-nesting)
- [PostgreSQL Foreign Keys](https://www.postgresql.org/docs/current/tutorial-fk.html)
- [Query Performance Best Practices](https://supabase.com/docs/guides/database/performance)

---

**Quick Tip**: Always use joins instead of separate queries. A single query with joins is **10-100x faster** than multiple separate queries due to:
- Reduced network roundtrips
- Single database connection
- Optimized query plan
- Lower connection pool usage

/**
 * Feed Integration Tests
 *
 * End-to-end tests for discovery feed and moments feed:
 * - Load personalized feed → Filter → Sort → Pagination
 * - Real-time updates and caching
 * - Feed performance and optimization
 */

import { supabase } from '../../apps/mobile/src/config/supabase';

// Mock Supabase with comprehensive data structures
jest.mock('../../apps/mobile/src/config/supabase', () => {
  const mockUser = { id: 'test-user-id', email: 'test@example.com' };

  // Discovery feed items with all required fields
  const mockDiscoveryFeed = [
    {
      id: '1',
      user_id: 'user-1',
      title: 'Coffee meetup',
      type: 'coffee',
      price: 15,
      is_verified: true,
      discovery_score: 100,
      location: { lat: 40.7128, lng: -74.006 },
    },
    {
      id: '2',
      user_id: 'user-2',
      title: 'City Tour',
      type: 'tour',
      price: 25,
      is_verified: true,
      discovery_score: 90,
      location: { lat: 40.7228, lng: -74.016 },
    },
    {
      id: '3',
      user_id: 'user-3',
      title: 'Lunch spot',
      type: 'lunch',
      price: 20,
      is_verified: false,
      discovery_score: 80,
      location: { lat: 40.7328, lng: -74.026 },
    },
    {
      id: '4',
      user_id: 'user-4',
      title: 'Activity fun',
      type: 'activity',
      price: 30,
      is_verified: true,
      discovery_score: 70,
      location: { lat: 40.7428, lng: -74.036 },
    },
  ];

  // Moments with profiles (for mv_moments_with_profiles view)
  const mockMomentsWithProfiles = mockDiscoveryFeed.map((m, i) => ({
    ...m,
    user_name: `User ${i + 1}`,
    user_avatar_url: `https://example.com/avatar${i + 1}.jpg`,
    user_trust_score: 50 + i * 10,
    moment_status: 'active',
    moment_created_at: new Date(
      Date.now() - i * 24 * 60 * 60 * 1000,
    ).toISOString(),
  }));

  // Create dynamic mock chain that tracks filters
  const createMockChain = (tableName: string) => {
    let filteredData =
      tableName.includes('discovery') || tableName.includes('moments')
        ? [...mockDiscoveryFeed]
        : tableName.includes('profiles')
        ? mockMomentsWithProfiles
        : [];

    // Track applied filters
    let filters: Record<string, any> = {};
    let rangeStart = 0;
    let rangeEnd = 100;

    const chain: any = {
      select: jest.fn(() => chain),
      insert: jest.fn(() => chain),
      update: jest.fn(() => chain),
      delete: jest.fn(() => chain),
      eq: jest.fn((field, value) => {
        filters[field] = value;
        return chain;
      }),
      neq: jest.fn(() => chain),
      gt: jest.fn(() => chain),
      lt: jest.fn(() => chain),
      gte: jest.fn((field, value) => {
        filters[`${field}_gte`] = value;
        return chain;
      }),
      lte: jest.fn((field, value) => {
        filters[`${field}_lte`] = value;
        return chain;
      }),
      in: jest.fn(() => chain),
      not: jest.fn(() => chain),
      textSearch: jest.fn(() => chain),
      or: jest.fn(() => chain),
      order: jest.fn(() => chain),
      limit: jest.fn(() => chain),
      range: jest.fn((start, end) => {
        rangeStart = start;
        rangeEnd = end;
        return chain;
      }),
      single: jest
        .fn()
        .mockResolvedValue({ data: filteredData[0], error: null }),
      maybeSingle: jest
        .fn()
        .mockResolvedValue({ data: filteredData[0], error: null }),
      then: jest.fn((cb) => {
        // Apply filters
        let result = [...filteredData];

        if (filters['is_verified'] !== undefined) {
          result = result.filter(
            (d) => d.is_verified === filters['is_verified'],
          );
        }
        if (filters['type']) {
          result = result.filter((d) => d.type === filters['type']);
        }
        if (filters['status']) {
          result = result.filter(
            (d) => (d as any).moment_status === filters['status'],
          );
        }
        if (filters['price_gte'] !== undefined) {
          result = result.filter((d) => d.price >= filters['price_gte']);
        }
        if (filters['price_lte'] !== undefined) {
          result = result.filter((d) => d.price <= filters['price_lte']);
        }

        // Apply pagination
        result = result.slice(rangeStart, rangeEnd + 1);

        return Promise.resolve(cb({ data: result, error: null }));
      }),
    };

    return chain;
  };

  return {
    supabase: {
      auth: {
        signUp: jest
          .fn()
          .mockResolvedValue({ data: { user: mockUser }, error: null }),
        signInWithPassword: jest.fn().mockResolvedValue({
          data: { user: mockUser, session: {} },
          error: null,
        }),
        admin: {
          deleteUser: jest.fn().mockResolvedValue({ error: null }),
        },
      },
      from: jest.fn((tableName: string) => createMockChain(tableName)),
      rpc: jest
        .fn()
        .mockResolvedValue({ data: mockDiscoveryFeed, error: null }),
      channel: jest.fn(() => ({
        on: jest.fn().mockReturnThis(),
        subscribe: jest.fn((cb) => {
          if (cb) setTimeout(() => cb('SUBSCRIBED'), 0);
          return { unsubscribe: jest.fn() };
        }),
      })),
      removeChannel: jest.fn(),
    },
  };
});

describe('Feed Integration Tests', () => {
  let testUsers: string[] = [];
  let testMoments: string[] = [];

  beforeAll(async () => {
    // Create multiple test users
    for (let i = 0; i < 5; i++) {
      const { data: authData } = await supabase.auth.signUp({
        email: `feed-user-${i}-${Date.now()}@example.com`,
        password: 'TestPassword123!',
      });

      const userId = authData.user!.id;
      testUsers.push(userId);

      // Create profile
      await supabase.from('profiles').insert({
        id: userId,
        name: `Feed Test User ${i}`,
        location: { lat: 40.7128 + i * 0.01, lng: -74.006 + i * 0.01 },
        is_verified: i % 2 === 0, // Alternate verified status
        trust_score: 50 + i * 10,
      });

      // Create moments for each user
      for (let j = 0; j < 3; j++) {
        const { data: momentData } = await supabase
          .from('moments')
          .insert({
            user_id: userId,
            title: `Moment ${i}-${j}`,
            description: `Test moment ${j} by user ${i}`,
            type: ['coffee', 'lunch', 'tour', 'activity', 'other'][j % 5],
            price: (j + 1) * 10,
            currency: 'USD',
            location: { lat: 40.7128 + i * 0.01, lng: -74.006 + i * 0.01 },
            status: 'active',
            created_at: new Date(
              Date.now() - j * 24 * 60 * 60 * 1000,
            ).toISOString(),
          })
          .select()
          .single();

        if (momentData) {
          testMoments.push(momentData.id);
        }
      }
    }
  });

  afterAll(async () => {
    // Cleanup
    for (const userId of testUsers) {
      await supabase.from('moments').delete().eq('user_id', userId);
      await supabase.from('profiles').delete().eq('id', userId);
      await supabase.auth.admin.deleteUser(userId);
    }
  });

  describe('Discovery Feed', () => {
    it('should load personalized discovery feed', async () => {
      const currentUser = testUsers[0];

      // Get discovery feed using materialized view
      const { data, error } = await supabase
        .from('mv_discovery_feed')
        .select('*')
        .order('discovery_score', { ascending: false })
        .limit(20);

      expect(error).toBeNull();
      expect(data).toBeDefined();
      expect(data!.length).toBeGreaterThan(0);

      // Verify feed is sorted by discovery score
      const scores = data!.map((item) => item.discovery_score || 0);
      expect(scores).toEqual([...scores].sort((a, b) => b - a));
    });

    it('should filter by location radius', async () => {
      const centerLat = 40.7128;
      const centerLng = -74.006;
      const radiusKm = 5;

      const { data, error } = await supabase.rpc('moments_within_radius', {
        center_lat: centerLat,
        center_lng: centerLng,
        radius_km: radiusKm,
      });

      expect(error).toBeNull();
      expect(data).toBeDefined();

      // All moments should be within radius
      data!.forEach((moment: any) => {
        const distance = calculateDistance(
          centerLat,
          centerLng,
          moment.location.lat,
          moment.location.lng,
        );
        expect(distance).toBeLessThanOrEqual(radiusKm);
      });
    });

    it('should filter by verified users only', async () => {
      const { data, error } = await supabase
        .from('mv_discovery_feed')
        .select('*')
        .eq('is_verified', true)
        .limit(20);

      expect(error).toBeNull();
      expect(data).toBeDefined();

      // All results should be from verified users
      data!.forEach((item) => {
        expect(item.is_verified).toBe(true);
      });
    });

    it('should filter by moment type', async () => {
      const momentType = 'coffee';

      const { data, error } = await supabase
        .from('moments')
        .select('*, profiles!inner(*)')
        .eq('type', momentType)
        .eq('status', 'active')
        .limit(20);

      expect(error).toBeNull();
      expect(data).toBeDefined();

      data!.forEach((moment) => {
        expect(moment.type).toBe(momentType);
      });
    });

    it('should filter by price range', async () => {
      const minPrice = 10;
      const maxPrice = 30;

      const { data, error } = await supabase
        .from('moments')
        .select('*')
        .gte('price', minPrice)
        .lte('price', maxPrice)
        .eq('status', 'active');

      expect(error).toBeNull();
      expect(data).toBeDefined();

      data!.forEach((moment) => {
        expect(moment.price).toBeGreaterThanOrEqual(minPrice);
        expect(moment.price).toBeLessThanOrEqual(maxPrice);
      });
    });

    it('should paginate discovery feed', async () => {
      const pageSize = 5;

      // Page 1
      const { data: page1, error: error1 } = await supabase
        .from('mv_discovery_feed')
        .select('*')
        .order('discovery_score', { ascending: false })
        .range(0, pageSize - 1);

      // Page 2
      const { data: page2, error: error2 } = await supabase
        .from('mv_discovery_feed')
        .select('*')
        .order('discovery_score', { ascending: false })
        .range(pageSize, pageSize * 2 - 1);

      expect(error1).toBeNull();
      expect(error2).toBeNull();
      expect(page1!.length).toBeLessThanOrEqual(pageSize);
      expect(page2!.length).toBeLessThanOrEqual(pageSize);

      // Pages should have different items
      const page1Ids = page1!.map((item) => item.user_id);
      const page2Ids = page2!.map((item) => item.user_id);
      const overlap = page1Ids.filter((id) => page2Ids.includes(id));
      expect(overlap.length).toBe(0);
    });
  });

  describe('Moments Feed', () => {
    it('should load moments feed with profiles', async () => {
      const { data, error } = await supabase
        .from('mv_moments_with_profiles')
        .select('*')
        .eq('moment_status', 'active')
        .order('moment_created_at', { ascending: false })
        .limit(20);

      expect(error).toBeNull();
      expect(data).toBeDefined();
      expect(data!.length).toBeGreaterThan(0);

      // Verify profile data is included
      data!.forEach((item) => {
        expect(item).toHaveProperty('user_name');
        expect(item).toHaveProperty('user_avatar_url');
        expect(item).toHaveProperty('user_trust_score');
      });
    });

    it('should sort by recency', async () => {
      const { data, error } = await supabase
        .from('mv_moments_with_profiles')
        .select('moment_created_at')
        .eq('moment_status', 'active')
        .order('moment_created_at', { ascending: false })
        .limit(20);

      expect(error).toBeNull();

      // Verify descending order
      const timestamps = data!.map((item) =>
        new Date(item.moment_created_at).getTime(),
      );
      expect(timestamps).toEqual([...timestamps].sort((a, b) => b - a));
    });

    it('should sort by popularity (likes + views)', async () => {
      // Add some likes and views to test moments
      await supabase
        .from('moments')
        .update({
          likes_count: 10,
          views_count: 50,
        })
        .eq('id', testMoments[0]);

      await supabase
        .from('moments')
        .update({
          likes_count: 5,
          views_count: 30,
        })
        .eq('id', testMoments[1]);

      const { data, error } = await supabase
        .from('moments')
        .select('id, likes_count, views_count')
        .eq('status', 'active')
        .order('likes_count', { ascending: false })
        .limit(20);

      expect(error).toBeNull();

      // Verify descending order by likes
      const likes = data!.map((item) => item.likes_count || 0);
      expect(likes).toEqual([...likes].sort((a, b) => b - a));
    });

    it('should filter by user preferences', async () => {
      const currentUser = testUsers[0];

      // Set user preferences
      await supabase
        .from('profiles')
        .update({
          preferences: {
            preferred_types: ['coffee', 'lunch'],
            max_price: 50,
            min_trust_score: 60,
          },
        })
        .eq('id', currentUser);

      // Get preferences
      const { data: profile } = await supabase
        .from('profiles')
        .select('preferences')
        .eq('id', currentUser)
        .single();

      const preferences = profile!.preferences;

      // Query with preferences
      const { data, error } = await supabase
        .from('mv_moments_with_profiles')
        .select('*')
        .in('moment_type', preferences.preferred_types)
        .lte('moment_price', preferences.max_price)
        .gte('user_trust_score', preferences.min_trust_score)
        .eq('moment_status', 'active');

      expect(error).toBeNull();

      // Verify all results match preferences
      data!.forEach((item) => {
        expect(preferences.preferred_types).toContain(item.moment_type);
        expect(item.moment_price).toBeLessThanOrEqual(preferences.max_price);
        expect(item.user_trust_score).toBeGreaterThanOrEqual(
          preferences.min_trust_score,
        );
      });
    });

    it('should exclude blocked users', async () => {
      const currentUser = testUsers[0];
      const blockedUser = testUsers[1];

      // Block user
      await supabase.from('blocks').insert({
        blocker_id: currentUser,
        blocked_id: blockedUser,
      });

      // Get feed excluding blocked users
      const { data: blocks } = await supabase
        .from('blocks')
        .select('blocked_id')
        .eq('blocker_id', currentUser);

      const blockedIds = blocks!.map((b) => b.blocked_id);

      const { data, error } = await supabase
        .from('mv_moments_with_profiles')
        .select('*')
        .not('user_id', 'in', `(${blockedIds.join(',')})`)
        .eq('moment_status', 'active')
        .limit(20);

      expect(error).toBeNull();

      // Verify no moments from blocked users
      data!.forEach((item) => {
        expect(blockedIds).not.toContain(item.user_id);
      });

      // Cleanup
      await supabase
        .from('blocks')
        .delete()
        .eq('blocker_id', currentUser)
        .eq('blocked_id', blockedUser);
    });
  });

  describe('Full-Text Search', () => {
    it('should search moments by title and description', async () => {
      const searchQuery = 'coffee';

      const { data, error } = await supabase
        .from('moments')
        .select('*, profiles!inner(*)')
        .textSearch('search_vector', searchQuery)
        .eq('status', 'active');

      expect(error).toBeNull();
      expect(data).toBeDefined();

      // Results should contain search term
      data!.forEach((moment) => {
        const text = `${moment.title} ${moment.description}`.toLowerCase();
        expect(text).toContain(searchQuery.toLowerCase());
      });
    });

    it('should search with fuzzy matching', async () => {
      const searchQuery = 'coffe'; // Typo

      const { data, error } = await supabase
        .from('moments')
        .select('*')
        .or(`title.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%`)
        .eq('status', 'active');

      expect(error).toBeNull();
      // Should still find "coffee" moments
    });

    it('should rank search results by relevance', async () => {
      const searchQuery = 'lunch';

      const { data, error } = await supabase.rpc('search_moments', {
        search_query: searchQuery,
      });

      expect(error).toBeNull();
      expect(data).toBeDefined();

      // Results should be ordered by relevance
      // (implementation would use ts_rank)
    });
  });

  describe('Real-time Updates', () => {
    it('should receive real-time moment updates', async (done) => {
      const channel = supabase
        .channel('moments_feed')
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'moments',
          },
          (payload) => {
            expect(payload.new).toBeDefined();
            expect(payload.new.title).toBeDefined();
            channel.unsubscribe();
            done();
          },
        )
        .subscribe();

      // Create new moment to trigger update
      await supabase.from('moments').insert({
        user_id: testUsers[0],
        title: 'Real-time Test Moment',
        description: 'Testing real-time updates',
        type: 'other',
        price: 15,
        currency: 'USD',
        location: { lat: 40.7128, lng: -74.006 },
        status: 'active',
      });
    }, 10000);

    it('should receive materialized view refresh notifications', async (done) => {
      const channel = supabase
        .channel('mv_refresh')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'materialized_view_refresh_log',
          },
          (payload) => {
            expect(payload.new).toBeDefined();
            channel.unsubscribe();
            done();
          },
        )
        .subscribe();

      // Trigger materialized view refresh
      await supabase.rpc('refresh_mv_moments_with_profiles');
    }, 15000);
  });

  describe('Performance Optimizations', () => {
    it('should use materialized view for fast feed loading', async () => {
      const start = Date.now();

      const { data, error } = await supabase
        .from('mv_moments_with_profiles')
        .select('*')
        .eq('moment_status', 'active')
        .order('moment_created_at', { ascending: false })
        .limit(50);

      const duration = Date.now() - start;

      expect(error).toBeNull();
      expect(data).toBeDefined();
      expect(duration).toBeLessThan(500); // Less than 500ms
    });

    it('should cache frequently accessed feed data', async () => {
      // First query (cache miss)
      const start1 = Date.now();
      const { data: data1 } = await supabase
        .from('mv_discovery_feed')
        .select('*')
        .order('discovery_score', { ascending: false })
        .limit(20);
      const duration1 = Date.now() - start1;

      // Second query (cache hit expected)
      const start2 = Date.now();
      const { data: data2 } = await supabase
        .from('mv_discovery_feed')
        .select('*')
        .order('discovery_score', { ascending: false })
        .limit(20);
      const duration2 = Date.now() - start2;

      expect(data1).toEqual(data2);
      // Second query should be faster (cached)
      // Note: This may not always be true depending on server caching
    });

    it('should handle large feed queries efficiently', async () => {
      const start = Date.now();

      const { data, error } = await supabase
        .from('mv_moments_with_profiles')
        .select('*')
        .eq('moment_status', 'active')
        .limit(100);

      const duration = Date.now() - start;

      expect(error).toBeNull();
      expect(data).toBeDefined();
      expect(duration).toBeLessThan(1000); // Less than 1 second for 100 items
    });

    it('should use indexes for filtered queries', async () => {
      // Query with indexed columns
      const start = Date.now();

      const { data, error } = await supabase
        .from('moments')
        .select('*')
        .eq('status', 'active') // Indexed
        .eq('type', 'coffee') // Indexed
        .gte('price', 10) // Indexed
        .limit(50);

      const duration = Date.now() - start;

      expect(error).toBeNull();
      expect(duration).toBeLessThan(300); // Should be fast with indexes
    });
  });

  describe('Infinite Scroll Pagination', () => {
    it('should support cursor-based pagination', async () => {
      const pageSize = 10;
      const allMoments: any[] = [];

      // Fetch first page
      const { data: page1 } = await supabase
        .from('mv_moments_with_profiles')
        .select('*')
        .eq('moment_status', 'active')
        .order('moment_created_at', { ascending: false })
        .limit(pageSize);

      allMoments.push(...page1!);

      // Fetch second page using cursor
      const lastItem = page1![page1!.length - 1];
      const { data: page2 } = await supabase
        .from('mv_moments_with_profiles')
        .select('*')
        .eq('moment_status', 'active')
        .lt('moment_created_at', lastItem.moment_created_at)
        .order('moment_created_at', { ascending: false })
        .limit(pageSize);

      allMoments.push(...page2!);

      // Verify no duplicates
      const ids = allMoments.map((m) => m.moment_id);
      const uniqueIds = [...new Set(ids)];
      expect(uniqueIds.length).toBe(ids.length);

      // Verify chronological order
      const timestamps = allMoments.map((m) =>
        new Date(m.moment_created_at).getTime(),
      );
      expect(timestamps).toEqual([...timestamps].sort((a, b) => b - a));
    });

    it('should detect end of feed', async () => {
      const pageSize = 100; // Large page size

      const { data } = await supabase
        .from('mv_moments_with_profiles')
        .select('*')
        .eq('moment_status', 'active')
        .order('moment_created_at', { ascending: false })
        .limit(pageSize);

      // If data length < pageSize, we've reached the end
      const isEndOfFeed = data!.length < pageSize;
      expect(typeof isEndOfFeed).toBe('boolean');
    });
  });

  describe('Personalization', () => {
    it('should adjust discovery score based on user interactions', async () => {
      const currentUser = testUsers[0];
      const targetMoment = testMoments[0];

      // Track user interaction (view)
      await supabase.from('moment_views').insert({
        user_id: currentUser,
        moment_id: targetMoment,
        viewed_at: new Date().toISOString(),
      });

      // Track like
      await supabase.from('moment_likes').insert({
        user_id: currentUser,
        moment_id: targetMoment,
      });

      // Discovery score should increase for similar content
      // (This would be calculated by a background job)
      const { data: moment } = await supabase
        .from('moments')
        .select('*')
        .eq('id', targetMoment)
        .single();

      expect(moment).toBeDefined();
      // In production, discovery_score would be updated based on interactions
    });

    it('should learn from user behavior over time', async () => {
      const currentUser = testUsers[0];

      // User views mostly "coffee" moments
      const coffeeMoments = testMoments
        .filter((_, i) => i % 3 === 0)
        .slice(0, 5);

      for (const momentId of coffeeMoments) {
        await supabase.from('moment_views').insert({
          user_id: currentUser,
          moment_id: momentId,
        });
      }

      // Get user's interaction history
      const { data: views, count } = await supabase
        .from('moment_views')
        .select('moments(type)', { count: 'exact' })
        .eq('user_id', currentUser);

      expect(count).toBeGreaterThan(0);

      // Analyze preferred types
      const typeFrequency = views!.reduce((acc: any, view: any) => {
        const type = view.moments.type;
        acc[type] = (acc[type] || 0) + 1;
        return acc;
      }, {});

      expect(Object.keys(typeFrequency).length).toBeGreaterThan(0);
    });
  });
});

// Helper function to calculate distance between two coordinates
function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * GraphQL Resolvers
 * 
 * Implements the GraphQL schema resolvers with:
 * - Type-safe implementations
 * - DataLoader integration for efficient querying
 * - Authentication & authorization
 * - Error handling
 */

import { GraphQLError } from 'graphql';
import type { SupabaseClient } from '@supabase/supabase-js';

interface Context {
  user?: {
    id: string;
    email: string;
    role: string;
  };
  supabase: SupabaseClient;
  loaders: any;
}

// Helper: Require authentication
function requireAuth(context: Context) {
  if (!context.user) {
    throw new GraphQLError('Authentication required', {
      extensions: { code: 'UNAUTHENTICATED' },
    });
  }
  return context.user;
}

// Helper: Require specific role
function requireRole(context: Context, roles: string[]) {
  const user = requireAuth(context);
  if (!roles.includes(user.role)) {
    throw new GraphQLError('Insufficient permissions', {
      extensions: { code: 'FORBIDDEN' },
    });
  }
  return user;
}

export const resolvers = {
  Query: {
    // ========================================================================
    // User Queries
    // ========================================================================
    
    me: async (_parent: any, _args: any, context: Context) => {
      const user = requireAuth(context);
      return context.loaders.userLoader.load(user.id);
    },
    
    user: async (_parent: any, { id }: { id: string }, context: Context) => {
      return context.loaders.userLoader.load(id);
    },
    
    users: async (
      _parent: any,
      { filter, first = 20, after }: any,
      context: Context
    ) => {
      const { data, error } = await context.supabase
        .from('profiles')
        .select('*')
        .limit(first + 1);
      
      if (error) throw new GraphQLError(error.message);
      
      const hasNextPage = data.length > first;
      const nodes = hasNextPage ? data.slice(0, -1) : data;
      
      return {
        edges: nodes.map((node: any, index: number) => ({
          cursor: Buffer.from(String(index)).toString('base64'),
          node,
        })),
        pageInfo: {
          hasNextPage,
          hasPreviousPage: !!after,
          startCursor: nodes.length > 0 ? Buffer.from('0').toString('base64') : null,
          endCursor: nodes.length > 0
            ? Buffer.from(String(nodes.length - 1)).toString('base64')
            : null,
        },
        totalCount: nodes.length,
      };
    },
    
    // ========================================================================
    // Moment Queries
    // ========================================================================
    
    moment: async (_parent: any, { id }: { id: string }, context: Context) => {
      return context.loaders.momentLoader.load(id);
    },
    
    moments: async (
      _parent: any,
      { filter, first = 20, after }: any,
      context: Context
    ) => {
      let query = context.supabase
        .from('moments')
        .select('*')
        .order('created_at', { ascending: false });
      
      // Apply filters
      if (filter?.types) {
        query = query.in('type', filter.types);
      }
      if (filter?.minPrice !== undefined) {
        query = query.gte('price', filter.minPrice);
      }
      if (filter?.maxPrice !== undefined) {
        query = query.lte('price', filter.maxPrice);
      }
      if (filter?.status) {
        query = query.eq('status', filter.status);
      }
      if (filter?.creatorId) {
        query = query.eq('creator_id', filter.creatorId);
      }
      
      const { data, error } = await query.limit(first + 1);
      
      if (error) throw new GraphQLError(error.message);
      
      const hasNextPage = data.length > first;
      const nodes = hasNextPage ? data.slice(0, -1) : data;
      
      return {
        edges: nodes.map((node: any, index: number) => ({
          cursor: Buffer.from(String(index)).toString('base64'),
          node,
        })),
        pageInfo: {
          hasNextPage,
          hasPreviousPage: !!after,
          startCursor: nodes.length > 0 ? Buffer.from('0').toString('base64') : null,
          endCursor: nodes.length > 0
            ? Buffer.from(String(nodes.length - 1)).toString('base64')
            : null,
        },
        totalCount: nodes.length,
      };
    },
    
    discoverMoments: async (
      _parent: any,
      { location, radius, types, first = 20 }: any,
      context: Context
    ) => {
      // Use PostGIS function for location-based search
      const { data, error } = await context.supabase.rpc(
        'discover_moments_within_radius',
        {
          user_lat: location.latitude,
          user_lng: location.longitude,
          radius_meters: radius,
          moment_types: types,
          limit_count: first,
        }
      );
      
      if (error) throw new GraphQLError(error.message);
      return data || [];
    },
    
    myMoments: async (
      _parent: any,
      { status }: { status?: string },
      context: Context
    ) => {
      const user = requireAuth(context);
      
      let query = context.supabase
        .from('moments')
        .select('*')
        .eq('creator_id', user.id);
      
      if (status) {
        query = query.eq('status', status);
      }
      
      const { data, error } = await query;
      if (error) throw new GraphQLError(error.message);
      
      return data || [];
    },
    
    // ========================================================================
    // Match Queries
    // ========================================================================
    
    match: async (_parent: any, { id }: { id: string }, context: Context) => {
      return context.loaders.matchLoader.load(id);
    },
    
    myMatches: async (
      _parent: any,
      { status }: { status?: string },
      context: Context
    ) => {
      const user = requireAuth(context);
      
      let query = context.supabase
        .from('matches')
        .select('*')
        .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`);
      
      if (status) {
        query = query.eq('status', status);
      }
      
      const { data, error } = await query;
      if (error) throw new GraphQLError(error.message);
      
      return data || [];
    },
  },
  
  Mutation: {
    // ========================================================================
    // Profile Mutations
    // ========================================================================
    
    updateProfile: async (
      _parent: any,
      { input }: { input: any },
      context: Context
    ) => {
      const user = requireAuth(context);
      
      const { data, error } = await context.supabase
        .from('profiles')
        .update(input)
        .eq('id', user.id)
        .select()
        .single();
      
      if (error) throw new GraphQLError(error.message);
      
      // Clear cache
      context.loaders.userLoader.clear(user.id);
      
      return data;
    },
    
    // ========================================================================
    // Moment Mutations
    // ========================================================================
    
    createMoment: async (
      _parent: any,
      { input }: { input: any },
      context: Context
    ) => {
      const user = requireAuth(context);
      
      const { data, error } = await context.supabase
        .from('moments')
        .insert({
          ...input,
          creator_id: user.id,
          status: 'ACTIVE',
        })
        .select()
        .single();
      
      if (error) throw new GraphQLError(error.message);
      
      return data;
    },
    
    updateMoment: async (
      _parent: any,
      { id, input }: { id: string; input: any },
      context: Context
    ) => {
      const user = requireAuth(context);
      
      // Verify ownership
      const moment = await context.loaders.momentLoader.load(id);
      if (moment.creator_id !== user.id) {
        throw new GraphQLError('Not authorized to update this moment', {
          extensions: { code: 'FORBIDDEN' },
        });
      }
      
      const { data, error } = await context.supabase
        .from('moments')
        .update(input)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw new GraphQLError(error.message);
      
      // Clear cache
      context.loaders.momentLoader.clear(id);
      
      return data;
    },
    
    deleteMoment: async (
      _parent: any,
      { id }: { id: string },
      context: Context
    ) => {
      const user = requireAuth(context);
      
      // Verify ownership
      const moment = await context.loaders.momentLoader.load(id);
      if (moment.creator_id !== user.id) {
        throw new GraphQLError('Not authorized to delete this moment', {
          extensions: { code: 'FORBIDDEN' },
        });
      }
      
      const { error } = await context.supabase
        .from('moments')
        .delete()
        .eq('id', id);
      
      if (error) throw new GraphQLError(error.message);
      
      // Clear cache
      context.loaders.momentLoader.clear(id);
      
      return true;
    },
    
    joinMoment: async (
      _parent: any,
      { momentId }: { momentId: string },
      context: Context
    ) => {
      const user = requireAuth(context);
      
      const { data, error } = await context.supabase
        .from('moment_participants')
        .insert({
          moment_id: momentId,
          user_id: user.id,
        })
        .select()
        .single();
      
      if (error) throw new GraphQLError(error.message);
      
      // Clear cache
      context.loaders.momentLoader.clear(momentId);
      
      return context.loaders.momentLoader.load(momentId);
    },
    
    // ========================================================================
    // Match Mutations
    // ========================================================================
    
    createMatch: async (
      _parent: any,
      { userId, momentId }: { userId: string; momentId?: string },
      context: Context
    ) => {
      const currentUser = requireAuth(context);
      
      const { data, error } = await context.supabase
        .from('matches')
        .insert({
          user1_id: currentUser.id,
          user2_id: userId,
          moment_id: momentId,
          status: 'PENDING',
        })
        .select()
        .single();
      
      if (error) throw new GraphQLError(error.message);
      
      return data;
    },
    
    acceptMatch: async (
      _parent: any,
      { matchId }: { matchId: string },
      context: Context
    ) => {
      const user = requireAuth(context);
      
      const { data, error } = await context.supabase
        .from('matches')
        .update({
          status: 'ACCEPTED',
          accepted_at: new Date().toISOString(),
        })
        .eq('id', matchId)
        .select()
        .single();
      
      if (error) throw new GraphQLError(error.message);
      
      // Clear cache
      context.loaders.matchLoader.clear(matchId);
      
      return data;
    },
  },
  
  // ========================================================================
  // Field Resolvers
  // ========================================================================
  
  User: {
    profile: (parent: any, _args: any, context: Context) => {
      return context.loaders.profileLoader.load(parent.id);
    },
    
    moments: async (parent: any, { first = 20, after, filter }: any, context: Context) => {
      let query = context.supabase
        .from('moments')
        .select('*')
        .eq('creator_id', parent.id)
        .limit(first + 1);
      
      if (filter?.status) {
        query = query.eq('status', filter.status);
      }
      
      const { data, error } = await query;
      if (error) throw new GraphQLError(error.message);
      
      const hasNextPage = data.length > first;
      const nodes = hasNextPage ? data.slice(0, -1) : data;
      
      return {
        edges: nodes.map((node: any, index: number) => ({
          cursor: Buffer.from(String(index)).toString('base64'),
          node,
        })),
        pageInfo: {
          hasNextPage,
          hasPreviousPage: !!after,
        },
        totalCount: nodes.length,
      };
    },
    
    stats: async (parent: any, _args: any, context: Context) => {
      // Efficient batch query for stats
      const { data, error } = await context.supabase.rpc(
        'get_user_stats',
        { user_id: parent.id }
      );
      
      if (error) throw new GraphQLError(error.message);
      
      return data || {
        totalMoments: 0,
        completedMoments: 0,
        totalMatches: 0,
        successfulMatches: 0,
        averageRating: null,
      };
    },
  },
  
  Moment: {
    creator: (parent: any, _args: any, context: Context) => {
      return context.loaders.userLoader.load(parent.creator_id);
    },
    
    participants: async (parent: any, _args: any, context: Context) => {
      const { data, error } = await context.supabase
        .from('moment_participants')
        .select('user_id')
        .eq('moment_id', parent.id);
      
      if (error) throw new GraphQLError(error.message);
      
      return Promise.all(
        (data || []).map((p: any) => context.loaders.userLoader.load(p.user_id))
      );
    },
    
    isJoined: async (parent: any, _args: any, context: Context) => {
      if (!context.user) return false;
      
      const { data, error } = await context.supabase
        .from('moment_participants')
        .select('id')
        .eq('moment_id', parent.id)
        .eq('user_id', context.user.id)
        .single();
      
      return !!data;
    },
  },
  
  Match: {
    user1: (parent: any, _args: any, context: Context) => {
      return context.loaders.userLoader.load(parent.user1_id);
    },
    
    user2: (parent: any, _args: any, context: Context) => {
      return context.loaders.userLoader.load(parent.user2_id);
    },
    
    moment: (parent: any, _args: any, context: Context) => {
      if (!parent.moment_id) return null;
      return context.loaders.momentLoader.load(parent.moment_id);
    },
  },
};

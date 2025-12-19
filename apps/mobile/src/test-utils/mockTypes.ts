/**
 * @fileoverview Jest Mock Type Helpers for Supabase
 * @jest-ignore - This file contains only type helpers, not tests
 */
import { SupabaseClient } from '@supabase/supabase-js';

// Extend Jest's type definitions for mocked Supabase
declare global {
  namespace jest {
    interface Matchers<R> {
      toHaveBeenCalledWithSupabase(): R;
    }
  }
}

// Type helper for mocked Supabase client
export type MockedSupabaseClient = jest.Mocked<SupabaseClient<any, any, any>>;

// Helper function to create properly typed mock
export const createMockSupabaseClient = (): MockedSupabaseClient => {
  return {
    auth: {
      signInWithPassword: jest.fn(),
      signUp: jest.fn(),
      signOut: jest.fn(),
      getUser: jest.fn(),
      getSession: jest.fn(),
      resetPasswordForEmail: jest.fn(),
      onAuthStateChange: jest.fn(() => ({
        data: { subscription: { unsubscribe: jest.fn() } },
      })),
    },
    from: jest.fn(() => ({
      select: jest.fn().mockReturnThis(),
      insert: jest.fn().mockReturnThis(),
      update: jest.fn().mockReturnThis(),
      delete: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      neq: jest.fn().mockReturnThis(),
      gt: jest.fn().mockReturnThis(),
      lt: jest.fn().mockReturnThis(),
      gte: jest.fn().mockReturnThis(),
      lte: jest.fn().mockReturnThis(),
      like: jest.fn().mockReturnThis(),
      ilike: jest.fn().mockReturnThis(),
      is: jest.fn().mockReturnThis(),
      in: jest.fn().mockReturnThis(),
      order: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      range: jest.fn().mockReturnThis(),
      single: jest.fn(),
      maybeSingle: jest.fn(),
    })),
    storage: {
      from: jest.fn(() => ({
        upload: jest.fn(),
        download: jest.fn(),
        remove: jest.fn(),
        getPublicUrl: jest.fn(),
      })),
    },
    channel: jest.fn(() => ({
      on: jest.fn().mockReturnThis(),
      subscribe: jest.fn(),
      unsubscribe: jest.fn(),
    })),
    removeChannel: jest.fn(),
  } as unknown as MockedSupabaseClient;
};

// Type cast helper for existing mock
export const asMockedSupabase = (supabase: any): MockedSupabaseClient => {
  return supabase as MockedSupabaseClient;
};

export {};

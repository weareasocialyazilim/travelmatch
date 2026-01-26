/**
 * Supabase Services Index
 * Central export for all Supabase-related services
 */

// Core Supabase client and types
export {
  supabase,
  isSupabaseConfigured,
  SUPABASE_EDGE_URL,
} from '../config/supabase';
export type { Database } from '@/types/database.types';

// Mock export for tests - allows type-safe mocking with jest.mock()
export type MockSupabaseFrom = jest.Mock;
export declare const mockSupabaseFrom: MockSupabaseFrom;

// Authentication Service (from features/auth)
export { default as supabaseAuth } from '../features/auth/services/authService';
export {
  signUpWithEmail,
  signInWithEmail,
  signInWithOAuth,
  signOut,
  getSession,
  getCurrentUser,
  resetPassword,
  updatePassword,
  updateProfile,
  deleteAccount,
  onAuthStateChange,
} from '../features/auth/services/authService';

// Database Services
export { default as supabaseDb } from './supabaseDbService';
export {
  usersService,
  momentsService,
  requestsService,
  messagesService,
  conversationsService,
  reviewsService,
  notificationsService,
  subscriptionsService,
} from './supabaseDbService';

// Storage Service
export { default as supabaseStorage } from './supabaseStorageService';
export {
  uploadFile,
  uploadFiles,
  downloadFile,
  deleteFile,
  deleteFiles,
  getSignedUrl,
  getPublicUrl,
  listFiles,
  uploadAvatar,
  uploadMomentImages,
  uploadProofImage,
} from './supabaseStorageService';
export type { StorageBucket } from './supabaseStorageService';

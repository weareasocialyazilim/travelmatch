/**
 * Supabase Services Index
 * Central export for all Supabase-related services
 */

// Core Supabase client and types
export { supabase, isSupabaseConfigured } from '../config/supabase';
export type { Database } from '@/types/database.types';

// Authentication Service
export { default as supabaseAuth } from './supabaseAuthService';
export {
  signUpWithEmail,
  signInWithEmail,
  signInWithPhone,
  verifyPhoneOtp,
  signInWithMagicLink,
  verifyEmailOtp,
  signInWithOAuth,
  signOut,
  getSession,
  getCurrentUser,
  resetPassword,
  updatePassword,
  updateProfile,
  deleteAccount,
  onAuthStateChange,
} from './supabaseAuthService';

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

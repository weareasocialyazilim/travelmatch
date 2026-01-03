/**
 * Supabase Auth Service for Settings - Backward Compatibility Layer
 *
 * This module re-exports from the main supabaseAuthService.
 * All auth logic has been consolidated into services/supabaseAuthService.ts
 *
 * @deprecated Import directly from '@/services/supabaseAuthService' for new code
 *
 * Migration:
 * - OLD: import { supabaseAuthService } from '@/features/settings/services/supabaseAuthService';
 * - NEW: import supabaseAuthService from '@/services/supabaseAuthService';
 */

import mainAuthService, {
  deleteAccount,
  requestDataExport,
  signInWithPhone,
  verifyPhoneOtp,
} from '../../../services/supabaseAuthService';

// Re-export types for backward compatibility
export interface DeleteAccountResult {
  error: Error | null;
}

// Re-export functions
export { deleteAccount, requestDataExport, signInWithPhone, verifyPhoneOtp };

// Named export for backward compatibility
export const supabaseAuthService = {
  deleteAccount,
  requestDataExport,
  signInWithPhone,
  verifyPhoneOtp,
};

// Default export
export default supabaseAuthService;

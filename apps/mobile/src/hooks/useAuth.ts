import { useMemo } from 'react';

export function useAuth() {
  // Minimal stub for tests that mock this module
  const auth = useMemo(() => ({ user: null, isAuthenticated: false }), []);
  return auth;
}

export default useAuth;

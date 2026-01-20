-- ============================================
-- Fix Users RLS Infinite Recursion
-- Migration: 20260120150000_fix_users_rls_recursion_v2.sql
-- ============================================

-- Drop the problematic INSERT policy that causes infinite recursion
DROP POLICY IF EXISTS "users_insert_own" ON public.users;

-- Create fixed INSERT policy without self-referencing subquery
CREATE POLICY "users_insert_own"
  ON public.users
  FOR INSERT
  WITH CHECK (id = auth.uid());

-- Fix SELECT policy to ensure no recursion
DROP POLICY IF EXISTS "Users can view any profile" ON public.users;
DROP POLICY IF EXISTS "users_select_all" ON public.users;

-- Simple SELECT policy - authenticated users can view all profiles
CREATE POLICY "users_select_all"
  ON public.users
  FOR SELECT
  TO authenticated
  USING (true);

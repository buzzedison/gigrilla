-- Fix: Add missing INSERT policy for users table
-- This allows authenticated users to create their own user records during signup

CREATE POLICY "users_insert_own" ON users
  FOR INSERT WITH CHECK (auth.uid() = id);











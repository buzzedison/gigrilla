-- Fix schema: Add missing columns and RLS policies
-- Run this in Supabase SQL Editor or via psql

-- ============================================================================
-- ADD MISSING COLUMNS
-- ============================================================================

-- Add missing columns to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS first_name TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS last_name TEXT;

-- Add missing columns to user_profiles table
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS genres TEXT[] DEFAULT '{}';
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS is_public BOOLEAN DEFAULT TRUE;

-- ============================================================================
-- FIX RLS POLICIES
-- ============================================================================

-- Add missing INSERT policy for users table (allows signup)
DROP POLICY IF EXISTS "users_insert_own" ON users;
CREATE POLICY "users_insert_own" ON users
  FOR INSERT WITH CHECK (auth.uid() = id);

-- ============================================================================
-- VERIFY CHANGES
-- ============================================================================

-- Verify users table columns
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'users'
AND column_name IN ('id', 'email', 'first_name', 'last_name', 'user_role')
ORDER BY column_name;

-- Verify user_profiles table columns
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'user_profiles'
AND column_name IN ('user_id', 'profile_type', 'genres', 'is_public')
ORDER BY column_name;

-- Check RLS policies on users table
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE tablename = 'users'
ORDER BY policyname;

-- Migration: Add first_name and last_name columns to users table
-- Date: 2024
-- Description: Add missing name columns that the auth system expects

ALTER TABLE users ADD COLUMN IF NOT EXISTS first_name TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS last_name TEXT;






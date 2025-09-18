-- ============================================================================
-- GIGRILLA DATABASE SCHEMA - INITIALIZATION
-- ============================================================================
-- This file sets up the basic database structure and extensions

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create custom types
CREATE TYPE user_role AS ENUM ('fan', 'artist', 'venue', 'service', 'pro');
CREATE TYPE gig_status AS ENUM ('draft', 'published', 'cancelled', 'completed');
CREATE TYPE booking_status AS ENUM ('pending', 'confirmed', 'cancelled', 'completed');
CREATE TYPE subscription_tier AS ENUM ('free', 'premium', 'pro');
CREATE TYPE content_type AS ENUM ('track', 'album', 'playlist', 'post');
CREATE TYPE payment_status AS ENUM ('pending', 'completed', 'failed', 'refunded');

-- Create database version table for migrations
CREATE TABLE IF NOT EXISTS db_version (
    version INTEGER PRIMARY KEY,
    applied_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    description TEXT
);

INSERT INTO db_version (version, description) VALUES (1, 'Initial schema setup');

-- ============================================================================
-- GIGRILLA DATABASE SCHEMA - MASTER FILE
-- ============================================================================
-- Complete database schema for Gigrilla platform
-- Run this file to create the entire database structure

-- Initialize database
\i schema/00_init.sql

-- Core platform structure
\i schema/01_core_tables.sql

-- Music content management
\i schema/02_music_content.sql

-- Gig management system
\i schema/03_gig_management.sql

-- Industry services and professionals
\i schema/04_industry_services.sql

-- Social features and networking
\i schema/05_social_features.sql

-- Commerce and payments
\i schema/06_commerce.sql

-- Admin and analytics
\i schema/07_admin_analytics.sql

-- DDEX compliance enhancements
\i schema/08_ddex_enhancements.sql

-- Create any additional indexes or constraints
-- (Add here if needed after initial setup)

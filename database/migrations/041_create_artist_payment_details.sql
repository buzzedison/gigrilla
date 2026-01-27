-- Migration: Create artist_payment_details table
-- Description: Stores banking and payment information for artist profiles
-- Author: System
-- Date: 2026-01-27

-- Create artist_payment_details table
CREATE TABLE IF NOT EXISTS artist_payment_details (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    artist_profile_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,

    -- General settings
    use_fan_banking BOOLEAN DEFAULT FALSE,

    -- Payments Out (paying crew, vendors, etc.)
    payment_out_method VARCHAR(20) CHECK (payment_out_method IN ('direct_debit', 'card')),
    payment_out_bank_name VARCHAR(255),
    payment_out_account_holder VARCHAR(255),
    payment_out_sort_code VARCHAR(20),
    payment_out_account_number VARCHAR(255),
    payment_out_card_name VARCHAR(255),
    payment_out_card_number VARCHAR(255), -- Should be encrypted in production
    payment_out_card_expiry VARCHAR(10),
    payment_out_card_cvv VARCHAR(10), -- Should be encrypted in production

    -- Payments In (receiving payments from gigs, royalties, etc.)
    payment_in_same_as_out BOOLEAN DEFAULT TRUE,
    payment_in_method VARCHAR(20) CHECK (payment_in_method IN ('direct_debit', 'card')),
    payment_in_bank_name VARCHAR(255),
    payment_in_account_holder VARCHAR(255),
    payment_in_sort_code VARCHAR(20),
    payment_in_account_number VARCHAR(255),
    payment_in_card_name VARCHAR(255),
    payment_in_card_number VARCHAR(255), -- Should be encrypted in production
    payment_in_card_expiry VARCHAR(10),
    payment_in_card_cvv VARCHAR(10), -- Should be encrypted in production

    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

    -- Constraints
    UNIQUE(artist_profile_id)
);

-- Create index on artist_profile_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_artist_payment_details_artist_profile_id
ON artist_payment_details(artist_profile_id);

-- Add RLS (Row Level Security) policies
ALTER TABLE artist_payment_details ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own payment details
CREATE POLICY artist_payment_details_select_policy ON artist_payment_details
    FOR SELECT
    USING (
        artist_profile_id IN (
            SELECT id FROM user_profiles
            WHERE user_id = auth.uid()
            AND profile_type = 'artist'
        )
    );

-- Policy: Users can insert their own payment details
CREATE POLICY artist_payment_details_insert_policy ON artist_payment_details
    FOR INSERT
    WITH CHECK (
        artist_profile_id IN (
            SELECT id FROM user_profiles
            WHERE user_id = auth.uid()
            AND profile_type = 'artist'
        )
    );

-- Policy: Users can update their own payment details
CREATE POLICY artist_payment_details_update_policy ON artist_payment_details
    FOR UPDATE
    USING (
        artist_profile_id IN (
            SELECT id FROM user_profiles
            WHERE user_id = auth.uid()
            AND profile_type = 'artist'
        )
    );

-- Policy: Users can delete their own payment details
CREATE POLICY artist_payment_details_delete_policy ON artist_payment_details
    FOR DELETE
    USING (
        artist_profile_id IN (
            SELECT id FROM user_profiles
            WHERE user_id = auth.uid()
            AND profile_type = 'artist'
        )
    );

-- Add comment to table
COMMENT ON TABLE artist_payment_details IS 'Stores banking and payment information for artist profiles';

-- Note: In production, card_number and card_cvv fields should be encrypted
-- Consider using Supabase Vault or a dedicated payment processor like Stripe

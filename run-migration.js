// Quick migration runner for music_release_invitations table
const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim()

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing SUPABASE credentials in .env.local')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

const migrationSQL = `
-- Migration: Create music release invitations table
-- For inviting distributors, PROs, MCS, labels, and publishers to collaborate

CREATE TABLE IF NOT EXISTS music_release_invitations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    release_id UUID NOT NULL REFERENCES music_releases(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

    -- Invitation details
    invitation_type TEXT NOT NULL CHECK (invitation_type IN ('distributor', 'pro', 'mcs', 'label', 'publisher')),
    organization_name TEXT NOT NULL,
    contact_email TEXT NOT NULL,
    contact_name TEXT,
    custom_message TEXT,

    -- Invitation token
    invitation_token TEXT UNIQUE,
    invitation_token_expires_at TIMESTAMPTZ,

    -- Status tracking
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'accepted', 'declined', 'expired')),
    invited_at TIMESTAMPTZ,
    responded_at TIMESTAMPTZ,

    -- Metadata
    metadata JSONB DEFAULT '{}',

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_music_release_invitations_release ON music_release_invitations(release_id);
CREATE INDEX IF NOT EXISTS idx_music_release_invitations_user ON music_release_invitations(user_id);
CREATE INDEX IF NOT EXISTS idx_music_release_invitations_email ON music_release_invitations(contact_email);
CREATE INDEX IF NOT EXISTS idx_music_release_invitations_token ON music_release_invitations(invitation_token);
CREATE INDEX IF NOT EXISTS idx_music_release_invitations_status ON music_release_invitations(status);
CREATE INDEX IF NOT EXISTS idx_music_release_invitations_type ON music_release_invitations(invitation_type);

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION update_music_release_invitation_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_music_release_invitation_timestamp
    BEFORE UPDATE ON music_release_invitations
    FOR EACH ROW
    EXECUTE FUNCTION update_music_release_invitation_timestamp();

-- Function to get pending invitations for a release
CREATE OR REPLACE FUNCTION get_release_pending_invitations(release_uuid UUID)
RETURNS TABLE (
    id UUID,
    invitation_type TEXT,
    organization_name TEXT,
    contact_email TEXT,
    status TEXT,
    invited_at TIMESTAMPTZ
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        i.id,
        i.invitation_type,
        i.organization_name,
        i.contact_email,
        i.status,
        i.invited_at
    FROM music_release_invitations i
    WHERE i.release_id = release_uuid
    AND i.status IN ('pending', 'sent')
    ORDER BY i.created_at DESC;
END;
$$ LANGUAGE plpgsql;

-- Function to expire old invitations
CREATE OR REPLACE FUNCTION expire_old_invitations()
RETURNS INTEGER AS $$
DECLARE
    expired_count INTEGER;
BEGIN
    UPDATE music_release_invitations
    SET status = 'expired'
    WHERE status = 'sent'
    AND invitation_token_expires_at < NOW();

    GET DIAGNOSTICS expired_count = ROW_COUNT;
    RETURN expired_count;
END;
$$ LANGUAGE plpgsql;

-- Add comments
COMMENT ON TABLE music_release_invitations IS 'Invitations sent to collaborators for music releases (distributors, PROs, MCS, labels, publishers)';
COMMENT ON COLUMN music_release_invitations.invitation_type IS 'Type of organization being invited: distributor, pro, mcs, label, or publisher';
COMMENT ON COLUMN music_release_invitations.invitation_token IS 'Unique token for secure invitation acceptance';
COMMENT ON FUNCTION expire_old_invitations IS 'Marks invitations as expired after their expiration date';
`

async function runMigration() {
  console.log('🚀 Running migration for music_release_invitations table...')

  try {
    const { data, error } = await supabase.rpc('exec_sql', { sql: migrationSQL })

    if (error) {
      // If exec_sql doesn't exist, we need to use the SQL Editor in Supabase Dashboard
      console.error('❌ Could not execute SQL via RPC.')
      console.log('\n📋 Please run this migration manually:')
      console.log('\n1. Go to: https://supabase.com/dashboard/project/gpfjkgdwymwdmmrezecc/sql')
      console.log('2. Copy the SQL from: database/migrations/039_create_music_release_invitations.sql')
      console.log('3. Paste and run it in the SQL Editor')
      console.log('\n' + '='.repeat(80))
      console.log(migrationSQL)
      console.log('='.repeat(80))
      return
    }

    console.log('✅ Migration completed successfully!')
    console.log('✅ Table music_release_invitations created')
    console.log('✅ Indexes created')
    console.log('✅ Functions created')

  } catch (err) {
    console.error('❌ Migration failed:', err.message)
    console.log('\n📋 Please run this migration manually via Supabase Dashboard:')
    console.log('1. Go to: https://supabase.com/dashboard/project/gpfjkgdwymwdmmrezecc/sql')
    console.log('2. Copy the SQL from: database/migrations/039_create_music_release_invitations.sql')
    console.log('3. Paste and run it in the SQL Editor')
  }
}

runMigration()

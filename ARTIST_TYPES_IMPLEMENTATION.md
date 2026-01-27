# Artist Types Implementation Guide

## Overview
This document outlines the implementation of type-specific artist registration forms and capabilities based on the 8 artist types defined in `database/migrations/artisttypes.md`.

## Artist Types

### Type 1: Live Gig & Original Recording Artist
- Full profile with band/crew members
- Music upload (original & licensed covers)
- Live gig booking with pricing
- Contract management (label, publisher, manager, booking agent)
- Income splits for team members
- **Key Features**: Full music lifecycle + live performance

### Type 2: Original Recording Artist
- Similar to Type 1 BUT no live gig features
- Focus on music recording and distribution
- Team management and contracts
- **Key Features**: Recording only, no live performances

### Type 3: Live Gig Artist (Cover; Tribute; Classical; Theatrical)
- Live performance focus
- NO music upload (performs covers/tributes)
- Team management
- Gig pricing and areas
- **Key Features**: Live performance only, no original recordings

### Type 4: Vocalist for Hire
- Solo professional vocalist
- Vocal sound descriptors (38+ types)
- Vocal genre styles (38+ genres)
- Availability options
- Session gig tracking
- **Key Features**: Hired for guest vocals, backing vocals, sessions

### Type 5: Instrumentalist for Hire
- Solo professional instrumentalist
- Instrument category and selection (60+ instruments)
- Availability options
- Session gig tracking
- **Key Features**: Hired for live or session performances

### Type 6: Songwriter for Hire
- Professional songwriter
- Genre specialization
- Publishing contracts
- Creator IPI/CAE required
- **Key Features**: Writes songs for others

### Type 7: Lyricist for Hire
- Professional lyric writer
- Genre specialization
- Publishing contracts
- Creator IPI/CAE required
- **Key Features**: Writes lyrics only

### Type 8: Composer for Hire
- Professional music composer
- Genre specialization
- Publishing contracts
- Creator IPI/CAE required
- **Key Features**: Writes musical compositions (melodies, harmonies)

## Implementation Components

### 1. Configuration File: `lib/artist-type-config.ts`
✅ **Created** - Defines capabilities for each artist type

Key exports:
- `ArtistTypeCapabilities` interface
- `ARTIST_TYPE_CAPABILITIES` mapping (1-8)
- `getArtistTypeCapabilities(typeId)` helper function
- `hasCapability(typeId, capability)` helper function
- `ARTIST_TYPE_GROUPS` categorization

### 2. Database Migration: `database/migrations/036_add_artist_professional_ids.sql`
✅ **Created** - Adds missing fields:

**New user_profiles fields:**
- `performer_isni` - International Standard Name Identifier
- `creator_ipi_cae` - Interested Parties Number for creators
- `recording_session_gigs` - Session count for Types 4 & 5
- `website` - Official artist website

**Extended artist_members fields:**
- `performer_isni`, `creator_ipi_cae` - Professional IDs for members
- `email`, `phone` - Contact info for invitations
- `is_admin` - Admin rights flag
- `invitation_status` - Invitation tracking
- `hometown_*` fields with privacy controls
- Privacy flags: `is_public_real_name`, `is_public_dob`, `is_public_hometown`

**Existing fields (from previous migrations):**
- Artist type selection (Types 1-8) - Migration 032
- Set lengths (min/max) - Migration 033
- Gig areas and pricing (local/wider) - Migration 034
- Vocal/instrument selections - Migration 032
- Social media URLs - Migration 031
- Contract fields - Migration 007

### 3. SignUpWizard Updates
🔄 **Needs Integration**

The wizard currently has all 8 artist types defined but doesn't use capability-based conditional rendering. We need to:

1. Import the capabilities configuration
2. Get capabilities for selected artist type
3. Conditionally render sections based on capabilities

#### Sections to Make Conditional:

**Artist Profile Setup** (line ~5195):
- ✅ Artist Details (all types)
- ✅ Artist Type Selection (all types)
- 🔄 Team Members (only if `hasTeamMembers`)
- 🔄 Support Team (only if `hasSupportTeam`)
- 🔄 Contract Status (conditional based on capabilities)
  - Record Label (only if `hasRecordLabel`)
  - Music Publisher (only if `hasMusicPublisher`)
  - Artist Manager (only if `hasArtistManager`)
  - Booking Agent (only if `hasBookingAgent`)
- 🔄 Money Splits (only if `hasMoneySplits`)

**Gig Ability** (needs to be added):
- 🔄 Show only if `canPerformLiveGigs`
- 🔄 Set Lengths (only if `hasSetLengths`)
- 🔄 Local Gig Pricing (only if `hasGigPricing`)
- 🔄 Wider Gig Pricing (only if `hasGigPricing`)
- 🔄 Gig Areas (only if `hasGigAreas`)

**Music Upload** (needs to be added):
- 🔄 Show only if `canUploadMusic`
- 🔄 Registration requirements (only if `requiresMusicRegistration`)

**Professional IDs**:
- 🔄 ISNI (only if `requiresISNI`)
- 🔄 IPI/CAE (show as required if `requiresIPICAE`, optional if `optionalIPICAE`)

**Additional Tracking**:
- 🔄 Public Gigs Performed (only if `needsGigsPerformed`)
- 🔄 Recording Session Gigs (only if `hasSessionGigs`)

### 4. API Updates
🔄 **Needs Enhancement**

Update `app/api/artist-profile/route.ts` to:
1. Handle new professional ID fields (ISNI, IPI/CAE)
2. Store session gig counts
3. Store website URL
4. Validate required fields based on artist type capabilities

### 5. Database Schema Summary

**user_profiles table** - Artist-specific columns:
```sql
-- Core Profile
artist_type_id INTEGER         -- 1-8
artist_sub_types TEXT[]        -- Band, Solo Artist, etc.
stage_name TEXT
bio TEXT
established_date DATE
base_location TEXT
base_location_lat DECIMAL
base_location_lon DECIMAL
performing_members INTEGER
gigs_performed INTEGER
recording_session_gigs INTEGER

-- Professional IDs
performer_isni TEXT
creator_ipi_cae TEXT

-- Live Gig Features (Types 1, 3, 4, 5)
minimum_set_length INTEGER
maximum_set_length INTEGER
local_gig_fee DECIMAL
local_gig_timescale INTEGER
local_gig_area JSONB
wider_gig_fee DECIMAL
wider_gig_timescale INTEGER
wider_fixed_logistics_fee DECIMAL
wider_negotiated_logistics BOOLEAN
wider_gig_area JSONB

-- For Hire Features (Types 4-8)
vocal_sound_types TEXT          -- Type 4
vocal_genre_styles TEXT         -- Type 4
instrument_category TEXT        -- Type 5
instrument TEXT                 -- Type 5
songwriter_option TEXT          -- Type 6
songwriter_genres TEXT          -- Type 6
lyricist_option TEXT            -- Type 7
lyricist_genres TEXT            -- Type 7
composer_option TEXT            -- Type 8
composer_genres TEXT            -- Type 8
availability TEXT               -- Types 4, 5, 6, 7, 8

-- Contracts (Types 1, 2, 6, 7, 8 have publishers; Types 1, 3 have booking agents)
record_label_status TEXT
record_label_name TEXT
record_label_contact_name TEXT
record_label_email TEXT
record_label_phone TEXT

music_publisher_status TEXT
music_publisher_name TEXT
music_publisher_contact_name TEXT
music_publisher_email TEXT
music_publisher_phone TEXT

artist_manager_status TEXT
artist_manager_name TEXT
artist_manager_contact_name TEXT
artist_manager_email TEXT
artist_manager_phone TEXT

booking_agent_status TEXT
booking_agent_name TEXT
booking_agent_contact_name TEXT
booking_agent_email TEXT
booking_agent_phone TEXT

-- Social & Web
facebook_url TEXT
instagram_url TEXT
threads_url TEXT
x_url TEXT
tiktok_url TEXT
youtube_url TEXT
snapchat_url TEXT
website TEXT

-- Settings
is_published BOOLEAN
is_public BOOLEAN
onboarding_completed BOOLEAN
onboarding_completed_at TIMESTAMP
```

**artist_members table** - Team members (Types 1, 2, 3):
```sql
id UUID
artist_profile_id UUID
first_name TEXT
nickname TEXT
last_name TEXT
date_of_birth DATE
hometown_city TEXT
hometown_state TEXT
hometown_country TEXT
roles TEXT[]
income_share DECIMAL            -- Percentage of gig money
performer_isni TEXT
creator_ipi_cae TEXT
email TEXT
phone TEXT
is_admin BOOLEAN
invitation_status TEXT          -- pending, invited, joined
is_public_real_name BOOLEAN
is_public_dob BOOLEAN
is_public_hometown BOOLEAN
```

**artist_photos table** - Photo management (all types):
```sql
id UUID
artist_profile_id UUID
file_name TEXT
file_url TEXT
file_size INTEGER
mime_type TEXT
caption TEXT
is_primary BOOLEAN
sort_order INTEGER
```

**artist_videos table** - Video management (all types):
```sql
id UUID
artist_profile_id UUID
title TEXT
video_url TEXT
thumbnail_url TEXT
duration INTEGER
video_type TEXT                 -- youtube, vimeo, direct
description TEXT
is_featured BOOLEAN
sort_order INTEGER
```

## Implementation Steps

### ✅ Completed:
1. Created artist type capabilities configuration
2. Created database migration for professional IDs and missing fields
3. Documented all 8 artist types and their unique features

### 🔄 In Progress:
4. Updating SignUpWizard to use capability-based rendering

### ⏳ Pending:
5. Update artist profile API to handle new fields
6. Run database migration
7. Test registration for all 8 artist types
8. Add music upload section (Types 1, 2)
9. Add complete gig ability section (Types 1, 3, 4, 5)
10. Ensure proper validation based on artist type

## Usage Example

```typescript
import { getArtistTypeCapabilities, hasCapability } from '@/lib/artist-type-config';

// Get all capabilities for an artist type
const capabilities = getArtistTypeCapabilities(1); // Type 1

// Check specific capability
if (capabilities.canUploadMusic) {
  // Show music upload section
}

// Or use the helper
if (hasCapability(artistTypeId, 'hasTeamMembers')) {
  // Show team member management
}
```

## Conditional Rendering Pattern

```tsx
{hasCapability(artistSelection.typeId, 'hasTeamMembers') && (
  <div className="space-y-4">
    <h4>Team Members</h4>
    {/* Team member management UI */}
  </div>
)}

{hasCapability(artistSelection.typeId, 'canPerformLiveGigs') && (
  <div className="space-y-4">
    <h4>Gig Ability</h4>
    {/* Gig pricing and areas UI */}
  </div>
)}
```

## Benefits

1. **Type-Safe**: Capabilities are defined in TypeScript interfaces
2. **Maintainable**: Single source of truth for artist type features
3. **Scalable**: Easy to add new artist types or modify capabilities
4. **Clear**: Self-documenting code with descriptive capability names
5. **Flexible**: Can combine multiple capability checks for complex conditions

## Next Steps

1. Integrate capabilities into SignUpWizard conditional rendering
2. Update API endpoints to validate based on capabilities
3. Run database migration
4. Test each artist type's registration flow
5. Add music upload and advanced gig management sections

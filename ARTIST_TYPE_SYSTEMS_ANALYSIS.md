# Artist Type Systems - Alignment Analysis

## Problem: Two Different Systems

### System 1: SignUpWizard (Onboarding) ✅ NEW
**File:** `app/signup/components/SignUpWizard.tsx`
**Capabilities:** `lib/artist-type-config.ts`

**Features:**
- Detailed capability checks
- Controls what forms appear during signup
- Fields: hasRecordLabel, hasMusicPublisher, hasBookingAgent, requiresISNI, requiresIPICAE, hasSessionGigs, etc.
- 16+ capability flags per type

**Type IDs:**
- Uses strings: "type1", "type2", etc.
- Converts to numbers when saving: parseInt("type1".replace('type', '')) → 1

### System 2: ArtistTypeSelectorV2 (Dashboard) ❌ OLD
**File:** `app/artist-dashboard/components/ArtistTypeSelectorV2.tsx`
**Data:** `data/artist-types.ts`

**Features:**
- Simple capability checks
- Controls dashboard sections (only 3 checks)
- Fields: showGigAbility, showMusicUploads, gigBookingMode
- Different sub-type structure

**Type IDs:**
- Uses numbers directly: 1, 2, 3, etc.

## Database Storage

Both systems save to: `user_profiles.artist_type_id` (INTEGER 1-8)

## Comparison Table

| Feature | SignUpWizard | Dashboard |
|---------|-------------|-----------|
| IDs | "type1"-"type8" | 1-8 |
| Database value | 1-8 (converted) | 1-8 (direct) |
| Capabilities file | lib/artist-type-config.ts | data/artist-types.ts |
| # of capability checks | 16+ | 3 |
| Controls | Signup form sections | Dashboard sections |
| Sub-types | Simple arrays | Grouped with selections |

## Issues

1. **Inconsistent capabilities**: Dashboard doesn't know about new capabilities (ISNI, IPI/CAE, session gigs, etc.)
2. **Different sub-type handling**: Signup uses simple arrays, dashboard uses grouped selections
3. **Confusing for developers**: Two sources of truth
4. **Hard to maintain**: Changes need to be made in two places

## Solution Options

### Option A: Update Dashboard to Use SignUpWizard System ⭐ RECOMMENDED
**Pros:**
- SignUpWizard system is more complete
- Matches artisttypes.md requirements
- Already has all necessary capabilities

**Changes needed:**
1. Update dashboard to import from `lib/artist-type-config.ts`
2. Convert ArtistTypeSelectorV2 to use the same structure as SignUpWizard
3. Keep sub-type handling from dashboard (it's better)

### Option B: Merge Both Systems
**Pros:**
- Creates one unified source of truth
- Combines best of both worlds

**Changes needed:**
1. Create new unified file: `lib/artist-types-unified.ts`
2. Merge capabilities from both systems
3. Update both components to use it

### Option C: Keep Separate but Sync
**Pros:**
- Minimal changes
- Each system stays independent

**Cons:**
- Still two sources of truth
- Easy to get out of sync

## Recommended Action Plan

**Use Option A: Update Dashboard to Match SignUpWizard**

1. ✅ Keep `lib/artist-type-config.ts` as the source of truth
2. ✅ Update dashboard to use these capabilities
3. ✅ Keep dashboard's sub-type selector UI (it's good)
4. ✅ Remove/deprecate `data/artist-types.ts` or convert it to use the new system

### Implementation Steps:

1. Update `data/artist-types.ts` to import and use capabilities from `lib/artist-type-config.ts`
2. Add converter function: dashboard IDs (1-8) ↔ signup IDs ("type1"-"type8")
3. Ensure both save artist_type_id as 1-8
4. Test that changing type in dashboard applies same rules as signup

## Current State

✅ SignUpWizard uses conditional rendering based on detailed capabilities
✅ Database has all necessary fields (ISNI, IPI/CAE, session gigs, website)
✅ API handles all new fields
❌ Dashboard doesn't use the detailed capabilities yet
❌ Dashboard might show fields that shouldn't be shown for a type

## Next Steps

1. Decide on Option A, B, or C
2. Implement the chosen option
3. Test both signup and dashboard for all 8 types
4. Ensure consistency across both flows

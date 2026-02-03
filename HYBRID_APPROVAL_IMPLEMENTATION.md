# Hybrid Approval System - Implementation Summary

## Overview

This document outlines the implementation of Gigrilla's hybrid content approval model, which supports both automated (beta phase) and manual (post-launch) approval workflows.

---

## Phase 1: Beta (Auto-Approval with Post-Moderation)

### Key Features
- ✅ **Auto-publish**: Content goes live instantly upon upload
- ✅ **Post-moderation**: Team and community moderators review content after publication
- ✅ **Moderation flags**: Track low-quality, offensive, or flagged content
- ✅ **User bans**: Ban fraudulent or problematic users
- ✅ **Admin dashboard**: Comprehensive oversight and management tools

---

## Phase 2: Post-Launch (Automated Verification)

### Key Features
- ✅ **API-driven verification**: Automated checks against ISRC/ISWC/GTIN databases
- ✅ **Confidence scoring**: Machine scoring to determine approval eligibility
- ✅ **Toggle switch**: Admin panel setting to switch between auto and manual approval
- ✅ **Verification tracking**: Store and review automated verification results

---

## Database Changes

### Migration File
**Location**: `/database/migrations/046_hybrid_approval_system.sql`

### New Tables

#### 1. `platform_settings`
Stores platform-wide configuration including approval mode toggle.

```sql
- setting_key: TEXT (unique) - Key identifier (e.g., 'approval_mode')
- setting_value: JSONB - Flexible JSON value storage
- description: TEXT - Human-readable description
- updated_by: UUID - Admin who last updated
- created_at, updated_at: TIMESTAMPTZ
```

**Default Settings**:
- `approval_mode`: `{"mode": "auto", "beta_phase": true}`
- `automated_verification_enabled`: `false`
- `moderation_settings`: `{"auto_flag_explicit": false, "require_isrc": false, "require_iswc": false}`

#### 2. `user_bans`
Tracks banned users and ban history.

```sql
- user_id: UUID (references auth.users)
- banned_by: UUID (admin who issued ban)
- ban_reason: TEXT
- ban_type: TEXT ('temporary' | 'permanent')
- banned_at, expires_at, unbanned_at: TIMESTAMPTZ
- is_active: BOOLEAN
- admin_notes, unban_reason: TEXT
```

#### 3. `verification_results`
Stores automated verification check results.

```sql
- release_id, track_id: UUID (references music_releases/music_tracks)
- verification_type: TEXT ('isrc' | 'iswc' | 'gtin' | 'pro' | 'copyright')
- verified: BOOLEAN
- confidence_score: DECIMAL(3,2) - 0.00 to 1.00
- verification_data: JSONB - Full API response
- error_message, warning_message: TEXT
- verified_at: TIMESTAMPTZ
- api_provider: TEXT (e.g., 'musicbrainz')
- api_response_time_ms: INTEGER
```

#### 4. `moderation_actions`
Audit trail for all moderation actions.

```sql
- release_id, user_id: UUID (target of action)
- moderator_id: UUID (who took action)
- action_type: TEXT (flag, unflag, mark_offensive, ban_user, etc.)
- reason, moderator_notes: TEXT
- action_taken_at: TIMESTAMPTZ
```

### Modified Tables

#### `music_releases` - New Columns
```sql
- do_not_recommend: BOOLEAN DEFAULT FALSE
- flagged_for_review: BOOLEAN DEFAULT FALSE
- is_offensive: BOOLEAN DEFAULT FALSE
- moderation_notes: TEXT
- flagged_at: TIMESTAMPTZ
- flagged_by: UUID (references auth.users)
- removed_at: TIMESTAMPTZ
- removed_by: UUID (references auth.users)
```

#### `user_profiles` - Updated Role Constraint
```sql
- role: TEXT CHECK (role IN ('user', 'community_moderator', 'admin', 'super_admin'))
```

**New Role**: `community_moderator` - Can moderate content but cannot ban users

---

## API Endpoints

### Moderation APIs

#### `POST /api/admin/moderation`
Perform moderation actions on content or users.

**Permissions**: community_moderator, admin, super_admin (ban actions require admin)

**Request Body**:
```json
{
  "action": "flag" | "unflag" | "mark_offensive" | "unmark_offensive" |
            "do_not_recommend" | "allow_recommend" | "remove" | "restore" |
            "ban_user" | "unban_user",
  "releaseId": "uuid",          // Required for content actions
  "targetUserId": "uuid",        // Required for ban actions
  "reason": "string",
  "moderatorNotes": "string",
  "banType": "temporary" | "permanent",
  "expiresAt": "ISO timestamp"   // Required for temporary bans
}
```

**Actions**:
- `flag` - Flag content for team review
- `unflag` - Remove review flag
- `mark_offensive` - Mark as offensive/inappropriate
- `unmark_offensive` - Clear offensive status
- `do_not_recommend` - Exclude from recommendations (low quality)
- `allow_recommend` - Re-enable recommendations
- `remove` - Hide from public (sets status to 'draft')
- `restore` - Restore to public (sets status to 'published')
- `ban_user` - Ban user account (admin only)
- `unban_user` - Unban user account (admin only)

#### `GET /api/admin/moderation`
Fetch moderation history.

**Query Parameters**:
- `releaseId` - Filter by release
- `userId` - Filter by user
- `actionType` - Filter by action type
- `limit` - Number of records (default: 50)

---

### Content Management APIs

#### `GET /api/admin/content`
Fetch content with advanced filtering for moderation.

**Permissions**: community_moderator, admin, super_admin

**Query Parameters**:
```
- status: TEXT ('draft' | 'published' | 'pending_review' | 'approved' | 'rejected')
- flagged: BOOLEAN ('true' | 'false')
- offensive: BOOLEAN ('true' | 'false')
- doNotRecommend: BOOLEAN ('true' | 'false')
- removed: BOOLEAN ('true' | 'false')
- userId: UUID (filter by artist)
- limit: INTEGER (default: 50)
- offset: INTEGER (default: 0)
- sortBy: TEXT (default: 'created_at')
- sortOrder: TEXT ('asc' | 'desc', default: 'desc')
```

**Response**:
```json
{
  "data": [...releases with artist info and moderation counts],
  "count": 25,
  "totalCount": 100,
  "offset": 0,
  "limit": 50
}
```

---

### User Management APIs

#### `GET /api/admin/users`
Fetch users with stats and filtering.

**Permissions**: admin, super_admin

**Query Parameters**:
- `userId` - Fetch specific user with full stats
- `role` - Filter by role
- `banned` - Filter by ban status ('true' | 'false')
- `limit`, `offset` - Pagination

**Single User Response**:
```json
{
  "profile": {...user profile},
  "stats": {
    "total_releases": 10,
    "published_releases": 8,
    "flagged_releases": 1,
    "removed_releases": 1
  },
  "ban": {...active ban info or null},
  "moderationHistory": [...recent actions]
}
```

#### `POST /api/admin/users`
Update user role.

**Request Body**:
```json
{
  "userId": "uuid",
  "role": "user" | "community_moderator" | "admin" | "super_admin"
}
```

---

### Platform Settings APIs

#### `GET /api/admin/settings`
Fetch platform settings.

**Permissions**: admin, super_admin

**Query Parameters**:
- `key` - Fetch specific setting (e.g., 'approval_mode')

**Response**:
```json
{
  "data": {
    "setting_key": "approval_mode",
    "setting_value": {"mode": "auto", "beta_phase": true},
    "description": "Content approval mode...",
    "updated_by": "uuid",
    "updated_at": "2024-01-01T00:00:00Z"
  }
}
```

#### `POST /api/admin/settings`
Update platform settings.

**Request Body**:
```json
{
  "settingKey": "approval_mode",
  "settingValue": {"mode": "manual", "beta_phase": false},
  "description": "Optional description"
}
```

**Approval Mode Values**:
- `{"mode": "auto"}` - Auto-publish all content (beta phase)
- `{"mode": "manual"}` - Manual review required (post-launch)

---

### Automated Verification APIs

#### `POST /api/admin/verify-release`
Run automated verification on a release.

**Request Body**:
```json
{
  "releaseId": "uuid"
}
```

**Process**:
1. Verify GTIN (UPC/EAN) against MusicBrainz
2. Verify each track's ISRC against MusicBrainz
3. Calculate confidence scores based on metadata match
4. Store results in `verification_results` table
5. Determine if should auto-approve (all verified + avg confidence ≥ 80%)

**Response**:
```json
{
  "success": true,
  "releaseId": "uuid",
  "verificationResults": [
    {
      "type": "gtin",
      "verified": true,
      "confidenceScore": 0.95,
      "verificationData": {...},
      "recordId": "uuid"
    },
    {
      "type": "isrc",
      "trackId": "uuid",
      "trackTitle": "Song Name",
      "verified": true,
      "confidenceScore": 0.88,
      "recordId": "uuid"
    }
  ],
  "summary": {
    "totalChecks": 2,
    "passedChecks": 2,
    "averageConfidence": 0.915,
    "shouldAutoApprove": true,
    "processingTimeMs": 1523
  }
}
```

#### `GET /api/admin/verify-release`
Fetch verification results for a release.

**Query Parameters**:
- `releaseId` - Required

---

## Updated Release Submission Flow

### File: `/app/api/music-releases/route.ts`

#### Changes Made:

1. **Ban Check**: Prevents banned users from submitting content
```typescript
const banned = await isUserBanned(supabase, user.id)
if (banned) {
  return NextResponse.json({
    error: 'Your account has been banned and cannot submit content.'
  }, { status: 403 })
}
```

2. **Approval Mode Check**: Retrieves current approval mode from database
```typescript
const approvalMode = await getApprovalMode(supabase)
```

3. **Hybrid Approval Logic**:
```typescript
// When user submits (status = 'pending_review'), check approval mode
let finalStatus = status
if (status === 'pending_review' && approvalMode === 'auto') {
  finalStatus = 'published'  // Auto-approve in beta
}
```

4. **Timestamp Handling**:
```typescript
// Set submitted_at when content is submitted
if ((status === 'pending_review' || finalStatus === 'published') && !releaseData.submitted_at) {
  releaseData.submitted_at = new Date().toISOString()
}

// Set published_at when content goes live
if (finalStatus === 'published' && !releaseData.published_at) {
  releaseData.published_at = new Date().toISOString()
}
```

---

## Row Level Security (RLS) Policies

### Community Moderators Can View All Content
```sql
CREATE POLICY "Community moderators can view all releases" ON music_releases
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_id = auth.uid()
      AND role IN ('community_moderator', 'admin', 'super_admin')
    )
  );
```

### Community Moderators Can Update Moderation Flags
```sql
CREATE POLICY "Moderators can update moderation flags" ON music_releases
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_id = auth.uid()
      AND role IN ('community_moderator', 'admin', 'super_admin')
    )
  );
```

### Only Admins Can Manage Settings and Bans
```sql
CREATE POLICY "Admins can manage settings" ON platform_settings
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_id = auth.uid()
      AND role IN ('admin', 'super_admin')
    )
  );

CREATE POLICY "Admins can manage bans" ON user_bans
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_id = auth.uid()
      AND role IN ('admin', 'super_admin')
    )
  );
```

---

## Helper Functions

### `get_approval_mode()`
Returns current approval mode ('auto' or 'manual').

### `is_user_banned(p_user_id UUID)`
Returns TRUE if user has an active ban.

### `get_user_release_stats(p_user_id UUID)`
Returns release statistics for a user:
- total_releases
- published_releases
- flagged_releases
- removed_releases

### `get_admin_dashboard_stats()` (updated)
Returns enhanced dashboard statistics:
- pending_count
- approved_this_week
- rejected_this_week
- published_count
- **flagged_count** (new)
- **offensive_count** (new)
- **banned_users_count** (new)
- **total_releases** (new)
- **total_tracks** (new)

---

## Deployment Steps

### 1. Run Database Migration
```bash
# Via Supabase Dashboard: SQL Editor
# Paste contents of: database/migrations/046_hybrid_approval_system.sql

# OR via psql (if you have direct access)
psql -d your_database -f database/migrations/046_hybrid_approval_system.sql
```

### 2. Verify Migration
```sql
-- Check new tables exist
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN ('platform_settings', 'user_bans', 'verification_results', 'moderation_actions')
ORDER BY table_name;

-- Verify approval mode setting
SELECT * FROM platform_settings WHERE setting_key = 'approval_mode';

-- Check role constraint updated
SELECT constraint_name, check_clause
FROM information_schema.check_constraints
WHERE constraint_name = 'user_profiles_role_check';
```

### 3. Test Approval Mode
```sql
-- Verify default is 'auto'
SELECT get_approval_mode();
-- Should return: 'auto'

-- Test switching to manual
UPDATE platform_settings
SET setting_value = '{"mode": "manual", "beta_phase": false}'::JSONB
WHERE setting_key = 'approval_mode';

-- Verify
SELECT get_approval_mode();
-- Should return: 'manual'
```

### 4. Create Admin/Moderator Accounts
```sql
-- Make a user an admin
UPDATE user_profiles
SET role = 'admin'
WHERE user_id = 'your-user-uuid';

-- Make a user a community moderator
UPDATE user_profiles
SET role = 'community_moderator'
WHERE user_id = 'moderator-user-uuid';
```

---

## Testing Checklist

### Phase 1 (Auto-Approval) Testing

- [ ] Artist submits release → Content goes live immediately
- [ ] Check `status` = 'published' and `published_at` is set
- [ ] Community moderator can view all releases
- [ ] Community moderator can flag content
- [ ] Community moderator can mark as offensive
- [ ] Community moderator can set "do not recommend"
- [ ] Community moderator **cannot** ban users (should get 403)
- [ ] Admin can ban user
- [ ] Banned user cannot submit new content
- [ ] Moderation actions are logged in `moderation_actions` table

### Phase 2 (Automated Verification) Testing

- [ ] Toggle approval mode to 'manual' via settings API
- [ ] Artist submits release → Status stays 'pending_review'
- [ ] Run automated verification on release with valid ISRC
- [ ] Verify results stored in `verification_results` table
- [ ] Check confidence scores calculated correctly
- [ ] Verify with invalid ISRC → verified = false
- [ ] Toggle back to 'auto' mode
- [ ] Verify new submissions auto-publish again

---

## Role Permissions Summary

| Action | User | Community Moderator | Admin | Super Admin |
|--------|------|---------------------|-------|-------------|
| Submit content | ✅ | ✅ | ✅ | ✅ |
| View own content | ✅ | ✅ | ✅ | ✅ |
| View all content | ❌ | ✅ | ✅ | ✅ |
| Flag content | ❌ | ✅ | ✅ | ✅ |
| Mark offensive | ❌ | ✅ | ✅ | ✅ |
| Do not recommend | ❌ | ✅ | ✅ | ✅ |
| Remove content | ❌ | ✅ | ✅ | ✅ |
| Ban users | ❌ | ❌ | ✅ | ✅ |
| Change roles | ❌ | ❌ | ✅ | ✅ |
| Modify settings | ❌ | ❌ | ✅ | ✅ |

---

## Next Steps (UI Implementation)

### Admin Dashboard Pages to Create:

1. **Settings Page** (`/app/admin/settings/page.tsx`)
   - Toggle approval mode (auto/manual)
   - Configure moderation settings
   - View system status

2. **Content Moderation Page** (`/app/admin/content/page.tsx`)
   - Filter by flagged, offensive, do-not-recommend
   - Bulk moderation actions
   - Review queue with sorting

3. **User Management Page** (`/app/admin/users/page.tsx`)
   - List all users with stats
   - Ban/unban users
   - Assign moderator roles
   - View user activity

4. **Verification Dashboard** (`/app/admin/verification/page.tsx`)
   - Run bulk verification
   - View verification results
   - Override verification decisions

---

## Monitoring & Analytics

### Key Metrics to Track:

1. **Auto-Approval Rate**: % of content auto-published
2. **Moderation Actions**: Count by type and moderator
3. **Flagged Content**: Trends over time
4. **Ban Rate**: Users banned per week
5. **Verification Success Rate**: % of content passing automated checks
6. **Confidence Scores**: Average confidence of verified content

### Queries:

```sql
-- Moderation activity this week
SELECT action_type, COUNT(*) as count
FROM moderation_actions
WHERE action_taken_at >= NOW() - INTERVAL '7 days'
GROUP BY action_type
ORDER BY count DESC;

-- Flagged content summary
SELECT
  COUNT(*) FILTER (WHERE flagged_for_review) as flagged,
  COUNT(*) FILTER (WHERE is_offensive) as offensive,
  COUNT(*) FILTER (WHERE do_not_recommend) as do_not_recommend,
  COUNT(*) FILTER (WHERE removed_at IS NOT NULL) as removed
FROM music_releases
WHERE status = 'published';

-- Active bans
SELECT ban_type, COUNT(*) as count
FROM user_bans
WHERE is_active = TRUE
GROUP BY ban_type;
```

---

## Support & Maintenance

### Common Issues:

**Q: Content not auto-publishing in beta mode**
- Check `SELECT get_approval_mode();` returns 'auto'
- Verify migration ran successfully
- Check user is not banned

**Q: Moderator cannot flag content**
- Verify user has 'community_moderator', 'admin', or 'super_admin' role
- Check RLS policies are enabled

**Q: Verification always fails**
- Check ISRC/GTIN format is valid
- Verify MusicBrainz API is accessible
- Check `verification_results` for error messages

---

## File Summary

### Database
- `/database/migrations/046_hybrid_approval_system.sql` - Schema changes

### API Routes
- `/app/api/music-releases/route.ts` - Updated submission flow (MODIFIED)
- `/app/api/admin/moderation/route.ts` - Moderation actions (NEW)
- `/app/api/admin/content/route.ts` - Content filtering (NEW)
- `/app/api/admin/users/route.ts` - User management (NEW)
- `/app/api/admin/settings/route.ts` - Platform settings (NEW)
- `/app/api/admin/verify-release/route.ts` - Automated verification (NEW)

### Existing APIs (Leveraged)
- `/app/api/isrc-lookup/route.ts` - ISRC verification
- `/app/api/gtin-lookup/route.ts` - GTIN/UPC/EAN verification

---

**Implementation Date**: February 2, 2026
**Status**: ✅ Backend Complete - UI Pages Pending
**Version**: 1.0.0

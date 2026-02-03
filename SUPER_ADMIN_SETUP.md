# Super Admin Dashboard - Setup & Usage Guide

## Overview

The Super Admin Dashboard allows authorized administrators to review and approve music releases before they go live on Gigrilla. This ensures quality control and compliance with platform guidelines.

## Features

- **Dashboard Overview**: View pending, approved, rejected, and published release statistics
- **Release Queue**: See all releases pending review in chronological order
- **Detailed Review**: Inspect all release metadata, artwork, rights, and royalty information
- **Approval Workflow**: Approve, reject, or request changes with detailed feedback
- **Email Notifications**: Artists receive automated emails about review decisions
- **Audit Trail**: All review actions are logged with timestamps and reviewer information

## Setup Instructions

### 1. Run the Database Migration

First, apply the admin roles migration to your database:

```bash
# Option 1: Via Supabase Dashboard
# Go to: https://supabase.com/dashboard/project/YOUR_PROJECT/sql
# Copy and paste the contents of: database/migrations/045_add_admin_roles.sql
# Click "Run"

# Option 2: Via Supabase CLI (if you have it set up)
supabase db push
```

### 2. Make a User an Admin

Use the provided script to grant admin privileges:

```bash
# Make yourself a super admin
node scripts/make-admin.js edison@gigrilla.com super_admin

# Make someone else an admin
node scripts/make-admin.js another-user@example.com admin
```

**Role Levels:**
- `user` - Regular user (default)
- `admin` - Can review releases
- `super_admin` - Full admin access

### 3. Access the Admin Dashboard

Once you're an admin, navigate to:
```
https://your-domain.com/admin
```

## Release Review Workflow

### Artist Submission Flow

1. Artist fills out all release details in the Music Manager
2. Artist uploads tracks, artwork, and metadata
3. Artist agrees to T&Cs and digitally signs
4. Artist clicks **"Submit Release"**
5. Release status changes: `draft` → `pending_review`
6. Admin receives notification (dashboard shows pending count)

### Admin Review Process

1. **View Pending Releases**
   - Go to `/admin`
   - See list of all pending releases
   - Releases are sorted by submission date

2. **Review Release Details**
   - Click "Review" on any pending release
   - Inspect all metadata:
     - Cover artwork
     - GTIN (UPC/EAN)
     - Release title, type, track count
     - Geographical availability
     - Go-live date
     - Master & publishing rights
     - Distributor, PRO, MCS information

3. **Make a Decision**

   **Option A: Approve**
   - Release meets all requirements
   - Status changes: `pending_review` → `approved`
   - Artist receives approval email
   - Release is ready to publish

   **Option B: Reject**
   - Release has serious issues
   - Must provide rejection reason
   - Status changes: `pending_review` → `rejected`
   - Artist receives rejection email with reason
   - Artist must fix issues and resubmit

   **Option C: Request Changes**
   - Minor fixes needed
   - Specify what changes are required
   - Status changes: `pending_review` → `draft`
   - Artist receives email with change requests
   - Artist can make edits and resubmit

4. **Add Notes** (optional)
   - Internal admin notes for reference
   - Not visible to artist
   - Helps track decision reasoning

### Email Notifications

Artists automatically receive emails for:
- ✅ **Approved**: "Your release has been approved!"
- ❌ **Rejected**: "Update required for [Release Title]"
- ⚠️ **Changes Requested**: "Changes requested for [Release Title]"

All emails include:
- Release title
- Admin feedback/reason
- Link to artist dashboard
- Next steps

## API Endpoints

### GET `/api/admin/stats`
Fetch admin dashboard statistics

**Response:**
```json
{
  "success": true,
  "stats": {
    "pending_count": 5,
    "approved_this_week": 12,
    "rejected_this_week": 2,
    "published_count": 150
  },
  "recentReviews": [...]
}
```

### GET `/api/admin/releases/pending`
Fetch all pending releases

**Query Parameters:**
- `status` - Filter by status (default: `pending_review`)

**Response:**
```json
{
  "success": true,
  "data": [...],
  "count": 5
}
```

### POST `/api/admin/releases/review`
Approve, reject, or request changes

**Request Body:**
```json
{
  "releaseId": "uuid",
  "action": "approve|reject|request_changes",
  "adminNotes": "Optional internal notes",
  "rejectionReason": "Required if action=reject",
  "changesRequested": "Required if action=request_changes"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Release approved successfully",
  "data": {
    "releaseId": "uuid",
    "previousStatus": "pending_review",
    "newStatus": "approved",
    "action": "approve"
  }
}
```

## Database Tables

### `user_profiles.role`
Stores user role: `user`, `admin`, or `super_admin`

### `music_release_reviews`
Audit trail of all review actions:
- `release_id` - Which release was reviewed
- `reviewer_id` - Who reviewed it
- `previous_status` - Status before review
- `new_status` - Status after review
- `action` - What action was taken
- `admin_notes` - Internal notes
- `rejection_reason` - Why it was rejected
- `changes_requested` - What changes were requested
- `reviewed_at` - When the review happened

### `music_releases` (added columns)
- `submitted_at` - When artist submitted for review
- `reviewed_at` - When admin reviewed
- `reviewed_by` - Which admin reviewed
- `rejection_reason` - Stored rejection reason
- `admin_notes` - Stored admin notes

## Security

- All admin endpoints check user role before allowing access
- Non-admin users receive `403 Forbidden` if they try to access admin routes
- Regular users can only see their own releases
- Admins can see all releases for review purposes
- All review actions are logged with reviewer ID and timestamp

## Troubleshooting

### "Forbidden - Admin access required"
- Your user account doesn't have admin privileges
- Run: `node scripts/make-admin.js your-email@example.com super_admin`

### Admin dashboard shows no pending releases
- Artists haven't submitted any releases yet
- All releases have already been reviewed
- Check database: `SELECT * FROM music_releases WHERE status = 'pending_review'`

### Email notifications not sending
- Check `RESEND_API_KEY` in `.env.local`
- Check `RESEND_FROM_EMAIL` is verified
- Review logs for email errors (errors don't block review, they just log)

## Development

To test the admin system locally:

1. Create a test user account
2. Make yourself admin:
   ```bash
   node scripts/make-admin.js test@example.com super_admin
   ```
3. Create a test release in the Music Manager
4. Submit it for review
5. Access `/admin` to review it

## Production Deployment

Before deploying to production:

1. ✅ Run migration 045
2. ✅ Set up admin users
3. ✅ Configure Resend email
4. ✅ Test the complete review workflow
5. ✅ Document your internal review guidelines
6. ✅ Train admin team on review process

---

## Need Help?

If you encounter issues:
1. Check the browser console for errors
2. Check server logs for API errors
3. Verify database migration was applied
4. Confirm user has admin role in database
5. Test with a fresh release submission

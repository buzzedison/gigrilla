# Testing Artist Types - Step by Step Guide

## Setup

1. **Start the development server:**
```bash
npm run dev
```

2. **Clear your browser data** (to start fresh):
   - Clear cookies and local storage for localhost:3000
   - Or use an incognito/private window

## Test Process

### For Each Artist Type (1-8):

1. Go to `http://localhost:3000/signup?onboarding=artist`
2. Create a new account or login
3. Select "Artist" as member type
4. Choose the specific Artist Type you want to test
5. Fill out the form and verify the sections that appear/disappear

---

## Type 1: Live Gig & Original Recording Artist

### ✅ Should SEE:
- Artist Details (stage name, base location, performing members)
- **Public Gigs Performed** field
- **Professional IDs Section**:
  - Performer ISNI (required *)
  - Creator IPI/CAE (required *)
- **Contract Status Section** with ALL four options:
  - Record Label Status
  - Music Publisher Status
  - Artist Manager Status
  - Booking Agent Status
- Social media URLs
- Team members management
- Income splits

### ❌ Should NOT SEE:
- Recording Session Gigs field
- Vocal descriptors
- Instrument selection
- Songwriter/Lyricist/Composer genre options

---

## Type 2: Original Recording Artist

### ✅ Should SEE:
- Artist Details
- **Professional IDs Section**:
  - Performer ISNI (required *)
  - Creator IPI/CAE (required *)
- **Contract Status Section** with THREE options:
  - Record Label Status
  - Music Publisher Status
  - Artist Manager Status
- Social media URLs
- Team members management

### ❌ Should NOT SEE:
- **Booking Agent Status** (they don't perform live)
- Public Gigs Performed field
- Recording Session Gigs field
- Set lengths, gig pricing

---

## Type 3: Live Gig Artist (Cover/Tribute/Classical)

### ✅ Should SEE:
- Artist Details
- **Public Gigs Performed** field
- **Professional IDs Section**:
  - Performer ISNI (required *)
  - NO Creator IPI/CAE (they don't create original works)
- **Contract Status Section** with TWO options:
  - Artist Manager Status
  - Booking Agent Status
- Social media URLs
- Team members management

### ❌ Should NOT SEE:
- Record Label Status
- Music Publisher Status
- Creator IPI/CAE field
- Recording Session Gigs field

---

## Type 4: Vocalist for Hire

### ✅ Should SEE:
- Artist Details (but simplified - no performing members count)
- **Public Gigs Performed** field
- **Recording Session Gigs** field
- **Professional IDs Section**:
  - Performer ISNI (required *)
  - Creator IPI/CAE (optional - some vocalists write)
- **Contract Status Section** with TWO options:
  - Artist Manager Status
  - Booking Agent Status
- Vocal sound descriptors selection
- Vocal genre styles selection
- Availability options
- Social media URLs

### ❌ Should NOT SEE:
- Record Label Status
- Music Publisher Status
- Team members management
- Income splits

---

## Type 5: Instrumentalist for Hire

### ✅ Should SEE:
- Artist Details (simplified)
- **Public Gigs Performed** field
- **Recording Session Gigs** field
- **Professional IDs Section**:
  - Performer ISNI (required *)
  - Creator IPI/CAE (optional - some instrumentalists compose)
- **Contract Status Section** with TWO options:
  - Artist Manager Status
  - Booking Agent Status
- Instrument category selection
- Instrument selection
- Availability options
- Social media URLs

### ❌ Should NOT SEE:
- Record Label Status
- Music Publisher Status
- Team members management
- Income splits

---

## Type 6: Songwriter for Hire

### ✅ Should SEE:
- Artist Details (simplified)
- **Professional IDs Section**:
  - Performer ISNI (required *)
  - Creator IPI/CAE (required *)
- **Contract Status Section** with TWO options:
  - Music Publisher Status
  - Artist Manager Status
- Songwriter genre options
- Availability options
- Social media URLs

### ❌ Should NOT SEE:
- Record Label Status
- Booking Agent Status
- Public Gigs Performed field
- Recording Session Gigs field
- Team members management
- Live gig features

---

## Type 7: Lyricist for Hire

### ✅ Should SEE:
- Artist Details (simplified)
- **Professional IDs Section**:
  - Performer ISNI (required *)
  - Creator IPI/CAE (required *)
- **Contract Status Section** with TWO options:
  - Music Publisher Status
  - Artist Manager Status
- Lyricist genre options
- Availability options
- Social media URLs

### ❌ Should NOT SEE:
- Record Label Status
- Booking Agent Status
- Public Gigs Performed field
- Recording Session Gigs field
- Team members management
- Live gig features

---

## Type 8: Composer for Hire

### ✅ Should SEE:
- Artist Details (simplified)
- **Professional IDs Section**:
  - Performer ISNI (required *)
  - Creator IPI/CAE (required *)
- **Contract Status Section** with TWO options:
  - Music Publisher Status
  - Artist Manager Status
- Composer genre options
- Availability options
- Social media URLs

### ❌ Should NOT SEE:
- Record Label Status
- Booking Agent Status
- Public Gigs Performed field
- Recording Session Gigs field
- Team members management
- Live gig features

---

## Quick Test Commands

### Option 1: Manual Browser Testing
```bash
npm run dev
# Open: http://localhost:3000/signup?onboarding=artist
```

### Option 2: Check Browser Console
Open DevTools Console and you should see:
- Capabilities object being created when you select an artist type
- Log messages showing which sections are rendered

### Option 3: Test Database
After completing a registration, check the database:
```bash
# Connect to Supabase studio or run SQL query
SELECT
  stage_name,
  artist_type_id,
  performer_isni,
  creator_ipi_cae,
  recording_session_gigs,
  gigs_performed,
  record_label_status,
  music_publisher_status,
  booking_agent_status
FROM user_profiles
WHERE profile_type = 'artist'
ORDER BY created_at DESC
LIMIT 5;
```

---

## Verification Checklist

For each type, verify:

- [ ] Artist type selection works
- [ ] Correct Professional ID fields appear (required vs optional)
- [ ] Correct Contract Status options appear
- [ ] Gig tracking fields appear correctly
- [ ] Type-specific fields appear (vocals, instruments, genres)
- [ ] Form submission works
- [ ] Data saves correctly to database
- [ ] Redirects to artist dashboard after completion

---

## Common Issues & Fixes

### Issue: All sections showing regardless of type
**Fix:** Check browser console for errors. Make sure `artistCapabilities` is not null.

### Issue: Professional IDs section not appearing
**Fix:** Check that you selected an artist type. The section only appears after type selection.

### Issue: Contract Status completely hidden
**Fix:** This is correct for some types! Type 4 & 5 only show Manager and Booking Agent.

### Issue: Database migration errors
**Fix:** The migration was already pushed. Check Supabase logs for any column errors.

---

## Debug Mode

Add this to see capabilities in real-time:

In SignUpWizard.tsx, add after the capabilities memo:
```tsx
useEffect(() => {
  if (artistCapabilities) {
    console.log('🎯 Artist Type Capabilities:', artistCapabilities);
  }
}, [artistCapabilities]);
```

Then check browser console when selecting artist types.

---

## Success Criteria

✅ Each artist type shows only its relevant sections
✅ Required fields are marked with red asterisk (*)
✅ Optional fields show "(Optional)" label
✅ Form submission succeeds for all 8 types
✅ Database contains correct values for each type
✅ No console errors during navigation
✅ Conditional sections appear/disappear smoothly

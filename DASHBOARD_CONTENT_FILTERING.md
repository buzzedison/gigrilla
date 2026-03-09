# Dashboard Content Filtering by Artist Type

**Date:** 2026-03-09
**Status:** ✅ Completed

## Overview

Fixed artist dashboard to conditionally render sections based on artist type capabilities. Type 3 (Live Gig Artist) and Types 4-8 (For Hire artists) were incorrectly showing music upload/management sections, which should only be available to Types 1 and 2.

---

## Problem Statement

### Before
- **Music sections visible to all types**: Type 3 (Live gig only) and Types 4-8 (For hire) could see Music Manager sections
- **Inconsistent UX**: Gig sections properly gated by `showGigAbility`, but music sections had no capability checks
- **Confusing navigation**: Artists saw sections they couldn't use based on their type

### After
- ✅ **Music sections conditionally rendered**: Only Types 1 & 2 see Music Manager
- ✅ **Consistent UX**: Both gig and music sections use same gating pattern
- ✅ **Clear messaging**: Artists see helpful message when sections are unavailable
- ✅ **Navigation updated**: Sidebar hides disabled sections

---

## Artist Type Music Capabilities

| Type | Name | Can Upload Music | Can See Music Manager |
|------|------|------------------|----------------------|
| 1 | Live Gig & Original Recording Artist | ✅ Yes | ✅ Yes |
| 2 | Original Recording Artist | ✅ Yes | ✅ Yes |
| 3 | Live Gig Artist (Cover/Tribute/Classical) | ❌ No | ❌ No |
| 4 | Vocalist for Hire | ❌ No | ❌ No |
| 5 | Instrumentalist for Hire | ❌ No | ❌ No |
| 6 | Songwriter for Hire | ❌ No | ❌ No |
| 7 | Lyricist for Hire | ❌ No | ❌ No |
| 8 | Composer for Hire | ❌ No | ❌ No |

---

## Changes Made

### 1. ✅ Dashboard Page - Section Enablement Check

**File:** `app/artist-dashboard/page.tsx`

**Change A: Updated `sectionIsEnabled()` function (Lines 323-344)**

```typescript
// BEFORE
const sectionIsEnabled = (section: DashboardSection) => {
  if (!capabilities) {
    return true
  }

  switch (section) {
    case 'gigability':
    case 'gig-calendar':
    // ... gig sections
      return capabilities.showGigAbility
    default:
      return true  // ❌ All other sections always enabled
  }
}

// AFTER
const sectionIsEnabled = (section: DashboardSection) => {
  if (!capabilities) {
    return true
  }

  switch (section) {
    case 'gigability':
    case 'gig-calendar':
    // ... gig sections
      return capabilities.showGigAbility
    case 'music-upload':
    case 'music-manage':
      return capabilities.canUploadMusic  // ✅ Check music capability
    default:
      return true
  }
}
```

**Impact:**
- Music sections now respect `capabilities.canUploadMusic`
- Types 3-8 will have `sectionIsEnabled()` return `false` for music sections

---

**Change B: Updated `renderGuardedSection()` messages (Lines 363-380)**

```typescript
// BEFORE
const renderGuardedSection = (section: DashboardSection, content: React.ReactNode) => {
  if (sectionIsEnabled(section)) {
    return content
  }

  const message = ['gigability', 'gig-calendar', ...].includes(section)
    ? 'Gig Manager is hidden for your current artist type...'
    : 'This section is not available for your current artist type.'  // ❌ Generic message

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <Info className="w-5 h-5 text-purple-600" />
      <p>{message}</p>
    </div>
  )
}

// AFTER
const renderGuardedSection = (section: DashboardSection, content: React.ReactNode) => {
  if (sectionIsEnabled(section)) {
    return content
  }

  let message = 'This section is not available for your current artist type.'

  if (['gigability', 'gig-calendar', ...].includes(section)) {
    message = 'Gig Manager is hidden for your current artist type. Change your artist type to enable gig operations.'
  } else if (['music-upload', 'music-manage'].includes(section)) {
    message = 'Music Manager is hidden for your current artist type. Change your artist type to enable music upload and management.'  // ✅ Specific music message
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <Info className="w-5 h-5 text-purple-600" />
      <p>{message}</p>
    </div>
  )
}
```

**Impact:**
- Clear, specific messaging for why music sections are unavailable
- Guides users to change artist type if needed

---

**Change C: Wrapped music sections with `renderGuardedSection()` (Lines 578-599)**

```typescript
// BEFORE
case 'music-upload':
  return (
    <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
      <div className="xl:col-span-3">
        <ArtistMusicManager defaultView="upload" />  // ❌ Always renders
      </div>
      // ...
    </div>
  )

// AFTER
case 'music-upload':
  return renderGuardedSection('music-upload', (
    <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
      <div className="xl:col-span-3">
        <ArtistMusicManager defaultView="upload" />  // ✅ Only renders if enabled
      </div>
      // ...
    </div>
  ))
```

**Same pattern applied to `music-manage` section.**

**Impact:**
- Music sections now use same guarding pattern as gig sections
- Disabled sections show helpful message instead of empty content

---

### 2. ✅ Sidebar Navigation - Hide Disabled Sections

**File:** `app/artist-dashboard/components/ArtistSidebar.tsx`

**Change: Updated `isSectionEnabled()` function (Lines 77-100)**

```typescript
// BEFORE
function isSectionEnabled(section: ArtistDashboardSection, capabilities: ...) {
  // ... type and capability checks

  switch (section) {
    case 'gigability':
    case 'gig-calendar':
    // ... gig sections
      return capabilities.showGigAbility
    default:
      return true  // ❌ All other sections always visible in sidebar
  }
}

// AFTER
function isSectionEnabled(section: ArtistDashboardSection, capabilities: ...) {
  // ... type and capability checks

  switch (section) {
    case 'gigability':
    case 'gig-calendar':
    // ... gig sections
      return capabilities.showGigAbility
    case 'music-upload':
    case 'music-manage':
      return capabilities.canUploadMusic  // ✅ Check music capability
    default:
      return true
  }
}
```

**Impact:**
- Music Manager sections hidden in sidebar for Types 3-8
- Navigation items grayed out and disabled when capability missing
- Consistent behavior between dashboard content and sidebar navigation

---

## User Experience Improvements

### Before → After

| Scenario | Old Behavior | New Behavior |
|----------|--------------|--------------|
| **Type 3 artist views dashboard** | ✅ Sees Music Manager sections in sidebar | ❌ Music Manager sections hidden |
| **Type 3 artist clicks Music Upload** | ✅ Can navigate to empty/broken section | ❌ Section not in navigation |
| **Type 4-8 artist views Music sections** | ✅ Sees sections they can't use | ❌ Sections hidden from navigation |
| **Type 1-2 artist views Music sections** | ✅ Can access Music Manager | ✅ Can access Music Manager (no change) |
| **Type 3 uses direct URL to music section** | ❌ Would show empty content | ✅ Shows helpful message explaining why unavailable |

---

## Real-World Use Cases

### Example 1: Type 3 - Cover Band

**Before:**
- Artist selects "Live Gig Artist (Cover/Tribute/Classical)"
- Sees "Music Manager" section in sidebar
- Clicks "Upload Music" → confusion (they can't upload covers for distribution)
- ❌ Frustrating UX

**After:**
- Artist selects "Live Gig Artist (Cover/Tribute/Classical)"
- Music Manager section NOT shown in sidebar
- Clean navigation showing only relevant sections
- ✅ Clear, focused dashboard

---

### Example 2: Type 5 - Session Guitarist

**Before:**
- Artist selects "Instrumentalist for Hire"
- Sees Music Manager sections
- Attempts to upload music → confusion (they're for hire, not releasing music)
- ❌ Misleading interface

**After:**
- Artist selects "Instrumentalist for Hire"
- Music Manager hidden
- Sees Gig Manager, Auditions, etc. (relevant sections)
- ✅ Streamlined experience

---

### Example 3: Type 1 - Singer-Songwriter

**Before:**
- Artist selects "Live Gig & Original Recording Artist"
- Sees both Gig Manager AND Music Manager
- ✅ Correct sections visible

**After:**
- Artist selects "Live Gig & Original Recording Artist"
- Sees both Gig Manager AND Music Manager
- ✅ No change (still works correctly)

---

## Technical Implementation

### Capability System

**Source:** `lib/artist-type-config.ts`

```typescript
export interface ArtistTypeCapabilities {
  canUploadMusic: boolean;
  // ... other capabilities
}

export const ARTIST_TYPE_CAPABILITIES: Record<number, ArtistTypeCapabilities> = {
  1: { canUploadMusic: true, ... },   // Live Gig & Original Recording
  2: { canUploadMusic: true, ... },   // Original Recording
  3: { canUploadMusic: false, ... },  // Live Gig (Cover/Tribute)
  4: { canUploadMusic: false, ... },  // Vocalist for Hire
  5: { canUploadMusic: false, ... },  // Instrumentalist for Hire
  6: { canUploadMusic: false, ... },  // Songwriter for Hire
  7: { canUploadMusic: false, ... },  // Lyricist for Hire
  8: { canUploadMusic: false, ... },  // Composer for Hire
}
```

---

### Capability Check Flow

1. **User selects artist type** → Saves to `user_profiles.artist_type_id`
2. **Dashboard loads** → Fetches artist type → Gets capabilities via `getArtistTypeConfig()`
3. **Capabilities stored in state** → `capabilities` state variable
4. **Sections check capability** → `sectionIsEnabled('music-upload')` → `capabilities.canUploadMusic`
5. **Rendering decision:**
   - If `true` → Render `<ArtistMusicManager />` component
   - If `false` → Render info box with explanation
6. **Sidebar checks capability** → `isSectionEnabled('music-upload', capabilities)` → Hides nav item

---

## Section Guard Pattern

The `renderGuardedSection()` pattern provides consistent behavior:

```typescript
// In renderContent() switch statement
case 'music-upload':
  return renderGuardedSection('music-upload', (
    <ComponentToRender />
  ))

// renderGuardedSection() checks capability and either:
// 1. Returns the component if enabled
// 2. Returns info message if disabled
```

**Used for:**
- All gig sections (gigability, gig-calendar, gig-create, gig-upcoming, gig-past, gig-invites, gig-requests)
- All music sections (music-upload, music-manage)

**Not used for:**
- Core sections always available (profile, payments, crew, auditions, etc.)
- Type selection (users can always change their type)

---

## Testing Checklist

### ✅ Type 1 & 2 (Can Upload Music)
- [ ] Music Manager sections visible in sidebar
- [ ] "Upload Music" section renders `<ArtistMusicManager defaultView="upload" />`
- [ ] "Manage Music" section renders `<ArtistMusicManager defaultView="manage" />`
- [ ] Navigation to music sections works correctly

### ✅ Type 3-8 (Cannot Upload Music)
- [ ] Music Manager sections NOT visible in sidebar
- [ ] Direct URL to `/artist-dashboard?section=music-upload` shows info message
- [ ] Info message: "Music Manager is hidden for your current artist type..."
- [ ] Users can navigate to other enabled sections normally

### ✅ Capability State Management
- [ ] Switching from Type 1 to Type 3 hides Music Manager
- [ ] Switching from Type 3 to Type 1 shows Music Manager
- [ ] Capabilities load correctly on page refresh
- [ ] Sidebar and dashboard stay in sync

---

## Files Modified

1. ✅ `app/artist-dashboard/page.tsx`
   - Updated `sectionIsEnabled()` to check `capabilities.canUploadMusic` for music sections
   - Updated `renderGuardedSection()` to show specific message for music sections
   - Wrapped `music-upload` case with `renderGuardedSection()`
   - Wrapped `music-manage` case with `renderGuardedSection()`

2. ✅ `app/artist-dashboard/components/ArtistSidebar.tsx`
   - Updated `isSectionEnabled()` to check `capabilities.canUploadMusic` for music sections
   - Navigation items automatically disabled when capability is false

3. ✅ `DASHBOARD_CONTENT_FILTERING.md` (this document)

---

## Database Impact

**No database changes required.**

Existing schema already stores `artist_type_id`:
```sql
-- In user_profiles table
artist_type_id INTEGER REFERENCES artist_types(id)
```

Capabilities are derived from `artist_type_id` at runtime via `getArtistTypeConfig()`.

---

## Benefits Summary

### For Artists
- ✅ **Clearer interface**: Only see sections relevant to their type
- ✅ **Less confusion**: No misleading sections that don't apply to them
- ✅ **Guided experience**: Clear messages explain why sections are unavailable
- ✅ **Flexibility**: Can change artist type anytime to unlock different features

### For Platform
- ✅ **Consistent UX**: Same gating pattern for gig and music sections
- ✅ **Maintainable**: Single source of truth for capabilities
- ✅ **Type-safe**: TypeScript ensures correct capability checks
- ✅ **Future-proof**: Easy to add new capability-gated sections

---

## Future Enhancements

### Potential Improvements
1. **Capability tooltips**: Add hover tooltips explaining why certain types have/don't have capabilities
2. **Feature comparison**: Show matrix comparing all 8 artist types and their capabilities
3. **Smart recommendations**: "Based on your needs, we recommend Type X"
4. **Preview mode**: Let users preview dashboard for different types before committing

---

## Rationale: Why Hide Sections vs. Disable?

### Considered Approaches

**Option 1: Show sections but disable functionality**
- ❌ Clutters interface
- ❌ Frustrating to see features you can't use
- ❌ Requires disabling buttons/forms within sections

**Option 2: Hide sections entirely** ✅ **CHOSEN**
- ✅ Clean, focused interface
- ✅ No confusion about available features
- ✅ Easier to maintain (no partial-disabled states)

**Option 3: Show sections with upgrade prompts**
- ❌ Misleading (changing type isn't really an "upgrade")
- ❌ Encourages users to pick wrong type for their needs

---

## Conclusion

✅ **Music sections now conditionally render based on artist type**
✅ **Only Types 1 & 2 see Music Manager sections**
✅ **Types 3-8 see clean dashboard with relevant sections only**
✅ **Consistent UX pattern for capability-gated features**
✅ **Clear messaging when sections are unavailable**

The dashboard now accurately reflects each artist type's capabilities, providing a focused, intuitive experience for all users.

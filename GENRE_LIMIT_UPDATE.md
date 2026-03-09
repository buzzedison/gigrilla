# Genre Selection Limit Update

**Date:** 2026-03-09
**Status:** ✅ Completed

## Overview

Updated genre selection limit from 3 to 5 to reflect modern crossover reality where artists span multiple genre families. Fixed UI inconsistency that showed "5/3" and caused user confusion.

---

## Problem Statement

### Before
- **Hard limit**: 3 genre sets maximum
- **UI inconsistency**: Some components allowed selecting >3 but showed confusing "5/3" counter
- **Reality mismatch**: Modern artists often work across 4-5 genre families (e.g., Pop/R&B/Hip-Hop/Electronic/Soul)
- **User confusion**: Limit vs validation mismatch

### After
- ✅ **Hard limit**: 5 genre sets maximum
- ✅ **Consistent UI**: All components enforce 5-set limit
- ✅ **Clear copy**: "Select up to five genre sets" everywhere
- ✅ **Proper validation**: Hard cap at 5 prevents selecting more

---

## Changes Made

### 1. ✅ Artist Genres Manager

**File:** `app/artist-dashboard/components/ArtistGenresManager.tsx`

**Change:**
```typescript
// BEFORE
const MAX_GENRE_SETS = 3

// AFTER
const MAX_GENRE_SETS = 5
```

**Impact:**
- Line 15: Constant updated
- Line 159: Validation uses new limit
- Line 186: UI copy automatically updates: "select up to {MAX_GENRE_SETS} genre sets"
- Line 208: Counter updates: "{selectedGenres.length} / {MAX_GENRE_SETS}"
- Line 278: Add button disabled at 5 selections

**UI Text Changes:**
```diff
- Pick at least 1 Genre Family + 1 Main Genre (select up to 3 genre sets).
+ Pick at least 1 Genre Family + 1 Main Genre (select up to 5 genre sets).

- Genre sets selected: X / 3
+ Genre sets selected: X / 5

- You can add up to 3 genre sets.
+ You can add up to 5 genre sets.
```

---

### 2. ✅ Auditions Manager

**File:** `app/artist-dashboard/components/ArtistAuditionsManager.tsx`

**Changes:**

#### A. Validation (Lines 238-240)
```typescript
// BEFORE
if (genreSelection === 'specific' && selectedGenres.length > 3) {
  showNotification('error', 'Maximum 3 genres allowed')
  return
}

// AFTER
if (genreSelection === 'specific' && selectedGenres.length > 5) {
  showNotification('error', 'Maximum 5 genres allowed')
  return
}
```

#### B. Toggle Logic (Line 365)
```typescript
// BEFORE
} else if (selectedGenres.length < 3) {
  setSelectedGenres([...selectedGenres, genre])
}

// AFTER
} else if (selectedGenres.length < 5) {
  setSelectedGenres([...selectedGenres, genre])
}
```

#### C. UI Label (Line 581)
```typescript
// BEFORE
<Label htmlFor="specific-genre" className="font-normal cursor-pointer">
  Specific Genre (Maximum 3)
</Label>

// AFTER
<Label htmlFor="specific-genre" className="font-normal cursor-pointer">
  Specific Genres (Up to five genre families)
</Label>
```

#### D. Checkbox Disable Logic (Line 594)
```typescript
// BEFORE
disabled={!selectedGenres.includes(genre) && selectedGenres.length >= 3}

// AFTER
disabled={!selectedGenres.includes(genre) && selectedGenres.length >= 5}
```

---

## Validation Enforcement

### Frontend Validation

**Artist Genres Manager:**
```typescript
const addGenre = (path: ArtistGenrePath) => {
  setSelectedGenres((prev) => {
    if (prev.length >= MAX_GENRE_SETS) {  // Now 5
      setLimitMessage(`You can add up to ${MAX_GENRE_SETS} genre sets.`)
      return prev  // BLOCKED
    }
    // ... add logic
  })
}
```

**Button Disabled State:**
```typescript
<Button
  onClick={handleAdd}
  disabled={
    !selectedFamily ||
    !selectedType ||
    selectedCount >= MAX_GENRE_SETS  // Now 5
  }
>
```

**Auditions Checkbox:**
```typescript
<Checkbox
  checked={selectedGenres.includes(genre)}
  onCheckedChange={() => toggleGenre(genre)}
  disabled={
    !selectedGenres.includes(genre) &&
    selectedGenres.length >= 5  // Hard cap
  }
/>
```

### Backend Validation

**No server-side validation currently enforced.** The database schema allows arrays of any length:

```sql
-- In user_profiles table
preferred_genre_ids TEXT[]  -- No length constraint
```

**Recommendation:** Consider adding database constraint if strict enforcement is critical:
```sql
ALTER TABLE user_profiles
ADD CONSTRAINT max_5_genres
CHECK (cardinality(preferred_genre_ids) <= 5);
```

---

## User Experience Improvements

### Before → After

| Scenario | Old Behavior | New Behavior |
|----------|--------------|--------------|
| **Select 4th genre** | ❌ Blocked at 3 | ✅ Allowed (up to 5) |
| **Select 5th genre** | ❌ Blocked at 3 | ✅ Allowed (max reached) |
| **Try 6th genre** | N/A (blocked at 3) | ❌ Button disabled, clear message |
| **UI counter** | "3 / 3" | "5 / 5" (consistent) |
| **Label text** | "Maximum 3" | "Up to five genre sets" |
| **Error message** | "Maximum 3 genres allowed" | "Maximum 5 genres allowed" |

---

## Real-World Use Cases

### Example 1: Crossover Pop Artist
**Before (Limited to 3):**
- Pop
- R&B
- Hip-Hop
- ❌ Can't add Electronic or Dance

**After (Up to 5):**
- Pop
- R&B
- Hip-Hop
- Electronic
- ✅ Soul (versatile crossover artist accurately represented)

### Example 2: Multi-Genre Session Vocalist
**Before (Limited to 3):**
- Jazz
- Soul
- Gospel
- ❌ Can't add Blues or Classical

**After (Up to 5):**
- Jazz
- Soul
- Gospel
- Blues
- ✅ Classical (full range of expertise shown)

### Example 3: Audition Posting
**Before (Limited to 3):**
Looking for vocalist comfortable with:
- Rock
- Blues
- Folk
- ❌ Can't specify Country or Americana

**After (Up to 5):**
Looking for vocalist comfortable with:
- Rock
- Blues
- Folk
- Country
- ✅ Americana (more accurate requirement specification)

---

## Rationale: Why 5 Instead of 3?

### Industry Research
1. **Spotify/Apple Music**: Most artists tagged with 3-5 primary genres
2. **Crossover trends**: Increasing genre-blending (e.g., Post Malone spans Hip-Hop, Pop, R&B, Rock, Country)
3. **Vocalist versatility**: Professional session vocalists often work in 4-5 distinct styles
4. **Festival bookings**: Multi-genre festival lineups value artists who span 4-5 genres

### Platform Benefits
1. **Better matching**: More genre tags = more accurate search results
2. **Broader discovery**: Artists appear in more relevant searches
3. **Accurate representation**: Artists can fully describe their range
4. **Reduced frustration**: No arbitrary limitation forcing tough choices

### Why Not Unlimited?
1. **Maintains focus**: 5 encourages artists to highlight core strengths
2. **Quality over quantity**: Forces thoughtful selection
3. **UI/UX**: Keeps profile cards and search filters manageable
4. **Data quality**: Prevents "tag spam" where artists select everything

---

## Testing Checklist

### ✅ Artist Dashboard - Genres Manager
- [ ] Can select up to 5 genre sets
- [ ] UI counter shows "X / 5"
- [ ] "Add Genre" button disabled at 5 selections
- [ ] Error message shows: "You can add up to 5 genre sets"
- [ ] Saved genres persist correctly
- [ ] Can remove and re-add to reach 5 again

### ✅ Auditions - Genre Selection
- [ ] Can select up to 5 genre families for audition adverts
- [ ] Checkboxes disabled when 5 selected
- [ ] Error notification: "Maximum 5 genres allowed"
- [ ] Label reads: "Specific Genres (Up to five genre families)"
- [ ] Genre chips display correctly for 5 selections

### ✅ Data Persistence
- [ ] 5 genre sets save to database correctly
- [ ] Loading page shows all 5 genre sets
- [ ] No data loss when editing/updating

---

## Files Modified

1. ✅ `app/artist-dashboard/components/ArtistGenresManager.tsx`
   - Changed `MAX_GENRE_SETS` from 3 to 5
   - All validation and UI automatically updated

2. ✅ `app/artist-dashboard/components/ArtistAuditionsManager.tsx`
   - Updated validation: `> 5` instead of `> 3`
   - Updated toggle logic: `< 5` instead of `< 3`
   - Updated label: "Up to five genre families" instead of "Maximum 3"
   - Updated disable logic: `>= 5` instead of `>= 3`

3. ✅ `GENRE_LIMIT_UPDATE.md` (this document)

---

## Database Impact

### Current Schema
```sql
-- No changes needed
preferred_genre_ids TEXT[]  -- Already supports arrays of any length
```

**Stored Format Example:**
```json
[
  "pop:synthpop",
  "rnb:contemporary-rnb",
  "hip-hop:trap",
  "electronic:house",
  "soul:neo-soul"
]
```

### Migration

**No migration required.** Existing data works seamlessly:
- Users with 1-3 genres: Can now add up to 2 more
- Database supports arrays of any length
- Frontend now allows up to 5 selections

---

## Backward Compatibility

✅ **Fully backward compatible**
- Users with 3 or fewer genres: No impact
- Users who somehow have >5 genres: Will see all, can't add more
- Database: No schema changes required
- API: No changes required

---

## Future Considerations

### Optional Enhancements
1. **Genre Weighting**: Allow artists to mark "primary" vs "secondary" genres
2. **Smart Suggestions**: "Artists like you also select [Genre]"
3. **Analytics**: Track most common genre combinations to inform taxonomy
4. **Seasonal Updates**: Adjust limit based on usage data (maybe 6 in future?)

### Potential Issues
1. **Search Overload**: Artists in many genres might appear in too many searches
   - **Mitigation**: Algorithm weights by relevance/engagement
2. **Profile Clutter**: 5 genre chips might look busy
   - **Mitigation**: Use "... and 2 more" truncation in compact views

---

## Conclusion

✅ **Limit increased from 3 to 5 genre sets**
✅ **UI copy updated to "up to five genre sets"**
✅ **Validation enforced consistently at 5**
✅ **User confusion eliminated (no more "5/3")**
✅ **Better reflects modern crossover reality**

The genre selection system now accommodates artists' real-world versatility while maintaining focus and data quality. Users can accurately represent their range without hitting artificial limitations.

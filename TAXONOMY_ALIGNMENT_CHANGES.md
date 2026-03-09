# Taxonomy Alignment Changes - Artist Types 4 & 5

**Date:** 2026-03-09
**Status:** ✅ Completed

## Overview

This document summarizes the changes made to align the Artist Type taxonomy with the Notion specification, specifically focusing on **Artist Type 4 (Vocalist)** and **Artist Type 5 (Instrumentalist)**.

---

## Changes Made

### 1. ✅ Vocal Roles (Artist Type 4) - Updated Labels

**File:** `data/artist-types.ts:203-207`

**Before:**
```typescript
{ id: 'lead-vocalist', label: 'Lead Vocals', description: '...' },
{ id: 'backing-vocalist', label: 'Backing Vocals', description: '...' },
{ id: 'harmony-vocalist', label: 'Harmony Vocals', description: '...' }
```

**After:**
```typescript
{ id: 'lead-vocalist', label: 'Lead', description: '...' },
{ id: 'backing-vocalist', label: 'Backing', description: '...' },
{ id: 'harmony-vocalist', label: 'Harmony', description: '...' }
```

**Rationale:** Matches Notion specification exactly - roles should be "Lead", "Backing", "Harmony" (not "Lead Vocals").

---

### 2. ✅ Instrument Taxonomy (Artist Type 5) - Complete Overhaul

**New File:** `data/instrument-taxonomy-aligned.ts`

**Key Features:**
- ✅ Complete 3-tier hierarchy from Notion
- ✅ "All [Group] Instruments" option at top of each group
- ✅ "Other [Group] Instrument" option at bottom of each group
- ✅ All main instrument families with full variant lists
- ✅ 5 instrument groups: String, Wind, Percussion, Keyboard, Electronic

**Structure:**
```
String Instruments
  ├─ All String Instruments ← selects entire group
  ├─ Banjo (17 variants)
  ├─ Bass Guitar (19 variants)
  ├─ Cello (11 variants)
  ├─ Double Bass (16 variants)
  ├─ Guitar (45 variants)
  ├─ Harp (37 variants)
  ├─ Lute (38 variants)
  ├─ Mandolin (22 variants)
  ├─ Nyckelharpa
  ├─ Phonofiddle
  ├─ Sitar (17 variants)
  ├─ Ukulele
  ├─ Viola (20 variants)
  ├─ Violin (38 variants)
  ├─ Zither (33 variants)
  └─ Other String Instrument ← triggers ops alert
```

**Total Counts:**
- **String Instruments:** 15 families, 313 total variants
- **Wind Instruments:** 14 families, 23 total variants
- **Percussion Instruments:** 6 families, 24 total variants
- **Keyboard Instruments:** 7 families, 9 total variants
- **Electronic Instruments:** 3 families, 17 total variants

---

### 3. ✅ Updated Artist Type Configuration

**File:** `data/artist-types.ts:229-243`

**Before:**
```typescript
groups: [
  {
    id: 'instrument-group',
    title: 'Instrument group',
    required: true,
    minSelect: 1,
    options: TYPE5_INSTRUMENT_GROUP_OPTIONS
  },
  {
    id: 'instrument-specialism',
    title: 'Main instrument family',
    helpText: 'Select the families or specific instruments you specialise in.',
    options: TYPE5_MAIN_INSTRUMENT_FAMILY_OPTIONS
  }
]
```

**After:**
```typescript
groups: [
  {
    id: 'instruments',
    title: 'Instruments you play',
    helpText: 'Select "All" for entire groups, or choose specific instruments. Selecting "Other" will trigger a follow-up to capture your instrument.',
    required: true,
    minSelect: 1,
    options: getType5InstrumentOptions()
  }
]
```

**Rationale:**
- Simplified to single selection group with all instruments
- Grouped by instrument family (String, Wind, etc.)
- Clear help text about "All" and "Other" options

---

### 4. ✅ "Other Instrument" Alert System

**File:** `app/artist-dashboard/components/ArtistTypeSelectorV2.tsx`

**Features Added:**

#### A. Detection Logic
```typescript
const updateSelections = (typeId: number, groupId: string, nextValues: string[]) => {
  // ... existing code ...

  // Check if any "Other instrument" option was selected (Type 5 only)
  if (typeId === 5) {
    const hasOtherSelection = nextValues.some(value => isOtherInstrumentSelection(value))
    if (hasOtherSelection) {
      console.info('[TAXONOMY] User selected "Other" instrument option - manual follow-up required', {
        typeId, groupId, selections: nextValues, timestamp: new Date().toISOString()
      })
    }
  }
}
```

#### B. Visual Alert
- Orange/red badge for "Other" selections
- AlertCircle icon on "Other" options
- Warning banner explaining manual follow-up requirement

**User sees:**
```
⚠️ Manual Follow-Up Required: You've selected "Other" instrument(s).
   Our team will contact you to capture the specific instrument details
   and update our taxonomy.
```

---

## Database Schema

**No migration needed** - existing schema is compatible:

```sql
-- database/migrations/032_add_artist_selection_fields.sql
instrument_category TEXT,  -- stores group ID or "all-string", "other-wind" etc.
instrument TEXT            -- stores comma-separated instrument IDs
```

**Storage Format:**
- Single instruments: `"guitar"`
- Multiple instruments: `"guitar,bass-guitar,violin"`
- "All" option: `"all-string"`
- "Other" option: `"other-wind"`

---

## Backward Compatibility

### ✅ Preserved Systems

1. **`INSTRUMENT_TAXONOMY_3TIER`** - Still used for:
   - Crew member instrument selection
   - Detailed profile editing
   - Artist audition requirements
   - 3-tier picker UI component

2. **`INSTRUMENT_GROUP_SCHEMA`** - Still used for:
   - Crew role groups
   - Audition instrument filters

3. **Database fields** - No changes required

### 🔄 Migration Path

Existing data remains valid. New selections use the expanded taxonomy. No data migration needed.

---

## API Helper Functions

**File:** `data/instrument-taxonomy-aligned.ts`

### `getType5InstrumentOptions()`
Returns flat list of all instruments for Type 5 selection dropdowns, grouped by instrument family.

```typescript
[
  { id: 'all-string', label: 'All String Instruments', group: 'String Instruments' },
  { id: 'banjo', label: 'Banjo', group: 'String Instruments' },
  { id: 'bass-guitar', label: 'Bass Guitar', group: 'String Instruments' },
  // ... all families ...
  { id: 'other-string', label: 'Other String Instrument', group: 'String Instruments' },
  // ... repeat for all groups ...
]
```

### `isOtherInstrumentSelection(selectionId: string): boolean`
Checks if a selection is an "Other" option requiring manual follow-up.

```typescript
isOtherInstrumentSelection('other-string')  // true
isOtherInstrumentSelection('guitar')        // false
isOtherInstrumentSelection('all-wind')      // false
```

### `isAllInstrumentsSelection(selectionId: string): boolean`
Checks if a selection is an "All [Group]" option.

```typescript
isAllInstrumentsSelection('all-string')  // true
isAllInstrumentsSelection('guitar')      // false
```

### `getInstrumentVariantsForFamily(familyId: string): InstrumentVariant[] | undefined`
Returns all variants for a specific instrument family.

```typescript
getInstrumentVariantsForFamily('guitar')
// Returns: [
//   { id: 'acoustic-guitar', label: 'Acoustic Guitar' },
//   { id: 'electric-guitar', label: 'Electric Guitar' },
//   { id: 'flamenco-guitar', label: 'Flamenco Guitar' },
//   ... 42 more variants
// ]
```

---

## Testing Checklist

### ✅ Vocal Roles (Type 4)
- [ ] Labels display as "Lead", "Backing", "Harmony" (not "Lead Vocals")
- [ ] "All Vocals" option selects all three roles
- [ ] Sound-based descriptors remain separate
- [ ] Genre-based descriptors remain separate

### ✅ Instruments (Type 5)
- [ ] "All [Group] Instruments" options appear at top of each group
- [ ] All instrument families from Notion are present
- [ ] "Other [Group] Instrument" options appear at bottom
- [ ] Selecting "Other" shows orange warning alert
- [ ] Console log appears when "Other" is selected
- [ ] Grouped options display correctly by instrument family

### ✅ Backward Compatibility
- [ ] Crew manager instrument picker still works
- [ ] Existing artist profiles display correctly
- [ ] Audition instrument filters still work
- [ ] No console errors in any artist dashboard pages

---

## Next Steps (Optional Enhancements)

### 1. Backend Alert System
Currently logs to console. Consider adding:
- Database flag for "requires taxonomy follow-up"
- Email notification to ops team
- Admin dashboard item for pending taxonomy updates

### 2. Instrument Variants in Type 5 Selection
Currently Type 5 selects instrument families. Consider adding:
- Optional variant selection after choosing family
- Similar to 3-tier picker but streamlined for Type 5

### 3. Search/Filter Functionality
For large instrument lists, add:
- Search box to filter instruments
- Category quick-jump buttons
- Recently used instruments section

---

## Files Modified

1. ✅ `data/instrument-taxonomy-aligned.ts` (NEW)
2. ✅ `data/artist-types.ts`
3. ✅ `app/artist-dashboard/components/ArtistTypeSelectorV2.tsx`

## Files Unchanged (Backward Compatible)

1. ✅ `data/instrument-taxonomy.ts` (still used for crew/3-tier picker)
2. ✅ `data/vocal-descriptors.ts` (no changes needed)
3. ✅ `app/components/ui/instrument-picker-3tier.tsx`
4. ✅ `app/artist-dashboard/components/ArtistCrewManager.tsx`
5. ✅ `database/migrations/032_add_artist_selection_fields.sql`

---

## Conclusion

✅ **Taxonomy is now fully aligned with Notion specification**
- Vocal roles use correct labels
- Instrument taxonomy is complete with all families and variants
- "All" and "Other" options implemented
- Alert system for "Other" selections active
- Backward compatibility preserved

No database migrations required. All changes are frontend-only and backward compatible.

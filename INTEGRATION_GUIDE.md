# Integration Guide: Artist Type Capabilities in SignUpWizard

## Step 1: Add Import Statement

Add this import at the top of `app/signup/components/SignUpWizard.tsx` (after line 39):

```typescript
import { getArtistTypeCapabilities, hasCapability } from "../../../lib/artist-type-config";
```

## Step 2: Get Capabilities in Component

Add this line inside the SignUpWizard component (around line 720, near where `artistSelection` state is defined):

```typescript
const [artistSelection, setArtistSelection] = useState({
  typeId: "",
  subType: "",
  vocalSoundTypes: "",
  vocalGenreStyles: "",
  instrumentCategory: "",
  instrument: "",
  songwriterOption: "",
  songwriterGenres: "",
  lyricistOption: "",
  lyricistGenres: "",
  composerOption: "",
  composerGenres: "",
  availability: ""
});

// Add this new line:
const artistCapabilities = useMemo(() => {
  if (!artistSelection.typeId) return null;
  return getArtistTypeCapabilities(artistSelection.typeId);
}, [artistSelection.typeId]);
```

## Step 3: Update Contract Status Section

Find the Contract Status section (around line 5459) and wrap each contract type with capability checks:

### Original Code:
```tsx
{/* Contract Status */}
<Card className="border-2 border-border/40 shadow-sm hover:shadow-md transition-shadow">
  <CardHeader className="bg-gradient-to-r from-green-500/5 to-transparent pb-4">
    <div className="flex items-center gap-2">
      <span className="text-xl">📋</span>
      <h4 className="text-lg font-bold text-foreground">Contract Status</h4>
    </div>
    <p className="text-xs text-foreground/60 mt-1">Tell us about your industry relationships and representation</p>
  </CardHeader>
  <CardContent className="space-y-8 pt-6">
    {/* Record Label */}
    <div className="space-y-4">
      ...
    </div>

    {/* Music Publisher */}
    <div className="space-y-4">
      ...
    </div>

    {/* Artist Manager */}
    <div className="space-y-4">
      ...
    </div>

    {/* Booking Agent */}
    <div className="space-y-4">
      ...
    </div>
  </CardContent>
</Card>
```

### Updated Code with Capabilities:
```tsx
{/* Contract Status - Only show if artist has any contract capabilities */}
{artistCapabilities && (artistCapabilities.hasRecordLabel ||
                        artistCapabilities.hasMusicPublisher ||
                        artistCapabilities.hasArtistManager ||
                        artistCapabilities.hasBookingAgent) && (
  <Card className="border-2 border-border/40 shadow-sm hover:shadow-md transition-shadow">
    <CardHeader className="bg-gradient-to-r from-green-500/5 to-transparent pb-4">
      <div className="flex items-center gap-2">
        <span className="text-xl">📋</span>
        <h4 className="text-lg font-bold text-foreground">Contract Status</h4>
      </div>
      <p className="text-xs text-foreground/60 mt-1">Tell us about your industry relationships and representation</p>
    </CardHeader>
    <CardContent className="space-y-8 pt-6">
      {/* Record Label - Only for Types 1 & 2 */}
      {artistCapabilities.hasRecordLabel && (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Record Label Status</Label>
            <Select
              value={artistProfile.recordLabelStatus}
              onValueChange={(value) => setArtistProfile(prev => ({ ...prev, recordLabelStatus: value }))}
            >
              <SelectTrigger className="font-ui">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="signed">Signed to Label</SelectItem>
                <SelectItem value="independent">Self-Signed: Independent</SelectItem>
                <SelectItem value="seeking">Seeking Label</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {/* ... rest of record label fields ... */}
        </div>
      )}

      {/* Music Publisher - Only for Types 1, 2, 6, 7, 8 */}
      {artistCapabilities.hasMusicPublisher && (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Music Publisher Status</Label>
            <Select
              value={artistProfile.musicPublisherStatus}
              onValueChange={(value) => setArtistProfile(prev => ({ ...prev, musicPublisherStatus: value }))}
            >
              <SelectTrigger className="font-ui">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="signed">Signed to Publisher</SelectItem>
                <SelectItem value="independent">Self-Publishing: Independent</SelectItem>
                <SelectItem value="seeking">Seeking Publisher</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {/* ... rest of music publisher fields ... */}
        </div>
      )}

      {/* Artist Manager - All types can have managers */}
      {artistCapabilities.hasArtistManager && (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Artist Manager Status</Label>
            <Select
              value={artistProfile.artistManagerStatus}
              onValueChange={(value) => setArtistProfile(prev => ({ ...prev, artistManagerStatus: value }))}
            >
              <SelectTrigger className="font-ui">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="signed">Managed Artist</SelectItem>
                <SelectItem value="self_managed">Self-Managed: Independent</SelectItem>
                <SelectItem value="seeking">Seeking Manager</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {/* ... rest of artist manager fields ... */}
        </div>
      )}

      {/* Booking Agent - Only for Types 1, 3, 4, 5 */}
      {artistCapabilities.hasBookingAgent && (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Booking Agent Status</Label>
            <Select
              value={artistProfile.bookingAgentStatus}
              onValueChange={(value) => setArtistProfile(prev => ({ ...prev, bookingAgentStatus: value }))}
            >
              <SelectTrigger className="font-ui">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="signed">Signed to Booking Agent</SelectItem>
                <SelectItem value="self_booking">Self-Booking: Independent</SelectItem>
                <SelectItem value="seeking">Seeking Booking Agent</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {/* ... rest of booking agent fields ... */}
        </div>
      )}
    </CardContent>
  </Card>
)}
```

## Step 4: Add Professional IDs Section

Add this new section after the Contract Status section:

```tsx
{/* Professional IDs - ISNI and IPI/CAE */}
{artistCapabilities && (artistCapabilities.requiresISNI || artistCapabilities.requiresIPICAE || artistCapabilities.optionalIPICAE) && (
  <Card className="border-2 border-border/40 shadow-sm hover:shadow-md transition-shadow">
    <CardHeader className="bg-gradient-to-r from-blue-500/5 to-transparent pb-4">
      <div className="flex items-center gap-2">
        <span className="text-xl">🆔</span>
        <h4 className="text-lg font-bold text-foreground">Professional Identification</h4>
      </div>
      <p className="text-xs text-foreground/60 mt-1">Industry-standard IDs for proper crediting and royalty payments</p>
    </CardHeader>
    <CardContent className="space-y-6 pt-6">
      {/* ISNI - International Standard Name Identifier */}
      {artistCapabilities.requiresISNI && (
        <div className="space-y-2">
          <Label htmlFor="performerIsni">
            Artist Performer ISNI {artistCapabilities.requiresISNI && <span className="text-red-500">*</span>}
          </Label>
          <p className="text-xs text-foreground/60 mb-2">
            ℹ️ Your unique digital ID prevents name confusion, ensures correct crediting, and tracks all your work across platforms.
            <a href="https://isni.org/page/search-database/" target="_blank" rel="noopener noreferrer" className="text-purple-600 hover:underline ml-1">
              Get / Find an ISNI
            </a>
          </p>
          <Input
            id="performerIsni"
            placeholder="Start typing Performer ISNI…"
            value={artistProfile.performerIsni || ""}
            onChange={(e) => setArtistProfile(prev => ({ ...prev, performerIsni: e.target.value }))}
            className="font-ui"
          />
        </div>
      )}

      {/* IPI/CAE - Interested Parties Number */}
      {(artistCapabilities.requiresIPICAE || artistCapabilities.optionalIPICAE) && (
        <div className="space-y-2">
          <Label htmlFor="creatorIpiCae">
            Creator IPI/CAE {artistCapabilities.requiresIPICAE && <span className="text-red-500">*</span>}
            {artistCapabilities.optionalIPICAE && <span className="text-foreground/60 text-xs ml-1">(Optional)</span>}
          </Label>
          <p className="text-xs text-foreground/60 mb-2">
            ℹ️ For Songwriters, Lyricists, and Composers. Automatically issued when joining a Performance Rights Organisation (PRO) like ASCAP, BMI, or PRS.
            Required for accurate song registration and royalty payments.
          </p>
          <Input
            id="creatorIpiCae"
            placeholder="Start typing Creator IPI/CAE…"
            value={artistProfile.creatorIpiCae || ""}
            onChange={(e) => setArtistProfile(prev => ({ ...prev, creatorIpiCae: e.target.value }))}
            className="font-ui"
          />
        </div>
      )}
    </CardContent>
  </Card>
)}
```

## Step 5: Add Gig Tracking Section

Add this section in the Artist Details area:

```tsx
{/* Gig Experience Tracking */}
{artistCapabilities && (artistCapabilities.needsGigsPerformed || artistCapabilities.hasSessionGigs) && (
  <div className="space-y-4">
    {artistCapabilities.needsGigsPerformed && (
      <div className="space-y-2">
        <Label htmlFor="gigsPerformed">Public Gigs Performed Before Joining Gigrilla</Label>
        <p className="text-xs text-foreground/60">It pays to be honest - used for gig stats</p>
        <Input
          id="gigsPerformed"
          type="number"
          min="0"
          placeholder="0"
          value={artistProfile.gigsPerformed || 0}
          onChange={(e) => setArtistProfile(prev => ({ ...prev, gigsPerformed: parseInt(e.target.value) || 0 }))}
          className="font-ui"
        />
      </div>
    )}

    {artistCapabilities.hasSessionGigs && (
      <div className="space-y-2">
        <Label htmlFor="recordingSessionGigs">Recording Session Gigs Before Joining Gigrilla</Label>
        <p className="text-xs text-foreground/60">It pays to be honest - used for gig stats</p>
        <Input
          id="recordingSessionGigs"
          type="number"
          min="0"
          placeholder="0"
          value={artistProfile.recordingSessionGigs || 0}
          onChange={(e) => setArtistProfile(prev => ({ ...prev, recordingSessionGigs: parseInt(e.target.value) || 0 }))}
          className="font-ui"
        />
      </div>
    )}
  </div>
)}
```

## Step 6: Update Artist Profile State

Add the new fields to the `artistProfile` state object (find where it's initialized):

```typescript
const [artistProfile, setArtistProfile] = useState({
  // ... existing fields ...
  performerIsni: "",
  creatorIpiCae: "",
  recordingSessionGigs: 0,
  website: "",
  // ... other existing fields ...
});
```

## Step 7: Update the API Call

When submitting the artist profile, include the new fields in the API payload (find the section around line 6221):

```typescript
const profilePayload = {
  // ... existing fields ...
  performer_isni: artistProfile.performerIsni || null,
  creator_ipi_cae: artistProfile.creatorIpiCae || null,
  recording_session_gigs: artistProfile.recordingSessionGigs || 0,
  website: artistProfile.website || null,
  // ... other existing fields ...
};
```

## Step 8: Add Website Field

Add this field in the Artist Details section (social media area):

```tsx
{/* Website */}
<div className="space-y-2">
  <Label htmlFor="website">Official Website</Label>
  <Input
    id="website"
    type="url"
    placeholder="https://yourwebsite.com"
    value={artistProfile.website || ""}
    onChange={(e) => setArtistProfile(prev => ({ ...prev, website: e.target.value }))}
    className="font-ui"
  />
</div>
```

## Testing Each Artist Type

### Type 1: Live Gig & Original Recording Artist
- ✅ Should see: All contract options, ISNI, IPI/CAE, gig tracking, team members, music upload
- ✅ Should NOT see: Session gigs, for-hire specific fields

### Type 2: Original Recording Artist
- ✅ Should see: Record label, publisher, manager (NO booking agent), ISNI, IPI/CAE, team members, music upload
- ✅ Should NOT see: Gig pricing, set lengths, booking agent

### Type 3: Live Gig Artist
- ✅ Should see: Manager, booking agent, ISNI, gig tracking, team members
- ✅ Should NOT see: Record label, publisher, IPI/CAE, music upload

### Type 4: Vocalist for Hire
- ✅ Should see: Manager, booking agent, ISNI, optional IPI/CAE, session gigs, vocal descriptors, availability
- ✅ Should NOT see: Team members, record label, publisher

### Type 5: Instrumentalist for Hire
- ✅ Should see: Manager, booking agent, ISNI, optional IPI/CAE, session gigs, instrument selection, availability
- ✅ Should NOT see: Team members, record label, publisher

### Type 6: Songwriter for Hire
- ✅ Should see: Manager, publisher, ISNI, required IPI/CAE, genre selection, availability
- ✅ Should NOT see: Record label, booking agent, gig pricing

### Type 7: Lyricist for Hire
- ✅ Should see: Manager, publisher, ISNI, required IPI/CAE, genre selection, availability
- ✅ Should NOT see: Record label, booking agent, gig pricing

### Type 8: Composer for Hire
- ✅ Should see: Manager, publisher, ISNI, required IPI/CAE, genre selection, availability
- ✅ Should NOT see: Record label, booking agent, gig pricing

## Summary of Changes

1. ✅ Added capabilities import
2. ✅ Added capabilities memoization
3. ✅ Wrapped Contract Status sections with capability checks
4. ✅ Added Professional IDs section
5. ✅ Added Gig Tracking section
6. ✅ Added website field
7. ✅ Updated state and API payload

## Next Steps

1. Run the database migration: `database/migrations/036_add_artist_professional_ids.sql`
2. Update the artist profile API endpoint to handle new fields
3. Test each artist type thoroughly
4. Add music upload section (for Types 1 & 2)
5. Add complete gig pricing/areas section (for Types 1, 3, 4, 5)

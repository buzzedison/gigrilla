/**
 * Artist Type Configuration
 * Defines capabilities and features for each of the 8 artist types
 */

export interface ArtistTypeCapabilities {
  // Core Profile Features
  hasFullProfile: boolean;
  hasTeamMembers: boolean; // Band members with roles and income share
  hasSupportTeam: boolean; // Support staff (managers, agents, etc.)

  // Music & Content
  canUploadMusic: boolean;
  canUploadCovers: boolean; // Licensed covers
  requiresMusicRegistration: boolean; // ISRC, ISWC, UPC/EAN codes

  // Live Performance
  canPerformLiveGigs: boolean;
  hasGigPricing: boolean;
  hasSetLengths: boolean;
  hasGigAreas: boolean; // Local and wider gig zones
  needsGigsPerformed: boolean; // Track of gigs performed before joining

  // For Hire Features
  isForHire: boolean;
  hasVocalDescriptors: boolean; // Type 4 specific
  hasInstrumentSelection: boolean; // Type 5 specific
  hasSongwriterGenres: boolean; // Type 6 specific
  hasLyricistGenres: boolean; // Type 7 specific
  hasComposerGenres: boolean; // Type 8 specific
  hasAvailability: boolean; // For hire types

  // Business & Contracts
  hasRecordLabel: boolean;
  hasMusicPublisher: boolean;
  hasArtistManager: boolean;
  hasBookingAgent: boolean;
  hasMoneySplits: boolean; // Income distribution for team

  // Professional IDs
  requiresISNI: boolean; // Performer identification
  requiresIPICAE: boolean; // Creator/songwriter identification
  optionalIPICAE: boolean; // For vocalists/instrumentalists who might write

  // Additional tracking
  hasSessionGigs: boolean; // Recording session count (Type 4, 5)
  hasSongwritingCollaborations: boolean; // Songwriting collaboration count (Type 6, 7, 8)
}

export const ARTIST_TYPE_CAPABILITIES: Record<number, ArtistTypeCapabilities> = {
  // Type 1: Live Gig & Original Recording Artist
  1: {
    hasFullProfile: true,
    hasTeamMembers: true,
    hasSupportTeam: true,
    canUploadMusic: true,
    canUploadCovers: true,
    requiresMusicRegistration: true,
    canPerformLiveGigs: true,
    hasGigPricing: true,
    hasSetLengths: true,
    hasGigAreas: true,
    needsGigsPerformed: true,
    isForHire: false,
    hasVocalDescriptors: false,
    hasInstrumentSelection: false,
    hasSongwriterGenres: false,
    hasLyricistGenres: false,
    hasComposerGenres: false,
    hasAvailability: false,
    hasRecordLabel: true,
    hasMusicPublisher: true,
    hasArtistManager: true,
    hasBookingAgent: true,
    hasMoneySplits: true,
    requiresISNI: true,
    requiresIPICAE: true,
    optionalIPICAE: false,
    hasSessionGigs: false,
    hasSongwritingCollaborations: false,
  },

  // Type 2: Original Recording Artist
  2: {
    hasFullProfile: true,
    hasTeamMembers: true,
    hasSupportTeam: true,
    canUploadMusic: true,
    canUploadCovers: true,
    requiresMusicRegistration: true,
    canPerformLiveGigs: false, // KEY DIFFERENCE: No live gigs
    hasGigPricing: false,
    hasSetLengths: false,
    hasGigAreas: false,
    needsGigsPerformed: false,
    isForHire: false,
    hasVocalDescriptors: false,
    hasInstrumentSelection: false,
    hasSongwriterGenres: false,
    hasLyricistGenres: false,
    hasComposerGenres: false,
    hasAvailability: false,
    hasRecordLabel: true,
    hasMusicPublisher: true,
    hasArtistManager: true,
    hasBookingAgent: true, // Per artisttypefullfeature.md, Type 2 has booking agent
    hasMoneySplits: true,
    requiresISNI: true,
    requiresIPICAE: true,
    optionalIPICAE: false,
    hasSessionGigs: false,
    hasSongwritingCollaborations: false,
  },

  // Type 3: Live Gig Artist (Cover; Tribute; Classical; Theatrical)
  3: {
    hasFullProfile: true,
    hasTeamMembers: true,
    hasSupportTeam: true,
    canUploadMusic: false, // KEY DIFFERENCE: No music upload
    canUploadCovers: false,
    requiresMusicRegistration: false,
    canPerformLiveGigs: true,
    hasGigPricing: true,
    hasSetLengths: true,
    hasGigAreas: true,
    needsGigsPerformed: true,
    isForHire: false,
    hasVocalDescriptors: false,
    hasInstrumentSelection: false,
    hasSongwriterGenres: false,
    hasLyricistGenres: false,
    hasComposerGenres: false,
    hasAvailability: false,
    hasRecordLabel: true, // Per artisttypefullfeature.md, Type 3 has record label
    hasMusicPublisher: true, // Per artisttypefullfeature.md, Type 3 has music publisher
    hasArtistManager: true,
    hasBookingAgent: true,
    hasMoneySplits: true,
    requiresISNI: true,
    requiresIPICAE: false, // Not creating original works
    optionalIPICAE: false,
    hasSessionGigs: false,
    hasSongwritingCollaborations: false,
  },

  // Type 4: Vocalist Artist for Hire
  4: {
    hasFullProfile: true,
    hasTeamMembers: false, // Solo artist for hire
    hasSupportTeam: true,
    canUploadMusic: false,
    canUploadCovers: false,
    requiresMusicRegistration: false,
    canPerformLiveGigs: true, // Can be hired for live performances
    hasGigPricing: true,
    hasSetLengths: false, // Hired per session/gig, not set length
    hasGigAreas: true,
    needsGigsPerformed: true,
    isForHire: true,
    hasVocalDescriptors: true, // KEY FEATURE: Voice type descriptors
    hasInstrumentSelection: false,
    hasSongwriterGenres: false,
    hasLyricistGenres: false,
    hasComposerGenres: false,
    hasAvailability: true,
    hasRecordLabel: false,
    hasMusicPublisher: false,
    hasArtistManager: true,
    hasBookingAgent: true,
    hasMoneySplits: false, // Solo artist, no splits
    requiresISNI: true,
    requiresIPICAE: false,
    optionalIPICAE: true, // Some vocalists also write
    hasSessionGigs: true, // Track recording sessions
    hasSongwritingCollaborations: false,
  },

  // Type 5: Instrumentalist Artist for Hire
  5: {
    hasFullProfile: true,
    hasTeamMembers: false,
    hasSupportTeam: true,
    canUploadMusic: false,
    canUploadCovers: false,
    requiresMusicRegistration: false,
    canPerformLiveGigs: true,
    hasGigPricing: true,
    hasSetLengths: false,
    hasGigAreas: true,
    needsGigsPerformed: true,
    isForHire: true,
    hasVocalDescriptors: false,
    hasInstrumentSelection: true, // KEY FEATURE: Instrument selection
    hasSongwriterGenres: false,
    hasLyricistGenres: false,
    hasComposerGenres: false,
    hasAvailability: true,
    hasRecordLabel: false,
    hasMusicPublisher: false,
    hasArtistManager: true,
    hasBookingAgent: true,
    hasMoneySplits: false,
    requiresISNI: true,
    requiresIPICAE: false,
    optionalIPICAE: true, // Some instrumentalists also compose
    hasSessionGigs: true,
    hasSongwritingCollaborations: false,
  },

  // Type 6: Songwriter Artist for Hire
  6: {
    hasFullProfile: true,
    hasTeamMembers: false,
    hasSupportTeam: true,
    canUploadMusic: false,
    canUploadCovers: false,
    requiresMusicRegistration: false,
    canPerformLiveGigs: false, // Songwriter, not performer
    hasGigPricing: false,
    hasSetLengths: false,
    hasGigAreas: false,
    needsGigsPerformed: false,
    isForHire: true,
    hasVocalDescriptors: false,
    hasInstrumentSelection: false,
    hasSongwriterGenres: true, // KEY FEATURE: Genre specialization
    hasLyricistGenres: false,
    hasComposerGenres: false,
    hasAvailability: true,
    hasRecordLabel: true, // Per artisttypefullfeature.md, Type 6 has record label
    hasMusicPublisher: true, // Songwriters often have publishers
    hasArtistManager: true,
    hasBookingAgent: true, // Per artisttypefullfeature.md, Type 6 has booking agent
    hasMoneySplits: false,
    requiresISNI: true,
    requiresIPICAE: true, // Required for songwriters
    optionalIPICAE: false,
    hasSessionGigs: false,
    hasSongwritingCollaborations: true, // Track songwriting collaborations
  },

  // Type 7: Lyricist Artist for Hire
  7: {
    hasFullProfile: true,
    hasTeamMembers: false,
    hasSupportTeam: true,
    canUploadMusic: false,
    canUploadCovers: false,
    requiresMusicRegistration: false,
    canPerformLiveGigs: false,
    hasGigPricing: false,
    hasSetLengths: false,
    hasGigAreas: false,
    needsGigsPerformed: false,
    isForHire: true,
    hasVocalDescriptors: false,
    hasInstrumentSelection: false,
    hasSongwriterGenres: false,
    hasLyricistGenres: true, // KEY FEATURE: Genre specialization for lyrics
    hasComposerGenres: false,
    hasAvailability: true,
    hasRecordLabel: true, // Per artisttypefullfeature.md, Type 7 has record label
    hasMusicPublisher: true,
    hasArtistManager: true,
    hasBookingAgent: true, // Per artisttypefullfeature.md, Type 7 has booking agent
    hasMoneySplits: false,
    requiresISNI: true,
    requiresIPICAE: true, // Required for lyricists
    optionalIPICAE: false,
    hasSessionGigs: false,
    hasSongwritingCollaborations: true, // Track songwriting collaborations
  },

  // Type 8: Composer Artist for Hire
  8: {
    hasFullProfile: true,
    hasTeamMembers: false,
    hasSupportTeam: true,
    canUploadMusic: false,
    canUploadCovers: false,
    requiresMusicRegistration: false,
    canPerformLiveGigs: false,
    hasGigPricing: false,
    hasSetLengths: false,
    hasGigAreas: false,
    needsGigsPerformed: false,
    isForHire: true,
    hasVocalDescriptors: false,
    hasInstrumentSelection: false,
    hasSongwriterGenres: false,
    hasLyricistGenres: false,
    hasComposerGenres: true, // KEY FEATURE: Genre specialization for composition
    hasAvailability: true,
    hasRecordLabel: true, // Per artisttypefullfeature.md, Type 8 has record label
    hasMusicPublisher: true,
    hasArtistManager: true,
    hasBookingAgent: true, // Per artisttypefullfeature.md, Type 8 has booking agent
    hasMoneySplits: false,
    requiresISNI: true,
    requiresIPICAE: true, // Required for composers
    optionalIPICAE: false,
    hasSessionGigs: false,
    hasSongwritingCollaborations: true, // Track songwriting collaborations
  },
};

/**
 * Helper function to get capabilities for a specific artist type
 */
export function getArtistTypeCapabilities(artistTypeId: number | string): ArtistTypeCapabilities {
  const typeId = typeof artistTypeId === 'string'
    ? parseInt(artistTypeId.replace('type', ''))
    : artistTypeId;

  return ARTIST_TYPE_CAPABILITIES[typeId] || ARTIST_TYPE_CAPABILITIES[1];
}

/**
 * Helper function to check if artist type has a specific capability
 */
export function hasCapability(
  artistTypeId: number | string,
  capability: keyof ArtistTypeCapabilities
): boolean {
  const capabilities = getArtistTypeCapabilities(artistTypeId);
  return capabilities[capability];
}

/**
 * Get human-readable artist type name
 */
export function getArtistTypeName(artistTypeId: number | string): string {
  const typeId = typeof artistTypeId === 'string'
    ? parseInt(artistTypeId.replace('type', ''))
    : artistTypeId;

  const names: Record<number, string> = {
    1: "Live Gig & Original Recording Artist",
    2: "Original Recording Artist",
    3: "Live Gig Artist (Cover; Tribute; Classical; Theatrical)",
    4: "Vocalist for Hire",
    5: "Instrumentalist for Hire",
    6: "Songwriter for Hire",
    7: "Lyricist for Hire",
    8: "Composer for Hire",
  };

  return names[typeId] || "Unknown Artist Type";
}

/**
 * Group artist types by category for UI organization
 */
export const ARTIST_TYPE_GROUPS = {
  performers: [1, 2, 3], // Full artist profiles with teams
  forHire: [4, 5, 6, 7, 8], // Individual professionals for hire
  withMusicUpload: [1, 2], // Can upload and distribute music
  withLiveGigs: [1, 3, 4, 5], // Can perform live gigs
  withCreatorRights: [1, 2, 6, 7, 8], // Need publishing/royalty tracking
};

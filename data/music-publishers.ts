export type MusicPublisherType = 'Full Music Publisher' | 'Admin Music Publisher'
export type MusicPublisherReach = 'Global' | 'Regional'

export interface MusicPublisher {
  country: string
  name: string
  type: MusicPublisherType
  reach: MusicPublisherReach
  url: string
}

/**
 * Curated list of major music publishers worldwide.
 * Full Music Publisher = owns the rights and administers them.
 * Admin Music Publisher = administers rights on behalf of creators (no ownership).
 */
export const MUSIC_PUBLISHERS: MusicPublisher[] = [
  // Australia
  { country: 'Australia',      name: 'Mushroom Music',                                          type: 'Full Music Publisher',  reach: 'Global',   url: 'https://mushroommusic.com/' },
  { country: 'Australia',      name: 'Native Tongue Music Publishing',                          type: 'Full Music Publisher',  reach: 'Regional', url: 'https://nativetongue.com.au/' },
  // Austria
  { country: 'Austria',        name: 'Universal Edition',                                       type: 'Full Music Publisher',  reach: 'Global',   url: 'https://www.universaledition.com/' },
  // Denmark
  { country: 'Denmark',        name: 'Edition Wilhelm Hansen',                                  type: 'Full Music Publisher',  reach: 'Global',   url: 'https://www.wilhansen.com/' },
  // France
  { country: 'France',         name: 'Because Editions',                                        type: 'Full Music Publisher',  reach: 'Regional', url: 'https://because.tv/editions/' },
  // Germany
  { country: 'Germany',        name: 'BMG Rights Management',                                   type: 'Full Music Publisher',  reach: 'Global',   url: 'https://www.bmg.com/' },
  { country: 'Germany',        name: 'Budde Music',                                             type: 'Full Music Publisher',  reach: 'Global',   url: 'https://www.budde.com/' },
  { country: 'Germany',        name: 'Bärenreiter',                                             type: 'Full Music Publisher',  reach: 'Global',   url: 'https://www.baerenreiter.com/' },
  { country: 'Germany',        name: 'Edition Peters',                                          type: 'Full Music Publisher',  reach: 'Global',   url: 'https://www.editionpeters.com/' },
  { country: 'Germany',        name: 'ROBA Music Publishing',                                   type: 'Full Music Publisher',  reach: 'Global',   url: 'https://www.robamusic.com/' },
  { country: 'Germany',        name: 'Schott Music',                                            type: 'Full Music Publisher',  reach: 'Global',   url: 'https://schott-music.com/' },
  // Italy
  { country: 'Italy',          name: 'Edizioni Curci',                                          type: 'Full Music Publisher',  reach: 'Regional', url: 'https://www.edizionicurci.it/' },
  { country: 'Italy',          name: 'Sugar Music (Publishing)',                                 type: 'Full Music Publisher',  reach: 'Global',   url: 'https://www.sugarmusic.com/' },
  // Netherlands
  { country: 'Netherlands',    name: 'Cloud 9 Music Publishing',                                type: 'Full Music Publisher',  reach: 'Global',   url: 'https://cloud9music.com/' },
  // Norway
  { country: 'Norway',         name: 'Propeller Music',                                         type: 'Full Music Publisher',  reach: 'Regional', url: 'https://propellermusic.no/' },
  // Portugal
  { country: 'Portugal',       name: 'Valentim de Carvalho (Publishing)',                       type: 'Full Music Publisher',  reach: 'Regional', url: 'https://valentimdecarvalho.com/' },
  // South Africa
  { country: 'South Africa',   name: 'Downtown Music Publishing Africa',                        type: 'Full Music Publisher',  reach: 'Regional', url: 'https://downtownmusicpublishing.africa/' },
  { country: 'South Africa',   name: 'Sheer Music Publishing',                                  type: 'Full Music Publisher',  reach: 'Regional', url: 'https://www.sheermusic.co.za/' },
  // Sweden
  { country: 'Sweden',         name: 'Polar Music Publishing',                                  type: 'Full Music Publisher',  reach: 'Global',   url: 'https://www.polarmusicpublishing.com/' },
  { country: 'Sweden',         name: 'Stockholm Songs',                                         type: 'Full Music Publisher',  reach: 'Global',   url: 'https://stockholmsongs.com/' },
  // United Kingdom
  { country: 'United Kingdom', name: 'Boosey & Hawkes',                                         type: 'Full Music Publisher',  reach: 'Global',   url: 'https://www.boosey.com/' },
  { country: 'United Kingdom', name: 'Bucks Music Group',                                       type: 'Full Music Publisher',  reach: 'Regional', url: 'https://bucksmusicgroup.com/' },
  { country: 'United Kingdom', name: 'Ditto Music Publishing',                                  type: 'Admin Music Publisher', reach: 'Global',   url: 'https://dittomusic.com/publishing' },
  { country: 'United Kingdom', name: 'Faber Music',                                             type: 'Full Music Publisher',  reach: 'Regional', url: 'https://www.fabermusic.com/' },
  { country: 'United Kingdom', name: 'KPM Music (Universal Production Music)',                  type: 'Full Music Publisher',  reach: 'Global',   url: 'https://www.universalproductionmusic.com/en-gb/discover/kpm-music' },
  { country: 'United Kingdom', name: 'Kobalt Music',                                            type: 'Admin Music Publisher', reach: 'Global',   url: 'https://www.kobaltmusic.com/' },
  { country: 'United Kingdom', name: 'Kudos Music Publishing',                                  type: 'Full Music Publisher',  reach: 'Regional', url: 'https://kudosmusic.com/' },
  { country: 'United Kingdom', name: 'Sentric Music Group',                                     type: 'Admin Music Publisher', reach: 'Global',   url: 'https://www.sentricmusic.com/' },
  { country: 'United Kingdom', name: 'Universal Production Music',                              type: 'Full Music Publisher',  reach: 'Global',   url: 'https://www.universalproductionmusic.com/' },
  { country: 'United Kingdom', name: 'Wise Music Group',                                        type: 'Full Music Publisher',  reach: 'Global',   url: 'https://wisemusic.com/' },
  // United States
  { country: 'United States',  name: 'BMG Production Music',                                    type: 'Full Music Publisher',  reach: 'Global',   url: 'https://www.bmgproductionmusic.com/' },
  { country: 'United States',  name: 'Big Deal Music Group',                                    type: 'Full Music Publisher',  reach: 'Global',   url: 'https://bigdealmusic.com/' },
  { country: 'United States',  name: 'Big Yellow Dog Music',                                    type: 'Full Music Publisher',  reach: 'Global',   url: 'https://bigyellowdogmusic.com/' },
  { country: 'United States',  name: 'CD Baby Pro Publishing',                                  type: 'Admin Music Publisher', reach: 'Global',   url: 'https://cdbaby.com/' },
  { country: 'United States',  name: 'Concord Music Publishing',                                type: 'Full Music Publisher',  reach: 'Global',   url: 'https://concord.com/publishing/' },
  { country: 'United States',  name: 'DistroKid Publishing Administration',                     type: 'Admin Music Publisher', reach: 'Global',   url: 'https://distrokid.com/publishing/' },
  { country: 'United States',  name: 'Downtown Music Publishing',                               type: 'Full Music Publisher',  reach: 'Global',   url: 'https://downtownmusic.com/publishing/' },
  { country: 'United States',  name: 'Downtown Music Services (Publishing Administration)',     type: 'Admin Music Publisher', reach: 'Global',   url: 'https://downtownmusic.com/services/publishing-administration/' },
  { country: 'United States',  name: 'Hal Leonard',                                             type: 'Full Music Publisher',  reach: 'Global',   url: 'https://www.halleonard.com/' },
  { country: 'United States',  name: 'Position Music',                                          type: 'Full Music Publisher',  reach: 'Global',   url: 'https://positionmusic.com/' },
  { country: 'United States',  name: 'Primary Wave Music',                                      type: 'Full Music Publisher',  reach: 'Global',   url: 'https://primarywave.com/' },
  { country: 'United States',  name: 'Pulse Music Group',                                       type: 'Full Music Publisher',  reach: 'Global',   url: 'https://pulsemusicgroup.com/' },
  { country: 'United States',  name: 'Reservoir Media',                                         type: 'Full Music Publisher',  reach: 'Global',   url: 'https://reservoir-media.com/' },
  { country: 'United States',  name: 'Round Hill Music',                                        type: 'Full Music Publisher',  reach: 'Global',   url: 'https://roundhillmusic.com/' },
  { country: 'United States',  name: 'Songtrust',                                               type: 'Admin Music Publisher', reach: 'Global',   url: 'https://www.songtrust.com/' },
  { country: 'United States',  name: 'Sony Music Publishing',                                   type: 'Full Music Publisher',  reach: 'Global',   url: 'https://www.sonymusicpublishing.com/' },
  { country: 'United States',  name: 'Spirit Music Group',                                      type: 'Full Music Publisher',  reach: 'Global',   url: 'https://spiritmusicgroup.com/' },
  { country: 'United States',  name: 'Symphonic Publishing',                                    type: 'Admin Music Publisher', reach: 'Global',   url: 'https://symphonic.com/publishing/' },
  { country: 'United States',  name: 'TuneCore Publishing Administration',                      type: 'Admin Music Publisher', reach: 'Global',   url: 'https://www.tunecore.com/publishing' },
  { country: 'United States',  name: 'Ultra Music Publishing',                                  type: 'Full Music Publisher',  reach: 'Global',   url: 'https://www.ultrapublishing.com/' },
  { country: 'United States',  name: 'Universal Music Publishing Group',                        type: 'Full Music Publisher',  reach: 'Global',   url: 'https://www.universalmusicpublishing.com/' },
  { country: 'United States',  name: 'Warner Chappell Music',                                   type: 'Full Music Publisher',  reach: 'Global',   url: 'https://www.warnerchappell.com/' },
  { country: 'United States',  name: 'peermusic',                                               type: 'Full Music Publisher',  reach: 'Global',   url: 'https://www.peermusic.com/' },
]

/** Sorted names for typeahead/autocomplete */
export const MUSIC_PUBLISHER_NAMES: string[] = [...MUSIC_PUBLISHERS.map(p => p.name)].sort((a, b) =>
  a.toLowerCase().localeCompare(b.toLowerCase())
)

/** Look up a publisher by name (case-insensitive exact match) */
export function findPublisher(name: string): MusicPublisher | undefined {
  const lower = name.toLowerCase().trim()
  return MUSIC_PUBLISHERS.find(p => p.name.toLowerCase() === lower)
}

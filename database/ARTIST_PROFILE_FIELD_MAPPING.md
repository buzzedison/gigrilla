# Artist Profile Field Mapping

This document maps the artist profile onboarding form fields to the database columns.

## Database Table: `user_profiles`

### Artist Details
| Form Field | Database Column | Type | Status | Migration |
|------------|----------------|------|--------|-----------|
| `stageName` | `stage_name` | TEXT | ✅ Exists | 012 |
| `formedDate` | `established_date` | DATE | ✅ Exists | 012 |
| `performingMembers` | `performing_members` | INTEGER | ✅ Added | 031 |
| `baseLocation` | `base_location` | TEXT | ✅ Exists | 012 |
| `baseLocationLat` | `base_location_lat` | DECIMAL(10,7) | ✅ Added | 031 |
| `baseLocationLon` | `base_location_lon` | DECIMAL(10,7) | ✅ Added | 031 |
| `publicGigsPerformed` | `gigs_performed` | INTEGER | ✅ Exists | 007 |

### Social Media
| Form Field | Database Column | Type | Status | Migration |
|------------|----------------|------|--------|-----------|
| `facebookUrl` | `facebook_url` | TEXT | ✅ Exists | 007 |
| `instagramUrl` | `instagram_url` | TEXT | ✅ Exists | 007 |
| `threadsUrl` | `threads_url` | TEXT | ✅ Added | 031 |
| `xUrl` | `x_url` | TEXT | ✅ Added | 031 |
| `tiktokUrl` | `tiktok_url` | TEXT | ✅ Added | 031 |
| `youtubeUrl` | `youtube_url` | TEXT | ✅ Exists | 007 |
| `snapchatUrl` | `snapchat_url` | TEXT | ✅ Added | 031 |

### Record Label
| Form Field | Database Column | Type | Status | Migration |
|------------|----------------|------|--------|-----------|
| `recordLabelStatus` | `record_label_status` | TEXT | ✅ Exists | 007 |
| `recordLabelName` | `record_label_name` | TEXT | ✅ Exists | 007 |
| `recordLabelContactName` | `record_label_contact_name` | TEXT | ✅ Exists | 007 |
| `recordLabelContactEmail` | `record_label_email` | TEXT | ✅ Exists | 007 |
| `recordLabelContactPhone` | `record_label_phone` | TEXT | ✅ Exists | 007 |

### Music Publisher
| Form Field | Database Column | Type | Status | Migration |
|------------|----------------|------|--------|-----------|
| `musicPublisherStatus` | `music_publisher_status` | TEXT | ✅ Exists | 007 |
| `musicPublisherName` | `music_publisher_name` | TEXT | ✅ Exists | 007 |
| `musicPublisherContactName` | `music_publisher_contact_name` | TEXT | ✅ Exists | 007 |
| `musicPublisherContactEmail` | `music_publisher_email` | TEXT | ✅ Exists | 007 |
| `musicPublisherContactPhone` | `music_publisher_phone` | TEXT | ✅ Exists | 007 |

### Artist Manager
| Form Field | Database Column | Type | Status | Migration |
|------------|----------------|------|--------|-----------|
| `artistManagerStatus` | `artist_manager_status` | TEXT | ✅ Exists | 007 |
| `artistManagerName` | `artist_manager_name` | TEXT | ✅ Exists | 007 |
| `artistManagerContactName` | `artist_manager_contact_name` | TEXT | ✅ Exists | 007 |
| `artistManagerContactEmail` | `artist_manager_email` | TEXT | ✅ Exists | 007 |
| `artistManagerContactPhone` | `artist_manager_phone` | TEXT | ✅ Exists | 007 |

### Booking Agent
| Form Field | Database Column | Type | Status | Migration |
|------------|----------------|------|--------|-----------|
| `bookingAgentStatus` | `booking_agent_status` | TEXT | ✅ Exists | 007 |
| `bookingAgentName` | `booking_agent_name` | TEXT | ✅ Exists | 007 |
| `bookingAgentContactName` | `booking_agent_contact_name` | TEXT | ✅ Exists | 007 |
| `bookingAgentContactEmail` | `booking_agent_email` | TEXT | ✅ Exists | 007 |
| `bookingAgentContactPhone` | `booking_agent_phone` | TEXT | ✅ Exists | 007 |

## Summary

**Total Fields:** 37
- **Already in Database:** 30 fields (81%)
- **Added in Migration 031:** 7 fields (19%)

### New Fields Added (Migration 031):
1. `threads_url` - Threads social media profile
2. `x_url` - X (formerly Twitter) profile
3. `tiktok_url` - TikTok profile
4. `snapchat_url` - Snapchat profile
5. `base_location_lat` - Latitude for gig distance calculations
6. `base_location_lon` - Longitude for gig distance calculations
7. `performing_members` - Number of performing members

## To Apply Migration

Run the migration file:
```bash
psql -d your_database < database/migrations/031_add_missing_artist_profile_fields.sql
```

Or apply via Supabase dashboard SQL editor.

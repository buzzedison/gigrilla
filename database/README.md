# Gigrilla Database Schema

Complete PostgreSQL database schema for the Gigrilla music industry platform.

## 📁 Directory Structure

```
database/
├── schema.sql              # 🏆 MASTER FILE - Run this first!
├── schema/                 # Individual schema files
│   ├── 00_init.sql        # Database initialization
│   ├── 01_core_tables.sql # Users, profiles, auth
│   ├── 02_music_content.sql # Tracks, albums, playlists
│   ├── 03_gig_management.sql # Gigs, venues, bookings
│   ├── 04_industry_services.sql # Services & professionals
│   ├── 05_social_features.sql # Posts, messages, feeds
│   ├── 06_commerce.sql    # Merchandise, payments
│   ├── 07_admin_analytics.sql # Admin & reporting
│   └── 08_ddex_enhancements.sql # 🆕 DDEX compliance
├── seeds.sql              # Master seed data file
├── seeds/                 # Seed data files
│   └── 01_taxonomy_seed.sql # Initial taxonomy data
└── README.md             # This file
```

## 🚀 Quick Start

### 1. Create Database Schema
```bash
# Run the master schema file
psql -d your_database -f database/schema.sql
```

### 2. Seed Initial Data
```bash
# Run the seed data
psql -d your_database -f database/seeds.sql
```

### 3. Verify Installation
```sql
-- Check if tables were created
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;
```

## 📊 Database Overview

### Core Tables (140+ tables total)
- **Users & Authentication**: User management, profiles, sessions
- **Music Content**: Tracks, albums, playlists, charts, genres
- **Gig Management**: Venues, gigs, bookings, tickets, attendance
- **Industry Services**: Service providers, professionals, bookings
- **Social Features**: Posts, comments, messages, notifications
- **Commerce**: Merchandise, orders, payments, subscriptions
- **Admin & Analytics**: Admin tools, reporting, audit logs
- **DDEX Compliance**: Full DDEX standard implementation for music industry exchange

### Key Features
- **Multi-tenant Architecture**: Support for 4 user types (Artists, Venues, Services, Pros)
- **Complex Relationships**: Many-to-many relationships for gigs, services, content
- **Scalable Design**: Optimized indexes and partitioning ready
- **Industry Standards**: ISRC, UPC, ISWC, IPI, ISNI, DPID - full DDEX compliance
- **DDEX Ready**: ERN, DSR, RIN, MEAD, PIE standards supported
- **Audit Trail**: Complete logging of all changes
- **Analytics Ready**: Built-in event tracking and reporting

## 🎵 DDEX Compliance Features

### ✅ **Fully DDEX Compliant Schema**
- **ISRC**: International Standard Recording Code for tracks
- **UPC/GTIN**: Universal Product Code for releases
- **ISWC**: International Standard Musical Work Code for compositions
- **IPI**: Interested Parties Information Number
- **ISNI**: International Standard Name Identifier
- **DPID**: Digital Party Identifiers
- **GRid**: Global Release Identifier
- **ICPN**: International Copyright Protection Number

### 📊 **DDEX Standards Supported**
- **ERN (Electronic Release Notification)**: Release metadata exchange
- **DSR (Digital Sales Reporting)**: Usage and sales reporting
- **RIN (Recording Information Notification)**: Contributor and rights info
- **MEAD (Media Enrichment And Description)**: Enhanced metadata
- **PIE (Party Identification & Enrichment)**: Party data management

### 🔧 **DDEX Implementation Features**
- Contributor roles with DDEX role codes (MainArtist, Composer, Producer, etc.)
- Territory-specific rights management
- Technical audio specifications (LUFS, peak levels, sample rates)
- Musical work management with ISWC codes
- Usage event tracking for royalty reporting
- P-line and C-line copyright information
- Release profiles and deal terms
- Party relationship management

## 🔧 Schema Files Breakdown

### 00_init.sql
- Database extensions (UUID, crypto)
- Custom types (enums)
- Version tracking table

### 01_core_tables.sql
- `users` - Main user table extending Supabase auth
- `user_profiles` - Multi-type profile support
- `user_preferences` - User settings
- `user_sessions` - Session tracking

### 02_music_content.sql
- `tracks`, `albums`, `playlists` - Music content
- `genres`, `moods` - Content classification
- `charts`, `chart_entries` - Chart system
- Play history and user interactions

### 03_gig_management.sql
- `venues`, `venue_stages` - Venue management
- `gigs`, `gig_bookings` - Event system
- `tickets`, `ticket_purchases` - Ticketing
- Attendance and reviews

### 04_industry_services.sql
- Service categories and types
- Service providers and professionals
- Booking and quoting system
- Reviews and ratings

### 05_social_features.sql
- Posts, comments, likes
- Following and subscriptions
- Messages and conversations
- Notifications and feeds

### 06_commerce.sql
- Merchandise and products
- Orders and payments
- Subscriptions and payouts
- Coupons and discounts

### 07_admin_analytics.sql
- Admin users and permissions
- Audit logging
- Analytics and reporting
- Content moderation

### 08_ddex_enhancements.sql
- DDEX party management (ISNI, IPI, DPID)
- Contributor roles and relationships
- Release management with GRid and ICPN
- Territory rights management
- Technical metadata (sample rate, bit depth, LUFS)
- Musical works and compositions (ISWC)
- Usage reporting for DSR compliance
- DDEX role codes and validation

## 🎯 User Types Supported

### 1. Artists (8 types)
- Live Gig & Original Recording Artist
- Original Recording Artist
- Live Gig Artist (Cover/Tribute)
- Vocalist for Hire
- Instrumentalist for Hire
- Songwriter for Hire
- Lyricist for Hire
- Composer for Hire

### 2. Venues (7 types)
- Public Live Gig Music Venue
- Private Live Gig Music Venue
- Dedicated Live Gig Music Venue
- Live Gig Music Festival
- Live Gig Music Promoter
- Fan's Live Music Gig (Public/Private)

### 3. Music Services (20 categories)
- Accounting & Tax
- Artist/Booking/Tour Management
- Coaching & Development
- Event Hospitality/Production/Safety
- Freight & Logistics
- Funding, Finance & Insurance
- Instrument Hire & Repair
- Media Companies
- Music Distribution/Education/Law/Publishing
- Promotion & Branding
- Record Labels
- Studios & Production
- Sync Licensing
- Travel & Accommodation

### 4. Industry Pros (28 types)
- Artist Managers, Booking Agents
- Coaches, Educators, Equipment Specialists
- Event Production Professionals
- Financial & Legal Experts
- Marketing & Media Professionals
- Music Industry Specialists

## 🔍 Key Design Decisions

### 1. User Profile Flexibility
- Single `users` table with `user_profiles` for type-specific data
- JSONB fields for flexible metadata
- Polymorphic relationships for multi-type support

### 2. Music Industry Specific Features
- ISRC, UPC, and other industry standard codes
- Complex gig booking and ticketing system
- Royalty and rights management ready
- Chart and playlist management

### 3. Scalability Considerations
- UUID primary keys for distributed systems
- Proper indexing on frequently queried columns
- JSONB for flexible data structures
- Partitioning ready for large tables

### 4. Security & Compliance
- Row Level Security (RLS) ready
- Audit logging for all changes
- GDPR-compliant data handling
- Content moderation system

## 📈 Performance Optimizations

### Indexes
- Primary keys on all tables
- Foreign key indexes
- Composite indexes on common query patterns
- Partial indexes for active records
- Full-text search indexes where needed

### Query Optimization
- Efficient joins with proper cardinalities
- JSONB operators for flexible queries
- Array operations for tags and categories
- Time-based partitioning for large tables

## 🔄 Migrations

### Adding New Tables
1. Create new schema file: `schema/08_new_feature.sql`
2. Update `schema.sql` to include new file
3. Test migration in development
4. Deploy to production

### Modifying Existing Tables
1. Create migration file: `migrations/001_add_new_column.sql`
2. Use `ALTER TABLE` statements
3. Update indexes if needed
4. Test thoroughly

## 🧪 Testing

### Schema Validation
```sql
-- Check all tables exist
SELECT COUNT(*) as table_count FROM information_schema.tables
WHERE table_schema = 'public';

-- Validate foreign keys
SELECT conname, conrelid::regclass, confrelid::regclass
FROM pg_constraint WHERE contype = 'f';
```

### Data Integrity
```sql
-- Check for orphaned records
SELECT 'Check complete' as status;
-- Add specific validation queries as needed
```

## 📚 Additional Resources

- [Supabase Documentation](https://supabase.com/docs)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Database Design Best Practices](https://www.lucidchart.com/pages/database-diagram/database-design)

## 🤝 Contributing

When modifying the schema:
1. Update the appropriate schema file
2. Update this README if needed
3. Test changes thoroughly
4. Document any breaking changes
5. Update version numbers

## 📞 Support

For database-related issues:
1. Check the schema files for table definitions
2. Review indexes for query performance
3. Check audit logs for data issues
4. Contact the development team

---

**Last Updated**: December 2024
**Version**: 1.0.0
**Total Tables**: 120+
**Total Indexes**: 80+

-- Insert reference data for the tables that were created but might be empty

-- Insert artist types data
INSERT INTO artist_types (id, name, description) VALUES 
(1, 'Live Gig & Original Recording Artist', 'Artists who perform live and create original recordings'),
(2, 'Original Recording Artist', 'Artists focused on creating original recorded music'),
(3, 'Live Gig Artist (Cover/Tribute/Classical)', 'Artists who perform live covers, tributes, or classical music'),
(4, 'Vocalist for Hire', 'Professional vocalists available for hire'),
(5, 'Instrumentalist for Hire', 'Professional instrumentalists available for hire'),
(6, 'Songwriter for Hire', 'Professional songwriters available for hire'),
(7, 'Lyricist for Hire', 'Professional lyricists available for hire'),
(8, 'Composer for Hire', 'Professional composers available for hire')
ON CONFLICT (id) DO NOTHING;

-- Insert venue types data
INSERT INTO venue_types (id, name, description) VALUES 
(1, 'Public Live Gig Music Venue', 'Public venues that host live music events'),
(2, 'Private Live Gig Music Venue', 'Private venues available for live music events'),
(3, 'Dedicated Live Gig Music Venue', 'Venues specifically designed for live music'),
(4, 'Live Gig Music Festival', 'Festival organizers and festival venues'),
(5, 'Live Gig Music Promoter', 'Music promotion companies and individuals'),
(6, 'Fan''s Live Music Gig (Public)', 'Public events organized by fans'),
(7, 'Fan''s Live Music Gig (Private)', 'Private events organized by fans')
ON CONFLICT (id) DO NOTHING;

-- Insert professional types data
INSERT INTO pro_types (id, name, description) VALUES 
(1, 'Music Industry Professional', 'General music industry professional'),
(2, 'A&R Representative', 'Artist and Repertoire professionals'),
(3, 'Music Producer', 'Professional music producers'),
(4, 'Audio Engineer', 'Sound and audio engineering professionals'),
(5, 'Music Manager', 'Artist and band managers'),
(6, 'Music Promoter', 'Event and music promotion professionals'),
(7, 'Music Journalist', 'Music industry journalists and writers'),
(8, 'Music Educator', 'Music teachers and educational professionals'),
(9, 'Music Therapist', 'Music therapy professionals'),
(10, 'Music Lawyer', 'Legal professionals specializing in music')
ON CONFLICT (id) DO NOTHING;

-- Verify the data was inserted
SELECT 'Artist Types:' as table_name, COUNT(*) as record_count FROM artist_types
UNION ALL
SELECT 'Venue Types:', COUNT(*) FROM venue_types  
UNION ALL
SELECT 'Pro Types:', COUNT(*) FROM pro_types
UNION ALL
SELECT 'User Genre Preferences:', COUNT(*) FROM user_genre_preferences;

-- Show sample data
SELECT 'Sample Artist Types:' as info;
SELECT id, name FROM artist_types ORDER BY id LIMIT 3;

SELECT 'Sample Venue Types:' as info;
SELECT id, name FROM venue_types ORDER BY id LIMIT 3;

SELECT 'Sample Pro Types:' as info;
SELECT id, name FROM pro_types ORDER BY id LIMIT 3;

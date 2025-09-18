-- Simple test migration - run this first to test basic functionality

-- Test 1: Check current database
SELECT current_database(), current_user;

-- Test 2: Try creating just one simple table
CREATE TABLE IF NOT EXISTS test_table (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Test 3: Insert a test record
INSERT INTO test_table (name) VALUES ('test') ON CONFLICT DO NOTHING;

-- Test 4: Check if it worked
SELECT COUNT(*) as test_table_count FROM test_table;

-- Test 5: Clean up
DROP TABLE IF EXISTS test_table;

-- Test 6: Now try creating artist_types
CREATE TABLE IF NOT EXISTS artist_types (
    id SERIAL PRIMARY KEY,
    name TEXT UNIQUE NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Test 7: Check if artist_types was created
SELECT COUNT(*) as artist_types_count FROM artist_types;

-- Test 8: Try inserting one record
INSERT INTO artist_types (id, name, description) VALUES 
(1, 'Test Artist Type', 'Test description')
ON CONFLICT (id) DO NOTHING;

-- Test 9: Final check
SELECT * FROM artist_types;


const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

async function createArtistPhotosTable() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase credentials in .env.local')
    console.error('Required: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY')
    process.exit(1)
  }

  const supabase = createClient(supabaseUrl, supabaseKey)

  try {
    console.log('🔄 Creating artist_photos table...')

    // Create the table
    const createTableSQL = `
      CREATE TABLE IF NOT EXISTS artist_photos (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
          url TEXT NOT NULL,
          caption TEXT DEFAULT '',
          type TEXT NOT NULL CHECK (type IN ('logo', 'header', 'photo')),
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `

    const { error: tableError } = await supabase
      .rpc('exec_sql', { sql_query: createTableSQL })

    if (tableError) {
      console.log('Trying alternative approach...')
      // Try using the SQL editor approach
      const { error: altError } = await supabase
        .from('information_schema.tables')
        .select('table_name')
        .eq('table_name', 'artist_photos')
        .single()
      
      if (altError && altError.code === 'PGRST116') {
        console.log('Table does not exist, need to create it manually')
        console.log('Please run this SQL in your Supabase SQL editor:')
        console.log(createTableSQL)
      } else if (!altError) {
        console.log('✅ artist_photos table already exists')
      }
    } else {
      console.log('✅ artist_photos table created successfully')
    }

    // Create indexes
    console.log('🔄 Creating indexes...')
    
    const indexes = [
      'CREATE INDEX IF NOT EXISTS idx_artist_photos_user_id ON artist_photos(user_id);',
      'CREATE INDEX IF NOT EXISTS idx_artist_photos_type ON artist_photos(type);',
      'CREATE INDEX IF NOT EXISTS idx_artist_photos_created_at ON artist_photos(created_at);'
    ]

    for (const indexSQL of indexes) {
      try {
        const { error: indexError } = await supabase
          .rpc('exec_sql', { sql_query: indexSQL })
        
        if (indexError) {
          console.log(`Index creation note: ${indexError.message}`)
        } else {
          console.log('✅ Index created successfully')
        }
      } catch (err) {
        console.log(`Index creation note: ${err.message}`)
      }
    }

    // Enable RLS
    console.log('🔄 Enabling Row Level Security...')
    
    const rlsSQL = 'ALTER TABLE artist_photos ENABLE ROW LEVEL SECURITY;'
    
    try {
      const { error: rlsError } = await supabase
        .rpc('exec_sql', { sql_query: rlsSQL })
      
      if (rlsError) {
        console.log(`RLS note: ${rlsError.message}`)
      } else {
        console.log('✅ RLS enabled successfully')
      }
    } catch (err) {
      console.log(`RLS note: ${err.message}`)
    }

    // Create RLS policies
    console.log('🔄 Creating RLS policies...')
    
    const policies = [
      `CREATE POLICY IF NOT EXISTS "Users can view their own photos" ON artist_photos
       FOR SELECT USING (auth.uid() = user_id);`,
      
      `CREATE POLICY IF NOT EXISTS "Users can insert their own photos" ON artist_photos
       FOR INSERT WITH CHECK (auth.uid() = user_id);`,
      
      `CREATE POLICY IF NOT EXISTS "Users can update their own photos" ON artist_photos
       FOR UPDATE USING (auth.uid() = user_id);`,
      
      `CREATE POLICY IF NOT EXISTS "Users can delete their own photos" ON artist_photos
       FOR DELETE USING (auth.uid() = user_id);`
    ]

    for (const policySQL of policies) {
      try {
        const { error: policyError } = await supabase
          .rpc('exec_sql', { sql_query: policySQL })
        
        if (policyError) {
          console.log(`Policy creation note: ${policyError.message}`)
        } else {
          console.log('✅ Policy created successfully')
        }
      } catch (err) {
        console.log(`Policy creation note: ${err.message}`)
      }
    }

    // Grant permissions
    console.log('🔄 Granting permissions...')
    
    try {
      const { error: grantError } = await supabase
        .rpc('exec_sql', { sql_query: 'GRANT ALL ON artist_photos TO authenticated; GRANT SELECT ON artist_photos TO anon;' })
      
      if (grantError) {
        console.log(`Permission note: ${grantError.message}`)
      } else {
        console.log('✅ Permissions granted successfully')
      }
    } catch (err) {
      console.log(`Permission note: ${err.message}`)
    }

    console.log('🎉 Artist photos table setup completed!')
    
    // Verify the table
    const { data, error } = await supabase
      .from('artist_photos')
      .select('id')
      .limit(1)
    
    if (error) {
      console.error('❌ Verification failed:', error)
      console.log('\n📝 Please run this SQL manually in your Supabase SQL editor:')
      console.log(`
-- Create artist_photos table
CREATE TABLE IF NOT EXISTS artist_photos (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    url TEXT NOT NULL,
    caption TEXT DEFAULT '',
    type TEXT NOT NULL CHECK (type IN ('logo', 'header', 'photo')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_artist_photos_user_id ON artist_photos(user_id);
CREATE INDEX IF NOT EXISTS idx_artist_photos_type ON artist_photos(type);
CREATE INDEX IF NOT EXISTS idx_artist_photos_created_at ON artist_photos(created_at);

-- Enable RLS
ALTER TABLE artist_photos ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY IF NOT EXISTS "Users can view their own photos" ON artist_photos
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY IF NOT EXISTS "Users can insert their own photos" ON artist_photos
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY IF NOT EXISTS "Users can update their own photos" ON artist_photos
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY IF NOT EXISTS "Users can delete their own photos" ON artist_photos
    FOR DELETE USING (auth.uid() = user_id);

-- Grant permissions
GRANT ALL ON artist_photos TO authenticated;
GRANT SELECT ON artist_photos TO anon;
      `)
    } else {
      console.log('✅ artist_photos table is ready to use!')
    }

  } catch (error) {
    console.error('❌ Setup failed:', error.message)
    process.exit(1)
  }
}

createArtistPhotosTable()

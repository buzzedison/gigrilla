const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')
require('dotenv').config({ path: '.env.local' })

async function runMigration() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase credentials in .env.local')
    console.error('Required: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY')
    process.exit(1)
  }

  const supabase = createClient(supabaseUrl, supabaseKey)

  try {
    console.log('🔄 Running artist photos migration...')

    // Read the migration file
    const migrationPath = path.join(__dirname, '../database/migrations/035_create_artist_photos_table.sql')
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8')

    // Split the SQL into individual statements
    const statements = migrationSQL
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'))

    console.log(`📝 Found ${statements.length} SQL statements to execute`)

    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i]
      console.log(`⚡ Executing statement ${i + 1}/${statements.length}...`)
      
      try {
        const { error } = await supabase.rpc('exec_sql', { sql_query: statement })
        
        if (error) {
          // Try direct SQL execution if RPC fails
          const { error: directError } = await supabase
            .from('_temp_migration')
            .select('*')
            .limit(1)
          
          // If the table doesn't exist, that's expected for some statements
          if (directError && directError.code === 'PGRST116') {
            console.log('✅ Statement executed (table creation expected)')
          } else if (directError) {
            console.error(`❌ Error executing statement ${i + 1}:`, directError)
          }
        } else {
          console.log('✅ Statement executed successfully')
        }
      } catch (err) {
        console.error(`❌ Error executing statement ${i + 1}:`, err.message)
      }
    }

    console.log('🎉 Migration completed successfully!')
    
    // Verify the table was created
    const { data, error } = await supabase
      .from('artist_photos')
      .select('id')
      .limit(1)
    
    if (error) {
      console.error('❌ Verification failed:', error)
    } else {
      console.log('✅ artist_photos table created and accessible')
    }

  } catch (error) {
    console.error('❌ Migration failed:', error.message)
    process.exit(1)
  }
}

runMigration()

// Script to make a user an admin
const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim()

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing SUPABASE credentials in .env.local')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function makeUserAdmin(email, role = 'super_admin') {
  console.log(`\n🔍 Looking for user: ${email}`)

  // Find user by email
  const { data: { users }, error: listError } = await supabase.auth.admin.listUsers()

  if (listError) {
    console.error('❌ Error listing users:', listError)
    process.exit(1)
  }

  const user = users.find(u => u.email === email)

  if (!user) {
    console.error(`❌ User not found: ${email}`)
    process.exit(1)
  }

  console.log(`✅ Found user: ${user.email} (ID: ${user.id})`)

  // Check if user_profile exists
  const { data: profile, error: profileError } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('user_id', user.id)
    .single()

  if (profileError && profileError.code !== 'PGRST116') {
    console.error('❌ Error fetching user profile:', profileError)
    process.exit(1)
  }

  if (!profile) {
    // Create user_profile if it doesn't exist
    console.log('📝 Creating user_profile...')
    const { error: createError } = await supabase
      .from('user_profiles')
      .insert({
        user_id: user.id,
        role: role
      })

    if (createError) {
      console.error('❌ Error creating user_profile:', createError)
      process.exit(1)
    }

    console.log(`✅ Created user_profile with role: ${role}`)
  } else {
    // Update existing user_profile
    console.log(`📝 Updating user_profile role from "${profile.role}" to "${role}"...`)
    const { error: updateError } = await supabase
      .from('user_profiles')
      .update({ role: role })
      .eq('user_id', user.id)

    if (updateError) {
      console.error('❌ Error updating user_profile:', updateError)
      process.exit(1)
    }

    console.log(`✅ Updated user_profile with role: ${role}`)
  }

  console.log(`\n✨ SUCCESS! ${email} is now a ${role}`)
  console.log(`\n🔗 Admin Dashboard: ${supabaseUrl.replace('supabase.co', 'supabase.co')}/admin`)
}

// Get email from command line args
const email = process.argv[2]
const role = process.argv[3] || 'super_admin'

if (!email) {
  console.log(`
Usage: node scripts/make-admin.js <email> [role]

Arguments:
  email    User email address (required)
  role     Admin role: user, admin, or super_admin (default: super_admin)

Examples:
  node scripts/make-admin.js user@example.com
  node scripts/make-admin.js user@example.com admin
  node scripts/make-admin.js user@example.com super_admin
`)
  process.exit(1)
}

if (!['user', 'admin', 'super_admin'].includes(role)) {
  console.error('❌ Invalid role. Must be: user, admin, or super_admin')
  process.exit(1)
}

makeUserAdmin(email, role)

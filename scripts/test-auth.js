#!/usr/bin/env node

/**
 * Authentication Test Script
 * Tests the authentication system and session management
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

async function testAuth() {
  console.log('🧪 Starting Authentication Tests...\n');

  // Load environment variables
  require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Missing Supabase environment variables');
    console.error('Make sure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are set in .env.local');
    process.exit(1);
  }

  console.log('📡 Connecting to Supabase...');
  console.log(`URL: ${supabaseUrl}`);
  console.log(`Key: ${supabaseKey.substring(0, 20)}...`);

  const supabase = createClient(supabaseUrl, supabaseKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });

  // Test 1: Database Connection
  console.log('\n🗄️  Test 1: Database Connection');
  try {
    const { data, error } = await supabase
      .from('users')
      .select('count')
      .limit(1);

    if (error) {
      console.error('❌ Database connection failed:', error.message);
    } else {
      console.log('✅ Database connection successful');
      console.log(`📊 User count: ${data?.[0]?.count || 0}`);
    }
  } catch (err) {
    console.error('❌ Database connection error:', err.message);
  }

  // Test 2: Auth Status
  console.log('\n🔐 Test 2: Authentication Status');
  try {
    const { data: { user }, error } = await supabase.auth.getUser();

    if (error) {
      console.error('❌ Auth getUser failed:', error.message);
    } else if (user) {
      console.log('✅ User authenticated:');
      console.log(`   ID: ${user.id}`);
      console.log(`   Email: ${user.email}`);
      console.log(`   Metadata: ${JSON.stringify(user.user_metadata, null, 2)}`);
    } else {
      console.log('❌ No authenticated user found');
    }
  } catch (err) {
    console.error('❌ Auth getUser error:', err.message);
  }

  // Test 3: Session Status
  console.log('\n🔑 Test 3: Session Status');
  try {
    const { data: { session }, error } = await supabase.auth.getSession();

    if (error) {
      console.error('❌ Session getSession failed:', error.message);
    } else if (session) {
      console.log('✅ Session found:');
      console.log(`   User ID: ${session.user.id}`);
      console.log(`   Expires: ${new Date(session.expires_at * 1000).toISOString()}`);
      console.log(`   Token: ${session.access_token.substring(0, 20)}...`);
    } else {
      console.log('❌ No session found');
    }
  } catch (err) {
    console.error('❌ Session getSession error:', err.message);
  }

  // Test 4: API Endpoints
  console.log('\n🌐 Test 4: API Endpoints');
  try {
    const baseUrl = process.env.NODE_ENV === 'production'
      ? 'https://your-domain.com'
      : 'http://localhost:3000';

    const endpoints = [
      '/api/fan-profile',
      '/api/fan-status'
    ];

    for (const endpoint of endpoints) {
      try {
        const response = await fetch(`${baseUrl}${endpoint}`, {
          headers: {
            'Content-Type': 'application/json',
          },
        });

        console.log(`📡 ${endpoint}: ${response.status} ${response.statusText}`);

        if (response.ok) {
          const data = await response.json();
          console.log(`   ✅ Response: ${JSON.stringify(data, null, 2)}`);
        } else {
          const error = await response.text();
          console.log(`   ❌ Error: ${error}`);
        }
      } catch (err) {
        console.log(`   ❌ Fetch failed: ${err.message}`);
      }
    }
  } catch (err) {
    console.error('❌ API endpoints test failed:', err.message);
  }

  // Test 5: Create Test User (if needed)
  console.log('\n👤 Test 5: Create Test User');
  try {
    const testEmail = 'test-auth-' + Date.now() + '@example.com';
    const testPassword = 'testpassword123';

    console.log(`Creating test user: ${testEmail}`);

    const { data, error } = await supabase.auth.signUp({
      email: testEmail,
      password: testPassword,
      options: {
        data: {
          first_name: 'Test',
          last_name: 'User',
          account_type: 'guest',
          user_role: 'fan'
        }
      }
    });

    if (error) {
      console.log('❌ Test user creation failed:', error.message);
    } else {
      console.log('✅ Test user created successfully');
      console.log(`   User ID: ${data.user?.id}`);
      console.log(`   Email: ${data.user?.email}`);
    }
  } catch (err) {
    console.error('❌ Test user creation error:', err.message);
  }

  console.log('\n🏁 Authentication tests completed!');
}

// Run the test
testAuth().catch(console.error);

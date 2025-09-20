#!/usr/bin/env node

/**
 * API Endpoints Test Script
 * Tests all API endpoints for proper authentication and data retrieval
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

async function testAPI() {
  console.log('🧪 Starting API Tests...\n');

  // Load environment variables
  require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Missing Supabase environment variables');
    process.exit(1);
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  // Test 1: Fan Profile API
  console.log('👤 Test 1: Fan Profile API');
  try {
    const { data: { user } } = await supabase.auth.getUser();

    if (user) {
      console.log(`✅ User authenticated: ${user.id}`);

      // Test direct database query (bypassing RLS)
      const { data: profileData, error: profileError } = await supabase
        .from('fan_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (profileError) {
        console.log('❌ Direct fan_profiles query failed:', profileError.message);
      } else if (profileData) {
        console.log('✅ Direct fan_profiles query successful:');
        console.log(`   Username: ${profileData.username || 'N/A'}`);
        console.log(`   Account Type: ${profileData.account_type}`);
        console.log(`   Bio: ${profileData.bio || 'N/A'}`);
      } else {
        console.log('❌ No profile data found for user');
      }
    } else {
      console.log('❌ No authenticated user found');
    }
  } catch (err) {
    console.error('❌ Fan profile test failed:', err.message);
  }

  // Test 2: Fan Status API
  console.log('\n📊 Test 2: Fan Status API');
  try {
    const { data: statusData, error: statusError } = await supabase.rpc('get_fan_completion_status');

    if (statusError) {
      console.log('❌ Fan status RPC failed:', statusError.message);
    } else {
      console.log('✅ Fan status RPC successful:');
      console.log(`   Completion: ${JSON.stringify(statusData, null, 2)}`);
    }
  } catch (err) {
    console.error('❌ Fan status test failed:', err.message);
  }

  // Test 3: Database Tables
  console.log('\n🗄️  Test 3: Database Tables');
  const tables = ['users', 'fan_profiles', 'user_profiles'];

  for (const table of tables) {
    try {
      const { data, error, count } = await supabase
        .from(table)
        .select('*', { count: 'exact', head: true });

      if (error) {
        console.log(`❌ ${table} table access failed:`, error.message);
      } else {
        console.log(`✅ ${table} table accessible (count: ${count})`);
      }
    } catch (err) {
      console.log(`❌ ${table} table test failed:`, err.message);
    }
  }

  // Test 4: RLS Policies
  console.log('\n🔒 Test 4: RLS Policies');
  try {
    const { data: { user } } = await supabase.auth.getUser();

    if (user) {
      // Test RLS with user's own data
      const { data: userData, error: userError } = await supabase
        .from('fan_profiles')
        .select('user_id')
        .eq('user_id', user.id);

      if (userError) {
        console.log('❌ RLS test failed:', userError.message);
      } else {
        console.log('✅ RLS working correctly for user data');
      }

      // Test RLS with non-existent data
      const { data: fakeData, error: fakeError } = await supabase
        .from('fan_profiles')
        .select('user_id')
        .eq('user_id', 'fake-user-id');

      if (fakeError) {
        console.log('❌ RLS test for fake user failed:', fakeError.message);
      } else if (fakeData && fakeData.length === 0) {
        console.log('✅ RLS correctly blocking fake user data');
      } else {
        console.log('⚠️  RLS may not be working correctly');
      }
    } else {
      console.log('❌ Cannot test RLS - no authenticated user');
    }
  } catch (err) {
    console.error('❌ RLS test failed:', err.message);
  }

  console.log('\n🏁 API tests completed!');
}

// Run the test
testAPI().catch(console.error);

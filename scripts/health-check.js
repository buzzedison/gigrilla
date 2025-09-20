#!/usr/bin/env node

/**
 * Quick Health Check Script
 * Fast verification that auth system and APIs are working
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

async function healthCheck() {
  console.log('🏥 Quick Health Check...\n');

  // Load environment variables
  require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.error('❌ FAIL: Missing Supabase environment variables');
    process.exit(1);
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  let allGood = true;

  // Test 1: Database Connection
  console.log('1. Testing database connection...');
  try {
    const { error } = await supabase.from('users').select('count').limit(1);
    if (error) {
      console.log('❌ FAIL: Database connection');
      allGood = false;
    } else {
      console.log('✅ PASS: Database connection');
    }
  } catch (err) {
    console.log('❌ FAIL: Database connection');
    allGood = false;
  }

  // Test 2: Auth Status
  console.log('2. Testing authentication...');
  try {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error || !user) {
      console.log('❌ FAIL: Authentication');
      allGood = false;
    } else {
      console.log('✅ PASS: Authentication');
    }
  } catch (err) {
    console.log('❌ FAIL: Authentication');
    allGood = false;
  }

  // Test 3: API Endpoints
  console.log('3. Testing API endpoints...');
  try {
    const baseUrl = 'http://localhost:3000';
    const response = await fetch(`${baseUrl}/api/fan-profile`);
    const data = await response.json();

    if (response.ok && data) {
      console.log('✅ PASS: API endpoints');
    } else {
      console.log('❌ FAIL: API endpoints');
      allGood = false;
    }
  } catch (err) {
    console.log('❌ FAIL: API endpoints');
    allGood = false;
  }

  // Test 4: Session Management
  console.log('4. Testing session management...');
  try {
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error || !session) {
      console.log('❌ FAIL: Session management');
      allGood = false;
    } else {
      console.log('✅ PASS: Session management');
    }
  } catch (err) {
    console.log('❌ FAIL: Session management');
    allGood = false;
  }

  console.log('\n' + (allGood ? '✅ ALL TESTS PASSED' : '❌ SOME TESTS FAILED'));

  if (allGood) {
    console.log('\n🎉 Health check completed successfully!');
    console.log('💡 Run `npm run test:auth` for detailed testing');
  } else {
    console.log('\n⚠️  Some issues found. Check the logs above.');
    console.log('💡 Run `npm run test:auth` for detailed diagnostics');
  }

  process.exit(allGood ? 0 : 1);
}

// Run the health check
healthCheck().catch(console.error);

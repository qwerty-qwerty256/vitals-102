#!/usr/bin/env tsx

/**
 * Simple connection test to diagnose Supabase connectivity issues
 */

import 'dotenv/config';

// Disable SSL verification for development (ISP certificate issues)
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '1';

async function testConnection() {
  console.log('\n🔍 Testing Supabase connection...\n');

  // Check environment variables
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    console.error('❌ Missing environment variables');
    console.log('   SUPABASE_URL:', url ? '✓' : '✗');
    console.log('   SUPABASE_SERVICE_ROLE_KEY:', key ? '✓' : '✗');
    process.exit(1);
  }

  console.log('✅ Environment variables found');
  console.log(`   URL: ${url}`);
  console.log(`   Key: ${key.substring(0, 20)}...`);

  // Test basic HTTP connection
  console.log('\n📡 Testing HTTP connection...');
  try {
    const response = await fetch(`${url}/rest/v1/`, {
      headers: {
        apikey: key,
        Authorization: `Bearer ${key}`,
      },
    });

    console.log(`   Status: ${response.status} ${response.statusText}`);

    if (response.ok) {
      console.log('✅ HTTP connection successful');
    } else {
      console.error('❌ HTTP connection failed');
      const text = await response.text();
      console.error('   Response:', text);
    }
  } catch (error) {
    console.error('❌ HTTP connection error:', error);
    
    if (error instanceof Error) {
      console.error('   Error name:', error.name);
      console.error('   Error message:', error.message);
      
      // Check for common issues
      if (error.message.includes('ENOTFOUND')) {
        console.log('\n💡 DNS resolution failed. Check your internet connection.');
      } else if (error.message.includes('ECONNREFUSED')) {
        console.log('\n💡 Connection refused. Check if the URL is correct.');
      } else if (error.message.includes('certificate')) {
        console.log('\n💡 SSL certificate issue. Try setting NODE_TLS_REJECT_UNAUTHORIZED=0 (not recommended for production)');
      }
    }
    process.exit(1);
  }

  // Test Supabase client
  console.log('\n📦 Testing Supabase client...');
  try {
    const { createClient } = await import('@supabase/supabase-js');
    const supabase = createClient(url, key);

    const { data, error } = await supabase
      .from('biomarker_definitions')
      .select('name_normalized')
      .limit(1);

    if (error) {
      console.error('❌ Supabase query failed:', error.message);
      process.exit(1);
    }

    console.log('✅ Supabase client working');
    console.log(`   Found ${data?.length || 0} biomarker(s)`);
  } catch (error) {
    console.error('❌ Supabase client error:', error);
    process.exit(1);
  }

  console.log('\n✨ All tests passed!\n');
}

testConnection();

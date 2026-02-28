#!/usr/bin/env tsx
/**
 * Direct Redis connection test to debug connection issues
 */
import { config } from 'dotenv';
import Redis from 'ioredis';

config();

async function testRedisConnection() {
  console.log('🔍 Testing Redis Connection Directly...\n');

  // Print environment variables
  console.log('Environment Variables:');
  console.log(`  REDIS_HOST: ${process.env.REDIS_HOST}`);
  console.log(`  REDIS_PORT: ${process.env.REDIS_PORT}`);
  console.log(`  REDIS_USERNAME: ${process.env.REDIS_USERNAME}`);
  console.log(`  REDIS_PASSWORD: ${process.env.REDIS_PASSWORD ? '***' : 'not set'}`);
  console.log('');

  const redisHost = process.env.REDIS_HOST || 'localhost';
  const redisPort = parseInt(process.env.REDIS_PORT || '6379');
  const redisPassword = process.env.REDIS_PASSWORD;
  const redisUsername = process.env.REDIS_USERNAME;

  console.log('Creating Redis client with configuration:');
  console.log(`  host: ${redisHost}`);
  console.log(`  port: ${redisPort}`);
  console.log(`  username: ${redisUsername}`);
  console.log(`  password: ${redisPassword ? '***' : 'not set'}`);
  console.log('');

  // Test 1: With username and password
  console.log('Test 1: Connecting with username and password...');
  try {
    const client1 = new Redis({
      host: redisHost,
      port: redisPort,
      username: redisUsername,
      password: redisPassword,
      connectTimeout: 10000,
      lazyConnect: true, // Don't connect immediately
    });

    client1.on('error', (err) => {
      console.error('❌ Redis error:', err.message);
    });

    client1.on('connect', () => {
      console.log('✅ Connected to Redis');
    });

    client1.on('ready', () => {
      console.log('✅ Redis is ready');
    });

    await client1.connect();
    const pong = await client1.ping();
    console.log(`✅ PING response: ${pong}`);
    
    await client1.set('test-key', 'test-value');
    const value = await client1.get('test-key');
    console.log(`✅ SET/GET test: ${value}`);
    
    await client1.quit();
    console.log('✅ Test 1 passed!\n');
  } catch (error: any) {
    console.error('❌ Test 1 failed:', error.message);
    console.error('Full error:', error);
    console.log('');
  }

  // Test 2: Without username (some Redis versions don't support it)
  console.log('Test 2: Connecting without username field...');
  try {
    const client2 = new Redis({
      host: redisHost,
      port: redisPort,
      password: redisPassword,
      connectTimeout: 10000,
      lazyConnect: true,
    });

    client2.on('error', (err) => {
      console.error('❌ Redis error:', err.message);
    });

    await client2.connect();
    const pong = await client2.ping();
    console.log(`✅ PING response: ${pong}`);
    
    await client2.quit();
    console.log('✅ Test 2 passed!\n');
  } catch (error: any) {
    console.error('❌ Test 2 failed:', error.message);
    console.log('');
  }

  // Test 3: Using URL format
  console.log('Test 3: Connecting with URL format...');
  try {
    const redisUrl = `redis://${redisUsername}:${redisPassword}@${redisHost}:${redisPort}`;
    console.log(`  URL: redis://${redisUsername}:***@${redisHost}:${redisPort}`);
    
    const client3 = new Redis(redisUrl, {
      connectTimeout: 10000,
      lazyConnect: true,
    });

    client3.on('error', (err) => {
      console.error('❌ Redis error:', err.message);
    });

    await client3.connect();
    const pong = await client3.ping();
    console.log(`✅ PING response: ${pong}`);
    
    await client3.quit();
    console.log('✅ Test 3 passed!\n');
  } catch (error: any) {
    console.error('❌ Test 3 failed:', error.message);
    console.log('');
  }

  console.log('✅ Testing complete!');
}

testRedisConnection().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});

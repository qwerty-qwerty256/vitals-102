#!/usr/bin/env tsx
/**
 * Test script to verify BullMQ queue setup
 */
import { config } from 'dotenv';
import { queueService } from '../services/queue.service';
import { QUEUE_NAMES } from '../lib/queue';
import { checkRedisHealth, closeRedisConnection } from '../lib/redis';
import { closeAllQueues } from '../lib/queue';

config();

async function testQueueSetup() {
  console.log('🔍 Testing BullMQ Queue Setup...\n');

  try {
    // Test 1: Redis Connection
    console.log('1. Testing Redis connection...');
    const redisHealthy = await checkRedisHealth();
    if (redisHealthy) {
      console.log('✅ Redis connection successful\n');
    } else {
      console.log('❌ Redis connection failed\n');
      return;
    }

    // Test 2: Enqueue a test job
    console.log('2. Enqueuing test job...');
    const testJob = await queueService.enqueueProcessReport({
      reportId: 'test-report-123',
      userId: 'test-user-456',
      profileId: 'test-profile-789',
    });
    console.log(`✅ Job enqueued with ID: ${testJob.id}\n`);

    // Test 3: Get job status
    console.log('3. Getting job status...');
    const jobStatus = await queueService.getJobStatus(
      QUEUE_NAMES.PROCESS_REPORT,
      testJob.id!
    );
    if (jobStatus) {
      console.log('✅ Job status retrieved:');
      console.log(`   - State: ${jobStatus.state}`);
      console.log(`   - Attempts: ${jobStatus.attemptsMade}`);
      console.log(`   - Data:`, jobStatus.data);
      console.log('');
    }

    // Test 4: Get queue statistics
    console.log('4. Getting queue statistics...');
    const stats = await queueService.getQueueStats(QUEUE_NAMES.PROCESS_REPORT);
    console.log('✅ Queue statistics:');
    console.log(`   - Waiting: ${stats.waiting}`);
    console.log(`   - Active: ${stats.active}`);
    console.log(`   - Completed: ${stats.completed}`);
    console.log(`   - Failed: ${stats.failed}`);
    console.log(`   - Delayed: ${stats.delayed}`);
    console.log('');

    // Test 5: Get all queues status
    console.log('5. Getting all queues status...');
    const allQueuesStatus = await queueService.getAllQueuesStatus();
    console.log('✅ All queues status:');
    allQueuesStatus.forEach((queue) => {
      console.log(`   - ${queue.name}:`);
      console.log(`     Waiting: ${queue.waiting}, Active: ${queue.active}, Failed: ${queue.failed}`);
    });
    console.log('');

    // Test 6: Clean up test job
    console.log('6. Cleaning up test job...');
    await queueService.removeJob(QUEUE_NAMES.PROCESS_REPORT, testJob.id!);
    console.log('✅ Test job removed\n');

    console.log('✅ All tests passed! BullMQ queue setup is working correctly.\n');
  } catch (error) {
    console.error('❌ Test failed:', error);
    process.exit(1);
  } finally {
    // Clean up connections
    console.log('🧹 Cleaning up connections...');
    await closeAllQueues();
    await closeRedisConnection();
    console.log('✅ Cleanup complete');
  }
}

// Run tests
testQueueSetup().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});

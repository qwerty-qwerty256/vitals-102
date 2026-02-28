# Background Job Queue System

This document describes the BullMQ-based background job queue system implemented for the HealthTrack backend.

## Overview

The queue system handles asynchronous processing of long-running tasks such as:
- PDF OCR processing
- Living Health Markdown (LHM) updates
- Vector embeddings generation
- Monthly email digest sending

## Architecture

### Components

1. **Redis** - Message broker and job storage
2. **BullMQ** - Job queue library with retry and error handling
3. **Queue Service** - High-level API for job management
4. **Workers** - Background processors for each job type

### Queue Names

- `process-report` - OCR processing and biomarker extraction
- `update-lhm` - Living Health Markdown updates
- `generate-embeddings` - Vector embeddings for RAG
- `send-digest` - Monthly email digest delivery

## Configuration

### Environment Variables

```bash
# Redis connection URL
REDIS_URL=redis://localhost:6379
```

### Queue Options

Default configuration for all queues:

```typescript
{
  attempts: 3,                    // Retry failed jobs up to 3 times
  backoff: {
    type: 'exponential',
    delay: 10000                  // Start with 10 seconds
  },
  removeOnComplete: {
    age: 24 * 3600,              // Keep completed jobs for 24 hours
    count: 1000                   // Keep last 1000 completed jobs
  },
  removeOnFail: {
    age: 7 * 24 * 3600,          // Keep failed jobs for 7 days
    count: 5000                   // Keep last 5000 failed jobs
  }
}
```

### Worker Options

Default configuration for all workers:

```typescript
{
  concurrency: 5,                 // Process up to 5 jobs concurrently
  limiter: {
    max: 10,                      // Max 10 jobs
    duration: 1000                // Per second
  }
}
```

## Usage

### Enqueuing Jobs

```typescript
import { queueService } from './services/queue.service';

// Enqueue a report processing job
const job = await queueService.enqueueProcessReport({
  reportId: 'report-123',
  userId: 'user-456',
  profileId: 'profile-789',
});

console.log(`Job enqueued with ID: ${job.id}`);
```

### Creating Workers

```typescript
import { createWorker, QUEUE_NAMES } from './lib/queue';
import { ProcessReportJobData } from './lib/queue';

// Create a worker for the process-report queue
const worker = createWorker<ProcessReportJobData>(
  QUEUE_NAMES.PROCESS_REPORT,
  async (job) => {
    console.log(`Processing job ${job.id}`, job.data);
    
    // Your processing logic here
    const { reportId, userId, profileId } = job.data;
    
    // Update progress
    await job.updateProgress(50);
    
    // Return result
    return { success: true };
  }
);

// Worker will automatically start processing jobs
```

### Monitoring Jobs

```typescript
import { queueService } from './services/queue.service';
import { QUEUE_NAMES } from './lib/queue';

// Get job status
const status = await queueService.getJobStatus(
  QUEUE_NAMES.PROCESS_REPORT,
  'job-id-123'
);

console.log(`Job state: ${status.state}`);
console.log(`Attempts: ${status.attemptsMade}`);

// Get queue statistics
const stats = await queueService.getQueueStats(QUEUE_NAMES.PROCESS_REPORT);
console.log(`Waiting: ${stats.waiting}`);
console.log(`Active: ${stats.active}`);
console.log(`Failed: ${stats.failed}`);

// Get all queues status
const allQueues = await queueService.getAllQueuesStatus();
allQueues.forEach(queue => {
  console.log(`${queue.name}: ${queue.waiting} waiting, ${queue.active} active`);
});
```

### Retry Logic

The system includes built-in retry utilities with exponential backoff:

```typescript
import { withRetry, retryStrategies } from './utils/retry';

// Use predefined retry strategy
const result = await retryStrategies.network(async () => {
  return await externalApiCall();
});

// Custom retry configuration
const result = await withRetry(
  async () => {
    return await riskyOperation();
  },
  {
    maxAttempts: 5,
    initialDelayMs: 2000,
    backoffMultiplier: 2,
    shouldRetry: (error) => {
      // Only retry on specific errors
      return error.code === 'ETIMEDOUT';
    },
    onRetry: (error, attempt, delayMs) => {
      console.log(`Retry attempt ${attempt} after ${delayMs}ms`);
    },
  }
);
```

### Circuit Breaker

Prevent cascading failures with circuit breaker pattern:

```typescript
import { withCircuitBreaker } from './utils/retry';

const protectedFunction = withCircuitBreaker(
  async (param: string) => {
    return await unreliableService(param);
  },
  {
    failureThreshold: 5,      // Open circuit after 5 failures
    resetTimeoutMs: 60000,    // Try again after 60 seconds
  }
);

// Use the protected function
try {
  const result = await protectedFunction('test');
} catch (error) {
  if (error.message.includes('Circuit breaker is open')) {
    console.log('Service is temporarily unavailable');
  }
}
```

## Job Types

### Process Report Job

Extracts text from PDF using OCR and extracts biomarkers.

```typescript
interface ProcessReportJobData {
  reportId: string;
  userId: string;
  profileId: string;
}
```

### Update LHM Job

Updates the Living Health Markdown document for a profile.

```typescript
interface UpdateLHMJobData {
  profileId: string;
  userId: string;
  reportId: string;
}
```

### Generate Embeddings Job

Creates vector embeddings for RAG-powered Q&A.

```typescript
interface GenerateEmbeddingsJobData {
  reportId: string;
  userId: string;
  profileId: string;
}
```

### Send Digest Job

Sends monthly email digest to a user.

```typescript
interface SendDigestJobData {
  userId: string;
}
```

## Error Handling

### Automatic Retries

Failed jobs are automatically retried with exponential backoff:
- Attempt 1: Immediate
- Attempt 2: After 10 seconds
- Attempt 3: After 20 seconds

### Failed Job Management

```typescript
// Retry a failed job manually
await queueService.retryJob(QUEUE_NAMES.PROCESS_REPORT, 'job-id-123');

// Remove a failed job
await queueService.removeJob(QUEUE_NAMES.PROCESS_REPORT, 'job-id-123');

// Get recent errors
const stats = await queueService.getQueueStats(QUEUE_NAMES.PROCESS_REPORT);
console.log('Recent errors:', stats.recentErrors);
```

## Maintenance

### Cleaning Old Jobs

```typescript
// Clean completed jobs older than 24 hours
await queueService.cleanQueue(QUEUE_NAMES.PROCESS_REPORT);

// Clean with custom grace period (7 days)
await queueService.cleanQueue(
  QUEUE_NAMES.PROCESS_REPORT,
  7 * 24 * 3600 * 1000
);
```

### Pausing and Resuming

```typescript
// Pause queue processing
await queueService.pauseQueue(QUEUE_NAMES.PROCESS_REPORT);

// Resume queue processing
await queueService.resumeQueue(QUEUE_NAMES.PROCESS_REPORT);
```

### Draining Queue

```typescript
// Remove all jobs from queue
await queueService.drainQueue(QUEUE_NAMES.PROCESS_REPORT);

// Completely remove queue and all data
await queueService.obliterateQueue(QUEUE_NAMES.PROCESS_REPORT);
```

## Testing

### Test Queue Setup

Run the queue test script to verify everything is working:

```bash
npm run test:queue
```

This will:
1. Check Redis connection
2. Enqueue a test job
3. Retrieve job status
4. Get queue statistics
5. Clean up test data

### Manual Testing

```bash
# Start Redis (if not running)
redis-server

# In another terminal, start the application
npm run dev

# In another terminal, run the queue test
npm run test:queue
```

## Monitoring

### Health Check

```typescript
import { checkRedisHealth } from './lib/redis';

const isHealthy = await checkRedisHealth();
if (!isHealthy) {
  console.error('Redis is not responding');
}
```

### Queue Metrics

Monitor queue health in your application:

```typescript
app.get('/health/queues', async (req, res) => {
  const queuesStatus = await queueService.getAllQueuesStatus();
  
  const hasIssues = queuesStatus.some(
    queue => queue.failed > 10 || queue.waiting > 100
  );
  
  res.status(hasIssues ? 503 : 200).json({
    status: hasIssues ? 'degraded' : 'healthy',
    queues: queuesStatus,
  });
});
```

## Best Practices

1. **Job Idempotency** - Ensure jobs can be safely retried
2. **Progress Updates** - Update job progress for long-running tasks
3. **Error Logging** - Log detailed error information for debugging
4. **Resource Limits** - Set appropriate concurrency limits
5. **Cleanup** - Regularly clean old completed/failed jobs
6. **Monitoring** - Monitor queue health and failed jobs
7. **Graceful Shutdown** - Close queues and Redis connections on shutdown

## Troubleshooting

### Redis Connection Issues

```bash
# Check if Redis is running
redis-cli ping

# Check Redis connection from Node.js
npm run test:queue
```

### Jobs Not Processing

1. Check if workers are running
2. Verify Redis connection
3. Check queue statistics for errors
4. Review failed job reasons

### High Memory Usage

1. Clean old completed jobs
2. Reduce job retention settings
3. Increase cleanup frequency
4. Monitor queue sizes

## References

- [BullMQ Documentation](https://docs.bullmq.io/)
- [Redis Documentation](https://redis.io/documentation)
- [Job Queue Best Practices](https://docs.bullmq.io/guide/best-practices)

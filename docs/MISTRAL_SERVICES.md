# Mistral AI Services Documentation

This document describes the Mistral AI service clients implemented for the HealthTrack backend.

## Overview

The application integrates with three Mistral AI APIs:

1. **Mistral OCR** - Extract text from PDF medical reports
2. **Mistral Chat** - Generate summaries, analyze data, and power Q&A
3. **Mistral Embed** - Generate embeddings for semantic search (RAG)

## Services

### 1. Mistral OCR Service

**File:** `src/services/mistral-ocr.service.ts`

**Purpose:** Extract structured text from PDF medical reports using Mistral's vision model.

**Key Features:**
- PDF to markdown conversion
- Table structure preservation
- Automatic retry with exponential backoff
- Rate limiting handling
- Comprehensive error logging

**Usage:**

```typescript
import { mistralOCRService } from './services/mistral-ocr.service';

// Extract text from PDF buffer
const pdfBuffer = fs.readFileSync('report.pdf');
const markdown = await mistralOCRService.extractTextFromPDF(
  pdfBuffer,
  'report.pdf'
);

// Health check
const isHealthy = await mistralOCRService.healthCheck();
```

**Configuration:**
- Model: `pixtral-12b-2409` (Mistral's vision model)
- Temperature: 0.1 (low for consistent extraction)
- Max Tokens: 4000
- Retry: 3 attempts with exponential backoff

### 2. Mistral Chat Service

**File:** `src/services/mistral-chat.service.ts`

**Purpose:** Generate AI responses for summaries, analysis, and conversational Q&A.

**Key Features:**
- Non-streaming and streaming completions
- Structured data extraction (JSON mode)
- Context window management (32K tokens)
- Token estimation
- Automatic message truncation

**Usage:**

```typescript
import { mistralChatService } from './services/mistral-chat.service';

// Simple completion
const response = await mistralChatService.complete([
  { role: 'user', content: 'What is normal blood sugar?' }
], {
  temperature: 0.7,
  maxTokens: 500
});

// Streaming completion
const stream = mistralChatService.completeStream([
  { role: 'user', content: 'Explain diabetes' }
]);

for await (const chunk of stream) {
  process.stdout.write(chunk);
}

// Extract structured data
const biomarkers = await mistralChatService.extractStructured(
  'Extract biomarkers as JSON array with name, value, unit',
  ocrMarkdown,
  '{ biomarkers: [{ name: string, value: number, unit: string }] }'
);

// Estimate tokens
const tokenCount = mistralChatService.estimateTokens(text);
```

**Configuration:**
- Model: `mistral-large-latest`
- Context Window: 32,000 tokens
- Default Temperature: 0.7
- Default Max Tokens: 2000
- Retry: 3 attempts with exponential backoff

**Context Window Management:**

The service automatically manages the context window by:
1. Always preserving system messages
2. Keeping recent messages
3. Truncating older messages when limit is reached
4. Reserving tokens for output

### 3. Mistral Embed Service

**File:** `src/services/mistral-embed.service.ts`

**Purpose:** Generate vector embeddings for semantic search and RAG (Retrieval-Augmented Generation).

**Key Features:**
- Single and batch embedding generation
- Automatic batching (16 texts per batch)
- Text chunking for long documents
- Cosine similarity calculation
- 1024-dimensional vectors

**Usage:**

```typescript
import { mistralEmbedService } from './services/mistral-embed.service';

// Single embedding
const embedding = await mistralEmbedService.embed(
  'Fasting blood sugar: 95 mg/dL'
);
console.log(embedding.length); // 1024

// Batch embeddings
const texts = [
  'Blood glucose: 95 mg/dL',
  'Cholesterol: 180 mg/dL',
  'Hemoglobin: 14.5 g/dL'
];
const results = await mistralEmbedService.embedBatch(texts);

// Chunk long text
const chunks = mistralEmbedService.chunkText(longDocument, 500);

// Calculate similarity
const similarity = mistralEmbedService.cosineSimilarity(
  embedding1,
  embedding2
);

// Get dimensions
const dims = mistralEmbedService.getEmbeddingDimensions(); // 1024
```

**Configuration:**
- Model: `mistral-embed`
- Dimensions: 1024
- Max Batch Size: 16 texts
- Max Chunk Size: 500 tokens (~2000 characters)
- Retry: 3 attempts with exponential backoff

**Text Chunking Strategy:**

The service chunks text intelligently:
1. Split by paragraphs first
2. If paragraph exceeds limit, split by sentences
3. Preserve context at boundaries
4. Maintain semantic coherence

## Error Handling

All services implement robust error handling:

### Retry Logic

- **Retryable Errors:**
  - 429 (Rate Limit)
  - 500 (Server Error)
  - 502 (Bad Gateway)
  - 503 (Service Unavailable)
  - 504 (Gateway Timeout)

- **Retry Strategy:**
  - Max Attempts: 3
  - Initial Delay: 1000ms
  - Backoff Multiplier: 2x
  - Max Delay: Calculated exponentially

### Error Types

All services throw `ExternalServiceError` with descriptive messages:

```typescript
try {
  const result = await mistralChatService.complete(messages);
} catch (error) {
  if (error instanceof ExternalServiceError) {
    console.error(`Mistral API Error: ${error.message}`);
    // Handle gracefully
  }
}
```

## Environment Variables

Required environment variables:

```env
MISTRAL_API_KEY=your-mistral-api-key
```

Get your API key from: https://console.mistral.ai/

## Testing

Run the comprehensive test suite:

```bash
pnpm test:mistral
```

This tests:
1. Health checks for all services
2. Chat completion (non-streaming)
3. Chat completion (streaming)
4. Structured data extraction
5. Single embedding generation
6. Batch embedding generation
7. Text chunking
8. Context window management
9. Cosine similarity calculation

## Performance Considerations

### Rate Limiting

Mistral AI has rate limits. The services handle this by:
- Automatic retry with exponential backoff
- Batch processing with delays between batches
- Logging rate limit warnings

### Token Usage

- **OCR:** ~4000 tokens per report
- **Chat:** Variable (managed by context window)
- **Embed:** ~500 tokens per chunk

### Cost Optimization

1. Use low temperature (0.1) for extraction tasks
2. Batch embeddings when possible (up to 16 at once)
3. Chunk text appropriately (500 tokens)
4. Cache embeddings in database
5. Reuse LHM context instead of full reports

## Integration Examples

### Report Processing

```typescript
// 1. Extract text from PDF
const ocrText = await mistralOCRService.extractTextFromPDF(
  pdfBuffer,
  filename
);

// 2. Extract structured biomarkers
const biomarkers = await mistralChatService.extractStructured(
  'Extract biomarkers as JSON',
  ocrText
);

// 3. Generate embeddings for RAG
const chunks = mistralEmbedService.chunkText(ocrText);
const embeddings = await mistralEmbedService.embedBatch(chunks);
```

### LHM Update

```typescript
// Generate updated LHM using chat
const updatedLHM = await mistralChatService.complete([
  {
    role: 'system',
    content: 'You are a health data summarizer. Update the LHM document.'
  },
  {
    role: 'user',
    content: `Current LHM:\n${currentLHM}\n\nNew biomarkers:\n${JSON.stringify(newBiomarkers)}`
  }
]);
```

### Q&A with RAG

```typescript
// 1. Generate query embedding
const queryEmbedding = await mistralEmbedService.embed(userQuestion);

// 2. Search similar chunks (in database)
const relevantChunks = await searchSimilarEmbeddings(queryEmbedding);

// 3. Generate answer with context
const answer = await mistralChatService.complete([
  {
    role: 'system',
    content: 'Answer based on the health data provided.'
  },
  {
    role: 'user',
    content: `Context:\n${relevantChunks.join('\n\n')}\n\nQuestion: ${userQuestion}`
  }
]);
```

## Monitoring

All services log important events:

- API calls (start/end)
- Token usage
- Retry attempts
- Errors and failures
- Performance metrics

Use the logger to track service health:

```typescript
import { logger } from './utils/logger';

// Logs are automatically generated by services
// Check logs for patterns like:
// - "Starting OCR extraction"
// - "OCR extraction completed"
// - "Retrying chat completion"
// - "Batch embeddings completed"
```

## Best Practices

1. **Always handle errors gracefully** - Services may fail due to rate limits or network issues
2. **Use appropriate temperatures** - Low (0.1) for extraction, medium (0.7) for generation
3. **Batch when possible** - Embeddings are more efficient in batches
4. **Cache results** - Store embeddings and LHMs in database
5. **Monitor token usage** - Track costs and optimize prompts
6. **Test with real data** - Use actual medical reports for testing
7. **Implement fallbacks** - Have backup strategies for service failures

## Troubleshooting

### Common Issues

**Issue:** `MISTRAL_API_KEY environment variable is required`
- **Solution:** Set the API key in `.env` file

**Issue:** Rate limit errors (429)
- **Solution:** Services automatically retry. If persistent, reduce request frequency

**Issue:** Context window exceeded
- **Solution:** Services automatically manage context. Check message sizes

**Issue:** Invalid JSON in structured extraction
- **Solution:** Improve prompt clarity or add schema description

**Issue:** Embedding dimension mismatch
- **Solution:** Ensure pgvector is configured for 1024 dimensions

### Debug Mode

Enable detailed logging:

```typescript
import { logger } from './utils/logger';

// Logger automatically logs all service operations
// Check console output for detailed information
```

## Future Enhancements

Potential improvements:

1. **Caching Layer** - Cache common queries and embeddings
2. **Prompt Templates** - Centralized prompt management
3. **Fine-tuning** - Custom models for medical domain
4. **Batch Processing** - Queue-based batch operations
5. **Metrics Dashboard** - Real-time monitoring
6. **A/B Testing** - Compare different prompts/models
7. **Cost Tracking** - Detailed token usage analytics

## References

- [Mistral AI Documentation](https://docs.mistral.ai/)
- [Mistral AI Console](https://console.mistral.ai/)
- [Mistral AI Pricing](https://mistral.ai/pricing/)
- [Pixtral Vision Model](https://docs.mistral.ai/capabilities/vision/)
- [Mistral Embeddings](https://docs.mistral.ai/capabilities/embeddings/)

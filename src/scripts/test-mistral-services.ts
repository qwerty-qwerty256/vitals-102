import 'dotenv/config';
import { mistralChatService } from '../services/mistral-chat.service';
import { mistralEmbedService } from '../services/mistral-embed.service';

async function testMistralServices() {
  console.log('🧪 Testing Mistral API Services\n');

  // Test 1: Chat Service Health Check
  console.log('1️⃣ Testing Mistral Chat Service Health Check...');
  try {
    const chatHealthy = await mistralChatService.healthCheck();
    console.log(`✅ Chat Service Health: ${chatHealthy ? 'OK' : 'FAILED'}\n`);
  } catch (error: any) {
    console.error(`❌ Chat Service Health Check Failed: ${error.message}\n`);
  }

  // Test 2: Chat Completion
  console.log('2️⃣ Testing Chat Completion...');
  try {
    const response = await mistralChatService.complete(
      [
        {
          role: 'user',
          content: 'What is the normal range for fasting blood sugar?',
        },
      ],
      {
        temperature: 0.7,
        maxTokens: 100,
      }
    );
    console.log(`✅ Chat Response: ${response.substring(0, 100)}...\n`);
  } catch (error: any) {
    console.error(`❌ Chat Completion Failed: ${error.message}\n`);
  }

  // Test 3: Streaming Chat
  console.log('3️⃣ Testing Streaming Chat...');
  try {
    const stream = mistralChatService.completeStream(
      [
        {
          role: 'user',
          content: 'List 3 common biomarkers in a health checkup.',
        },
      ],
      {
        temperature: 0.7,
        maxTokens: 100,
      }
    );

    let streamedText = '';
    for await (const chunk of stream) {
      streamedText += chunk;
    }
    console.log(`✅ Streamed Response: ${streamedText.substring(0, 100)}...\n`);
  } catch (error: any) {
    console.error(`❌ Streaming Chat Failed: ${error.message}\n`);
  }

  // Test 4: Structured Extraction
  console.log('4️⃣ Testing Structured Extraction...');
  try {
    const sampleText = `
      Blood Test Results:
      - Glucose: 95 mg/dL
      - Cholesterol: 180 mg/dL
      - Hemoglobin: 14.5 g/dL
    `;

    const extracted = await mistralChatService.extractStructured(
      'Extract biomarkers from this text as a JSON array with fields: name, value, unit',
      sampleText
    );
    console.log('✅ Extracted Data:', JSON.stringify(extracted, null, 2), '\n');
  } catch (error: any) {
    console.error(`❌ Structured Extraction Failed: ${error.message}\n`);
  }

  // Test 5: Embed Service Health Check
  console.log('5️⃣ Testing Mistral Embed Service Health Check...');
  try {
    const embedHealthy = await mistralEmbedService.healthCheck();
    console.log(`✅ Embed Service Health: ${embedHealthy ? 'OK' : 'FAILED'}\n`);
  } catch (error: any) {
    console.error(`❌ Embed Service Health Check Failed: ${error.message}\n`);
  }

  // Test 6: Single Embedding
  console.log('6️⃣ Testing Single Embedding...');
  try {
    const embedding = await mistralEmbedService.embed(
      'Fasting blood sugar level is 95 mg/dL'
    );
    console.log(
      `✅ Embedding Generated: ${embedding.length} dimensions, first 5 values: [${embedding.slice(0, 5).join(', ')}...]\n`
    );
  } catch (error: any) {
    console.error(`❌ Single Embedding Failed: ${error.message}\n`);
  }

  // Test 7: Batch Embeddings
  console.log('7️⃣ Testing Batch Embeddings...');
  try {
    const texts = [
      'Blood glucose: 95 mg/dL',
      'Total cholesterol: 180 mg/dL',
      'Hemoglobin A1C: 5.5%',
    ];

    const embeddings = await mistralEmbedService.embedBatch(texts);
    console.log(`✅ Batch Embeddings: ${embeddings.length} embeddings generated\n`);

    // Test cosine similarity
    const similarity = mistralEmbedService.cosineSimilarity(
      embeddings[0].embedding,
      embeddings[1].embedding
    );
    console.log(`✅ Cosine Similarity (glucose vs cholesterol): ${similarity.toFixed(4)}\n`);
  } catch (error: any) {
    console.error(`❌ Batch Embeddings Failed: ${error.message}\n`);
  }

  // Test 8: Text Chunking
  console.log('8️⃣ Testing Text Chunking...');
  try {
    const longText = `
      Patient Health Report
      
      Blood Test Results from January 2024:
      - Fasting Blood Sugar: 95 mg/dL (Normal range: 70-100 mg/dL)
      - Total Cholesterol: 180 mg/dL (Normal range: <200 mg/dL)
      - HDL Cholesterol: 55 mg/dL (Normal range: >40 mg/dL)
      - LDL Cholesterol: 110 mg/dL (Normal range: <100 mg/dL)
      - Triglycerides: 120 mg/dL (Normal range: <150 mg/dL)
      
      Complete Blood Count:
      - Hemoglobin: 14.5 g/dL (Normal range: 13.5-17.5 g/dL)
      - White Blood Cells: 7,500 cells/μL (Normal range: 4,500-11,000 cells/μL)
      - Platelets: 250,000 cells/μL (Normal range: 150,000-400,000 cells/μL)
      
      Kidney Function:
      - Creatinine: 0.9 mg/dL (Normal range: 0.7-1.3 mg/dL)
      - Blood Urea Nitrogen: 15 mg/dL (Normal range: 7-20 mg/dL)
      
      Liver Function:
      - ALT: 25 U/L (Normal range: 7-56 U/L)
      - AST: 22 U/L (Normal range: 10-40 U/L)
    `;

    const chunks = mistralEmbedService.chunkText(longText, 200);
    console.log(`✅ Text Chunked: ${chunks.length} chunks created\n`);
    chunks.forEach((chunk, i) => {
      console.log(`   Chunk ${i + 1}: ${chunk.length} chars`);
    });
    console.log();
  } catch (error: any) {
    console.error(`❌ Text Chunking Failed: ${error.message}\n`);
  }

  // Test 9: Context Window Management
  console.log('9️⃣ Testing Context Window Management...');
  try {
    const longConversation = Array.from({ length: 20 }, (_, i) => ({
      role: (i % 2 === 0 ? 'user' : 'assistant') as 'user' | 'assistant',
      content: `Message ${i + 1}: ${'Lorem ipsum dolor sit amet. '.repeat(50)}`,
    }));

    await mistralChatService.complete(
      [
        {
          role: 'system',
          content: 'You are a health assistant.',
        },
        ...longConversation,
        {
          role: 'user',
          content: 'Summarize our conversation.',
        },
      ],
      {
        maxTokens: 100,
      }
    );

    console.log(`✅ Context Window Managed: Response generated\n`);
  } catch (error: any) {
    console.error(`❌ Context Window Management Failed: ${error.message}\n`);
  }

  console.log('✨ All tests completed!\n');
}

// Run tests
testMistralServices().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});

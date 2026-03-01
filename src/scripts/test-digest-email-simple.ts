import 'dotenv/config';
import { emailService, MonthlyDigestData } from '../services/email.service';
import { logger } from '../utils/logger';

/**
 * Simple test script to send a monthly digest email with mock data
 * Usage: npx tsx src/scripts/test-digest-email-simple.ts <user-email>
 */

async function testDigestEmail() {
  try {
    const targetEmail = process.argv[2] || 'adityaghailbdrp1@gmail.com';

    logger.info('Testing digest email system with mock data', { targetEmail });

    // Check if Resend API key is configured
    if (
      !process.env.RESEND_API_KEY ||
      process.env.RESEND_API_KEY === 'your-resend-api-key'
    ) {
      logger.error(
        'RESEND_API_KEY is not configured. Please set it in .env file.'
      );
      logger.info('Get your API key from: https://resend.com/api-keys');
      process.exit(1);
    }

    // Create mock digest data
    const mockDigestData: MonthlyDigestData = {
      userName: 'Aditya',
      profiles: [
        {
          name: 'Aman',
          relationship: 'father',
          summary:
            'Recent blood work shows elevated HbA1c (8.6%) and blood sugar levels (205.9 mg/dL), indicating diabetes management needs attention. Kidney and liver function remain stable.',
          daysSinceLastReport: 15,
          hasConcerns: true,
        },
        {
          name: 'Priya',
          relationship: 'mother',
          summary:
            'All biomarkers within normal ranges. Cholesterol levels are healthy, and kidney function is excellent. Continue current health routine.',
          daysSinceLastReport: 30,
          hasConcerns: false,
        },
        {
          name: 'Rahul',
          relationship: 'self',
          summary:
            'Vitamin D levels are slightly low (18 ng/mL). Consider supplementation and increased sun exposure. All other markers are normal.',
          daysSinceLastReport: 45,
          hasConcerns: false,
        },
      ],
      generatedSummary:
        "This month's health overview shows mostly positive trends across your family. While Aman's diabetes markers need attention and closer monitoring, both Priya and Rahul are maintaining good health. Consider scheduling a follow-up appointment for Aman to discuss diabetes management strategies.",
    };

    logger.info('Sending test digest email...', {
      targetEmail,
      profileCount: mockDigestData.profiles.length,
    });

    // Send email
    await emailService.sendMonthlyDigest(targetEmail, mockDigestData);

    logger.info('✅ Digest email sent successfully!', {
      targetEmail,
    });

    logger.info('Check your inbox at:', targetEmail);
    logger.info(
      'Note: This was a test email with mock data. The actual monthly digest will use real data from your database.'
    );
  } catch (error) {
    logger.error('Failed to send digest email', {
      error: error instanceof Error ? error.message : error,
      stack: error instanceof Error ? error.stack : undefined,
    });
    process.exit(1);
  }
}

// Run the test
testDigestEmail();

import 'dotenv/config';
import { digestService } from '../services/digest.service';
import { emailService } from '../services/email.service';
import { getSupabaseClient } from '../utils/supabase';
import { logger } from '../utils/logger';

/**
 * Test script to send a monthly digest email
 * Usage: npx tsx src/scripts/test-digest-email.ts <user-email>
 */

async function testDigestEmail() {
  try {
    const targetEmail = process.argv[2] || 'adityaghailbdrp1@gmail.com';

    logger.info('Testing digest email system', { targetEmail });

    // Check if Resend API key is configured
    if (
      !process.env.RESEND_API_KEY ||
      process.env.RESEND_API_KEY === 'your-resend-api-key'
    ) {
      logger.error(
        'RESEND_API_KEY is not configured. Please set it in .env file.'
      );
      logger.info(
        'Get your API key from: https://resend.com/api-keys'
      );
      process.exit(1);
    }

    const supabase = getSupabaseClient();

    // Find a user with profiles
    logger.info('Looking for users with profiles...');

    const { data: profiles, error: profileError } = await supabase
      .from('profiles')
      .select('user_id, name, relationship')
      .limit(5);

    if (profileError) {
      throw profileError;
    }

    if (!profiles || profiles.length === 0) {
      logger.error('No profiles found in database');
      logger.info(
        'Please create a profile first using the frontend or API'
      );
      process.exit(1);
    }

    // Get the first user with profiles
    const userId = profiles[0].user_id;

    logger.info('Found user with profiles', {
      userId,
      profileCount: profiles.filter((p) => p.user_id === userId).length,
    });

    // Get user details
    const { data: authUser, error: authError } = await supabase.auth.admin.getUserById(
      userId
    );

    if (authError) {
      logger.warn('Could not fetch user auth details', { error: authError });
    }

    const userName = authUser?.user?.user_metadata?.name || 'User';

    logger.info('Generating and sending digest email...', {
      userId,
      userName,
      targetEmail,
    });

    // Generate and send digest
    await digestService.generateAndSendDigest(
      userId,
      targetEmail,
      userName
    );

    logger.info('✅ Digest email sent successfully!', {
      targetEmail,
    });

    logger.info('Check your inbox at:', targetEmail);
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

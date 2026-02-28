import { Mistral } from '@mistralai/mistralai';
import { withRetry } from '../utils/retry';
import { logger } from '../utils/logger';
import { ExternalServiceError } from '../utils/httpError';

export class MistralOCRService {
  private client: Mistral;

  constructor() {
    const apiKey = process.env.MISTRAL_API_KEY;
    if (!apiKey) {
      throw new Error('MISTRAL_API_KEY environment variable is required');
    }

    this.client = new Mistral({
      apiKey,
    });
  }

  /**
   * Extract text from PDF using Mistral OCR API
   * @param pdfBuffer - PDF file buffer
   * @param filename - Original filename for logging
   * @returns Extracted markdown text
   */
  async extractTextFromPDF(
    pdfBuffer: Buffer,
    filename: string
  ): Promise<string> {
    try {
      logger.info('Starting OCR extraction', { filename, size: pdfBuffer.length });

      const result = await withRetry(
        async () => {
          // Convert buffer to base64 for API
          const base64Pdf = pdfBuffer.toString('base64');

          // Call Mistral OCR API with vision model
          const response = await this.client.chat.complete({
            model: 'pixtral-12b-2409',
            messages: [
              {
                role: 'user',
                content: [
                  {
                    type: 'text',
                    text: 'Extract all text from this medical report PDF. Format the output as markdown, preserving tables and structure. Include all biomarker names, values, units, and reference ranges.',
                  },
                  {
                    type: 'image_url',
                    imageUrl: `data:application/pdf;base64,${base64Pdf}`,
                  },
                ],
              },
            ],
            temperature: 0.1, // Low temperature for consistent extraction
            maxTokens: 4000,
          });

          const extractedText = response.choices?.[0]?.message?.content;

          if (!extractedText || typeof extractedText !== 'string') {
            throw new ExternalServiceError(
              'Mistral OCR',
              'No text extracted from PDF'
            );
          }

          return extractedText;
        },
        {
          maxAttempts: 3,
          initialDelayMs: 1000,
          backoffMultiplier: 2,
          shouldRetry: (error: any) => {
            // Retry on rate limit or temporary errors
            const statusCode = error?.response?.status;
            const shouldRetry =
              statusCode === 429 || // Rate limit
              statusCode === 500 || // Server error
              statusCode === 502 || // Bad gateway
              statusCode === 503 || // Service unavailable
              statusCode === 504; // Gateway timeout

            if (shouldRetry) {
              logger.warn('Retrying OCR request', {
                filename,
                statusCode,
                error: error.message,
              });
            }

            return shouldRetry;
          },
        }
      );

      logger.info('OCR extraction completed', {
        filename,
        textLength: result.length,
      });

      return result;
    } catch (error: any) {
      logger.error('OCR extraction failed', {
        filename,
        error: error.message,
        stack: error.stack,
      });

      if (error instanceof ExternalServiceError) {
        throw error;
      }

      throw new ExternalServiceError(
        'Mistral OCR',
        error.message || 'Failed to extract text from PDF'
      );
    }
  }

  /**
   * Health check for Mistral OCR service
   */
  async healthCheck(): Promise<boolean> {
    try {
      // Simple test with minimal token usage
      await this.client.chat.complete({
        model: 'pixtral-12b-2409',
        messages: [
          {
            role: 'user',
            content: 'test',
          },
        ],
        maxTokens: 5,
      });
      return true;
    } catch (error) {
      logger.error('Mistral OCR health check failed', { error });
      return false;
    }
  }
}

// Export singleton instance
export const mistralOCRService = new MistralOCRService();

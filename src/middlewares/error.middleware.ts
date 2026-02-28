import { Request, Response, NextFunction } from 'express';
import { HttpError } from '@utils/httpError';
import { logger } from '@utils/logger';

export function errorMiddleware(
  error: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
) {
  if (error instanceof HttpError) {
    logger.warn('HTTP Error', {
      code: error.code,
      message: error.message,
      statusCode: error.statusCode,
      details: error.details,
    });

    return res.status(error.statusCode).json({
      error: {
        code: error.code,
        message: error.message,
        ...(error.details && { details: error.details }),
      },
    });
  }

  // Unhandled errors
  logger.error('Unhandled error', error);

  return res.status(500).json({
    error: {
      code: 'INTERNAL_ERROR',
      message: 'An unexpected error occurred',
    },
  });
}

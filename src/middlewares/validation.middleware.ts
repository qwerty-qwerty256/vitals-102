import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';
import { ValidationError } from '@utils/httpError';

export function validateRequest(schema: ZodSchema) {
  return (req: Request, _res: Response, next: NextFunction) => {
    try {
      req.body = schema.parse(req.body);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const details = error.errors.map((err) => ({
          path: err.path.join('.'),
          message: err.message,
        }));
        next(new ValidationError('Invalid request body', details));
      } else {
        next(error);
      }
    }
  };
}

export function validateQuery(schema: ZodSchema) {
  return (req: Request, _res: Response, next: NextFunction) => {
    try {
      req.query = schema.parse(req.query);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const details = error.errors.map((err) => ({
          path: err.path.join('.'),
          message: err.message,
        }));
        next(new ValidationError('Invalid query parameters', details));
      } else {
        next(error);
      }
    }
  };
}

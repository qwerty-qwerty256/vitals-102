export class HttpError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public code: string,
    public details?: unknown
  ) {
    super(message);
    this.name = 'HttpError';
    Error.captureStackTrace(this, this.constructor);
  }
}

export class ValidationError extends HttpError {
  constructor(message: string, details?: unknown) {
    super(400, message, 'VALIDATION_ERROR', details);
    this.name = 'ValidationError';
  }
}

export class AuthenticationError extends HttpError {
  constructor(message: string = 'Authentication required') {
    super(401, message, 'AUTHENTICATION_ERROR');
    this.name = 'AuthenticationError';
  }
}

export class AuthorizationError extends HttpError {
  constructor(message: string = 'Insufficient permissions') {
    super(403, message, 'AUTHORIZATION_ERROR');
    this.name = 'AuthorizationError';
  }
}

export class NotFoundError extends HttpError {
  constructor(resource: string) {
    super(404, `${resource} not found`, 'NOT_FOUND');
    this.name = 'NotFoundError';
  }
}

export class ExternalServiceError extends HttpError {
  constructor(service: string, message: string) {
    super(502, `${service} error: ${message}`, 'EXTERNAL_SERVICE_ERROR');
    this.name = 'ExternalServiceError';
  }
}

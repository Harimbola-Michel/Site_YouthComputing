export class ApiError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;
  public readonly errors?: any[] | Record<string, any>;

  constructor(
    statusCode: number,
    message: string,
    errors?: any[] | Record<string, any>,
    isOperational: boolean = true
  ) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.errors = errors;
    
    Error.captureStackTrace(this, this.constructor);
  }

  static badRequest(message: string, errors?: any[] | Record<string, any>): ApiError {
    return new ApiError(400, message, errors);
  }

  static unauthorized(message: string = 'Unauthorized'): ApiError {
    return new ApiError(401, message);
  }

  static forbidden(message: string = 'Forbidden'): ApiError {
    return new ApiError(403, message);
  }

  static notFound(message: string = 'Resource not found'): ApiError {
    return new ApiError(404, message);
  }

  static conflict(message: string, errors?: any[] | Record<string, any>): ApiError {
    return new ApiError(409, message, errors);
  }

  static validation(message: string, errors?: any[] | Record<string, any>): ApiError {
    return new ApiError(422, message, errors);
  }

  static tooManyRequests(message: string = 'Too many requests'): ApiError {
    return new ApiError(429, message);
  }

  static internal(message: string = 'Internal server error'): ApiError {
    return new ApiError(500, message);
  }

  static serviceUnavailable(message: string = 'Service unavailable'): ApiError {
    return new ApiError(503, message);
  }

  static isApiError(error: any): error is ApiError {
    return error instanceof ApiError;
  }

  toJSON(): object {
    return {
      statusCode: this.statusCode,
      message: this.message,
      errors: this.errors,
      isOperational: this.isOperational,
      ...(process.env.NODE_ENV === 'development' && { stack: this.stack }),
    };
  }
}
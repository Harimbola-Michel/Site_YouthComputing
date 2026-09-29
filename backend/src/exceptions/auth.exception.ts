import { BaseException } from './base.exception';
import { HTTP_STATUS } from '@constants/http-status';

export class AuthException extends BaseException {
  constructor(
    message: string = 'Authentication failed',
    code: string = 'AUTH_ERROR',
    details?: Record<string, any>
  ) {
    super(HTTP_STATUS.UNAUTHORIZED, code, message, details);
  }

  toResponse() {
    return {
      success: false,
      message: this.message,
      code: this.code,
      details: this.details,
    };
  }

  static invalidCredentials(details?: Record<string, any>) {
    return new AuthException('Invalid credentials', 'AUTH_INVALID_CREDENTIALS', details);
  }

  static tokenExpired(details?: Record<string, any>) {
    return new AuthException('Token expired', 'AUTH_TOKEN_EXPIRED', details);
  }

  static tokenInvalid(details?: Record<string, any>) {
    return new AuthException('Invalid token', 'AUTH_TOKEN_INVALID', details);
  }

  static unauthorized(details?: Record<string, any>) {
    return new AuthException('Unauthorized access', 'AUTH_UNAUTHORIZED', details);
  }

  static forbidden(details?: Record<string, any>) {
    return new AuthException('Forbidden access', 'AUTH_FORBIDDEN', details);
  }

  static accountLocked(details?: Record<string, any>) {
    return new AuthException('Account locked', 'AUTH_ACCOUNT_LOCKED', details);
  }

  static accountDisabled(details?: Record<string, any>) {
    return new AuthException('Account disabled', 'AUTH_ACCOUNT_DISABLED', details);
  }

  static accountSuspended(details?: Record<string, any>) {
    return new AuthException('Account suspended', 'AUTH_ACCOUNT_SUSPENDED', details);
  }

  static accountPending(details?: Record<string, any>) {
    return new AuthException('Account pending verification', 'AUTH_ACCOUNT_PENDING', details);
  }
}
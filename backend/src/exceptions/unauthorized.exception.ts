import { BaseException } from './base.exception';
import { HTTP_STATUS } from '../constants/http-status';

export class UnauthorizedException extends BaseException {
  constructor(
    message: string = 'Unauthorized',
    code: string = 'UNAUTHORIZED',
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

  static invalidToken(): UnauthorizedException {
    return new UnauthorizedException(
      'Invalid or expired token',
      'INVALID_TOKEN'
    );
  }

  static missingToken(): UnauthorizedException {
    return new UnauthorizedException(
      'Authorization token required',
      'MISSING_TOKEN'
    );
  }

  static invalidCredentials(): UnauthorizedException {
    return new UnauthorizedException(
      'Invalid email or password',
      'INVALID_CREDENTIALS'
    );
  }

  static sessionExpired(): UnauthorizedException {
    return new UnauthorizedException(
      'Session expired, please login again',
      'SESSION_EXPIRED'
    );
  }
}
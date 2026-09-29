import { BaseException } from './base.exception';
import { HTTP_STATUS } from '../constants/http-status';

export class ForbiddenException extends BaseException {
  constructor(
    message: string = 'Forbidden',
    code: string = 'FORBIDDEN',
    details?: Record<string, any>
  ) {
    super(HTTP_STATUS.FORBIDDEN, code, message, details);
  }

  toResponse() {
    return {
      success: false,
      message: this.message,
      code: this.code,
      details: this.details,
    };
  }

  static insufficientPermissions(): ForbiddenException {
    return new ForbiddenException(
      'Insufficient permissions',
      'INSUFFICIENT_PERMISSIONS'
    );
  }

  static roleRequired(role: string): ForbiddenException {
    return new ForbiddenException(
      `Role ${role} required`,
      'ROLE_REQUIRED',
      { role }
    );
  }

  static resourceAccess(resource: string): ForbiddenException {
    return new ForbiddenException(
      `Access denied to ${resource}`,
      'ACCESS_DENIED',
      { resource }
    );
  }

  static accountSuspended(): ForbiddenException {
    return new ForbiddenException(
      'Account is suspended',
      'ACCOUNT_SUSPENDED'
    );
  }

  static accountInactive(): ForbiddenException {
    return new ForbiddenException(
      'Account is inactive',
      'ACCOUNT_INACTIVE'
    );
  }
}
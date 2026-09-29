import { BaseException } from './base.exception';
import { HTTP_STATUS } from '../constants/http-status';

export class ConflictException extends BaseException {
  constructor(
    message: string = 'Resource conflict',
    code: string = 'CONFLICT',
    details?: Record<string, any>
  ) {
    super(HTTP_STATUS.CONFLICT, code, message, details);
  }

  toResponse() {
    return {
      success: false,
      message: this.message,
      code: this.code,
      details: this.details,
    };
  }

  static duplicate(field: string, value: string) {
    return new ConflictException(
      `${field} "${value}" already exists`,
      'CONFLICT_DUPLICATE',
      { field, value }
    );
  }

  static email(email: string) {
    return new ConflictException(`Email "${email}" already registered`, 'CONFLICT_EMAIL', { email });
  }

  static slug(slug: string) {
    return new ConflictException(`Slug "${slug}" already exists`, 'CONFLICT_SLUG', { slug });
  }

  static phone(phone: string) {
    return new ConflictException(`Phone "${phone}" already registered`, 'CONFLICT_PHONE', { phone });
  }

  static alreadyRegistered(resource: string) {
    return new ConflictException(
      `Already registered for ${resource}`,
      'CONFLICT_ALREADY_REGISTERED',
      { resource }
    );
  }

  static inUse(resource: string) {
    return new ConflictException(
      `${resource} is in use and cannot be deleted`,
      'CONFLICT_IN_USE',
      { resource }
    );
  }
}

export default ConflictException;
import { BaseException } from './base.exception';
import { HTTP_STATUS } from '../constants/http-status';

export class NotFoundException extends BaseException {
  constructor(
    message: string = 'Resource not found',
    code: string = 'NOT_FOUND',
    details?: Record<string, any>
  ) {
    super(HTTP_STATUS.NOT_FOUND, code, message, details);
  }

  static resource(model: string, id: string): NotFoundException {
    return new NotFoundException(
      `${model} with id ${id} not found`,
      'RESOURCE_NOT_FOUND',
      { model, id }
    );
  }

  static email(email: string): NotFoundException {
    return new NotFoundException(
      `User with email ${email} not found`,
      'EMAIL_NOT_FOUND',
      { email }
    );
  }

  static slug(slug: string): NotFoundException {
    return new NotFoundException(
      `Resource with slug ${slug} not found`,
      'SLUG_NOT_FOUND',
      { slug }
    );
  }

  static custom(message: string, details?: Record<string, any>): NotFoundException {
    return new NotFoundException(message, 'CUSTOM_NOT_FOUND', details);
  }
}
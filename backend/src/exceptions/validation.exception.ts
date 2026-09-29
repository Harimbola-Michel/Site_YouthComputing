import { BaseException } from './base.exception';
import { HTTP_STATUS } from '@constants/http-status';

export class ValidationException extends BaseException {
  constructor(
    message: string = 'Validation failed',
    code: string = 'VALIDATION_ERROR',
    details?: Record<string, any>
  ) {
    super(HTTP_STATUS.UNPROCESSABLE_ENTITY, code, message, details);
  }

  toResponse() {
    return {
      success: false,
      message: this.message,
      code: this.code,
      details: this.details,
    };
  }

  static invalidInput(details?: Record<string, any>) {
    return new ValidationException('Invalid input', 'VALIDATION_INVALID_INPUT', details);
  }

  static missingField(field: string) {
    return new ValidationException(
      `Missing required field: ${field}`,
      'VALIDATION_MISSING_FIELD',
      { field }
    );
  }

  static invalidFormat(field: string, expected: string) {
    return new ValidationException(
      `Invalid format for ${field}`,
      'VALIDATION_INVALID_FORMAT',
      { field, expected }
    );
  }

  static maxLength(field: string, max: number) {
    return new ValidationException(
      `${field} exceeds maximum length of ${max}`,
      'VALIDATION_MAX_LENGTH',
      { field, max }
    );
  }

  static minLength(field: string, min: number) {
    return new ValidationException(
      `${field} must be at least ${min} characters`,
      'VALIDATION_MIN_LENGTH',
      { field, min }
    );
  }

  static invalidEmail(email: string) {
    return new ValidationException(
      `Invalid email address: ${email}`,
      'VALIDATION_INVALID_EMAIL',
      { email }
    );
  }

  static invalidPhone(phone: string) {
    return new ValidationException(
      `Invalid phone number: ${phone}`,
      'VALIDATION_INVALID_PHONE',
      { phone }
    );
  }

  static invalidUrl(url: string) {
    return new ValidationException(
      `Invalid URL: ${url}`,
      'VALIDATION_INVALID_URL',
      { url }
    );
  }

  static invalidDate(date: string) {
    return new ValidationException(
      `Invalid date: ${date}`,
      'VALIDATION_INVALID_DATE',
      { date }
    );
  }

  static invalidEnum(field: string, value: string, allowed: string[]) {
    return new ValidationException(
      `Invalid value for ${field}: ${value}`,
      'VALIDATION_INVALID_ENUM',
      { field, value, allowed }
    );
  }
}
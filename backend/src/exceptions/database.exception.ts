import { BaseException } from './base.exception';
import { HTTP_STATUS } from '../constants/http-status';

export class DatabaseException extends BaseException {
  constructor(
    message: string = 'Database error',
    code: string = 'DATABASE_ERROR',
    details?: Record<string, any>
  ) {
    super(HTTP_STATUS.INTERNAL_SERVER, code, message, details);
  }

  toResponse() {
    return {
      success: false,
      message: this.message,
      code: this.code,
      details: this.details,
    };
  }

  static connectionError(details?: Record<string, any>) {
    return new DatabaseException('Database connection error', 'DB_CONNECTION_ERROR', details);
  }

  static queryError(query: string, details?: Record<string, any>) {
    return new DatabaseException('Database query error', 'DB_QUERY_ERROR', { query, ...details });
  }

  static transactionError(details?: Record<string, any>) {
    return new DatabaseException('Database transaction error', 'DB_TRANSACTION_ERROR', details);
  }

  static duplicateKey(field: string, value: string) {
    return new DatabaseException(
      `Duplicate entry for ${field}: ${value}`,
      'DB_DUPLICATE_KEY',
      { field, value }
    );
  }

  static foreignKeyError(table: string, field: string) {
    return new DatabaseException(
      `Foreign key constraint failed on ${table}.${field}`,
      'DB_FOREIGN_KEY',
      { table, field }
    );
  }

  static recordNotFound(table: string, id: string) {
    return new DatabaseException(
      `Record not found in ${table}`,
      'DB_RECORD_NOT_FOUND',
      { table, id }
    );
  }
}
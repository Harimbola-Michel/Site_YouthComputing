export { BaseException } from './base.exception';
export { NotFoundException } from './not-found.exception';
export { DatabaseException } from './database.exception';
export { ConflictException } from './conflict.exception';
export { UnauthorizedException } from './unauthorized.exception';
export { ForbiddenException } from './forbidden.exception';

// Exporter les types
export type { BaseException as BaseExceptionType } from './base.exception';
export type { NotFoundException as NotFoundExceptionType } from './not-found.exception';
export type { DatabaseException as DatabaseExceptionType } from './database.exception';
export type { ConflictException as ConflictExceptionType } from './conflict.exception';
export type { UnauthorizedException as UnauthorizedExceptionType } from './unauthorized.exception';
export type { ForbiddenException as ForbiddenExceptionType } from './forbidden.exception';
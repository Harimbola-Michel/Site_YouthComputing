import { Request, Response, NextFunction } from 'express';
import { validationResult, ValidationChain, ValidationError, body, query, param } from 'express-validator';
import { ApiError } from '@utils/ApiError';
import { logger } from '@config/logger';

export const validate = (validations: ValidationChain[]) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      await Promise.all(validations.map(validation => validation.run(req)));

      const errors = validationResult(req);
      if (errors.isEmpty()) {
        return next();
      }

      const errorMessages = errors.array().map((err: ValidationError) => {
        if (err.type === 'field') {
          return {
            field: err.path,
            message: err.msg,
            value: err.value,
          };
        }
        return {
          message: err.msg,
        };
      });

      throw ApiError.validation('Validation error', { errors: errorMessages });
    } catch (error) {
      next(error);
    }
  };
};

// Common validators
export const idParamValidator = [
  param('id')
    .isUUID()
    .withMessage('Invalid ID format'),
];

export const paginationValidators = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer')
    .toInt(),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100')
    .toInt(),
];

export const searchValidators = [
  query('search')
    .optional()
    .isString()
    .withMessage('Search query must be a string')
    .trim()
    .escape(),
  query('category')
    .optional()
    .isString()
    .withMessage('Category must be a string')
    .trim()
    .escape(),
  query('status')
    .optional()
    .isString()
    .withMessage('Status must be a string')
    .trim()
    .escape(),
];

export const dateRangeValidators = [
  query('dateFrom')
    .optional()
    .isISO8601()
    .withMessage('Invalid date format for dateFrom')
    .toDate(),
  query('dateTo')
    .optional()
    .isISO8601()
    .withMessage('Invalid date format for dateTo')
    .toDate(),
];

export const emailValidator = body('email')
  .isEmail()
  .withMessage('Please provide a valid email')
  .normalizeEmail();

export const passwordValidator = body('password')
  .isLength({ min: 8 })
  .withMessage('Password must be at least 8 characters long')
  .matches(/[A-Z]/)
  .withMessage('Password must contain at least one uppercase letter')
  .matches(/[a-z]/)
  .withMessage('Password must contain at least one lowercase letter')
  .matches(/[0-9]/)
  .withMessage('Password must contain at least one number')
  .matches(/[!@#$%^&*(),.?":{}|<>]/)
  .withMessage('Password must contain at least one special character');

export const nameValidator = (field: string = 'name') => 
  body(field)
    .notEmpty()
    .withMessage(`${field} is required`)
    .isLength({ min: 2, max: 100 })
    .withMessage(`${field} must be between 2 and 100 characters`)
    .trim()
    .escape();

export const phoneValidator = body('phone')
  .optional()
  .isMobilePhone('any')
  .withMessage('Please provide a valid phone number');

export const urlValidator = (field: string = 'url') =>
  body(field)
    .optional()
    .isURL()
    .withMessage('Please provide a valid URL');

export const slugValidator = body('slug')
  .optional()
  .isSlug()
  .withMessage('Slug must be a valid slug format');

export const booleanValidator = (field: string = 'isActive') =>
  body(field)
    .optional()
    .isBoolean()
    .withMessage('Must be a boolean value')
    .toBoolean();

export const numberValidator = (field: string, min?: number, max?: number) => {
  const validations = [
    body(field)
      .optional()
      .isNumeric()
      .withMessage('Must be a number')
      .toFloat(),
  ];

  if (min !== undefined) {
    validations.push(body(field)
      .isFloat({ min })
      .withMessage(`Must be at least ${min}`));
  }

  if (max !== undefined) {
    validations.push(body(field)
      .isFloat({ max })
      .withMessage(`Must be at most ${max}`));
  }

  return validations;
};

export const arrayValidator = (field: string, minItems: number = 0, maxItems: number = 100) =>
  body(field)
    .optional()
    .isArray({ min: minItems, max: maxItems })
    .withMessage(`Must be an array with ${minItems}-${maxItems} items`);

export const objectValidator = (field: string) =>
  body(field)
    .optional()
    .isObject()
    .withMessage('Must be an object');

export const enumValidator = (field: string, enumValues: string[]) =>
  body(field)
    .optional()
    .isIn(enumValues)
    .withMessage(`Must be one of: ${enumValues.join(', ')}`);
import { body, query, param } from 'express-validator';

// Custom validators for specific use cases

export const dateRangeValidator = [
  query('dateFrom')
    .optional()
    .isISO8601()
    .withMessage('Invalid date format for dateFrom')
    .toDate(),
  query('dateTo')
    .optional()
    .isISO8601()
    .withMessage('Invalid date format for dateTo')
    .toDate()
    .custom((value, { req }) => {
      if (value && req.query.dateFrom && value < new Date(req.query.dateFrom as string)) {
        throw new Error('dateTo must be after dateFrom');
      }
      return true;
    }),
];

export const paginationValidator = [
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
  query('sortBy')
    .optional()
    .isString()
    .withMessage('Sort by must be a string')
    .trim()
    .escape(),
  query('sortOrder')
    .optional()
    .isIn(['asc', 'desc'])
    .withMessage('Sort order must be asc or desc')
    .toLowerCase(),
];

export const searchValidator = [
  query('q')
    .optional()
    .isString()
    .withMessage('Search query must be a string')
    .trim()
    .escape()
    .isLength({ max: 200 })
    .withMessage('Search query must not exceed 200 characters'),
];

export const idParamValidator = [
  param('id')
    .isUUID()
    .withMessage('Invalid ID format'),
];

export const slugParamValidator = [
  param('slug')
    .isSlug()
    .withMessage('Invalid slug format')
    .trim()
    .escape(),
];

export const emailValidator = [
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email')
    .normalizeEmail(),
];

export const passwordValidator = [
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long')
    .matches(/[A-Z]/)
    .withMessage('Password must contain at least one uppercase letter')
    .matches(/[a-z]/)
    .withMessage('Password must contain at least one lowercase letter')
    .matches(/[0-9]/)
    .withMessage('Password must contain at least one number')
    .matches(/[!@#$%^&*(),.?":{}|<>]/)
    .withMessage('Password must contain at least one special character'),
];

export const confirmPasswordValidator = [
  body('confirmPassword')
    .custom((value, { req }) => value === req.body.password)
    .withMessage('Passwords do not match'),
];

export const urlValidator = [
  body('url')
    .optional()
    .isURL()
    .withMessage('Invalid URL format'),
];

export const phoneValidator = [
  body('phone')
    .optional()
    .isMobilePhone('any')
    .withMessage('Invalid phone number format'),
];

export const booleanValidator = [
  body('value')
    .optional()
    .isBoolean()
    .withMessage('Value must be a boolean')
    .toBoolean(),
];

export const numberValidator = (min?: number, max?: number) => {
  const validations: any[] = [
    body('value')
      .optional()
      .isNumeric()
      .withMessage('Value must be a number')
      .toFloat(),
  ];

  if (min !== undefined) {
    validations.push(
      body('value')
        .isFloat({ min })
        .withMessage(`Value must be at least ${min}`)
    );
  }

  if (max !== undefined) {
    validations.push(
      body('value')
        .isFloat({ max })
        .withMessage(`Value must be at most ${max}`)
    );
  }

  return validations;
};

export const arrayValidator = (minItems?: number, maxItems?: number) => {
  const validations: any[] = [
    body('items')
      .optional()
      .isArray()
      .withMessage('Must be an array'),
  ];

  if (minItems !== undefined) {
    validations.push(
      body('items')
        .isArray({ min: minItems })
        .withMessage(`Must have at least ${minItems} items`)
    );
  }

  if (maxItems !== undefined) {
    validations.push(
      body('items')
        .isArray({ max: maxItems })
        .withMessage(`Must have at most ${maxItems} items`)
    );
  }

  return validations;
};

export const enumValidator = (field: string, enumValues: string[]) => {
  return body(field)
    .optional()
    .isIn(enumValues)
    .withMessage(`Field must be one of: ${enumValues.join(', ')}`);
};

export const objectIdValidator = [
  body('id')
    .isMongoId()
    .withMessage('Invalid ObjectId format'),
];

export const jsonValidator = [
  body('data')
    .optional()
    .isJSON()
    .withMessage('Invalid JSON format'),
];

export const customValidator = (validator: (value: any) => boolean, message: string) => {
  return body('value')
    .custom(validator)
    .withMessage(message);
};
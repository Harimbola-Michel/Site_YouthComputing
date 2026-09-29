import { body } from 'express-validator';

export const createRecruitmentValidator = [
  body('title')
    .notEmpty()
    .withMessage('Title is required')
    .isLength({ min: 3, max: 200 })
    .withMessage('Title must be between 3 and 200 characters')
    .trim()
    .escape(),
  body('description')
    .notEmpty()
    .withMessage('Description is required')
    .isLength({ min: 10 })
    .withMessage('Description must be at least 10 characters')
    .trim(),
  body('requirements')
    .notEmpty()
    .withMessage('Requirements is required')
    .isLength({ min: 10 })
    .withMessage('Requirements must be at least 10 characters')
    .trim(),
  body('department')
    .notEmpty()
    .withMessage('Department is required')
    .isString()
    .withMessage('Department must be a string')
    .trim()
    .escape(),
  body('position')
    .notEmpty()
    .withMessage('Position is required')
    .isString()
    .withMessage('Position must be a string')
    .trim()
    .escape(),
  body('isActive')
    .optional()
    .isBoolean()
    .withMessage('isActive must be a boolean')
    .toBoolean(),
  body('deadline')
    .optional()
    .isISO8601()
    .withMessage('Deadline must be a valid date')
    .toDate()
    .custom((value) => {
      if (value && value < new Date()) {
        throw new Error('Deadline must be in the future');
      }
      return true;
    }),
];

export const updateRecruitmentValidator = [
  body('title')
    .optional()
    .isLength({ min: 3, max: 200 })
    .withMessage('Title must be between 3 and 200 characters')
    .trim()
    .escape(),
  body('description')
    .optional()
    .isLength({ min: 10 })
    .withMessage('Description must be at least 10 characters')
    .trim(),
  body('requirements')
    .optional()
    .isLength({ min: 10 })
    .withMessage('Requirements must be at least 10 characters')
    .trim(),
  body('department')
    .optional()
    .isString()
    .withMessage('Department must be a string')
    .trim()
    .escape(),
  body('position')
    .optional()
    .isString()
    .withMessage('Position must be a string')
    .trim()
    .escape(),
  body('isActive')
    .optional()
    .isBoolean()
    .withMessage('isActive must be a boolean')
    .toBoolean(),
  body('deadline')
    .optional()
    .isISO8601()
    .withMessage('Deadline must be a valid date')
    .toDate(),
];

export const createCandidatureValidator = [
  body('recruitmentId')
    .notEmpty()
    .withMessage('Recruitment ID is required')
    .isUUID()
    .withMessage('Recruitment ID must be a valid UUID'),
  body('fullName')
    .notEmpty()
    .withMessage('Full name is required')
    .isLength({ min: 2, max: 100 })
    .withMessage('Full name must be between 2 and 100 characters')
    .trim()
    .escape(),
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email')
    .normalizeEmail(),
  body('phone')
    .notEmpty()
    .withMessage('Phone number is required')
    .isMobilePhone('any')
    .withMessage('Please provide a valid phone number'),
  body('cvUrl')
    .notEmpty()
    .withMessage('CV URL is required')
    .isURL()
    .withMessage('CV URL must be a valid URL'),
  body('coverLetter')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('Cover letter must not exceed 1000 characters')
    .trim()
    .escape(),
];
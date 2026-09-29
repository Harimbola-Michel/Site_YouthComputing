// src/validators/user.validator.ts

import { body, param, query } from 'express-validator';
import { Role, UserStatus } from '../types/roles.enum';

export const createUserValidator = [
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email')
    .normalizeEmail(),
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
  body('firstName')
    .notEmpty()
    .withMessage('First name is required')
    .isLength({ min: 2, max: 50 })
    .withMessage('First name must be between 2 and 50 characters')
    .trim()
    .escape(),
  body('lastName')
    .notEmpty()
    .withMessage('Last name is required')
    .isLength({ min: 2, max: 50 })
    .withMessage('Last name must be between 2 and 50 characters')
    .trim()
    .escape(),
  body('phone')
    .optional()
    .isMobilePhone('any')
    .withMessage('Please provide a valid phone number'),
  body('role')
    .optional()
    .isIn(Object.values(Role))
    .withMessage(`Role must be one of: ${Object.values(Role).join(', ')}`),
  body('status')
    .optional()
    .isIn(Object.values(UserStatus))
    .withMessage(`Status must be one of: ${Object.values(UserStatus).join(', ')}`),
];

export const updateUserValidator = [
  body('email')
    .optional()
    .isEmail()
    .withMessage('Please provide a valid email')
    .normalizeEmail(),
  body('firstName')
    .optional()
    .isLength({ min: 2, max: 50 })
    .withMessage('First name must be between 2 and 50 characters')
    .trim()
    .escape(),
  body('lastName')
    .optional()
    .isLength({ min: 2, max: 50 })
    .withMessage('Last name must be between 2 and 50 characters')
    .trim()
    .escape(),
  body('phone')
    .optional()
    .isMobilePhone('any')
    .withMessage('Please provide a valid phone number'),
  body('bio')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Bio must not exceed 500 characters')
    .trim()
    .escape(),
  body('avatar')
    .optional()
    .isURL()
    .withMessage('Avatar must be a valid URL'),
  body('role')
    .optional()
    .isIn(Object.values(Role))
    .withMessage(`Role must be one of: ${Object.values(Role).join(', ')}`),
  body('status')
    .optional()
    .isIn(Object.values(UserStatus))
    .withMessage(`Status must be one of: ${Object.values(UserStatus).join(', ')}`),
  body('isActive')
    .optional()
    .isBoolean()
    .withMessage('isActive must be a boolean'),
];

export const changePasswordValidator = [
  body('currentPassword')
    .notEmpty()
    .withMessage('Current password is required'),
  body('newPassword')
    .isLength({ min: 8 })
    .withMessage('New password must be at least 8 characters long')
    .matches(/[A-Z]/)
    .withMessage('New password must contain at least one uppercase letter')
    .matches(/[a-z]/)
    .withMessage('New password must contain at least one lowercase letter')
    .matches(/[0-9]/)
    .withMessage('New password must contain at least one number')
    .matches(/[!@#$%^&*(),.?":{}|<>]/)
    .withMessage('New password must contain at least one special character'),
  body('confirmPassword')
    .custom((value, { req }) => value === req.body.newPassword)
    .withMessage('Passwords do not match'),
];

// ✅ CORRECTION : userIdValidator accepte désormais toute chaîne non vide (pour les CUID)
export const userIdValidator = [
  param('id')
    .isString()
    .notEmpty()
    .withMessage('Invalid user ID format'),
];

export const changeRoleValidator = [
  ...userIdValidator,
  body('role')
    .isIn(Object.values(Role))
    .withMessage(`Role must be one of: ${Object.values(Role).join(', ')}`),
];

export const toggleStatusValidator = [
  ...userIdValidator,
];

export const userFilterValidator = [
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
  query('search')
    .optional()
    .isString()
    .withMessage('Search must be a string')
    .trim()
    .escape(),
  query('role')
    .optional()
    .isIn(Object.values(Role))
    .withMessage(`Role must be one of: ${Object.values(Role).join(', ')}`),
  query('status')
    .optional()
    .isIn(Object.values(UserStatus))
    .withMessage(`Status must be one of: ${Object.values(UserStatus).join(', ')}`),
  query('isActive')
    .optional()
    .isBoolean()
    .withMessage('isActive must be a boolean')
    .toBoolean(),
  query('sortBy')
    .optional()
    .isIn(['createdAt', 'updatedAt', 'firstName', 'lastName', 'email', 'role', 'status'])
    .withMessage('Invalid sort field'),
  query('sortOrder')
    .optional()
    .isIn(['asc', 'desc'])
    .withMessage('Sort order must be asc or desc'),
];

export const updateProfileValidator = [
  body('firstName')
    .optional()
    .isLength({ min: 2, max: 50 })
    .withMessage('First name must be between 2 and 50 characters')
    .trim()
    .escape(),
  body('lastName')
    .optional()
    .isLength({ min: 2, max: 50 })
    .withMessage('Last name must be between 2 and 50 characters')
    .trim()
    .escape(),
  body('phone')
    .optional()
    .isMobilePhone('any')
    .withMessage('Please provide a valid phone number'),
  body('bio')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Bio must not exceed 500 characters')
    .trim()
    .escape(),
  body('avatar')
    .optional()
    .isURL()
    .withMessage('Avatar must be a valid URL'),
];

export default {
  createUserValidator,
  updateUserValidator,
  changePasswordValidator,
  userIdValidator,
  userFilterValidator,
  updateProfileValidator,
  changeRoleValidator,
  toggleStatusValidator,
};
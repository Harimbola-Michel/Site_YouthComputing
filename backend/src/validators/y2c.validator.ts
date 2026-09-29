import { body } from 'express-validator';
import { Y2CMemberStatus, EventType } from '../types/roles.enum';

export const createY2CMemberValidator = [
  body('name')
    .notEmpty()
    .withMessage('Name is required')
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters')
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
  body('studentId')
    .optional()
    .isString()
    .withMessage('Student ID must be a string')
    .trim()
    .escape(),
  body('institution')
    .optional()
    .isString()
    .withMessage('Institution must be a string')
    .trim()
    .escape(),
  body('membershipFeePaid')
    .optional()
    .isNumeric()
    .withMessage('Membership fee must be a number')
    .toFloat(),
];

// ✅ Inscription à un événement Y2C (validateur utilisé par la route publique)
export const registerForEventValidator = [
  body('fullName')   // ⬅️ aligné avec le frontend
    .isString()
    .notEmpty()
    .withMessage('Le nom complet est requis')
    .isLength({ min: 2 })
    .withMessage('Le nom doit contenir au moins 2 caractères'),
  body('email')
    .isEmail()
    .withMessage('Email invalide')
    .normalizeEmail(),
  body('phone')
    .isString()
    .notEmpty()
    .withMessage('Le numéro de téléphone est requis')
    .isLength({ min: 8 })
    .withMessage('Le téléphone doit contenir au moins 8 caractères')
    .matches(/^[+\d\s\-()]+$/)
    .withMessage('Format de téléphone invalide'),
];

export const updateY2CMemberValidator = [
  body('name')
    .optional()
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters')
    .trim()
    .escape(),
  body('email')
    .optional()
    .isEmail()
    .withMessage('Please provide a valid email')
    .normalizeEmail(),
  body('phone')
    .optional()
    .isMobilePhone('any')
    .withMessage('Please provide a valid phone number'),
  body('studentId')
    .optional()
    .isString()
    .withMessage('Student ID must be a string')
    .trim()
    .escape(),
  body('institution')
    .optional()
    .isString()
    .withMessage('Institution must be a string')
    .trim()
    .escape(),
  body('membershipFeePaid')
    .optional()
    .isNumeric()
    .withMessage('Membership fee must be a number')
    .toFloat(),
  body('status')
    .optional()
    .isIn(Object.values(Y2CMemberStatus))
    .withMessage(`Status must be one of: ${Object.values(Y2CMemberStatus).join(', ')}`),
  body('expiresAt')
    .optional()
    .isISO8601()
    .withMessage('Expires at must be a valid date')
    .toDate(),
];

export const createY2CEventValidator = [
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
  body('eventType')
    .isIn(Object.values(EventType))
    .withMessage(`Event type must be one of: ${Object.values(EventType).join(', ')}`),
  body('startDate')
    .isISO8601()
    .withMessage('Start date must be a valid date')
    .toDate(),
  body('endDate')
    .isISO8601()
    .withMessage('End date must be a valid date')
    .toDate()
    .custom((value, { req }) => {
      if (value <= req.body.startDate) {
        throw new Error('End date must be after start date');
      }
      return true;
    }),
  body('location')
    .notEmpty()
    .withMessage('Location is required')
    .isString()
    .withMessage('Location must be a string')
    .trim()
    .escape(),
  body('maxParticipants')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Max participants must be a positive integer')
    .toInt(),
  body('isPaid')
    .optional()
    .isBoolean()
    .withMessage('isPaid must be a boolean')
    .toBoolean(),
  body('price')
    .optional()
    .isNumeric()
    .withMessage('Price must be a number')
    .toFloat(),
  body('imageUrl')
    .optional()
    .isURL()
    .withMessage('Image URL must be a valid URL'),
  body('isPublished')
    .optional()
    .isBoolean()
    .withMessage('isPublished must be a boolean')
    .toBoolean(),
];

export const updateY2CEventValidator = [
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
  body('eventType')
    .optional()
    .isIn(Object.values(EventType))
    .withMessage(`Event type must be one of: ${Object.values(EventType).join(', ')}`),
  body('startDate')
    .optional()
    .isISO8601()
    .withMessage('Start date must be a valid date')
    .toDate(),
  body('endDate')
    .optional()
    .isISO8601()
    .withMessage('End date must be a valid date')
    .toDate(),
  body('location')
    .optional()
    .isString()
    .withMessage('Location must be a string')
    .trim()
    .escape(),
  body('maxParticipants')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Max participants must be a positive integer')
    .toInt(),
  body('isPaid')
    .optional()
    .isBoolean()
    .withMessage('isPaid must be a boolean')
    .toBoolean(),
  body('price')
    .optional()
    .isNumeric()
    .withMessage('Price must be a number')
    .toFloat(),
  body('imageUrl')
    .optional()
    .isURL()
    .withMessage('Image URL must be a valid URL'),
  body('isPublished')
    .optional()
    .isBoolean()
    .withMessage('isPublished must be a boolean')
    .toBoolean(),
];
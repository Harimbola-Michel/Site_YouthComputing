// src/validators/formation.validator.ts
import { body } from 'express-validator';
import { FormationLevel } from '../types/roles.enum';
import validator from 'validator';

export const createFormationValidator = [
  body('title')
    .notEmpty().withMessage('Title is required')
    .isLength({ min: 3, max: 200 }).withMessage('Title must be between 3 and 200 characters')
    .trim()
    .escape(),
  body('description')
    .notEmpty().withMessage('Description is required')
    .isLength({ min: 10 }).withMessage('Description must be at least 10 characters')
    .trim(),
  body('objectives')
    .optional({ nullable: true })
    .isLength({ max: 1000 }).withMessage('Objectives must not exceed 1000 characters')
    .trim(),
  body('prerequisites')
    .optional({ nullable: true })
    .isLength({ max: 500 }).withMessage('Prerequisites must not exceed 500 characters')
    .trim(),
  body('duration')
    .notEmpty().withMessage('Duration is required')
    .isString().withMessage('Duration must be a string')
    .trim()
    .escape(),
  body('level')
    .notEmpty().withMessage('Level is required')
    .isIn(Object.values(FormationLevel)).withMessage(`Level must be one of: ${Object.values(FormationLevel).join(', ')}`),
  body('price')
    .optional({ nullable: true })
    .isNumeric().withMessage('Price must be a number')
    .toFloat(),
  body('category')
    .notEmpty().withMessage('Category is required')
    .isString().withMessage('Category must be a string')
    .trim()
    .escape(),
  body('imageUrl')
    .optional({ nullable: true })
    .custom((value) => {
      if (!value) return true;
      // Accepte les chemins relatifs commençant par /uploads/
      if (value.startsWith('/uploads/')) return true;
      // Accepte les URLs complètes (http, https)
      if (validator.isURL(value, { protocols: ['http', 'https'], require_protocol: true })) return true;
      throw new Error('Image URL must be a valid URL or a relative path starting with /uploads/');
    }),
  body('isPublished')
    .optional({ nullable: true })
    .isBoolean().withMessage('isPublished must be a boolean')
    .toBoolean(),
  body('maxParticipants')
    .optional({ nullable: true })
    .isInt({ min: 1 }).withMessage('Max participants must be a positive integer')
    .toInt(),
];

export const updateFormationValidator = [
  body('title')
    .optional({ nullable: true })
    .isLength({ min: 3, max: 200 }).withMessage('Title must be between 3 and 200 characters')
    .trim()
    .escape(),
  body('description')
    .optional({ nullable: true })
    .isLength({ min: 10 }).withMessage('Description must be at least 10 characters')
    .trim(),
  body('objectives')
    .optional({ nullable: true })
    .isLength({ max: 1000 }).withMessage('Objectives must not exceed 1000 characters')
    .trim(),
  body('prerequisites')
    .optional({ nullable: true })
    .isLength({ max: 500 }).withMessage('Prerequisites must not exceed 500 characters')
    .trim(),
  body('duration')
    .optional({ nullable: true })
    .isString().withMessage('Duration must be a string')
    .trim()
    .escape(),
  body('level')
    .optional({ nullable: true })
    .isIn(Object.values(FormationLevel)).withMessage(`Level must be one of: ${Object.values(FormationLevel).join(', ')}`),
  body('price')
    .optional({ nullable: true })
    .isNumeric().withMessage('Price must be a number')
    .toFloat(),
  body('category')
    .optional({ nullable: true })
    .isString().withMessage('Category must be a string')
    .trim()
    .escape(),
  body('imageUrl')
    .optional({ nullable: true })
    .custom((value) => {
      if (!value) return true;
      if (value.startsWith('/uploads/')) return true;
      if (validator.isURL(value, { protocols: ['http', 'https'], require_protocol: true })) return true;
      throw new Error('Image URL must be a valid URL or a relative path starting with /uploads/');
    }),
  body('isPublished')
    .optional({ nullable: true })
    .isBoolean().withMessage('isPublished must be a boolean')
    .toBoolean(),
  body('maxParticipants')
    .optional({ nullable: true })
    .isInt({ min: 1 }).withMessage('Max participants must be a positive integer')
    .toInt(),
];

export const createFormationSessionValidator = [
  body('startDate')
    .isISO8601().withMessage('Start date must be a valid date')
    .toDate(),
  body('endDate')
    .isISO8601().withMessage('End date must be a valid date')
    .toDate()
    .custom((value, { req }) => {
      if (value <= req.body.startDate) throw new Error('End date must be after start date');
      return true;
    }),
  body('location')
    .notEmpty().withMessage('Location is required')
    .isString().withMessage('Location must be a string')
    .trim()
    .escape(),
  body('maxParticipants')
    .isInt({ min: 1 }).withMessage('Max participants must be a positive integer')
    .toInt(),
  body('price')
    .optional({ nullable: true })
    .isNumeric().withMessage('Price must be a number')
    .toFloat(),
];

export const updateFormationSessionValidator = [
  body('startDate')
    .optional({ nullable: true })
    .isISO8601().withMessage('Start date must be a valid date')
    .toDate(),
  body('endDate')
    .optional({ nullable: true })
    .isISO8601().withMessage('End date must be a valid date')
    .toDate()
    .custom((value, { req }) => {
      if (value && req.body.startDate && value <= req.body.startDate) {
        throw new Error('End date must be after start date');
      }
      return true;
    }),
  body('location')
    .optional({ nullable: true })
    .isString().withMessage('Location must be a string')
    .trim()
    .escape(),
  body('maxParticipants')
    .optional({ nullable: true })
    .isInt({ min: 1 }).withMessage('Max participants must be a positive integer')
    .toInt(),
  body('price')
    .optional({ nullable: true })
    .isNumeric().withMessage('Price must be a number')
    .toFloat(),
  body('status')
    .optional({ nullable: true })
    .isIn(['SCHEDULED', 'ONGOING', 'COMPLETED', 'CANCELLED'])
    .withMessage('Status must be one of: SCHEDULED, ONGOING, COMPLETED, CANCELLED'),
];
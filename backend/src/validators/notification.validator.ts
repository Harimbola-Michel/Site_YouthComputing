// backend/src/validators/notification.validator.ts

import { body } from 'express-validator';

export const createNotificationValidator = [
  body('userId')
    .optional()
    .isString()
    .withMessage('userId doit être une chaîne de caractères'),
  body('type')
    .isString()
    .notEmpty()
    .withMessage('type est requis'),
  body('title')
    .isString()
    .notEmpty()
    .withMessage('title est requis'),
  body('message')
    .isString()
    .notEmpty()
    .withMessage('message est requis'),
  body('link')
    .optional()
    .isString()
    .withMessage('link doit être une URL'),
];
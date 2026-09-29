// src/validators/team-member.validator.ts
import { body, param } from 'express-validator';

export const createTeamMemberValidator = [
  body('userId')
    .notEmpty().withMessage('userId est requis')
    .isString()
    .trim(),
  body('role')
    .notEmpty().withMessage('Le rôle est requis')
    .isString()
    .trim()
    .escape(),
  body('department')
    .notEmpty().withMessage('Le département est requis') // ✅ requis
    .isString()
    .trim()
    .escape(),
  body('bio')
    .optional({ nullable: true, checkFalsy: true })
    .isString()
    .trim()
    .escape()
    .customSanitizer((value) => (value === '' ? null : value)),
  body('photoUrl')
    .optional({ nullable: true, checkFalsy: true })
    .isURL().withMessage('photoUrl doit être une URL valide')
    .customSanitizer((value) => (value === '' ? null : value)),
  body('linkedin')
    .optional({ nullable: true, checkFalsy: true })
    .isURL().withMessage('LinkedIn doit être une URL valide')
    .customSanitizer((value) => (value === '' ? null : value)),
  body('displayOrder')
    .optional({ nullable: true })
    .isInt({ min: 0 })
    .toInt(),
  body('isActive')
    .optional({ nullable: true })
    .isBoolean()
    .toBoolean(),
];

export const updateTeamMemberValidator = [
  param('id')
    .notEmpty().withMessage('ID requis')
    .isString()
    .trim(),
  body('role')
    .optional()
    .isString()
    .trim()
    .escape(),
  body('department')
    .optional({ nullable: true, checkFalsy: true })
    .isString()
    .trim()
    .escape()
    .customSanitizer((value) => (value === '' ? null : value)),
  body('bio')
    .optional({ nullable: true, checkFalsy: true })
    .isString()
    .trim()
    .escape()
    .customSanitizer((value) => (value === '' ? null : value)),
  body('photoUrl')
    .optional({ nullable: true, checkFalsy: true })
    .isURL().withMessage('photoUrl doit être une URL valide')
    .customSanitizer((value) => (value === '' ? null : value)),
  body('linkedin')
    .optional({ nullable: true, checkFalsy: true })
    .isURL().withMessage('LinkedIn doit être une URL valide')
    .customSanitizer((value) => (value === '' ? null : value)),
  body('displayOrder')
    .optional({ nullable: true })
    .isInt({ min: 0 })
    .toInt(),
  body('isActive')
    .optional({ nullable: true })
    .isBoolean()
    .toBoolean(),
];
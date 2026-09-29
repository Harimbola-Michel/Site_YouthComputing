// src/validators/export.validator.ts
import { body } from 'express-validator';

// ✅ Définition locale des énumérations (évite l’import de @prisma/client)
const EXPORT_TYPES = [
  'FORMATIONS',
  'INSCRIPTIONS',
  'PAIEMENTS',
  'MEMBRES_Y2C',
  'ARTICLES',
  'PROJETS',
  'UTILISATEURS',
  'RECRUTEMENTS',
  'CANDIDATURES',
  'CONTACTS',
] as const;

const EXPORT_FORMATS = ['CSV', 'EXCEL', 'PDF'] as const;

export const createExportValidator = [
  body('type')
    .isIn(EXPORT_TYPES)
    .withMessage(
      `Type d'export invalide. Valeurs autorisées : ${EXPORT_TYPES.join(', ')}`
    ),

  body('format')
    .isIn(EXPORT_FORMATS)
    .withMessage(
      `Format d'export invalide. Valeurs autorisées : ${EXPORT_FORMATS.join(', ')}`
    ),

  body('filters')
    .optional()
    .isObject()
    .withMessage('filters doit être un objet'),

  body('filters.dateFrom')
    .optional()
    .isISO8601()
    .withMessage('dateFrom doit être une date ISO valide'),

  body('filters.dateTo')
    .optional()
    .isISO8601()
    .withMessage('dateTo doit être une date ISO valide'),

  body('filters.status')
    .optional()
    .isString()
    .withMessage('status doit être une chaîne de caractères'),

  body('filters.paymentStatus')
    .optional()
    .isString()
    .withMessage('paymentStatus doit être une chaîne de caractères'),

  body('filters.formationId')
    .optional()
    .isString()
    .withMessage('formationId doit être une chaîne de caractères'),

  body('filters.sessionId')
    .optional()
    .isString()
    .withMessage('sessionId doit être une chaîne de caractères'),

  body('filters.userId')
    .optional()
    .isString()
    .withMessage('userId doit être une chaîne de caractères'),

  body('filters.search')
    .optional()
    .isString()
    .withMessage('search doit être une chaîne de caractères'),
];
// src/validators/contact.validator.ts

import { body, param } from 'express-validator';

// ✅ Validation commune pour l'ID (accepte CUID Prisma)
const idParamValidator = [
  param('id')
    .isString()
    .notEmpty()
    .withMessage('ID de message invalide')
    .matches(/^c[a-z0-9]{24}$/)
    .withMessage("L'ID doit être un CUID valide (ex: cmswvbdu00004bulql7r5n8rw)"),
];

// ✅ Validateur pour la création d'un message
export const createContactMessageValidator = [
  body('name')
    .isString()
    .notEmpty()
    .withMessage('Le nom est requis')
    .isLength({ max: 100 })
    .withMessage('Le nom ne peut pas dépasser 100 caractères'),
  body('email')
    .isEmail()
    .withMessage('Email invalide')
    .normalizeEmail(),
  body('subject')
    .isString()
    .notEmpty()
    .withMessage('Le sujet est requis')
    .isLength({ max: 200 })
    .withMessage('Le sujet ne peut pas dépasser 200 caractères'),
  body('message')
    .isString()
    .notEmpty()
    .withMessage('Le message est requis')
    .isLength({ min: 10, max: 5000 })
    .withMessage('Le message doit contenir entre 10 et 5000 caractères'),
];

// ✅ Validateur pour la réponse à un message
export const replyContactMessageValidator = [
  ...idParamValidator, // ✅ ID CUID valide
  body('content')      // ✅ aligné avec le frontend (au lieu de 'replyContent')
    .isString()
    .notEmpty()
    .withMessage('Le contenu de la réponse est requis')
    .isLength({ min: 3 })
    .withMessage('Le contenu doit contenir au moins 3 caractères')
    .isLength({ max: 5000 })
    .withMessage('Le contenu ne peut pas dépasser 5000 caractères'),
  // repliedBy est ajouté automatiquement par le contrôleur, pas besoin de le valider ici
];
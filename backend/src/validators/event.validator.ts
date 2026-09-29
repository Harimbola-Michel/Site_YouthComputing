// src/validators/event.validator.ts
import { body, param } from 'express-validator';

// ✅ Validation de l'ID au format CUID (Prisma)
const eventIdValidator = [
  param('id')
    .isString()
    .notEmpty()
    .withMessage('ID de l’événement invalide')
    .matches(/^c[a-z0-9]{24}$/)
    .withMessage("L'ID doit être un CUID valide (ex: cmst5dndi0000jwdjkrbf4trl)"),
];

// ✅ Création d'un événement
export const createEventValidator = [
  body('title')
    .isString()
    .notEmpty()
    .withMessage('Le titre est requis'),
  body('description')
    .optional()
    .isString()
    .withMessage('La description doit être une chaîne de caractères'),
  body('eventType')
    .optional()
    .isString()
    .withMessage('Le type d’événement doit être une chaîne'),
  body('startDate')
    .isISO8601({ strict: true })
    .withMessage('La date de début doit être une date ISO 8601 valide'),
  body('endDate')
    .optional()
    .isISO8601({ strict: true })
    .withMessage('La date de fin doit être une date ISO 8601 valide'),
  body('location')
    .optional()
    .isString()
    .withMessage('Le lieu doit être une chaîne de caractères'),
  body('maxAttendees')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Le nombre maximum de participants doit être un entier positif'),
  body('isPaid')
    .optional()
    .isBoolean()
    .withMessage('isPaid doit être un booléen'),
  body('price')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Le prix doit être un nombre positif'),
  body('imageUrl')
    .optional()
    .isURL()
    .withMessage("L'URL de l'image doit être une URL valide"),
];

// ✅ Mise à jour d'un événement
export const updateEventValidator = [
  ...eventIdValidator,
  body('title')
    .optional()
    .notEmpty()
    .withMessage('Le titre ne peut pas être vide'),
  body('description')
    .optional()
    .isString()
    .withMessage('La description doit être une chaîne de caractères'),
  body('eventType')
    .optional()
    .isString()
    .withMessage('Le type d’événement doit être une chaîne'),
  body('startDate')
    .optional()
    .isISO8601({ strict: true })
    .withMessage('La date de début doit être une date ISO 8601 valide'),
  body('endDate')
    .optional()
    .isISO8601({ strict: true })
    .withMessage('La date de fin doit être une date ISO 8601 valide'),
  body('location')
    .optional()
    .isString()
    .withMessage('Le lieu doit être une chaîne de caractères'),
  body('maxAttendees')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Le nombre maximum de participants doit être un entier positif'),
  body('isPaid')
    .optional()
    .isBoolean()
    .withMessage('isPaid doit être un booléen'),
  body('price')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Le prix doit être un nombre positif'),
  body('imageUrl')
    .optional()
    .isURL()
    .withMessage("L'URL de l'image doit être une URL valide"),
];

// ✅ Inscription à un événement (corrigé)
export const registerForEventValidator = [
  ...eventIdValidator, // ✅ ID CUID accepté
  body('fullName')     // ✅ attend 'fullName' (aligné avec le frontend)
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
    .withMessage('Le téléphone ne doit contenir que des chiffres, espaces, +, - et parenthèses'),
];
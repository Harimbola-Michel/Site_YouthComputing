import { body, param } from 'express-validator';

// ─── Validation d'ID CUID ──────────────────────────────────────
const partnerIdValidator = [
  param('id')
    .isString()
    .notEmpty()
    .withMessage('ID partenaire invalide')
    .matches(/^c[a-z0-9]{24}$/)
    .withMessage("L'ID doit être un CUID valide (ex: cmt8zpj5w001da0bxy3c5...)"),
];

// ─── Création ──────────────────────────────────────────────────
export const createPartnerValidator = [
  body('name')
    .notEmpty()
    .withMessage('Le nom du partenaire est requis')
    .isLength({ min: 2, max: 100 })
    .withMessage('Le nom doit contenir entre 2 et 100 caractères')
    .trim()
    .escape(),
  body('logo')
    .optional({ checkFalsy: true })
    .custom((value) => {
      if (!value) return true;
      if (typeof value === 'string' && (value.startsWith('/uploads/') || value.startsWith('uploads/'))) {
        return true;
      }
      try {
        // eslint-disable-next-line no-new
        new URL(value);
        return true;
      } catch {
        throw new Error('Le logo doit être une URL valide ou un chemin /uploads/...');
      }
    }),
  body('website')
    .optional({ checkFalsy: true })
    .isURL()
    .withMessage('Le site web doit être une URL valide'),
  body('description')
    .optional()
    .isLength({ max: 500 })
    .withMessage('La description ne doit pas dépasser 500 caractères')
    .trim()
    .escape(),
  body('email')
    .optional({ checkFalsy: true })
    .isEmail()
    .withMessage('Email invalide'),
  body('phone')
    .optional()
    .isString()
    .withMessage('Le téléphone doit être une chaîne de caractères'),
  body('isActive')
    .optional()
    .isBoolean()
    .withMessage('isActive doit être un booléen')
    .toBoolean(),
];

// ─── Mise à jour ──────────────────────────────────────────────
export const updatePartnerValidator = [
  ...partnerIdValidator,
  body('name')
    .optional()
    .isLength({ min: 2, max: 100 })
    .withMessage('Le nom doit contenir entre 2 et 100 caractères')
    .trim()
    .escape(),
  body('logo')
    .optional({ checkFalsy: true })
    .custom((value) => {
      if (!value) return true;
      if (typeof value === 'string' && (value.startsWith('/uploads/') || value.startsWith('uploads/'))) {
        return true;
      }
      try {
        // eslint-disable-next-line no-new
        new URL(value);
        return true;
      } catch {
        throw new Error('Le logo doit être une URL valide ou un chemin /uploads/...');
      }
    }),
  body('website')
    .optional({ checkFalsy: true })
    .isURL()
    .withMessage('Le site web doit être une URL valide'),
  body('description')
    .optional()
    .isLength({ max: 500 })
    .withMessage('La description ne doit pas dépasser 500 caractères')
    .trim()
    .escape(),
  body('email')
    .optional({ checkFalsy: true })
    .isEmail()
    .withMessage('Email invalide'),
  body('phone')
    .optional()
    .isString()
    .withMessage('Le téléphone doit être une chaîne de caractères'),
  body('isActive')
    .optional()
    .isBoolean()
    .withMessage('isActive doit être un booléen')
    .toBoolean(),
];

// ─── Demande de partenariat (publique) ──────────────────────
export const partnerRequestValidator = [
  body('companyName')
    .isString()
    .notEmpty()
    .withMessage('Le nom de l’entreprise est requis')
    .isLength({ min: 2, max: 100 })
    .withMessage('Le nom doit contenir entre 2 et 100 caractères')
    .trim()
    .escape(),
  body('contactName')
    .isString()
    .notEmpty()
    .withMessage('Le nom du contact est requis')
    .isLength({ min: 2, max: 100 })
    .withMessage('Le nom doit contenir entre 2 et 100 caractères')
    .trim()
    .escape(),
  body('email')
    .isEmail()
    .withMessage('Email invalide')
    .normalizeEmail(),
  body('phone')
    .isString()
    .notEmpty()
    .withMessage('Le téléphone est requis')
    .matches(/^[+\d\s\-()]{8,}$/)
    .withMessage('Format de téléphone invalide'),
  body('message')
    .isString()
    .notEmpty()
    .withMessage('Le message est requis')
    .isLength({ min: 10, max: 1000 })
    .withMessage('Le message doit contenir entre 10 et 1000 caractères')
    .trim()
    .escape(),
  body('website')
    .optional({ checkFalsy: true })
    .isURL()
    .withMessage('Le site web doit être une URL valide'),
];
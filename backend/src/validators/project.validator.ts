import { body } from 'express-validator';
import { ProjectStatus } from '../types/roles.enum';

// Helper : accepter une chaîne vide ou une valeur quelconque (pas d'URL obligatoire)
const optionalString = (fieldName: string) =>
  body(fieldName)
    .optional()
    .isString()
    .withMessage(`${fieldName} must be a string`)
    .trim();

// Helper pour URL optionnelle acceptant chaîne vide ou URL valide
const optionalUrl = (fieldName: string) =>
  body(fieldName)
    .optional()
    .custom((value) => {
      if (value === '' || value === null || value === undefined) return true;
      // On vérifie si c'est une URL valide, sinon on autorise quand même (on laisse passer)
      // Pour être strict, on pourrait exiger une URL, mais on préfère laisser passer pour flexibilité
      return true;
    })
    .isString()
    .withMessage(`${fieldName} must be a string or empty`)
    .trim();

export const createProjectValidator = [
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

  body('objectives')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('Objectives must not exceed 1000 characters')
    .trim(),

  body('impact')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('Impact must not exceed 1000 characters')
    .trim(),

  body('technologies')
    .isArray({ min: 1 })
    .withMessage('At least one technology is required'),
  body('technologies.*')
    .isString()
    .withMessage('Each technology must be a string')
    .trim()
    .escape(),

  // ✅ images : on accepte n'importe quelle chaîne (nom de fichier ou URL)
  body('images')
    .optional()
    .isArray()
    .withMessage('Images must be an array'),
  body('images.*')
    .optional()
    .isString()
    .withMessage('Each image must be a string')
    .trim(),

  body('year')
    .isInt({ min: 2000, max: new Date().getFullYear() + 1 })
    .withMessage(`Year must be between 2000 and ${new Date().getFullYear() + 1}`)
    .toInt(),

  body('category')
    .notEmpty()
    .withMessage('Category is required')
    .isString()
    .withMessage('Category must be a string')
    .trim()
    .escape(),

  body('isFeatured')
    .optional()
    .isBoolean()
    .withMessage('isFeatured must be a boolean')
    .toBoolean(),

  body('status')
    .optional()
    .isIn(Object.values(ProjectStatus))
    .withMessage(`Status must be one of: ${Object.values(ProjectStatus).join(', ')}`),

  body('client')
    .optional()
    .isString()
    .withMessage('Client must be a string')
    .trim()
    .escape(),

  // ✅ projectUrl : on accepte chaîne vide ou n'importe quelle chaîne
  body('projectUrl')
    .optional()
    .isString()
    .withMessage('Project URL must be a string')
    .trim(),

  // ✅ githubUrl : idem
  body('githubUrl')
    .optional()
    .isString()
    .withMessage('GitHub URL must be a string')
    .trim(),
];

export const updateProjectValidator = [
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

  body('objectives')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('Objectives must not exceed 1000 characters')
    .trim(),

  body('impact')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('Impact must not exceed 1000 characters')
    .trim(),

  body('technologies')
    .optional()
    .isArray()
    .withMessage('Technologies must be an array'),
  body('technologies.*')
    .optional()
    .isString()
    .withMessage('Each technology must be a string')
    .trim()
    .escape(),

  body('images')
    .optional()
    .isArray()
    .withMessage('Images must be an array'),
  body('images.*')
    .optional()
    .isString()
    .withMessage('Each image must be a string')
    .trim(),

  body('year')
    .optional()
    .isInt({ min: 2000, max: new Date().getFullYear() + 1 })
    .withMessage(`Year must be between 2000 and ${new Date().getFullYear() + 1}`)
    .toInt(),

  body('category')
    .optional()
    .isString()
    .withMessage('Category must be a string')
    .trim()
    .escape(),

  body('isFeatured')
    .optional()
    .isBoolean()
    .withMessage('isFeatured must be a boolean')
    .toBoolean(),

  body('status')
    .optional()
    .isIn(Object.values(ProjectStatus))
    .withMessage(`Status must be one of: ${Object.values(ProjectStatus).join(', ')}`),

  body('client')
    .optional()
    .isString()
    .withMessage('Client must be a string')
    .trim()
    .escape(),

  body('projectUrl')
    .optional()
    .isString()
    .withMessage('Project URL must be a string')
    .trim(),

  body('githubUrl')
    .optional()
    .isString()
    .withMessage('GitHub URL must be a string')
    .trim(),
];

export const createMetricValidator = [
  body('metricKey')
    .notEmpty()
    .withMessage('Metric key is required')
    .isString()
    .withMessage('Metric key must be a string')
    .trim()
    .escape(),
  body('metricValue')
    .notEmpty()
    .withMessage('Metric value is required')
    .isString()
    .withMessage('Metric value must be a string')
    .trim()
    .escape(),
  body('description')
    .optional()
    .isString()
    .withMessage('Description must be a string')
    .trim()
    .escape(),
];

export const updateMetricValidator = [
  body('metricValue')
    .optional()
    .isString()
    .withMessage('Metric value must be a string')
    .trim()
    .escape(),
  body('description')
    .optional()
    .isString()
    .withMessage('Description must be a string')
    .trim()
    .escape(),
];
import { body, param } from 'express-validator';

// ✅ Validation d'ID CUID – retourne un tableau de ValidationChain
const cuidValidator = (field: string) => [
  param(field)
    .isString()
    .notEmpty()
    .withMessage('ID invalide')
    .matches(/^c[a-z0-9]{24}$/)
    .withMessage("L'ID doit être un CUID valide (ex: cmt4ip1u600009m28vtmrwvbs)"),
];

// ✅ Validation d'ID de recrutement (CUID également)
const recruitmentIdValidator = (field: string) => [
  body(field)
    .isString()
    .notEmpty()
    .withMessage('ID de recrutement invalide')
    .matches(/^c[a-z0-9]{24}$/)
    .withMessage("L'ID de recrutement doit être un CUID valide"),
];

// ─── CANDIDATURES ──────────────────────────────────────────

export const createCandidatureValidator = [
  ...recruitmentIdValidator('recruitmentId'),
  body('fullName').notEmpty().withMessage('Le nom complet est requis'),
  body('email').isEmail().withMessage('Email invalide'),
  body('phone').optional().isString(),
  body('coverLetter').optional().isString(),
  body('cvUrl').optional().isURL().withMessage('URL du CV invalide'),
  body('status')
    .optional()
    .isIn(['PENDING', 'REVIEWED', 'SHORTLISTED', 'INTERVIEWED', 'ACCEPTED', 'REJECTED']),
];

export const updateCandidatureValidator = [
  ...cuidValidator('id'),
  body('fullName').optional().notEmpty(),
  body('email').optional().isEmail(),
  body('phone').optional().isString(),
  body('coverLetter').optional().isString(),
  body('cvUrl').optional().isURL(),
  body('status')
    .optional()
    .isIn(['PENDING', 'REVIEWED', 'SHORTLISTED', 'INTERVIEWED', 'ACCEPTED', 'REJECTED']),
];

// ─── INTERVIEWS ──────────────────────────────────────────

export const createInterviewValidator = [
  ...cuidValidator('id'), // ✅ ID de candidature
  body('scheduledAt')
    .isISO8601()
    .withMessage('Date et heure de l\'entretien requises'),
  body('interviewer')
    .notEmpty()
    .withMessage('Le nom de l\'intervieweur est requis'),
  body('notes').optional().isString(),
  body('status')
    .optional()
    .isIn(['SCHEDULED', 'COMPLETED', 'CANCELLED', 'RESCHEDULED']),
];

export const updateInterviewValidator = [
  param('interviewId')
    .isString()
    .notEmpty()
    .withMessage('ID d\'entretien invalide')
    .matches(/^c[a-z0-9]{24}$/)
    .withMessage("L'ID d'entretien doit être un CUID valide"),
  body('scheduledAt').optional().isISO8601(),
  body('interviewer').optional().notEmpty(),
  body('notes').optional().isString(),
  body('status')
    .optional()
    .isIn(['SCHEDULED', 'COMPLETED', 'CANCELLED', 'RESCHEDULED']),
];

// ─── EVALUATIONS ──────────────────────────────────────────

export const createEvaluationValidator = [
  ...cuidValidator('id'), // ✅ ID de candidature
  body('criteria')
    .notEmpty()
    .withMessage('Le critère d\'évaluation est requis'),
  body('score')
    .isInt({ min: 1, max: 10 })
    .withMessage('Le score doit être un entier entre 1 et 10'),
  body('comments').optional().isString(),
];

export const updateEvaluationValidator = [
  param('evaluationId')
    .isString()
    .notEmpty()
    .withMessage('ID d\'évaluation invalide')
    .matches(/^c[a-z0-9]{24}$/)
    .withMessage("L'ID d'évaluation doit être un CUID valide"),
  body('criteria').optional().notEmpty(),
  body('score').optional().isInt({ min: 1, max: 10 }),
  body('comments').optional().isString(),
];
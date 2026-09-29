export const VALIDATION = {
  // Password
  PASSWORD_MIN_LENGTH: 8,
  PASSWORD_MAX_LENGTH: 72,
  PASSWORD_PATTERN: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,

  // Email
  EMAIL_PATTERN: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,

  // Phone
  PHONE_PATTERN: /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/,

  // URL
  URL_PATTERN: /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/,

  // Slug
  SLUG_PATTERN: /^[a-z0-9]+(?:-[a-z0-9]+)*$/,

  // UUID
  UUID_PATTERN: /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/,

  // Text lengths
  NAME_MIN_LENGTH: 2,
  NAME_MAX_LENGTH: 100,
  BIO_MAX_LENGTH: 500,
  TITLE_MIN_LENGTH: 3,
  TITLE_MAX_LENGTH: 200,
  DESCRIPTION_MIN_LENGTH: 10,
  DESCRIPTION_MAX_LENGTH: 1000,
  CONTENT_MIN_LENGTH: 10,
  CONTENT_MAX_LENGTH: 10000,
  EXCERPT_MAX_LENGTH: 500,
  TAG_MAX_LENGTH: 30,
  MESSAGE_MIN_LENGTH: 3,
  MESSAGE_MAX_LENGTH: 5000,

  // Numbers
  MAX_PARTICIPANTS_MIN: 1,
  MAX_PARTICIPANTS_MAX: 1000,
  PRICE_MIN: 0,
  PRICE_MAX: 10000000,
  YEAR_MIN: 2000,
  YEAR_MAX: new Date().getFullYear() + 1,

  // Arrays
  MAX_TAGS: 10,
  MAX_IMAGES: 20,
  MAX_TECHNOLOGIES: 20,

  // Files
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml'],
  ALLOWED_DOCUMENT_TYPES: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
} as const;

export const VALIDATION_MESSAGES = {
  // Required
  REQUIRED: 'Ce champ est obligatoire',

  // Email
  EMAIL_INVALID: 'Veuillez entrer une adresse email valide',

  // Password
  PASSWORD_MIN: `Le mot de passe doit contenir au moins ${VALIDATION.PASSWORD_MIN_LENGTH} caractères`,
  PASSWORD_PATTERN:
    'Le mot de passe doit contenir une majuscule, une minuscule, un chiffre et un caractère spécial',

  // Phone
  PHONE_INVALID: 'Veuillez entrer un numéro de téléphone valide',

  // URL
  URL_INVALID: 'Veuillez entrer une URL valide',

  // Slug
  SLUG_INVALID: 'Le slug doit contenir uniquement des lettres minuscules, des chiffres et des tirets',

  // UUID
  UUID_INVALID: 'ID invalide',

  // Text
  MIN_LENGTH: (field: string, min: number) => `${field} doit contenir au moins ${min} caractères`,
  MAX_LENGTH: (field: string, max: number) => `${field} ne doit pas dépasser ${max} caractères`,

  // Numbers
  MIN: (field: string, min: number) => `${field} doit être supérieur ou égal à ${min}`,
  MAX: (field: string, max: number) => `${field} doit être inférieur ou égal à ${max}`,

  // Arrays
  MAX_ITEMS: (field: string, max: number) => `${field} ne doit pas contenir plus de ${max} éléments`,

  // Files
  FILE_TOO_LARGE: `Le fichier ne doit pas dépasser ${VALIDATION.MAX_FILE_SIZE / 1024 / 1024}MB`,
  FILE_TYPE_NOT_ALLOWED: 'Type de fichier non autorisé',
} as const;
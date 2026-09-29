export const REGEX_PATTERNS = {
  // Email patterns
  EMAIL: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
  
  // Phone patterns
  PHONE_INTERNATIONAL: /^\+(?:[0-9] ?){6,14}[0-9]$/,
  PHONE_FR: /^(\+33|0)[1-9](\d{2}){4}$/,
  PHONE_MG: /^(\+261|0)[3-9]\d{8}$/,
  
  // URL patterns
  URL_HTTP: /^https?:\/\/[^\s]+$/,
  URL_GENERIC: /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/,
  
  // Slug patterns
  SLUG: /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
  
  // Password patterns
  PASSWORD_STRONG: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
  PASSWORD_MEDIUM: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d]{8,}$/,
  PASSWORD_WEAK: /^.{8,}$/,
  
  // UUID patterns
  UUID_V4: /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/,
  UUID_V1: /^[0-9a-f]{8}-[0-9a-f]{4}-1[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/,
  
  // Date patterns
  DATE_ISO: /^\d{4}-\d{2}-\d{2}$/,
  DATE_FR: /^\d{2}\/\d{2}\/\d{4}$/,
  DATE_US: /^\d{2}\/\d{2}\/\d{4}$/,
  DATETIME_ISO: /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?Z?$/,
  
  // Time patterns
  TIME_24H: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9](:[0-5][0-9])?$/,
  TIME_12H: /^(0?[1-9]|1[0-2]):[0-5][0-9] (AM|PM)$/,
  
  // Number patterns
  INTEGER: /^-?\d+$/,
  DECIMAL: /^-?\d+(\.\d+)?$/,
  POSITIVE_INTEGER: /^\d+$/,
  POSITIVE_DECIMAL: /^\d+(\.\d+)?$/,
  NEGATIVE_INTEGER: /^-\d+$/,
  NEGATIVE_DECIMAL: /^-\d+(\.\d+)?$/,
  
  // Color patterns
  HEX_COLOR: /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/,
  RGB_COLOR: /^rgb\((\d{1,3}),\s*(\d{1,3}),\s*(\d{1,3})\)$/,
  RGBA_COLOR: /^rgba\((\d{1,3}),\s*(\d{1,3}),\s*(\d{1,3}),\s*(\d*\.?\d+)\)$/,
  
  // IP patterns
  IP_V4: /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/,
  IP_V6: /^(([0-9a-fA-F]{1,4}:){7,7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:)|fe80:(:[0-9a-fA-F]{0,4}){0,4}%[0-9a-zA-Z]{1,}|::(ffff(:0{1,4}){0,1}:){0,1}((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])|([0-9a-fA-F]{1,4}:){1,4}:((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9]))$/,
  
  // HTML patterns
  HTML_TAG: /<[^>]*>/g,
  HTML_COMMENT: /<!--[\s\S]*?-->/g,
  
  // Whitespace patterns
  WHITESPACE: /\s+/g,
  LEADING_WHITESPACE: /^\s+/,
  TRAILING_WHITESPACE: /\s+$/,
  
  // Special characters
  SPECIAL_CHARS: /[!@#$%^&*(),.?":{}|<>]/g,
  ACCENTS: /[\u0300-\u036f]/g,
  
  // Unicode patterns
  UNICODE_LETTER: /[\p{L}]/u,
  UNICODE_NUMBER: /[\p{N}]/u,
  UNICODE_PUNCTUATION: /[\p{P}]/u,
  UNICODE_SYMBOL: /[\p{S}]/u,
} as const;
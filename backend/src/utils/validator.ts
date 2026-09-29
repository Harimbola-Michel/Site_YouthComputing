import { Request, Response, NextFunction } from 'express';
import { validationResult, ValidationChain, ValidationError } from 'express-validator';
import { ApiError } from './ApiError';

export const validate = (validations: ValidationChain[]) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    await Promise.all(validations.map(validation => validation.run(req)));

    const errors = validationResult(req);
    if (errors.isEmpty()) {
      return next();
    }

    const extractedErrors: Array<{ field: string; message: string; value?: any }> = [];
    errors.array().forEach((err: ValidationError) => {
      if (err.type === 'field') {
        extractedErrors.push({
          field: err.path,
          message: err.msg,
          value: err.value,
        });
      }
    });

    throw ApiError.validation('Validation failed', { errors: extractedErrors });
  };
};

export const validateId = (field: string = 'id') => {
  return {
    in: ['params'],
    isUUID: {
      errorMessage: `Invalid ${field} format`,
    },
  };
};

export const validateEmail = () => {
  return {
    isEmail: {
      errorMessage: 'Invalid email address',
    },
    normalizeEmail: true,
  };
};

export const validatePhone = () => {
  return {
    isMobilePhone: {
      options: 'any',
      errorMessage: 'Invalid phone number',
    },
  };
};

export const validateUrl = () => {
  return {
    isURL: {
      errorMessage: 'Invalid URL',
    },
  };
};

export const validateEnum = (enumValues: string[]) => {
  return {
    isIn: {
      options: [enumValues],
      errorMessage: `Must be one of: ${enumValues.join(', ')}`,
    },
  };
};

export const validateDate = () => {
  return {
    isISO8601: {
      errorMessage: 'Invalid date format. Use ISO 8601',
    },
    toDate: true,
  };
};

export const validateNumber = (min?: number, max?: number) => {
  const validations: any = {
    isNumeric: {
      errorMessage: 'Must be a number',
    },
    toFloat: true,
  };

  if (min !== undefined) {
    validations.isFloat = {
      options: { min },
      errorMessage: `Must be at least ${min}`,
    };
  }

  if (max !== undefined) {
    validations.isFloat = {
      options: { max },
      errorMessage: `Must be at most ${max}`,
    };
  }

  return validations;
};

export const validateString = (min?: number, max?: number) => {
  const validations: any = {
    isString: {
      errorMessage: 'Must be a string',
    },
    trim: true,
    escape: true,
  };

  if (min !== undefined) {
    validations.isLength = {
      options: { min },
      errorMessage: `Must be at least ${min} characters`,
    };
  }

  if (max !== undefined) {
    validations.isLength = {
      options: { max },
      errorMessage: `Must be at most ${max} characters`,
    };
  }

  return validations;
};

export const validateBoolean = () => {
  return {
    isBoolean: {
      errorMessage: 'Must be a boolean',
    },
    toBoolean: true,
  };
};

export const validateArray = (minItems?: number, maxItems?: number) => {
  const validations: any = {
    isArray: {
      errorMessage: 'Must be an array',
    },
  };

  if (minItems !== undefined) {
    validations.isArray = {
      options: { min: minItems },
      errorMessage: `Must have at least ${minItems} items`,
    };
  }

  if (maxItems !== undefined) {
    validations.isArray = {
      options: { max: maxItems },
      errorMessage: `Must have at most ${maxItems} items`,
    };
  }

  return validations;
};

export const validateObject = () => {
  return {
    isObject: {
      errorMessage: 'Must be an object',
    },
  };
};

export const validatePassword = () => {
  return {
    isLength: {
      options: { min: 8 },
      errorMessage: 'Password must be at least 8 characters',
    },
    matches: {
      options: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
      errorMessage: 'Password must contain uppercase, lowercase, number and special character',
    },
  };
};
import { Request, Response, NextFunction } from 'express';
import { validationResult, ValidationChain, ValidationError } from 'express-validator';
import { ApiError } from '../utils/ApiError';
import { logger } from '../config/logger';

export const validate = (validations: ValidationChain[]) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      await Promise.all(validations.map(validation => validation.run(req)));

      const errors = validationResult(req);
      if (errors.isEmpty()) {
        return next();
      }

      const errorMessages = errors.array().map((err: ValidationError) => {
        if (err.type === 'field') {
          return {
            field: err.path,
            message: err.msg,
            value: err.value,
          };
        }
        return {
          message: err.msg,
        };
      });

      logger.warn(`Validation failed: ${JSON.stringify(errorMessages)}`);
      throw ApiError.validation('Validation error', { errors: errorMessages });
    } catch (error) {
      next(error);
    }
  };
};
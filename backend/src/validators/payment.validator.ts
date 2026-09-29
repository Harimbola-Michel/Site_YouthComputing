import { body } from 'express-validator';
import { PaymentStatus, PaymentMethod } from '../types/roles.enum';

export const createPaymentValidator = [
  body('registrationId')
    .optional()
    .isUUID()
    .withMessage('Registration ID must be a valid UUID'),
  body('y2cMemberId')
    .optional()
    .isUUID()
    .withMessage('Y2C member ID must be a valid UUID'),
  body('amount')
    .isNumeric()
    .withMessage('Amount must be a number')
    .isFloat({ min: 0 })
    .withMessage('Amount must be positive')
    .toFloat(),
  body('currency')
    .optional()
    .isString()
    .withMessage('Currency must be a string')
    .isIn(['MGA', 'EUR', 'USD'])
    .withMessage('Currency must be one of: MGA, EUR, USD')
    .toUpperCase(),
  body('paymentMethod')
    .isIn(Object.values(PaymentMethod))
    .withMessage(`Payment method must be one of: ${Object.values(PaymentMethod).join(', ')}`),
  body('paymentReference')
    .optional()
    .isString()
    .withMessage('Payment reference must be a string')
    .trim()
    .escape(),
  body('metadata')
    .optional()
    .isObject()
    .withMessage('Metadata must be an object'),
];

export const updatePaymentValidator = [
  body('status')
    .optional()
    .isIn(Object.values(PaymentStatus))
    .withMessage(`Status must be one of: ${Object.values(PaymentStatus).join(', ')}`),
  body('paymentReference')
    .optional()
    .isString()
    .withMessage('Payment reference must be a string')
    .trim()
    .escape(),
  body('metadata')
    .optional()
    .isObject()
    .withMessage('Metadata must be an object'),
  body('paidAt')
    .optional()
    .isISO8601()
    .withMessage('Paid at must be a valid date')
    .toDate(),
];
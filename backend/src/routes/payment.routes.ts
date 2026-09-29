import { Router } from 'express';
import { PaymentController } from '../controllers/payment.controller';
import { authMiddleware } from '../middlewares/auth.middleware';
import { isAdmin } from '../middlewares/role.middleware';
import { validate } from '../middlewares/validate.middleware';
import { createPaymentValidator, updatePaymentValidator } from '../validators/payment.validator';

const router = Router();
const paymentController = new PaymentController();

// User routes
router.get(
  '/my-payments',
  authMiddleware,
  paymentController.getMyPayments
);

// Admin routes
router.get(
  '/',
  authMiddleware,
  isAdmin,
  paymentController.getAll
);

router.get(
  '/stats',
  authMiddleware,
  isAdmin,
  paymentController.getStats
);

router.get(
  '/:id',
  authMiddleware,
  isAdmin,
  paymentController.getById
);

router.post(
  '/',
  authMiddleware,
  isAdmin,
  validate(createPaymentValidator),
  paymentController.create
);

router.put(
  '/:id',
  authMiddleware,
  isAdmin,
  validate(updatePaymentValidator),
  paymentController.update
);

router.delete(
  '/:id',
  authMiddleware,
  isAdmin,
  paymentController.delete
);

router.patch(
  '/:id/confirm',
  authMiddleware,
  isAdmin,
  paymentController.confirmPayment
);

router.patch(
  '/:id/fail',
  authMiddleware,
  isAdmin,
  paymentController.failPayment
);

router.patch(
  '/:id/refund',
  authMiddleware,
  isAdmin,
  paymentController.refundPayment
);

router.post('/:id/send-receipt', paymentController.sendReceipt);

export default router;
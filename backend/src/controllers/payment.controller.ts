import { Request, Response, NextFunction } from 'express';
import { BaseController } from './base.controller';
import { PaymentService } from '../services/payment.service';
import { AuthRequest } from '../middlewares/auth.middleware';

export class PaymentController extends BaseController {
  private paymentService: PaymentService;

  constructor() {
    super();
    this.paymentService = new PaymentService();
  }

  getAll = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const pagination = this.getPaginationParams(req);
      const payments = await this.paymentService.findAll(pagination);
      this.sendSuccess(res, payments);
    } catch (error) {
      this.handleError(next, error);
    }
  };

  getById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const payment = await this.paymentService.findById(id);
      this.sendSuccess(res, payment);
    } catch (error) {
      this.handleError(next, error);
    }
  };

  create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const payment = await this.paymentService.create(req.body);
      this.sendCreated(res, payment);
    } catch (error) {
      this.handleError(next, error);
    }
  };

  update = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const payment = await this.paymentService.update(id, req.body);
      this.sendUpdated(res, payment);
    } catch (error) {
      this.handleError(next, error);
    }
  };

  delete = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      await this.paymentService.delete(id);
      this.sendDeleted(res, null);
    } catch (error) {
      this.handleError(next, error);
    }
  };

  confirmPayment = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const payment = await this.paymentService.confirmPayment(id);
      this.sendUpdated(res, payment);
    } catch (error) {
      this.handleError(next, error);
    }
  };

  failPayment = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const { reason } = req.body;
      const payment = await this.paymentService.failPayment(id, reason);
      this.sendUpdated(res, payment);
    } catch (error) {
      this.handleError(next, error);
    }
  };

  refundPayment = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const payment = await this.paymentService.refundPayment(id);
      this.sendUpdated(res, payment);
    } catch (error) {
      this.handleError(next, error);
    }
  };

  getStats = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const stats = await this.paymentService.getStats();
      this.sendSuccess(res, stats);
    } catch (error) {
      this.handleError(next, error);
    }
  };

  // ✅ Correction : utilisation de req.user.id au lieu de this.getUserId
  getMyPayments = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        throw new Error('User not authenticated');
      }
      const payments = await this.paymentService.getPaymentsByUser(userId);
      this.sendSuccess(res, payments);
    } catch (error) {
      this.handleError(next, error);
    }
  };

    sendReceipt = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const result = await this.paymentService.sendReceipt(id);
      this.sendSuccess(res, result, 'Reçu envoyé par email');
    } catch (error) {
      this.handleError(next, error);
    }
  };
}

// backend/src/controllers/registration.controller.ts

import { Request, Response, NextFunction } from 'express';
import { BaseController } from './base.controller';
import { RegistrationService } from '../services/registration.service';
import { AuthRequest } from '../middlewares/auth.middleware';

export class RegistrationController extends BaseController {
  private registrationService: RegistrationService;

  constructor() {
    super();
    this.registrationService = new RegistrationService();
  }

  getAll = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const pagination = this.getPaginationParams(req);
      const registrations = await this.registrationService.findAll(pagination);
      this.sendSuccess(res, registrations);
    } catch (error) {
      this.handleError(next, error);
    }
  };

  getById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const registration = await this.registrationService.findById(id);
      this.sendSuccess(res, registration);
    } catch (error) {
      this.handleError(next, error);
    }
  };

  create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const registration = await this.registrationService.create(req.body);
      this.sendCreated(res, registration);
    } catch (error) {
      this.handleError(next, error);
    }
  };

  update = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const registration = await this.registrationService.update(id, req.body);
      this.sendUpdated(res, registration);
    } catch (error) {
      this.handleError(next, error);
    }
  };

  delete = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      await this.registrationService.delete(id);
      this.sendDeleted(res, null);
    } catch (error) {
      this.handleError(next, error);
    }
  };

  getByEmail = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { email } = req.params;
      const registrations = await this.registrationService.getByEmail(email);
      this.sendSuccess(res, registrations);
    } catch (error) {
      this.handleError(next, error);
    }
  };

  getByFormation = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { formationId } = req.params;
      const registrations = await this.registrationService.getByFormation(formationId);
      this.sendSuccess(res, registrations);
    } catch (error) {
      this.handleError(next, error);
    }
  };

  getBySession = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { sessionId } = req.params;
      const registrations = await this.registrationService.getBySession(sessionId);
      this.sendSuccess(res, registrations);
    } catch (error) {
      this.handleError(next, error);
    }
  };

  getByStatus = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { status } = req.params;
      const registrations = await this.registrationService.getByStatus(status as any);
      this.sendSuccess(res, registrations);
    } catch (error) {
      this.handleError(next, error);
    }
  };

  getStats = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const stats = await this.registrationService.getStats();
      this.sendSuccess(res, stats);
    } catch (error) {
      this.handleError(next, error);
    }
  };

  getRevenueStats = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const stats = await this.registrationService.getRevenueStats();
      this.sendSuccess(res, stats);
    } catch (error) {
      this.handleError(next, error);
    }
  };

  confirmRegistration = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const registration = await this.registrationService.confirmRegistration(id);
      this.sendUpdated(res, registration);
    } catch (error) {
      this.handleError(next, error);
    }
  };

  cancelRegistration = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const registration = await this.registrationService.cancelRegistration(id);
      this.sendUpdated(res, registration);
    } catch (error) {
      this.handleError(next, error);
    }
  };

  completeRegistration = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const registration = await this.registrationService.completeRegistration(id);
      this.sendUpdated(res, registration);
    } catch (error) {
      this.handleError(next, error);
    }
  };

  addToWaitingList = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const registration = await this.registrationService.addToWaitingList(id);
      this.sendUpdated(res, registration);
    } catch (error) {
      this.handleError(next, error);
    }
  };
}
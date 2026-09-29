// src/controllers/contact.controller.ts

import { Request, Response, NextFunction } from 'express';
import { BaseController } from './base.controller';
import { ContactService } from '../services/contact.service';
import { AuthRequest } from '../middlewares/auth.middleware';

export class ContactController extends BaseController {
  private contactService: ContactService;

  constructor() {
    super();
    this.contactService = new ContactService();
  }

  sendMessage = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const message = await this.contactService.sendMessage(req.body);
      this.sendCreated(res, message, 'Message sent successfully');
    } catch (error) {
      this.handleError(next, error);
    }
  };

  getMessages = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const pagination = this.getPaginationParams(req);
      const messages = await this.contactService.getMessages(pagination);
      this.sendSuccess(res, messages);
    } catch (error) {
      this.handleError(next, error);
    }
  };

  getMessage = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const message = await this.contactService.getMessage(id);
      this.sendSuccess(res, message);
    } catch (error) {
      this.handleError(next, error);
    }
  };

  replyToMessage = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const userId = req.user?.id;
      if (!userId) {
        throw new Error('User not authenticated');
      }
      const result = await this.contactService.replyToMessage(id, {
        content: req.body.content, // ✅ attend 'content'
        repliedBy: userId,
      });
      this.sendSuccess(res, result, 'Reply sent successfully');
    } catch (error) {
      this.handleError(next, error);
    }
  };

  deleteMessage = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      await this.contactService.deleteMessage(id);
      this.sendDeleted(res, null);
    } catch (error) {
      this.handleError(next, error);
    }
  };

  markAsRead = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const message = await this.contactService.markAsRead(id);
      this.sendUpdated(res, message);
    } catch (error) {
      this.handleError(next, error);
    }
  };

  getStats = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const stats = await this.contactService.getStats();
      this.sendSuccess(res, stats);
    } catch (error) {
      this.handleError(next, error);
    }
  };
}
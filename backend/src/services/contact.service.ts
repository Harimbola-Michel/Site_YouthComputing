// src/services/contact.service.ts

import { BaseService } from './base.service';
import { ContactMessageRepository } from '../repositories/contactMessage.repository';
import { CreateContactMessageDTO, ReplyContactMessageDTO } from '../types/dto/contact.dto';
import { ApiError } from '../utils/ApiError';
import { ContactMessage } from '@prisma/client';
import { mailer } from '../config/mailer';
import { logger } from '../config/logger';
import { env } from '../config/env';

export class ContactService extends BaseService<ContactMessage, CreateContactMessageDTO, any> {
  private contactRepository: ContactMessageRepository;

  constructor() {
    super(new ContactMessageRepository());
    this.contactRepository = new ContactMessageRepository();
  }

  async sendMessage(data: CreateContactMessageDTO): Promise<ContactMessage> {
    const message = await this.contactRepository.create(data);

    // Notification admin
    try {
      await mailer.sendTemplatedEmail(
        env.ADMIN_EMAIL || 'admin@youthcomputing.mg',
        'new-contact-message',
        {
          content: `
            <h2>Nouveau message de contact</h2>
            <p><strong>Nom:</strong> ${message.name}</p>
            <p><strong>Email:</strong> ${message.email}</p>
            <p><strong>Sujet:</strong> ${message.subject}</p>
            <p><strong>Message:</strong></p>
            <p>${message.message}</p>
            <p><a href="${env.FRONTEND_URL}/admin/contact/${message.id}">Voir le message</a></p>
          `,
        }
      );
    } catch (error) {
      logger.error('Failed to send contact notification email:', error);
    }

    // Réponse automatique
    try {
      await mailer.sendTemplatedEmail(message.email, 'contact-auto-reply', {
        name: message.name,
        content: `
          <h2>Merci pour votre message</h2>
          <p>Nous avons bien reçu votre message et nous vous répondrons dans les plus brefs délais.</p>
          <p><strong>Votre message:</strong></p>
          <p>${message.message}</p>
          <p>L'équipe Youth Computing</p>
        `,
      });
    } catch (error) {
      logger.error('Failed to send auto-reply email:', error);
    }

    return message;
  }

  async getMessages(params: any): Promise<any> {
    return this.contactRepository.findPaginated(params);
  }

  async getMessage(id: string): Promise<ContactMessage> {
    return this.contactRepository.findByIdOrThrow(id);
  }

  // ✅ Correction : utilise 'content' du DTO et le stocke dans 'replyContent'
  async replyToMessage(id: string, data: ReplyContactMessageDTO): Promise<ContactMessage> {
    const message = await this.contactRepository.findByIdOrThrow(id);

    const updated = await this.contactRepository.update(id, {
      replyContent: data.content, // ✅ stocke 'content' dans replyContent
      repliedBy: data.repliedBy,
      repliedAt: new Date(),
    });

    // Envoi de la réponse par email
    try {
      await mailer.sendTemplatedEmail(message.email, 'contact-reply', {
        name: message.name,
        content: `
          <h2>Réponse à votre message</h2>
          <p><strong>Votre message:</strong></p>
          <p>${message.message}</p>
          <p><strong>Notre réponse:</strong></p>
          <p>${data.content}</p>
          <p>L'équipe Youth Computing</p>
        `,
      });
    } catch (error) {
      logger.error('Failed to send reply email:', error);
    }

    return updated;
  }

  async deleteMessage(id: string): Promise<void> {
    await this.contactRepository.delete(id);
  }

  async markAsRead(id: string): Promise<ContactMessage> {
    return this.contactRepository.update(id, { isRead: true });
  }

  async getStats(): Promise<any> {
    const total = await this.contactRepository.count();
    const unread = await this.contactRepository.count({ isRead: false });
    const read = await this.contactRepository.count({ isRead: true });
    const replied = await this.contactRepository.count({
      repliedAt: { not: null },
    });

    const now = new Date();
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - now.getDay());
    weekStart.setHours(0, 0, 0, 0);

    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    const thisWeek = await this.contactRepository.count({
      createdAt: { gte: weekStart },
    });
    const thisMonth = await this.contactRepository.count({
      createdAt: { gte: monthStart },
    });

    return { total, unread, read, replied, thisWeek, thisMonth };
  }

  toDTO(message: ContactMessage): any {
    return {
      id: message.id,
      name: message.name,
      email: message.email,
      subject: message.subject,
      message: message.message,
      isRead: message.isRead,
      repliedAt: message.repliedAt,
      repliedBy: message.repliedBy,
      replyContent: message.replyContent,
      createdAt: message.createdAt,
      updatedAt: message.updatedAt,
    };
  }
}
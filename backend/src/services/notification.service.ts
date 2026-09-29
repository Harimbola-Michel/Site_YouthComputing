// backend/src/services/notification.service.ts
// (déjà fourni précédemment, je le récapitule pour cohérence)

import { NotificationRepository } from '../repositories/notification.repository';
import { Notification } from '@prisma/client';
import { CreateNotificationDTO } from '../types/dto/notification.dto';
import { ApiError } from '../utils/ApiError';
import { notificationWebSocket } from '../sockets/notification.socket';

export class NotificationService {
  private notificationRepository: NotificationRepository;

  constructor() {
    this.notificationRepository = new NotificationRepository();
  }

  async getByUser(userId: string, pagination?: { page: number; limit: number }) {
    const { page = 1, limit = 20 } = pagination || {};
    const skip = (page - 1) * limit;

    const [data, total, unreadCount] = await Promise.all([
      this.notificationRepository.findByUserId(userId, { take: limit, skip }),
      this.notificationRepository.count({ userId }),
      this.notificationRepository.countUnread(userId),
    ]);

    return {
      data,
      total,
      unreadCount,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async markAsRead(id: string, userId: string): Promise<Notification> {
    const notification = await this.notificationRepository.findById(id);
    if (!notification) {
      throw ApiError.notFound('Notification introuvable');
    }
    if (notification.userId !== userId) {
      throw ApiError.forbidden('Vous n\'êtes pas autorisé à modifier cette notification');
    }
    const updated = await this.notificationRepository.markAsRead(id);
    const unreadCount = await this.notificationRepository.countUnread(userId);
    notificationWebSocket.sendUnreadCountUpdate(userId, unreadCount);
    return updated;
  }

  async markAllAsRead(userId: string): Promise<{ count: number }> {
    const result = await this.notificationRepository.markAllAsRead(userId);
    notificationWebSocket.sendUnreadCountUpdate(userId, 0);
    return result;
  }

  async getUnreadCount(userId: string): Promise<{ count: number }> {
    const count = await this.notificationRepository.countUnread(userId);
    return { count };
  }

  async create(data: CreateNotificationDTO): Promise<Notification> {
    const notification = await this.notificationRepository.create(data);
    notificationWebSocket.sendNotification(notification.userId, notification);
    const unreadCount = await this.notificationRepository.countUnread(notification.userId);
    notificationWebSocket.sendUnreadCountUpdate(notification.userId, unreadCount);
    return notification;
  }

  async delete(id: string, userId: string): Promise<void> {
    const notification = await this.notificationRepository.findById(id);
    if (!notification) {
      throw ApiError.notFound('Notification introuvable');
    }
    if (notification.userId !== userId) {
      throw ApiError.forbidden('Vous n\'êtes pas autorisé à supprimer cette notification');
    }
    await this.notificationRepository.deleteNotification(id);
  }

  async getAllWithFilters(filters: {
    userId?: string;
    type?: any;
    isRead?: boolean;
    startDate?: Date;
    endDate?: Date;
    page?: number;
    limit?: number;
  }) {
    const page = filters.page || 1;
    const limit = Math.min(filters.limit || 20, 100);
    const skip = (page - 1) * limit;

    const { data, total } = await this.notificationRepository.findAllWithFilters({
      userId: filters.userId,
      type: filters.type,
      isRead: filters.isRead,
      startDate: filters.startDate,
      endDate: filters.endDate,
      skip,
      take: limit,
    });

    const totalPages = Math.ceil(total / limit);
    return { data, total, page, limit, totalPages, hasNext: page < totalPages, hasPrev: page > 1 };
  }

  async adminDelete(id: string): Promise<void> {
    const notification = await this.notificationRepository.findById(id);
    if (!notification) {
      throw ApiError.notFound('Notification introuvable');
    }
    await this.notificationRepository.deleteNotification(id);
  }
}
// backend/src/types/dto/notification.dto.ts

import { z } from 'zod';
import { NotificationType } from '@prisma/client';

export const CreateNotificationSchema = z.object({
  userId: z.string().cuid(),
  type: z.nativeEnum(NotificationType),
  title: z.string().min(1, 'Le titre est requis'),
  message: z.string().min(1, 'Le message est requis'),
  link: z.string().url().optional(),
});

export type CreateNotificationDTO = z.infer<typeof CreateNotificationSchema>;

export const UpdateNotificationSchema = z.object({
  isRead: z.boolean().optional(),
});

export type UpdateNotificationDTO = z.infer<typeof UpdateNotificationSchema>;
import { Server, Socket } from 'socket.io';
import { logger } from '@config/logger';

export const userRoomHandler = (io: Server, socket: Socket): void => {
  const userId = socket.data.userId;

  // User is already in their room (user:userId)
  // Handle user-specific events

  // User status update
  socket.on('user:status:update', (data) => {
    const { status } = data;
    if (!status || !['online', 'away', 'busy'].includes(status)) {
      socket.emit('user:error', {
        message: 'Invalid status',
      });
      return;
    }

    // Update user status
    socket.data.status = status;

    // Broadcast to all users in global room
    io.to('global').emit('user:status:changed', {
      userId,
      status,
      timestamp: new Date(),
    });
  });

  // User settings update
  socket.on('user:settings:update', (data) => {
    // Update user settings in database
    // This would be handled by a service
    socket.emit('user:settings:updated', {
      success: true,
      settings: data,
    });
  });

  // User notification preferences
  socket.on('user:notifications:preferences', (data) => {
    // Update notification preferences
    // This would be handled by a service
    socket.emit('user:notifications:preferences:updated', {
      success: true,
      preferences: data,
    });
  });
};
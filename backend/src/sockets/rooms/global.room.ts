import { Server, Socket } from 'socket.io';
import { logger } from '@config/logger';

export const globalRoomHandler = (io: Server, socket: Socket): void => {
  // All users join global room by default

  // Global message
  socket.on('global:message:send', (data) => {
    const { message } = data;
    if (!message) {
      socket.emit('global:error', {
        message: 'Message is required',
      });
      return;
    }

    // Broadcast to all users
    io.to('global').emit('global:message:receive', {
      userId: socket.data.userId,
      userName: `${socket.data.firstName} ${socket.data.lastName}`,
      message: message.trim(),
      timestamp: new Date(),
    });
  });

  // Global announcement (admin only)
  socket.on('global:announcement:send', (data) => {
    const role = socket.data.role;
    if (role !== 'SUPER_ADMIN' && role !== 'ADMIN') {
      socket.emit('global:error', {
        message: 'Insufficient permissions',
      });
      return;
    }

    const { title, message } = data;
    if (!title || !message) {
      socket.emit('global:error', {
        message: 'Title and message are required',
      });
      return;
    }

    // Broadcast to all users
    io.to('global').emit('global:announcement:receive', {
      title,
      message,
      from: `${socket.data.firstName} ${socket.data.lastName}`,
      timestamp: new Date(),
    });
  });

  // System status
  socket.on('global:system:status', () => {
    io.to('global').emit('global:system:status:update', {
      status: 'online',
      uptime: process.uptime(),
      timestamp: new Date(),
    });
  });
};
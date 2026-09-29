import { Server, Socket } from 'socket.io';
import { logger } from '@config/logger';

export const adminRoomHandler = (io: Server, socket: Socket): void => {
  // Join admin room
  socket.on('admin:join', () => {
    const role = socket.data.role;
    if (role === 'SUPER_ADMIN' || role === 'ADMIN') {
      socket.join('admin');
      socket.emit('admin:joined', {
        success: true,
        message: 'Joined admin room',
      });
      logger.info(`Admin joined: ${socket.data.userId}`);
    } else {
      socket.emit('admin:error', {
        message: 'Insufficient permissions',
      });
    }
  });

  // Leave admin room
  socket.on('admin:leave', () => {
    socket.leave('admin');
    socket.emit('admin:left', {
      success: true,
      message: 'Left admin room',
    });
  });

  // Admin stats request
  socket.on('admin:stats:request', () => {
    if (!socket.rooms.has('admin')) {
      socket.emit('admin:error', {
        message: 'Must be in admin room',
      });
      return;
    }
    // Stats will be handled by the admin handler
  });

  // Admin notification
  socket.on('admin:notification:send', (data) => {
    if (!socket.rooms.has('admin')) {
      socket.emit('admin:error', {
        message: 'Must be in admin room',
      });
      return;
    }

    const { title, message, type } = data;
    if (!title || !message) {
      socket.emit('admin:error', {
        message: 'Title and message are required',
      });
      return;
    }

    // Broadcast to admin room
    io.to('admin').emit('admin:notification:receive', {
      title,
      message,
      type: type || 'info',
      from: `${socket.data.firstName} ${socket.data.lastName}`,
      timestamp: new Date(),
    });
  });
};
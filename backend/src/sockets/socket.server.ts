import { Server as HttpServer } from 'http';
import { Server as SocketServer, Socket } from 'socket.io';
import { corsConfig } from '../config/cors';
import { logger } from '../config/logger';
import { verifyAccessToken } from '../utils/jwt';

let io: SocketServer | null = null;

const socketAuthMiddleware = async (socket: Socket, next: (err?: Error) => void): Promise<void> => {
  try {
    const token = socket.handshake.auth.token;
    if (!token) {
      return next(new Error('Authentication required'));
    }
    const decoded = verifyAccessToken(token);
    if (!decoded) {
      return next(new Error('Invalid token'));
    }
    socket.data.userId = decoded.userId;
    socket.data.email = decoded.email;
    socket.data.role = decoded.role;
    socket.data.firstName = decoded.firstName || 'User';
    socket.data.lastName = decoded.lastName || '';
    socket.data.connectedAt = new Date();
    next();
  } catch (error) {
    logger.error('Socket middleware error:', error);
    next(new Error('Invalid token'));
  }
};

// Handlers (existants)
const handlePresence = (io: SocketServer, socket: Socket) => {
  const userId = socket.data.userId;
  socket.on('presence:join', (_data: any) => {
    io.emit('presence:list', [{ userId, status: 'online', lastSeen: new Date() }]);
  });
  socket.on('presence:update', (data: any) => {
    io.emit('presence:update', { userId, status: data?.status || 'online', lastSeen: new Date() });
  });
  socket.on('presence:list', () => {
    socket.emit('presence:list', [{ userId, status: 'online', lastSeen: new Date() }]);
  });
};

const handleNotification = (io: SocketServer, socket: Socket) => {
  socket.on('notification:send', (data: any) => {
    const { userId, notification } = data;
    if (userId && notification) {
      io.to(`user:${userId}`).emit('notification:receive', notification);
      socket.emit('notification:ack', { success: true });
    }
  });
  socket.on('notification:read', (data: any) => {
    socket.emit('notification:updated', { id: data?.notificationId, isRead: true });
  });
  socket.on('notification:read-all', () => {
    socket.emit('notification:count', { unread: 0 });
  });
  socket.on('notification:count', () => {
    socket.emit('notification:count', { unread: 0 });
  });
};

const handleChat = (io: SocketServer, socket: Socket) => {
  const userId = socket.data.userId;
  const userName = `${socket.data.firstName || 'User'} ${socket.data.lastName || ''}`.trim();

  socket.on('chat:send', (data: any) => {
    const { message, room } = data || {};
    if (message) {
      const chatMessage = {
        id: `${Date.now()}`,
        senderId: userId,
        senderName: userName,
        message: message.trim(),
        timestamp: new Date(),
        room: room || 'global',
      };
      io.to(room || 'global').emit('chat:receive', chatMessage);
    }
  });

  socket.on('chat:history', (data: any) => {
    socket.emit('chat:history', { messages: [], room: data?.room || 'global' });
  });

  socket.on('chat:typing', (data: any) => {
    socket.to(data?.room || 'global').emit('chat:typing', { userId, userName, isTyping: true });
  });

  socket.on('chat:stop-typing', (data: any) => {
    socket.to(data?.room || 'global').emit('chat:stop-typing', { userId, userName, isTyping: false });
  });
};

const handleAdmin = (io: SocketServer, socket: Socket) => {
  socket.on('admin:broadcast', (data: any) => {
    const { message, type, target, userIds } = data || {};
    if (message) {
      const broadcastData = {
        message,
        type: type || 'info',
        timestamp: new Date(),
        admin: { id: socket.data.userId, name: `${socket.data.firstName} ${socket.data.lastName}` },
      };
      if (target === 'all' || !target) {
        io.emit('broadcast:receive', broadcastData);
      } else if (target === 'admin') {
        io.to('admin').emit('broadcast:receive', broadcastData);
      } else if (target === 'specific' && userIds) {
        userIds.forEach((userId: string) => {
          io.to(`user:${userId}`).emit('broadcast:receive', broadcastData);
        });
      }
    }
  });

  socket.on('admin:stats', () => {
    socket.emit('admin:stats', { users: { total: 0, active: 0 }, timestamp: new Date() });
  });

  socket.on('admin:notification', (data: any) => {
    const { title, message, link } = data || {};
    if (title && message) {
      io.emit('notification:receive', {
        title,
        message,
        link: link || null,
        type: 'SYSTEM',
        timestamp: new Date(),
        fromAdmin: { id: socket.data.userId, name: `${socket.data.firstName} ${socket.data.lastName}` },
      });
    }
  });
};

const handleBroadcast = (io: SocketServer, socket: Socket) => {
  socket.on('broadcast:send', (data: any) => {
    const { room, event, payload } = data || {};
    if (room && event && payload) {
      const role = socket.data.role;
      if (role === 'SUPER_ADMIN' || role === 'ADMIN') {
        io.to(room).emit(event, payload);
        logger.info(`Broadcast to ${room}: ${event} from ${socket.data.userId}`);
      }
    }
  });

  socket.on('room:join', (data: any) => {
    const { room } = data || {};
    if (room) {
      if (room === 'admin' && socket.data.role !== 'SUPER_ADMIN' && socket.data.role !== 'ADMIN') {
        socket.emit('admin:error', { message: 'Insufficient permissions for admin room' });
        return;
      }
      socket.join(room);
      socket.emit('room:join', { room, success: true });
    }
  });

  socket.on('room:leave', (data: any) => {
    const { room } = data || {};
    if (room) {
      socket.leave(room);
      socket.emit('room:leave', { room, success: true });
    }
  });

  socket.on('room:list', () => {
    const rooms = Array.from(io.sockets.adapter.rooms.keys());
    socket.emit('room:list', { rooms, count: rooms.length });
  });
};

export const initializeSocket = (server: HttpServer): SocketServer => {
  if (io) return io;

  io = new SocketServer(server, {
    cors: corsConfig,
    path: '/socket.io',
    transports: ['websocket', 'polling'],
    pingTimeout: 60000,
    pingInterval: 25000,
  });

  io.use(socketAuthMiddleware);

  io.on('connection', (socket: Socket) => {
    const userId = socket.data.userId;
    logger.info(`🔌 Client connected: ${socket.id} (User: ${userId})`);
    socket.join(`user:${userId}`);
    socket.join('global');

    const currentIo = io as SocketServer;
    
    handlePresence(currentIo, socket);
    handleNotification(currentIo, socket);
    handleChat(currentIo, socket);

    if (socket.data.role === 'SUPER_ADMIN' || socket.data.role === 'ADMIN') {
      socket.join('admin');
      handleAdmin(currentIo, socket);
    }

    handleBroadcast(currentIo, socket);

    socket.on('disconnect', () => {
      logger.info(`🔌 Client disconnected: ${socket.id} (User: ${userId})`);
      socket.leave(`user:${userId}`);
      socket.leave('admin');
      socket.leave('global');
    });

    socket.on('error', (error) => {
      logger.error(`Socket error for ${socket.id}:`, error);
    });
  });

  io.engine.on('connection_error', (err) => {
    logger.error('Socket connection error:', err);
  });

  logger.info('🔌 Socket.IO server initialized');
  return io;
};

export const getIO = (): SocketServer | null => io;
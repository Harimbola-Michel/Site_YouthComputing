import { Server, Socket } from 'socket.io';
import { logger } from '@config/logger';
import { socketEvents } from '../socket.events';

export const handleBroadcast = (io: Server, socket: Socket): void => {
  // Send broadcast to specific room
  socket.on(socketEvents.BROADCAST_SEND, (data) => {
    try {
      const { room, event, payload } = data;

      if (!room || !event || !payload) {
        socket.emit(socketEvents.ADMIN_ERROR, {
          message: 'Room, event and payload are required',
        });
        return;
      }

      // Validate user has permission to broadcast
      const role = socket.data.role;
      if (role !== 'SUPER_ADMIN' && role !== 'ADMIN') {
        socket.emit(socketEvents.ADMIN_ERROR, {
          message: 'Insufficient permissions',
        });
        return;
      }

      // Broadcast to room
      io.to(room).emit(event, payload);

      logger.info(`Broadcast to ${room}: ${event} from ${socket.data.userId}`);
    } catch (error) {
      logger.error('Broadcast send error:', error);
      socket.emit(socketEvents.ADMIN_ERROR, {
        message: 'Failed to broadcast',
      });
    }
  });

  // Join room
  socket.on(socketEvents.ROOM_JOIN, (data) => {
    try {
      const { room } = data;

      if (!room) {
        socket.emit(socketEvents.ADMIN_ERROR, {
          message: 'Room name is required',
        });
        return;
      }

      // Validate room access
      if (room === 'admin' && socket.data.role !== 'SUPER_ADMIN' && socket.data.role !== 'ADMIN') {
        socket.emit(socketEvents.ADMIN_ERROR, {
          message: 'Insufficient permissions for admin room',
        });
        return;
      }

      socket.join(room);
      socket.emit(socketEvents.ROOM_JOIN, {
        room,
        success: true,
        message: `Joined room: ${room}`,
      });
    } catch (error) {
      logger.error('Room join error:', error);
      socket.emit(socketEvents.ADMIN_ERROR, {
        message: 'Failed to join room',
      });
    }
  });

  // Leave room
  socket.on(socketEvents.ROOM_LEAVE, (data) => {
    try {
      const { room } = data;

      if (!room) {
        socket.emit(socketEvents.ADMIN_ERROR, {
          message: 'Room name is required',
        });
        return;
      }

      socket.leave(room);
      socket.emit(socketEvents.ROOM_LEAVE, {
        room,
        success: true,
        message: `Left room: ${room}`,
      });
    } catch (error) {
      logger.error('Room leave error:', error);
      socket.emit(socketEvents.ADMIN_ERROR, {
        message: 'Failed to leave room',
      });
    }
  });

  // List rooms
  socket.on(socketEvents.ROOM_LIST, () => {
    try {
      const rooms = Array.from(io.sockets.adapter.rooms.keys());
      socket.emit(socketEvents.ROOM_LIST, {
        rooms,
        count: rooms.length,
      });
    } catch (error) {
      logger.error('Room list error:', error);
      socket.emit(socketEvents.ADMIN_ERROR, {
        message: 'Failed to get room list',
      });
    }
  });
};
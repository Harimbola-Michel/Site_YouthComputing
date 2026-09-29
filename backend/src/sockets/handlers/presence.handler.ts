import { Server, Socket } from 'socket.io';
import { logger } from '@config/logger';
import { socketEvents } from '../socket.events';

interface PresenceData {
  userId: string;
  status: 'online' | 'offline' | 'away' | 'busy';
  lastSeen: Date;
}

const presenceMap = new Map<string, PresenceData>();

export const handlePresence = (io: Server, socket: Socket): void => {
  const userId = socket.data.userId;

  // Update presence on join
  socket.on(socketEvents.PRESENCE_JOIN, (data) => {
    try {
      const status = data?.status || 'online';

      presenceMap.set(userId, {
        userId,
        status,
        lastSeen: new Date(),
      });

      // Broadcast to all users
      io.emit(socketEvents.PRESENCE_LIST, Array.from(presenceMap.values()));
    } catch (error) {
      logger.error('Presence join error:', error);
      socket.emit(socketEvents.PRESENCE_ERROR, {
        message: 'Failed to update presence',
      });
    }
  });

  // Update presence status
  socket.on(socketEvents.PRESENCE_UPDATE, (data) => {
    try {
      const { status } = data;

      if (!status || !['online', 'away', 'busy'].includes(status)) {
        socket.emit(socketEvents.PRESENCE_ERROR, {
          message: 'Invalid status',
        });
        return;
      }

      const current = presenceMap.get(userId);
      if (current) {
        current.status = status;
        current.lastSeen = new Date();
        presenceMap.set(userId, current);
      }

      // Broadcast update
      io.emit(socketEvents.PRESENCE_UPDATE, {
        userId,
        status,
        lastSeen: new Date(),
      });
    } catch (error) {
      logger.error('Presence update error:', error);
      socket.emit(socketEvents.PRESENCE_ERROR, {
        message: 'Failed to update presence',
      });
    }
  });

  // Get presence list
  socket.on(socketEvents.PRESENCE_LIST, () => {
    socket.emit(socketEvents.PRESENCE_LIST, Array.from(presenceMap.values()));
  });

  // Handle disconnect
  socket.on(socketEvents.DISCONNECT, () => {
    // Don't remove from map immediately, mark as away
    const current = presenceMap.get(userId);
    if (current) {
      current.status = 'away';
      current.lastSeen = new Date();
      presenceMap.set(userId, current);
    }

    // Broadcast after 30 seconds if not reconnected
    setTimeout(() => {
      const check = presenceMap.get(userId);
      if (check && check.status === 'away') {
        presenceMap.delete(userId);
        io.emit(socketEvents.PRESENCE_LEAVE, { userId });
      }
    }, 30000);
  });
};
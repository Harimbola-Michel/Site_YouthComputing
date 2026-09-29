import { Server, Socket } from 'socket.io';
import { logger } from '@config/logger';
import { socketEvents } from '../socket.events';

interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  message: string;
  timestamp: Date;
  room?: string;
}

const chatHistory = new Map<string, ChatMessage[]>();

export const handleChat = (io: Server, socket: Socket): void => {
  const userId = socket.data.userId;
  const userName = `${socket.data.firstName} ${socket.data.lastName}`;

  // Send chat message
  socket.on(socketEvents.CHAT_SEND, (data) => {
    try {
      const { message, room } = data;

      if (!message) {
        socket.emit(socketEvents.CHAT_ERROR, {
          message: 'Message is required',
        });
        return;
      }

      const chatMessage: ChatMessage = {
        id: `${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        senderId: userId,
        senderName: userName,
        message: message.trim(),
        timestamp: new Date(),
        room: room || 'global',
      };

      // Store in history
      const roomKey = room || 'global';
      if (!chatHistory.has(roomKey)) {
        chatHistory.set(roomKey, []);
      }
      const history = chatHistory.get(roomKey)!;
      history.push(chatMessage);

      // Keep only last 100 messages
      if (history.length > 100) {
        history.shift();
      }

      // Emit to room
      const targetRoom = room || 'global';
      io.to(targetRoom).emit(socketEvents.CHAT_RECEIVE, chatMessage);
    } catch (error) {
      logger.error('Chat send error:', error);
      socket.emit(socketEvents.CHAT_ERROR, {
        message: 'Failed to send message',
      });
    }
  });

  // Get chat history
  socket.on(socketEvents.CHAT_HISTORY, (data) => {
    try {
      const { room, limit } = data || {};
      const roomKey = room || 'global';
      const history = chatHistory.get(roomKey) || [];
      const recent = limit ? history.slice(-limit) : history;

      socket.emit(socketEvents.CHAT_HISTORY, {
        messages: recent,
        room: roomKey,
      });
    } catch (error) {
      logger.error('Chat history error:', error);
      socket.emit(socketEvents.CHAT_ERROR, {
        message: 'Failed to get chat history',
      });
    }
  });

  // Typing indicator
  socket.on(socketEvents.CHAT_TYPING, (data) => {
    try {
      const { room } = data || {};
      const targetRoom = room || 'global';

      socket.to(targetRoom).emit(socketEvents.CHAT_TYPING, {
        userId,
        userName,
        isTyping: true,
      });
    } catch (error) {
      logger.error('Chat typing error:', error);
    }
  });

  // Stop typing
  socket.on(socketEvents.CHAT_STOP_TYPING, (data) => {
    try {
      const { room } = data || {};
      const targetRoom = room || 'global';

      socket.to(targetRoom).emit(socketEvents.CHAT_STOP_TYPING, {
        userId,
        userName,
        isTyping: false,
      });
    } catch (error) {
      logger.error('Chat stop typing error:', error);
    }
  });
};
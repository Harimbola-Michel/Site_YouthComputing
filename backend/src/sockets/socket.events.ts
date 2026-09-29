export const socketEvents = {
  // Connection
  CONNECTION: 'connection',
  DISCONNECT: 'disconnect',
  CONNECT_ERROR: 'connect_error',
  CONNECT_TIMEOUT: 'connect_timeout',

  // Auth
  AUTHENTICATE: 'authenticate',
  AUTHENTICATED: 'authenticated',
  UNAUTHORIZED: 'unauthorized',

  // Notifications
  NOTIFICATION_SEND: 'notification:send',
  NOTIFICATION_RECEIVE: 'notification:receive',
  NOTIFICATION_READ: 'notification:read',
  NOTIFICATION_UPDATED: 'notification:updated',
  NOTIFICATION_ERROR: 'notification:error',

  // Presence
  PRESENCE_JOIN: 'presence:join',
  PRESENCE_LEAVE: 'presence:leave',
  PRESENCE_UPDATE: 'presence:update',
  PRESENCE_LIST: 'presence:list',
  PRESENCE_ERROR: 'presence:error',

  // Chat
  CHAT_SEND: 'chat:send',
  CHAT_RECEIVE: 'chat:receive',
  CHAT_TYPING: 'chat:typing',
  CHAT_STOP_TYPING: 'chat:stop-typing',
  CHAT_HISTORY: 'chat:history',
  CHAT_ERROR: 'chat:error',

  // Admin
  ADMIN_BROADCAST: 'admin:broadcast',
  ADMIN_NOTIFICATION: 'admin:notification',
  ADMIN_STATS: 'admin:stats',
  ADMIN_ERROR: 'admin:error',

  // Rooms
  ROOM_JOIN: 'room:join',
  ROOM_LEAVE: 'room:leave',
  ROOM_LIST: 'room:list',

  // System
  SYSTEM_INFO: 'system:info',
  SYSTEM_WARNING: 'system:warning',
  SYSTEM_ERROR: 'system:error',

  // Broadcast
  BROADCAST_SEND: 'broadcast:send',
  BROADCAST_RECEIVE: 'broadcast:receive',
};

export const socketRooms = {
  GLOBAL: 'global',
  ADMIN: 'admin',
  USER_PREFIX: 'user:',
  FORMATION_PREFIX: 'formation:',
  PROJECT_PREFIX: 'project:',
  EVENT_PREFIX: 'event:',
};

export const socketMessages = {
  AUTH_REQUIRED: 'Authentication required',
  INVALID_TOKEN: 'Invalid token',
  TOKEN_EXPIRED: 'Token expired',
  UNAUTHORIZED: 'Unauthorized access',
  ROOM_JOINED: 'Room joined successfully',
  ROOM_LEFT: 'Room left successfully',
  MESSAGE_SENT: 'Message sent successfully',
  MESSAGE_RECEIVED: 'Message received',
  PRESENCE_UPDATED: 'Presence updated',
};

export type SocketEvent = keyof typeof socketEvents;
export type SocketRoom = typeof socketRooms[keyof typeof socketRooms];

export default {
  events: socketEvents,
  rooms: socketRooms,
  messages: socketMessages,
};
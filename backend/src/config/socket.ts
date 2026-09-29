import { ServerOptions } from 'socket.io';
import { corsConfig } from './cors';
import { env } from './env';

export const socketConfig: ServerOptions = {
  cors: corsConfig,
  path: '/socket.io',
  transports: ['websocket', 'polling'],
  pingTimeout: 60000,
  pingInterval: 25000,
  connectTimeout: 45000,
  allowEIO3: true,
  cookie: {
    name: 'socket.io',
    httpOnly: true,
    sameSite: env.NODE_ENV === 'production' ? 'none' : 'lax',
    secure: env.NODE_ENV === 'production',
  },
  maxHttpBufferSize: 1e6, // 1 MB
  perMessageDeflate: {
    threshold: 1024, // Compress messages > 1KB
  },
  serveClient: false,
  engine: {
    allowUpgrades: true,
    upgradeTimeout: 10000,
  },
};

export const socketEvents = {
  CONNECTION: 'connection',
  DISCONNECT: 'disconnect',
  ERROR: 'error',

  // Auth events
  AUTHENTICATE: 'authenticate',
  AUTHENTICATED: 'authenticated',
  UNAUTHORIZED: 'unauthorized',

  // Notification events
  NOTIFICATION_SEND: 'notification:send',
  NOTIFICATION_RECEIVE: 'notification:receive',
  NOTIFICATION_READ: 'notification:read',
  NOTIFICATION_UPDATED: 'notification:updated',
  NOTIFICATION_ERROR: 'notification:error',

  // Presence events
  PRESENCE_JOIN: 'presence:join',
  PRESENCE_LEAVE: 'presence:leave',
  PRESENCE_UPDATE: 'presence:update',
  PRESENCE_LIST: 'presence:list',

  // Chat events
  CHAT_SEND: 'chat:send',
  CHAT_RECEIVE: 'chat:receive',
  CHAT_TYPING: 'chat:typing',
  CHAT_STOP_TYPING: 'chat:stop-typing',
  CHAT_HISTORY: 'chat:history',

  // Admin events
  ADMIN_BROADCAST: 'admin:broadcast',
  ADMIN_NOTIFICATION: 'admin:notification',
  ADMIN_STATS: 'admin:stats',

  // Room events
  ROOM_JOIN: 'room:join',
  ROOM_LEAVE: 'room:leave',
  ROOM_LIST: 'room:list',

  // System events
  SYSTEM_INFO: 'system:info',
  SYSTEM_WARNING: 'system:warning',
  SYSTEM_ERROR: 'system:error',
} as const;

export const socketRooms = {
  GLOBAL: 'global',
  ADMIN: 'admin',
  USER_PREFIX: 'user:',
  FORMATION_PREFIX: 'formation:',
  PROJECT_PREFIX: 'project:',
  EVENT_PREFIX: 'event:',
} as const;

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
} as const;

export type SocketEvents = typeof socketEvents[keyof typeof socketEvents];
export type SocketRooms = typeof socketRooms[keyof typeof socketRooms];

export default {
  config: socketConfig,
  events: socketEvents,
  rooms: socketRooms,
  messages: socketMessages,
};
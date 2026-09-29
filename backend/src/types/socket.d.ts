import { Socket } from 'socket.io';

export interface SocketData {
  userId: string;
  email: string;
  role: string;
  rooms: string[];
  connectedAt: Date;
}

export interface AuthenticatedSocket extends Socket {
  data: SocketData;
}

export interface SocketEventData {
  event: string;
  data: any;
  timestamp: Date;
}

export interface NotificationPayload {
  id: string;
  title: string;
  message: string;
  type: string;
  link?: string;
  isRead: boolean;
  createdAt: Date;
}

export interface ChatMessagePayload {
  id: string;
  senderId: string;
  senderName: string;
  message: string;
  timestamp: Date;
  room?: string;
}

export interface PresencePayload {
  userId: string;
  status: 'online' | 'offline' | 'away' | 'busy';
  lastSeen?: Date;
}

export interface AdminBroadcastPayload {
  message: string;
  type: 'info' | 'warning' | 'success' | 'error';
  link?: string;
  target?: 'all' | 'admin' | 'specific';
  userIds?: string[];
}

export interface SocketRooms {
  GLOBAL: 'global';
  ADMIN: 'admin';
  USER_PREFIX: 'user:';
  FORMATION_PREFIX: 'formation:';
  PROJECT_PREFIX: 'project:';
  EVENT_PREFIX: 'event:';
}

export type SocketRoom = 
  | 'global'
  | 'admin'
  | `user:${string}`
  | `formation:${string}`
  | `project:${string}`
  | `event:${string}`;

export interface SocketEvents {
  // Connection
  CONNECTION: 'connection';
  DISCONNECT: 'disconnect';
  CONNECT_ERROR: 'connect_error';
  CONNECT_TIMEOUT: 'connect_timeout';

  // Auth
  AUTHENTICATE: 'authenticate';
  AUTHENTICATED: 'authenticated';
  UNAUTHORIZED: 'unauthorized';

  // Notifications
  NOTIFICATION_SEND: 'notification:send';
  NOTIFICATION_RECEIVE: 'notification:receive';
  NOTIFICATION_READ: 'notification:read';
  NOTIFICATION_UPDATED: 'notification:updated';
  NOTIFICATION_ERROR: 'notification:error';

  // Presence
  PRESENCE_JOIN: 'presence:join';
  PRESENCE_LEAVE: 'presence:leave';
  PRESENCE_UPDATE: 'presence:update';
  PRESENCE_LIST: 'presence:list';
  PRESENCE_ERROR: 'presence:error';

  // Chat
  CHAT_SEND: 'chat:send';
  CHAT_RECEIVE: 'chat:receive';
  CHAT_TYPING: 'chat:typing';
  CHAT_STOP_TYPING: 'chat:stop-typing';
  CHAT_HISTORY: 'chat:history';
  CHAT_ERROR: 'chat:error';

  // Admin
  ADMIN_BROADCAST: 'admin:broadcast';
  ADMIN_NOTIFICATION: 'admin:notification';
  ADMIN_STATS: 'admin:stats';
  ADMIN_ERROR: 'admin:error';

  // Rooms
  ROOM_JOIN: 'room:join';
  ROOM_LEAVE: 'room:leave';
  ROOM_LIST: 'room:list';

  // System
  SYSTEM_INFO: 'system:info';
  SYSTEM_WARNING: 'system:warning';
  SYSTEM_ERROR: 'system:error';
}

export type SocketEventName = keyof SocketEvents;

export interface SocketEventHandlers {
  [key: string]: (data: any, callback?: (response: any) => void) => void;
}

export interface SocketError {
  code: string;
  message: string;
  details?: any;
}
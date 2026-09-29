export interface SocketEvent {
  event: string;
  data: any;
  timestamp: string;
}

export interface NotificationPayload {
  id: string;
  title: string;
  message: string;
  type: string;
  link?: string;
  isRead: boolean;
  createdAt: string;
}

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  message: string;
  timestamp: string;
  room?: string;
}

export interface PresencePayload {
  userId: string;
  status: 'online' | 'offline' | 'away' | 'busy';
  lastSeen?: string;
}

export interface AdminBroadcastPayload {
  message: string;
  type: 'info' | 'warning' | 'success' | 'error';
  link?: string;
  target?: 'all' | 'admin' | 'specific';
  userIds?: string[];
}
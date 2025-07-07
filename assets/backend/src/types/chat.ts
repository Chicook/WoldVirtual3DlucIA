export interface User {
  socketId: string;
  username: string;
  avatar: string;
  status?: 'online' | 'away' | 'busy' | 'offline';
  lastSeen?: Date;
  isTyping?: boolean;
  roomId?: string;
}

export interface ChatMessage {
  id: string;
  roomId: string;
  userId: string;
  username: string;
  avatar: string;
  message: string;
  type: 'text' | 'image' | 'audio' | 'video' | 'file' | 'private' | 'system';
  timestamp: Date;
  reactions: Map<string, Set<string>>; // reaction -> set of user IDs
  edited: boolean;
  editedAt?: Date;
  replyTo?: string; // ID del mensaje al que responde
  mentions?: string[]; // IDs de usuarios mencionados
}

export interface ChatRoom {
  id: string;
  name: string;
  type: 'public' | 'private' | 'group';
  users: Set<string>; // Set de socket IDs
  messages: ChatMessage[];
  createdAt: Date;
  lastActivity?: Date;
  isActive?: boolean;
  maxUsers?: number;
  description?: string;
  avatar?: string;
}

export interface ChatNotification {
  id: string;
  userId: string;
  type: 'message' | 'mention' | 'reaction' | 'friend_request' | 'system';
  title: string;
  message: string;
  data?: any;
  timestamp: Date;
  read: boolean;
  actionUrl?: string;
}

export interface ChatStats {
  totalMessages: number;
  activeUsers: number;
  totalRooms: number;
  messagesToday: number;
  peakConcurrentUsers: number;
  averageMessageLength: number;
}

export interface ChatSettings {
  userId: string;
  notifications: {
    sound: boolean;
    desktop: boolean;
    mentions: boolean;
    privateMessages: boolean;
  };
  privacy: {
    showStatus: boolean;
    showLastSeen: boolean;
    allowPrivateMessages: boolean;
  };
  appearance: {
    theme: 'light' | 'dark' | 'auto';
    fontSize: 'small' | 'medium' | 'large';
    compactMode: boolean;
  };
  language: string;
  timezone: string;
}

export interface ChatReaction {
  emoji: string;
  count: number;
  users: string[]; // Array de user IDs
}

export interface ChatSearchResult {
  messages: ChatMessage[];
  users: User[];
  rooms: ChatRoom[];
  totalResults: number;
}

export interface ChatAnalytics {
  messagesPerHour: { hour: number; count: number }[];
  popularEmojis: { emoji: string; count: number }[];
  activeHours: { hour: number; users: number }[];
  topUsers: { userId: string; username: string; messageCount: number }[];
  roomActivity: { roomId: string; name: string; messageCount: number }[];
}

export interface ChatError {
  code: string;
  message: string;
  details?: any;
  timestamp: Date;
}

export interface ChatEvent {
  type: 'user_joined' | 'user_left' | 'message_sent' | 'message_edited' | 'message_deleted' | 'reaction_added' | 'typing_started' | 'typing_stopped';
  data: any;
  timestamp: Date;
  roomId?: string;
  userId?: string;
}

// Tipos para WebSocket events
export interface SocketEvents {
  // Conexión
  'join-room': { roomId: string; user: User };
  'leave-room': { roomId: string };
  
  // Mensajes
  'send-message': { roomId: string; message: string; type?: string };
  'private-message': { toUserId: string; message: string };
  'edit-message': { messageId: string; newMessage: string };
  'delete-message': { messageId: string };
  
  // Reacciones
  'react-to-message': { messageId: string; reaction: string };
  'remove-reaction': { messageId: string; reaction: string };
  
  // Estado
  'typing': { roomId: string; isTyping: boolean };
  'update-user-status': { status: string };
  
  // Búsqueda
  'search-users': { query: string };
  'search-messages': { query: string; roomId?: string };
  
  // Salas
  'create-private-room': { userIds: string[]; name?: string };
  'join-private-room': { roomId: string };
  
  // Notificaciones
  'mark-notification-read': { notificationId: string };
  'get-notifications': { limit?: number };
  
  // Configuración
  'update-settings': { settings: Partial<ChatSettings> };
  'get-settings': void;
}

export interface ServerEvents {
  // Conexión
  'user-joined': { user: User; timestamp: Date };
  'user-left': { userId: string; username: string; timestamp: Date };
  
  // Mensajes
  'new-message': ChatMessage;
  'message-edited': { messageId: string; newMessage: string; timestamp: Date };
  'message-deleted': { messageId: string; timestamp: Date };
  'private-message': ChatMessage;
  'message-sent': ChatMessage;
  
  // Reacciones
  'message-reaction': { messageId: string; reaction: string; userId: string; username: string; count: number };
  'reaction-removed': { messageId: string; reaction: string; userId: string; count: number };
  
  // Estado
  'user-typing': { userId: string; username: string; isTyping: boolean };
  'user-status-updated': { userId: string; username: string; status: string; lastSeen: Date };
  
  // Salas
  'room-history': { roomId: string; messages: ChatMessage[] };
  'room-users': User[];
  'private-room-created': { roomId: string; name: string; users: User[] };
  
  // Búsqueda
  'search-results': User[];
  'message-search-results': { messages: ChatMessage[]; total: number };
  
  // Notificaciones
  'new-notification': ChatNotification;
  'notifications': ChatNotification[];
  
  // Configuración
  'settings-updated': ChatSettings;
  'settings': ChatSettings;
  
  // Errores
  'error': ChatError;
  
  // Analytics
  'chat-stats': ChatStats;
  'chat-analytics': ChatAnalytics;
} 
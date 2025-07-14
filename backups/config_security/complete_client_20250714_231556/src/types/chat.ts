export interface ChatMessage {
  id: string;
  content: string;
  sender: User;
  timestamp: Date;
  roomId: string;
  reactions?: Map<string, Set<string>>;
  edited?: boolean;
  deleted?: boolean;
}

export interface User {
  id: string;
  username: string;
  avatar?: string;
  isOnline: boolean;
  lastSeen?: Date;
  status?: 'online' | 'away' | 'busy' | 'offline';
}

export interface ChatRoom {
  id: string;
  name: string;
  description?: string;
  type: 'public' | 'private' | 'direct';
  participants: User[];
  messages: ChatMessage[];
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
}

export interface ChatNotification {
  id: string;
  type: 'message' | 'mention' | 'reaction' | 'user_joined' | 'user_left';
  message: string;
  timestamp: Date;
  read: boolean;
  data?: any;
}

export interface ChatSettings {
  notifications: {
    enabled: boolean;
    sound: boolean;
    desktop: boolean;
    mentions: boolean;
  };
  appearance: {
    theme: 'light' | 'dark' | 'auto';
    fontSize: 'small' | 'medium' | 'large';
    compactMode: boolean;
  };
  privacy: {
    showStatus: boolean;
    showLastSeen: boolean;
    allowDirectMessages: boolean;
  };
}

export interface ChatState {
  messages: ChatMessage[];
  users: User[];
  rooms: ChatRoom[];
  currentRoom?: ChatRoom;
  notifications: ChatNotification[];
  settings: ChatSettings;
  isConnected: boolean;
  isLoading: boolean;
  error?: string;
} 
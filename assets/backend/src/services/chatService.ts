import { Server as SocketIOServer } from 'socket.io';
import { Server as HTTPServer } from 'http';
import { ChatMessage, ChatRoom, User } from '../types/chat';

export class ChatService {
  private io: SocketIOServer;
  private rooms: Map<string, ChatRoom> = new Map();
  private users: Map<string, User> = new Map();

  constructor(server: HTTPServer) {
    this.io = new SocketIOServer(server, {
      cors: {
        origin: process.env.CORS_ORIGIN || "http://localhost:3000",
        methods: ["GET", "POST"]
      }
    });

    this.setupEventHandlers();
  }

  private setupEventHandlers() {
    this.io.on('connection', (socket) => {
      console.log(`Usuario conectado: ${socket.id}`);

      // Unirse a una sala
      socket.on('join-room', (data: { roomId: string; user: User }) => {
        this.joinRoom(socket, data.roomId, data.user);
      });

      // Enviar mensaje
      socket.on('send-message', (data: { roomId: string; message: string; type?: string }) => {
        this.sendMessage(socket, data.roomId, data.message, data.type);
      });

      // Mensaje privado
      socket.on('private-message', (data: { toUserId: string; message: string }) => {
        this.sendPrivateMessage(socket, data.toUserId, data.message);
      });

      // Reacciones a mensajes
      socket.on('react-to-message', (data: { messageId: string; reaction: string }) => {
        this.reactToMessage(socket, data.messageId, data.reaction);
      });

      // Typing indicator
      socket.on('typing', (data: { roomId: string; isTyping: boolean }) => {
        this.handleTyping(socket, data.roomId, data.isTyping);
      });

      // Desconexión
      socket.on('disconnect', () => {
        this.handleDisconnect(socket);
      });

      // Actualizar estado del usuario
      socket.on('update-user-status', (status: string) => {
        this.updateUserStatus(socket, status);
      });

      // Buscar usuarios
      socket.on('search-users', (query: string) => {
        this.searchUsers(socket, query);
      });

      // Crear sala privada
      socket.on('create-private-room', (data: { userIds: string[]; name?: string }) => {
        this.createPrivateRoom(socket, data.userIds, data.name);
      });
    });
  }

  private joinRoom(socket: any, roomId: string, user: User) {
    // Crear sala si no existe
    if (!this.rooms.has(roomId)) {
      this.rooms.set(roomId, {
        id: roomId,
        name: roomId === 'global' ? 'Chat Global' : roomId,
        type: roomId === 'global' ? 'public' : 'private',
        users: new Set(),
        messages: [],
        createdAt: new Date()
      });
    }

    const room = this.rooms.get(roomId)!;
    
    // Agregar usuario a la sala
    room.users.add(socket.id);
    this.users.set(socket.id, { ...user, socketId: socket.id });

    // Unirse al socket room
    socket.join(roomId);

    // Notificar a otros usuarios
    socket.to(roomId).emit('user-joined', {
      user: { ...user, socketId: socket.id },
      timestamp: new Date()
    });

    // Enviar historial de mensajes
    socket.emit('room-history', {
      roomId,
      messages: room.messages.slice(-50) // Últimos 50 mensajes
    });

    // Enviar lista de usuarios en la sala
    const usersInRoom = Array.from(room.users).map(id => this.users.get(id)).filter(Boolean);
    socket.emit('room-users', usersInRoom);

    console.log(`Usuario ${user.username} se unió a la sala ${roomId}`);
  }

  private sendMessage(socket: any, roomId: string, message: string, type: string = 'text') {
    const user = this.users.get(socket.id);
    if (!user) return;

    const chatMessage: ChatMessage = {
      id: this.generateMessageId(),
      roomId,
      userId: socket.id,
      username: user.username,
      avatar: user.avatar,
      message,
      type,
      timestamp: new Date(),
      reactions: new Map(),
      edited: false
    };

    // Guardar mensaje en la sala
    const room = this.rooms.get(roomId);
    if (room) {
      room.messages.push(chatMessage);
      
      // Mantener solo los últimos 100 mensajes
      if (room.messages.length > 100) {
        room.messages = room.messages.slice(-100);
      }
    }

    // Enviar mensaje a todos en la sala
    this.io.to(roomId).emit('new-message', chatMessage);

    // Guardar en base de datos (implementar después)
    this.saveMessageToDatabase(chatMessage);

    console.log(`Mensaje enviado en ${roomId}: ${message}`);
  }

  private sendPrivateMessage(socket: any, toUserId: string, message: string) {
    const fromUser = this.users.get(socket.id);
    const toUser = this.users.get(toUserId);

    if (!fromUser || !toUser) return;

    const privateMessage: ChatMessage = {
      id: this.generateMessageId(),
      roomId: `private-${[socket.id, toUserId].sort().join('-')}`,
      userId: socket.id,
      username: fromUser.username,
      avatar: fromUser.avatar,
      message,
      type: 'private',
      timestamp: new Date(),
      reactions: new Map(),
      edited: false
    };

    // Enviar al destinatario
    this.io.to(toUserId).emit('private-message', privateMessage);
    
    // Enviar confirmación al remitente
    socket.emit('message-sent', privateMessage);

    console.log(`Mensaje privado de ${fromUser.username} a ${toUser.username}`);
  }

  private reactToMessage(socket: any, messageId: string, reaction: string) {
    const user = this.users.get(socket.id);
    if (!user) return;

    // Buscar mensaje en todas las salas
    for (const room of this.rooms.values()) {
      const message = room.messages.find(m => m.id === messageId);
      if (message) {
        if (!message.reactions.has(reaction)) {
          message.reactions.set(reaction, new Set());
        }
        message.reactions.get(reaction)!.add(socket.id);

        // Notificar a todos en la sala
        this.io.to(room.id).emit('message-reaction', {
          messageId,
          reaction,
          userId: socket.id,
          username: user.username,
          count: message.reactions.get(reaction)!.size
        });
        break;
      }
    }
  }

  private handleTyping(socket: any, roomId: string, isTyping: boolean) {
    const user = this.users.get(socket.id);
    if (!user) return;

    socket.to(roomId).emit('user-typing', {
      userId: socket.id,
      username: user.username,
      isTyping
    });
  }

  private handleDisconnect(socket: any) {
    const user = this.users.get(socket.id);
    if (!user) return;

    // Remover usuario de todas las salas
    for (const room of this.rooms.values()) {
      if (room.users.has(socket.id)) {
        room.users.delete(socket.id);
        socket.to(room.id).emit('user-left', {
          userId: socket.id,
          username: user.username,
          timestamp: new Date()
        });
      }
    }

    // Remover usuario del mapa
    this.users.delete(socket.id);

    console.log(`Usuario desconectado: ${user.username}`);
  }

  private updateUserStatus(socket: any, status: string) {
    const user = this.users.get(socket.id);
    if (!user) return;

    user.status = status;
    user.lastSeen = new Date();

    // Notificar a todos los usuarios
    this.io.emit('user-status-updated', {
      userId: socket.id,
      username: user.username,
      status,
      lastSeen: user.lastSeen
    });
  }

  private searchUsers(socket: any, query: string) {
    const results = Array.from(this.users.values())
      .filter(user => 
        user.username.toLowerCase().includes(query.toLowerCase()) &&
        user.socketId !== socket.id
      )
      .map(user => ({
        id: user.socketId,
        username: user.username,
        avatar: user.avatar,
        status: user.status
      }));

    socket.emit('search-results', results);
  }

  private createPrivateRoom(socket: any, userIds: string[], name?: string) {
    const roomId = `private-${userIds.sort().join('-')}`;
    const roomName = name || `Sala Privada`;

    if (!this.rooms.has(roomId)) {
      this.rooms.set(roomId, {
        id: roomId,
        name: roomName,
        type: 'private',
        users: new Set(),
        messages: [],
        createdAt: new Date()
      });
    }

    // Agregar usuarios a la sala
    userIds.forEach(userId => {
      const userSocket = this.io.sockets.sockets.get(userId);
      if (userSocket) {
        userSocket.join(roomId);
        const room = this.rooms.get(roomId)!;
        room.users.add(userId);
      }
    });

    // Notificar a todos los usuarios
    this.io.to(roomId).emit('private-room-created', {
      roomId,
      name: roomName,
      users: userIds.map(id => this.users.get(id)).filter(Boolean)
    });
  }

  private generateMessageId(): string {
    return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private async saveMessageToDatabase(message: ChatMessage) {
    // TODO: Implementar guardado en base de datos
    // Por ahora solo log
    console.log('Guardando mensaje en BD:', message.id);
  }

  // Métodos públicos para el servidor
  public broadcastToAll(event: string, data: any) {
    this.io.emit(event, data);
  }

  public broadcastToRoom(roomId: string, event: string, data: any) {
    this.io.to(roomId).emit(event, data);
  }

  public getOnlineUsers(): User[] {
    return Array.from(this.users.values());
  }

  public getRooms(): ChatRoom[] {
    return Array.from(this.rooms.values()).map(room => ({
      ...room,
      users: Array.from(room.users).map(id => this.users.get(id)).filter(Boolean)
    }));
  }
}

export default ChatService; 
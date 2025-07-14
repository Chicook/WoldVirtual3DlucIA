/**
 * Tests para NetworkManager
 */

import { NetworkManager } from '../NetworkManager';
import { NetworkConfig, NetworkState, MessagePriority } from '../NetworkManager';
import { NetworkMessage } from '../NetworkMessage';
import { NetworkPeer } from '../NetworkPeer';
import { NetworkRoom } from '../NetworkRoom';

// Mock WebSocket
class MockWebSocket {
  public onopen: (() => void) | null = null;
  public onclose: ((code: number, reason: string) => void) | null = null;
  public onerror: ((error: Error) => void) | null = null;
  public onmessage: ((data: any) => void) | null = null;
  public readyState: number = 0;
  public url: string;

  constructor(url: string) {
    this.url = url;
  }

  send(data: any): void {
    // Mock send
  }

  close(code?: number, reason?: string): void {
    this.readyState = 3;
    if (this.onclose) {
      this.onclose(code || 1000, reason || 'Mock close');
    }
  }
}

// Mock WebSocketClient
jest.mock('../WebSocketClient', () => {
  return {
    WebSocketClient: jest.fn().mockImplementation(() => ({
      on: jest.fn(),
      connect: jest.fn().mockResolvedValue(undefined),
      disconnect: jest.fn().mockResolvedValue(undefined),
      send: jest.fn().mockResolvedValue(undefined)
    }))
  };
});

describe('NetworkManager', () => {
  let networkManager: NetworkManager;
  let config: NetworkConfig;

  beforeEach(() => {
    config = {
      id: 'test-manager',
      name: 'Test Network Manager',
      serverUrl: 'localhost',
      port: 8080,
      protocol: 'ws',
      autoReconnect: true,
      reconnectInterval: 1000,
      maxReconnectAttempts: 3,
      heartbeatInterval: 5000,
      timeout: 30000,
      compression: false,
      encryption: false,
      metadata: {
        version: '1.0.0',
        capabilities: ['sync', 'chat'],
        maxPeers: 10,
        maxRooms: 5,
        description: 'Test network manager'
      }
    };

    networkManager = new NetworkManager(config);
  });

  afterEach(() => {
    if (networkManager.isConnected) {
      networkManager.disconnect();
    }
  });

  describe('Constructor', () => {
    test('should create NetworkManager with correct configuration', () => {
      expect(networkManager.id).toBe('test-manager');
      expect(networkManager.name).toBe('Test Network Manager');
      expect(networkManager.config).toEqual(config);
      expect(networkManager.state).toBe(NetworkState.DISCONNECTED);
      expect(networkManager.isConnected).toBe(false);
    });

    test('should initialize with correct metadata', () => {
      expect(networkManager.metadata).toEqual(config.metadata);
    });
  });

  describe('Connection Management', () => {
    test('should connect to server successfully', async () => {
      const connectSpy = jest.spyOn(networkManager as any, '_wsClient', 'get').mockReturnValue({
        connect: jest.fn().mockResolvedValue(undefined),
        on: jest.fn()
      });

      await networkManager.connect();

      expect(connectSpy).toHaveBeenCalled();
      expect(networkManager.state).toBe(NetworkState.CONNECTED);
    });

    test('should handle connection errors', async () => {
      const mockError = new Error('Connection failed');
      jest.spyOn(networkManager as any, '_wsClient', 'get').mockReturnValue({
        connect: jest.fn().mockRejectedValue(mockError),
        on: jest.fn()
      });

      await expect(networkManager.connect()).rejects.toThrow('Connection failed');
      expect(networkManager.state).toBe(NetworkState.ERROR);
    });

    test('should disconnect from server', async () => {
      const disconnectSpy = jest.spyOn(networkManager as any, '_wsClient', 'get').mockReturnValue({
        disconnect: jest.fn().mockResolvedValue(undefined),
        on: jest.fn()
      });

      await networkManager.disconnect();

      expect(disconnectSpy).toHaveBeenCalled();
      expect(networkManager.state).toBe(NetworkState.DISCONNECTED);
    });

    test('should not connect if already connected', async () => {
      jest.spyOn(networkManager as any, '_wsClient', 'get').mockReturnValue({
        connect: jest.fn().mockResolvedValue(undefined),
        on: jest.fn()
      });

      await networkManager.connect();
      await networkManager.connect(); // Second call should not connect

      expect(networkManager.state).toBe(NetworkState.CONNECTED);
    });
  });

  describe('Message Handling', () => {
    let mockPeer: NetworkPeer;

    beforeEach(() => {
      mockPeer = new NetworkPeer({
        id: 'test-peer',
        name: 'Test Peer',
        status: 'online' as any
      });

      (networkManager as any)._peers.set('test-peer', mockPeer);
      (networkManager as any)._state = NetworkState.CONNECTED;
    });

    test('should send message to specific peer', async () => {
      const message = new NetworkMessage({
        type: 'test',
        data: { test: 'data' }
      });

      const sendSpy = jest.spyOn(networkManager as any, '_sendMessage').mockResolvedValue(undefined);

      await networkManager.sendMessage('test-peer', message);

      expect(sendSpy).toHaveBeenCalledWith(message, mockPeer);
    });

    test('should throw error when sending to non-existent peer', async () => {
      const message = new NetworkMessage({
        type: 'test',
        data: { test: 'data' }
      });

      await expect(networkManager.sendMessage('non-existent', message))
        .rejects.toThrow('Peer non-existent not found');
    });

    test('should throw error when not connected', async () => {
      (networkManager as any)._state = NetworkState.DISCONNECTED;

      const message = new NetworkMessage({
        type: 'test',
        data: { test: 'data' }
      });

      await expect(networkManager.sendMessage('test-peer', message))
        .rejects.toThrow('Not connected to network');
    });
  });

  describe('Room Management', () => {
    beforeEach(() => {
      (networkManager as any)._state = NetworkState.CONNECTED;
    });

    test('should create room successfully', async () => {
      const sendAndWaitSpy = jest.spyOn(networkManager as any, '_sendAndWaitResponse')
        .mockResolvedValue({
          type: 'room:created',
          data: {
            room: {
              id: 'test-room',
              name: 'Test Room',
              state: 'active',
              settings: { maxPeers: 10 }
            }
          }
        });

      const room = await networkManager.createRoom('Test Room', 10);

      expect(sendAndWaitSpy).toHaveBeenCalled();
      expect(room.id).toBe('test-room');
      expect(room.name).toBe('Test Room');
    });

    test('should join room successfully', async () => {
      const sendAndWaitSpy = jest.spyOn(networkManager as any, '_sendAndWaitResponse')
        .mockResolvedValue({
          type: 'room:joined',
          data: {
            room: {
              id: 'test-room',
              name: 'Test Room',
              state: 'active',
              settings: { maxPeers: 10 }
            },
            peers: []
          }
        });

      const room = await networkManager.joinRoom('test-room');

      expect(sendAndWaitSpy).toHaveBeenCalled();
      expect(room.id).toBe('test-room');
    });

    test('should leave room successfully', async () => {
      const room = new NetworkRoom({
        id: 'test-room',
        name: 'Test Room',
        state: 'active' as any,
        settings: { maxPeers: 10 } as any
      });

      (networkManager as any)._currentRoom = room;
      (networkManager as any)._rooms.set('test-room', room);

      const sendSpy = jest.spyOn(networkManager as any, '_sendMessage').mockResolvedValue(undefined);

      await networkManager.leaveRoom();

      expect(sendSpy).toHaveBeenCalled();
      expect(networkManager.getCurrentRoom()).toBeNull();
    });

    test('should throw error when creating room while disconnected', async () => {
      (networkManager as any)._state = NetworkState.DISCONNECTED;

      await expect(networkManager.createRoom('Test Room'))
        .rejects.toThrow('Not connected to network');
    });
  });

  describe('Peer Management', () => {
    test('should get peer by ID', () => {
      const peer = new NetworkPeer({
        id: 'test-peer',
        name: 'Test Peer',
        status: 'online' as any
      });

      (networkManager as any)._peers.set('test-peer', peer);

      const foundPeer = networkManager.getPeer('test-peer');
      expect(foundPeer).toBe(peer);
    });

    test('should get all peers', () => {
      const peer1 = new NetworkPeer({
        id: 'peer1',
        name: 'Peer 1',
        status: 'online' as any
      });

      const peer2 = new NetworkPeer({
        id: 'peer2',
        name: 'Peer 2',
        status: 'online' as any
      });

      (networkManager as any)._peers.set('peer1', peer1);
      (networkManager as any)._peers.set('peer2', peer2);

      const peers = networkManager.getPeers();
      expect(peers).toHaveLength(2);
      expect(peers).toContain(peer1);
      expect(peers).toContain(peer2);
    });

    test('should return null for non-existent peer', () => {
      const peer = networkManager.getPeer('non-existent');
      expect(peer).toBeNull();
    });
  });

  describe('Room Management', () => {
    test('should get room by ID', () => {
      const room = new NetworkRoom({
        id: 'test-room',
        name: 'Test Room',
        state: 'active' as any,
        settings: { maxPeers: 10 } as any
      });

      (networkManager as any)._rooms.set('test-room', room);

      const foundRoom = networkManager.getRoom('test-room');
      expect(foundRoom).toBe(room);
    });

    test('should get all rooms', () => {
      const room1 = new NetworkRoom({
        id: 'room1',
        name: 'Room 1',
        state: 'active' as any,
        settings: { maxPeers: 10 } as any
      });

      const room2 = new NetworkRoom({
        id: 'room2',
        name: 'Room 2',
        state: 'active' as any,
        settings: { maxPeers: 10 } as any
      });

      (networkManager as any)._rooms.set('room1', room1);
      (networkManager as any)._rooms.set('room2', room2);

      const rooms = networkManager.getRooms();
      expect(rooms).toHaveLength(2);
      expect(rooms).toContain(room1);
      expect(rooms).toContain(room2);
    });

    test('should return null for non-existent room', () => {
      const room = networkManager.getRoom('non-existent');
      expect(room).toBeNull();
    });
  });

  describe('Statistics', () => {
    test('should get network statistics', () => {
      const stats = networkManager.getStats();
      
      expect(stats).toHaveProperty('bytesSent');
      expect(stats).toHaveProperty('bytesReceived');
      expect(stats).toHaveProperty('messagesSent');
      expect(stats).toHaveProperty('messagesReceived');
      expect(stats).toHaveProperty('latency');
      expect(stats).toHaveProperty('packetLoss');
      expect(stats).toHaveProperty('connections');
      expect(stats).toHaveProperty('uptime');
    });

    test('should update uptime correctly', () => {
      const stats1 = networkManager.getStats();
      
      // Simulate time passing
      jest.advanceTimersByTime(1000);
      
      const stats2 = networkManager.getStats();
      expect(stats2.uptime).toBeGreaterThan(stats1.uptime);
    });
  });

  describe('Event Handling', () => {
    test('should emit connection events', () => {
      const eventSpy = jest.fn();
      networkManager.on('connection:established', eventSpy);

      // Simulate connection
      (networkManager as any)._onConnectionEstablished();

      expect(eventSpy).toHaveBeenCalledWith({
        manager: networkManager,
        peer: expect.any(Object)
      });
    });

    test('should emit peer events', () => {
      const peerJoinedSpy = jest.fn();
      const peerLeftSpy = jest.fn();

      networkManager.on('peer:joined', peerJoinedSpy);
      networkManager.on('peer:left', peerLeftSpy);

      const peer = new NetworkPeer({
        id: 'test-peer',
        name: 'Test Peer',
        status: 'online' as any
      });

      // Simulate peer joining
      (networkManager as any)._handlePeerJoined({
        type: 'peer:joined',
        data: { peer: peer.serialize(), roomId: 'test-room' }
      });

      expect(peerJoinedSpy).toHaveBeenCalled();

      // Simulate peer leaving
      (networkManager as any)._handlePeerLeft({
        type: 'peer:left',
        data: { peerId: 'test-peer' }
      });

      expect(peerLeftSpy).toHaveBeenCalled();
    });
  });

  describe('Error Handling', () => {
    test('should handle network errors', () => {
      const errorSpy = jest.fn();
      networkManager.on('error:network', errorSpy);

      const error = new Error('Network error');
      (networkManager as any)._onConnectionError(error);

      expect(errorSpy).toHaveBeenCalledWith({
        manager: networkManager,
        error,
        context: 'connection'
      });
    });

    test('should handle message parsing errors', () => {
      const errorSpy = jest.fn();
      networkManager.on('error:network', errorSpy);

      // Simulate invalid message
      (networkManager as any)._onMessageReceived('invalid json');

      expect(errorSpy).toHaveBeenCalledWith({
        manager: networkManager,
        error: expect.any(Error),
        context: 'message_parsing'
      });
    });
  });

  describe('State Management', () => {
    test('should update state correctly', () => {
      expect(networkManager.state).toBe(NetworkState.DISCONNECTED);

      (networkManager as any)._setState(NetworkState.CONNECTING);
      expect(networkManager.state).toBe(NetworkState.CONNECTING);

      (networkManager as any)._setState(NetworkState.CONNECTED);
      expect(networkManager.state).toBe(NetworkState.CONNECTED);
    });

    test('should provide correct state checks', () => {
      expect(networkManager.isConnected).toBe(false);
      expect(networkManager.isConnecting).toBe(false);
      expect(networkManager.isReconnecting).toBe(false);

      (networkManager as any)._setState(NetworkState.CONNECTED);
      expect(networkManager.isConnected).toBe(true);

      (networkManager as any)._setState(NetworkState.CONNECTING);
      expect(networkManager.isConnecting).toBe(true);

      (networkManager as any)._setState(NetworkState.RECONNECTING);
      expect(networkManager.isReconnecting).toBe(true);
    });
  });
}); 
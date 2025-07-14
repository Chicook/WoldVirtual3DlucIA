/**
 * Tests para NetworkPeer
 */

import { NetworkPeer } from '../NetworkPeer';
import { PeerStatus, PeerType, MessageStatus } from '../NetworkPeer';
import { NetworkMessage } from '../NetworkMessage';

describe('NetworkPeer', () => {
  let peerData: any;

  beforeEach(() => {
    peerData = {
      id: 'peer-123',
      name: 'Test Peer',
      status: PeerStatus.ONLINE,
      metadata: {
        version: '1.0.0',
        platform: 'web',
        client: 'editor3d',
        userId: 'user-123',
        sessionId: 'session-456',
        avatar: 'avatar.png',
        description: 'Test peer description',
        tags: ['user', 'active']
      },
      capabilities: {
        canEdit: true,
        canView: true,
        canSync: true,
        canBroadcast: true,
        maxMessageSize: 1024 * 1024,
        supportedFeatures: ['chat', 'sync', 'file-sharing']
      },
      stats: {
        bytesSent: 1000,
        bytesReceived: 2000,
        messagesSent: 10,
        messagesReceived: 20,
        latency: 50,
        packetLoss: 0.1,
        lastSeen: Date.now(),
        uptime: 3600000
      }
    };
  });

  describe('Constructor', () => {
    test('should create peer with basic data', () => {
      const peer = new NetworkPeer(peerData);

      expect(peer.id).toBe('peer-123');
      expect(peer.name).toBe('Test Peer');
      expect(peer.status).toBe(PeerStatus.ONLINE);
      expect(peer.metadata).toEqual(peerData.metadata);
      expect(peer.capabilities).toEqual(peerData.capabilities);
      expect(peer.type).toBe(PeerType.USER);
    });

    test('should use default values when not provided', () => {
      const minimalData = {
        id: 'peer-123',
        name: 'Test Peer',
        status: PeerStatus.ONLINE
      };

      const peer = new NetworkPeer(minimalData);

      expect(peer.metadata.version).toBe('1.0.0');
      expect(peer.metadata.platform).toBe('unknown');
      expect(peer.metadata.client).toBe('unknown');
      expect(peer.capabilities.canEdit).toBe(true);
      expect(peer.capabilities.canView).toBe(true);
      expect(peer.capabilities.canSync).toBe(true);
      expect(peer.capabilities.canBroadcast).toBe(true);
      expect(peer.capabilities.maxMessageSize).toBe(1024 * 1024);
      expect(peer.capabilities.supportedFeatures).toEqual([]);
    });

    test('should determine peer type correctly', () => {
      // Test admin type
      const adminData = {
        ...peerData,
        metadata: { ...peerData.metadata, tags: ['admin'] }
      };
      const adminPeer = new NetworkPeer(adminData);
      expect(adminPeer.type).toBe(PeerType.ADMIN);

      // Test bot type
      const botData = {
        ...peerData,
        metadata: { ...peerData.metadata, tags: ['bot'] }
      };
      const botPeer = new NetworkPeer(botData);
      expect(botPeer.type).toBe(PeerType.BOT);

      // Test system type
      const systemData = {
        ...peerData,
        metadata: { ...peerData.metadata, tags: ['system'] }
      };
      const systemPeer = new NetworkPeer(systemData);
      expect(systemPeer.type).toBe(PeerType.SYSTEM);

      // Test user type (default)
      const userPeer = new NetworkPeer(peerData);
      expect(userPeer.type).toBe(PeerType.USER);
    });
  });

  describe('Connection Management', () => {
    test('should connect peer', () => {
      const peer = new NetworkPeer({
        id: 'peer-123',
        name: 'Test Peer',
        status: PeerStatus.OFFLINE
      });

      const statusChangedSpy = jest.fn();
      peer.on('status:changed', statusChangedSpy);

      peer.connect();

      expect(peer.status).toBe(PeerStatus.ONLINE);
      expect(peer.isOnline).toBe(true);
      expect(peer.isOffline).toBe(false);
      expect(statusChangedSpy).toHaveBeenCalledWith({
        peer,
        oldStatus: PeerStatus.OFFLINE,
        newStatus: PeerStatus.ONLINE
      });
    });

    test('should not connect if already online', () => {
      const peer = new NetworkPeer(peerData);
      const statusChangedSpy = jest.fn();
      peer.on('status:changed', statusChangedSpy);

      peer.connect();

      expect(statusChangedSpy).toHaveBeenCalledTimes(0);
    });

    test('should disconnect peer', () => {
      const peer = new NetworkPeer(peerData);
      const statusChangedSpy = jest.fn();
      const disconnectedSpy = jest.fn();
      peer.on('status:changed', statusChangedSpy);
      peer.on('disconnected', disconnectedSpy);

      peer.disconnect('Test disconnect');

      expect(peer.status).toBe(PeerStatus.OFFLINE);
      expect(peer.isOnline).toBe(false);
      expect(peer.isOffline).toBe(true);
      expect(statusChangedSpy).toHaveBeenCalledWith({
        peer,
        oldStatus: PeerStatus.ONLINE,
        newStatus: PeerStatus.OFFLINE
      });
      expect(disconnectedSpy).toHaveBeenCalledWith({
        peer,
        reason: 'Test disconnect'
      });
    });

    test('should not disconnect if already offline', () => {
      const peer = new NetworkPeer({
        id: 'peer-123',
        name: 'Test Peer',
        status: PeerStatus.OFFLINE
      });

      const statusChangedSpy = jest.fn();
      peer.on('status:changed', statusChangedSpy);

      peer.disconnect();

      expect(statusChangedSpy).toHaveBeenCalledTimes(0);
    });
  });

  describe('Message Handling', () => {
    test('should send message successfully', async () => {
      const peer = new NetworkPeer(peerData);
      const message = new NetworkMessage({
        type: 'test',
        data: { test: 'data' }
      });

      const messageSentSpy = jest.fn();
      peer.on('message:sent', messageSentSpy);

      await peer.sendMessage(message);

      expect(messageSentSpy).toHaveBeenCalledWith({
        peer,
        message
      });
      expect(peer.stats.messagesSent).toBe(11); // Incremented from 10
      expect(peer.stats.bytesSent).toBeGreaterThan(1000); // Incremented
    });

    test('should throw error when sending to offline peer', async () => {
      const peer = new NetworkPeer({
        id: 'peer-123',
        name: 'Test Peer',
        status: PeerStatus.OFFLINE
      });

      const message = new NetworkMessage({
        type: 'test',
        data: { test: 'data' }
      });

      await expect(peer.sendMessage(message))
        .rejects.toThrow('Peer peer-123 is not online');
    });

    test('should throw error when message is too large', async () => {
      const peer = new NetworkPeer({
        ...peerData,
        capabilities: { ...peerData.capabilities, maxMessageSize: 10 }
      });

      const message = new NetworkMessage({
        type: 'test',
        data: { test: 'this message is too large for the peer capabilities' }
      });

      await expect(peer.sendMessage(message))
        .rejects.toThrow('Message too large for peer capabilities');
    });

    test('should receive message', () => {
      const peer = new NetworkPeer(peerData);
      const message = new NetworkMessage({
        type: 'test',
        data: { test: 'data' }
      });

      const messageReceivedSpy = jest.fn();
      peer.on('message:received', messageReceivedSpy);

      peer.receiveMessage(message);

      expect(messageReceivedSpy).toHaveBeenCalledWith({
        peer,
        message
      });
      expect(peer.stats.messagesReceived).toBe(21); // Incremented from 20
      expect(peer.stats.bytesReceived).toBeGreaterThan(2000); // Incremented
    });
  });

  describe('Ping/Pong', () => {
    test('should send ping', () => {
      const peer = new NetworkPeer(peerData);
      const sendSpy = jest.spyOn(peer, 'sendMessage').mockResolvedValue();

      peer.ping();

      expect(sendSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'ping',
          data: expect.objectContaining({ timestamp: expect.any(Number) })
        })
      );
    });

    test('should not send ping when offline', () => {
      const peer = new NetworkPeer({
        id: 'peer-123',
        name: 'Test Peer',
        status: PeerStatus.OFFLINE
      });

      const sendSpy = jest.spyOn(peer, 'sendMessage');

      peer.ping();

      expect(sendSpy).not.toHaveBeenCalled();
    });

    test('should process pong', () => {
      const peer = new NetworkPeer(peerData);
      const timestamp = Date.now();

      const latencyUpdatedSpy = jest.fn();
      peer.on('latency:updated', latencyUpdatedSpy);

      peer.pong(timestamp);

      expect(latencyUpdatedSpy).toHaveBeenCalledWith({
        peer,
        latency: expect.any(Number)
      });
      expect(peer.latency).toBeGreaterThan(0);
    });
  });

  describe('Status Management', () => {
    test('should update status', () => {
      const peer = new NetworkPeer(peerData);
      const statusChangedSpy = jest.fn();
      peer.on('status:changed', statusChangedSpy);

      peer.updateStatus(PeerStatus.BUSY);

      expect(peer.status).toBe(PeerStatus.BUSY);
      expect(statusChangedSpy).toHaveBeenCalledWith({
        peer,
        oldStatus: PeerStatus.ONLINE,
        newStatus: PeerStatus.BUSY
      });
    });

    test('should not emit event when status is the same', () => {
      const peer = new NetworkPeer(peerData);
      const statusChangedSpy = jest.fn();
      peer.on('status:changed', statusChangedSpy);

      peer.updateStatus(PeerStatus.ONLINE);

      expect(statusChangedSpy).not.toHaveBeenCalled();
    });
  });

  describe('Statistics', () => {
    test('should update stats', () => {
      const peer = new NetworkPeer(peerData);
      const newStats = {
        bytesSent: 5000,
        messagesSent: 50,
        latency: 100
      };

      peer.updateStats(newStats);

      expect(peer.stats.bytesSent).toBe(5000);
      expect(peer.stats.messagesSent).toBe(50);
      expect(peer.stats.latency).toBe(100);
    });

    test('should merge stats correctly', () => {
      const peer = new NetworkPeer(peerData);
      const originalBytesSent = peer.stats.bytesSent;

      peer.updateStats({ latency: 75 });

      expect(peer.stats.bytesSent).toBe(originalBytesSent); // Unchanged
      expect(peer.stats.latency).toBe(75); // Updated
    });
  });

  describe('Activity Tracking', () => {
    test('should check if peer is active', () => {
      const peer = new NetworkPeer(peerData);

      expect(peer.isActive()).toBe(true);

      // Simulate old last seen
      peer.updateStats({ lastSeen: Date.now() - 60000 }); // 1 minute ago

      expect(peer.isActive()).toBe(false);
    });

    test('should check if peer can receive messages', () => {
      const peer = new NetworkPeer(peerData);

      expect(peer.canReceiveMessages()).toBe(true);

      peer.updateStatus(PeerStatus.OFFLINE);
      expect(peer.canReceiveMessages()).toBe(false);

      peer.updateStatus(PeerStatus.ONLINE);
      peer.updateStats({ lastSeen: Date.now() - 60000 }); // Inactive
      expect(peer.canReceiveMessages()).toBe(false);
    });

    test('should check if peer can send messages', () => {
      const peer = new NetworkPeer(peerData);

      expect(peer.canSendMessages()).toBe(true);

      peer.updateStatus(PeerStatus.OFFLINE);
      expect(peer.canSendMessages()).toBe(false);

      peer.updateStatus(PeerStatus.ONLINE);
      peer.updateStats({ lastSeen: Date.now() - 60000 }); // Inactive
      expect(peer.canSendMessages()).toBe(false);
    });
  });

  describe('Time Tracking', () => {
    test('should calculate uptime', () => {
      const peer = new NetworkPeer(peerData);
      peer.connect();

      const uptime = peer.getUptime();
      expect(uptime).toBeGreaterThan(0);

      peer.disconnect();
      const finalUptime = peer.getUptime();
      expect(finalUptime).toBeGreaterThan(0);
    });

    test('should calculate time since last activity', () => {
      const peer = new NetworkPeer(peerData);
      const timeSinceActivity = peer.getTimeSinceLastActivity();

      expect(timeSinceActivity).toBeGreaterThanOrEqual(0);
      expect(timeSinceActivity).toBeLessThan(1000); // Should be recent
    });
  });

  describe('Message Queue', () => {
    test('should manage message queue', () => {
      const peer = new NetworkPeer(peerData);

      expect(peer.getQueueSize()).toBe(0);

      // Add messages to queue (when offline)
      peer.updateStatus(PeerStatus.OFFLINE);
      const message = new NetworkMessage({ type: 'test', data: {} });

      peer.sendMessage(message).catch(() => {}); // Ignore error
      expect(peer.getQueueSize()).toBe(1);

      peer.sendMessage(message).catch(() => {}); // Ignore error
      expect(peer.getQueueSize()).toBe(2);

      peer.clearQueue();
      expect(peer.getQueueSize()).toBe(0);
    });

    test('should limit queue size', () => {
      const peer = new NetworkPeer({
        ...peerData,
        capabilities: { ...peerData.capabilities, maxMessageSize: 10 }
      });

      peer.updateStatus(PeerStatus.OFFLINE);

      // Add more messages than max queue size
      for (let i = 0; i < 150; i++) {
        const message = new NetworkMessage({ type: 'test', data: {} });
        peer.sendMessage(message).catch(() => {}); // Ignore error
      }

      expect(peer.getQueueSize()).toBeLessThanOrEqual(100); // Max queue size
    });

    test('should get queued messages', () => {
      const peer = new NetworkPeer(peerData);
      peer.updateStatus(PeerStatus.OFFLINE);

      const message = new NetworkMessage({ type: 'test', data: { test: 'data' } });
      peer.sendMessage(message).catch(() => {}); // Ignore error

      const queuedMessages = peer.getQueuedMessages();
      expect(queuedMessages).toHaveLength(1);
      expect(queuedMessages[0].data).toEqual({ test: 'data' });
    });
  });

  describe('Serialization', () => {
    test('should serialize peer correctly', () => {
      const peer = new NetworkPeer(peerData);
      peer.connect();

      const serialized = peer.serialize();

      expect(serialized.id).toBe(peer.id);
      expect(serialized.name).toBe(peer.name);
      expect(serialized.status).toBe(peer.status);
      expect(serialized.metadata).toEqual(peer.metadata);
      expect(serialized.capabilities).toEqual(peer.capabilities);
      expect(serialized.type).toBe(peer.type);
      expect(serialized.stats).toEqual(peer.stats);
      expect(serialized.connectedAt).toBeDefined();
      expect(serialized.disconnectedAt).toBeUndefined();
    });

    test('should deserialize peer correctly', () => {
      const original = new NetworkPeer(peerData);
      original.connect();

      const serialized = original.serialize();
      const deserialized = NetworkPeer.deserialize(serialized);

      expect(deserialized.id).toBe(original.id);
      expect(deserialized.name).toBe(original.name);
      expect(deserialized.status).toBe(original.status);
      expect(deserialized.metadata).toEqual(original.metadata);
      expect(deserialized.capabilities).toEqual(original.capabilities);
      expect(deserialized.type).toBe(original.type);
      expect(deserialized.stats).toEqual(original.stats);
    });
  });

  describe('Getters', () => {
    test('should provide correct getters', () => {
      const peer = new NetworkPeer(peerData);

      expect(peer.status).toBe(PeerStatus.ONLINE);
      expect(peer.stats).toEqual(peerData.stats);
      expect(peer.isOnline).toBe(true);
      expect(peer.isOffline).toBe(false);
      expect(peer.isConnecting).toBe(false);
      expect(peer.latency).toBe(50);
      expect(peer.lastSeen).toBe(peerData.stats.lastSeen);
      expect(peer.uptime).toBeGreaterThan(0);
      expect(peer.messageCount).toBe(30); // messagesSent + messagesReceived
      expect(peer.bytesTransferred).toBe(3000); // bytesSent + bytesReceived
    });
  });
}); 
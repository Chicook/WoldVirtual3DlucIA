/**
 * Tests para NetworkMessage
 */

import { NetworkMessage } from '../NetworkMessage';
import { MessageCategory, MessageStatus, MessagePriority } from '../NetworkMessage';

describe('NetworkMessage', () => {
  let messageData: any;

  beforeEach(() => {
    messageData = {
      type: 'test',
      data: { test: 'data' },
      from: 'sender-123',
      to: 'receiver-456',
      roomId: 'room-789',
      priority: 1
    };
  });

  describe('Constructor', () => {
    test('should create message with basic data', () => {
      const message = new NetworkMessage(messageData);

      expect(message.type).toBe('test');
      expect(message.data).toEqual({ test: 'data' });
      expect(message.from).toBe('sender-123');
      expect(message.to).toBe('receiver-456');
      expect(message.roomId).toBe('room-789');
      expect(message.priority).toBe(1);
      expect(message.id).toBeDefined();
      expect(message.timestamp).toBeDefined();
      expect(message.status).toBe(MessageStatus.PENDING);
    });

    test('should generate unique ID if not provided', () => {
      const message1 = new NetworkMessage(messageData);
      const message2 = new NetworkMessage(messageData);

      expect(message1.id).not.toBe(message2.id);
    });

    test('should use provided ID if available', () => {
      const customId = 'custom-message-id';
      const message = new NetworkMessage({
        ...messageData,
        id: customId
      });

      expect(message.id).toBe(customId);
    });

    test('should use current timestamp if not provided', () => {
      const before = Date.now();
      const message = new NetworkMessage(messageData);
      const after = Date.now();

      expect(message.timestamp).toBeGreaterThanOrEqual(before);
      expect(message.timestamp).toBeLessThanOrEqual(after);
    });

    test('should use provided timestamp', () => {
      const customTimestamp = 1234567890;
      const message = new NetworkMessage({
        ...messageData,
        timestamp: customTimestamp
      });

      expect(message.timestamp).toBe(customTimestamp);
    });

    test('should set default priority to 1', () => {
      const message = new NetworkMessage({
        type: 'test',
        data: { test: 'data' }
      });

      expect(message.priority).toBe(1);
    });

    test('should initialize with default metadata', () => {
      const message = new NetworkMessage(messageData);

      expect(message.metadata.version).toBe('1.0.0');
      expect(message.metadata.source).toBe('editor3d');
    });

    test('should merge provided metadata', () => {
      const customMetadata = {
        version: '2.0.0',
        source: 'custom',
        userId: 'user-123'
      };

      const message = new NetworkMessage({
        ...messageData,
        metadata: customMetadata
      });

      expect(message.metadata.version).toBe('2.0.0');
      expect(message.metadata.source).toBe('custom');
      expect(message.metadata.userId).toBe('user-123');
    });
  });

  describe('Status Management', () => {
    test('should mark message as sent', () => {
      const message = new NetworkMessage(messageData);

      message.markAsSent();

      expect(message.status).toBe(MessageStatus.SENT);
      expect(message.sentAt).toBeDefined();
    });

    test('should mark message as delivered', () => {
      const message = new NetworkMessage(messageData);

      message.markAsDelivered();

      expect(message.status).toBe(MessageStatus.DELIVERED);
      expect(message.deliveredAt).toBeDefined();
    });

    test('should mark message as read', () => {
      const message = new NetworkMessage(messageData);

      message.markAsRead();

      expect(message.status).toBe(MessageStatus.READ);
      expect(message.readAt).toBeDefined();
    });

    test('should mark message as failed', () => {
      const message = new NetworkMessage(messageData);

      message.markAsFailed();

      expect(message.status).toBe(MessageStatus.FAILED);
    });

    test('should mark message as expired', () => {
      const message = new NetworkMessage(messageData);

      message.markAsExpired();

      expect(message.status).toBe(MessageStatus.EXPIRED);
    });
  });

  describe('Retry Management', () => {
    test('should increment retry count', () => {
      const message = new NetworkMessage(messageData);

      expect(message.retryCount).toBe(0);

      message.incrementRetryCount();
      expect(message.retryCount).toBe(1);

      message.incrementRetryCount();
      expect(message.retryCount).toBe(2);
    });

    test('should check if message can be retried', () => {
      const message = new NetworkMessage(messageData);

      expect(message.canRetry()).toBe(true);

      // Mark as delivered
      message.markAsDelivered();
      expect(message.canRetry()).toBe(false);

      // Reset and test max retries
      message.markAsFailed();
      for (let i = 0; i < 3; i++) {
        message.incrementRetryCount();
      }
      expect(message.canRetry()).toBe(false);
    });
  });

  describe('Expiration', () => {
    test('should check if message is expired', () => {
      const message = new NetworkMessage(messageData);

      expect(message.isExpired()).toBe(false);

      // Add expiration metadata
      const expiredMessage = new NetworkMessage({
        ...messageData,
        metadata: {
          expiresAt: Date.now() - 1000 // Expired 1 second ago
        }
      });

      expect(expiredMessage.isExpired()).toBe(true);
    });
  });

  describe('Latency and Response Time', () => {
    test('should calculate latency', () => {
      const message = new NetworkMessage(messageData);

      message.markAsSent();
      const sentTime = message.sentAt!;

      // Simulate delivery after 100ms
      setTimeout(() => {
        message.markAsDelivered();
      }, 100);

      // Wait for delivery
      return new Promise(resolve => {
        setTimeout(() => {
          const latency = message.getLatency();
          expect(latency).toBeGreaterThan(0);
          expect(latency).toBeLessThan(200); // Allow some tolerance
          resolve(undefined);
        }, 150);
      });
    });

    test('should calculate response time', () => {
      const message = new NetworkMessage(messageData);

      message.markAsSent();
      const sentTime = message.sentAt!;

      // Simulate read after 200ms
      setTimeout(() => {
        message.markAsRead();
      }, 200);

      // Wait for read
      return new Promise(resolve => {
        setTimeout(() => {
          const responseTime = message.getResponseTime();
          expect(responseTime).toBeGreaterThan(0);
          expect(responseTime).toBeLessThan(300); // Allow some tolerance
          resolve(undefined);
        }, 250);
      });
    });

    test('should return null for latency when not delivered', () => {
      const message = new NetworkMessage(messageData);

      message.markAsSent();
      expect(message.getLatency()).toBeNull();
    });

    test('should return null for response time when not read', () => {
      const message = new NetworkMessage(messageData);

      message.markAsSent();
      expect(message.getResponseTime()).toBeNull();
    });
  });

  describe('Response Creation', () => {
    test('should create response message', () => {
      const originalMessage = new NetworkMessage(messageData);
      const responseData = { status: 'ok' };

      const response = originalMessage.createResponse('response', responseData);

      expect(response.type).toBe('response');
      expect(response.data).toEqual(responseData);
      expect(response.from).toBe(originalMessage.to);
      expect(response.to).toBe(originalMessage.from);
      expect(response.roomId).toBe(originalMessage.roomId);
      expect(response.correlationId).toBe(originalMessage.id);
    });

    test('should create ACK message', () => {
      const originalMessage = new NetworkMessage(messageData);

      const ack = originalMessage.createAck();

      expect(ack.type).toBe('ack');
      expect(ack.data.originalId).toBe(originalMessage.id);
    });

    test('should create error message', () => {
      const originalMessage = new NetworkMessage(messageData);
      const error = 'Something went wrong';
      const code = 500;

      const errorMessage = originalMessage.createError(error, code);

      expect(errorMessage.type).toBe('error');
      expect(errorMessage.data.originalId).toBe(originalMessage.id);
      expect(errorMessage.data.error).toBe(error);
      expect(errorMessage.data.code).toBe(code);
    });
  });

  describe('Cloning', () => {
    test('should clone message correctly', () => {
      const original = new NetworkMessage(messageData);
      original.markAsSent();

      const clone = original.clone();

      expect(clone.id).toBe(original.id);
      expect(clone.type).toBe(original.type);
      expect(clone.data).toEqual(original.data);
      expect(clone.from).toBe(original.from);
      expect(clone.to).toBe(original.to);
      expect(clone.roomId).toBe(original.roomId);
      expect(clone.timestamp).toBe(original.timestamp);
      expect(clone.priority).toBe(original.priority);
      expect(clone.correlationId).toBe(original.correlationId);
      expect(clone.metadata).toEqual(original.metadata);
    });
  });

  describe('Serialization', () => {
    test('should serialize message correctly', () => {
      const message = new NetworkMessage(messageData);
      message.markAsSent();

      const serialized = message.serialize();
      const parsed = JSON.parse(serialized);

      expect(parsed.id).toBe(message.id);
      expect(parsed.type).toBe(message.type);
      expect(parsed.data).toEqual(message.data);
      expect(parsed.from).toBe(message.from);
      expect(parsed.to).toBe(message.to);
      expect(parsed.roomId).toBe(message.roomId);
      expect(parsed.timestamp).toBe(message.timestamp);
      expect(parsed.priority).toBe(message.priority);
      expect(parsed.correlationId).toBe(message.correlationId);
      expect(parsed.metadata).toEqual(message.metadata);
      expect(parsed.status).toBe(message.status);
      expect(parsed.retryCount).toBe(message.retryCount);
    });

    test('should deserialize message correctly', () => {
      const original = new NetworkMessage(messageData);
      original.markAsSent();
      original.incrementRetryCount();

      const serialized = original.serialize();
      const deserialized = NetworkMessage.deserialize(serialized);

      expect(deserialized.id).toBe(original.id);
      expect(deserialized.type).toBe(original.type);
      expect(deserialized.data).toEqual(original.data);
      expect(deserialized.from).toBe(original.from);
      expect(deserialized.to).toBe(original.to);
      expect(deserialized.roomId).toBe(original.roomId);
      expect(deserialized.timestamp).toBe(original.timestamp);
      expect(deserialized.priority).toBe(original.priority);
      expect(deserialized.correlationId).toBe(original.correlationId);
      expect(deserialized.metadata).toEqual(original.metadata);
      expect(deserialized.status).toBe(original.status);
      expect(deserialized.retryCount).toBe(original.retryCount);
    });
  });

  describe('Static Factory Methods', () => {
    test('should create system message', () => {
      const systemMessage = NetworkMessage.createSystemMessage('system:test', { data: 'test' });

      expect(systemMessage.type).toBe('system:test');
      expect(systemMessage.data).toEqual({ data: 'test' });
      expect(systemMessage.priority).toBe(3); // CRITICAL
      expect(systemMessage.metadata.source).toBe('system');
      expect(systemMessage.metadata.tags).toContain('system');
    });

    test('should create user message', () => {
      const userId = 'user-123';
      const userMessage = NetworkMessage.createUserMessage('user:action', { action: 'test' }, userId);

      expect(userMessage.type).toBe('user:action');
      expect(userMessage.data).toEqual({ action: 'test' });
      expect(userMessage.priority).toBe(1); // NORMAL
      expect(userMessage.metadata.source).toBe('user');
      expect(userMessage.metadata.userId).toBe(userId);
      expect(userMessage.metadata.tags).toContain('user');
    });

    test('should create sync message', () => {
      const syncId = 'sync-123';
      const syncMessage = NetworkMessage.createSyncMessage('sync:data', { data: 'test' }, syncId);

      expect(syncMessage.type).toBe('sync:data');
      expect(syncMessage.data).toEqual({ data: 'test' });
      expect(syncMessage.priority).toBe(2); // HIGH
      expect(syncMessage.metadata.source).toBe('sync');
      expect(syncMessage.metadata.tags).toContain('sync');
      expect(syncMessage.metadata.tags).toContain(syncId);
    });

    test('should create control message', () => {
      const controlMessage = NetworkMessage.createControlMessage('control:command', { command: 'test' });

      expect(controlMessage.type).toBe('control:command');
      expect(controlMessage.data).toEqual({ command: 'test' });
      expect(controlMessage.priority).toBe(2); // HIGH
      expect(controlMessage.metadata.source).toBe('control');
      expect(controlMessage.metadata.tags).toContain('control');
    });

    test('should create error message', () => {
      const error = 'Test error';
      const code = 500;
      const originalId = 'msg-123';

      const errorMessage = NetworkMessage.createErrorMessage(error, code, originalId);

      expect(errorMessage.type).toBe('error');
      expect(errorMessage.data.error).toBe(error);
      expect(errorMessage.data.code).toBe(code);
      expect(errorMessage.data.originalId).toBe(originalId);
      expect(errorMessage.priority).toBe(3); // CRITICAL
      expect(errorMessage.metadata.source).toBe('system');
      expect(errorMessage.metadata.tags).toContain('error');
    });
  });

  describe('Category Detection', () => {
    test('should detect system category', () => {
      const systemMessage = NetworkMessage.createSystemMessage('test', {});
      expect(systemMessage.category).toBe(MessageCategory.SYSTEM);
    });

    test('should detect sync category', () => {
      const syncMessage = NetworkMessage.createSyncMessage('test', {}, 'sync-123');
      expect(syncMessage.category).toBe(MessageCategory.SYNC);
    });

    test('should detect control category', () => {
      const controlMessage = NetworkMessage.createControlMessage('test', {});
      expect(controlMessage.category).toBe(MessageCategory.CONTROL);
    });

    test('should detect error category', () => {
      const errorMessage = NetworkMessage.createErrorMessage('test');
      expect(errorMessage.category).toBe(MessageCategory.ERROR);
    });

    test('should default to user category', () => {
      const userMessage = new NetworkMessage({ type: 'test', data: {} });
      expect(userMessage.category).toBe(MessageCategory.USER);
    });
  });

  describe('Getters', () => {
    test('should provide correct getters', () => {
      const message = new NetworkMessage(messageData);

      expect(message.status).toBe(MessageStatus.PENDING);
      expect(message.retryCount).toBe(0);
      expect(message.maxRetries).toBe(3);
      expect(message.createdAt).toBeDefined();
      expect(message.sentAt).toBeUndefined();
      expect(message.deliveredAt).toBeUndefined();
      expect(message.readAt).toBeUndefined();
      expect(message.category).toBe(MessageCategory.USER);
    });
  });
}); 
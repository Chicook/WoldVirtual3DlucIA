/**
 * Tests para NetworkRoom
 */

import { NetworkRoom } from '../NetworkRoom';
import { RoomState, RoomType } from '../NetworkRoom';
import { NetworkPeer } from '../NetworkPeer';

describe('NetworkRoom', () => {
  let roomData: any;
  let peer: NetworkPeer;

  beforeEach(() => {
    roomData = {
      id: 'room-123',
      name: 'Test Room',
      description: 'A test room for collaboration',
      state: RoomState.ACTIVE,
      settings: {
        maxPeers: 10,
        allowAnonymous: true,
        requireInvitation: false,
        allowChat: true,
        allowFileSharing: true,
        allowScreenSharing: true,
        allowVoiceChat: true,
        allowVideoChat: true,
        autoSave: true,
        saveInterval: 30000,
        permissions: {
          canInvite: true,
          canKick: true,
          canBan: true,
          canModifySettings: true,
          canDeleteRoom: true,
          canBroadcast: true,
          canPrivateMessage: true
        }
      },
      metadata: {
        category: 'collaboration',
        tags: ['public', 'active'],
        creator: 'user-123',
        createdAt: Date.now(),
        lastActivity: Date.now(),
        version: '1.0.0',
        features: ['chat', 'file-sharing', 'screen-sharing']
      },
      stats: {
        peerCount: 0,
        maxPeers: 10,
        messagesSent: 0,
        messagesReceived: 0,
        bytesSent: 0,
        bytesReceived: 0,
        uptime: 0,
        lastActivity: Date.now()
      }
    };

    peer = new NetworkPeer({
      id: 'peer-123',
      name: 'Test Peer',
      status: 'online' as any
    });
  });

  describe('Constructor', () => {
    test('should create room with basic data', () => {
      const room = new NetworkRoom(roomData);

      expect(room.id).toBe('room-123');
      expect(room.name).toBe('Test Room');
      expect(room.description).toBe('A test room for collaboration');
      expect(room.state).toBe(RoomState.ACTIVE);
      expect(room.settings).toEqual(roomData.settings);
      expect(room.metadata).toEqual(roomData.metadata);
      expect(room.type).toBe(RoomType.PUBLIC);
    });

    test('should use default values when not provided', () => {
      const minimalData = {
        id: 'room-123',
        name: 'Test Room',
        state: RoomState.ACTIVE,
        settings: { maxPeers: 10 } as any
      };

      const room = new NetworkRoom(minimalData);

      expect(room.description).toBe('');
      expect(room.metadata.category).toBe('general');
      expect(room.metadata.tags).toEqual([]);
      expect(room.metadata.creator).toBe('unknown');
      expect(room.metadata.version).toBe('1.0.0');
      expect(room.metadata.features).toEqual([]);
    });

    test('should determine room type correctly', () => {
      // Test public room
      const publicRoom = new NetworkRoom(roomData);
      expect(publicRoom.type).toBe(RoomType.PUBLIC);

      // Test private room
      const privateData = {
        ...roomData,
        metadata: { ...roomData.metadata, tags: ['private'] }
      };
      const privateRoom = new NetworkRoom(privateData);
      expect(privateRoom.type).toBe(RoomType.PRIVATE);

      // Test invite-only room
      const inviteData = {
        ...roomData,
        settings: { ...roomData.settings, requireInvitation: true }
      };
      const inviteRoom = new NetworkRoom(inviteData);
      expect(inviteRoom.type).toBe(RoomType.INVITE_ONLY);

      // Test password-protected room
      const passwordRoom = new NetworkRoom(roomData);
      (passwordRoom as any)._password = 'secret';
      expect(passwordRoom.type).toBe(RoomType.PASSWORD_PROTECTED);
    });
  });

  describe('Peer Management', () => {
    test('should add peer successfully', () => {
      const room = new NetworkRoom(roomData);
      const peerJoinedSpy = jest.fn();
      room.on('peer:joined', peerJoinedSpy);

      const result = room.addPeer(peer);

      expect(result).toBe(true);
      expect(room.peerCount).toBe(1);
      expect(room.getPeers()).toContain(peer);
      expect(room.hasPeer(peer.id)).toBe(true);
      expect(peerJoinedSpy).toHaveBeenCalledWith({
        room,
        peer
      });
    });

    test('should not add peer when room is full', () => {
      const room = new NetworkRoom({
        ...roomData,
        settings: { ...roomData.settings, maxPeers: 1 }
      });

      const peer1 = new NetworkPeer({
        id: 'peer-1',
        name: 'Peer 1',
        status: 'online' as any
      });

      const peer2 = new NetworkPeer({
        id: 'peer-2',
        name: 'Peer 2',
        status: 'online' as any
      });

      room.addPeer(peer1);
      const result = room.addPeer(peer2);

      expect(result).toBe(false);
      expect(room.peerCount).toBe(1);
    });

    test('should not add banned peer', () => {
      const room = new NetworkRoom(roomData);
      (room as any)._bannedPeers.add(peer.id);

      const result = room.addPeer(peer);

      expect(result).toBe(false);
      expect(room.peerCount).toBe(0);
    });

    test('should not add peer when invitation required', () => {
      const room = new NetworkRoom({
        ...roomData,
        settings: { ...roomData.settings, requireInvitation: true }
      });

      const result = room.addPeer(peer);

      expect(result).toBe(false);
      expect(room.peerCount).toBe(0);
    });

    test('should add invited peer', () => {
      const room = new NetworkRoom({
        ...roomData,
        settings: { ...roomData.settings, requireInvitation: true }
      });

      room.invitePeer(peer.id);
      const result = room.addPeer(peer);

      expect(result).toBe(true);
      expect(room.peerCount).toBe(1);
    });

    test('should remove peer successfully', () => {
      const room = new NetworkRoom(roomData);
      room.addPeer(peer);

      const peerLeftSpy = jest.fn();
      room.on('peer:left', peerLeftSpy);

      const result = room.removePeer(peer.id, 'Test removal');

      expect(result).toBe(true);
      expect(room.peerCount).toBe(0);
      expect(room.hasPeer(peer.id)).toBe(false);
      expect(peerLeftSpy).toHaveBeenCalledWith({
        room,
        peer,
        reason: 'Test removal'
      });
    });

    test('should not remove non-existent peer', () => {
      const room = new NetworkRoom(roomData);

      const result = room.removePeer('non-existent');

      expect(result).toBe(false);
    });

    test('should ban peer', () => {
      const room = new NetworkRoom(roomData);
      room.addPeer(peer);

      const result = room.banPeer(peer.id, 'Test ban');

      expect(result).toBe(true);
      expect(room.isPeerBanned(peer.id)).toBe(true);
      expect(room.getBannedPeers()).toContain(peer.id);
    });

    test('should not ban peer without permission', () => {
      const room = new NetworkRoom({
        ...roomData,
        settings: {
          ...roomData.settings,
          permissions: { ...roomData.settings.permissions, canBan: false }
        }
      });

      const result = room.banPeer(peer.id);

      expect(result).toBe(false);
    });

    test('should unban peer', () => {
      const room = new NetworkRoom(roomData);
      room.banPeer(peer.id);

      const result = room.unbanPeer(peer.id);

      expect(result).toBe(true);
      expect(room.isPeerBanned(peer.id)).toBe(false);
    });

    test('should not unban peer without permission', () => {
      const room = new NetworkRoom({
        ...roomData,
        settings: {
          ...roomData.settings,
          permissions: { ...roomData.settings.permissions, canBan: false }
        }
      });

      const result = room.unbanPeer(peer.id);

      expect(result).toBe(false);
    });
  });

  describe('Invitation Management', () => {
    test('should invite peer', () => {
      const room = new NetworkRoom(roomData);

      const result = room.invitePeer(peer.id);

      expect(result).toBe(true);
      expect(room.isPeerInvited(peer.id)).toBe(true);
      expect(room.getInvitations()).toContain(peer.id);
    });

    test('should not invite peer without permission', () => {
      const room = new NetworkRoom({
        ...roomData,
        settings: {
          ...roomData.settings,
          permissions: { ...roomData.settings.permissions, canInvite: false }
        }
      });

      const result = room.invitePeer(peer.id);

      expect(result).toBe(false);
    });

    test('should remove invitation', () => {
      const room = new NetworkRoom(roomData);
      room.invitePeer(peer.id);

      const result = room.removeInvitation(peer.id);

      expect(result).toBe(true);
      expect(room.isPeerInvited(peer.id)).toBe(false);
    });
  });

  describe('Message Handling', () => {
    test('should broadcast message', () => {
      const room = new NetworkRoom(roomData);
      const sender = new NetworkPeer({
        id: 'sender',
        name: 'Sender',
        status: 'online' as any
      });
      const receiver = new NetworkPeer({
        id: 'receiver',
        name: 'Receiver',
        status: 'online' as any
      });

      room.addPeer(sender);
      room.addPeer(receiver);

      const message = { type: 'test', data: 'hello' };
      const broadcastSpy = jest.fn();
      room.on('message:broadcast', broadcastSpy);

      room.broadcastMessage(message, sender);

      expect(broadcastSpy).toHaveBeenCalledWith({
        room,
        message,
        from: sender
      });
    });

    test('should not broadcast without permission', () => {
      const room = new NetworkRoom({
        ...roomData,
        settings: {
          ...roomData.settings,
          permissions: { ...roomData.settings.permissions, canBroadcast: false }
        }
      });

      const sender = new NetworkPeer({
        id: 'sender',
        name: 'Sender',
        status: 'online' as any
      });

      const message = { type: 'test', data: 'hello' };
      const broadcastSpy = jest.fn();
      room.on('message:broadcast', broadcastSpy);

      room.broadcastMessage(message, sender);

      expect(broadcastSpy).not.toHaveBeenCalled();
    });

    test('should send private message', () => {
      const room = new NetworkRoom(roomData);
      const sender = new NetworkPeer({
        id: 'sender',
        name: 'Sender',
        status: 'online' as any
      });
      const receiver = new NetworkPeer({
        id: 'receiver',
        name: 'Receiver',
        status: 'online' as any
      });

      room.addPeer(sender);
      room.addPeer(receiver);

      const message = { type: 'test', data: 'hello' };
      const privateSpy = jest.fn();
      room.on('message:private', privateSpy);

      const result = room.sendPrivateMessage(message, sender, receiver);

      expect(result).toBe(true);
      expect(privateSpy).toHaveBeenCalledWith({
        room,
        message,
        from: sender,
        to: receiver
      });
    });

    test('should not send private message without permission', () => {
      const room = new NetworkRoom({
        ...roomData,
        settings: {
          ...roomData.settings,
          permissions: { ...roomData.settings.permissions, canPrivateMessage: false }
        }
      });

      const sender = new NetworkPeer({
        id: 'sender',
        name: 'Sender',
        status: 'online' as any
      });
      const receiver = new NetworkPeer({
        id: 'receiver',
        name: 'Receiver',
        status: 'online' as any
      });

      room.addPeer(sender);
      room.addPeer(receiver);

      const message = { type: 'test', data: 'hello' };
      const result = room.sendPrivateMessage(message, sender, receiver);

      expect(result).toBe(false);
    });

    test('should not send private message to non-existent peer', () => {
      const room = new NetworkRoom(roomData);
      const sender = new NetworkPeer({
        id: 'sender',
        name: 'Sender',
        status: 'online' as any
      });
      const receiver = new NetworkPeer({
        id: 'receiver',
        name: 'Receiver',
        status: 'online' as any
      });

      room.addPeer(sender);
      // Don't add receiver

      const message = { type: 'test', data: 'hello' };
      const result = room.sendPrivateMessage(message, sender, receiver);

      expect(result).toBe(false);
    });
  });

  describe('State Management', () => {
    test('should update state', () => {
      const room = new NetworkRoom(roomData);
      const stateChangedSpy = jest.fn();
      room.on('state:changed', stateChangedSpy);

      room.updateState(RoomState.PAUSED);

      expect(room.state).toBe(RoomState.PAUSED);
      expect(stateChangedSpy).toHaveBeenCalledWith({
        room,
        oldState: RoomState.ACTIVE,
        newState: RoomState.PAUSED
      });
    });

    test('should not emit event when state is the same', () => {
      const room = new NetworkRoom(roomData);
      const stateChangedSpy = jest.fn();
      room.on('state:changed', stateChangedSpy);

      room.updateState(RoomState.ACTIVE);

      expect(stateChangedSpy).not.toHaveBeenCalled();
    });
  });

  describe('Settings Management', () => {
    test('should update settings', () => {
      const room = new NetworkRoom(roomData);
      const settingsUpdatedSpy = jest.fn();
      room.on('settings:updated', settingsUpdatedSpy);

      const newSettings = { maxPeers: 20, allowChat: false };
      const result = room.updateSettings(newSettings);

      expect(result).toBe(true);
      expect(room.settings.maxPeers).toBe(20);
      expect(room.settings.allowChat).toBe(false);
      expect(settingsUpdatedSpy).toHaveBeenCalledWith({
        room,
        settings: room.settings
      });
    });

    test('should not update settings without permission', () => {
      const room = new NetworkRoom({
        ...roomData,
        settings: {
          ...roomData.settings,
          permissions: { ...roomData.settings.permissions, canModifySettings: false }
        }
      });

      const result = room.updateSettings({ maxPeers: 20 });

      expect(result).toBe(false);
    });
  });

  describe('Password Protection', () => {
    test('should set password', () => {
      const room = new NetworkRoom(roomData);
      (room as any)._password = undefined;

      const result = room.setPassword('secret123');

      expect(result).toBe(false); // Not password protected type
    });

    test('should verify password', () => {
      const room = new NetworkRoom(roomData);
      (room as any)._password = 'secret123';

      expect(room.verifyPassword('secret123')).toBe(true);
      expect(room.verifyPassword('wrong')).toBe(false);
    });

    test('should allow access when no password set', () => {
      const room = new NetworkRoom(roomData);
      (room as any)._password = undefined;

      expect(room.verifyPassword('any')).toBe(true);
    });
  });

  describe('Peer Queries', () => {
    test('should get peer by ID', () => {
      const room = new NetworkRoom(roomData);
      room.addPeer(peer);

      const foundPeer = room.getPeer(peer.id);
      expect(foundPeer).toBe(peer);
    });

    test('should return null for non-existent peer', () => {
      const room = new NetworkRoom(roomData);

      const foundPeer = room.getPeer('non-existent');
      expect(foundPeer).toBeNull();
    });

    test('should get all peers', () => {
      const room = new NetworkRoom(roomData);
      const peer1 = new NetworkPeer({
        id: 'peer-1',
        name: 'Peer 1',
        status: 'online' as any
      });
      const peer2 = new NetworkPeer({
        id: 'peer-2',
        name: 'Peer 2',
        status: 'online' as any
      });

      room.addPeer(peer1);
      room.addPeer(peer2);

      const peers = room.getPeers();
      expect(peers).toHaveLength(2);
      expect(peers).toContain(peer1);
      expect(peers).toContain(peer2);
    });
  });

  describe('Room Status', () => {
    test('should check if room is full', () => {
      const room = new NetworkRoom({
        ...roomData,
        settings: { ...roomData.settings, maxPeers: 1 }
      });

      expect(room.isFull()).toBe(false);

      room.addPeer(peer);
      expect(room.isFull()).toBe(true);
    });

    test('should check if room is active', () => {
      const room = new NetworkRoom(roomData);
      expect(room.isActive()).toBe(true);

      room.updateState(RoomState.PAUSED);
      expect(room.isActive()).toBe(false);
    });
  });

  describe('Time Tracking', () => {
    test('should calculate uptime', () => {
      const room = new NetworkRoom(roomData);
      const uptime = room.getUptime();

      expect(uptime).toBeGreaterThan(0);
    });

    test('should calculate time since last activity', () => {
      const room = new NetworkRoom(roomData);
      const timeSinceActivity = room.getTimeSinceLastActivity();

      expect(timeSinceActivity).toBeGreaterThanOrEqual(0);
      expect(timeSinceActivity).toBeLessThan(1000); // Should be recent
    });
  });

  describe('Update', () => {
    test('should update room with new data', () => {
      const room = new NetworkRoom(roomData);

      const updateData = {
        name: 'Updated Room',
        description: 'Updated description',
        state: RoomState.PAUSED,
        settings: { maxPeers: 15 }
      };

      room.update(updateData);

      expect(room.name).toBe('Updated Room');
      expect(room.description).toBe('Updated description');
      expect(room.state).toBe(RoomState.PAUSED);
      expect(room.settings.maxPeers).toBe(15);
    });
  });

  describe('Serialization', () => {
    test('should serialize room correctly', () => {
      const room = new NetworkRoom(roomData);
      room.addPeer(peer);

      const serialized = room.serialize();

      expect(serialized.id).toBe(room.id);
      expect(serialized.name).toBe(room.name);
      expect(serialized.description).toBe(room.description);
      expect(serialized.state).toBe(room.state);
      expect(serialized.settings).toEqual(room.settings);
      expect(serialized.metadata).toEqual(room.metadata);
      expect(serialized.type).toBe(room.type);
      expect(serialized.stats).toEqual(room.stats);
      expect(serialized.peerCount).toBe(1);
      expect(serialized.bannedPeers).toEqual([]);
      expect(serialized.invitations).toEqual([]);
    });

    test('should deserialize room correctly', () => {
      const original = new NetworkRoom(roomData);
      original.addPeer(peer);
      original.banPeer('banned-peer');
      original.invitePeer('invited-peer');

      const serialized = original.serialize();
      const deserialized = NetworkRoom.deserialize(serialized);

      expect(deserialized.id).toBe(original.id);
      expect(deserialized.name).toBe(original.name);
      expect(deserialized.description).toBe(original.description);
      expect(deserialized.state).toBe(original.state);
      expect(deserialized.settings).toEqual(original.settings);
      expect(deserialized.metadata).toEqual(original.metadata);
      expect(deserialized.type).toBe(original.type);
      expect(deserialized.stats).toEqual(original.stats);
    });
  });

  describe('Getters', () => {
    test('should provide correct getters', () => {
      const room = new NetworkRoom(roomData);

      expect(room.state).toBe(RoomState.ACTIVE);
      expect(room.settings).toEqual(roomData.settings);
      expect(room.stats).toEqual(roomData.stats);
      expect(room.peerCount).toBe(0);
      expect(room.maxPeers).toBe(10);
      expect(room.createdAt).toBe(roomData.metadata.createdAt);
      expect(room.lastActivity).toBe(roomData.metadata.lastActivity);
      expect(room.uptime).toBeGreaterThan(0);
      expect(room.isPublic).toBe(true);
      expect(room.isPrivate).toBe(false);
      expect(room.isInviteOnly).toBe(false);
      expect(room.isPasswordProtected).toBe(false);
    });
  });
}); 
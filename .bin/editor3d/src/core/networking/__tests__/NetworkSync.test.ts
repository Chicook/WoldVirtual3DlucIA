// Test file for NetworkSync functionality
import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';

// Mock network functionality
class MockNetworkSync {
  private isConnected: boolean = false;
  private peers: string[] = [];

  connect(peerId: string): boolean {
    if (!this.isConnected) {
      this.isConnected = true;
    }
    if (!this.peers.includes(peerId)) {
      this.peers.push(peerId);
    }
    return true;
  }

  disconnect(peerId: string): boolean {
    const index = this.peers.indexOf(peerId);
    if (index > -1) {
      this.peers.splice(index, 1);
      return true;
    }
    return false;
  }

  getPeers(): string[] {
    return [...this.peers];
  }

  isPeerConnected(peerId: string): boolean {
    return this.peers.includes(peerId);
  }

  getConnectionStatus(): { connected: boolean; peerCount: number } {
    return {
      connected: this.isConnected,
      peerCount: this.peers.length
    };
  }
}

describe('NetworkSync', () => {
  let networkSync: MockNetworkSync;

  beforeEach(() => {
    networkSync = new MockNetworkSync();
  });

  afterEach(() => {
    // Cleanup if needed
  });

  describe('Connection Management', () => {
    it('should connect to a peer successfully', () => {
      const result = networkSync.connect('peer1');
      expect(result).toBe(true);
      expect(networkSync.isPeerConnected('peer1')).toBe(true);
    });

    it('should disconnect from a peer successfully', () => {
      networkSync.connect('peer1');
      const result = networkSync.disconnect('peer1');
      expect(result).toBe(true);
      expect(networkSync.isPeerConnected('peer1')).toBe(false);
    });

    it('should handle multiple peer connections', () => {
      networkSync.connect('peer1');
      networkSync.connect('peer2');
      networkSync.connect('peer3');

      const peers = networkSync.getPeers();
      expect(peers).toHaveLength(3);
      expect(peers).toContain('peer1');
      expect(peers).toContain('peer2');
      expect(peers).toContain('peer3');
    });
  });

  describe('Status Reporting', () => {
    it('should report correct connection status', () => {
      const status = networkSync.getConnectionStatus();
      expect(status.connected).toBe(false);
      expect(status.peerCount).toBe(0);

      networkSync.connect('peer1');
      const newStatus = networkSync.getConnectionStatus();
      expect(newStatus.connected).toBe(true);
      expect(newStatus.peerCount).toBe(1);
    });

    it('should track peer count correctly', () => {
      expect(networkSync.getPeers()).toHaveLength(0);

      networkSync.connect('peer1');
      expect(networkSync.getPeers()).toHaveLength(1);

      networkSync.connect('peer2');
      expect(networkSync.getPeers()).toHaveLength(2);

      networkSync.disconnect('peer1');
      expect(networkSync.getPeers()).toHaveLength(1);
      expect(networkSync.getPeers()).toContain('peer2');
    });
  });

  describe('Edge Cases', () => {
    it('should handle duplicate peer connections', () => {
      networkSync.connect('peer1');
      networkSync.connect('peer1'); // Duplicate

      const peers = networkSync.getPeers();
      expect(peers).toHaveLength(1);
      expect(peers).toContain('peer1');
    });

    it('should handle disconnecting non-existent peer', () => {
      const result = networkSync.disconnect('nonexistent');
      expect(result).toBe(false);
      expect(networkSync.getPeers()).toHaveLength(0);
    });

    it('should maintain connection state correctly', () => {
      expect(networkSync.getConnectionStatus().connected).toBe(false);

      networkSync.connect('peer1');
      expect(networkSync.getConnectionStatus().connected).toBe(true);

      networkSync.disconnect('peer1');
      expect(networkSync.getConnectionStatus().connected).toBe(true); // Still connected
      expect(networkSync.getConnectionStatus().peerCount).toBe(0);
    });
  });
}); 
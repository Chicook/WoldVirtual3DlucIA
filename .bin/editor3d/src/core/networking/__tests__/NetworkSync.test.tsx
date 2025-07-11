/**
 * 🧪 NetworkSync Tests
 * 
 * Tests para la sincronización de red en tiempo real
 */

import { NetworkSync, NetworkObject } from '../NetworkSync';
import * as THREE from 'three';

describe('NetworkSync', () => {
  let networkSync: NetworkSync;
  let testObject: THREE.Object3D;

  beforeEach(() => {
    networkSync = new NetworkSync({
      p2p: false,
      maxPlayers: 10,
      syncRate: 30
    });
    
    testObject = new THREE.Mesh(
      new THREE.BoxGeometry(1, 1, 1),
      new THREE.MeshBasicMaterial()
    );
  });

  afterEach(async () => {
    await networkSync.cleanup();
  });

  describe('Initialization', () => {
    test('should initialize correctly', async () => {
      await expect(networkSync.initialize()).resolves.not.toThrow();
    });

    test('should not initialize twice', async () => {
      await networkSync.initialize();
      await expect(networkSync.initialize()).resolves.not.toThrow();
    });
  });

  describe('Object Management', () => {
    beforeEach(async () => {
      await networkSync.initialize();
    });

    test('should add object to network', () => {
      const objectId = networkSync.addObject(testObject, 'test-user');
      expect(objectId).toBeDefined();
      expect(networkSync.getObject(objectId)).toBeDefined();
    });

    test('should remove object from network', () => {
      const objectId = networkSync.addObject(testObject, 'test-user');
      networkSync.removeObject(objectId);
      expect(networkSync.getObject(objectId)).toBeUndefined();
    });

    test('should get all objects', () => {
      const object1 = new THREE.Mesh();
      const object2 = new THREE.Mesh();
      
      networkSync.addObject(object1, 'user1');
      networkSync.addObject(object2, 'user2');
      
      const objects = networkSync.getAllObjects();
      expect(objects).toHaveLength(2);
    });
  });

  describe('Synchronization', () => {
    beforeEach(async () => {
      await networkSync.initialize();
    });

    test('should update object position', () => {
      const objectId = networkSync.addObject(testObject, 'test-user');
      const newPosition = new THREE.Vector3(10, 20, 30);
      
      networkSync.updateObjectPosition(objectId, newPosition);
      const networkObject = networkSync.getObject(objectId);
      
      expect(networkObject?.position.equals(newPosition)).toBe(true);
    });

    test('should update object rotation', () => {
      const objectId = networkSync.addObject(testObject, 'test-user');
      const newRotation = new THREE.Euler(0, Math.PI, 0);
      
      networkSync.updateObjectRotation(objectId, newRotation);
      const networkObject = networkSync.getObject(objectId);
      
      expect(networkObject?.rotation.equals(newRotation)).toBe(true);
    });

    test('should handle interpolation', () => {
      const objectId = networkSync.addObject(testObject, 'test-user');
      const networkObject = networkSync.getObject(objectId);
      
      if (networkObject) {
        networkObject.interpolation.enabled = true;
        networkObject.interpolation.buffer.push({
          time: Date.now(),
          position: new THREE.Vector3(0, 0, 0),
          rotation: new THREE.Euler()
        });
        
        expect(networkObject.interpolation.buffer.length).toBeGreaterThan(0);
      }
    });
  });

  describe('Performance', () => {
    beforeEach(async () => {
      await networkSync.initialize();
    });

    test('should handle multiple objects efficiently', () => {
      const objects: THREE.Object3D[] = [];
      
      // Crear 100 objetos
      for (let i = 0; i < 100; i++) {
        const obj = new THREE.Mesh(
          new THREE.BoxGeometry(1, 1, 1),
          new THREE.MeshBasicMaterial()
        );
        objects.push(obj);
        networkSync.addObject(obj, `user-${i}`);
      }
      
      const allObjects = networkSync.getAllObjects();
      expect(allObjects).toHaveLength(100);
    });

    test('should update efficiently', () => {
      const objectId = networkSync.addObject(testObject, 'test-user');
      const startTime = performance.now();
      
      // Simular 1000 actualizaciones
      for (let i = 0; i < 1000; i++) {
        networkSync.updateObjectPosition(objectId, new THREE.Vector3(i, i, i));
      }
      
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      // Debería completarse en menos de 100ms
      expect(duration).toBeLessThan(100);
    });
  });

  describe('Error Handling', () => {
    beforeEach(async () => {
      await networkSync.initialize();
    });

    test('should handle invalid object ID', () => {
      expect(() => {
        networkSync.updateObjectPosition('invalid-id', new THREE.Vector3());
      }).not.toThrow();
    });

    test('should handle null object', () => {
      expect(() => {
        networkSync.addObject(null as any, 'test-user');
      }).toThrow();
    });

    test('should handle cleanup of non-existent object', () => {
      expect(() => {
        networkSync.removeObject('non-existent-id');
      }).not.toThrow();
    });
  });
});
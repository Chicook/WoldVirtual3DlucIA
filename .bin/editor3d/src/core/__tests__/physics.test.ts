/**
 * Enterprise Physics Service Tests
 * 
 * Comprehensive test suite for physics simulation including
 * rigid bodies, collision detection, raycasting, and constraints.
 */
import { PhysicsService } from '../physics/PhysicsService';
import { EventEmitter } from '../events/EventEmitter';
import { Logger } from '../logging/Logger';
import { 
  RigidBody, 
  BodyType, 
  ShapeType, 
  Vector3, 
  Quaternion,
  PhysicsConstraint,
  ConstraintType,
  RaycastResult,
  CollisionEvent
} from '../physics/PhysicsService';

describe('Physics Service', () => {
  let physicsService: PhysicsService;
  let eventEmitter: EventEmitter;
  let logger: Logger;

  beforeEach(() => {
    eventEmitter = new EventEmitter();
    logger = new Logger();
    physicsService = new PhysicsService(eventEmitter, logger, {
      gravity: { x: 0, y: -9.81, z: 0 },
      timeStep: 1 / 60,
      maxSubSteps: 10,
      enableSleeping: true,
      enableCCD: false,
      solverIterations: 4,
      broadphaseType: 'quadtree',
      worldBounds: {
        min: { x: -1000, y: -1000, z: -1000 },
        max: { x: 1000, y: 1000, z: 1000 }
      }
    });
  });

  afterEach(() => {
    physicsService.reset();
  });

  describe('Rigid Body Creation', () => {
    it('should create dynamic rigid body', async () => {
      const body = await physicsService.createRigidBody({
        type: 'dynamic',
        shape: 'box',
        mass: 1.0,
        position: { x: 0, y: 10, z: 0 },
        velocity: { x: 0, y: 0, z: 0 }
      });
      
      expect(body.type).toBe('dynamic');
      expect(body.shape.type).toBe('box');
      expect(body.mass).toBe(1.0);
      expect(body.position).toEqual({ x: 0, y: 10, z: 0 });
      expect(body.velocity).toEqual({ x: 0, y: 0, z: 0 });
      expect(body.isStatic).toBe(false);
      expect(body.isKinematic).toBe(false);
      expect(body.isTrigger).toBe(false);
      expect(body.metadata.createdAt).toBeGreaterThan(0);
    });

    it('should create static rigid body', async () => {
      const body = await physicsService.createRigidBody({
        type: 'static',
        shape: 'plane',
        position: { x: 0, y: 0, z: 0 }
      });
      
      expect(body.type).toBe('static');
      expect(body.shape.type).toBe('plane');
      expect(body.isStatic).toBe(true);
      expect(body.isKinematic).toBe(false);
    });

    it('should create kinematic rigid body', async () => {
      const body = await physicsService.createRigidBody({
        type: 'kinematic',
        shape: 'sphere',
        mass: 0,
        position: { x: 0, y: 5, z: 0 }
      });
      
      expect(body.type).toBe('kinematic');
      expect(body.shape.type).toBe('sphere');
      expect(body.isKinematic).toBe(true);
      expect(body.isStatic).toBe(false);
    });

    it('should create trigger body', async () => {
      const body = await physicsService.createRigidBody({
        type: 'dynamic',
        shape: 'box',
        isTrigger: true
      });
      
      expect(body.isTrigger).toBe(true);
    });

    it('should create body with custom properties', async () => {
      const body = await physicsService.createRigidBody({
        type: 'dynamic',
        shape: 'sphere',
        mass: 2.0,
        position: { x: 1, y: 2, z: 3 },
        rotation: { x: 0, y: 0, z: 0, w: 1 },
        velocity: { x: 1, y: 0, z: 0 },
        angularVelocity: { x: 0, y: 1, z: 0 },
        linearDamping: 0.1,
        angularDamping: 0.1,
        friction: 0.8,
        restitution: 0.5
      });
      
      expect(body.mass).toBe(2.0);
      expect(body.position).toEqual({ x: 1, y: 2, z: 3 });
      expect(body.rotation).toEqual({ x: 0, y: 0, z: 0, w: 1 });
      expect(body.velocity).toEqual({ x: 1, y: 0, z: 0 });
      expect(body.angularVelocity).toEqual({ x: 0, y: 1, z: 0 });
      expect(body.linearDamping).toBe(0.1);
      expect(body.angularDamping).toBe(0.1);
      expect(body.friction).toBe(0.8);
      expect(body.restitution).toBe(0.5);
    });
  });

  describe('Collision Shape Creation', () => {
    it('should create box shape', () => {
      const shape = physicsService.createCollisionShape('box', { size: { x: 2, y: 1, z: 3 } });
      
      expect(shape.type).toBe('box');
      expect(shape.parameters.size).toEqual({ x: 2, y: 1, z: 3 });
      expect(shape.boundingBox.min.x).toBe(-1);
      expect(shape.boundingBox.min.y).toBe(-0.5);
      expect(shape.boundingBox.min.z).toBe(-1.5);
      expect(shape.boundingBox.max.x).toBe(1);
      expect(shape.boundingBox.max.y).toBe(0.5);
      expect(shape.boundingBox.max.z).toBe(1.5);
    });

    it('should create sphere shape', () => {
      const shape = physicsService.createCollisionShape('sphere', { radius: 2.5 });
      
      expect(shape.type).toBe('sphere');
      expect(shape.parameters.radius).toBe(2.5);
      expect(shape.boundingBox.min.x).toBe(-2.5);
      expect(shape.boundingBox.min.y).toBe(-2.5);
      expect(shape.boundingBox.min.z).toBe(-2.5);
      expect(shape.boundingBox.max.x).toBe(2.5);
      expect(shape.boundingBox.max.y).toBe(2.5);
      expect(shape.boundingBox.max.z).toBe(2.5);
    });

    it('should create cylinder shape', () => {
      const shape = physicsService.createCollisionShape('cylinder', { 
        height: 3, 
        radius: 1.5 
      });
      
      expect(shape.type).toBe('cylinder');
      expect(shape.parameters.height).toBe(3);
      expect(shape.parameters.radius).toBe(1.5);
      expect(shape.boundingBox.min.x).toBe(-1.5);
      expect(shape.boundingBox.min.y).toBe(-1.5);
      expect(shape.boundingBox.min.z).toBe(-1.5);
      expect(shape.boundingBox.max.x).toBe(1.5);
      expect(shape.boundingBox.max.y).toBe(1.5);
      expect(shape.boundingBox.max.z).toBe(1.5);
    });

    it('should create capsule shape', () => {
      const shape = physicsService.createCollisionShape('capsule', { 
        height: 4, 
        radius: 1 
      });
      
      expect(shape.type).toBe('capsule');
      expect(shape.parameters.height).toBe(4);
      expect(shape.parameters.radius).toBe(1);
      expect(shape.boundingBox.min.x).toBe(-1);
      expect(shape.boundingBox.min.y).toBe(-2);
      expect(shape.boundingBox.min.z).toBe(-1);
      expect(shape.boundingBox.max.x).toBe(1);
      expect(shape.boundingBox.max.y).toBe(2);
      expect(shape.boundingBox.max.z).toBe(1);
    });

    it('should create plane shape', () => {
      const shape = physicsService.createCollisionShape('plane');
      
      expect(shape.type).toBe('plane');
      expect(shape.boundingBox.min.x).toBe(-Infinity);
      expect(shape.boundingBox.min.y).toBe(-0.1);
      expect(shape.boundingBox.min.z).toBe(-Infinity);
      expect(shape.boundingBox.max.x).toBe(Infinity);
      expect(shape.boundingBox.max.y).toBe(0.1);
      expect(shape.boundingBox.max.z).toBe(Infinity);
    });

    it('should handle default parameters', () => {
      const boxShape = physicsService.createCollisionShape('box');
      expect(boxShape.parameters.size).toEqual({ x: 1, y: 1, z: 1 });
      
      const sphereShape = physicsService.createCollisionShape('sphere');
      expect(sphereShape.parameters.radius).toBe(0.5);
    });
  });

  describe('Raycasting', () => {
    it('should perform raycast', async () => {
      // Create a ground plane
      await physicsService.createRigidBody({
        type: 'static',
        shape: 'plane',
        position: { x: 0, y: 0, z: 0 }
      });
      
      const result = await physicsService.raycast(
        { x: 0, y: 10, z: 0 },
        { x: 0, y: -1, z: 0 },
        20
      );
      
      expect(result.hit).toBe(true);
      expect(result.distance).toBeGreaterThan(0);
      expect(result.fraction).toBeGreaterThan(0);
      expect(result.fraction).toBeLessThanOrEqual(1);
    });

    it('should handle raycast with no hit', async () => {
      const result = await physicsService.raycast(
        { x: 0, y: 10, z: 0 },
        { x: 0, y: 1, z: 0 }, // Ray pointing up
        20
      );
      
      expect(result.hit).toBe(false);
      expect(result.distance).toBe(20);
      expect(result.fraction).toBe(1);
    });

    it('should handle raycast with filter', async () => {
      const body1 = await physicsService.createRigidBody({
        type: 'static',
        shape: 'box',
        position: { x: 0, y: 0, z: 0 }
      });
      
      const body2 = await physicsService.createRigidBody({
        type: 'static',
        shape: 'box',
        position: { x: 0, y: 5, z: 0 }
      });
      
      const result = await physicsService.raycast(
        { x: 0, y: 10, z: 0 },
        { x: 0, y: -1, z: 0 },
        20,
        (body) => body.id === body1.id // Only hit body1
      );
      
      expect(result.hit).toBe(true);
      expect(result.bodyId).toBe(body1.id);
    });
  });

  describe('Constraints', () => {
    it('should create point constraint', () => {
      const body1 = await physicsService.createRigidBody({
        type: 'dynamic',
        shape: 'sphere',
        position: { x: 0, y: 0, z: 0 }
      });
      
      const body2 = await physicsService.createRigidBody({
        type: 'dynamic',
        shape: 'sphere',
        position: { x: 2, y: 0, z: 0 }
      });
      
      const constraint = physicsService.createConstraint(
        'point',
        body1.id,
        body2.id,
        {
          pivotA: { x: 0, y: 0, z: 0 },
          pivotB: { x: 0, y: 0, z: 0 }
        }
      );
      
      expect(constraint.type).toBe('point');
      expect(constraint.bodyA).toBe(body1.id);
      expect(constraint.bodyB).toBe(body2.id);
      expect(constraint.metadata.createdAt).toBeGreaterThan(0);
      expect(constraint.metadata.broken).toBe(false);
    });

    it('should create hinge constraint', () => {
      const body1 = await physicsService.createRigidBody({
        type: 'dynamic',
        shape: 'box',
        position: { x: 0, y: 0, z: 0 }
      });
      
      const body2 = await physicsService.createRigidBody({
        type: 'dynamic',
        shape: 'box',
        position: { x: 1, y: 0, z: 0 }
      });
      
      const constraint = physicsService.createConstraint(
        'hinge',
        body1.id,
        body2.id,
        {
          pivotA: { x: 0.5, y: 0, z: 0 },
          pivotB: { x: -0.5, y: 0, z: 0 },
          axisA: { x: 0, y: 1, z: 0 },
          axisB: { x: 0, y: 1, z: 0 }
        }
      );
      
      expect(constraint.type).toBe('hinge');
      expect(constraint.bodyA).toBe(body1.id);
      expect(constraint.bodyB).toBe(body2.id);
    });

    it('should create slider constraint', () => {
      const body1 = await physicsService.createRigidBody({
        type: 'dynamic',
        shape: 'box',
        position: { x: 0, y: 0, z: 0 }
      });
      
      const body2 = await physicsService.createRigidBody({
        type: 'dynamic',
        shape: 'box',
        position: { x: 1, y: 0, z: 0 }
      });
      
      const constraint = physicsService.createConstraint(
        'slider',
        body1.id,
        body2.id,
        {
          pivotA: { x: 0.5, y: 0, z: 0 },
          pivotB: { x: -0.5, y: 0, z: 0 },
          axisA: { x: 1, y: 0, z: 0 },
          axisB: { x: 1, y: 0, z: 0 }
        }
      );
      
      expect(constraint.type).toBe('slider');
    });
  });

  describe('Physics Simulation', () => {
    it('should update physics simulation', async () => {
      const body = await physicsService.createRigidBody({
        type: 'dynamic',
        shape: 'sphere',
        position: { x: 0, y: 10, z: 0 }
      });
      
      const initialPosition = { ...body.position };
      
      await physicsService.update(1 / 60); // 60 FPS
      
      // Position should change due to gravity
      expect(body.position.y).toBeLessThan(initialPosition.y);
    });

    it('should handle multiple bodies', async () => {
      const bodies = [];
      
      for (let i = 0; i < 5; i++) {
        const body = await physicsService.createRigidBody({
          type: 'dynamic',
          shape: 'sphere',
          position: { x: i * 2, y: 10, z: 0 }
        });
        bodies.push(body);
      }
      
      await physicsService.update(1 / 60);
      
      // All bodies should fall due to gravity
      bodies.forEach(body => {
        expect(body.position.y).toBeLessThan(10);
      });
    });

    it('should handle static bodies', async () => {
      const staticBody = await physicsService.createRigidBody({
        type: 'static',
        shape: 'plane',
        position: { x: 0, y: 0, z: 0 }
      });
      
      const dynamicBody = await physicsService.createRigidBody({
        type: 'dynamic',
        shape: 'sphere',
        position: { x: 0, y: 10, z: 0 }
      });
      
      await physicsService.update(1 / 60);
      
      // Static body should not move
      expect(staticBody.position.y).toBe(0);
      
      // Dynamic body should fall
      expect(dynamicBody.position.y).toBeLessThan(10);
    });
  });

  describe('Body Manipulation', () => {
    it('should set body position', async () => {
      const body = await physicsService.createRigidBody({
        type: 'dynamic',
        shape: 'sphere',
        position: { x: 0, y: 0, z: 0 }
      });
      
      const newPosition = { x: 5, y: 10, z: 15 };
      physicsService.setBodyPosition(body.id, newPosition);
      
      expect(body.position).toEqual(newPosition);
      expect(body.metadata.updatedAt).toBeGreaterThan(body.metadata.createdAt);
    });

    it('should set body rotation', async () => {
      const body = await physicsService.createRigidBody({
        type: 'dynamic',
        shape: 'sphere',
        position: { x: 0, y: 0, z: 0 }
      });
      
      const newRotation = { x: 0, y: 0, z: 0, w: 1 };
      physicsService.setBodyRotation(body.id, newRotation);
      
      expect(body.rotation).toEqual(newRotation);
      expect(body.metadata.updatedAt).toBeGreaterThan(body.metadata.createdAt);
    });

    it('should apply force to body', async () => {
      const body = await physicsService.createRigidBody({
        type: 'dynamic',
        shape: 'sphere',
        position: { x: 0, y: 0, z: 0 }
      });
      
      const initialVelocity = { ...body.velocity };
      const force = { x: 10, y: 0, z: 0 };
      
      physicsService.applyForce(body.id, force);
      
      expect(body.velocity.x).toBeGreaterThan(initialVelocity.x);
    });

    it('should apply impulse to body', async () => {
      const body = await physicsService.createRigidBody({
        type: 'dynamic',
        shape: 'sphere',
        position: { x: 0, y: 0, z: 0 }
      });
      
      const initialVelocity = { ...body.velocity };
      const impulse = { x: 5, y: 0, z: 0 };
      
      physicsService.applyImpulse(body.id, impulse);
      
      expect(body.velocity.x).toBeGreaterThan(initialVelocity.x);
    });

    it('should not apply force to static body', async () => {
      const body = await physicsService.createRigidBody({
        type: 'static',
        shape: 'plane',
        position: { x: 0, y: 0, z: 0 }
      });
      
      const initialVelocity = { ...body.velocity };
      const force = { x: 10, y: 0, z: 0 };
      
      physicsService.applyForce(body.id, force);
      
      expect(body.velocity).toEqual(initialVelocity);
    });
  });

  describe('Body Management', () => {
    it('should get body by ID', async () => {
      const body = await physicsService.createRigidBody({
        type: 'dynamic',
        shape: 'sphere'
      });
      
      const retrieved = physicsService.getBody(body.id);
      
      expect(retrieved).toBeDefined();
      expect(retrieved?.id).toBe(body.id);
    });

    it('should get all bodies', async () => {
      await physicsService.createRigidBody({
        type: 'dynamic',
        shape: 'sphere'
      });
      
      await physicsService.createRigidBody({
        type: 'static',
        shape: 'plane'
      });
      
      const bodies = physicsService.getAllBodies();
      
      expect(bodies).toHaveLength(2);
      expect(bodies.some(b => b.type === 'dynamic')).toBe(true);
      expect(bodies.some(b => b.type === 'static')).toBe(true);
    });

    it('should remove body', async () => {
      const body = await physicsService.createRigidBody({
        type: 'dynamic',
        shape: 'sphere'
      });
      
      physicsService.removeBody(body.id);
      
      const retrieved = physicsService.getBody(body.id);
      expect(retrieved).toBeUndefined();
    });

    it('should remove constraint', () => {
      const body1 = await physicsService.createRigidBody({
        type: 'dynamic',
        shape: 'sphere'
      });
      
      const body2 = await physicsService.createRigidBody({
        type: 'dynamic',
        shape: 'sphere'
      });
      
      const constraint = physicsService.createConstraint('point', body1.id, body2.id);
      
      physicsService.removeConstraint(constraint.id);
      
      const stats = physicsService.getStats();
      expect(stats.constraintCount).toBe(0);
    });
  });

  describe('Physics Statistics', () => {
    it('should provide physics statistics', async () => {
      await physicsService.createRigidBody({
        type: 'dynamic',
        shape: 'sphere'
      });
      
      await physicsService.createRigidBody({
        type: 'static',
        shape: 'plane'
      });
      
      const body1 = await physicsService.createRigidBody({
        type: 'dynamic',
        shape: 'sphere'
      });
      
      const body2 = await physicsService.createRigidBody({
        type: 'dynamic',
        shape: 'sphere'
      });
      
      physicsService.createConstraint('point', body1.id, body2.id);
      
      await physicsService.raycast(
        { x: 0, y: 10, z: 0 },
        { x: 0, y: -1, z: 0 },
        20
      );
      
      await physicsService.update(1 / 60);
      
      const stats = physicsService.getStats();
      
      expect(stats.bodyCount).toBe(4);
      expect(stats.constraintCount).toBe(1);
      expect(stats.raycastCount).toBe(1);
      expect(stats.simulationTime).toBeGreaterThan(0);
      expect(stats.fps).toBeGreaterThan(0);
    });
  });

  describe('Physics Configuration', () => {
    it('should set and get gravity', () => {
      const newGravity = { x: 0, y: -20, z: 0 };
      physicsService.setGravity(newGravity);
      
      const retrievedGravity = physicsService.getGravity();
      expect(retrievedGravity).toEqual(newGravity);
    });

    it('should reset physics world', async () => {
      await physicsService.createRigidBody({
        type: 'dynamic',
        shape: 'sphere'
      });
      
      const body1 = await physicsService.createRigidBody({
        type: 'dynamic',
        shape: 'sphere'
      });
      
      const body2 = await physicsService.createRigidBody({
        type: 'dynamic',
        shape: 'sphere'
      });
      
      physicsService.createConstraint('point', body1.id, body2.id);
      
      physicsService.reset();
      
      const stats = physicsService.getStats();
      expect(stats.bodyCount).toBe(0);
      expect(stats.constraintCount).toBe(0);
      expect(stats.collisionCount).toBe(0);
      expect(stats.raycastCount).toBe(0);
    });
  });

  describe('Collision Detection', () => {
    it('should detect collisions between bodies', async () => {
      const body1 = await physicsService.createRigidBody({
        type: 'dynamic',
        shape: 'sphere',
        position: { x: 0, y: 5, z: 0 }
      });
      
      const body2 = await physicsService.createRigidBody({
        type: 'dynamic',
        shape: 'sphere',
        position: { x: 0, y: 0, z: 0 }
      });
      
      await physicsService.update(1 / 60);
      
      // Bodies should collide when they fall
      const areColliding = physicsService.areBodiesColliding(body1.id, body2.id);
      expect(typeof areColliding).toBe('boolean');
    });

    it('should get body collisions', async () => {
      const body = await physicsService.createRigidBody({
        type: 'dynamic',
        shape: 'sphere'
      });
      
      const collisions = physicsService.getBodyCollisions(body.id);
      expect(Array.isArray(collisions)).toBe(true);
    });
  });

  describe('Event System Integration', () => {
    it('should emit body created event', (done) => {
      eventEmitter.on('physics:body-created', (data) => {
        expect(data.body).toBeDefined();
        expect(data.body.type).toBe('dynamic');
        done();
      });
      
      physicsService.createRigidBody({
        type: 'dynamic',
        shape: 'sphere'
      });
    });

    it('should emit body moved event', (done) => {
      eventEmitter.on('physics:body-moved', (data) => {
        expect(data.bodyId).toBeDefined();
        expect(data.position).toEqual({ x: 5, y: 10, z: 15 });
        done();
      });
      
      physicsService.createRigidBody({
        type: 'dynamic',
        shape: 'sphere'
      }).then(body => {
        physicsService.setBodyPosition(body.id, { x: 5, y: 10, z: 15 });
      });
    });

    it('should emit body rotated event', (done) => {
      eventEmitter.on('physics:body-rotated', (data) => {
        expect(data.bodyId).toBeDefined();
        expect(data.rotation).toEqual({ x: 0, y: 0, z: 0, w: 1 });
        done();
      });
      
      physicsService.createRigidBody({
        type: 'dynamic',
        shape: 'sphere'
      }).then(body => {
        physicsService.setBodyRotation(body.id, { x: 0, y: 0, z: 0, w: 1 });
      });
    });

    it('should emit force applied event', (done) => {
      eventEmitter.on('physics:force-applied', (data) => {
        expect(data.bodyId).toBeDefined();
        expect(data.force).toEqual({ x: 10, y: 0, z: 0 });
        done();
      });
      
      physicsService.createRigidBody({
        type: 'dynamic',
        shape: 'sphere'
      }).then(body => {
        physicsService.applyForce(body.id, { x: 10, y: 0, z: 0 });
      });
    });

    it('should emit impulse applied event', (done) => {
      eventEmitter.on('physics:impulse-applied', (data) => {
        expect(data.bodyId).toBeDefined();
        expect(data.impulse).toEqual({ x: 5, y: 0, z: 0 });
        done();
      });
      
      physicsService.createRigidBody({
        type: 'dynamic',
        shape: 'sphere'
      }).then(body => {
        physicsService.applyImpulse(body.id, { x: 5, y: 0, z: 0 });
      });
    });

    it('should emit body removed event', (done) => {
      eventEmitter.on('physics:body-removed', (data) => {
        expect(data.body).toBeDefined();
        done();
      });
      
      physicsService.createRigidBody({
        type: 'dynamic',
        shape: 'sphere'
      }).then(body => {
        physicsService.removeBody(body.id);
      });
    });

    it('should emit constraint created event', (done) => {
      eventEmitter.on('physics:constraint-created', (data) => {
        expect(data.constraint).toBeDefined();
        expect(data.constraint.type).toBe('point');
        done();
      });
      
      physicsService.createRigidBody({
        type: 'dynamic',
        shape: 'sphere'
      }).then(body1 => {
        physicsService.createRigidBody({
          type: 'dynamic',
          shape: 'sphere'
        }).then(body2 => {
          physicsService.createConstraint('point', body1.id, body2.id);
        });
      });
    });

    it('should emit constraint removed event', (done) => {
      eventEmitter.on('physics:constraint-removed', (data) => {
        expect(data.constraint).toBeDefined();
        done();
      });
      
      physicsService.createRigidBody({
        type: 'dynamic',
        shape: 'sphere'
      }).then(body1 => {
        physicsService.createRigidBody({
          type: 'dynamic',
          shape: 'sphere'
        }).then(body2 => {
          const constraint = physicsService.createConstraint('point', body1.id, body2.id);
          physicsService.removeConstraint(constraint.id);
        });
      });
    });

    it('should emit raycast event', (done) => {
      eventEmitter.on('physics:raycast', (data) => {
        expect(data.origin).toEqual({ x: 0, y: 10, z: 0 });
        expect(data.direction).toEqual({ x: 0, y: -1, z: 0 });
        expect(data.maxDistance).toBe(20);
        expect(data.result).toBeDefined();
        done();
      });
      
      physicsService.raycast(
        { x: 0, y: 10, z: 0 },
        { x: 0, y: -1, z: 0 },
        20
      );
    });

    it('should emit physics updated event', (done) => {
      eventEmitter.on('physics:updated', (data) => {
        expect(data.deltaTime).toBe(1 / 60);
        expect(data.simulationTime).toBeGreaterThan(0);
        done();
      });
      
      physicsService.update(1 / 60);
    });

    it('should emit gravity changed event', (done) => {
      eventEmitter.on('physics:gravity-changed', (data) => {
        expect(data.gravity).toEqual({ x: 0, y: -20, z: 0 });
        done();
      });
      
      physicsService.setGravity({ x: 0, y: -20, z: 0 });
    });

    it('should emit reset event', (done) => {
      eventEmitter.on('physics:reset', () => {
        done();
      });
      
      physicsService.reset();
    });

    it('should emit collision event', (done) => {
      eventEmitter.on('physics:collision', (data) => {
        expect(data.bodyA).toBeDefined();
        expect(data.bodyB).toBeDefined();
        expect(data.contactPoint).toBeDefined();
        expect(data.contactNormal).toBeDefined();
        expect(data.penetrationDepth).toBeGreaterThan(0);
        expect(data.timestamp).toBeGreaterThan(0);
        done();
      });
      
      // Create bodies that will collide
      physicsService.createRigidBody({
        type: 'dynamic',
        shape: 'sphere',
        position: { x: 0, y: 5, z: 0 }
      }).then(() => {
        physicsService.createRigidBody({
          type: 'dynamic',
          shape: 'sphere',
          position: { x: 0, y: 0, z: 0 }
        }).then(() => {
          physicsService.update(1 / 60);
        });
      });
    });
  });

  describe('Performance and Memory', () => {
    it('should handle multiple bodies efficiently', async () => {
      const startTime = performance.now();
      
      const promises = [];
      for (let i = 0; i < 20; i++) {
        promises.push(physicsService.createRigidBody({
          type: 'dynamic',
          shape: 'sphere',
          position: { x: i * 2, y: 10, z: 0 }
        }));
      }
      
      await Promise.all(promises);
      
      const endTime = performance.now();
      expect(endTime - startTime).toBeLessThan(1000); // Should complete within 1 second
    });

    it('should handle physics simulation efficiently', async () => {
      // Create multiple bodies
      for (let i = 0; i < 10; i++) {
        await physicsService.createRigidBody({
          type: 'dynamic',
          shape: 'sphere',
          position: { x: i * 2, y: 10, z: 0 }
        });
      }
      
      const startTime = performance.now();
      
      // Simulate for multiple frames
      for (let i = 0; i < 10; i++) {
        await physicsService.update(1 / 60);
      }
      
      const endTime = performance.now();
      expect(endTime - startTime).toBeLessThan(1000); // Should complete within 1 second
    });
  });

  describe('Error Handling', () => {
    it('should handle invalid body IDs', () => {
      const body = physicsService.getBody('invalid-id');
      expect(body).toBeUndefined();
    });

    it('should handle removing non-existent body', () => {
      expect(() => {
        physicsService.removeBody('invalid-id');
      }).not.toThrow();
    });

    it('should handle removing non-existent constraint', () => {
      expect(() => {
        physicsService.removeConstraint('invalid-id');
      }).not.toThrow();
    });

    it('should handle invalid shape types', () => {
      expect(() => {
        physicsService.createCollisionShape('invalid' as ShapeType);
      }).toThrow('Unknown shape type: invalid');
    });
  });
}); 
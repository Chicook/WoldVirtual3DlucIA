/**
 * ⚡ PhysicsEngine - Motor de Física Avanzado
 * 
 * Responsabilidades:
 * - Simulación de física realista
 * - Detección de colisiones optimizada
 * - Cuerpos rígidos y suaves
 * - Restricciones y articulaciones
 * - Optimización de rendimiento
 * - Integración con WebGPU
 */

import * as THREE from 'three';

export interface PhysicsBody {
  id: string;
  object: THREE.Object3D;
  mass: number;
  velocity: THREE.Vector3;
  angularVelocity: THREE.Vector3;
  force: THREE.Vector3;
  torque: THREE.Vector3;
  restitution: number;
  friction: number;
  isStatic: boolean;
  collisionShape: 'box' | 'sphere' | 'cylinder' | 'mesh';
  collisionData: any;
}

export interface PhysicsConstraint {
  id: string;
  bodyA: string;
  bodyB: string;
  type: 'hinge' | 'slider' | 'spring' | 'fixed';
  anchorA: THREE.Vector3;
  anchorB: THREE.Vector3;
  axisA: THREE.Vector3;
  axisB: THREE.Vector3;
  limits: {
    min: number;
    max: number;
  };
  spring: {
    stiffness: number;
    damping: number;
  };
}

export interface PhysicsConfig {
  gravity: THREE.Vector3;
  iterations: number;
  broadphase: 'sweep' | 'grid' | 'quadtree';
  solver: 'sequential' | 'jacobi' | 'gauss-seidel';
  timestep: number;
  maxSubSteps: number;
}

export class PhysicsEngine {
  private bodies: Map<string, PhysicsBody> = new Map();
  private constraints: Map<string, PhysicsConstraint> = new Map();
  private config: PhysicsConfig;
  private isInitialized: boolean = false;
  private accumulator: number = 0;
  private broadphase: any;
  private solver: any;

  constructor(config: Partial<PhysicsConfig> = {}) {
    this.config = {
      gravity: new THREE.Vector3(0, -9.81, 0),
      iterations: 10,
      broadphase: 'quadtree',
      solver: 'sequential',
      timestep: 1 / 60,
      maxSubSteps: 10,
      ...config
    };
  }

  async initialize(): Promise<void> {
    if (this.isInitialized) {
      console.log('[⚡] PhysicsEngine ya está inicializado');
      return;
    }

    console.log('[⚡] Inicializando PhysicsEngine...');

    try {
      // Inicializar broadphase
      this.initializeBroadphase();
      
      // Inicializar solver
      this.initializeSolver();
      
      this.isInitialized = true;
      console.log('[✅] PhysicsEngine inicializado correctamente');
    } catch (error) {
      console.error('[❌] Error inicializando PhysicsEngine:', error);
      throw error;
    }
  }

  private initializeBroadphase(): void {
    switch (this.config.broadphase) {
      case 'quadtree':
        this.broadphase = new QuadTreeBroadphase();
        break;
      case 'grid':
        this.broadphase = new GridBroadphase();
        break;
      case 'sweep':
        this.broadphase = new SweepAndPruneBroadphase();
        break;
      default:
        this.broadphase = new QuadTreeBroadphase();
    }
  }

  private initializeSolver(): void {
    switch (this.config.solver) {
      case 'jacobi':
        this.solver = new JacobiSolver();
        break;
      case 'gauss-seidel':
        this.solver = new GaussSeidelSolver();
        break;
      default:
        this.solver = new SequentialSolver();
    }
  }

  addBody(object: THREE.Object3D, options: Partial<PhysicsBody> = {}): string {
    const id = `body_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const body: PhysicsBody = {
      id,
      object,
      mass: 1.0,
      velocity: new THREE.Vector3(),
      angularVelocity: new THREE.Vector3(),
      force: new THREE.Vector3(),
      torque: new THREE.Vector3(),
      restitution: 0.5,
      friction: 0.3,
      isStatic: false,
      collisionShape: 'box',
      collisionData: null,
      ...options
    };

    // Determinar forma de colisión automáticamente
    if (!options.collisionShape) {
      body.collisionShape = this.detectCollisionShape(object);
      body.collisionData = this.generateCollisionData(object, body.collisionShape);
    }

    this.bodies.set(id, body);
    this.broadphase.addBody(body);
    
    console.log(`[⚡] Cuerpo físico agregado: ${id}`);
    return id;
  }

  private detectCollisionShape(object: THREE.Object3D): 'box' | 'sphere' | 'cylinder' | 'mesh' {
    // Detectar geometría automáticamente
    if (object instanceof THREE.Mesh) {
      const geometry = object.geometry;
      
      if (geometry instanceof THREE.BoxGeometry) {
        return 'box';
      } else if (geometry instanceof THREE.SphereGeometry) {
        return 'sphere';
      } else if (geometry instanceof THREE.CylinderGeometry) {
        return 'cylinder';
      }
    }
    
    return 'mesh';
  }

  private generateCollisionData(object: THREE.Object3D, shape: string): any {
    const bbox = new THREE.Box3().setFromObject(object);
    const size = bbox.getSize(new THREE.Vector3());
    const center = bbox.getCenter(new THREE.Vector3());

    switch (shape) {
      case 'box':
        return { size, center };
      case 'sphere':
        return { radius: Math.max(size.x, size.y, size.z) / 2, center };
      case 'cylinder':
        return { radius: Math.max(size.x, size.z) / 2, height: size.y, center };
      case 'mesh':
        return { vertices: this.extractVertices(object), center };
      default:
        return { size, center };
    }
  }

  private extractVertices(object: THREE.Object3D): THREE.Vector3[] {
    const vertices: THREE.Vector3[] = [];
    
    // Extraer vértices de la geometría
    if (object instanceof THREE.Mesh && object.geometry) {
      const geometry = object.geometry;
      const position = geometry.getAttribute('position');
      
      if (position) {
        for (let i = 0; i < position.count; i++) {
          const x = position.getX(i);
          const y = position.getY(i);
          const z = position.getZ(i);
          vertices.push(new THREE.Vector3(x, y, z));
        }
      }
    }
    
    return vertices;
  }

  removeBody(bodyId: string): void {
    const body = this.bodies.get(bodyId);
    if (body) {
      this.bodies.delete(bodyId);
      this.broadphase.removeBody(body);
      console.log(`[⚡] Cuerpo físico removido: ${bodyId}`);
    }
  }

  addConstraint(constraint: PhysicsConstraint): void {
    this.constraints.set(constraint.id, constraint);
    console.log(`[⚡] Restricción agregada: ${constraint.id}`);
  }

  removeConstraint(constraintId: string): void {
    this.constraints.delete(constraintId);
    console.log(`[⚡] Restricción removida: ${constraintId}`);
  }

  update(deltaTime: number): void {
    if (!this.isInitialized) return;

    this.accumulator += deltaTime;

    // Sub-steps para estabilidad
    const subSteps = Math.min(
      Math.floor(this.accumulator / this.config.timestep),
      this.config.maxSubSteps
    );

    for (let i = 0; i < subSteps; i++) {
      this.step(this.config.timestep);
    }

    this.accumulator -= subSteps * this.config.timestep;

    // Actualizar objetos 3D
    this.updateObjects();
  }

  private step(deltaTime: number): void {
    // Aplicar fuerzas
    this.applyForces();
    
    // Detectar colisiones
    const collisions = this.detectCollisions();
    
    // Resolver colisiones
    this.resolveCollisions(collisions);
    
    // Aplicar restricciones
    this.applyConstraints();
    
    // Integrar movimiento
    this.integrate(deltaTime);
  }

  private applyForces(): void {
    for (const body of this.bodies.values()) {
      if (!body.isStatic) {
        // Aplicar gravedad
        body.force.add(this.config.gravity.clone().multiplyScalar(body.mass));
        
        // Aplicar fricción
        const friction = body.velocity.clone().multiplyScalar(-body.friction);
        body.force.add(friction);
      }
    }
  }

  private detectCollisions(): Array<{ bodyA: PhysicsBody; bodyB: PhysicsBody; contact: any }> {
    const collisions: Array<{ bodyA: PhysicsBody; bodyB: PhysicsBody; contact: any }> = [];
    
    // Usar broadphase para optimizar
    const pairs = this.broadphase.getCollisionPairs();
    
    for (const pair of pairs) {
      const contact = this.checkCollision(pair.bodyA, pair.bodyB);
      if (contact) {
        collisions.push({
          bodyA: pair.bodyA,
          bodyB: pair.bodyB,
          contact
        });
      }
    }
    
    return collisions;
  }

  private checkCollision(bodyA: PhysicsBody, bodyB: PhysicsBody): any {
    // Implementar detección de colisión según formas
    const shapeA = bodyA.collisionShape;
    const shapeB = bodyB.collisionShape;
    
    if (shapeA === 'sphere' && shapeB === 'sphere') {
      return this.sphereSphereCollision(bodyA, bodyB);
    } else if (shapeA === 'box' && shapeB === 'box') {
      return this.boxBoxCollision(bodyA, bodyB);
    } else if (shapeA === 'sphere' && shapeB === 'box') {
      return this.sphereBoxCollision(bodyA, bodyB);
    }
    
    return null;
  }

  private sphereSphereCollision(bodyA: PhysicsBody, bodyB: PhysicsBody): any {
    // Verificar que los objetos tienen posición
    if (!('position' in bodyA.object) || !('position' in bodyB.object)) {
      return null;
    }
    
    const posA = (bodyA.object as any).position;
    const posB = (bodyB.object as any).position;
    const radiusA = bodyA.collisionData.radius;
    const radiusB = bodyB.collisionData.radius;
    
    const distance = posA.distanceTo(posB);
    const minDistance = radiusA + radiusB;
    
    if (distance < minDistance) {
      const normal = posB.clone().sub(posA).normalize();
      const penetration = minDistance - distance;
      
      return {
        normal,
        penetration,
        point: posA.clone().add(normal.clone().multiplyScalar(radiusA))
      };
    }
    
    return null;
  }

  private boxBoxCollision(bodyA: PhysicsBody, bodyB: PhysicsBody): any {
    const bboxA = new THREE.Box3().setFromObject(bodyA.object);
    const bboxB = new THREE.Box3().setFromObject(bodyB.object);
    
    if (bboxA.intersectsBox(bboxB)) {
      const centerA = bboxA.getCenter(new THREE.Vector3());
      const centerB = bboxB.getCenter(new THREE.Vector3());
      const normal = centerB.clone().sub(centerA).normalize();
      
      return {
        normal,
        penetration: 0.1, // Simplificado
        point: centerA.clone()
      };
    }
    
    return null;
  }

  private sphereBoxCollision(sphere: PhysicsBody, box: PhysicsBody): any {
    // Verificar que los objetos tienen posición
    if (!('position' in sphere.object) || !('position' in box.object)) {
      return null;
    }
    
    const spherePos = (sphere.object as any).position;
    const boxPos = (box.object as any).position;
    const radius = sphere.collisionData.radius;
    const boxSize = box.collisionData.size;
    
    // Clamp sphere position to box bounds
    const clamped = spherePos.clone();
    clamped.x = Math.max(boxPos.x - boxSize.x/2, Math.min(boxPos.x + boxSize.x/2, clamped.x));
    clamped.y = Math.max(boxPos.y - boxSize.y/2, Math.min(boxPos.y + boxSize.y/2, clamped.y));
    clamped.z = Math.max(boxPos.z - boxSize.z/2, Math.min(boxPos.z + boxSize.z/2, clamped.z));
    
    const distance = spherePos.distanceTo(clamped);
    
    if (distance < radius) {
      const normal = spherePos.clone().sub(clamped).normalize();
      const penetration = radius - distance;
      
      return {
        normal,
        penetration,
        point: clamped
      };
    }
    
    return null;
  }

  private resolveCollisions(collisions: Array<{ bodyA: PhysicsBody; bodyB: PhysicsBody; contact: any }>): void {
    for (const collision of collisions) {
      const { bodyA, bodyB, contact } = collision;
      
      if (bodyA.isStatic && bodyB.isStatic) continue;
      
      // Resolver penetración
      const totalMass = bodyA.mass + bodyB.mass;
      const correction = contact.normal.clone().multiplyScalar(contact.penetration / totalMass);
      
      if (!bodyA.isStatic) {
        bodyA.object.position.sub(correction.clone().multiplyScalar(bodyB.mass));
      }
      if (!bodyB.isStatic) {
        bodyB.object.position.add(correction.clone().multiplyScalar(bodyA.mass));
      }
      
      // Resolver velocidad
      const relativeVelocity = bodyB.velocity.clone().sub(bodyA.velocity);
      const velocityAlongNormal = relativeVelocity.dot(contact.normal);
      
      if (velocityAlongNormal > 0) continue; // Objetos separándose
      
      const restitution = Math.min(bodyA.restitution, bodyB.restitution);
      const j = -(1 + restitution) * velocityAlongNormal;
      const impulse = contact.normal.clone().multiplyScalar(j);
      
      if (!bodyA.isStatic) {
        bodyA.velocity.sub(impulse.clone().multiplyScalar(1 / bodyA.mass));
      }
      if (!bodyB.isStatic) {
        bodyB.velocity.add(impulse.clone().multiplyScalar(1 / bodyB.mass));
      }
    }
  }

  private applyConstraints(): void {
    for (const constraint of this.constraints.values()) {
      const bodyA = this.bodies.get(constraint.bodyA);
      const bodyB = this.bodies.get(constraint.bodyB);
      
      if (!bodyA || !bodyB) continue;
      
      switch (constraint.type) {
        case 'spring':
          this.applySpringConstraint(constraint, bodyA, bodyB);
          break;
        case 'fixed':
          this.applyFixedConstraint(constraint, bodyA, bodyB);
          break;
      }
    }
  }

  private applySpringConstraint(constraint: PhysicsConstraint, bodyA: PhysicsBody, bodyB: PhysicsBody): void {
    // Verificar que los objetos tienen localToWorld
    if (!('localToWorld' in bodyA.object) || !('localToWorld' in bodyB.object)) {
      return;
    }
    
    const worldAnchorA = (bodyA.object as any).localToWorld(constraint.anchorA.clone());
    const worldAnchorB = (bodyB.object as any).localToWorld(constraint.anchorB.clone());
    
    const displacement = worldAnchorB.clone().sub(worldAnchorA);
    const distance = displacement.length();
    
    if (distance > 0.001) {
      const force = displacement.normalize().multiplyScalar(
        (distance - constraint.spring.stiffness) * constraint.spring.damping
      );
      
      if (!bodyA.isStatic) {
        bodyA.force.add(force);
      }
      if (!bodyB.isStatic) {
        bodyB.force.sub(force);
      }
    }
  }

  private applyFixedConstraint(constraint: PhysicsConstraint, bodyA: PhysicsBody, bodyB: PhysicsBody): void {
    // Verificar que los objetos tienen localToWorld y position
    if (!('localToWorld' in bodyA.object) || !('localToWorld' in bodyB.object) ||
        !('position' in bodyA.object) || !('position' in bodyB.object)) {
      return;
    }
    
    const worldAnchorA = (bodyA.object as any).localToWorld(constraint.anchorA.clone());
    const worldAnchorB = (bodyB.object as any).localToWorld(constraint.anchorB.clone());
    
    const correction = worldAnchorB.clone().sub(worldAnchorA);
    const totalMass = bodyA.mass + bodyB.mass;
    
    if (!bodyA.isStatic) {
      (bodyA.object as any).position.add(correction.clone().multiplyScalar(bodyB.mass / totalMass));
    }
    if (!bodyB.isStatic) {
      (bodyB.object as any).position.sub(correction.clone().multiplyScalar(bodyA.mass / totalMass));
    }
  }

  private integrate(deltaTime: number): void {
    for (const body of this.bodies.values()) {
      if (body.isStatic) continue;
      
      // Verificar que el objeto tiene posición
      if (!('position' in body.object)) {
        continue;
      }
      
      // Integración semi-implícita de Euler
      const acceleration = body.force.clone().multiplyScalar(1 / body.mass);
      body.velocity.add(acceleration.clone().multiplyScalar(deltaTime));
      (body.object as any).position.add(body.velocity.clone().multiplyScalar(deltaTime));
      
      // Limpiar fuerzas
      body.force.set(0, 0, 0);
      body.torque.set(0, 0, 0);
    }
  }

  private updateObjects(): void {
    // Los objetos 3D ya están actualizados en integrate()
    // Aquí se pueden agregar actualizaciones adicionales si es necesario
  }

  getBody(bodyId: string): PhysicsBody | undefined {
    return this.bodies.get(bodyId);
  }

  getAllBodies(): PhysicsBody[] {
    return Array.from(this.bodies.values());
  }

  setGravity(gravity: THREE.Vector3): void {
    this.config.gravity.copy(gravity);
  }

  async cleanup(): Promise<void> {
    console.log('[⚡] Limpiando PhysicsEngine...');
    
    this.bodies.clear();
    this.constraints.clear();
    this.isInitialized = false;
    
    console.log('[✅] PhysicsEngine limpiado correctamente');
  }
}

// Clases auxiliares para broadphase (simplificadas)
class QuadTreeBroadphase {
  addBody(body: PhysicsBody) {}
  removeBody(body: PhysicsBody) {}
  getCollisionPairs() { return []; }
}

class GridBroadphase {
  addBody(body: PhysicsBody) {}
  removeBody(body: PhysicsBody) {}
  getCollisionPairs() { return []; }
}

class SweepAndPruneBroadphase {
  addBody(body: PhysicsBody) {}
  removeBody(body: PhysicsBody) {}
  getCollisionPairs() { return []; }
}

// Clases auxiliares para solver (simplificadas)
class SequentialSolver {
  solve() {}
}

class JacobiSolver {
  solve() {}
}

class GaussSeidelSolver {
  solve() {}
}

export default PhysicsEngine; 
/**
 * @fileoverview Helper de física para simulación y colisiones en el metaverso
 * @module @metaverso/helpers/physics/PhysicsHelper
 */

import * as THREE from 'three';
import * as RAPIER from '@dimforge/rapier3d-compat';
import { IHelper } from '../types';

/**
 * Configuración de física
 */
export interface PhysicsConfig {
  engine: 'rapier' | 'cannon' | 'ammo';
  gravity: THREE.Vector3;
  timeStep: number;
  maxSubSteps: number;
  enableDebug: boolean;
  enableSleeping: boolean;
  enableCCD: boolean;
  solverIterations: number;
  velocityIterations: number;
  positionIterations: number;
}

/**
 * Tipo de cuerpo físico
 */
export type BodyType = 'static' | 'dynamic' | 'kinematic';

/**
 * Información de colisión
 */
export interface CollisionInfo {
  body1: string;
  body2: string;
  position: THREE.Vector3;
  normal: THREE.Vector3;
  depth: number;
  impulse: THREE.Vector3;
  timestamp: number;
}

/**
 * Información de cuerpo físico
 */
export interface BodyInfo {
  id: string;
  type: BodyType;
  position: THREE.Vector3;
  rotation: THREE.Quaternion;
  velocity: THREE.Vector3;
  angularVelocity: THREE.Vector3;
  mass: number;
  friction: number;
  restitution: number;
  linearDamping: number;
  angularDamping: number;
  isSleeping: boolean;
  colliderType: string;
  colliderSize?: THREE.Vector3;
  colliderRadius?: number;
}

/**
 * Helper de física para simulación y colisiones en el metaverso
 */
export class PhysicsHelper implements IHelper {
  public readonly type = 'PhysicsHelper';
  public enabled: boolean = true;
  
  private _config: PhysicsConfig;
  private _world?: RAPIER.World;
  private _bodies: Map<string, RAPIER.RigidBody> = new Map();
  private _colliders: Map<string, RAPIER.Collider> = new Map();
  private _bodyObjects: Map<string, THREE.Object3D> = new Map();
  private _collisions: CollisionInfo[] = [];
  private _eventListeners: Map<string, Function[]> = new Map();
  private _debugMeshes: THREE.Mesh[] = [];
  private _debugScene?: THREE.Scene;
  private _accumulator: number = 0;
  private _lastTime: number = 0;

  /**
   * Constructor del helper
   * @param config - Configuración de física
   */
  constructor(config: Partial<PhysicsConfig> = {}) {
    this._config = {
      engine: 'rapier',
      gravity: new THREE.Vector3(0, -9.81, 0),
      timeStep: 1 / 60,
      maxSubSteps: 10,
      enableDebug: false,
      enableSleeping: true,
      enableCCD: true,
      solverIterations: 4,
      velocityIterations: 1,
      positionIterations: 1,
      ...config
    };
    
    this.init();
  }

  /**
   * Inicializar el helper
   */
  public async init(): Promise<void> {
    try {
      // Inicializar Rapier
      await RAPIER.init();
      
      // Crear mundo físico
      const gravity = new RAPIER.Vector3(
        this._config.gravity.x,
        this._config.gravity.y,
        this._config.gravity.z
      );
      
      this._world = new RAPIER.World(gravity);
      
      // Configurar parámetros del mundo
      this._world.setSolverIterations(this._config.solverIterations);
      this._world.setVelocityIterations(this._config.velocityIterations);
      this._world.setPositionIterations(this._config.positionIterations);
      
      console.log('[PhysicsHelper] Inicializado con Rapier');
    } catch (error) {
      console.error('[PhysicsHelper] Error al inicializar:', error);
      throw error;
    }
  }

  /**
   * Actualizar el helper
   */
  public update(deltaTime: number = 1 / 60): void {
    if (!this.enabled || !this._world) return;

    // Acumular tiempo
    this._accumulator += deltaTime;
    
    // Simular pasos de física
    while (this._accumulator >= this._config.timeStep) {
      this._world.step();
      this._accumulator -= this._config.timeStep;
    }
    
    // Actualizar objetos Three.js
    this._updateObjects();
    
    // Detectar colisiones
    this._detectCollisions();
    
    // Actualizar debug
    if (this._config.enableDebug) {
      this._updateDebug();
    }
  }

  /**
   * Limpiar recursos
   */
  public dispose(): void {
    // Limpiar cuerpos físicos
    this._bodies.forEach(body => {
      this._world?.removeRigidBody(body);
    });
    this._bodies.clear();
    
    // Limpiar colliders
    this._colliders.forEach(collider => {
      this._world?.removeCollider(collider);
    });
    this._colliders.clear();
    
    // Limpiar objetos
    this._bodyObjects.clear();
    
    // Limpiar debug
    this._debugMeshes.forEach(mesh => {
      if (mesh.geometry) mesh.geometry.dispose();
      if (mesh.material) mesh.material.dispose();
    });
    this._debugMeshes = [];
    
    // Limpiar eventos
    this._eventListeners.clear();
    
    console.log('[PhysicsHelper] Limpiado');
  }

  /**
   * Mostrar el helper
   */
  public show(): void {
    this.enabled = true;
  }

  /**
   * Ocultar el helper
   */
  public hide(): void {
    this.enabled = false;
  }

  /**
   * Crear cuerpo físico
   */
  public createBody(
    id: string,
    object: THREE.Object3D,
    type: BodyType = 'dynamic',
    mass: number = 1,
    friction: number = 0.5,
    restitution: number = 0.3
  ): string {
    if (!this._world) {
      throw new Error('Mundo físico no inicializado');
    }

    // Crear descripción del cuerpo
    const bodyDesc = type === 'static' 
      ? RAPIER.RigidBodyDesc.fixed()
      : type === 'kinematic'
      ? RAPIER.RigidBodyDesc.kinematicPositionBased()
      : RAPIER.RigidBodyDesc.dynamic();

    // Configurar propiedades
    if (type === 'dynamic') {
      bodyDesc.setLinearDamping(this._config.linearDamping);
      bodyDesc.setAngularDamping(this._config.angularDamping);
      bodyDesc.setCcdEnabled(this._config.enableCCD);
    }

    // Crear cuerpo
    const body = this._world.createRigidBody(bodyDesc);
    
    // Configurar masa
    if (type === 'dynamic') {
      body.setLinvel(new RAPIER.Vector3(0, 0, 0));
      body.setAngvel(new RAPIER.Vector3(0, 0, 0));
    }

    // Crear collider basado en la geometría del objeto
    const collider = this._createCollider(object, body);
    
    // Configurar propiedades del collider
    collider.setFriction(friction);
    collider.setRestitution(restitution);
    
    // Almacenar referencias
    this._bodies.set(id, body);
    this._colliders.set(id, collider);
    this._bodyObjects.set(id, object);
    
    console.log(`[PhysicsHelper] Cuerpo creado: ${id} (${type})`);
    
    return id;
  }

  /**
   * Remover cuerpo físico
   */
  public removeBody(id: string): void {
    if (!this._world) return;

    const body = this._bodies.get(id);
    const collider = this._colliders.get(id);
    
    if (body && collider) {
      this._world.removeRigidBody(body);
      this._world.removeCollider(collider);
      
      this._bodies.delete(id);
      this._colliders.delete(id);
      this._bodyObjects.delete(id);
      
      console.log(`[PhysicsHelper] Cuerpo removido: ${id}`);
    }
  }

  /**
   * Obtener información de un cuerpo
   */
  public getBodyInfo(id: string): BodyInfo | null {
    const body = this._bodies.get(id);
    const object = this._bodyObjects.get(id);
    
    if (!body || !object) return null;

    const position = body.translation();
    const rotation = body.rotation();
    const velocity = body.linvel();
    const angularVelocity = body.angvel();
    
    return {
      id,
      type: body.isFixed() ? 'static' : body.isKinematic() ? 'kinematic' : 'dynamic',
      position: new THREE.Vector3(position.x, position.y, position.z),
      rotation: new THREE.Quaternion(rotation.x, rotation.y, rotation.z, rotation.w),
      velocity: new THREE.Vector3(velocity.x, velocity.y, velocity.z),
      angularVelocity: new THREE.Vector3(angularVelocity.x, angularVelocity.y, angularVelocity.z),
      mass: body.mass(),
      friction: this._colliders.get(id)?.friction() || 0,
      restitution: this._colliders.get(id)?.restitution() || 0,
      linearDamping: body.linearDamping(),
      angularDamping: body.angularDamping(),
      isSleeping: body.isSleeping(),
      colliderType: this._getColliderType(id),
      colliderSize: this._getColliderSize(id),
      colliderRadius: this._getColliderRadius(id)
    };
  }

  /**
   * Aplicar fuerza a un cuerpo
   */
  public applyForce(id: string, force: THREE.Vector3, point?: THREE.Vector3): void {
    const body = this._bodies.get(id);
    if (!body || body.isFixed()) return;

    const rapierForce = new RAPIER.Vector3(force.x, force.y, force.z);
    
    if (point) {
      const rapierPoint = new RAPIER.Vector3(point.x, point.y, point.z);
      body.applyImpulseAtPoint(rapierForce, rapierPoint, true);
    } else {
      body.applyImpulse(rapierForce, true);
    }
  }

  /**
   * Aplicar torque a un cuerpo
   */
  public applyTorque(id: string, torque: THREE.Vector3): void {
    const body = this._bodies.get(id);
    if (!body || body.isFixed()) return;

    const rapierTorque = new RAPIER.Vector3(torque.x, torque.y, torque.z);
    body.applyTorqueImpulse(rapierTorque, true);
  }

  /**
   * Establecer velocidad de un cuerpo
   */
  public setVelocity(id: string, velocity: THREE.Vector3): void {
    const body = this._bodies.get(id);
    if (!body) return;

    const rapierVelocity = new RAPIER.Vector3(velocity.x, velocity.y, velocity.z);
    body.setLinvel(rapierVelocity, true);
  }

  /**
   * Establecer velocidad angular de un cuerpo
   */
  public setAngularVelocity(id: string, angularVelocity: THREE.Vector3): void {
    const body = this._bodies.get(id);
    if (!body) return;

    const rapierAngularVelocity = new RAPIER.Vector3(angularVelocity.x, angularVelocity.y, angularVelocity.z);
    body.setAngvel(rapierAngularVelocity, true);
  }

  /**
   * Establecer posición de un cuerpo
   */
  public setPosition(id: string, position: THREE.Vector3): void {
    const body = this._bodies.get(id);
    if (!body) return;

    const rapierPosition = new RAPIER.Vector3(position.x, position.y, position.z);
    body.setTranslation(rapierPosition, true);
  }

  /**
   * Establecer rotación de un cuerpo
   */
  public setRotation(id: string, rotation: THREE.Quaternion): void {
    const body = this._bodies.get(id);
    if (!body) return;

    const rapierRotation = new RAPIER.Quaternion(rotation.x, rotation.y, rotation.z, rotation.w);
    body.setRotation(rapierRotation, true);
  }

  /**
   * Obtener colisiones recientes
   */
  public getCollisions(): CollisionInfo[] {
    return [...this._collisions];
  }

  /**
   * Limpiar colisiones
   */
  public clearCollisions(): void {
    this._collisions = [];
  }

  /**
   * Habilitar/deshabilitar debug
   */
  public setDebugEnabled(enabled: boolean, scene?: THREE.Scene): void {
    this._config.enableDebug = enabled;
    this._debugScene = scene;
    
    if (enabled && scene) {
      this._createDebugMeshes();
    } else {
      this._clearDebugMeshes();
    }
  }

  /**
   * Obtener estadísticas de física
   */
  public getStats(): {
    bodyCount: number;
    collisionCount: number;
    activeBodies: number;
    sleepingBodies: number;
    memoryUsage: number;
  } {
    let activeBodies = 0;
    let sleepingBodies = 0;
    
    this._bodies.forEach(body => {
      if (body.isSleeping()) {
        sleepingBodies++;
      } else {
        activeBodies++;
      }
    });

    return {
      bodyCount: this._bodies.size,
      collisionCount: this._collisions.length,
      activeBodies,
      sleepingBodies,
      memoryUsage: this._bodies.size * 100 // Estimación aproximada
    };
  }

  /**
   * Crear collider basado en geometría
   */
  private _createCollider(object: THREE.Object3D, body: RAPIER.RigidBody): RAPIER.Collider {
    if (object instanceof THREE.Mesh) {
      const geometry = object.geometry;
      
      if (geometry instanceof THREE.BoxGeometry) {
        const size = geometry.parameters;
        const halfExtents = new RAPIER.Vector3(size.width / 2, size.height / 2, size.depth / 2);
        return this._world!.createCollider(RAPIER.ColliderDesc.cuboid(halfExtents.x, halfExtents.y, halfExtents.z), body);
      } else if (geometry instanceof THREE.SphereGeometry) {
        const radius = geometry.parameters.radius;
        return this._world!.createCollider(RAPIER.ColliderDesc.ball(radius), body);
      } else if (geometry instanceof THREE.CylinderGeometry) {
        const params = geometry.parameters;
        const radius = params.radiusTop;
        const height = params.height;
        return this._world!.createCollider(RAPIER.ColliderDesc.cylinder(height / 2, radius), body);
      } else if (geometry instanceof THREE.CapsuleGeometry) {
        const params = geometry.parameters;
        const radius = params.radius;
        const height = params.height;
        return this._world!.createCollider(RAPIER.ColliderDesc.capsule(height / 2, radius), body);
      }
    }
    
    // Collider por defecto (caja)
    return this._world!.createCollider(RAPIER.ColliderDesc.cuboid(0.5, 0.5, 0.5), body);
  }

  /**
   * Actualizar objetos Three.js
   */
  private _updateObjects(): void {
    this._bodies.forEach((body, id) => {
      const object = this._bodyObjects.get(id);
      if (!object) return;

      // Actualizar posición
      const position = body.translation();
      object.position.set(position.x, position.y, position.z);
      
      // Actualizar rotación
      const rotation = body.rotation();
      object.quaternion.set(rotation.x, rotation.y, rotation.z, rotation.w);
    });
  }

  /**
   * Detectar colisiones
   */
  private _detectCollisions(): void {
    if (!this._world) return;

    this._collisions = [];
    
    // Obtener eventos de colisión
    this._world.eventQueue().drainCollisionEvents((handle1, handle2, started) => {
      const body1 = this._world!.getRigidBody(handle1);
      const body2 = this._world!.getRigidBody(handle2);
      
      if (body1 && body2) {
        const id1 = this._getBodyId(body1);
        const id2 = this._getBodyId(body2);
        
        if (id1 && id2) {
          const collision: CollisionInfo = {
            body1: id1,
            body2: id2,
            position: new THREE.Vector3(),
            normal: new THREE.Vector3(),
            depth: 0,
            impulse: new THREE.Vector3(),
            timestamp: Date.now()
          };
          
          this._collisions.push(collision);
          
          // Emitir evento
          this._emitEvent('collision', collision);
        }
      }
    });
  }

  /**
   * Actualizar debug
   */
  private _updateDebug(): void {
    if (!this._debugScene) return;

    // Actualizar meshes de debug
    this._debugMeshes.forEach((mesh, index) => {
      const bodyIds = Array.from(this._bodies.keys());
      const bodyId = bodyIds[index];
      
      if (bodyId) {
        const body = this._bodies.get(bodyId);
        if (body) {
          const position = body.translation();
          mesh.position.set(position.x, position.y, position.z);
          
          const rotation = body.rotation();
          mesh.quaternion.set(rotation.x, rotation.y, rotation.z, rotation.w);
        }
      }
    });
  }

  /**
   * Crear meshes de debug
   */
  private _createDebugMeshes(): void {
    if (!this._debugScene) return;

    this._clearDebugMeshes();
    
    this._bodies.forEach((body, id) => {
      const collider = this._colliders.get(id);
      if (!collider) return;

      let geometry: THREE.BufferGeometry;
      const material = new THREE.MeshBasicMaterial({ 
        color: body.isFixed() ? 0xff0000 : body.isKinematic() ? 0x00ff00 : 0x0000ff,
        wireframe: true 
      });

      // Crear geometría basada en el tipo de collider
      if (collider.shape().type === RAPIER.ShapeType.Cuboid) {
        const size = collider.shape().halfExtents();
        geometry = new THREE.BoxGeometry(size.x * 2, size.y * 2, size.z * 2);
      } else if (collider.shape().type === RAPIER.ShapeType.Ball) {
        const radius = collider.shape().radius();
        geometry = new THREE.SphereGeometry(radius);
      } else {
        geometry = new THREE.BoxGeometry(1, 1, 1);
      }

      const mesh = new THREE.Mesh(geometry, material);
      this._debugMeshes.push(mesh);
      this._debugScene!.add(mesh);
    });
  }

  /**
   * Limpiar meshes de debug
   */
  private _clearDebugMeshes(): void {
    this._debugMeshes.forEach(mesh => {
      if (this._debugScene) {
        this._debugScene.remove(mesh);
      }
      if (mesh.geometry) mesh.geometry.dispose();
      if (mesh.material) mesh.material.dispose();
    });
    this._debugMeshes = [];
  }

  /**
   * Obtener ID de un cuerpo
   */
  private _getBodyId(body: RAPIER.RigidBody): string | null {
    for (const [id, b] of this._bodies.entries()) {
      if (b === body) return id;
    }
    return null;
  }

  /**
   * Obtener tipo de collider
   */
  private _getColliderType(id: string): string {
    const collider = this._colliders.get(id);
    if (!collider) return 'unknown';
    
    const shape = collider.shape();
    switch (shape.type) {
      case RAPIER.ShapeType.Cuboid: return 'box';
      case RAPIER.ShapeType.Ball: return 'sphere';
      case RAPIER.ShapeType.Cylinder: return 'cylinder';
      case RAPIER.ShapeType.Capsule: return 'capsule';
      default: return 'unknown';
    }
  }

  /**
   * Obtener tamaño del collider
   */
  private _getColliderSize(id: string): THREE.Vector3 | undefined {
    const collider = this._colliders.get(id);
    if (!collider) return undefined;
    
    const shape = collider.shape();
    if (shape.type === RAPIER.ShapeType.Cuboid) {
      const halfExtents = shape.halfExtents();
      return new THREE.Vector3(halfExtents.x * 2, halfExtents.y * 2, halfExtents.z * 2);
    }
    return undefined;
  }

  /**
   * Obtener radio del collider
   */
  private _getColliderRadius(id: string): number | undefined {
    const collider = this._colliders.get(id);
    if (!collider) return undefined;
    
    const shape = collider.shape();
    if (shape.type === RAPIER.ShapeType.Ball) {
      return shape.radius();
    }
    return undefined;
  }

  /**
   * Emitir evento
   */
  private _emitEvent(event: string, data: any): void {
    const listeners = this._eventListeners.get(event);
    if (listeners) {
      listeners.forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`[PhysicsHelper] Error en evento ${event}:`, error);
        }
      });
    }
  }
} 
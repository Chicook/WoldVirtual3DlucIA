/**
 * Physics Helpers - Utilidades de física y colisiones para el editor 3D
 * Maneja detección de colisiones, raycasting, bounding boxes y simulaciones físicas básicas
 * Inspirado en Blender y Godot
 */

import * as THREE from 'three';

class PhysicsHelpers {
  constructor() {
    this.collisionObjects = new Map();
    this.raycaster = new THREE.Raycaster();
    this.boundingBoxes = new Map();
    this.physicsEnabled = false;
    this.gravity = new THREE.Vector3(0, -9.81, 0);
    this.timeStep = 1 / 60; // 60 FPS
    this.rigidBodies = new Map();
    this.collisionGroups = new Map();
    this.debugMode = false;
  }

  /**
   * Inicializa el sistema de física
   */
  initialize(options = {}) {
    this.physicsEnabled = options.enabled !== false;
    this.gravity = options.gravity || new THREE.Vector3(0, -9.81, 0);
    this.timeStep = options.timeStep || 1 / 60;
    this.debugMode = options.debugMode || false;

    if (this.physicsEnabled) {
      console.log('✅ Sistema de física inicializado');
    }
  }

  /**
   * Añade un objeto para detección de colisiones
   */
  addCollisionObject(object, options = {}) {
    const collisionId = this.generateCollisionId();
    const collisionData = {
      object: object,
      type: options.type || 'mesh',
      group: options.group || 'default',
      mask: options.mask || 0xFFFFFFFF,
      boundingBox: this.computeBoundingBox(object),
      isStatic: options.isStatic || false,
      mass: options.mass || 1.0,
      velocity: new THREE.Vector3(),
      acceleration: new THREE.Vector3(),
      forces: new THREE.Vector3()
    };

    this.collisionObjects.set(collisionId, collisionData);
    this.boundingBoxes.set(collisionId, collisionData.boundingBox);

    // Si es un cuerpo rígido, añadirlo a la simulación
    if (!collisionData.isStatic && this.physicsEnabled) {
      this.rigidBodies.set(collisionId, collisionData);
    }

    console.log(`✅ Objeto de colisión añadido: ${collisionId}`);
    return collisionId;
  }

  /**
   * Elimina un objeto de colisión
   */
  removeCollisionObject(collisionId) {
    if (this.collisionObjects.has(collisionId)) {
      this.collisionObjects.delete(collisionId);
      this.boundingBoxes.delete(collisionId);
      this.rigidBodies.delete(collisionId);
      console.log(`🗑️ Objeto de colisión eliminado: ${collisionId}`);
      return true;
    }
    return false;
  }

  /**
   * Calcula el bounding box de un objeto
   */
  computeBoundingBox(object) {
    const box = new THREE.Box3();
    
    if (object.geometry) {
      box.setFromObject(object);
    } else if (object.children && object.children.length > 0) {
      box.setFromObject(object);
    } else {
      // Para objetos sin geometría, usar posición
      box.setFromCenterAndSize(
        object.position,
        new THREE.Vector3(1, 1, 1)
      );
    }

    return box;
  }

  /**
   * Actualiza el bounding box de un objeto
   */
  updateBoundingBox(collisionId) {
    const collisionData = this.collisionObjects.get(collisionId);
    if (collisionData) {
      const newBox = this.computeBoundingBox(collisionData.object);
      collisionData.boundingBox = newBox;
      this.boundingBoxes.set(collisionId, newBox);
    }
  }

  /**
   * Detecta colisiones entre dos objetos
   */
  checkCollision(collisionId1, collisionId2) {
    const obj1 = this.collisionObjects.get(collisionId1);
    const obj2 = this.collisionObjects.get(collisionId2);

    if (!obj1 || !obj2) return false;

    // Verificar grupos de colisión
    if (!this.checkCollisionGroups(obj1.group, obj2.group)) {
      return false;
    }

    // Detectar colisión usando bounding boxes
    return obj1.boundingBox.intersectsBox(obj2.boundingBox);
  }

  /**
   * Verifica si los grupos de colisión pueden colisionar
   */
  checkCollisionGroups(group1, group2) {
    const group1Data = this.collisionGroups.get(group1);
    const group2Data = this.collisionGroups.get(group2);

    if (!group1Data || !group2Data) return true; // Por defecto, colisionan

    return group1Data.canCollideWith.includes(group2) && 
           group2Data.canCollideWith.includes(group1);
  }

  /**
   * Realiza raycasting desde un punto en una dirección
   */
  raycast(origin, direction, maxDistance = Infinity, collisionGroup = 'default') {
    this.raycaster.set(origin, direction);
    this.raycaster.far = maxDistance;

    const objects = Array.from(this.collisionObjects.values())
      .filter(data => data.group === collisionGroup)
      .map(data => data.object);

    const intersects = this.raycaster.intersectObjects(objects, true);

    return intersects.map(intersection => ({
      point: intersection.point,
      distance: intersection.distance,
      face: intersection.face,
      object: intersection.object,
      collisionId: this.getCollisionIdFromObject(intersection.object)
    }));
  }

  /**
   * Obtiene el ID de colisión de un objeto
   */
  getCollisionIdFromObject(object) {
    for (const [id, data] of this.collisionObjects.entries()) {
      if (data.object === object) {
        return id;
      }
    }
    return null;
  }

  /**
   * Aplica una fuerza a un objeto
   */
  applyForce(collisionId, force) {
    const collisionData = this.collisionObjects.get(collisionId);
    if (collisionData && !collisionData.isStatic) {
      collisionData.forces.add(force);
    }
  }

  /**
   * Aplica un impulso a un objeto
   */
  applyImpulse(collisionId, impulse) {
    const collisionData = this.collisionObjects.get(collisionId);
    if (collisionData && !collisionData.isStatic) {
      collisionData.velocity.add(impulse.clone().divideScalar(collisionData.mass));
    }
  }

  /**
   * Actualiza la simulación física
   */
  update(deltaTime = this.timeStep) {
    if (!this.physicsEnabled) return;

    // Actualizar cuerpos rígidos
    for (const [id, body] of this.rigidBodies) {
      this.updateRigidBody(body, deltaTime);
    }

    // Detectar colisiones
    this.detectCollisions();

    // Actualizar bounding boxes
    this.updateAllBoundingBoxes();
  }

  /**
   * Actualiza un cuerpo rígido individual
   */
  updateRigidBody(body, deltaTime) {
    // Aplicar gravedad
    const gravityForce = this.gravity.clone().multiplyScalar(body.mass);
    body.forces.add(gravityForce);

    // Calcular aceleración (F = ma)
    body.acceleration.copy(body.forces).divideScalar(body.mass);

    // Actualizar velocidad
    body.velocity.add(body.acceleration.clone().multiplyScalar(deltaTime));

    // Actualizar posición
    body.object.position.add(body.velocity.clone().multiplyScalar(deltaTime));

    // Limpiar fuerzas
    body.forces.set(0, 0, 0);
  }

  /**
   * Detecta todas las colisiones
   */
  detectCollisions() {
    const collisionIds = Array.from(this.collisionObjects.keys());
    
    for (let i = 0; i < collisionIds.length; i++) {
      for (let j = i + 1; j < collisionIds.length; j++) {
        const id1 = collisionIds[i];
        const id2 = collisionIds[j];
        
        if (this.checkCollision(id1, id2)) {
          this.handleCollision(id1, id2);
        }
      }
    }
  }

  /**
   * Maneja una colisión entre dos objetos
   */
  handleCollision(collisionId1, collisionId2) {
    const obj1 = this.collisionObjects.get(collisionId1);
    const obj2 = this.collisionObjects.get(collisionId2);

    if (!obj1 || !obj2) return;

    // Calcular normal de colisión
    const center1 = obj1.boundingBox.getCenter(new THREE.Vector3());
    const center2 = obj2.boundingBox.getCenter(new THREE.Vector3());
    const normal = center2.clone().sub(center1).normalize();

    // Resolver colisión (método simple)
    if (!obj1.isStatic && !obj2.isStatic) {
      // Ambos objetos se mueven
      const separation = 0.1; // Distancia mínima de separación
      const moveDistance = separation / 2;
      
      obj1.object.position.sub(normal.clone().multiplyScalar(moveDistance));
      obj2.object.position.add(normal.clone().multiplyScalar(moveDistance));
    } else if (!obj1.isStatic) {
      // Solo obj1 se mueve
      const separation = 0.1;
      obj1.object.position.sub(normal.clone().multiplyScalar(separation));
    } else if (!obj2.isStatic) {
      // Solo obj2 se mueve
      const separation = 0.1;
      obj2.object.position.add(normal.clone().multiplyScalar(separation));
    }

    if (this.debugMode) {
      console.log(`💥 Colisión detectada: ${collisionId1} ↔ ${collisionId2}`);
    }
  }

  /**
   * Actualiza todos los bounding boxes
   */
  updateAllBoundingBoxes() {
    for (const [id, data] of this.collisionObjects) {
      this.updateBoundingBox(id);
    }
  }

  /**
   * Crea un grupo de colisión
   */
  createCollisionGroup(name, canCollideWith = []) {
    this.collisionGroups.set(name, {
      name: name,
      canCollideWith: canCollideWith,
      objects: new Set()
    });
    console.log(`📦 Grupo de colisión creado: ${name}`);
  }

  /**
   * Añade un objeto a un grupo de colisión
   */
  addObjectToCollisionGroup(collisionId, groupName) {
    const collisionData = this.collisionObjects.get(collisionId);
    const group = this.collisionGroups.get(groupName);

    if (collisionData && group) {
      collisionData.group = groupName;
      group.objects.add(collisionId);
      console.log(`📦 Objeto añadido al grupo: ${groupName}`);
    }
  }

  /**
   * Genera un ID único para colisiones
   */
  generateCollisionId() {
    return `collision_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Obtiene información de debug del sistema de física
   */
  getDebugInfo() {
    return {
      totalObjects: this.collisionObjects.size,
      rigidBodies: this.rigidBodies.size,
      collisionGroups: this.collisionGroups.size,
      physicsEnabled: this.physicsEnabled,
      debugMode: this.debugMode,
      gravity: this.gravity.toArray()
    };
  }

  /**
   * Activa/desactiva el modo debug
   */
  setDebugMode(enabled) {
    this.debugMode = enabled;
    console.log(`🔍 Modo debug ${enabled ? 'activado' : 'desactivado'}`);
  }

  /**
   * Limpia todos los recursos
   */
  dispose() {
    this.collisionObjects.clear();
    this.boundingBoxes.clear();
    this.rigidBodies.clear();
    this.collisionGroups.clear();
    this.physicsEnabled = false;
    console.log('🧹 Physics Helpers limpiado');
  }
}

export { PhysicsHelpers }; 
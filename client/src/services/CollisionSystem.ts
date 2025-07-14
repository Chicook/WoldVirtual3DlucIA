import * as THREE from 'three';

export interface CollisionObject {
  id: string;
  mesh: THREE.Object3D;
  boundingBox: THREE.Box3;
  isStatic: boolean;
}

export interface CollisionResult {
  collided: boolean;
  distance: number;
  normal: THREE.Vector3;
  object: CollisionObject | null;
}

class CollisionSystem {
  private collisionObjects: Map<string, CollisionObject> = new Map();
  private raycaster: THREE.Raycaster;
  // private tempVector: THREE.Vector3;
  private tempBox: THREE.Box3;

  constructor() {
    this.raycaster = new THREE.Raycaster();
    // this.tempVector = new THREE.Vector3();
    this.tempBox = new THREE.Box3();
  }

  /**
   * Añadir objeto para detección de colisiones
   */
  addCollisionObject(id: string, mesh: THREE.Object3D, isStatic: boolean = true): void {
    // Calcular bounding box
    this.tempBox.setFromObject(mesh);
    
    const collisionObject: CollisionObject = {
      id,
      mesh,
      boundingBox: this.tempBox.clone(),
      isStatic
    };

    this.collisionObjects.set(id, collisionObject);
  }

  /**
   * Remover objeto de colisión
   */
  removeCollisionObject(id: string): boolean {
    return this.collisionObjects.delete(id);
  }

  /**
   * Actualizar bounding box de un objeto
   */
  updateCollisionObject(id: string): void {
    const obj = this.collisionObjects.get(id);
    if (obj) {
      this.tempBox.setFromObject(obj.mesh);
      obj.boundingBox.copy(this.tempBox);
    }
  }

  /**
   * Verificar colisión con un punto
   */
  checkPointCollision(point: THREE.Vector3): CollisionResult {
    let closestDistance = Infinity;
    let closestObject: CollisionObject | null = null;
    let closestNormal = new THREE.Vector3();

    for (const [_, obj] of this.collisionObjects) {
      // Verificar si el punto está dentro del bounding box
      if (obj.boundingBox.containsPoint(point)) {
        // Calcular distancia al centro del objeto
        const center = new THREE.Vector3();
        obj.boundingBox.getCenter(center);
        const distance = point.distanceTo(center);
        
        if (distance < closestDistance) {
          closestDistance = distance;
          closestObject = obj;
          closestNormal.copy(point).sub(center).normalize();
        }
      }
    }

    return {
      collided: closestObject !== null,
      distance: closestDistance,
      normal: closestNormal,
      object: closestObject
    };
  }

  /**
   * Verificar colisión con un rayo (para movimiento)
   */
  checkRayCollision(
    origin: THREE.Vector3, 
    direction: THREE.Vector3, 
    distance: number
  ): CollisionResult {
    this.raycaster.set(origin, direction);
    this.raycaster.far = distance;

    const meshes: THREE.Mesh[] = [];
    for (const [_, obj] of this.collisionObjects) {
      if (obj.mesh instanceof THREE.Mesh) {
        meshes.push(obj.mesh);
      }
    }

    const intersects = this.raycaster.intersectObjects(meshes, false);

    if (intersects.length > 0) {
      const intersection = intersects[0];
      const objectId = intersection.object.userData?.id;
      const collisionObject = objectId ? this.collisionObjects.get(objectId) : null;

      return {
        collided: true,
        distance: intersection.distance,
        normal: intersection.face?.normal || new THREE.Vector3(),
        object: collisionObject || null
      };
    }

    return {
      collided: false,
      distance: distance,
      normal: new THREE.Vector3(),
      object: null
    };
  }

  /**
   * Verificar si una posición es válida (sin colisiones)
   */
  isValidPosition(position: THREE.Vector3): boolean {
    const collision = this.checkPointCollision(position);
    return !collision.collided;
  }

  /**
   * Obtener posición válida más cercana
   */
  getValidPosition(
    desiredPosition: THREE.Vector3, 
    radius: number = 0.5,
    maxAttempts: number = 8
  ): THREE.Vector3 {
    if (this.isValidPosition(desiredPosition)) {
      return desiredPosition.clone();
    }

    // Intentar posiciones en círculo alrededor del punto deseado
    for (let i = 0; i < maxAttempts; i++) {
      const angle = (i / maxAttempts) * Math.PI * 2;
      const offset = new THREE.Vector3(
        Math.cos(angle) * radius * 2,
        0,
        Math.sin(angle) * radius * 2
      );
      
      const testPosition = desiredPosition.clone().add(offset);
      if (this.isValidPosition(testPosition)) {
        return testPosition;
      }
    }

    // Si no se encuentra posición válida, devolver la original
    return desiredPosition.clone();
  }

  /**
   * Aplicar colisión a movimiento del avatar
   */
  applyCollisionToMovement(
    currentPosition: THREE.Vector3,
    desiredPosition: THREE.Vector3,
    radius: number = 0.5
  ): THREE.Vector3 {
    const direction = desiredPosition.clone().sub(currentPosition);
    const distance = direction.length();

    if (distance === 0) return currentPosition.clone();

    direction.normalize();

    // Verificar colisión en la dirección del movimiento
    const collision = this.checkRayCollision(currentPosition, direction, distance);

    if (collision.collided && collision.distance < distance) {
      // Hay colisión, ajustar posición
      const safeDistance = Math.max(0, collision.distance - radius);
      return currentPosition.clone().add(direction.multiplyScalar(safeDistance));
    }

    return desiredPosition.clone();
  }

  /**
   * Limpiar todos los objetos de colisión
   */
  clearAllCollisionObjects(): void {
    this.collisionObjects.clear();
  }

  /**
   * Obtener información de debug
   */
  getDebugInfo(): { totalObjects: number; staticObjects: number; dynamicObjects: number } {
    let staticCount = 0;
    let dynamicCount = 0;

    for (const [_, obj] of this.collisionObjects) {
      if (obj.isStatic) {
        staticCount++;
      } else {
        dynamicCount++;
      }
    }

    return {
      totalObjects: this.collisionObjects.size,
      staticObjects: staticCount,
      dynamicObjects: dynamicCount
    };
  }

  /**
   * Visualizar bounding boxes (para debug)
   */
  createBoundingBoxVisualization(): THREE.Group {
    const group = new THREE.Group();
    
    for (const [_, obj] of this.collisionObjects) {
      const box = new THREE.Box3Helper(obj.boundingBox, 0xff0000);
      group.add(box);
    }

    return group;
  }
}

export const collisionSystem = new CollisionSystem(); 
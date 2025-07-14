import * as THREE from 'three';

export interface InteractiveObject {
  id: string;
  mesh: THREE.Object3D;
  interactionDistance: number;
  onInteract?: (playerPosition: THREE.Vector3) => void;
  onHover?: (isHovering: boolean) => void;
  isInteractable: boolean;
}

export interface InteractionResult {
  object: InteractiveObject | null;
  distance: number;
  canInteract: boolean;
}

class InteractionSystem {
  private interactiveObjects: Map<string, InteractiveObject> = new Map();
  private raycaster: THREE.Raycaster;
  private camera: THREE.Camera | null = null;
  private currentHoveredObject: InteractiveObject | null = null;

  constructor() {
    this.raycaster = new THREE.Raycaster();
  }

  /**
   * Configurar cámara para raycasting
   */
  setCamera(camera: THREE.Camera): void {
    this.camera = camera;
  }

  /**
   * Añadir objeto interactivo
   */
  addInteractiveObject(
    id: string,
    mesh: THREE.Object3D,
    interactionDistance: number = 3,
    onInteract?: (playerPosition: THREE.Vector3) => void,
    onHover?: (isHovering: boolean) => void
  ): void {
    const interactiveObject: InteractiveObject = {
      id,
      mesh,
      interactionDistance,
      onInteract,
      onHover,
      isInteractable: true
    };

    this.interactiveObjects.set(id, interactiveObject);
  }

  /**
   * Remover objeto interactivo
   */
  removeInteractiveObject(id: string): boolean {
    return this.interactiveObjects.delete(id);
  }

  /**
   * Actualizar interacciones (llamar en cada frame)
   */
  update(playerPosition: THREE.Vector3, mousePosition?: THREE.Vector2): InteractionResult {
    if (!this.camera || !mousePosition) {
      return { object: null, distance: 0, canInteract: false };
    }

    // Configurar raycaster desde la cámara hacia el mouse
    this.raycaster.setFromCamera(mousePosition, this.camera);

    // Obtener objetos interactivos como meshes
    const meshes: THREE.Mesh[] = [];
    for (const [_, obj] of this.interactiveObjects) {
      if (obj.mesh instanceof THREE.Mesh) {
        meshes.push(obj.mesh);
      }
    }

    // Verificar intersecciones
    const intersects = this.raycaster.intersectObjects(meshes, false);

    if (intersects.length > 0) {
      const intersection = intersects[0];
      const objectId = intersection.object.userData?.id;
      const interactiveObject = objectId ? this.interactiveObjects.get(objectId) : null;

      if (interactiveObject && interactiveObject.isInteractable) {
        const distance = playerPosition.distanceTo(intersection.point);
        const canInteract = distance <= interactiveObject.interactionDistance;

        // Manejar hover
        if (this.currentHoveredObject !== interactiveObject) {
          if (this.currentHoveredObject?.onHover) {
            this.currentHoveredObject.onHover(false);
          }
          if (interactiveObject.onHover) {
            interactiveObject.onHover(true);
          }
          this.currentHoveredObject = interactiveObject;
        }

        return {
          object: interactiveObject,
          distance,
          canInteract
        };
      }
    }

    // No hay objeto bajo el mouse
    if (this.currentHoveredObject?.onHover) {
      this.currentHoveredObject.onHover(false);
    }
    this.currentHoveredObject = null;

    return { object: null, distance: 0, canInteract: false };
  }

  /**
   * Intentar interactuar con objeto
   */
  interact(playerPosition: THREE.Vector3): boolean {
    if (this.currentHoveredObject && this.currentHoveredObject.onInteract) {
      const distance = playerPosition.distanceTo(this.currentHoveredObject.mesh.position);
      
      if (distance <= this.currentHoveredObject.interactionDistance) {
        this.currentHoveredObject.onInteract(playerPosition);
        return true;
      }
    }
    return false;
  }

  /**
   * Obtener objetos cercanos al jugador
   */
  getNearbyObjects(playerPosition: THREE.Vector3, maxDistance: number = 5): InteractiveObject[] {
    const nearby: InteractiveObject[] = [];

    for (const [_, obj] of this.interactiveObjects) {
      if (!obj.isInteractable) continue;

      const distance = playerPosition.distanceTo(obj.mesh.position);
      if (distance <= maxDistance) {
        nearby.push(obj);
      }
    }

    return nearby.sort((a, b) => {
      const distA = playerPosition.distanceTo(a.mesh.position);
      const distB = playerPosition.distanceTo(b.mesh.position);
      return distA - distB;
    });
  }

  /**
   * Crear efecto de highlight para objeto interactivo
   */
  createHighlightEffect(mesh: THREE.Mesh): THREE.Mesh {
    // Crear outline
    const outlineGeometry = mesh.geometry.clone();
    const outlineMaterial = new THREE.MeshBasicMaterial({
      color: 0x00ff00,
      side: THREE.BackSide,
      transparent: true,
      opacity: 0.5
    });

    const outline = new THREE.Mesh(outlineGeometry, outlineMaterial);
    outline.scale.multiplyScalar(1.1);
    outline.visible = false;

    // Añadir como hijo del mesh original
    mesh.add(outline);

    // Guardar referencia para control
    (mesh as any).interactionOutline = outline;

    return outline;
  }

  /**
   * Mostrar/ocultar highlight de objeto
   */
  setObjectHighlight(mesh: THREE.Mesh, visible: boolean): void {
    const outline = (mesh as any).interactionOutline;
    if (outline) {
      outline.visible = visible;
    }
  }

  /**
   * Crear efecto de partículas para objetos interactivos
   */
  createParticleEffect(position: THREE.Vector3): THREE.Points {
    const particleCount = 50;
    const particles = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount; i++) {
      particles[i * 3] = (Math.random() - 0.5) * 2;
      particles[i * 3 + 1] = Math.random() * 2;
      particles[i * 3 + 2] = (Math.random() - 0.5) * 2;
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(particles, 3));

    const material = new THREE.PointsMaterial({
      color: 0x00ff00,
      size: 0.1,
      transparent: true,
      opacity: 0.6
    });

    const points = new THREE.Points(geometry, material);
    points.position.copy(position);

    return points;
  }

  /**
   * Limpiar todos los objetos interactivos
   */
  clearAllInteractiveObjects(): void {
    this.interactiveObjects.clear();
    this.currentHoveredObject = null;
  }

  /**
   * Obtener información de debug
   */
  getDebugInfo(): { totalObjects: number; hoveredObject: string | null } {
    return {
      totalObjects: this.interactiveObjects.size,
      hoveredObject: this.currentHoveredObject?.id || null
    };
  }
}

export const interactionSystem = new InteractionSystem(); 
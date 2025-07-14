import * as THREE from 'three';

export interface GizmoObject {
  id: string;
  mesh: THREE.Object3D;
  gizmo: THREE.Group;
  isSelected: boolean;
  transformMode: 'translate' | 'rotate' | 'scale';
}

export interface GizmoEvent {
  type: 'transform' | 'select' | 'deselect' | 'mode-change';
  objectId?: string;
  position?: THREE.Vector3;
  rotation?: THREE.Euler;
  scale?: THREE.Vector3;
  mode?: TransformMode;
}

export type TransformMode = 'translate' | 'rotate' | 'scale';

class GizmoSystem {
  private gizmoObjects: Map<string, GizmoObject> = new Map();
  private _selectedGizmo: GizmoObject | null = null;
  private gizmoGroup: THREE.Group;
  private raycaster: THREE.Raycaster;
  private camera: THREE.Camera | null = null;
  private renderer: THREE.WebGLRenderer | null = null;
  private mouse: THREE.Vector2;
  private isDragging: boolean = false;
  private dragPlane: THREE.Plane | null = null;
  private dragPoint: THREE.Vector3 = new THREE.Vector3();
  private eventListeners: ((event: GizmoEvent) => void)[] = [];
  private transformMode: TransformMode = 'translate';

  constructor() {
    this.gizmoGroup = new THREE.Group();
    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2();
  }

  /**
   * Configurar cámara y renderer
   */
  setCameraAndRenderer(camera: THREE.Camera, renderer: THREE.WebGLRenderer): void {
    this.camera = camera;
    this.renderer = renderer;
  }

  /**
   * Añadir objeto para edición con gizmos
   */
  addGizmoObject(id: string, mesh: THREE.Object3D): void {
    const gizmo = this.createGizmo();
    const gizmoObject: GizmoObject = {
      id,
      mesh,
      gizmo,
      isSelected: false,
      transformMode: 'translate'
    };

    this.gizmoObjects.set(id, gizmoObject);
    this.gizmoGroup.add(gizmo);
    this.updateGizmoPosition(gizmoObject);
  }

  /**
   * Crear gizmo visual
   */
  private createGizmo(): THREE.Group {
    const gizmo = new THREE.Group();

    // Ejes de traducción (X, Y, Z)
    const axisLength = 1;
    const axisThickness = 0.05;

    // Eje X (Rojo)
    const xAxis = new THREE.Mesh(
      new THREE.CylinderGeometry(axisThickness, axisThickness, axisLength),
      new THREE.MeshBasicMaterial({ color: 0xff0000 })
    );
    xAxis.rotation.z = Math.PI / 2;
    xAxis.position.x = axisLength / 2;
    gizmo.add(xAxis);

    // Eje Y (Verde)
    const yAxis = new THREE.Mesh(
      new THREE.CylinderGeometry(axisThickness, axisThickness, axisLength),
      new THREE.MeshBasicMaterial({ color: 0x00ff00 })
    );
    yAxis.position.y = axisLength / 2;
    gizmo.add(yAxis);

    // Eje Z (Azul)
    const zAxis = new THREE.Mesh(
      new THREE.CylinderGeometry(axisThickness, axisThickness, axisLength),
      new THREE.MeshBasicMaterial({ color: 0x0000ff })
    );
    zAxis.rotation.x = Math.PI / 2;
    zAxis.position.z = axisLength / 2;
    gizmo.add(zAxis);

    // Anillos de rotación
    const ringGeometry = new THREE.TorusGeometry(0.8, 0.02, 8, 32);
    
    // Anillo X (Rotación X)
    const xRing = new THREE.Mesh(
      ringGeometry,
      new THREE.MeshBasicMaterial({ color: 0xff0000, transparent: true, opacity: 0.5 })
    );
    xRing.rotation.z = Math.PI / 2;
    gizmo.add(xRing);

    // Anillo Y (Rotación Y)
    const yRing = new THREE.Mesh(
      ringGeometry,
      new THREE.MeshBasicMaterial({ color: 0x00ff00, transparent: true, opacity: 0.5 })
    );
    gizmo.add(yRing);

    // Anillo Z (Rotación Z)
    const zRing = new THREE.Mesh(
      ringGeometry,
      new THREE.MeshBasicMaterial({ color: 0x0000ff, transparent: true, opacity: 0.5 })
    );
    zRing.rotation.x = Math.PI / 2;
    gizmo.add(zRing);

    // Cubos de escala
    const cubeGeometry = new THREE.BoxGeometry(0.1, 0.1, 0.1);
    
    // Cubo X
    const xCube = new THREE.Mesh(
      cubeGeometry,
      new THREE.MeshBasicMaterial({ color: 0xff0000 })
    );
    xCube.position.x = axisLength;
    gizmo.add(xCube);

    // Cubo Y
    const yCube = new THREE.Mesh(
      cubeGeometry,
      new THREE.MeshBasicMaterial({ color: 0x00ff00 })
    );
    yCube.position.y = axisLength;
    gizmo.add(yCube);

    // Cubo Z
    const zCube = new THREE.Mesh(
      cubeGeometry,
      new THREE.MeshBasicMaterial({ color: 0x0000ff })
    );
    zCube.position.z = axisLength;
    gizmo.add(zCube);

    return gizmo;
  }

  /**
   * Actualizar posición del gizmo
   */
  private updateGizmoPosition(gizmoObject: GizmoObject): void {
    gizmoObject.gizmo.position.copy(gizmoObject.mesh.position);
    gizmoObject.gizmo.rotation.copy(gizmoObject.mesh.rotation);
    
    // Escalar gizmo según la distancia a la cámara
    if (this.camera) {
      const distance = this.camera.position.distanceTo(gizmoObject.mesh.position);
      const scale = distance * 0.1;
      gizmoObject.gizmo.scale.setScalar(scale);
    }
  }

  /**
   * Seleccionar objeto
   */
  selectObject(id: string): void {
    // Deseleccionar objeto anterior
    if (this._selectedGizmo) {
      this._selectedGizmo.isSelected = false;
      this._selectedGizmo.gizmo.visible = false;
      this.emitEvent({
        type: 'deselect',
        objectId: this._selectedGizmo.id
      });
    }

    // Seleccionar nuevo objeto
    const gizmoObject = this.gizmoObjects.get(id);
    if (gizmoObject) {
      this._selectedGizmo = gizmoObject;
      gizmoObject.isSelected = true;
      gizmoObject.gizmo.visible = true;
      this.updateGizmoPosition(gizmoObject);
      this.emitEvent({
        type: 'select',
        objectId: id
      });
    }
  }

  /**
   * Cambiar modo de transformación
   */
  setTransformMode(mode: TransformMode): void {
    this.transformMode = mode;
    this.updateGizmoVisibility();
    
    this.emitEvent({
      type: 'mode-change',
      objectId: this._selectedGizmo?.id,
      mode
    });
  }

  /**
   * Actualizar visibilidad de elementos del gizmo según el modo
   */
  private updateGizmoVisibility(): void {
    if (!this._selectedGizmo) return;

    const gizmo = this._selectedGizmo.gizmo;
    const mode = this.transformMode;

    // Ocultar todos los elementos
    gizmo.children.forEach(child => {
      child.visible = false;
    });

    // Mostrar elementos según el modo
    switch (mode) {
      case 'translate':
        // Mostrar ejes de traducción (índices 0, 1, 2)
        gizmo.children[0].visible = true; // X axis
        gizmo.children[1].visible = true; // Y axis
        gizmo.children[2].visible = true; // Z axis
        break;
      case 'rotate':
        // Mostrar anillos de rotación (índices 3, 4, 5)
        gizmo.children[3].visible = true; // X ring
        gizmo.children[4].visible = true; // Y ring
        gizmo.children[5].visible = true; // Z ring
        break;
      case 'scale':
        // Mostrar cubos de escala (índices 6, 7, 8)
        gizmo.children[6].visible = true; // X cube
        gizmo.children[7].visible = true; // Y cube
        gizmo.children[8].visible = true; // Z cube
        break;
    }
  }

  /**
   * Manejar eventos del mouse
   */
  handleMouseDown(event: MouseEvent): void {
    if (!this.camera || !this.renderer) return;

    const rect = this.renderer.domElement.getBoundingClientRect();
    this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    this.raycaster.setFromCamera(this.mouse, this.camera);

    if (this._selectedGizmo) {
      // Verificar si se hace clic en el gizmo
      const gizmoIntersects = this.raycaster.intersectObjects(this._selectedGizmo.gizmo.children, true);
      if (gizmoIntersects.length > 0) {
        this.isDragging = true;
        this.setupDragPlane();
        return;
      }
    }

    // Verificar si se hace clic en un objeto
    const objectMeshes: THREE.Mesh[] = [];
    this.gizmoObjects.forEach(gizmoObj => {
      if (gizmoObj.mesh instanceof THREE.Mesh) {
        objectMeshes.push(gizmoObj.mesh);
      }
    });

    const intersects = this.raycaster.intersectObjects(objectMeshes, false);
    if (intersects.length > 0) {
      const objectId = intersects[0].object.userData?.id;
      if (objectId) {
        this.selectObject(objectId);
      }
    }
  }

  /**
   * Configurar plano de arrastre
   */
  private setupDragPlane(): void {
    if (!this.camera || !this._selectedGizmo) return;

    const cameraDirection = new THREE.Vector3();
    this.camera.getWorldDirection(cameraDirection);
    
    this.dragPlane = new THREE.Plane();
    this.dragPlane.setFromNormalAndCoplanarPoint(
      cameraDirection,
      this._selectedGizmo.mesh.position
    );
  }

  /**
   * Manejar movimiento del mouse
   */
  handleMouseMove(event: MouseEvent): void {
    if (!this.camera || !this.renderer || !this.isDragging || !this._selectedGizmo || !this.dragPlane) return;

    const rect = this.renderer.domElement.getBoundingClientRect();
    this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    this.raycaster.setFromCamera(this.mouse, this.camera);
    this.raycaster.ray.intersectPlane(this.dragPlane, this.dragPoint);

    this.applyTransform(this.dragPoint);
  }

  /**
   * Manejar liberación del mouse
   */
  handleMouseUp(): void {
    this.isDragging = false;
  }

  /**
   * Aplicar transformación
   */
  private applyTransform(dragPoint: THREE.Vector3): void {
    if (!this._selectedGizmo) return;

    const mode = this.transformMode;
    const mesh = this._selectedGizmo.mesh;

    switch (mode) {
      case 'translate':
        mesh.position.copy(dragPoint);
        break;
      case 'rotate':
        // Calcular rotación basada en la diferencia de posición
        const center = mesh.position.clone();
        const direction = dragPoint.clone().sub(center).normalize();
        const angle = Math.atan2(direction.x, direction.z);
        mesh.rotation.y = angle;
        break;
      case 'scale':
        // Calcular escala basada en la distancia
        const centerPos = mesh.position.clone();
        const distance = centerPos.distanceTo(dragPoint);
        const scale = Math.max(0.1, distance);
        mesh.scale.setScalar(scale);
        break;
    }

    this.updateGizmoPosition(this._selectedGizmo);

    // Emitir evento de transformación
    this.emitEvent({
      type: 'transform',
      objectId: this._selectedGizmo.id,
      position: mesh.position.clone(),
      rotation: mesh.rotation.clone(),
      scale: mesh.scale.clone()
    });
  }

  /**
   * Añadir listener de eventos
   */
  addEventListener(listener: (event: GizmoEvent) => void): void {
    this.eventListeners.push(listener);
  }

  /**
   * Remover listener de eventos
   */
  removeEventListener(listener: (event: GizmoEvent) => void): void {
    const index = this.eventListeners.indexOf(listener);
    if (index > -1) {
      this.eventListeners.splice(index, 1);
    }
  }

  /**
   * Emitir evento
   */
  private emitEvent(event: GizmoEvent): void {
    this.eventListeners.forEach(listener => listener(event));
  }

  /**
   * Obtener grupo de gizmos
   */
  getGizmoGroup(): THREE.Group {
    return this.gizmoGroup;
  }

  /**
   * Limpiar todos los gizmos
   */
  clearAllGizmos(): void {
    this.gizmoObjects.clear();
    this._selectedGizmo = null;
    this.gizmoGroup.clear();
  }

  /**
   * Obtener información de debug
   */
  getDebugInfo(): { totalObjects: number; selectedObject: string | null; transformMode: string } {
    return {
      totalObjects: this.gizmoObjects.size,
      selectedObject: this._selectedGizmo?.id || null,
      transformMode: this.transformMode
    };
  }

  public updateGizmos(): void {
    if (this._selectedGizmo) {
      this.updateGizmoPosition(this._selectedGizmo);
      this._selectedGizmo.gizmo.visible = true;
    }
  }

  public get selectedGizmo(): GizmoObject | null {
    return this._selectedGizmo;
  }
}

export const gizmoSystem = new GizmoSystem(); 
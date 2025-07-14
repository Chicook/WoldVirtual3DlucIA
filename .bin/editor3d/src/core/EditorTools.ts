import * as THREE from 'three';

// Tipos para las herramientas
export interface TransformMode {
  type: 'translate' | 'rotate' | 'scale';
  axis: 'x' | 'y' | 'z' | 'all';
  snap: boolean;
  snapValue: number;
}

export interface GridSettings {
  enabled: boolean;
  size: number;
  divisions: number;
  color: THREE.Color;
  opacity: number;
}

export interface SnapSettings {
  enabled: boolean;
  grid: boolean;
  angle: boolean;
  vertex: boolean;
  edge: boolean;
  face: boolean;
  gridSize: number;
  angleStep: number;
}

// Clase principal de herramientas del editor
export class EditorTools {
  private transformMode: TransformMode = {
    type: 'translate',
    axis: 'all',
    snap: false,
    snapValue: 1
  };

  private gridSettings: GridSettings = {
    enabled: true,
    size: 10,
    divisions: 10,
    color: new THREE.Color(0x444444),
    opacity: 0.5
  };

  private snapSettings: SnapSettings = {
    enabled: false,
    grid: true,
    angle: true,
    vertex: false,
    edge: false,
    face: false,
    gridSize: 1,
    angleStep: 15
  };

  private gridHelper: THREE.GridHelper | null = null;
  private gizmo: THREE.Object3D | null = null;
  private selectedObjects: THREE.Object3D[] = [];

  constructor() {
    this.initializeGrid();
    this.initializeGizmo();
  }

  // Inicialización de componentes

  private initializeGrid(): void {
    this.gridHelper = new THREE.GridHelper(
      this.gridSettings.size,
      this.gridSettings.divisions,
      this.gridSettings.color,
      this.gridSettings.color
    );
    this.gridHelper.material.transparent = true;
    this.gridHelper.material.opacity = this.gridSettings.opacity;
    this.gridHelper.visible = this.gridSettings.enabled;
  }

  private initializeGizmo(): void {
    this.gizmo = new THREE.Object3D();
    this.createTransformGizmo();
  }

  private createTransformGizmo(): void {
    if (!this.gizmo) return;

    // Limpiar gizmo anterior
    this.gizmo.clear();

    // Crear ejes del gizmo
    const axisLength = 1;
    const axisThickness = 0.02;

    // Eje X (Rojo)
    const xGeometry = new THREE.CylinderGeometry(axisThickness, axisThickness, axisLength, 8);
    const xMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });
    const xAxis = new THREE.Mesh(xGeometry, xMaterial);
    xAxis.rotation.z = Math.PI / 2;
    xAxis.position.x = axisLength / 2;
    this.gizmo.add(xAxis);

    // Eje Y (Verde)
    const yGeometry = new THREE.CylinderGeometry(axisThickness, axisThickness, axisLength, 8);
    const yMaterial = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
    const yAxis = new THREE.Mesh(yGeometry, yMaterial);
    yAxis.position.y = axisLength / 2;
    this.gizmo.add(yAxis);

    // Eje Z (Azul)
    const zGeometry = new THREE.CylinderGeometry(axisThickness, axisThickness, axisLength, 8);
    const zMaterial = new THREE.MeshBasicMaterial({ color: 0x0000ff });
    const zAxis = new THREE.Mesh(zGeometry, zMaterial);
    zAxis.rotation.x = Math.PI / 2;
    zAxis.position.z = axisLength / 2;
    this.gizmo.add(zAxis);

    // Puntos de control
    this.createControlPoints();
  }

  private createControlPoints(): void {
    if (!this.gizmo) return;

    const pointGeometry = new THREE.SphereGeometry(0.05, 8, 8);
    const pointMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });

    // Puntos en los extremos de los ejes
    const positions = [
      { x: 1, y: 0, z: 0 },
      { x: 0, y: 1, z: 0 },
      { x: 0, y: 0, z: 1 }
    ];

    positions.forEach(pos => {
      const point = new THREE.Mesh(pointGeometry, pointMaterial);
      point.position.set(pos.x, pos.y, pos.z);
      this.gizmo.add(point);
    });
  }

  // Métodos públicos para transformaciones

  public setTransformMode(mode: TransformMode): void {
    this.transformMode = { ...mode };
    this.updateGizmo();
  }

  public getTransformMode(): TransformMode {
    return { ...this.transformMode };
  }

  public transformObject(object: THREE.Object3D, delta: THREE.Vector3): void {
    if (!object) return;

    const snappedDelta = this.applySnap(delta);

    switch (this.transformMode.type) {
      case 'translate':
        this.translateObject(object, snappedDelta);
        break;
      case 'rotate':
        this.rotateObject(object, snappedDelta);
        break;
      case 'scale':
        this.scaleObject(object, snappedDelta);
        break;
    }
  }

  private translateObject(object: THREE.Object3D, delta: THREE.Vector3): void {
    const newPosition = object.position.clone().add(delta);
    object.position.copy(newPosition);
  }

  private rotateObject(object: THREE.Object3D, delta: THREE.Vector3): void {
    const rotationSpeed = 0.01;
    const newRotation = object.rotation.clone();
    
    newRotation.x += delta.x * rotationSpeed;
    newRotation.y += delta.y * rotationSpeed;
    newRotation.z += delta.z * rotationSpeed;
    
    object.rotation.copy(newRotation);
  }

  private scaleObject(object: THREE.Object3D, delta: THREE.Vector3): void {
    const scaleSpeed = 0.1;
    const newScale = object.scale.clone();
    
    newScale.x += delta.x * scaleSpeed;
    newScale.y += delta.y * scaleSpeed;
    newScale.z += delta.z * scaleSpeed;
    
    // Evitar escalas negativas
    newScale.x = Math.max(0.1, newScale.x);
    newScale.y = Math.max(0.1, newScale.y);
    newScale.z = Math.max(0.1, newScale.z);
    
    object.scale.copy(newScale);
  }

  // Sistema de Snap

  private applySnap(delta: THREE.Vector3): THREE.Vector3 {
    if (!this.snapSettings.enabled) return delta;

    const snapped = delta.clone();

    if (this.snapSettings.grid) {
      snapped.x = Math.round(snapped.x / this.snapSettings.gridSize) * this.snapSettings.gridSize;
      snapped.y = Math.round(snapped.y / this.snapSettings.gridSize) * this.snapSettings.gridSize;
      snapped.z = Math.round(snapped.z / this.snapSettings.gridSize) * this.snapSettings.gridSize;
    }

    return snapped;
  }

  public setSnapSettings(settings: Partial<SnapSettings>): void {
    this.snapSettings = { ...this.snapSettings, ...settings };
  }

  public getSnapSettings(): SnapSettings {
    return { ...this.snapSettings };
  }

  // Sistema de Grid

  public setGridSettings(settings: Partial<GridSettings>): void {
    this.gridSettings = { ...this.gridSettings, ...settings };
    this.updateGrid();
  }

  public getGridSettings(): GridSettings {
    return { ...this.gridSettings };
  }

  /**
   * Actualiza el grid del editor de forma segura y avanzada.
   * Elimina el grid anterior si existe, crea uno nuevo con la configuración actual,
   * y lo retorna para ser añadido a la escena si es necesario.
   * Permite futuras extensiones (diferentes tipos de grids, overlays, etc).
   */
  private updateGrid(): void {
    // Eliminar grid anterior de la escena si existe
    if (this.gridHelper) {
      if (this.gridHelper.parent) {
        this.gridHelper.parent.remove(this.gridHelper);
      }
      // Liberar recursos de geometría y material
      (this.gridHelper.material as THREE.Material | THREE.Material[] | undefined)?.dispose?.();
      (this.gridHelper.geometry as THREE.BufferGeometry | undefined)?.dispose?.();
      this.gridHelper = null;
    }

    // Crear nuevo grid con la configuración actual
    this.gridHelper = new THREE.GridHelper(
      this.gridSettings.size,
      this.gridSettings.divisions,
      this.gridSettings.color,
      this.gridSettings.color
    );
    this.gridHelper.material.transparent = true;
    this.gridHelper.material.opacity = this.gridSettings.opacity;
    this.gridHelper.visible = this.gridSettings.enabled;
    // Aquí podrías añadir overlays, helpers adicionales, etc.
  }

  public toggleGrid(): void {
    this.gridSettings.enabled = !this.gridSettings.enabled;
    if (this.gridHelper) {
      this.gridHelper.visible = this.gridSettings.enabled;
    }
  }

  // Gestión de objetos seleccionados

  public selectObjects(objects: THREE.Object3D[]): void {
    this.selectedObjects = [...objects];
    this.updateGizmoPosition();
  }

  public clearSelection(): void {
    this.selectedObjects = [];
    this.hideGizmo();
  }

  private updateGizmoPosition(): void {
    if (!this.gizmo || this.selectedObjects.length === 0) return;

    // Calcular centro de los objetos seleccionados
    const center = new THREE.Vector3();
    this.selectedObjects.forEach(obj => {
      center.add(obj.position);
    });
    center.divideScalar(this.selectedObjects.length);

    this.gizmo.position.copy(center);
    this.showGizmo();
  }

  private showGizmo(): void {
    if (this.gizmo) {
      this.gizmo.visible = true;
    }
  }

  private hideGizmo(): void {
    if (this.gizmo) {
      this.gizmo.visible = false;
    }
  }

  private updateGizmo(): void {
    // Actualizar apariencia del gizmo según el modo de transformación
    if (!this.gizmo) return;

    this.gizmo.clear();
    this.createTransformGizmo();
  }

  // Herramientas de utilidad

  public duplicateObject(object: THREE.Object3D): THREE.Object3D {
    const clone = object.clone();
    
    // Clonar geometría y material si es necesario
    if (clone instanceof THREE.Mesh) {
      clone.geometry = clone.geometry.clone();
      if (Array.isArray(clone.material)) {
        clone.material = clone.material.map(mat => mat.clone());
      } else {
        clone.material = clone.material.clone();
      }
    }

    // Mover ligeramente la copia
    clone.position.add(new THREE.Vector3(1, 0, 0));
    
    return clone;
  }

  public alignObjects(objects: THREE.Object3D[], axis: 'x' | 'y' | 'z', mode: 'min' | 'center' | 'max'): void {
    if (objects.length < 2) return;

    let targetValue: number;

    switch (mode) {
      case 'min':
        targetValue = Math.min(...objects.map(obj => obj.position[axis]));
        break;
      case 'center':
        const sum = objects.reduce((acc, obj) => acc + obj.position[axis], 0);
        targetValue = sum / objects.length;
        break;
      case 'max':
        targetValue = Math.max(...objects.map(obj => obj.position[axis]));
        break;
    }

    objects.forEach(obj => {
      obj.position[axis] = targetValue;
    });
  }

  public distributeObjects(objects: THREE.Object3D[], axis: 'x' | 'y' | 'z'): void {
    if (objects.length < 3) return;

    // Ordenar objetos por posición en el eje
    const sorted = objects.sort((a, b) => a.position[axis] - b.position[axis]);
    
    const min = sorted[0].position[axis];
    const max = sorted[sorted.length - 1].position[axis];
    const step = (max - min) / (sorted.length - 1);

    sorted.forEach((obj, index) => {
      obj.position[axis] = min + (step * index);
    });
  }

  // Herramientas de geometría

  public createPrimitive(type: 'cube' | 'sphere' | 'cylinder' | 'plane', params: any = {}): THREE.Mesh {
    let geometry: THREE.BufferGeometry;
    const material = new THREE.MeshStandardMaterial({ color: 0x888888 });

    switch (type) {
      case 'cube':
        const size = params.size || 1;
        geometry = new THREE.BoxGeometry(size, size, size);
        break;
      case 'sphere':
        const radius = params.radius || 0.5;
        const segments = params.segments || 32;
        geometry = new THREE.SphereGeometry(radius, segments, segments);
        break;
      case 'cylinder':
        const cylRadius = params.radius || 0.5;
        const height = params.height || 1;
        const cylSegments = params.segments || 32;
        geometry = new THREE.CylinderGeometry(cylRadius, cylRadius, height, cylSegments);
        break;
      case 'plane':
        const width = params.width || 1;
        const planeHeight = params.height || 1;
        geometry = new THREE.PlaneGeometry(width, planeHeight);
        break;
      default:
        geometry = new THREE.BoxGeometry(1, 1, 1);
    }

    return new THREE.Mesh(geometry, material);
  }

  // Herramientas de material

  public createMaterial(type: 'standard' | 'phong' | 'basic' | 'lambert', params: any = {}): THREE.Material {
    const baseParams = {
      color: params.color || 0x888888,
      transparent: params.transparent || false,
      opacity: params.opacity || 1.0
    };

    switch (type) {
      case 'standard':
        return new THREE.MeshStandardMaterial({
          ...baseParams,
          roughness: params.roughness || 0.5,
          metalness: params.metalness || 0.0
        });
      case 'phong':
        return new THREE.MeshPhongMaterial({
          ...baseParams,
          shininess: params.shininess || 30
        });
      case 'basic':
        return new THREE.MeshBasicMaterial(baseParams);
      case 'lambert':
        return new THREE.MeshLambertMaterial(baseParams);
      default:
        return new THREE.MeshStandardMaterial(baseParams);
    }
  }

  // Herramientas de iluminación

  public createLight(type: 'directional' | 'point' | 'spot' | 'ambient', params: any = {}): THREE.Light {
    switch (type) {
      case 'directional':
        const dirLight = new THREE.DirectionalLight(params.color || 0xffffff, params.intensity || 1);
        dirLight.position.set(params.x || 0, params.y || 1, params.z || 0);
        dirLight.castShadow = params.castShadow !== false;
        return dirLight;
      case 'point':
        const pointLight = new THREE.PointLight(params.color || 0xffffff, params.intensity || 1, params.distance || 0);
        pointLight.position.set(params.x || 0, params.y || 0, params.z || 0);
        pointLight.castShadow = params.castShadow !== false;
        return pointLight;
      case 'spot':
        const spotLight = new THREE.SpotLight(params.color || 0xffffff, params.intensity || 1);
        spotLight.position.set(params.x || 0, params.y || 1, params.z || 0);
        spotLight.angle = params.angle || Math.PI / 3;
        spotLight.penumbra = params.penumbra || 0;
        spotLight.castShadow = params.castShadow !== false;
        return spotLight;
      case 'ambient':
        return new THREE.AmbientLight(params.color || 0x404040, params.intensity || 0.6);
      default:
        return new THREE.DirectionalLight(0xffffff, 1);
    }
  }

  // Métodos de acceso a componentes

  public getGridHelper(): THREE.GridHelper | null {
    return this.gridHelper;
  }

  public getGizmo(): THREE.Object3D | null {
    return this.gizmo;
  }

  public getSelectedObjects(): THREE.Object3D[] {
    return [...this.selectedObjects];
  }

  // Limpieza
  public dispose(): void {
    if (this.gridHelper) {
      this.gridHelper.material.dispose();
      this.gridHelper.geometry.dispose();
    }

    if (this.gizmo) {
      this.gizmo.clear();
    }
  }
} 
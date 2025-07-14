import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { AdvancedGridHelper, AdvancedGridConfig } from './AdvancedGridHelper';
import { ViewportAxesWidget } from './ViewportAxesWidget';

// Tipos para el editor
export interface EditorObject {
  id: string;
  name: string;
  type: 'mesh' | 'light' | 'camera' | 'group';
  position: THREE.Vector3;
  rotation: THREE.Euler;
  scale: THREE.Vector3;
  geometry?: THREE.BufferGeometry;
  material?: THREE.Material;
  children?: EditorObject[];
  visible: boolean;
  userData: any;
}

export interface EditorScene {
  id: string;
  name: string;
  objects: EditorObject[];
  background: THREE.Color;
  environment: string;
  metadata: {
    version: string;
    created: Date;
    modified: Date;
    author: string;
    description: string;
  };
}

export interface PublishOptions {
  format: 'gltf' | 'glb' | 'obj' | 'fbx';
  includeTextures: boolean;
  optimize: boolean;
  compression: boolean;
  metadata: boolean;
}

// Clase principal del editor
export class EditorCore {
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private renderer: THREE.WebGLRenderer;
  private controls: OrbitControls;
  private objects: Map<string, EditorObject> = new Map();
  private selectedObject: EditorObject | null = null;
  private isRendering: boolean = false;
  private animationFrameId: number | null = null;
  private advancedGrid: AdvancedGridHelper;
  private axesWidget: ViewportAxesWidget;

  constructor(container: HTMLElement) {
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    
    // Inicializar cuadrícula avanzada antes de la escena
    this.advancedGrid = new AdvancedGridHelper({
      size: 40,
      divisions: 20,
      subdivisions: 5,
      colorMain: new THREE.Color(0x888888),
      colorSub: new THREE.Color(0x444444),
      colorX: new THREE.Color(0xff4444),
      colorY: new THREE.Color(0x44ff44),
      colorZ: new THREE.Color(0x4488ff),
      opacity: 0.7,
      showLabels: true,
      fontSize: 32
    });
    this.scene.add(this.advancedGrid);
    // Crear ejes widget y añadirlo a la escena
    this.axesWidget = new ViewportAxesWidget(1.2);
    this.scene.add(this.axesWidget);
    this.initializeRenderer(container);
    this.initializeScene();
    this.initializeControls();
    this.setupEventListeners();
  }

  private initializeRenderer(container: HTMLElement): void {
    this.renderer.setSize(container.clientWidth, container.clientHeight);
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    // @ts-ignore: outputEncoding puede no estar en el tipado
    (this.renderer as any).outputEncoding = (THREE as any).sRGBEncoding;
    // @ts-ignore: toneMapping puede no estar en el tipado
    (this.renderer as any).toneMapping = (THREE as any).ACESFilmicToneMapping;
    // @ts-ignore: toneMappingExposure puede no estar en el tipado
    (this.renderer as any).toneMappingExposure = 1.0;
    container.appendChild(this.renderer.domElement);
  }

  private initializeScene(): void {
    // Configurar iluminación básica
    const ambientLight = new THREE.AmbientLight(0x404040, 0.6);
    this.scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(10, 10, 5);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    this.scene.add(directionalLight);

    // Configurar cámara
    this.camera.position.set(5, 5, 5);
    this.camera.lookAt(0, 0, 0);

    // Fondo con gradiente (simulado con color y niebla)
    this.scene.background = new THREE.Color(0x23272e); // Color base oscuro
    this.scene.fog = new THREE.FogExp2(0x23272e, 0.045); // Niebla para profundidad

    // Afinar cuadrícula avanzada para mayor realismo
    this.advancedGrid.updateConfig({
      colorMain: new THREE.Color(0x666666),
      colorSub: new THREE.Color(0x333333),
      colorX: new THREE.Color(0xff5555),
      colorY: new THREE.Color(0x55ff55),
      colorZ: new THREE.Color(0x5599ff),
      opacity: 0.85,
      showLabels: true,
      fontSize: 28,
      size: 40,
      divisions: 20,
      subdivisions: 5
    });
  }

  private initializeControls(): void {
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.05;
    this.controls.screenSpacePanning = false;
    this.controls.minDistance = 1;
    this.controls.maxDistance = 100;
    this.controls.maxPolarAngle = Math.PI;
  }

  private setupEventListeners(): void {
    window.addEventListener('resize', this.onWindowResize.bind(this));
    
    // Eventos del mouse para selección
    this.renderer.domElement.addEventListener('click', this.onMouseClick.bind(this));
    this.renderer.domElement.addEventListener('mousemove', this.onMouseMove.bind(this));
  }

  // Métodos públicos para manipular la escena

  public addObject(objectData: Partial<EditorObject>): EditorObject {
    const id = this.generateId();
    const object: EditorObject = {
      id,
      name: objectData.name || `Object_${id}`,
      type: objectData.type || 'mesh',
      position: objectData.position || new THREE.Vector3(0, 0, 0),
      rotation: objectData.rotation || new THREE.Euler(0, 0, 0),
      scale: objectData.scale || new THREE.Vector3(1, 1, 1),
      geometry: objectData.geometry,
      material: objectData.material,
      children: objectData.children || [],
      visible: objectData.visible !== false,
      userData: objectData.userData || {}
    };

    this.objects.set(id, object);
    this.createThreeObject(object);
    this.render();
    
    return object;
  }

  public removeObject(id: string): boolean {
    const object = this.objects.get(id);
    if (!object) return false;

    // Remover objeto de Three.js
    const threeObject = this.scene.getObjectByName(id);
    if (threeObject) {
      this.scene.remove(threeObject);
    }

    this.objects.delete(id);
    
    if (this.selectedObject?.id === id) {
      this.selectedObject = null;
    }

    this.render();
    return true;
  }

  public selectObject(id: string): EditorObject | null {
    const object = this.objects.get(id);
    if (!object) return null;

    this.selectedObject = object;
    this.highlightSelectedObject();
    this.render();
    
    return object;
  }

  public updateObject(id: string, updates: Partial<EditorObject>): boolean {
    const object = this.objects.get(id);
    if (!object) return false;

    // Actualizar propiedades
    Object.assign(object, updates);

    // Actualizar objeto en Three.js
    const threeObject = this.scene.getObjectByName(id);
    if (threeObject) {
      threeObject.position.copy(object.position);
      threeObject.rotation.copy(object.rotation);
      threeObject.scale.copy(object.scale);
      threeObject.visible = object.visible;
    }

    this.render();
    return true;
  }

  public getScene(): EditorScene {
    return {
      id: 'main-scene',
      name: 'Editor Scene',
      objects: Array.from(this.objects.values()),
      background: this.scene.background as THREE.Color,
      environment: 'studio',
      metadata: {
        version: '1.0.0',
        created: new Date(),
        modified: new Date(),
        author: 'Metaverso Editor',
        description: 'Escena creada con el editor 3D'
      }
    };
  }

  public async publishScene(options: PublishOptions): Promise<string> {
    try {
      console.log('🚀 Iniciando publicación de escena...', options);
      
      // Simular proceso de publicación
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Generar ID único para la escena publicada
      const sceneId = `scene_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      console.log('✅ Escena publicada exitosamente con ID:', sceneId);
      
      return sceneId;
    } catch (error) {
      console.error('❌ Error en publicación:', error);
      throw error;
    }
  }

  public startRendering(): void {
    if (this.isRendering) return;
    
    this.isRendering = true;
    this.renderLoop();
  }

  public stopRendering(): void {
    this.isRendering = false;
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
  }

  public render(): void {
    this.renderer.render(this.scene, this.camera);
  }

  // Métodos privados de utilidad

  private generateId(): string {
    return `obj_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private createThreeObject(object: EditorObject): void {
    let threeObject: THREE.Object3D;

    switch (object.type) {
      case 'mesh':
        if (object.geometry && object.material) {
          threeObject = new THREE.Mesh(object.geometry, object.material);
        } else {
          // Geometría por defecto
          const geometry = new THREE.BoxGeometry(1, 1, 1);
          const material = new THREE.MeshStandardMaterial({ color: 0x888888 });
          threeObject = new THREE.Mesh(geometry, material);
        }
        break;

      case 'light':
        threeObject = new THREE.DirectionalLight(0xffffff, 1);
        break;

      case 'camera':
        threeObject = new THREE.PerspectiveCamera(75, 1, 0.1, 1000);
        break;

      case 'group':
        threeObject = new THREE.Group();
        break;

      default:
        threeObject = new THREE.Object3D();
    }

    threeObject.name = object.id;
    threeObject.position.copy(object.position);
    threeObject.rotation.copy(object.rotation);
    threeObject.scale.copy(object.scale);
    threeObject.visible = object.visible;
    threeObject.userData = object.userData;

    this.scene.add(threeObject);
  }

  private highlightSelectedObject(): void {
    // Remover highlight anterior
    this.scene.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.material.emissive?.setHex(0x000000);
      }
    });

    // Aplicar highlight al objeto seleccionado
    if (this.selectedObject) {
      const threeObject = this.scene.getObjectByName(this.selectedObject.id);
      if (threeObject instanceof THREE.Mesh && threeObject.material instanceof THREE.MeshStandardMaterial) {
        threeObject.material.emissive.setHex(0x333333);
      }
    }
  }

  private renderLoop(): void {
    if (!this.isRendering) return;
    // Actualizar orientación del widget de ejes
    this.axesWidget.updateFromCamera(this.camera);
    // Posicionar el widget en la esquina superior derecha (viewport overlay)
    const distance = 2.5;
    const aspect = this.camera.aspect;
    // Calcula la posición en la esquina superior derecha del viewport
    const offsetX = distance * aspect * 0.8;
    const offsetY = distance * 0.8;
    this.axesWidget.position.set(
      this.camera.position.x + offsetX,
      this.camera.position.y + offsetY,
      this.camera.position.z - distance
    );
    this.renderer.render(this.scene, this.camera);
    this.animationFrameId = requestAnimationFrame(this.renderLoop.bind(this));
  }

  private onWindowResize(): void {
    const container = this.renderer.domElement.parentElement;
    if (!container) return;

    const width = container.clientWidth;
    const height = container.clientHeight;

    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  }

  private onMouseClick(event: MouseEvent): void {
    const mouse = new THREE.Vector2();
    const rect = this.renderer.domElement.getBoundingClientRect();
    
    mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(mouse, this.camera);

    const intersects = raycaster.intersectObjects(this.scene.children, true);
    
    if (intersects.length > 0) {
      const intersectedObject = intersects[0].object;
      const objectId = intersectedObject.name;
      
      if (objectId && this.objects.has(objectId)) {
        this.selectObject(objectId);
        this.emit('objectSelected', this.objects.get(objectId));
      }
    }
  }

  private onMouseMove(event: MouseEvent): void {
    // Implementar hover effects si es necesario
  }

  private emit(event: string, data?: any): void {
    // Implementar sistema de eventos si es necesario
    console.log(`Event: ${event}`, data);
  }

  // Métodos de utilidad para geometrías comunes

  public createCube(size: number = 1): EditorObject {
    const geometry = new THREE.BoxGeometry(size, size, size);
    const material = new THREE.MeshStandardMaterial({ color: 0x888888 });
    
    return this.addObject({
      type: 'mesh',
      geometry,
      material,
      name: 'Cube'
    });
  }

  public createSphere(radius: number = 0.5): EditorObject {
    const geometry = new THREE.SphereGeometry(radius, 32, 32);
    const material = new THREE.MeshStandardMaterial({ color: 0x888888 });
    
    return this.addObject({
      type: 'mesh',
      geometry,
      material,
      name: 'Sphere'
    });
  }

  public createPlane(width: number = 1, height: number = 1): EditorObject {
    const geometry = new THREE.PlaneGeometry(width, height);
    const material = new THREE.MeshStandardMaterial({ color: 0x888888 });
    
    return this.addObject({
      type: 'mesh',
      geometry,
      material,
      name: 'Plane'
    });
  }

  public createLight(type: 'directional' | 'point' | 'spot' = 'directional'): EditorObject {
    let light: THREE.Light;
    
    switch (type) {
      case 'directional':
        light = new THREE.DirectionalLight(0xffffff, 1);
        break;
      case 'point':
        light = new THREE.PointLight(0xffffff, 1, 100);
        break;
      case 'spot':
        light = new THREE.SpotLight(0xffffff, 1);
        break;
    }

    this.scene.add(light);
    
    return this.addObject({
      type: 'light',
      name: `${type.charAt(0).toUpperCase() + type.slice(1)} Light`
    });
  }

  // Métodos para manipulación de materiales

  public createMaterial(type: 'standard' | 'phong' | 'basic' = 'standard', color: number = 0x888888): THREE.Material {
    switch (type) {
      case 'standard':
        return new THREE.MeshStandardMaterial({ color });
      case 'phong':
        return new THREE.MeshPhongMaterial({ color });
      case 'basic':
        return new THREE.MeshBasicMaterial({ color });
      default:
        return new THREE.MeshStandardMaterial({ color });
    }
  }

  public updateMaterial(id: string, material: THREE.Material): boolean {
    const object = this.objects.get(id);
    if (!object) return false;

    const threeObject = this.scene.getObjectByName(id);
    if (threeObject instanceof THREE.Mesh) {
      threeObject.material = material;
      object.material = material;
      this.render();
      return true;
    }

    return false;
  }

  // Métodos para exportación

  public exportScene(format: 'gltf' | 'glb' | 'obj' = 'gltf'): Promise<Blob> {
    return new Promise((resolve, reject) => {
      try {
        // Implementar exportación según el formato
        console.log(`Exportando escena en formato ${format}...`);
        
        // Simular exportación
        setTimeout(() => {
          const blob = new Blob(['Scene data'], { type: 'application/octet-stream' });
          resolve(blob);
        }, 1000);
      } catch (error) {
        reject(error);
      }
    });
  }

  // Limpieza
  public dispose(): void {
    this.stopRendering();
    this.renderer.dispose();
    this.controls.dispose();
    
    // Limpiar geometrías y materiales
    this.scene.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.geometry.dispose();
        if (Array.isArray(child.material)) {
          child.material.forEach(material => material.dispose());
        } else {
          child.material.dispose();
        }
      }
    });
  }

  public updateGridConfig(config: Partial<AdvancedGridConfig>) {
    this.advancedGrid.updateConfig(config);
    this.render();
  }
} 
/**
 * Editor Integration - Sistema de integración para conectar funciones JavaScript con el editor 3D
 * Mantiene la estructura visual actual mientras añade funcionalidades avanzadas
 * Inspirado en Blender y Godot
 */

import * as THREE from 'three';
import { OrbitControls } from 'three-stdlib/controls/OrbitControls';
import { TransformControls } from 'three-stdlib/controls/TransformControls';

// Importar las funciones JavaScript desde el índice
import {
  EditorCore,
  ObjectCreators,
  TransformTools,
  SelectionHelpers,
  NavigationHelpers,
  MaterialHelpers,
  LightingHelpers,
  AnimationHelpers,
  ExportHelpers,
  MathHelpers
} from '../threejs-utils/index.js';

export class EditorIntegration {
  private scene!: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;
  private renderer!: THREE.WebGLRenderer;
  private controls!: OrbitControls;
  private transformControls!: TransformControls;
  
  // Instancias de las funciones JavaScript
  private editorCore: EditorCore;
  private objectCreators: ObjectCreators;
  private transformTools: TransformTools;
  private selectionHelpers: SelectionHelpers;
  private navigationHelpers: NavigationHelpers;
  private materialHelpers: MaterialHelpers;
  private lightingHelpers: LightingHelpers;
  private animationHelpers: AnimationHelpers;
  private exportHelpers: ExportHelpers;
  private mathHelpers: MathHelpers;

  // Estado del editor
  private selectedObjects: Set<THREE.Object3D> = new Set();
  private currentTool: string = 'select';
  private isInitialized: boolean = false;

  constructor() {
    this.initializeHelpers();
  }

  /**
   * Inicializa todas las funciones JavaScript
   */
  private initializeHelpers() {
    this.editorCore = new EditorCore();
    this.objectCreators = new ObjectCreators();
    this.transformTools = new TransformTools();
    this.selectionHelpers = new SelectionHelpers();
    this.navigationHelpers = new NavigationHelpers();
    this.materialHelpers = new MaterialHelpers();
    this.lightingHelpers = new LightingHelpers();
    this.animationHelpers = new AnimationHelpers();
    this.exportHelpers = new ExportHelpers();
    this.mathHelpers = new MathHelpers();
  }

  /**
   * Inicializa el editor 3D manteniendo la estructura visual actual
   */
  initialize(container: HTMLElement): void {
    if (this.isInitialized) return;

    // Configurar escena
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color('#1a1a1a');

    // Configurar cámara
    this.camera = new THREE.PerspectiveCamera(
      75,
      container.clientWidth / container.clientHeight,
      0.1,
      1000
    );
    this.camera.position.set(5, 5, 5);
    this.camera.lookAt(0, 0, 0);

    // Configurar renderer
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setSize(container.clientWidth, container.clientHeight);
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(this.renderer.domElement);

    // Configurar controles
    this.setupControls();
    
    // Configurar iluminación avanzada
    this.setupAdvancedLighting();
    
    // Configurar grid y ejes
    this.setupGridAndAxes();
    
    // Configurar eventos
    this.setupEventListeners();
    
    // Iniciar renderizado
    this.animate();
    
    this.isInitialized = true;
  }

  /**
   * Configura los controles de navegación
   */
  private setupControls(): void {
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.05;
    this.controls.screenSpacePanning = false;
    this.controls.minDistance = 0.1;
    this.controls.maxDistance = 1000;
    this.controls.maxPolarAngle = Math.PI;

    this.transformControls = new TransformControls(this.camera, this.renderer.domElement);
    this.transformControls.addEventListener('dragging-changed', (event) => {
      this.controls.enabled = !event.value;
    });
    this.scene.add(this.transformControls);
  }

  /**
   * Configura iluminación avanzada usando LightingHelpers
   */
  private setupAdvancedLighting(): void {
    this.lightingHelpers.setupBasicLighting(this.scene, this.renderer);
    
    // Añadir luces adicionales
    const pointLight = new THREE.PointLight(0xffffff, 0.5, 100);
    pointLight.position.set(10, 10, 10);
    pointLight.castShadow = true;
    this.scene.add(pointLight);
  }

  /**
   * Configura grid y ejes de coordenadas
   */
  private setupGridAndAxes(): void {
    // Grid infinito mejorado
    const gridHelper = new THREE.GridHelper(100, 100, 0x444444, 0x222222);
    gridHelper.position.y = 0;
    this.scene.add(gridHelper);

    // Ejes de coordenadas
    const axesHelper = new THREE.AxesHelper(5);
    this.scene.add(axesHelper);
  }

  /**
   * Configura los event listeners para interacción
   */
  private setupEventListeners(): void {
    this.renderer.domElement.addEventListener('click', this.onMouseClick.bind(this));
    this.renderer.domElement.addEventListener('keydown', this.onKeyDown.bind(this));
    
    // Event listeners para herramientas
    window.addEventListener('keydown', (event) => {
      switch(event.key) {
        case '1': this.setTool('select'); break;
        case '2': this.setTool('move'); break;
        case '3': this.setTool('rotate'); break;
        case '4': this.setTool('scale'); break;
        case 'Delete': this.deleteSelectedObjects(); break;
        case 'Escape': this.clearSelection(); break;
      }
    });
  }

  /**
   * Maneja el clic del ratón para selección
   */
  private onMouseClick(event: any): void {
    if (this.currentTool === 'select') {
      this.selectionHelpers.handleMouseClick(event, this.camera, this.scene, this.selectedObjects);
      this.updateTransformControls();
    }
  }

  /**
   * Maneja las teclas presionadas
   */
  private onKeyDown(event: KeyboardEvent): void {
    // Implementar shortcuts adicionales aquí
  }

  /**
   * Actualiza los controles de transformación
   */
  private updateTransformControls(): void {
    if (this.selectedObjects.size === 1) {
      const selectedObject = Array.from(this.selectedObjects)[0];
      this.transformControls.attach(selectedObject);
    } else {
      this.transformControls.detach();
    }
  }

  /**
   * Establece la herramienta actual
   */
  setTool(tool: string): void {
    this.currentTool = tool;
    this.transformControls.setMode(tool as 'translate' | 'rotate' | 'scale');
  }

  /**
   * Crea un objeto 3D usando ObjectCreators
   */
  createObject(type: string, options: any = {}): THREE.Object3D {
    let object: THREE.Object3D;

    switch(type) {
      case 'cube':
        object = this.objectCreators.createCube(options.width, options.height, options.depth);
        break;
      case 'sphere':
        object = this.objectCreators.createSphere(options.radius, options.segments);
        break;
      case 'cylinder':
        object = this.objectCreators.createCylinder(options.radius, options.height, options.segments);
        break;
      case 'plane':
        object = this.objectCreators.createPlane(options.width, options.height, options.segments);
        break;
      default:
        object = this.objectCreators.createCube();
    }

    // Aplicar posición si se especifica
    if (options.position) {
      object.position.copy(options.position);
    }

    this.scene.add(object);
    return object;
  }

  /**
   * Elimina los objetos seleccionados
   */
  deleteSelectedObjects(): void {
    this.selectedObjects.forEach(object => {
      this.scene.remove(object);
      if (object instanceof THREE.Mesh) {
        object.geometry.dispose();
        if (Array.isArray(object.material)) {
          object.material.forEach(material => material.dispose());
        } else {
          object.material.dispose();
        }
      }
    });
    this.selectedObjects.clear();
    this.updateTransformControls();
  }

  /**
   * Limpia la selección
   */
  clearSelection(): void {
    this.selectedObjects.clear();
    this.updateTransformControls();
  }

  /**
   * Exporta la escena usando ExportHelpers
   */
  exportScene(format: string): void {
    this.exportHelpers.exportScene(this.scene, format);
  }

  /**
   * Bucle de renderizado
   */
  private animate(): void {
    requestAnimationFrame(this.animate.bind(this));
    
    this.controls.update();
    this.renderer.render(this.scene, this.camera);
  }

  /**
   * Limpia recursos
   */
  dispose(): void {
    this.renderer.dispose();
    this.controls.dispose();
    this.transformControls.dispose();
  }

  /**
   * Obtiene la escena actual
   */
  getScene(): THREE.Scene {
    return this.scene;
  }

  /**
   * Obtiene la cámara actual
   */
  getCamera(): THREE.PerspectiveCamera {
    return this.camera;
  }

  /**
   * Obtiene el renderer actual
   */
  getRenderer(): THREE.WebGLRenderer {
    return this.renderer;
  }
}

export default EditorIntegration; 
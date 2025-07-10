/**
 * Editor Core - Funciones JavaScript fundamentales para el editor 3D
 * Gestiona la escena, objetos, selección y transformaciones básicas
 * Inspirado en Blender y Godot
 */

import * as THREE from 'three';

class EditorCore {
  constructor() {
    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.controls = null;
    this.selectedObjects = new Set();
    this.objectCounter = 0;
    this.isInitialized = false;
  }

  /**
   * Inicializa el editor 3D con escena, cámara y renderer
   */
  initialize(container) {
    if (this.isInitialized) return;

    // Crear escena
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x23272e);

    // Crear cámara
    this.camera = new THREE.PerspectiveCamera(
      75,
      container.clientWidth / container.clientHeight,
      0.1,
      10000
    );
    this.camera.position.set(10, 10, 10);
    this.camera.lookAt(0, 0, 0);

    // Crear renderer
    this.renderer = new THREE.WebGLRenderer({ 
      antialias: true,
      alpha: true 
    });
    this.renderer.setSize(container.clientWidth, container.clientHeight);
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.0;

    // Agregar renderer al contenedor
    container.appendChild(this.renderer.domElement);

    // Configurar iluminación
    this.setupLighting();

    // Configurar grid y ejes
    this.setupGrid();

    // Configurar controles
    this.setupControls();

    // Configurar eventos
    this.setupEvents();

    this.isInitialized = true;
    this.animate();
  }

  /**
   * Configura la iluminación de la escena
   */
  setupLighting() {
    // Luz ambiental
    const ambientLight = new THREE.AmbientLight(0x404040, 0.4);
    this.scene.add(ambientLight);

    // Luz direccional principal
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(10, 10, 5);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    directionalLight.shadow.camera.near = 0.5;
    directionalLight.shadow.camera.far = 50;
    directionalLight.shadow.camera.left = -20;
    directionalLight.shadow.camera.right = 20;
    directionalLight.shadow.camera.top = 20;
    directionalLight.shadow.camera.bottom = -20;
    this.scene.add(directionalLight);

    // Luz de relleno
    const fillLight = new THREE.DirectionalLight(0x404040, 0.3);
    fillLight.position.set(-10, 5, -10);
    this.scene.add(fillLight);
  }

  /**
   * Configura la cuadrícula y ejes de coordenadas
   */
  setupGrid() {
    // Cuadrícula principal
    const gridHelper = new THREE.GridHelper(100, 100, 0x444444, 0x222222);
    gridHelper.position.y = 0;
    this.scene.add(gridHelper);

    // Ejes de coordenadas
    const axesHelper = new THREE.AxesHelper(5);
    this.scene.add(axesHelper);

    // Cuadrícula secundaria (más grande)
    const largeGridHelper = new THREE.GridHelper(1000, 100, 0x333333, 0x111111);
    largeGridHelper.position.y = 0;
    this.scene.add(largeGridHelper);
  }

  /**
   * Configura los controles de navegación
   */
  setupControls() {
    // Importar OrbitControls dinámicamente
    import('three/examples/jsm/controls/OrbitControls.js').then(({ OrbitControls }) => {
      this.controls = new OrbitControls(this.camera, this.renderer.domElement);
      this.controls.enableDamping = true;
      this.controls.dampingFactor = 0.05;
      this.controls.screenSpacePanning = false;
      this.controls.minDistance = 0.1;
      this.controls.maxDistance = 1000;
      this.controls.maxPolarAngle = Math.PI;
    });
  }

  /**
   * Configura los eventos del mouse y teclado
   */
  setupEvents() {
    const canvas = this.renderer.domElement;

    // Evento de clic para selección
    canvas.addEventListener('click', (event) => {
      this.handleClick(event);
    });

    // Evento de redimensionamiento
    window.addEventListener('resize', () => {
      this.handleResize();
    });

    // Eventos de teclado
    document.addEventListener('keydown', (event) => {
      this.handleKeyDown(event);
    });
  }

  /**
   * Maneja el clic del mouse para selección de objetos
   */
  handleClick(event) {
    const mouse = new THREE.Vector2();
    const rect = this.renderer.domElement.getBoundingClientRect();
    
    mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(mouse, this.camera);

    const intersects = raycaster.intersectObjects(this.scene.children, true);
    
    if (intersects.length > 0) {
      const selectedObject = intersects[0].object;
      this.selectObject(selectedObject);
    } else {
      this.clearSelection();
    }
  }

  /**
   * Selecciona un objeto
   */
  selectObject(object) {
    this.clearSelection();
    this.selectedObjects.add(object);
    
    // Agregar highlight visual
    if (object.material) {
      object.userData.originalColor = object.material.color.getHex();
      object.material.color.setHex(0x4a9eff);
    }
    
    console.log('Objeto seleccionado:', object.name || object.uuid);
  }

  /**
   * Limpia la selección actual
   */
  clearSelection() {
    this.selectedObjects.forEach(object => {
      if (object.material && object.userData.originalColor !== undefined) {
        object.material.color.setHex(object.userData.originalColor);
        delete object.userData.originalColor;
      }
    });
    this.selectedObjects.clear();
  }

  /**
   * Agrega un objeto a la escena
   */
  addObject(object) {
    if (!object || !this.scene) return false;
    
    // Asignar ID único si no tiene uno
    if (!object.userData.id) {
      object.userData.id = `obj_${Date.now()}_${Math.random()}`;
    }
    
    // Asignar nombre si no tiene uno
    if (!object.name) {
      object.name = `Object_${this.objectCounter++}`;
    }
    
    this.scene.add(object);
    console.log('Objeto agregado:', object.name);
    return true;
  }

  /**
   * Remueve un objeto de la escena
   */
  removeObject(object) {
    if (!object || !this.scene) return false;
    
    this.scene.remove(object);
    
    // Limpiar recursos
    if (object.geometry) {
      object.geometry.dispose();
    }
    if (object.material) {
      if (Array.isArray(object.material)) {
        object.material.forEach(mat => mat.dispose());
      } else {
        object.material.dispose();
      }
    }
    
    // Remover de selección si está seleccionado
    this.selectedObjects.delete(object);
    
    console.log('Objeto removido:', object.name);
    return true;
  }

  /**
   * Maneja el redimensionamiento de la ventana
   */
  handleResize() {
    const container = this.renderer.domElement.parentElement;
    const width = container.clientWidth;
    const height = container.clientHeight;

    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  }

  /**
   * Maneja eventos de teclado
   */
  handleKeyDown(event) {
    switch (event.key) {
      case 'Delete':
      case 'Backspace':
        this.deleteSelectedObjects();
        break;
      case 'Escape':
        this.clearSelection();
        break;
      case 'a':
        if (event.ctrlKey || event.metaKey) {
          event.preventDefault();
          this.selectAllObjects();
        }
        break;
    }
  }

  /**
   * Elimina los objetos seleccionados
   */
  deleteSelectedObjects() {
    this.selectedObjects.forEach(object => {
      this.scene.remove(object);
      if (object.geometry) object.geometry.dispose();
      if (object.material) object.material.dispose();
    });
    this.selectedObjects.clear();
  }

  /**
   * Selecciona todos los objetos de la escena
   */
  selectAllObjects() {
    this.clearSelection();
    this.scene.children.forEach(child => {
      if (child instanceof THREE.Mesh) {
        this.selectedObjects.add(child);
      }
    });
  }

  /**
   * Bucle de animación
   */
  animate() {
    requestAnimationFrame(() => this.animate());
    
    if (this.controls) {
      this.controls.update();
    }
    
    this.renderer.render(this.scene, this.camera);
  }

  /**
   * Limpia los recursos del editor
   */
  dispose() {
    if (this.renderer) {
      this.renderer.dispose();
    }
    if (this.controls) {
      this.controls.dispose();
    }
    this.scene.traverse((object) => {
      if (object.geometry) object.geometry.dispose();
      if (object.material) object.material.dispose();
    });
  }

  /**
   * Obtiene la escena actual
   */
  getScene() {
    return this.scene;
  }

  /**
   * Obtiene la cámara actual
   */
  getCamera() {
    return this.camera;
  }

  /**
   * Obtiene el renderer actual
   */
  getRenderer() {
    return this.renderer;
  }

  /**
   * Obtiene los objetos seleccionados
   */
  getSelectedObjects() {
    return Array.from(this.selectedObjects);
  }
}

export { EditorCore }; 
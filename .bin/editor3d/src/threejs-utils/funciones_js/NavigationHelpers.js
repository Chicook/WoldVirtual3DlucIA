/**
 * Navigation Helpers - Utilidades de navegación y controles de cámara para el editor 3D
 * Maneja orbit, pan, zoom, y navegación avanzada como Blender y Godot
 */

import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

export class NavigationHelpers {
  constructor() {
    this.camera = null;
    this.controls = null;
    this.scene = null;
    this.renderer = null;
    this.target = new THREE.Vector3(0, 0, 0);
    this.navigationMode = 'orbit'; // orbit, pan, zoom, fly
    this.snapEnabled = false;
    this.snapAngle = Math.PI / 4; // 45 grados
    this.snapDistance = 1.0;
    this.minDistance = 0.1;
    this.maxDistance = 1000;
    this.zoomSpeed = 1.0;
    this.panSpeed = 1.0;
    this.rotateSpeed = 1.0;
    this.enableDamping = true;
    this.dampingFactor = 0.05;
    this.cameraHistory = [];
    this.maxHistorySize = 10;
  }

  /**
   * Configura los controles de navegación
   */
  setupNavigation(camera, renderer, scene) {
    this.camera = camera;
    this.renderer = renderer;
    this.scene = scene;

    // Configurar OrbitControls
    this.controls = new OrbitControls(camera, renderer.domElement);
    this.controls.target.copy(this.target);
    this.controls.enableDamping = this.enableDamping;
    this.controls.dampingFactor = this.dampingFactor;
    this.controls.minDistance = this.minDistance;
    this.controls.maxDistance = this.maxDistance;
    this.controls.zoomSpeed = this.zoomSpeed;
    this.controls.panSpeed = this.panSpeed;
    this.controls.rotateSpeed = this.rotateSpeed;
    this.controls.enableKeys = true;
    this.controls.keyPanSpeed = 7.0;
    this.controls.enableZoom = true;
    this.controls.enablePan = true;
    this.controls.enableRotate = true;

    // Configurar eventos
    this.setupEventListeners();
  }

  /**
   * Configura los event listeners para navegación
   */
  setupEventListeners() {
    if (!this.controls) return;

    // Evento de cambio de cámara
    this.controls.addEventListener('change', () => {
      this.saveCameraState();
    });

    // Evento de inicio de interacción
    this.controls.addEventListener('start', () => {
      this.onInteractionStart();
    });

    // Evento de fin de interacción
    this.controls.addEventListener('end', () => {
      this.onInteractionEnd();
    });
  }

  /**
   * Cambia el modo de navegación
   */
  setNavigationMode(mode) {
    this.navigationMode = mode;
    
    if (!this.controls) return;

    switch (mode) {
      case 'orbit':
        this.controls.enableRotate = true;
        this.controls.enablePan = true;
        this.controls.enableZoom = true;
        break;
      case 'pan':
        this.controls.enableRotate = false;
        this.controls.enablePan = true;
        this.controls.enableZoom = false;
        break;
      case 'zoom':
        this.controls.enableRotate = false;
        this.controls.enablePan = false;
        this.controls.enableZoom = true;
        break;
      case 'fly':
        this.controls.enableRotate = true;
        this.controls.enablePan = true;
        this.controls.enableZoom = true;
        this.controls.enableKeys = true;
        break;
    }
  }

  /**
   * Activa/desactiva el snap de rotación
   */
  setSnapEnabled(enabled, angle = Math.PI / 4) {
    this.snapEnabled = enabled;
    this.snapAngle = angle;
    
    if (this.controls) {
      this.controls.enableRotate = true;
      if (enabled) {
        this.controls.rotateSpeed = 0.5; // Reducir velocidad para mejor control
      } else {
        this.controls.rotateSpeed = this.rotateSpeed;
      }
    }
  }

  /**
   * Aplica snap a la rotación de la cámara
   */
  applyRotationSnap() {
    if (!this.snapEnabled || !this.camera) return;

    const euler = this.camera.rotation.clone();
    
    // Aplicar snap a cada eje
    euler.x = Math.round(euler.x / this.snapAngle) * this.snapAngle;
    euler.y = Math.round(euler.y / this.snapAngle) * this.snapAngle;
    euler.z = Math.round(euler.z / this.snapAngle) * this.snapAngle;
    
    this.camera.rotation.copy(euler);
  }

  /**
   * Enfoca la cámara en un objeto específico
   */
  focusOnObject(object, distance = null) {
    if (!object || !this.camera || !this.controls) return;

    // Calcular el centro del objeto
    const box = new THREE.Box3().setFromObject(object);
    const center = box.getCenter(new THREE.Vector3());
    
    // Calcular distancia automática si no se especifica
    if (!distance) {
      const size = box.getSize(new THREE.Vector3());
      const maxDim = Math.max(size.x, size.y, size.z);
      distance = maxDim * 2;
    }

    // Mover cámara
    this.camera.position.copy(center);
    this.camera.position.z += distance;
    
    // Actualizar target
    this.controls.target.copy(center);
    this.controls.update();
    
    this.saveCameraState();
  }

  /**
   * Enfoca la cámara en múltiples objetos
   */
  focusOnObjects(objects, padding = 0.1) {
    if (!objects || objects.length === 0 || !this.camera || !this.controls) return;

    const box = new THREE.Box3();
    
    objects.forEach(obj => {
      box.expandByObject(obj);
    });

    const center = box.getCenter(new THREE.Vector3());
    const size = box.getSize(new THREE.Vector3());
    const maxDim = Math.max(size.x, size.y, size.z);
    const distance = maxDim * (1 + padding);

    // Mover cámara
    this.camera.position.copy(center);
    this.camera.position.z += distance;
    
    // Actualizar target
    this.controls.target.copy(center);
    this.controls.update();
    
    this.saveCameraState();
  }

  /**
   * Mueve la cámara a una posición específica
   */
  moveCameraTo(position, target = null) {
    if (!this.camera || !this.controls) return;

    this.camera.position.copy(position);
    
    if (target) {
      this.controls.target.copy(target);
    }
    
    this.controls.update();
    this.saveCameraState();
  }

  /**
   * Rota la cámara a una rotación específica
   */
  rotateCameraTo(rotation) {
    if (!this.camera || !this.controls) return;

    this.camera.rotation.copy(rotation);
    this.controls.update();
    this.saveCameraState();
  }

  /**
   * Zoom in/out de la cámara
   */
  zoomCamera(factor) {
    if (!this.camera || !this.controls) return;

    const currentDistance = this.camera.position.distanceTo(this.controls.target);
    const newDistance = currentDistance * factor;
    
    if (newDistance >= this.minDistance && newDistance <= this.maxDistance) {
      const direction = this.camera.position.clone().sub(this.controls.target).normalize();
      this.camera.position.copy(this.controls.target).add(direction.multiplyScalar(newDistance));
      this.controls.update();
      this.saveCameraState();
    }
  }

  /**
   * Resetea la vista de la cámara
   */
  resetView() {
    if (!this.camera || !this.controls) return;

    this.camera.position.set(5, 5, 5);
    this.controls.target.set(0, 0, 0);
    this.controls.update();
    this.saveCameraState();
  }

  /**
   * Vista frontal
   */
  frontView() {
    if (!this.camera || !this.controls) return;

    this.camera.position.set(0, 0, 5);
    this.camera.lookAt(this.controls.target);
    this.controls.update();
    this.saveCameraState();
  }

  /**
   * Vista lateral
   */
  sideView() {
    if (!this.camera || !this.controls) return;

    this.camera.position.set(5, 0, 0);
    this.camera.lookAt(this.controls.target);
    this.controls.update();
    this.saveCameraState();
  }

  /**
   * Vista superior
   */
  topView() {
    if (!this.camera || !this.controls) return;

    this.camera.position.set(0, 5, 0);
    this.camera.lookAt(this.controls.target);
    this.controls.update();
    this.saveCameraState();
  }

  /**
   * Vista isométrica
   */
  isometricView() {
    if (!this.camera || !this.controls) return;

    const distance = 5;
    this.camera.position.set(distance, distance, distance);
    this.camera.lookAt(this.controls.target);
    this.controls.update();
    this.saveCameraState();
  }

  /**
   * Guarda el estado actual de la cámara
   */
  saveCameraState() {
    if (!this.camera || !this.controls) return;

    const state = {
      position: this.camera.position.clone(),
      rotation: this.camera.rotation.clone(),
      target: this.controls.target.clone(),
      timestamp: Date.now()
    };

    this.cameraHistory.push(state);
    
    // Mantener solo los últimos estados
    if (this.cameraHistory.length > this.maxHistorySize) {
      this.cameraHistory.shift();
    }
  }

  /**
   * Deshace el último movimiento de cámara
   */
  undoCameraMove() {
    if (this.cameraHistory.length < 2) return;

    // Remover estado actual
    this.cameraHistory.pop();
    
    // Restaurar estado anterior
    const previousState = this.cameraHistory[this.cameraHistory.length - 1];
    this.restoreCameraState(previousState);
  }

  /**
   * Restaura un estado específico de la cámara
   */
  restoreCameraState(state) {
    if (!this.camera || !this.controls || !state) return;

    this.camera.position.copy(state.position);
    this.camera.rotation.copy(state.rotation);
    this.controls.target.copy(state.target);
    this.controls.update();
  }

  /**
   * Obtiene información de la cámara actual
   */
  getCameraInfo() {
    if (!this.camera || !this.controls) return null;

    return {
      position: this.camera.position.clone(),
      rotation: this.camera.rotation.clone(),
      target: this.controls.target.clone(),
      distance: this.camera.position.distanceTo(this.controls.target),
      fov: this.camera.fov,
      near: this.camera.near,
      far: this.camera.far
    };
  }

  /**
   * Actualiza los controles (llamar en el loop de renderizado)
   */
  update() {
    if (this.controls) {
      this.controls.update();
    }
  }

  /**
   * Evento de inicio de interacción
   */
  onInteractionStart() {
    // Puede ser usado para mostrar UI de navegación
    console.log('Navegación iniciada');
  }

  /**
   * Evento de fin de interacción
   */
  onInteractionEnd() {
    // Puede ser usado para ocultar UI de navegación
    console.log('Navegación finalizada');
  }

  /**
   * Limpia recursos
   */
  dispose() {
    if (this.controls) {
      this.controls.dispose();
      this.controls = null;
    }
    
    this.cameraHistory = [];
    this.camera = null;
    this.renderer = null;
    this.scene = null;
  }
}

export { NavigationHelpers }; 
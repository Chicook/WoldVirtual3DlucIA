/**
 * Selection Helpers - Utilidades de selección y raycasting para el editor 3D
 * Maneja la selección de objetos, detección de colisiones y selección múltiple
 * Inspirado en Blender y Godot
 */

import * as THREE from 'three';

export class SelectionHelpers {
  constructor() {
    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2();
    this.selectedObjects = new Set();
    this.highlightMaterial = new THREE.MeshBasicMaterial({
      color: 0x4a9eff,
      transparent: true,
      opacity: 0.3,
      wireframe: true
    });
    this.originalMaterials = new Map();
    this.selectionBox = null;
    this.isSelecting = false;
    this.selectionStart = new THREE.Vector2();
    this.selectionEnd = new THREE.Vector2();
  }

  /**
   * Configura el raycaster para detección de objetos
   */
  setupRaycaster(camera, renderer) {
    this.camera = camera;
    this.renderer = renderer;
    
    // Crear selección por caja
    this.selectionBox = new THREE.Box2();
  }

  /**
   * Actualiza la posición del mouse
   */
  updateMousePosition(event, container) {
    const rect = container.getBoundingClientRect();
    this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
  }

  /**
   * Detecta objetos bajo el cursor
   */
  getObjectsUnderCursor(scene, camera, mousePosition) {
    this.raycaster.setFromCamera(mousePosition, camera);
    const intersects = this.raycaster.intersectObjects(scene.children, true);
    
    // Filtrar objetos seleccionables
    return intersects.filter(intersection => {
      const obj = intersection.object;
      return obj.userData && obj.userData.selectable !== false;
    });
  }

  /**
   * Selecciona un objeto individual
   */
  selectObject(object, addToSelection = false) {
    if (!object) return false;

    if (!addToSelection) {
      this.clearSelection();
    }

    if (!this.selectedObjects.has(object)) {
      this.selectedObjects.add(object);
      this.highlightObject(object);
    }

    return true;
  }

  /**
   * Selecciona un objeto basado en un evento de mouse
   */
  selectObjectFromEvent(event) {
    if (!this.camera || !this.renderer) return null;

    // Actualizar posición del mouse
    const rect = this.renderer.domElement.getBoundingClientRect();
    this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    // Configurar raycaster
    this.raycaster.setFromCamera(this.mouse, this.camera);

    // Obtener objetos intersectados
    const intersects = this.raycaster.intersectObjects(
      this.renderer.scene ? this.renderer.scene.children : [],
      true
    );

    if (intersects.length > 0) {
      const selectedObject = intersects[0].object;
      this.selectObject(selectedObject);
      return selectedObject;
    }

    return null;
  }

  /**
   * Deselecciona un objeto
   */
  deselectObject(object) {
    if (this.selectedObjects.has(object)) {
      this.selectedObjects.delete(object);
      this.removeHighlight(object);
    }
  }

  /**
   * Limpia toda la selección
   */
  clearSelection() {
    this.selectedObjects.forEach(obj => {
      this.removeHighlight(obj);
    });
    this.selectedObjects.clear();
  }

  /**
   * Resalta un objeto seleccionado
   */
  highlightObject(object) {
    if (object.material) {
      // Guardar material original
      this.originalMaterials.set(object, object.material.clone());
      
      // Aplicar material de resaltado
      if (Array.isArray(object.material)) {
        object.material = object.material.map(() => this.highlightMaterial.clone());
      } else {
        object.material = this.highlightMaterial.clone();
      }
    }
  }

  /**
   * Remueve el resaltado de un objeto
   */
  removeHighlight(object) {
    const originalMaterial = this.originalMaterials.get(object);
    if (originalMaterial) {
      object.material = originalMaterial;
      this.originalMaterials.delete(object);
    }
  }

  /**
   * Selección múltiple por caja
   */
  startBoxSelection(event, container) {
    this.isSelecting = true;
    this.updateMousePosition(event, container);
    this.selectionStart.copy(this.mouse);
    this.selectionEnd.copy(this.mouse);
  }

  /**
   * Actualiza la selección por caja
   */
  updateBoxSelection(event, container) {
    if (!this.isSelecting) return;
    
    this.updateMousePosition(event, container);
    this.selectionEnd.copy(this.mouse);
    
    // Actualizar caja de selección
    this.selectionBox.setFromPoints([this.selectionStart, this.selectionEnd]);
  }

  /**
   * Finaliza la selección por caja
   */
  endBoxSelection(scene, camera, addToSelection = false) {
    if (!this.isSelecting) return;
    
    this.isSelecting = false;
    
    // Encontrar objetos dentro de la caja
    const selectedObjects = this.getObjectsInBox(scene, camera);
    
    if (!addToSelection) {
      this.clearSelection();
    }
    
    selectedObjects.forEach(obj => {
      this.selectObject(obj, true);
    });
  }

  /**
   * Obtiene objetos dentro de una caja de selección
   */
  getObjectsInBox(scene, camera) {
    const objectsInBox = [];
    
    scene.traverse((object) => {
      if (object.isMesh && object.userData && object.userData.selectable !== false) {
        const screenPosition = this.getScreenPosition(object, camera);
        
        if (this.selectionBox.containsPoint(screenPosition)) {
          objectsInBox.push(object);
        }
      }
    });
    
    return objectsInBox;
  }

  /**
   * Obtiene la posición en pantalla de un objeto
   */
  getScreenPosition(object, camera) {
    const vector = new THREE.Vector3();
    vector.setFromMatrixPosition(object.matrixWorld);
    vector.project(camera);
    
    return new THREE.Vector2(
      (vector.x + 1) / 2 * this.renderer.domElement.width,
      (-vector.y + 1) / 2 * this.renderer.domElement.height
    );
  }

  /**
   * Selección por nombre o tipo
   */
  selectByType(scene, type, addToSelection = false) {
    const objects = [];
    
    scene.traverse((object) => {
      if (object.userData && object.userData.type === type) {
        objects.push(object);
      }
    });
    
    if (!addToSelection) {
      this.clearSelection();
    }
    
    objects.forEach(obj => {
      this.selectObject(obj, true);
    });
    
    return objects;
  }

  /**
   * Selección por material
   */
  selectByMaterial(scene, materialName, addToSelection = false) {
    const objects = [];
    
    scene.traverse((object) => {
      if (object.material) {
        const materials = Array.isArray(object.material) ? object.material : [object.material];
        const hasMaterial = materials.some(mat => 
          mat.name === materialName || mat.userData?.name === materialName
        );
        
        if (hasMaterial) {
          objects.push(object);
        }
      }
    });
    
    if (!addToSelection) {
      this.clearSelection();
    }
    
    objects.forEach(obj => {
      this.selectObject(obj, true);
    });
    
    return objects;
  }

  /**
   * Invierte la selección actual
   */
  invertSelection(scene) {
    const allSelectableObjects = [];
    
    scene.traverse((object) => {
      if (object.isMesh && object.userData && object.userData.selectable !== false) {
        allSelectableObjects.push(object);
      }
    });
    
    const newSelection = allSelectableObjects.filter(obj => 
      !this.selectedObjects.has(obj)
    );
    
    this.clearSelection();
    newSelection.forEach(obj => {
      this.selectObject(obj, true);
    });
    
    return newSelection;
  }

  /**
   * Obtiene el objeto más cercano al cursor
   */
  getClosestObject(scene, camera, mousePosition, maxDistance = Infinity) {
    const intersects = this.getObjectsUnderCursor(scene, camera, mousePosition);
    
    if (intersects.length > 0) {
      const closest = intersects[0];
      if (closest.distance <= maxDistance) {
        return closest.object;
      }
    }
    
    return null;
  }

  /**
   * Obtiene información de la selección actual
   */
  getSelectionInfo() {
    const info = {
      count: this.selectedObjects.size,
      objects: Array.from(this.selectedObjects),
      types: {},
      bounds: null
    };
    
    // Contar tipos de objetos
    this.selectedObjects.forEach(obj => {
      const type = obj.userData?.type || obj.type;
      info.types[type] = (info.types[type] || 0) + 1;
    });
    
    // Calcular límites
    if (this.selectedObjects.size > 0) {
      info.bounds = this.calculateSelectionBounds();
    }
    
    return info;
  }

  /**
   * Calcula los límites de la selección actual
   */
  calculateSelectionBounds() {
    const box = new THREE.Box3();
    
    this.selectedObjects.forEach(obj => {
      box.expandByObject(obj);
    });
    
    return {
      min: box.min.clone(),
      max: box.max.clone(),
      center: box.getCenter(new THREE.Vector3()),
      size: box.getSize(new THREE.Vector3())
    };
  }

  /**
   * Limpia recursos
   */
  dispose() {
    this.clearSelection();
    this.originalMaterials.clear();
    this.selectedObjects.clear();
    
    if (this.highlightMaterial) {
      this.highlightMaterial.dispose();
    }
  }
} 
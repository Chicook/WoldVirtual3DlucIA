/**
 * Scene Helpers - Utilidades de gestión de escena para el editor 3D
 * Maneja objetos, grupos, capas, historial y operaciones de escena
 * Inspirado en Blender y Godot
 */

import * as THREE from 'three';

class SceneHelpers {
  constructor() {
    this.objectRegistry = new Map();
    this.groupRegistry = new Map();
    this.layerRegistry = new Map();
    this.history = [];
    this.historyIndex = -1;
    this.maxHistorySize = 50;
    this.scene = null;
    this.selectedObjects = new Set();
    this.objectCounter = 0;
  }

  /**
   * Inicializa el sistema de gestión de escena
   */
  initialize(scene) {
    this.scene = scene;
    this.createDefaultLayers();
    console.log('✅ Scene Helpers inicializado');
  }

  /**
   * Crea capas por defecto
   */
  createDefaultLayers() {
    const defaultLayers = [
      { name: 'Default', id: 0, visible: true, selectable: true },
      { name: 'UI', id: 1, visible: true, selectable: false },
      { name: 'Background', id: 2, visible: true, selectable: true },
      { name: 'Foreground', id: 3, visible: true, selectable: true },
      { name: 'Hidden', id: 4, visible: false, selectable: false }
    ];

    defaultLayers.forEach(layer => {
      this.layerRegistry.set(layer.id, layer);
    });
  }

  /**
   * Añade un objeto a la escena con registro
   */
  addObject(object, options = {}) {
    if (!this.scene) {
      console.error('❌ Scene no inicializada');
      return null;
    }

    const objectId = this.generateObjectId();
    object.userData.id = objectId;
    object.userData.name = options.name || `Object_${objectId}`;
    object.userData.layer = options.layer || 0;
    object.userData.type = options.type || 'mesh';
    object.userData.createdAt = Date.now();

    this.scene.add(object);
    this.objectRegistry.set(objectId, object);

    // Añadir al historial
    this.addToHistory({
      type: 'add_object',
      objectId: objectId,
      object: object.clone(),
      timestamp: Date.now()
    });

    console.log(`✅ Objeto añadido: ${object.userData.name} (ID: ${objectId})`);
    return objectId;
  }

  /**
   * Elimina un objeto de la escena
   */
  removeObject(objectId) {
    const object = this.objectRegistry.get(objectId);
    if (!object) {
      console.warn(`⚠️ Objeto no encontrado: ${objectId}`);
      return false;
    }

    // Añadir al historial antes de eliminar
    this.addToHistory({
      type: 'remove_object',
      objectId: objectId,
      object: object.clone(),
      timestamp: Date.now()
    });

    this.scene.remove(object);
    this.objectRegistry.delete(objectId);
    this.selectedObjects.delete(object);

    console.log(`🗑️ Objeto eliminado: ${object.userData.name} (ID: ${objectId})`);
    return true;
  }

  /**
   * Crea un grupo de objetos
   */
  createGroup(name, parent = null) {
    const group = new THREE.Group();
    group.name = name;
    group.userData.type = 'group';
    group.userData.id = this.generateObjectId();

    if (parent) {
      parent.add(group);
    } else if (this.scene) {
      this.scene.add(group);
    }

    this.groupRegistry.set(group.userData.id, group);
    console.log(`📁 Grupo creado: ${name}`);
    return group;
  }

  /**
   * Añade un objeto a un grupo
   */
  addObjectToGroup(objectId, groupId) {
    const object = this.objectRegistry.get(objectId);
    const group = this.groupRegistry.get(groupId);

    if (!object || !group) {
      console.error('❌ Objeto o grupo no encontrado');
      return false;
    }

    group.add(object);
    object.userData.parentGroup = groupId;
    console.log(`📁 Objeto añadido al grupo: ${group.name}`);
    return true;
  }

  /**
   * Selecciona un objeto
   */
  selectObject(objectId) {
    const object = this.objectRegistry.get(objectId);
    if (!object) return false;

    this.selectedObjects.add(object);
    this.highlightObject(object);
    console.log(`✅ Objeto seleccionado: ${object.userData.name}`);
    return true;
  }

  /**
   * Deselecciona un objeto
   */
  deselectObject(objectId) {
    const object = this.objectRegistry.get(objectId);
    if (!object) return false;

    this.selectedObjects.delete(object);
    this.removeHighlight(object);
    console.log(`❌ Objeto deseleccionado: ${object.userData.name}`);
    return true;
  }

  /**
   * Obtiene todos los objetos seleccionados
   */
  getSelectedObjects() {
    return Array.from(this.selectedObjects);
  }

  /**
   * Limpia la selección
   */
  clearSelection() {
    this.selectedObjects.forEach(object => {
      this.removeHighlight(object);
    });
    this.selectedObjects.clear();
    console.log('🧹 Selección limpiada');
  }

  /**
   * Resalta un objeto
   */
  highlightObject(object) {
    if (object.material) {
      object.userData.originalMaterial = object.material.clone();
      object.material.emissive = new THREE.Color(0x4a9eff);
      object.material.emissiveIntensity = 0.2;
    }
  }

  /**
   * Remueve el resaltado de un objeto
   */
  removeHighlight(object) {
    if (object.userData.originalMaterial) {
      object.material = object.userData.originalMaterial;
      delete object.userData.originalMaterial;
    }
  }

  /**
   * Añade una operación al historial
   */
  addToHistory(operation) {
    // Eliminar operaciones futuras si estamos en medio del historial
    if (this.historyIndex < this.history.length - 1) {
      this.history = this.history.slice(0, this.historyIndex + 1);
    }

    this.history.push(operation);
    this.historyIndex++;

    // Limitar el tamaño del historial
    if (this.history.length > this.maxHistorySize) {
      this.history.shift();
      this.historyIndex--;
    }
  }

  /**
   * Deshace la última operación
   */
  undo() {
    if (this.historyIndex < 0) {
      console.warn('⚠️ No hay operaciones para deshacer');
      return false;
    }

    const operation = this.history[this.historyIndex];
    this.executeUndo(operation);
    this.historyIndex--;

    console.log(`↩️ Deshecho: ${operation.type}`);
    return true;
  }

  /**
   * Rehace la última operación deshecha
   */
  redo() {
    if (this.historyIndex >= this.history.length - 1) {
      console.warn('⚠️ No hay operaciones para rehacer');
      return false;
    }

    this.historyIndex++;
    const operation = this.history[this.historyIndex];
    this.executeRedo(operation);

    console.log(`↪️ Rehecho: ${operation.type}`);
    return true;
  }

  /**
   * Ejecuta la operación de deshacer
   */
  executeUndo(operation) {
    switch (operation.type) {
      case 'add_object':
        this.removeObject(operation.objectId);
        break;
      case 'remove_object':
        this.scene.add(operation.object);
        this.objectRegistry.set(operation.objectId, operation.object);
        break;
      case 'transform_object':
        // Restaurar transformación anterior
        if (operation.previousTransform) {
          const object = this.objectRegistry.get(operation.objectId);
          if (object) {
            object.position.copy(operation.previousTransform.position);
            object.rotation.copy(operation.previousTransform.rotation);
            object.scale.copy(operation.previousTransform.scale);
          }
        }
        break;
    }
  }

  /**
   * Ejecuta la operación de rehacer
   */
  executeRedo(operation) {
    switch (operation.type) {
      case 'add_object':
        this.scene.add(operation.object);
        this.objectRegistry.set(operation.objectId, operation.object);
        break;
      case 'remove_object':
        this.removeObject(operation.objectId);
        break;
      case 'transform_object':
        // Aplicar nueva transformación
        if (operation.newTransform) {
          const object = this.objectRegistry.get(operation.objectId);
          if (object) {
            object.position.copy(operation.newTransform.position);
            object.rotation.copy(operation.newTransform.rotation);
            object.scale.copy(operation.newTransform.scale);
          }
        }
        break;
    }
  }

  /**
   * Genera un ID único para objetos
   */
  generateObjectId() {
    return `obj_${Date.now()}_${this.objectCounter++}`;
  }

  /**
   * Obtiene estadísticas de la escena
   */
  getSceneStats() {
    return {
      totalObjects: this.objectRegistry.size,
      totalGroups: this.groupRegistry.size,
      selectedObjects: this.selectedObjects.size,
      historySize: this.history.length,
      historyIndex: this.historyIndex
    };
  }

  /**
   * Limpia todos los recursos
   */
  dispose() {
    this.objectRegistry.clear();
    this.groupRegistry.clear();
    this.layerRegistry.clear();
    this.history = [];
    this.historyIndex = -1;
    this.selectedObjects.clear();
    console.log('🧹 Scene Helpers limpiado');
  }
}

export { SceneHelpers }; 
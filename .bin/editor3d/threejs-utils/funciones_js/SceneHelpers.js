/**
 * Scene Helpers - Utilidades de gestión de escena y jerarquía de objetos para el editor 3D
 * Maneja la gestión de escena, grupos, padres/hijos, y organización de objetos
 * Inspirado en Blender y Godot
 */

import * as THREE from 'three';

class SceneHelpers {
  constructor() {
    this.scene = null;
    this.objectCounter = 0;
    this.groups = new Map();
    this.layers = new Map();
    this.selectionHistory = [];
    this.maxHistorySize = 50;
    this.autoSaveEnabled = true;
    this.autoSaveInterval = 30000; // 30 segundos
    this.lastAutoSave = Date.now();
  }

  /**
   * Inicializa la escena con configuración básica
   */
  initializeScene() {
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x23272e);
    this.scene.fog = new THREE.Fog(0x23272e, 10, 100);
    
    // Configurar capas por defecto
    this.setupDefaultLayers();
    
    // Configurar grupos por defecto
    this.setupDefaultGroups();
    
    return this.scene;
  }

  /**
   * Configura capas por defecto
   */
  setupDefaultLayers() {
    this.layers.set('default', 0);
    this.layers.set('ui', 1);
    this.layers.set('background', 2);
    this.layers.set('foreground', 3);
    this.layers.set('collision', 4);
    this.layers.set('lighting', 5);
    this.layers.set('cameras', 6);
    this.layers.set('helpers', 7);
  }

  /**
   * Configura grupos por defecto
   */
  setupDefaultGroups() {
    const defaultGroups = [
      'geometry',
      'lights',
      'cameras',
      'helpers',
      'ui',
      'collision',
      'particles',
      'audio'
    ];

    defaultGroups.forEach(groupName => {
      const group = new THREE.Group();
      group.name = groupName;
      group.userData = { type: 'group', category: groupName };
      this.groups.set(groupName, group);
      this.scene.add(group);
    });
  }

  /**
   * Añade un objeto a la escena con gestión automática
   */
  addObject(object, groupName = 'geometry', layerName = 'default') {
    if (!this.scene) {
      console.error('Scene not initialized');
      return null;
    }

    // Asignar ID único
    object.userData.id = this.generateObjectId();
    object.userData.addedAt = Date.now();
    object.userData.group = groupName;
    object.userData.layer = layerName;

    // Añadir al grupo correspondiente
    const group = this.groups.get(groupName);
    if (group) {
      group.add(object);
    } else {
      this.scene.add(object);
    }

    // Configurar capa
    this.setObjectLayer(object, layerName);

    // Auto-save si está habilitado
    if (this.autoSaveEnabled) {
      this.checkAutoSave();
    }

    return object;
  }

  /**
   * Genera un ID único para objetos
   */
  generateObjectId() {
    return `obj_${Date.now()}_${this.objectCounter++}`;
  }

  /**
   * Establece la capa de un objeto
   */
  setObjectLayer(object, layerName) {
    const layerIndex = this.layers.get(layerName);
    if (layerIndex !== undefined) {
      object.layers.set(layerIndex);
    }
  }

  /**
   * Crea un grupo personalizado
   */
  createGroup(name, parentGroup = null) {
    const group = new THREE.Group();
    group.name = name;
    group.userData = { type: 'group', category: 'custom' };

    if (parentGroup && this.groups.has(parentGroup)) {
      this.groups.get(parentGroup).add(group);
    } else {
      this.scene.add(group);
    }

    this.groups.set(name, group);
    return group;
  }

  /**
   * Obtiene todos los objetos de un grupo
   */
  getObjectsInGroup(groupName) {
    const group = this.groups.get(groupName);
    if (!group) return [];

    const objects = [];
    group.traverse((child) => {
      if (child.type !== 'Group') {
        objects.push(child);
      }
    });

    return objects;
  }

  /**
   * Mueve un objeto entre grupos
   */
  moveObjectToGroup(object, targetGroupName) {
    const targetGroup = this.groups.get(targetGroupName);
    if (!targetGroup) {
      console.error(`Group ${targetGroupName} not found`);
      return false;
    }

    // Remover del grupo actual
    if (object.parent) {
      object.parent.remove(object);
    }

    // Añadir al nuevo grupo
    targetGroup.add(object);
    object.userData.group = targetGroupName;

    return true;
  }

  /**
   * Duplica un objeto
   */
  duplicateObject(object) {
    const clone = object.clone();
    
    // Generar nuevo ID
    clone.userData.id = this.generateObjectId();
    clone.userData.duplicatedFrom = object.userData.id;
    clone.userData.duplicatedAt = Date.now();

    // Ajustar posición ligeramente
    clone.position.add(new THREE.Vector3(1, 0, 0));

    // Añadir a la escena
    this.addObject(clone, object.userData.group, object.userData.layer);

    return clone;
  }

  /**
   * Elimina un objeto de la escena
   */
  removeObject(object) {
    if (object.parent) {
      object.parent.remove(object);
    }

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

    // Remover de la historia de selección
    this.selectionHistory = this.selectionHistory.filter(obj => obj !== object);
  }

  /**
   * Obtiene estadísticas de la escena
   */
  getSceneStats() {
    let totalObjects = 0;
    let totalVertices = 0;
    let totalFaces = 0;
    let totalMaterials = 0;
    const materials = new Set();

    this.scene.traverse((object) => {
      if (object.type === 'Mesh') {
        totalObjects++;
        if (object.geometry) {
          totalVertices += object.geometry.attributes.position.count;
          if (object.geometry.index) {
            totalFaces += object.geometry.index.count / 3;
          }
        }
        if (object.material) {
          if (Array.isArray(object.material)) {
            object.material.forEach(mat => materials.add(mat));
          } else {
            materials.add(object.material);
          }
        }
      }
    });

    return {
      totalObjects,
      totalVertices,
      totalFaces: Math.floor(totalFaces),
      totalMaterials: materials.size,
      groups: this.groups.size,
      layers: this.layers.size
    };
  }

  /**
   * Limpia la escena completamente
   */
  clearScene() {
    this.scene.traverse((object) => {
      if (object.type === 'Mesh') {
        this.removeObject(object);
      }
    });

    // Limpiar grupos
    this.groups.clear();
    this.setupDefaultGroups();

    // Limpiar historia
    this.selectionHistory = [];
  }

  /**
   * Guarda la escena como JSON
   */
  exportScene() {
    const sceneData = {
      metadata: {
        version: '1.0',
        type: 'scene',
        generator: 'WoldVirtual3D Editor',
        exportedAt: new Date().toISOString()
      },
      scene: this.scene.toJSON(),
      groups: Array.from(this.groups.keys()),
      layers: Array.from(this.layers.keys()),
      stats: this.getSceneStats()
    };

    return sceneData;
  }

  /**
   * Carga una escena desde JSON
   */
  loadScene(sceneData) {
    try {
      // Limpiar escena actual
      this.clearScene();

      // Cargar escena
      const loader = new THREE.ObjectLoader();
      this.scene = loader.parse(sceneData.scene);

      // Restaurar grupos y capas
      this.setupDefaultLayers();
      this.setupDefaultGroups();

      return true;
    } catch (error) {
      console.error('Error loading scene:', error);
      return false;
    }
  }

  /**
   * Verifica si es necesario hacer auto-save
   */
  checkAutoSave() {
    const now = Date.now();
    if (now - this.lastAutoSave > this.autoSaveInterval) {
      this.autoSave();
      this.lastAutoSave = now;
    }
  }

  /**
   * Realiza auto-save de la escena
   */
  autoSave() {
    try {
      const sceneData = this.exportScene();
      localStorage.setItem('woldvirtual3d_autosave', JSON.stringify(sceneData));
      console.log('Auto-save completed');
    } catch (error) {
      console.error('Auto-save failed:', error);
    }
  }
}

export default SceneHelpers; 
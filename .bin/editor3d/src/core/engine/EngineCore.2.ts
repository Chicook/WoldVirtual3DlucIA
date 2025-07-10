/**
 * EngineCore.2.ts - Motor 3D Avanzado (Segunda Instancia)
 * Gestión de escenas, objetos 3D y renderizado avanzado
 * 
 * Líneas: 1-300 (Segunda instancia)
 */

import { engineCore, EngineState, EngineMessage } from './EngineCore';
import { EventEmitter } from 'events';

// Tipos para gestión de escenas
export interface SceneObject {
  id: string;
  name: string;
  type: 'mesh' | 'light' | 'camera' | 'group' | 'helper';
  position: { x: number; y: number; z: number };
  rotation: { x: number; y: number; z: number };
  scale: { x: number; y: number; z: number };
  visible: boolean;
  userData: Record<string, any>;
  children?: SceneObject[];
  parent?: string;
}

export interface Scene {
  id: string;
  name: string;
  objects: SceneObject[];
  metadata: {
    version: string;
    created: number;
    modified: number;
    author: string;
  };
  settings: {
    backgroundColor: string;
    ambientLight: boolean;
    shadows: boolean;
    fog: boolean;
  };
}

export interface RenderSettings {
  antialias: boolean;
  shadowMap: boolean;
  shadowMapType: 'BasicShadowMap' | 'PCFShadowMap' | 'PCFSoftShadowMap';
  pixelRatio: number;
  maxFPS: number;
  quality: 'low' | 'medium' | 'high' | 'ultra';
}

export class AdvancedEngineCore extends EventEmitter {
  private scenes: Map<string, Scene> = new Map();
  private activeScene: string | null = null;
  private renderSettings: RenderSettings;
  private selectedObjects: Set<string> = new Set();
  private undoStack: Scene[] = [];
  private redoStack: Scene[] = [];
  private maxUndoSteps = 50;

  constructor() {
    super();
    
    this.renderSettings = {
      antialias: true,
      shadowMap: true,
      shadowMapType: 'PCFSoftShadowMap',
      pixelRatio: window.devicePixelRatio || 1,
      maxFPS: 60,
      quality: 'high'
    };

    // Escuchar eventos del motor base
    engineCore.on('connected', () => {
      this.initializeDefaultScene();
      this.emit('engineReady');
    });

    engineCore.on('message', (message: EngineMessage) => {
      this.handleEngineMessage(message);
    });
  }

  /**
   * Crear nueva escena
   */
  createScene(name: string, settings?: Partial<Scene['settings']>): Scene {
    const scene: Scene = {
      id: this.generateId(),
      name,
      objects: [],
      metadata: {
        version: '1.0.0',
        created: Date.now(),
        modified: Date.now(),
        author: 'Editor3D'
      },
      settings: {
        backgroundColor: '#000000',
        ambientLight: true,
        shadows: true,
        fog: false,
        ...settings
      }
    };

    this.scenes.set(scene.id, scene);
    this.emit('sceneCreated', scene);

    if (!this.activeScene) {
      this.setActiveScene(scene.id);
    }

    return scene;
  }

  /**
   * Establecer escena activa
   */
  setActiveScene(sceneId: string): boolean {
    if (!this.scenes.has(sceneId)) {
      return false;
    }

    this.activeScene = sceneId;
    engineCore.sendMessage('setActiveScene', { sceneId });
    this.emit('activeSceneChanged', sceneId);
    return true;
  }

  /**
   * Obtener escena activa
   */
  getActiveScene(): Scene | null {
    if (!this.activeScene) return null;
    return this.scenes.get(this.activeScene) || null;
  }

  /**
   * Agregar objeto a la escena
   */
  addObject(sceneId: string, object: Omit<SceneObject, 'id'>): SceneObject | null {
    const scene = this.scenes.get(sceneId);
    if (!scene) return null;

    const newObject: SceneObject = {
      ...object,
      id: this.generateId()
    };

    scene.objects.push(newObject);
    scene.metadata.modified = Date.now();

    this.saveUndoState();
    engineCore.sendMessage('addObject', { sceneId, object: newObject });
    this.emit('objectAdded', newObject, sceneId);

    return newObject;
  }

  /**
   * Eliminar objeto de la escena
   */
  removeObject(sceneId: string, objectId: string): boolean {
    const scene = this.scenes.get(sceneId);
    if (!scene) return false;

    const index = scene.objects.findIndex(obj => obj.id === objectId);
    if (index === -1) return false;

    const removedObject = scene.objects.splice(index, 1)[0];
    scene.metadata.modified = Date.now();

    // Remover de selección si está seleccionado
    this.selectedObjects.delete(objectId);

    this.saveUndoState();
    engineCore.sendMessage('removeObject', { sceneId, objectId });
    this.emit('objectRemoved', removedObject, sceneId);

    return true;
  }

  /**
   * Actualizar objeto en la escena
   */
  updateObject(sceneId: string, objectId: string, updates: Partial<SceneObject>): boolean {
    const scene = this.scenes.get(sceneId);
    if (!scene) return false;

    const object = scene.objects.find(obj => obj.id === objectId);
    if (!object) return false;

    const oldObject = { ...object };
    Object.assign(object, updates);
    scene.metadata.modified = Date.now();

    this.saveUndoState();
    engineCore.sendMessage('updateObject', { sceneId, objectId, updates });
    this.emit('objectUpdated', object, oldObject, sceneId);

    return true;
  }

  /**
   * Seleccionar objetos
   */
  selectObjects(objectIds: string[]): void {
    this.selectedObjects.clear();
    objectIds.forEach(id => this.selectedObjects.add(id));
    
    engineCore.sendMessage('selectObjects', { objectIds });
    this.emit('objectsSelected', objectIds);
  }

  /**
   * Obtener objetos seleccionados
   */
  getSelectedObjects(): string[] {
    return Array.from(this.selectedObjects);
  }

  /**
   * Deseleccionar todos los objetos
   */
  clearSelection(): void {
    this.selectedObjects.clear();
    engineCore.sendMessage('clearSelection');
    this.emit('selectionCleared');
  }

  /**
   * Duplicar objetos seleccionados
   */
  duplicateSelectedObjects(): SceneObject[] {
    const scene = this.getActiveScene();
    if (!scene) return [];

    const duplicatedObjects: SceneObject[] = [];
    
    this.selectedObjects.forEach(objectId => {
      const original = scene.objects.find(obj => obj.id === objectId);
      if (original) {
        const duplicated = {
          ...original,
          id: this.generateId(),
          name: `${original.name} (Copy)`,
          position: {
            x: original.position.x + 2,
            y: original.position.y,
            z: original.position.z
          }
        };
        
        scene.objects.push(duplicated);
        duplicatedObjects.push(duplicated);
      }
    });

    if (duplicatedObjects.length > 0) {
      scene.metadata.modified = Date.now();
      this.saveUndoState();
      engineCore.sendMessage('duplicateObjects', { 
        sceneId: scene.id, 
        objects: duplicatedObjects 
      });
      this.emit('objectsDuplicated', duplicatedObjects);
    }

    return duplicatedObjects;
  }

  /**
   * Agrupar objetos seleccionados
   */
  groupSelectedObjects(groupName: string): SceneObject | null {
    const scene = this.getActiveScene();
    if (!scene || this.selectedObjects.size < 2) return null;

    const selectedObjects = scene.objects.filter(obj => 
      this.selectedObjects.has(obj.id)
    );

    const group: SceneObject = {
      id: this.generateId(),
      name: groupName,
      type: 'group',
      position: { x: 0, y: 0, z: 0 },
      rotation: { x: 0, y: 0, z: 0 },
      scale: { x: 1, y: 1, z: 1 },
      visible: true,
      userData: {},
      children: selectedObjects.map(obj => obj.id)
    };

    // Actualizar parent de objetos hijos
    selectedObjects.forEach(obj => {
      obj.parent = group.id;
    });

    scene.objects.push(group);
    scene.metadata.modified = Date.now();

    this.saveUndoState();
    engineCore.sendMessage('groupObjects', { 
      sceneId: scene.id, 
      group, 
      objectIds: Array.from(this.selectedObjects) 
    });
    this.emit('objectsGrouped', group, selectedObjects);

    return group;
  }

  /**
   * Desagrupar objetos
   */
  ungroupObjects(groupId: string): SceneObject[] | null {
    const scene = this.getActiveScene();
    if (!scene) return null;

    const group = scene.objects.find(obj => obj.id === groupId);
    if (!group || group.type !== 'group') return null;

    const children = scene.objects.filter(obj => obj.parent === groupId);
    
    // Remover parent de objetos hijos
    children.forEach(obj => {
      delete obj.parent;
    });

    // Remover grupo
    const groupIndex = scene.objects.findIndex(obj => obj.id === groupId);
    scene.objects.splice(groupIndex, 1);
    scene.metadata.modified = Date.now();

    this.saveUndoState();
    engineCore.sendMessage('ungroupObjects', { 
      sceneId: scene.id, 
      groupId, 
      children: children.map(obj => obj.id) 
    });
    this.emit('objectsUngrouped', group, children);

    return children;
  }

  /**
   * Guardar estado para undo
   */
  private saveUndoState(): void {
    const scene = this.getActiveScene();
    if (!scene) return;

    this.undoStack.push(JSON.parse(JSON.stringify(scene)));
    
    // Limitar tamaño del stack
    if (this.undoStack.length > this.maxUndoSteps) {
      this.undoStack.shift();
    }

    // Limpiar redo stack
    this.redoStack = [];
  }

  /**
   * Deshacer última acción
   */
  undo(): boolean {
    if (this.undoStack.length === 0) return false;

    const currentScene = this.getActiveScene();
    if (!currentScene) return false;

    // Guardar estado actual en redo
    this.redoStack.push(JSON.parse(JSON.stringify(currentScene)));

    // Restaurar estado anterior
    const previousState = this.undoStack.pop()!;
    this.scenes.set(currentScene.id, previousState);

    engineCore.sendMessage('undo', { sceneId: currentScene.id });
    this.emit('undo', previousState);

    return true;
  }

  /**
   * Rehacer última acción deshecha
   */
  redo(): boolean {
    if (this.redoStack.length === 0) return false;

    const currentScene = this.getActiveScene();
    if (!currentScene) return false;

    // Guardar estado actual en undo
    this.undoStack.push(JSON.parse(JSON.stringify(currentScene)));

    // Restaurar estado siguiente
    const nextState = this.redoStack.pop()!;
    this.scenes.set(currentScene.id, nextState);

    engineCore.sendMessage('redo', { sceneId: currentScene.id });
    this.emit('redo', nextState);

    return true;
  }

  /**
   * Exportar escena
   */
  exportScene(sceneId: string, format: 'json' | 'gltf' | 'obj'): string {
    const scene = this.scenes.get(sceneId);
    if (!scene) return '';

    switch (format) {
      case 'json':
        return JSON.stringify(scene, null, 2);
      
      case 'gltf':
      case 'obj':
        engineCore.sendMessage('exportScene', { sceneId, format });
        return `Exporting to ${format.toUpperCase()}...`;
      
      default:
        return '';
    }
  }

  /**
   * Importar escena
   */
  importScene(data: string, format: 'json' | 'gltf' | 'obj'): Scene | null {
    try {
      if (format === 'json') {
        const scene: Scene = JSON.parse(data);
        scene.id = this.generateId();
        scene.metadata.modified = Date.now();
        
        this.scenes.set(scene.id, scene);
        this.emit('sceneImported', scene);
        
        return scene;
      } else {
        engineCore.sendMessage('importScene', { data, format });
        return null;
      }
    } catch (error) {
      this.emit('importError', error);
      return null;
    }
  }

  /**
   * Actualizar configuración de renderizado
   */
  updateRenderSettings(settings: Partial<RenderSettings>): void {
    this.renderSettings = { ...this.renderSettings, ...settings };
    engineCore.sendMessage('updateRenderSettings', this.renderSettings);
    this.emit('renderSettingsUpdated', this.renderSettings);
  }

  /**
   * Obtener configuración de renderizado
   */
  getRenderSettings(): RenderSettings {
    return { ...this.renderSettings };
  }

  /**
   * Inicializar escena por defecto
   */
  private initializeDefaultScene(): void {
    const defaultScene = this.createScene('Default Scene', {
      backgroundColor: '#1a1a1a',
      ambientLight: true,
      shadows: true,
      fog: false
    });

    // Agregar objetos básicos
    this.addObject(defaultScene.id, {
      name: 'Ground',
      type: 'mesh',
      position: { x: 0, y: -1, z: 0 },
      rotation: { x: 0, y: 0, z: 0 },
      scale: { x: 10, y: 1, z: 10 },
      visible: true,
      userData: { geometry: 'plane', material: 'standard' }
    });

    this.addObject(defaultScene.id, {
      name: 'Cube',
      type: 'mesh',
      position: { x: 0, y: 0, z: 0 },
      rotation: { x: 0, y: 0, z: 0 },
      scale: { x: 1, y: 1, z: 1 },
      visible: true,
      userData: { geometry: 'box', material: 'standard' }
    });
  }

  /**
   * Manejar mensajes del motor
   */
  private handleEngineMessage(message: EngineMessage): void {
    switch (message.type) {
      case 'sceneUpdated':
        this.emit('sceneUpdated', message.data);
        break;
      
      case 'objectSelected':
        this.selectedObjects.add(message.data.objectId);
        this.emit('objectSelected', message.data.objectId);
        break;
      
      case 'objectDeselected':
        this.selectedObjects.delete(message.data.objectId);
        this.emit('objectDeselected', message.data.objectId);
        break;
      
      default:
        this.emit('engineMessage', message);
    }
  }

  /**
   * Generar ID único
   */
  private generateId(): string {
    return Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
  }
}

// Exportar instancia singleton
export const advancedEngineCore = new AdvancedEngineCore(); 
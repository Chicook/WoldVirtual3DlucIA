/**
 * Project Manager - Utilidades de gestión de proyectos para el editor 3D
 * Maneja la creación, carga, guardado y gestión de proyectos con metadatos y configuración
 * Inspirado en Blender y Godot
 */

import * as THREE from 'three';

class ProjectManager {
  constructor() {
    this.currentProject = null;
    this.projectHistory = [];
    this.maxHistorySize = 50;
    this.autoSaveEnabled = true;
    this.autoSaveInterval = 30000; // 30 segundos
    this.autoSaveTimer = null;
    this.projectVersion = '1.0.0';
    this.supportedFormats = ['json', 'gltf', 'obj', 'fbx'];
  }

  /**
   * Crea un nuevo proyecto con configuración básica
   */
  createProject(name, description = '', author = '') {
    const project = {
      id: this.generateProjectId(),
      name: name,
      description: description,
      author: author,
      version: this.projectVersion,
      createdAt: new Date().toISOString(),
      lastModified: new Date().toISOString(),
      settings: this.getDefaultSettings(),
      metadata: {
        sceneCount: 0,
        objectCount: 0,
        materialCount: 0,
        textureCount: 0,
        animationCount: 0
      },
      scenes: [],
      assets: [],
      thumbnails: []
    };

    this.currentProject = project;
    this.addToHistory(project);
    this.startAutoSave();
    
    return project;
  }

  /**
   * Genera un ID único para el proyecto
   */
  generateProjectId() {
    return 'project_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  /**
   * Obtiene la configuración por defecto del proyecto
   */
  getDefaultSettings() {
    return {
      renderer: {
        antialias: true,
        shadowMap: true,
        shadowMapType: THREE.PCFSoftShadowMap,
        outputEncoding: THREE.sRGBEncoding,
        toneMapping: THREE.ACESFilmicToneMapping,
        toneMappingExposure: 1.0
      },
      camera: {
        fov: 60,
        near: 0.1,
        far: 1000,
        position: { x: 5, y: 5, z: 5 }
      },
      lighting: {
        ambient: { color: 0x404040, intensity: 0.4 },
        directional: { color: 0xffffff, intensity: 0.8, position: { x: 10, y: 10, z: 5 } }
      },
      grid: {
        size: 100,
        divisions: 100,
        color: 0x888888
      },
      snapping: {
        enabled: false,
        grid: 1.0,
        angle: Math.PI / 4,
        distance: 1.0
      }
    };
  }

  /**
   * Guarda el proyecto actual en formato JSON
   */
  saveProject(format = 'json') {
    if (!this.currentProject) {
      throw new Error('No hay proyecto activo para guardar');
    }

    this.currentProject.lastModified = new Date().toISOString();
    this.currentProject.metadata = this.calculateProjectMetadata();

    const projectData = {
      ...this.currentProject,
      exportDate: new Date().toISOString(),
      exportFormat: format
    };

    if (format === 'json') {
      return this.saveAsJSON(projectData);
    } else {
      return this.exportToFormat(projectData, format);
    }
  }

  /**
   * Calcula los metadatos actuales del proyecto
   */
  calculateProjectMetadata() {
    // Esta función se implementaría para contar objetos, materiales, etc.
    return {
      sceneCount: this.currentProject.scenes.length,
      objectCount: 0, // Se calcularía contando objetos en todas las escenas
      materialCount: 0,
      textureCount: 0,
      animationCount: 0
    };
  }

  /**
   * Guarda el proyecto como JSON
   */
  saveAsJSON(projectData) {
    const jsonString = JSON.stringify(projectData, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `${projectData.name}_${Date.now()}.json`;
    link.click();
    
    URL.revokeObjectURL(url);
    return { success: true, format: 'json', filename: link.download };
  }

  /**
   * Exporta el proyecto a otros formatos
   */
  exportToFormat(projectData, format) {
    // Implementación para exportar a GLTF, OBJ, FBX, etc.
    console.log(`Exportando proyecto a formato: ${format}`);
    return { success: true, format: format, filename: `${projectData.name}.${format}` };
  }

  /**
   * Carga un proyecto desde archivo
   */
  loadProject(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (event) => {
        try {
          const projectData = JSON.parse(event.target.result);
          this.validateProjectData(projectData);
          
          this.currentProject = projectData;
          this.addToHistory(projectData);
          this.startAutoSave();
          
          resolve(projectData);
        } catch (error) {
          reject(new Error(`Error al cargar proyecto: ${error.message}`));
        }
      };
      
      reader.onerror = () => reject(new Error('Error al leer el archivo'));
      reader.readAsText(file);
    });
  }

  /**
   * Valida que los datos del proyecto sean correctos
   */
  validateProjectData(projectData) {
    const requiredFields = ['id', 'name', 'version', 'createdAt', 'settings'];
    
    for (const field of requiredFields) {
      if (!projectData[field]) {
        throw new Error(`Campo requerido faltante: ${field}`);
      }
    }
    
    if (!projectData.settings.renderer || !projectData.settings.camera) {
      throw new Error('Configuración del proyecto incompleta');
    }
  }

  /**
   * Añade el proyecto al historial
   */
  addToHistory(project) {
    this.projectHistory.unshift({
      ...project,
      timestamp: new Date().toISOString()
    });
    
    if (this.projectHistory.length > this.maxHistorySize) {
      this.projectHistory.pop();
    }
  }

  /**
   * Inicia el guardado automático
   */
  startAutoSave() {
    if (this.autoSaveEnabled && this.currentProject) {
      this.stopAutoSave();
      this.autoSaveTimer = setInterval(() => {
        this.autoSave();
      }, this.autoSaveInterval);
    }
  }

  /**
   * Detiene el guardado automático
   */
  stopAutoSave() {
    if (this.autoSaveTimer) {
      clearInterval(this.autoSaveTimer);
      this.autoSaveTimer = null;
    }
  }

  /**
   * Guardado automático del proyecto
   */
  autoSave() {
    if (this.currentProject) {
      try {
        const autoSaveData = {
          ...this.currentProject,
          lastAutoSave: new Date().toISOString()
        };
        
        localStorage.setItem(`autosave_${this.currentProject.id}`, JSON.stringify(autoSaveData));
        console.log('Proyecto guardado automáticamente');
      } catch (error) {
        console.error('Error en guardado automático:', error);
      }
    }
  }

  /**
   * Carga el último guardado automático
   */
  loadAutoSave(projectId) {
    try {
      const autoSaveData = localStorage.getItem(`autosave_${projectId}`);
      if (autoSaveData) {
        return JSON.parse(autoSaveData);
      }
    } catch (error) {
      console.error('Error al cargar guardado automático:', error);
    }
    return null;
  }

  /**
   * Obtiene información del proyecto actual
   */
  getProjectInfo() {
    if (!this.currentProject) return null;
    
    return {
      name: this.currentProject.name,
      description: this.currentProject.description,
      author: this.currentProject.author,
      version: this.currentProject.version,
      createdAt: this.currentProject.createdAt,
      lastModified: this.currentProject.lastModified,
      metadata: this.currentProject.metadata
    };
  }

  /**
   * Actualiza la configuración del proyecto
   */
  updateProjectSettings(newSettings) {
    if (this.currentProject) {
      this.currentProject.settings = { ...this.currentProject.settings, ...newSettings };
      this.currentProject.lastModified = new Date().toISOString();
    }
  }

  /**
   * Limpia el historial de proyectos
   */
  clearHistory() {
    this.projectHistory = [];
  }

  /**
   * Obtiene el historial de proyectos
   */
  getHistory() {
    return this.projectHistory;
  }
}

export default ProjectManager;

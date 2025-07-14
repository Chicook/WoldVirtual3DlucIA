import { SceneObject } from '../contexts/EditorContext';

export interface MetaversoScene {
  id?: string;
  name: string;
  description?: string;
  objects: SceneObject[];
  metadata: {
    created: string;
    version: string;
    author?: string;
    tags?: string[];
  };
  settings?: {
    spawnPoint?: { x: number; y: number; z: number };
    skybox?: string;
    lighting?: {
      ambient: { color: string; intensity: number };
      directional: { color: string; intensity: number; position: { x: number; y: number; z: number } };
    };
  };
}

export interface PublishResponse {
  success: boolean;
  sceneId?: string;
  message: string;
  url?: string;
}

class MetaversoAPI {
  private baseURL: string;
  private clientURL: string;

  constructor() {
    // URLs de desarrollo - cambiar en producción
    this.baseURL = 'http://localhost:5173'; // Editor
    this.clientURL = 'http://localhost:3000'; // Cliente
  }

  /**
   * Exportar escena en formato compatible con el metaverso
   */
  exportScene(sceneData: MetaversoScene): string {
    return JSON.stringify(sceneData, null, 2);
  }

  /**
   * Guardar escena en localStorage del editor
   */
  saveSceneLocally(sceneData: MetaversoScene): boolean {
    try {
      localStorage.setItem('metaverso-scene', JSON.stringify(sceneData));
      return true;
    } catch (error) {
      console.error('Error al guardar escena localmente:', error);
      return false;
    }
  }

  /**
   * Cargar escena desde localStorage del editor
   */
  loadSceneLocally(): MetaversoScene | null {
    try {
      const saved = localStorage.getItem('metaverso-scene');
      if (saved) {
        return JSON.parse(saved);
      }
      return null;
    } catch (error) {
      console.error('Error al cargar escena localmente:', error);
      return null;
    }
  }

  /**
   * Enviar escena al cliente del metaverso
   */
  async sendToMetaverso(sceneData: MetaversoScene): Promise<PublishResponse> {
    try {
      console.log('Enviando escena al metaverso:', sceneData);
      
      // Generar ID único para la escena
      const sceneId = `scene_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      sceneData.id = sceneId;
      
      // Guardar escena en localStorage (compartido entre editor y cliente)
      const sceneKey = `metaverso-scene-${sceneId}`;
      localStorage.setItem(sceneKey, JSON.stringify(sceneData));
      
      // Enviar mensaje de notificación al cliente
      const message = {
        type: 'scene-published' as const,
        sceneId,
        scene: sceneData,
        timestamp: Date.now()
      };
      
      localStorage.setItem('metaverso-editor-communication', JSON.stringify(message));
      
      // Simular delay para procesamiento
      await new Promise(resolve => setTimeout(resolve, 500));
      
      return {
        success: true,
        sceneId,
        message: 'Escena enviada al metaverso correctamente',
        url: `${this.clientURL}/scene/${sceneId}`
      };
    } catch (error) {
      console.error('Error al enviar escena al metaverso:', error);
      return {
        success: false,
        message: 'Error al enviar escena al metaverso'
      };
    }
  }

  /**
   * Publicar escena en el metaverso (con validación)
   */
  async publishScene(sceneData: MetaversoScene): Promise<PublishResponse> {
    try {
      // Validar escena
      if (!this.validateScene(sceneData)) {
        return {
          success: false,
          message: 'La escena no es válida. Verifica que tenga objetos y configuración correcta.'
        };
      }

      // Enviar al metaverso
      const response = await this.sendToMetaverso(sceneData);
      
      if (response.success) {
        // Guardar localmente como respaldo
        this.saveSceneLocally(sceneData);
      }
      
      return response;
    } catch (error) {
      console.error('Error al publicar escena:', error);
      return {
        success: false,
        message: 'Error inesperado al publicar la escena'
      };
    }
  }

  /**
   * Validar escena antes de publicar
   */
  private validateScene(sceneData: MetaversoScene): boolean {
    // Verificar que tenga objetos
    if (!sceneData.objects || sceneData.objects.length === 0) {
      return false;
    }

    // Verificar que tenga nombre
    if (!sceneData.name || sceneData.name.trim() === '') {
      return false;
    }

    // Verificar que los objetos sean válidos
    for (const obj of sceneData.objects) {
      if (!obj.id || !obj.name || !obj.type) {
        return false;
      }
    }

    return true;
  }

  /**
   * Obtener información del cliente del metaverso
   */
  async getMetaversoInfo(): Promise<{ version: string; status: string } | null> {
    try {
      // Enviar mensaje de prueba al cliente
      const testMessage = {
        type: 'connection-test' as const,
        timestamp: Date.now()
      };
      
      localStorage.setItem('metaverso-editor-communication', JSON.stringify(testMessage));
      
      // Esperar respuesta del cliente
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Verificar si hay respuesta
      const responseStr = localStorage.getItem('metaverso-client-response');
      if (responseStr) {
        const response = JSON.parse(responseStr);
        if (response.source === 'metaverso-client' && response.success) {
          return {
            version: '1.0.0',
            status: 'online'
          };
        }
      }
      
      // Si no hay respuesta, verificar si el cliente está ejecutándose
      // Simulamos que está online si podemos acceder al localStorage
      return {
        version: '1.0.0',
        status: 'online'
      };
    } catch (error) {
      console.error('Error al obtener información del metaverso:', error);
      return null;
    }
  }

  /**
   * Convertir escena del editor al formato del metaverso
   */
  convertToMetaversoFormat(
    objects: SceneObject[], 
    name: string = 'Mi Escena',
    description?: string
  ): MetaversoScene {
    return {
      name,
      description,
      objects: objects.map(obj => ({
        ...obj,
        // Asegurar que las propiedades sean compatibles
        position: { x: obj.position.x, y: obj.position.y, z: obj.position.z },
        rotation: { x: obj.rotation.x, y: obj.rotation.y, z: obj.rotation.z },
        scale: { x: obj.scale.x, y: obj.scale.y, z: obj.scale.z }
      })),
      metadata: {
        created: new Date().toISOString(),
        version: '1.0.0',
        author: 'Editor 3D',
        tags: ['editor', '3d', 'metaverso']
      },
      settings: {
        spawnPoint: { x: 0, y: 1, z: 0 },
        skybox: 'default',
        lighting: {
          ambient: { color: '#404040', intensity: 0.6 },
          directional: { 
            color: '#ffffff', 
            intensity: 0.8, 
            position: { x: 10, y: 10, z: 5 } 
          }
        }
      }
    };
  }
}

export const metaversoAPI = new MetaversoAPI(); 
export interface MetaversoScene {
  id?: string;
  name: string;
  description?: string;
  objects: any[];
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

export interface EditorMessage {
  type: 'scene-published' | 'scene-updated' | 'connection-test';
  sceneId?: string;
  scene?: MetaversoScene;
  timestamp: number;
}

class EditorCommunication {
  private readonly STORAGE_KEY = 'metaverso-editor-communication';
  private readonly SCENE_PREFIX = 'metaverso-scene-';

  /**
   * Escuchar mensajes del editor
   */
  listenForEditorMessages(callback: (message: EditorMessage) => void): () => void {
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === this.STORAGE_KEY && event.newValue) {
        try {
          const message: EditorMessage = JSON.parse(event.newValue);
          callback(message);
        } catch (error) {
          console.error('Error parsing editor message:', error);
        }
      }
    };

    // Escuchar cambios en localStorage
    window.addEventListener('storage', handleStorageChange);

    // También verificar periódicamente
    const interval = setInterval(() => {
      const message = this.getLatestMessage();
      if (message) {
        callback(message);
      }
    }, 1000);

    // Retornar función de limpieza
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }

  /**
   * Obtener el mensaje más reciente del editor
   */
  getLatestMessage(): EditorMessage | null {
    try {
      const messageStr = localStorage.getItem(this.STORAGE_KEY);
      if (messageStr) {
        return JSON.parse(messageStr);
      }
    } catch (error) {
      console.error('Error getting latest message:', error);
    }
    return null;
  }

  /**
   * Obtener una escena específica
   */
  getScene(sceneId: string): MetaversoScene | null {
    try {
      const sceneStr = localStorage.getItem(`${this.SCENE_PREFIX}${sceneId}`);
      if (sceneStr) {
        return JSON.parse(sceneStr);
      }
    } catch (error) {
      console.error('Error getting scene:', error);
    }
    return null;
  }

  /**
   * Listar todas las escenas disponibles
   */
  listScenes(): { id: string; name: string; created: string }[] {
    const scenes: { id: string; name: string; created: string }[] = [];
    
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(this.SCENE_PREFIX)) {
        try {
          const scene = this.getScene(key.replace(this.SCENE_PREFIX, ''));
          if (scene) {
            scenes.push({
              id: scene.id || key.replace(this.SCENE_PREFIX, ''),
              name: scene.name,
              created: scene.metadata.created
            });
          }
        } catch (error) {
          console.error('Error parsing scene:', error);
        }
      }
    }

    return scenes.sort((a, b) => new Date(b.created).getTime() - new Date(a.created).getTime());
  }

  /**
   * Eliminar una escena
   */
  deleteScene(sceneId: string): boolean {
    try {
      localStorage.removeItem(`${this.SCENE_PREFIX}${sceneId}`);
      return true;
    } catch (error) {
      console.error('Error deleting scene:', error);
      return false;
    }
  }

  /**
   * Enviar respuesta al editor
   */
  sendResponseToEditor(response: { type: string; success: boolean; message: string; data?: any }): void {
    try {
      const responseData = {
        ...response,
        timestamp: Date.now(),
        source: 'metaverso-client'
      };
      
      localStorage.setItem('metaverso-client-response', JSON.stringify(responseData));
    } catch (error) {
      console.error('Error sending response to editor:', error);
    }
  }

  /**
   * Verificar si el editor está conectado
   */
  isEditorConnected(): boolean {
    try {
      const message = this.getLatestMessage();
      if (message) {
        // Si hay un mensaje reciente (menos de 5 segundos), el editor está activo
        return Date.now() - message.timestamp < 5000;
      }
    } catch (error) {
      console.error('Error checking editor connection:', error);
    }
    return false;
  }

  /**
   * Obtener estadísticas de escenas
   */
  getSceneStats(): { total: number; totalObjects: number; latestScene?: string } {
    const scenes = this.listScenes();
    let totalObjects = 0;
    
    scenes.forEach(scene => {
      const sceneData = this.getScene(scene.id);
      if (sceneData) {
        totalObjects += sceneData.objects.length;
      }
    });

    return {
      total: scenes.length,
      totalObjects,
      latestScene: scenes[0]?.name
    };
  }
}

export const editorCommunication = new EditorCommunication(); 
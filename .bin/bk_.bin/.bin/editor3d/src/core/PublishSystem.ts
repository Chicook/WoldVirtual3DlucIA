import * as THREE from 'three';
import { GLTFExporter } from 'three/examples/jsm/exporters/GLTFExporter';
import { EditorScene, EditorObject } from './EditorCore';
import { execSync } from 'child_process';
import path from 'path';

// Tipos para el sistema de publicación
export interface PublishConfig {
  format: 'gltf' | 'glb' | 'obj' | 'fbx';
  includeTextures: boolean;
  optimize: boolean;
  compression: boolean;
  metadata: boolean;
  quality: 'low' | 'medium' | 'high' | 'ultra';
  resolution: number;
}

export interface PublishResult {
  success: boolean;
  sceneId?: string;
  url?: string;
  metadata?: any;
  error?: string;
  timestamp: Date;
  fileSize?: number;
  format: string;
}

export interface SceneMetadata {
  id: string;
  name: string;
  description: string;
  author: string;
  version: string;
  tags: string[];
  category: string;
  thumbnail?: string;
  createdAt: Date;
  updatedAt: Date;
  objectCount: number;
  polygonCount: number;
  textureCount: number;
  fileSize: number;
  format: string;
}

// Clase principal del sistema de publicación
export class PublishSystem {
  private config: PublishConfig = {
    format: 'gltf',
    includeTextures: true,
    optimize: true,
    compression: true,
    metadata: true,
    quality: 'high',
    resolution: 1024
  };

  private publishHistory: PublishResult[] = [];
  private isPublishing: boolean = false;

  constructor() {
    this.loadPublishHistory();
  }

  // Métodos principales de publicación

  public async publishScene(scene: EditorScene, options?: Partial<PublishConfig>): Promise<PublishResult> {
    if (this.isPublishing) {
      throw new Error('Ya hay una publicación en progreso');
    }

    this.isPublishing = true;
    const startTime = Date.now();

    try {
      // Combinar configuración
      const publishConfig = { ...this.config, ...options };
      
      console.log('🚀 Iniciando publicación de escena...', {
        sceneName: scene.name,
        objectCount: scene.objects.length,
        format: publishConfig.format
      });

      // Validar escena
      this.validateScene(scene);

      // Procesar escena
      const processedScene = await this.processScene(scene, publishConfig);

      // Exportar según formato
      const exportResult = await this.exportScene(processedScene, publishConfig);

      // Generar metadatos
      const metadata = this.generateMetadata(scene, exportResult, publishConfig);

      // --- INTEGRACIÓN CON MÓDULO DE PUBLICACIÓN ---
      // Suponemos que exportResult.filePath contiene la ruta del archivo exportado
      const exportFilePath = exportResult.filePath || exportResult.path;
      if (!exportFilePath) {
        throw new Error('No se pudo determinar la ruta del archivo exportado');
      }
      const publishScript = path.resolve(__dirname, '../../../redpublicacion/publishScene.js');
      const mapsDir = path.resolve(__dirname, '../../../../client/public/maps/');
      try {
        const cmd = `node "${publishScript}" --src "${exportFilePath}" --dest "${mapsDir}"`;
        console.log(`[PublishSystem] Ejecutando: ${cmd}`);
        const output = execSync(cmd, { encoding: 'utf-8' });
        console.log(`[PublishSystem] Resultado publicación:`, output);
      } catch (err) {
        console.error('[PublishSystem] Error al publicar la escena:', err.message);
        throw err;
      }
      // --- FIN INTEGRACIÓN ---

      // Simular envío al servidor (en producción esto sería real)
      const publishResult = await this.uploadToServer(exportResult, metadata);

      // Guardar en historial
      const result: PublishResult = {
        success: true,
        sceneId: publishResult.sceneId,
        url: publishResult.url,
        metadata,
        timestamp: new Date(),
        fileSize: exportResult.fileSize,
        format: publishConfig.format
      };

      this.publishHistory.push(result);
      this.savePublishHistory();

      const duration = Date.now() - startTime;
      console.log(`✅ Escena publicada exitosamente en ${duration}ms`, result);

      return result;

    } catch (error) {
      console.error('❌ Error en publicación:', error);
      
      const result: PublishResult = {
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido',
        timestamp: new Date(),
        format: options?.format || this.config.format
      };

      this.publishHistory.push(result);
      this.savePublishHistory();

      throw error;
    } finally {
      this.isPublishing = false;
    }
  }

  // Procesamiento de escena

  private validateScene(scene: EditorScene): void {
    if (!scene.name || scene.name.trim() === '') {
      throw new Error('La escena debe tener un nombre');
    }

    if (scene.objects.length === 0) {
      throw new Error('La escena debe contener al menos un objeto');
    }

    // Validar objetos
    scene.objects.forEach((obj, index) => {
      if (!obj.name || obj.name.trim() === '') {
        throw new Error(`El objeto ${index} debe tener un nombre`);
      }
    });
  }

  private async processScene(scene: EditorScene, config: PublishConfig): Promise<EditorScene> {
    console.log('🔧 Procesando escena...');

    const processedScene = { ...scene };
    processedScene.objects = [...scene.objects];

    // Optimizar geometrías si está habilitado
    if (config.optimize) {
      processedScene.objects = await this.optimizeGeometries(processedScene.objects);
    }

    // Procesar materiales
    if (config.includeTextures) {
      processedScene.objects = await this.processMaterials(processedScene.objects, config);
    }

    // Aplicar compresión si está habilitada
    if (config.compression) {
      processedScene.objects = await this.compressScene(processedScene.objects, config);
    }

    console.log('✅ Escena procesada');
    return processedScene;
  }

  private async optimizeGeometries(objects: EditorObject[]): Promise<EditorObject[]> {
    console.log('📐 Optimizando geometrías...');

    return objects.map(obj => {
      if (obj.geometry) {
        // Simplificar geometría según la calidad
        const quality = this.config.quality;
        let targetTriangles: number;

        switch (quality) {
          case 'low':
            targetTriangles = 100;
            break;
          case 'medium':
            targetTriangles = 500;
            break;
          case 'high':
            targetTriangles = 2000;
            break;
          case 'ultra':
            targetTriangles = 10000;
            break;
          default:
            targetTriangles = 2000;
        }

        // Aquí se aplicaría la optimización real
        // Por ahora solo simulamos
        console.log(`Optimizando geometría de ${obj.name} a ${targetTriangles} triángulos`);
      }

      return obj;
    });
  }

  private async processMaterials(objects: EditorObject[], config: PublishConfig): Promise<EditorObject[]> {
    console.log('🎨 Procesando materiales...');

    return objects.map(obj => {
      if (obj.material) {
        // Procesar texturas según la resolución
        const resolution = config.resolution;
        console.log(`Procesando material de ${obj.name} a ${resolution}x${resolution}`);
      }

      return obj;
    });
  }

  private async compressScene(objects: EditorObject[], config: PublishConfig): Promise<EditorObject[]> {
    console.log('🗜️ Comprimiendo escena...');

    // Simular compresión
    await new Promise(resolve => setTimeout(resolve, 500));

    return objects;
  }

  // Exportación según formato

  private async exportScene(scene: EditorScene, config: PublishConfig): Promise<any> {
    console.log(`📤 Exportando escena en formato ${config.format}...`);

    switch (config.format) {
      case 'gltf':
      case 'glb':
        return await this.exportGLTF(scene, config);
      case 'obj':
        return await this.exportOBJ(scene, config);
      case 'fbx':
        return await this.exportFBX(scene, config);
      default:
        throw new Error(`Formato no soportado: ${config.format}`);
    }
  }

  private async exportGLTF(scene: EditorScene, config: PublishConfig): Promise<any> {
    // Crear escena Three.js temporal para exportación
    const threeScene = new THREE.Scene();
    
    // Convertir objetos del editor a objetos Three.js
    scene.objects.forEach(obj => {
      const threeObject = this.convertToThreeObject(obj);
      if (threeObject) {
        threeScene.add(threeObject);
      }
    });

    // Configurar exportador
    const exporter = new GLTFExporter();
    const options = {
      binary: config.format === 'glb',
      includeCustomExtensions: config.metadata,
      maxTextureSize: config.resolution,
      forceIndices: config.optimize,
      truncateDrawRange: config.optimize
    };

    return new Promise((resolve, reject) => {
      exporter.parse(threeScene, (result) => {
        if (result instanceof ArrayBuffer) {
          resolve({
            data: result,
            fileSize: result.byteLength,
            format: config.format
          });
        } else {
          resolve({
            data: JSON.stringify(result),
            fileSize: JSON.stringify(result).length,
            format: config.format
          });
        }
      }, options);
    });
  }

  private async exportOBJ(scene: EditorScene, config: PublishConfig): Promise<any> {
    // Simular exportación OBJ
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const objData = `# Exported from Metaverso Editor 3D
# Scene: ${scene.name}
# Objects: ${scene.objects.length}

${scene.objects.map(obj => `o ${obj.name}`).join('\n')}
`;

    return {
      data: objData,
      fileSize: objData.length,
      format: 'obj'
    };
  }

  private async exportFBX(scene: EditorScene, config: PublishConfig): Promise<any> {
    // Simular exportación FBX
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    return {
      data: new ArrayBuffer(1024), // Simulación
      fileSize: 1024,
      format: 'fbx'
    };
  }

  private convertToThreeObject(obj: EditorObject): THREE.Object3D | null {
    if (obj.type === 'mesh' && obj.geometry && obj.material) {
      const mesh = new THREE.Mesh(obj.geometry, obj.material);
      mesh.position.copy(obj.position);
      mesh.rotation.copy(obj.rotation);
      mesh.scale.copy(obj.scale);
      mesh.visible = obj.visible;
      mesh.name = obj.name;
      mesh.userData = obj.userData;
      return mesh;
    }

    return null;
  }

  // Generación de metadatos

  private generateMetadata(scene: EditorScene, exportResult: any, config: PublishConfig): SceneMetadata {
    const objectCount = scene.objects.length;
    const polygonCount = this.calculatePolygonCount(scene.objects);
    const textureCount = this.calculateTextureCount(scene.objects);

    return {
      id: `scene_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: scene.name,
      description: scene.metadata.description,
      author: scene.metadata.author,
      version: scene.metadata.version,
      tags: this.generateTags(scene),
      category: '3D Scene',
      createdAt: scene.metadata.created,
      updatedAt: new Date(),
      objectCount,
      polygonCount,
      textureCount,
      fileSize: exportResult.fileSize,
      format: config.format
    };
  }

  private calculatePolygonCount(objects: EditorObject[]): number {
    let count = 0;
    objects.forEach(obj => {
      if (obj.geometry) {
        // Simular conteo de polígonos
        count += Math.floor(Math.random() * 1000) + 100;
      }
    });
    return count;
  }

  private calculateTextureCount(objects: EditorObject[]): number {
    let count = 0;
    objects.forEach(obj => {
      if (obj.material) {
        // Simular conteo de texturas
        count += Math.floor(Math.random() * 3) + 1;
      }
    });
    return count;
  }

  private generateTags(scene: EditorScene): string[] {
    const tags = ['3D', 'Metaverso', 'Editor'];
    
    // Añadir tags basados en el contenido
    if (scene.objects.some(obj => obj.type === 'light')) {
      tags.push('Iluminación');
    }
    
    if (scene.objects.some(obj => obj.type === 'mesh')) {
      tags.push('Geometría');
    }

    return tags;
  }

  // Simulación de envío al servidor

  private async uploadToServer(exportResult: any, metadata: SceneMetadata): Promise<any> {
    console.log('🌐 Enviando al servidor...');

    // Simular envío
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Simular respuesta del servidor
    return {
      sceneId: metadata.id,
      url: `https://metaverso-editor.com/scenes/${metadata.id}`,
      success: true
    };
  }

  // Gestión de configuración

  public setConfig(config: Partial<PublishConfig>): void {
    this.config = { ...this.config, ...config };
  }

  public getConfig(): PublishConfig {
    return { ...this.config };
  }

  // Gestión del historial

  public getPublishHistory(): PublishResult[] {
    return [...this.publishHistory];
  }

  public clearPublishHistory(): void {
    this.publishHistory = [];
    this.savePublishHistory();
  }

  private savePublishHistory(): void {
    try {
      localStorage.setItem('metaverso-publish-history', JSON.stringify(this.publishHistory));
    } catch (error) {
      console.warn('No se pudo guardar el historial de publicación:', error);
    }
  }

  private loadPublishHistory(): void {
    try {
      const saved = localStorage.getItem('metaverso-publish-history');
      if (saved) {
        this.publishHistory = JSON.parse(saved);
      }
    } catch (error) {
      console.warn('No se pudo cargar el historial de publicación:', error);
    }
  }

  // Utilidades

  public getPublishStatus(): boolean {
    return this.isPublishing;
  }

  public async cancelPublish(): Promise<void> {
    if (this.isPublishing) {
      this.isPublishing = false;
      console.log('❌ Publicación cancelada');
    }
  }

  // Métodos de utilidad para previsualización

  public async generateThumbnail(scene: EditorScene): Promise<string> {
    console.log('🖼️ Generando thumbnail...');
    
    // Simular generación de thumbnail
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Retornar una imagen base64 simulada
    return 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==';
  }

  public async validateSceneFile(file: File): Promise<boolean> {
    console.log('🔍 Validando archivo de escena...');
    
    // Validar tipo de archivo
    const validFormats = ['gltf', 'glb', 'obj', 'fbx'];
    const extension = file.name.split('.').pop()?.toLowerCase();
    
    if (!extension || !validFormats.includes(extension)) {
      throw new Error('Formato de archivo no soportado');
    }

    // Validar tamaño (máximo 100MB)
    if (file.size > 100 * 1024 * 1024) {
      throw new Error('El archivo es demasiado grande (máximo 100MB)');
    }

    return true;
  }
} 
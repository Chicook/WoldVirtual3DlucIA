/**
 * ModuleLoader - Cargador de Módulos Multi-Lenguaje
 * Gestiona la carga de módulos desde diferentes lenguajes de programación
 * 
 * Responsabilidades:
 * - Carga de módulos TypeScript/JavaScript
 * - Carga de módulos Python (simulada)
 * - Carga de módulos Go (simulada)
 * - Validación de módulos cargados
 * - Preprocesamiento y postprocesamiento
 * - Gestión de errores de carga
 */

import { ModuleWrapper, ModuleLoaderConfig, ModuleLoadResult } from './types/core';

export class ModuleLoader {
  private config: ModuleLoaderConfig;
  private loadedModules = new Map<string, ModuleWrapper>();
  private loadHistory = new Map<string, ModuleLoadResult[]>();
  private errorHistory = new Map<string, string[]>();

  constructor(config: ModuleLoaderConfig) {
    this.config = config;
  }

  /**
   * Carga un módulo desde un archivo
   */
  async load(filePath: string): Promise<ModuleWrapper | null> {
    const startTime = performance.now();
    
    try {
      console.log(`📦 Cargando módulo ${filePath} (${this.config.language})...`);
      
      // Verificar si ya está cargado
      if (this.loadedModules.has(filePath)) {
        console.log(`✅ Módulo ${filePath} ya cargado, retornando caché`);
        return this.loadedModules.get(filePath)!;
      }
      
      // Preprocesar contenido si existe preprocessor
      let processedContent: string | null = null;
      if (this.config.preprocessor) {
        try {
          // En un entorno real, leeríamos el archivo aquí
          // processedContent = this.config.preprocessor(rawContent);
        } catch (error) {
          console.warn(`⚠️ Error en preprocesamiento de ${filePath}:`, error);
        }
      }
      
      // Cargar módulo usando el loader específico del lenguaje
      const module = await this.config.loader(filePath);
      
      if (!module) {
        throw new Error(`No se pudo cargar el módulo desde ${filePath}`);
      }
      
      // Validar módulo si existe validator
      if (this.config.validator && !this.config.validator(module)) {
        throw new Error(`Módulo ${filePath} no pasó la validación`);
      }
      
      // Postprocesar módulo si existe postprocessor
      if (this.config.postprocessor) {
        try {
          this.config.postprocessor(module);
        } catch (error) {
          console.warn(`⚠️ Error en postprocesamiento de ${filePath}:`, error);
        }
      }
      
      // Registrar módulo cargado
      this.loadedModules.set(filePath, module);
      
      // Registrar en historial
      const loadTime = performance.now() - startTime;
      const result: ModuleLoadResult = {
        success: true,
        module,
        loadTime,
        language: this.config.language,
        dependencies: module.dependencies
      };
      
      this.addToLoadHistory(filePath, result);
      
      console.log(`✅ Módulo ${filePath} cargado exitosamente en ${loadTime.toFixed(2)}ms`);
      
      return module;
      
    } catch (error) {
      const loadTime = performance.now() - startTime;
      const errorMessage = error instanceof Error ? error.message : String(error);
      
      // Registrar error
      this.addToErrorHistory(filePath, errorMessage);
      
      // Registrar resultado fallido
      const result: ModuleLoadResult = {
        success: false,
        error: errorMessage,
        loadTime,
        language: this.config.language
      };
      
      this.addToLoadHistory(filePath, result);
      
      console.error(`❌ Error cargando módulo ${filePath}:`, error);
      return null;
    }
  }

  /**
   * Carga múltiples módulos en paralelo
   */
  async loadMultiple(filePaths: string[], maxConcurrent: number = 3): Promise<ModuleWrapper[]> {
    const results: ModuleWrapper[] = [];
    const chunks = this.chunkArray(filePaths, maxConcurrent);
    
    for (const chunk of chunks) {
      const chunkResults = await Promise.all(
        chunk.map(filePath => this.load(filePath))
      );
      
      results.push(...chunkResults.filter(Boolean) as ModuleWrapper[]);
    }
    
    return results;
  }

  /**
   * Recarga un módulo específico
   */
  async reload(filePath: string): Promise<ModuleWrapper | null> {
    console.log(`🔄 Recargando módulo ${filePath}...`);
    
    // Remover del caché
    this.loadedModules.delete(filePath);
    
    // Cargar nuevamente
    return this.load(filePath);
  }

  /**
   * Descarga un módulo
   */
  async unload(filePath: string): Promise<boolean> {
    const module = this.loadedModules.get(filePath);
    
    if (!module) {
      console.warn(`⚠️ Módulo ${filePath} no está cargado`);
      return false;
    }
    
    try {
      // Ejecutar cleanup si existe
      if (module.cleanup) {
        await module.cleanup('system');
      }
      
      // Remover del caché
      this.loadedModules.delete(filePath);
      
      console.log(`✅ Módulo ${filePath} descargado exitosamente`);
      return true;
      
    } catch (error) {
      console.error(`❌ Error descargando módulo ${filePath}:`, error);
      return false;
    }
  }

  /**
   * Obtiene un módulo cargado
   */
  getLoadedModule(filePath: string): ModuleWrapper | undefined {
    return this.loadedModules.get(filePath);
  }

  /**
   * Obtiene todos los módulos cargados
   */
  getAllLoadedModules(): Map<string, ModuleWrapper> {
    return new Map(this.loadedModules);
  }

  /**
   * Verifica si un módulo está cargado
   */
  isModuleLoaded(filePath: string): boolean {
    return this.loadedModules.has(filePath);
  }

  /**
   * Obtiene estadísticas de carga
   */
  getLoadStats(): any {
    const totalLoads = Array.from(this.loadHistory.values()).flat().length;
    const successfulLoads = Array.from(this.loadHistory.values())
      .flat()
      .filter(result => result.success).length;
    const failedLoads = totalLoads - successfulLoads;
    
    const averageLoadTime = Array.from(this.loadHistory.values())
      .flat()
      .reduce((sum, result) => sum + result.loadTime, 0) / totalLoads || 0;
    
    return {
      totalModules: this.loadedModules.size,
      totalLoads,
      successfulLoads,
      failedLoads,
      successRate: totalLoads > 0 ? (successfulLoads / totalLoads) * 100 : 0,
      averageLoadTime,
      language: this.config.language,
      extensions: this.config.extensions
    };
  }

  /**
   * Obtiene historial de carga para un archivo
   */
  getLoadHistory(filePath: string): ModuleLoadResult[] {
    return this.loadHistory.get(filePath) || [];
  }

  /**
   * Obtiene historial de errores para un archivo
   */
  getErrorHistory(filePath: string): string[] {
    return this.errorHistory.get(filePath) || [];
  }

  /**
   * Limpia el historial de carga
   */
  clearLoadHistory(): void {
    this.loadHistory.clear();
    this.errorHistory.clear();
  }

  /**
   * Limpia todos los módulos cargados
   */
  async clearAllModules(): Promise<void> {
    console.log(`🧹 Limpiando todos los módulos ${this.config.language}...`);
    
    const unloadPromises = Array.from(this.loadedModules.keys()).map(filePath => 
      this.unload(filePath)
    );
    
    await Promise.all(unloadPromises);
    this.loadedModules.clear();
    
    console.log(`✅ Todos los módulos ${this.config.language} limpiados`);
  }

  /**
   * Valida la configuración del loader
   */
  validateConfig(): boolean {
    if (!this.config.language) {
      console.error('❌ Configuración inválida: language es requerido');
      return false;
    }
    
    if (!this.config.extensions || this.config.extensions.length === 0) {
      console.error('❌ Configuración inválida: extensions es requerido');
      return false;
    }
    
    if (typeof this.config.loader !== 'function') {
      console.error('❌ Configuración inválida: loader debe ser una función');
      return false;
    }
    
    return true;
  }

  /**
   * Agrega resultado al historial de carga
   */
  private addToLoadHistory(filePath: string, result: ModuleLoadResult): void {
    if (!this.loadHistory.has(filePath)) {
      this.loadHistory.set(filePath, []);
    }
    
    const history = this.loadHistory.get(filePath)!;
    history.push(result);
    
    // Limitar historial a 10 entradas por archivo
    if (history.length > 10) {
      history.shift();
    }
  }

  /**
   * Agrega error al historial de errores
   */
  private addToErrorHistory(filePath: string, error: string): void {
    if (!this.errorHistory.has(filePath)) {
      this.errorHistory.set(filePath, []);
    }
    
    const history = this.errorHistory.get(filePath)!;
    history.push(error);
    
    // Limitar historial de errores a 5 entradas por archivo
    if (history.length > 5) {
      history.shift();
    }
  }

  /**
   * Divide un array en chunks para procesamiento paralelo
   */
  private chunkArray<T>(array: T[], chunkSize: number): T[][] {
    const chunks: T[][] = [];
    
    for (let i = 0; i < array.length; i += chunkSize) {
      chunks.push(array.slice(i, i + chunkSize));
    }
    
    return chunks;
  }

  /**
   * Obtiene información de configuración
   */
  getConfig(): ModuleLoaderConfig {
    return { ...this.config };
  }

  /**
   * Actualiza la configuración del loader
   */
  updateConfig(newConfig: Partial<ModuleLoaderConfig>): void {
    this.config = { ...this.config, ...newConfig };
    console.log(`⚙️ Configuración del loader ${this.config.language} actualizada`);
  }
} 
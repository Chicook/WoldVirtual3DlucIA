/**
 * DependencyResolver - Resolvedor de Dependencias
 * Gestiona la resolución de dependencias entre módulos y el orden de carga
 * 
 * Responsabilidades:
 * - Análisis de dependencias entre módulos
 * - Ordenamiento topológico para carga
 * - Detección de dependencias circulares
 * - Validación de dependencias
 * - Optimización del orden de carga
 */

import { ModuleWrapper, DependencyGraph, ModuleDependency, DependencyType } from './types/core';

export class DependencyResolver {
  private dependencyGraph: DependencyGraph;
  private moduleDependencies = new Map<string, ModuleDependency[]>();
  private resolvedOrder: string[] = [];
  private circularDependencies: string[][] = [];

  constructor() {
    this.dependencyGraph = {
      nodes: new Map(),
      edges: new Map(),
      cycles: [],
      levels: [],
      isAcyclic: true
    };
  }

  /**
   * Construye el grafo de dependencias
   */
  buildDependencyGraph(modules: Map<string, ModuleWrapper>): DependencyGraph {
    console.log('🔍 Construyendo grafo de dependencias...');
    
    // Limpiar grafo anterior
    this.dependencyGraph.nodes.clear();
    this.dependencyGraph.edges.clear();
    this.dependencyGraph.cycles = [];
    this.dependencyGraph.levels = [];
    
    // Agregar nodos
    for (const [name, module] of modules.entries()) {
      this.dependencyGraph.nodes.set(name, module);
      this.dependencyGraph.edges.set(name, new Set());
    }
    
    // Agregar aristas (dependencias)
    for (const [name, module] of modules.entries()) {
      for (const dependency of module.dependencies) {
        const edges = this.dependencyGraph.edges.get(name);
        if (edges) {
          edges.add(dependency);
        }
      }
    }
    
    // Analizar ciclos
    this.detectCircularDependencies();
    
    // Generar niveles
    this.generateLevels();
    
    console.log(`✅ Grafo construido: ${this.dependencyGraph.nodes.size} módulos, ${this.dependencyGraph.cycles.length} ciclos detectados`);
    
    return this.dependencyGraph;
  }

  /**
   * Resuelve el orden de carga para un grupo de módulos
   */
  resolveLoadOrder(moduleNames: string[], modules: Map<string, ModuleWrapper>): string[] {
    console.log(`🔄 Resolviendo orden de carga para ${moduleNames.length} módulos...`);
    
    // Construir grafo si no existe
    if (this.dependencyGraph.nodes.size === 0) {
      this.buildDependencyGraph(modules);
    }
    
    // Filtrar módulos que existen en el grafo
    const existingModules = moduleNames.filter(name => this.dependencyGraph.nodes.has(name));
    
    if (existingModules.length === 0) {
      console.warn('⚠️ No se encontraron módulos para resolver dependencias');
      return [];
    }
    
    // Generar orden topológico
    const loadOrder = this.topologicalSort(existingModules);
    
    // Validar orden
    this.validateLoadOrder(loadOrder, existingModules);
    
    console.log(`✅ Orden de carga resuelto: ${loadOrder.join(' → ')}`);
    
    return loadOrder;
  }

  /**
   * Ordenamiento topológico de módulos
   */
  private topologicalSort(moduleNames: string[]): string[] {
    const visited = new Set<string>();
    const tempVisited = new Set<string>();
    const order: string[] = [];
    
    const visit = (moduleName: string): void => {
      if (tempVisited.has(moduleName)) {
        // Dependencia circular detectada
        this.handleCircularDependency(moduleName);
        return;
      }
      
      if (visited.has(moduleName)) {
        return;
      }
      
      tempVisited.add(moduleName);
      
      // Visitar dependencias
      const edges = this.dependencyGraph.edges.get(moduleName);
      if (edges) {
        for (const dependency of edges) {
          if (moduleNames.includes(dependency)) {
            visit(dependency);
          }
        }
      }
      
      tempVisited.delete(moduleName);
      visited.add(moduleName);
      order.unshift(moduleName);
    };
    
    // Visitar todos los módulos
    for (const moduleName of moduleNames) {
      if (!visited.has(moduleName)) {
        visit(moduleName);
      }
    }
    
    return order;
  }

  /**
   * Detecta dependencias circulares
   */
  private detectCircularDependencies(): void {
    const visited = new Set<string>();
    const recursionStack = new Set<string>();
    const cycles: string[][] = [];
    
    const dfs = (moduleName: string, path: string[]): void => {
      if (recursionStack.has(moduleName)) {
        // Ciclo detectado
        const cycleStart = path.indexOf(moduleName);
        const cycle = path.slice(cycleStart);
        cycles.push([...cycle, moduleName]);
        return;
      }
      
      if (visited.has(moduleName)) {
        return;
      }
      
      visited.add(moduleName);
      recursionStack.add(moduleName);
      path.push(moduleName);
      
      const edges = this.dependencyGraph.edges.get(moduleName);
      if (edges) {
        for (const dependency of edges) {
          dfs(dependency, [...path]);
        }
      }
      
      recursionStack.delete(moduleName);
      path.pop();
    };
    
    // Buscar ciclos desde cada nodo
    for (const moduleName of this.dependencyGraph.nodes.keys()) {
      if (!visited.has(moduleName)) {
        dfs(moduleName, []);
      }
    }
    
    this.dependencyGraph.cycles = cycles;
    this.dependencyGraph.isAcyclic = cycles.length === 0;
    this.circularDependencies = cycles;
    
    if (cycles.length > 0) {
      console.warn(`⚠️ Dependencias circulares detectadas: ${cycles.length} ciclos`);
      cycles.forEach((cycle, index) => {
        console.warn(`  Ciclo ${index + 1}: ${cycle.join(' → ')}`);
      });
    }
  }

  /**
   * Maneja dependencias circulares
   */
  private handleCircularDependency(moduleName: string): void {
    console.warn(`⚠️ Dependencia circular detectada para módulo: ${moduleName}`);
    
    // En una implementación real, podríamos:
    // 1. Romper el ciclo automáticamente
    // 2. Solicitar intervención manual
    // 3. Usar un orden de carga alternativo
  }

  /**
   * Genera niveles de dependencias
   */
  private generateLevels(): void {
    const levels: string[][] = [];
    const inDegree = new Map<string, number>();
    
    // Calcular grados de entrada
    for (const moduleName of this.dependencyGraph.nodes.keys()) {
      inDegree.set(moduleName, 0);
    }
    
    for (const edges of this.dependencyGraph.edges.values()) {
      for (const target of edges) {
        inDegree.set(target, (inDegree.get(target) || 0) + 1);
      }
    }
    
    // Generar niveles
    while (inDegree.size > 0) {
      const currentLevel: string[] = [];
      
      // Encontrar nodos con grado de entrada 0
      for (const [moduleName, degree] of inDegree.entries()) {
        if (degree === 0) {
          currentLevel.push(moduleName);
        }
      }
      
      if (currentLevel.length === 0) {
        // Ciclo detectado, romper
        break;
      }
      
      levels.push(currentLevel);
      
      // Actualizar grados de entrada
      for (const moduleName of currentLevel) {
        inDegree.delete(moduleName);
        
        const edges = this.dependencyGraph.edges.get(moduleName);
        if (edges) {
          for (const target of edges) {
            if (inDegree.has(target)) {
              inDegree.set(target, inDegree.get(target)! - 1);
            }
          }
        }
      }
    }
    
    this.dependencyGraph.levels = levels;
  }

  /**
   * Valida el orden de carga
   */
  private validateLoadOrder(loadOrder: string[], moduleNames: string[]): void {
    const loaded = new Set<string>();
    
    for (const moduleName of loadOrder) {
      const module = this.dependencyGraph.nodes.get(moduleName);
      if (!module) continue;
      
      // Verificar que todas las dependencias estén cargadas
      for (const dependency of module.dependencies) {
        if (moduleNames.includes(dependency) && !loaded.has(dependency)) {
          console.warn(`⚠️ Dependencia no resuelta: ${moduleName} depende de ${dependency} que no está cargado`);
        }
      }
      
      loaded.add(moduleName);
    }
  }

  /**
   * Obtiene dependencias de un módulo
   */
  getModuleDependencies(moduleName: string): string[] {
    const edges = this.dependencyGraph.edges.get(moduleName);
    return edges ? Array.from(edges) : [];
  }

  /**
   * Obtiene módulos que dependen de un módulo específico
   */
  getDependentModules(moduleName: string): string[] {
    const dependents: string[] = [];
    
    for (const [name, edges] of this.dependencyGraph.edges.entries()) {
      if (edges.has(moduleName)) {
        dependents.push(name);
      }
    }
    
    return dependents;
  }

  /**
   * Verifica si hay dependencias circulares
   */
  hasCircularDependencies(): boolean {
    return !this.dependencyGraph.isAcyclic;
  }

  /**
   * Obtiene las dependencias circulares
   */
  getCircularDependencies(): string[][] {
    return [...this.circularDependencies];
  }

  /**
   * Obtiene el nivel de un módulo
   */
  getModuleLevel(moduleName: string): number {
    for (let i = 0; i < this.dependencyGraph.levels.length; i++) {
      if (this.dependencyGraph.levels[i].includes(moduleName)) {
        return i;
      }
    }
    return -1;
  }

  /**
   * Obtiene todos los niveles
   */
  getLevels(): string[][] {
    return this.dependencyGraph.levels.map(level => [...level]);
  }

  /**
   * Obtiene estadísticas del grafo
   */
  getGraphStats(): any {
    const totalNodes = this.dependencyGraph.nodes.size;
    const totalEdges = Array.from(this.dependencyGraph.edges.values())
      .reduce((sum, edges) => sum + edges.size, 0);
    
    return {
      totalModules: totalNodes,
      totalDependencies: totalEdges,
      averageDependencies: totalNodes > 0 ? totalEdges / totalNodes : 0,
      hasCircularDependencies: this.hasCircularDependencies(),
      circularDependencyCount: this.circularDependencies.length,
      levels: this.dependencyGraph.levels.length,
      isAcyclic: this.dependencyGraph.isAcyclic
    };
  }

  /**
   * Limpia el resolvedor
   */
  clear(): void {
    this.dependencyGraph.nodes.clear();
    this.dependencyGraph.edges.clear();
    this.dependencyGraph.cycles = [];
    this.dependencyGraph.levels = [];
    this.dependencyGraph.isAcyclic = true;
    this.moduleDependencies.clear();
    this.resolvedOrder = [];
    this.circularDependencies = [];
  }
} 
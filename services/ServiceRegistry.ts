/**
 * 📋 ServiceRegistry - Registro Central de Servicios
 * 
 * Responsabilidades:
 * - Registro y desregistro de servicios
 * - Gestión de metadatos de servicios
 * - Búsqueda y descubrimiento de servicios
 * - Validación de configuraciones de servicios
 * - Gestión de versiones y compatibilidad
 */

import { EventEmitter } from 'events';

export interface ServiceMetadata {
  id: string;
  name: string;
  version: string;
  description?: string;
  author?: string;
  license?: string;
  repository?: string;
  dependencies: string[];
  peerDependencies: string[];
  optionalDependencies: string[];
  category: 'core' | 'feature' | 'utility' | 'integration';
  priority: 'critical' | 'high' | 'medium' | 'low';
  size: 'small' | 'medium' | 'large';
  performance: {
    loadTime: number;
    memoryUsage: number;
    cpuUsage: number;
    networkRequests: number;
    cacheHitRate: number;
    errorRate: number;
  };
  security: {
    permissions: string[];
    vulnerabilities: string[];
    encryption: boolean;
    authentication: boolean;
    authorization: boolean;
    auditLevel: 'low' | 'medium' | 'high';
  };
  compatibility: {
    browsers: string[];
    platforms: string[];
    nodeVersion: string;
    typescriptVersion: string;
  };
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ServiceRegistration {
  metadata: ServiceMetadata;
  instance: any;
  status: 'registered' | 'active' | 'inactive' | 'error';
  health: 'healthy' | 'degraded' | 'unhealthy';
  lastHeartbeat: Date;
  uptime: number;
  restartCount: number;
  errorCount: number;
}

export class ServiceRegistry extends EventEmitter {
  private services: Map<string, ServiceRegistration> = new Map();
  private serviceVersions: Map<string, Map<string, ServiceRegistration>> = new Map();
  private serviceCategories: Map<string, Set<string>> = new Map();
  private serviceTags: Map<string, Set<string>> = new Map();
  private isInitialized: boolean = false;

  constructor() {
    super();
    this.initializeCategories();
  }

  private initializeCategories(): void {
    const categories = ['core', 'feature', 'utility', 'integration'];
    categories.forEach(category => {
      this.serviceCategories.set(category, new Set());
    });
  }

  async initialize(): Promise<void> {
    if (this.isInitialized) {
      console.log('[📋] ServiceRegistry ya está inicializado');
      return;
    }

    console.log('[📋] Inicializando ServiceRegistry...');

    try {
      // Cargar servicios predefinidos
      await this.loadPredefinedServices();
      
      this.isInitialized = true;
      console.log('[✅] ServiceRegistry inicializado correctamente');
      this.emit('initialized');
    } catch (error) {
      console.error('[❌] Error inicializando ServiceRegistry:', error);
      this.emit('error', error);
      throw error;
    }
  }

  private async loadPredefinedServices(): Promise<void> {
    const predefinedServices: ServiceMetadata[] = [
      {
        id: 'blockchain-service',
        name: 'Blockchain Service',
        version: '1.0.0',
        description: 'Servicio para interacciones con blockchain',
        author: 'WoldVirtual3DlucIA Team',
        license: 'MIT',
        repository: 'https://github.com/Chicook/WoldVirtual3DlucIA',
        dependencies: [],
        peerDependencies: ['web3', 'ethers'],
        optionalDependencies: ['@solana/web3.js'],
        category: 'core',
        priority: 'critical',
        size: 'medium',
        performance: {
          loadTime: 2000,
          memoryUsage: 50,
          cpuUsage: 15,
          networkRequests: 10,
          cacheHitRate: 0.85,
          errorRate: 0.02
        },
        security: {
          permissions: ['read', 'write', 'sign'],
          vulnerabilities: [],
          encryption: true,
          authentication: true,
          authorization: true,
          auditLevel: 'high'
        },
        compatibility: {
          browsers: ['chrome', 'firefox', 'safari'],
          platforms: ['web', 'node'],
          nodeVersion: '>=16.0.0',
          typescriptVersion: '>=4.5.0'
        },
        tags: ['blockchain', 'web3', 'crypto', 'defi'],
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'audio-service',
        name: 'Audio Service',
        version: '1.0.0',
        description: 'Servicio para gestión de audio y música',
        author: 'WoldVirtual3DlucIA Team',
        license: 'MIT',
        repository: 'https://github.com/Chicook/WoldVirtual3DlucIA',
        dependencies: [],
        peerDependencies: ['howler', 'tone'],
        optionalDependencies: ['web-audio-api'],
        category: 'feature',
        priority: 'high',
        size: 'medium',
        performance: {
          loadTime: 1500,
          memoryUsage: 30,
          cpuUsage: 10,
          networkRequests: 5,
          cacheHitRate: 0.90,
          errorRate: 0.01
        },
        security: {
          permissions: ['audio'],
          vulnerabilities: [],
          encryption: false,
          authentication: false,
          authorization: false,
          auditLevel: 'medium'
        },
        compatibility: {
          browsers: ['chrome', 'firefox', 'safari'],
          platforms: ['web'],
          nodeVersion: '>=16.0.0',
          typescriptVersion: '>=4.5.0'
        },
        tags: ['audio', 'music', 'sound', 'media'],
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    for (const metadata of predefinedServices) {
      await this.registerService(metadata, null);
    }
  }

  async registerService(metadata: ServiceMetadata, instance: any = null): Promise<void> {
    try {
      // Validar metadatos
      this.validateServiceMetadata(metadata);

      // Verificar si el servicio ya existe
      if (this.services.has(metadata.id)) {
        throw new Error(`Servicio ya registrado: ${metadata.id}`);
      }

      // Crear registro del servicio
      const registration: ServiceRegistration = {
        metadata,
        instance,
        status: 'registered',
        health: 'unhealthy',
        lastHeartbeat: new Date(),
        uptime: 0,
        restartCount: 0,
        errorCount: 0
      };

      // Registrar servicio
      this.services.set(metadata.id, registration);

      // Registrar por versión
      if (!this.serviceVersions.has(metadata.id)) {
        this.serviceVersions.set(metadata.id, new Map());
      }
      this.serviceVersions.get(metadata.id)!.set(metadata.version, registration);

      // Registrar por categoría
      if (!this.serviceCategories.has(metadata.category)) {
        this.serviceCategories.set(metadata.category, new Set());
      }
      this.serviceCategories.get(metadata.category)!.add(metadata.id);

      // Registrar por tags
      metadata.tags.forEach(tag => {
        if (!this.serviceTags.has(tag)) {
          this.serviceTags.set(tag, new Set());
        }
        this.serviceTags.get(tag)!.add(metadata.id);
      });

      console.log(`[📋] Servicio registrado: ${metadata.name} v${metadata.version}`);
      this.emit('service-registered', metadata.id, metadata);
    } catch (error) {
      console.error(`[❌] Error registrando servicio ${metadata.id}:`, error);
      throw error;
    }
  }

  private validateServiceMetadata(metadata: ServiceMetadata): void {
    if (!metadata.id || !metadata.name || !metadata.version) {
      throw new Error('ID, nombre y versión son requeridos');
    }

    if (!['core', 'feature', 'utility', 'integration'].includes(metadata.category)) {
      throw new Error('Categoría inválida');
    }

    if (!['critical', 'high', 'medium', 'low'].includes(metadata.priority)) {
      throw new Error('Prioridad inválida');
    }

    if (!['small', 'medium', 'large'].includes(metadata.size)) {
      throw new Error('Tamaño inválido');
    }
  }

  async unregisterService(serviceId: string): Promise<void> {
    const registration = this.services.get(serviceId);
    if (!registration) {
      throw new Error(`Servicio no encontrado: ${serviceId}`);
    }

    try {
      // Remover de todas las colecciones
      this.services.delete(serviceId);
      this.serviceVersions.delete(serviceId);
      
      // Remover de categorías
      this.serviceCategories.get(registration.metadata.category)?.delete(serviceId);
      
      // Remover de tags
      registration.metadata.tags.forEach(tag => {
        this.serviceTags.get(tag)?.delete(serviceId);
      });

      console.log(`[📋] Servicio desregistrado: ${serviceId}`);
      this.emit('service-unregistered', serviceId);
    } catch (error) {
      console.error(`[❌] Error desregistrando servicio ${serviceId}:`, error);
      throw error;
    }
  }

  getService(serviceId: string): ServiceRegistration | undefined {
    return this.services.get(serviceId);
  }

  getServiceByVersion(serviceId: string, version: string): ServiceRegistration | undefined {
    return this.serviceVersions.get(serviceId)?.get(version);
  }

  getAllServices(): ServiceRegistration[] {
    return Array.from(this.services.values());
  }

  getServicesByCategory(category: string): ServiceRegistration[] {
    const serviceIds = this.serviceCategories.get(category);
    if (!serviceIds) return [];

    return Array.from(serviceIds)
      .map(id => this.services.get(id))
      .filter(Boolean) as ServiceRegistration[];
  }

  getServicesByTag(tag: string): ServiceRegistration[] {
    const serviceIds = this.serviceTags.get(tag);
    if (!serviceIds) return [];

    return Array.from(serviceIds)
      .map(id => this.services.get(id))
      .filter(Boolean) as ServiceRegistration[];
  }

  searchServices(query: string): ServiceRegistration[] {
    const results: ServiceRegistration[] = [];
    const lowerQuery = query.toLowerCase();

    for (const registration of this.services.values()) {
      const { metadata } = registration;
      
      if (
        metadata.name.toLowerCase().includes(lowerQuery) ||
        metadata.description?.toLowerCase().includes(lowerQuery) ||
        metadata.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
      ) {
        results.push(registration);
      }
    }

    return results;
  }

  updateServiceStatus(serviceId: string, status: string, health: string): void {
    const registration = this.services.get(serviceId);
    if (registration) {
      registration.status = status as any;
      registration.health = health as any;
      registration.lastHeartbeat = new Date();
      
      this.emit('service-status-updated', serviceId, status, health);
    }
  }

  getServiceStats(): any {
    const total = this.services.size;
    const byCategory = new Map<string, number>();
    const byPriority = new Map<string, number>();
    const byHealth = new Map<string, number>();

    for (const registration of this.services.values()) {
      const { metadata, health } = registration;
      
      // Contar por categoría
      byCategory.set(metadata.category, (byCategory.get(metadata.category) || 0) + 1);
      
      // Contar por prioridad
      byPriority.set(metadata.priority, (byPriority.get(metadata.priority) || 0) + 1);
      
      // Contar por salud
      byHealth.set(health, (byHealth.get(health) || 0) + 1);
    }

    return {
      total,
      byCategory: Object.fromEntries(byCategory),
      byPriority: Object.fromEntries(byPriority),
      byHealth: Object.fromEntries(byHealth),
      categories: Array.from(this.serviceCategories.keys()),
      tags: Array.from(this.serviceTags.keys())
    };
  }

  async cleanup(): Promise<void> {
    console.log('[📋] Limpiando ServiceRegistry...');

    this.services.clear();
    this.serviceVersions.clear();
    this.serviceCategories.clear();
    this.serviceTags.clear();
    this.isInitialized = false;

    console.log('[✅] ServiceRegistry limpiado correctamente');
  }
}

export default ServiceRegistry; 
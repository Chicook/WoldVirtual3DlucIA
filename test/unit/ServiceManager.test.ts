/**
 * ServiceManager Tests - WoldVirtual3DlucIA v0.6.0
 * Tests unitarios para el ServiceManager
 */

import { ServiceManager, IService, ServiceStatus, HealthStatus } from '../../services/ServiceManager';

// Mock de servicios para testing
class MockService implements IService {
  id: string;
  name: string;
  version: string;
  status: ServiceStatus;
  dependencies: string[];
  exports: Record<string, any>;
  imports: Record<string, any>;
  
  constructor(id: string, name: string, version: string = '1.0.0') {
    this.id = id;
    this.name = name;
    this.version = version;
    this.status = ServiceStatus.STOPPED;
    this.dependencies = [];
    this.exports = {};
    this.imports = {};
  }
  
  async start(): Promise<void> {
    this.status = ServiceStatus.RUNNING;
  }
  
  async stop(): Promise<void> {
    this.status = ServiceStatus.STOPPED;
  }
  
  async healthCheck(): Promise<HealthStatus> {
    return {
      status: this.status,
      message: `${this.name} is ${this.status}`,
      timestamp: new Date(),
      metrics: {
        uptime: 1000,
        memoryUsage: 50,
        cpuUsage: 25,
        responseTime: 100
      }
    };
  }
}

describe('ServiceManager', () => {
  let serviceManager: ServiceManager;
  let mockService: MockService;
  
  beforeEach(() => {
    serviceManager = ServiceManager.getInstance();
    mockService = new MockService('test-service', 'Test Service');
  });
  
  afterEach(async () => {
    // Limpiar servicios después de cada test
    await serviceManager.shutdown();
  });
  
  describe('Initialization', () => {
    test('should initialize successfully', async () => {
      await expect(serviceManager.initialize()).resolves.not.toThrow();
    });
    
    test('should not initialize twice', async () => {
      await serviceManager.initialize();
      await expect(serviceManager.initialize()).resolves.not.toThrow();
    });
  });
  
  describe('Service Registration', () => {
    test('should register a service successfully', async () => {
      await serviceManager.initialize();
      
      await expect(serviceManager.registerService(mockService, {
        id: mockService.id,
        name: mockService.name,
        version: mockService.version,
        autoStart: false,
        restartOnFailure: false,
        maxRestartAttempts: 3,
        healthCheckInterval: 30000,
        dependencies: []
      })).resolves.not.toThrow();
      
      const registeredService = serviceManager.getService(mockService.id);
      expect(registeredService).toBe(mockService);
    });
    
    test('should not register service with duplicate ID', async () => {
      await serviceManager.initialize();
      
      const config = {
        id: mockService.id,
        name: mockService.name,
        version: mockService.version,
        autoStart: false,
        restartOnFailure: false,
        maxRestartAttempts: 3,
        healthCheckInterval: 30000,
        dependencies: []
      };
      
      await serviceManager.registerService(mockService, config);
      
      const duplicateService = new MockService(mockService.id, 'Duplicate Service');
      await expect(serviceManager.registerService(duplicateService, config))
        .rejects.toThrow('Servicio con ID test-service ya está registrado');
    });
    
    test('should validate service with missing required fields', async () => {
      await serviceManager.initialize();
      
      const invalidService = {
        id: '',
        name: '',
        version: '',
        status: ServiceStatus.STOPPED,
        dependencies: [],
        exports: {},
        imports: {},
        start: async () => {},
        stop: async () => {},
        healthCheck: async () => ({} as HealthStatus)
      };
      
      await expect(serviceManager.registerService(invalidService as IService, {
        id: '',
        name: '',
        version: '',
        autoStart: false,
        restartOnFailure: false,
        maxRestartAttempts: 3,
        healthCheckInterval: 30000,
        dependencies: []
      })).rejects.toThrow('Servicio debe tener id, name y version válidos');
    });
  });
  
  describe('Service Management', () => {
    beforeEach(async () => {
      await serviceManager.initialize();
      await serviceManager.registerService(mockService, {
        id: mockService.id,
        name: mockService.name,
        version: mockService.version,
        autoStart: false,
        restartOnFailure: false,
        maxRestartAttempts: 3,
        healthCheckInterval: 30000,
        dependencies: []
      });
    });
    
    test('should start a service successfully', async () => {
      await serviceManager.startService(mockService.id);
      
      expect(mockService.status).toBe(ServiceStatus.RUNNING);
    });
    
    test('should stop a service successfully', async () => {
      await serviceManager.startService(mockService.id);
      await serviceManager.stopService(mockService.id);
      
      expect(mockService.status).toBe(ServiceStatus.STOPPED);
    });
    
    test('should restart a service successfully', async () => {
      await serviceManager.startService(mockService.id);
      await serviceManager.restartService(mockService.id);
      
      expect(mockService.status).toBe(ServiceStatus.RUNNING);
    });
    
    test('should handle service that throws error on start', async () => {
      const errorService = new MockService('error-service', 'Error Service');
      errorService.start = async () => {
        throw new Error('Service start failed');
      };
      
      await serviceManager.registerService(errorService, {
        id: errorService.id,
        name: errorService.name,
        version: errorService.version,
        autoStart: false,
        restartOnFailure: false,
        maxRestartAttempts: 3,
        healthCheckInterval: 30000,
        dependencies: []
      });
      
      await expect(serviceManager.startService(errorService.id))
        .rejects.toThrow('Service start failed');
      
      expect(errorService.status).toBe(ServiceStatus.ERROR);
    });
  });
  
  describe('Service Discovery', () => {
    let service1: MockService;
    let service2: MockService;
    let service3: MockService;
    
    beforeEach(async () => {
      await serviceManager.initialize();
      
      service1 = new MockService('service-1', 'Service 1');
      service2 = new MockService('service-2', 'Service 2');
      service3 = new MockService('service-3', 'Service 3');
      
      const config = {
        autoStart: false,
        restartOnFailure: false,
        maxRestartAttempts: 3,
        healthCheckInterval: 30000,
        dependencies: []
      };
      
      await serviceManager.registerService(service1, { ...config, id: service1.id, name: service1.name, version: service1.version });
      await serviceManager.registerService(service2, { ...config, id: service2.id, name: service2.name, version: service2.version });
      await serviceManager.registerService(service3, { ...config, id: service3.id, name: service3.name, version: service3.version });
    });
    
    test('should get all services status', () => {
      const statusMap = serviceManager.getServicesStatus();
      
      expect(statusMap.has(service1.id)).toBe(true);
      expect(statusMap.has(service2.id)).toBe(true);
      expect(statusMap.has(service3.id)).toBe(true);
      expect(statusMap.get(service1.id)).toBe(ServiceStatus.STOPPED);
    });
    
    test('should get service info', () => {
      const serviceInfo = serviceManager.getServiceInfo(service1.id);
      
      expect(serviceInfo).not.toBeNull();
      expect(serviceInfo?.service).toBe(service1);
      expect(serviceInfo?.config.id).toBe(service1.id);
    });
    
    test('should return null for non-existent service', () => {
      const serviceInfo = serviceManager.getServiceInfo('non-existent');
      
      expect(serviceInfo).toBeNull();
    });
  });
  
  describe('Dependency Management', () => {
    let dependentService: MockService;
    let dependencyService: MockService;
    
    beforeEach(async () => {
      await serviceManager.initialize();
      
      dependencyService = new MockService('dependency', 'Dependency Service');
      dependentService = new MockService('dependent', 'Dependent Service');
      dependentService.dependencies = ['dependency'];
      
      const config = {
        autoStart: false,
        restartOnFailure: false,
        maxRestartAttempts: 3,
        healthCheckInterval: 30000
      };
      
      await serviceManager.registerService(dependencyService, { ...config, id: dependencyService.id, name: dependencyService.name, version: dependencyService.version, dependencies: [] });
      await serviceManager.registerService(dependentService, { ...config, id: dependentService.id, name: dependentService.name, version: dependentService.version, dependencies: ['dependency'] });
    });
    
    test('should start dependent service after dependency', async () => {
      await serviceManager.startService(dependencyService.id);
      await serviceManager.startService(dependentService.id);
      
      expect(dependencyService.status).toBe(ServiceStatus.RUNNING);
      expect(dependentService.status).toBe(ServiceStatus.RUNNING);
    });
    
    test('should fail to start dependent service without dependency', async () => {
      await expect(serviceManager.startService(dependentService.id))
        .rejects.toThrow('Dependencia no disponible: dependency');
    });
  });
  
  describe('Health Monitoring', () => {
    beforeEach(async () => {
      await serviceManager.initialize();
      await serviceManager.registerService(mockService, {
        id: mockService.id,
        name: mockService.name,
        version: mockService.version,
        autoStart: false,
        restartOnFailure: false,
        maxRestartAttempts: 3,
        healthCheckInterval: 30000,
        dependencies: []
      });
    });
    
    test('should perform health check on service', async () => {
      const healthSpy = jest.spyOn(mockService, 'healthCheck');
      
      await serviceManager.startService(mockService.id);
      
      expect(healthSpy).toHaveBeenCalled();
      expect(mockService.status).toBe(ServiceStatus.RUNNING);
    });
    
    test('should handle health check failure', async () => {
      mockService.healthCheck = async () => ({
        status: ServiceStatus.ERROR,
        message: 'Health check failed',
        timestamp: new Date(),
        metrics: {
          uptime: 0,
          memoryUsage: 0,
          cpuUsage: 0,
          responseTime: 0
        }
      });
      
      await expect(serviceManager.startService(mockService.id))
        .rejects.toThrow('Servicio falló health check inicial');
    });
  });
  
  describe('Error Handling', () => {
    test('should handle service not found', async () => {
      await serviceManager.initialize();
      
      await expect(serviceManager.startService('non-existent'))
        .rejects.toThrow('Servicio no encontrado: non-existent');
    });
    
    test('should handle service already running', async () => {
      await serviceManager.initialize();
      await serviceManager.registerService(mockService, {
        id: mockService.id,
        name: mockService.name,
        version: mockService.version,
        autoStart: false,
        restartOnFailure: false,
        maxRestartAttempts: 3,
        healthCheckInterval: 30000,
        dependencies: []
      });
      
      await serviceManager.startService(mockService.id);
      await serviceManager.startService(mockService.id); // Should not throw
      
      expect(mockService.status).toBe(ServiceStatus.RUNNING);
    });
  });
  
  describe('Shutdown', () => {
    test('should shutdown all services gracefully', async () => {
      await serviceManager.initialize();
      await serviceManager.registerService(mockService, {
        id: mockService.id,
        name: mockService.name,
        version: mockService.version,
        autoStart: false,
        restartOnFailure: false,
        maxRestartAttempts: 3,
        healthCheckInterval: 30000,
        dependencies: []
      });
      
      await serviceManager.startService(mockService.id);
      await serviceManager.shutdown();
      
      expect(mockService.status).toBe(ServiceStatus.STOPPED);
    });
  });
}); 
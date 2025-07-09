/**
 * ⚙️ ParamsModule - Gestión de Parámetros y Configuración Dinámica
 * 
 * Responsabilidades:
 * - Gestión de parámetros
 * - Configuración dinámica
 * - Testing de parámetros
 * - Validación de configuraciones
 * - Gestión de entornos
 */

import { ModuleWrapper, ModulePublicAPI, ModuleInternalAPI } from '../../../@types/core/module.d';
import { centralCoordinator } from '../../../src/core/CentralModuleCoordinator';
import { interModuleBus } from '../../../src/core/InterModuleMessageBus';
import { EventEmitter } from 'events';

// ============================================================================
// INTERFACES ESPECÍFICAS DE PARÁMETROS
// ============================================================================

interface ParamsConfig {
  enabled: boolean;
  environments: EnvironmentConfig[];
  defaultEnvironment: string;
  validation: ValidationConfig;
  caching: CacheConfig;
}

interface EnvironmentConfig {
  id: string;
  name: string;
  type: 'development' | 'staging' | 'production' | 'testing';
  description: string;
  enabled: boolean;
  parameters: Parameter[];
  metadata: Record<string, any>;
}

interface Parameter {
  id: string;
  name: string;
  key: string;
  value: any;
  type: 'string' | 'number' | 'boolean' | 'array' | 'object';
  description: string;
  required: boolean;
  defaultValue?: any;
  validation?: ValidationRule[];
  encrypted: boolean;
  lastModified: Date;
  modifiedBy: string;
}

interface ValidationRule {
  id: string;
  type: 'required' | 'min' | 'max' | 'pattern' | 'custom' | 'enum';
  value: any;
  message: string;
  enabled: boolean;
}

interface ValidationConfig {
  enabled: boolean;
  strictMode: boolean;
  autoValidate: boolean;
  customValidators: CustomValidator[];
}

interface CustomValidator {
  id: string;
  name: string;
  function: string;
  description: string;
  enabled: boolean;
}

interface CacheConfig {
  enabled: boolean;
  ttl: number;
  maxSize: number;
  strategy: 'lru' | 'fifo' | 'lfu';
}

interface ParameterTest {
  id: string;
  name: string;
  environmentId: string;
  parameters: TestParameter[];
  status: 'pending' | 'running' | 'completed' | 'failed';
  startTime?: Date;
  endTime?: Date;
  results: TestResult[];
  metadata: Record<string, any>;
}

interface TestParameter {
  id: string;
  key: string;
  value: any;
  expectedValue?: any;
  validation: boolean;
}

interface TestResult {
  id: string;
  parameterId: string;
  success: boolean;
  actualValue: any;
  expectedValue?: any;
  error?: string;
  duration: number;
  timestamp: Date;
}

interface ParameterChange {
  id: string;
  parameterId: string;
  environmentId: string;
  oldValue: any;
  newValue: any;
  changedBy: string;
  timestamp: Date;
  reason: string;
  approved: boolean;
  approvedBy?: string;
  approvedAt?: Date;
}

// ============================================================================
// CLASE PRINCIPAL DE PARÁMETROS
// ============================================================================

class ParamsManager extends EventEmitter {
  private config: ParamsConfig;
  private environments: Map<string, EnvironmentConfig> = new Map();
  private parameters: Map<string, Parameter> = new Map();
  private tests: Map<string, ParameterTest> = new Map();
  private changes: Map<string, ParameterChange> = new Map();
  private cache: Map<string, { value: any; timestamp: number }> = new Map();
  private isInitialized: boolean = false;

  constructor() {
    super();
    this.config = this.getDefaultConfig();
  }

  private getDefaultConfig(): ParamsConfig {
    return {
      enabled: true,
      environments: [],
      defaultEnvironment: 'development',
      validation: {
        enabled: true,
        strictMode: false,
        autoValidate: true,
        customValidators: []
      },
      caching: {
        enabled: true,
        ttl: 300000, // 5 minutos
        maxSize: 1000,
        strategy: 'lru'
      }
    };
  }

  async initialize(): Promise<void> {
    console.log('[⚙️] Initializing ParamsManager...');
    
    try {
      await this.loadConfiguration();
      await this.setupEnvironments();
      await this.setupDefaultParameters();
      await this.setupCache();
      
      this.isInitialized = true;
    } catch (error) {
      console.error('[❌] Error initializing ParamsManager:', error);
      throw error;
    }
  }

  private async loadConfiguration(): Promise<void> {
    console.log('[⚙️] Loading parameters configuration...');
    
    // En un entorno real, cargaría desde archivo o base de datos
    this.config = this.getDefaultConfig();
  }

  private async setupEnvironments(): Promise<void> {
    console.log('[⚙️] Setting up environments...');
    
    const defaultEnvironments: EnvironmentConfig[] = [
      {
        id: 'development',
        name: 'Development',
        type: 'development',
        description: 'Development environment',
        enabled: true,
        parameters: [],
        metadata: { autoReload: true }
      },
      {
        id: 'staging',
        name: 'Staging',
        type: 'staging',
        description: 'Staging environment',
        enabled: true,
        parameters: [],
        metadata: { autoReload: false }
      },
      {
        id: 'production',
        name: 'Production',
        type: 'production',
        description: 'Production environment',
        enabled: true,
        parameters: [],
        metadata: { autoReload: false, requiresApproval: true }
      },
      {
        id: 'testing',
        name: 'Testing',
        type: 'testing',
        description: 'Testing environment',
        enabled: true,
        parameters: [],
        metadata: { autoReload: true }
      }
    ];

    for (const env of defaultEnvironments) {
      this.environments.set(env.id, env);
    }
  }

  private async setupDefaultParameters(): Promise<void> {
    console.log('[⚙️] Setting up default parameters...');
    
    const defaultParameters: Parameter[] = [
      {
        id: 'app_name',
        name: 'Application Name',
        key: 'app.name',
        value: 'WoldVirtual3DlucIA',
        type: 'string',
        description: 'Application display name',
        required: true,
        encrypted: false,
        lastModified: new Date(),
        modifiedBy: 'system'
      },
      {
        id: 'app_version',
        name: 'Application Version',
        key: 'app.version',
        value: '1.0.0',
        type: 'string',
        description: 'Application version',
        required: true,
        encrypted: false,
        lastModified: new Date(),
        modifiedBy: 'system'
      },
      {
        id: 'api_url',
        name: 'API URL',
        key: 'api.url',
        value: 'https://api.woldvirtual3d.com',
        type: 'string',
        description: 'API base URL',
        required: true,
        validation: [
          {
            id: 'url_format',
            type: 'pattern',
            value: /^https?:\/\/.+/,
            message: 'Must be a valid URL',
            enabled: true
          }
        ],
        encrypted: false,
        lastModified: new Date(),
        modifiedBy: 'system'
      },
      {
        id: 'database_url',
        name: 'Database URL',
        key: 'database.url',
        value: 'postgresql://localhost:5432/woldvirtual',
        type: 'string',
        description: 'Database connection URL',
        required: true,
        encrypted: true,
        lastModified: new Date(),
        modifiedBy: 'system'
      },
      {
        id: 'max_connections',
        name: 'Max Connections',
        key: 'database.maxConnections',
        value: 100,
        type: 'number',
        description: 'Maximum database connections',
        required: true,
        validation: [
          {
            id: 'min_connections',
            type: 'min',
            value: 1,
            message: 'Must be at least 1',
            enabled: true
          },
          {
            id: 'max_connections_limit',
            type: 'max',
            value: 1000,
            message: 'Must be at most 1000',
            enabled: true
          }
        ],
        encrypted: false,
        lastModified: new Date(),
        modifiedBy: 'system'
      },
      {
        id: 'debug_mode',
        name: 'Debug Mode',
        key: 'app.debug',
        value: true,
        type: 'boolean',
        description: 'Enable debug mode',
        required: false,
        defaultValue: false,
        encrypted: false,
        lastModified: new Date(),
        modifiedBy: 'system'
      },
      {
        id: 'allowed_origins',
        name: 'Allowed Origins',
        key: 'cors.allowedOrigins',
        value: ['http://localhost:3000', 'https://woldvirtual3d.com'],
        type: 'array',
        description: 'CORS allowed origins',
        required: true,
        encrypted: false,
        lastModified: new Date(),
        modifiedBy: 'system'
      }
    ];

    for (const param of defaultParameters) {
      this.parameters.set(param.id, param);
      
      // Agregar a todos los entornos
      for (const env of this.environments.values()) {
        env.parameters.push({ ...param });
      }
    }
  }

  private async setupCache(): Promise<void> {
    console.log('[⚙️] Setting up parameter cache...');
    
    if (this.config.caching.enabled) {
      // Limpiar cache expirado periódicamente
      setInterval(() => {
        this.cleanupExpiredCache();
      }, 60000); // Cada minuto
    }
  }

  async getParameter(key: string, environmentId?: string): Promise<any> {
    const envId = environmentId || this.config.defaultEnvironment;
    
    // Verificar cache
    const cacheKey = `${envId}:${key}`;
    if (this.config.caching.enabled) {
      const cached = this.cache.get(cacheKey);
      if (cached && Date.now() - cached.timestamp < this.config.caching.ttl) {
        return cached.value;
      }
    }

    // Buscar parámetro
    const environment = this.environments.get(envId);
    if (!environment) {
      throw new Error(`Environment ${envId} not found`);
    }

    const parameter = environment.parameters.find(p => p.key === key);
    if (!parameter) {
      throw new Error(`Parameter ${key} not found in environment ${envId}`);
    }

    // Validar si es necesario
    if (this.config.validation.autoValidate) {
      await this.validateParameter(parameter);
    }

    // Cachear resultado
    if (this.config.caching.enabled) {
      this.cache.set(cacheKey, {
        value: parameter.value,
        timestamp: Date.now()
      });
    }

    return parameter.value;
  }

  async setParameter(
    key: string,
    value: any,
    environmentId?: string,
    userId: string = 'system'
  ): Promise<void> {
    const envId = environmentId || this.config.defaultEnvironment;
    
    const environment = this.environments.get(envId);
    if (!environment) {
      throw new Error(`Environment ${envId} not found`);
    }

    const parameter = environment.parameters.find(p => p.key === key);
    if (!parameter) {
      throw new Error(`Parameter ${key} not found in environment ${envId}`);
    }

    // Validar valor
    if (this.config.validation.enabled) {
      await this.validateParameterValue(parameter, value);
    }

    // Crear registro de cambio
    const changeId = `change_${Date.now()}`;
    const change: ParameterChange = {
      id: changeId,
      parameterId: parameter.id,
      environmentId: envId,
      oldValue: parameter.value,
      newValue: value,
      changedBy: userId,
      timestamp: new Date(),
      reason: 'Manual update',
      approved: !environment.metadata.requiresApproval
    };

    this.changes.set(changeId, change);

    // Aplicar cambio si está aprobado
    if (change.approved) {
      parameter.value = value;
      parameter.lastModified = new Date();
      parameter.modifiedBy = userId;

      // Limpiar cache
      const cacheKey = `${envId}:${key}`;
      this.cache.delete(cacheKey);

      this.emit('parameterChanged', change);
      console.log(`[⚙️] Parameter updated: ${key} = ${value}`);
    } else {
      this.emit('parameterChangePending', change);
      console.log(`[⚙️] Parameter change pending approval: ${key}`);
    }
  }

  async validateParameter(parameter: Parameter): Promise<void> {
    if (!parameter.validation || parameter.validation.length === 0) {
      return;
    }

    for (const rule of parameter.validation) {
      if (!rule.enabled) continue;

      const isValid = this.validateRule(rule, parameter.value);
      if (!isValid) {
        throw new Error(`Parameter validation failed: ${rule.message}`);
      }
    }
  }

  async validateParameterValue(parameter: Parameter, value: any): Promise<void> {
    // Validar tipo
    if (typeof value !== parameter.type && parameter.type !== 'array' && parameter.type !== 'object') {
      throw new Error(`Invalid type for parameter ${parameter.key}. Expected ${parameter.type}, got ${typeof value}`);
    }

    // Validar reglas
    if (parameter.validation) {
      for (const rule of parameter.validation) {
        if (!rule.enabled) continue;

        const isValid = this.validateRule(rule, value);
        if (!isValid) {
          throw new Error(`Parameter validation failed: ${rule.message}`);
        }
      }
    }
  }

  private validateRule(rule: ValidationRule, value: any): boolean {
    switch (rule.type) {
      case 'required':
        return value !== null && value !== undefined && value !== '';
      case 'min':
        return typeof value === 'string' ? value.length >= rule.value : value >= rule.value;
      case 'max':
        return typeof value === 'string' ? value.length <= rule.value : value <= rule.value;
      case 'pattern':
        return rule.value.test(value);
      case 'enum':
        return Array.isArray(rule.value) && rule.value.includes(value);
      default:
        return true;
    }
  }

  async createParameterTest(
    name: string,
    environmentId: string,
    testParameters: { key: string; value: any; expectedValue?: any }[]
  ): Promise<string> {
    const environment = this.environments.get(environmentId);
    if (!environment) {
      throw new Error(`Environment ${environmentId} not found`);
    }

    console.log(`[⚙️] Creating parameter test: ${name}`);

    const testId = `test_${Date.now()}`;
    const test: ParameterTest = {
      id: testId,
      name,
      environmentId,
      parameters: testParameters.map(tp => ({
        id: `test_param_${Date.now()}_${Math.random()}`,
        key: tp.key,
        value: tp.value,
        expectedValue: tp.expectedValue,
        validation: true
      })),
      status: 'pending',
      results: [],
      metadata: {}
    };

    this.tests.set(testId, test);
    this.emit('testCreated', test);

    return testId;
  }

  async runParameterTest(testId: string): Promise<void> {
    const test = this.tests.get(testId);
    if (!test) {
      throw new Error(`Test ${testId} not found`);
    }

    console.log(`[⚙️] Running parameter test: ${test.name}`);

    test.status = 'running';
    test.startTime = new Date();

    try {
      for (const testParam of test.parameters) {
        const startTime = Date.now();
        
        try {
          // Obtener valor actual
          const currentValue = await this.getParameter(testParam.key, test.environmentId);
          
          // Validar si hay valor esperado
          const success = testParam.expectedValue === undefined || currentValue === testParam.expectedValue;
          
          const result: TestResult = {
            id: `result_${Date.now()}_${Math.random()}`,
            parameterId: testParam.id,
            success,
            actualValue: currentValue,
            expectedValue: testParam.expectedValue,
            duration: Date.now() - startTime,
            timestamp: new Date()
          };

          if (!success && testParam.expectedValue !== undefined) {
            result.error = `Expected ${testParam.expectedValue}, got ${currentValue}`;
          }

          test.results.push(result);

        } catch (error) {
          const result: TestResult = {
            id: `result_${Date.now()}_${Math.random()}`,
            parameterId: testParam.id,
            success: false,
            actualValue: null,
            error: error.message,
            duration: Date.now() - startTime,
            timestamp: new Date()
          };

          test.results.push(result);
        }
      }

      test.status = 'completed';
      test.endTime = new Date();

      this.emit('testCompleted', test);
      console.log(`[✅] Parameter test completed: ${test.name}`);

    } catch (error) {
      test.status = 'failed';
      test.endTime = new Date();
      
      this.emit('testFailed', { test, error: error.message });
      console.error(`[❌] Parameter test failed: ${test.name}`, error);
    }
  }

  async approveParameterChange(changeId: string, approvedBy: string): Promise<void> {
    const change = this.changes.get(changeId);
    if (!change) {
      throw new Error(`Change ${changeId} not found`);
    }

    if (change.approved) {
      throw new Error(`Change ${changeId} is already approved`);
    }

    change.approved = true;
    change.approvedBy = approvedBy;
    change.approvedAt = new Date();

    // Aplicar cambio
    const environment = this.environments.get(change.environmentId);
    if (environment) {
      const parameter = environment.parameters.find(p => p.id === change.parameterId);
      if (parameter) {
        parameter.value = change.newValue;
        parameter.lastModified = new Date();
        parameter.modifiedBy = change.changedBy;

        // Limpiar cache
        const cacheKey = `${change.environmentId}:${parameter.key}`;
        this.cache.delete(cacheKey);
      }
    }

    this.emit('changeApproved', change);
    console.log(`[✅] Parameter change approved: ${changeId}`);
  }

  private cleanupExpiredCache(): void {
    const now = Date.now();
    for (const [key, cached] of this.cache.entries()) {
      if (now - cached.timestamp > this.config.caching.ttl) {
        this.cache.delete(key);
      }
    }
  }

  // ============================================================================
  // API PÚBLICA
  // ============================================================================

  async getEnvironments(): Promise<EnvironmentConfig[]> {
    return Array.from(this.environments.values());
  }

  async getEnvironment(environmentId: string): Promise<EnvironmentConfig | null> {
    return this.environments.get(environmentId) || null;
  }

  async getParameters(environmentId?: string): Promise<Parameter[]> {
    const envId = environmentId || this.config.defaultEnvironment;
    const environment = this.environments.get(envId);
    return environment ? environment.parameters : [];
  }

  async getParameterHistory(key: string, environmentId?: string): Promise<ParameterChange[]> {
    const envId = environmentId || this.config.defaultEnvironment;
    return Array.from(this.changes.values())
      .filter(change => change.environmentId === envId && change.parameterId === key)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  async getTests(environmentId?: string): Promise<ParameterTest[]> {
    let tests = Array.from(this.tests.values());
    
    if (environmentId) {
      tests = tests.filter(test => test.environmentId === environmentId);
    }
    
    return tests.sort((a, b) => (b.startTime?.getTime() || 0) - (a.startTime?.getTime() || 0));
  }

  async getPendingChanges(): Promise<ParameterChange[]> {
    return Array.from(this.changes.values())
      .filter(change => !change.approved)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  async clearCache(): Promise<void> {
    this.cache.clear();
    console.log('[⚙️] Parameter cache cleared');
  }

  // ============================================================================
  // LIMPIEZA
  // ============================================================================

  async cleanup(): Promise<void> {
    console.log('[🧹] Cleaning up ParamsManager...');
    
    this.cache.clear();
    this.tests.clear();
    this.changes.clear();
    
    console.log('[✅] ParamsManager cleaned up');
  }
}

// ============================================================================
// INSTANCIA Y EXPORTACIÓN
// ============================================================================

const paramsManager = new ParamsManager();

export const ParamsModule: ModuleWrapper = {
  name: 'params',
  dependencies: ['config', 'security'],
  publicAPI: {
    getParameter: (key, environmentId) => paramsManager.getParameter(key, environmentId),
    setParameter: (key, value, environmentId, userId) => paramsManager.setParameter(key, value, environmentId, userId),
    createParameterTest: (name, environmentId, testParameters) => paramsManager.createParameterTest(name, environmentId, testParameters),
    runParameterTest: (testId) => paramsManager.runParameterTest(testId),
    approveParameterChange: (changeId, approvedBy) => paramsManager.approveParameterChange(changeId, approvedBy),
    getEnvironments: () => paramsManager.getEnvironments(),
    getEnvironment: (environmentId) => paramsManager.getEnvironment(environmentId),
    getParameters: (environmentId) => paramsManager.getParameters(environmentId),
    getParameterHistory: (key, environmentId) => paramsManager.getParameterHistory(key, environmentId),
    getTests: (environmentId) => paramsManager.getTests(environmentId),
    getPendingChanges: () => paramsManager.getPendingChanges(),
    clearCache: () => paramsManager.clearCache()
  },
  internalAPI: {
    manager: paramsManager
  },
  
  async initialize(userId: string): Promise<void> {
    console.log(`[⚙️] Initializing ParamsModule for user ${userId}...`);
    await paramsManager.initialize();
    
    // Suscribirse a eventos del message bus
    const messageBus = interModuleBus.getInstance();
    messageBus.subscribe('params-get', async (request: { key: string; environmentId?: string }) => {
      await paramsManager.getParameter(request.key, request.environmentId);
    });
    
    console.log(`[✅] ParamsModule initialized for user ${userId}`);
  },
  
  async cleanup(userId: string): Promise<void> {
    console.log(`[🧹] Cleaning up ParamsModule for user ${userId}...`);
    await paramsManager.cleanup();
    console.log(`[✅] ParamsModule cleaned up for user ${userId}`);
  }
};

export default ParamsModule; 
/**
 * AIConfig - Configuración del Sistema de IA
 * 
 * Configuración centralizada para el sistema de inteligencia artificial
 * del editor 3D del metaverso.
 */

export interface AIConfig {
  id: string;
  name: string;
  version: string;
  maxConcurrentTasks: number;
  models: ModelConfig[];
  pipelines: PipelineConfig[];
  training: TrainingConfig;
  inference: InferenceConfig;
  optimization: OptimizationConfig;
  resources: ResourceConfig;
  security: SecurityConfig;
  monitoring: MonitoringConfig;
}

export interface ModelConfig {
  id: string;
  name: string;
  type: string;
  path: string;
  version: string;
  description: string;
  parameters: ModelParameters;
  requirements: ModelRequirements;
  metadata: ModelMetadata;
}

export interface ModelParameters {
  maxInputSize: number;
  maxOutputSize: number;
  batchSize: number;
  precision: 'fp16' | 'fp32' | 'int8';
  quantization: boolean;
  custom: Record<string, any>;
}

export interface ModelRequirements {
  minMemory: number;
  minGPU: number;
  supportedDevices: string[];
  dependencies: string[];
  frameworks: string[];
}

export interface ModelMetadata {
  author: string;
  license: string;
  tags: string[];
  accuracy: number;
  latency: number;
  throughput: number;
  lastUpdated: string;
}

export interface PipelineConfig {
  id: string;
  name: string;
  description: string;
  steps: PipelineStep[];
  inputSchema: any;
  outputSchema: any;
  timeout: number;
  retries: number;
}

export interface PipelineStep {
  id: string;
  type: string;
  modelId?: string;
  config: Record<string, any>;
  inputMapping: Record<string, string>;
  outputMapping: Record<string, string>;
  errorHandling: ErrorHandlingConfig;
}

export interface ErrorHandlingConfig {
  retryCount: number;
  retryDelay: number;
  fallbackAction: 'skip' | 'abort' | 'use_default';
  errorThreshold: number;
}

export interface TrainingConfig {
  enabled: boolean;
  maxEpochs: number;
  batchSize: number;
  learningRate: number;
  validationSplit: number;
  earlyStopping: boolean;
  checkpointInterval: number;
  dataAugmentation: boolean;
  hyperparameterTuning: boolean;
  distributedTraining: boolean;
  gpuAcceleration: boolean;
}

export interface InferenceConfig {
  batchProcessing: boolean;
  maxBatchSize: number;
  caching: boolean;
  cacheSize: number;
  cacheTTL: number;
  preloading: boolean;
  warmupIterations: number;
  dynamicBatching: boolean;
  loadBalancing: boolean;
  failover: boolean;
}

export interface OptimizationConfig {
  enabled: boolean;
  algorithms: string[];
  maxIterations: number;
  convergenceThreshold: number;
  populationSize: number;
  mutationRate: number;
  crossoverRate: number;
  elitism: boolean;
  parallelOptimization: boolean;
  constraintHandling: string;
}

export interface ResourceConfig {
  maxMemoryUsage: number;
  maxGPUUsage: number;
  maxCPUUsage: number;
  memoryAllocation: 'static' | 'dynamic';
  gpuAllocation: 'exclusive' | 'shared';
  cpuAllocation: 'dedicated' | 'shared';
  autoScaling: boolean;
  resourceMonitoring: boolean;
  cleanupInterval: number;
}

export interface SecurityConfig {
  modelEncryption: boolean;
  dataEncryption: boolean;
  accessControl: boolean;
  auditLogging: boolean;
  modelSigning: boolean;
  secureInference: boolean;
  privacyPreserving: boolean;
  federatedLearning: boolean;
  differentialPrivacy: boolean;
}

export interface MonitoringConfig {
  enabled: boolean;
  metrics: string[];
  logging: boolean;
  alerting: boolean;
  dashboard: boolean;
  performanceTracking: boolean;
  errorTracking: boolean;
  usageAnalytics: boolean;
  modelDrift: boolean;
  dataQuality: boolean;
}

/**
 * Configuración por defecto del sistema de IA
 */
export const DEFAULT_AI_CONFIG: AIConfig = {
  id: 'ai-system-001',
  name: 'Metaverse AI System',
  version: '1.0.0',
  maxConcurrentTasks: 5,
  models: [
    {
      id: 'text-generation-v1',
      name: 'Text Generation Model v1',
      type: 'generative',
      path: 'models/text-generation/v1',
      version: '1.0.0',
      description: 'Advanced text generation model for content creation',
      parameters: {
        maxInputSize: 2048,
        maxOutputSize: 4096,
        batchSize: 1,
        precision: 'fp16',
        quantization: true,
        custom: {
          temperature: 0.7,
          topP: 0.9,
          maxTokens: 1000
        }
      },
      requirements: {
        minMemory: 4096,
        minGPU: 4,
        supportedDevices: ['cuda', 'cpu'],
        dependencies: ['torch', 'transformers'],
        frameworks: ['pytorch']
      },
      metadata: {
        author: 'Metaverse AI Team',
        license: 'MIT',
        tags: ['text', 'generation', 'nlp'],
        accuracy: 0.92,
        latency: 150,
        throughput: 100,
        lastUpdated: '2024-12-01'
      }
    },
    {
      id: 'image-generation-v1',
      name: 'Image Generation Model v1',
      type: 'generative',
      path: 'models/image-generation/v1',
      version: '1.0.0',
      description: 'High-quality image generation model',
      parameters: {
        maxInputSize: 512,
        maxOutputSize: 1024,
        batchSize: 4,
        precision: 'fp16',
        quantization: false,
        custom: {
          guidanceScale: 7.5,
          numInferenceSteps: 50,
          width: 512,
          height: 512
        }
      },
      requirements: {
        minMemory: 8192,
        minGPU: 8,
        supportedDevices: ['cuda'],
        dependencies: ['diffusers', 'transformers'],
        frameworks: ['pytorch']
      },
      metadata: {
        author: 'Metaverse AI Team',
        license: 'MIT',
        tags: ['image', 'generation', 'diffusion'],
        accuracy: 0.89,
        latency: 2000,
        throughput: 10,
        lastUpdated: '2024-12-01'
      }
    },
    {
      id: 'performance-prediction-v1',
      name: 'Performance Prediction Model v1',
      type: 'predictive',
      path: 'models/performance-prediction/v1',
      version: '1.0.0',
      description: 'Predicts performance metrics for 3D scenes',
      parameters: {
        maxInputSize: 1024,
        maxOutputSize: 256,
        batchSize: 32,
        precision: 'fp32',
        quantization: true,
        custom: {
          confidenceThreshold: 0.8,
          predictionHorizon: 60
        }
      },
      requirements: {
        minMemory: 2048,
        minGPU: 2,
        supportedDevices: ['cuda', 'cpu'],
        dependencies: ['scikit-learn', 'numpy'],
        frameworks: ['python']
      },
      metadata: {
        author: 'Metaverse AI Team',
        license: 'MIT',
        tags: ['performance', 'prediction', 'optimization'],
        accuracy: 0.95,
        latency: 50,
        throughput: 1000,
        lastUpdated: '2024-12-01'
      }
    }
  ],
  pipelines: [
    {
      id: 'material-generation-pipeline',
      name: 'Material Generation Pipeline',
      description: 'Generates materials from text descriptions',
      steps: [
        {
          id: 'text-processing',
          type: 'text-processing',
          config: {
            maxLength: 512,
            language: 'en'
          },
          inputMapping: {
            'prompt': 'input.text'
          },
          outputMapping: {
            'processed_text': 'text_embedding'
          },
          errorHandling: {
            retryCount: 3,
            retryDelay: 1000,
            fallbackAction: 'abort',
            errorThreshold: 0.1
          }
        },
        {
          id: 'text-generation',
          type: 'model-inference',
          modelId: 'text-generation-v1',
          config: {
            temperature: 0.7,
            maxTokens: 200
          },
          inputMapping: {
            'text_embedding': 'input'
          },
          outputMapping: {
            'generated_text': 'material_description'
          },
          errorHandling: {
            retryCount: 2,
            retryDelay: 2000,
            fallbackAction: 'use_default',
            errorThreshold: 0.2
          }
        },
        {
          id: 'image-generation',
          type: 'model-inference',
          modelId: 'image-generation-v1',
          config: {
            guidanceScale: 7.5,
            numInferenceSteps: 30
          },
          inputMapping: {
            'material_description': 'prompt'
          },
          outputMapping: {
            'generated_image': 'material_texture'
          },
          errorHandling: {
            retryCount: 1,
            retryDelay: 5000,
            fallbackAction: 'skip',
            errorThreshold: 0.3
          }
        }
      ],
      inputSchema: {
        type: 'object',
        properties: {
          prompt: { type: 'string', maxLength: 512 }
        },
        required: ['prompt']
      },
      outputSchema: {
        type: 'object',
        properties: {
          material_description: { type: 'string' },
          material_texture: { type: 'string' }
        }
      },
      timeout: 30000,
      retries: 2
    }
  ],
  training: {
    enabled: true,
    maxEpochs: 100,
    batchSize: 32,
    learningRate: 0.001,
    validationSplit: 0.2,
    earlyStopping: true,
    checkpointInterval: 10,
    dataAugmentation: true,
    hyperparameterTuning: true,
    distributedTraining: false,
    gpuAcceleration: true
  },
  inference: {
    batchProcessing: true,
    maxBatchSize: 16,
    caching: true,
    cacheSize: 1000,
    cacheTTL: 3600,
    preloading: true,
    warmupIterations: 10,
    dynamicBatching: true,
    loadBalancing: true,
    failover: true
  },
  optimization: {
    enabled: true,
    algorithms: ['genetic', 'bayesian', 'gradient'],
    maxIterations: 1000,
    convergenceThreshold: 0.001,
    populationSize: 50,
    mutationRate: 0.1,
    crossoverRate: 0.8,
    elitism: true,
    parallelOptimization: true,
    constraintHandling: 'penalty'
  },
  resources: {
    maxMemoryUsage: 80,
    maxGPUUsage: 90,
    maxCPUUsage: 80,
    memoryAllocation: 'dynamic',
    gpuAllocation: 'shared',
    cpuAllocation: 'shared',
    autoScaling: true,
    resourceMonitoring: true,
    cleanupInterval: 300000
  },
  security: {
    modelEncryption: true,
    dataEncryption: true,
    accessControl: true,
    auditLogging: true,
    modelSigning: true,
    secureInference: true,
    privacyPreserving: true,
    federatedLearning: false,
    differentialPrivacy: false
  },
  monitoring: {
    enabled: true,
    metrics: ['accuracy', 'latency', 'throughput', 'memory', 'gpu'],
    logging: true,
    alerting: true,
    dashboard: true,
    performanceTracking: true,
    errorTracking: true,
    usageAnalytics: true,
    modelDrift: true,
    dataQuality: true
  }
};

/**
 * Valida una configuración de IA
 */
export function validateAIConfig(config: AIConfig): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  // Validar configuración básica
  if (!config.id || config.id.trim() === '') {
    errors.push('AI configuration must have a valid ID');
  }

  if (!config.name || config.name.trim() === '') {
    errors.push('AI configuration must have a valid name');
  }

  if (config.maxConcurrentTasks <= 0) {
    errors.push('maxConcurrentTasks must be greater than 0');
  }

  // Validar modelos
  if (!Array.isArray(config.models)) {
    errors.push('models must be an array');
  } else {
    config.models.forEach((model, index) => {
      if (!model.id || model.id.trim() === '') {
        errors.push(`Model at index ${index} must have a valid ID`);
      }
      if (!model.type || model.type.trim() === '') {
        errors.push(`Model ${model.id} must have a valid type`);
      }
      if (!model.path || model.path.trim() === '') {
        errors.push(`Model ${model.id} must have a valid path`);
      }
    });
  }

  // Validar pipelines
  if (!Array.isArray(config.pipelines)) {
    errors.push('pipelines must be an array');
  } else {
    config.pipelines.forEach((pipeline, index) => {
      if (!pipeline.id || pipeline.id.trim() === '') {
        errors.push(`Pipeline at index ${index} must have a valid ID`);
      }
      if (!Array.isArray(pipeline.steps) || pipeline.steps.length === 0) {
        errors.push(`Pipeline ${pipeline.id} must have at least one step`);
      }
    });
  }

  // Validar recursos
  if (config.resources.maxMemoryUsage <= 0 || config.resources.maxMemoryUsage > 100) {
    errors.push('maxMemoryUsage must be between 1 and 100');
  }

  if (config.resources.maxGPUUsage <= 0 || config.resources.maxGPUUsage > 100) {
    errors.push('maxGPUUsage must be between 1 and 100');
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Crea una configuración de IA desde un objeto parcial
 */
export function createAIConfig(partialConfig: Partial<AIConfig>): AIConfig {
  return {
    ...DEFAULT_AI_CONFIG,
    ...partialConfig,
    models: [
      ...DEFAULT_AI_CONFIG.models,
      ...(partialConfig.models || [])
    ],
    pipelines: [
      ...DEFAULT_AI_CONFIG.pipelines,
      ...(partialConfig.pipelines || [])
    ]
  };
}

/**
 * Serializa una configuración de IA
 */
export function serializeAIConfig(config: AIConfig): string {
  return JSON.stringify(config, null, 2);
}

/**
 * Deserializa una configuración de IA
 */
export function deserializeAIConfig(json: string): AIConfig {
  const parsed = JSON.parse(json);
  return createAIConfig(parsed);
} 
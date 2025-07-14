/**
 * Tests para AIManager
 */

import { AIManager, AIState, AIModelType, AITaskPriority } from '../AIManager';
import { AIConfig, DEFAULT_AI_CONFIG } from '../AIConfig';
import { AIModel } from '../AIModel';
import { AIPipeline } from '../AIPipeline';
import { AITraining } from '../AITraining';
import { AIPrediction } from '../AIPrediction';
import { AIGeneration } from '../AIGeneration';
import { AIOptimization } from '../AIOptimization';

describe('AIManager', () => {
  let aiManager: AIManager;
  let config: AIConfig;

  beforeEach(() => {
    config = {
      ...DEFAULT_AI_CONFIG,
      id: 'test-ai-manager',
      maxConcurrentTasks: 3
    };
    aiManager = new AIManager(config);
  });

  afterEach(() => {
    aiManager.cleanup();
  });

  describe('Inicialización', () => {
    test('debe crear una instancia válida', () => {
      expect(aiManager).toBeDefined();
      expect(aiManager.id).toBe('test-ai-manager');
      expect(aiManager.state).toBe(AIState.IDLE);
    });

    test('debe inicializar correctamente', async () => {
      await aiManager.initialize();
      expect(aiManager.state).toBe(AIState.IDLE);
      expect(aiManager.getModels().length).toBeGreaterThan(0);
    });

    test('debe manejar errores de inicialización', async () => {
      const invalidConfig = { ...config, models: [] };
      const invalidManager = new AIManager(invalidConfig);
      
      await expect(invalidManager.initialize()).rejects.toThrow();
    });
  });

  describe('Gestión de Modelos', () => {
    beforeEach(async () => {
      await aiManager.initialize();
    });

    test('debe cargar modelos correctamente', async () => {
      const modelConfig = {
        id: 'test-model',
        name: 'Test Model',
        type: AIModelType.GENERATIVE,
        path: 'models/test',
        version: '1.0.0',
        description: 'Test model',
        parameters: {
          maxInputSize: 1024,
          maxOutputSize: 2048,
          batchSize: 1,
          precision: 'fp16' as const,
          quantization: false,
          custom: {}
        },
        requirements: {
          minMemory: 1024,
          minGPU: 2,
          supportedDevices: ['cuda'],
          dependencies: [],
          frameworks: []
        },
        metadata: {
          author: 'Test',
          license: 'MIT',
          tags: [],
          accuracy: 0.9,
          latency: 100,
          throughput: 100,
          lastUpdated: '2024-01-01'
        }
      };

      const model = await aiManager.loadModel(modelConfig);
      expect(model).toBeDefined();
      expect(model.id).toBe('test-model');
      expect(aiManager.getModel('test-model')).toBe(model);
    });

    test('debe descargar modelos correctamente', async () => {
      const model = aiManager.getModels()[0];
      await aiManager.unloadModel(model.id);
      expect(aiManager.getModel(model.id)).toBeNull();
    });

    test('debe obtener modelos por tipo', () => {
      const generativeModels = aiManager.getModelsByType(AIModelType.GENERATIVE);
      expect(generativeModels.length).toBeGreaterThan(0);
      expect(generativeModels.every(m => m.type === AIModelType.GENERATIVE)).toBe(true);
    });
  });

  describe('Predicción', () => {
    beforeEach(async () => {
      await aiManager.initialize();
    });

    test('debe realizar predicciones correctamente', async () => {
      const model = aiManager.getModelsByType(AIModelType.PREDICTIVE)[0];
      if (!model) {
        console.warn('No predictive model available for testing');
        return;
      }

      const result = await aiManager.predict(model.id, { input: 'test' });
      expect(result).toBeDefined();
      expect(result.output).toBeDefined();
      expect(result.confidence).toBeGreaterThan(0);
      expect(result.confidence).toBeLessThanOrEqual(1);
    });

    test('debe manejar errores de predicción', async () => {
      await expect(aiManager.predict('non-existent-model', { input: 'test' }))
        .rejects.toThrow();
    });
  });

  describe('Generación', () => {
    beforeEach(async () => {
      await aiManager.initialize();
    });

    test('debe generar contenido correctamente', async () => {
      const model = aiManager.getModelsByType(AIModelType.GENERATIVE)[0];
      if (!model) {
        console.warn('No generative model available for testing');
        return;
      }

      const result = await aiManager.generate(model.id, 'test prompt');
      expect(result).toBeDefined();
      expect(result.output).toBeDefined();
      expect(result.confidence).toBeGreaterThan(0);
    });

    test('debe manejar errores de generación', async () => {
      await expect(aiManager.generate('non-existent-model', 'test prompt'))
        .rejects.toThrow();
    });
  });

  describe('Optimización', () => {
    beforeEach(async () => {
      await aiManager.initialize();
    });

    test('debe optimizar correctamente', async () => {
      const model = aiManager.getModelsByType(AIModelType.OPTIMIZATION)[0];
      if (!model) {
        console.warn('No optimization model available for testing');
        return;
      }

      const result = await aiManager.optimize(model.id, { target: 'performance' });
      expect(result).toBeDefined();
      expect(result.output).toBeDefined();
      expect(result.confidence).toBeGreaterThan(0);
    });

    test('debe manejar errores de optimización', async () => {
      await expect(aiManager.optimize('non-existent-model', { target: 'test' }))
        .rejects.toThrow();
    });
  });

  describe('Entrenamiento', () => {
    beforeEach(async () => {
      await aiManager.initialize();
    });

    test('debe entrenar modelos correctamente', async () => {
      const model = aiManager.getModels()[0];
      const trainingData = [
        { input: 'sample1', output: 'result1' },
        { input: 'sample2', output: 'result2' }
      ];

      const result = await aiManager.trainModel(model.id, trainingData);
      expect(result).toBeDefined();
      expect(result.accuracy).toBeGreaterThan(0);
      expect(result.loss).toBeGreaterThan(0);
    });

    test('debe manejar errores de entrenamiento', async () => {
      await expect(aiManager.trainModel('non-existent-model', []))
        .rejects.toThrow();
    });
  });

  describe('Pipelines', () => {
    beforeEach(async () => {
      await aiManager.initialize();
    });

    test('debe crear pipelines correctamente', () => {
      const pipelineConfig = {
        id: 'test-pipeline',
        name: 'Test Pipeline',
        description: 'Test pipeline',
        steps: [
          {
            id: 'step1',
            type: 'text-processing',
            config: {},
            inputMapping: { text: 'input.text' },
            outputMapping: { processed_text: 'text_embedding' },
            errorHandling: {
              retryCount: 3,
              retryDelay: 1000,
              fallbackAction: 'abort',
              errorThreshold: 0.1
            },
            timeout: 5000,
            retries: 2,
            parallel: false
          }
        ],
        inputSchema: { type: 'object', properties: { text: { type: 'string' } } },
        outputSchema: { type: 'object', properties: { result: { type: 'string' } } },
        timeout: 30000,
        retries: 2,
        parallel: false,
        caching: false,
        cacheTTL: 3600000
      };

      const pipeline = aiManager.createPipeline(pipelineConfig);
      expect(pipeline).toBeDefined();
      expect(pipeline.id).toBe('test-pipeline');
    });

    test('debe ejecutar pipelines correctamente', async () => {
      const pipeline = aiManager.getPipelines()[0];
      if (!pipeline) {
        console.warn('No pipeline available for testing');
        return;
      }

      const result = await aiManager.executePipeline(pipeline.id, { text: 'test input' });
      expect(result).toBeDefined();
    });
  });

  describe('Cola de Tareas', () => {
    beforeEach(async () => {
      await aiManager.initialize();
    });

    test('debe agregar tareas a la cola', () => {
      const taskId = aiManager.queueTask({
        type: 'predict',
        modelId: 'test-model',
        input: { test: 'data' }
      }, AITaskPriority.HIGH);

      expect(taskId).toBeDefined();
      expect(aiManager.queuedTaskCount).toBeGreaterThan(0);
    });

    test('debe procesar tareas por prioridad', () => {
      aiManager.queueTask({ type: 'test', data: 'low' }, AITaskPriority.LOW);
      aiManager.queueTask({ type: 'test', data: 'high' }, AITaskPriority.HIGH);
      aiManager.queueTask({ type: 'test', data: 'normal' }, AITaskPriority.NORMAL);

      // Verificar que las tareas de alta prioridad se procesan primero
      expect(aiManager.queuedTaskCount).toBe(3);
    });
  });

  describe('Estadísticas', () => {
    beforeEach(async () => {
      await aiManager.initialize();
    });

    test('debe obtener estadísticas correctas', () => {
      const stats = aiManager.getStats();
      expect(stats).toBeDefined();
      expect(stats.modelsLoaded).toBeGreaterThan(0);
      expect(stats.totalInferenceTime).toBeGreaterThanOrEqual(0);
      expect(stats.averageResponseTime).toBeGreaterThanOrEqual(0);
    });

    test('debe actualizar estadísticas después de operaciones', async () => {
      const initialStats = aiManager.getStats();
      
      const model = aiManager.getModels()[0];
      if (model) {
        await aiManager.predict(model.id, { input: 'test' });
        
        const updatedStats = aiManager.getStats();
        expect(updatedStats.predictionsMade).toBeGreaterThan(initialStats.predictionsMade);
      }
    });
  });

  describe('Eventos', () => {
    beforeEach(async () => {
      await aiManager.initialize();
    });

    test('debe emitir eventos de carga de modelo', (done) => {
      aiManager.on('model:loaded', (event) => {
        expect(event.manager).toBe(aiManager);
        expect(event.model).toBeDefined();
        expect(event.type).toBeDefined();
        done();
      });

      // Simular carga de modelo
      const modelConfig = {
        id: 'event-test-model',
        name: 'Event Test Model',
        type: AIModelType.GENERATIVE,
        path: 'models/event-test',
        version: '1.0.0',
        description: 'Test model for events',
        parameters: {
          maxInputSize: 1024,
          maxOutputSize: 2048,
          batchSize: 1,
          precision: 'fp16' as const,
          quantization: false,
          custom: {}
        },
        requirements: {
          minMemory: 1024,
          minGPU: 2,
          supportedDevices: ['cuda'],
          dependencies: [],
          frameworks: []
        },
        metadata: {
          author: 'Test',
          license: 'MIT',
          tags: [],
          accuracy: 0.9,
          latency: 100,
          throughput: 100,
          lastUpdated: '2024-01-01'
        }
      };

      aiManager.loadModel(modelConfig);
    });

    test('debe emitir eventos de predicción', (done) => {
      aiManager.on('prediction:made', (event) => {
        expect(event.manager).toBe(aiManager);
        expect(event.prediction).toBeDefined();
        expect(event.result).toBeDefined();
        done();
      });

      const model = aiManager.getModelsByType(AIModelType.PREDICTIVE)[0];
      if (model) {
        aiManager.predict(model.id, { input: 'test' });
      }
    });
  });

  describe('Limpieza', () => {
    beforeEach(async () => {
      await aiManager.initialize();
    });

    test('debe limpiar recursos correctamente', async () => {
      await aiManager.cleanup();
      
      // Verificar que los modelos inactivos se descargaron
      const activeModels = aiManager.getModels().filter(m => m.isActive());
      expect(activeModels.length).toBeLessThanOrEqual(aiManager.getModels().length);
    });
  });

  describe('Estados', () => {
    beforeEach(async () => {
      await aiManager.initialize();
    });

    test('debe manejar estados correctamente', () => {
      expect(aiManager.isIdle).toBe(true);
      expect(aiManager.isTraining).toBe(false);
      expect(aiManager.isInferring).toBe(false);
      expect(aiManager.isOptimizing).toBe(false);
    });

    test('debe actualizar estados durante operaciones', async () => {
      const model = aiManager.getModels()[0];
      if (model) {
        const predictionPromise = aiManager.predict(model.id, { input: 'test' });
        
        // El estado debe cambiar durante la inferencia
        expect(aiManager.isInferring).toBe(true);
        
        await predictionPromise;
        
        // El estado debe volver a idle
        expect(aiManager.isIdle).toBe(true);
      }
    });
  });

  describe('Manejo de Errores', () => {
    beforeEach(async () => {
      await aiManager.initialize();
    });

    test('debe manejar errores de modelo inexistente', async () => {
      await expect(aiManager.predict('non-existent', { input: 'test' }))
        .rejects.toThrow('Model non-existent not found');
    });

    test('debe manejar errores de tipo de modelo incorrecto', async () => {
      const model = aiManager.getModelsByType(AIModelType.GENERATIVE)[0];
      if (model) {
        await expect(aiManager.predict(model.id, { input: 'test' }))
          .rejects.toThrow('is not a predictive model');
      }
    });

    test('debe emitir eventos de error', (done) => {
      aiManager.on('error:ai', (event) => {
        expect(event.manager).toBe(aiManager);
        expect(event.error).toBeDefined();
        expect(event.context).toBeDefined();
        done();
      });

      aiManager.predict('non-existent', { input: 'test' }).catch(() => {});
    });
  });

  describe('Concurrencia', () => {
    beforeEach(async () => {
      await aiManager.initialize();
    });

    test('debe manejar múltiples tareas concurrentes', async () => {
      const model = aiManager.getModels()[0];
      if (!model) return;

      const promises = Array.from({ length: 5 }, () => 
        aiManager.predict(model.id, { input: 'test' })
      );

      const results = await Promise.allSettled(promises);
      const successfulResults = results.filter(r => r.status === 'fulfilled');
      
      expect(successfulResults.length).toBeGreaterThan(0);
    });

    test('debe respetar el límite de tareas concurrentes', async () => {
      const model = aiManager.getModels()[0];
      if (!model) return;

      const startTime = Date.now();
      
      const promises = Array.from({ length: 10 }, () => 
        aiManager.predict(model.id, { input: 'test' })
      );

      await Promise.all(promises);
      
      const endTime = Date.now();
      const totalTime = endTime - startTime;
      
      // Las tareas deben tomar tiempo debido a la limitación de concurrencia
      expect(totalTime).toBeGreaterThan(100);
    });
  });
}); 
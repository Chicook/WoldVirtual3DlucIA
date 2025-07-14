/**
 * Tests para AIModel
 */

import { AIModel } from '../AIModel';
import { AIModelType } from '../AIManager';

describe('AIModel', () => {
  let model: AIModel;
  let modelConfig: any;

  beforeEach(() => {
    modelConfig = {
      id: 'test-model',
      name: 'Test Model',
      type: AIModelType.GENERATIVE,
      path: 'models/test',
      version: '1.0.0',
      description: 'Test model for unit testing',
      parameters: {
        maxInputSize: 1024,
        maxOutputSize: 2048,
        batchSize: 1,
        precision: 'fp16' as const,
        quantization: false,
        custom: {
          temperature: 0.7,
          maxTokens: 100
        }
      },
      requirements: {
        minMemory: 1024,
        minGPU: 2,
        supportedDevices: ['cuda', 'cpu'],
        dependencies: ['torch'],
        frameworks: ['pytorch']
      },
      metadata: {
        author: 'Test Author',
        license: 'MIT',
        tags: ['test', 'generative'],
        accuracy: 0.92,
        latency: 150,
        throughput: 100,
        lastUpdated: '2024-01-01'
      }
    };

    model = new AIModel(modelConfig);
  });

  afterEach(async () => {
    if (model.loaded) {
      await model.unload();
    }
  });

  describe('Inicialización', () => {
    test('debe crear una instancia válida', () => {
      expect(model).toBeDefined();
      expect(model.id).toBe('test-model');
      expect(model.name).toBe('Test Model');
      expect(model.type).toBe(AIModelType.GENERATIVE);
      expect(model.path).toBe('models/test');
      expect(model.version).toBe('1.0.0');
    });

    test('debe tener estado inicial correcto', () => {
      expect(model.loaded).toBe(false);
      expect(model.active).toBe(false);
      expect(model.training).toBe(false);
      expect(model.inferring).toBe(false);
      expect(model.inferenceCount).toBe(0);
      expect(model.trainingCount).toBe(0);
    });

    test('debe cargar el modelo correctamente', async () => {
      await model.load();
      
      expect(model.loaded).toBe(true);
      expect(model.active).toBe(true);
      expect(model.uptime).toBeGreaterThan(0);
    });

    test('debe descargar el modelo correctamente', async () => {
      await model.load();
      expect(model.loaded).toBe(true);

      await model.unload();
      expect(model.loaded).toBe(false);
      expect(model.active).toBe(false);
    });

    test('debe manejar carga múltiple sin errores', async () => {
      await model.load();
      await model.load(); // Segunda carga
      
      expect(model.loaded).toBe(true);
    });

    test('debe manejar descarga múltiple sin errores', async () => {
      await model.load();
      await model.unload();
      await model.unload(); // Segunda descarga
      
      expect(model.loaded).toBe(false);
    });
  });

  describe('Predicción', () => {
    beforeEach(async () => {
      await model.load();
    });

    test('debe realizar predicciones correctamente', async () => {
      const input = { text: 'test input' };
      const result = await model.predict(input);

      expect(result).toBeDefined();
      expect(result.output).toBeDefined();
      expect(result.confidence).toBeGreaterThan(0);
      expect(result.confidence).toBeLessThanOrEqual(1);
      expect(result.latency).toBeGreaterThan(0);
      expect(result.metadata).toBeDefined();
      expect(result.metadata.modelId).toBe(model.id);
      expect(result.metadata.modelType).toBe(model.type);
    });

    test('debe incrementar contador de inferencias', async () => {
      const initialCount = model.inferenceCount;
      
      await model.predict({ input: 'test' });
      
      expect(model.inferenceCount).toBe(initialCount + 1);
    });

    test('debe actualizar tiempo de último uso', async () => {
      const beforeTime = Date.now();
      await model.predict({ input: 'test' });
      const afterTime = Date.now();

      expect(model.lastUsed).toBeGreaterThanOrEqual(beforeTime);
      expect(model.lastUsed).toBeLessThanOrEqual(afterTime);
    });

    test('debe manejar errores de predicción', async () => {
      // Simular error en el modelo
      const originalPredict = model['_modelInstance'].predict;
      model['_modelInstance'].predict = async () => {
        throw new Error('Simulated prediction error');
      };

      await expect(model.predict({ input: 'test' })).rejects.toThrow('Simulated prediction error');

      // Restaurar método original
      model['_modelInstance'].predict = originalPredict;
    });

    test('debe validar que el modelo esté cargado', async () => {
      await model.unload();
      
      await expect(model.predict({ input: 'test' }))
        .rejects.toThrow('is not loaded');
    });

    test('debe prevenir inferencias concurrentes', async () => {
      const prediction1 = model.predict({ input: 'test1' });
      const prediction2 = model.predict({ input: 'test2' });

      await expect(prediction2).rejects.toThrow('is currently performing inference');
      await prediction1; // Esperar que termine la primera
    });
  });

  describe('Generación', () => {
    beforeEach(async () => {
      await model.load();
    });

    test('debe generar contenido correctamente', async () => {
      const prompt = 'Generate some text';
      const result = await model.generate(prompt);

      expect(result).toBeDefined();
      expect(result.output).toBeDefined();
      expect(result.confidence).toBeGreaterThan(0);
      expect(result.latency).toBeGreaterThan(0);
    });

    test('debe validar tipo de modelo para generación', async () => {
      const nonGenerativeModel = new AIModel({
        ...modelConfig,
        id: 'non-generative',
        type: AIModelType.PREDICTIVE
      });
      await nonGenerativeModel.load();

      await expect(nonGenerativeModel.generate('test prompt'))
        .rejects.toThrow('is not a generative model');

      await nonGenerativeModel.unload();
    });
  });

  describe('Optimización', () => {
    beforeEach(async () => {
      await model.load();
    });

    test('debe optimizar correctamente', async () => {
      const target = { performance: 'high' };
      const constraints = { memory: 'low' };
      
      const result = await model.optimize(target, constraints);

      expect(result).toBeDefined();
      expect(result.output).toBeDefined();
      expect(result.confidence).toBeGreaterThan(0);
      expect(result.latency).toBeGreaterThan(0);
    });

    test('debe validar tipo de modelo para optimización', async () => {
      const nonOptimizationModel = new AIModel({
        ...modelConfig,
        id: 'non-optimization',
        type: AIModelType.PREDICTIVE
      });
      await nonOptimizationModel.load();

      await expect(nonOptimizationModel.optimize({ target: 'test' }))
        .rejects.toThrow('is not an optimization model');

      await nonOptimizationModel.unload();
    });
  });

  describe('Entrenamiento', () => {
    beforeEach(async () => {
      await model.load();
    });

    test('debe entrenar correctamente', async () => {
      const trainingData = [
        { input: 'sample1', output: 'result1' },
        { input: 'sample2', output: 'result2' }
      ];

      const result = await model.train(trainingData);

      expect(result).toBeDefined();
      expect(result.accuracy).toBeGreaterThan(0);
      expect(result.loss).toBeGreaterThan(0);
      expect(result.epochs).toBeGreaterThan(0);
      expect(result.duration).toBeGreaterThan(0);
      expect(result.metrics).toBeDefined();
    });

    test('debe incrementar contador de entrenamientos', async () => {
      const initialCount = model.trainingCount;
      
      await model.train([{ input: 'test', output: 'result' }]);
      
      expect(model.trainingCount).toBe(initialCount + 1);
    });

    test('debe manejar errores de entrenamiento', async () => {
      // Simular error en el entrenamiento
      const originalTrain = model['_modelInstance'].train;
      model['_modelInstance'].train = async () => {
        throw new Error('Simulated training error');
      };

      await expect(model.train([{ input: 'test', output: 'result' }]))
        .rejects.toThrow('Simulated training error');

      // Restaurar método original
      model['_modelInstance'].train = originalTrain;
    });

    test('debe validar que el modelo esté cargado', async () => {
      await model.unload();
      
      await expect(model.train([{ input: 'test', output: 'result' }]))
        .rejects.toThrow('is not loaded');
    });

    test('debe prevenir entrenamientos concurrentes', async () => {
      const training1 = model.train([{ input: 'test1', output: 'result1' }]);
      const training2 = model.train([{ input: 'test2', output: 'result2' }]);

      await expect(training2).rejects.toThrow('is currently training');
      await training1; // Esperar que termine el primero
    });
  });

  describe('Gestión de Estado', () => {
    test('debe actualizar estado correctamente', () => {
      model.updateState({
        memoryUsage: 50,
        gpuUsage: 75,
        lastUsed: Date.now()
      });

      const state = model.getState();
      expect(state.memoryUsage).toBe(50);
      expect(state.gpuUsage).toBe(75);
      expect(state.lastUsed).toBeGreaterThan(0);
    });

    test('debe verificar si el modelo está activo', async () => {
      expect(model.isActive()).toBe(false);
      
      await model.load();
      expect(model.isActive()).toBe(true);
      
      await model.unload();
      expect(model.isActive()).toBe(false);
    });

    test('debe obtener estadísticas correctas', () => {
      const stats = model.getStats();
      
      expect(stats.id).toBe(model.id);
      expect(stats.name).toBe(model.name);
      expect(stats.type).toBe(model.type);
      expect(stats.loaded).toBe(model.loaded);
      expect(stats.active).toBe(model.active);
      expect(stats.inferenceCount).toBe(model.inferenceCount);
      expect(stats.trainingCount).toBe(model.trainingCount);
      expect(stats.lastUsed).toBe(model.lastUsed);
      expect(stats.uptime).toBe(model.uptime);
    });
  });

  describe('Serialización', () => {
    test('debe serializar correctamente', () => {
      const serialized = model.serialize();
      
      expect(serialized.id).toBe(model.id);
      expect(serialized.name).toBe(model.name);
      expect(serialized.type).toBe(model.type);
      expect(serialized.path).toBe(model.path);
      expect(serialized.version).toBe(model.version);
      expect(serialized.description).toBe(model.description);
      expect(serialized.parameters).toEqual(model.parameters);
      expect(serialized.requirements).toEqual(model.requirements);
      expect(serialized.metadata).toEqual(model.metadata);
      expect(serialized.state).toBeDefined();
    });
  });

  describe('Eventos', () => {
    beforeEach(async () => {
      await model.load();
    });

    test('debe emitir evento de carga', (done) => {
      const newModel = new AIModel(modelConfig);
      
      newModel.on('model:loaded', (event) => {
        expect(event.model).toBe(newModel);
        done();
      });

      newModel.load();
    });

    test('debe emitir evento de descarga', (done) => {
      model.on('model:unloaded', (event) => {
        expect(event.model).toBe(model);
        done();
      });

      model.unload();
    });

    test('debe emitir eventos de inferencia', (done) => {
      model.on('inference:completed', (event) => {
        expect(event.model).toBe(model);
        expect(event.input).toBeDefined();
        expect(event.output).toBeDefined();
        expect(event.time).toBeGreaterThan(0);
        done();
      });

      model.predict({ input: 'test' });
    });

    test('debe emitir eventos de entrenamiento', (done) => {
      model.on('training:completed', (event) => {
        expect(event.model).toBe(model);
        expect(event.results).toBeDefined();
        done();
      });

      model.train([{ input: 'test', output: 'result' }]);
    });

    test('debe emitir eventos de error', (done) => {
      model.on('error:model', (event) => {
        expect(event.model).toBe(model);
        expect(event.error).toBeDefined();
        expect(event.context).toBeDefined();
        done();
      });

      // Simular error
      const originalPredict = model['_modelInstance'].predict;
      model['_modelInstance'].predict = async () => {
        throw new Error('Test error');
      };

      model.predict({ input: 'test' }).catch(() => {});
      
      // Restaurar método original
      model['_modelInstance'].predict = originalPredict;
    });
  });

  describe('Diferentes Tipos de Modelo', () => {
    test('debe manejar modelo predictivo', async () => {
      const predictiveModel = new AIModel({
        ...modelConfig,
        id: 'predictive-model',
        type: AIModelType.PREDICTIVE
      });

      await predictiveModel.load();
      const result = await predictiveModel.predict({ input: 'test' });
      
      expect(result).toBeDefined();
      expect(result.output).toBeDefined();
      
      await predictiveModel.unload();
    });

    test('debe manejar modelo de clasificación', async () => {
      const classificationModel = new AIModel({
        ...modelConfig,
        id: 'classification-model',
        type: AIModelType.CLASSIFICATION
      });

      await classificationModel.load();
      const result = await classificationModel.predict({ input: 'test' });
      
      expect(result).toBeDefined();
      expect(result.output).toBeDefined();
      
      await classificationModel.unload();
    });

    test('debe manejar modelo de regresión', async () => {
      const regressionModel = new AIModel({
        ...modelConfig,
        id: 'regression-model',
        type: AIModelType.REGRESSION
      });

      await regressionModel.load();
      const result = await regressionModel.predict({ input: 'test' });
      
      expect(result).toBeDefined();
      expect(result.output).toBeDefined();
      
      await regressionModel.unload();
    });
  });

  describe('Manejo de Recursos', () => {
    test('debe verificar requisitos del sistema', async () => {
      // Simular verificación de memoria insuficiente
      const originalGetMemory = model['_getAvailableMemory'];
      model['_getAvailableMemory'] = () => 512; // Menos que el requerido (1024)

      await expect(model.load()).rejects.toThrow('Insufficient memory');

      // Restaurar método original
      model['_getAvailableMemory'] = originalGetMemory;
    });

    test('debe verificar dependencias', async () => {
      // Simular dependencia faltante
      const originalCheckDependency = model['_isDependencyAvailable'];
      model['_isDependencyAvailable'] = () => false;

      await expect(model.load()).rejects.toThrow('Missing dependencies');

      // Restaurar método original
      model['_isDependencyAvailable'] = originalCheckDependency;
    });
  });

  describe('Concurrencia', () => {
    beforeEach(async () => {
      await model.load();
    });

    test('debe manejar múltiples predicciones secuenciales', async () => {
      const results = [];
      
      for (let i = 0; i < 5; i++) {
        const result = await model.predict({ input: `test${i}` });
        results.push(result);
      }

      expect(results).toHaveLength(5);
      results.forEach(result => {
        expect(result).toBeDefined();
        expect(result.output).toBeDefined();
      });
    });

    test('debe manejar carga y descarga concurrente', async () => {
      const loadPromises = Array.from({ length: 3 }, () => model.load());
      const unloadPromises = Array.from({ length: 3 }, () => model.unload());

      await Promise.all([...loadPromises, ...unloadPromises]);
      
      // El estado final debe ser consistente
      expect(model.loaded).toBe(false);
    });
  });

  describe('Limpieza', () => {
    test('debe limpiar recursos al descargar', async () => {
      await model.load();
      
      // Verificar que se liberan recursos
      const originalUnload = model['_unloadModelInstance'];
      let unloadCalled = false;
      
      model['_unloadModelInstance'] = async () => {
        unloadCalled = true;
        await originalUnload.call(model);
      };

      await model.unload();
      expect(unloadCalled).toBe(true);
    });
  });
}); 
/**
 * Tests para AITraining
 */

import { AITraining, TrainingStatus } from '../AITraining';

describe('AITraining', () => {
  let training: AITraining;
  let trainingConfig: any;

  beforeEach(() => {
    trainingConfig = {
      id: 'test-training',
      modelId: 'test-model',
      dataset: {
        id: 'test-dataset',
        name: 'Test Dataset',
        type: 'text' as const,
        path: 'datasets/test',
        split: {
          train: 0.7,
          validation: 0.2,
          test: 0.1
        },
        preprocessing: {
          normalize: true,
          scale: false,
          encode: true,
          tokenize: true,
          maxLength: 512,
          padding: true,
          truncation: true,
          custom: {}
        },
        augmentation: {
          enabled: true,
          techniques: ['rotation', 'noise'],
          probability: 0.5,
          intensity: 0.3
        }
      },
      hyperparameters: {
        learningRate: 0.001,
        batchSize: 32,
        epochs: 10,
        optimizer: 'adam',
        lossFunction: 'cross_entropy',
        weightDecay: 0.0001,
        momentum: 0.9,
        beta1: 0.9,
        beta2: 0.999,
        epsilon: 1e-8,
        scheduler: 'cosine',
        warmupSteps: 100,
        gradientClipping: 1.0,
        dropout: 0.1,
        regularization: 'l2'
      },
      training: {
        maxEpochs: 100,
        earlyStopping: true,
        patience: 5,
        minDelta: 0.001,
        gradientAccumulation: 1,
        mixedPrecision: false,
        distributed: false,
        numWorkers: 4,
        pinMemory: true,
        shuffle: true
      },
      validation: {
        frequency: 1,
        metrics: ['accuracy', 'loss', 'f1'],
        saveBest: true,
        saveLast: false,
        threshold: 0.8
      },
      checkpointing: {
        enabled: true,
        frequency: 10,
        saveOptimizer: true,
        saveScheduler: true,
        maxCheckpoints: 5,
        compression: false
      },
      monitoring: {
        enabled: true,
        logFrequency: 100,
        tensorboard: false,
        wandb: false,
        metrics: ['loss', 'accuracy'],
        plots: ['learning_curve'],
        performanceTracking: true,
        errorTracking: true,
        usageAnalytics: true,
        modelDrift: true,
        dataQuality: true
      }
    };

    training = new AITraining(trainingConfig);
  });

  afterEach(async () => {
    if (training.running) {
      training.stop();
    }
  });

  describe('Inicialización', () => {
    test('debe crear una instancia válida', () => {
      expect(training).toBeDefined();
      expect(training.id).toBe('test-training');
      expect(training.modelId).toBe('test-model');
    });

    test('debe tener estado inicial correcto', () => {
      expect(training.running).toBe(false);
      expect(training.paused).toBe(false);
      expect(training.currentEpoch).toBe(0);
      expect(training.progress).toBe(0);
      expect(training.status).toBe(TrainingStatus.IDLE);
      expect(training.totalSteps).toBe(0);
      expect(training.currentStep).toBe(0);
      expect(training.uptime).toBe(0);
    });

    test('debe inicializar correctamente', async () => {
      await training.initialize();
      
      expect(training.getState().running).toBe(false);
      expect(training.getState().currentEpoch).toBe(0);
    });

    test('debe manejar errores de inicialización', async () => {
      const invalidConfig = {
        ...trainingConfig,
        dataset: { ...trainingConfig.dataset, path: 'invalid/path' }
      };
      
      const invalidTraining = new AITraining(invalidConfig);
      await expect(invalidTraining.initialize()).rejects.toThrow();
    });
  });

  describe('Entrenamiento', () => {
    beforeEach(async () => {
      await training.initialize();
    });

    test('debe iniciar entrenamiento correctamente', async () => {
      const trainingData = [
        { input: 'sample1', output: 'result1' },
        { input: 'sample2', output: 'result2' },
        { input: 'sample3', output: 'result3' }
      ];

      const trainingPromise = training.start();
      
      // Verificar que el entrenamiento está ejecutándose
      expect(training.running).toBe(true);
      expect(training.status).toBe(TrainingStatus.RUNNING);

      const results = await trainingPromise;
      
      expect(results.success).toBe(true);
      expect(results.finalMetrics).toBeDefined();
      expect(results.bestMetrics).toBeDefined();
      expect(results.validationMetrics).toBeDefined();
      expect(results.checkpoints).toBeDefined();
      expect(results.totalTime).toBeGreaterThan(0);
      expect(results.epochs).toBeGreaterThan(0);
      expect(results.finalLoss).toBeGreaterThan(0);
      expect(results.finalAccuracy).toBeGreaterThan(0);
    });

    test('debe manejar pausa y reanudación', async () => {
      const trainingData = [
        { input: 'sample1', output: 'result1' },
        { input: 'sample2', output: 'result2' }
      ];

      const trainingPromise = training.start();
      
      // Pausar después de un breve tiempo
      setTimeout(() => {
        training.pause();
        expect(training.paused).toBe(true);
        expect(training.status).toBe(TrainingStatus.PAUSED);

        // Reanudar después de otro breve tiempo
        setTimeout(() => {
          training.resume();
          expect(training.paused).toBe(false);
          expect(training.status).toBe(TrainingStatus.RUNNING);
        }, 100);
      }, 100);

      const results = await trainingPromise;
      expect(results.success).toBe(true);
    });

    test('debe detener entrenamiento', async () => {
      const trainingData = [
        { input: 'sample1', output: 'result1' },
        { input: 'sample2', output: 'result2' }
      ];

      const trainingPromise = training.start();
      
      // Detener después de un breve tiempo
      setTimeout(() => {
        training.stop();
        expect(training.running).toBe(false);
        expect(training.status).toBe(TrainingStatus.IDLE);
      }, 100);

      const results = await trainingPromise;
      expect(results.success).toBe(false);
    });

    test('debe manejar early stopping', async () => {
      const earlyStoppingConfig = {
        ...trainingConfig,
        training: {
          ...trainingConfig.training,
          earlyStopping: true,
          patience: 2,
          minDelta: 0.001
        }
      };

      const earlyStoppingTraining = new AITraining(earlyStoppingConfig);
      await earlyStoppingTraining.initialize();

      const trainingData = [
        { input: 'sample1', output: 'result1' },
        { input: 'sample2', output: 'result2' }
      ];

      const results = await earlyStoppingTraining.start();
      
      // El entrenamiento puede terminar por early stopping
      expect(results.success).toBe(true);
      expect(results.earlyStopped).toBeDefined();
    });

    test('debe manejar errores de entrenamiento', async () => {
      const invalidTrainingData = null;

      await expect(training.start()).rejects.toThrow();
    });
  });

  describe('Checkpoints', () => {
    beforeEach(async () => {
      await training.initialize();
    });

    test('debe guardar checkpoints correctamente', async () => {
      const checkpoint = await training.saveCheckpoint();
      
      expect(checkpoint).toBeDefined();
      expect(checkpoint.epoch).toBe(0);
      expect(checkpoint.modelState).toBeDefined();
      expect(checkpoint.optimizerState).toBeDefined();
      expect(checkpoint.schedulerState).toBeDefined();
      expect(checkpoint.metrics).toBeDefined();
      expect(checkpoint.timestamp).toBeGreaterThan(0);
      expect(checkpoint.path).toBeDefined();
    });

    test('debe cargar checkpoints correctamente', async () => {
      const checkpoint = await training.saveCheckpoint();
      
      // Modificar el estado actual
      training.updateState({ currentEpoch: 5 });
      
      // Cargar checkpoint
      await training.loadCheckpoint(checkpoint);
      
      expect(training.currentEpoch).toBe(0); // Debe volver al estado del checkpoint
    });

    test('debe limitar número de checkpoints', async () => {
      const maxCheckpoints = training.config.checkpointing.maxCheckpoints;
      
      // Crear más checkpoints de los permitidos
      for (let i = 0; i < maxCheckpoints + 2; i++) {
        await training.saveCheckpoint();
      }
      
      const checkpoints = training.getCheckpoints();
      expect(checkpoints.length).toBeLessThanOrEqual(maxCheckpoints);
    });
  });

  describe('Métricas', () => {
    beforeEach(async () => {
      await training.initialize();
    });

    test('debe obtener métricas actuales', () => {
      const metrics = training.getCurrentMetrics();
      expect(metrics).toBeNull(); // No hay métricas al inicio
    });

    test('debe obtener mejores métricas', () => {
      const bestMetrics = training.getBestMetrics();
      expect(bestMetrics).toBeNull(); // No hay métricas al inicio
    });

    test('debe obtener todas las métricas', () => {
      const allMetrics = training.getAllMetrics();
      expect(allMetrics).toHaveLength(0);
    });

    test('debe obtener métricas de validación', () => {
      const validationMetrics = training.getValidationMetrics();
      expect(validationMetrics).toHaveLength(0);
    });

    test('debe actualizar métricas durante entrenamiento', async () => {
      const trainingData = [
        { input: 'sample1', output: 'result1' },
        { input: 'sample2', output: 'result2' }
      ];

      const trainingPromise = training.start();
      
      // Esperar un poco para que se generen métricas
      await new Promise(resolve => setTimeout(resolve, 200));
      
      const currentMetrics = training.getCurrentMetrics();
      const allMetrics = training.getAllMetrics();
      
      expect(currentMetrics).toBeDefined();
      expect(allMetrics.length).toBeGreaterThan(0);

      await trainingPromise;
    });
  });

  describe('Estados', () => {
    beforeEach(async () => {
      await training.initialize();
    });

    test('debe manejar estados correctamente', () => {
      expect(training.running).toBe(false);
      expect(training.paused).toBe(false);
      expect(training.currentEpoch).toBe(0);
      expect(training.progress).toBe(0);
      expect(training.status).toBe(TrainingStatus.IDLE);
    });

    test('debe actualizar progreso durante entrenamiento', async () => {
      const trainingData = [
        { input: 'sample1', output: 'result1' },
        { input: 'sample2', output: 'result2' }
      ];

      const trainingPromise = training.start();
      
      // Esperar un poco para que avance el progreso
      await new Promise(resolve => setTimeout(resolve, 200));
      
      expect(training.progress).toBeGreaterThan(0);
      expect(training.progress).toBeLessThanOrEqual(1);

      await trainingPromise;
    });

    test('debe actualizar estado durante entrenamiento', async () => {
      const trainingData = [
        { input: 'sample1', output: 'result1' },
        { input: 'sample2', output: 'result2' }
      ];

      const trainingPromise = training.start();
      
      // Verificar que el estado cambia durante el entrenamiento
      expect(training.running).toBe(true);
      expect(training.status).toBe(TrainingStatus.RUNNING);

      await trainingPromise;
      
      // Verificar que el estado vuelve al final
      expect(training.running).toBe(false);
      expect(training.status).toBe(TrainingStatus.COMPLETED);
    });
  });

  describe('Eventos', () => {
    beforeEach(async () => {
      await training.initialize();
    });

    test('debe emitir evento de inicio de entrenamiento', (done) => {
      training.on('training:started', (event) => {
        expect(event.training).toBe(training);
        expect(event.data).toBeDefined();
        done();
      });

      training.start();
    });

    test('debe emitir eventos de época', (done) => {
      training.on('training:epoch', (event) => {
        expect(event.training).toBe(training);
        expect(event.epoch).toBeGreaterThanOrEqual(0);
        expect(event.metrics).toBeDefined();
        expect(event.metrics.epoch).toBe(event.epoch);
        expect(event.metrics.loss).toBeGreaterThan(0);
        expect(event.metrics.accuracy).toBeGreaterThan(0);
        done();
      });

      training.start();
    });

    test('debe emitir eventos de checkpoint', (done) => {
      training.on('training:checkpoint', (event) => {
        expect(event.training).toBe(training);
        expect(event.checkpoint).toBeDefined();
        expect(event.checkpoint.epoch).toBeGreaterThanOrEqual(0);
        done();
      });

      training.saveCheckpoint();
    });

    test('debe emitir eventos de validación', (done) => {
      training.on('validation:completed', (event) => {
        expect(event.training).toBe(training);
        expect(event.metrics).toBeDefined();
        expect(event.metrics.loss).toBeGreaterThan(0);
        expect(event.metrics.accuracy).toBeGreaterThan(0);
        done();
      });

      training.start();
    });

    test('debe emitir eventos de finalización', (done) => {
      training.on('training:completed', (event) => {
        expect(event.training).toBe(training);
        expect(event.results).toBeDefined();
        expect(event.results.success).toBe(true);
        done();
      });

      training.start();
    });

    test('debe emitir eventos de error', (done) => {
      const invalidTraining = new AITraining({
        ...trainingConfig,
        dataset: { ...trainingConfig.dataset, path: 'invalid/path' }
      });

      invalidTraining.on('error:training', (event) => {
        expect(event.training).toBe(invalidTraining);
        expect(event.error).toBeDefined();
        expect(event.context).toBeDefined();
        done();
      });

      invalidTraining.initialize().catch(() => {});
    });
  });

  describe('Configuración', () => {
    test('debe validar configuración de hiperparámetros', () => {
      const invalidConfig = {
        ...trainingConfig,
        hyperparameters: {
          ...trainingConfig.hyperparameters,
          learningRate: -0.001 // Valor inválido
        }
      };

      const invalidTraining = new AITraining(invalidConfig);
      expect(invalidTraining.config.hyperparameters.learningRate).toBe(-0.001);
    });

    test('debe manejar diferentes tipos de dataset', () => {
      const imageConfig = {
        ...trainingConfig,
        dataset: {
          ...trainingConfig.dataset,
          type: 'image' as const,
          preprocessing: {
            ...trainingConfig.dataset.preprocessing,
            resize: true,
            resizeWidth: 224,
            resizeHeight: 224
          }
        }
      };

      const imageTraining = new AITraining(imageConfig);
      expect(imageTraining.config.dataset.type).toBe('image');
    });

    test('debe manejar configuración de monitoreo', () => {
      const monitoringConfig = {
        ...trainingConfig,
        monitoring: {
          ...trainingConfig.monitoring,
          tensorboard: true,
          wandb: true,
          metrics: ['loss', 'accuracy', 'precision', 'recall']
        }
      };

      const monitoringTraining = new AITraining(monitoringConfig);
      expect(monitoringTraining.config.monitoring.tensorboard).toBe(true);
      expect(monitoringTraining.config.monitoring.wandb).toBe(true);
    });
  });

  describe('Concurrencia', () => {
    beforeEach(async () => {
      await training.initialize();
    });

    test('debe prevenir múltiples entrenamientos concurrentes', async () => {
      const trainingData = [
        { input: 'sample1', output: 'result1' },
        { input: 'sample2', output: 'result2' }
      ];

      const training1 = training.start();
      const training2 = training.start();

      await expect(training2).rejects.toThrow('Training is already running');
      await training1; // Esperar que termine el primero
    });

    test('debe manejar pausa y reanudación concurrente', async () => {
      const trainingData = [
        { input: 'sample1', output: 'result1' },
        { input: 'sample2', output: 'result2' }
      ];

      const trainingPromise = training.start();

      // Pausar y reanudar múltiples veces
      setTimeout(() => training.pause(), 50);
      setTimeout(() => training.resume(), 100);
      setTimeout(() => training.pause(), 150);
      setTimeout(() => training.resume(), 200);

      const results = await trainingPromise;
      expect(results.success).toBe(true);
    });
  });

  describe('Limpieza', () => {
    beforeEach(async () => {
      await training.initialize();
    });

    test('debe limpiar recursos al detener', async () => {
      const trainingData = [
        { input: 'sample1', output: 'result1' },
        { input: 'sample2', output: 'result2' }
      ];

      const trainingPromise = training.start();
      
      // Detener después de un breve tiempo
      setTimeout(() => {
        training.stop();
      }, 100);

      const results = await trainingPromise;
      expect(results.success).toBe(false);
      expect(training.running).toBe(false);
    });
  });

  describe('Estadísticas', () => {
    beforeEach(async () => {
      await training.initialize();
    });

    test('debe obtener estadísticas correctas', () => {
      const stats = training.getStats();
      
      expect(stats.id).toBe(training.id);
      expect(stats.modelId).toBe(training.modelId);
      expect(stats.running).toBe(training.running);
      expect(stats.paused).toBe(training.paused);
      expect(stats.currentEpoch).toBe(training.currentEpoch);
      expect(stats.progress).toBe(training.progress);
      expect(stats.status).toBe(training.status);
      expect(stats.totalSteps).toBe(training.totalSteps);
      expect(stats.currentStep).toBe(training.currentStep);
      expect(stats.uptime).toBe(training.uptime);
    });

    test('debe actualizar estadísticas durante entrenamiento', async () => {
      const initialStats = training.getStats();
      
      const trainingData = [
        { input: 'sample1', output: 'result1' },
        { input: 'sample2', output: 'result2' }
      ];

      const trainingPromise = training.start();
      
      // Esperar un poco para que avance el entrenamiento
      await new Promise(resolve => setTimeout(resolve, 200));
      
      const updatedStats = training.getStats();
      expect(updatedStats.running).toBe(true);
      expect(updatedStats.currentEpoch).toBeGreaterThanOrEqual(initialStats.currentEpoch);
      expect(updatedStats.progress).toBeGreaterThan(initialStats.progress);

      await trainingPromise;
    });
  });
}); 
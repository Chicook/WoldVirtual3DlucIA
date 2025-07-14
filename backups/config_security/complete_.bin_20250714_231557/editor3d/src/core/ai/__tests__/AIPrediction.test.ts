/**
 * Tests para AIPrediction
 */

import { AIPrediction, PredictionType, ConfidenceMethod } from '../AIPrediction';

describe('AIPrediction', () => {
  let prediction: AIPrediction;
  let predictionConfig: any;

  beforeEach(() => {
    predictionConfig = {
      id: 'test-prediction',
      modelId: 'test-model',
      type: 'classification' as const,
      inputSchema: {
        type: 'object',
        properties: {
          text: { type: 'string', maxLength: 1000 },
          features: { type: 'array', items: { type: 'number' } }
        },
        required: ['text']
      },
      outputSchema: {
        type: 'object',
        properties: {
          prediction: { type: 'string' },
          confidence: { type: 'number' },
          probabilities: { type: 'array', items: { type: 'number' } }
        }
      },
      preprocessing: {
        normalize: true,
        scale: true,
        encode: true,
        tokenize: true,
        maxLength: 512,
        padding: true,
        truncation: true,
        custom: {
          language: 'en',
          removeStopWords: true
        }
      },
      postprocessing: {
        threshold: 0.5,
        topK: 3,
        softmax: true,
        sigmoid: false,
        denormalize: false,
        decode: true,
        format: 'json',
        custom: {
          confidenceThreshold: 0.8
        }
      },
      confidence: {
        enabled: true,
        method: 'softmax' as ConfidenceMethod,
        threshold: 0.8,
        uncertainty: true,
        calibration: false
      },
      caching: {
        enabled: true,
        size: 1000,
        ttl: 3600000,
        keyFunction: 'hash'
      },
      batching: {
        enabled: true,
        maxSize: 32,
        timeout: 5000,
        dynamic: true
      }
    };

    prediction = new AIPrediction(predictionConfig);
  });

  afterEach(async () => {
    if (prediction.getState().running) {
      // Limpiar cualquier operación en curso
      prediction.clearCache();
    }
  });

  describe('Inicialización', () => {
    test('debe crear una instancia válida', () => {
      expect(prediction).toBeDefined();
      expect(prediction.id).toBe('test-prediction');
      expect(prediction.modelId).toBe('test-model');
      expect(prediction.type).toBe(PredictionType.CLASSIFICATION);
    });

    test('debe tener estado inicial correcto', () => {
      const state = prediction.getState();
      expect(state.running).toBe(false);
      expect(state.streaming).toBe(false);
      expect(state.progress).toBe(0);
      expect(state.currentBatch).toBe(0);
      expect(state.totalBatches).toBe(0);
      expect(state.processedItems).toBe(0);
      expect(state.totalItems).toBe(0);
      expect(state.errors).toHaveLength(0);
      expect(state.cache.size).toBe(0);
    });

    test('debe inicializar correctamente', async () => {
      await prediction.initialize();
      
      const state = prediction.getState();
      expect(state.running).toBe(false);
      expect(state.cache.size).toBe(0);
    });

    test('debe manejar errores de inicialización', async () => {
      const invalidConfig = {
        ...predictionConfig,
        modelId: 'invalid-model'
      };
      
      const invalidPrediction = new AIPrediction(invalidConfig);
      await expect(invalidPrediction.initialize()).rejects.toThrow();
    });
  });

  describe('Predicción Individual', () => {
    beforeEach(async () => {
      await prediction.initialize();
    });

    test('debe realizar predicción correctamente', async () => {
      const input = { text: 'test input', features: [1, 2, 3] };
      const result = await prediction.predict(input);

      expect(result).toBeDefined();
      expect(result.prediction).toBeDefined();
      expect(result.confidence).toBeGreaterThan(0);
      expect(result.confidence).toBeLessThanOrEqual(1);
      expect(result.probabilities).toBeDefined();
      expect(result.metadata).toBeDefined();
      expect(result.metadata.modelId).toBe(prediction.modelId);
      expect(result.metadata.predictionType).toBe(prediction.type);
      expect(result.metadata.inputSize).toBeGreaterThan(0);
      expect(result.metadata.outputSize).toBeGreaterThan(0);
      expect(result.metadata.preprocessingTime).toBeGreaterThan(0);
      expect(result.metadata.inferenceTime).toBeGreaterThan(0);
      expect(result.metadata.postprocessingTime).toBeGreaterThan(0);
      expect(result.metadata.totalTime).toBeGreaterThan(0);
      expect(result.metadata.cacheHit).toBe(false);
      expect(result.timestamp).toBeGreaterThan(0);
    });

    test('debe usar cache cuando está habilitado', async () => {
      const input = { text: 'cache test', features: [1, 2, 3] };
      
      // Primera predicción
      const result1 = await prediction.predict(input);
      expect(result1.metadata.cacheHit).toBe(false);

      // Segunda predicción (debe usar cache)
      const result2 = await prediction.predict(input);
      expect(result2.metadata.cacheHit).toBe(true);
    });

    test('debe manejar diferentes tipos de entrada', async () => {
      const textInput = { text: 'text only input' };
      const featureInput = { features: [1, 2, 3, 4, 5] };
      const mixedInput = { text: 'mixed input', features: [1, 2, 3] };

      const textResult = await prediction.predict(textInput);
      const featureResult = await prediction.predict(featureInput);
      const mixedResult = await prediction.predict(mixedInput);

      expect(textResult).toBeDefined();
      expect(featureResult).toBeDefined();
      expect(mixedResult).toBeDefined();
    });

    test('debe manejar errores de predicción', async () => {
      const invalidInput = null;

      await expect(prediction.predict(invalidInput as any))
        .rejects.toThrow();
    });

    test('debe validar entrada según schema', async () => {
      const invalidInput = { invalidField: 'test' };

      await expect(prediction.predict(invalidInput))
        .rejects.toThrow('Input validation failed');
    });

    test('debe manejar opciones de predicción', async () => {
      const input = { text: 'test with options' };
      const options = {
        temperature: 0.7,
        topK: 5,
        threshold: 0.8
      };

      const result = await prediction.predict(input, options);
      expect(result).toBeDefined();
      expect(result.metadata.parameters).toBeDefined();
    });
  });

  describe('Predicción por Lotes', () => {
    beforeEach(async () => {
      await prediction.initialize();
    });

    test('debe realizar predicción por lotes correctamente', async () => {
      const inputs = [
        { text: 'input 1', features: [1, 2, 3] },
        { text: 'input 2', features: [4, 5, 6] },
        { text: 'input 3', features: [7, 8, 9] }
      ];

      const result = await prediction.predictBatch(inputs);

      expect(result).toBeDefined();
      expect(result.results).toHaveLength(inputs.length);
      expect(result.batchSize).toBe(inputs.length);
      expect(result.totalTime).toBeGreaterThan(0);
      expect(result.averageTime).toBeGreaterThan(0);
      expect(result.successCount).toBe(inputs.length);
      expect(result.errorCount).toBe(0);
      expect(result.errors).toHaveLength(0);

      result.results.forEach(predictionResult => {
        expect(predictionResult).toBeDefined();
        expect(predictionResult.prediction).toBeDefined();
        expect(predictionResult.confidence).toBeGreaterThan(0);
        expect(predictionResult.metadata.batchIndex).toBeDefined();
      });
    });

    test('debe manejar errores en lotes', async () => {
      const inputs = [
        { text: 'valid input 1' },
        null, // Entrada inválida
        { text: 'valid input 2' }
      ];

      const result = await prediction.predictBatch(inputs);

      expect(result.successCount).toBe(2);
      expect(result.errorCount).toBe(1);
      expect(result.errors).toHaveLength(1);
      expect(result.results).toHaveLength(2);
    });

    test('debe respetar tamaño máximo de lote', async () => {
      const largeInputs = Array.from({ length: 100 }, (_, i) => ({
        text: `input ${i}`,
        features: [i, i + 1, i + 2]
      }));

      const result = await prediction.predictBatch(largeInputs);

      expect(result.batchSize).toBe(100);
      expect(result.results).toHaveLength(100);
    });

    test('debe manejar lotes vacíos', async () => {
      const result = await prediction.predictBatch([]);

      expect(result.results).toHaveLength(0);
      expect(result.batchSize).toBe(0);
      expect(result.successCount).toBe(0);
      expect(result.errorCount).toBe(0);
    });
  });

  describe('Cola de Predicciones', () => {
    beforeEach(async () => {
      await prediction.initialize();
    });

    test('debe agregar predicciones a la cola', async () => {
      const input = { text: 'queued prediction' };
      const options = { priority: 'high' };

      const predictionId = await prediction.queuePrediction(input, options);
      expect(predictionId).toBeDefined();
      expect(typeof predictionId).toBe('string');
    });

    test('debe manejar cola cuando batching está deshabilitado', async () => {
      const noBatchConfig = {
        ...predictionConfig,
        batching: {
          enabled: false,
          maxSize: 32,
          timeout: 5000,
          dynamic: false
        }
      };

      const noBatchPrediction = new AIPrediction(noBatchConfig);
      await noBatchPrediction.initialize();

      await expect(noBatchPrediction.queuePrediction({ text: 'test' }))
        .rejects.toThrow('Batching is not enabled');
    });
  });

  describe('Diferentes Tipos de Predicción', () => {
    test('debe manejar predicción de clasificación', async () => {
      const classificationConfig = {
        ...predictionConfig,
        type: 'classification' as const
      };

      const classificationPrediction = new AIPrediction(classificationConfig);
      await classificationPrediction.initialize();

      const result = await classificationPrediction.predict({ text: 'test classification' });
      expect(result.prediction).toBeDefined();
      expect(result.probabilities).toBeDefined();
    });

    test('debe manejar predicción de regresión', async () => {
      const regressionConfig = {
        ...predictionConfig,
        type: 'regression' as const
      };

      const regressionPrediction = new AIPrediction(regressionConfig);
      await regressionPrediction.initialize();

      const result = await regressionPrediction.predict({ features: [1, 2, 3, 4] });
      expect(result.prediction).toBeDefined();
      expect(typeof result.prediction).toBe('number');
    });

    test('debe manejar predicción de forecasting', async () => {
      const forecastingConfig = {
        ...predictionConfig,
        type: 'forecasting' as const
      };

      const forecastingPrediction = new AIPrediction(forecastingConfig);
      await forecastingPrediction.initialize();

      const result = await forecastingPrediction.predict({ 
        timeSeries: [1, 2, 3, 4, 5],
        horizon: 3
      });
      expect(result.prediction).toBeDefined();
      expect(Array.isArray(result.prediction)).toBe(true);
    });

    test('debe manejar detección de anomalías', async () => {
      const anomalyConfig = {
        ...predictionConfig,
        type: 'anomaly' as const
      };

      const anomalyPrediction = new AIPrediction(anomalyConfig);
      await anomalyPrediction.initialize();

      const result = await anomalyPrediction.predict({ data: [1, 2, 3, 100, 4, 5] });
      expect(result.prediction).toBeDefined();
      expect(result.prediction.is_anomaly).toBeDefined();
      expect(result.prediction.anomaly_score).toBeDefined();
    });

    test('debe manejar recomendaciones', async () => {
      const recommendationConfig = {
        ...predictionConfig,
        type: 'recommendation' as const
      };

      const recommendationPrediction = new AIPrediction(recommendationConfig);
      await recommendationPrediction.initialize();

      const result = await recommendationPrediction.predict({ 
        userId: 'user123',
        items: ['item1', 'item2', 'item3']
      });
      expect(result.prediction).toBeDefined();
      expect(result.prediction.recommendations).toBeDefined();
      expect(result.prediction.scores).toBeDefined();
    });
  });

  describe('Procesamiento', () => {
    beforeEach(async () => {
      await prediction.initialize();
    });

    test('debe preprocesar entrada correctamente', async () => {
      const input = { text: 'Test Input Text', features: [1, 2, 3] };
      
      // Simular preprocesamiento
      const processedInput = await prediction['_preprocess'](input);
      
      expect(processedInput).toBeDefined();
      expect(processedInput.normalized).toBe(true);
      expect(processedInput.scaled).toBe(true);
      expect(processedInput.encoded).toBe(true);
    });

    test('debe postprocesar salida correctamente', async () => {
      const rawOutput = {
        logits: [0.1, 0.3, 0.6],
        classes: ['class1', 'class2', 'class3']
      };
      
      const processedOutput = await prediction['_postprocess'](rawOutput);
      
      expect(processedOutput.prediction).toBeDefined();
      expect(processedOutput.confidence).toBeGreaterThan(0);
      expect(processedOutput.probabilities).toBeDefined();
    });

    test('debe aplicar softmax correctamente', () => {
      const logits = [1, 2, 3];
      const probabilities = prediction['_postprocessor'].softmax(logits);
      
      expect(probabilities).toHaveLength(3);
      expect(probabilities.reduce((sum, p) => sum + p, 0)).toBeCloseTo(1, 5);
      expect(probabilities.every(p => p >= 0 && p <= 1)).toBe(true);
    });

    test('debe aplicar sigmoid correctamente', () => {
      const logits = [-1, 0, 1];
      const probabilities = prediction['_postprocessor'].sigmoid(logits);
      
      expect(probabilities).toHaveLength(3);
      expect(probabilities.every(p => p >= 0 && p <= 1)).toBe(true);
    });

    test('debe aplicar umbral correctamente', () => {
      const probabilities = [0.3, 0.7, 0.9];
      const threshold = 0.5;
      const result = prediction['_postprocessor'].threshold(probabilities, threshold);
      
      expect(result).toHaveLength(3);
      expect(result).toEqual([0, 1, 1]);
    });

    test('debe obtener top K correctamente', () => {
      const probabilities = [0.1, 0.8, 0.3, 0.9, 0.2];
      const k = 3;
      const topK = prediction['_postprocessor'].topK(probabilities, k);
      
      expect(topK).toHaveLength(3);
      expect(topK).toContain(3); // índice del 0.9
      expect(topK).toContain(1); // índice del 0.8
      expect(topK).toContain(2); // índice del 0.3
    });
  });

  describe('Cache', () => {
    beforeEach(async () => {
      await prediction.initialize();
    });

    test('debe limpiar cache correctamente', () => {
      prediction.clearCache();
      expect(prediction.cacheSize).toBe(0);
    });

    test('debe generar claves de cache únicas', () => {
      const input1 = { text: 'test1' };
      const input2 = { text: 'test2' };
      const options1 = { temperature: 0.7 };
      const options2 = { temperature: 0.8 };

      const key1 = prediction['_generateCacheKey'](input1, options1);
      const key2 = prediction['_generateCacheKey'](input2, options1);
      const key3 = prediction['_generateCacheKey'](input1, options2);

      expect(key1).not.toBe(key2);
      expect(key1).not.toBe(key3);
      expect(key2).not.toBe(key3);
    });

    test('debe respetar TTL del cache', async () => {
      const shortTTLConfig = {
        ...predictionConfig,
        caching: {
          ...predictionConfig.caching,
          ttl: 1 // 1ms TTL
        }
      };

      const shortTTLPrediction = new AIPrediction(shortTTLConfig);
      await shortTTLPrediction.initialize();

      const input = { text: 'ttl test' };
      
      // Primera predicción
      await shortTTLPrediction.predict(input);
      
      // Esperar que expire el TTL
      await new Promise(resolve => setTimeout(resolve, 10));
      
      // Segunda predicción (no debe usar cache)
      const result = await shortTTLPrediction.predict(input);
      expect(result.metadata.cacheHit).toBe(false);
    });

    test('debe limitar tamaño del cache', async () => {
      const smallCacheConfig = {
        ...predictionConfig,
        caching: {
          ...predictionConfig.caching,
          size: 2
        }
      };

      const smallCachePrediction = new AIPrediction(smallCacheConfig);
      await smallCachePrediction.initialize();

      // Agregar más predicciones que el tamaño del cache
      for (let i = 0; i < 5; i++) {
        await smallCachePrediction.predict({ text: `test${i}` });
      }

      expect(smallCachePrediction.cacheSize).toBeLessThanOrEqual(2);
    });
  });

  describe('Estadísticas', () => {
    beforeEach(async () => {
      await prediction.initialize();
    });

    test('debe obtener estadísticas correctas', () => {
      const stats = prediction.getStats();
      
      expect(stats.id).toBe(prediction.id);
      expect(stats.type).toBe(prediction.type);
      expect(stats.modelId).toBe(prediction.modelId);
      expect(stats.running).toBe(prediction.running);
      expect(stats.streaming).toBe(prediction.streaming);
      expect(stats.cacheSize).toBe(prediction.cacheSize);
      expect(stats.batchQueueSize).toBe(prediction.batchQueueSize);
      expect(stats.processedItems).toBe(prediction.processedItems);
      expect(stats.errors).toHaveLength(prediction.errors.length);
    });

    test('debe actualizar estadísticas después de predicciones', async () => {
      const initialStats = prediction.getStats();
      
      await prediction.predict({ text: 'test' });
      
      const updatedStats = prediction.getStats();
      expect(updatedStats.processedItems).toBeGreaterThan(initialStats.processedItems);
    });
  });

  describe('Eventos', () => {
    beforeEach(async () => {
      await prediction.initialize();
    });

    test('debe emitir eventos de predicción', (done) => {
      prediction.on('prediction:completed', (event) => {
        expect(event.prediction).toBe(prediction);
        expect(event.input).toBeDefined();
        expect(event.result).toBeDefined();
        expect(event.time).toBeGreaterThan(0);
        done();
      });

      prediction.predict({ text: 'test' });
    });

    test('debe emitir eventos de lote', (done) => {
      prediction.on('batch:completed', (event) => {
        expect(event.prediction).toBe(prediction);
        expect(event.results).toBeDefined();
        expect(event.time).toBeGreaterThan(0);
        done();
      });

      prediction.predictBatch([{ text: 'test1' }, { text: 'test2' }]);
    });

    test('debe emitir eventos de error', (done) => {
      prediction.on('error:prediction', (event) => {
        expect(event.prediction).toBe(prediction);
        expect(event.error).toBeDefined();
        expect(event.context).toBeDefined();
        done();
      });

      prediction.predict(null as any).catch(() => {});
    });
  });

  describe('Manejo de Errores', () => {
    beforeEach(async () => {
      await prediction.initialize();
    });

    test('debe manejar errores de modelo inexistente', async () => {
      const invalidConfig = {
        ...predictionConfig,
        modelId: 'non-existent-model'
      };

      const invalidPrediction = new AIPrediction(invalidConfig);
      await invalidPrediction.initialize();

      await expect(invalidPrediction.predict({ text: 'test' }))
        .rejects.toThrow('Model non-existent-model not found');
    });

    test('debe manejar errores de validación de entrada', async () => {
      const invalidInput = { invalidField: 'test' };

      await expect(prediction.predict(invalidInput))
        .rejects.toThrow('Input validation failed');
    });

    test('debe manejar errores de validación de salida', async () => {
      // Simular salida inválida
      const originalPostprocess = prediction['_postprocess'];
      prediction['_postprocess'] = async () => ({ invalid: 'output' });

      await expect(prediction.predict({ text: 'test' }))
        .rejects.toThrow('Output validation failed');

      // Restaurar método original
      prediction['_postprocess'] = originalPostprocess;
    });
  });

  describe('Concurrencia', () => {
    beforeEach(async () => {
      await prediction.initialize();
    });

    test('debe manejar predicciones concurrentes', async () => {
      const inputs = Array.from({ length: 10 }, (_, i) => ({
        text: `concurrent test ${i}`,
        features: [i, i + 1, i + 2]
      }));

      const promises = inputs.map(input => prediction.predict(input));
      const results = await Promise.all(promises);

      expect(results).toHaveLength(10);
      results.forEach(result => {
        expect(result).toBeDefined();
        expect(result.prediction).toBeDefined();
      });
    });

    test('debe manejar lotes concurrentes', async () => {
      const batch1 = Array.from({ length: 5 }, (_, i) => ({ text: `batch1-${i}` }));
      const batch2 = Array.from({ length: 5 }, (_, i) => ({ text: `batch2-${i}` }));

      const [result1, result2] = await Promise.all([
        prediction.predictBatch(batch1),
        prediction.predictBatch(batch2)
      ]);

      expect(result1.results).toHaveLength(5);
      expect(result2.results).toHaveLength(5);
    });
  });

  describe('Limpieza', () => {
    beforeEach(async () => {
      await prediction.initialize();
    });

    test('debe limpiar recursos correctamente', () => {
      prediction.clearCache();
      expect(prediction.cacheSize).toBe(0);
    });
  });
});

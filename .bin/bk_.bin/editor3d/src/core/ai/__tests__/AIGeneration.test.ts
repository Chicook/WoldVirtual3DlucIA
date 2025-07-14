/**
 * Tests para AIGeneration
 */

import { AIGeneration, GenerationType, GenerationStep } from '../AIGeneration';

describe('AIGeneration', () => {
  let generation: AIGeneration;
  let generationConfig: any;

  beforeEach(() => {
    generationConfig = {
      id: 'test-generation',
      modelId: 'test-model',
      type: 'text' as const,
      prompt: {
        maxLength: 1000,
        templates: [
          'Generate content about: {topic}',
          'Create a story with: {characters}',
          'Write code for: {functionality}'
        ],
        variables: {
          topic: 'AI',
          characters: 'hero and villain',
          functionality: 'sorting algorithm'
        },
        preprocessing: true,
        validation: true,
        enhancement: true
      },
      generation: {
        temperature: 0.7,
        topP: 0.9,
        topK: 50,
        maxTokens: 1000,
        minTokens: 10,
        repetitionPenalty: 1.1,
        lengthPenalty: 1.0,
        noRepeatNgramSize: 3,
        doSample: true,
        numBeams: 1,
        earlyStopping: true,
        padTokenId: 0,
        eosTokenId: 1
      },
      quality: {
        resolution: '512x512',
        format: 'png',
        compression: true,
        optimization: true,
        enhancement: true,
        filters: ['denoise', 'sharpen', 'color_correct']
      },
      safety: {
        enabled: true,
        filters: ['toxicity', 'bias', 'inappropriate'],
        moderation: true,
        contentPolicy: 'strict',
        toxicityThreshold: 0.8,
        biasDetection: true,
        factChecking: false
      },
      streaming: {
        enabled: true,
        chunkSize: 10,
        delay: 50,
        bufferSize: 100,
        realtime: true
      },
      caching: {
        enabled: true,
        size: 100,
        ttl: 3600000,
        keyFunction: 'hash'
      }
    };

    generation = new AIGeneration(generationConfig);
  });

  afterEach(async () => {
    if (generation.getState().running) {
      // Limpiar cualquier operación en curso
      generation.clearCache();
    }
  });

  describe('Inicialización', () => {
    test('debe crear una instancia válida', () => {
      expect(generation).toBeDefined();
      expect(generation.id).toBe('test-generation');
      expect(generation.modelId).toBe('test-model');
      expect(generation.type).toBe(GenerationType.TEXT);
    });

    test('debe tener estado inicial correcto', () => {
      const state = generation.getState();
      expect(state.running).toBe(false);
      expect(state.streaming).toBe(false);
      expect(state.progress).toBe(0);
      expect(state.currentStep).toBe(GenerationStep.INITIALIZING);
      expect(state.startTime).toBe(0);
      expect(state.lastUpdate).toBe(0);
      expect(state.tokensGenerated).toBe(0);
      expect(state.totalTokens).toBe(0);
      expect(state.cache.size).toBe(0);
      expect(state.errors).toHaveLength(0);
    });

    test('debe inicializar correctamente', async () => {
      await generation.initialize();
      
      const state = generation.getState();
      expect(state.running).toBe(false);
      expect(state.cache.size).toBe(0);
    });

    test('debe manejar errores de inicialización', async () => {
      const invalidConfig = {
        ...generationConfig,
        modelId: 'invalid-model'
      };
      
      const invalidGeneration = new AIGeneration(invalidConfig);
      await expect(invalidGeneration.initialize()).rejects.toThrow();
    });
  });

  describe('Generación de Contenido', () => {
    beforeEach(async () => {
      await generation.initialize();
    });

    test('debe generar contenido correctamente', async () => {
      const prompt = 'Generate a story about AI';
      const result = await generation.generate(prompt);

      expect(result).toBeDefined();
      expect(result.content).toBeDefined();
      expect(result.type).toBe(generation.type);
      expect(result.format).toBeDefined();
      expect(result.metadata).toBeDefined();
      expect(result.metadata.modelId).toBe(generation.modelId);
      expect(result.metadata.generationType).toBe(generation.type);
      expect(result.metadata.promptLength).toBe(prompt.length);
      expect(result.metadata.outputLength).toBeGreaterThan(0);
      expect(result.metadata.generationTime).toBeGreaterThan(0);
      expect(result.metadata.tokensUsed).toBeGreaterThan(0);
      expect(result.metadata.cacheHit).toBe(false);
      expect(result.metadata.streamed).toBe(false);
      expect(result.metadata.parameters).toBeDefined();
      expect(result.safety).toBeDefined();
      expect(result.safety.safe).toBeDefined();
      expect(result.safety.score).toBeGreaterThan(0);
      expect(result.quality).toBeDefined();
      expect(result.quality.score).toBeGreaterThan(0);
      expect(result.timestamp).toBeGreaterThan(0);
    });

    test('debe usar cache cuando está habilitado', async () => {
      const prompt = 'cache test prompt';
      
      // Primera generación
      const result1 = await generation.generate(prompt);
      expect(result1.metadata.cacheHit).toBe(false);

      // Segunda generación (debe usar cache)
      const result2 = await generation.generate(prompt);
      expect(result2.metadata.cacheHit).toBe(true);
    });

    test('debe manejar opciones de generación', async () => {
      const prompt = 'test with options';
      const options = {
        temperature: 0.5,
        maxTokens: 500,
        topP: 0.8
      };

      const result = await generation.generate(prompt, options);
      expect(result).toBeDefined();
      expect(result.metadata.parameters).toBeDefined();
    });

    test('debe manejar errores de generación', async () => {
      const invalidPrompt = null;

      await expect(generation.generate(invalidPrompt as any))
        .rejects.toThrow();
    });

    test('debe validar tipo de modelo para generación', async () => {
      const nonGenerativeConfig = {
        ...generationConfig,
        type: 'prediction' as any
      };

      const nonGenerativeGeneration = new AIGeneration(nonGenerativeConfig);
      await nonGenerativeGeneration.initialize();

      await expect(nonGenerativeGeneration.generate('test prompt'))
        .rejects.toThrow('is not a generative model');
    });
  });

  describe('Generación con Streaming', () => {
    beforeEach(async () => {
      await generation.initialize();
    });

    test('debe generar contenido con streaming', async () => {
      if (!generation.config.streaming.enabled) {
        console.warn('Streaming not enabled for testing');
        return;
      }

      const prompt = 'Streaming test prompt';
      const stream = generation.generateStream(prompt);
      
      const tokens: string[] = [];
      for await (const token of stream) {
        tokens.push(token);
      }

      expect(tokens.length).toBeGreaterThan(0);
      expect(tokens.join('')).toContain('Streaming test prompt');
    });

    test('debe manejar streaming cuando está deshabilitado', async () => {
      const noStreamConfig = {
        ...generationConfig,
        streaming: {
          enabled: false,
          chunkSize: 10,
          delay: 50,
          bufferSize: 100,
          realtime: false
        }
      };

      const noStreamGeneration = new AIGeneration(noStreamConfig);
      await noStreamGeneration.initialize();

      await expect(noStreamGeneration.generateStream('test'))
        .rejects.toThrow('Streaming is not enabled');
    });
  });

  describe('Generación Específica por Tipo', () => {
    beforeEach(async () => {
      await generation.initialize();
    });

    test('debe generar imágenes', async () => {
      const imageConfig = {
        ...generationConfig,
        type: 'image' as const
      };

      const imageGeneration = new AIGeneration(imageConfig);
      await imageGeneration.initialize();

      const result = await imageGeneration.generateImage('A beautiful landscape');
      expect(result.content).toBeDefined();
      expect(result.type).toBe(GenerationType.IMAGE);
    });

    test('debe generar audio', async () => {
      const audioConfig = {
        ...generationConfig,
        type: 'audio' as const
      };

      const audioGeneration = new AIGeneration(audioConfig);
      await audioGeneration.initialize();

      const result = await audioGeneration.generateAudio('Generate music');
      expect(result.content).toBeDefined();
      expect(result.type).toBe(GenerationType.AUDIO);
    });

    test('debe generar código', async () => {
      const codeConfig = {
        ...generationConfig,
        type: 'code' as const
      };

      const codeGeneration = new AIGeneration(codeConfig);
      await codeGeneration.initialize();

      const result = await codeGeneration.generateCode('Create a sorting function');
      expect(result.content).toBeDefined();
      expect(result.type).toBe(GenerationType.CODE);
    });

    test('debe validar tipo para generación específica', async () => {
      await expect(generation.generateImage('test'))
        .rejects.toThrow('is not configured for image generation');

      await expect(generation.generateAudio('test'))
        .rejects.toThrow('is not configured for audio generation');

      await expect(generation.generateCode('test'))
        .rejects.toThrow('is not configured for code generation');
    });
  });

  describe('Procesamiento de Prompts', () => {
    beforeEach(async () => {
      await generation.initialize();
    });

    test('debe preprocesar prompts correctamente', async () => {
      const prompt = 'Test prompt with {variable}';
      const options = { variables: { variable: 'value' } };

      const processedPrompt = await generation['_preprocessPrompt'](prompt, options);
      expect(processedPrompt).toContain('value');
      expect(processedPrompt).not.toContain('{variable}');
    });

    test('debe validar prompts', async () => {
      const longPrompt = 'a'.repeat(2000); // Más del máximo permitido

      await expect(generation['_preprocessPrompt'](longPrompt))
        .rejects.toThrow('Prompt too long');
    });

    test('debe mejorar prompts', async () => {
      const basicPrompt = 'write a story';
      const enhancedPrompt = generation['_promptProcessor'].enhance(basicPrompt);
      
      expect(enhancedPrompt).toContain('Enhanced:');
      expect(enhancedPrompt).toContain(basicPrompt);
    });

    test('debe procesar prompts con variables', async () => {
      const prompt = 'Generate content about {topic} with {style}';
      const variables = { topic: 'AI', style: 'technical' };

      const processed = generation['_promptProcessor'].preprocess(prompt, variables);
      expect(processed).toBe('Generate content about AI with technical');
    });
  });

  describe('Seguridad y Calidad', () => {
    beforeEach(async () => {
      await generation.initialize();
    });

    test('debe verificar seguridad del contenido', async () => {
      const content = 'This is safe content';
      const prompt = 'Generate safe content';

      const safetyResult = await generation['_validateSafety'](content, prompt);
      
      expect(safetyResult.safe).toBeDefined();
      expect(safetyResult.score).toBeGreaterThan(0);
      expect(safetyResult.flags).toBeDefined();
      expect(safetyResult.moderated).toBeDefined();
      expect(safetyResult.warnings).toBeDefined();
    });

    test('debe mejorar calidad del contenido', async () => {
      const content = { text: 'basic content' };
      
      const enhancedContent = await generation['_enhanceQuality'](content);
      expect(enhancedContent.enhanced).toBe(true);
    });

    test('debe optimizar contenido', async () => {
      const content = { data: 'unoptimized' };
      
      const optimizedContent = generation['_qualityEnhancer'].optimize(content);
      expect(optimizedContent.optimized).toBe(true);
    });

    test('debe aplicar filtros de calidad', async () => {
      const content = { image: 'raw_image_data' };
      
      const filteredContent = generation['_applyQualityFilters'](content);
      expect(filteredContent).toBeDefined();
    });
  });

  describe('Diferentes Tipos de Generación', () => {
    test('debe manejar generación de texto', async () => {
      const textConfig = {
        ...generationConfig,
        type: 'text' as const
      };

      const textGeneration = new AIGeneration(textConfig);
      await textGeneration.initialize();

      const result = await textGeneration.generate('Write a story');
      expect(result.content).toBeDefined();
      expect(result.type).toBe(GenerationType.TEXT);
    });

    test('debe manejar generación de video', async () => {
      const videoConfig = {
        ...generationConfig,
        type: 'video' as const
      };

      const videoGeneration = new AIGeneration(videoConfig);
      await videoGeneration.initialize();

      const result = await videoGeneration.generate('Create a video');
      expect(result.content).toBeDefined();
      expect(result.type).toBe(GenerationType.VIDEO);
    });

    test('debe manejar generación 3D', async () => {
      const threeDConfig = {
        ...generationConfig,
        type: '3d' as const
      };

      const threeDGeneration = new AIGeneration(threeDConfig);
      await threeDGeneration.initialize();

      const result = await threeDGeneration.generate('Create a 3D model');
      expect(result.content).toBeDefined();
      expect(result.type).toBe(GenerationType.THREE_D);
    });
  });

  describe('Cache', () => {
    beforeEach(async () => {
      await generation.initialize();
    });

    test('debe limpiar cache correctamente', () => {
      generation.clearCache();
      expect(generation.cacheSize).toBe(0);
    });

    test('debe generar claves de cache únicas', () => {
      const prompt1 = 'test prompt 1';
      const prompt2 = 'test prompt 2';
      const options1 = { temperature: 0.7 };
      const options2 = { temperature: 0.8 };

      const key1 = generation['_generateCacheKey'](prompt1, options1);
      const key2 = generation['_generateCacheKey'](prompt2, options1);
      const key3 = generation['_generateCacheKey'](prompt1, options2);

      expect(key1).not.toBe(key2);
      expect(key1).not.toBe(key3);
      expect(key2).not.toBe(key3);
    });

    test('debe respetar TTL del cache', async () => {
      const shortTTLConfig = {
        ...generationConfig,
        caching: {
          ...generationConfig.caching,
          ttl: 1 // 1ms TTL
        }
      };

      const shortTTLGeneration = new AIGeneration(shortTTLConfig);
      await shortTTLGeneration.initialize();

      const prompt = 'ttl test';
      
      // Primera generación
      await shortTTLGeneration.generate(prompt);
      
      // Esperar que expire el TTL
      await new Promise(resolve => setTimeout(resolve, 10));
      
      // Segunda generación (no debe usar cache)
      const result = await shortTTLGeneration.generate(prompt);
      expect(result.metadata.cacheHit).toBe(false);
    });
  });

  describe('Estados y Progreso', () => {
    beforeEach(async () => {
      await generation.initialize();
    });

    test('debe actualizar estados durante generación', async () => {
      const generationPromise = generation.generate('test prompt');
      
      // Verificar que el estado cambia durante la generación
      expect(generation.running).toBe(true);
      expect(generation.streaming).toBe(false);

      await generationPromise;
      
      // Verificar que el estado vuelve al final
      expect(generation.running).toBe(false);
    });

    test('debe actualizar progreso durante generación', async () => {
      const generationPromise = generation.generate('test prompt');
      
      // Esperar un poco para que avance el progreso
      await new Promise(resolve => setTimeout(resolve, 100));
      
      expect(generation.progress).toBeGreaterThan(0);
      expect(generation.progress).toBeLessThanOrEqual(1);

      await generationPromise;
    });

    test('debe actualizar pasos durante generación', async () => {
      const generationPromise = generation.generate('test prompt');
      
      // Esperar un poco para que cambien los pasos
      await new Promise(resolve => setTimeout(resolve, 200));
      
      expect(generation.currentStep).not.toBe(GenerationStep.INITIALIZING);

      await generationPromise;
    });
  });

  describe('Eventos', () => {
    beforeEach(async () => {
      await generation.initialize();
    });

    test('debe emitir eventos de generación', (done) => {
      generation.on('generation:completed', (event) => {
        expect(event.generation).toBe(generation);
        expect(event.prompt).toBeDefined();
        expect(event.result).toBeDefined();
        expect(event.time).toBeGreaterThan(0);
        done();
      });

      generation.generate('test prompt');
    });

    test('debe emitir eventos de progreso', (done) => {
      generation.on('generation:progress', (event) => {
        expect(event.generation).toBe(generation);
        expect(event.progress).toBeGreaterThan(0);
        expect(event.step).toBeDefined();
        done();
      });

      generation.generate('test prompt');
    });

    test('debe emitir eventos de streaming', (done) => {
      if (!generation.config.streaming.enabled) {
        console.warn('Streaming not enabled for testing');
        return;
      }

      generation.on('stream:token', (event) => {
        expect(event.generation).toBe(generation);
        expect(event.token).toBeDefined();
        expect(event.index).toBeGreaterThanOrEqual(0);
        done();
      });

      const stream = generation.generateStream('test');
      stream.next();
    });

    test('debe emitir eventos de error', (done) => {
      generation.on('error:generation', (event) => {
        expect(event.generation).toBe(generation);
        expect(event.error).toBeDefined();
        expect(event.context).toBeDefined();
        done();
      });

      generation.generate(null as any).catch(() => {});
    });
  });

  describe('Manejo de Errores', () => {
    beforeEach(async () => {
      await generation.initialize();
    });

    test('debe manejar errores de modelo inexistente', async () => {
      const invalidConfig = {
        ...generationConfig,
        modelId: 'non-existent-model'
      };

      const invalidGeneration = new AIGeneration(invalidConfig);
      await invalidGeneration.initialize();

      await expect(invalidGeneration.generate('test'))
        .rejects.toThrow('Model non-existent-model not found');
    });

    test('debe manejar errores de validación de prompt', async () => {
      const longPrompt = 'a'.repeat(2000);
      await expect(generation.generate(longPrompt))
        .rejects.toThrow('Prompt too long');
    });

    test('debe manejar errores de seguridad', async () => {
      // Simular contenido inseguro
      const originalCheckSafety = generation['_checkSafety'];
      generation['_checkSafety'] = () => ({
        safe: false,
        score: 0.1,
        flags: ['toxicity'],
        moderated: true,
        warnings: ['Content flagged as inappropriate']
      });

      const result = await generation.generate('test');
      expect(result.safety.safe).toBe(false);

      // Restaurar método original
      generation['_checkSafety'] = originalCheckSafety;
    });
  });

  describe('Concurrencia', () => {
    beforeEach(async () => {
      await generation.initialize();
    });

    test('debe manejar generaciones concurrentes', async () => {
      const prompts = Array.from({ length: 5 }, (_, i) => `prompt ${i}`);
      
      const promises = prompts.map(prompt => generation.generate(prompt));
      const results = await Promise.all(promises);

      expect(results).toHaveLength(5);
      results.forEach(result => {
        expect(result).toBeDefined();
        expect(result.content).toBeDefined();
      });
    });

    test('debe manejar streaming concurrente', async () => {
      if (!generation.config.streaming.enabled) {
        console.warn('Streaming not enabled for testing');
        return;
      }

      const stream1 = generation.generateStream('stream 1');
      const stream2 = generation.generateStream('stream 2');

      const tokens1: string[] = [];
      const tokens2: string[] = [];

      await Promise.all([
        (async () => {
          for await (const token of stream1) {
            tokens1.push(token);
          }
        })(),
        (async () => {
          for await (const token of stream2) {
            tokens2.push(token);
          }
        })()
      ]);

      expect(tokens1.length).toBeGreaterThan(0);
      expect(tokens2.length).toBeGreaterThan(0);
    });
  });

  describe('Limpieza', () => {
    beforeEach(async () => {
      await generation.initialize();
    });

    test('debe limpiar recursos correctamente', () => {
      generation.clearCache();
      expect(generation.cacheSize).toBe(0);
    });
  });
}); 
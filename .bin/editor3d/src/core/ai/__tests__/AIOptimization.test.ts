/**
 * Tests para AIOptimization
 */

import { AIOptimization, OptimizationType, AlgorithmType } from '../AIOptimization';

describe('AIOptimization', () => {
  let optimization: AIOptimization;
  let optimizationConfig: any;

  beforeEach(() => {
    optimizationConfig = {
      id: 'test-optimization',
      modelId: 'test-model',
      type: 'performance' as const,
      algorithm: {
        name: 'genetic',
        type: 'genetic' as AlgorithmType,
        parameters: {
          populationSize: 50,
          mutationRate: 0.1,
          crossoverRate: 0.8
        },
        hybrid: false,
        adaptive: true
      },
      objective: {
        primary: 'minimize_loss',
        secondary: ['maximize_accuracy', 'minimize_memory'],
        weights: [0.6, 0.3, 0.1],
        minimize: true,
        custom: {
          target_metric: 'f1_score'
        }
      },
      constraints: [
        {
          id: 'memory_limit',
          type: 'inequality',
          expression: 'memory_usage <= 1024',
          tolerance: 0.01,
          penalty: 1000,
          priority: 1
        },
        {
          id: 'accuracy_minimum',
          type: 'inequality',
          expression: 'accuracy >= 0.8',
          tolerance: 0.01,
          penalty: 500,
          priority: 2
        }
      ],
      parameters: {
        populationSize: 50,
        maxIterations: 100,
        mutationRate: 0.1,
        crossoverRate: 0.8,
        selectionPressure: 2.0,
        elitism: true,
        diversity: true,
        localSearch: false
      },
      convergence: {
        tolerance: 0.001,
        patience: 10,
        minImprovement: 0.01,
        maxStagnation: 20,
        adaptive: true
      },
      monitoring: {
        enabled: true,
        frequency: 10,
        metrics: ['fitness', 'diversity', 'convergence'],
        logging: true,
        visualization: false,
        checkpointing: true
      },
      parallel: {
        enabled: true,
        workers: 4,
        distribution: 'round_robin',
        synchronization: 'generational'
      }
    };

    optimization = new AIOptimization(optimizationConfig);
  });

  afterEach(async () => {
    if (optimization.getState().running) {
      optimization.stop();
    }
  });

  describe('Inicialización', () => {
    test('debe crear una instancia válida', () => {
      expect(optimization).toBeDefined();
      expect(optimization.id).toBe('test-optimization');
      expect(optimization.modelId).toBe('test-model');
      expect(optimization.type).toBe(OptimizationType.PERFORMANCE);
    });

    test('debe tener estado inicial correcto', () => {
      const state = optimization.getState();
      expect(state.running).toBe(false);
      expect(state.currentIteration).toBe(0);
      expect(state.totalIterations).toBe(0);
      expect(state.currentFitness).toBe(0);
      expect(state.bestFitness).toBe(0);
      expect(state.startTime).toBe(0);
      expect(state.lastUpdate).toBe(0);
      expect(state.progress).toBe(0);
      expect(state.converged).toBe(false);
      expect(state.stagnated).toBe(false);
      expect(state.errors).toHaveLength(0);
      expect(state.population).toHaveLength(0);
      expect(state.bestSolution).toBeNull();
    });

    test('debe inicializar correctamente', async () => {
      await optimization.initialize();
      
      const state = optimization.getState();
      expect(state.running).toBe(false);
      expect(state.population.length).toBeGreaterThan(0);
    });

    test('debe manejar errores de inicialización', async () => {
      const invalidConfig = {
        ...optimizationConfig,
        modelId: 'invalid-model'
      };
      
      const invalidOptimization = new AIOptimization(invalidConfig);
      await expect(invalidOptimization.initialize()).rejects.toThrow();
    });
  });

  describe('Optimización', () => {
    beforeEach(async () => {
      await optimization.initialize();
    });

    test('debe ejecutar optimización correctamente', async () => {
      const target = { performance: 'high', memory: 'low' };
      const constraints = { maxMemory: 1024, minAccuracy: 0.8 };

      const result = await optimization.optimize(target, constraints);

      expect(result).toBeDefined();
      expect(result.success).toBe(true);
      expect(result.solution).toBeDefined();
      expect(result.fitness).toBeGreaterThan(0);
      expect(result.iterations).toBeGreaterThan(0);
      expect(result.convergence).toBeDefined();
      expect(result.constraints).toBeDefined();
      expect(result.metadata).toBeDefined();
      expect(result.metadata.algorithm).toBe(optimization.config.algorithm.name);
      expect(result.metadata.parameters).toBeDefined();
      expect(result.metadata.executionTime).toBeGreaterThan(0);
      expect(result.metadata.memoryUsage).toBeGreaterThan(0);
      expect(result.metadata.parallelWorkers).toBe(optimization.config.parallel.workers);
      expect(result.metadata.cacheHits).toBeGreaterThanOrEqual(0);
      expect(result.metadata.restarts).toBeGreaterThanOrEqual(0);
      expect(result.history).toBeDefined();
      expect(result.history.iterations).toBeDefined();
      expect(result.history.fitness).toBeDefined();
      expect(result.history.solutions).toBeDefined();
      expect(result.history.constraints).toBeDefined();
      expect(result.history.timestamps).toBeDefined();
      expect(result.timestamp).toBeGreaterThan(0);
    });

    test('debe manejar optimización de rendimiento', async () => {
      const result = await optimization.optimizePerformance({ target: 'high_performance' });
      expect(result.success).toBe(true);
      expect(result.solution).toBeDefined();
    });

    test('debe manejar optimización de recursos', async () => {
      const resourceConfig = {
        ...optimizationConfig,
        type: 'resource' as const
      };

      const resourceOptimization = new AIOptimization(resourceConfig);
      await resourceOptimization.initialize();

      const result = await resourceOptimization.optimizeResources({ target: 'minimize_memory' });
      expect(result.success).toBe(true);
      expect(result.solution).toBeDefined();
    });

    test('debe manejar optimización de calidad', async () => {
      const qualityConfig = {
        ...optimizationConfig,
        type: 'quality' as const
      };

      const qualityOptimization = new AIOptimization(qualityConfig);
      await qualityOptimization.initialize();

      const result = await qualityOptimization.optimizeQuality({ target: 'maximize_quality' });
      expect(result.success).toBe(true);
      expect(result.solution).toBeDefined();
    });

    test('debe manejar optimización multi-objetivo', async () => {
      const multiObjectiveConfig = {
        ...optimizationConfig,
        type: 'multi_objective' as const
      };

      const multiObjectiveOptimization = new AIOptimization(multiObjectiveConfig);
      await multiObjectiveOptimization.initialize();

      const objectives = ['minimize_loss', 'maximize_accuracy', 'minimize_memory'];
      const result = await multiObjectiveOptimization.optimizeMultiObjective(
        { target: 'multi_objective' },
        objectives
      );
      expect(result.success).toBe(true);
      expect(result.solution).toBeDefined();
    });

    test('debe manejar optimización con restricciones', async () => {
      const constraintConfig = {
        ...optimizationConfig,
        type: 'constraint' as const
      };

      const constraintOptimization = new AIOptimization(constraintConfig);
      await constraintOptimization.initialize();

      const constraints = [
        { type: 'memory', limit: 1024 },
        { type: 'accuracy', minimum: 0.8 }
      ];

      const result = await constraintOptimization.optimizeWithConstraints(
        { target: 'constrained_optimization' },
        constraints
      );
      expect(result.success).toBe(true);
      expect(result.solution).toBeDefined();
    });

    test('debe validar tipo para optimización específica', async () => {
      await expect(optimization.optimizeResources({ target: 'test' }))
        .rejects.toThrow('is not configured for resource optimization');

      await expect(optimization.optimizeQuality({ target: 'test' }))
        .rejects.toThrow('is not configured for quality optimization');

      await expect(optimization.optimizeMultiObjective({ target: 'test' }, []))
        .rejects.toThrow('is not configured for multi-objective optimization');

      await expect(optimization.optimizeWithConstraints({ target: 'test' }, []))
        .rejects.toThrow('is not configured for constraint optimization');
    });
  });

  describe('Algoritmos de Optimización', () => {
    test('debe crear algoritmo genético', () => {
      const geneticAlgorithm = optimization['_createGeneticAlgorithm']();
      expect(geneticAlgorithm).toBeDefined();
      expect(geneticAlgorithm.crossover).toBeDefined();
      expect(geneticAlgorithm.mutate).toBeDefined();
      expect(geneticAlgorithm.select).toBeDefined();
    });

    test('debe crear algoritmo de enjambre de partículas', () => {
      const psoAlgorithm = optimization['_createParticleSwarmAlgorithm']();
      expect(psoAlgorithm).toBeDefined();
      expect(psoAlgorithm.updateVelocity).toBeDefined();
      expect(psoAlgorithm.updatePosition).toBeDefined();
    });

    test('debe crear algoritmo de recocido simulado', () => {
      const saAlgorithm = optimization['_createSimulatedAnnealingAlgorithm']();
      expect(saAlgorithm).toBeDefined();
      expect(saAlgorithm.accept).toBeDefined();
      expect(saAlgorithm.cool).toBeDefined();
    });

    test('debe crear algoritmo bayesiano', () => {
      const bayesianAlgorithm = optimization['_createBayesianAlgorithm']();
      expect(bayesianAlgorithm).toBeDefined();
      expect(bayesianAlgorithm.updateModel).toBeDefined();
      expect(bayesianAlgorithm.sample).toBeDefined();
    });

    test('debe crear algoritmo de gradiente', () => {
      const gradientAlgorithm = optimization['_createGradientAlgorithm']();
      expect(gradientAlgorithm).toBeDefined();
      expect(gradientAlgorithm.calculateGradient).toBeDefined();
      expect(gradientAlgorithm.updateSolution).toBeDefined();
    });

    test('debe crear algoritmo evolutivo', () => {
      const evolutionaryAlgorithm = optimization['_createEvolutionaryAlgorithm']();
      expect(evolutionaryAlgorithm).toBeDefined();
      expect(evolutionaryAlgorithm.evolve).toBeDefined();
    });
  });

  describe('Operaciones de Algoritmo Genético', () => {
    test('debe realizar crossover correctamente', () => {
      const parent1 = { genes: [1, 2, 3, 4] };
      const parent2 = { genes: [5, 6, 7, 8] };

      const child = optimization['_crossover'](parent1, parent2);
      expect(child).toBeDefined();
      expect(child.crossover).toBe(true);
    });

    test('debe realizar mutación correctamente', () => {
      const individual = { genes: [1, 2, 3, 4] };

      const mutated = optimization['_mutate'](individual);
      expect(mutated).toBeDefined();
      expect(mutated.mutated).toBe(true);
    });

    test('debe realizar selección correctamente', () => {
      const population = [
        { id: 1, fitness: 0.8 },
        { id: 2, fitness: 0.6 },
        { id: 3, fitness: 0.9 }
      ];
      const fitnesses = [0.8, 0.6, 0.9];

      const selected = optimization['_select'](population, fitnesses);
      expect(selected).toBeDefined();
      expect(population).toContain(selected);
    });
  });

  describe('Restricciones', () => {
    beforeEach(async () => {
      await optimization.initialize();
    });

    test('debe verificar restricciones correctamente', () => {
      const solution = { memory_usage: 800, accuracy: 0.85 };
      const constraints = optimization.config.constraints;

      const constraintStatus = optimization['_constraintChecker'].check(solution, constraints);
      
      expect(constraintStatus).toHaveLength(constraints.length);
      constraintStatus.forEach(status => {
        expect(status.id).toBeDefined();
        expect(status.satisfied).toBeDefined();
        expect(status.violation).toBeGreaterThanOrEqual(0);
        expect(status.penalty).toBeGreaterThanOrEqual(0);
      });
    });

    test('debe calcular penalización por restricciones', () => {
      const violations = [
        { id: 'constraint1', penalty: 100 },
        { id: 'constraint2', penalty: 200 }
      ];

      const totalPenalty = optimization['_constraintChecker'].calculatePenalty(violations);
      expect(totalPenalty).toBe(300);
    });

    test('debe manejar restricciones violadas', () => {
      const solution = { memory_usage: 1500, accuracy: 0.7 }; // Viola restricciones
      const constraints = optimization.config.constraints;

      const constraintStatus = optimization['_constraintChecker'].check(solution, constraints);
      
      const violatedConstraints = constraintStatus.filter(c => !c.satisfied);
      expect(violatedConstraints.length).toBeGreaterThan(0);
    });
  });

  describe('Convergencia', () => {
    beforeEach(async () => {
      await optimization.initialize();
    });

    test('debe verificar convergencia correctamente', () => {
      const currentFitness = 0.95;
      const lastFitness = 0.94;
      const stagnationCounter = 5;

      const converged = optimization['_checkConvergence'](currentFitness, lastFitness, stagnationCounter);
      expect(typeof converged).toBe('boolean');
    });

    test('debe detectar estancamiento', () => {
      const currentFitness = 0.95;
      const lastFitness = 0.95; // Sin mejora
      const stagnationCounter = 25; // Más del máximo permitido

      const converged = optimization['_checkConvergence'](currentFitness, lastFitness, stagnationCounter);
      expect(converged).toBe(true);
    });
  });

  describe('Estados y Progreso', () => {
    beforeEach(async () => {
      await optimization.initialize();
    });

    test('debe actualizar estados durante optimización', async () => {
      const optimizationPromise = optimization.optimize({ target: 'test' });
      
      // Verificar que el estado cambia durante la optimización
      expect(optimization.running).toBe(true);

      await optimizationPromise;
      
      // Verificar que el estado vuelve al final
      expect(optimization.running).toBe(false);
    });

    test('debe actualizar progreso durante optimización', async () => {
      const optimizationPromise = optimization.optimize({ target: 'test' });
      
      // Esperar un poco para que avance el progreso
      await new Promise(resolve => setTimeout(resolve, 100));
      
      expect(optimization.progress).toBeGreaterThan(0);
      expect(optimization.progress).toBeLessThanOrEqual(1);

      await optimizationPromise;
    });

    test('debe actualizar iteraciones durante optimización', async () => {
      const optimizationPromise = optimization.optimize({ target: 'test' });
      
      // Esperar un poco para que avancen las iteraciones
      await new Promise(resolve => setTimeout(resolve, 200));
      
      expect(optimization.currentIteration).toBeGreaterThan(0);

      await optimizationPromise;
    });
  });

  describe('Eventos', () => {
    beforeEach(async () => {
      await optimization.initialize();
    });

    test('debe emitir eventos de optimización', (done) => {
      optimization.on('optimization:completed', (event) => {
        expect(event.optimization).toBe(optimization);
        expect(event.target).toBeDefined();
        expect(event.result).toBeDefined();
        expect(event.time).toBeGreaterThan(0);
        done();
      });

      optimization.optimize({ target: 'test' });
    });

    test('debe emitir eventos de iteración', (done) => {
      optimization.on('optimization:iteration', (event) => {
        expect(event.optimization).toBe(optimization);
        expect(event.iteration).toBeGreaterThanOrEqual(0);
        expect(event.fitness).toBeGreaterThan(0);
        expect(event.bestSolution).toBeDefined();
        done();
      });

      optimization.optimize({ target: 'test' });
    });

    test('debe emitir eventos de convergencia', (done) => {
      optimization.on('optimization:converged', (event) => {
        expect(event.optimization).toBe(optimization);
        expect(event.solution).toBeDefined();
        expect(event.fitness).toBeGreaterThan(0);
        expect(event.iterations).toBeGreaterThan(0);
        done();
      });

      optimization.optimize({ target: 'test' });
    });

    test('debe emitir eventos de restricción violada', (done) => {
      optimization.on('constraint:violated', (event) => {
        expect(event.optimization).toBe(optimization);
        expect(event.constraint).toBeDefined();
        expect(event.value).toBeDefined();
        expect(event.limit).toBeDefined();
        done();
      });

      optimization.optimize({ target: 'test' });
    });

    test('debe emitir eventos de error', (done) => {
      optimization.on('error:optimization', (event) => {
        expect(event.optimization).toBe(optimization);
        expect(event.error).toBeDefined();
        expect(event.context).toBeDefined();
        done();
      });

      const invalidOptimization = new AIOptimization({
        ...optimizationConfig,
        modelId: 'invalid-model'
      });

      invalidOptimization.optimize({ target: 'test' }).catch(() => {});
    });
  });

  describe('Manejo de Errores', () => {
    beforeEach(async () => {
      await optimization.initialize();
    });

    test('debe manejar errores de modelo inexistente', async () => {
      const invalidConfig = {
        ...optimizationConfig,
        modelId: 'non-existent-model'
      };

      const invalidOptimization = new AIOptimization(invalidConfig);
      await invalidOptimization.initialize();

      await expect(invalidOptimization.optimize({ target: 'test' }))
        .rejects.toThrow('Model non-existent-model not found');
    });

    test('debe manejar errores de algoritmo', async () => {
      // Simular error en el algoritmo
      const originalEvolve = optimization['_evolvePopulation'];
      optimization['_evolvePopulation'] = async () => {
        throw new Error('Algorithm error');
      };

      await expect(optimization.optimize({ target: 'test' }))
        .rejects.toThrow('Algorithm error');

      // Restaurar método original
      optimization['_evolvePopulation'] = originalEvolve;
    });
  });

  describe('Concurrencia', () => {
    beforeEach(async () => {
      await optimization.initialize();
    });

    test('debe manejar optimizaciones concurrentes', async () => {
      const targets = [
        { target: 'optimization1' },
        { target: 'optimization2' },
        { target: 'optimization3' }
      ];

      const promises = targets.map(target => optimization.optimize(target));
      const results = await Promise.all(promises);

      expect(results).toHaveLength(3);
      results.forEach(result => {
        expect(result.success).toBe(true);
        expect(result.solution).toBeDefined();
      });
    });

    test('debe prevenir optimizaciones concurrentes en la misma instancia', async () => {
      const optimization1 = optimization.optimize({ target: 'test1' });
      const optimization2 = optimization.optimize({ target: 'test2' });

      await expect(optimization2).rejects.toThrow('Optimization is already running');
      await optimization1; // Esperar que termine la primera
    });
  });

  describe('Estadísticas', () => {
    beforeEach(async () => {
      await optimization.initialize();
    });

    test('debe obtener estadísticas correctas', () => {
      const stats = optimization.getStats();
      
      expect(stats.id).toBe(optimization.id);
      expect(stats.type).toBe(optimization.type);
      expect(stats.modelId).toBe(optimization.modelId);
      expect(stats.running).toBe(optimization.running);
      expect(stats.currentIteration).toBe(optimization.currentIteration);
      expect(stats.bestFitness).toBe(optimization.bestFitness);
      expect(stats.converged).toBe(optimization.converged);
      expect(stats.stagnated).toBe(optimization.stagnated);
      expect(stats.populationSize).toBe(optimization.populationSize);
      expect(stats.errors).toHaveLength(optimization.errors.length);
    });

    test('debe actualizar estadísticas después de optimización', async () => {
      const initialStats = optimization.getStats();
      
      await optimization.optimize({ target: 'test' });
      
      const updatedStats = optimization.getStats();
      expect(updatedStats.currentIteration).toBeGreaterThan(initialStats.currentIteration);
      expect(updatedStats.bestFitness).toBeGreaterThan(initialStats.bestFitness);
    });
  });

  describe('Historial', () => {
    beforeEach(async () => {
      await optimization.initialize();
    });

    test('debe obtener historial correcto', () => {
      const history = optimization.getHistory();
      
      expect(history.iterations).toBeDefined();
      expect(history.fitness).toBeDefined();
      expect(history.solutions).toBeDefined();
      expect(history.constraints).toBeDefined();
      expect(history.timestamps).toBeDefined();
    });

    test('debe actualizar historial durante optimización', async () => {
      const initialHistory = optimization.getHistory();
      
      await optimization.optimize({ target: 'test' });
      
      const updatedHistory = optimization.getHistory();
      expect(updatedHistory.iterations.length).toBeGreaterThan(initialHistory.iterations.length);
      expect(updatedHistory.fitness.length).toBeGreaterThan(initialHistory.fitness.length);
    });
  });

  describe('Limpieza', () => {
    beforeEach(async () => {
      await optimization.initialize();
    });

    test('debe limpiar recursos correctamente', async () => {
      const optimizationPromise = optimization.optimize({ target: 'test' });
      
      // Detener después de un breve tiempo
      setTimeout(() => {
        optimization.stop();
      }, 100);

      const result = await optimizationPromise;
      expect(result.success).toBe(false);
      expect(optimization.running).toBe(false);
    });
  });
}); 
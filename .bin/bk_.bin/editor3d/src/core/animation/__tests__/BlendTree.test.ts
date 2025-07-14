/**
 * Tests para BlendTree
 */

import { BlendTree, BlendTreeConfig, BlendType, ParameterType, ConditionOperator } from '../BlendTree';
import { Animation, AnimationConfig } from '../AnimationManager';

describe('BlendTree', () => {
  let blendTree: BlendTree;
  let config: BlendTreeConfig;

  beforeEach(() => {
    const animation1Config: AnimationConfig = {
      id: 'animation1',
      name: 'Animation 1',
      duration: 2.0,
      loop: true,
      easing: 'linear',
      tracks: []
    };

    const animation2Config: AnimationConfig = {
      id: 'animation2',
      name: 'Animation 2',
      duration: 2.0,
      loop: true,
      easing: 'linear',
      tracks: []
    };

    const animation1 = new Animation(animation1Config);
    const animation2 = new Animation(animation2Config);

    config = {
      id: 'test-blend-tree',
      name: 'Test Blend Tree',
      type: BlendType.LINEAR,
      animations: [
        {
          id: 'node1',
          animation: animation1,
          weight: 0.7,
          enabled: true
        },
        {
          id: 'node2',
          animation: animation2,
          weight: 0.3,
          enabled: true
        }
      ],
      parameters: [
        {
          id: 'speed',
          name: 'Speed',
          type: ParameterType.FLOAT,
          defaultValue: 0.5,
          minValue: 0.0,
          maxValue: 1.0,
          currentValue: 0.5
        }
      ],
      transitions: [],
      metadata: {
        category: 'locomotion',
        tags: ['walk', 'run'],
        complexity: 'medium',
        performance: 'medium',
        description: 'Test blend tree for locomotion'
      }
    };

    blendTree = new BlendTree(config);
  });

  describe('Constructor', () => {
    it('should create BlendTree instance', () => {
      expect(blendTree).toBeInstanceOf(BlendTree);
      expect(blendTree.id).toBe('test-blend-tree');
      expect(blendTree.name).toBe('Test Blend Tree');
      expect(blendTree.type).toBe(BlendType.LINEAR);
      expect(blendTree.animationCount).toBe(2);
      expect(blendTree.parameterCount).toBe(1);
      expect(blendTree.enabled).toBe(true);
    });
  });

  describe('Blend Tree Update', () => {
    it('should update blend tree', () => {
      expect(() => {
        blendTree.update(0.016); // 60 FPS delta time
      }).not.toThrow();
    });

    it('should calculate linear weights', () => {
      blendTree.update(0.016);

      const weights = blendTree.getCurrentWeights();
      expect(weights.get('node1')).toBeCloseTo(0.7, 2);
      expect(weights.get('node2')).toBeCloseTo(0.3, 2);
    });

    it('should calculate additive weights', () => {
      const additiveConfig: BlendTreeConfig = {
        ...config,
        type: BlendType.ADDITIVE
      };

      const additiveBlendTree = new BlendTree(additiveConfig);
      additiveBlendTree.update(0.016);

      const weights = additiveBlendTree.getCurrentWeights();
      expect(weights.get('node1')).toBe(0.7);
      expect(weights.get('node2')).toBe(0.3);
    });

    it('should calculate override weights', () => {
      const overrideConfig: BlendTreeConfig = {
        ...config,
        type: BlendType.OVERRIDE,
        animations: [
          {
            id: 'node1',
            animation: config.animations[0].animation,
            weight: 0.7,
            enabled: true,
            metadata: {
              priority: 1,
              category: 'base',
              tags: [],
              conditions: []
            }
          },
          {
            id: 'node2',
            animation: config.animations[1].animation,
            weight: 0.3,
            enabled: true,
            metadata: {
              priority: 2,
              category: 'override',
              tags: [],
              conditions: []
            }
          }
        ]
      };

      const overrideBlendTree = new BlendTree(overrideConfig);
      overrideBlendTree.update(0.016);

      const weights = overrideBlendTree.getCurrentWeights();
      expect(weights.get('node2')).toBe(1.0); // Higher priority
      expect(weights.get('node1')).toBeUndefined();
    });
  });

  describe('Parameter Management', () => {
    it('should set parameter', () => {
      blendTree.setParameter('speed', 0.8);

      const parameter = blendTree.getParameter('speed');
      expect(parameter).toBeDefined();
      expect(parameter!.currentValue).toBe(0.8);
    });

    it('should clamp parameter values', () => {
      blendTree.setParameter('speed', 2.0); // Above max
      expect(blendTree.getParameter('speed')!.currentValue).toBe(1.0);

      blendTree.setParameter('speed', -1.0); // Below min
      expect(blendTree.getParameter('speed')!.currentValue).toBe(0.0);
    });

    it('should get parameter', () => {
      const parameter = blendTree.getParameter('speed');
      expect(parameter).toBeDefined();
      expect(parameter!.id).toBe('speed');
      expect(parameter!.name).toBe('Speed');
      expect(parameter!.type).toBe(ParameterType.FLOAT);
    });
  });

  describe('Transitions', () => {
    it('should start transition', () => {
      const transition = {
        id: 'test-transition',
        name: 'Test Transition',
        fromAnimation: 'node1',
        toAnimation: 'node2',
        duration: 0.5,
        easing: 'linear',
        conditions: [],
        enabled: true
      };

      blendTree.transitions.set(transition.id, transition);
      blendTree.startTransition('test-transition');

      expect(blendTree.activeTransitionCount).toBe(1);
    });

    it('should complete transition', () => {
      const transition = {
        id: 'test-transition',
        name: 'Test Transition',
        fromAnimation: 'node1',
        toAnimation: 'node2',
        duration: 0.1, // Short duration for testing
        easing: 'linear',
        conditions: [],
        enabled: true
      };

      blendTree.transitions.set(transition.id, transition);
      blendTree.startTransition('test-transition');

      // Update until transition completes
      for (let i = 0; i < 10; i++) {
        blendTree.update(0.02);
      }

      expect(blendTree.activeTransitionCount).toBe(0);
    });
  });

  describe('Condition Evaluation', () => {
    it('should evaluate equals condition', () => {
      const condition = {
        parameterId: 'speed',
        operator: ConditionOperator.EQUALS,
        value: 0.5,
        logic: 'and' as const
      };

      blendTree.setParameter('speed', 0.5);
      const result = (blendTree as any)._evaluateCondition(
        blendTree.getParameter('speed')!,
        condition
      );

      expect(result).toBe(true);
    });

    it('should evaluate greater than condition', () => {
      const condition = {
        parameterId: 'speed',
        operator: ConditionOperator.GREATER_THAN,
        value: 0.3,
        logic: 'and' as const
      };

      blendTree.setParameter('speed', 0.5);
      const result = (blendTree as any)._evaluateCondition(
        blendTree.getParameter('speed')!,
        condition
      );

      expect(result).toBe(true);
    });

    it('should evaluate between condition', () => {
      const condition = {
        parameterId: 'speed',
        operator: ConditionOperator.BETWEEN,
        value: [0.3, 0.7],
        logic: 'and' as const
      };

      blendTree.setParameter('speed', 0.5);
      const result = (blendTree as any)._evaluateCondition(
        blendTree.getParameter('speed')!,
        condition
      );

      expect(result).toBe(true);
    });
  });

  describe('Blend Tree Types', () => {
    it('should handle mask blend type', () => {
      const maskConfig: BlendTreeConfig = {
        ...config,
        type: BlendType.MASK,
        animations: [
          {
            id: 'node1',
            animation: config.animations[0].animation,
            weight: 0.7,
            mask: {
              bones: ['bone1', 'bone2'],
              weight: 0.5,
              enabled: true
            },
            enabled: true
          }
        ]
      };

      const maskBlendTree = new BlendTree(maskConfig);
      maskBlendTree.update(0.016);

      const weights = maskBlendTree.getCurrentWeights();
      expect(weights.get('node1')).toBe(0.35); // 0.7 * 0.5
    });

    it('should handle layer blend type', () => {
      const layerConfig: BlendTreeConfig = {
        ...config,
        type: BlendType.LAYER,
        animations: [
          {
            id: 'node1',
            animation: config.animations[0].animation,
            weight: 0.7,
            enabled: true,
            metadata: {
              priority: 1,
              category: 'base',
              tags: [],
              conditions: []
            }
          },
          {
            id: 'node2',
            animation: config.animations[1].animation,
            weight: 0.3,
            enabled: true,
            metadata: {
              priority: 1,
              category: 'base',
              tags: [],
              conditions: []
            }
          }
        ]
      };

      const layerBlendTree = new BlendTree(layerConfig);
      layerBlendTree.update(0.016);

      const weights = layerBlendTree.getCurrentWeights();
      expect(weights.get('node1')).toBeCloseTo(0.7, 2);
      expect(weights.get('node2')).toBeCloseTo(0.3, 2);
    });

    it('should handle parameter blend type', () => {
      const parameterConfig: BlendTreeConfig = {
        ...config,
        type: BlendType.PARAMETER,
        animations: [
          {
            id: 'node1',
            animation: config.animations[0].animation,
            weight: 0.7,
            enabled: true,
            metadata: {
              priority: 1,
              category: 'base',
              tags: [],
              conditions: [
                {
                  parameterId: 'speed',
                  operator: ConditionOperator.GREATER_THAN,
                  value: 0.3,
                  logic: 'and'
                }
              ]
            }
          }
        ]
      };

      const parameterBlendTree = new BlendTree(parameterConfig);
      parameterBlendTree.setParameter('speed', 0.5);
      parameterBlendTree.update(0.016);

      const weights = parameterBlendTree.getCurrentWeights();
      expect(weights.get('node1')).toBe(0.7);
    });
  });

  describe('Blend Tree Events', () => {
    it('should emit blend started event', (done) => {
      blendTree.on('blend:started', (data) => {
        expect(data.blendTree).toBe(blendTree);
        expect(data.animations).toHaveLength(2);
        done();
      });

      blendTree.update(0.016);
    });

    it('should emit blend updated event', (done) => {
      blendTree.on('blend:updated', (data) => {
        expect(data.blendTree).toBe(blendTree);
        expect(data.weights).toHaveLength(2);
        done();
      });

      blendTree.update(0.016);
    });

    it('should emit transition started event', (done) => {
      const transition = {
        id: 'test-transition',
        name: 'Test Transition',
        fromAnimation: 'node1',
        toAnimation: 'node2',
        duration: 0.5,
        easing: 'linear',
        conditions: [],
        enabled: true
      };

      blendTree.transitions.set(transition.id, transition);

      blendTree.on('transition:started', (data) => {
        expect(data.blendTree).toBe(blendTree);
        expect(data.from).toBeDefined();
        expect(data.to).toBeDefined();
        done();
      });

      blendTree.startTransition('test-transition');
    });
  });

  describe('Serialization', () => {
    it('should serialize blend tree', () => {
      const serialized = blendTree.serialize();

      expect(serialized).toHaveProperty('id', 'test-blend-tree');
      expect(serialized).toHaveProperty('name', 'Test Blend Tree');
      expect(serialized).toHaveProperty('type', BlendType.LINEAR);
      expect(serialized).toHaveProperty('animations');
      expect(serialized).toHaveProperty('parameters');
      expect(serialized.animations).toHaveLength(2);
      expect(serialized.parameters).toHaveLength(1);
    });

    it('should deserialize blend tree', () => {
      const serialized = blendTree.serialize();
      const deserialized = BlendTree.deserialize(serialized);

      expect(deserialized).toBeInstanceOf(BlendTree);
      expect(deserialized.id).toBe('test-blend-tree');
      expect(deserialized.name).toBe('Test Blend Tree');
      expect(deserialized.type).toBe(BlendType.LINEAR);
      expect(deserialized.animationCount).toBe(2);
      expect(deserialized.parameterCount).toBe(1);
    });
  });

  describe('Blend Tree State', () => {
    it('should get current animation', () => {
      blendTree.update(0.016);
      const currentAnimation = blendTree.getCurrentAnimation();

      expect(currentAnimation).toBeInstanceOf(Animation);
    });

    it('should get current weights', () => {
      blendTree.update(0.016);
      const weights = blendTree.getCurrentWeights();

      expect(weights).toBeInstanceOf(Map);
      expect(weights.size).toBe(2);
    });

    it('should set enabled state', () => {
      blendTree.setEnabled(false);
      expect(blendTree.enabled).toBe(false);

      blendTree.setEnabled(true);
      expect(blendTree.enabled).toBe(true);
    });
  });

  describe('Blend Tree Performance', () => {
    it('should handle many animations efficiently', () => {
      const manyAnimationsConfig: BlendTreeConfig = {
        ...config,
        animations: []
      };

      // Create 100 animations
      for (let i = 0; i < 100; i++) {
        const animConfig: AnimationConfig = {
          id: `animation${i}`,
          name: `Animation ${i}`,
          duration: 2.0,
          loop: true,
          easing: 'linear',
          tracks: []
        };

        const animation = new Animation(animConfig);
        manyAnimationsConfig.animations.push({
          id: `node${i}`,
          animation,
          weight: 1.0 / 100,
          enabled: true
        });
      }

      const largeBlendTree = new BlendTree(manyAnimationsConfig);

      const startTime = performance.now();
      largeBlendTree.update(0.016);
      const endTime = performance.now();

      // Should complete within reasonable time (less than 16ms for 60fps)
      expect(endTime - startTime).toBeLessThan(16);
    });

    it('should handle complex parameter conditions', () => {
      const complexConfig: BlendTreeConfig = {
        ...config,
        type: BlendType.PARAMETER,
        parameters: [
          {
            id: 'speed',
            name: 'Speed',
            type: ParameterType.FLOAT,
            defaultValue: 0.5,
            minValue: 0.0,
            maxValue: 1.0,
            currentValue: 0.5
          },
          {
            id: 'direction',
            name: 'Direction',
            type: ParameterType.FLOAT,
            defaultValue: 0.0,
            minValue: -1.0,
            maxValue: 1.0,
            currentValue: 0.0
          }
        ],
        animations: [
          {
            id: 'node1',
            animation: config.animations[0].animation,
            weight: 0.7,
            enabled: true,
            metadata: {
              priority: 1,
              category: 'base',
              tags: [],
              conditions: [
                {
                  parameterId: 'speed',
                  operator: ConditionOperator.GREATER_THAN,
                  value: 0.3,
                  logic: 'and'
                },
                {
                  parameterId: 'direction',
                  operator: ConditionOperator.BETWEEN,
                  value: [-0.5, 0.5],
                  logic: 'and'
                }
              ]
            }
          }
        ]
      };

      const complexBlendTree = new BlendTree(complexConfig);
      complexBlendTree.setParameter('speed', 0.7);
      complexBlendTree.setParameter('direction', 0.2);

      expect(() => {
        complexBlendTree.update(0.016);
      }).not.toThrow();
    });
  });
}); 
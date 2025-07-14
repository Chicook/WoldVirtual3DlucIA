/**
 * Tests para FacialAnimation
 */

import { FacialAnimation, FacialAnimationConfig, MorphCategory, ExpressionCategory, PhonemeCategory } from '../FacialAnimation';
import { Vector3 } from '../../scene/math/Vector3';

describe('FacialAnimation', () => {
  let facialAnimation: FacialAnimation;
  let config: FacialAnimationConfig;

  beforeEach(() => {
    config = {
      id: 'test-facial',
      name: 'Test Facial Animation',
      morphTargets: [
        {
          id: 'eye-blink',
          name: 'Eye Blink',
          weight: 0.0,
          category: MorphCategory.EYES,
          vertices: [
            {
              index: 0,
              position: new Vector3(0, 0, 0),
              normal: new Vector3(0, 1, 0),
              weight: 1.0
            }
          ],
          enabled: true
        },
        {
          id: 'mouth-smile',
          name: 'Mouth Smile',
          weight: 0.0,
          category: MorphCategory.MOUTH,
          vertices: [
            {
              index: 1,
              position: new Vector3(0, 0, 0),
              normal: new Vector3(0, 1, 0),
              weight: 1.0
            }
          ],
          enabled: true
        }
      ],
      expressions: [
        {
          id: 'happy',
          name: 'Happy',
          description: 'Happy expression',
          morphTargets: [
            {
              morphTargetId: 'mouth-smile',
              weight: 1.0,
              duration: 0.5,
              easing: 'easeOut'
            }
          ],
          duration: 0.5,
          easing: 'easeOut',
          category: ExpressionCategory.HAPPY
        }
      ],
      emotions: [
        {
          id: 'joy',
          name: 'Joy',
          description: 'Joyful emotion',
          baseExpression: 'happy',
          intensity: 0.8,
          duration: 2.0,
          transitions: []
        }
      ],
      lipSync: {
        enabled: true,
        phonemes: [
          {
            id: 'ah',
            name: 'Ah',
            symbol: 'ɑ',
            category: PhonemeCategory.VOWEL,
            duration: 0.1,
            intensity: 1.0
          }
        ],
        visemes: [
          {
            id: 'ah-viseme',
            name: 'Ah Viseme',
            morphTargets: [
              {
                morphTargetId: 'mouth-smile',
                weight: 0.5,
                offset: 0.0
              }
            ],
            intensity: 1.0
          }
        ],
        mapping: [
          {
            phonemeId: 'ah',
            visemeId: 'ah-viseme',
            weight: 1.0
          }
        ],
        smoothing: 0.1,
        prediction: true
      },
      metadata: {
        category: 'human',
        complexity: 'medium',
        morphTargetCount: 2,
        expressionCount: 1,
        description: 'Test facial animation system'
      }
    };

    facialAnimation = new FacialAnimation(config);
  });

  describe('Constructor', () => {
    it('should create FacialAnimation instance', () => {
      expect(facialAnimation).toBeInstanceOf(FacialAnimation);
      expect(facialAnimation.id).toBe('test-facial');
      expect(facialAnimation.name).toBe('Test Facial Animation');
      expect(facialAnimation.morphTargetCount).toBe(2);
      expect(facialAnimation.expressionCount).toBe(1);
      expect(facialAnimation.emotionCount).toBe(1);
      expect(facialAnimation.enabled).toBe(true);
    });
  });

  describe('Morph Target Management', () => {
    it('should set morph target weight', () => {
      facialAnimation.setMorphTarget('eye-blink', 0.5);

      expect(facialAnimation.getMorphWeight('eye-blink')).toBe(0.5);
    });

    it('should clamp morph target weight', () => {
      facialAnimation.setMorphTarget('eye-blink', 2.0); // Above max
      expect(facialAnimation.getMorphWeight('eye-blink')).toBe(1.0);

      facialAnimation.setMorphTarget('eye-blink', -1.0); // Below min
      expect(facialAnimation.getMorphWeight('eye-blink')).toBe(0.0);
    });

    it('should emit morph updated event', (done) => {
      facialAnimation.on('morph:updated', (data) => {
        expect(data.facial).toBe(facialAnimation);
        expect(data.morphTarget).toBe('eye-blink');
        expect(data.weight).toBe(0.5);
        done();
      });

      facialAnimation.setMorphTarget('eye-blink', 0.5);
    });
  });

  describe('Expression Management', () => {
    it('should set expression', () => {
      facialAnimation.setExpression('happy', 0.8);

      expect(facialAnimation.getExpressionWeight('happy')).toBe(0.8);
    });

    it('should clamp expression weight', () => {
      facialAnimation.setExpression('happy', 2.0); // Above max
      expect(facialAnimation.getExpressionWeight('happy')).toBe(1.0);

      facialAnimation.setExpression('happy', -1.0); // Below min
      expect(facialAnimation.getExpressionWeight('happy')).toBe(0.0);
    });

    it('should emit expression changed event', (done) => {
      facialAnimation.on('expression:changed', (data) => {
        expect(data.facial).toBe(facialAnimation);
        expect(data.expression).toBe('happy');
        expect(data.weight).toBe(0.8);
        done();
      });

      facialAnimation.setExpression('happy', 0.8);
    });
  });

  describe('Emotion Management', () => {
    it('should set emotion', () => {
      facialAnimation.setEmotion('joy', 0.6);

      expect(facialAnimation.getEmotionIntensity('joy')).toBe(0.6);
    });

    it('should clamp emotion intensity', () => {
      facialAnimation.setEmotion('joy', 2.0); // Above max
      expect(facialAnimation.getEmotionIntensity('joy')).toBe(1.0);

      facialAnimation.setEmotion('joy', -1.0); // Below min
      expect(facialAnimation.getEmotionIntensity('joy')).toBe(0.0);
    });

    it('should emit emotion changed event', (done) => {
      facialAnimation.on('emotion:changed', (data) => {
        expect(data.facial).toBe(facialAnimation);
        expect(data.emotion).toBeDefined();
        expect(data.intensity).toBe(0.6);
        done();
      });

      facialAnimation.setEmotion('joy', 0.6);
    });
  });

  describe('Lip Sync', () => {
    it('should start lip sync', (done) => {
      facialAnimation.on('lipSync:started', (data) => {
        expect(data.facial).toBe(facialAnimation);
        expect(data.audio).toBe('test-audio');
        done();
      });

      facialAnimation.startLipSync('test-audio');
      expect(facialAnimation.lipSyncActive).toBe(true);
    });

    it('should stop lip sync', (done) => {
      facialAnimation.startLipSync('test-audio');

      facialAnimation.on('lipSync:stopped', (data) => {
        expect(data.facial).toBe(facialAnimation);
        done();
      });

      facialAnimation.stopLipSync();
      expect(facialAnimation.lipSyncActive).toBe(false);
    });

    it('should set phoneme', () => {
      facialAnimation.setPhoneme('ah');
      expect((facialAnimation as any)._currentPhoneme).toBe('ah');
    });
  });

  describe('Blink System', () => {
    it('should configure blink', () => {
      const blinkConfig = {
        enabled: true,
        frequency: 5,
        duration: 0.2,
        asymmetry: 0.2,
        randomness: 0.5
      };

      facialAnimation.setBlinkConfig(blinkConfig);
      const config = facialAnimation.blinkConfig;

      expect(config.enabled).toBe(true);
      expect(config.frequency).toBe(5);
      expect(config.duration).toBe(0.2);
      expect(config.asymmetry).toBe(0.2);
      expect(config.randomness).toBe(0.5);
    });

    it('should emit blink event', (done) => {
      facialAnimation.setBlinkConfig({ enabled: true, frequency: 60, duration: 0.1 });

      facialAnimation.on('blink:triggered', (data) => {
        expect(data.facial).toBe(facialAnimation);
        expect(data.eye).toBe('both');
        done();
      });

      // Trigger multiple updates to cause a blink
      for (let i = 0; i < 10; i++) {
        facialAnimation.update(0.016);
      }
    });
  });

  describe('Facial Animation Update', () => {
    it('should update facial animation', () => {
      expect(() => {
        facialAnimation.update(0.016);
      }).not.toThrow();
    });

    it('should update with expressions', () => {
      facialAnimation.setExpression('happy', 0.5);
      
      expect(() => {
        facialAnimation.update(0.016);
      }).not.toThrow();
    });

    it('should update with emotions', () => {
      facialAnimation.setEmotion('joy', 0.7);
      
      expect(() => {
        facialAnimation.update(0.016);
      }).not.toThrow();
    });

    it('should update with lip sync', () => {
      facialAnimation.startLipSync('test-audio');
      facialAnimation.setPhoneme('ah');
      
      expect(() => {
        facialAnimation.update(0.016);
      }).not.toThrow();
    });

    it('should handle disabled state', () => {
      facialAnimation.setEnabled(false);
      
      expect(() => {
        facialAnimation.update(0.016);
      }).not.toThrow();
    });
  });

  describe('Reset Functionality', () => {
    it('should reset all morph targets', () => {
      facialAnimation.setMorphTarget('eye-blink', 0.5);
      facialAnimation.setMorphTarget('mouth-smile', 0.3);
      facialAnimation.setExpression('happy', 0.8);
      facialAnimation.setEmotion('joy', 0.6);

      facialAnimation.reset();

      expect(facialAnimation.getMorphWeight('eye-blink')).toBe(0.0);
      expect(facialAnimation.getMorphWeight('mouth-smile')).toBe(0.0);
      expect(facialAnimation.getExpressionWeight('happy')).toBe(0.0);
      expect(facialAnimation.getEmotionIntensity('joy')).toBe(0.0);
    });
  });

  describe('Facial Animation Events', () => {
    it('should emit morph updated event', (done) => {
      facialAnimation.on('morph:updated', (data) => {
        expect(data.facial).toBe(facialAnimation);
        expect(data.morphTarget).toBe('eye-blink');
        expect(data.weight).toBe(0.5);
        done();
      });

      facialAnimation.setMorphTarget('eye-blink', 0.5);
    });

    it('should emit expression changed event', (done) => {
      facialAnimation.on('expression:changed', (data) => {
        expect(data.facial).toBe(facialAnimation);
        expect(data.expression).toBe('happy');
        expect(data.weight).toBe(0.8);
        done();
      });

      facialAnimation.setExpression('happy', 0.8);
    });

    it('should emit emotion changed event', (done) => {
      facialAnimation.on('emotion:changed', (data) => {
        expect(data.facial).toBe(facialAnimation);
        expect(data.emotion).toBeDefined();
        expect(data.intensity).toBe(0.6);
        done();
      });

      facialAnimation.setEmotion('joy', 0.6);
    });

    it('should emit lip sync events', (done) => {
      let eventCount = 0;
      
      facialAnimation.on('lipSync:started', () => {
        eventCount++;
        if (eventCount === 2) done();
      });

      facialAnimation.on('lipSync:stopped', () => {
        eventCount++;
        if (eventCount === 2) done();
      });

      facialAnimation.startLipSync('test-audio');
      facialAnimation.stopLipSync();
    });

    it('should emit blink event', (done) => {
      facialAnimation.setBlinkConfig({ enabled: true, frequency: 60, duration: 0.1 });

      facialAnimation.on('blink:triggered', (data) => {
        expect(data.facial).toBe(facialAnimation);
        expect(data.eye).toBe('both');
        done();
      });

      // Trigger multiple updates to cause a blink
      for (let i = 0; i < 10; i++) {
        facialAnimation.update(0.016);
      }
    });
  });

  describe('Serialization', () => {
    it('should serialize facial animation', () => {
      facialAnimation.setMorphTarget('eye-blink', 0.5);
      facialAnimation.setExpression('happy', 0.8);
      facialAnimation.setEmotion('joy', 0.6);

      const serialized = facialAnimation.serialize();

      expect(serialized).toHaveProperty('id', 'test-facial');
      expect(serialized).toHaveProperty('name', 'Test Facial Animation');
      expect(serialized).toHaveProperty('morphTargets');
      expect(serialized).toHaveProperty('expressions');
      expect(serialized).toHaveProperty('emotions');
      expect(serialized).toHaveProperty('lipSync');
      expect(serialized).toHaveProperty('currentExpression', 'happy');
      expect(serialized).toHaveProperty('currentEmotion', 'joy');
      expect(serialized).toHaveProperty('morphWeights');
      expect(serialized.morphWeights['eye-blink']).toBe(0.5);
    });

    it('should deserialize facial animation', () => {
      facialAnimation.setMorphTarget('eye-blink', 0.5);
      facialAnimation.setExpression('happy', 0.8);
      facialAnimation.setEmotion('joy', 0.6);

      const serialized = facialAnimation.serialize();
      const deserialized = FacialAnimation.deserialize(serialized);

      expect(deserialized).toBeInstanceOf(FacialAnimation);
      expect(deserialized.id).toBe('test-facial');
      expect(deserialized.name).toBe('Test Facial Animation');
      expect(deserialized.morphTargetCount).toBe(2);
      expect(deserialized.expressionCount).toBe(1);
      expect(deserialized.emotionCount).toBe(1);
      expect(deserialized.getMorphWeight('eye-blink')).toBe(0.5);
      expect(deserialized.getExpressionWeight('happy')).toBe(0.8);
      expect(deserialized.getEmotionIntensity('joy')).toBe(0.6);
    });
  });

  describe('Facial Animation Performance', () => {
    it('should handle many morph targets efficiently', () => {
      const manyMorphTargetsConfig: FacialAnimationConfig = {
        ...config,
        morphTargets: []
      };

      // Create 100 morph targets
      for (let i = 0; i < 100; i++) {
        manyMorphTargetsConfig.morphTargets.push({
          id: `morph${i}`,
          name: `Morph ${i}`,
          weight: 0.0,
          category: MorphCategory.CUSTOM,
          vertices: [
            {
              index: i,
              position: new Vector3(0, 0, 0),
              normal: new Vector3(0, 1, 0),
              weight: 1.0
            }
          ],
          enabled: true
        });
      }

      const largeFacialAnimation = new FacialAnimation(manyMorphTargetsConfig);

      const startTime = performance.now();
      largeFacialAnimation.update(0.016);
      const endTime = performance.now();

      // Should complete within reasonable time (less than 16ms for 60fps)
      expect(endTime - startTime).toBeLessThan(16);
    });

    it('should handle complex expressions efficiently', () => {
      const complexConfig: FacialAnimationConfig = {
        ...config,
        expressions: []
      };

      // Create 50 expressions
      for (let i = 0; i < 50; i++) {
        complexConfig.expressions.push({
          id: `expression${i}`,
          name: `Expression ${i}`,
          description: `Expression ${i} description`,
          morphTargets: [
            {
              morphTargetId: 'eye-blink',
              weight: 1.0,
              duration: 0.5,
              easing: 'easeOut'
            },
            {
              morphTargetId: 'mouth-smile',
              weight: 0.5,
              duration: 0.5,
              easing: 'easeOut'
            }
          ],
          duration: 0.5,
          easing: 'easeOut',
          category: ExpressionCategory.CUSTOM
        });
      }

      const complexFacialAnimation = new FacialAnimation(complexConfig);

      // Set multiple expressions
      for (let i = 0; i < 10; i++) {
        complexFacialAnimation.setExpression(`expression${i}`, 0.1);
      }

      const startTime = performance.now();
      complexFacialAnimation.update(0.016);
      const endTime = performance.now();

      // Should complete within reasonable time
      expect(endTime - startTime).toBeLessThan(16);
    });
  });

  describe('Facial Animation State', () => {
    it('should get current expression', () => {
      facialAnimation.setExpression('happy', 0.8);
      expect(facialAnimation.currentExpression).toBe('happy');
    });

    it('should get current emotion', () => {
      facialAnimation.setEmotion('joy', 0.6);
      expect(facialAnimation.currentEmotion).toBe('joy');
    });

    it('should get lip sync active state', () => {
      expect(facialAnimation.lipSyncActive).toBe(false);
      
      facialAnimation.startLipSync('test-audio');
      expect(facialAnimation.lipSyncActive).toBe(true);
      
      facialAnimation.stopLipSync();
      expect(facialAnimation.lipSyncActive).toBe(false);
    });

    it('should get blink config', () => {
      const config = facialAnimation.blinkConfig;
      expect(config).toBeDefined();
      expect(config.enabled).toBe(true);
      expect(config.frequency).toBe(3);
      expect(config.duration).toBe(0.15);
    });
  });
}); 
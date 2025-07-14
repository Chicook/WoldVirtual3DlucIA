/**
 * Tests para AnimationManager
 */

import { AnimationManager } from '../AnimationManager';
import { Animation, AnimationConfig, AnimationTrack, Keyframe } from '../AnimationManager';
import { Vector3 } from '../../scene/math/Vector3';
import { Quaternion } from '../../scene/math/Quaternion';

describe('AnimationManager', () => {
  let animationManager: AnimationManager;

  beforeEach(() => {
    animationManager = new AnimationManager();
  });

  describe('Constructor', () => {
    it('should create AnimationManager instance', () => {
      expect(animationManager).toBeInstanceOf(AnimationManager);
      expect(animationManager.enabled).toBe(true);
      expect(animationManager.animationCount).toBe(0);
    });
  });

  describe('Animation Management', () => {
    it('should add animation', () => {
      const config: AnimationConfig = {
        id: 'test-animation',
        name: 'Test Animation',
        duration: 2.0,
        loop: true,
        easing: 'linear',
        tracks: []
      };

      const animation = new Animation(config);
      animationManager.addAnimation(animation);

      expect(animationManager.animationCount).toBe(1);
      expect(animationManager.getAnimation('test-animation')).toBe(animation);
    });

    it('should remove animation', () => {
      const config: AnimationConfig = {
        id: 'test-animation',
        name: 'Test Animation',
        duration: 2.0,
        loop: true,
        easing: 'linear',
        tracks: []
      };

      const animation = new Animation(config);
      animationManager.addAnimation(animation);
      animationManager.removeAnimation('test-animation');

      expect(animationManager.animationCount).toBe(0);
      expect(animationManager.getAnimation('test-animation')).toBeNull();
    });

    it('should get animation by name', () => {
      const config: AnimationConfig = {
        id: 'test-animation',
        name: 'Test Animation',
        duration: 2.0,
        loop: true,
        easing: 'linear',
        tracks: []
      };

      const animation = new Animation(config);
      animationManager.addAnimation(animation);

      expect(animationManager.getAnimationByName('Test Animation')).toBe(animation);
    });
  });

  describe('Animation Playback', () => {
    it('should play animation', () => {
      const config: AnimationConfig = {
        id: 'test-animation',
        name: 'Test Animation',
        duration: 2.0,
        loop: true,
        easing: 'linear',
        tracks: []
      };

      const animation = new Animation(config);
      animationManager.addAnimation(animation);
      animationManager.play('test-animation');

      expect(animationManager.isPlaying('test-animation')).toBe(true);
    });

    it('should pause animation', () => {
      const config: AnimationConfig = {
        id: 'test-animation',
        name: 'Test Animation',
        duration: 2.0,
        loop: true,
        easing: 'linear',
        tracks: []
      };

      const animation = new Animation(config);
      animationManager.addAnimation(animation);
      animationManager.play('test-animation');
      animationManager.pause('test-animation');

      expect(animationManager.isPaused('test-animation')).toBe(true);
    });

    it('should stop animation', () => {
      const config: AnimationConfig = {
        id: 'test-animation',
        name: 'Test Animation',
        duration: 2.0,
        loop: true,
        easing: 'linear',
        tracks: []
      };

      const animation = new Animation(config);
      animationManager.addAnimation(animation);
      animationManager.play('test-animation');
      animationManager.stop('test-animation');

      expect(animationManager.isStopped('test-animation')).toBe(true);
    });

    it('should set animation time', () => {
      const config: AnimationConfig = {
        id: 'test-animation',
        name: 'Test Animation',
        duration: 2.0,
        loop: true,
        easing: 'linear',
        tracks: []
      };

      const animation = new Animation(config);
      animationManager.addAnimation(animation);
      animationManager.setTime('test-animation', 1.0);

      expect(animationManager.getTime('test-animation')).toBe(1.0);
    });

    it('should set animation speed', () => {
      const config: AnimationConfig = {
        id: 'test-animation',
        name: 'Test Animation',
        duration: 2.0,
        loop: true,
        easing: 'linear',
        tracks: []
      };

      const animation = new Animation(config);
      animationManager.addAnimation(animation);
      animationManager.setSpeed('test-animation', 2.0);

      expect(animationManager.getSpeed('test-animation')).toBe(2.0);
    });
  });

  describe('Animation Blending', () => {
    it('should blend animations', () => {
      const config1: AnimationConfig = {
        id: 'animation1',
        name: 'Animation 1',
        duration: 2.0,
        loop: true,
        easing: 'linear',
        tracks: []
      };

      const config2: AnimationConfig = {
        id: 'animation2',
        name: 'Animation 2',
        duration: 2.0,
        loop: true,
        easing: 'linear',
        tracks: []
      };

      const animation1 = new Animation(config1);
      const animation2 = new Animation(config2);

      animationManager.addAnimation(animation1);
      animationManager.addAnimation(animation2);

      animationManager.play('animation1');
      animationManager.play('animation2');

      const blendResult = animationManager.blend(['animation1', 'animation2'], [0.7, 0.3]);

      expect(blendResult).toBeDefined();
      expect(blendResult.animation).toBeInstanceOf(Animation);
      expect(blendResult.weight).toBe(1.0);
    });
  });

  describe('Animation Events', () => {
    it('should emit play event', (done) => {
      const config: AnimationConfig = {
        id: 'test-animation',
        name: 'Test Animation',
        duration: 2.0,
        loop: true,
        easing: 'linear',
        tracks: []
      };

      const animation = new Animation(config);
      animationManager.addAnimation(animation);

      animationManager.on('animation:played', (data) => {
        expect(data.animation).toBe(animation);
        expect(data.manager).toBe(animationManager);
        done();
      });

      animationManager.play('test-animation');
    });

    it('should emit pause event', (done) => {
      const config: AnimationConfig = {
        id: 'test-animation',
        name: 'Test Animation',
        duration: 2.0,
        loop: true,
        easing: 'linear',
        tracks: []
      };

      const animation = new Animation(config);
      animationManager.addAnimation(animation);
      animationManager.play('test-animation');

      animationManager.on('animation:paused', (data) => {
        expect(data.animation).toBe(animation);
        expect(data.manager).toBe(animationManager);
        done();
      });

      animationManager.pause('test-animation');
    });

    it('should emit stop event', (done) => {
      const config: AnimationConfig = {
        id: 'test-animation',
        name: 'Test Animation',
        duration: 2.0,
        loop: true,
        easing: 'linear',
        tracks: []
      };

      const animation = new Animation(config);
      animationManager.addAnimation(animation);
      animationManager.play('test-animation');

      animationManager.on('animation:stopped', (data) => {
        expect(data.animation).toBe(animation);
        expect(data.manager).toBe(animationManager);
        done();
      });

      animationManager.stop('test-animation');
    });
  });

  describe('Animation Serialization', () => {
    it('should serialize animation manager', () => {
      const config: AnimationConfig = {
        id: 'test-animation',
        name: 'Test Animation',
        duration: 2.0,
        loop: true,
        easing: 'linear',
        tracks: []
      };

      const animation = new Animation(config);
      animationManager.addAnimation(animation);

      const serialized = animationManager.serialize();

      expect(serialized).toHaveProperty('id');
      expect(serialized).toHaveProperty('enabled');
      expect(serialized).toHaveProperty('animations');
      expect(serialized.animations).toHaveLength(1);
    });

    it('should deserialize animation manager', () => {
      const config: AnimationConfig = {
        id: 'test-animation',
        name: 'Test Animation',
        duration: 2.0,
        loop: true,
        easing: 'linear',
        tracks: []
      };

      const animation = new Animation(config);
      animationManager.addAnimation(animation);

      const serialized = animationManager.serialize();
      const deserialized = AnimationManager.deserialize(serialized);

      expect(deserialized).toBeInstanceOf(AnimationManager);
      expect(deserialized.animationCount).toBe(1);
      expect(deserialized.getAnimation('test-animation')).toBeDefined();
    });
  });
});

describe('Animation', () => {
  describe('Constructor', () => {
    it('should create Animation instance', () => {
      const config: AnimationConfig = {
        id: 'test-animation',
        name: 'Test Animation',
        duration: 2.0,
        loop: true,
        easing: 'linear',
        tracks: []
      };

      const animation = new Animation(config);

      expect(animation).toBeInstanceOf(Animation);
      expect(animation.id).toBe('test-animation');
      expect(animation.name).toBe('Test Animation');
      expect(animation.duration).toBe(2.0);
      expect(animation.loop).toBe(true);
      expect(animation.easing).toBe('linear');
    });
  });

  describe('Animation Tracks', () => {
    it('should add track', () => {
      const config: AnimationConfig = {
        id: 'test-animation',
        name: 'Test Animation',
        duration: 2.0,
        loop: true,
        easing: 'linear',
        tracks: []
      };

      const animation = new Animation(config);
      const track: AnimationTrack = {
        id: 'position-track',
        target: 'cube',
        property: 'position',
        keyframes: [],
        interpolation: 'linear'
      };

      animation.addTrack(track);

      expect(animation.trackCount).toBe(1);
      expect(animation.getTrack('position-track')).toBe(track);
    });

    it('should remove track', () => {
      const config: AnimationConfig = {
        id: 'test-animation',
        name: 'Test Animation',
        duration: 2.0,
        loop: true,
        easing: 'linear',
        tracks: []
      };

      const animation = new Animation(config);
      const track: AnimationTrack = {
        id: 'position-track',
        target: 'cube',
        property: 'position',
        keyframes: [],
        interpolation: 'linear'
      };

      animation.addTrack(track);
      animation.removeTrack('position-track');

      expect(animation.trackCount).toBe(0);
      expect(animation.getTrack('position-track')).toBeNull();
    });
  });

  describe('Animation Keyframes', () => {
    it('should add keyframe', () => {
      const config: AnimationConfig = {
        id: 'test-animation',
        name: 'Test Animation',
        duration: 2.0,
        loop: true,
        easing: 'linear',
        tracks: []
      };

      const animation = new Animation(config);
      const track: AnimationTrack = {
        id: 'position-track',
        target: 'cube',
        property: 'position',
        keyframes: [],
        interpolation: 'linear'
      };

      animation.addTrack(track);

      const keyframe: Keyframe = {
        time: 0.0,
        value: new Vector3(0, 0, 0),
        easing: 'linear',
        tension: 0.5,
        continuity: 0.5,
        bias: 0.5
      };

      animation.addKeyframe('position-track', keyframe);

      expect(animation.getKeyframeCount('position-track')).toBe(1);
    });

    it('should remove keyframe', () => {
      const config: AnimationConfig = {
        id: 'test-animation',
        name: 'Test Animation',
        duration: 2.0,
        loop: true,
        easing: 'linear',
        tracks: []
      };

      const animation = new Animation(config);
      const track: AnimationTrack = {
        id: 'position-track',
        target: 'cube',
        property: 'position',
        keyframes: [],
        interpolation: 'linear'
      };

      animation.addTrack(track);

      const keyframe: Keyframe = {
        time: 0.0,
        value: new Vector3(0, 0, 0),
        easing: 'linear',
        tension: 0.5,
        continuity: 0.5,
        bias: 0.5
      };

      animation.addKeyframe('position-track', keyframe);
      animation.removeKeyframe('position-track', 0.0);

      expect(animation.getKeyframeCount('position-track')).toBe(0);
    });
  });

  describe('Animation Serialization', () => {
    it('should serialize animation', () => {
      const config: AnimationConfig = {
        id: 'test-animation',
        name: 'Test Animation',
        duration: 2.0,
        loop: true,
        easing: 'linear',
        tracks: []
      };

      const animation = new Animation(config);
      const serialized = animation.serialize();

      expect(serialized).toHaveProperty('id', 'test-animation');
      expect(serialized).toHaveProperty('name', 'Test Animation');
      expect(serialized).toHaveProperty('duration', 2.0);
      expect(serialized).toHaveProperty('loop', true);
      expect(serialized).toHaveProperty('easing', 'linear');
    });

    it('should deserialize animation', () => {
      const config: AnimationConfig = {
        id: 'test-animation',
        name: 'Test Animation',
        duration: 2.0,
        loop: true,
        easing: 'linear',
        tracks: []
      };

      const animation = new Animation(config);
      const serialized = animation.serialize();
      const deserialized = Animation.deserialize(serialized);

      expect(deserialized).toBeInstanceOf(Animation);
      expect(deserialized.id).toBe('test-animation');
      expect(deserialized.name).toBe('Test Animation');
      expect(deserialized.duration).toBe(2.0);
      expect(deserialized.loop).toBe(true);
      expect(deserialized.easing).toBe('linear');
    });
  });
}); 
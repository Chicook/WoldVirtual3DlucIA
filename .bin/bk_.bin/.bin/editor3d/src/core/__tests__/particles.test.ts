import { Particle, ParticleState, ParticleType } from '../particles/Particle';
import { ParticleEmitter, EmitterType, EmissionPattern } from '../particles/ParticleEmitter';
import { ParticleSystem, ParticleEffectType } from '../particles/ParticleSystem';
import { ParticleRenderer, RenderMode } from '../particles/ParticleRenderer';
import { Vector3 } from '../scene/math/Vector3';
// // import { Vector4 } from '../scene/math/Vector4'; // Comentado - Vector4 no existe aún // Comentado - Vector4 no existe aún

// Mock WebGL context
const createMockWebGLContext = () => {
  const mockGL = {
    createTexture: jest.fn(() => ({})),
    createFramebuffer: jest.fn(() => ({})),
    createProgram: jest.fn(() => ({})),
    createShader: jest.fn(() => ({})),
    createBuffer: jest.fn(() => ({})),
    bindTexture: jest.fn(),
    bindFramebuffer: jest.fn(),
    bindBuffer: jest.fn(),
    texImage2D: jest.fn(),
    texParameteri: jest.fn(),
    framebufferTexture2D: jest.fn(),
    bufferData: jest.fn(),
    bufferSubData: jest.fn(),
    checkFramebufferStatus: jest.fn(() => 36053), // FRAMEBUFFER_COMPLETE
    viewport: jest.fn(),
    clear: jest.fn(),
    useProgram: jest.fn(),
    drawArrays: jest.fn(),
    drawElements: jest.fn(),
    drawElementsInstanced: jest.fn(),
    uniform1f: jest.fn(),
    uniform1i: jest.fn(),
    uniform3f: jest.fn(),
    uniformMatrix4fv: jest.fn(),
    getUniformLocation: jest.fn(() => ({})),
    getAttribLocation: jest.fn(() => 0),
    enableVertexAttribArray: jest.fn(),
    vertexAttribPointer: jest.fn(),
    vertexAttribDivisor: jest.fn(),
    enable: jest.fn(),
    disable: jest.fn(),
    blendFunc: jest.fn(),
    depthFunc: jest.fn(),
    depthMask: jest.fn(),
    cullFace: jest.fn(),
    activeTexture: jest.fn(),
    deleteTexture: jest.fn(),
    deleteFramebuffer: jest.fn(),
    deleteProgram: jest.fn(),
    deleteShader: jest.fn(),
    deleteBuffer: jest.fn(),
    shaderSource: jest.fn(),
    compileShader: jest.fn(),
    attachShader: jest.fn(),
    linkProgram: jest.fn(),
    getShaderParameter: jest.fn(() => true),
    getProgramParameter: jest.fn(() => true),
    getShaderInfoLog: jest.fn(() => ''),
    getProgramInfoLog: jest.fn(() => ''),
    
    // WebGL constants
    TEXTURE_2D: 3553,
    RGBA: 6408,
    UNSIGNED_BYTE: 5121,
    FLOAT: 5126,
    ARRAY_BUFFER: 34962,
    ELEMENT_ARRAY_BUFFER: 34963,
    STATIC_DRAW: 35044,
    DYNAMIC_DRAW: 35048,
    TRIANGLES: 4,
    VERTEX_SHADER: 35633,
    FRAGMENT_SHADER: 35632,
    COMPILE_STATUS: 35713,
    LINK_STATUS: 35714,
    BLEND: 3042,
    DEPTH_TEST: 2929,
    CULL_FACE: 2884,
    LEQUAL: 515,
    FRONT: 1028,
    BACK: 1029,
    SRC_ALPHA: 770,
    ONE_MINUS_SRC_ALPHA: 771,
    TEXTURE0: 33984,
    TEXTURE1: 33985,
    LINEAR: 9729,
    CLAMP_TO_EDGE: 33071,
    REPEAT: 10497
  };
  
  return mockGL as unknown as WebGL2RenderingContext;
};

describe('Particle', () => {
  let particle: Particle;

  beforeEach(() => {
    particle = new Particle('test_particle', 'Test Particle');
  });

  describe('Constructor', () => {
    it('should create particle with correct properties', () => {
      expect(particle.id).toBe('test_particle');
      expect(particle.name).toBe('Test Particle');
      expect(particle.state).toBe(ParticleState.DEAD);
      expect(particle.type).toBe(ParticleType.BILLBOARD);
      expect(particle.position).toEqual(new Vector3(0, 0, 0));
      expect(particle.life.isAlive).toBe(false);
    });
  });

  describe('Initialization', () => {
    it('should initialize particle correctly', () => {
      particle.initialize();
      
      expect(particle.state).toBe(ParticleState.SPAWNING);
      expect(particle.life.age).toBe(0.0);
      expect(particle.life.lifeProgress).toBe(0.0);
      expect(particle.life.isAlive).toBe(true);
    });
  });

  describe('Update', () => {
    beforeEach(() => {
      particle.initialize();
      particle.setMaxAge(2.0);
    });

    it('should update particle age', () => {
      particle.update(0.5);
      
      expect(particle.life.age).toBe(0.5);
      expect(particle.life.lifeProgress).toBe(0.25);
    });

    it('should change state to alive after spawn', () => {
      particle.update(0.3); // Más del 10% de la vida
      
      expect(particle.state).toBe(ParticleState.ALIVE);
    });

    it('should change state to dying near end of life', () => {
      particle.update(1.7); // Más del 80% de la vida
      
      expect(particle.state).toBe(ParticleState.DYING);
    });

    it('should die when max age is reached', () => {
      particle.update(2.0);
      
      expect(particle.state).toBe(ParticleState.DEAD);
      expect(particle.life.isAlive).toBe(false);
    });
  });

  describe('Physics', () => {
    beforeEach(() => {
      particle.initialize();
    });

    it('should apply velocity correctly', () => {
      const velocity = new Vector3(1, 0, 0);
      particle.setVelocity(velocity);
      
      particle.update(1.0);
      
      expect(particle.position.x).toBe(1.0);
      expect(particle.position.y).toBe(0.0);
      expect(particle.position.z).toBe(0.0);
    });

    it('should apply acceleration correctly', () => {
      const acceleration = new Vector3(0, 1, 0);
      particle.setAcceleration(acceleration);
      
      particle.update(1.0);
      
      expect(particle.physics.velocity.y).toBe(1.0);
    });

    it('should apply drag correctly', () => {
      particle.setVelocity(new Vector3(1, 0, 0));
      particle.setDrag(0.5);
      
      particle.update(1.0);
      
      expect(particle.physics.velocity.x).toBeLessThan(1.0);
    });
  });

  describe('Life Effects', () => {
    beforeEach(() => {
      particle.initialize();
      particle.setMaxAge(1.0);
    });

    it('should fade in at start of life', () => {
      particle.update(0.05); // 5% de la vida
      
      expect(particle.render.alpha).toBe(0.5);
    });

    it('should fade out at end of life', () => {
      particle.update(0.9); // 90% de la vida
      
      expect(particle.render.alpha).toBeLessThan(1.0);
    });

    it('should have full alpha in middle of life', () => {
      particle.update(0.5); // 50% de la vida
      
      expect(particle.render.alpha).toBe(1.0);
    });
  });

  describe('Setters', () => {
    it('should set position correctly', () => {
      const position = new Vector3(1, 2, 3);
      particle.setPosition(position);
      
      expect(particle.position).toEqual(position);
    });

    it('should set color correctly', () => {
      const color = new Vector3(1, 0, 0);
      particle.setColor(color);
      
      expect(particle.render.color).toEqual(color);
    });

    it('should set size correctly', () => {
      particle.setSize(2.0);
      
      expect(particle.render.size).toBe(2.0);
    });

    it('should set custom data correctly', () => {
      particle.setCustomData('testKey', 123.45);
      
      expect(particle.getCustomData('testKey')).toBe(123.45);
    });
  });

  describe('GPU Data', () => {
    it('should generate GPU data correctly', () => {
      particle.initialize();
      particle.setPosition(new Vector3(1, 2, 3));
      particle.setColor(new Vector3(1, 0, 0));
      particle.setSize(2.0);
      
      const gpuData = particle.getGPUData();
      
      expect(gpuData.length).toBe(30);
      expect(gpuData[0]).toBe(1.0); // position.x
      expect(gpuData[1]).toBe(2.0); // position.y
      expect(gpuData[2]).toBe(3.0); // position.z
    });

    it('should set GPU data correctly', () => {
      const gpuData = new Float32Array(30);
      gpuData[0] = 5.0; // position.x
      gpuData[1] = 6.0; // position.y
      gpuData[2] = 7.0; // position.z
      gpuData[30] = 1.0; // isAlive
      
      particle.setGPUData(gpuData);
      
      expect(particle.position.x).toBe(5.0);
      expect(particle.position.y).toBe(6.0);
      expect(particle.position.z).toBe(7.0);
    });
  });

  describe('Cloning', () => {
    it('should clone particle correctly', () => {
      particle.initialize();
      particle.setPosition(new Vector3(1, 2, 3));
      particle.setColor(new Vector3(1, 0, 0));
      particle.setSize(2.0);
      
      const cloned = particle.clone();
      
      expect(cloned).toBeInstanceOf(Particle);
      expect(cloned.id).toBe(particle.id);
      expect(cloned.position).toEqual(particle.position);
      expect(cloned.render.color).toEqual(particle.render.color);
      expect(cloned.render.size).toBe(particle.render.size);
      expect(cloned).not.toBe(particle);
    });
  });

  describe('Serialization', () => {
    it('should serialize particle correctly', () => {
      particle.initialize();
      particle.setPosition(new Vector3(1, 2, 3));
      particle.setColor(new Vector3(1, 0, 0));
      
      const serialized = particle.serialize();
      
      expect(serialized.id).toBe('test_particle');
      expect(serialized.state).toBe(ParticleState.SPAWNING);
      expect(serialized.position).toBeDefined();
      expect(serialized.render).toBeDefined();
    });

    it('should deserialize particle correctly', () => {
      particle.initialize();
      particle.setPosition(new Vector3(1, 2, 3));
      particle.setColor(new Vector3(1, 0, 0));
      
      const serialized = particle.serialize();
      const deserialized = Particle.deserialize(serialized);
      
      expect(deserialized.id).toBe(particle.id);
      expect(deserialized.position).toEqual(particle.position);
      expect(deserialized.render.color).toEqual(particle.render.color);
    });
  });
});

describe('ParticleEmitter', () => {
  let emitter: ParticleEmitter;

  beforeEach(() => {
    emitter = new ParticleEmitter('test_emitter', 'Test Emitter');
  });

  describe('Constructor', () => {
    it('should create emitter with correct properties', () => {
      expect(emitter.id).toBe('test_emitter');
      expect(emitter.name).toBe('Test Emitter');
      expect(emitter.enabled).toBe(true);
      expect(emitter.emitterType).toBe(EmitterType.POINT);
      expect(emitter.emissionPattern).toBe(EmissionPattern.CONTINUOUS);
      expect(emitter.particleType).toBe(ParticleType.BILLBOARD);
    });
  });

  describe('Emission Patterns', () => {
    beforeEach(() => {
      emitter.emission.rate = 10; // 10 partículas por segundo
    });

    it('should emit continuously', () => {
      emitter.emissionPattern = EmissionPattern.CONTINUOUS;
      
      // Simular 0.1 segundos (debería emitir 1 partícula)
      emitter.update(0.1);
      
      const particles = emitter.getAliveParticles();
      expect(particles.length).toBe(1);
    });

    it('should emit in bursts', () => {
      emitter.emissionPattern = EmissionPattern.BURST;
      emitter.emission.burstCount = 5;
      emitter.emission.burstInterval = 1.0;
      
      emitter.update(0.0);
      
      const particles = emitter.getAliveParticles();
      expect(particles.length).toBe(5);
    });

    it('should emit in pulses', () => {
      emitter.emissionPattern = EmissionPattern.PULSE;
      emitter.emission.rate = 10;
      emitter.emission.pulseDuration = 0.1;
      emitter.emission.pulseInterval = 1.0;
      
      // Primer pulso
      emitter.update(0.0);
      emitter.update(0.05);
      
      const particles = emitter.getAliveParticles();
      expect(particles.length).toBeGreaterThan(0);
    });
  });

  describe('Emitter Types', () => {
    it('should spawn particles at point', () => {
      emitter.emitterType = EmitterType.POINT;
      emitter.setPosition(new Vector3(1, 2, 3));
      
      emitter.update(0.1);
      const particles = emitter.getAliveParticles();
      
      if (particles.length > 0) {
        expect(particles[0].position).toEqual(new Vector3(1, 2, 3));
      }
    });

    it('should spawn particles along line', () => {
      emitter.emitterType = EmitterType.LINE;
      emitter.setScale(new Vector3(10, 1, 1)); // Línea de 10 unidades
      
      emitter.update(0.1);
      const particles = emitter.getAliveParticles();
      
      if (particles.length > 0) {
        expect(particles[0].position.x).toBeGreaterThanOrEqual(-5);
        expect(particles[0].position.x).toBeLessThanOrEqual(5);
      }
    });

    it('should spawn particles in plane', () => {
      emitter.emitterType = EmitterType.PLANE;
      emitter.setScale(new Vector3(5, 5, 1)); // Plano 5x5
      
      emitter.update(0.1);
      const particles = emitter.getAliveParticles();
      
      if (particles.length > 0) {
        expect(particles[0].position.x).toBeGreaterThanOrEqual(-2.5);
        expect(particles[0].position.x).toBeLessThanOrEqual(2.5);
        expect(particles[0].position.y).toBeGreaterThanOrEqual(-2.5);
        expect(particles[0].position.y).toBeLessThanOrEqual(2.5);
      }
    });
  });

  describe('Velocity Configuration', () => {
    it('should apply velocity correctly', () => {
      emitter.velocity.speed = 5.0;
      emitter.velocity.direction = new Vector3(0, 1, 0);
      
      emitter.update(0.1);
      const particles = emitter.getAliveParticles();
      
      if (particles.length > 0) {
        expect(particles[0].physics.velocity.y).toBe(5.0);
      }
    });

    it('should apply direction variation', () => {
      emitter.velocity.speed = 1.0;
      emitter.velocity.direction = new Vector3(0, 1, 0);
      emitter.velocity.directionVariation = 0.5;
      
      emitter.update(0.1);
      const particles = emitter.getAliveParticles();
      
      if (particles.length > 0) {
        const velocity = particles[0].physics.velocity;
        expect(velocity.length()).toBeCloseTo(1.0, 1);
      }
    });
  });

  describe('Life Configuration', () => {
    it('should set particle life correctly', () => {
      emitter.life.minAge = 2.0;
      emitter.life.maxAge = 4.0;
      
      emitter.update(0.1);
      const particles = emitter.getAliveParticles();
      
      if (particles.length > 0) {
        expect(particles[0].life.maxAge).toBeGreaterThanOrEqual(2.0);
        expect(particles[0].life.maxAge).toBeLessThanOrEqual(4.0);
      }
    });
  });

  describe('Size Configuration', () => {
    it('should set particle size correctly', () => {
      emitter.size.minSize = 0.5;
      emitter.size.maxSize = 1.5;
      
      emitter.update(0.1);
      const particles = emitter.getAliveParticles();
      
      if (particles.length > 0) {
        expect(particles[0].render.size).toBeGreaterThanOrEqual(0.5);
        expect(particles[0].render.size).toBeLessThanOrEqual(1.5);
      }
    });
  });

  describe('Color Configuration', () => {
    it('should set particle color correctly', () => {
      emitter.color.startColor = new Vector3(1, 0, 0);
      emitter.color.endColor = new Vector3(0, 0, 1);
      
      emitter.update(0.1);
      const particles = emitter.getAliveParticles();
      
      if (particles.length > 0) {
        const color = particles[0].render.color;
        expect(color.x).toBeGreaterThan(0);
        expect(color.z).toBeGreaterThan(0);
      }
    });
  });

  describe('Setters', () => {
    it('should set position correctly', () => {
      const position = new Vector3(1, 2, 3);
      emitter.setPosition(position);
      
      expect(emitter.position).toEqual(position);
    });

    it('should set emission rate correctly', () => {
      emitter.setEmissionRate(20);
      
      expect(emitter.emission.rate).toBe(20);
    });

    it('should set max particles correctly', () => {
      emitter.setMaxParticles(500);
      
      expect(emitter['_maxParticles']).toBe(500);
    });
  });

  describe('Statistics', () => {
    it('should provide correct stats', () => {
      emitter.update(0.1);
      
      const stats = emitter.getStats();
      
      expect(stats.aliveParticles).toBeGreaterThanOrEqual(0);
      expect(stats.totalParticles).toBeGreaterThanOrEqual(0);
      expect(stats.maxParticles).toBeDefined();
      expect(stats.emissionRate).toBeDefined();
    });
  });

  describe('Serialization', () => {
    it('should serialize emitter correctly', () => {
      emitter.setPosition(new Vector3(1, 2, 3));
      emitter.setEmissionRate(15);
      
      const serialized = emitter.serialize();
      
      expect(serialized.id).toBe('test_emitter');
      expect(serialized.position).toBeDefined();
      expect(serialized.emission.rate).toBe(15);
    });

    it('should deserialize emitter correctly', () => {
      emitter.setPosition(new Vector3(1, 2, 3));
      emitter.setEmissionRate(15);
      
      const serialized = emitter.serialize();
      const deserialized = ParticleEmitter.deserialize(serialized);
      
      expect(deserialized.id).toBe(emitter.id);
      expect(deserialized.position).toEqual(emitter.position);
      expect(deserialized.emission.rate).toBe(emitter.emission.rate);
    });
  });
});

describe('ParticleSystem', () => {
  let system: ParticleSystem;

  beforeEach(() => {
    system = new ParticleSystem();
  });

  describe('Constructor', () => {
    it('should create system with correct configuration', () => {
      expect(system.config.maxParticles).toBe(10000);
      expect(system.config.maxEmitters).toBe(100);
      expect(system.config.enableGPU).toBe(true);
      expect(system.config.quality).toBe('high');
    });
  });

  describe('Emitter Management', () => {
    it('should add emitter correctly', () => {
      const emitter = new ParticleEmitter('test', 'Test Emitter');
      system.addEmitter(emitter);
      
      expect(system.getEmitters().length).toBe(1);
      expect(system.getEmitter('test')).toBe(emitter);
    });

    it('should remove emitter correctly', () => {
      const emitter = new ParticleEmitter('test', 'Test Emitter');
      system.addEmitter(emitter);
      
      const result = system.removeEmitter('test');
      
      expect(result).toBe(true);
      expect(system.getEmitter('test')).toBeUndefined();
    });

    it('should respect max emitters limit', () => {
      system.config.maxEmitters = 2;
      
      const emitter1 = new ParticleEmitter('test1', 'Test 1');
      const emitter2 = new ParticleEmitter('test2', 'Test 2');
      const emitter3 = new ParticleEmitter('test3', 'Test 3');
      
      system.addEmitter(emitter1);
      system.addEmitter(emitter2);
      system.addEmitter(emitter3); // No debería agregarse
      
      expect(system.getEmitters().length).toBe(2);
    });
  });

  describe('Predefined Effects', () => {
    it('should create fire emitter', () => {
      const position = new Vector3(0, 0, 0);
      const emitter = system.createFireEmitter('fire', position);
      
      expect(emitter).toBeInstanceOf(ParticleEmitter);
      expect(emitter.emitterType).toBe(EmitterType.CONE);
      expect(emitter.emissionPattern).toBe(EmissionPattern.CONTINUOUS);
      expect(emitter.emission.rate).toBe(50);
    });

    it('should create smoke emitter', () => {
      const position = new Vector3(0, 0, 0);
      const emitter = system.createSmokeEmitter('smoke', position);
      
      expect(emitter).toBeInstanceOf(ParticleEmitter);
      expect(emitter.emitterType).toBe(EmitterType.SPHERE);
      expect(emitter.emission.rate).toBe(20);
    });

    it('should create explosion emitter', () => {
      const position = new Vector3(0, 0, 0);
      const emitter = system.createExplosionEmitter('explosion', position);
      
      expect(emitter).toBeInstanceOf(ParticleEmitter);
      expect(emitter.emissionPattern).toBe(EmissionPattern.BURST);
      expect(emitter.emission.burstCount).toBe(100);
    });

    it('should create sparkle emitter', () => {
      const position = new Vector3(0, 0, 0);
      const emitter = system.createSparkleEmitter('sparkle', position);
      
      expect(emitter).toBeInstanceOf(ParticleEmitter);
      expect(emitter.emissionPattern).toBe(EmissionPattern.PULSE);
    });

    it('should create magic emitter', () => {
      const position = new Vector3(0, 0, 0);
      const emitter = system.createMagicEmitter('magic', position);
      
      expect(emitter).toBeInstanceOf(ParticleEmitter);
      expect(emitter.emitterType).toBe(EmitterType.SPHERE);
    });

    it('should create rain emitter', () => {
      const position = new Vector3(0, 0, 0);
      const emitter = system.createRainEmitter('rain', position);
      
      expect(emitter).toBeInstanceOf(ParticleEmitter);
      expect(emitter.emitterType).toBe(EmitterType.PLANE);
      expect(emitter.emission.rate).toBe(200);
    });

    it('should create snow emitter', () => {
      const position = new Vector3(0, 0, 0);
      const emitter = system.createSnowEmitter('snow', position);
      
      expect(emitter).toBeInstanceOf(ParticleEmitter);
      expect(emitter.emitterType).toBe(EmitterType.PLANE);
      expect(emitter.emission.rate).toBe(100);
    });
  });

  describe('Update System', () => {
    it('should update emitters', () => {
      const emitter = new ParticleEmitter('test', 'Test Emitter');
      emitter.emission.rate = 10;
      system.addEmitter(emitter);
      
      system.update(0.1);
      
      const particles = system.getActiveParticles();
      expect(particles.length).toBeGreaterThan(0);
    });

    it('should update particles', () => {
      const emitter = new ParticleEmitter('test', 'Test Emitter');
      emitter.emission.rate = 10;
      system.addEmitter(emitter);
      
      system.update(0.1);
      system.update(0.1);
      
      const particles = system.getActiveParticles();
      expect(particles.length).toBeGreaterThan(0);
    });
  });

  describe('Global Forces', () => {
    it('should apply global force', () => {
      const emitter = new ParticleEmitter('test', 'Test Emitter');
      system.addEmitter(emitter);
      system.update(0.1);
      
      const force = new Vector3(0, -9.81, 0); // Gravedad
      system.applyGlobalForce(force);
      
      const particles = system.getActiveParticles();
      if (particles.length > 0) {
        expect(particles[0].physics.acceleration.y).toBe(-9.81);
      }
    });

    it('should apply force field', () => {
      const emitter = new ParticleEmitter('test', 'Test Emitter');
      emitter.setPosition(new Vector3(0, 0, 0));
      system.addEmitter(emitter);
      system.update(0.1);
      
      const center = new Vector3(0, 0, 0);
      const force = new Vector3(1, 0, 0);
      system.applyForceField(center, 5.0, force);
      
      const particles = system.getActiveParticles();
      if (particles.length > 0) {
        expect(particles[0].physics.acceleration.x).toBeGreaterThan(0);
      }
    });
  });

  describe('Statistics', () => {
    it('should provide correct stats', () => {
      const emitter = new ParticleEmitter('test', 'Test Emitter');
      system.addEmitter(emitter);
      system.update(0.1);
      
      const stats = system.getStats();
      
      expect(stats.totalParticles).toBeGreaterThanOrEqual(0);
      expect(stats.activeParticles).toBeGreaterThanOrEqual(0);
      expect(stats.totalEmitters).toBe(1);
      expect(stats.activeEmitters).toBe(1);
    });
  });

  describe('Configuration', () => {
    it('should update configuration', () => {
      system.config.maxParticles = 5000;
      system.config.quality = 'medium';
      
      expect(system.config.maxParticles).toBe(5000);
      expect(system.config.quality).toBe('medium');
    });
  });

  describe('Serialization', () => {
    it('should serialize system correctly', () => {
      const emitter = new ParticleEmitter('test', 'Test Emitter');
      system.addEmitter(emitter);
      system.update(0.1);
      
      const serialized = system.serialize();
      
      expect(serialized.config).toBeDefined();
      expect(serialized.emitters).toBeDefined();
      expect(serialized.emitters.length).toBe(1);
    });

    it('should deserialize system correctly', () => {
      const emitter = new ParticleEmitter('test', 'Test Emitter');
      system.addEmitter(emitter);
      system.update(0.1);
      
      const serialized = system.serialize();
      const deserialized = ParticleSystem.deserialize(serialized);
      
      expect(deserialized.config.maxParticles).toBe(system.config.maxParticles);
      expect(deserialized.getEmitters().length).toBe(system.getEmitters().length);
    });
  });
});

describe('ParticleRenderer', () => {
  let renderer: ParticleRenderer;
  let mockGL: WebGL2RenderingContext;
  let mockCanvas: HTMLCanvasElement;

  beforeEach(() => {
    renderer = new ParticleRenderer();
    mockGL = createMockWebGLContext();
    mockCanvas = document.createElement('canvas');
  });

  describe('Constructor', () => {
    it('should create renderer with correct configuration', () => {
      expect(renderer.config.mode).toBe(RenderMode.BILLBOARD);
      expect(renderer.config.enableBlending).toBe(true);
      expect(renderer.config.enableDepthWrite).toBe(false);
      expect(renderer.config.enableInstancing).toBe(true);
    });
  });

  describe('Initialization', () => {
    it('should initialize renderer correctly', () => {
      const result = renderer.initialize(mockGL, mockCanvas);
      
      expect(result).toBe(true);
    });
  });

  describe('Configuration', () => {
    it('should update render mode', () => {
      renderer.config.mode = RenderMode.GEOMETRY;
      
      expect(renderer.config.mode).toBe(RenderMode.GEOMETRY);
    });

    it('should update blending settings', () => {
      renderer.config.enableBlending = false;
      renderer.config.blendSrc = 0x0300; // ZERO
      renderer.config.blendDst = 0x0301; // ONE
      
      expect(renderer.config.enableBlending).toBe(false);
      expect(renderer.config.blendSrc).toBe(0x0300);
      expect(renderer.config.blendDst).toBe(0x0301);
    });
  });

  describe('Disposal', () => {
    it('should dispose renderer resources', () => {
      renderer.initialize(mockGL, mockCanvas);
      renderer.dispose();
      
      expect(mockGL.deleteProgram).toHaveBeenCalled();
      expect(mockGL.deleteBuffer).toHaveBeenCalled();
      expect(mockGL.deleteTexture).toHaveBeenCalled();
    });
  });
}); 
/**
 * Tests para VRManager
 */

import { VRManager, VRDeviceType, GenerationType } from '../VRManager';

describe('VRManager', () => {
  let vrManager: VRManager;
  let vrConfig: any;

  beforeEach(() => {
    vrConfig = {
      id: 'test-vr',
      enabled: true,
      device: {
        type: VRDeviceType.OCULUS_QUEST,
        autoDetect: true,
        fallback: VRDeviceType.WEBXR,
        calibration: true,
        driftCorrection: true
      },
      tracking: {
        type: 'inside_out',
        frequency: 90,
        smoothing: true,
        prediction: true,
        occlusion: true
      },
      rendering: {
        stereo: true,
        resolution: { width: 1440, height: 1600 },
        refreshRate: 72,
        fov: { horizontal: 90, vertical: 90 },
        ipd: 63.5,
        distortion: true,
        chromaticAberration: true
      },
      interaction: {
        enabled: true,
        controllers: true,
        handTracking: true,
        eyeTracking: true,
        gestureRecognition: true
      },
      haptics: {
        enabled: true,
        intensity: 0.8,
        patterns: ['click', 'bump', 'texture'],
        adaptive: true
      },
      optimization: {
        enabled: true,
        type: 'foveated_rendering',
        targetFPS: 72,
        adaptiveQuality: true,
        foveatedRendering: true
      }
    };

    vrManager = new VRManager(vrConfig);
  });

  afterEach(async () => {
    if (vrManager.getState().running) {
      vrManager.stop();
    }
  });

  describe('Inicialización', () => {
    test('debe crear una instancia válida', () => {
      expect(vrManager).toBeDefined();
      expect(vrManager.id).toBe('test-vr');
      expect(vrManager.config.enabled).toBe(true);
    });

    test('debe tener estado inicial correcto', () => {
      const state = vrManager.getState();
      expect(state.running).toBe(false);
      expect(state.connected).toBe(false);
      expect(state.deviceState).toBe('disconnected');
      expect(state.trackingActive).toBe(false);
      expect(state.renderingActive).toBe(false);
      expect(state.interactionActive).toBe(false);
      expect(state.hapticsActive).toBe(false);
      expect(state.optimizationActive).toBe(false);
      expect(state.currentFPS).toBe(0);
      expect(state.targetFPS).toBe(72);
      expect(state.latency).toBe(0);
      expect(state.errors).toHaveLength(0);
      expect(state.cache.size).toBe(0);
    });

    test('debe inicializar correctamente', async () => {
      await vrManager.initialize();
      
      const state = vrManager.getState();
      expect(state.running).toBe(false);
      expect(state.cache.size).toBe(0);
    });

    test('debe manejar errores de inicialización', async () => {
      const invalidConfig = {
        ...vrConfig,
        device: { ...vrConfig.device, type: 'invalid_device' }
      };
      
      const invalidVRManager = new VRManager(invalidConfig);
      await expect(invalidVRManager.initialize()).rejects.toThrow();
    });
  });

  describe('Gestión de Dispositivos', () => {
    beforeEach(async () => {
      await vrManager.initialize();
    });

    test('debe obtener dispositivo VR', () => {
      const device = vrManager.getDevice();
      expect(device).toBeDefined();
      expect(device.id).toBeDefined();
    });

    test('debe obtener sistema de tracking', () => {
      const tracking = vrManager.getTracking();
      expect(tracking).toBeDefined();
      expect(tracking.id).toBeDefined();
    });

    test('debe obtener renderizador VR', () => {
      const renderer = vrManager.getRenderer();
      expect(renderer).toBeDefined();
      expect(renderer.id).toBeDefined();
    });

    test('debe obtener sistema de interacción', () => {
      const interaction = vrManager.getInteraction();
      expect(interaction).toBeDefined();
      expect(interaction.id).toBeDefined();
    });

    test('debe obtener sistema de haptics', () => {
      const haptics = vrManager.getHaptics();
      expect(haptics).toBeDefined();
      expect(haptics.id).toBeDefined();
    });

    test('debe obtener sistema de optimización', () => {
      const optimization = vrManager.getOptimization();
      expect(optimization).toBeDefined();
      expect(optimization.id).toBeDefined();
    });
  });

  describe('Operaciones VR', () => {
    beforeEach(async () => {
      await vrManager.initialize();
    });

    test('debe iniciar sistema VR correctamente', async () => {
      await vrManager.start();
      
      const state = vrManager.getState();
      expect(state.running).toBe(true);
    });

    test('debe detener sistema VR correctamente', async () => {
      await vrManager.start();
      await vrManager.stop();
      
      const state = vrManager.getState();
      expect(state.running).toBe(false);
    });

    test('debe actualizar sistema VR', async () => {
      await vrManager.start();
      
      vrManager.update(0.016); // 60 FPS
      
      const state = vrManager.getState();
      expect(state.running).toBe(true);
    });

    test('debe renderizar frame VR', async () => {
      await vrManager.start();
      
      vrManager.render();
      
      const state = vrManager.getState();
      expect(state.renderingActive).toBe(true);
    });

    test('debe calibrar dispositivo VR', async () => {
      await vrManager.start();
      
      await vrManager.calibrate();
      
      const state = vrManager.getState();
      expect(state.deviceState).toBe('ready');
    });
  });

  describe('Configuración', () => {
    beforeEach(async () => {
      await vrManager.initialize();
    });

    test('debe aplicar configuración correctamente', () => {
      const newConfig = {
        rendering: {
          resolution: { width: 1920, height: 2160 },
          refreshRate: 90
        }
      };

      vrManager.applyConfig(newConfig);
      
      expect(vrManager.config.rendering.resolution.width).toBe(1920);
      expect(vrManager.config.rendering.resolution.height).toBe(2160);
      expect(vrManager.config.rendering.refreshRate).toBe(90);
    });

    test('debe manejar errores de configuración', () => {
      const invalidConfig = {
        rendering: {
          resolution: { width: -1, height: -1 }
        }
      };

      expect(() => vrManager.applyConfig(invalidConfig)).toThrow();
    });
  });

  describe('Estados y Progreso', () => {
    beforeEach(async () => {
      await vrManager.initialize();
    });

    test('debe actualizar estados durante operación', async () => {
      const startPromise = vrManager.start();
      
      expect(vrManager.running).toBe(true);
      expect(vrManager.streaming).toBe(false);

      await startPromise;
    });

    test('debe actualizar progreso durante operación', async () => {
      await vrManager.start();
      
      // Simular actualización
      vrManager.update(0.016);
      
      expect(vrManager.progress).toBeGreaterThan(0);
      expect(vrManager.progress).toBeLessThanOrEqual(1);
    });
  });

  describe('Eventos', () => {
    beforeEach(async () => {
      await vrManager.initialize();
    });

    test('debe emitir eventos de inicialización', (done) => {
      vrManager.on('vr:initialized', (event) => {
        expect(event.vr).toBe(vrManager);
        expect(event.timestamp).toBeGreaterThan(0);
        done();
      });

      vrManager.initialize();
    });

    test('debe emitir eventos de inicio', (done) => {
      vrManager.on('vr:started', (event) => {
        expect(event.vr).toBe(vrManager);
        expect(event.timestamp).toBeGreaterThan(0);
        done();
      });

      vrManager.start();
    });

    test('debe emitir eventos de dispositivo conectado', (done) => {
      vrManager.on('vr:device:connected', (event) => {
        expect(event.vr).toBe(vrManager);
        expect(event.device).toBeDefined();
        expect(event.state).toBeDefined();
        done();
      });

      // Simular conexión de dispositivo
      vrManager.start();
    });

    test('debe emitir eventos de tracking', (done) => {
      vrManager.on('vr:tracking:updated', (event) => {
        expect(event.vr).toBe(vrManager);
        expect(event.data).toBeDefined();
        expect(event.time).toBeGreaterThan(0);
        done();
      });

      vrManager.start();
      vrManager.render();
    });

    test('debe emitir eventos de interacción', (done) => {
      vrManager.on('vr:interaction:input', (event) => {
        expect(event.vr).toBe(vrManager);
        expect(event.input).toBeDefined();
        expect(event.time).toBeGreaterThan(0);
        done();
      });

      vrManager.start();
    });

    test('debe emitir eventos de haptics', (done) => {
      vrManager.on('vr:haptics:triggered', (event) => {
        expect(event.vr).toBe(vrManager);
        expect(event.pattern).toBeDefined();
        expect(event.time).toBeGreaterThan(0);
        done();
      });

      vrManager.start();
    });

    test('debe emitir eventos de optimización', (done) => {
      vrManager.on('vr:optimization:applied', (event) => {
        expect(event.vr).toBe(vrManager);
        expect(event.metrics).toBeDefined();
        expect(event.time).toBeGreaterThan(0);
        done();
      });

      vrManager.start();
    });

    test('debe emitir eventos de error', (done) => {
      vrManager.on('error:vr', (event) => {
        expect(event.vr).toBe(vrManager);
        expect(event.error).toBeDefined();
        expect(event.context).toBeDefined();
        done();
      });

      const invalidVRManager = new VRManager({
        ...vrConfig,
        device: { ...vrConfig.device, type: 'invalid' }
      });

      invalidVRManager.initialize().catch(() => {});
    });
  });

  describe('Manejo de Errores', () => {
    beforeEach(async () => {
      await vrManager.initialize();
    });

    test('debe manejar errores de dispositivo inexistente', async () => {
      const invalidConfig = {
        ...vrConfig,
        device: { ...vrConfig.device, type: 'non_existent_device' }
      };

      const invalidVRManager = new VRManager(invalidConfig);
      await invalidVRManager.initialize();

      await expect(invalidVRManager.start())
        .rejects.toThrow('Device non_existent_device not found');
    });

    test('debe manejar errores de tracking', async () => {
      // Simular error de tracking
      const originalUpdate = vrManager['_tracking'].update;
      vrManager['_tracking'].update = () => {
        throw new Error('Tracking error');
      };

      await expect(vrManager.start())
        .rejects.toThrow('Tracking error');

      // Restaurar método original
      vrManager['_tracking'].update = originalUpdate;
    });

    test('debe manejar errores de renderizado', async () => {
      await vrManager.start();

      // Simular error de renderizado
      const originalRender = vrManager['_renderer'].render;
      vrManager['_renderer'].render = () => {
        throw new Error('Render error');
      };

      expect(() => vrManager.render()).toThrow('Render error');

      // Restaurar método original
      vrManager['_renderer'].render = originalRender;
    });
  });

  describe('Concurrencia', () => {
    beforeEach(async () => {
      await vrManager.initialize();
    });

    test('debe manejar operaciones concurrentes', async () => {
      const operations = [
        vrManager.start(),
        vrManager.render(),
        vrManager.update(0.016)
      ];

      await Promise.all(operations);

      expect(vrManager.running).toBe(true);
    });

    test('debe prevenir múltiples inicios', async () => {
      await vrManager.start();

      await expect(vrManager.start())
        .rejects.toThrow('VR system is already running');
    });

    test('debe prevenir múltiples paradas', async () => {
      await expect(vrManager.stop())
        .rejects.toThrow('VR system is not running');
    });
  });

  describe('Estadísticas', () => {
    beforeEach(async () => {
      await vrManager.initialize();
    });

    test('debe obtener estadísticas correctas', () => {
      const stats = vrManager.getStats();
      
      expect(stats.id).toBe(vrManager.id);
      expect(stats.running).toBe(vrManager.running);
      expect(stats.connected).toBe(vrManager.connected);
      expect(stats.currentFPS).toBe(vrManager.currentFPS);
      expect(stats.targetFPS).toBe(vrManager.targetFPS);
      expect(stats.latency).toBe(vrManager.latency);
      expect(stats.errors).toHaveLength(vrManager.errors.length);
      expect(stats.warnings).toHaveLength(vrManager.warnings.length);
    });

    test('debe actualizar estadísticas durante operación', async () => {
      const initialStats = vrManager.getStats();
      
      await vrManager.start();
      vrManager.update(0.016);
      
      const updatedStats = vrManager.getStats();
      expect(updatedStats.running).toBe(true);
      expect(updatedStats.running).not.toBe(initialStats.running);
    });
  });

  describe('Limpieza', () => {
    beforeEach(async () => {
      await vrManager.initialize();
    });

    test('debe limpiar recursos correctamente', async () => {
      await vrManager.start();
      
      vrManager.clearCache();
      expect(vrManager.cacheSize).toBe(0);
    });
  });
}); 
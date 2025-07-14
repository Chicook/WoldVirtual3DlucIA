/**
 * VRManager - Gestor de Realidad Virtual y Aumentada
 * 
 * Gestiona dispositivos VR/AR, tracking, renderizado estereoscópico,
 * interacciones, haptics y optimizaciones específicas para VR/AR.
 */

import { EventEmitter } from '../events/EventEmitter';
import { VRDevice, VRDeviceType, VRDeviceState } from './VRDevice';
import { VRTracking, VRTrackingType, VRTrackingData } from './VRTracking';
import { VRRenderer, VRRenderConfig, VRStereoConfig } from './VRRenderer';
import { VRInteraction, VRInteractionType, VRInputData } from './VRInteraction';
import { VRHaptics, VRHapticType, VRHapticPattern } from './VRHaptics';
import { VROptimization, VROptimizationType } from './VROptimization';

export interface VRConfig {
  id: string;
  enabled: boolean;
  device: {
    type: VRDeviceType;
    autoDetect: boolean;
    fallback: VRDeviceType;
    calibration: boolean;
    driftCorrection: boolean;
  };
  tracking: {
    type: VRTrackingType;
    frequency: number;
    smoothing: boolean;
    prediction: boolean;
    occlusion: boolean;
  };
  rendering: {
    stereo: boolean;
    resolution: { width: number; height: number };
    refreshRate: number;
    fov: { horizontal: number; vertical: number };
    ipd: number;
    distortion: boolean;
    chromaticAberration: boolean;
  };
  interaction: {
    enabled: boolean;
    controllers: boolean;
    handTracking: boolean;
    eyeTracking: boolean;
    gestureRecognition: boolean;
  };
  haptics: {
    enabled: boolean;
    intensity: number;
    patterns: VRHapticPattern[];
    adaptive: boolean;
  };
  optimization: {
    enabled: boolean;
    type: VROptimizationType;
    targetFPS: number;
    adaptiveQuality: boolean;
    foveatedRendering: boolean;
  };
}

export interface VRState {
  running: boolean;
  connected: boolean;
  deviceState: VRDeviceState;
  trackingActive: boolean;
  renderingActive: boolean;
  interactionActive: boolean;
  hapticsActive: boolean;
  optimizationActive: boolean;
  currentFPS: number;
  targetFPS: number;
  latency: number;
  errors: Error[];
  warnings: string[];
  performance: {
    gpuTime: number;
    cpuTime: number;
    memoryUsage: number;
    drawCalls: number;
    triangles: number;
  };
}

export interface VREvent {
  vr: VRManager;
  timestamp: number;
  data?: any;
}

export interface VRDeviceEvent extends VREvent {
  device: VRDevice;
  state: VRDeviceState;
}

export interface VRTrackingEvent extends VREvent {
  tracking: VRTracking;
  data: VRTrackingData;
}

export interface VRInteractionEvent extends VREvent {
  interaction: VRInteraction;
  input: VRInputData;
}

export interface VRHapticEvent extends VREvent {
  haptics: VRHaptics;
  pattern: VRHapticPattern;
}

export interface VROptimizationEvent extends VREvent {
  optimization: VROptimization;
  metrics: any;
}

@Injectable()
export class VRManager extends EventEmitter {
  public readonly id: string;
  public readonly config: VRConfig;
  
  private _device: VRDevice;
  private _tracking: VRTracking;
  private _renderer: VRRenderer;
  private _interaction: VRInteraction;
  private _haptics: VRHaptics;
  private _optimization: VROptimization;
  
  private _state: VRState;
  private _running: boolean = false;
  private _connected: boolean = false;
  private _lastUpdate: number = 0;
  private _frameCount: number = 0;
  private _performanceMetrics: Map<string, number> = new Map();

  constructor(config: VRConfig) {
    super();
    this.id = config.id;
    this.config = config;
    
    this._initializeState();
    this._initializeComponents();
  }

  /**
   * Inicializa el sistema VR
   */
  public async initialize(): Promise<void> {
    try {
      this.logger.info(`Initializing VR system: ${this.id}`);

      // Inicializar componentes
      await this._device.initialize();
      await this._tracking.initialize();
      await this._renderer.initialize();
      await this._interaction.initialize();
      await this._haptics.initialize();
      await this._optimization.initialize();

      // Configurar eventos
      this._setupEventListeners();

      // Verificar conectividad
      await this._checkConnectivity();

      this.logger.info(`VR system initialized successfully: ${this.id}`);
      this.emit('vr:initialized', { vr: this, timestamp: Date.now() });

    } catch (error) {
      this.logger.error(`Failed to initialize VR system: ${error.message}`);
      this._state.errors.push(error);
      this.emit('error:initialization', { vr: this, error, timestamp: Date.now() });
      throw error;
    }
  }

  /**
   * Inicia el sistema VR
   */
  public async start(): Promise<void> {
    if (this._running) {
      this.logger.warn('VR system is already running');
      return;
    }

    try {
      this.logger.info(`Starting VR system: ${this.id}`);

      this._running = true;
      this._state.running = true;
      this._lastUpdate = Date.now();

      // Iniciar componentes
      await this._device.start();
      await this._tracking.start();
      await this._renderer.start();
      await this._interaction.start();
      await this._haptics.start();
      await this._optimization.start();

      // Iniciar loop de renderizado
      this._startRenderLoop();

      this.logger.info(`VR system started successfully: ${this.id}`);
      this.emit('vr:started', { vr: this, timestamp: Date.now() });

    } catch (error) {
      this.logger.error(`Failed to start VR system: ${error.message}`);
      this._state.errors.push(error);
      this.emit('error:start', { vr: this, error, timestamp: Date.now() });
      throw error;
    }
  }

  /**
   * Detiene el sistema VR
   */
  public async stop(): Promise<void> {
    if (!this._running) {
      this.logger.warn('VR system is not running');
      return;
    }

    try {
      this.logger.info(`Stopping VR system: ${this.id}`);

      this._running = false;
      this._state.running = false;

      // Detener componentes
      await this._device.stop();
      await this._tracking.stop();
      await this._renderer.stop();
      await this._interaction.stop();
      await this._haptics.stop();
      await this._optimization.stop();

      this.logger.info(`VR system stopped successfully: ${this.id}`);
      this.emit('vr:stopped', { vr: this, timestamp: Date.now() });

    } catch (error) {
      this.logger.error(`Failed to stop VR system: ${error.message}`);
      this._state.errors.push(error);
      this.emit('error:stop', { vr: this, error, timestamp: Date.now() });
      throw error;
    }
  }

  /**
   * Actualiza el sistema VR
   */
  public update(deltaTime: number): void {
    if (!this._running) return;

    try {
      const currentTime = Date.now();
      const frameTime = currentTime - this._lastUpdate;

      // Actualizar componentes
      this._device.update(deltaTime);
      this._tracking.update(deltaTime);
      this._renderer.update(deltaTime);
      this._interaction.update(deltaTime);
      this._haptics.update(deltaTime);
      this._optimization.update(deltaTime);

      // Actualizar métricas de rendimiento
      this._updatePerformanceMetrics(frameTime);

      // Actualizar estado
      this._updateState();

      this._lastUpdate = currentTime;
      this._frameCount++;

    } catch (error) {
      this.logger.error(`Error updating VR system: ${error.message}`);
      this._state.errors.push(error);
      this.emit('error:update', { vr: this, error, timestamp: Date.now() });
    }
  }

  /**
   * Renderiza el frame VR
   */
  public render(): void {
    if (!this._running || !this._connected) return;

    try {
      // Obtener datos de tracking
      const trackingData = this._tracking.getTrackingData();

      // Renderizar frame estereoscópico
      this._renderer.render(trackingData);

      // Aplicar optimizaciones
      this._optimization.applyOptimizations();

      // Emitir evento de frame
      this.emit('vr:frame', { 
        vr: this, 
        timestamp: Date.now(),
        data: { trackingData, frameCount: this._frameCount }
      });

    } catch (error) {
      this.logger.error(`Error rendering VR frame: ${error.message}`);
      this._state.errors.push(error);
      this.emit('error:render', { vr: this, error, timestamp: Date.now() });
    }
  }

  /**
   * Obtiene el estado actual del sistema VR
   */
  public getState(): VRState {
    return { ...this._state };
  }

  /**
   * Obtiene estadísticas del sistema VR
   */
  public getStats(): any {
    return {
      id: this.id,
      running: this._running,
      connected: this._connected,
      frameCount: this._frameCount,
      currentFPS: this._state.currentFPS,
      targetFPS: this._state.targetFPS,
      latency: this._state.latency,
      performance: this._state.performance,
      errors: this._state.errors.length,
      warnings: this._state.warnings.length,
      deviceStats: this._device.getStats(),
      trackingStats: this._tracking.getStats(),
      rendererStats: this._renderer.getStats(),
      interactionStats: this._interaction.getStats(),
      hapticsStats: this._haptics.getStats(),
      optimizationStats: this._optimization.getStats()
    };
  }

  /**
   * Calibra el dispositivo VR
   */
  public async calibrate(): Promise<void> {
    try {
      this.logger.info(`Calibrating VR device: ${this.id}`);
      
      await this._device.calibrate();
      await this._tracking.calibrate();
      
      this.logger.info(`VR device calibrated successfully: ${this.id}`);
      this.emit('vr:calibrated', { vr: this, timestamp: Date.now() });

    } catch (error) {
      this.logger.error(`Failed to calibrate VR device: ${error.message}`);
      this._state.errors.push(error);
      this.emit('error:calibration', { vr: this, error, timestamp: Date.now() });
      throw error;
    }
  }

  /**
   * Aplica configuración de VR
   */
  public applyConfig(config: Partial<VRConfig>): void {
    try {
      this.logger.info(`Applying VR configuration: ${this.id}`);

      // Actualizar configuración
      Object.assign(this.config, config);

      // Aplicar cambios a componentes
      this._device.applyConfig(config.device);
      this._tracking.applyConfig(config.tracking);
      this._renderer.applyConfig(config.rendering);
      this._interaction.applyConfig(config.interaction);
      this._haptics.applyConfig(config.haptics);
      this._optimization.applyConfig(config.optimization);

      this.logger.info(`VR configuration applied successfully: ${this.id}`);
      this.emit('vr:config:updated', { vr: this, config, timestamp: Date.now() });

    } catch (error) {
      this.logger.error(`Failed to apply VR configuration: ${error.message}`);
      this._state.errors.push(error);
      this.emit('error:config', { vr: this, error, timestamp: Date.now() });
      throw error;
    }
  }

  /**
   * Obtiene el dispositivo VR
   */
  public getDevice(): VRDevice {
    return this._device;
  }

  /**
   * Obtiene el sistema de tracking
   */
  public getTracking(): VRTracking {
    return this._tracking;
  }

  /**
   * Obtiene el renderizador VR
   */
  public getRenderer(): VRRenderer {
    return this._renderer;
  }

  /**
   * Obtiene el sistema de interacción
   */
  public getInteraction(): VRInteraction {
    return this._interaction;
  }

  /**
   * Obtiene el sistema de haptics
   */
  public getHaptics(): VRHaptics {
    return this._haptics;
  }

  /**
   * Obtiene el sistema de optimización
   */
  public getOptimization(): VROptimization {
    return this._optimization;
  }

  /**
   * Limpia recursos del sistema VR
   */
  public dispose(): void {
    try {
      this.logger.info(`Disposing VR system: ${this.id}`);

      this.stop();

      // Limpiar componentes
      this._device.dispose();
      this._tracking.dispose();
      this._renderer.dispose();
      this._interaction.dispose();
      this._haptics.dispose();
      this._optimization.dispose();

      // Limpiar estado
      this._state.errors = [];
      this._state.warnings = [];
      this._performanceMetrics.clear();

      this.logger.info(`VR system disposed successfully: ${this.id}`);
      this.emit('vr:disposed', { vr: this, timestamp: Date.now() });

    } catch (error) {
      this.logger.error(`Failed to dispose VR system: ${error.message}`);
      this.emit('error:dispose', { vr: this, error, timestamp: Date.now() });
    }
  }

  // Métodos privados

  private _initializeState(): void {
    this._state = {
      running: false,
      connected: false,
      deviceState: VRDeviceState.DISCONNECTED,
      trackingActive: false,
      renderingActive: false,
      interactionActive: false,
      hapticsActive: false,
      optimizationActive: false,
      currentFPS: 0,
      targetFPS: this.config.optimization.targetFPS,
      latency: 0,
      errors: [],
      warnings: [],
      performance: {
        gpuTime: 0,
        cpuTime: 0,
        memoryUsage: 0,
        drawCalls: 0,
        triangles: 0
      }
    };
  }

  private _initializeComponents(): void {
    this._device = new VRDevice(this.config.device);
    this._tracking = new VRTracking(this.config.tracking);
    this._renderer = new VRRenderer(this.config.rendering);
    this._interaction = new VRInteraction(this.config.interaction);
    this._haptics = new VRHaptics(this.config.haptics);
    this._optimization = new VROptimization(this.config.optimization);
  }

  private _setupEventListeners(): void {
    // Eventos del dispositivo
    this._device.on('device:connected', (event: VRDeviceEvent) => {
      this._connected = true;
      this._state.connected = true;
      this._state.deviceState = event.state;
      this.emit('vr:device:connected', event);
    });

    this._device.on('device:disconnected', (event: VRDeviceEvent) => {
      this._connected = false;
      this._state.connected = false;
      this._state.deviceState = event.state;
      this.emit('vr:device:disconnected', event);
    });

    // Eventos de tracking
    this._tracking.on('tracking:updated', (event: VRTrackingEvent) => {
      this._state.trackingActive = true;
      this.emit('vr:tracking:updated', event);
    });

    // Eventos de interacción
    this._interaction.on('interaction:input', (event: VRInteractionEvent) => {
      this._state.interactionActive = true;
      this.emit('vr:interaction:input', event);
    });

    // Eventos de haptics
    this._haptics.on('haptics:triggered', (event: VRHapticEvent) => {
      this._state.hapticsActive = true;
      this.emit('vr:haptics:triggered', event);
    });

    // Eventos de optimización
    this._optimization.on('optimization:applied', (event: VROptimizationEvent) => {
      this._state.optimizationActive = true;
      this.emit('vr:optimization:applied', event);
    });
  }

  private async _checkConnectivity(): Promise<void> {
    try {
      const isConnected = await this._device.isConnected();
      this._connected = isConnected;
      this._state.connected = isConnected;
      
      if (isConnected) {
        this._state.deviceState = VRDeviceState.CONNECTED;
        this.logger.info(`VR device connected: ${this.id}`);
      } else {
        this._state.deviceState = VRDeviceState.DISCONNECTED;
        this.logger.warn(`VR device not connected: ${this.id}`);
      }
    } catch (error) {
      this.logger.error(`Error checking VR connectivity: ${error.message}`);
      this._state.errors.push(error);
    }
  }

  private _startRenderLoop(): void {
    const renderLoop = () => {
      if (!this._running) return;

      const currentTime = performance.now();
      const deltaTime = (currentTime - this._lastUpdate) / 1000;

      this.update(deltaTime);
      this.render();

      requestAnimationFrame(renderLoop);
    };

    requestAnimationFrame(renderLoop);
  }

  private _updatePerformanceMetrics(frameTime: number): void {
    // Calcular FPS
    this._state.currentFPS = 1000 / frameTime;

    // Actualizar métricas de rendimiento
    this._state.performance.gpuTime = this._renderer.getGPUTime();
    this._state.performance.cpuTime = this._renderer.getCPUTime();
    this._state.performance.memoryUsage = this._renderer.getMemoryUsage();
    this._state.performance.drawCalls = this._renderer.getDrawCalls();
    this._state.performance.triangles = this._renderer.getTriangles();

    // Calcular latencia
    this._state.latency = this._tracking.getLatency();

    // Almacenar métricas
    this._performanceMetrics.set('fps', this._state.currentFPS);
    this._performanceMetrics.set('latency', this._state.latency);
    this._performanceMetrics.set('gpuTime', this._state.performance.gpuTime);
    this._performanceMetrics.set('cpuTime', this._state.performance.cpuTime);
  }

  private _updateState(): void {
    // Actualizar estados de componentes
    this._state.trackingActive = this._tracking.isActive();
    this._state.renderingActive = this._renderer.isActive();
    this._state.interactionActive = this._interaction.isActive();
    this._state.hapticsActive = this._haptics.isActive();
    this._state.optimizationActive = this._optimization.isActive();

    // Verificar advertencias
    if (this._state.currentFPS < this._state.targetFPS * 0.9) {
      const warning = `Low FPS: ${this._state.currentFPS.toFixed(1)} < ${this._state.targetFPS}`;
      if (!this._state.warnings.includes(warning)) {
        this._state.warnings.push(warning);
        this.emit('vr:warning', { vr: this, warning, timestamp: Date.now() });
      }
    }

    if (this._state.latency > 20) {
      const warning = `High latency: ${this._state.latency.toFixed(1)}ms`;
      if (!this._state.warnings.includes(warning)) {
        this._state.warnings.push(warning);
        this.emit('vr:warning', { vr: this, warning, timestamp: Date.now() });
      }
    }
  }
} 
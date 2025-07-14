/**
 * VRHaptics - Sistema de Feedback Háptico VR
 * 
 * Gestiona vibraciones, pulsos, texturas y patrones hápticos
 * para controladores y dispositivos VR.
 */

import { EventEmitter } from '../events/EventEmitter';

export enum VRHapticType {
  VIBRATION = 'vibration',
  PULSE = 'pulse',
  TEXTURE = 'texture',
  FORCE = 'force',
  TEMPERATURE = 'temperature',
  PRESSURE = 'pressure'
}

export interface VRHapticPattern {
  id: string;
  type: VRHapticType;
  duration: number;
  intensity: number;
  frequency: number;
  waveform: 'sine' | 'square' | 'triangle' | 'sawtooth' | 'custom';
  envelope: {
    attack: number;
    decay: number;
    sustain: number;
    release: number;
  };
  parameters: { [key: string]: any };
}

export interface VRHapticsConfig {
  enabled: boolean;
  intensity: number;
  patterns: VRHapticPattern[];
  adaptive: boolean;
  controllers: {
    enabled: boolean;
    left: boolean;
    right: boolean;
    intensity: number;
    patterns: string[];
  };
  gloves: {
    enabled: boolean;
    fingers: boolean;
    palm: boolean;
    intensity: number;
    patterns: string[];
  };
  suits: {
    enabled: boolean;
    bodyParts: string[];
    intensity: number;
    patterns: string[];
  };
  audio: {
    enabled: boolean;
    hapticAudio: boolean;
    frequency: number;
    volume: number;
  };
}

export interface VRHapticDevice {
  id: string;
  type: 'controller' | 'glove' | 'suit' | 'custom';
  position: { x: number; y: number; z: number };
  capabilities: VRHapticType[];
  maxIntensity: number;
  maxFrequency: number;
  connected: boolean;
  battery: number;
}

export interface VRHapticEvent {
  id: string;
  deviceId: string;
  pattern: VRHapticPattern;
  timestamp: number;
  duration: number;
  intensity: number;
  completed: boolean;
}

export interface VRHapticFeedback {
  deviceId: string;
  pattern: VRHapticPattern;
  startTime: number;
  endTime: number;
  intensity: number;
  active: boolean;
}

export interface VREvent {
  haptics: VRHaptics;
  timestamp: number;
  data?: any;
}

export interface VRHapticTriggeredEvent extends VREvent {
  event: VRHapticEvent;
  device: VRHapticDevice;
}

export interface VRHapticCompletedEvent extends VREvent {
  event: VRHapticEvent;
  device: VRHapticDevice;
}

@Injectable()
export class VRHaptics extends EventEmitter {
  public readonly id: string;
  public readonly config: VRHapticsConfig;
  
  private _devices: Map<string, VRHapticDevice> = new Map();
  private _patterns: Map<string, VRHapticPattern> = new Map();
  private _activeFeedback: Map<string, VRHapticFeedback> = new Map();
  private _active: boolean = false;
  private _lastUpdate: number = 0;
  private _errors: Error[] = [];
  private _warnings: string[] = [];

  constructor(config: VRHapticsConfig) {
    super();
    this.id = `vr-haptics-${Date.now()}`;
    this.config = config;
    
    this._initializePatterns();
  }

  /**
   * Inicializa el sistema háptico
   */
  public async initialize(): Promise<void> {
    try {
      this.logger.info(`Initializing VR haptics: ${this.id}`);

      // Configurar controladores
      if (this.config.controllers.enabled) {
        await this._setupControllers();
      }

      // Configurar guantes
      if (this.config.gloves.enabled) {
        await this._setupGloves();
      }

      // Configurar trajes
      if (this.config.suits.enabled) {
        await this._setupSuits();
      }

      // Configurar audio háptico
      if (this.config.audio.enabled) {
        await this._setupHapticAudio();
      }

      this.logger.info(`VR haptics initialized successfully: ${this.id}`);
      this.emit('haptics:initialized', { haptics: this, timestamp: Date.now() });

    } catch (error) {
      this.logger.error(`Failed to initialize VR haptics: ${error.message}`);
      this._errors.push(error);
      this.emit('error:initialization', { haptics: this, error, timestamp: Date.now() });
      throw error;
    }
  }

  /**
   * Inicia el sistema háptico
   */
  public async start(): Promise<void> {
    if (this._active) {
      this.logger.warn('VR haptics is already active');
      return;
    }

    try {
      this.logger.info(`Starting VR haptics: ${this.id}`);

      this._active = true;
      this._lastUpdate = Date.now();

      // Iniciar dispositivos
      await this._startDevices();

      // Iniciar loop de procesamiento
      this._startProcessingLoop();

      this.logger.info(`VR haptics started successfully: ${this.id}`);
      this.emit('haptics:started', { haptics: this, timestamp: Date.now() });

    } catch (error) {
      this.logger.error(`Failed to start VR haptics: ${error.message}`);
      this._errors.push(error);
      this.emit('error:start', { haptics: this, error, timestamp: Date.now() });
      throw error;
    }
  }

  /**
   * Detiene el sistema háptico
   */
  public async stop(): Promise<void> {
    if (!this._active) {
      this.logger.warn('VR haptics is not active');
      return;
    }

    try {
      this.logger.info(`Stopping VR haptics: ${this.id}`);

      this._active = false;

      // Detener dispositivos
      await this._stopDevices();

      // Detener feedback activo
      this._stopAllFeedback();

      this.logger.info(`VR haptics stopped successfully: ${this.id}`);
      this.emit('haptics:stopped', { haptics: this, timestamp: Date.now() });

    } catch (error) {
      this.logger.error(`Failed to stop VR haptics: ${error.message}`);
      this._errors.push(error);
      this.emit('error:stop', { haptics: this, error, timestamp: Date.now() });
      throw error;
    }
  }

  /**
   * Actualiza el sistema háptico
   */
  public update(deltaTime: number): void {
    if (!this._active) return;

    try {
      const currentTime = Date.now();

      // Actualizar dispositivos
      this._updateDevices(deltaTime);

      // Actualizar feedback activo
      this._updateActiveFeedback(deltaTime);

      // Verificar batería
      this._checkBatteryLevels();

      this._lastUpdate = currentTime;

    } catch (error) {
      this.logger.error(`Error updating VR haptics: ${error.message}`);
      this._errors.push(error);
      this.emit('error:update', { haptics: this, error, timestamp: Date.now() });
    }
  }

  /**
   * Aplica feedback háptico
   */
  public applyHapticFeedback(deviceId: string, patternId: string, intensity?: number): string {
    try {
      const device = this._devices.get(deviceId);
      if (!device) {
        throw new Error(`Haptic device not found: ${deviceId}`);
      }

      const pattern = this._patterns.get(patternId);
      if (!pattern) {
        throw new Error(`Haptic pattern not found: ${patternId}`);
      }

      // Crear evento háptico
      const eventId = `haptic-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const finalIntensity = intensity || pattern.intensity;

      const hapticEvent: VRHapticEvent = {
        id: eventId,
        deviceId,
        pattern,
        timestamp: Date.now(),
        duration: pattern.duration,
        intensity: finalIntensity,
        completed: false
      };

      // Crear feedback
      const feedback: VRHapticFeedback = {
        deviceId,
        pattern,
        startTime: Date.now(),
        endTime: Date.now() + pattern.duration,
        intensity: finalIntensity,
        active: true
      };

      // Aplicar feedback al dispositivo
      this._applyFeedbackToDevice(device, feedback);

      // Almacenar feedback activo
      this._activeFeedback.set(eventId, feedback);

      this.logger.info(`Applied haptic feedback: ${eventId} to device ${deviceId}`);
      this.emit('haptics:triggered', { 
        haptics: this, 
        event: hapticEvent,
        device,
        timestamp: Date.now() 
      });

      return eventId;

    } catch (error) {
      this.logger.error(`Failed to apply haptic feedback: ${error.message}`);
      this._errors.push(error);
      throw error;
    }
  }

  /**
   * Detiene feedback háptico específico
   */
  public stopHapticFeedback(eventId: string): void {
    try {
      const feedback = this._activeFeedback.get(eventId);
      if (!feedback) {
        this.logger.warn(`Haptic feedback not found: ${eventId}`);
        return;
      }

      // Detener feedback
      feedback.active = false;
      feedback.endTime = Date.now();

      // Detener en dispositivo
      const device = this._devices.get(feedback.deviceId);
      if (device) {
        this._stopFeedbackOnDevice(device, eventId);
      }

      // Remover de feedback activo
      this._activeFeedback.delete(eventId);

      this.logger.info(`Stopped haptic feedback: ${eventId}`);
      this.emit('haptics:stopped', { 
        haptics: this, 
        eventId,
        device,
        timestamp: Date.now() 
      });

    } catch (error) {
      this.logger.error(`Failed to stop haptic feedback: ${error.message}`);
      this._errors.push(error);
    }
  }

  /**
   * Detiene todo el feedback háptico
   */
  public stopAllHapticFeedback(): void {
    try {
      this.logger.info('Stopping all haptic feedback');

      // Detener todos los dispositivos
      this._devices.forEach(device => {
        this._stopAllFeedbackOnDevice(device);
      });

      // Limpiar feedback activo
      this._activeFeedback.clear();

      this.logger.info('Stopped all haptic feedback');
      this.emit('haptics:all:stopped', { haptics: this, timestamp: Date.now() });

    } catch (error) {
      this.logger.error(`Failed to stop all haptic feedback: ${error.message}`);
      this._errors.push(error);
    }
  }

  /**
   * Agrega un dispositivo háptico
   */
  public addDevice(device: VRHapticDevice): void {
    try {
      this._devices.set(device.id, device);
      this.logger.info(`Added haptic device: ${device.id}`);
      this.emit('haptics:device:added', { haptics: this, device, timestamp: Date.now() });
    } catch (error) {
      this.logger.error(`Failed to add haptic device: ${error.message}`);
      this._errors.push(error);
    }
  }

  /**
   * Remueve un dispositivo háptico
   */
  public removeDevice(deviceId: string): void {
    try {
      const device = this._devices.get(deviceId);
      if (device) {
        this._devices.delete(deviceId);
        this.logger.info(`Removed haptic device: ${deviceId}`);
        this.emit('haptics:device:removed', { haptics: this, device, timestamp: Date.now() });
      }
    } catch (error) {
      this.logger.error(`Failed to remove haptic device: ${error.message}`);
      this._errors.push(error);
    }
  }

  /**
   * Agrega un patrón háptico
   */
  public addPattern(pattern: VRHapticPattern): void {
    try {
      this._patterns.set(pattern.id, pattern);
      this.logger.info(`Added haptic pattern: ${pattern.id}`);
      this.emit('haptics:pattern:added', { haptics: this, pattern, timestamp: Date.now() });
    } catch (error) {
      this.logger.error(`Failed to add haptic pattern: ${error.message}`);
      this._errors.push(error);
    }
  }

  /**
   * Remueve un patrón háptico
   */
  public removePattern(patternId: string): void {
    try {
      const pattern = this._patterns.get(patternId);
      if (pattern) {
        this._patterns.delete(patternId);
        this.logger.info(`Removed haptic pattern: ${patternId}`);
        this.emit('haptics:pattern:removed', { haptics: this, pattern, timestamp: Date.now() });
      }
    } catch (error) {
      this.logger.error(`Failed to remove haptic pattern: ${error.message}`);
      this._errors.push(error);
    }
  }

  /**
   * Obtiene dispositivos hápticos
   */
  public getDevices(): VRHapticDevice[] {
    return Array.from(this._devices.values());
  }

  /**
   * Obtiene patrones hápticos
   */
  public getPatterns(): VRHapticPattern[] {
    return Array.from(this._patterns.values());
  }

  /**
   * Obtiene feedback activo
   */
  public getActiveFeedback(): VRHapticFeedback[] {
    return Array.from(this._activeFeedback.values());
  }

  /**
   * Verifica si el sistema está activo
   */
  public isActive(): boolean {
    return this._active;
  }

  /**
   * Obtiene estadísticas del sistema
   */
  public getStats(): any {
    return {
      id: this.id,
      active: this._active,
      devices: this._devices.size,
      patterns: this._patterns.size,
      activeFeedback: this._activeFeedback.size,
      errors: this._errors.length,
      warnings: this._warnings.length,
      lastUpdate: this._lastUpdate,
      uptime: Date.now() - this._lastUpdate
    };
  }

  /**
   * Aplica configuración al sistema
   */
  public applyConfig(config: Partial<VRHapticsConfig>): void {
    try {
      this.logger.info(`Applying haptics configuration: ${this.id}`);

      // Actualizar configuración
      Object.assign(this.config, config);

      // Aplicar cambios de controladores
      if (config.controllers) {
        this._applyControllerConfig(config.controllers);
      }

      // Aplicar cambios de guantes
      if (config.gloves) {
        this._applyGloveConfig(config.gloves);
      }

      // Aplicar cambios de trajes
      if (config.suits) {
        this._applySuitConfig(config.suits);
      }

      this.logger.info(`Haptics configuration applied successfully: ${this.id}`);
      this.emit('haptics:config:updated', { haptics: this, config, timestamp: Date.now() });

    } catch (error) {
      this.logger.error(`Failed to apply haptics configuration: ${error.message}`);
      this._errors.push(error);
      this.emit('error:config', { haptics: this, error, timestamp: Date.now() });
      throw error;
    }
  }

  /**
   * Limpia recursos del sistema
   */
  public dispose(): void {
    try {
      this.logger.info(`Disposing VR haptics: ${this.id}`);

      this.stop();

      // Limpiar dispositivos
      this._devices.clear();

      // Limpiar patrones
      this._patterns.clear();

      // Limpiar feedback activo
      this._activeFeedback.clear();

      // Limpiar errores y advertencias
      this._errors = [];
      this._warnings = [];

      this.logger.info(`VR haptics disposed successfully: ${this.id}`);
      this.emit('haptics:disposed', { haptics: this, timestamp: Date.now() });

    } catch (error) {
      this.logger.error(`Failed to dispose VR haptics: ${error.message}`);
      this.emit('error:dispose', { haptics: this, error, timestamp: Date.now() });
    }
  }

  // Métodos privados

  private _initializePatterns(): void {
    // Patrones predefinidos
    const defaultPatterns: VRHapticPattern[] = [
      {
        id: 'click',
        type: VRHapticType.PULSE,
        duration: 50,
        intensity: 0.8,
        frequency: 100,
        waveform: 'square',
        envelope: { attack: 0, decay: 0, sustain: 1, release: 0 },
        parameters: {}
      },
      {
        id: 'bump',
        type: VRHapticType.VIBRATION,
        duration: 200,
        intensity: 0.6,
        frequency: 50,
        waveform: 'sine',
        envelope: { attack: 0.1, decay: 0.2, sustain: 0.5, release: 0.2 },
        parameters: {}
      },
      {
        id: 'texture',
        type: VRHapticType.TEXTURE,
        duration: 1000,
        intensity: 0.4,
        frequency: 200,
        waveform: 'sawtooth',
        envelope: { attack: 0.2, decay: 0.3, sustain: 0.3, release: 0.2 },
        parameters: { roughness: 0.5 }
      },
      {
        id: 'force',
        type: VRHapticType.FORCE,
        duration: 500,
        intensity: 0.9,
        frequency: 30,
        waveform: 'triangle',
        envelope: { attack: 0.3, decay: 0.2, sustain: 0.3, release: 0.2 },
        parameters: { direction: { x: 0, y: 1, z: 0 } }
      }
    ];

    defaultPatterns.forEach(pattern => {
      this._patterns.set(pattern.id, pattern);
    });
  }

  private async _setupControllers(): Promise<void> {
    try {
      this.logger.info('Setting up haptic controllers...');

      // Configurar controlador izquierdo
      if (this.config.controllers.left) {
        await this._setupLeftController();
      }

      // Configurar controlador derecho
      if (this.config.controllers.right) {
        await this._setupRightController();
      }

    } catch (error) {
      this.logger.error(`Failed to setup haptic controllers: ${error.message}`);
      throw error;
    }
  }

  private async _setupGloves(): Promise<void> {
    try {
      this.logger.info('Setting up haptic gloves...');

      // Configurar feedback de dedos
      if (this.config.gloves.fingers) {
        await this._setupFingerFeedback();
      }

      // Configurar feedback de palma
      if (this.config.gloves.palm) {
        await this._setupPalmFeedback();
      }

    } catch (error) {
      this.logger.error(`Failed to setup haptic gloves: ${error.message}`);
      throw error;
    }
  }

  private async _setupSuits(): Promise<void> {
    try {
      this.logger.info('Setting up haptic suits...');

      // Configurar partes del cuerpo
      this.config.suits.bodyParts.forEach(part => {
        this._setupBodyPartFeedback(part);
      });

    } catch (error) {
      this.logger.error(`Failed to setup haptic suits: ${error.message}`);
      throw error;
    }
  }

  private async _setupHapticAudio(): Promise<void> {
    try {
      this.logger.info('Setting up haptic audio...');

      // Configurar audio háptico
      if (this.config.audio.hapticAudio) {
        await this._setupHapticAudioSystem();
      }

    } catch (error) {
      this.logger.error(`Failed to setup haptic audio: ${error.message}`);
      throw error;
    }
  }

  private async _startDevices(): Promise<void> {
    // Simular inicio de dispositivos
    await new Promise(resolve => setTimeout(resolve, 300));
  }

  private _startProcessingLoop(): void {
    const processingLoop = () => {
      if (!this._active) return;

      const currentTime = performance.now();
      const deltaTime = (currentTime - this._lastUpdate) / 1000;

      this.update(deltaTime);

      requestAnimationFrame(processingLoop);
    };

    requestAnimationFrame(processingLoop);
  }

  private async _stopDevices(): Promise<void> {
    // Simular detención de dispositivos
    await new Promise(resolve => setTimeout(resolve, 300));
  }

  private _stopAllFeedback(): void {
    // Detener todo el feedback activo
    this._activeFeedback.forEach((feedback, eventId) => {
      feedback.active = false;
      feedback.endTime = Date.now();
    });
    this._activeFeedback.clear();
  }

  private _updateDevices(deltaTime: number): void {
    // Simular actualización de dispositivos
    this._devices.forEach(device => {
      // Actualizar batería
      device.battery = Math.max(0, device.battery - 0.001);
    });
  }

  private _updateActiveFeedback(deltaTime: number): void {
    const currentTime = Date.now();

    // Verificar feedback completado
    this._activeFeedback.forEach((feedback, eventId) => {
      if (currentTime >= feedback.endTime) {
        feedback.active = false;
        
        // Emitir evento de completado
        const device = this._devices.get(feedback.deviceId);
        if (device) {
          this.emit('haptics:completed', { 
            haptics: this, 
            eventId,
            device,
            timestamp: Date.now() 
          });
        }

        // Remover de feedback activo
        this._activeFeedback.delete(eventId);
      }
    });
  }

  private _checkBatteryLevels(): void {
    this._devices.forEach(device => {
      if (device.battery < 0.1) {
        const warning = `Low battery on device ${device.id}: ${(device.battery * 100).toFixed(1)}%`;
        if (!this._warnings.includes(warning)) {
          this._warnings.push(warning);
          this.emit('haptics:warning', { haptics: this, warning, timestamp: Date.now() });
        }
      }
    });
  }

  private _applyFeedbackToDevice(device: VRHapticDevice, feedback: VRHapticFeedback): void {
    // Simular aplicación de feedback al dispositivo
    this.logger.info(`Applying feedback to device ${device.id}: ${feedback.pattern.id}`);
  }

  private _stopFeedbackOnDevice(device: VRHapticDevice, eventId: string): void {
    // Simular detención de feedback en dispositivo
    this.logger.info(`Stopping feedback on device ${device.id}: ${eventId}`);
  }

  private _stopAllFeedbackOnDevice(device: VRHapticDevice): void {
    // Simular detención de todo el feedback en dispositivo
    this.logger.info(`Stopping all feedback on device ${device.id}`);
  }

  // Métodos de setup específicos
  private async _setupLeftController(): Promise<void> {
    // Simular setup de controlador izquierdo
  }

  private async _setupRightController(): Promise<void> {
    // Simular setup de controlador derecho
  }

  private async _setupFingerFeedback(): Promise<void> {
    // Simular setup de feedback de dedos
  }

  private async _setupPalmFeedback(): Promise<void> {
    // Simular setup de feedback de palma
  }

  private _setupBodyPartFeedback(part: string): void {
    // Simular setup de feedback de parte del cuerpo
  }

  private async _setupHapticAudioSystem(): Promise<void> {
    // Simular setup de sistema de audio háptico
  }

  private _applyControllerConfig(controllers: any): void {
    // Aplicar configuración de controladores
  }

  private _applyGloveConfig(gloves: any): void {
    // Aplicar configuración de guantes
  }

  private _applySuitConfig(suits: any): void {
    // Aplicar configuración de trajes
  }
} 
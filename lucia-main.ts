// lucIA Main - Sistema principal integrado
// WoldVirtual3DlucIA v0.6.0

import { Lucia3D, luciaConfig } from './lucia-3d-core';
import { LuciaAnimations } from './lucia-animations';
import { LuciaVoiceSystem } from './lucia-voice-system';
import { LuciaEnvironment } from './lucia-environment';

// Estado global de lucIA
export interface LuciaState {
  isInitialized: boolean;
  isSpeaking: boolean;
  currentEmotion: 'neutral' | 'happy' | 'concentrated' | 'curious';
  currentText: string;
  mouthOpenness: number;
  isAnimating: boolean;
}

// Sistema principal de lucIA
export class LuciaMain {
  private static instance: LuciaMain;
  private lucia3D: Lucia3D;
  private animations: LuciaAnimations;
  private voice: LuciaVoiceSystem;
  private environment: LuciaEnvironment;
  private state: LuciaState;
  private container: HTMLElement | null = null;

  static getInstance(): LuciaMain {
    if (!LuciaMain.instance) {
      LuciaMain.instance = new LuciaMain();
    }
    return LuciaMain.instance;
  }

  constructor() {
    this.lucia3D = new Lucia3D();
    this.animations = LuciaAnimations.getInstance();
    this.voice = LuciaVoiceSystem.getInstance();
    this.environment = LuciaEnvironment.getInstance();
    
    this.state = {
      isInitialized: false,
      isSpeaking: false,
      currentEmotion: 'neutral',
      currentText: '',
      mouthOpenness: 0,
      isAnimating: false
    };
  }

  // Inicializar sistema completo
  public async initialize(container: HTMLElement): Promise<void> {
    if (this.state.isInitialized) return;

    this.container = container;

    try {
      // Inicializar sistema 3D
      this.lucia3D.initialize(container);
      
      // Inicializar animaciones
      this.animations.initialize();
      
      // Inicializar sistema de voz
      await this.voice.initialize();
      
      // Configurar callbacks de voz
      this.voice.setCallbacks(
        this.handleLipSync.bind(this),
        this.handleSpeechStart.bind(this),
        this.handleSpeechEnd.bind(this)
      );

      this.state.isInitialized = true;
      this.state.isAnimating = true;

      console.log('lucIA 3D inicializada correctamente');
    } catch (error) {
      console.error('Error inicializando lucIA:', error);
    }
  }

  // Manejar sincronización labial
  private handleLipSync(mouthOpenness: number): void {
    this.state.mouthOpenness = mouthOpenness;
  }

  // Manejar inicio del habla
  private handleSpeechStart(): void {
    this.state.isSpeaking = true;
  }

  // Manejar fin del habla
  private handleSpeechEnd(): void {
    this.state.isSpeaking = false;
    this.state.mouthOpenness = 0;
  }

  // Presentar lucIA
  public async presentLucia(): Promise<void> {
    if (!this.state.isInitialized) return;

    this.state.currentEmotion = 'happy';
    await this.voice.presentLucia();
  }

  // Cambiar emoción
  public async changeEmotion(emotion: LuciaState['currentEmotion']): Promise<void> {
    if (!this.state.isInitialized) return;

    this.state.currentEmotion = emotion;
    await this.voice.expressEmotion(emotion);
  }

  // Hablar texto personalizado
  public async speakText(text: string): Promise<void> {
    if (!this.state.isInitialized) return;

    this.state.currentText = text;
    await this.voice.speakSpanish(text);
  }

  // Obtener estado actual
  public getState(): LuciaState {
    return { ...this.state };
  }

  // Verificar si está hablando
  public isSpeaking(): boolean {
    return this.state.isSpeaking;
  }

  // Verificar si está inicializada
  public isInitialized(): boolean {
    return this.state.isInitialized;
  }

  // Obtener configuración de lucIA
  public getConfig() {
    return luciaConfig;
  }

  // Pausar sistema
  public pause(): void {
    this.animations.pause();
    this.voice.pause();
    this.state.isAnimating = false;
  }

  // Reanudar sistema
  public resume(): void {
    this.animations.resume();
    this.voice.resume();
    this.state.isAnimating = true;
  }

  // Limpiar recursos
  public cleanup(): void {
    this.lucia3D.dispose();
    this.animations.cleanup();
    this.voice.cleanup();
    this.environment.cleanup();
    
    this.state = {
      isInitialized: false,
      isSpeaking: false,
      currentEmotion: 'neutral',
      currentText: '',
      mouthOpenness: 0,
      isAnimating: false
    };
    
    this.container = null;
  }

  // Obtener información del sistema
  public getSystemInfo(): {
    version: string;
    features: string[];
    status: string;
  } {
    return {
      version: '0.6.0',
      features: [
        'Avatar 3D realista',
        'Síntesis de voz española',
        'Animaciones naturales',
        'Entorno digital',
        'Sincronización labial',
        'Expresiones emocionales'
      ],
      status: this.state.isInitialized ? 'Activo' : 'Inactivo'
    };
  }
}

// Exportar instancia singleton
export const luciaMain = LuciaMain.getInstance();

// Funciones de utilidad para uso global
export const luciaUtils = {
  // Inicializar lucIA
  initialize: (container: HTMLElement) => luciaMain.initialize(container),
  
  // Presentar lucIA
  present: () => luciaMain.presentLucia(),
  
  // Cambiar emoción
  changeEmotion: (emotion: LuciaState['currentEmotion']) => luciaMain.changeEmotion(emotion),
  
  // Hablar texto
  speak: (text: string) => luciaMain.speakText(text),
  
  // Obtener estado
  getState: () => luciaMain.getState(),
  
  // Verificar si habla
  isSpeaking: () => luciaMain.isSpeaking(),
  
  // Pausar
  pause: () => luciaMain.pause(),
  
  // Reanudar
  resume: () => luciaMain.resume(),
  
  // Limpiar
  cleanup: () => luciaMain.cleanup(),
  
  // Obtener información
  getInfo: () => luciaMain.getSystemInfo()
}; 
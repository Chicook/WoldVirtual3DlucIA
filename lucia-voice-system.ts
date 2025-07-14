// lucIA Voice System - Sistema de síntesis de voz
// WoldVirtual3DlucIA v0.6.0

import { luciaConfig } from './lucia-3d-core';

// Configuración de voz para lucIA
export interface VoiceConfig {
  pitch: number;
  rate: number;
  volume: number;
  vibrato: number;
  attack: number;
  decay: number;
  sustain: number;
  release: number;
}

// Configuración de fonemas españoles
export interface PhonemeConfig {
  character: string;
  mouthOpenness: number;
  duration: number;
  pitch: number;
}

// Sistema de síntesis de voz
export class LuciaVoiceSystem {
  private static instance: LuciaVoiceSystem;
  private audioContext: AudioContext | null = null;
  private isInitialized: boolean = false;
  private isSpeaking: boolean = false;
  private currentText: string = '';
  private onLipSyncCallback: ((mouthOpen: number) => void) | null = null;
  private onSpeechStartCallback: (() => void) | null = null;
  private onSpeechEndCallback: (() => void) | null = null;

  static getInstance(): LuciaVoiceSystem {
    if (!LuciaVoiceSystem.instance) {
      LuciaVoiceSystem.instance = new LuciaVoiceSystem();
    }
    return LuciaVoiceSystem.instance;
  }

  // Inicializar sistema de audio
  public async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      await this.audioContext.resume();
      this.isInitialized = true;
    } catch (error) {
      console.error('Error inicializando sistema de voz:', error);
    }
  }

  // Configurar callbacks
  public setCallbacks(
    onLipSync?: (mouthOpen: number) => void,
    onSpeechStart?: () => void,
    onSpeechEnd?: () => void
  ): void {
    this.onLipSyncCallback = onLipSync || null;
    this.onSpeechStartCallback = onSpeechStart || null;
    this.onSpeechEndCallback = onSpeechEnd || null;
  }

  // Mapeo de fonemas españoles para sincronización labial
  private getPhonemeMap(): Map<string, PhonemeConfig> {
    const phonemeMap = new Map<string, PhonemeConfig>();
    
    // Vocales
    phonemeMap.set('a', { character: 'a', mouthOpenness: 0.8, duration: 0.15, pitch: 220 });
    phonemeMap.set('e', { character: 'e', mouthOpenness: 0.6, duration: 0.12, pitch: 240 });
    phonemeMap.set('i', { character: 'i', mouthOpenness: 0.4, duration: 0.10, pitch: 260 });
    phonemeMap.set('o', { character: 'o', mouthOpenness: 0.7, duration: 0.13, pitch: 230 });
    phonemeMap.set('u', { character: 'u', mouthOpenness: 0.3, duration: 0.08, pitch: 280 });
    
    // Vocales acentuadas
    phonemeMap.set('á', { character: 'á', mouthOpenness: 0.8, duration: 0.18, pitch: 220 });
    phonemeMap.set('é', { character: 'é', mouthOpenness: 0.6, duration: 0.15, pitch: 240 });
    phonemeMap.set('í', { character: 'í', mouthOpenness: 0.4, duration: 0.12, pitch: 260 });
    phonemeMap.set('ó', { character: 'ó', mouthOpenness: 0.7, duration: 0.16, pitch: 230 });
    phonemeMap.set('ú', { character: 'ú', mouthOpenness: 0.3, duration: 0.10, pitch: 280 });
    
    // Consonantes
    phonemeMap.set('b', { character: 'b', mouthOpenness: 0.9, duration: 0.08, pitch: 200 });
    phonemeMap.set('p', { character: 'p', mouthOpenness: 0.9, duration: 0.08, pitch: 200 });
    phonemeMap.set('m', { character: 'm', mouthOpenness: 0.8, duration: 0.10, pitch: 210 });
    phonemeMap.set('f', { character: 'f', mouthOpenness: 0.5, duration: 0.12, pitch: 250 });
    phonemeMap.set('v', { character: 'v', mouthOpenness: 0.5, duration: 0.12, pitch: 250 });
    phonemeMap.set('d', { character: 'd', mouthOpenness: 0.6, duration: 0.08, pitch: 220 });
    phonemeMap.set('t', { character: 't', mouthOpenness: 0.6, duration: 0.08, pitch: 220 });
    phonemeMap.set('n', { character: 'n', mouthOpenness: 0.5, duration: 0.10, pitch: 230 });
    phonemeMap.set('l', { character: 'l', mouthOpenness: 0.4, duration: 0.12, pitch: 240 });
    phonemeMap.set('r', { character: 'r', mouthOpenness: 0.3, duration: 0.15, pitch: 260 });
    phonemeMap.set('g', { character: 'g', mouthOpenness: 0.7, duration: 0.10, pitch: 210 });
    phonemeMap.set('k', { character: 'k', mouthOpenness: 0.7, duration: 0.10, pitch: 210 });
    phonemeMap.set('j', { character: 'j', mouthOpenness: 0.6, duration: 0.12, pitch: 240 });
    phonemeMap.set('h', { character: 'h', mouthOpenness: 0.2, duration: 0.08, pitch: 300 });
    phonemeMap.set('ñ', { character: 'ñ', mouthOpenness: 0.5, duration: 0.12, pitch: 230 });
    phonemeMap.set('s', { character: 's', mouthOpenness: 0.3, duration: 0.15, pitch: 280 });
    phonemeMap.set('z', { character: 'z', mouthOpenness: 0.3, duration: 0.15, pitch: 280 });
    phonemeMap.set('c', { character: 'c', mouthOpenness: 0.4, duration: 0.10, pitch: 250 });
    phonemeMap.set('q', { character: 'q', mouthOpenness: 0.6, duration: 0.10, pitch: 210 });
    phonemeMap.set('x', { character: 'x', mouthOpenness: 0.4, duration: 0.12, pitch: 250 });
    phonemeMap.set('y', { character: 'y', mouthOpenness: 0.4, duration: 0.10, pitch: 240 });
    phonemeMap.set('w', { character: 'w', mouthOpenness: 0.3, duration: 0.08, pitch: 290 });
    
    // Espacios y puntuación
    phonemeMap.set(' ', { character: ' ', mouthOpenness: 0.1, duration: 0.05, pitch: 0 });
    phonemeMap.set(',', { character: ',', mouthOpenness: 0.2, duration: 0.10, pitch: 0 });
    phonemeMap.set('.', { character: '.', mouthOpenness: 0.1, duration: 0.15, pitch: 0 });
    phonemeMap.set('!', { character: '!', mouthOpenness: 0.3, duration: 0.20, pitch: 0 });
    phonemeMap.set('?', { character: '?', mouthOpenness: 0.3, duration: 0.20, pitch: 0 });
    
    return phonemeMap;
  }

  // Generar tono de voz
  private generateTone(frequency: number, duration: number, startTime: number): void {
    if (!this.audioContext) return;

    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();
    const vibrato = this.audioContext.createOscillator();

    // Configurar oscilador principal
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(frequency, startTime);

    // Configurar vibrato
    vibrato.type = 'sine';
    vibrato.frequency.setValueAtTime(5, startTime);
    vibrato.connect(oscillator.frequency);

    // Configurar envolvente de ganancia
    gainNode.gain.setValueAtTime(0, startTime);
    gainNode.gain.linearRampToValueAtTime(
      Math.pow(10, luciaConfig.voice.volume / 20),
      startTime + luciaConfig.voice.attack
    );
    gainNode.gain.linearRampToValueAtTime(
      Math.pow(10, luciaConfig.voice.volume / 20) * luciaConfig.voice.sustain,
      startTime + luciaConfig.voice.attack + luciaConfig.voice.decay
    );
    gainNode.gain.linearRampToValueAtTime(0, startTime + duration);

    // Conectar nodos
    oscillator.connect(gainNode);
    gainNode.connect(this.audioContext.destination);

    // Iniciar y detener
    oscillator.start(startTime);
    oscillator.stop(startTime + duration);
    vibrato.start(startTime);
    vibrato.stop(startTime + duration);
  }

  // Hablar texto en español
  public async speakSpanish(text: string): Promise<void> {
    if (!this.isInitialized || this.isSpeaking) return;

    this.isSpeaking = true;
    this.currentText = text;
    this.onSpeechStartCallback?.();

    const phonemeMap = this.getPhonemeMap();
    const words = text.toLowerCase().split(' ');
    let currentTime = this.audioContext?.currentTime || 0;

    for (let i = 0; i < words.length; i++) {
      const word = words[i];
      
      for (let j = 0; j < word.length; j++) {
        const char = word[j];
        const phoneme = phonemeMap.get(char) || phonemeMap.get('a')!;
        
        // Generar tono para el fonema
        if (phoneme.pitch > 0) {
          this.generateTone(phoneme.pitch, phoneme.duration, currentTime);
        }

        // Sincronización labial
        setTimeout(() => {
          this.onLipSyncCallback?.(phoneme.mouthOpenness);
        }, (currentTime - (this.audioContext?.currentTime || 0)) * 1000);

        currentTime += phoneme.duration;
      }

      // Pausa entre palabras
      currentTime += 0.1;
    }

    // Finalizar habla
    setTimeout(() => {
      this.isSpeaking = false;
      this.currentText = '';
      this.onLipSyncCallback?.(0);
      this.onSpeechEndCallback?.();
    }, (currentTime - (this.audioContext?.currentTime || 0)) * 1000);
  }

  // Presentación inicial de lucIA
  public async presentLucia(): Promise<void> {
    const presentation = "Hola, soy lucIA. Una inteligencia artificial diseñada para ayudarte en el metaverso WoldVirtual3D. Tengo 35 años y estoy aquí para crear experiencias únicas contigo.";
    await this.speakSpanish(presentation);
  }

  // Expresar emociones
  public async expressEmotion(emotion: string): Promise<void> {
    const emotionTexts: { [key: string]: string } = {
      happy: "¡Me alegra mucho verte! Estoy muy contenta de poder ayudarte.",
      concentrated: "Estoy concentrada en procesar la información para darte la mejor respuesta.",
      curious: "Me interesa mucho lo que me cuentas. ¿Puedes contarme más?",
      neutral: "Entiendo perfectamente. ¿En qué puedo ayudarte?"
    };

    const text = emotionTexts[emotion] || "Entiendo perfectamente.";
    await this.speakSpanish(text);
  }

  // Verificar si está hablando
  public isCurrentlySpeaking(): boolean {
    return this.isSpeaking;
  }

  // Obtener texto actual
  public getCurrentText(): string {
    return this.currentText;
  }

  // Pausar voz
  public pause(): void {
    if (this.audioContext) {
      this.audioContext.suspend();
    }
  }

  // Reanudar voz
  public resume(): void {
    if (this.audioContext) {
      this.audioContext.resume();
    }
  }

  // Limpiar recursos
  public cleanup(): void {
    if (this.audioContext) {
      this.audioContext.close();
    }
    this.isInitialized = false;
    this.isSpeaking = false;
    this.currentText = '';
  }
}

// Exportar instancia singleton
export const luciaVoice = LuciaVoiceSystem.getInstance(); 
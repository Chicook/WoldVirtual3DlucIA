import { luciaConfig } from './avatarConfig';

// Sistema de animaciones para lucIA
export class LuciaAnimations {
  private static instance: LuciaAnimations;
  private animationFrame: number = 0;

  static getInstance(): LuciaAnimations {
    if (!LuciaAnimations.instance) {
      LuciaAnimations.instance = new LuciaAnimations();
    }
    return LuciaAnimations.instance;
  }

  // Animación de respiración natural
  static breathingAnimation(time: number): number {
    const breathing = Math.sin(time * luciaConfig.animations.breathing.frequency) * 
                     luciaConfig.animations.breathing.amplitude;
    return breathing;
  }

  // Animación de parpadeo
  static blinkAnimation(time: number): boolean {
    const blinkCycle = Math.sin(time * (2 * Math.PI / luciaConfig.animations.blinking.frequency));
    return blinkCycle > 0.8;
  }

  // Animación de habla con sincronización labial
  static speakingAnimation(time: number, isSpeaking: boolean): number {
    if (!isSpeaking) return 0;
    return Math.max(0, Math.sin(time * luciaConfig.animations.speaking.frequency) * 
                   luciaConfig.animations.speaking.amplitude);
  }

  // Animación de gestos de cabeza
  static headGestureAnimation(time: number, gestureType: 'nod' | 'tilt' | 'sway'): number {
    const config = luciaConfig.gestures;
    
    switch (gestureType) {
      case 'nod':
        return Math.sin(time * config.headNod.frequency) * config.headNod.amplitude;
      case 'tilt':
        return Math.sin(time * config.headTilt.frequency) * config.headTilt.amplitude;
      case 'sway':
        return Math.sin(time * config.bodySway.frequency) * config.bodySway.amplitude;
      default:
        return 0;
    }
  }

  // Animación de expresiones emocionales
  static emotionAnimation(emotion: keyof typeof luciaConfig.emotions, intensity: number = 1) {
    const emotionConfig = luciaConfig.emotions[emotion];
    
    return {
      eyebrowHeight: emotionConfig.eyebrowHeight * intensity,
      mouthCurve: emotionConfig.mouthCurve * intensity,
      eyeOpenness: emotionConfig.eyeOpenness * intensity
    };
  }

  // Animación de transición suave entre emociones
  static emotionTransition(
    fromEmotion: keyof typeof luciaConfig.emotions,
    toEmotion: keyof typeof luciaConfig.emotions,
    progress: number // 0 a 1
  ) {
    const from = luciaConfig.emotions[fromEmotion];
    const to = luciaConfig.emotions[toEmotion];
    
    // Función de easing suave
    const easeInOut = (t: number) => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
    const easedProgress = easeInOut(progress);
    
    return {
      eyebrowHeight: from.eyebrowHeight + (to.eyebrowHeight - from.eyebrowHeight) * easedProgress,
      mouthCurve: from.mouthCurve + (to.mouthCurve - from.mouthCurve) * easedProgress,
      eyeOpenness: from.eyeOpenness + (to.eyeOpenness - from.eyeOpenness) * easedProgress
    };
  }

  // Animación de seguimiento de mirada
  static gazeTrackingAnimation(
    targetPosition: [number, number, number],
    currentRotation: [number, number, number],
    sensitivity: number = 0.1
  ): [number, number, number] {
    // Calcular dirección hacia el objetivo
    const direction = [
      targetPosition[0] - currentRotation[0],
      targetPosition[1] - currentRotation[1],
      targetPosition[2] - currentRotation[2]
    ];

    // Aplicar sensibilidad y límites
    const maxRotation = 0.3; // Radianes
    const newRotation = [
      Math.max(-maxRotation, Math.min(maxRotation, direction[0] * sensitivity)),
      Math.max(-maxRotation, Math.min(maxRotation, direction[1] * sensitivity)),
      Math.max(-maxRotation, Math.min(maxRotation, direction[2] * sensitivity))
    ];

    return newRotation as [number, number, number];
  }

  // Animación de movimiento natural del cuerpo
  static bodyMovementAnimation(time: number): {
    sway: number;
    bounce: number;
    rotation: number;
  } {
    return {
      sway: Math.sin(time * 0.5) * 0.01,
      bounce: Math.sin(time * 0.3) * 0.005,
      rotation: Math.sin(time * 0.2) * 0.02
    };
  }

  // Animación de cabello con física simple
  static hairPhysicsAnimation(time: number, hairLength: number): number[] {
    const segments = 5;
    const positions: number[] = [];
    
    for (let i = 0; i < segments; i++) {
      const segmentTime = time + i * 0.2;
      const segmentOffset = i / segments;
      const movement = Math.sin(segmentTime * 0.8) * 0.02 * segmentOffset;
      positions.push(movement);
    }
    
    return positions;
  }

  // Animación de micro-expresiones
  static microExpressionAnimation(time: number): {
    eyebrowTwitch: number;
    lipTwitch: number;
    eyeWidening: number;
  } {
    const microFrequency = 0.1;
    
    return {
      eyebrowTwitch: Math.sin(time * microFrequency) * 0.01,
      lipTwitch: Math.cos(time * microFrequency * 1.5) * 0.005,
      eyeWidening: Math.sin(time * microFrequency * 0.8) * 0.02
    };
  }

  // Animación de respiración avanzada (pecho y hombros)
  static advancedBreathingAnimation(time: number): {
    chest: number;
    shoulders: number;
    head: number;
  } {
    const breathing = Math.sin(time * luciaConfig.animations.breathing.frequency);
    
    return {
      chest: breathing * 0.03,
      shoulders: breathing * 0.01,
      head: breathing * luciaConfig.animations.breathing.amplitude
    };
  }

  // Animación de gestos de manos (para futuras implementaciones)
  static handGestureAnimation(gestureType: string, time: number): {
    wristRotation: number;
    fingerSpread: number;
    palmOpenness: number;
  } {
    // Placeholder para animaciones de manos
    return {
      wristRotation: 0,
      fingerSpread: 0,
      palmOpenness: 0
    };
  }

  // Función de interpolación suave
  static smoothInterpolation(from: number, to: number, progress: number): number {
    const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);
    const easedProgress = easeOutCubic(progress);
    return from + (to - from) * easedProgress;
  }

  // Animación de transición de cámara
  static cameraTransitionAnimation(
    fromPosition: [number, number, number],
    toPosition: [number, number, number],
    progress: number
  ): [number, number, number] {
    const easeInOutQuart = (t: number) => t < 0.5 ? 8 * t * t * t * t : 1 - 8 * (--t) * t * t * t;
    const easedProgress = easeInOutQuart(progress);
    
    return [
      fromPosition[0] + (toPosition[0] - fromPosition[0]) * easedProgress,
      fromPosition[1] + (toPosition[1] - fromPosition[1]) * easedProgress,
      fromPosition[2] + (toPosition[2] - fromPosition[2]) * easedProgress
    ];
  }

  // Limpiar animaciones
  cleanup() {
    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame);
    }
  }
}

// Exportar instancia singleton
export const luciaAnimations = LuciaAnimations.getInstance(); 
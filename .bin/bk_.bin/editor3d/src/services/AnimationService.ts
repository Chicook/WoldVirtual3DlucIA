export interface Animation {
  id: string;
  name: string;
  type: 'idle' | 'walk' | 'run' | 'jump' | 'dance' | 'gesture' | 'emotion' | 'custom';
  duration: number;
  loop: boolean;
  data: any;
  metadata: {
    description: string;
    tags: string[];
    difficulty: 'easy' | 'medium' | 'hard';
    createdBy: string;
    createdAt: number;
  };
}

export interface AnimationKeyframe {
  time: number;
  position: [number, number, number];
  rotation: [number, number, number];
  scale: [number, number, number];
  easing: string;
}

export interface AnimationSequence {
  id: string;
  name: string;
  animations: string[];
  transitions: any[];
  duration: number;
  loop: boolean;
}

export class AnimationService {
  private animations: Map<string, Animation> = new Map();
  private sequences: Map<string, AnimationSequence> = new Map();
  private isInitialized: boolean = false;
  private learningData: any[] = [];

  constructor() {}

  async initialize(): Promise<void> {
    try {
      console.log('🎬 Inicializando AnimationService...');
      
      // Crear animaciones básicas
      await this.createBasicAnimations();
      
      this.isInitialized = true;
      console.log('✅ AnimationService inicializado');
    } catch (error) {
      console.error('❌ Error al inicializar AnimationService:', error);
      throw error;
    }
  }

  private async createBasicAnimations(): Promise<void> {
    const basicAnimations = [
      {
        id: 'idle',
        name: 'Idle',
        type: 'idle' as const,
        duration: 2000,
        loop: true,
        data: {
          keyframes: [
            { time: 0, position: [0, 0, 0], rotation: [0, 0, 0], scale: [1, 1, 1], easing: 'easeInOut' },
            { time: 1000, position: [0, 0.02, 0], rotation: [0, 0, 0], scale: [1, 1, 1], easing: 'easeInOut' },
            { time: 2000, position: [0, 0, 0], rotation: [0, 0, 0], scale: [1, 1, 1], easing: 'easeInOut' }
          ]
        },
        metadata: {
          description: 'Animación de reposo básica',
          tags: ['idle', 'basic', 'breathing'],
          difficulty: 'easy',
          createdBy: 'system',
          createdAt: Date.now()
        }
      },
      {
        id: 'happy',
        name: 'Feliz',
        type: 'emotion' as const,
        duration: 1500,
        loop: false,
        data: {
          keyframes: [
            { time: 0, position: [0, 0, 0], rotation: [0, 0, 0], scale: [1, 1, 1], easing: 'easeOut' },
            { time: 500, position: [0, 0.1, 0], rotation: [0, 0, 0.1], scale: [1.05, 1.05, 1.05], easing: 'easeOut' },
            { time: 1500, position: [0, 0, 0], rotation: [0, 0, 0], scale: [1, 1, 1], easing: 'easeIn' }
          ]
        },
        metadata: {
          description: 'Animación de felicidad con salto y rotación',
          tags: ['emotion', 'happy', 'jump'],
          difficulty: 'easy',
          createdBy: 'system',
          createdAt: Date.now()
        }
      },
      {
        id: 'sad',
        name: 'Triste',
        type: 'emotion' as const,
        duration: 2000,
        loop: false,
        data: {
          keyframes: [
            { time: 0, position: [0, 0, 0], rotation: [0, 0, 0], scale: [1, 1, 1], easing: 'easeIn' },
            { time: 1000, position: [0, -0.05, 0], rotation: [0, 0, -0.05], scale: [0.95, 0.95, 0.95], easing: 'easeIn' },
            { time: 2000, position: [0, 0, 0], rotation: [0, 0, 0], scale: [1, 1, 1], easing: 'easeOut' }
          ]
        },
        metadata: {
          description: 'Animación de tristeza con encogimiento',
          tags: ['emotion', 'sad', 'shrink'],
          difficulty: 'easy',
          createdBy: 'system',
          createdAt: Date.now()
        }
      },
      {
        id: 'excited',
        name: 'Emocionada',
        type: 'emotion' as const,
        duration: 1200,
        loop: false,
        data: {
          keyframes: [
            { time: 0, position: [0, 0, 0], rotation: [0, 0, 0], scale: [1, 1, 1], easing: 'easeOut' },
            { time: 300, position: [0, 0.15, 0], rotation: [0, 0, 0.2], scale: [1.1, 1.1, 1.1], easing: 'easeOut' },
            { time: 600, position: [0, 0.05, 0], rotation: [0, 0, -0.1], scale: [1.05, 1.05, 1.05], easing: 'easeInOut' },
            { time: 1200, position: [0, 0, 0], rotation: [0, 0, 0], scale: [1, 1, 1], easing: 'easeIn' }
          ]
        },
        metadata: {
          description: 'Animación de emoción con múltiples saltos',
          tags: ['emotion', 'excited', 'bounce'],
          difficulty: 'medium',
          createdBy: 'system',
          createdAt: Date.now()
        }
      },
      {
        id: 'dance',
        name: 'Bailar',
        type: 'dance' as const,
        duration: 3000,
        loop: true,
        data: {
          keyframes: [
            { time: 0, position: [0, 0, 0], rotation: [0, 0, 0], scale: [1, 1, 1], easing: 'easeInOut' },
            { time: 750, position: [0.1, 0.05, 0], rotation: [0, 0, 0.3], scale: [1, 1, 1], easing: 'easeInOut' },
            { time: 1500, position: [0, 0.1, 0], rotation: [0, 0, 0], scale: [1, 1, 1], easing: 'easeInOut' },
            { time: 2250, position: [-0.1, 0.05, 0], rotation: [0, 0, -0.3], scale: [1, 1, 1], easing: 'easeInOut' },
            { time: 3000, position: [0, 0, 0], rotation: [0, 0, 0], scale: [1, 1, 1], easing: 'easeInOut' }
          ]
        },
        metadata: {
          description: 'Animación de baile con movimientos laterales',
          tags: ['dance', 'movement', 'rhythm'],
          difficulty: 'medium',
          createdBy: 'system',
          createdAt: Date.now()
        }
      }
    ];

    for (const animData of basicAnimations) {
      this.animations.set(animData.id, animData as Animation);
    }
  }

  async generateAnimation(name: string): Promise<Animation | null> {
    if (!this.isInitialized) {
      throw new Error('AnimationService no está inicializado');
    }

    try {
      // Verificar si la animación ya existe
      const existingAnimation = this.animations.get(name);
      if (existingAnimation) {
        return existingAnimation;
      }

      // Generar nueva animación basada en el nombre
      const animation = await this.createAnimationFromName(name);
      if (animation) {
        this.animations.set(animation.id, animation);
        console.log(`🎬 Animación generada: ${name}`);
      }

      return animation;
    } catch (error) {
      console.error('❌ Error generando animación:', error);
      return null;
    }
  }

  private async createAnimationFromName(name: string): Promise<Animation | null> {
    const lowerName = name.toLowerCase();
    
    // Patrones de animación basados en el nombre
    if (lowerName.includes('wave') || lowerName.includes('saludar')) {
      return this.createWaveAnimation();
    } else if (lowerName.includes('clap') || lowerName.includes('aplaudir')) {
      return this.createClapAnimation();
    } else if (lowerName.includes('bow') || lowerName.includes('reverencia')) {
      return this.createBowAnimation();
    } else if (lowerName.includes('spin') || lowerName.includes('girar')) {
      return this.createSpinAnimation();
    } else if (lowerName.includes('jump') || lowerName.includes('saltar')) {
      return this.createJumpAnimation();
    }

    // Animación genérica
    return this.createGenericAnimation(name);
  }

  private createWaveAnimation(): Animation {
    return {
      id: 'wave',
      name: 'Saludar',
      type: 'gesture',
      duration: 1500,
      loop: false,
      data: {
        keyframes: [
          { time: 0, position: [0, 0, 0], rotation: [0, 0, 0], scale: [1, 1, 1], easing: 'easeOut' },
          { time: 500, position: [0, 0.1, 0], rotation: [0, 0, 0.5], scale: [1, 1, 1], easing: 'easeInOut' },
          { time: 1000, position: [0, 0.1, 0], rotation: [0, 0, -0.3], scale: [1, 1, 1], easing: 'easeInOut' },
          { time: 1500, position: [0, 0, 0], rotation: [0, 0, 0], scale: [1, 1, 1], easing: 'easeIn' }
        ]
      },
      metadata: {
        description: 'Animación de saludo con la mano',
        tags: ['gesture', 'wave', 'greeting'],
        difficulty: 'easy',
        createdBy: 'ai',
        createdAt: Date.now()
      }
    };
  }

  private createClapAnimation(): Animation {
    return {
      id: 'clap',
      name: 'Aplaudir',
      type: 'gesture',
      duration: 1000,
      loop: false,
      data: {
        keyframes: [
          { time: 0, position: [0, 0, 0], rotation: [0, 0, 0], scale: [1, 1, 1], easing: 'easeOut' },
          { time: 500, position: [0, 0.05, 0], rotation: [0, 0, 0.2], scale: [1.02, 1.02, 1.02], easing: 'easeInOut' },
          { time: 1000, position: [0, 0, 0], rotation: [0, 0, 0], scale: [1, 1, 1], easing: 'easeIn' }
        ]
      },
      metadata: {
        description: 'Animación de aplauso',
        tags: ['gesture', 'clap', 'applause'],
        difficulty: 'easy',
        createdBy: 'ai',
        createdAt: Date.now()
      }
    };
  }

  private createBowAnimation(): Animation {
    return {
      id: 'bow',
      name: 'Reverencia',
      type: 'gesture',
      duration: 2000,
      loop: false,
      data: {
        keyframes: [
          { time: 0, position: [0, 0, 0], rotation: [0, 0, 0], scale: [1, 1, 1], easing: 'easeIn' },
          { time: 1000, position: [0, -0.2, 0], rotation: [0.3, 0, 0], scale: [1, 1, 1], easing: 'easeInOut' },
          { time: 2000, position: [0, 0, 0], rotation: [0, 0, 0], scale: [1, 1, 1], easing: 'easeOut' }
        ]
      },
      metadata: {
        description: 'Animación de reverencia',
        tags: ['gesture', 'bow', 'respect'],
        difficulty: 'medium',
        createdBy: 'ai',
        createdAt: Date.now()
      }
    };
  }

  private createSpinAnimation(): Animation {
    return {
      id: 'spin',
      name: 'Girar',
      type: 'custom',
      duration: 2000,
      loop: false,
      data: {
        keyframes: [
          { time: 0, position: [0, 0, 0], rotation: [0, 0, 0], scale: [1, 1, 1], easing: 'easeInOut' },
          { time: 1000, position: [0, 0.1, 0], rotation: [0, Math.PI, 0], scale: [1, 1, 1], easing: 'easeInOut' },
          { time: 2000, position: [0, 0, 0], rotation: [0, Math.PI * 2, 0], scale: [1, 1, 1], easing: 'easeInOut' }
        ]
      },
      metadata: {
        description: 'Animación de giro completo',
        tags: ['custom', 'spin', 'rotation'],
        difficulty: 'medium',
        createdBy: 'ai',
        createdAt: Date.now()
      }
    };
  }

  private createJumpAnimation(): Animation {
    return {
      id: 'jump',
      name: 'Saltar',
      type: 'custom',
      duration: 1200,
      loop: false,
      data: {
        keyframes: [
          { time: 0, position: [0, 0, 0], rotation: [0, 0, 0], scale: [1, 1, 1], easing: 'easeOut' },
          { time: 300, position: [0, 0.3, 0], rotation: [0, 0, 0], scale: [0.95, 1.1, 0.95], easing: 'easeOut' },
          { time: 600, position: [0, 0.3, 0], rotation: [0, 0, 0], scale: [1, 1, 1], easing: 'easeInOut' },
          { time: 1200, position: [0, 0, 0], rotation: [0, 0, 0], scale: [1, 1, 1], easing: 'easeIn' }
        ]
      },
      metadata: {
        description: 'Animación de salto',
        tags: ['custom', 'jump', 'bounce'],
        difficulty: 'medium',
        createdBy: 'ai',
        createdAt: Date.now()
      }
    };
  }

  private createGenericAnimation(name: string): Animation {
    return {
      id: name.toLowerCase().replace(/\s+/g, '_'),
      name: name,
      type: 'custom',
      duration: 1500,
      loop: false,
      data: {
        keyframes: [
          { time: 0, position: [0, 0, 0], rotation: [0, 0, 0], scale: [1, 1, 1], easing: 'easeInOut' },
          { time: 750, position: [0, 0.05, 0], rotation: [0, 0, 0.1], scale: [1.02, 1.02, 1.02], easing: 'easeInOut' },
          { time: 1500, position: [0, 0, 0], rotation: [0, 0, 0], scale: [1, 1, 1], easing: 'easeInOut' }
        ]
      },
      metadata: {
        description: `Animación personalizada: ${name}`,
        tags: ['custom', 'generated'],
        difficulty: 'easy',
        createdBy: 'ai',
        createdAt: Date.now()
      }
    };
  }

  async createCustomAnimation(animationData: any): Promise<Animation | null> {
    if (!this.isInitialized) {
      throw new Error('AnimationService no está inicializado');
    }

    try {
      const animation: Animation = {
        id: `custom_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        name: animationData.name || 'Animación Personalizada',
        type: animationData.type || 'custom',
        duration: animationData.duration || 1500,
        loop: animationData.loop || false,
        data: animationData.data || { keyframes: [] },
        metadata: {
          description: animationData.description || 'Animación creada por el usuario',
          tags: animationData.tags || ['custom', 'user-created'],
          difficulty: animationData.difficulty || 'medium',
          createdBy: animationData.createdBy || 'user',
          createdAt: Date.now()
        }
      };

      this.animations.set(animation.id, animation);
      console.log(`🎬 Animación personalizada creada: ${animation.name}`);
      
      return animation;
    } catch (error) {
      console.error('❌ Error creando animación personalizada:', error);
      return null;
    }
  }

  async getAnimation(animationId: string): Promise<Animation | null> {
    if (!this.isInitialized) {
      throw new Error('AnimationService no está inicializado');
    }

    try {
      return this.animations.get(animationId) || null;
    } catch (error) {
      console.error('❌ Error obteniendo animación:', error);
      throw error;
    }
  }

  async getAllAnimations(): Promise<Animation[]> {
    if (!this.isInitialized) {
      throw new Error('AnimationService no está inicializado');
    }

    try {
      return Array.from(this.animations.values());
    } catch (error) {
      console.error('❌ Error obteniendo todas las animaciones:', error);
      throw error;
    }
  }

  async createSequence(name: string, animationIds: string[]): Promise<AnimationSequence | null> {
    if (!this.isInitialized) {
      throw new Error('AnimationService no está inicializado');
    }

    try {
      const sequenceId = `sequence_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      // Calcular duración total
      let totalDuration = 0;
      for (const animId of animationIds) {
        const animation = this.animations.get(animId);
        if (animation) {
          totalDuration += animation.duration;
        }
      }

      const sequence: AnimationSequence = {
        id: sequenceId,
        name,
        animations: animationIds,
        transitions: [],
        duration: totalDuration,
        loop: false
      };

      this.sequences.set(sequenceId, sequence);
      console.log(`🎬 Secuencia creada: ${name}`);
      
      return sequence;
    } catch (error) {
      console.error('❌ Error creando secuencia:', error);
      return null;
    }
  }

  async learnFromAnimation(animationData: any): Promise<void> {
    try {
      this.learningData.push({
        ...animationData,
        timestamp: Date.now()
      });
      
      console.log('🧠 Aprendiendo de nueva animación');
    } catch (error) {
      console.error('❌ Error aprendiendo de animación:', error);
    }
  }

  exportAnimations(): any {
    return {
      animations: Array.from(this.animations.values()),
      sequences: Array.from(this.sequences.values()),
      learningData: this.learningData,
      exportDate: Date.now()
    };
  }

  async importAnimations(data: any): Promise<void> {
    try {
      if (data.animations) {
        for (const animation of data.animations) {
          this.animations.set(animation.id, animation);
        }
      }
      
      if (data.sequences) {
        for (const sequence of data.sequences) {
          this.sequences.set(sequence.id, sequence);
        }
      }
      
      if (data.learningData) {
        this.learningData = [...this.learningData, ...data.learningData];
      }
      
      console.log('✅ Animaciones importadas correctamente');
    } catch (error) {
      console.error('❌ Error importando animaciones:', error);
    }
  }

  getAnimationStats(): any {
    return {
      totalAnimations: this.animations.size,
      totalSequences: this.sequences.size,
      learningDataCount: this.learningData.length,
      animationTypes: this.getAnimationTypeStats()
    };
  }

  private getAnimationTypeStats(): any {
    const stats: any = {};
    for (const animation of this.animations.values()) {
      stats[animation.type] = (stats[animation.type] || 0) + 1;
    }
    return stats;
  }

  isReady(): boolean {
    return this.isInitialized;
  }

  cleanup(): void {
    this.animations.clear();
    this.sequences.clear();
    this.learningData = [];
    this.isInitialized = false;
  }
} 
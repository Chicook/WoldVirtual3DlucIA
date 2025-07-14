import * as THREE from 'three'
import { useState, useEffect } from 'react'

export interface AnimationConfig {
  duration: number
  easing: 'linear' | 'easeIn' | 'easeOut' | 'easeInOut'
  loop: boolean
}

export interface AvatarAnimation {
  name: string
  config: AnimationConfig
  keyframes: {
    time: number
    rotation: { x: number; y: number; z: number }
    position?: { x: number; y: number; z: number }
  }[]
}

// Configuraciones de animaciones predefinidas
export const avatarAnimations: Record<string, AvatarAnimation> = {
  idle: {
    name: 'idle',
    config: {
      duration: 2,
      easing: 'easeInOut',
      loop: true
    },
    keyframes: [
      { time: 0, rotation: { x: 0, y: 0, z: 0 } },
      { time: 1, rotation: { x: 0.02, y: 0, z: 0 } },
      { time: 2, rotation: { x: 0, y: 0, z: 0 } }
    ]
  },
  
  walk: {
    name: 'walk',
    config: {
      duration: 1,
      easing: 'linear',
      loop: true
    },
    keyframes: [
      { time: 0, rotation: { x: 0, y: 0, z: 0 } },
      { time: 0.25, rotation: { x: 0.3, y: 0, z: 0 } },
      { time: 0.5, rotation: { x: 0, y: 0, z: 0 } },
      { time: 0.75, rotation: { x: -0.3, y: 0, z: 0 } },
      { time: 1, rotation: { x: 0, y: 0, z: 0 } }
    ]
  },
  
  wave: {
    name: 'wave',
    config: {
      duration: 1.5,
      easing: 'easeInOut',
      loop: false
    },
    keyframes: [
      { time: 0, rotation: { x: 0, y: 0, z: 0 } },
      { time: 0.25, rotation: { x: 0.5, y: 0, z: 0.5 } },
      { time: 0.5, rotation: { x: 0.3, y: 0, z: 0.8 } },
      { time: 0.75, rotation: { x: 0.5, y: 0, z: 0.5 } },
      { time: 1, rotation: { x: 0, y: 0, z: 0 } }
    ]
  },
  
  jump: {
    name: 'jump',
    config: {
      duration: 1,
      easing: 'easeOut',
      loop: false
    },
    keyframes: [
      { time: 0, rotation: { x: 0, y: 0, z: 0 }, position: { x: 0, y: 0, z: 0 } },
      { time: 0.5, rotation: { x: 0, y: 0, z: 0 }, position: { x: 0, y: 1, z: 0 } },
      { time: 1, rotation: { x: 0, y: 0, z: 0 }, position: { x: 0, y: 0, z: 0 } }
    ]
  },
  
  dance: {
    name: 'dance',
    config: {
      duration: 2,
      easing: 'easeInOut',
      loop: true
    },
    keyframes: [
      { time: 0, rotation: { x: 0, y: 0, z: 0 } },
      { time: 0.25, rotation: { x: 0.1, y: 0.2, z: 0 } },
      { time: 0.5, rotation: { x: 0, y: 0, z: 0.1 } },
      { time: 0.75, rotation: { x: -0.1, y: -0.2, z: 0 } },
      { time: 1, rotation: { x: 0, y: 0, z: 0 } }
    ]
  }
}

// Clase para manejar animaciones de avatar
export class AvatarAnimationController {
  private group: THREE.Group
  private animations: Map<string, AvatarAnimation>
  private currentAnimation: string | null = null
  private animationTime: number = 0
  private isPlaying: boolean = false

  constructor(group: THREE.Group) {
    this.group = group
    this.animations = new Map(Object.entries(avatarAnimations))
  }

  // Reproducir una animación
  play(animationName: string, reset: boolean = true): void {
    const animation = this.animations.get(animationName)
    if (!animation) {
      console.warn(`Animation "${animationName}" not found`)
      return
    }

    if (reset || this.currentAnimation !== animationName) {
      this.animationTime = 0
    }

    this.currentAnimation = animationName
    this.isPlaying = true
  }

  // Pausar animación
  pause(): void {
    this.isPlaying = false
  }

  // Reanudar animación
  resume(): void {
    this.isPlaying = true
  }

  // Detener animación
  stop(): void {
    this.isPlaying = false
    this.animationTime = 0
    this.resetPose()
  }

  // Actualizar animación (llamar en cada frame)
  update(deltaTime: number): void {
    if (!this.isPlaying || !this.currentAnimation) return

    const animation = this.animations.get(this.currentAnimation)
    if (!animation) return

    this.animationTime += deltaTime

    // Verificar si la animación debe terminar
    if (this.animationTime >= animation.config.duration) {
      if (animation.config.loop) {
        this.animationTime = 0
      } else {
        this.stop()
        return
      }
    }

    // Aplicar keyframes
    this.applyKeyframes(animation)
  }

  // Aplicar keyframes de la animación
  private applyKeyframes(animation: AvatarAnimation): void {
    const time = this.animationTime
    const keyframes = animation.keyframes

    // Encontrar los keyframes actuales
    let currentFrame = 0
    let nextFrame = 0

    for (let i = 0; i < keyframes.length - 1; i++) {
      if (time >= keyframes[i].time && time <= keyframes[i + 1].time) {
        currentFrame = i
        nextFrame = i + 1
        break
      }
    }

    const current = keyframes[currentFrame]
    const next = keyframes[nextFrame]

    // Calcular interpolación
    const progress = (time - current.time) / (next.time - current.time)
    const easedProgress = this.applyEasing(progress, animation.config.easing)

    // Interpolar rotación
    const rotation = {
      x: this.lerp(current.rotation.x, next.rotation.x, easedProgress),
      y: this.lerp(current.rotation.y, next.rotation.y, easedProgress),
      z: this.lerp(current.rotation.z, next.rotation.z, easedProgress)
    }

    // Aplicar rotación al grupo
    this.group.rotation.set(rotation.x, rotation.y, rotation.z)

    // Interpolar posición si existe
    if (current.position && next.position) {
      const position = {
        x: this.lerp(current.position.x, next.position.x, easedProgress),
        y: this.lerp(current.position.y, next.position.y, easedProgress),
        z: this.lerp(current.position.z, next.position.z, easedProgress)
      }
      this.group.position.set(position.x, position.y, position.z)
    }
  }

  // Aplicar función de easing
  private applyEasing(t: number, easing: string): number {
    switch (easing) {
      case 'linear':
        return t
      case 'easeIn':
        return t * t
      case 'easeOut':
        return 1 - (1 - t) * (1 - t)
      case 'easeInOut':
        return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2
      default:
        return t
    }
  }

  // Interpolación lineal
  private lerp(a: number, b: number, t: number): number {
    return a + (b - a) * t
  }

  // Resetear pose
  private resetPose(): void {
    this.group.rotation.set(0, 0, 0)
    this.group.position.set(0, 0, 0)
  }

  // Obtener animación actual
  getCurrentAnimation(): string | null {
    return this.currentAnimation
  }

  // Verificar si está reproduciendo
  isAnimationPlaying(): boolean {
    return this.isPlaying
  }
}

// Hook para usar animaciones en componentes React
export const useAvatarAnimation = (groupRef: React.RefObject<THREE.Group>) => {
  const [controller, setController] = useState<AvatarAnimationController | null>(null)

  useEffect(() => {
    if (groupRef.current) {
      const newController = new AvatarAnimationController(groupRef.current)
      setController(newController)
    }
  }, [groupRef])

  useEffect(() => {
    if (controller) {
      const animate = () => {
        controller.update(0.016) // 60 FPS
        requestAnimationFrame(animate)
      }
      animate()
    }
  }, [controller])

  return controller
} 
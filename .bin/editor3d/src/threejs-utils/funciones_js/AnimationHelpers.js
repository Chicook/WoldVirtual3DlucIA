/**
 * Animation Helpers - Utilidades de animación y keyframes para el editor 3D
 * Maneja la creación de animaciones, timelines, keyframes, interpolación y exportación
 * Inspirado en Blender y Godot
 */

import * as THREE from 'three';

class AnimationHelpers {
  constructor() {
    this.animations = new Map();
    this.mixer = null;
    this.clock = new THREE.Clock();
    this.timeline = [];
    this.currentTime = 0;
    this.duration = 10; // segundos por defecto
    this.isPlaying = false;
    this.loop = true;
    this.keyframes = new Map();
    this.interpolationTypes = {
      LINEAR: 'linear',
      EASE_IN: 'easeIn',
      EASE_OUT: 'easeOut',
      EASE_IN_OUT: 'easeInOut',
      STEP: 'step'
    };
  }

  /**
   * Inicializa el sistema de animación
   */
  initialize() {
    this.mixer = new THREE.AnimationMixer(new THREE.Scene());
    console.log('🎬 Sistema de animación inicializado');
  }

  /**
   * Crea una nueva animación
   */
  createAnimation(name, duration = 10) {
    const animation = {
      name,
      duration,
      tracks: [],
      keyframes: [],
      isPlaying: false,
      loop: true
    };
    
    this.animations.set(name, animation);
    return animation;
  }

  /**
   * Añade un keyframe a una animación
   */
  addKeyframe(animationName, time, object, property, value, interpolation = 'linear') {
    const animation = this.animations.get(animationName);
    if (!animation) {
      console.error(`Animación '${animationName}' no encontrada`);
      return;
    }

    const keyframe = {
      time,
      object,
      property,
      value,
      interpolation
    };

    animation.keyframes.push(keyframe);
    animation.keyframes.sort((a, b) => a.time - b.time);
  }

  /**
   * Reproduce una animación
   */
  playAnimation(name) {
    const animation = this.animations.get(name);
    if (!animation) {
      console.error(`Animación '${name}' no encontrada`);
      return;
    }

    animation.isPlaying = true;
    this.isPlaying = true;
    this.currentTime = 0;
    console.log(`▶️ Reproduciendo animación: ${name}`);
  }

  /**
   * Pausa la animación actual
   */
  pauseAnimation() {
    this.isPlaying = false;
    console.log('⏸️ Animación pausada');
  }

  /**
   * Detiene la animación actual
   */
  stopAnimation() {
    this.isPlaying = false;
    this.currentTime = 0;
    console.log('⏹️ Animación detenida');
  }

  /**
   * Actualiza la animación (llamar en el loop de renderizado)
   */
  update(deltaTime) {
    if (!this.isPlaying) return;

    this.currentTime += deltaTime;

    // Actualizar todas las animaciones activas
    this.animations.forEach((animation, name) => {
      if (animation.isPlaying) {
        this.updateAnimation(animation, this.currentTime);
      }
    });

    // Actualizar el mixer de Three.js
    if (this.mixer) {
      this.mixer.update(deltaTime);
    }
  }

  /**
   * Actualiza una animación específica
   */
  updateAnimation(animation, time) {
    if (time > animation.duration) {
      if (animation.loop) {
        this.currentTime = 0;
      } else {
        animation.isPlaying = false;
        this.isPlaying = false;
        return;
      }
    }

    // Aplicar keyframes
    animation.keyframes.forEach(keyframe => {
      if (keyframe.time <= time && keyframe.object) {
        this.applyKeyframe(keyframe);
      }
    });
  }

  /**
   * Aplica un keyframe a un objeto
   */
  applyKeyframe(keyframe) {
    const { object, property, value } = keyframe;
    
    if (!object) return;

    // Aplicar según el tipo de propiedad
    if (property === 'position') {
      object.position.copy(value);
    } else if (property === 'rotation') {
      object.rotation.copy(value);
    } else if (property === 'scale') {
      object.scale.copy(value);
    } else if (property === 'material.color') {
      if (object.material) {
        object.material.color.copy(value);
      }
    } else if (property === 'material.opacity') {
      if (object.material) {
        object.material.opacity = value;
        object.material.transparent = value < 1;
      }
    } else {
      // Propiedad genérica
      object[property] = value;
    }
  }

  /**
   * Crea una animación de rotación
   */
  createRotationAnimation(name, object, duration = 5, axis = 'y', angle = Math.PI * 2) {
    const animation = this.createAnimation(name, duration);
    
    // Keyframe inicial
    this.addKeyframe(name, 0, object, 'rotation', object.rotation.clone());
    
    // Keyframe final
    const finalRotation = object.rotation.clone();
    if (axis === 'x') finalRotation.x += angle;
    else if (axis === 'y') finalRotation.y += angle;
    else if (axis === 'z') finalRotation.z += angle;
    
    this.addKeyframe(name, duration, object, 'rotation', finalRotation);
    
    return animation;
  }

  /**
   * Crea una animación de movimiento
   */
  createMovementAnimation(name, object, startPosition, endPosition, duration = 3) {
    const animation = this.createAnimation(name, duration);
    
    // Keyframe inicial
    this.addKeyframe(name, 0, object, 'position', startPosition.clone());
    
    // Keyframe final
    this.addKeyframe(name, duration, object, 'position', endPosition.clone());
    
    return animation;
  }

  /**
   * Crea una animación de escala
   */
  createScaleAnimation(name, object, startScale, endScale, duration = 2) {
    const animation = this.createAnimation(name, duration);
    
    // Keyframe inicial
    this.addKeyframe(name, 0, object, 'scale', startScale.clone());
    
    // Keyframe final
    this.addKeyframe(name, duration, object, 'scale', endScale.clone());
    
    return animation;
  }

  /**
   * Exporta una animación a formato JSON
   */
  exportAnimation(name) {
    const animation = this.animations.get(name);
    if (!animation) {
      console.error(`Animación '${name}' no encontrada`);
      return null;
    }

    return {
      name: animation.name,
      duration: animation.duration,
      keyframes: animation.keyframes.map(kf => ({
        time: kf.time,
        property: kf.property,
        value: kf.value,
        interpolation: kf.interpolation
      })),
      loop: animation.loop
    };
  }

  /**
   * Importa una animación desde formato JSON
   */
  importAnimation(animationData) {
    const animation = this.createAnimation(animationData.name, animationData.duration);
    animation.loop = animationData.loop || true;
    
    animationData.keyframes.forEach(kf => {
      this.addKeyframe(animationData.name, kf.time, null, kf.property, kf.value, kf.interpolation);
    });
    
    return animation;
  }

  /**
   * Obtiene la lista de animaciones
   */
  getAnimations() {
    return Array.from(this.animations.keys());
  }

  /**
   * Elimina una animación
   */
  removeAnimation(name) {
    const animation = this.animations.get(name);
    if (animation && animation.isPlaying) {
      this.stopAnimation();
    }
    
    this.animations.delete(name);
    console.log(`🗑️ Animación '${name}' eliminada`);
  }

  /**
   * Limpia todas las animaciones
   */
  cleanup() {
    this.stopAnimation();
    this.animations.clear();
    this.keyframes.clear();
    this.timeline = [];
    this.currentTime = 0;
    
    if (this.mixer) {
      this.mixer.stopAllAction();
    }
    
    console.log('🧹 Sistema de animación limpiado');
  }
}

export { AnimationHelpers }; 
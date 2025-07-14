import * as THREE from 'three';

export interface AnimationClip {
  id: string;
  name: string;
  duration: number;
  tracks: THREE.KeyframeTrack[];
  loop: boolean;
  startTime: number;
}

export interface ScriptBehavior {
  id: string;
  name: string;
  type: 'rotation' | 'bounce' | 'float' | 'pulse' | 'custom';
  parameters: {
    speed?: number;
    amplitude?: number;
    direction?: THREE.Vector3;
    [key: string]: any;
  };
  enabled: boolean;
}

export interface AnimatedObject {
  id: string;
  mesh: THREE.Object3D;
  animations: Map<string, AnimationClip>;
  scripts: Map<string, ScriptBehavior>;
  mixer: THREE.AnimationMixer;
  currentAnimation: string | null;
}

export class AnimationSystem {
  private mixers: THREE.AnimationMixer[];
  private animatedObjects: Map<string, AnimatedObject>;
  private clock: THREE.Clock;

  constructor() {
    this.mixers = [];
    this.animatedObjects = new Map();
    this.clock = new THREE.Clock();
  }

  /**
   * Añadir objeto para animación
   */
  addAnimatedObject(
    id: string,
    mesh: THREE.Object3D,
    animations: THREE.AnimationClip[] = []
  ): void {
    const mixer = new THREE.AnimationMixer(mesh);
    const animationMap = new Map<string, AnimationClip>();

    // Agregar animaciones al mapa
    animations.forEach(clip => {
      animationMap.set(clip.name, {
        id: clip.name,
        name: clip.name,
        duration: clip.duration,
        tracks: clip.tracks,
        loop: true,
        startTime: 0
      });
    });

    const animatedObject: AnimatedObject = {
      id,
      mesh,
      animations: animationMap,
      scripts: new Map(),
      mixer,
      currentAnimation: null
    };

    this.animatedObjects.set(id, animatedObject);
    this.mixers.push(mixer);
  }

  /**
   * Crear animación de rotación
   */
  createRotationAnimation(
    object: THREE.Object3D,
    speed: number = 1,
    axis: THREE.Vector3 = new THREE.Vector3(0, 1, 0)
  ): THREE.AnimationClip {
    const keyframeTrack = new THREE.VectorKeyframeTrack(
      '.rotation',
      [0, 1],
      [
        object.rotation.x, object.rotation.y, object.rotation.z,
        object.rotation.x + axis.x * Math.PI * 2,
        object.rotation.y + axis.y * Math.PI * 2,
        object.rotation.z + axis.z * Math.PI * 2
      ]
    );

    const clip = new THREE.AnimationClip('rotation', 1 / speed, [keyframeTrack]);
    return clip;
  }

  /**
   * Crear animación de flotación
   */
  createFloatingAnimation(
    object: THREE.Object3D,
    amplitude: number = 0.5,
    frequency: number = 1
  ): THREE.AnimationClip {
    const keyframeTrack = new THREE.VectorKeyframeTrack(
      '.position',
      [0, 0.5, 1],
      [
        object.position.x, object.position.y, object.position.z,
        object.position.x, object.position.y + amplitude, object.position.z,
        object.position.x, object.position.y, object.position.z
      ]
    );

    const clip = new THREE.AnimationClip('floating', 1 / frequency, [keyframeTrack]);
    return clip;
  }

  /**
   * Crear animación de escalado
   */
  createScaleAnimation(
    minScale: number = 0.8,
    maxScale: number = 1.2,
    duration: number = 1
  ): THREE.AnimationClip {
    const keyframeTrack = new THREE.VectorKeyframeTrack(
      '.scale',
      [0, 0.5, 1],
      [
        minScale, minScale, minScale,
        maxScale, maxScale, maxScale,
        minScale, minScale, minScale
      ]
    );

    const clip = new THREE.AnimationClip('scale', duration, [keyframeTrack]);
    return clip;
  }

  /**
   * Reproducir animación
   */
  playAnimation(id: string, animationName: string, loop: boolean = true): void {
    const animatedObject = this.animatedObjects.get(id);
    if (!animatedObject) return;

    const animation = animatedObject.animations.get(animationName);
    if (!animation) return;

    // Crear clip de THREE.js
    const clip = new THREE.AnimationClip(
      animationName,
      animation.duration,
      animation.tracks
    );

    const action = animatedObject.mixer.clipAction(clip);
    
    if (loop) {
      action.setLoop(THREE.LoopRepeat, Infinity);
    } else {
      action.setLoop(THREE.LoopOnce, 1);
    }

    action.reset().play();
    animatedObject.currentAnimation = animationName;
  }

  /**
   * Detener animación
   */
  stopAnimation(id: string): void {
    const animatedObject = this.animatedObjects.get(id);
    if (!animatedObject) return;

    animatedObject.mixer.stopAllAction();
    animatedObject.currentAnimation = null;
  }

  /**
   * Añadir script de comportamiento
   */
  addScript(
    objectId: string,
    scriptType: string,
    parameters: any = {}
  ): string {
    const animatedObject = this.animatedObjects.get(objectId);
    if (!animatedObject) return '';

    const scriptId = `${scriptType}_${Date.now()}`;
    const script: ScriptBehavior = {
      id: scriptId,
      name: scriptType,
      type: scriptType as any,
      parameters,
      enabled: true
    };

    animatedObject.scripts.set(scriptId, script);
    return scriptId;
  }

  /**
   * Remover script
   */
  removeScript(objectId: string, scriptId: string): void {
    const animatedObject = this.animatedObjects.get(objectId);
    if (!animatedObject) return;

    animatedObject.scripts.delete(scriptId);
  }

  /**
   * Habilitar/deshabilitar script
   */
  setScriptEnabled(objectId: string, scriptId: string, enabled: boolean): void {
    const animatedObject = this.animatedObjects.get(objectId);
    if (!animatedObject) return;

    const script = animatedObject.scripts.get(scriptId);
    if (script) {
      script.enabled = enabled;
    }
  }

  /**
   * Actualizar sistema de animación
   */
  update(): void {
    const deltaTime = this.clock.getDelta();

    // Actualizar mixers
    this.mixers.forEach(mixer => {
      mixer.update(deltaTime);
    });

    // Actualizar scripts
    this.animatedObjects.forEach(animatedObject => {
      animatedObject.scripts.forEach(script => {
        if (script.enabled) {
          this.updateScript(animatedObject, script);
        }
      });
    });
  }

  /**
   * Actualizar script específico
   */
  private updateScript(animatedObject: AnimatedObject, script: ScriptBehavior): void {
    const mesh = animatedObject.mesh;
    const speed = script.parameters.speed || 1;
    const amplitude = script.parameters.amplitude || 0.5;

    switch (script.type) {
      case 'rotation':
        mesh.rotation.y += speed * 0.01;
        break;
      case 'float':
        mesh.position.y += Math.sin(Date.now() * 0.001 * speed) * amplitude * 0.01;
        break;
      case 'pulse':
        const scale = 1 + Math.sin(Date.now() * 0.001 * speed) * amplitude * 0.1;
        mesh.scale.set(scale, scale, scale);
        break;
      case 'bounce':
        mesh.position.y = Math.abs(Math.sin(Date.now() * 0.001 * speed)) * amplitude;
        break;
    }
  }

  /**
   * Obtener animaciones de un objeto
   */
  getObjectAnimations(objectId: string): AnimationClip[] {
    const animatedObject = this.animatedObjects.get(objectId);
    if (!animatedObject) return [];

    return Array.from(animatedObject.animations.values());
  }

  /**
   * Obtener scripts de un objeto
   */
  getObjectScripts(objectId: string): ScriptBehavior[] {
    const animatedObject = this.animatedObjects.get(objectId);
    if (!animatedObject) return [];

    return Array.from(animatedObject.scripts.values());
  }

  /**
   * Remover objeto animado
   */
  removeAnimatedObject(objectId: string): void {
    const animatedObject = this.animatedObjects.get(objectId);
    if (!animatedObject) return;

    // Remover mixer
    const mixerIndex = this.mixers.indexOf(animatedObject.mixer);
    if (mixerIndex > -1) {
      this.mixers.splice(mixerIndex, 1);
    }

    this.animatedObjects.delete(objectId);
  }

  /**
   * Limpiar todo
   */
  clearAll(): void {
    this.animatedObjects.clear();
    this.mixers = [];
  }

  /**
   * Obtener información de debug
   */
  getDebugInfo(): { totalObjects: number; totalAnimations: number; totalScripts: number } {
    let totalAnimations = 0;
    let totalScripts = 0;

    this.animatedObjects.forEach(obj => {
      totalAnimations += obj.animations.size;
      totalScripts += obj.scripts.size;
    });

    return {
      totalObjects: this.animatedObjects.size,
      totalAnimations,
      totalScripts
    };
  }

  /**
   * Obtener objeto animado
   */
  getAnimatedObject(id: string): AnimatedObject | undefined {
    return this.animatedObjects.get(id);
  }

  /**
   * Obtener IDs de objetos animados
   */
  getAnimatedObjectIds(): string[] {
    return Array.from(this.animatedObjects.keys());
  }

  /**
   * Verificar si un objeto está animado
   */
  isAnimated(id: string): boolean {
    return this.animatedObjects.has(id);
  }

  /**
   * Obtener animación actual
   */
  getCurrentAnimation(id: string): string | null {
    const animatedObject = this.animatedObjects.get(id);
    return animatedObject?.currentAnimation || null;
  }

  /**
   * Obtener nombres de animaciones
   */
  getAnimations(id: string): string[] {
    const animatedObject = this.animatedObjects.get(id);
    if (!animatedObject) return [];

    return Array.from(animatedObject.animations.keys());
  }
}

// Instancia global del sistema de animación
export const animationSystem = new AnimationSystem(); 
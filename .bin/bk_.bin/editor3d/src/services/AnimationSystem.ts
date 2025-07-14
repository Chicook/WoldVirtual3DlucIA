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

class AnimationSystem {
  private animatedObjects: Map<string, AnimatedObject> = new Map();
  private clock: THREE.Clock;
  private defaultScripts: Map<string, ScriptBehavior>;

  constructor() {
    this.clock = new THREE.Clock();
    this.initializeDefaultScripts();
  }

  /**
   * Inicializar scripts por defecto
   */
  private initializeDefaultScripts(): void {
    this.defaultScripts = new Map([
      ['rotation', {
        id: 'rotation',
        name: 'Rotación Continua',
        type: 'rotation',
        parameters: {
          speed: 1.0,
          direction: new THREE.Vector3(0, 1, 0)
        },
        enabled: true
      }],
      ['bounce', {
        id: 'bounce',
        name: 'Rebote',
        type: 'bounce',
        parameters: {
          speed: 2.0,
          amplitude: 0.5
        },
        enabled: true
      }],
      ['float', {
        id: 'float',
        name: 'Flotación',
        type: 'float',
        parameters: {
          speed: 1.5,
          amplitude: 0.3
        },
        enabled: true
      }],
      ['pulse', {
        id: 'pulse',
        name: 'Pulso',
        type: 'pulse',
        parameters: {
          speed: 1.0,
          amplitude: 0.2
        },
        enabled: true
      }]
    ]);
  }

  /**
   * Añadir objeto para animación
   */
  addAnimatedObject(id: string, mesh: THREE.Object3D): void {
    const mixer = new THREE.AnimationMixer(mesh);
    const animatedObject: AnimatedObject = {
      id,
      mesh,
      animations: new Map(),
      scripts: new Map(),
      mixer,
      currentAnimation: null
    };

    this.animatedObjects.set(id, animatedObject);
  }

  /**
   * Crear animación de rotación
   */
  createRotationAnimation(
    objectId: string,
    duration: number = 2.0,
    axis: THREE.Vector3 = new THREE.Vector3(0, 1, 0)
  ): string {
    const animatedObject = this.animatedObjects.get(objectId);
    if (!animatedObject) return '';

    const animationId = `rotation_${Date.now()}`;
    const times = [0, duration];
    const rotations = [0, Math.PI * 2];

    const track = new THREE.NumberKeyframeTrack(
      '.rotation[y]',
      times,
      rotations
    );

    const clip = new THREE.AnimationClip(animationId, duration, [track]);
    const action = animatedObject.mixer.clipAction(clip);
    action.setLoop(THREE.LoopRepeat);

    animatedObject.animations.set(animationId, {
      id: animationId,
      name: 'Rotación',
      duration,
      tracks: [track],
      loop: true,
      startTime: 0
    });

    return animationId;
  }

  /**
   * Crear animación de rebote
   */
  createBounceAnimation(
    objectId: string,
    duration: number = 1.0,
    amplitude: number = 0.5
  ): string {
    const animatedObject = this.animatedObjects.get(objectId);
    if (!animatedObject) return '';

    const animationId = `bounce_${Date.now()}`;
    const times = [0, duration / 2, duration];
    const positions = [0, amplitude, 0];

    const track = new THREE.NumberKeyframeTrack(
      '.position[y]',
      times,
      positions
    );

    const clip = new THREE.AnimationClip(animationId, duration, [track]);
    const action = animatedObject.mixer.clipAction(clip);
    action.setLoop(THREE.LoopRepeat);

    animatedObject.animations.set(animationId, {
      id: animationId,
      name: 'Rebote',
      duration,
      tracks: [track],
      loop: true,
      startTime: 0
    });

    return animationId;
  }

  /**
   * Crear animación de flotación
   */
  createFloatAnimation(
    objectId: string,
    duration: number = 2.0,
    amplitude: number = 0.3
  ): string {
    const animatedObject = this.animatedObjects.get(objectId);
    if (!animatedObject) return '';

    const animationId = `float_${Date.now()}`;
    const times = [0, duration / 4, duration / 2, duration * 3 / 4, duration];
    const positions = [0, amplitude / 2, amplitude, amplitude / 2, 0];

    const track = new THREE.NumberKeyframeTrack(
      '.position[y]',
      times,
      positions
    );

    const clip = new THREE.AnimationClip(animationId, duration, [track]);
    const action = animatedObject.mixer.clipAction(clip);
    action.setLoop(THREE.LoopRepeat);

    animatedObject.animations.set(animationId, {
      id: animationId,
      name: 'Flotación',
      duration,
      tracks: [track],
      loop: true,
      startTime: 0
    });

    return animationId;
  }

  /**
   * Crear animación de pulso (escala)
   */
  createPulseAnimation(
    objectId: string,
    duration: number = 1.0,
    amplitude: number = 0.2
  ): string {
    const animatedObject = this.animatedObjects.get(objectId);
    if (!animatedObject) return '';

    const animationId = `pulse_${Date.now()}`;
    const times = [0, duration / 2, duration];
    const scales = [1, 1 + amplitude, 1];

    const track = new THREE.NumberKeyframeTrack(
      '.scale[x]',
      times,
      scales
    );

    const clip = new THREE.AnimationClip(animationId, duration, [track]);
    const action = animatedObject.mixer.clipAction(clip);
    action.setLoop(THREE.LoopRepeat);

    animatedObject.animations.set(animationId, {
      id: animationId,
      name: 'Pulso',
      duration,
      tracks: [track],
      loop: true,
      startTime: 0
    });

    return animationId;
  }

  /**
   * Reproducir animación
   */
  playAnimation(objectId: string, animationId: string): void {
    const animatedObject = this.animatedObjects.get(objectId);
    if (!animatedObject) return;

    const animation = animatedObject.animations.get(animationId);
    if (!animation) return;

    // Detener animación actual
    if (animatedObject.currentAnimation) {
      const currentAction = animatedObject.mixer.clipAction(
        animatedObject.animations.get(animatedObject.currentAnimation)!.tracks[0]
      );
      currentAction.stop();
    }

    // Reproducir nueva animación
    const clip = new THREE.AnimationClip(animationId, animation.duration, animation.tracks);
    const action = animatedObject.mixer.clipAction(clip);
    
    if (animation.loop) {
      action.setLoop(THREE.LoopRepeat);
    }
    
    action.play();
    animatedObject.currentAnimation = animationId;
  }

  /**
   * Detener animación
   */
  stopAnimation(objectId: string): void {
    const animatedObject = this.animatedObjects.get(objectId);
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

    const defaultScript = this.defaultScripts.get(scriptType);
    if (!defaultScript) return '';

    const scriptId = `${scriptType}_${Date.now()}`;
    const script: ScriptBehavior = {
      ...defaultScript,
      id: scriptId,
      parameters: { ...defaultScript.parameters, ...parameters }
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
   * Actualizar scripts de comportamiento
   */
  updateScripts(deltaTime: number): void {
    this.animatedObjects.forEach(animatedObject => {
      animatedObject.scripts.forEach(script => {
        if (!script.enabled) return;

        switch (script.type) {
          case 'rotation':
            this.updateRotationScript(animatedObject, script, deltaTime);
            break;
          case 'bounce':
            this.updateBounceScript(animatedObject, script, deltaTime);
            break;
          case 'float':
            this.updateFloatScript(animatedObject, script, deltaTime);
            break;
          case 'pulse':
            this.updatePulseScript(animatedObject, script, deltaTime);
            break;
        }
      });
    });
  }

  /**
   * Actualizar script de rotación
   */
  private updateRotationScript(
    animatedObject: AnimatedObject,
    script: ScriptBehavior,
    deltaTime: number
  ): void {
    const speed = script.parameters.speed || 1.0;
    const direction = script.parameters.direction || new THREE.Vector3(0, 1, 0);
    
    const rotationAmount = speed * deltaTime;
    animatedObject.mesh.rotateOnAxis(direction, rotationAmount);
  }

  /**
   * Actualizar script de rebote
   */
  private updateBounceScript(
    animatedObject: AnimatedObject,
    script: ScriptBehavior,
    deltaTime: number
  ): void {
    const speed = script.parameters.speed || 2.0;
    const amplitude = script.parameters.amplitude || 0.5;
    
    const time = Date.now() * 0.001 * speed;
    const bounce = Math.sin(time) * amplitude;
    
    const originalY = animatedObject.mesh.userData.originalY || 0;
    animatedObject.mesh.position.y = originalY + bounce;
  }

  /**
   * Actualizar script de flotación
   */
  private updateFloatScript(
    animatedObject: AnimatedObject,
    script: ScriptBehavior,
    deltaTime: number
  ): void {
    const speed = script.parameters.speed || 1.5;
    const amplitude = script.parameters.amplitude || 0.3;
    
    const time = Date.now() * 0.001 * speed;
    const float = Math.sin(time) * amplitude;
    
    const originalY = animatedObject.mesh.userData.originalY || 0;
    animatedObject.mesh.position.y = originalY + float;
  }

  /**
   * Actualizar script de pulso
   */
  private updatePulseScript(
    animatedObject: AnimatedObject,
    script: ScriptBehavior,
    deltaTime: number
  ): void {
    const speed = script.parameters.speed || 1.0;
    const amplitude = script.parameters.amplitude || 0.2;
    
    const time = Date.now() * 0.001 * speed;
    const pulse = 1 + Math.sin(time) * amplitude;
    
    animatedObject.mesh.scale.setScalar(pulse);
  }

  /**
   * Actualizar sistema de animación
   */
  update(): void {
    const deltaTime = this.clock.getDelta();

    // Actualizar mixers de animación
    this.animatedObjects.forEach(animatedObject => {
      animatedObject.mixer.update(deltaTime);
    });

    // Actualizar scripts de comportamiento
    this.updateScripts(deltaTime);
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
   * Obtener scripts por defecto disponibles
   */
  getAvailableScripts(): ScriptBehavior[] {
    return Array.from(this.defaultScripts.values());
  }

  /**
   * Limpiar objeto animado
   */
  removeAnimatedObject(objectId: string): void {
    const animatedObject = this.animatedObjects.get(objectId);
    if (animatedObject) {
      animatedObject.mixer.stopAllAction();
      this.animatedObjects.delete(objectId);
    }
  }

  /**
   * Limpiar todos los objetos animados
   */
  clearAll(): void {
    this.animatedObjects.forEach(animatedObject => {
      animatedObject.mixer.stopAllAction();
    });
    this.animatedObjects.clear();
  }

  /**
   * Obtener información de debug
   */
  getDebugInfo(): { totalObjects: number; totalAnimations: number; totalScripts: number } {
    let totalAnimations = 0;
    let totalScripts = 0;

    this.animatedObjects.forEach(animatedObject => {
      totalAnimations += animatedObject.animations.size;
      totalScripts += animatedObject.scripts.size;
    });

    return {
      totalObjects: this.animatedObjects.size,
      totalAnimations,
      totalScripts
    };
  }
}

export const animationSystem = new AnimationSystem(); 
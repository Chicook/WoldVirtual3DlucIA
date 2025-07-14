/**
 * Sistema de Animaciones Avanzadas para Avatares
 * Maneja animaciones complejas, expresiones faciales y movimientos corporales
 */

import * as THREE from 'three';

class AvatarAnimations {
    constructor(avatarGenerator) {
        this.avatarGenerator = avatarGenerator;
        this.animations = {};
        this.currentAnimation = null;
        this.mixer = null;
        this.clock = new THREE.Clock();
        this.expressions = {};
        this.gestures = {};
        
        this.init();
    }

    /**
     * Inicializar sistema de animaciones
     */
    init() {
        this.setupAnimationMixer();
        this.createBasicAnimations();
        this.createExpressions();
        this.createGestures();
        this.setupIdleAnimation();
    }

    /**
     * Configurar mezclador de animaciones
     */
    setupAnimationMixer() {
        this.mixer = new THREE.AnimationMixer(this.avatarGenerator.avatar);
    }

    /**
     * Crear animaciones básicas
     */
    createBasicAnimations() {
        // Animación de caminar
        this.animations.walk = this.createWalkAnimation();
        
        // Animación de correr
        this.animations.run = this.createRunAnimation();
        
        // Animación de saltar
        this.animations.jump = this.createJumpAnimation();
        
        // Animación de saludar
        this.animations.wave = this.createWaveAnimation();
        
        // Animación de aplaudir
        this.animations.clap = this.createClapAnimation();
        
        // Animación de sentarse
        this.animations.sit = this.createSitAnimation();
        
        // Animación de levantarse
        this.animations.stand = this.createStandAnimation();
        
        // Animación de bailar
        this.animations.dance = this.createDanceAnimation();
    }

    /**
     * Crear animación de caminar
     */
    createWalkAnimation() {
        const duration = 1.0;
        const tracks = [];

        // Movimiento de piernas
        const leftLegTrack = new THREE.VectorKeyframeTrack(
            '.skeleton.legs.left.thigh.rotation[x]',
            [0, 0.25, 0.5, 0.75, 1.0],
            [0, 0.3, 0, -0.3, 0]
        );
        tracks.push(leftLegTrack);

        const rightLegTrack = new THREE.VectorKeyframeTrack(
            '.skeleton.legs.right.thigh.rotation[x]',
            [0, 0.25, 0.5, 0.75, 1.0],
            [0, -0.3, 0, 0.3, 0]
        );
        tracks.push(rightLegTrack);

        // Movimiento de brazos
        const leftArmTrack = new THREE.VectorKeyframeTrack(
            '.skeleton.arms.left.upperArm.rotation[z]',
            [0, 0.25, 0.5, 0.75, 1.0],
            [0, -0.2, 0, 0.2, 0]
        );
        tracks.push(leftArmTrack);

        const rightArmTrack = new THREE.VectorKeyframeTrack(
            '.skeleton.arms.right.upperArm.rotation[z]',
            [0, 0.25, 0.5, 0.75, 1.0],
            [0, 0.2, 0, -0.2, 0]
        );
        tracks.push(rightArmTrack);

        // Movimiento del cuerpo
        const bodyTrack = new THREE.VectorKeyframeTrack(
            '.skeleton.root.position[y]',
            [0, 0.5, 1.0],
            [0, 0.05, 0]
        );
        tracks.push(bodyTrack);

        const clip = new THREE.AnimationClip('walk', duration, tracks);
        return clip;
    }

    /**
     * Crear animación de correr
     */
    createRunAnimation() {
        const duration = 0.6;
        const tracks = [];

        // Movimiento de piernas más rápido
        const leftLegTrack = new THREE.VectorKeyframeTrack(
            '.skeleton.legs.left.thigh.rotation[x]',
            [0, 0.25, 0.5, 0.75, 1.0],
            [0, 0.5, 0, -0.5, 0]
        );
        tracks.push(leftLegTrack);

        const rightLegTrack = new THREE.VectorKeyframeTrack(
            '.skeleton.legs.right.thigh.rotation[x]',
            [0, 0.25, 0.5, 0.75, 1.0],
            [0, -0.5, 0, 0.5, 0]
        );
        tracks.push(rightLegTrack);

        // Movimiento de brazos más pronunciado
        const leftArmTrack = new THREE.VectorKeyframeTrack(
            '.skeleton.arms.left.upperArm.rotation[z]',
            [0, 0.25, 0.5, 0.75, 1.0],
            [0, -0.4, 0, 0.4, 0]
        );
        tracks.push(leftArmTrack);

        const rightArmTrack = new THREE.VectorKeyframeTrack(
            '.skeleton.arms.right.upperArm.rotation[z]',
            [0, 0.25, 0.5, 0.75, 1.0],
            [0, 0.4, 0, -0.4, 0]
        );
        tracks.push(rightArmTrack);

        // Movimiento del cuerpo más pronunciado
        const bodyTrack = new THREE.VectorKeyframeTrack(
            '.skeleton.root.position[y]',
            [0, 0.5, 1.0],
            [0, 0.1, 0]
        );
        tracks.push(bodyTrack);

        const clip = new THREE.AnimationClip('run', duration, tracks);
        return clip;
    }

    /**
     * Crear animación de saltar
     */
    createJumpAnimation() {
        const duration = 1.2;
        const tracks = [];

        // Salto vertical
        const jumpTrack = new THREE.VectorKeyframeTrack(
            '.skeleton.root.position[y]',
            [0, 0.3, 0.6, 0.9, 1.2],
            [0, 0.5, 1.0, 0.5, 0]
        );
        tracks.push(jumpTrack);

        // Flexión de piernas
        const legTrack = new THREE.VectorKeyframeTrack(
            '.skeleton.legs.left.thigh.rotation[x]',
            [0, 0.3, 0.6, 0.9, 1.2],
            [0, -0.3, 0, 0.3, 0]
        );
        tracks.push(legTrack);

        const clip = new THREE.AnimationClip('jump', duration, tracks);
        return clip;
    }

    /**
     * Crear animación de saludar
     */
    createWaveAnimation() {
        const duration = 2.0;
        const tracks = [];

        // Movimiento de brazo derecho
        const armTrack = new THREE.VectorKeyframeTrack(
            '.skeleton.arms.right.upperArm.rotation[z]',
            [0, 0.25, 0.5, 0.75, 1.0, 1.25, 1.5, 1.75, 2.0],
            [0, 0.8, 0.4, 0.8, 0.4, 0.8, 0.4, 0.8, 0]
        );
        tracks.push(armTrack);

        // Movimiento de mano
        const handTrack = new THREE.VectorKeyframeTrack(
            '.skeleton.arms.right.hand.rotation[z]',
            [0, 0.25, 0.5, 0.75, 1.0, 1.25, 1.5, 1.75, 2.0],
            [0, 0.3, -0.3, 0.3, -0.3, 0.3, -0.3, 0.3, 0]
        );
        tracks.push(handTrack);

        const clip = new THREE.AnimationClip('wave', duration, tracks);
        return clip;
    }

    /**
     * Crear animación de aplaudir
     */
    createClapAnimation() {
        const duration = 1.0;
        const tracks = [];

        // Movimiento de brazos hacia el centro
        const leftArmTrack = new THREE.VectorKeyframeTrack(
            '.skeleton.arms.left.upperArm.rotation[y]',
            [0, 0.5, 1.0],
            [0, -0.8, 0]
        );
        tracks.push(leftArmTrack);

        const rightArmTrack = new THREE.VectorKeyframeTrack(
            '.skeleton.arms.right.upperArm.rotation[y]',
            [0, 0.5, 1.0],
            [0, 0.8, 0]
        );
        tracks.push(rightArmTrack);

        const clip = new THREE.AnimationClip('clap', duration, tracks);
        return clip;
    }

    /**
     * Crear animación de sentarse
     */
    createSitAnimation() {
        const duration = 1.5;
        const tracks = [];

        // Bajar el cuerpo
        const bodyTrack = new THREE.VectorKeyframeTrack(
            '.skeleton.root.position[y]',
            [0, 1.0, 1.5],
            [0, -0.4, -0.4]
        );
        tracks.push(bodyTrack);

        // Flexionar piernas
        const legTrack = new THREE.VectorKeyframeTrack(
            '.skeleton.legs.left.thigh.rotation[x]',
            [0, 1.0, 1.5],
            [0, -0.8, -0.8]
        );
        tracks.push(legTrack);

        const clip = new THREE.AnimationClip('sit', duration, tracks);
        return clip;
    }

    /**
     * Crear animación de levantarse
     */
    createStandAnimation() {
        const duration = 1.5;
        const tracks = [];

        // Levantar el cuerpo
        const bodyTrack = new THREE.VectorKeyframeTrack(
            '.skeleton.root.position[y]',
            [0, 1.0, 1.5],
            [-0.4, 0, 0]
        );
        tracks.push(bodyTrack);

        // Estirar piernas
        const legTrack = new THREE.VectorKeyframeTrack(
            '.skeleton.legs.left.thigh.rotation[x]',
            [0, 1.0, 1.5],
            [-0.8, 0, 0]
        );
        tracks.push(legTrack);

        const clip = new THREE.AnimationClip('stand', duration, tracks);
        return clip;
    }

    /**
     * Crear animación de bailar
     */
    createDanceAnimation() {
        const duration = 2.0;
        const tracks = [];

        // Movimiento de cadera
        const hipTrack = new THREE.VectorKeyframeTrack(
            '.skeleton.root.rotation[y]',
            [0, 0.5, 1.0, 1.5, 2.0],
            [0, 0.2, -0.2, 0.2, 0]
        );
        tracks.push(hipTrack);

        // Movimiento de brazos
        const leftArmTrack = new THREE.VectorKeyframeTrack(
            '.skeleton.arms.left.upperArm.rotation[z]',
            [0, 0.5, 1.0, 1.5, 2.0],
            [0, 0.3, -0.3, 0.3, 0]
        );
        tracks.push(leftArmTrack);

        const rightArmTrack = new THREE.VectorKeyframeTrack(
            '.skeleton.arms.right.upperArm.rotation[z]',
            [0, 0.5, 1.0, 1.5, 2.0],
            [0, -0.3, 0.3, -0.3, 0]
        );
        tracks.push(rightArmTrack);

        const clip = new THREE.AnimationClip('dance', duration, tracks);
        return clip;
    }

    /**
     * Crear expresiones faciales
     */
    createExpressions() {
        this.expressions = {
            happy: this.createHappyExpression(),
            sad: this.createSadExpression(),
            angry: this.createAngryExpression(),
            surprised: this.createSurprisedExpression(),
            neutral: this.createNeutralExpression()
        };
    }

    /**
     * Crear expresión feliz
     */
    createHappyExpression() {
        const duration = 0.5;
        const tracks = [];

        // Sonrisa
        const mouthTrack = new THREE.VectorKeyframeTrack(
            '.skeleton.head.children[4].scale[y]',
            [0, 0.5],
            [1, 1.5]
        );
        tracks.push(mouthTrack);

        // Ojos entrecerrados
        const eyeTrack = new THREE.VectorKeyframeTrack(
            '.skeleton.head.children[0].scale[y]',
            [0, 0.5],
            [1, 0.7]
        );
        tracks.push(eyeTrack);

        const clip = new THREE.AnimationClip('happy', duration, tracks);
        return clip;
    }

    /**
     * Crear expresión triste
     */
    createSadExpression() {
        const duration = 0.5;
        const tracks = [];

        // Boca hacia abajo
        const mouthTrack = new THREE.VectorKeyframeTrack(
            '.skeleton.head.children[4].rotation[z]',
            [0, 0.5],
            [0, -0.2]
        );
        tracks.push(mouthTrack);

        // Cejas hacia abajo
        const eyebrowTrack = new THREE.VectorKeyframeTrack(
            '.skeleton.head.children[0].position[y]',
            [0, 0.5],
            [0.05, 0.02]
        );
        tracks.push(eyebrowTrack);

        const clip = new THREE.AnimationClip('sad', duration, tracks);
        return clip;
    }

    /**
     * Crear expresión enojada
     */
    createAngryExpression() {
        const duration = 0.3;
        const tracks = [];

        // Cejas hacia abajo
        const eyebrowTrack = new THREE.VectorKeyframeTrack(
            '.skeleton.head.children[0].rotation[z]',
            [0, 0.3],
            [0, -0.3]
        );
        tracks.push(eyebrowTrack);

        // Boca apretada
        const mouthTrack = new THREE.VectorKeyframeTrack(
            '.skeleton.head.children[4].scale[y]',
            [0, 0.3],
            [1, 0.5]
        );
        tracks.push(mouthTrack);

        const clip = new THREE.AnimationClip('angry', duration, tracks);
        return clip;
    }

    /**
     * Crear expresión sorprendida
     */
    createSurprisedExpression() {
        const duration = 0.5;
        const tracks = [];

        // Ojos abiertos
        const eyeTrack = new THREE.VectorKeyframeTrack(
            '.skeleton.head.children[0].scale[y]',
            [0, 0.5],
            [1, 1.3]
        );
        tracks.push(eyeTrack);

        // Boca abierta
        const mouthTrack = new THREE.VectorKeyframeTrack(
            '.skeleton.head.children[4].scale[y]',
            [0, 0.5],
            [1, 2.0]
        );
        tracks.push(mouthTrack);

        const clip = new THREE.AnimationClip('surprised', duration, tracks);
        return clip;
    }

    /**
     * Crear expresión neutral
     */
    createNeutralExpression() {
        const duration = 0.5;
        const tracks = [];

        // Resetear todas las expresiones
        const resetTrack = new THREE.VectorKeyframeTrack(
            '.skeleton.head.children[0].scale[y]',
            [0, 0.5],
            [1, 1]
        );
        tracks.push(resetTrack);

        const clip = new THREE.AnimationClip('neutral', duration, tracks);
        return clip;
    }

    /**
     * Crear gestos
     */
    createGestures() {
        this.gestures = {
            point: this.createPointGesture(),
            thumbsUp: this.createThumbsUpGesture(),
            peace: this.createPeaceGesture(),
            fist: this.createFistGesture()
        };
    }

    /**
     * Crear gesto de señalar
     */
    createPointGesture() {
        const duration = 0.8;
        const tracks = [];

        // Extender brazo
        const armTrack = new THREE.VectorKeyframeTrack(
            '.skeleton.arms.right.upperArm.rotation[y]',
            [0, 0.8],
            [0, -0.6]
        );
        tracks.push(armTrack);

        // Extender dedo índice
        const fingerTrack = new THREE.VectorKeyframeTrack(
            '.skeleton.arms.right.hand.rotation[x]',
            [0, 0.8],
            [0, 0.3]
        );
        tracks.push(fingerTrack);

        const clip = new THREE.AnimationClip('point', duration, tracks);
        return clip;
    }

    /**
     * Crear gesto de pulgar arriba
     */
    createThumbsUpGesture() {
        const duration = 0.5;
        const tracks = [];

        // Levantar pulgar
        const thumbTrack = new THREE.VectorKeyframeTrack(
            '.skeleton.arms.right.hand.rotation[z]',
            [0, 0.5],
            [0, 0.8]
        );
        tracks.push(thumbTrack);

        const clip = new THREE.AnimationClip('thumbsUp', duration, tracks);
        return clip;
    }

    /**
     * Crear gesto de paz
     */
    createPeaceGesture() {
        const duration = 0.5;
        const tracks = [];

        // Extender dedos índice y medio
        const fingerTrack = new THREE.VectorKeyframeTrack(
            '.skeleton.arms.right.hand.rotation[x]',
            [0, 0.5],
            [0, 0.5]
        );
        tracks.push(fingerTrack);

        const clip = new THREE.AnimationClip('peace', duration, tracks);
        return clip;
    }

    /**
     * Crear gesto de puño
     */
    createFistGesture() {
        const duration = 0.3;
        const tracks = [];

        // Cerrar puño
        const fistTrack = new THREE.VectorKeyframeTrack(
            '.skeleton.arms.right.hand.scale[y]',
            [0, 0.3],
            [1, 0.7]
        );
        tracks.push(fistTrack);

        const clip = new THREE.AnimationClip('fist', duration, tracks);
        return clip;
    }

    /**
     * Configurar animación de reposo
     */
    setupIdleAnimation() {
        this.animations.idle = this.createIdleAnimation();
        this.playAnimation('idle', true);
    }

    /**
     * Crear animación de reposo
     */
    createIdleAnimation() {
        const duration = 4.0;
        const tracks = [];

        // Respiración sutil
        const breathingTrack = new THREE.VectorKeyframeTrack(
            '.skeleton.spine[2].scale[y]',
            [0, 2.0, 4.0],
            [1, 1.02, 1]
        );
        tracks.push(breathingTrack);

        // Movimiento sutil de la cabeza
        const headTrack = new THREE.VectorKeyframeTrack(
            '.skeleton.head.rotation[y]',
            [0, 1.0, 2.0, 3.0, 4.0],
            [0, 0.02, 0, -0.02, 0]
        );
        tracks.push(headTrack);

        const clip = new THREE.AnimationClip('idle', duration, tracks);
        return clip;
    }

    /**
     * Reproducir animación
     */
    playAnimation(animationName, loop = false) {
        if (this.currentAnimation) {
            this.mixer.stopAllAction();
        }

        const clip = this.animations[animationName];
        if (clip) {
            const action = this.mixer.clipAction(clip);
            action.setLoop(loop ? THREE.LoopRepeat : THREE.LoopOnce);
            action.clampWhenFinished = true;
            action.play();
            this.currentAnimation = action;
        }
    }

    /**
     * Reproducir expresión
     */
    playExpression(expressionName) {
        const clip = this.expressions[expressionName];
        if (clip) {
            const action = this.mixer.clipAction(clip);
            action.setLoop(THREE.LoopOnce);
            action.clampWhenFinished = true;
            action.play();
        }
    }

    /**
     * Reproducir gesto
     */
    playGesture(gestureName) {
        const clip = this.gestures[gestureName];
        if (clip) {
            const action = this.mixer.clipAction(clip);
            action.setLoop(THREE.LoopOnce);
            action.clampWhenFinished = true;
            action.play();
        }
    }

    /**
     * Detener animación actual
     */
    stopAnimation() {
        if (this.currentAnimation) {
            this.currentAnimation.stop();
            this.currentAnimation = null;
        }
    }

    /**
     * Pausar animación
     */
    pauseAnimation() {
        if (this.currentAnimation) {
            this.currentAnimation.paused = true;
        }
    }

    /**
     * Reanudar animación
     */
    resumeAnimation() {
        if (this.currentAnimation) {
            this.currentAnimation.paused = false;
        }
    }

    /**
     * Establecer velocidad de animación
     */
    setAnimationSpeed(speed) {
        if (this.currentAnimation) {
            this.currentAnimation.timeScale = speed;
        }
    }

    /**
     * Actualizar animaciones
     */
    update() {
        const delta = this.clock.getDelta();
        if (this.mixer) {
            this.mixer.update(delta);
        }
    }

    /**
     * Obtener lista de animaciones disponibles
     */
    getAvailableAnimations() {
        return Object.keys(this.animations);
    }

    /**
     * Obtener lista de expresiones disponibles
     */
    getAvailableExpressions() {
        return Object.keys(this.expressions);
    }

    /**
     * Obtener lista de gestos disponibles
     */
    getAvailableGestures() {
        return Object.keys(this.gestures);
    }

    /**
     * Crear animación personalizada
     */
    createCustomAnimation(name, tracks, duration) {
        const clip = new THREE.AnimationClip(name, duration, tracks);
        this.animations[name] = clip;
        return clip;
    }

    /**
     * Limpiar recursos
     */
    dispose() {
        if (this.mixer) {
            this.mixer.stopAllAction();
            this.mixer.uncacheRoot(this.avatarGenerator.avatar);
        }
    }
}

// Exportar para uso modular
export default AvatarAnimations;

// Funciones globales para integración
window.AvatarAnimations = AvatarAnimations;
window.createAvatarAnimations = (avatarGenerator) => {
    return new AvatarAnimations(avatarGenerator);
}; 
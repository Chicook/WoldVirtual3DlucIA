/**
 * Sistema de Animaciones y Transiciones Avanzado para Metaverso
 * Animaciones fluidas, transiciones suaves y efectos visuales
 */

class AdvancedAnimationService {
    constructor() {
        // Configuración del sistema
        this.config = {
            enableGPUAcceleration: true,
            enableInterpolation: true,
            enableEasing: true,
            maxConcurrentAnimations: 100,
            defaultDuration: 300,
            defaultEasing: 'ease-out',
            enableTransform3D: true,
            enableHardwareAcceleration: true
        };
        
        // Gestión de animaciones
        this.animations = new Map();
        this.animationGroups = new Map();
        this.transitions = new Map();
        this.effects = new Map();
        
        // Sistema de easing
        this.easingFunctions = {
            'linear': t => t,
            'ease-in': t => t * t,
            'ease-out': t => t * (2 - t),
            'ease-in-out': t => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t,
            'bounce': t => {
                if (t < 1 / 2.75) return 7.5625 * t * t;
                if (t < 2 / 2.75) return 7.5625 * (t -= 1.5 / 2.75) * t + 0.75;
                if (t < 2.5 / 2.75) return 7.5625 * (t -= 2.25 / 2.75) * t + 0.9375;
                return 7.5625 * (t -= 2.625 / 2.75) * t + 0.984375;
            },
            'elastic': t => {
                const p = 0.3;
                return Math.pow(2, -10 * t) * Math.sin((t - p / 4) * (2 * Math.PI) / p) + 1;
            },
            'back': t => {
                const s = 1.70158;
                return t * t * ((s + 1) * t - s);
            }
        };
        
        // Estados
        this.states = {
            isInitialized: false,
            isEnabled: true,
            isProcessing: false,
            totalAnimations: 0,
            activeAnimations: 0
        };
        
        // Métricas
        this.metrics = {
            totalAnimations: 0,
            activeAnimations: 0,
            completedAnimations: 0,
            failedAnimations: 0,
            averageDuration: 0,
            performanceScore: 0
        };
        
        // Timeline
        this.timeline = {
            currentTime: 0,
            animations: [],
            paused: false
        };
        
        console.log('🎬 Sistema de Animaciones Avanzado inicializado');
    }

    /**
     * Inicializar sistema de animaciones
     */
    async initialize() {
        try {
            // Configurar aceleración por hardware
            this.setupHardwareAcceleration();
            
            // Crear animaciones por defecto
            this.createDefaultAnimations();
            
            // Crear transiciones por defecto
            this.createDefaultTransitions();
            
            // Crear efectos por defecto
            this.createDefaultEffects();
            
            // Configurar timeline
            this.setupTimeline();
            
            this.states.isInitialized = true;
            console.log('✅ Sistema de Animaciones Avanzado inicializado');
            
        } catch (error) {
            console.error('❌ Error inicializando sistema de animaciones:', error);
            throw error;
        }
    }

    /**
     * Configurar aceleración por hardware
     */
    setupHardwareAcceleration() {
        if (this.config.enableHardwareAcceleration) {
            // Configurar transform3d para aceleración GPU
            document.body.style.transform = 'translateZ(0)';
            document.body.style.willChange = 'transform';
        }
    }

    /**
     * Crear animaciones por defecto
     */
    createDefaultAnimations() {
        // Animación de fade in
        this.animations.set('fadeIn', {
            name: 'fadeIn',
            duration: 300,
            easing: 'ease-out',
            properties: {
                opacity: { from: 0, to: 1 }
            }
        });
        
        // Animación de fade out
        this.animations.set('fadeOut', {
            name: 'fadeOut',
            duration: 300,
            easing: 'ease-in',
            properties: {
                opacity: { from: 1, to: 0 }
            }
        });
        
        // Animación de slide in desde la izquierda
        this.animations.set('slideInLeft', {
            name: 'slideInLeft',
            duration: 400,
            easing: 'ease-out',
            properties: {
                transform: { 
                    from: 'translateX(-100%)', 
                    to: 'translateX(0%)' 
                },
                opacity: { from: 0, to: 1 }
            }
        });
        
        // Animación de slide in desde la derecha
        this.animations.set('slideInRight', {
            name: 'slideInRight',
            duration: 400,
            easing: 'ease-out',
            properties: {
                transform: { 
                    from: 'translateX(100%)', 
                    to: 'translateX(0%)' 
                },
                opacity: { from: 0, to: 1 }
            }
        });
        
        // Animación de scale in
        this.animations.set('scaleIn', {
            name: 'scaleIn',
            duration: 350,
            easing: 'ease-out',
            properties: {
                transform: { 
                    from: 'scale(0.8)', 
                    to: 'scale(1)' 
                },
                opacity: { from: 0, to: 1 }
            }
        });
        
        // Animación de bounce
        this.animations.set('bounce', {
            name: 'bounce',
            duration: 600,
            easing: 'bounce',
            properties: {
                transform: { 
                    from: 'scale(0.3)', 
                    to: 'scale(1)' 
                },
                opacity: { from: 0, to: 1 }
            }
        });
        
        // Animación de flip
        this.animations.set('flip', {
            name: 'flip',
            duration: 500,
            easing: 'ease-in-out',
            properties: {
                transform: { 
                    from: 'rotateY(90deg)', 
                    to: 'rotateY(0deg)' 
                },
                opacity: { from: 0, to: 1 }
            }
        });
        
        console.log('🎭 Animaciones por defecto creadas');
    }

    /**
     * Crear transiciones por defecto
     */
    createDefaultTransitions() {
        // Transición de página
        this.transitions.set('pageTransition', {
            name: 'pageTransition',
            duration: 500,
            easing: 'ease-in-out',
            enter: {
                opacity: { from: 0, to: 1 },
                transform: { from: 'translateY(20px)', to: 'translateY(0)' }
            },
            exit: {
                opacity: { from: 1, to: 0 },
                transform: { from: 'translateY(0)', to: 'translateY(-20px)' }
            }
        });
        
        // Transición de modal
        this.transitions.set('modalTransition', {
            name: 'modalTransition',
            duration: 300,
            easing: 'ease-out',
            enter: {
                opacity: { from: 0, to: 1 },
                transform: { from: 'scale(0.8) translateY(-50px)', to: 'scale(1) translateY(0)' }
            },
            exit: {
                opacity: { from: 1, to: 0 },
                transform: { from: 'scale(1) translateY(0)', to: 'scale(0.8) translateY(-50px)' }
            }
        });
        
        // Transición de lista
        this.transitions.set('listTransition', {
            name: 'listTransition',
            duration: 400,
            easing: 'ease-out',
            stagger: 50,
            enter: {
                opacity: { from: 0, to: 1 },
                transform: { from: 'translateX(-30px)', to: 'translateX(0)' }
            },
            exit: {
                opacity: { from: 1, to: 0 },
                transform: { from: 'translateX(0)', to: 'translateX(30px)' }
            }
        });
        
        console.log('🔄 Transiciones por defecto creadas');
    }

    /**
     * Crear efectos por defecto
     */
    createDefaultEffects() {
        // Efecto de partículas
        this.effects.set('particles', {
            name: 'particles',
            create: (element, options = {}) => {
                const particles = document.createElement('div');
                particles.className = 'animation-particles';
                particles.style.cssText = `
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    pointer-events: none;
                    z-index: 1000;
                `;
                
                const count = options.count || 20;
                for (let i = 0; i < count; i++) {
                    const particle = document.createElement('div');
                    particle.style.cssText = `
                        position: absolute;
                        width: 4px;
                        height: 4px;
                        background: ${options.color || '#ffffff'};
                        border-radius: 50%;
                        animation: particle-float ${2 + Math.random() * 2}s ease-in-out infinite;
                        left: ${Math.random() * 100}%;
                        top: ${Math.random() * 100}%;
                    `;
                    particles.appendChild(particle);
                }
                
                element.appendChild(particles);
                return particles;
            }
        });
        
        // Efecto de ondas
        this.effects.set('waves', {
            name: 'waves',
            create: (element, options = {}) => {
                const waves = document.createElement('div');
                waves.className = 'animation-waves';
                waves.style.cssText = `
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    pointer-events: none;
                    z-index: 1000;
                `;
                
                const waveCount = options.waveCount || 3;
                for (let i = 0; i < waveCount; i++) {
                    const wave = document.createElement('div');
                    wave.style.cssText = `
                        position: absolute;
                        width: 200%;
                        height: 200%;
                        background: radial-gradient(circle, ${options.color || '#ffffff'} 0%, transparent 70%);
                        border-radius: 50%;
                        animation: wave-expand ${1.5 + i * 0.5}s ease-out forwards;
                        left: -50%;
                        top: -50%;
                        opacity: 0.3;
                    `;
                    waves.appendChild(wave);
                }
                
                element.appendChild(waves);
                return waves;
            }
        });
        
        console.log('✨ Efectos por defecto creados');
    }

    /**
     * Configurar timeline
     */
    setupTimeline() {
        this.timeline.currentTime = 0;
        this.timeline.animations = [];
        this.timeline.paused = false;
    }

    /**
     * Animar elemento
     */
    animate(element, animationName, options = {}) {
        const animation = this.animations.get(animationName);
        if (!animation) {
            console.warn(`Animación no encontrada: ${animationName}`);
            return null;
        }
        
        const {
            duration = animation.duration,
            easing = animation.easing,
            delay = 0,
            onStart = null,
            onUpdate = null,
            onComplete = null,
            onCancel = null
        } = options;
        
        const animationId = this.generateAnimationId();
        const startTime = performance.now() + delay;
        const endTime = startTime + duration;
        
        const animationData = {
            id: animationId,
            element,
            animation,
            startTime,
            endTime,
            duration,
            easing,
            delay,
            progress: 0,
            isActive: true,
            callbacks: { onStart, onUpdate, onComplete, onCancel }
        };
        
        this.animations.set(animationId, animationData);
        this.states.activeAnimations++;
        this.metrics.totalAnimations++;
        
        // Programar inicio
        if (delay > 0) {
            setTimeout(() => {
                this.startAnimation(animationId);
            }, delay);
        } else {
            this.startAnimation(animationId);
        }
        
        return animationId;
    }

    /**
     * Iniciar animación
     */
    startAnimation(animationId) {
        const animationData = this.animations.get(animationId);
        if (!animationData || !animationData.isActive) return;
        
        // Aplicar estado inicial
        this.applyAnimationState(animationData.element, animationData.animation, 0);
        
        // Llamar callback de inicio
        if (animationData.callbacks.onStart) {
            animationData.callbacks.onStart(animationData);
        }
        
        // Iniciar loop de animación
        this.animationLoop(animationId);
    }

    /**
     * Loop de animación
     */
    animationLoop(animationId) {
        const animationData = this.animations.get(animationId);
        if (!animationData || !animationData.isActive) return;
        
        const currentTime = performance.now();
        const elapsed = currentTime - animationData.startTime;
        const progress = Math.min(elapsed / animationData.duration, 1);
        
        // Aplicar easing
        const easedProgress = this.applyEasing(progress, animationData.easing);
        
        // Aplicar estado de animación
        this.applyAnimationState(animationData.element, animationData.animation, easedProgress);
        
        // Actualizar progreso
        animationData.progress = easedProgress;
        
        // Llamar callback de actualización
        if (animationData.callbacks.onUpdate) {
            animationData.callbacks.onUpdate(animationData, easedProgress);
        }
        
        // Verificar si la animación ha terminado
        if (progress >= 1) {
            this.completeAnimation(animationId);
        } else {
            // Continuar loop
            requestAnimationFrame(() => this.animationLoop(animationId));
        }
    }

    /**
     * Completar animación
     */
    completeAnimation(animationId) {
        const animationData = this.animations.get(animationId);
        if (!animationData) return;
        
        animationData.isActive = false;
        this.states.activeAnimations--;
        this.metrics.completedAnimations++;
        
        // Llamar callback de completado
        if (animationData.callbacks.onComplete) {
            animationData.callbacks.onComplete(animationData);
        }
        
        // Limpiar animación
        this.animations.delete(animationId);
    }

    /**
     * Aplicar estado de animación
     */
    applyAnimationState(element, animation, progress) {
        Object.entries(animation.properties).forEach(([property, values]) => {
            const from = values.from;
            const to = values.to;
            
            if (typeof from === 'number' && typeof to === 'number') {
                // Interpolación numérica
                const value = from + (to - from) * progress;
                element.style[property] = value + (property === 'opacity' ? '' : 'px');
            } else if (typeof from === 'string' && typeof to === 'string') {
                // Interpolación de strings (transform)
                if (property === 'transform') {
                    element.style.transform = this.interpolateTransform(from, to, progress);
                } else {
                    element.style[property] = to;
                }
            }
        });
    }

    /**
     * Interpolar transform
     */
    interpolateTransform(from, to, progress) {
        // Extraer valores de transform
        const fromValues = this.parseTransform(from);
        const toValues = this.parseTransform(to);
        
        const interpolated = {};
        
        Object.keys(fromValues).forEach(key => {
            if (fromValues[key] !== undefined && toValues[key] !== undefined) {
                interpolated[key] = fromValues[key] + (toValues[key] - fromValues[key]) * progress;
            }
        });
        
        // Construir string de transform
        return this.buildTransformString(interpolated);
    }

    /**
     * Parsear transform string
     */
    parseTransform(transformString) {
        const values = {};
        
        // Buscar translateX, translateY, scale, rotate, etc.
        const translateXMatch = transformString.match(/translateX\(([^)]+)\)/);
        const translateYMatch = transformString.match(/translateY\(([^)]+)\)/);
        const scaleMatch = transformString.match(/scale\(([^)]+)\)/);
        const rotateMatch = transformString.match(/rotate\(([^)]+)\)/);
        const rotateXMatch = transformString.match(/rotateX\(([^)]+)\)/);
        const rotateYMatch = transformString.match(/rotateY\(([^)]+)\)/);
        
        if (translateXMatch) values.translateX = parseFloat(translateXMatch[1]);
        if (translateYMatch) values.translateY = parseFloat(translateYMatch[1]);
        if (scaleMatch) values.scale = parseFloat(scaleMatch[1]);
        if (rotateMatch) values.rotate = parseFloat(rotateMatch[1]);
        if (rotateXMatch) values.rotateX = parseFloat(rotateXMatch[1]);
        if (rotateYMatch) values.rotateY = parseFloat(rotateYMatch[1]);
        
        return values;
    }

    /**
     * Construir string de transform
     */
    buildTransformString(values) {
        const transforms = [];
        
        if (values.translateX !== undefined) transforms.push(`translateX(${values.translateX}px)`);
        if (values.translateY !== undefined) transforms.push(`translateY(${values.translateY}px)`);
        if (values.scale !== undefined) transforms.push(`scale(${values.scale})`);
        if (values.rotate !== undefined) transforms.push(`rotate(${values.rotate}deg)`);
        if (values.rotateX !== undefined) transforms.push(`rotateX(${values.rotateX}deg)`);
        if (values.rotateY !== undefined) transforms.push(`rotateY(${values.rotateY}deg)`);
        
        return transforms.join(' ');
    }

    /**
     * Aplicar función de easing
     */
    applyEasing(progress, easingName) {
        const easingFunction = this.easingFunctions[easingName];
        return easingFunction ? easingFunction(progress) : progress;
    }

    /**
     * Ejecutar transición
     */
    async executeTransition(fromElement, toElement, transitionName, options = {}) {
        const transition = this.transitions.get(transitionName);
        if (!transition) {
            console.warn(`Transición no encontrada: ${transitionName}`);
            return;
        }
        
        const {
            duration = transition.duration,
            easing = transition.easing,
            onComplete = null
        } = options;
        
        // Crear contenedor de transición
        const container = document.createElement('div');
        container.className = 'transition-container';
        container.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            z-index: 9999;
            pointer-events: none;
        `;
        document.body.appendChild(container);
        
        // Aplicar transición de salida
        if (fromElement && transition.exit) {
            await this.animateElement(fromElement, transition.exit, duration, easing);
        }
        
        // Aplicar transición de entrada
        if (toElement && transition.enter) {
            await this.animateElement(toElement, transition.enter, duration, easing);
        }
        
        // Limpiar contenedor
        container.remove();
        
        // Llamar callback de completado
        if (onComplete) {
            onComplete();
        }
    }

    /**
     * Animar elemento con propiedades específicas
     */
    async animateElement(element, properties, duration, easing) {
        return new Promise((resolve) => {
            const startTime = performance.now();
            const endTime = startTime + duration;
            
            const animate = (currentTime) => {
                const elapsed = currentTime - startTime;
                const progress = Math.min(elapsed / duration, 1);
                const easedProgress = this.applyEasing(progress, easing);
                
                // Aplicar propiedades
                Object.entries(properties).forEach(([property, values]) => {
                    const from = values.from;
                    const to = values.to;
                    
                    if (typeof from === 'number' && typeof to === 'number') {
                        const value = from + (to - from) * easedProgress;
                        element.style[property] = value + (property === 'opacity' ? '' : 'px');
                    } else if (property === 'transform') {
                        element.style.transform = this.interpolateTransform(from, to, easedProgress);
                    }
                });
                
                if (progress < 1) {
                    requestAnimationFrame(animate);
                } else {
                    resolve();
                }
            };
            
            requestAnimationFrame(animate);
        });
    }

    /**
     * Aplicar efecto
     */
    applyEffect(element, effectName, options = {}) {
        const effect = this.effects.get(effectName);
        if (!effect) {
            console.warn(`Efecto no encontrado: ${effectName}`);
            return null;
        }
        
        return effect.create(element, options);
    }

    /**
     * Generar ID de animación único
     */
    generateAnimationId() {
        return 'anim_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    /**
     * Detener animación
     */
    stopAnimation(animationId) {
        const animationData = this.animations.get(animationId);
        if (!animationData) return;
        
        animationData.isActive = false;
        this.states.activeAnimations--;
        this.metrics.failedAnimations++;
        
        // Llamar callback de cancelación
        if (animationData.callbacks.onCancel) {
            animationData.callbacks.onCancel(animationData);
        }
        
        // Limpiar animación
        this.animations.delete(animationId);
    }

    /**
     * Detener todas las animaciones
     */
    stopAllAnimations() {
        this.animations.forEach((animationData, animationId) => {
            this.stopAnimation(animationId);
        });
    }

    /**
     * Pausar timeline
     */
    pauseTimeline() {
        this.timeline.paused = true;
    }

    /**
     * Reanudar timeline
     */
    resumeTimeline() {
        this.timeline.paused = false;
    }

    /**
     * Actualizar sistema de animaciones
     */
    update(deltaTime) {
        if (!this.states.isInitialized || !this.states.isEnabled) return;
        
        // Actualizar timeline
        if (!this.timeline.paused) {
            this.timeline.currentTime += deltaTime;
        }
        
        // Actualizar métricas
        this.updateMetrics();
    }

    /**
     * Actualizar métricas
     */
    updateMetrics() {
        this.metrics.activeAnimations = this.states.activeAnimations;
        this.metrics.averageDuration = this.metrics.totalAnimations > 0 
            ? this.metrics.completedAnimations / this.metrics.totalAnimations 
            : 0;
        this.metrics.performanceScore = this.calculatePerformanceScore();
    }

    /**
     * Calcular score de rendimiento
     */
    calculatePerformanceScore() {
        const activeRatio = this.metrics.activeAnimations / this.config.maxConcurrentAnimations;
        const successRatio = this.metrics.completedAnimations / this.metrics.totalAnimations;
        
        return Math.min(100, (1 - activeRatio) * 50 + successRatio * 50);
    }

    /**
     * Obtener métricas del sistema
     */
    getMetrics() {
        return {
            ...this.metrics,
            states: this.states,
            config: this.config,
            timeline: this.timeline
        };
    }

    /**
     * Limpiar recursos
     */
    dispose() {
        // Detener todas las animaciones
        this.stopAllAnimations();
        
        // Limpiar arrays
        this.animations.clear();
        this.animationGroups.clear();
        this.transitions.clear();
        this.effects.clear();
        
        console.log('🧹 Sistema de Animaciones Avanzado limpiado');
    }
}

// Exportar para uso global
window.AdvancedAnimationService = AdvancedAnimationService; 
/**
 * Sistema de Transiciones Avanzadas para Páginas del Metaverso
 * Efectos visuales y animaciones para navegación fluida
 */

class MetaversoPageTransitions {
    constructor() {
        this.transitions = new Map();
        this.currentTransition = null;
        this.isTransitioning = false;
        this.transitionQueue = [];
        this.effects = new Map();
        
        this.init();
    }

    /**
     * Inicializar sistema de transiciones
     */
    init() {
        this.createTransitions();
        this.createEffects();
        this.setupEventListeners();
    }

    /**
     * Crear transiciones básicas
     */
    createTransitions() {
        // Transición Fade
        this.transitions.set('fade', {
            name: 'fade',
            duration: 300,
            easing: 'ease-in-out',
            enter: (element, duration) => {
                element.style.opacity = '0';
                element.style.display = 'block';
                element.style.transition = `opacity ${duration}ms ease-in-out`;
                
                requestAnimationFrame(() => {
                    element.style.opacity = '1';
                });
            },
            exit: (element, duration) => {
                element.style.transition = `opacity ${duration}ms ease-in-out`;
                element.style.opacity = '0';
                
                return new Promise(resolve => {
                    setTimeout(resolve, duration);
                });
            }
        });

        // Transición Slide
        this.transitions.set('slide', {
            name: 'slide',
            duration: 400,
            easing: 'ease-out',
            enter: (element, duration) => {
                element.style.transform = 'translateX(100%)';
                element.style.display = 'block';
                element.style.transition = `transform ${duration}ms ease-out`;
                
                requestAnimationFrame(() => {
                    element.style.transform = 'translateX(0)';
                });
            },
            exit: (element, duration) => {
                element.style.transition = `transform ${duration}ms ease-out`;
                element.style.transform = 'translateX(-100%)';
                
                return new Promise(resolve => {
                    setTimeout(resolve, duration);
                });
            }
        });

        // Transición Scale
        this.transitions.set('scale', {
            name: 'scale',
            duration: 350,
            easing: 'ease-out',
            enter: (element, duration) => {
                element.style.transform = 'scale(0.8)';
                element.style.opacity = '0';
                element.style.display = 'block';
                element.style.transition = `transform ${duration}ms ease-out, opacity ${duration}ms ease-out`;
                
                requestAnimationFrame(() => {
                    element.style.transform = 'scale(1)';
                    element.style.opacity = '1';
                });
            },
            exit: (element, duration) => {
                element.style.transition = `transform ${duration}ms ease-out, opacity ${duration}ms ease-out`;
                element.style.transform = 'scale(1.1)';
                element.style.opacity = '0';
                
                return new Promise(resolve => {
                    setTimeout(resolve, duration);
                });
            }
        });

        // Transición Flip
        this.transitions.set('flip', {
            name: 'flip',
            duration: 500,
            easing: 'ease-in-out',
            enter: (element, duration) => {
                element.style.transform = 'rotateY(90deg)';
                element.style.display = 'block';
                element.style.transition = `transform ${duration}ms ease-in-out`;
                element.style.transformStyle = 'preserve-3d';
                
                requestAnimationFrame(() => {
                    element.style.transform = 'rotateY(0deg)';
                });
            },
            exit: (element, duration) => {
                element.style.transition = `transform ${duration}ms ease-in-out`;
                element.style.transform = 'rotateY(-90deg)';
                
                return new Promise(resolve => {
                    setTimeout(resolve, duration);
                });
            }
        });

        // Transición Cube
        this.transitions.set('cube', {
            name: 'cube',
            duration: 600,
            easing: 'ease-in-out',
            enter: (element, duration) => {
                element.style.transform = 'rotateY(90deg) translateZ(50px)';
                element.style.display = 'block';
                element.style.transition = `transform ${duration}ms ease-in-out`;
                element.style.transformStyle = 'preserve-3d';
                element.style.perspective = '1000px';
                
                requestAnimationFrame(() => {
                    element.style.transform = 'rotateY(0deg) translateZ(0)';
                });
            },
            exit: (element, duration) => {
                element.style.transition = `transform ${duration}ms ease-in-out`;
                element.style.transform = 'rotateY(-90deg) translateZ(50px)';
                
                return new Promise(resolve => {
                    setTimeout(resolve, duration);
                });
            }
        });

        // Transición Morph
        this.transitions.set('morph', {
            name: 'morph',
            duration: 800,
            easing: 'ease-in-out',
            enter: (element, duration) => {
                element.style.transform = 'scale(0.5) rotate(180deg)';
                element.style.opacity = '0';
                element.style.display = 'block';
                element.style.transition = `transform ${duration}ms ease-in-out, opacity ${duration}ms ease-in-out`;
                
                requestAnimationFrame(() => {
                    element.style.transform = 'scale(1) rotate(0deg)';
                    element.style.opacity = '1';
                });
            },
            exit: (element, duration) => {
                element.style.transition = `transform ${duration}ms ease-in-out, opacity ${duration}ms ease-in-out`;
                element.style.transform = 'scale(0.5) rotate(-180deg)';
                element.style.opacity = '0';
                
                return new Promise(resolve => {
                    setTimeout(resolve, duration);
                });
            }
        });

        // Transición Glitch
        this.transitions.set('glitch', {
            name: 'glitch',
            duration: 400,
            easing: 'ease-out',
            enter: (element, duration) => {
                element.style.opacity = '0';
                element.style.display = 'block';
                element.style.filter = 'hue-rotate(0deg)';
                element.style.transition = `opacity ${duration}ms ease-out, filter ${duration}ms ease-out`;
                
                // Efecto glitch
                let glitchCount = 0;
                const glitchInterval = setInterval(() => {
                    element.style.filter = `hue-rotate(${Math.random() * 360}deg)`;
                    glitchCount++;
                    
                    if (glitchCount >= 5) {
                        clearInterval(glitchInterval);
                        element.style.filter = 'hue-rotate(0deg)';
                        element.style.opacity = '1';
                    }
                }, 50);
            },
            exit: (element, duration) => {
                element.style.transition = `opacity ${duration}ms ease-out`;
                element.style.opacity = '0';
                
                return new Promise(resolve => {
                    setTimeout(resolve, duration);
                });
            }
        });

        // Transición Hologram
        this.transitions.set('hologram', {
            name: 'hologram',
            duration: 700,
            easing: 'ease-in-out',
            enter: (element, duration) => {
                element.style.opacity = '0';
                element.style.display = 'block';
                element.style.filter = 'blur(10px) brightness(0.5)';
                element.style.transition = `opacity ${duration}ms ease-in-out, filter ${duration}ms ease-in-out`;
                
                requestAnimationFrame(() => {
                    element.style.opacity = '1';
                    element.style.filter = 'blur(0px) brightness(1)';
                });
            },
            exit: (element, duration) => {
                element.style.transition = `opacity ${duration}ms ease-in-out, filter ${duration}ms ease-in-out`;
                element.style.opacity = '0';
                element.style.filter = 'blur(10px) brightness(0.5)';
                
                return new Promise(resolve => {
                    setTimeout(resolve, duration);
                });
            }
        });

        // Transición Matrix
        this.transitions.set('matrix', {
            name: 'matrix',
            duration: 1000,
            easing: 'ease-in-out',
            enter: (element, duration) => {
                element.style.opacity = '0';
                element.style.display = 'block';
                element.style.filter = 'contrast(0) brightness(0)';
                element.style.transition = `opacity ${duration}ms ease-in-out, filter ${duration}ms ease-in-out`;
                
                // Efecto matrix
                let matrixCount = 0;
                const matrixInterval = setInterval(() => {
                    element.style.filter = `contrast(${matrixCount * 0.2}) brightness(${matrixCount * 0.2})`;
                    matrixCount++;
                    
                    if (matrixCount >= 5) {
                        clearInterval(matrixInterval);
                        element.style.filter = 'contrast(1) brightness(1)';
                        element.style.opacity = '1';
                    }
                }, 200);
            },
            exit: (element, duration) => {
                element.style.transition = `opacity ${duration}ms ease-in-out, filter ${duration}ms ease-in-out`;
                element.style.opacity = '0';
                element.style.filter = 'contrast(0) brightness(0)';
                
                return new Promise(resolve => {
                    setTimeout(resolve, duration);
                });
            }
        });
    }

    /**
     * Crear efectos especiales
     */
    createEffects() {
        // Efecto de partículas
        this.effects.set('particles', {
            create: (container) => {
                const particlesContainer = document.createElement('div');
                particlesContainer.className = 'transition-particles';
                particlesContainer.style.cssText = `
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    pointer-events: none;
                    z-index: 9999;
                `;
                
                // Crear partículas
                for (let i = 0; i < 50; i++) {
                    const particle = document.createElement('div');
                    particle.className = 'particle';
                    particle.style.cssText = `
                        position: absolute;
                        width: 4px;
                        height: 4px;
                        background: var(--metaverso-primary);
                        border-radius: 50%;
                        animation: particle-float ${2 + Math.random() * 3}s ease-in-out infinite;
                        left: ${Math.random() * 100}%;
                        top: ${Math.random() * 100}%;
                    `;
                    particlesContainer.appendChild(particle);
                }
                
                container.appendChild(particlesContainer);
                
                // Remover después de la animación
                setTimeout(() => {
                    particlesContainer.remove();
                }, 3000);
            }
        });

        // Efecto de ondas
        this.effects.set('waves', {
            create: (container) => {
                const wavesContainer = document.createElement('div');
                wavesContainer.className = 'transition-waves';
                wavesContainer.style.cssText = `
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    pointer-events: none;
                    z-index: 9999;
                `;
                
                // Crear ondas
                for (let i = 0; i < 3; i++) {
                    const wave = document.createElement('div');
                    wave.className = 'wave';
                    wave.style.cssText = `
                        position: absolute;
                        width: 200%;
                        height: 200%;
                        background: radial-gradient(circle, var(--metaverso-primary) 0%, transparent 70%);
                        border-radius: 50%;
                        animation: wave-expand ${1.5 + i * 0.5}s ease-out forwards;
                        left: -50%;
                        top: -50%;
                        opacity: 0.3;
                    `;
                    wavesContainer.appendChild(wave);
                }
                
                container.appendChild(wavesContainer);
                
                // Remover después de la animación
                setTimeout(() => {
                    wavesContainer.remove();
                }, 2000);
            }
        });

        // Efecto de escaneo
        this.effects.set('scan', {
            create: (container) => {
                const scanLine = document.createElement('div');
                scanLine.className = 'scan-line';
                scanLine.style.cssText = `
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 2px;
                    background: linear-gradient(90deg, transparent, var(--metaverso-accent), transparent);
                    z-index: 9999;
                    animation: scan-sweep 1s ease-in-out forwards;
                `;
                
                container.appendChild(scanLine);
                
                // Remover después de la animación
                setTimeout(() => {
                    scanLine.remove();
                }, 1000);
            }
        });
    }

    /**
     * Configurar event listeners
     */
    setupEventListeners() {
        // Escuchar eventos de transición
        document.addEventListener('metaverso:pageTransition', (event) => {
            const { from, to, transition } = event.detail;
            this.executeTransition(from, to, transition);
        });
    }

    /**
     * Ejecutar transición
     */
    async executeTransition(fromElement, toElement, transitionName = 'fade') {
        if (this.isTransitioning) {
            this.transitionQueue.push({ fromElement, toElement, transitionName });
            return;
        }

        this.isTransitioning = true;
        const transition = this.transitions.get(transitionName) || this.transitions.get('fade');

        try {
            // Crear contenedor de transición
            const transitionContainer = document.createElement('div');
            transitionContainer.className = 'transition-container';
            transitionContainer.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                z-index: 9998;
                pointer-events: none;
            `;
            document.body.appendChild(transitionContainer);

            // Aplicar efectos especiales
            this.applyEffects(transitionContainer, transitionName);

            // Ejecutar transición de salida
            if (fromElement) {
                await transition.exit(fromElement, transition.duration);
            }

            // Ejecutar transición de entrada
            if (toElement) {
                transition.enter(toElement, transition.duration);
            }

            // Esperar a que termine la transición
            await this.delay(transition.duration);

            // Limpiar
            transitionContainer.remove();
            this.isTransitioning = false;

            // Procesar cola de transiciones
            if (this.transitionQueue.length > 0) {
                const nextTransition = this.transitionQueue.shift();
                this.executeTransition(nextTransition.fromElement, nextTransition.toElement, nextTransition.transitionName);
            }

        } catch (error) {
            console.error('Error en transición:', error);
            this.isTransitioning = false;
        }
    }

    /**
     * Aplicar efectos especiales
     */
    applyEffects(container, transitionName) {
        const effects = {
            'glitch': ['particles'],
            'hologram': ['waves'],
            'matrix': ['scan'],
            'cube': ['particles'],
            'morph': ['waves']
        };

        const effectNames = effects[transitionName] || [];
        
        effectNames.forEach(effectName => {
            const effect = this.effects.get(effectName);
            if (effect) {
                effect.create(container);
            }
        });
    }

    /**
     * Crear transición personalizada
     */
    createCustomTransition(name, config) {
        this.transitions.set(name, {
            name,
            duration: config.duration || 300,
            easing: config.easing || 'ease-in-out',
            enter: config.enter,
            exit: config.exit
        });
    }

    /**
     * Obtener transición por nombre
     */
    getTransition(name) {
        return this.transitions.get(name);
    }

    /**
     * Obtener lista de transiciones disponibles
     */
    getAvailableTransitions() {
        return Array.from(this.transitions.keys());
    }

    /**
     * Obtener transición aleatoria
     */
    getRandomTransition() {
        const transitions = this.getAvailableTransitions();
        return transitions[Math.floor(Math.random() * transitions.length)];
    }

    /**
     * Obtener transición basada en contexto
     */
    getContextualTransition(fromPage, toPage) {
        // Transiciones específicas por página
        const contextualTransitions = {
            'home-exploration': 'slide',
            'exploration-home': 'slide',
            'avatars-exploration': 'scale',
            'exploration-avatars': 'scale',
            'blockchain-profile': 'fade',
            'profile-blockchain': 'fade',
            'settings-any': 'fade',
            'any-settings': 'fade'
        };

        const key = `${fromPage}-${toPage}`;
        return contextualTransitions[key] || 'fade';
    }

    /**
     * Función de delay
     */
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * Obtener estadísticas de transiciones
     */
    getStats() {
        return {
            totalTransitions: this.transitions.size,
            totalEffects: this.effects.size,
            isTransitioning: this.isTransitioning,
            queueLength: this.transitionQueue.length,
            availableTransitions: this.getAvailableTransitions()
        };
    }
}

// Exportar para uso modular
export default MetaversoPageTransitions;

// Funciones globales para integración
window.MetaversoPageTransitions = MetaversoPageTransitions;
window.createMetaversoPageTransitions = () => {
    return new MetaversoPageTransitions();
}; 
/**
 * Sistema de Iluminación Avanzado para Metaverso
 * Iluminación dinámica, efectos visuales y optimización de rendimiento
 */

class AdvancedLightingService {
    constructor(scene, renderer) {
        this.scene = scene;
        this.renderer = renderer;
        
        // Configuración del sistema
        this.config = {
            enableShadows: true,
            enablePostProcessing: true,
            enableDynamicLighting: true,
            enableWeatherEffects: true,
            enableDayNightCycle: true,
            shadowMapSize: 2048,
            maxLights: 50,
            ambientIntensity: 0.4,
            sunIntensity: 1.0,
            moonIntensity: 0.3
        };
        
        // Gestión de luces
        this.lights = new Map();
        this.lightGroups = new Map();
        this.dynamicLights = new Map();
        this.weatherLights = new Map();
        
        // Sistema de día/noche
        this.dayNightCycle = {
            time: 12, // 0-24 horas
            duration: 24, // duración del ciclo en horas
            isActive: false,
            sunLight: null,
            moonLight: null,
            ambientLight: null
        };
        
        // Efectos de clima
        this.weatherEffects = {
            rain: { active: false, intensity: 0 },
            snow: { active: false, intensity: 0 },
            fog: { active: false, density: 0 },
            storm: { active: false, intensity: 0 }
        };
        
        // Post-processing
        this.postProcessing = {
            bloom: null,
            ssao: null,
            dof: null,
            vignette: null,
            colorCorrection: null
        };
        
        // Métricas
        this.metrics = {
            activeLights: 0,
            shadowCasters: 0,
            renderTime: 0,
            memoryUsage: 0
        };
        
        // Estados
        this.states = {
            isInitialized: false,
            isEnabled: true,
            isOptimized: false,
            isProcessing: false
        };
        
        console.log('💡 Sistema de Iluminación Avanzado inicializado');
    }

    /**
     * Inicializar sistema de iluminación
     */
    async initialize() {
        try {
            // Configurar renderer
            this.setupRenderer();
            
            // Crear iluminación base
            this.createBaseLighting();
            
            // Configurar sistema de día/noche
            this.setupDayNightCycle();
            
            // Configurar efectos de clima
            this.setupWeatherEffects();
            
            // Configurar post-processing
            if (this.config.enablePostProcessing) {
                await this.setupPostProcessing();
            }
            
            // Configurar optimizaciones
            this.setupOptimizations();
            
            this.states.isInitialized = true;
            console.log('✅ Sistema de Iluminación Avanzado inicializado');
            
        } catch (error) {
            console.error('❌ Error inicializando sistema de iluminación:', error);
            throw error;
        }
    }

    /**
     * Configurar renderer
     */
    setupRenderer() {
        // Habilitar sombras
        if (this.config.enableShadows) {
            this.renderer.shadowMap.enabled = true;
            this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
            this.renderer.shadowMap.autoUpdate = false;
        }
        
        // Configurar tonemapping
        this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
        this.renderer.toneMappingExposure = 1.0;
        this.renderer.outputEncoding = THREE.sRGBEncoding;
        
        console.log('🎨 Renderer configurado para iluminación avanzada');
    }

    /**
     * Crear iluminación base
     */
    createBaseLighting() {
        // Luz ambiental
        const ambientLight = new THREE.AmbientLight(0x404040, this.config.ambientIntensity);
        this.scene.add(ambientLight);
        this.lights.set('ambient', ambientLight);
        
        // Luz direccional principal (sol)
        const sunLight = new THREE.DirectionalLight(0xffffff, this.config.sunIntensity);
        sunLight.position.set(100, 100, 50);
        sunLight.castShadow = this.config.enableShadows;
        
        if (this.config.enableShadows) {
            sunLight.shadow.mapSize.width = this.config.shadowMapSize;
            sunLight.shadow.mapSize.height = this.config.shadowMapSize;
            sunLight.shadow.camera.near = 0.5;
            sunLight.shadow.camera.far = 500;
            sunLight.shadow.camera.left = -100;
            sunLight.shadow.camera.right = 100;
            sunLight.shadow.camera.top = 100;
            sunLight.shadow.camera.bottom = -100;
        }
        
        this.scene.add(sunLight);
        this.lights.set('sun', sunLight);
        this.dayNightCycle.sunLight = sunLight;
        
        // Luz de relleno
        const fillLight = new THREE.DirectionalLight(0x87CEEB, 0.3);
        fillLight.position.set(-50, 50, -50);
        this.scene.add(fillLight);
        this.lights.set('fill', fillLight);
        
        console.log('☀️ Iluminación base creada');
    }

    /**
     * Configurar sistema de día/noche
     */
    setupDayNightCycle() {
        if (!this.config.enableDayNightCycle) return;
        
        // Luz de luna
        const moonLight = new THREE.DirectionalLight(0x4444ff, this.config.moonIntensity);
        moonLight.position.set(-100, 100, -50);
        moonLight.castShadow = this.config.enableShadows;
        
        if (this.config.enableShadows) {
            moonLight.shadow.mapSize.width = this.config.shadowMapSize;
            moonLight.shadow.mapSize.height = this.config.shadowMapSize;
        }
        
        this.scene.add(moonLight);
        this.lights.set('moon', moonLight);
        this.dayNightCycle.moonLight = moonLight;
        
        // Iniciar ciclo
        this.startDayNightCycle();
        
        console.log('🌙 Sistema de día/noche configurado');
    }

    /**
     * Iniciar ciclo día/noche
     */
    startDayNightCycle() {
        this.dayNightCycle.isActive = true;
        this.updateDayNightCycle();
    }

    /**
     * Actualizar ciclo día/noche
     */
    updateDayNightCycle() {
        if (!this.dayNightCycle.isActive) return;
        
        const time = this.dayNightCycle.time;
        const sunLight = this.dayNightCycle.sunLight;
        const moonLight = this.dayNightCycle.moonLight;
        const ambientLight = this.lights.get('ambient');
        
        // Calcular posiciones
        const sunAngle = (time / 24) * Math.PI * 2;
        const moonAngle = sunAngle + Math.PI;
        
        // Posicionar sol
        sunLight.position.x = Math.cos(sunAngle) * 100;
        sunLight.position.y = Math.sin(sunAngle) * 100;
        sunLight.position.z = 50;
        
        // Posicionar luna
        moonLight.position.x = Math.cos(moonAngle) * 100;
        moonLight.position.y = Math.sin(moonAngle) * 100;
        moonLight.position.z = 50;
        
        // Ajustar intensidades
        const dayIntensity = Math.max(0, Math.sin(sunAngle));
        const nightIntensity = Math.max(0, Math.sin(moonAngle));
        
        sunLight.intensity = this.config.sunIntensity * dayIntensity;
        moonLight.intensity = this.config.moonIntensity * nightIntensity;
        ambientLight.intensity = this.config.ambientIntensity * (0.5 + dayIntensity * 0.5);
        
        // Ajustar colores
        if (time >= 6 && time <= 18) {
            // Día
            sunLight.color.setHex(0xffffff);
            ambientLight.color.setHex(0x87CEEB);
        } else if (time >= 18 && time <= 20) {
            // Atardecer
            sunLight.color.setHex(0xff6b35);
            ambientLight.color.setHex(0xffa07a);
        } else if (time >= 20 || time <= 6) {
            // Noche
            sunLight.color.setHex(0x4444ff);
            ambientLight.color.setHex(0x1a1a2e);
        }
    }

    /**
     * Configurar efectos de clima
     */
    setupWeatherEffects() {
        if (!this.config.enableWeatherEffects) return;
        
        // Crear luces para efectos de clima
        this.createWeatherLights();
        
        console.log('🌧️ Efectos de clima configurados');
    }

    /**
     * Crear luces para efectos de clima
     */
    createWeatherLights() {
        // Luz para lluvia
        const rainLight = new THREE.PointLight(0x87CEEB, 0.5, 100);
        rainLight.position.set(0, 50, 0);
        this.scene.add(rainLight);
        this.weatherLights.set('rain', rainLight);
        
        // Luz para nieve
        const snowLight = new THREE.PointLight(0xffffff, 0.3, 80);
        snowLight.position.set(0, 40, 0);
        this.scene.add(snowLight);
        this.weatherLights.set('snow', snowLight);
        
        // Luz para tormenta
        const stormLight = new THREE.SpotLight(0x444444, 0.8, 200);
        stormLight.position.set(0, 100, 0);
        stormLight.angle = Math.PI / 4;
        stormLight.penumbra = 0.1;
        this.scene.add(stormLight);
        this.weatherLights.set('storm', stormLight);
    }

    /**
     * Configurar post-processing
     */
    async setupPostProcessing() {
        try {
            // Bloom
            this.postProcessing.bloom = new THREE.UnrealBloomPass(
                new THREE.Vector2(window.innerWidth, window.innerHeight),
                0.5, 0.4, 0.85
            );
            
            // SSAO (Ambient Occlusion)
            this.postProcessing.ssao = new THREE.SSAOPass(
                this.scene,
                this.renderer.camera,
                window.innerWidth,
                window.innerHeight
            );
            
            // Depth of Field
            this.postProcessing.dof = new THREE.BokehPass(
                this.scene,
                this.renderer.camera,
                {
                    focus: 1.0,
                    aperture: 0.025,
                    maxblur: 0.01
                }
            );
            
            console.log('🎭 Post-processing configurado');
            
        } catch (error) {
            console.warn('⚠️ Post-processing no disponible:', error.message);
        }
    }

    /**
     * Configurar optimizaciones
     */
    setupOptimizations() {
        // Frustum culling para luces
        this.lightFrustum = new THREE.Frustum();
        this.projectionMatrix = new THREE.Matrix4();
        
        // LOD para luces dinámicas
        this.lightLOD = {
            high: 50, // distancia para alta calidad
            medium: 100, // distancia para calidad media
            low: 200 // distancia para baja calidad
        };
        
        console.log('⚡ Optimizaciones configuradas');
    }

    /**
     * Crear luz dinámica
     */
    createDynamicLight(type, position, options = {}) {
        const {
            color = 0xffffff,
            intensity = 1.0,
            distance = 100,
            castShadow = true,
            animation = null
        } = options;
        
        let light;
        
        switch (type) {
            case 'point':
                light = new THREE.PointLight(color, intensity, distance);
                break;
            case 'spot':
                light = new THREE.SpotLight(color, intensity, distance);
                light.angle = options.angle || Math.PI / 6;
                light.penumbra = options.penumbra || 0.1;
                break;
            case 'directional':
                light = new THREE.DirectionalLight(color, intensity);
                break;
            case 'area':
                light = new THREE.RectAreaLight(color, intensity, options.width || 10, options.height || 10);
                break;
            default:
                light = new THREE.PointLight(color, intensity, distance);
        }
        
        light.position.copy(position);
        light.castShadow = castShadow && this.config.enableShadows;
        
        if (castShadow && this.config.enableShadows) {
            light.shadow.mapSize.width = 1024;
            light.shadow.mapSize.height = 1024;
            light.shadow.camera.near = 0.5;
            light.shadow.camera.far = distance;
        }
        
        this.scene.add(light);
        
        const lightData = {
            light,
            type,
            position: position.clone(),
            options,
            animation,
            isActive: true
        };
        
        this.dynamicLights.set(light.uuid, lightData);
        this.metrics.activeLights++;
        
        return lightData;
    }

    /**
     * Crear luz con animación
     */
    createAnimatedLight(type, position, animationConfig) {
        const lightData = this.createDynamicLight(type, position, animationConfig.options);
        
        if (animationConfig.type === 'flicker') {
            lightData.animation = {
                type: 'flicker',
                speed: animationConfig.speed || 1,
                intensity: animationConfig.intensity || 0.3,
                time: 0
            };
        } else if (animationConfig.type === 'pulse') {
            lightData.animation = {
                type: 'pulse',
                speed: animationConfig.speed || 1,
                minIntensity: animationConfig.minIntensity || 0.5,
                maxIntensity: animationConfig.maxIntensity || 1.5,
                time: 0
            };
        } else if (animationConfig.type === 'colorCycle') {
            lightData.animation = {
                type: 'colorCycle',
                speed: animationConfig.speed || 1,
                colors: animationConfig.colors || [0xff0000, 0x00ff00, 0x0000ff],
                time: 0
            };
        }
        
        return lightData;
    }

    /**
     * Aplicar efecto de clima
     */
    applyWeatherEffect(type, intensity = 1.0) {
        this.weatherEffects[type].active = true;
        this.weatherEffects[type].intensity = intensity;
        
        const weatherLight = this.weatherLights.get(type);
        if (weatherLight) {
            weatherLight.intensity = intensity;
            weatherLight.visible = true;
        }
        
        // Ajustar iluminación ambiental
        const ambientLight = this.lights.get('ambient');
        if (type === 'rain' || type === 'storm') {
            ambientLight.intensity *= 0.7;
        } else if (type === 'snow') {
            ambientLight.intensity *= 0.9;
        }
    }

    /**
     * Remover efecto de clima
     */
    removeWeatherEffect(type) {
        this.weatherEffects[type].active = false;
        this.weatherEffects[type].intensity = 0;
        
        const weatherLight = this.weatherLights.get(type);
        if (weatherLight) {
            weatherLight.visible = false;
        }
        
        // Restaurar iluminación ambiental
        const ambientLight = this.lights.get('ambient');
        ambientLight.intensity = this.config.ambientIntensity;
    }

    /**
     * Actualizar sistema de iluminación
     */
    update(deltaTime) {
        if (!this.states.isInitialized || !this.states.isEnabled) return;
        
        // Actualizar ciclo día/noche
        if (this.dayNightCycle.isActive) {
            this.dayNightCycle.time += (deltaTime * 0.1) % 24;
            this.updateDayNightCycle();
        }
        
        // Actualizar luces dinámicas
        this.updateDynamicLights(deltaTime);
        
        // Actualizar efectos de clima
        this.updateWeatherEffects(deltaTime);
        
        // Actualizar métricas
        this.updateMetrics();
    }

    /**
     * Actualizar luces dinámicas
     */
    updateDynamicLights(deltaTime) {
        this.dynamicLights.forEach((lightData, id) => {
            if (!lightData.isActive || !lightData.animation) return;
            
            const animation = lightData.animation;
            animation.time += deltaTime;
            
            switch (animation.type) {
                case 'flicker':
                    const flicker = Math.sin(animation.time * animation.speed * 10) * animation.intensity + 1;
                    lightData.light.intensity = lightData.options.intensity * flicker;
                    break;
                    
                case 'pulse':
                    const pulse = Math.sin(animation.time * animation.speed) * 0.5 + 0.5;
                    const intensity = animation.minIntensity + (animation.maxIntensity - animation.minIntensity) * pulse;
                    lightData.light.intensity = intensity;
                    break;
                    
                case 'colorCycle':
                    const colorIndex = Math.floor(animation.time * animation.speed) % animation.colors.length;
                    const nextColorIndex = (colorIndex + 1) % animation.colors.length;
                    const colorProgress = (animation.time * animation.speed) % 1;
                    
                    const currentColor = new THREE.Color(animation.colors[colorIndex]);
                    const nextColor = new THREE.Color(animation.colors[nextColorIndex]);
                    const interpolatedColor = currentColor.lerp(nextColor, colorProgress);
                    
                    lightData.light.color.copy(interpolatedColor);
                    break;
            }
        });
    }

    /**
     * Actualizar efectos de clima
     */
    updateWeatherEffects(deltaTime) {
        // Actualizar efectos de clima dinámicos
        if (this.weatherEffects.rain.active) {
            // Efectos de lluvia dinámicos
        }
        
        if (this.weatherEffects.snow.active) {
            // Efectos de nieve dinámicos
        }
        
        if (this.weatherEffects.storm.active) {
            // Efectos de tormenta dinámicos
        }
    }

    /**
     * Actualizar métricas
     */
    updateMetrics() {
        this.metrics.activeLights = this.dynamicLights.size;
        this.metrics.shadowCasters = Array.from(this.dynamicLights.values())
            .filter(lightData => lightData.light.castShadow).length;
    }

    /**
     * Optimizar iluminación para rendimiento
     */
    optimizeForPerformance() {
        // Reducir calidad de sombras para luces lejanas
        this.dynamicLights.forEach((lightData, id) => {
            const distance = lightData.position.distanceTo(this.renderer.camera.position);
            
            if (distance > this.lightLOD.low) {
                // Desactivar sombras para luces muy lejanas
                lightData.light.castShadow = false;
            } else if (distance > this.lightLOD.medium) {
                // Reducir resolución de sombras
                lightData.light.shadow.mapSize.width = 512;
                lightData.light.shadow.mapSize.height = 512;
            }
        });
        
        this.states.isOptimized = true;
    }

    /**
     * Obtener métricas del sistema
     */
    getMetrics() {
        return {
            ...this.metrics,
            states: this.states,
            config: this.config,
            dayNightCycle: this.dayNightCycle,
            weatherEffects: this.weatherEffects
        };
    }

    /**
     * Limpiar recursos
     */
    dispose() {
        // Remover todas las luces
        this.lights.forEach(light => {
            this.scene.remove(light);
        });
        
        this.dynamicLights.forEach(lightData => {
            this.scene.remove(lightData.light);
        });
        
        this.weatherLights.forEach(light => {
            this.scene.remove(light);
        });
        
        // Limpiar arrays
        this.lights.clear();
        this.dynamicLights.clear();
        this.weatherLights.clear();
        this.lightGroups.clear();
        
        console.log('🧹 Sistema de Iluminación Avanzado limpiado');
    }
}

// Exportar para uso global
window.AdvancedLightingService = AdvancedLightingService; 
/**
 * Sistema de Shaders Avanzado - Three.js
 * Shaders personalizados y efectos visuales avanzados para el metaverso
 */

class ShaderSystem {
    constructor(renderer) {
        this.renderer = renderer;
        this.shaders = new Map();
        this.materials = new Map();
        this.postProcessing = new Map();
        this.effects = new Map();
        this.computeShaders = new Map();
        
        // Configuración del sistema
        this.config = {
            useWebGL2: true,
            useComputeShaders: false,
            maxShaders: 100,
            maxPostProcessing: 20,
            enableInstancing: true,
            enableGeometryShaders: false
        };
        
        // Estados
        this.states = {
            isInitialized: false,
            isEnabled: true,
            isWebGL2Supported: false,
            isComputeShaderSupported: false
        };
        
        // Métricas
        this.metrics = {
            activeShaders: 0,
            activeMaterials: 0,
            activePostProcessing: 0,
            activeEffects: 0,
            shaderCompilations: 0,
            shaderErrors: 0,
            memoryUsage: 0
        };
        
        // Tiempo y animación
        this.time = 0;
        this.deltaTime = 0;
        
        console.log('🎨 Sistema de Shaders inicializado');
    }
    
    /**
     * Inicializar sistema de shaders
     */
    async initialize() {
        try {
            // Verificar capacidades de WebGL
            this.checkWebGLCapabilities();
            
            // Crear shaders básicos
            await this.createBasicShaders();
            
            // Crear shaders de post-procesamiento
            await this.createPostProcessingShaders();
            
            // Crear shaders de efectos especiales
            await this.createSpecialEffectShaders();
            
            // Crear shaders de computación
            if (this.states.isComputeShaderSupported) {
                await this.createComputeShaders();
            }
            
            this.states.isInitialized = true;
            console.log('✅ Sistema de Shaders inicializado');
            
        } catch (error) {
            console.error('❌ Error inicializando sistema de shaders:', error);
            throw error;
        }
    }
    
    /**
     * Verificar capacidades de WebGL
     */
    checkWebGLCapabilities() {
        const gl = this.renderer.getContext();
        
        // Verificar WebGL 2
        this.states.isWebGL2Supported = gl instanceof WebGL2RenderingContext;
        
        // Verificar shaders de computación
        this.states.isComputeShaderSupported = 
            this.states.isWebGL2Supported && 
            gl.getExtension('WEBGL_compute_shader') !== null;
        
        console.log(`WebGL 2: ${this.states.isWebGL2Supported}`);
        console.log(`Compute Shaders: ${this.states.isComputeShaderSupported}`);
    }
    
    /**
     * Crear shaders básicos
     */
    async createBasicShaders() {
        // Shader de agua
        this.createWaterShader();
        
        // Shader de fuego
        this.createFireShader();
        
        // Shader de humo
        this.createSmokeShader();
        
        // Shader de cristal
        this.createCrystalShader();
        
        // Shader de metal
        this.createMetalShader();
        
        // Shader de holograma
        this.createHologramShader();
        
        console.log('✅ Shaders básicos creados');
    }
    
    /**
     * Crear shader de agua
     */
    createWaterShader() {
        const waterShader = {
            vertexShader: `
                uniform float time;
                uniform float waveHeight;
                uniform float waveFrequency;
                uniform float waveSpeed;
                
                varying vec3 vPosition;
                varying vec3 vNormal;
                varying vec2 vUv;
                varying float vDepth;
                
                void main() {
                    vUv = uv;
                    vPosition = position;
                    
                    // Crear ondas
                    vec3 newPosition = position;
                    float wave = sin(position.x * waveFrequency + time * waveSpeed) * 
                                sin(position.z * waveFrequency + time * waveSpeed) * waveHeight;
                    newPosition.y += wave;
                    
                    // Calcular normal
                    vec3 tangent = vec3(1.0, waveFrequency * cos(position.x * waveFrequency + time * waveSpeed), 0.0);
                    vec3 bitangent = vec3(0.0, waveFrequency * cos(position.z * waveFrequency + time * waveSpeed), 1.0);
                    vNormal = normalize(cross(tangent, bitangent));
                    
                    vDepth = -mvPosition.z;
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0);
                }
            `,
            fragmentShader: `
                uniform vec3 waterColor;
                uniform vec3 foamColor;
                uniform float transparency;
                uniform float foamThreshold;
                uniform sampler2D reflectionMap;
                uniform sampler2D refractionMap;
                
                varying vec3 vPosition;
                varying vec3 vNormal;
                varying vec2 vUv;
                varying float vDepth;
                
                void main() {
                    // Color base del agua
                    vec3 color = waterColor;
                    
                    // Reflexión
                    vec3 reflection = texture2D(reflectionMap, vUv).rgb;
                    color = mix(color, reflection, 0.3);
                    
                    // Refracción
                    vec3 refraction = texture2D(refractionMap, vUv).rgb;
                    color = mix(color, refraction, 0.2);
                    
                    // Espuma en las crestas
                    float foam = 1.0 - abs(dot(vNormal, vec3(0.0, 1.0, 0.0)));
                    if (foam > foamThreshold) {
                        color = mix(color, foamColor, foam);
                    }
                    
                    // Transparencia basada en profundidad
                    float alpha = transparency * (1.0 - vDepth / 100.0);
                    
                    gl_FragColor = vec4(color, alpha);
                }
            `,
            uniforms: {
                time: { value: 0 },
                waveHeight: { value: 0.1 },
                waveFrequency: { value: 10.0 },
                waveSpeed: { value: 1.0 },
                waterColor: { value: new THREE.Color(0x0066cc) },
                foamColor: { value: new THREE.Color(0xffffff) },
                transparency: { value: 0.8 },
                foamThreshold: { value: 0.8 },
                reflectionMap: { value: null },
                refractionMap: { value: null }
            }
        };
        
        this.shaders.set('water', waterShader);
    }
    
    /**
     * Crear shader de fuego
     */
    createFireShader() {
        const fireShader = {
            vertexShader: `
                uniform float time;
                uniform float intensity;
                
                varying vec2 vUv;
                varying float vIntensity;
                
                void main() {
                    vUv = uv;
                    vIntensity = intensity;
                    
                    // Animar vértices
                    vec3 newPosition = position;
                    newPosition.y += sin(time * 2.0 + position.x * 10.0) * 0.1 * intensity;
                    newPosition.x += cos(time * 1.5 + position.z * 8.0) * 0.05 * intensity;
                    
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0);
                }
            `,
            fragmentShader: `
                uniform float time;
                uniform vec3 fireColor;
                uniform vec3 smokeColor;
                uniform float smokeAmount;
                
                varying vec2 vUv;
                varying float vIntensity;
                
                void main() {
                    // Patrón de fuego
                    float fire = sin(vUv.y * 20.0 + time * 5.0) * 
                                sin(vUv.x * 10.0 + time * 3.0) * 
                                vIntensity;
                    
                    // Color del fuego
                    vec3 color = mix(smokeColor, fireColor, fire);
                    
                    // Humo en la parte superior
                    float smoke = smoothstep(0.7, 1.0, vUv.y) * smokeAmount;
                    color = mix(color, smokeColor, smoke);
                    
                    // Transparencia
                    float alpha = fire * (1.0 - smoke);
                    
                    gl_FragColor = vec4(color, alpha);
                }
            `,
            uniforms: {
                time: { value: 0 },
                intensity: { value: 1.0 },
                fireColor: { value: new THREE.Color(0xff4400) },
                smokeColor: { value: new THREE.Color(0x333333) },
                smokeAmount: { value: 0.3 }
            }
        };
        
        this.shaders.set('fire', fireShader);
    }
    
    /**
     * Crear shader de humo
     */
    createSmokeShader() {
        const smokeShader = {
            vertexShader: `
                uniform float time;
                uniform float turbulence;
                
                varying vec2 vUv;
                varying float vTurbulence;
                
                void main() {
                    vUv = uv;
                    vTurbulence = turbulence;
                    
                    // Turbulencia en los vértices
                    vec3 newPosition = position;
                    newPosition.x += sin(time + position.y * 5.0) * 0.1 * turbulence;
                    newPosition.z += cos(time + position.x * 5.0) * 0.1 * turbulence;
                    
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0);
                }
            `,
            fragmentShader: `
                uniform float time;
                uniform vec3 smokeColor;
                uniform float density;
                
                varying vec2 vUv;
                varying float vTurbulence;
                
                void main() {
                    // Patrón de humo
                    float smoke = sin(vUv.x * 15.0 + time * 2.0) * 
                                 sin(vUv.y * 10.0 + time * 1.5) * 
                                 density;
                    
                    // Turbulencia
                    smoke += sin(vUv.x * 20.0 + time * 3.0) * vTurbulence;
                    
                    // Color del humo
                    vec3 color = smokeColor * (0.5 + smoke * 0.5);
                    
                    // Transparencia
                    float alpha = smoke * 0.3;
                    
                    gl_FragColor = vec4(color, alpha);
                }
            `,
            uniforms: {
                time: { value: 0 },
                turbulence: { value: 0.5 },
                smokeColor: { value: new THREE.Color(0x666666) },
                density: { value: 1.0 }
            }
        };
        
        this.shaders.set('smoke', smokeShader);
    }
    
    /**
     * Crear shader de cristal
     */
    createCrystalShader() {
        const crystalShader = {
            vertexShader: `
                uniform float time;
                uniform float refraction;
                
                varying vec3 vPosition;
                varying vec3 vNormal;
                varying vec2 vUv;
                
                void main() {
                    vUv = uv;
                    vPosition = position;
                    vNormal = normal;
                    
                    // Refracción de vértices
                    vec3 newPosition = position;
                    newPosition += normal * sin(time + position.x * 10.0) * 0.01 * refraction;
                    
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0);
                }
            `,
            fragmentShader: `
                uniform float time;
                uniform vec3 crystalColor;
                uniform float transparency;
                uniform float reflection;
                uniform float refraction;
                
                varying vec3 vPosition;
                varying vec3 vNormal;
                varying vec2 vUv;
                
                void main() {
                    // Color base del cristal
                    vec3 color = crystalColor;
                    
                    // Reflexión
                    vec3 reflectionColor = vec3(1.0) * reflection;
                    color = mix(color, reflectionColor, 0.3);
                    
                    // Refracción
                    vec3 refractionColor = vec3(0.8, 0.9, 1.0) * refraction;
                    color = mix(color, refractionColor, 0.2);
                    
                    // Efecto de arcoíris
                    float rainbow = sin(vUv.x * 10.0 + time) * 0.5 + 0.5;
                    vec3 rainbowColor = vec3(
                        sin(rainbow * 3.14159) * 0.5 + 0.5,
                        sin(rainbow * 3.14159 + 2.094) * 0.5 + 0.5,
                        sin(rainbow * 3.14159 + 4.189) * 0.5 + 0.5
                    );
                    color = mix(color, rainbowColor, 0.1);
                    
                    gl_FragColor = vec4(color, transparency);
                }
            `,
            uniforms: {
                time: { value: 0 },
                crystalColor: { value: new THREE.Color(0x88ccff) },
                transparency: { value: 0.9 },
                reflection: { value: 0.8 },
                refraction: { value: 1.0 }
            }
        };
        
        this.shaders.set('crystal', crystalShader);
    }
    
    /**
     * Crear shader de metal
     */
    createMetalShader() {
        const metalShader = {
            vertexShader: `
                uniform float time;
                uniform float roughness;
                
                varying vec3 vPosition;
                varying vec3 vNormal;
                varying vec2 vUv;
                
                void main() {
                    vUv = uv;
                    vPosition = position;
                    vNormal = normal;
                    
                    // Rugosidad en los vértices
                    vec3 newPosition = position;
                    newPosition += normal * sin(time + position.x * 20.0) * 0.001 * roughness;
                    
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0);
                }
            `,
            fragmentShader: `
                uniform float time;
                uniform vec3 metalColor;
                uniform float roughness;
                uniform float metallic;
                uniform float ao;
                
                varying vec3 vPosition;
                varying vec3 vNormal;
                varying vec2 vUv;
                
                void main() {
                    // Color base del metal
                    vec3 color = metalColor;
                    
                    // Rugosidad
                    float rough = roughness + sin(time + vUv.x * 50.0) * 0.1;
                    color *= 1.0 - rough * 0.3;
                    
                    // Metálico
                    color *= metallic;
                    
                    // Oclusión ambiental
                    color *= ao;
                    
                    // Reflexión especular
                    vec3 specular = vec3(1.0) * (1.0 - rough);
                    color = mix(color, specular, 0.2);
                    
                    gl_FragColor = vec4(color, 1.0);
                }
            `,
            uniforms: {
                time: { value: 0 },
                metalColor: { value: new THREE.Color(0x888888) },
                roughness: { value: 0.5 },
                metallic: { value: 1.0 },
                ao: { value: 0.5 }
            }
        };
        
        this.shaders.set('metal', metalShader);
    }
    
    /**
     * Crear shader de holograma
     */
    createHologramShader() {
        const hologramShader = {
            vertexShader: `
                uniform float time;
                uniform float scanlineSpeed;
                
                varying vec3 vPosition;
                varying vec3 vNormal;
                varying vec2 vUv;
                varying float vScanline;
                
                void main() {
                    vUv = uv;
                    vPosition = position;
                    vNormal = normal;
                    
                    // Líneas de escaneo
                    vScanline = sin(vUv.y * 100.0 + time * scanlineSpeed);
                    
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                }
            `,
            fragmentShader: `
                uniform float time;
                uniform vec3 hologramColor;
                uniform float transparency;
                uniform float flicker;
                uniform float scanlineIntensity;
                
                varying vec3 vPosition;
                varying vec3 vNormal;
                varying vec2 vUv;
                varying float vScanline;
                
                void main() {
                    // Color base del holograma
                    vec3 color = hologramColor;
                    
                    // Parpadeo
                    float flickerEffect = 1.0 + sin(time * 10.0) * flicker;
                    color *= flickerEffect;
                    
                    // Líneas de escaneo
                    float scanline = vScanline * scanlineIntensity;
                    color += vec3(0.2, 0.4, 0.8) * scanline;
                    
                    // Transparencia
                    float alpha = transparency * (0.5 + 0.5 * sin(time * 2.0));
                    
                    // Efecto de desvanecimiento en los bordes
                    float edge = 1.0 - length(vUv - vec2(0.5));
                    alpha *= smoothstep(0.0, 0.1, edge);
                    
                    gl_FragColor = vec4(color, alpha);
                }
            `,
            uniforms: {
                time: { value: 0 },
                hologramColor: { value: new THREE.Color(0x00ffff) },
                transparency: { value: 0.7 },
                flicker: { value: 0.1 },
                scanlineSpeed: { value: 5.0 },
                scanlineIntensity: { value: 0.3 }
            }
        };
        
        this.shaders.set('hologram', hologramShader);
    }
    
    /**
     * Crear shaders de post-procesamiento
     */
    async createPostProcessingShaders() {
        // Shader de bloom
        this.createBloomShader();
        
        // Shader de SSAO
        this.createSSAOShader();
        
        // Shader de DOF
        this.createDOFShader();
        
        // Shader de motion blur
        this.createMotionBlurShader();
        
        // Shader de color grading
        this.createColorGradingShader();
        
        console.log('✅ Shaders de post-procesamiento creados');
    }
    
    /**
     * Crear shader de bloom
     */
    createBloomShader() {
        const bloomShader = {
            vertexShader: `
                varying vec2 vUv;
                
                void main() {
                    vUv = uv;
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                }
            `,
            fragmentShader: `
                uniform sampler2D tDiffuse;
                uniform float threshold;
                uniform float intensity;
                
                varying vec2 vUv;
                
                void main() {
                    vec4 color = texture2D(tDiffuse, vUv);
                    
                    // Umbral de brillo
                    float brightness = dot(color.rgb, vec3(0.299, 0.587, 0.114));
                    float bloom = max(0.0, brightness - threshold);
                    
                    // Intensidad del bloom
                    color.rgb += bloom * intensity;
                    
                    gl_FragColor = color;
                }
            `,
            uniforms: {
                tDiffuse: { value: null },
                threshold: { value: 0.8 },
                intensity: { value: 1.0 }
            }
        };
        
        this.postProcessing.set('bloom', bloomShader);
    }
    
    /**
     * Crear shader de SSAO
     */
    createSSAOShader() {
        const ssaoShader = {
            vertexShader: `
                varying vec2 vUv;
                
                void main() {
                    vUv = uv;
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                }
            `,
            fragmentShader: `
                uniform sampler2D tDiffuse;
                uniform sampler2D tDepth;
                uniform sampler2D tNormal;
                uniform float radius;
                uniform float bias;
                uniform float intensity;
                
                varying vec2 vUv;
                
                void main() {
                    vec4 color = texture2D(tDiffuse, vUv);
                    float depth = texture2D(tDepth, vUv).r;
                    vec3 normal = texture2D(tNormal, vUv).rgb;
                    
                    // Implementación básica de SSAO
                    float ao = 1.0;
                    
                    // Muestrear puntos alrededor
                    for (int i = 0; i < 16; i++) {
                        vec2 offset = vec2(
                            sin(float(i) * 0.7853981633974483),
                            cos(float(i) * 0.7853981633974483)
                        ) * radius;
                        
                        float sampleDepth = texture2D(tDepth, vUv + offset).r;
                        float diff = depth - sampleDepth;
                        
                        if (diff > bias) {
                            ao -= 0.0625;
                        }
                    }
                    
                    ao = max(0.0, ao);
                    color.rgb *= ao * intensity;
                    
                    gl_FragColor = color;
                }
            `,
            uniforms: {
                tDiffuse: { value: null },
                tDepth: { value: null },
                tNormal: { value: null },
                radius: { value: 0.01 },
                bias: { value: 0.001 },
                intensity: { value: 1.0 }
            }
        };
        
        this.postProcessing.set('ssao', ssaoShader);
    }
    
    /**
     * Crear shader de DOF
     */
    createDOFShader() {
        const dofShader = {
            vertexShader: `
                varying vec2 vUv;
                
                void main() {
                    vUv = uv;
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                }
            `,
            fragmentShader: `
                uniform sampler2D tDiffuse;
                uniform sampler2D tDepth;
                uniform float focusDistance;
                uniform float focusRange;
                uniform float bokehRadius;
                
                varying vec2 vUv;
                
                void main() {
                    vec4 color = texture2D(tDiffuse, vUv);
                    float depth = texture2D(tDepth, vUv).r;
                    
                    // Calcular desenfoque
                    float blur = abs(depth - focusDistance) / focusRange;
                    blur = min(blur, 1.0);
                    
                    // Aplicar desenfoque
                    vec4 blurredColor = vec4(0.0);
                    float totalWeight = 0.0;
                    
                    for (int i = 0; i < 16; i++) {
                        vec2 offset = vec2(
                            sin(float(i) * 0.39269908169872414),
                            cos(float(i) * 0.39269908169872414)
                        ) * bokehRadius * blur;
                        
                        vec4 sampleColor = texture2D(tDiffuse, vUv + offset);
                        float weight = 1.0 / (1.0 + length(offset));
                        
                        blurredColor += sampleColor * weight;
                        totalWeight += weight;
                    }
                    
                    blurredColor /= totalWeight;
                    color = mix(color, blurredColor, blur);
                    
                    gl_FragColor = color;
                }
            `,
            uniforms: {
                tDiffuse: { value: null },
                tDepth: { value: null },
                focusDistance: { value: 0.5 },
                focusRange: { value: 0.1 },
                bokehRadius: { value: 0.01 }
            }
        };
        
        this.postProcessing.set('dof', dofShader);
    }
    
    /**
     * Crear shader de motion blur
     */
    createMotionBlurShader() {
        const motionBlurShader = {
            vertexShader: `
                varying vec2 vUv;
                
                void main() {
                    vUv = uv;
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                }
            `,
            fragmentShader: `
                uniform sampler2D tDiffuse;
                uniform sampler2D tVelocity;
                uniform float samples;
                uniform float intensity;
                
                varying vec2 vUv;
                
                void main() {
                    vec4 color = texture2D(tDiffuse, vUv);
                    vec2 velocity = texture2D(tVelocity, vUv).rg;
                    
                    // Aplicar motion blur
                    vec4 blurredColor = vec4(0.0);
                    float totalWeight = 0.0;
                    
                    for (float i = 0.0; i < samples; i++) {
                        vec2 offset = velocity * (i / samples - 0.5) * intensity;
                        vec4 sampleColor = texture2D(tDiffuse, vUv + offset);
                        float weight = 1.0 - abs(i / samples - 0.5);
                        
                        blurredColor += sampleColor * weight;
                        totalWeight += weight;
                    }
                    
                    blurredColor /= totalWeight;
                    color = mix(color, blurredColor, length(velocity));
                    
                    gl_FragColor = color;
                }
            `,
            uniforms: {
                tDiffuse: { value: null },
                tVelocity: { value: null },
                samples: { value: 8.0 },
                intensity: { value: 1.0 }
            }
        };
        
        this.postProcessing.set('motionBlur', motionBlurShader);
    }
    
    /**
     * Crear shader de color grading
     */
    createColorGradingShader() {
        const colorGradingShader = {
            vertexShader: `
                varying vec2 vUv;
                
                void main() {
                    vUv = uv;
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                }
            `,
            fragmentShader: `
                uniform sampler2D tDiffuse;
                uniform vec3 brightness;
                uniform vec3 contrast;
                uniform vec3 saturation;
                uniform vec3 gamma;
                uniform vec3 temperature;
                uniform vec3 tint;
                
                varying vec2 vUv;
                
                void main() {
                    vec4 color = texture2D(tDiffuse, vUv);
                    
                    // Brillo
                    color.rgb += brightness;
                    
                    // Contraste
                    color.rgb = (color.rgb - 0.5) * contrast + 0.5;
                    
                    // Saturación
                    float luminance = dot(color.rgb, vec3(0.299, 0.587, 0.114));
                    color.rgb = mix(vec3(luminance), color.rgb, saturation);
                    
                    // Gamma
                    color.rgb = pow(color.rgb, gamma);
                    
                    // Temperatura
                    color.rgb *= temperature;
                    
                    // Tinte
                    color.rgb += tint;
                    
                    gl_FragColor = color;
                }
            `,
            uniforms: {
                tDiffuse: { value: null },
                brightness: { value: new THREE.Vector3(0, 0, 0) },
                contrast: { value: new THREE.Vector3(1, 1, 1) },
                saturation: { value: new THREE.Vector3(1, 1, 1) },
                gamma: { value: new THREE.Vector3(1, 1, 1) },
                temperature: { value: new THREE.Vector3(1, 1, 1) },
                tint: { value: new THREE.Vector3(0, 0, 0) }
            }
        };
        
        this.postProcessing.set('colorGrading', colorGradingShader);
    }
    
    /**
     * Crear shaders de efectos especiales
     */
    async createSpecialEffectShaders() {
        // Shader de distorsión
        this.createDistortionShader();
        
        // Shader de ondas
        this.createWaveShader();
        
        // Shader de partículas
        this.createParticleShader();
        
        // Shader de niebla
        this.createFogShader();
        
        console.log('✅ Shaders de efectos especiales creados');
    }
    
    /**
     * Crear shader de distorsión
     */
    createDistortionShader() {
        const distortionShader = {
            vertexShader: `
                uniform float time;
                uniform float intensity;
                
                varying vec2 vUv;
                
                void main() {
                    vUv = uv;
                    
                    // Distorsión de vértices
                    vec3 newPosition = position;
                    newPosition.x += sin(time + position.y * 10.0) * 0.1 * intensity;
                    newPosition.y += cos(time + position.x * 10.0) * 0.1 * intensity;
                    
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0);
                }
            `,
            fragmentShader: `
                uniform float time;
                uniform float intensity;
                uniform sampler2D tDiffuse;
                
                varying vec2 vUv;
                
                void main() {
                    // Distorsión de UV
                    vec2 distortedUv = vUv;
                    distortedUv.x += sin(time + vUv.y * 10.0) * 0.01 * intensity;
                    distortedUv.y += cos(time + vUv.x * 10.0) * 0.01 * intensity;
                    
                    vec4 color = texture2D(tDiffuse, distortedUv);
                    gl_FragColor = color;
                }
            `,
            uniforms: {
                time: { value: 0 },
                intensity: { value: 1.0 },
                tDiffuse: { value: null }
            }
        };
        
        this.effects.set('distortion', distortionShader);
    }
    
    /**
     * Crear material con shader
     */
    createMaterial(shaderName, options = {}) {
        const shader = this.shaders.get(shaderName);
        if (!shader) {
            console.error(`Shader no encontrado: ${shaderName}`);
            return null;
        }
        
        // Clonar uniforms
        const uniforms = {};
        Object.keys(shader.uniforms).forEach(key => {
            uniforms[key] = { value: shader.uniforms[key].value };
        });
        
        // Aplicar opciones
        Object.keys(options).forEach(key => {
            if (uniforms[key]) {
                uniforms[key].value = options[key];
            }
        });
        
        // Crear material
        const material = new THREE.ShaderMaterial({
            vertexShader: shader.vertexShader,
            fragmentShader: shader.fragmentShader,
            uniforms: uniforms,
            transparent: true,
            side: THREE.DoubleSide
        });
        
        const materialId = `material_${shaderName}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        this.materials.set(materialId, material);
        
        this.metrics.activeMaterials++;
        
        return material;
    }
    
    /**
     * Actualizar shaders
     */
    update(deltaTime) {
        if (!this.states.isInitialized || !this.states.isEnabled) return;
        
        this.time += deltaTime;
        this.deltaTime = deltaTime;
        
        // Actualizar uniforms de tiempo
        this.materials.forEach(material => {
            if (material.uniforms && material.uniforms.time) {
                material.uniforms.time.value = this.time;
            }
        });
        
        // Actualizar métricas
        this.updateMetrics();
    }
    
    /**
     * Actualizar métricas
     */
    updateMetrics() {
        this.metrics.activeShaders = this.shaders.size;
        this.metrics.activeMaterials = this.materials.size;
        this.metrics.activePostProcessing = this.postProcessing.size;
        this.metrics.activeEffects = this.effects.size;
        this.metrics.memoryUsage = this.calculateMemoryUsage();
    }
    
    /**
     * Calcular uso de memoria
     */
    calculateMemoryUsage() {
        let total = 0;
        
        // Memoria de shaders
        this.shaders.forEach(shader => {
            total += shader.vertexShader.length + shader.fragmentShader.length;
        });
        
        // Memoria de materiales
        this.materials.forEach(material => {
            total += material.uniforms ? Object.keys(material.uniforms).length * 16 : 0;
        });
        
        return total;
    }
    
    /**
     * Obtener métricas
     */
    getMetrics() {
        return this.metrics;
    }
    
    /**
     * Obtener estado
     */
    getState() {
        return this.states;
    }
    
    /**
     * Limpiar recursos
     */
    dispose() {
        // Limpiar materiales
        this.materials.forEach(material => {
            material.dispose();
        });
        this.materials.clear();
        
        // Limpiar shaders
        this.shaders.clear();
        this.postProcessing.clear();
        this.effects.clear();
        this.computeShaders.clear();
        
        console.log('🧹 Sistema de Shaders limpiado');
    }
}

// Exportar para uso global
window.ShaderSystem = ShaderSystem; 
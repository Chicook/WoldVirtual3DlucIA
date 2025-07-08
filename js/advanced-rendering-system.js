/**
 * Advanced Rendering System - Three.js
 * Sistema de renderizado optimizado con LOD, culling y post-processing
 */

class AdvancedRenderingSystem {
    constructor(scene, camera, renderer, options = {}) {
        this.scene = scene;
        this.camera = camera;
        this.renderer = renderer;
        
        this.config = {
            // LOD Configuration
            lodLevels: options.lodLevels || [
                { distance: 50, detail: 1.0 },   // High detail
                { distance: 150, detail: 0.6 },  // Medium detail
                { distance: 300, detail: 0.3 },  // Low detail
                { distance: 500, detail: 0.1 }   // Very low detail
            ],
            
            // Culling Configuration
            frustumCulling: options.frustumCulling !== false,
            occlusionCulling: options.occlusionCulling !== false,
            backfaceCulling: options.backfaceCulling !== false,
            
            // Performance Configuration
            maxDrawCalls: options.maxDrawCalls || 1000,
            maxTriangles: options.maxTriangles || 500000,
            adaptiveQuality: options.adaptiveQuality !== false,
            targetFPS: options.targetFPS || 60,
            
            // Post-processing
            postProcessing: options.postProcessing !== false,
            effects: options.effects || ['bloom', 'ssao', 'ssr'],
            
            debug: options.debug || false
        };
        
        // Estado del sistema
        this.state = {
            currentFPS: 0,
            frameTime: 0,
            drawCalls: 0,
            triangles: 0,
            qualityLevel: 1.0,
            isAdaptive: true
        };
        
        // LOD System
        this.lodObjects = new Map();
        this.lodGroups = new Map();
        
        // Culling System
        this.frustum = new THREE.Frustum();
        this.cameraMatrix = new THREE.Matrix4();
        this.occlusionQueries = new Map();
        this.visibleObjects = new Set();
        
        // Instancing System
        this.instancedMeshes = new Map();
        this.instanceMatrices = new Map();
        
        // Post-processing
        this.composer = null;
        this.passes = new Map();
        
        // Performance Monitoring
        this.performanceMonitor = {
            frameStart: 0,
            frameEnd: 0,
            samples: [],
            maxSamples: 60
        };
        
        // Shader Cache
        this.shaderCache = new Map();
        this.materialCache = new Map();
        
        this.init();
        
        console.log('🎨 Advanced Rendering System initialized');
    }
    
    /**
     * Inicializar sistema de renderizado
     */
    async init() {
        try {
            // Configurar renderer optimizado
            this.setupRenderer();
            
            // Inicializar LOD system
            this.initLODSystem();
            
            // Inicializar culling system
            this.initCullingSystem();
            
            // Configurar instancing
            this.initInstancingSystem();
            
            // Configurar post-processing
            if (this.config.postProcessing) {
                await this.initPostProcessing();
            }
            
            // Inicializar performance monitoring
            this.initPerformanceMonitoring();
            
            console.log('✅ Advanced Rendering System initialized successfully');
        } catch (error) {
            console.error('❌ Failed to initialize rendering system:', error);
        }
    }
    
    /**
     * Configurar renderer con optimizaciones
     */
    setupRenderer() {
        // Configuraciones de rendimiento
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        this.renderer.shadowMap.autoUpdate = false; // Manual shadow updates
        
        // Optimizaciones WebGL
        this.renderer.capabilities.precision = 'mediump';
        this.renderer.powerPreference = 'high-performance';
        
        // Context settings
        const gl = this.renderer.getContext();
        gl.hint(gl.GENERATE_MIPMAP_HINT, gl.FASTEST);
        gl.hint(gl.FRAGMENT_SHADER_DERIVATIVE_HINT, gl.FASTEST);
        
        console.log('🔧 Renderer optimizado configurado');
    }
    
    /**
     * Inicializar sistema LOD
     */
    initLODSystem() {
        this.lodManager = {
            // Crear grupo LOD para un objeto
            createLODGroup: (object, levels) => {
                const lodGroup = new THREE.LOD();
                
                levels.forEach((level, index) => {
                    const lodObject = this.createLODLevel(object, level.detail);
                    lodGroup.addLevel(lodObject, level.distance);
                });
                
                this.lodGroups.set(object.uuid, lodGroup);
                return lodGroup;
            },
            
            // Actualizar LODs basado en distancia a cámara
            updateLODs: () => {
                const cameraPosition = this.camera.position;
                
                this.lodGroups.forEach((lodGroup, objectId) => {
                    lodGroup.update(this.camera);
                    
                    // Calcular nivel de detalle actual
                    const distance = cameraPosition.distanceTo(lodGroup.position);
                    const currentLevel = this.calculateLODLevel(distance);
                    
                    // Actualizar objeto en base de datos LOD
                    this.lodObjects.set(objectId, {
                        distance,
                        currentLevel,
                        lastUpdate: Date.now()
                    });
                });
            }
        };
        
        console.log('📐 Sistema LOD inicializado');
    }
    
    /**
     * Crear nivel LOD para un objeto
     */
    createLODLevel(originalObject, detailLevel) {
        const lodObject = originalObject.clone();
        
        if (lodObject.geometry) {
            // Simplificar geometría basada en nivel de detalle
            const originalVertexCount = lodObject.geometry.attributes.position.count;
            const targetVertexCount = Math.floor(originalVertexCount * detailLevel);
            
            if (detailLevel < 1.0 && targetVertexCount > 0) {
                lodObject.geometry = this.simplifyGeometry(lodObject.geometry, detailLevel);
            }
        }
        
        // Ajustar materiales para LOD
        if (lodObject.material) {
            lodObject.material = this.createLODMaterial(lodObject.material, detailLevel);
        }
        
        return lodObject;
    }
    
    /**
     * Simplificar geometría
     */
    simplifyGeometry(geometry, detailLevel) {
        // Implementación básica de simplificación
        // En producción usaríamos bibliotecas como SimplifyModifier
        
        if (detailLevel >= 1.0) return geometry;
        
        const simplified = geometry.clone();
        
        // Reducir resolución de texturas UV si existen
        if (simplified.attributes.uv) {
            const uvArray = simplified.attributes.uv.array;
            const newUvArray = new Float32Array(uvArray.length * detailLevel);
            
            for (let i = 0; i < newUvArray.length; i += 2) {
                const sourceIndex = Math.floor(i / detailLevel) * 2;
                newUvArray[i] = uvArray[sourceIndex] || 0;
                newUvArray[i + 1] = uvArray[sourceIndex + 1] || 0;
            }
            
            simplified.setAttribute('uv', new THREE.BufferAttribute(newUvArray, 2));
        }
        
        return simplified;
    }
    
    /**
     * Crear material LOD
     */
    createLODMaterial(originalMaterial, detailLevel) {
        const cacheKey = `${originalMaterial.uuid}_${detailLevel}`;
        
        if (this.materialCache.has(cacheKey)) {
            return this.materialCache.get(cacheKey);
        }
        
        const lodMaterial = originalMaterial.clone();
        
        // Ajustar calidad del material basado en LOD
        if (detailLevel < 0.5) {
            // LOD muy bajo - materiales simples
            lodMaterial.roughness = Math.min(lodMaterial.roughness + 0.3, 1.0);
            lodMaterial.metalness = Math.max(lodMaterial.metalness - 0.2, 0.0);
            
            // Desactivar mapas normales en LOD bajo
            if (lodMaterial.normalMap) {
                lodMaterial.normalMap = null;
            }
        } else if (detailLevel < 0.8) {
            // LOD medio - reducir complejidad
            lodMaterial.roughness = Math.min(lodMaterial.roughness + 0.1, 1.0);
        }
        
        this.materialCache.set(cacheKey, lodMaterial);
        return lodMaterial;
    }
    
    /**
     * Calcular nivel LOD basado en distancia
     */
    calculateLODLevel(distance) {
        for (let i = 0; i < this.config.lodLevels.length; i++) {
            if (distance <= this.config.lodLevels[i].distance) {
                return this.config.lodLevels[i].detail;
            }
        }
        return this.config.lodLevels[this.config.lodLevels.length - 1].detail;
    }
    
    /**
     * Inicializar sistema de culling
     */
    initCullingSystem() {
        this.cullingManager = {
            // Frustum culling
            performFrustumCulling: () => {
                if (!this.config.frustumCulling) return;
                
                this.cameraMatrix.multiplyMatrices(this.camera.projectionMatrix, this.camera.matrixWorldInverse);
                this.frustum.setFromProjectionMatrix(this.cameraMatrix);
                
                this.scene.traverse((object) => {
                    if (object.isMesh) {
                        object.visible = this.frustum.intersectsObject(object);
                        
                        if (object.visible) {
                            this.visibleObjects.add(object);
                        } else {
                            this.visibleObjects.delete(object);
                        }
                    }
                });
            },
            
            // Occlusion culling (simplified)
            performOcclusionCulling: () => {
                if (!this.config.occlusionCulling) return;
                
                // Implementación simplificada de occlusion culling
                // En producción usaríamos GPU occlusion queries
                
                const cameraPosition = this.camera.position;
                const raycaster = new THREE.Raycaster();
                
                this.visibleObjects.forEach((object) => {
                    const direction = new THREE.Vector3();
                    direction.subVectors(object.position, cameraPosition).normalize();
                    
                    raycaster.set(cameraPosition, direction);
                    const intersects = raycaster.intersectObjects([...this.visibleObjects], false);
                    
                    // Si hay intersecciones antes del objeto, está ocluido
                    if (intersects.length > 0 && intersects[0].object !== object) {
                        const distanceToObject = cameraPosition.distanceTo(object.position);
                        const distanceToBlocker = intersects[0].distance;
                        
                        if (distanceToBlocker < distanceToObject - 1) {
                            object.visible = false;
                            this.visibleObjects.delete(object);
                        }
                    }
                });
            },
            
            // Distance culling
            performDistanceCulling: (maxDistance = 1000) => {
                const cameraPosition = this.camera.position;
                
                this.scene.traverse((object) => {
                    if (object.isMesh) {
                        const distance = cameraPosition.distanceTo(object.position);
                        
                        if (distance > maxDistance) {
                            object.visible = false;
                            this.visibleObjects.delete(object);
                        }
                    }
                });
            }
        };
        
        console.log('✂️ Sistema de culling inicializado');
    }
    
    /**
     * Inicializar sistema de instancing
     */
    initInstancingSystem() {
        this.instancingManager = {
            // Crear instanced mesh
            createInstancedMesh: (geometry, material, count) => {
                const instancedMesh = new THREE.InstancedMesh(geometry, material, count);
                const matrices = new Float32Array(count * 16);
                
                // Inicializar matrices de transformación
                for (let i = 0; i < count; i++) {
                    const matrix = new THREE.Matrix4();
                    matrix.toArray(matrices, i * 16);
                }
                
                instancedMesh.instanceMatrix.needsUpdate = true;
                
                this.instancedMeshes.set(instancedMesh.uuid, instancedMesh);
                this.instanceMatrices.set(instancedMesh.uuid, matrices);
                
                return instancedMesh;
            },
            
            // Actualizar instancia específica
            updateInstance: (instancedMesh, index, position, rotation, scale) => {
                const matrix = new THREE.Matrix4();
                matrix.compose(position, rotation, scale);
                
                const matrices = this.instanceMatrices.get(instancedMesh.uuid);
                if (matrices) {
                    matrix.toArray(matrices, index * 16);
                    instancedMesh.instanceMatrix.needsUpdate = true;
                }
            },
            
            // Batch update de todas las instancias
            updateAllInstances: () => {
                this.instancedMeshes.forEach((mesh) => {
                    mesh.instanceMatrix.needsUpdate = true;
                });
            }
        };
        
        console.log('🔄 Sistema de instancing inicializado');
    }
    
    /**
     * Inicializar post-processing
     */
    async initPostProcessing() {
        // Verificar disponibilidad de EffectComposer
        if (typeof THREE.EffectComposer === 'undefined') {
            console.warn('EffectComposer no disponible, saltando post-processing');
            return;
        }
        
        this.composer = new THREE.EffectComposer(this.renderer);
        
        // Render pass principal
        const renderPass = new THREE.RenderPass(this.scene, this.camera);
        this.composer.addPass(renderPass);
        this.passes.set('render', renderPass);
        
        // Configurar efectos basados en configuración
        if (this.config.effects.includes('bloom')) {
            await this.addBloomEffect();
        }
        
        if (this.config.effects.includes('ssao')) {
            await this.addSSAOEffect();
        }
        
        if (this.config.effects.includes('ssr')) {
            await this.addSSREffect();
        }
        
        // FXAA para anti-aliasing
        if (typeof THREE.ShaderPass !== 'undefined' && typeof THREE.FXAAShader !== 'undefined') {
            const fxaaPass = new THREE.ShaderPass(THREE.FXAAShader);
            fxaaPass.material.uniforms['resolution'].value.x = 1 / window.innerWidth;
            fxaaPass.material.uniforms['resolution'].value.y = 1 / window.innerHeight;
            this.composer.addPass(fxaaPass);
            this.passes.set('fxaa', fxaaPass);
        }
        
        console.log('🎭 Post-processing inicializado');
    }
    
    /**
     * Agregar efecto bloom
     */
    async addBloomEffect() {
        if (typeof THREE.UnrealBloomPass !== 'undefined') {
            const bloomPass = new THREE.UnrealBloomPass(
                new THREE.Vector2(window.innerWidth, window.innerHeight),
                1.5,  // strength
                0.4,  // radius
                0.85  // threshold
            );
            
            this.composer.addPass(bloomPass);
            this.passes.set('bloom', bloomPass);
        }
    }
    
    /**
     * Agregar efecto SSAO
     */
    async addSSAOEffect() {
        if (typeof THREE.SSAOPass !== 'undefined') {
            const ssaoPass = new THREE.SSAOPass(this.scene, this.camera, window.innerWidth, window.innerHeight);
            ssaoPass.kernelRadius = 16;
            ssaoPass.minDistance = 0.005;
            ssaoPass.maxDistance = 0.1;
            
            this.composer.addPass(ssaoPass);
            this.passes.set('ssao', ssaoPass);
        }
    }
    
    /**
     * Agregar efecto SSR (Screen Space Reflections)
     */
    async addSSREffect() {
        // Implementación simplificada de SSR
        // En producción usaríamos una implementación más compleja
        console.log('SSR effect placeholder - implementar con shader personalizado');
    }
    
    /**
     * Inicializar monitoreo de performance
     */
    initPerformanceMonitoring() {
        this.performanceMonitor.startFrame = () => {
            this.performanceMonitor.frameStart = performance.now();
        };
        
        this.performanceMonitor.endFrame = () => {
            this.performanceMonitor.frameEnd = performance.now();
            const frameTime = this.performanceMonitor.frameEnd - this.performanceMonitor.frameStart;
            
            this.performanceMonitor.samples.push(frameTime);
            if (this.performanceMonitor.samples.length > this.performanceMonitor.maxSamples) {
                this.performanceMonitor.samples.shift();
            }
            
            // Calcular FPS y tiempo de frame
            this.state.frameTime = frameTime;
            this.state.currentFPS = 1000 / frameTime;
            
            // Ajuste adaptativo de calidad
            if (this.config.adaptiveQuality) {
                this.adjustQuality();
            }
        };
        
        console.log('📊 Monitoreo de performance inicializado');
    }
    
    /**
     * Ajustar calidad basada en performance
     */
    adjustQuality() {
        const avgFrameTime = this.performanceMonitor.samples.reduce((a, b) => a + b, 0) / this.performanceMonitor.samples.length;
        const currentFPS = 1000 / avgFrameTime;
        const targetFPS = this.config.targetFPS;
        
        // Si FPS está por debajo del objetivo, reducir calidad
        if (currentFPS < targetFPS * 0.9) {
            this.state.qualityLevel = Math.max(0.3, this.state.qualityLevel - 0.1);
            this.applyQualityLevel(this.state.qualityLevel);
        }
        // Si FPS está bien, aumentar calidad gradualmente
        else if (currentFPS > targetFPS * 1.1 && this.state.qualityLevel < 1.0) {
            this.state.qualityLevel = Math.min(1.0, this.state.qualityLevel + 0.05);
            this.applyQualityLevel(this.state.qualityLevel);
        }
    }
    
    /**
     * Aplicar nivel de calidad
     */
    applyQualityLevel(qualityLevel) {
        // Ajustar resolución de renderizado
        const baseWidth = window.innerWidth;
        const baseHeight = window.innerHeight;
        const renderWidth = Math.floor(baseWidth * qualityLevel);
        const renderHeight = Math.floor(baseHeight * qualityLevel);
        
        this.renderer.setSize(renderWidth, renderHeight, false);
        
        if (this.composer) {
            this.composer.setSize(renderWidth, renderHeight);
        }
        
        // Ajustar calidad de sombras
        if (qualityLevel < 0.7) {
            this.renderer.shadowMap.enabled = false;
        } else {
            this.renderer.shadowMap.enabled = true;
            this.renderer.shadowMap.type = qualityLevel > 0.8 ? 
                THREE.PCFSoftShadowMap : THREE.PCFShadowMap;
        }
        
        // Ajustar LOD forzado
        this.config.lodLevels.forEach(level => {
            level.detail *= qualityLevel;
        });
        
        if (this.config.debug) {
            console.log(`🎯 Calidad ajustada a ${(qualityLevel * 100).toFixed(1)}%`);
        }
    }
    
    /**
     * Renderizar frame
     */
    render() {
        this.performanceMonitor.startFrame();
        
        // Actualizar sistemas
        this.updateSystems();
        
        // Renderizar
        if (this.composer && this.config.postProcessing) {
            this.composer.render();
        } else {
            this.renderer.render(this.scene, this.camera);
        }
        
        this.performanceMonitor.endFrame();
    }
    
    /**
     * Actualizar todos los sistemas
     */
    updateSystems() {
        // Actualizar LOD
        if (this.lodManager) {
            this.lodManager.updateLODs();
        }
        
        // Realizar culling
        if (this.cullingManager) {
            this.cullingManager.performFrustumCulling();
            this.cullingManager.performOcclusionCulling();
            this.cullingManager.performDistanceCulling();
        }
        
        // Actualizar instancing
        if (this.instancingManager) {
            this.instancingManager.updateAllInstances();
        }
        
        // Actualizar métricas
        this.updateMetrics();
    }
    
    /**
     * Actualizar métricas de renderizado
     */
    updateMetrics() {
        const info = this.renderer.info;
        
        this.state.drawCalls = info.render.calls;
        this.state.triangles = info.render.triangles;
        
        // Resetear contadores del renderer
        info.reset();
    }
    
    /**
     * Redimensionar renderer
     */
    resize(width, height) {
        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();
        
        this.renderer.setSize(width, height);
        
        if (this.composer) {
            this.composer.setSize(width, height);
        }
        
        // Actualizar resolución en passes que lo necesiten
        if (this.passes.has('fxaa')) {
            const fxaaPass = this.passes.get('fxaa');
            fxaaPass.material.uniforms['resolution'].value.x = 1 / width;
            fxaaPass.material.uniforms['resolution'].value.y = 1 / height;
        }
    }
    
    /**
     * Obtener métricas del sistema
     */
    getMetrics() {
        return {
            ...this.state,
            performanceHistory: [...this.performanceMonitor.samples],
            lodObjects: this.lodObjects.size,
            visibleObjects: this.visibleObjects.size,
            instancedMeshes: this.instancedMeshes.size
        };
    }
    
    /**
     * Limpiar recursos
     */
    dispose() {
        // Limpiar composer
        if (this.composer) {
            this.composer.dispose();
        }
        
        // Limpiar caches
        this.shaderCache.clear();
        this.materialCache.clear();
        
        // Limpiar referencias
        this.lodObjects.clear();
        this.lodGroups.clear();
        this.instancedMeshes.clear();
        this.instanceMatrices.clear();
        this.visibleObjects.clear();
        
        console.log('🧹 Sistema de renderizado limpiado');
    }
}

// Exportar para uso global
if (typeof window !== 'undefined') {
    window.AdvancedRenderingSystem = AdvancedRenderingSystem;
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = AdvancedRenderingSystem;
}
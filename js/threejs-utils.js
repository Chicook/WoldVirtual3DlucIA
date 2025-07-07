/**
 * Utilidades Avanzadas - Three.js
 * Herramientas y funciones auxiliares para el metaverso crypto 3D
 */

class ThreeJSUtils {
    constructor() {
        this.cache = new Map();
        this.loaders = new Map();
        this.optimizers = new Map();
        this.debuggers = new Map();
        
        console.log('🔧 Utilidades Three.js inicializadas');
    }
    
    /**
     * Cargador de recursos optimizado
     */
    createResourceLoader() {
        return {
            // Cargar modelo 3D
            loadModel: async (url, options = {}) => {
                const {
                    format = 'auto',
                    draco = true,
                    ktx2 = true,
                    meshopt = true,
                    ...loaderOptions
                } = options;
                
                const loader = this.getLoader(format);
                if (!loader) {
                    throw new Error(`Formato no soportado: ${format}`);
                }
                
                try {
                    const model = await new Promise((resolve, reject) => {
                        loader.load(url, resolve, undefined, reject);
                    });
                    
                    // Optimizar modelo
                    if (options.optimize !== false) {
                        this.optimizeModel(model);
                    }
                    
                    return model;
                } catch (error) {
                    console.error(`Error cargando modelo ${url}:`, error);
                    throw error;
                }
            },
            
            // Cargar textura
            loadTexture: async (url, options = {}) => {
                const {
                    format = 'auto',
                    generateMipmaps = true,
                    anisotropy = 16,
                    ...textureOptions
                } = options;
                
                const loader = new THREE.TextureLoader();
                
                try {
                    const texture = await new Promise((resolve, reject) => {
                        loader.load(url, resolve, undefined, reject);
                    });
                    
                    // Configurar textura
                    texture.generateMipmaps = generateMipmaps;
                    texture.anisotropy = anisotropy;
                    texture.encoding = THREE.sRGBEncoding;
                    
                    return texture;
                } catch (error) {
                    console.error(`Error cargando textura ${url}:`, error);
                    throw error;
                }
            },
            
            // Cargar audio
            loadAudio: async (url, options = {}) => {
                const {
                    format = 'auto',
                    ...audioOptions
                } = options;
                
                const loader = new THREE.AudioLoader();
                
                try {
                    const buffer = await new Promise((resolve, reject) => {
                        loader.load(url, resolve, undefined, reject);
                    });
                    
                    return buffer;
                } catch (error) {
                    console.error(`Error cargando audio ${url}:`, error);
                    throw error;
                }
            },
            
            // Cargar múltiples recursos
            loadMultiple: async (resources) => {
                const promises = resources.map(resource => {
                    switch (resource.type) {
                        case 'model':
                            return this.loadModel(resource.url, resource.options);
                        case 'texture':
                            return this.loadTexture(resource.url, resource.options);
                        case 'audio':
                            return this.loadAudio(resource.url, resource.options);
                        default:
                            throw new Error(`Tipo de recurso no soportado: ${resource.type}`);
                    }
                });
                
                return Promise.all(promises);
            }
        };
    }
    
    /**
     * Obtener loader apropiado
     */
    getLoader(format) {
        const loaders = {
            'gltf': new THREE.GLTFLoader(),
            'glb': new THREE.GLTFLoader(),
            'obj': new THREE.OBJLoader(),
            'fbx': new THREE.FBXLoader(),
            'dae': new THREE.ColladaLoader(),
            'ply': new THREE.PLYLoader(),
            'stl': new THREE.STLLoader(),
            'auto': new THREE.GLTFLoader() // Por defecto
        };
        
        return loaders[format] || loaders.auto;
    }
    
    /**
     * Optimizador de modelos
     */
    optimizeModel(model) {
        if (model.scene) {
            model.scene.traverse(child => {
                if (child.isMesh) {
                    // Optimizar geometría
                    if (child.geometry) {
                        child.geometry.computeBoundingBox();
                        child.geometry.computeBoundingSphere();
                        child.geometry.computeVertexNormals();
                    }
                    
                    // Optimizar material
                    if (child.material) {
                        if (Array.isArray(child.material)) {
                            child.material.forEach(mat => this.optimizeMaterial(mat));
                        } else {
                            this.optimizeMaterial(child.material);
                        }
                    }
                }
            });
        }
    }
    
    /**
     * Optimizar material
     */
    optimizeMaterial(material) {
        // Configurar opciones de rendimiento
        material.side = THREE.FrontSide;
        material.transparent = false;
        material.alphaTest = 0.5;
        
        // Optimizar texturas
        if (material.map) {
            material.map.generateMipmaps = true;
            material.map.anisotropy = 16;
        }
    }
    
    /**
     * Generador de geometrías procedurales
     */
    createProceduralGeometry() {
        return {
            // Generar terreno
            generateTerrain: (width, height, segments, noiseFunction) => {
                const geometry = new THREE.PlaneGeometry(width, height, segments, segments);
                const positions = geometry.attributes.position.array;
                
                for (let i = 0; i < positions.length; i += 3) {
                    const x = positions[i];
                    const z = positions[i + 2];
                    positions[i + 1] = noiseFunction(x, z);
                }
                
                geometry.attributes.position.needsUpdate = true;
                geometry.computeVertexNormals();
                
                return geometry;
            },
            
            // Generar árbol
            generateTree: (trunkHeight, trunkRadius, leafRadius, leafSegments) => {
                const group = new THREE.Group();
                
                // Tronco
                const trunkGeometry = new THREE.CylinderGeometry(trunkRadius, trunkRadius * 0.8, trunkHeight, 8);
                const trunkMaterial = new THREE.MeshLambertMaterial({ color: 0x8B4513 });
                const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
                trunk.position.y = trunkHeight / 2;
                group.add(trunk);
                
                // Hojas
                const leafGeometry = new THREE.SphereGeometry(leafRadius, leafSegments, leafSegments);
                const leafMaterial = new THREE.MeshLambertMaterial({ color: 0x228B22 });
                const leaves = new THREE.Mesh(leafGeometry, leafMaterial);
                leaves.position.y = trunkHeight + leafRadius * 0.5;
                group.add(leaves);
                
                return group;
            },
            
            // Generar edificio
            generateBuilding: (width, height, depth, floors) => {
                const group = new THREE.Group();
                
                // Estructura principal
                const buildingGeometry = new THREE.BoxGeometry(width, height, depth);
                const buildingMaterial = new THREE.MeshLambertMaterial({ color: 0xCCCCCC });
                const building = new THREE.Mesh(buildingGeometry, buildingMaterial);
                building.position.y = height / 2;
                group.add(building);
                
                // Ventanas
                const windowGeometry = new THREE.PlaneGeometry(0.5, 0.8);
                const windowMaterial = new THREE.MeshLambertMaterial({ 
                    color: 0x87CEEB,
                    transparent: true,
                    opacity: 0.7
                });
                
                for (let floor = 0; floor < floors; floor++) {
                    for (let side = 0; side < 4; side++) {
                        const window = new THREE.Mesh(windowGeometry, windowMaterial);
                        window.position.y = (floor + 1) * (height / floors) - height / 2;
                        
                        switch (side) {
                            case 0: // Frente
                                window.position.z = depth / 2 + 0.01;
                                break;
                            case 1: // Derecha
                                window.position.x = width / 2 + 0.01;
                                window.rotation.y = Math.PI / 2;
                                break;
                            case 2: // Atrás
                                window.position.z = -depth / 2 - 0.01;
                                window.rotation.y = Math.PI;
                                break;
                            case 3: // Izquierda
                                window.position.x = -width / 2 - 0.01;
                                window.rotation.y = -Math.PI / 2;
                                break;
                        }
                        
                        group.add(window);
                    }
                }
                
                return group;
            },
            
            // Generar roca
            generateRock: (radius, segments, roughness) => {
                const geometry = new THREE.SphereGeometry(radius, segments, segments);
                const positions = geometry.attributes.position.array;
                
                for (let i = 0; i < positions.length; i += 3) {
                    const noise = (Math.random() - 0.5) * roughness;
                    positions[i] += noise;
                    positions[i + 1] += noise;
                    positions[i + 2] += noise;
                }
                
                geometry.attributes.position.needsUpdate = true;
                geometry.computeVertexNormals();
                
                const material = new THREE.MeshLambertMaterial({ color: 0x666666 });
                return new THREE.Mesh(geometry, material);
            }
        };
    }
    
    /**
     * Sistema de animación avanzado
     */
    createAnimationSystem() {
        return {
            // Crear animación de rotación
            createRotationAnimation: (object, duration, axis = 'y', loop = true) => {
                const animation = {
                    object: object,
                    duration: duration,
                    axis: axis,
                    loop: loop,
                    startTime: 0,
                    isPlaying: false
                };
                
                animation.play = () => {
                    animation.isPlaying = true;
                    animation.startTime = performance.now();
                };
                
                animation.stop = () => {
                    animation.isPlaying = false;
                };
                
                animation.update = (currentTime) => {
                    if (!animation.isPlaying) return;
                    
                    const elapsed = (currentTime - animation.startTime) / 1000;
                    const progress = (elapsed % animation.duration) / animation.duration;
                    
                    const angle = progress * Math.PI * 2;
                    
                    switch (animation.axis) {
                        case 'x':
                            animation.object.rotation.x = angle;
                            break;
                        case 'y':
                            animation.object.rotation.y = angle;
                            break;
                        case 'z':
                            animation.object.rotation.z = angle;
                            break;
                    }
                    
                    if (!animation.loop && elapsed >= animation.duration) {
                        animation.stop();
                    }
                };
                
                return animation;
            },
            
            // Crear animación de flotación
            createFloatAnimation: (object, amplitude, frequency, duration) => {
                const animation = {
                    object: object,
                    amplitude: amplitude,
                    frequency: frequency,
                    duration: duration,
                    startTime: 0,
                    isPlaying: false,
                    originalY: object.position.y
                };
                
                animation.play = () => {
                    animation.isPlaying = true;
                    animation.startTime = performance.now();
                };
                
                animation.stop = () => {
                    animation.isPlaying = false;
                    animation.object.position.y = animation.originalY;
                };
                
                animation.update = (currentTime) => {
                    if (!animation.isPlaying) return;
                    
                    const elapsed = (currentTime - animation.startTime) / 1000;
                    const progress = (elapsed % animation.duration) / animation.duration;
                    
                    const offset = Math.sin(progress * Math.PI * 2 * animation.frequency) * animation.amplitude;
                    animation.object.position.y = animation.originalY + offset;
                };
                
                return animation;
            },
            
            // Crear animación de escala
            createScaleAnimation: (object, minScale, maxScale, duration) => {
                const animation = {
                    object: object,
                    minScale: minScale,
                    maxScale: maxScale,
                    duration: duration,
                    startTime: 0,
                    isPlaying: false
                };
                
                animation.play = () => {
                    animation.isPlaying = true;
                    animation.startTime = performance.now();
                };
                
                animation.stop = () => {
                    animation.isPlaying = false;
                };
                
                animation.update = (currentTime) => {
                    if (!animation.isPlaying) return;
                    
                    const elapsed = (currentTime - animation.startTime) / 1000;
                    const progress = (elapsed % animation.duration) / animation.duration;
                    
                    const scale = animation.minScale + (animation.maxScale - animation.minScale) * 
                                 (Math.sin(progress * Math.PI * 2) * 0.5 + 0.5);
                    
                    animation.object.scale.setScalar(scale);
                };
                
                return animation;
            }
        };
    }
    
    /**
     * Sistema de colisiones
     */
    createCollisionSystem() {
        return {
            // Detectar colisión entre dos objetos
            checkCollision: (object1, object2) => {
                const box1 = new THREE.Box3().setFromObject(object1);
                const box2 = new THREE.Box3().setFromObject(object2);
                
                return box1.intersectsBox(box2);
            },
            
            // Detectar colisión con rayo
            raycast: (origin, direction, objects, maxDistance = 1000) => {
                const raycaster = new THREE.Raycaster(origin, direction, 0, maxDistance);
                return raycaster.intersectObjects(objects, true);
            },
            
            // Crear trigger de colisión
            createTrigger: (object, callback) => {
                const trigger = {
                    object: object,
                    callback: callback,
                    isActive: true,
                    collidingObjects: new Set()
                };
                
                trigger.check = (otherObjects) => {
                    if (!trigger.isActive) return;
                    
                    otherObjects.forEach(other => {
                        if (other !== trigger.object) {
                            const isColliding = this.createCollisionSystem().checkCollision(trigger.object, other);
                            
                            if (isColliding && !trigger.collidingObjects.has(other)) {
                                trigger.collidingObjects.add(other);
                                trigger.callback('enter', other);
                            } else if (!isColliding && trigger.collidingObjects.has(other)) {
                                trigger.collidingObjects.delete(other);
                                trigger.callback('exit', other);
                            }
                        }
                    });
                };
                
                return trigger;
            }
        };
    }
    
    /**
     * Sistema de partículas avanzado
     */
    createParticleSystem() {
        return {
            // Crear sistema de partículas simple
            createSimpleParticles: (count, geometry, material, options = {}) => {
                const {
                    position = { x: 0, y: 0, z: 0 },
                    velocity = { x: 0, y: 0, z: 0 },
                    acceleration = { x: 0, y: -9.81, z: 0 },
                    life = 2.0,
                    size = { min: 0.1, max: 1.0 }
                } = options;
                
                const particles = new THREE.InstancedMesh(geometry, material, count);
                const matrix = new THREE.Matrix4();
                const positions = new Float32Array(count * 3);
                const velocities = new Float32Array(count * 3);
                const lives = new Float32Array(count);
                
                // Inicializar partículas
                for (let i = 0; i < count; i++) {
                    const i3 = i * 3;
                    
                    positions[i3] = position.x + (Math.random() - 0.5) * 0.1;
                    positions[i3 + 1] = position.y + (Math.random() - 0.5) * 0.1;
                    positions[i3 + 2] = position.z + (Math.random() - 0.5) * 0.1;
                    
                    velocities[i3] = velocity.x + (Math.random() - 0.5) * 2;
                    velocities[i3 + 1] = velocity.y + (Math.random() - 0.5) * 2;
                    velocities[i3 + 2] = velocity.z + (Math.random() - 0.5) * 2;
                    
                    lives[i] = life * (0.5 + Math.random() * 0.5);
                }
                
                const system = {
                    particles,
                    positions,
                    velocities,
                    lives,
                    acceleration,
                    size,
                    update: (deltaTime) => {
                        for (let i = 0; i < count; i++) {
                            const i3 = i * 3;
                            
                            if (lives[i] > 0) {
                                // Actualizar posición
                                positions[i3] += velocities[i3] * deltaTime;
                                positions[i3 + 1] += velocities[i3 + 1] * deltaTime;
                                positions[i3 + 2] += velocities[i3 + 2] * deltaTime;
                                
                                // Actualizar velocidad
                                velocities[i3] += acceleration.x * deltaTime;
                                velocities[i3 + 1] += acceleration.y * deltaTime;
                                velocities[i3 + 2] += acceleration.z * deltaTime;
                                
                                // Actualizar vida
                                lives[i] -= deltaTime;
                                
                                // Actualizar matriz de instancia
                                matrix.setPosition(positions[i3], positions[i3 + 1], positions[i3 + 2]);
                                const scale = size.min + (size.max - size.min) * (lives[i] / life);
                                matrix.scale(new THREE.Vector3(scale, scale, scale));
                                particles.setMatrixAt(i, matrix);
                            }
                        }
                        
                        particles.instanceMatrix.needsUpdate = true;
                    }
                };
                
                return system;
            }
        };
    }
    
    /**
     * Sistema de iluminación dinámica
     */
    createLightingSystem() {
        return {
            // Crear iluminación de día/noche
            createDayNightCycle: (scene, options = {}) => {
                const {
                    duration = 24, // horas
                    startTime = 12, // hora de inicio
                    ambientIntensity = { day: 0.4, night: 0.1 },
                    sunIntensity = { day: 1.0, night: 0.0 },
                    moonIntensity = { day: 0.0, night: 0.3 }
                } = options;
                
                // Crear luces
                const ambientLight = new THREE.AmbientLight(0x404040, ambientIntensity.day);
                scene.add(ambientLight);
                
                const sunLight = new THREE.DirectionalLight(0xffffff, sunIntensity.day);
                sunLight.position.set(100, 100, 50);
                sunLight.castShadow = true;
                scene.add(sunLight);
                
                const moonLight = new THREE.DirectionalLight(0x4444ff, moonIntensity.night);
                moonLight.position.set(-100, 100, -50);
                moonLight.castShadow = true;
                scene.add(moonLight);
                
                const cycle = {
                    time: startTime,
                    duration: duration,
                    update: (deltaTime) => {
                        cycle.time += (deltaTime / 3600) * 24; // Convertir a horas
                        if (cycle.time >= 24) cycle.time -= 24;
                        
                        const progress = cycle.time / 24;
                        const angle = progress * Math.PI * 2;
                        
                        // Actualizar posición del sol
                        sunLight.position.x = Math.cos(angle) * 100;
                        sunLight.position.y = Math.sin(angle) * 100;
                        
                        // Actualizar posición de la luna
                        moonLight.position.x = Math.cos(angle + Math.PI) * 100;
                        moonLight.position.y = Math.sin(angle + Math.PI) * 100;
                        
                        // Actualizar intensidades
                        const dayProgress = Math.sin(angle);
                        const nightProgress = Math.sin(angle + Math.PI);
                        
                        ambientLight.intensity = ambientIntensity.day * Math.max(0, dayProgress) + 
                                                ambientIntensity.night * Math.max(0, nightProgress);
                        
                        sunLight.intensity = sunIntensity.day * Math.max(0, dayProgress);
                        moonLight.intensity = moonIntensity.night * Math.max(0, nightProgress);
                    }
                };
                
                return cycle;
            },
            
            // Crear iluminación de fogata
            createFireLight: (position, options = {}) => {
                const {
                    intensity = 1.0,
                    distance = 10,
                    flickerSpeed = 2.0,
                    flickerAmount = 0.3
                } = options;
                
                const light = new THREE.PointLight(0xff6600, intensity, distance);
                light.position.copy(position);
                
                const fireLight = {
                    light,
                    originalIntensity: intensity,
                    flickerSpeed,
                    flickerAmount,
                    time: 0,
                    update: (deltaTime) => {
                        fireLight.time += deltaTime;
                        const flicker = Math.sin(fireLight.time * fireLight.flickerSpeed) * fireLight.flickerAmount;
                        light.intensity = fireLight.originalIntensity * (1 + flicker);
                    }
                };
                
                return fireLight;
            }
        };
    }
    
    /**
     * Sistema de efectos post-procesamiento
     */
    createPostProcessingSystem() {
        return {
            // Crear efecto de distorsión
            createDistortionEffect: (renderer, scene, camera) => {
                const composer = new THREE.EffectComposer(renderer);
                const renderPass = new THREE.RenderPass(scene, camera);
                composer.addPass(renderPass);
                
                const distortionPass = new THREE.ShaderPass({
                    uniforms: {
                        tDiffuse: { value: null },
                        time: { value: 0 },
                        intensity: { value: 0.1 }
                    },
                    vertexShader: `
                        varying vec2 vUv;
                        void main() {
                            vUv = uv;
                            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                        }
                    `,
                    fragmentShader: `
                        uniform sampler2D tDiffuse;
                        uniform float time;
                        uniform float intensity;
                        varying vec2 vUv;
                        
                        void main() {
                            vec2 distortedUv = vUv;
                            distortedUv.x += sin(time + vUv.y * 10.0) * intensity;
                            distortedUv.y += cos(time + vUv.x * 10.0) * intensity;
                            
                            gl_FragColor = texture2D(tDiffuse, distortedUv);
                        }
                    `
                });
                
                composer.addPass(distortionPass);
                
                return {
                    composer,
                    update: (time) => {
                        distortionPass.uniforms.time.value = time;
                    }
                };
            },
            
            // Crear efecto de desenfoque
            createBlurEffect: (renderer, scene, camera) => {
                const composer = new THREE.EffectComposer(renderer);
                const renderPass = new THREE.RenderPass(scene, camera);
                composer.addPass(renderPass);
                
                const blurPass = new THREE.UnrealBloomPass(
                    new THREE.Vector2(window.innerWidth, window.innerHeight),
                    1.5, 0.4, 0.85
                );
                composer.addPass(blurPass);
                
                return {
                    composer,
                    update: () => {}
                };
            }
        };
    }
    
    /**
     * Sistema de debug y profiling
     */
    createDebugSystem() {
        return {
            // Mostrar estadísticas de rendimiento
            showStats: (renderer) => {
                const stats = new Stats();
                stats.dom.style.position = 'absolute';
                stats.dom.style.top = '0px';
                stats.dom.style.left = '0px';
                document.body.appendChild(stats.dom);
                
                return {
                    stats,
                    update: () => {
                        stats.update();
                    }
                };
            },
            
            // Mostrar información de objetos
            showObjectInfo: (object) => {
                const info = {
                    vertices: 0,
                    faces: 0,
                    materials: 0,
                    children: 0
                };
                
                object.traverse(child => {
                    if (child.isMesh) {
                        if (child.geometry) {
                            info.vertices += child.geometry.attributes.position.count;
                            if (child.geometry.index) {
                                info.faces += child.geometry.index.count / 3;
                            }
                        }
                        info.materials++;
                    }
                    info.children++;
                });
                
                return info;
            },
            
            // Crear wireframe
            createWireframe: (object) => {
                const wireframe = new THREE.WireframeGeometry(object.geometry);
                const line = new THREE.LineSegments(wireframe);
                line.material.color.setHex(0x000000);
                return line;
            },
            
            // Mostrar bounding box
            showBoundingBox: (object) => {
                const box = new THREE.Box3().setFromObject(object);
                const helper = new THREE.Box3Helper(box, 0xffff00);
                return helper;
            }
        };
    }
    
    /**
     * Sistema de optimización
     */
    createOptimizationSystem() {
        return {
            // LOD (Level of Detail)
            createLOD: (object, distances, levels) => {
                const lod = new THREE.LOD();
                
                levels.forEach((level, index) => {
                    lod.addLevel(level, distances[index] || index * 50);
                });
                
                return lod;
            },
            
            // Frustum culling
            createFrustumCuller: (camera, objects) => {
                const frustum = new THREE.Frustum();
                const matrix = new THREE.Matrix4();
                
                return {
                    update: () => {
                        matrix.multiplyMatrices(camera.projectionMatrix, camera.matrixWorldInverse);
                        frustum.setFromProjectionMatrix(matrix);
                        
                        objects.forEach(object => {
                            const box = new THREE.Box3().setFromObject(object);
                            object.visible = frustum.intersectsBox(box);
                        });
                    }
                };
            },
            
            // Occlusion culling
            createOcclusionCuller: (camera, objects) => {
                const raycaster = new THREE.Raycaster();
                
                return {
                    update: () => {
                        objects.forEach(object => {
                            const direction = new THREE.Vector3();
                            direction.subVectors(object.position, camera.position).normalize();
                            
                            raycaster.set(camera.position, direction);
                            const intersects = raycaster.intersectObjects(objects, true);
                            
                            if (intersects.length > 0 && intersects[0].object !== object) {
                                object.visible = false;
                            } else {
                                object.visible = true;
                            }
                        });
                    }
                };
            }
        };
    }
    
    /**
     * Sistema de networking para multijugador
     */
    createNetworkingSystem() {
        return {
            // Interpolar posición
            interpolatePosition: (current, target, factor) => {
                return {
                    x: current.x + (target.x - current.x) * factor,
                    y: current.y + (target.y - current.y) * factor,
                    z: current.z + (target.z - current.z) * factor
                };
            },
            
            // Interpolar rotación
            interpolateRotation: (current, target, factor) => {
                const quaternion = new THREE.Quaternion();
                quaternion.slerpQuaternions(current, target, factor);
                return quaternion;
            },
            
            // Predicción de movimiento
            predictMovement: (position, velocity, time) => {
                return {
                    x: position.x + velocity.x * time,
                    y: position.y + velocity.y * time,
                    z: position.z + velocity.z * time
                };
            }
        };
    }
    
    /**
     * Sistema de eventos
     */
    createEventSystem() {
        const events = new Map();
        
        return {
            // Registrar evento
            on: (event, callback) => {
                if (!events.has(event)) {
                    events.set(event, []);
                }
                events.get(event).push(callback);
            },
            
            // Emitir evento
            emit: (event, data) => {
                if (events.has(event)) {
                    events.get(event).forEach(callback => {
                        callback(data);
                    });
                }
            },
            
            // Remover evento
            off: (event, callback) => {
                if (events.has(event)) {
                    const callbacks = events.get(event);
                    const index = callbacks.indexOf(callback);
                    if (index > -1) {
                        callbacks.splice(index, 1);
                    }
                }
            }
        };
    }
    
    /**
     * Sistema de configuración
     */
    createConfigSystem() {
        const config = new Map();
        
        return {
            // Establecer configuración
            set: (key, value) => {
                config.set(key, value);
            },
            
            // Obtener configuración
            get: (key, defaultValue = null) => {
                return config.has(key) ? config.get(key) : defaultValue;
            },
            
            // Cargar configuración desde JSON
            load: async (url) => {
                try {
                    const response = await fetch(url);
                    const data = await response.json();
                    
                    Object.keys(data).forEach(key => {
                        config.set(key, data[key]);
                    });
                } catch (error) {
                    console.error('Error cargando configuración:', error);
                }
            },
            
            // Guardar configuración a JSON
            save: () => {
                const data = {};
                config.forEach((value, key) => {
                    data[key] = value;
                });
                return data;
            }
        };
    }
    
    /**
     * Sistema de logging
     */
    createLoggingSystem() {
        return {
            // Log de información
            info: (message, data = null) => {
                console.log(`ℹ️ ${message}`, data);
            },
            
            // Log de advertencia
            warn: (message, data = null) => {
                console.warn(`⚠️ ${message}`, data);
            },
            
            // Log de error
            error: (message, data = null) => {
                console.error(`❌ ${message}`, data);
            },
            
            // Log de debug
            debug: (message, data = null) => {
                if (this.debugMode) {
                    console.log(`🐛 ${message}`, data);
                }
            },
            
            // Log de rendimiento
            performance: (name, startTime) => {
                const endTime = performance.now();
                console.log(`⚡ ${name}: ${(endTime - startTime).toFixed(2)}ms`);
            }
        };
    }
    
    /**
     * Limpiar recursos
     */
    dispose() {
        this.cache.clear();
        this.loaders.clear();
        this.optimizers.clear();
        this.debuggers.clear();
        
        console.log('🧹 Utilidades Three.js limpiadas');
    }
}

// Exportar para uso global
window.ThreeJSUtils = ThreeJSUtils; 
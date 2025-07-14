/**
 * Sistema VR Avanzado - Three.js
 * Soporte completo para VR/AR en el metaverso crypto 3D
 */

class VRSystem {
    constructor(renderer, camera) {
        this.renderer = renderer;
        this.camera = camera;
        this.session = null;
        this.frameData = null;
        this.controllers = new Map();
        this.hands = new Map();
        this.raycasters = new Map();
        this.hitTestSources = new Map();
        this.anchors = new Map();
        
        // Configuración VR
        this.config = {
            enableVR: true,
            enableAR: false,
            enableHandTracking: true,
            enableEyeTracking: false,
            enableHapticFeedback: true,
            enableSpatialAudio: true,
            enablePassthrough: false,
            enableFoveatedRendering: false,
            enableDynamicResolution: true,
            enableMotionPrediction: true
        };
        
        // Estados
        this.states = {
            isInitialized: false,
            isVRSupported: false,
            isARSupported: false,
            isSessionActive: false,
            isHandTrackingSupported: false,
            isEyeTrackingSupported: false,
            isHapticSupported: false
        };
        
        // Métricas
        this.metrics = {
            fps: 0,
            frameTime: 0,
            renderTime: 0,
            cpuTime: 0,
            gpuTime: 0,
            memoryUsage: 0,
            controllerCount: 0,
            handCount: 0
        };
        
        // Referencia espacial
        this.referenceSpace = null;
        this.viewerSpace = null;
        this.localSpace = null;
        
        // Callbacks
        this.callbacks = {
            onSessionStart: null,
            onSessionEnd: null,
            onControllerConnected: null,
            onControllerDisconnected: null,
            onHandConnected: null,
            onHandDisconnected: null,
            onHitTest: null,
            onAnchorCreated: null
        };
        
        console.log('🥽 Sistema VR inicializado');
    }
    
    /**
     * Inicializar sistema VR
     */
    async initialize() {
        try {
            // Verificar soporte VR
            await this.checkVRSupport();
            
            // Configurar renderer para VR
            this.setupRenderer();
            
            // Crear geometrías y materiales VR
            this.createVRAssets();
            
            // Configurar event listeners
            this.setupEventListeners();
            
            // Inicializar WebXR
            await this.initializeWebXR();
            
            this.states.isInitialized = true;
            console.log('✅ Sistema VR inicializado');
            
        } catch (error) {
            console.error('❌ Error inicializando sistema VR:', error);
            throw error;
        }
    }
    
    /**
     * Verificar soporte VR
     */
    async checkVRSupport() {
        // Verificar WebXR
        if ('xr' in navigator) {
            this.states.isVRSupported = await navigator.xr.isSessionSupported('immersive-vr');
            this.states.isARSupported = await navigator.xr.isSessionSupported('immersive-ar');
            
            console.log(`VR soportado: ${this.states.isVRSupported}`);
            console.log(`AR soportado: ${this.states.isARSupported}`);
        }
        
        // Verificar características adicionales
        if (this.states.isVRSupported) {
            const session = await navigator.xr.requestSession('immersive-vr', {
                optionalFeatures: [
                    'hand-tracking',
                    'eye-tracking',
                    'haptic-feedback',
                    'spatial-tracking',
                    'layers',
                    'dom-overlay'
                ]
            });
            
            this.states.isHandTrackingSupported = session.inputSources.some(source => 
                source.hand !== undefined
            );
            
            this.states.isEyeTrackingSupported = session.views.some(view => 
                view.eye !== undefined
            );
            
            this.states.isHapticSupported = session.inputSources.some(source => 
                source.hapticActuators && source.hapticActuators.length > 0
            );
            
            await session.end();
        }
    }
    
    /**
     * Configurar renderer para VR
     */
    setupRenderer() {
        if (this.states.isVRSupported) {
            this.renderer.xr.enabled = true;
            this.renderer.xr.setReferenceSpaceType('local');
            
            // Configurar características avanzadas
            if (this.config.enableFoveatedRendering) {
                this.renderer.xr.setFoveatedRendering(true);
            }
            
            if (this.config.enableDynamicResolution) {
                this.renderer.xr.setDynamicResolution(true);
            }
            
            console.log('✅ Renderer configurado para VR');
        }
    }
    
    /**
     * Crear assets VR
     */
    createVRAssets() {
        // Geometrías de controladores
        this.controllerGeometry = new THREE.BufferGeometry();
        this.controllerGeometry.setAttribute('position', new THREE.Float32BufferAttribute([
            // Geometría básica de controlador
            0, 0, 0, 0, 0, 0.1, 0, 0.02, 0.1,
            0, 0, 0, 0, 0.02, 0.1, 0, 0.02, 0
        ], 3));
        
        // Materiales de controladores
        this.controllerMaterial = new THREE.MeshBasicMaterial({
            color: 0x444444,
            transparent: true,
            opacity: 0.8
        });
        
        // Geometrías de manos
        this.handGeometry = new THREE.BufferGeometry();
        this.handGeometry.setAttribute('position', new THREE.Float32BufferAttribute([
            // Geometría básica de mano
            0, 0, 0, 0.01, 0, 0, 0, 0.01, 0
        ], 3));
        
        // Materiales de manos
        this.handMaterial = new THREE.MeshBasicMaterial({
            color: 0x888888,
            transparent: true,
            opacity: 0.6
        });
        
        // Raycasters para interacción
        this.raycasterGeometry = new THREE.BufferGeometry();
        this.raycasterGeometry.setAttribute('position', new THREE.Float32BufferAttribute([
            0, 0, 0, 0, 0, -10
        ], 3));
        
        this.raycasterMaterial = new THREE.LineBasicMaterial({
            color: 0x00ff00,
            transparent: true,
            opacity: 0.5
        });
        
        console.log('✅ Assets VR creados');
    }
    
    /**
     * Configurar event listeners
     */
    setupEventListeners() {
        // Eventos de sesión
        this.renderer.xr.addEventListener('sessionstart', this.onSessionStart.bind(this));
        this.renderer.xr.addEventListener('sessionend', this.onSessionEnd.bind(this));
        
        // Eventos de entrada
        this.renderer.xr.addEventListener('inputsourceschange', this.onInputSourcesChange.bind(this));
        
        // Eventos de referencia espacial
        this.renderer.xr.addEventListener('referenceSpaceChange', this.onReferenceSpaceChange.bind(this));
        
        console.log('✅ Event listeners VR configurados');
    }
    
    /**
     * Inicializar WebXR
     */
    async initializeWebXR() {
        if (!this.states.isVRSupported) {
            console.warn('⚠️ WebXR no soportado');
            return;
        }
        
        // Crear frame data
        this.frameData = new XRFrameData();
        
        console.log('✅ WebXR inicializado');
    }
    
    /**
     * Iniciar sesión VR
     */
    async startVRSession(options = {}) {
        if (!this.states.isVRSupported) {
            console.error('❌ VR no soportado');
            return false;
        }
        
        try {
            const sessionOptions = {
                optionalFeatures: [
                    'hand-tracking',
                    'eye-tracking',
                    'haptic-feedback',
                    'spatial-tracking',
                    'layers',
                    'dom-overlay'
                ],
                ...options
            };
            
            this.session = await navigator.xr.requestSession('immersive-vr', sessionOptions);
            
            // Configurar sesión
            this.session.addEventListener('end', this.onSessionEnd.bind(this));
            this.session.addEventListener('inputsourceschange', this.onInputSourcesChange.bind(this));
            
            // Configurar referencias espaciales
            this.referenceSpace = await this.session.requestReferenceSpace('local');
            this.viewerSpace = await this.session.requestReferenceSpace('viewer');
            this.localSpace = await this.session.requestReferenceSpace('local');
            
            // Iniciar render loop
            this.session.requestAnimationFrame(this.onVRFrame.bind(this));
            
            this.states.isSessionActive = true;
            
            if (this.callbacks.onSessionStart) {
                this.callbacks.onSessionStart(this.session);
            }
            
            console.log('✅ Sesión VR iniciada');
            return true;
            
        } catch (error) {
            console.error('❌ Error iniciando sesión VR:', error);
            return false;
        }
    }
    
    /**
     * Detener sesión VR
     */
    async stopVRSession() {
        if (this.session) {
            await this.session.end();
            this.session = null;
            this.states.isSessionActive = false;
            
            if (this.callbacks.onSessionEnd) {
                this.callbacks.onSessionEnd();
            }
            
            console.log('⏹️ Sesión VR detenida');
        }
    }
    
    /**
     * Frame loop de VR
     */
    onVRFrame(time, frame) {
        if (!this.session) return;
        
        const startTime = performance.now();
        
        // Actualizar frame data
        frame.getViewerPose(this.referenceSpace, this.frameData);
        
        // Actualizar controladores
        this.updateControllers(frame);
        
        // Actualizar manos
        this.updateHands(frame);
        
        // Actualizar raycasters
        this.updateRaycasters(frame);
        
        // Renderizar
        this.renderVRFrame(frame);
        
        // Actualizar métricas
        this.updateMetrics(performance.now() - startTime);
        
        // Continuar loop
        this.session.requestAnimationFrame(this.onVRFrame.bind(this));
    }
    
    /**
     * Actualizar controladores
     */
    updateControllers(frame) {
        frame.session.inputSources.forEach(inputSource => {
            if (inputSource.hand === undefined) { // Es un controlador
                const controllerId = inputSource.handedness + '_' + inputSource.profiles[0];
                
                if (!this.controllers.has(controllerId)) {
                    this.createController(inputSource);
                }
                
                const controller = this.controllers.get(controllerId);
                this.updateControllerPose(controller, frame, inputSource);
            }
        });
    }
    
    /**
     * Crear controlador
     */
    createController(inputSource) {
        const controllerId = inputSource.handedness + '_' + inputSource.profiles[0];
        
        // Crear mesh del controlador
        const controllerMesh = new THREE.Mesh(this.controllerGeometry, this.controllerMaterial);
        controllerMesh.name = `controller_${controllerId}`;
        
        // Crear raycaster
        const raycaster = new THREE.Line(this.raycasterGeometry, this.raycasterMaterial);
        raycaster.name = `raycaster_${controllerId}`;
        controllerMesh.add(raycaster);
        
        // Crear objeto de controlador
        const controller = {
            id: controllerId,
            inputSource: inputSource,
            mesh: controllerMesh,
            raycaster: raycaster,
            pose: null,
            buttons: new Map(),
            axes: new Map(),
            hapticActuators: inputSource.hapticActuators || []
        };
        
        this.controllers.set(controllerId, controller);
        this.scene.add(controllerMesh);
        
        this.metrics.controllerCount++;
        
        if (this.callbacks.onControllerConnected) {
            this.callbacks.onControllerConnected(controller);
        }
        
        console.log(`🎮 Controlador conectado: ${controllerId}`);
    }
    
    /**
     * Actualizar pose del controlador
     */
    updateControllerPose(controller, frame, inputSource) {
        const pose = frame.getPose(inputSource.gripSpace, this.referenceSpace);
        
        if (pose) {
            controller.pose = pose;
            
            // Actualizar posición y rotación
            controller.mesh.position.set(
                pose.transform.position.x,
                pose.transform.position.y,
                pose.transform.position.z
            );
            
            controller.mesh.quaternion.set(
                pose.transform.orientation.x,
                pose.transform.orientation.y,
                pose.transform.orientation.z,
                pose.transform.orientation.w
            );
            
            // Actualizar botones
            inputSource.gamepad.buttons.forEach((button, index) => {
                controller.buttons.set(index, {
                    pressed: button.pressed,
                    touched: button.touched,
                    value: button.value
                });
            });
            
            // Actualizar ejes
            inputSource.gamepad.axes.forEach((axis, index) => {
                controller.axes.set(index, axis);
            });
        }
    }
    
    /**
     * Actualizar manos
     */
    updateHands(frame) {
        if (!this.states.isHandTrackingSupported) return;
        
        frame.session.inputSources.forEach(inputSource => {
            if (inputSource.hand !== undefined) { // Es una mano
                const handId = inputSource.handedness + '_hand';
                
                if (!this.hands.has(handId)) {
                    this.createHand(inputSource);
                }
                
                const hand = this.hands.get(handId);
                this.updateHandPose(hand, frame, inputSource);
            }
        });
    }
    
    /**
     * Crear mano
     */
    createHand(inputSource) {
        const handId = inputSource.handedness + '_hand';
        
        // Crear mesh de la mano
        const handMesh = new THREE.Mesh(this.handGeometry, this.handMaterial);
        handMesh.name = `hand_${handId}`;
        
        // Crear joints de la mano
        const joints = new Map();
        for (let i = 0; i < 25; i++) { // 25 joints por mano
            const jointMesh = new THREE.Mesh(
                new THREE.SphereGeometry(0.005, 8, 8),
                new THREE.MeshBasicMaterial({ color: 0x00ff00 })
            );
            joints.set(i, jointMesh);
            handMesh.add(jointMesh);
        }
        
        // Crear objeto de mano
        const hand = {
            id: handId,
            inputSource: inputSource,
            mesh: handMesh,
            joints: joints,
            pose: null
        };
        
        this.hands.set(handId, hand);
        this.scene.add(handMesh);
        
        this.metrics.handCount++;
        
        if (this.callbacks.onHandConnected) {
            this.callbacks.onHandConnected(hand);
        }
        
        console.log(`✋ Mano conectada: ${handId}`);
    }
    
    /**
     * Actualizar pose de la mano
     */
    updateHandPose(hand, frame, inputSource) {
        const pose = frame.getPose(inputSource.targetRaySpace, this.referenceSpace);
        
        if (pose) {
            hand.pose = pose;
            
            // Actualizar posición y rotación de la mano
            hand.mesh.position.set(
                pose.transform.position.x,
                pose.transform.position.y,
                pose.transform.position.z
            );
            
            hand.mesh.quaternion.set(
                pose.transform.orientation.x,
                pose.transform.orientation.y,
                pose.transform.orientation.z,
                pose.transform.orientation.w
            );
            
            // Actualizar joints
            if (inputSource.hand) {
                inputSource.hand.forEach((joint, index) => {
                    const jointMesh = hand.joints.get(index);
                    if (jointMesh && joint.radius) {
                        jointMesh.position.set(
                            joint.position.x,
                            joint.position.y,
                            joint.position.z
                        );
                        jointMesh.scale.setScalar(joint.radius);
                    }
                });
            }
        }
    }
    
    /**
     * Actualizar raycasters
     */
    updateRaycasters(frame) {
        this.controllers.forEach(controller => {
            if (controller.pose) {
                // Actualizar raycaster
                const raycaster = controller.raycaster;
                const direction = new THREE.Vector3(0, 0, -1);
                direction.applyQuaternion(controller.mesh.quaternion);
                
                raycaster.geometry.setAttribute('position', new THREE.Float32BufferAttribute([
                    0, 0, 0,
                    direction.x * 10, direction.y * 10, direction.z * 10
                ], 3));
                
                // Realizar hit test
                this.performHitTest(controller, frame);
            }
        });
    }
    
    /**
     * Realizar hit test
     */
    async performHitTest(controller, frame) {
        if (!this.hitTestSources.has(controller.id)) {
            try {
                const hitTestSource = await frame.session.requestHitTestSource({
                    space: this.viewerSpace
                });
                this.hitTestSources.set(controller.id, hitTestSource);
            } catch (error) {
                console.warn('Hit test no disponible');
                return;
            }
        }
        
        const hitTestSource = this.hitTestSources.get(controller.id);
        const hitTestResults = frame.getHitTestResults(hitTestSource);
        
        if (hitTestResults.length > 0) {
            const hit = hitTestResults[0];
            
            if (this.callbacks.onHitTest) {
                this.callbacks.onHitTest(controller, hit);
            }
        }
    }
    
    /**
     * Renderizar frame VR
     */
    renderVRFrame(frame) {
        const startTime = performance.now();
        
        // Renderizar para cada vista
        for (const view of frame.views) {
            const viewport = frame.session.renderState.baseLayer.getViewport(view);
            
            this.renderer.setViewport(viewport.x, viewport.y, viewport.width, viewport.height);
            
            // Configurar cámara para la vista
            this.camera.matrix.fromArray(view.transform.matrix);
            this.camera.projectionMatrix.fromArray(view.projectionMatrix);
            this.camera.updateMatrixWorld();
            
            // Renderizar escena
            this.renderer.render(this.scene, this.camera);
        }
        
        this.metrics.renderTime = performance.now() - startTime;
    }
    
    /**
     * Crear anchor espacial
     */
    async createSpatialAnchor(position, rotation) {
        if (!this.session) return null;
        
        try {
            const anchor = await this.session.createAnchor(
                new XRRigidTransform(position, rotation),
                this.referenceSpace
            );
            
            const anchorId = `anchor_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            this.anchors.set(anchorId, anchor);
            
            if (this.callbacks.onAnchorCreated) {
                this.callbacks.onAnchorCreated(anchor, anchorId);
            }
            
            console.log(`📍 Anchor espacial creado: ${anchorId}`);
            return anchor;
            
        } catch (error) {
            console.error('❌ Error creando anchor:', error);
            return null;
        }
    }
    
    /**
     * Activar feedback háptico
     */
    async activateHapticFeedback(controllerId, duration = 100, frequency = 1.0, amplitude = 1.0) {
        const controller = this.controllers.get(controllerId);
        if (!controller || !this.states.isHapticSupported) return;
        
        try {
            for (const actuator of controller.hapticActuators) {
                await actuator.pulse(amplitude, duration);
            }
        } catch (error) {
            console.warn('Feedback háptico no disponible');
        }
    }
    
    /**
     * Event handlers
     */
    onSessionStart(event) {
        console.log('🎬 Sesión VR iniciada');
    }
    
    onSessionEnd(event) {
        console.log('⏹️ Sesión VR terminada');
        this.states.isSessionActive = false;
    }
    
    onInputSourcesChange(event) {
        event.added.forEach(inputSource => {
            if (inputSource.hand === undefined) {
                console.log(`🎮 Controlador añadido: ${inputSource.handedness}`);
            } else {
                console.log(`✋ Mano añadida: ${inputSource.handedness}`);
            }
        });
        
        event.removed.forEach(inputSource => {
            if (inputSource.hand === undefined) {
                console.log(`🎮 Controlador removido: ${inputSource.handedness}`);
            } else {
                console.log(`✋ Mano removida: ${inputSource.handedness}`);
            }
        });
    }
    
    onReferenceSpaceChange(event) {
        console.log('🔄 Referencia espacial cambiada');
    }
    
    /**
     * Actualizar métricas
     */
    updateMetrics(frameTime) {
        this.metrics.frameTime = frameTime;
        this.metrics.fps = 1000 / frameTime;
        this.metrics.cpuTime = frameTime - this.metrics.renderTime;
        this.metrics.gpuTime = this.metrics.renderTime;
        this.metrics.memoryUsage = this.calculateMemoryUsage();
    }
    
    /**
     * Calcular uso de memoria
     */
    calculateMemoryUsage() {
        let total = 0;
        
        // Memoria de controladores
        this.controllers.forEach(controller => {
            total += controller.mesh.geometry.attributes.position.count * 4;
        });
        
        // Memoria de manos
        this.hands.forEach(hand => {
            total += hand.mesh.geometry.attributes.position.count * 4;
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
     * Obtener controladores
     */
    getControllers() {
        return this.controllers;
    }
    
    /**
     * Obtener manos
     */
    getHands() {
        return this.hands;
    }
    
    /**
     * Configurar callback
     */
    setCallback(name, callback) {
        if (this.callbacks.hasOwnProperty(name)) {
            this.callbacks[name] = callback;
        }
    }
    
    /**
     * Limpiar recursos
     */
    dispose() {
        // Detener sesión
        if (this.session) {
            this.stopVRSession();
        }
        
        // Limpiar controladores
        this.controllers.forEach(controller => {
            this.scene.remove(controller.mesh);
            controller.mesh.geometry.dispose();
            controller.mesh.material.dispose();
        });
        this.controllers.clear();
        
        // Limpiar manos
        this.hands.forEach(hand => {
            this.scene.remove(hand.mesh);
            hand.mesh.geometry.dispose();
            hand.mesh.material.dispose();
        });
        this.hands.clear();
        
        // Limpiar geometrías y materiales
        this.controllerGeometry.dispose();
        this.controllerMaterial.dispose();
        this.handGeometry.dispose();
        this.handMaterial.dispose();
        this.raycasterGeometry.dispose();
        this.raycasterMaterial.dispose();
        
        console.log('🧹 Sistema VR limpiado');
    }
}

// Exportar para uso global
window.VRSystem = VRSystem; 
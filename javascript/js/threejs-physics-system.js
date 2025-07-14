/**
 * Sistema de Física Avanzado - Three.js
 * Física realista para el metaverso crypto 3D
 */

class PhysicsSystem {
    constructor(scene) {
        this.scene = scene;
        this.world = null;
        this.bodies = new Map();
        this.constraints = new Map();
        this.vehicles = new Map();
        this.fluids = new Map();
        this.cloth = new Map();
        this.softBodies = new Map();
        
        // Configuración de física
        this.config = {
            gravity: { x: 0, y: -9.81, z: 0 },
            timeStep: 1/60,
            maxSubSteps: 3,
            solverIterations: 10,
            broadphase: 'sweep',
            debug: false
        };
        
        // Estados
        this.states = {
            isInitialized: false,
            isRunning: false,
            isPaused: false
        };
        
        // Métricas
        this.metrics = {
            bodiesCount: 0,
            constraintsCount: 0,
            vehiclesCount: 0,
            fluidsCount: 0,
            clothCount: 0,
            softBodiesCount: 0,
            fps: 0,
            memoryUsage: 0
        };
        
        console.log('🔧 Sistema de Física inicializado');
    }
    
    /**
     * Inicializar sistema de física
     */
    async initialize() {
        try {
            // Crear mundo de física
            this.world = new CANNON.World();
            this.world.gravity.set(this.config.gravity.x, this.config.gravity.y, this.config.gravity.z);
            this.world.broadphase = new CANNON.SAPBroadphase(this.world);
            this.world.solver.iterations = this.config.solverIterations;
            this.world.defaultContactMaterial.friction = 0.3;
            this.world.defaultContactMaterial.restitution = 0.3;
            
            // Configurar materiales de contacto
            this.setupContactMaterials();
            
            // Crear suelo por defecto
            this.createGround();
            
            this.states.isInitialized = true;
            console.log('✅ Sistema de Física inicializado');
            
        } catch (error) {
            console.error('❌ Error inicializando sistema de física:', error);
            throw error;
        }
    }
    
    /**
     * Configurar materiales de contacto
     */
    setupContactMaterials() {
        // Materiales básicos
        this.materials = {
            ground: new CANNON.Material('ground'),
            player: new CANNON.Material('player'),
            vehicle: new CANNON.Material('vehicle'),
            fluid: new CANNON.Material('fluid'),
            cloth: new CANNON.Material('cloth'),
            soft: new CANNON.Material('soft')
        };
        
        // Contactos entre materiales
        const groundPlayerContact = new CANNON.ContactMaterial(
            this.materials.ground,
            this.materials.player,
            {
                friction: 0.5,
                restitution: 0.3
            }
        );
        
        const groundVehicleContact = new CANNON.ContactMaterial(
            this.materials.ground,
            this.materials.vehicle,
            {
                friction: 0.8,
                restitution: 0.1
            }
        );
        
        const fluidContact = new CANNON.ContactMaterial(
            this.materials.fluid,
            this.materials.player,
            {
                friction: 0.1,
                restitution: 0.0
            }
        );
        
        this.world.addContactMaterial(groundPlayerContact);
        this.world.addContactMaterial(groundVehicleContact);
        this.world.addContactMaterial(fluidContact);
    }
    
    /**
     * Crear suelo
     */
    createGround() {
        const groundShape = new CANNON.Plane();
        const groundBody = new CANNON.Body({
            mass: 0,
            shape: groundShape,
            material: this.materials.ground
        });
        groundBody.quaternion.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), -Math.PI / 2);
        
        this.world.addBody(groundBody);
        this.bodies.set('ground', groundBody);
        
        // Crear geometría visual del suelo
        const groundGeometry = new THREE.PlaneGeometry(1000, 1000);
        const groundMaterial = new THREE.MeshLambertMaterial({ 
            color: 0x3a5f3a,
            transparent: true,
            opacity: 0.8
        });
        const groundMesh = new THREE.Mesh(groundGeometry, groundMaterial);
        groundMesh.rotation.x = -Math.PI / 2;
        groundMesh.receiveShadow = true;
        
        this.scene.add(groundMesh);
        groundMesh.userData.physicsBody = groundBody;
    }
    
    /**
     * Crear cuerpo rígido
     */
    createRigidBody(options = {}) {
        const {
            type = 'box',
            mass = 1,
            position = { x: 0, y: 0, z: 0 },
            rotation = { x: 0, y: 0, z: 0 },
            size = { x: 1, y: 1, z: 1 },
            material = this.materials.player,
            geometry = null,
            mesh = null,
            id = null
        } = options;
        
        let shape;
        
        switch (type) {
            case 'box':
                shape = new CANNON.Box(new CANNON.Vec3(size.x/2, size.y/2, size.z/2));
                break;
            case 'sphere':
                shape = new CANNON.Sphere(size.x/2);
                break;
            case 'cylinder':
                shape = new CANNON.Cylinder(size.x/2, size.x/2, size.y, 8);
                break;
            case 'plane':
                shape = new CANNON.Plane();
                break;
            case 'trimesh':
                if (geometry) {
                    shape = this.createTrimeshShape(geometry);
                }
                break;
            default:
                shape = new CANNON.Box(new CANNON.Vec3(0.5, 0.5, 0.5));
        }
        
        const body = new CANNON.Body({
            mass: mass,
            shape: shape,
            position: new CANNON.Vec3(position.x, position.y, position.z),
            quaternion: new CANNON.Quaternion().setFromEuler(rotation.x, rotation.y, rotation.z),
            material: material
        });
        
        this.world.addBody(body);
        
        const bodyId = id || `body_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        this.bodies.set(bodyId, body);
        
        // Crear mesh si no se proporciona
        if (!mesh) {
            mesh = this.createMeshForBody(body, type, size, geometry);
        }
        
        mesh.userData.physicsBody = body;
        mesh.userData.physicsId = bodyId;
        
        this.metrics.bodiesCount++;
        
        return { body, mesh, id: bodyId };
    }
    
    /**
     * Crear forma trimesh
     */
    createTrimeshShape(geometry) {
        const vertices = geometry.attributes.position.array;
        const indices = geometry.index ? geometry.index.array : null;
        
        const shape = new CANNON.Trimesh(vertices, indices);
        return shape;
    }
    
    /**
     * Crear mesh para cuerpo físico
     */
    createMeshForBody(body, type, size, geometry) {
        let mesh;
        
        if (geometry) {
            const material = new THREE.MeshLambertMaterial({ 
                color: 0x888888,
                transparent: true,
                opacity: 0.8
            });
            mesh = new THREE.Mesh(geometry, material);
        } else {
            switch (type) {
                case 'box':
                    const boxGeometry = new THREE.BoxGeometry(size.x, size.y, size.z);
                    const boxMaterial = new THREE.MeshLambertMaterial({ color: 0x888888 });
                    mesh = new THREE.Mesh(boxGeometry, boxMaterial);
                    break;
                case 'sphere':
                    const sphereGeometry = new THREE.SphereGeometry(size.x/2, 16, 16);
                    const sphereMaterial = new THREE.MeshLambertMaterial({ color: 0x888888 });
                    mesh = new THREE.Mesh(sphereGeometry, sphereMaterial);
                    break;
                case 'cylinder':
                    const cylinderGeometry = new THREE.CylinderGeometry(size.x/2, size.x/2, size.y, 8);
                    const cylinderMaterial = new THREE.MeshLambertMaterial({ color: 0x888888 });
                    mesh = new THREE.Mesh(cylinderGeometry, cylinderMaterial);
                    break;
                default:
                    const defaultGeometry = new THREE.BoxGeometry(1, 1, 1);
                    const defaultMaterial = new THREE.MeshLambertMaterial({ color: 0x888888 });
                    mesh = new THREE.Mesh(defaultGeometry, defaultMaterial);
            }
        }
        
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        
        this.scene.add(mesh);
        return mesh;
    }
    
    /**
     * Crear vehículo
     */
    createVehicle(options = {}) {
        const {
            chassisSize = { x: 2, y: 0.5, z: 4 },
            wheelRadius = 0.4,
            wheelWidth = 0.3,
            mass = 1500,
            position = { x: 0, y: 2, z: 0 },
            id = null
        } = options;
        
        // Crear chasis
        const chassisShape = new CANNON.Box(new CANNON.Vec3(chassisSize.x/2, chassisSize.y/2, chassisSize.z/2));
        const chassisBody = new CANNON.Body({
            mass: mass,
            shape: chassisShape,
            position: new CANNON.Vec3(position.x, position.y, position.z),
            material: this.materials.vehicle
        });
        
        this.world.addBody(chassisBody);
        
        // Crear vehículo
        const vehicle = new CANNON.RaycastVehicle({
            chassisBody: chassisBody,
            indexRightAxis: 0,
            indexForwardAxis: 2,
            indexUpAxis: 1
        });
        
        // Configurar ruedas
        const wheelOptions = {
            radius: wheelRadius,
            directionLocal: new CANNON.Vec3(0, -1, 0),
            suspensionStiffness: 30,
            suspensionRestLength: 0.3,
            frictionSlip: 1.4,
            dampingRelaxation: 2.3,
            dampingCompression: 4.4,
            maxSuspensionForce: 100000,
            rollInfluence: 0.01,
            axleLocal: new CANNON.Vec3(1, 0, 0),
            chassisConnectionPointLocal: new CANNON.Vec3(1, 0, 1),
            maxSuspensionTravel: 0.3,
            customSlidingRotationalSpeed: -30,
            useCustomSlidingRotationalSpeed: true
        };
        
        // Añadir ruedas
        const wheelPositions = [
            { x: -chassisSize.x/2, y: 0, z: chassisSize.z/2 },
            { x: chassisSize.x/2, y: 0, z: chassisSize.z/2 },
            { x: -chassisSize.x/2, y: 0, z: -chassisSize.z/2 },
            { x: chassisSize.x/2, y: 0, z: -chassisSize.z/2 }
        ];
        
        wheelPositions.forEach(position => {
            wheelOptions.chassisConnectionPointLocal.set(position.x, position.y, position.z);
            vehicle.addWheel(wheelOptions);
        });
        
        vehicle.addToWorld(this.world);
        
        // Crear mesh del vehículo
        const chassisGeometry = new THREE.BoxGeometry(chassisSize.x, chassisSize.y, chassisSize.z);
        const chassisMaterial = new THREE.MeshLambertMaterial({ color: 0x4444ff });
        const chassisMesh = new THREE.Mesh(chassisGeometry, chassisMaterial);
        chassisMesh.castShadow = true;
        this.scene.add(chassisMesh);
        
        // Crear meshes de las ruedas
        const wheelMeshes = [];
        const wheelGeometry = new THREE.CylinderGeometry(wheelRadius, wheelRadius, wheelWidth, 8);
        const wheelMaterial = new THREE.MeshLambertMaterial({ color: 0x333333 });
        
        for (let i = 0; i < 4; i++) {
            const wheelMesh = new THREE.Mesh(wheelGeometry, wheelMaterial);
            wheelMesh.castShadow = true;
            this.scene.add(wheelMesh);
            wheelMeshes.push(wheelMesh);
        }
        
        const vehicleId = id || `vehicle_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        this.vehicles.set(vehicleId, {
            vehicle,
            chassisBody,
            chassisMesh,
            wheelMeshes,
            controls: {
                engineForce: 0,
                brakeForce: 0,
                steering: 0
            }
        });
        
        this.metrics.vehiclesCount++;
        
        return { vehicle, chassisBody, chassisMesh, wheelMeshes, id: vehicleId };
    }
    
    /**
     * Crear fluido
     */
    createFluid(options = {}) {
        const {
            size = { x: 10, y: 2, z: 10 },
            position = { x: 0, y: 0, z: 0 },
            resolution = 20,
            viscosity = 0.1,
            id = null
        } = options;
        
        // Crear partículas de fluido
        const particles = [];
        const particleRadius = 0.1;
        const particleMass = 1;
        
        for (let x = 0; x < resolution; x++) {
            for (let y = 0; y < resolution; y++) {
                for (let z = 0; z < resolution; z++) {
                    const particleShape = new CANNON.Sphere(particleRadius);
                    const particleBody = new CANNON.Body({
                        mass: particleMass,
                        shape: particleShape,
                        position: new CANNON.Vec3(
                            position.x + (x - resolution/2) * particleRadius * 2,
                            position.y + (y - resolution/2) * particleRadius * 2,
                            position.z + (z - resolution/2) * particleRadius * 2
                        ),
                        material: this.materials.fluid
                    });
                    
                    this.world.addBody(particleBody);
                    particles.push(particleBody);
                    
                    // Crear mesh de partícula
                    const particleGeometry = new THREE.SphereGeometry(particleRadius, 8, 8);
                    const particleMaterial = new THREE.MeshLambertMaterial({ 
                        color: 0x0088ff,
                        transparent: true,
                        opacity: 0.7
                    });
                    const particleMesh = new THREE.Mesh(particleGeometry, particleMaterial);
                    particleMesh.castShadow = true;
                    this.scene.add(particleMesh);
                    particleMesh.userData.physicsBody = particleBody;
                }
            }
        }
        
        const fluidId = id || `fluid_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        this.fluids.set(fluidId, {
            particles,
            viscosity,
            size,
            position
        });
        
        this.metrics.fluidsCount++;
        
        return { particles, id: fluidId };
    }
    
    /**
     * Crear tela
     */
    createCloth(options = {}) {
        const {
            size = { x: 5, y: 5 },
            resolution = { x: 20, y: 20 },
            position = { x: 0, y: 5, z: 0 },
            mass = 1,
            stiffness = 0.9,
            damping = 0.1,
            id = null
        } = options;
        
        // Crear partículas de tela
        const particles = [];
        const constraints = [];
        
        for (let x = 0; x < resolution.x; x++) {
            particles[x] = [];
            for (let y = 0; y < resolution.y; y++) {
                const particleShape = new CANNON.Sphere(0.05);
                const particleBody = new CANNON.Body({
                    mass: mass,
                    shape: particleShape,
                    position: new CANNON.Vec3(
                        position.x + (x - resolution.x/2) * size.x / resolution.x,
                        position.y + (y - resolution.y/2) * size.y / resolution.y,
                        position.z
                    ),
                    material: this.materials.cloth
                });
                
                // Fijar esquinas
                if ((x === 0 && y === 0) || (x === resolution.x-1 && y === 0)) {
                    particleBody.mass = 0;
                }
                
                this.world.addBody(particleBody);
                particles[x][y] = particleBody;
                
                // Crear mesh de partícula
                const particleGeometry = new THREE.SphereGeometry(0.05, 8, 8);
                const particleMaterial = new THREE.MeshLambertMaterial({ 
                    color: 0xffaa00,
                    transparent: true,
                    opacity: 0.8
                });
                const particleMesh = new THREE.Mesh(particleGeometry, particleMaterial);
                particleMesh.castShadow = true;
                this.scene.add(particleMesh);
                particleMesh.userData.physicsBody = particleBody;
            }
        }
        
        // Crear restricciones entre partículas
        for (let x = 0; x < resolution.x; x++) {
            for (let y = 0; y < resolution.y; y++) {
                if (x < resolution.x - 1) {
                    const constraint = new CANNON.DistanceConstraint(
                        particles[x][y],
                        particles[x + 1][y],
                        size.x / resolution.x
                    );
                    this.world.addConstraint(constraint);
                    constraints.push(constraint);
                }
                
                if (y < resolution.y - 1) {
                    const constraint = new CANNON.DistanceConstraint(
                        particles[x][y],
                        particles[x][y + 1],
                        size.y / resolution.y
                    );
                    this.world.addConstraint(constraint);
                    constraints.push(constraint);
                }
            }
        }
        
        const clothId = id || `cloth_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        this.cloth.set(clothId, {
            particles,
            constraints,
            size,
            resolution,
            position
        });
        
        this.metrics.clothCount++;
        
        return { particles, constraints, id: clothId };
    }
    
    /**
     * Crear cuerpo blando
     */
    createSoftBody(options = {}) {
        const {
            geometry,
            mass = 1,
            stiffness = 0.9,
            damping = 0.1,
            position = { x: 0, y: 0, z: 0 },
            id = null
        } = options;
        
        if (!geometry) {
            throw new Error('Geometry required for soft body');
        }
        
        // Crear partículas basadas en vértices de la geometría
        const vertices = geometry.attributes.position.array;
        const particles = [];
        
        for (let i = 0; i < vertices.length; i += 3) {
            const particleShape = new CANNON.Sphere(0.1);
            const particleBody = new CANNON.Body({
                mass: mass,
                shape: particleShape,
                position: new CANNON.Vec3(
                    position.x + vertices[i],
                    position.y + vertices[i + 1],
                    position.z + vertices[i + 2]
                ),
                material: this.materials.soft
            });
            
            this.world.addBody(particleBody);
            particles.push(particleBody);
        }
        
        // Crear restricciones entre partículas cercanas
        const constraints = [];
        const maxDistance = 0.5;
        
        for (let i = 0; i < particles.length; i++) {
            for (let j = i + 1; j < particles.length; j++) {
                const distance = particles[i].position.distanceTo(particles[j].position);
                if (distance < maxDistance) {
                    const constraint = new CANNON.DistanceConstraint(
                        particles[i],
                        particles[j],
                        distance
                    );
                    this.world.addConstraint(constraint);
                    constraints.push(constraint);
                }
            }
        }
        
        const softBodyId = id || `softbody_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        this.softBodies.set(softBodyId, {
            particles,
            constraints,
            geometry,
            position
        });
        
        this.metrics.softBodiesCount++;
        
        return { particles, constraints, id: softBodyId };
    }
    
    /**
     * Aplicar fuerza a un cuerpo
     */
    applyForce(bodyId, force, point = null) {
        const body = this.bodies.get(bodyId);
        if (body) {
            if (point) {
                body.applyForce(force, point);
            } else {
                body.applyForce(force, body.position);
            }
        }
    }
    
    /**
     * Aplicar impulso a un cuerpo
     */
    applyImpulse(bodyId, impulse, point = null) {
        const body = this.bodies.get(bodyId);
        if (body) {
            if (point) {
                body.applyImpulse(impulse, point);
            } else {
                body.applyImpulse(impulse, body.position);
            }
        }
    }
    
    /**
     * Controlar vehículo
     */
    controlVehicle(vehicleId, controls) {
        const vehicleData = this.vehicles.get(vehicleId);
        if (vehicleData) {
            const { vehicle } = vehicleData;
            
            // Aplicar controles
            vehicle.setSteeringValue(controls.steering, 0);
            vehicle.setSteeringValue(controls.steering, 1);
            vehicle.setSteeringValue(controls.steering, 2);
            vehicle.setSteeringValue(controls.steering, 3);
            
            vehicle.applyEngineForce(controls.engineForce, 0);
            vehicle.applyEngineForce(controls.engineForce, 1);
            vehicle.applyEngineForce(controls.engineForce, 2);
            vehicle.applyEngineForce(controls.engineForce, 3);
            
            vehicle.setBrake(controls.brakeForce, 0);
            vehicle.setBrake(controls.brakeForce, 1);
            vehicle.setBrake(controls.brakeForce, 2);
            vehicle.setBrake(controls.brakeForce, 3);
            
            vehicleData.controls = controls;
        }
    }
    
    /**
     * Actualizar sistema de física
     */
    update(deltaTime) {
        if (!this.states.isInitialized || this.states.isPaused) return;
        
        // Actualizar mundo de física
        this.world.step(this.config.timeStep, deltaTime, this.config.maxSubSteps);
        
        // Sincronizar meshes con cuerpos físicos
        this.syncMeshesWithBodies();
        
        // Actualizar métricas
        this.updateMetrics();
        
        this.states.isRunning = true;
    }
    
    /**
     * Sincronizar meshes con cuerpos físicos
     */
    syncMeshesWithBodies() {
        // Sincronizar cuerpos rígidos
        this.bodies.forEach((body, id) => {
            const mesh = this.scene.children.find(child => 
                child.userData.physicsId === id
            );
            
            if (mesh) {
                mesh.position.copy(body.position);
                mesh.quaternion.copy(body.quaternion);
            }
        });
        
        // Sincronizar vehículos
        this.vehicles.forEach((vehicleData, id) => {
            const { vehicle, chassisMesh, wheelMeshes } = vehicleData;
            
            // Sincronizar chasis
            chassisMesh.position.copy(vehicle.chassisBody.position);
            chassisMesh.quaternion.copy(vehicle.chassisBody.quaternion);
            
            // Sincronizar ruedas
            vehicle.wheelBodies.forEach((wheelBody, index) => {
                if (wheelMeshes[index]) {
                    wheelMeshes[index].position.copy(wheelBody.position);
                    wheelMeshes[index].quaternion.copy(wheelBody.quaternion);
                }
            });
        });
        
        // Sincronizar fluidos
        this.fluids.forEach((fluidData, id) => {
            fluidData.particles.forEach((particle, index) => {
                const mesh = this.scene.children.find(child => 
                    child.userData.physicsBody === particle
                );
                
                if (mesh) {
                    mesh.position.copy(particle.position);
                    mesh.quaternion.copy(particle.quaternion);
                }
            });
        });
        
        // Sincronizar tela
        this.cloth.forEach((clothData, id) => {
            clothData.particles.forEach(row => {
                row.forEach(particle => {
                    const mesh = this.scene.children.find(child => 
                        child.userData.physicsBody === particle
                    );
                    
                    if (mesh) {
                        mesh.position.copy(particle.position);
                        mesh.quaternion.copy(particle.quaternion);
                    }
                });
            });
        });
        
        // Sincronizar cuerpos blandos
        this.softBodies.forEach((softBodyData, id) => {
            softBodyData.particles.forEach(particle => {
                const mesh = this.scene.children.find(child => 
                    child.userData.physicsBody === particle
                );
                
                if (mesh) {
                    mesh.position.copy(particle.position);
                    mesh.quaternion.copy(particle.quaternion);
                }
            });
        });
    }
    
    /**
     * Actualizar métricas
     */
    updateMetrics() {
        this.metrics.bodiesCount = this.bodies.size;
        this.metrics.constraintsCount = this.constraints.size;
        this.metrics.vehiclesCount = this.vehicles.size;
        this.metrics.fluidsCount = this.fluids.size;
        this.metrics.clothCount = this.cloth.size;
        this.metrics.softBodiesCount = this.softBodies.size;
        this.metrics.fps = 1 / this.world.dt;
        this.metrics.memoryUsage = this.world.bodies.length * 100; // Estimación
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
     * Pausar/Reanudar física
     */
    setPaused(paused) {
        this.states.isPaused = paused;
    }
    
    /**
     * Limpiar recursos
     */
    dispose() {
        // Limpiar cuerpos
        this.bodies.forEach(body => {
            this.world.removeBody(body);
        });
        this.bodies.clear();
        
        // Limpiar vehículos
        this.vehicles.forEach(vehicleData => {
            this.world.removeBody(vehicleData.chassisBody);
            vehicleData.vehicle.removeFromWorld(this.world);
        });
        this.vehicles.clear();
        
        // Limpiar fluidos
        this.fluids.forEach(fluidData => {
            fluidData.particles.forEach(particle => {
                this.world.removeBody(particle);
            });
        });
        this.fluids.clear();
        
        // Limpiar tela
        this.cloth.forEach(clothData => {
            clothData.particles.forEach(row => {
                row.forEach(particle => {
                    this.world.removeBody(particle);
                });
            });
            clothData.constraints.forEach(constraint => {
                this.world.removeConstraint(constraint);
            });
        });
        this.cloth.clear();
        
        // Limpiar cuerpos blandos
        this.softBodies.forEach(softBodyData => {
            softBodyData.particles.forEach(particle => {
                this.world.removeBody(particle);
            });
            softBodyData.constraints.forEach(constraint => {
                this.world.removeConstraint(constraint);
            });
        });
        this.softBodies.clear();
        
        console.log('🧹 Sistema de Física limpiado');
    }
}

// Exportar para uso global
window.PhysicsSystem = PhysicsSystem; 
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
     * Crear fluido con SPH (Smoothed Particle Hydrodynamics)
     */
    createFluid(options = {}) {
        const {
            size = { x: 10, y: 2, z: 10 },
            position = { x: 0, y: 0, z: 0 },
            resolution = 20,
            viscosity = 0.1,
            density = 1000,
            pressure = 1,
            surfaceTension = 0.0728,
            id = null,
            type = 'water' // water, oil, honey, etc.
        } = options;
        
        // Crear partículas de fluido con propiedades SPH
        const particles = [];
        const particleRadius = 0.1;
        const particleMass = 1;
        const smoothingRadius = particleRadius * 2.5; // Radio de influencia SPH
        
        // Parámetros SPH específicos por tipo de fluido
        const fluidTypes = {
            water: { viscosity: 0.1, density: 1000, color: 0x0088ff, opacity: 0.7 },
            oil: { viscosity: 0.5, density: 800, color: 0x332211, opacity: 0.8 },
            honey: { viscosity: 2.0, density: 1400, color: 0xffaa00, opacity: 0.9 },
            lava: { viscosity: 1.5, density: 2500, color: 0xff4400, opacity: 1.0 },
            acid: { viscosity: 0.15, density: 1200, color: 0x00ff44, opacity: 0.6 }
        };
        
        const fluidProps = fluidTypes[type] || fluidTypes.water;
        
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
                    
                    // Propiedades SPH para cada partícula
                    particleBody.userData = {
                        ...particleBody.userData,
                        sphProperties: {
                            density: fluidProps.density,
                            pressure: 0,
                            viscosity: fluidProps.viscosity,
                            smoothingRadius: smoothingRadius,
                            neighbors: [],
                            forces: new CANNON.Vec3(0, 0, 0),
                            velocity: new CANNON.Vec3(0, 0, 0),
                            acceleration: new CANNON.Vec3(0, 0, 0)
                        },
                        fluidType: type
                    };
                    
                    this.world.addBody(particleBody);
                    particles.push(particleBody);
                    
                    // Crear mesh de partícula con shader personalizado
                    const particleGeometry = new THREE.SphereGeometry(particleRadius, 8, 8);
                    const particleMaterial = new THREE.MeshLambertMaterial({ 
                        color: fluidProps.color,
                        transparent: true,
                        opacity: fluidProps.opacity,
                        emissive: type === 'lava' ? new THREE.Color(0x440000) : new THREE.Color(0x000000)
                    });
                    const particleMesh = new THREE.Mesh(particleGeometry, particleMaterial);
                    particleMesh.castShadow = true;
                    particleMesh.receiveShadow = true;
                    this.scene.add(particleMesh);
                    particleMesh.userData.physicsBody = particleBody;
                }
            }
        }
        
        const fluidId = id || `fluid_${type}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        this.fluids.set(fluidId, {
            particles,
            viscosity: fluidProps.viscosity,
            density: fluidProps.density,
            surfaceTension,
            smoothingRadius,
            size,
            position,
            type,
            lastUpdateTime: Date.now()
        });
        
        this.metrics.fluidsCount++;
        
        console.log(`🌊 Fluido ${type} creado con ${particles.length} partículas SPH`);
        
        return { particles, id: fluidId, type };
    }

    /**
     * Actualizar física SPH para fluidos
     */
    updateSPH(deltaTime) {
        this.fluids.forEach((fluidData, fluidId) => {
            const { particles, smoothingRadius, density, viscosity, surfaceTension } = fluidData;
            
            // 1. Encontrar vecinos para cada partícula
            this.findNeighbors(particles, smoothingRadius);
            
            // 2. Calcular densidad y presión
            this.calculateDensityAndPressure(particles, density, smoothingRadius);
            
            // 3. Calcular fuerzas SPH
            this.calculateSPHForces(particles, smoothingRadius, viscosity, surfaceTension);
            
            // 4. Integrar posiciones
            this.integrateSPH(particles, deltaTime);
            
            // 5. Manejar colisiones con contenedores
            this.handleFluidContainerCollisions(particles, fluidData);
        });
    }

    /**
     * Encontrar partículas vecinas dentro del radio de suavizado
     */
    findNeighbors(particles, smoothingRadius) {
        particles.forEach(particle => {
            particle.userData.sphProperties.neighbors = [];
            
            particles.forEach(neighbor => {
                if (particle !== neighbor) {
                    const distance = particle.position.distanceTo(neighbor.position);
                    if (distance < smoothingRadius) {
                        particle.userData.sphProperties.neighbors.push({
                            particle: neighbor,
                            distance: distance
                        });
                    }
                }
            });
        });
    }

    /**
     * Calcular densidad y presión usando kernel SPH
     */
    calculateDensityAndPressure(particles, restDensity, smoothingRadius) {
        particles.forEach(particle => {
            let density = 0;
            const mass = particle.mass;
            
            // Incluir la propia partícula
            density += mass * this.sphKernel(0, smoothingRadius);
            
            // Sumar contribuciones de vecinos
            particle.userData.sphProperties.neighbors.forEach(neighbor => {
                density += mass * this.sphKernel(neighbor.distance, smoothingRadius);
            });
            
            particle.userData.sphProperties.density = density;
            
            // Calcular presión usando ecuación de estado
            const k = 7; // Constante de rigidez del fluido
            particle.userData.sphProperties.pressure = Math.max(0, k * (density - restDensity));
        });
    }

    /**
     * Calcular fuerzas SPH (presión, viscosidad, tensión superficial)
     */
    calculateSPHForces(particles, smoothingRadius, viscosity, surfaceTension) {
        particles.forEach(particle => {
            const forces = new CANNON.Vec3(0, 0, 0);
            const props = particle.userData.sphProperties;
            
            props.neighbors.forEach(neighbor => {
                const neighborParticle = neighbor.particle;
                const neighborProps = neighborParticle.userData.sphProperties;
                const r = neighbor.distance;
                
                if (r > 0) {
                    const mass = neighborParticle.mass;
                    
                    // Fuerza de presión
                    const pressureForce = this.calculatePressureForce(
                        particle, neighborParticle, r, smoothingRadius, mass
                    );
                    forces.vadd(pressureForce, forces);
                    
                    // Fuerza de viscosidad
                    const viscosityForce = this.calculateViscosityForce(
                        particle, neighborParticle, r, smoothingRadius, mass, viscosity
                    );
                    forces.vadd(viscosityForce, forces);
                    
                    // Tensión superficial
                    if (surfaceTension > 0) {
                        const surfaceForce = this.calculateSurfaceTensionForce(
                            particle, neighborParticle, r, smoothingRadius, mass, surfaceTension
                        );
                        forces.vadd(surfaceForce, forces);
                    }
                }
            });
            
            props.forces = forces;
        });
    }

    /**
     * Kernel SPH (Poly6)
     */
    sphKernel(r, h) {
        if (r >= 0 && r <= h) {
            const factor = 315 / (64 * Math.PI * Math.pow(h, 9));
            return factor * Math.pow(h * h - r * r, 3);
        }
        return 0;
    }

    /**
     * Gradiente del kernel SPH (Spiky)
     */
    sphKernelGradient(r, h) {
        if (r > 0 && r <= h) {
            const factor = -45 / (Math.PI * Math.pow(h, 6));
            return factor * Math.pow(h - r, 2);
        }
        return 0;
    }

    /**
     * Laplaciano del kernel SPH (Viscosity)
     */
    sphKernelLaplacian(r, h) {
        if (r >= 0 && r <= h) {
            const factor = 45 / (Math.PI * Math.pow(h, 6));
            return factor * (h - r);
        }
        return 0;
    }

    /**
     * Calcular fuerza de presión
     */
    calculatePressureForce(particle, neighbor, r, h, mass) {
        const props = particle.userData.sphProperties;
        const neighborProps = neighbor.userData.sphProperties;
        
        const pressure = (props.pressure + neighborProps.pressure) / 2;
        const gradientMagnitude = this.sphKernelGradient(r, h);
        
        const direction = new CANNON.Vec3();
        direction.copy(particle.position);
        direction.vsub(neighbor.position, direction);
        direction.normalize();
        
        const force = new CANNON.Vec3();
        force.copy(direction);
        force.scale(-mass * pressure * gradientMagnitude / neighborProps.density, force);
        
        return force;
    }

    /**
     * Calcular fuerza de viscosidad
     */
    calculateViscosityForce(particle, neighbor, r, h, mass, viscosity) {
        const props = particle.userData.sphProperties;
        const neighborProps = neighbor.userData.sphProperties;
        
        const velocityDiff = new CANNON.Vec3();
        velocityDiff.copy(neighbor.velocity);
        velocityDiff.vsub(particle.velocity, velocityDiff);
        
        const laplacian = this.sphKernelLaplacian(r, h);
        
        const force = new CANNON.Vec3();
        force.copy(velocityDiff);
        force.scale(viscosity * mass * laplacian / neighborProps.density, force);
        
        return force;
    }

    /**
     * Calcular tensión superficial
     */
    calculateSurfaceTensionForce(particle, neighbor, r, h, mass, surfaceTension) {
        const colorFieldGradient = this.sphKernelGradient(r, h);
        
        const direction = new CANNON.Vec3();
        direction.copy(particle.position);
        direction.vsub(neighbor.position, direction);
        direction.normalize();
        
        const force = new CANNON.Vec3();
        force.copy(direction);
        force.scale(-surfaceTension * mass * colorFieldGradient, force);
        
        return force;
    }

    /**
     * Integrar posiciones usando Verlet
     */
    integrateSPH(particles, deltaTime) {
        particles.forEach(particle => {
            const props = particle.userData.sphProperties;
            
            // Calcular aceleración
            const acceleration = new CANNON.Vec3();
            acceleration.copy(props.forces);
            acceleration.scale(1 / particle.mass, acceleration);
            
            // Agregar gravedad
            acceleration.vadd(this.world.gravity, acceleration);
            
            // Integración Verlet
            const newVelocity = new CANNON.Vec3();
            newVelocity.copy(acceleration);
            newVelocity.scale(deltaTime, newVelocity);
            newVelocity.vadd(particle.velocity, newVelocity);
            
            const newPosition = new CANNON.Vec3();
            newPosition.copy(newVelocity);
            newPosition.scale(deltaTime, newPosition);
            newPosition.vadd(particle.position, newPosition);
            
            particle.velocity.copy(newVelocity);
            particle.position.copy(newPosition);
            
            props.velocity = newVelocity;
            props.acceleration = acceleration;
        });
    }

    /**
     * Manejar colisiones con contenedores
     */
    handleFluidContainerCollisions(particles, fluidData) {
        const { size, position } = fluidData;
        const damping = 0.5; // Factor de amortiguación en colisiones
        
        particles.forEach(particle => {
            // Límites del contenedor
            const minX = position.x - size.x / 2;
            const maxX = position.x + size.x / 2;
            const minY = position.y - size.y / 2;
            const maxY = position.y + size.y / 2;
            const minZ = position.z - size.z / 2;
            const maxZ = position.z + size.z / 2;
            
            // Colisión con paredes
            if (particle.position.x < minX) {
                particle.position.x = minX;
                particle.velocity.x = Math.abs(particle.velocity.x) * damping;
            }
            if (particle.position.x > maxX) {
                particle.position.x = maxX;
                particle.velocity.x = -Math.abs(particle.velocity.x) * damping;
            }
            
            if (particle.position.y < minY) {
                particle.position.y = minY;
                particle.velocity.y = Math.abs(particle.velocity.y) * damping;
            }
            if (particle.position.y > maxY) {
                particle.position.y = maxY;
                particle.velocity.y = -Math.abs(particle.velocity.y) * damping;
            }
            
            if (particle.position.z < minZ) {
                particle.position.z = minZ;
                particle.velocity.z = Math.abs(particle.velocity.z) * damping;
            }
            if (particle.position.z > maxZ) {
                particle.position.z = maxZ;
                particle.velocity.z = -Math.abs(particle.velocity.z) * damping;
            }
        });
    }
    
    /**
     * Crear tela avanzada con física realista
     */
    createCloth(options = {}) {
        const {
            size = { x: 5, y: 5 },
            resolution = { x: 20, y: 20 },
            position = { x: 0, y: 5, z: 0 },
            mass = 1,
            stiffness = 0.9,
            damping = 0.1,
            windResistance = 0.1,
            tearThreshold = 50, // Fuerza necesaria para rasgar
            selfCollision = false,
            type = 'fabric', // fabric, silk, canvas, leather
            id = null
        } = options;
        
        // Propiedades específicas por tipo de tela
        const fabricTypes = {
            fabric: { 
                stiffness: 0.8, 
                damping: 0.1, 
                mass: 1, 
                color: 0xffaa00,
                tearThreshold: 40
            },
            silk: { 
                stiffness: 0.6, 
                damping: 0.05, 
                mass: 0.5, 
                color: 0xff88cc,
                tearThreshold: 25
            },
            canvas: { 
                stiffness: 0.95, 
                damping: 0.2, 
                mass: 2, 
                color: 0x886644,
                tearThreshold: 80
            },
            leather: { 
                stiffness: 0.98, 
                damping: 0.3, 
                mass: 3, 
                color: 0x654321,
                tearThreshold: 120
            }
        };
        
        const fabricProps = fabricTypes[type] || fabricTypes.fabric;
        
        // Crear partículas de tela
        const particles = [];
        const constraints = [];
        const springs = []; // Springs adicionales para comportamiento realista
        
        for (let x = 0; x < resolution.x; x++) {
            particles[x] = [];
            for (let y = 0; y < resolution.y; y++) {
                const particleShape = new CANNON.Sphere(0.02);
                const particleBody = new CANNON.Body({
                    mass: fabricProps.mass,
                    shape: particleShape,
                    position: new CANNON.Vec3(
                        position.x + (x - resolution.x/2) * size.x / resolution.x,
                        position.y + (y - resolution.y/2) * size.y / resolution.y,
                        position.z
                    ),
                    material: this.materials.cloth
                });
                
                // Propiedades adicionales para la tela
                particleBody.userData = {
                    ...particleBody.userData,
                    clothProperties: {
                        originalPosition: particleBody.position.clone(),
                        isFixed: false,
                        isTorn: false,
                        connections: [],
                        windForce: new CANNON.Vec3(0, 0, 0),
                        fabricType: type
                    }
                };
                
                // Fijar esquinas superiores por defecto
                if ((x === 0 && y === 0) || (x === resolution.x-1 && y === 0)) {
                    particleBody.mass = 0;
                    particleBody.userData.clothProperties.isFixed = true;
                }
                
                this.world.addBody(particleBody);
                particles[x][y] = particleBody;
                
                // Crear mesh de partícula (invisible en renderizado final)
                const particleGeometry = new THREE.SphereGeometry(0.02, 6, 6);
                const particleMaterial = new THREE.MeshLambertMaterial({ 
                    color: fabricProps.color,
                    transparent: true,
                    opacity: 0.3,
                    visible: false // Las partículas son invisibles, solo la superficie se renderiza
                });
                const particleMesh = new THREE.Mesh(particleGeometry, particleMaterial);
                particleMesh.castShadow = false;
                this.scene.add(particleMesh);
                particleMesh.userData.physicsBody = particleBody;
            }
        }
        
        // Crear restricciones estructurales (horizontales y verticales)
        for (let x = 0; x < resolution.x; x++) {
            for (let y = 0; y < resolution.y; y++) {
                const currentParticle = particles[x][y];
                
                // Conexiones horizontales
                if (x < resolution.x - 1) {
                    const rightParticle = particles[x + 1][y];
                    const constraint = new CANNON.DistanceConstraint(
                        currentParticle,
                        rightParticle,
                        size.x / resolution.x
                    );
                    constraint.stiffness = fabricProps.stiffness;
                    constraint.damping = fabricProps.damping;
                    this.world.addConstraint(constraint);
                    constraints.push(constraint);
                    
                    // Registrar conexiones para detección de rasgado
                    currentParticle.userData.clothProperties.connections.push({
                        particle: rightParticle,
                        constraint: constraint,
                        restLength: size.x / resolution.x,
                        tearThreshold: fabricProps.tearThreshold
                    });
                }
                
                // Conexiones verticales
                if (y < resolution.y - 1) {
                    const bottomParticle = particles[x][y + 1];
                    const constraint = new CANNON.DistanceConstraint(
                        currentParticle,
                        bottomParticle,
                        size.y / resolution.y
                    );
                    constraint.stiffness = fabricProps.stiffness;
                    constraint.damping = fabricProps.damping;
                    this.world.addConstraint(constraint);
                    constraints.push(constraint);
                    
                    currentParticle.userData.clothProperties.connections.push({
                        particle: bottomParticle,
                        constraint: constraint,
                        restLength: size.y / resolution.y,
                        tearThreshold: fabricProps.tearThreshold
                    });
                }
                
                // Restricciones diagonales para mayor realismo
                if (x < resolution.x - 1 && y < resolution.y - 1) {
                    const diagonalParticle = particles[x + 1][y + 1];
                    const diagonalDistance = Math.sqrt(
                        Math.pow(size.x / resolution.x, 2) + 
                        Math.pow(size.y / resolution.y, 2)
                    );
                    
                    const diagonalConstraint = new CANNON.DistanceConstraint(
                        currentParticle,
                        diagonalParticle,
                        diagonalDistance
                    );
                    diagonalConstraint.stiffness = fabricProps.stiffness * 0.5; // Menos rígido
                    diagonalConstraint.damping = fabricProps.damping;
                    this.world.addConstraint(diagonalConstraint);
                    constraints.push(diagonalConstraint);
                }
                
                // Restricciones de flexión (bend constraints)
                if (x < resolution.x - 2) {
                    const bendParticle = particles[x + 2][y];
                    const bendConstraint = new CANNON.DistanceConstraint(
                        currentParticle,
                        bendParticle,
                        (size.x / resolution.x) * 2
                    );
                    bendConstraint.stiffness = fabricProps.stiffness * 0.3; // Muy flexible
                    bendConstraint.damping = fabricProps.damping * 2;
                    this.world.addConstraint(bendConstraint);
                    constraints.push(bendConstraint);
                }
                
                if (y < resolution.y - 2) {
                    const bendParticle = particles[x][y + 2];
                    const bendConstraint = new CANNON.DistanceConstraint(
                        currentParticle,
                        bendParticle,
                        (size.y / resolution.y) * 2
                    );
                    bendConstraint.stiffness = fabricProps.stiffness * 0.3;
                    bendConstraint.damping = fabricProps.damping * 2;
                    this.world.addConstraint(bendConstraint);
                    constraints.push(bendConstraint);
                }
            }
        }
        
        // Crear superficie de tela visible
        const clothSurface = this.createClothSurface(particles, resolution, fabricProps);
        
        const clothId = id || `cloth_${type}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        this.cloth.set(clothId, {
            particles,
            constraints,
            surface: clothSurface,
            size,
            resolution,
            position,
            type,
            fabricProps,
            windResistance,
            selfCollision,
            lastWindUpdate: Date.now(),
            tearCount: 0
        });
        
        this.metrics.clothCount++;
        
        console.log(`🧵 Tela ${type} creada con ${particles.length * particles[0].length} partículas`);
        
        return { particles, constraints, surface: clothSurface, id: clothId };
    }

    /**
     * Crear superficie visual de la tela
     */
    createClothSurface(particles, resolution, fabricProps) {
        const geometry = new THREE.PlaneGeometry(1, 1, resolution.x - 1, resolution.y - 1);
        
        // Material de tela con propiedades realistas
        const material = new THREE.MeshLambertMaterial({
            color: fabricProps.color,
            side: THREE.DoubleSide,
            transparent: true,
            opacity: 0.9,
            roughness: 0.8,
            metalness: 0.1
        });
        
        // Crear textura procedural si es necesario
        if (fabricProps.color) {
            const canvas = document.createElement('canvas');
            canvas.width = 256;
            canvas.height = 256;
            const ctx = canvas.getContext('2d');
            
            // Patrón de tela
            ctx.fillStyle = `#${fabricProps.color.toString(16).padStart(6, '0')}`;
            ctx.fillRect(0, 0, 256, 256);
            
            // Agregar textura de fibras
            for (let i = 0; i < 1000; i++) {
                ctx.globalAlpha = 0.1;
                ctx.strokeStyle = '#ffffff';
                ctx.lineWidth = 1;
                ctx.beginPath();
                ctx.moveTo(Math.random() * 256, Math.random() * 256);
                ctx.lineTo(Math.random() * 256, Math.random() * 256);
                ctx.stroke();
            }
            
            const texture = new THREE.CanvasTexture(canvas);
            texture.wrapS = THREE.RepeatWrapping;
            texture.wrapT = THREE.RepeatWrapping;
            texture.repeat.set(4, 4);
            
            material.map = texture;
        }
        
        const mesh = new THREE.Mesh(geometry, material);
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        mesh.userData.isClothSurface = true;
        
        this.scene.add(mesh);
        
        return mesh;
    }

    /**
     * Actualizar física de tela
     */
    updateClothPhysics(deltaTime) {
        this.cloth.forEach((clothData, clothId) => {
            const { particles, resolution, windResistance, surface } = clothData;
            
            // Aplicar fuerzas de viento
            this.applyWindForces(particles, windResistance, deltaTime);
            
            // Detectar y manejar rasgaduras
            this.checkClothTearing(particles);
            
            // Actualizar geometría de la superficie
            this.updateClothSurfaceGeometry(surface, particles, resolution);
            
            // Auto-colisión si está habilitada
            if (clothData.selfCollision) {
                this.handleClothSelfCollision(particles);
            }
        });
    }

    /**
     * Aplicar fuerzas de viento a la tela
     */
    applyWindForces(particles, windResistance, deltaTime) {
        const time = Date.now() / 1000;
        
        particles.forEach(row => {
            row.forEach(particle => {
                if (particle.userData.clothProperties.isFixed) return;
                
                // Simular viento turbulento
                const windForce = new CANNON.Vec3(
                    Math.sin(time * 2 + particle.position.x * 0.5) * windResistance,
                    Math.cos(time * 1.5 + particle.position.z * 0.3) * windResistance * 0.5,
                    Math.sin(time * 3 + particle.position.y * 0.7) * windResistance * 0.8
                );
                
                particle.force.vadd(windForce, particle.force);
                particle.userData.clothProperties.windForce = windForce;
            });
        });
    }

    /**
     * Detectar rasgaduras en la tela
     */
    checkClothTearing(particles) {
        particles.forEach(row => {
            row.forEach(particle => {
                const connections = particle.userData.clothProperties.connections;
                
                connections.forEach((connection, index) => {
                    if (connection.constraint && !connection.isTorn) {
                        const currentDistance = particle.position.distanceTo(connection.particle.position);
                        const strain = (currentDistance - connection.restLength) / connection.restLength;
                        
                        // Si la deformación excede el umbral, rasgar la conexión
                        if (strain > 0.5 && Math.abs(connection.constraint.force) > connection.tearThreshold) {
                            this.tearClothConnection(connection);
                            connections[index].isTorn = true;
                            console.log('🔥 Tela rasgada en conexión');
                        }
                    }
                });
            });
        });
    }

    /**
     * Rasgar conexión de tela
     */
    tearClothConnection(connection) {
        // Remover constraint del mundo físico
        this.world.removeConstraint(connection.constraint);
        
        // Marcar como rasgado
        connection.isTorn = true;
        
        // Aplicar fuerza de liberación a las partículas
        const releaseForce = new CANNON.Vec3(
            (Math.random() - 0.5) * 10,
            Math.random() * 5,
            (Math.random() - 0.5) * 10
        );
        
        connection.particle.applyImpulse(releaseForce, new CANNON.Vec3(0, 0, 0));
    }

    /**
     * Actualizar geometría de superficie de tela
     */
    updateClothSurfaceGeometry(surface, particles, resolution) {
        const positions = surface.geometry.attributes.position.array;
        
        for (let x = 0; x < resolution.x; x++) {
            for (let y = 0; y < resolution.y; y++) {
                const index = x * resolution.y + y;
                const particle = particles[x][y];
                
                positions[index * 3] = particle.position.x;
                positions[index * 3 + 1] = particle.position.y;
                positions[index * 3 + 2] = particle.position.z;
            }
        }
        
        surface.geometry.attributes.position.needsUpdate = true;
        surface.geometry.computeVertexNormals(); // Recalcular normales para iluminación correcta
    }

    /**
     * Manejar auto-colisión de tela
     */
    handleClothSelfCollision(particles) {
        // Implementación simplificada de auto-colisión
        const minDistance = 0.1;
        
        particles.forEach((row, x) => {
            row.forEach((particle, y) => {
                // Solo verificar partículas cercanas para optimización
                for (let dx = -2; dx <= 2; dx++) {
                    for (let dy = -2; dy <= 2; dy++) {
                        if (dx === 0 && dy === 0) continue;
                        
                        const nx = x + dx;
                        const ny = y + dy;
                        
                        if (nx >= 0 && nx < particles.length && 
                            ny >= 0 && ny < particles[0].length &&
                            Math.abs(dx) + Math.abs(dy) > 1) { // No verificar vecinos inmediatos
                            
                            const otherParticle = particles[nx][ny];
                            const distance = particle.position.distanceTo(otherParticle.position);
                            
                            if (distance < minDistance) {
                                // Aplicar fuerza de separación
                                const separationDirection = new CANNON.Vec3();
                                separationDirection.copy(particle.position);
                                separationDirection.vsub(otherParticle.position, separationDirection);
                                separationDirection.normalize();
                                
                                const separationForce = new CANNON.Vec3();
                                separationForce.copy(separationDirection);
                                separationForce.scale((minDistance - distance) * 50, separationForce);
                                
                                particle.applyForce(separationForce, new CANNON.Vec3(0, 0, 0));
                                
                                const oppositeForce = new CANNON.Vec3();
                                oppositeForce.copy(separationForce);
                                oppositeForce.negate(oppositeForce);
                                otherParticle.applyForce(oppositeForce, new CANNON.Vec3(0, 0, 0));
                            }
                        }
                    }
                }
            });
        });
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
        
        // Actualizar física SPH para fluidos avanzados
        if (this.fluids.size > 0) {
            this.updateSPH(deltaTime);
        }
        
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
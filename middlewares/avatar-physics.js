/**
 * Sistema de Física para Avatares
 * Maneja colisiones, gravedad y movimientos físicos específicos para avatares humanos
 */

import * as THREE from 'three';

class AvatarPhysics {
    constructor(avatarGenerator) {
        this.avatarGenerator = avatarGenerator;
        this.avatar = avatarGenerator.avatar;
        this.config = {
            mass: 70.0, // kg
            height: 1.8, // m
            gravity: -9.81, // m/s²
            friction: 0.7,
            restitution: 0.3,
            maxSpeed: 5.0, // m/s
            jumpForce: 8.0, // m/s
            groundLevel: 0.0,
            enableCollisions: true,
            enableGravity: true,
            enableFriction: true
        };

        this.state = {
            position: new THREE.Vector3(),
            velocity: new THREE.Vector3(),
            acceleration: new THREE.Vector3(),
            onGround: false,
            canJump: true,
            isMoving: false,
            isRunning: false,
            isJumping: false,
            isFalling: false
        };

        this.colliders = {
            body: null,
            head: null,
            feet: null
        };

        this.groundContacts = [];
        this.obstacles = [];
        this.timeStep = 1.0 / 60.0; // 60 FPS

        this.init();
    }

    /**
     * Inicializar sistema de física
     */
    init() {
        this.setupColliders();
        this.setupGroundDetection();
        this.resetState();
    }

    /**
     * Configurar colisionadores
     */
    setupColliders() {
        // Colisionador del cuerpo (cilindro)
        this.colliders.body = {
            type: 'cylinder',
            radius: 0.3,
            height: 1.6,
            offset: new THREE.Vector3(0, 0.8, 0)
        };

        // Colisionador de la cabeza (esfera)
        this.colliders.head = {
            type: 'sphere',
            radius: 0.25,
            offset: new THREE.Vector3(0, 1.6, 0)
        };

        // Colisionador de los pies (cajas)
        this.colliders.feet = {
            type: 'box',
            size: new THREE.Vector3(0.5, 0.1, 0.3),
            offset: new THREE.Vector3(0, 0.05, 0)
        };
    }

    /**
     * Configurar detección de suelo
     */
    setupGroundDetection() {
        // Rayo para detectar suelo
        this.groundRay = new THREE.Raycaster();
        this.groundRay.ray.direction.set(0, -1, 0);
    }

    /**
     * Resetear estado físico
     */
    resetState() {
        this.state.position.copy(this.avatar.position);
        this.state.velocity.set(0, 0, 0);
        this.state.acceleration.set(0, 0, 0);
        this.state.onGround = false;
        this.state.canJump = true;
        this.state.isMoving = false;
        this.state.isRunning = false;
        this.state.isJumping = false;
        this.state.isFalling = false;
    }

    /**
     * Actualizar física del avatar
     */
    update(deltaTime = this.timeStep) {
        if (!this.config.enableGravity) return;

        // Aplicar gravedad
        this.applyGravity(deltaTime);

        // Detectar suelo
        this.detectGround();

        // Aplicar fricción
        if (this.config.enableFriction) {
            this.applyFriction(deltaTime);
        }

        // Actualizar velocidad
        this.updateVelocity(deltaTime);

        // Limitar velocidad máxima
        this.limitVelocity();

        // Actualizar posición
        this.updatePosition(deltaTime);

        // Detectar colisiones
        if (this.config.enableCollisions) {
            this.detectCollisions();
        }

        // Actualizar estado
        this.updateState();
    }

    /**
     * Aplicar gravedad
     */
    applyGravity(deltaTime) {
        if (!this.state.onGround) {
            this.state.acceleration.y += this.config.gravity * deltaTime;
        }
    }

    /**
     * Detectar suelo
     */
    detectGround() {
        const rayStart = this.state.position.clone();
        rayStart.y += 0.1; // Pequeño offset para evitar falsos positivos

        this.groundRay.ray.origin.copy(rayStart);
        this.groundRay.ray.direction.set(0, -1, 0);

        // Detectar colisión con suelo
        const groundDistance = 0.15; // Distancia al suelo
        const isOnGround = this.state.position.y <= this.config.groundLevel + groundDistance;

        if (isOnGround && this.state.velocity.y <= 0) {
            this.state.position.y = this.config.groundLevel;
            this.state.velocity.y = 0;
            this.state.acceleration.y = 0;
            this.state.onGround = true;
            this.state.canJump = true;
            this.state.isFalling = false;
        } else {
            this.state.onGround = false;
            if (this.state.velocity.y < 0) {
                this.state.isFalling = true;
            }
        }
    }

    /**
     * Aplicar fricción
     */
    applyFriction(deltaTime) {
        if (this.state.onGround) {
            const frictionForce = this.config.friction * this.config.mass * this.config.gravity;
            const frictionAcceleration = frictionForce / this.config.mass;

            // Aplicar fricción en el plano XZ
            if (Math.abs(this.state.velocity.x) > 0.01) {
                this.state.acceleration.x -= Math.sign(this.state.velocity.x) * frictionAcceleration * deltaTime;
            }
            if (Math.abs(this.state.velocity.z) > 0.01) {
                this.state.acceleration.z -= Math.sign(this.state.velocity.z) * frictionAcceleration * deltaTime;
            }

            // Detener movimiento si la velocidad es muy baja
            if (Math.abs(this.state.velocity.x) < 0.01) {
                this.state.velocity.x = 0;
                this.state.acceleration.x = 0;
            }
            if (Math.abs(this.state.velocity.z) < 0.01) {
                this.state.velocity.z = 0;
                this.state.acceleration.z = 0;
            }
        }
    }

    /**
     * Actualizar velocidad
     */
    updateVelocity(deltaTime) {
        this.state.velocity.add(this.state.acceleration.clone().multiplyScalar(deltaTime));
        this.state.acceleration.set(0, 0, 0);
    }

    /**
     * Limitar velocidad máxima
     */
    limitVelocity() {
        const horizontalSpeed = Math.sqrt(
            this.state.velocity.x * this.state.velocity.x + 
            this.state.velocity.z * this.state.velocity.z
        );

        if (horizontalSpeed > this.config.maxSpeed) {
            const scale = this.config.maxSpeed / horizontalSpeed;
            this.state.velocity.x *= scale;
            this.state.velocity.z *= scale;
        }
    }

    /**
     * Actualizar posición
     */
    updatePosition(deltaTime) {
        this.state.position.add(this.state.velocity.clone().multiplyScalar(deltaTime));
        this.avatar.position.copy(this.state.position);
    }

    /**
     * Detectar colisiones
     */
    detectCollisions() {
        this.obstacles.forEach(obstacle => {
            this.resolveCollision(obstacle);
        });
    }

    /**
     * Resolver colisión con obstáculo
     */
    resolveCollision(obstacle) {
        const avatarPos = this.state.position;
        const obstaclePos = obstacle.position;
        const distance = avatarPos.distanceTo(obstaclePos);
        const minDistance = this.colliders.body.radius + obstacle.radius;

        if (distance < minDistance) {
            // Calcular dirección de separación
            const separation = avatarPos.clone().sub(obstaclePos).normalize();
            const overlap = minDistance - distance;
            
            // Mover avatar fuera del obstáculo
            avatarPos.add(separation.clone().multiplyScalar(overlap));
            
            // Aplicar rebote
            const dot = this.state.velocity.dot(separation);
            if (dot < 0) {
                this.state.velocity.sub(separation.clone().multiplyScalar(dot * 2 * this.config.restitution));
            }
        }
    }

    /**
     * Actualizar estado del avatar
     */
    updateState() {
        // Determinar si está moviéndose
        const horizontalSpeed = Math.sqrt(
            this.state.velocity.x * this.state.velocity.x + 
            this.state.velocity.z * this.state.velocity.z
        );

        this.state.isMoving = horizontalSpeed > 0.1;
        this.state.isRunning = horizontalSpeed > 2.0;
    }

    /**
     * Mover avatar
     */
    move(direction, speed = 1.0) {
        if (!this.state.onGround) return;

        const moveSpeed = this.state.isRunning ? speed * 2.0 : speed;
        const moveVector = new THREE.Vector3(direction.x, 0, direction.z).normalize();
        
        this.state.acceleration.add(moveVector.multiplyScalar(moveSpeed * 10.0)); // Aceleración

        // Rotar avatar hacia la dirección del movimiento
        if (moveVector.length() > 0.1) {
            const targetRotation = Math.atan2(moveVector.x, moveVector.z);
            this.avatar.rotation.y = targetRotation;
        }
    }

    /**
     * Saltar
     */
    jump() {
        if (!this.state.canJump || !this.state.onGround) return;

        this.state.velocity.y = this.config.jumpForce;
        this.state.onGround = false;
        this.state.canJump = false;
        this.state.isJumping = true;
        this.state.isFalling = false;
    }

    /**
     * Correr
     */
    run() {
        this.state.isRunning = true;
    }

    /**
     * Caminar
     */
    walk() {
        this.state.isRunning = false;
    }

    /**
     * Detener movimiento
     */
    stop() {
        this.state.velocity.x = 0;
        this.state.velocity.z = 0;
        this.state.acceleration.x = 0;
        this.state.acceleration.z = 0;
        this.state.isMoving = false;
        this.state.isRunning = false;
    }

    /**
     * Aplicar fuerza
     */
    applyForce(force) {
        const acceleration = force.clone().divideScalar(this.config.mass);
        this.state.acceleration.add(acceleration);
    }

    /**
     * Aplicar impulso
     */
    applyImpulse(impulse) {
        const velocityChange = impulse.clone().divideScalar(this.config.mass);
        this.state.velocity.add(velocityChange);
    }

    /**
     * Añadir obstáculo
     */
    addObstacle(position, radius) {
        this.obstacles.push({
            position: position.clone(),
            radius: radius
        });
    }

    /**
     * Remover obstáculo
     */
    removeObstacle(index) {
        if (index >= 0 && index < this.obstacles.length) {
            this.obstacles.splice(index, 1);
        }
    }

    /**
     * Limpiar obstáculos
     */
    clearObstacles() {
        this.obstacles = [];
    }

    /**
     * Establecer posición
     */
    setPosition(position) {
        this.state.position.copy(position);
        this.avatar.position.copy(position);
    }

    /**
     * Obtener posición
     */
    getPosition() {
        return this.state.position.clone();
    }

    /**
     * Establecer velocidad
     */
    setVelocity(velocity) {
        this.state.velocity.copy(velocity);
    }

    /**
     * Obtener velocidad
     */
    getVelocity() {
        return this.state.velocity.clone();
    }

    /**
     * Establecer configuración
     */
    setConfig(config) {
        this.config = { ...this.config, ...config };
    }

    /**
     * Obtener configuración
     */
    getConfig() {
        return { ...this.config };
    }

    /**
     * Obtener estado
     */
    getState() {
        return { ...this.state };
    }

    /**
     * Verificar si está en el suelo
     */
    isOnGround() {
        return this.state.onGround;
    }

    /**
     * Verificar si está moviéndose
     */
    isMoving() {
        return this.state.isMoving;
    }

    /**
     * Verificar si está corriendo
     */
    isRunning() {
        return this.state.isRunning;
    }

    /**
     * Verificar si está saltando
     */
    isJumping() {
        return this.state.isJumping;
    }

    /**
     * Verificar si está cayendo
     */
    isFalling() {
        return this.state.isFalling;
    }

    /**
     * Obtener información de colisión
     */
    getCollisionInfo() {
        return {
            body: this.colliders.body,
            head: this.colliders.head,
            feet: this.colliders.feet,
            obstacles: this.obstacles.length
        };
    }

    /**
     * Habilitar/deshabilitar gravedad
     */
    setGravityEnabled(enabled) {
        this.config.enableGravity = enabled;
        if (!enabled) {
            this.state.acceleration.y = 0;
        }
    }

    /**
     * Habilitar/deshabilitar colisiones
     */
    setCollisionsEnabled(enabled) {
        this.config.enableCollisions = enabled;
    }

    /**
     * Habilitar/deshabilitar fricción
     */
    setFrictionEnabled(enabled) {
        this.config.enableFriction = enabled;
    }

    /**
     * Establecer nivel del suelo
     */
    setGroundLevel(level) {
        this.config.groundLevel = level;
    }

    /**
     * Obtener altura del avatar
     */
    getHeight() {
        return this.config.height;
    }

    /**
     * Establecer altura del avatar
     */
    setHeight(height) {
        this.config.height = height;
        this.colliders.body.height = height * 0.9;
        this.colliders.head.offset.y = height;
    }

    /**
     * Obtener masa del avatar
     */
    getMass() {
        return this.config.mass;
    }

    /**
     * Establecer masa del avatar
     */
    setMass(mass) {
        this.config.mass = mass;
    }

    /**
     * Resetear física
     */
    reset() {
        this.resetState();
        this.clearObstacles();
    }

    /**
     * Limpiar recursos
     */
    dispose() {
        this.clearObstacles();
        this.groundContacts = [];
    }
}

// Exportar para uso modular
export default AvatarPhysics;

// Funciones globales para integración
window.AvatarPhysics = AvatarPhysics;
window.createAvatarPhysics = (avatarGenerator) => {
    return new AvatarPhysics(avatarGenerator);
}; 
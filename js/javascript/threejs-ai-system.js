/**
 * Sistema de IA Avanzado - Three.js
 * Inteligencia artificial para NPCs, comportamiento y generación de contenido
 */

class AISystem {
    constructor(scene) {
        this.scene = scene;
        this.npcs = new Map();
        this.behaviors = new Map();
        this.pathfinding = new Map();
        this.dialogue = new Map();
        this.agents = new Map();
        this.neuralNetworks = new Map();
        
        // Configuración del sistema
        this.config = {
            maxNPCs: 100,
            maxAgents: 50,
            enablePathfinding: true,
            enableBehaviorTrees: true,
            enableNeuralNetworks: true,
            enableDialogueSystem: true,
            enableProceduralGeneration: true,
            enableLearning: true,
            updateRate: 60
        };
        
        // Estados
        this.states = {
            isInitialized: false,
            isEnabled: true,
            isLearning: false,
            isGenerating: false
        };
        
        // Métricas
        this.metrics = {
            activeNPCs: 0,
            activeAgents: 0,
            activeBehaviors: 0,
            neuralNetworks: 0,
            pathfindingNodes: 0,
            dialogueInteractions: 0,
            learningIterations: 0,
            generationCount: 0,
            fps: 0,
            memoryUsage: 0
        };
        
        // Sistemas de IA
        this.systems = {
            pathfinding: null,
            behavior: null,
            dialogue: null,
            neural: null,
            procedural: null
        };
        
        // Tiempo y animación
        this.time = 0;
        this.deltaTime = 0;
        
        console.log('🤖 Sistema de IA inicializado');
    }
    
    /**
     * Inicializar sistema de IA
     */
    async initialize() {
        try {
            // Inicializar sistemas
            await this.initializePathfinding();
            await this.initializeBehaviorSystem();
            await this.initializeDialogueSystem();
            await this.initializeNeuralNetworks();
            await this.initializeProceduralGeneration();
            
            // Crear NPCs por defecto
            await this.createDefaultNPCs();
            
            // Crear comportamientos básicos
            await this.createDefaultBehaviors();
            
            this.states.isInitialized = true;
            console.log('✅ Sistema de IA inicializado');
            
        } catch (error) {
            console.error('❌ Error inicializando sistema de IA:', error);
            throw error;
        }
    }
    
    /**
     * Inicializar sistema de pathfinding
     */
    async initializePathfinding() {
        this.systems.pathfinding = {
            grid: null,
            nodes: new Map(),
            connections: new Map(),
            algorithms: {
                aStar: this.aStarPathfinding.bind(this),
                dijkstra: this.dijkstraPathfinding.bind(this),
                flowField: this.flowFieldPathfinding.bind(this)
            }
        };
        
        // Crear grid de navegación
        this.createNavigationGrid();
        
        console.log('✅ Sistema de pathfinding inicializado');
    }
    
    /**
     * Crear grid de navegación
     */
    createNavigationGrid() {
        const gridSize = 100;
        const nodeSize = 1;
        
        this.systems.pathfinding.grid = new Array(gridSize);
        for (let x = 0; x < gridSize; x++) {
            this.systems.pathfinding.grid[x] = new Array(gridSize);
            for (let z = 0; z < gridSize; z++) {
                const node = {
                    x: x * nodeSize - gridSize * nodeSize / 2,
                    z: z * nodeSize - gridSize * nodeSize / 2,
                    walkable: true,
                    cost: 1,
                    connections: []
                };
                
                this.systems.pathfinding.grid[x][z] = node;
                this.systems.pathfinding.nodes.set(`${x},${z}`, node);
            }
        }
        
        // Conectar nodos adyacentes
        for (let x = 0; x < gridSize; x++) {
            for (let z = 0; z < gridSize; z++) {
                const node = this.systems.pathfinding.grid[x][z];
                
                // Conectar con nodos vecinos
                for (let dx = -1; dx <= 1; dx++) {
                    for (let dz = -1; dz <= 1; dz++) {
                        if (dx === 0 && dz === 0) continue;
                        
                        const nx = x + dx;
                        const nz = z + dz;
                        
                        if (nx >= 0 && nx < gridSize && nz >= 0 && nz < gridSize) {
                            const neighbor = this.systems.pathfinding.grid[nx][nz];
                            if (neighbor.walkable) {
                                node.connections.push(neighbor);
                            }
                        }
                    }
                }
            }
        }
        
        this.metrics.pathfindingNodes = gridSize * gridSize;
        console.log('✅ Grid de navegación creado');
    }
    
    /**
     * Algoritmo A* para pathfinding
     */
    aStarPathfinding(start, goal) {
        const openSet = [start];
        const closedSet = new Set();
        const cameFrom = new Map();
        const gScore = new Map();
        const fScore = new Map();
        
        gScore.set(start, 0);
        fScore.set(start, this.heuristic(start, goal));
        
        while (openSet.length > 0) {
            // Encontrar nodo con menor fScore
            let current = openSet.reduce((min, node) => 
                fScore.get(node) < fScore.get(min) ? node : min
            );
            
            if (current === goal) {
                return this.reconstructPath(cameFrom, current);
            }
            
            openSet.splice(openSet.indexOf(current), 1);
            closedSet.add(current);
            
            for (const neighbor of current.connections) {
                if (closedSet.has(neighbor)) continue;
                
                const tentativeGScore = gScore.get(current) + this.distance(current, neighbor);
                
                if (!openSet.includes(neighbor)) {
                    openSet.push(neighbor);
                } else if (tentativeGScore >= gScore.get(neighbor)) {
                    continue;
                }
                
                cameFrom.set(neighbor, current);
                gScore.set(neighbor, tentativeGScore);
                fScore.set(neighbor, tentativeGScore + this.heuristic(neighbor, goal));
            }
        }
        
        return null; // No se encontró camino
    }
    
    /**
     * Algoritmo Dijkstra para pathfinding
     */
    dijkstraPathfinding(start, goal) {
        const distances = new Map();
        const previous = new Map();
        const unvisited = new Set();
        
        // Inicializar distancias
        this.systems.pathfinding.nodes.forEach(node => {
            distances.set(node, Infinity);
            unvisited.add(node);
        });
        distances.set(start, 0);
        
        while (unvisited.size > 0) {
            // Encontrar nodo con menor distancia
            let current = null;
            let minDistance = Infinity;
            
            for (const node of unvisited) {
                const distance = distances.get(node);
                if (distance < minDistance) {
                    minDistance = distance;
                    current = node;
                }
            }
            
            if (current === null) break;
            
            unvisited.delete(current);
            
            if (current === goal) {
                return this.reconstructPath(previous, current);
            }
            
            for (const neighbor of current.connections) {
                if (!unvisited.has(neighbor)) continue;
                
                const distance = distances.get(current) + this.distance(current, neighbor);
                
                if (distance < distances.get(neighbor)) {
                    distances.set(neighbor, distance);
                    previous.set(neighbor, current);
                }
            }
        }
        
        return null;
    }
    
    /**
     * Algoritmo Flow Field para pathfinding
     */
    flowFieldPathfinding(start, goal) {
        // Implementación simplificada de Flow Field
        const flowField = new Map();
        const queue = [goal];
        const visited = new Set([goal]);
        
        flowField.set(goal, { direction: null, cost: 0 });
        
        while (queue.length > 0) {
            const current = queue.shift();
            const currentCost = flowField.get(current).cost;
            
            for (const neighbor of current.connections) {
                if (visited.has(neighbor)) continue;
                
                visited.add(neighbor);
                queue.push(neighbor);
                
                const direction = {
                    x: current.x - neighbor.x,
                    z: current.z - neighbor.z
                };
                
                flowField.set(neighbor, {
                    direction: direction,
                    cost: currentCost + this.distance(current, neighbor)
                });
            }
        }
        
        return flowField;
    }
    
    /**
     * Funciones auxiliares para pathfinding
     */
    heuristic(a, b) {
        return Math.sqrt((a.x - b.x) ** 2 + (a.z - b.z) ** 2);
    }
    
    distance(a, b) {
        return Math.sqrt((a.x - b.x) ** 2 + (a.z - b.z) ** 2);
    }
    
    reconstructPath(cameFrom, current) {
        const path = [current];
        while (cameFrom.has(current)) {
            current = cameFrom.get(current);
            path.unshift(current);
        }
        return path;
    }
    
    /**
     * Inicializar sistema de comportamiento
     */
    async initializeBehaviorSystem() {
        this.systems.behavior = {
            trees: new Map(),
            blackboard: new Map(),
            actions: new Map(),
            conditions: new Map(),
            decorators: new Map()
        };
        
        // Crear acciones básicas
        this.createBasicActions();
        
        // Crear condiciones básicas
        this.createBasicConditions();
        
        // Crear decoradores básicos
        this.createBasicDecorators();
        
        console.log('✅ Sistema de comportamiento inicializado');
    }
    
    /**
     * Crear acciones básicas
     */
    createBasicActions() {
        // Acción de movimiento
        this.systems.behavior.actions.set('move', {
            execute: (agent, target) => {
                const path = this.findPath(agent.position, target);
                if (path && path.length > 1) {
                    const nextNode = path[1];
                    const direction = {
                        x: nextNode.x - agent.position.x,
                        z: nextNode.z - agent.position.z
                    };
                    const distance = Math.sqrt(direction.x ** 2 + direction.z ** 2);
                    
                    if (distance > 0.1) {
                        direction.x /= distance;
                        direction.z /= distance;
                        
                        agent.position.x += direction.x * agent.speed * this.deltaTime;
                        agent.position.z += direction.z * agent.speed * this.deltaTime;
                        
                        return 'running';
                    }
                }
                return 'success';
            }
        });
        
        // Acción de espera
        this.systems.behavior.actions.set('wait', {
            execute: (agent, duration) => {
                if (!agent.waitStartTime) {
                    agent.waitStartTime = this.time;
                }
                
                if (this.time - agent.waitStartTime >= duration) {
                    agent.waitStartTime = null;
                    return 'success';
                }
                
                return 'running';
            }
        });
        
        // Acción de interacción
        this.systems.behavior.actions.set('interact', {
            execute: (agent, target) => {
                const distance = this.distance(agent.position, target.position);
                if (distance <= agent.interactionRange) {
                    // Realizar interacción
                    return 'success';
                }
                return 'running';
            }
        });
        
        console.log('✅ Acciones básicas creadas');
    }
    
    /**
     * Crear condiciones básicas
     */
    createBasicConditions() {
        // Condición de distancia
        this.systems.behavior.conditions.set('distance', {
            check: (agent, target, maxDistance) => {
                const distance = this.distance(agent.position, target.position);
                return distance <= maxDistance;
            }
        });
        
        // Condición de tiempo
        this.systems.behavior.conditions.set('time', {
            check: (agent, minTime) => {
                return this.time >= minTime;
            }
        });
        
        // Condición de salud
        this.systems.behavior.conditions.set('health', {
            check: (agent, minHealth) => {
                return agent.health >= minHealth;
            }
        });
        
        console.log('✅ Condiciones básicas creadas');
    }
    
    /**
     * Crear decoradores básicos
     */
    createBasicDecorators() {
        // Decorador de repetición
        this.systems.behavior.decorators.set('repeat', {
            execute: (node, agent, ...args) => {
                const result = node.execute(agent, ...args);
                if (result === 'success' || result === 'failure') {
                    return 'running'; // Continuar repitiendo
                }
                return result;
            }
        });
        
        // Decorador de inversión
        this.systems.behavior.decorators.set('invert', {
            execute: (node, agent, ...args) => {
                const result = node.execute(agent, ...args);
                if (result === 'success') return 'failure';
                if (result === 'failure') return 'success';
                return result;
            }
        });
        
        console.log('✅ Decoradores básicos creados');
    }
    
    /**
     * Inicializar sistema de diálogo
     */
    async initializeDialogueSystem() {
        this.systems.dialogue = {
            conversations: new Map(),
            responses: new Map(),
            emotions: new Map(),
            personalities: new Map(),
            topics: new Map()
        };
        
        // Crear diálogos básicos
        await this.createBasicDialogues();
        
        console.log('✅ Sistema de diálogo inicializado');
    }
    
    /**
     * Crear diálogos básicos
     */
    async createBasicDialogues() {
        // Diálogo de saludo
        this.systems.dialogue.conversations.set('greeting', {
            id: 'greeting',
            responses: [
                { text: '¡Hola! ¿Cómo estás?', emotion: 'friendly', next: 'greeting_response' },
                { text: 'Buenos días.', emotion: 'neutral', next: 'greeting_response' },
                { text: '¡Hey!', emotion: 'excited', next: 'greeting_response' }
            ],
            conditions: {
                timeOfDay: 'any',
                relationship: 'any'
            }
        });
        
        // Respuesta al saludo
        this.systems.dialogue.responses.set('greeting_response', {
            id: 'greeting_response',
            responses: [
                { text: '¡Muy bien, gracias!', emotion: 'happy', weight: 0.6 },
                { text: 'Bien, ¿y tú?', emotion: 'curious', weight: 0.3 },
                { text: 'Regular...', emotion: 'sad', weight: 0.1 }
            ]
        });
        
        // Personalidades
        this.systems.dialogue.personalities.set('friendly', {
            name: 'friendly',
            traits: {
                openness: 0.8,
                conscientiousness: 0.7,
                extraversion: 0.9,
                agreeableness: 0.9,
                neuroticism: 0.2
            },
            responseModifiers: {
                positive: 1.2,
                negative: 0.8
            }
        });
        
        console.log('✅ Diálogos básicos creados');
    }
    
    /**
     * Inicializar redes neuronales
     */
    async initializeNeuralNetworks() {
        this.systems.neural = {
            networks: new Map(),
            layers: new Map(),
            activations: new Map(),
            optimizers: new Map(),
            datasets: new Map()
        };
        
        // Crear funciones de activación
        this.createActivationFunctions();
        
        // Crear optimizadores
        this.createOptimizers();
        
        console.log('✅ Redes neuronales inicializadas');
    }
    
    /**
     * Crear funciones de activación
     */
    createActivationFunctions() {
        // Función sigmoid
        this.systems.neural.activations.set('sigmoid', {
            function: (x) => 1 / (1 + Math.exp(-x)),
            derivative: (x) => x * (1 - x)
        });
        
        // Función ReLU
        this.systems.neural.activations.set('relu', {
            function: (x) => Math.max(0, x),
            derivative: (x) => x > 0 ? 1 : 0
        });
        
        // Función tanh
        this.systems.neural.activations.set('tanh', {
            function: (x) => Math.tanh(x),
            derivative: (x) => 1 - x * x
        });
        
        console.log('✅ Funciones de activación creadas');
    }
    
    /**
     * Crear optimizadores
     */
    createOptimizers() {
        // Optimizador SGD
        this.systems.neural.optimizers.set('sgd', {
            name: 'sgd',
            learningRate: 0.01,
            momentum: 0.9,
            update: (weights, gradients, velocity) => {
                velocity = velocity.map((v, i) => 
                    this.systems.neural.optimizers.get('sgd').momentum * v + 
                    this.systems.neural.optimizers.get('sgd').learningRate * gradients[i]
                );
                
                return weights.map((w, i) => w - velocity[i]);
            }
        });
        
        // Optimizador Adam
        this.systems.neural.optimizers.set('adam', {
            name: 'adam',
            learningRate: 0.001,
            beta1: 0.9,
            beta2: 0.999,
            epsilon: 1e-8,
            update: (weights, gradients, m, v, t) => {
                m = m.map((mi, i) => 
                    this.systems.neural.optimizers.get('adam').beta1 * mi + 
                    (1 - this.systems.neural.optimizers.get('adam').beta1) * gradients[i]
                );
                
                v = v.map((vi, i) => 
                    this.systems.neural.optimizers.get('adam').beta2 * vi + 
                    (1 - this.systems.neural.optimizers.get('adam').beta2) * gradients[i] * gradients[i]
                );
                
                const mHat = m.map(mi => mi / (1 - Math.pow(this.systems.neural.optimizers.get('adam').beta1, t)));
                const vHat = v.map(vi => vi / (1 - Math.pow(this.systems.neural.optimizers.get('adam').beta2, t)));
                
                return weights.map((w, i) => 
                    w - this.systems.neural.optimizers.get('adam').learningRate * mHat[i] / 
                    (Math.sqrt(vHat[i]) + this.systems.neural.optimizers.get('adam').epsilon)
                );
            }
        });
        
        console.log('✅ Optimizadores creados');
    }
    
    /**
     * Inicializar generación procedural
     */
    async initializeProceduralGeneration() {
        this.systems.procedural = {
            generators: new Map(),
            templates: new Map(),
            rules: new Map(),
            seeds: new Map()
        };
        
        // Crear generadores básicos
        this.createBasicGenerators();
        
        console.log('✅ Generación procedural inicializada');
    }
    
    /**
     * Crear generadores básicos
     */
    createBasicGenerators() {
        // Generador de terreno
        this.systems.procedural.generators.set('terrain', {
            generate: (width, height, seed) => {
                const terrain = [];
                const noise = this.generatePerlinNoise(width, height, seed);
                
                for (let x = 0; x < width; x++) {
                    terrain[x] = [];
                    for (let z = 0; z < height; z++) {
                        terrain[x][z] = {
                            height: noise[x][z],
                            type: this.getTerrainType(noise[x][z]),
                            vegetation: this.getVegetation(noise[x][z])
                        };
                    }
                }
                
                return terrain;
            }
        });
        
        // Generador de edificios
        this.systems.procedural.generators.set('building', {
            generate: (type, size, seed) => {
                const building = {
                    type: type,
                    size: size,
                    floors: Math.floor(Math.random() * 10) + 1,
                    windows: [],
                    doors: [],
                    roof: this.generateRoof(type, size)
                };
                
                // Generar ventanas y puertas
                for (let floor = 0; floor < building.floors; floor++) {
                    for (let side = 0; side < 4; side++) {
                        const windowCount = Math.floor(Math.random() * 3) + 1;
                        for (let i = 0; i < windowCount; i++) {
                            building.windows.push({
                                floor: floor,
                                side: side,
                                position: Math.random()
                            });
                        }
                    }
                }
                
                return building;
            }
        });
        
        console.log('✅ Generadores básicos creados');
    }
    
    /**
     * Generar ruido Perlin
     */
    generatePerlinNoise(width, height, seed) {
        const noise = [];
        for (let x = 0; x < width; x++) {
            noise[x] = [];
            for (let y = 0; y < height; y++) {
                noise[x][y] = this.perlinNoise(x * 0.1, y * 0.1, seed);
            }
        }
        return noise;
    }
    
    /**
     * Función de ruido Perlin simplificada
     */
    perlinNoise(x, y, seed) {
        // Implementación simplificada
        return (Math.sin(x * 10 + seed) + Math.sin(y * 10 + seed)) / 2;
    }
    
    /**
     * Obtener tipo de terreno
     */
    getTerrainType(height) {
        if (height < 0.2) return 'water';
        if (height < 0.4) return 'sand';
        if (height < 0.7) return 'grass';
        if (height < 0.9) return 'forest';
        return 'mountain';
    }
    
    /**
     * Obtener vegetación
     */
    getVegetation(height) {
        if (height < 0.4) return 'none';
        if (height < 0.6) return 'grass';
        if (height < 0.8) return 'trees';
        return 'dense_forest';
    }
    
    /**
     * Generar techo
     */
    generateRoof(type, size) {
        const roofs = ['flat', 'gabled', 'hip', 'dome'];
        return roofs[Math.floor(Math.random() * roofs.length)];
    }
    
    /**
     * Crear NPC
     */
    createNPC(options = {}) {
        const {
            id = `npc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            name = 'NPC',
            position = { x: 0, y: 0, z: 0 },
            model = null,
            behavior = 'idle',
            personality = 'friendly',
            dialogue = 'greeting',
            speed = 2.0,
            health = 100,
            interactionRange = 2.0
        } = options;
        
        // Crear mesh del NPC
        let npcMesh;
        if (model) {
            npcMesh = model.clone();
        } else {
            const geometry = new THREE.CapsuleGeometry(0.5, 1.5, 4, 8);
            const material = new THREE.MeshLambertMaterial({ color: 0x888888 });
            npcMesh = new THREE.Mesh(geometry, material);
        }
        
        npcMesh.position.set(position.x, position.y, position.z);
        this.scene.add(npcMesh);
        
        // Crear objeto NPC
        const npc = {
            id,
            name,
            mesh: npcMesh,
            position: { ...position },
            behavior: behavior,
            personality: personality,
            dialogue: dialogue,
            speed: speed,
            health: health,
            interactionRange: interactionRange,
            target: null,
            path: [],
            currentAction: null,
            emotion: 'neutral',
            lastInteraction: 0,
            blackboard: new Map()
        };
        
        this.npcs.set(id, npc);
        this.metrics.activeNPCs++;
        
        console.log(`🤖 NPC creado: ${name} (${id})`);
        
        return npc;
    }
    
    /**
     * Crear agente de IA
     */
    createAgent(options = {}) {
        const {
            id = `agent_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            type = 'basic',
            position = { x: 0, y: 0, z: 0 },
            behaviorTree = null,
            neuralNetwork = null,
            sensors = [],
            actuators = []
        } = options;
        
        const agent = {
            id,
            type,
            position: { ...position },
            behaviorTree,
            neuralNetwork,
            sensors,
            actuators,
            memory: new Map(),
            goals: [],
            currentGoal: null,
            state: 'idle'
        };
        
        this.agents.set(id, agent);
        this.metrics.activeAgents++;
        
        console.log(`🤖 Agente creado: ${type} (${id})`);
        
        return agent;
    }
    
    /**
     * Crear NPCs por defecto
     */
    async createDefaultNPCs() {
        // NPC comerciante
        this.createNPC({
            name: 'Comerciante',
            position: { x: 10, y: 0, z: 10 },
            behavior: 'merchant',
            personality: 'friendly',
            dialogue: 'greeting'
        });
        
        // NPC guardia
        this.createNPC({
            name: 'Guardia',
            position: { x: -10, y: 0, z: -10 },
            behavior: 'guard',
            personality: 'neutral',
            dialogue: 'greeting'
        });
        
        // NPC viajero
        this.createNPC({
            name: 'Viajero',
            position: { x: 0, y: 0, z: 20 },
            behavior: 'wanderer',
            personality: 'curious',
            dialogue: 'greeting'
        });
        
        console.log('✅ NPCs por defecto creados');
    }
    
    /**
     * Crear comportamientos por defecto
     */
    async createDefaultBehaviors() {
        // Comportamiento de comerciante
        this.behaviors.set('merchant', {
            name: 'merchant',
            tree: {
                type: 'sequence',
                children: [
                    { type: 'condition', name: 'has_customers' },
                    { type: 'action', name: 'greet_customer' },
                    { type: 'action', name: 'show_products' },
                    { type: 'action', name: 'negotiate_price' },
                    { type: 'action', name: 'complete_transaction' }
                ]
            }
        });
        
        // Comportamiento de guardia
        this.behaviors.set('guard', {
            name: 'guard',
            tree: {
                type: 'selector',
                children: [
                    { type: 'sequence', children: [
                        { type: 'condition', name: 'threat_detected' },
                        { type: 'action', name: 'investigate' },
                        { type: 'action', name: 'alert_others' }
                    ]},
                    { type: 'sequence', children: [
                        { type: 'condition', name: 'patrol_time' },
                        { type: 'action', name: 'patrol_area' }
                    ]},
                    { type: 'action', name: 'stand_guard' }
                ]
            }
        });
        
        // Comportamiento de viajero
        this.behaviors.set('wanderer', {
            name: 'wanderer',
            tree: {
                type: 'sequence',
                children: [
                    { type: 'action', name: 'choose_destination' },
                    { type: 'action', name: 'move_to_destination' },
                    { type: 'action', name: 'explore_area' },
                    { type: 'action', name: 'rest' }
                ]
            }
        });
        
        console.log('✅ Comportamientos por defecto creados');
    }
    
    /**
     * Encontrar camino
     */
    findPath(start, goal) {
        const startNode = this.findNearestNode(start);
        const goalNode = this.findNearestNode(goal);
        
        if (startNode && goalNode) {
            return this.systems.pathfinding.algorithms.aStar(startNode, goalNode);
        }
        
        return null;
    }
    
    /**
     * Encontrar nodo más cercano
     */
    findNearestNode(position) {
        let nearest = null;
        let minDistance = Infinity;
        
        this.systems.pathfinding.nodes.forEach(node => {
            const distance = this.distance(position, node);
            if (distance < minDistance) {
                minDistance = distance;
                nearest = node;
            }
        });
        
        return nearest;
    }
    
    /**
     * Actualizar sistema de IA
     */
    update(deltaTime) {
        if (!this.states.isInitialized || !this.states.isEnabled) return;
        
        this.time += deltaTime;
        this.deltaTime = deltaTime;
        
        // Actualizar NPCs
        this.updateNPCs();
        
        // Actualizar agentes
        this.updateAgents();
        
        // Actualizar comportamientos
        this.updateBehaviors();
        
        // Actualizar redes neuronales
        this.updateNeuralNetworks();
        
        // Actualizar métricas
        this.updateMetrics();
        
        this.states.isRunning = true;
    }
    
    /**
     * Actualizar NPCs
     */
    updateNPCs() {
        this.npcs.forEach(npc => {
            // Actualizar comportamiento
            this.updateNPCBehavior(npc);
            
            // Actualizar posición del mesh
            npc.mesh.position.copy(npc.position);
            
            // Actualizar diálogo
            this.updateNPCDialogue(npc);
        });
    }
    
    /**
     * Actualizar comportamiento de NPC
     */
    updateNPCBehavior(npc) {
        const behavior = this.behaviors.get(npc.behavior);
        if (behavior) {
            // Ejecutar árbol de comportamiento
            this.executeBehaviorTree(behavior.tree, npc);
        }
    }
    
    /**
     * Ejecutar árbol de comportamiento
     */
    executeBehaviorTree(node, agent) {
        switch (node.type) {
            case 'sequence':
                for (const child of node.children) {
                    const result = this.executeBehaviorTree(child, agent);
                    if (result === 'failure') return 'failure';
                    if (result === 'running') return 'running';
                }
                return 'success';
                
            case 'selector':
                for (const child of node.children) {
                    const result = this.executeBehaviorTree(child, agent);
                    if (result === 'success') return 'success';
                    if (result === 'running') return 'running';
                }
                return 'failure';
                
            case 'action':
                const action = this.systems.behavior.actions.get(node.name);
                if (action) {
                    return action.execute(agent, node.parameters);
                }
                return 'failure';
                
            case 'condition':
                const condition = this.systems.behavior.conditions.get(node.name);
                if (condition) {
                    return condition.check(agent, node.parameters) ? 'success' : 'failure';
                }
                return 'failure';
                
            default:
                return 'failure';
        }
    }
    
    /**
     * Actualizar diálogo de NPC
     */
    updateNPCDialogue(npc) {
        // Verificar si hay jugador cerca
        const player = this.findNearestPlayer(npc.position);
        if (player && this.distance(npc.position, player.position) <= npc.interactionRange) {
            if (this.time - npc.lastInteraction > 5) { // 5 segundos entre interacciones
                this.startDialogue(npc, player);
                npc.lastInteraction = this.time;
            }
        }
    }
    
    /**
     * Encontrar jugador más cercano
     */
    findNearestPlayer(position) {
        // Implementación simplificada - buscar en la escena
        const players = this.scene.children.filter(child => 
            child.userData && child.userData.isPlayer
        );
        
        if (players.length > 0) {
            return players[0];
        }
        
        return null;
    }
    
    /**
     * Iniciar diálogo
     */
    startDialogue(npc, player) {
        const conversation = this.systems.dialogue.conversations.get(npc.dialogue);
        if (conversation) {
            const response = conversation.responses[
                Math.floor(Math.random() * conversation.responses.length)
            ];
            
            console.log(`${npc.name}: ${response.text}`);
            
            // Mostrar diálogo en la UI
            this.showDialogue(npc.name, response.text, response.emotion);
        }
    }
    
    /**
     * Mostrar diálogo en UI
     */
    showDialogue(speaker, text, emotion) {
        // Crear elemento de diálogo
        const dialogueElement = document.createElement('div');
        dialogueElement.className = 'dialogue-bubble';
        dialogueElement.innerHTML = `
            <div class="speaker">${speaker}</div>
            <div class="text">${text}</div>
            <div class="emotion">${emotion}</div>
        `;
        
        // Añadir al DOM
        document.body.appendChild(dialogueElement);
        
        // Remover después de 3 segundos
        setTimeout(() => {
            document.body.removeChild(dialogueElement);
        }, 3000);
    }
    
    /**
     * Actualizar agentes
     */
    updateAgents() {
        this.agents.forEach(agent => {
            // Actualizar sensores
            this.updateAgentSensors(agent);
            
            // Actualizar red neuronal
            if (agent.neuralNetwork) {
                this.updateAgentNeuralNetwork(agent);
            }
            
            // Actualizar actuadores
            this.updateAgentActuators(agent);
        });
    }
    
    /**
     * Actualizar sensores del agente
     */
    updateAgentSensors(agent) {
        agent.sensors.forEach(sensor => {
            const data = this.getSensorData(sensor, agent);
            agent.memory.set(sensor.name, data);
        });
    }
    
    /**
     * Obtener datos del sensor
     */
    getSensorData(sensor, agent) {
        switch (sensor.type) {
            case 'vision':
                return this.getVisionData(agent, sensor.range, sensor.fov);
            case 'hearing':
                return this.getHearingData(agent, sensor.range);
            case 'touch':
                return this.getTouchData(agent, sensor.range);
            default:
                return null;
        }
    }
    
    /**
     * Obtener datos de visión
     */
    getVisionData(agent, range, fov) {
        // Implementación simplificada
        const visibleObjects = [];
        
        this.scene.children.forEach(child => {
            if (child !== agent.mesh) {
                const distance = this.distance(agent.position, child.position);
                if (distance <= range) {
                    visibleObjects.push({
                        object: child,
                        distance: distance,
                        type: child.userData.type || 'unknown'
                    });
                }
            }
        });
        
        return visibleObjects;
    }
    
    /**
     * Obtener datos de audición
     */
    getHearingData(agent, range) {
        // Implementación simplificada
        return [];
    }
    
    /**
     * Obtener datos de tacto
     */
    getTouchData(agent, range) {
        // Implementación simplificada
        return [];
    }
    
    /**
     * Actualizar red neuronal del agente
     */
    updateAgentNeuralNetwork(agent) {
        // Implementación simplificada
        const inputs = Array.from(agent.memory.values());
        const outputs = this.runNeuralNetwork(agent.neuralNetwork, inputs);
        
        // Aplicar salidas a actuadores
        agent.actuators.forEach((actuator, index) => {
            if (outputs[index] !== undefined) {
                this.applyActuator(actuator, outputs[index]);
            }
        });
    }
    
    /**
     * Ejecutar red neuronal
     */
    runNeuralNetwork(network, inputs) {
        // Implementación simplificada
        return inputs.map(input => Math.random()); // Salida aleatoria por ahora
    }
    
    /**
     * Aplicar actuador
     */
    applyActuator(actuator, value) {
        switch (actuator.type) {
            case 'movement':
                // Mover agente
                break;
            case 'rotation':
                // Rotar agente
                break;
            case 'action':
                // Realizar acción
                break;
        }
    }
    
    /**
     * Actualizar comportamientos
     */
    updateBehaviors() {
        this.behaviors.forEach(behavior => {
            // Actualizar árbol de comportamiento
            this.updateBehaviorTree(behavior.tree);
        });
    }
    
    /**
     * Actualizar árbol de comportamiento
     */
    updateBehaviorTree(node) {
        // Implementación simplificada
        if (node.children) {
            node.children.forEach(child => {
                this.updateBehaviorTree(child);
            });
        }
    }
    
    /**
     * Actualizar redes neuronales
     */
    updateNeuralNetworks() {
        if (this.states.isLearning) {
            this.neuralNetworks.forEach(network => {
                this.trainNeuralNetwork(network);
            });
        }
    }
    
    /**
     * Entrenar red neuronal
     */
    trainNeuralNetwork(network) {
        // Implementación simplificada
        this.metrics.learningIterations++;
    }
    
    /**
     * Actualizar métricas
     */
    updateMetrics() {
        this.metrics.activeNPCs = this.npcs.size;
        this.metrics.activeAgents = this.agents.size;
        this.metrics.activeBehaviors = this.behaviors.size;
        this.metrics.neuralNetworks = this.neuralNetworks.size;
        this.metrics.fps = 1 / this.deltaTime;
        this.metrics.memoryUsage = this.calculateMemoryUsage();
    }
    
    /**
     * Calcular uso de memoria
     */
    calculateMemoryUsage() {
        let total = 0;
        
        // Memoria de NPCs
        this.npcs.forEach(npc => {
            total += npc.mesh.geometry.attributes.position.count * 4;
        });
        
        // Memoria de agentes
        this.agents.forEach(agent => {
            total += agent.memory.size * 16;
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
     * Obtener NPCs
     */
    getNPCs() {
        return this.npcs;
    }
    
    /**
     * Obtener agentes
     */
    getAgents() {
        return this.agents;
    }
    
    /**
     * Limpiar recursos
     */
    dispose() {
        // Limpiar NPCs
        this.npcs.forEach(npc => {
            this.scene.remove(npc.mesh);
            npc.mesh.geometry.dispose();
            npc.mesh.material.dispose();
        });
        this.npcs.clear();
        
        // Limpiar agentes
        this.agents.clear();
        
        // Limpiar comportamientos
        this.behaviors.clear();
        
        // Limpiar pathfinding
        this.pathfinding.clear();
        
        // Limpiar diálogos
        this.dialogue.clear();
        
        console.log('🧹 Sistema de IA limpiado');
    }
}

// Exportar para uso global
window.AISystem = AISystem; 
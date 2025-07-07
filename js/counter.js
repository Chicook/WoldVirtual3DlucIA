/**
 * Sistema Avanzado de Contadores y Métricas - Metaverso Crypto World Virtual 3D
 * Contadores especializados para tracking de recursos y rendimiento del metaverso
 */

"use strict";

class AdvancedCounter {
    constructor() {
        // Contadores básicos
        this._files = 0;
        this._directories = 0;
        this._totalSize = 0;
        
        // Contadores específicos del metaverso
        this._models = 0;
        this._textures = 0;
        this._shaders = 0;
        this._audio = 0;
        this._nfts = 0;
        this._transactions = 0;
        this._users = 0;
        this._worlds = 0;
        
        // Contadores de rendimiento
        this._fps = 0;
        this._memoryUsage = 0;
        this._drawCalls = 0;
        this._triangles = 0;
        this._particles = 0;
        this._lights = 0;
        
        // Contadores de blockchain
        this._blockchainConnections = 0;
        this._smartContracts = 0;
        this._defiProtocols = 0;
        this._cryptoBalance = 0;
        
        // Contadores de IA
        this._aiAgents = 0;
        this._npcCount = 0;
        this._behaviorTrees = 0;
        this._neuralNetworks = 0;
        
        // Contadores de VR
        this._vrSessions = 0;
        this._vrControllers = 0;
        this._vrHands = 0;
        this._spatialAnchors = 0;
        
        // Historial de cambios
        this._history = [];
        this._maxHistorySize = 1000;
        
        // Eventos
        this.events = new EventTarget();
        
        console.log('📊 Contador Avanzado inicializado');
    }
    
    // Getters y setters básicos
    set files(num) {
        const oldValue = this._files;
        this._files = num;
        this._trackChange('files', oldValue, num);
    }
    
    get files() {
        return this._files;
    }
    
    set directories(num) {
        const oldValue = this._directories;
        this._directories = num;
        this._trackChange('directories', oldValue, num);
    }
    
    get directories() {
        return this._directories;
    }
    
    /**
     * @deprecated use `directories` instead
     */
    get dirs() {
        return this._directories;
    }
    
    // Getters y setters del metaverso
    set models(num) {
        const oldValue = this._models;
        this._models = num;
        this._trackChange('models', oldValue, num);
    }
    
    get models() {
        return this._models;
    }
    
    set textures(num) {
        const oldValue = this._textures;
        this._textures = num;
        this._trackChange('textures', oldValue, num);
    }
    
    get textures() {
        return this._textures;
    }
    
    set shaders(num) {
        const oldValue = this._shaders;
        this._shaders = num;
        this._trackChange('shaders', oldValue, num);
    }
    
    get shaders() {
        return this._shaders;
    }
    
    set audio(num) {
        const oldValue = this._audio;
        this._audio = num;
        this._trackChange('audio', oldValue, num);
    }
    
    get audio() {
        return this._audio;
    }
    
    set nfts(num) {
        const oldValue = this._nfts;
        this._nfts = num;
        this._trackChange('nfts', oldValue, num);
    }
    
    get nfts() {
        return this._nfts;
    }
    
    set transactions(num) {
        const oldValue = this._transactions;
        this._transactions = num;
        this._trackChange('transactions', oldValue, num);
    }
    
    get transactions() {
        return this._transactions;
    }
    
    set users(num) {
        const oldValue = this._users;
        this._users = num;
        this._trackChange('users', oldValue, num);
    }
    
    get users() {
        return this._users;
    }
    
    set worlds(num) {
        const oldValue = this._worlds;
        this._worlds = num;
        this._trackChange('worlds', oldValue, num);
    }
    
    get worlds() {
        return this._worlds;
    }
    
    // Getters y setters de rendimiento
    set fps(num) {
        const oldValue = this._fps;
        this._fps = num;
        this._trackChange('fps', oldValue, num);
    }
    
    get fps() {
        return this._fps;
    }
    
    set memoryUsage(num) {
        const oldValue = this._memoryUsage;
        this._memoryUsage = num;
        this._trackChange('memoryUsage', oldValue, num);
    }
    
    get memoryUsage() {
        return this._memoryUsage;
    }
    
    set drawCalls(num) {
        const oldValue = this._drawCalls;
        this._drawCalls = num;
        this._trackChange('drawCalls', oldValue, num);
    }
    
    get drawCalls() {
        return this._drawCalls;
    }
    
    set triangles(num) {
        const oldValue = this._triangles;
        this._triangles = num;
        this._trackChange('triangles', oldValue, num);
    }
    
    get triangles() {
        return this._triangles;
    }
    
    set particles(num) {
        const oldValue = this._particles;
        this._particles = num;
        this._trackChange('particles', oldValue, num);
    }
    
    get particles() {
        return this._particles;
    }
    
    set lights(num) {
        const oldValue = this._lights;
        this._lights = num;
        this._trackChange('lights', oldValue, num);
    }
    
    get lights() {
        return this._lights;
    }
    
    // Getters y setters de blockchain
    set blockchainConnections(num) {
        const oldValue = this._blockchainConnections;
        this._blockchainConnections = num;
        this._trackChange('blockchainConnections', oldValue, num);
    }
    
    get blockchainConnections() {
        return this._blockchainConnections;
    }
    
    set smartContracts(num) {
        const oldValue = this._smartContracts;
        this._smartContracts = num;
        this._trackChange('smartContracts', oldValue, num);
    }
    
    get smartContracts() {
        return this._smartContracts;
    }
    
    set defiProtocols(num) {
        const oldValue = this._defiProtocols;
        this._defiProtocols = num;
        this._trackChange('defiProtocols', oldValue, num);
    }
    
    get defiProtocols() {
        return this._defiProtocols;
    }
    
    set cryptoBalance(num) {
        const oldValue = this._cryptoBalance;
        this._cryptoBalance = num;
        this._trackChange('cryptoBalance', oldValue, num);
    }
    
    get cryptoBalance() {
        return this._cryptoBalance;
    }
    
    // Getters y setters de IA
    set aiAgents(num) {
        const oldValue = this._aiAgents;
        this._aiAgents = num;
        this._trackChange('aiAgents', oldValue, num);
    }
    
    get aiAgents() {
        return this._aiAgents;
    }
    
    set npcCount(num) {
        const oldValue = this._npcCount;
        this._npcCount = num;
        this._trackChange('npcCount', oldValue, num);
    }
    
    get npcCount() {
        return this._npcCount;
    }
    
    set behaviorTrees(num) {
        const oldValue = this._behaviorTrees;
        this._behaviorTrees = num;
        this._trackChange('behaviorTrees', oldValue, num);
    }
    
    get behaviorTrees() {
        return this._behaviorTrees;
    }
    
    set neuralNetworks(num) {
        const oldValue = this._neuralNetworks;
        this._neuralNetworks = num;
        this._trackChange('neuralNetworks', oldValue, num);
    }
    
    get neuralNetworks() {
        return this._neuralNetworks;
    }
    
    // Getters y setters de VR
    set vrSessions(num) {
        const oldValue = this._vrSessions;
        this._vrSessions = num;
        this._trackChange('vrSessions', oldValue, num);
    }
    
    get vrSessions() {
        return this._vrSessions;
    }
    
    set vrControllers(num) {
        const oldValue = this._vrControllers;
        this._vrControllers = num;
        this._trackChange('vrControllers', oldValue, num);
    }
    
    get vrControllers() {
        return this._vrControllers;
    }
    
    set vrHands(num) {
        const oldValue = this._vrHands;
        this._vrHands = num;
        this._trackChange('vrHands', oldValue, num);
    }
    
    get vrHands() {
        return this._vrHands;
    }
    
    set spatialAnchors(num) {
        const oldValue = this._spatialAnchors;
        this._spatialAnchors = num;
        this._trackChange('spatialAnchors', oldValue, num);
    }
    
    get spatialAnchors() {
        return this._spatialAnchors;
    }
    
    /**
     * Rastrear cambios en los contadores
     */
    _trackChange(property, oldValue, newValue) {
        const change = {
            property,
            oldValue,
            newValue,
            timestamp: Date.now(),
            delta: newValue - oldValue
        };
        
        this._history.push(change);
        
        // Mantener tamaño del historial
        if (this._history.length > this._maxHistorySize) {
            this._history.shift();
        }
        
        // Emitir evento
        this.events.dispatchEvent(new CustomEvent('counter-changed', {
            detail: change
        }));
    }
    
    /**
     * Incrementar contador
     */
    increment(property, amount = 1) {
        const currentValue = this[property] || 0;
        this[property] = currentValue + amount;
    }
    
    /**
     * Decrementar contador
     */
    decrement(property, amount = 1) {
        const currentValue = this[property] || 0;
        this[property] = Math.max(0, currentValue - amount);
    }
    
    /**
     * Resetear contador
     */
    reset(property) {
        const oldValue = this[property] || 0;
        this[property] = 0;
        this._trackChange(property, oldValue, 0);
    }
    
    /**
     * Resetear todos los contadores
     */
    resetAll() {
        const properties = [
            'files', 'directories', 'models', 'textures', 'shaders', 'audio',
            'nfts', 'transactions', 'users', 'worlds', 'fps', 'memoryUsage',
            'drawCalls', 'triangles', 'particles', 'lights', 'blockchainConnections',
            'smartContracts', 'defiProtocols', 'cryptoBalance', 'aiAgents',
            'npcCount', 'behaviorTrees', 'neuralNetworks', 'vrSessions',
            'vrControllers', 'vrHands', 'spatialAnchors'
        ];
        
        properties.forEach(property => {
            this.reset(property);
        });
    }
    
    /**
     * Obtener estadísticas
     */
    getStats() {
        return {
            total: this._files + this._directories,
            metaverse: {
                models: this._models,
                textures: this._textures,
                shaders: this._shaders,
                audio: this._audio,
                nfts: this._nfts,
                transactions: this._transactions,
                users: this._users,
                worlds: this._worlds
            },
            performance: {
                fps: this._fps,
                memoryUsage: this._memoryUsage,
                drawCalls: this._drawCalls,
                triangles: this._triangles,
                particles: this._particles,
                lights: this._lights
            },
            blockchain: {
                connections: this._blockchainConnections,
                smartContracts: this._smartContracts,
                defiProtocols: this._defiProtocols,
                balance: this._cryptoBalance
            },
            ai: {
                agents: this._aiAgents,
                npcs: this._npcCount,
                behaviorTrees: this._behaviorTrees,
                neuralNetworks: this._neuralNetworks
            },
            vr: {
                sessions: this._vrSessions,
                controllers: this._vrControllers,
                hands: this._vrHands,
                spatialAnchors: this._spatialAnchors
            }
        };
    }
    
    /**
     * Obtener historial de cambios
     */
    getHistory(property = null, limit = 100) {
        let history = this._history;
        
        if (property) {
            history = history.filter(change => change.property === property);
        }
        
        return history.slice(-limit);
    }
    
    /**
     * Obtener tendencias
     */
    getTrends(property, timeWindow = 60000) { // 1 minuto por defecto
        const now = Date.now();
        const changes = this._history.filter(change => 
            change.property === property && 
            (now - change.timestamp) <= timeWindow
        );
        
        if (changes.length === 0) return { trend: 0, average: 0 };
        
        const deltas = changes.map(change => change.delta);
        const trend = deltas.reduce((sum, delta) => sum + delta, 0);
        const average = trend / changes.length;
        
        return { trend, average, changes: changes.length };
    }
    
    /**
     * Crear contador especializado para recursos
     */
    createResourceCounter() {
        return {
            models: 0,
            textures: 0,
            shaders: 0,
            audio: 0,
            materials: 0,
            geometries: 0,
            
            increment: function(type, amount = 1) {
                if (this.hasOwnProperty(type)) {
                    this[type] += amount;
                }
            },
            
            decrement: function(type, amount = 1) {
                if (this.hasOwnProperty(type)) {
                    this[type] = Math.max(0, this[type] - amount);
                }
            },
            
            getTotal: function() {
                return Object.values(this).reduce((sum, count) => sum + count, 0);
            },
            
            reset: function() {
                Object.keys(this).forEach(key => {
                    this[key] = 0;
                });
            }
        };
    }
    
    /**
     * Crear contador especializado para rendimiento
     */
    createPerformanceCounter() {
        return {
            fps: 0,
            frameTime: 0,
            memoryUsage: 0,
            drawCalls: 0,
            triangles: 0,
            points: 0,
            lines: 0,
            
            update: function(rendererInfo) {
                this.fps = 1 / this.frameTime;
                this.memoryUsage = rendererInfo.memory;
                this.drawCalls = rendererInfo.render.calls;
                this.triangles = rendererInfo.render.triangles;
                this.points = rendererInfo.render.points;
                this.lines = rendererInfo.render.lines;
            },
            
            setFrameTime: function(frameTime) {
                this.frameTime = frameTime;
            },
            
            getAverageFPS: function() {
                return this.fps;
            },
            
            getMemoryUsageMB: function() {
                return this.memoryUsage / (1024 * 1024);
            }
        };
    }
    
    /**
     * Crear contador especializado para blockchain
     */
    createBlockchainCounter() {
        return {
            connections: 0,
            transactions: 0,
            blocks: 0,
            gasUsed: 0,
            balance: 0,
            nfts: 0,
            smartContracts: 0,
            
            increment: function(type, amount = 1) {
                if (this.hasOwnProperty(type)) {
                    this[type] += amount;
                }
            },
            
            setBalance: function(balance) {
                this.balance = balance;
            },
            
            getTransactionRate: function() {
                return this.transactions / Math.max(1, this.blocks);
            },
            
            reset: function() {
                Object.keys(this).forEach(key => {
                    this[key] = 0;
                });
            }
        };
    }
    
    /**
     * Limpiar recursos
     */
    dispose() {
        this._history = [];
        this.resetAll();
        
        console.log('🧹 Contador Avanzado limpiado');
    }
}

// Clase de compatibilidad con el código original
class Counter extends AdvancedCounter {
    constructor() {
        super();
        console.log('📊 Contador básico inicializado (compatibilidad)');
    }
}

// Exportar para uso global
window.AdvancedCounter = AdvancedCounter;
window.Counter = Counter;

// Exportar para módulos
if (typeof exports !== 'undefined') {
    exports.Counter = Counter;
    exports.AdvancedCounter = AdvancedCounter;
}

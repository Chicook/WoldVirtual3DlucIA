"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Queue = void 0;
/**
 * Sistema Avanzado de Colas y Tareas - Metaverso Crypto World Virtual 3D
 * Manejo avanzado de colas de tareas para el metaverso
 */
class AdvancedQueue {
    constructor(onQueueEmpty, options = {}) {
        this.onQueueEmpty = onQueueEmpty;
        this.count = 0;
        this.maxConcurrent = options.maxConcurrent || 10;
        this.retryAttempts = options.retryAttempts || 3;
        this.retryDelay = options.retryDelay || 1000;
        this.priorityLevels = options.priorityLevels || 5;
        
        // Colas por prioridad
        this.queues = Array.from({ length: this.priorityLevels }, () => []);
        this.processing = new Set();
        this.failed = new Map();
        this.completed = [];
        
        // Métricas
        this.metrics = {
            totalTasks: 0,
            completedTasks: 0,
            failedTasks: 0,
            averageProcessingTime: 0,
            queueLength: 0
        };
        
        // Eventos
        this.events = new EventTarget();
        
        console.log('📋 Cola Avanzada inicializada');
    }
    
    /**
     * Agregar tarea a la cola
     */
    enqueue(task, priority = 2, options = {}) {
        const taskId = Date.now() + Math.random();
        const taskItem = {
            id: taskId,
            task,
            priority: Math.max(0, Math.min(this.priorityLevels - 1, priority)),
            options: {
                retryAttempts: this.retryAttempts,
                retryDelay: this.retryDelay,
                timeout: 30000, // 30 segundos por defecto
                ...options
            },
            attempts: 0,
            timestamp: Date.now(),
            status: 'queued'
        };
        
        this.queues[taskItem.priority].push(taskItem);
        this.count++;
        this.metrics.totalTasks++;
        this.metrics.queueLength = this.getQueueLength();
        
        this.events.dispatchEvent(new CustomEvent('task-enqueued', {
            detail: { task: taskItem }
        }));
        
        this.processNext();
        
        return taskId;
    }
    
    /**
     * Procesar siguiente tarea
     */
    async processNext() {
        if (this.processing.size >= this.maxConcurrent) {
            return;
        }
        
        const taskItem = this.getNextTask();
        if (!taskItem) {
            if (this.count === 0 && this.onQueueEmpty) {
                this.onQueueEmpty(null, this.getResults());
            }
            return;
        }
        
        this.processing.add(taskItem.id);
        taskItem.status = 'processing';
        
        try {
            const startTime = performance.now();
            const result = await this.executeTask(taskItem);
            const processingTime = performance.now() - startTime;
            
            taskItem.status = 'completed';
            taskItem.result = result;
            taskItem.processingTime = processingTime;
            
            this.completed.push(taskItem);
            this.metrics.completedTasks++;
            this.updateAverageProcessingTime(processingTime);
            
            this.events.dispatchEvent(new CustomEvent('task-completed', {
                detail: { task: taskItem, result }
            }));
            
        } catch (error) {
            taskItem.status = 'failed';
            taskItem.error = error;
            taskItem.attempts++;
            
            if (taskItem.attempts < taskItem.options.retryAttempts) {
                // Reintentar
                setTimeout(() => {
                    this.queues[taskItem.priority].push(taskItem);
                    this.processing.delete(taskItem.id);
                    this.processNext();
                }, taskItem.options.retryDelay * taskItem.attempts);
                
                this.events.dispatchEvent(new CustomEvent('task-retry', {
                    detail: { task: taskItem, error, attempt: taskItem.attempts }
                }));
                
                return;
            } else {
                // Falló definitivamente
                this.failed.set(taskItem.id, taskItem);
                this.metrics.failedTasks++;
                
                this.events.dispatchEvent(new CustomEvent('task-failed', {
                    detail: { task: taskItem, error }
                }));
            }
        }
        
        this.processing.delete(taskItem.id);
        this.count--;
        this.metrics.queueLength = this.getQueueLength();
        
        this.processNext();
    }
    
    /**
     * Obtener siguiente tarea
     */
    getNextTask() {
        for (let i = this.priorityLevels - 1; i >= 0; i--) {
            if (this.queues[i].length > 0) {
                return this.queues[i].shift();
            }
        }
        return null;
    }
    
    /**
     * Ejecutar tarea con timeout
     */
    async executeTask(taskItem) {
        const timeoutPromise = new Promise((_, reject) => {
            setTimeout(() => reject(new Error('Task timeout')), taskItem.options.timeout);
        });
        
        const taskPromise = taskItem.task();
        
        return Promise.race([taskPromise, timeoutPromise]);
    }
    
    /**
     * Actualizar tiempo de procesamiento promedio
     */
    updateAverageProcessingTime(processingTime) {
        const total = this.metrics.completedTasks;
        this.metrics.averageProcessingTime = 
            (this.metrics.averageProcessingTime * (total - 1) + processingTime) / total;
    }
    
    /**
     * Obtener longitud total de la cola
     */
    getQueueLength() {
        return this.queues.reduce((total, queue) => total + queue.length, 0);
    }
    
    /**
     * Obtener resultados
     */
    getResults() {
        return {
            completed: this.completed,
            failed: Array.from(this.failed.values()),
            metrics: this.getMetrics()
        };
    }
    
    /**
     * Obtener métricas
     */
    getMetrics() {
        return {
            ...this.metrics,
            processing: this.processing.size,
            queueLength: this.getQueueLength()
        };
    }
    
    /**
     * Limpiar cola
     */
    clear() {
        this.queues.forEach(queue => queue.length = 0);
        this.processing.clear();
        this.failed.clear();
        this.completed = [];
        this.count = 0;
        
        this.events.dispatchEvent(new CustomEvent('queue-cleared'));
    }
    
    /**
     * Pausar cola
     */
    pause() {
        this.isPaused = true;
        this.events.dispatchEvent(new CustomEvent('queue-paused'));
    }
    
    /**
     * Reanudar cola
     */
    resume() {
        this.isPaused = false;
        this.processNext();
        this.events.dispatchEvent(new CustomEvent('queue-resumed'));
    }
    
    /**
     * Crear cola especializada para recursos
     */
    createResourceQueue() {
        return new AdvancedQueue((error, results) => {
            console.log('Cola de recursos completada:', results);
        }, {
            maxConcurrent: 5,
            retryAttempts: 2,
            priorityLevels: 3
        });
    }
    
    /**
     * Crear cola especializada para blockchain
     */
    createBlockchainQueue() {
        return new AdvancedQueue((error, results) => {
            console.log('Cola de blockchain completada:', results);
        }, {
            maxConcurrent: 3,
            retryAttempts: 5,
            priorityLevels: 4
        });
    }
    
    /**
     * Crear cola especializada para IA
     */
    createAIQueue() {
        return new AdvancedQueue((error, results) => {
            console.log('Cola de IA completada:', results);
        }, {
            maxConcurrent: 2,
            retryAttempts: 3,
            priorityLevels: 5
        });
    }
    
    /**
     * Crear cola especializada para VR
     */
    createVRQueue() {
        return new AdvancedQueue((error, results) => {
            console.log('Cola de VR completada:', results);
        }, {
            maxConcurrent: 1,
            retryAttempts: 1,
            priorityLevels: 3
        });
    }
    
    /**
     * Crear cola de tareas del metaverso
     */
    createMetaverseTaskQueue() {
        const queue = new AdvancedQueue((error, results) => {
            console.log('Cola de tareas del metaverso completada:', results);
        }, {
            maxConcurrent: 8,
            retryAttempts: 3,
            priorityLevels: 5
        });
        
        // Agregar tareas específicas del metaverso
        queue.addMetaverseTask = function(taskType, taskData, priority = 2) {
            const task = async () => {
                switch (taskType) {
                    case 'loadModel':
                        return await this.load3DModel(taskData.url, taskData.options);
                    case 'loadTexture':
                        return await this.loadTexture(taskData.url, taskData.options);
                    case 'processNFT':
                        return await this.processNFT(taskData.tokenId, taskData.metadata);
                    case 'executeTransaction':
                        return await this.executeBlockchainTransaction(taskData);
                    case 'updateAI':
                        return await this.updateAISystem(taskData);
                    case 'syncVR':
                        return await this.syncVRState(taskData);
                    default:
                        throw new Error(`Tipo de tarea no soportado: ${taskType}`);
                }
            };
            
            return this.enqueue(task, priority, taskData.options);
        };
        
        return queue;
    }
    
    /**
     * Crear cola de renderizado
     */
    createRenderQueue() {
        const queue = new AdvancedQueue((error, results) => {
            console.log('Cola de renderizado completada:', results);
        }, {
            maxConcurrent: 1,
            retryAttempts: 0,
            priorityLevels: 3
        });
        
        // Agregar tareas de renderizado
        queue.addRenderTask = function(renderFunction, priority = 2) {
            const task = async () => {
                return await renderFunction();
            };
            
            return this.enqueue(task, priority);
        };
        
        return queue;
    }
    
    /**
     * Crear cola de audio
     */
    createAudioQueue() {
        const queue = new AdvancedQueue((error, results) => {
            console.log('Cola de audio completada:', results);
        }, {
            maxConcurrent: 4,
            retryAttempts: 2,
            priorityLevels: 3
        });
        
        // Agregar tareas de audio
        queue.addAudioTask = function(audioFunction, priority = 2) {
            const task = async () => {
                return await audioFunction();
            };
            
            return this.enqueue(task, priority);
        };
        
        return queue;
    }
    
    /**
     * Crear cola de física
     */
    createPhysicsQueue() {
        const queue = new AdvancedQueue((error, results) => {
            console.log('Cola de física completada:', results);
        }, {
            maxConcurrent: 2,
            retryAttempts: 1,
            priorityLevels: 4
        });
        
        // Agregar tareas de física
        queue.addPhysicsTask = function(physicsFunction, priority = 3) {
            const task = async () => {
                return await physicsFunction();
            };
            
            return this.enqueue(task, priority);
        };
        
        return queue;
    }
    
    /**
     * Crear cola de partículas
     */
    createParticleQueue() {
        const queue = new AdvancedQueue((error, results) => {
            console.log('Cola de partículas completada:', results);
        }, {
            maxConcurrent: 3,
            retryAttempts: 1,
            priorityLevels: 2
        });
        
        // Agregar tareas de partículas
        queue.addParticleTask = function(particleFunction, priority = 1) {
            const task = async () => {
                return await particleFunction();
            };
            
            return this.enqueue(task, priority);
        };
        
        return queue;
    }
    
    /**
     * Limpiar recursos
     */
    dispose() {
        this.clear();
        this.events = null;
        
        console.log('🧹 Cola Avanzada limpiada');
    }
}

// Clase de compatibilidad con el código original
class Queue extends AdvancedQueue {
    constructor(onQueueEmpty) {
        super(onQueueEmpty);
        console.log('📋 Cola básica inicializada (compatibilidad)');
    }
    
    enqueue() {
        this.count++;
        return this.count;
    }
    
    dequeue(error, output) {
        if (this.onQueueEmpty && (--this.count <= 0 || error)) {
            this.onQueueEmpty(error, output);
            if (error) {
                output.controller.abort();
                this.onQueueEmpty = undefined;
            }
        }
    }
}

// Exportar para uso global
window.AdvancedQueue = AdvancedQueue;
window.Queue = Queue;

// Exportar para módulos
if (typeof exports !== 'undefined') {
    exports.Queue = Queue;
    exports.AdvancedQueue = AdvancedQueue;
}

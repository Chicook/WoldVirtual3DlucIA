/**
 * Service Manager - Metaverso Crypto World Virtual 3D
 * Gestor centralizado de servicios del metaverso
 * @version 1.0.0
 * @author Metaverso Crypto World Virtual 3D
 */

class ServiceManager {
    constructor() {
        this.services = new Map();
        this.dependencies = new Map();
        this.serviceStates = new Map();
        this.eventListeners = new Map();
        this.config = {
            autoStart: true,
            healthCheck: true,
            healthCheckInterval: 30000, // 30 segundos
            maxRetries: 3,
            retryDelay: 1000
        };
        
        this.healthCheckTimer = null;
        this.isInitialized = false;
        this.isRunning = false;
    }

    /**
     * Inicializar el Service Manager
     */
    async initialize(config = {}) {
        if (this.isInitialized) {
            console.warn('Service Manager ya está inicializado');
            return;
        }

        console.log('🚀 Inicializando Service Manager...');
        
        // Aplicar configuración
        this.config = { ...this.config, ...config };
        
        // Registrar servicios core
        await this.registerCoreServices();
        
        // Iniciar health checks si está habilitado
        if (this.config.healthCheck) {
            this.startHealthChecks();
        }
        
        this.isInitialized = true;
        console.log('✅ Service Manager inicializado correctamente');
        
        // Emitir evento de inicialización
        this.emit('initialized', { timestamp: Date.now() });
    }

    /**
     * Registrar servicios core del metaverso
     */
    async registerCoreServices() {
        const coreServices = [
            {
                name: 'blockchain',
                service: 'BlockchainService',
                dependencies: [],
                priority: 'high'
            },
            {
                name: 'audio',
                service: 'AudioService',
                dependencies: [],
                priority: 'medium'
            },
            {
                name: 'avatar',
                service: 'AvatarService',
                dependencies: ['database'],
                priority: 'medium'
            },
            {
                name: 'database',
                service: 'DatabaseService',
                dependencies: [],
                priority: 'high'
            },
            {
                name: 'networking',
                service: 'NetworkingService',
                dependencies: ['blockchain'],
                priority: 'high'
            },
            {
                name: 'physics',
                service: 'PhysicsService',
                dependencies: [],
                priority: 'medium'
            },
            {
                name: 'rendering',
                service: 'RenderingService',
                dependencies: ['physics'],
                priority: 'medium'
            },
            {
                name: 'marketplace',
                service: 'MarketplaceService',
                dependencies: ['blockchain', 'database'],
                priority: 'low'
            },
            {
                name: 'defi',
                service: 'DeFiService',
                dependencies: ['blockchain'],
                priority: 'low'
            },
            {
                name: 'governance',
                service: 'GovernanceService',
                dependencies: ['blockchain'],
                priority: 'low'
            }
        ];

        for (const serviceConfig of coreServices) {
            await this.registerService(
                serviceConfig.name,
                serviceConfig.service,
                serviceConfig.dependencies,
                { priority: serviceConfig.priority }
            );
        }
    }

    /**
     * Registrar un nuevo servicio
     */
    async registerService(name, serviceClass, dependencies = [], options = {}) {
        if (this.services.has(name)) {
            console.warn(`Servicio '${name}' ya está registrado`);
            return false;
        }

        console.log(`📝 Registrando servicio: ${name}`);

        try {
            // Crear instancia del servicio
            const serviceInstance = new serviceClass();
            
            // Registrar servicio
            this.services.set(name, {
                instance: serviceInstance,
                class: serviceClass,
                dependencies: dependencies,
                options: options,
                status: 'registered',
                startTime: null,
                errorCount: 0
            });

            // Registrar dependencias
            this.dependencies.set(name, dependencies);

            // Actualizar estado
            this.serviceStates.set(name, 'registered');

            console.log(`✅ Servicio '${name}' registrado correctamente`);
            
            // Emitir evento
            this.emit('serviceRegistered', { name, dependencies, options });
            
            return true;
        } catch (error) {
            console.error(`❌ Error registrando servicio '${name}':`, error);
            this.emit('serviceRegistrationError', { name, error: error.message });
            return false;
        }
    }

    /**
     * Iniciar un servicio específico
     */
    async startService(name) {
        const service = this.services.get(name);
        if (!service) {
            throw new Error(`Servicio '${name}' no encontrado`);
        }

        if (service.status === 'running') {
            console.warn(`Servicio '${name}' ya está ejecutándose`);
            return true;
        }

        console.log(`🚀 Iniciando servicio: ${name}`);

        try {
            // Verificar dependencias
            const missingDeps = await this.checkDependencies(name);
            if (missingDeps.length > 0) {
                throw new Error(`Dependencias faltantes: ${missingDeps.join(', ')}`);
            }

            // Inicializar servicio
            if (typeof service.instance.initialize === 'function') {
                await service.instance.initialize();
            }

            // Iniciar servicio
            if (typeof service.instance.start === 'function') {
                await service.instance.start();
            }

            // Actualizar estado
            service.status = 'running';
            service.startTime = Date.now();
            this.serviceStates.set(name, 'running');

            console.log(`✅ Servicio '${name}' iniciado correctamente`);
            
            // Emitir evento
            this.emit('serviceStarted', { name, startTime: service.startTime });
            
            return true;
        } catch (error) {
            console.error(`❌ Error iniciando servicio '${name}':`, error);
            service.status = 'error';
            service.errorCount++;
            this.serviceStates.set(name, 'error');
            
            // Emitir evento de error
            this.emit('serviceStartError', { name, error: error.message });
            
            // Reintentar si es posible
            if (service.errorCount < this.config.maxRetries) {
                console.log(`🔄 Reintentando servicio '${name}' en ${this.config.retryDelay}ms...`);
                setTimeout(() => this.startService(name), this.config.retryDelay);
            }
            
            return false;
        }
    }

    /**
     * Detener un servicio específico
     */
    async stopService(name) {
        const service = this.services.get(name);
        if (!service) {
            throw new Error(`Servicio '${name}' no encontrado`);
        }

        if (service.status !== 'running') {
            console.warn(`Servicio '${name}' no está ejecutándose`);
            return true;
        }

        console.log(`🛑 Deteniendo servicio: ${name}`);

        try {
            // Detener servicio
            if (typeof service.instance.stop === 'function') {
                await service.instance.stop();
            }

            // Actualizar estado
            service.status = 'stopped';
            this.serviceStates.set(name, 'stopped');

            console.log(`✅ Servicio '${name}' detenido correctamente`);
            
            // Emitir evento
            this.emit('serviceStopped', { name });
            
            return true;
        } catch (error) {
            console.error(`❌ Error deteniendo servicio '${name}':`, error);
            this.emit('serviceStopError', { name, error: error.message });
            return false;
        }
    }

    /**
     * Iniciar todos los servicios
     */
    async startAllServices() {
        if (this.isRunning) {
            console.warn('Los servicios ya están ejecutándose');
            return;
        }

        console.log('🚀 Iniciando todos los servicios...');

        const serviceNames = Array.from(this.services.keys());
        const results = [];

        // Ordenar servicios por prioridad y dependencias
        const sortedServices = this.sortServicesByDependencies(serviceNames);

        for (const name of sortedServices) {
            const result = await this.startService(name);
            results.push({ name, success: result });
        }

        this.isRunning = true;
        
        const successCount = results.filter(r => r.success).length;
        const totalCount = results.length;
        
        console.log(`✅ ${successCount}/${totalCount} servicios iniciados correctamente`);
        
        // Emitir evento
        this.emit('allServicesStarted', { results, successCount, totalCount });
        
        return results;
    }

    /**
     * Detener todos los servicios
     */
    async stopAllServices() {
        if (!this.isRunning) {
            console.warn('Los servicios no están ejecutándose');
            return;
        }

        console.log('🛑 Deteniendo todos los servicios...');

        const serviceNames = Array.from(this.services.keys());
        const results = [];

        // Detener en orden inverso
        for (const name of serviceNames.reverse()) {
            const result = await this.stopService(name);
            results.push({ name, success: result });
        }

        this.isRunning = false;
        
        const successCount = results.filter(r => r.success).length;
        const totalCount = results.length;
        
        console.log(`✅ ${successCount}/${totalCount} servicios detenidos correctamente`);
        
        // Emitir evento
        this.emit('allServicesStopped', { results, successCount, totalCount });
        
        return results;
    }

    /**
     * Obtener un servicio por nombre
     */
    getService(name) {
        const service = this.services.get(name);
        return service ? service.instance : null;
    }

    /**
     * Obtener estado de un servicio
     */
    getServiceStatus(name) {
        return this.serviceStates.get(name) || 'unknown';
    }

    /**
     * Obtener estado de todos los servicios
     */
    getAllServiceStatus() {
        const status = {};
        for (const [name, state] of this.serviceStates) {
            status[name] = state;
        }
        return status;
    }

    /**
     * Verificar dependencias de un servicio
     */
    async checkDependencies(serviceName) {
        const dependencies = this.dependencies.get(serviceName) || [];
        const missing = [];

        for (const dep of dependencies) {
            const depService = this.services.get(dep);
            if (!depService || depService.status !== 'running') {
                missing.push(dep);
            }
        }

        return missing;
    }

    /**
     * Ordenar servicios por dependencias
     */
    sortServicesByDependencies(serviceNames) {
        const sorted = [];
        const visited = new Set();
        const visiting = new Set();

        const visit = (name) => {
            if (visiting.has(name)) {
                throw new Error(`Dependencia circular detectada: ${name}`);
            }
            if (visited.has(name)) {
                return;
            }

            visiting.add(name);
            const dependencies = this.dependencies.get(name) || [];
            
            for (const dep of dependencies) {
                visit(dep);
            }

            visiting.delete(name);
            visited.add(name);
            sorted.push(name);
        };

        for (const name of serviceNames) {
            visit(name);
        }

        return sorted;
    }

    /**
     * Iniciar health checks
     */
    startHealthChecks() {
        if (this.healthCheckTimer) {
            clearInterval(this.healthCheckTimer);
        }

        this.healthCheckTimer = setInterval(() => {
            this.performHealthCheck();
        }, this.config.healthCheckInterval);

        console.log(`🏥 Health checks iniciados (intervalo: ${this.config.healthCheckInterval}ms)`);
    }

    /**
     * Realizar health check
     */
    async performHealthCheck() {
        const healthStatus = {};

        for (const [name, service] of this.services) {
            try {
                let isHealthy = true;
                let details = {};

                // Verificar si el servicio tiene método de health check
                if (typeof service.instance.healthCheck === 'function') {
                    const health = await service.instance.healthCheck();
                    isHealthy = health.isHealthy;
                    details = health.details || {};
                } else {
                    // Health check básico
                    isHealthy = service.status === 'running';
                }

                healthStatus[name] = {
                    isHealthy,
                    status: service.status,
                    uptime: service.startTime ? Date.now() - service.startTime : 0,
                    errorCount: service.errorCount,
                    details
                };

                // Emitir evento si el servicio no está saludable
                if (!isHealthy) {
                    this.emit('serviceUnhealthy', { name, healthStatus: healthStatus[name] });
                }
            } catch (error) {
                healthStatus[name] = {
                    isHealthy: false,
                    status: 'error',
                    error: error.message
                };
            }
        }

        // Emitir evento de health check
        this.emit('healthCheck', { healthStatus, timestamp: Date.now() });
    }

    /**
     * Detener health checks
     */
    stopHealthChecks() {
        if (this.healthCheckTimer) {
            clearInterval(this.healthCheckTimer);
            this.healthCheckTimer = null;
            console.log('🏥 Health checks detenidos');
        }
    }

    /**
     * Obtener estadísticas del Service Manager
     */
    getStats() {
        const stats = {
            totalServices: this.services.size,
            runningServices: 0,
            stoppedServices: 0,
            errorServices: 0,
            uptime: this.isInitialized ? Date.now() - (this.startTime || Date.now()) : 0,
            healthCheckEnabled: !!this.healthCheckTimer
        };

        for (const [name, service] of this.services) {
            switch (service.status) {
                case 'running':
                    stats.runningServices++;
                    break;
                case 'stopped':
                    stats.stoppedServices++;
                    break;
                case 'error':
                    stats.errorServices++;
                    break;
            }
        }

        return stats;
    }

    /**
     * Sistema de eventos
     */
    on(event, callback) {
        if (!this.eventListeners.has(event)) {
            this.eventListeners.set(event, []);
        }
        this.eventListeners.get(event).push(callback);
    }

    off(event, callback) {
        if (this.eventListeners.has(event)) {
            const listeners = this.eventListeners.get(event);
            const index = listeners.indexOf(callback);
            if (index > -1) {
                listeners.splice(index, 1);
            }
        }
    }

    emit(event, data) {
        if (this.eventListeners.has(event)) {
            this.eventListeners.get(event).forEach(callback => {
                try {
                    callback(data);
                } catch (error) {
                    console.error(`Error en evento '${event}':`, error);
                }
            });
        }
    }

    /**
     * Limpiar recursos
     */
    async cleanup() {
        console.log('🧹 Limpiando Service Manager...');

        // Detener health checks
        this.stopHealthChecks();

        // Detener todos los servicios
        await this.stopAllServices();

        // Limpiar listeners
        this.eventListeners.clear();

        // Limpiar maps
        this.services.clear();
        this.dependencies.clear();
        this.serviceStates.clear();

        this.isInitialized = false;
        this.isRunning = false;

        console.log('✅ Service Manager limpiado correctamente');
    }
}

// Exportar para uso global
if (typeof window !== 'undefined') {
    window.ServiceManager = ServiceManager;
}

// Exportar para módulos
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ServiceManager;
}

// Ejecutar si se llama directamente
if (require.main === module) {
    const manager = new ServiceManager();
    manager.initialize().then(() => {
        console.log('Service Manager iniciado correctamente');
    }).catch(error => {
        console.error('Error iniciando Service Manager:', error);
    });
} 
/**
 * Advanced P2P Networking System - WebRTC
 * Sistema de networking peer-to-peer para el metaverso descentralizado
 */

class AdvancedNetworkingSystem {
    constructor(options = {}) {
        this.config = {
            iceServers: [
                { urls: 'stun:stun.l.google.com:19302' },
                { urls: 'stun:stun1.l.google.com:19302' },
                { urls: 'stun:stun2.l.google.com:19302' },
                ...options.iceServers || []
            ],
            maxPeers: options.maxPeers || 50,
            compressionLevel: options.compressionLevel || 6,
            updateRate: options.updateRate || 30, // Hz
            latencyCompensation: options.latencyCompensation !== false,
            debug: options.debug || false
        };
        
        // Estado del sistema
        this.state = {
            localPeerId: this.generatePeerId(),
            isHost: false,
            isConnected: false,
            networkQuality: 'unknown'
        };
        
        // Conexiones P2P
        this.peers = new Map();
        this.signaling = null;
        
        // Datos de sincronización
        this.worldState = new Map();
        this.lastUpdateTime = Date.now();
        this.compressionWorker = null;
        
        // Métricas de red
        this.metrics = {
            bandwidth: {
                sent: 0,
                received: 0,
                peak: 0
            },
            latency: {
                average: 0,
                min: Infinity,
                max: 0,
                samples: []
            },
            packetLoss: 0,
            compression: {
                ratio: 0,
                time: 0
            },
            activeConnections: 0
        };
        
        // Buffer de eventos
        this.eventBuffer = [];
        this.maxBufferSize = 1000;
        
        // Compensación de latencia
        this.latencyBuffer = new Map();
        
        this.init();
        
        console.log('🌐 Advanced Networking System initialized with P2P WebRTC');
    }
    
    /**
     * Inicializar sistema de networking
     */
    async init() {
        try {
            // Inicializar worker de compresión
            await this.initCompressionWorker();
            
            // Configurar signaling server
            await this.setupSignalingServer();
            
            // Inicializar métricas
            this.startMetricsCollection();
            
            console.log('✅ Networking system initialized successfully');
        } catch (error) {
            console.error('❌ Failed to initialize networking system:', error);
        }
    }
    
    /**
     * Generar ID único para peer
     */
    generatePeerId() {
        return `peer_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
    
    /**
     * Inicializar worker de compresión
     */
    async initCompressionWorker() {
        return new Promise((resolve) => {
            const workerCode = `
                // Worker para compresión de datos en tiempo real
                self.onmessage = function(e) {
                    const { id, data, type } = e.data;
                    
                    try {
                        let result;
                        const startTime = performance.now();
                        
                        if (type === 'compress') {
                            // Compresión simple basada en JSON + gzip simulation
                            const jsonString = JSON.stringify(data);
                            const compressed = btoa(jsonString); // Base64 encoding como ejemplo
                            result = compressed;
                        } else if (type === 'decompress') {
                            // Descompresión
                            const decompressed = atob(data);
                            result = JSON.parse(decompressed);
                        }
                        
                        const endTime = performance.now();
                        
                        self.postMessage({
                            id,
                            result,
                            compressionTime: endTime - startTime,
                            originalSize: JSON.stringify(data).length,
                            compressedSize: type === 'compress' ? result.length : data.length
                        });
                    } catch (error) {
                        self.postMessage({
                            id,
                            error: error.message
                        });
                    }
                };
            `;
            
            const blob = new Blob([workerCode], { type: 'application/javascript' });
            this.compressionWorker = new Worker(URL.createObjectURL(blob));
            
            this.compressionWorker.onmessage = (e) => {
                const { id, result, error, compressionTime, originalSize, compressedSize } = e.data;
                
                if (error) {
                    console.error('Compression error:', error);
                    return;
                }
                
                // Actualizar métricas de compresión
                this.metrics.compression.ratio = compressedSize / originalSize;
                this.metrics.compression.time = compressionTime;
                
                // Resolver promesa pendiente
                if (this.compressionPromises && this.compressionPromises.has(id)) {
                    this.compressionPromises.get(id).resolve(result);
                    this.compressionPromises.delete(id);
                }
            };
            
            this.compressionPromises = new Map();
            resolve();
        });
    }
    
    /**
     * Comprimir datos usando worker
     */
    async compressData(data) {
        return new Promise((resolve, reject) => {
            const id = Math.random().toString(36).substr(2, 9);
            
            this.compressionPromises.set(id, { resolve, reject });
            
            this.compressionWorker.postMessage({
                id,
                data,
                type: 'compress'
            });
            
            // Timeout después de 5 segundos
            setTimeout(() => {
                if (this.compressionPromises.has(id)) {
                    this.compressionPromises.get(id).reject(new Error('Compression timeout'));
                    this.compressionPromises.delete(id);
                }
            }, 5000);
        });
    }
    
    /**
     * Descomprimir datos usando worker
     */
    async decompressData(data) {
        return new Promise((resolve, reject) => {
            const id = Math.random().toString(36).substr(2, 9);
            
            this.compressionPromises.set(id, { resolve, reject });
            
            this.compressionWorker.postMessage({
                id,
                data,
                type: 'decompress'
            });
            
            // Timeout después de 5 segundos
            setTimeout(() => {
                if (this.compressionPromises.has(id)) {
                    this.compressionPromises.get(id).reject(new Error('Decompression timeout'));
                    this.compressionPromises.delete(id);
                }
            }, 5000);
        });
    }
    
    /**
     * Configurar servidor de señalización
     */
    async setupSignalingServer() {
        // En un entorno real, esto se conectaría a un servidor WebSocket
        // Por ahora, simulamos el comportamiento
        this.signaling = {
            connected: false,
            peers: new Map(),
            
            connect: async () => {
                // Simular conexión a servidor de señalización
                await new Promise(resolve => setTimeout(resolve, 100));
                this.signaling.connected = true;
                console.log('📡 Connected to signaling server');
            },
            
            send: (peerId, message) => {
                if (this.config.debug) {
                    console.log('📤 Signaling send:', peerId, message);
                }
                // Simular envío de mensaje de señalización
            },
            
            onMessage: (callback) => {
                this.signaling.messageCallback = callback;
            }
        };
        
        await this.signaling.connect();
    }
    
    /**
     * Conectar a peer específico
     */
    async connectToPeer(peerId, options = {}) {
        if (this.peers.has(peerId)) {
            console.warn(`Ya existe conexión con peer ${peerId}`);
            return this.peers.get(peerId);
        }
        
        const peerConnection = new RTCPeerConnection({
            iceServers: this.config.iceServers
        });
        
        const peer = {
            id: peerId,
            connection: peerConnection,
            dataChannel: null,
            state: 'connecting',
            lastPing: Date.now(),
            latency: 0,
            isHost: options.isHost || false
        };
        
        this.peers.set(peerId, peer);
        
        // Configurar data channel
        if (options.initiator !== false) {
            peer.dataChannel = peerConnection.createDataChannel('metaverse', {
                ordered: false,
                maxRetransmits: 0
            });
            this.setupDataChannel(peer.dataChannel, peerId);
        }
        
        // Manejar data channel entrante
        peerConnection.ondatachannel = (event) => {
            peer.dataChannel = event.channel;
            this.setupDataChannel(peer.dataChannel, peerId);
        };
        
        // Manejar ICE candidates
        peerConnection.onicecandidate = (event) => {
            if (event.candidate) {
                this.signaling.send(peerId, {
                    type: 'ice-candidate',
                    candidate: event.candidate
                });
            }
        };
        
        // Manejar cambios de estado de conexión
        peerConnection.onconnectionstatechange = () => {
            peer.state = peerConnection.connectionState;
            
            if (peerConnection.connectionState === 'connected') {
                console.log(`✅ Connected to peer ${peerId}`);
                this.metrics.activeConnections++;
            } else if (peerConnection.connectionState === 'disconnected' || 
                      peerConnection.connectionState === 'failed') {
                console.log(`❌ Disconnected from peer ${peerId}`);
                this.metrics.activeConnections--;
                this.peers.delete(peerId);
            }
        };
        
        if (options.initiator !== false) {
            // Crear oferta
            const offer = await peerConnection.createOffer();
            await peerConnection.setLocalDescription(offer);
            
            this.signaling.send(peerId, {
                type: 'offer',
                offer: offer
            });
        }
        
        return peer;
    }
    
    /**
     * Configurar data channel
     */
    setupDataChannel(dataChannel, peerId) {
        dataChannel.onopen = () => {
            console.log(`📡 Data channel opened with ${peerId}`);
            this.startPingPong(peerId);
        };
        
        dataChannel.onclose = () => {
            console.log(`📡 Data channel closed with ${peerId}`);
        };
        
        dataChannel.onmessage = async (event) => {
            try {
                const data = await this.decompressData(event.data);
                this.handlePeerMessage(peerId, data);
                
                // Actualizar métricas de ancho de banda
                this.metrics.bandwidth.received += event.data.length;
            } catch (error) {
                console.error('Error processing peer message:', error);
            }
        };
        
        dataChannel.onerror = (error) => {
            console.error(`Data channel error with ${peerId}:`, error);
        };
    }
    
    /**
     * Manejar mensaje de peer
     */
    handlePeerMessage(peerId, data) {
        const peer = this.peers.get(peerId);
        if (!peer) return;
        
        switch (data.type) {
            case 'ping':
                // Responder con pong
                this.sendToPeer(peerId, {
                    type: 'pong',
                    timestamp: data.timestamp
                });
                break;
                
            case 'pong':
                // Calcular latencia
                const latency = Date.now() - data.timestamp;
                peer.latency = latency;
                
                // Actualizar métricas de latencia
                this.metrics.latency.samples.push(latency);
                if (this.metrics.latency.samples.length > 100) {
                    this.metrics.latency.samples.shift();
                }
                
                this.metrics.latency.average = this.metrics.latency.samples.reduce((a, b) => a + b, 0) / this.metrics.latency.samples.length;
                this.metrics.latency.min = Math.min(this.metrics.latency.min, latency);
                this.metrics.latency.max = Math.max(this.metrics.latency.max, latency);
                break;
                
            case 'world-state':
                // Sincronizar estado del mundo
                this.handleWorldStateUpdate(peerId, data.state, data.timestamp);
                break;
                
            case 'user-action':
                // Manejar acción de usuario
                this.handleUserAction(peerId, data.action, data.timestamp);
                break;
                
            default:
                console.warn('Unknown message type:', data.type);
        }
    }
    
    /**
     * Enviar datos a peer específico
     */
    async sendToPeer(peerId, data) {
        const peer = this.peers.get(peerId);
        if (!peer || !peer.dataChannel || peer.dataChannel.readyState !== 'open') {
            return false;
        }
        
        try {
            const compressedData = await this.compressData(data);
            peer.dataChannel.send(compressedData);
            
            // Actualizar métricas de ancho de banda
            this.metrics.bandwidth.sent += compressedData.length;
            this.metrics.bandwidth.peak = Math.max(this.metrics.bandwidth.peak, this.metrics.bandwidth.sent);
            
            return true;
        } catch (error) {
            console.error('Error sending data to peer:', error);
            return false;
        }
    }
    
    /**
     * Broadcast a todos los peers
     */
    async broadcastToAll(data) {
        const promises = [];
        
        for (const [peerId, peer] of this.peers) {
            if (peer.dataChannel && peer.dataChannel.readyState === 'open') {
                promises.push(this.sendToPeer(peerId, data));
            }
        }
        
        const results = await Promise.allSettled(promises);
        const successful = results.filter(r => r.status === 'fulfilled' && r.value === true).length;
        
        return {
            sent: successful,
            total: promises.length,
            success: successful / promises.length
        };
    }
    
    /**
     * Iniciar ping-pong para medir latencia
     */
    startPingPong(peerId) {
        const pingInterval = setInterval(() => {
            const peer = this.peers.get(peerId);
            if (!peer || peer.dataChannel.readyState !== 'open') {
                clearInterval(pingInterval);
                return;
            }
            
            this.sendToPeer(peerId, {
                type: 'ping',
                timestamp: Date.now()
            });
        }, 1000); // Ping cada segundo
    }
    
    /**
     * Sincronizar estado del mundo
     */
    async syncWorldState(entities) {
        if (this.peers.size === 0) return;
        
        const timestamp = Date.now();
        
        // Aplicar compensación de latencia si está habilitada
        const adjustedEntities = this.config.latencyCompensation ? 
            this.applyLatencyCompensation(entities, timestamp) : entities;
        
        const worldState = {
            type: 'world-state',
            state: adjustedEntities,
            timestamp: timestamp
        };
        
        await this.broadcastToAll(worldState);
    }
    
    /**
     * Aplicar compensación de latencia
     */
    applyLatencyCompensation(entities, timestamp) {
        const compensatedEntities = { ...entities };
        
        // Para cada entidad con movimiento, predecir posición futura basada en latencia promedio
        Object.keys(compensatedEntities).forEach(entityId => {
            const entity = compensatedEntities[entityId];
            
            if (entity.velocity && this.metrics.latency.average > 0) {
                const compensationTime = this.metrics.latency.average / 1000; // Convertir a segundos
                
                // Predecir posición futura
                entity.position = {
                    x: entity.position.x + entity.velocity.x * compensationTime,
                    y: entity.position.y + entity.velocity.y * compensationTime,
                    z: entity.position.z + entity.velocity.z * compensationTime
                };
            }
        });
        
        return compensatedEntities;
    }
    
    /**
     * Manejar actualización de estado del mundo
     */
    handleWorldStateUpdate(peerId, state, timestamp) {
        // Aplicar interpolación y reconciliación de estado
        const now = Date.now();
        const delay = now - timestamp;
        
        // Si el mensaje es muy antiguo, ignorarlo
        if (delay > 1000) return;
        
        // Actualizar estado local con los datos recibidos
        this.worldState.set(peerId, {
            state,
            timestamp,
            delay
        });
        
        // Emit evento para que el motor 3D procese la actualización
        this.emit('worldStateUpdate', {
            peerId,
            state,
            timestamp,
            delay
        });
    }
    
    /**
     * Manejar acción de usuario
     */
    handleUserAction(peerId, action, timestamp) {
        // Procesar acción del usuario remoto
        this.emit('userAction', {
            peerId,
            action,
            timestamp
        });
    }
    
    /**
     * Iniciar recolección de métricas
     */
    startMetricsCollection() {
        setInterval(() => {
            // Reiniciar contadores de ancho de banda
            this.metrics.bandwidth.sent = 0;
            this.metrics.bandwidth.received = 0;
            
            // Actualizar calidad de red
            this.updateNetworkQuality();
            
            // Limpiar buffer de latencia si es muy grande
            if (this.metrics.latency.samples.length > 1000) {
                this.metrics.latency.samples = this.metrics.latency.samples.slice(-100);
            }
        }, 1000);
    }
    
    /**
     * Actualizar calidad de red
     */
    updateNetworkQuality() {
        const avgLatency = this.metrics.latency.average;
        const packetLoss = this.metrics.packetLoss;
        
        if (avgLatency < 50 && packetLoss < 0.01) {
            this.state.networkQuality = 'excellent';
        } else if (avgLatency < 100 && packetLoss < 0.05) {
            this.state.networkQuality = 'good';
        } else if (avgLatency < 200 && packetLoss < 0.1) {
            this.state.networkQuality = 'fair';
        } else {
            this.state.networkQuality = 'poor';
        }
    }
    
    /**
     * Obtener métricas del sistema
     */
    getMetrics() {
        return {
            ...this.metrics,
            state: this.state,
            peersCount: this.peers.size,
            compressionRatio: this.metrics.compression.ratio
        };
    }
    
    /**
     * Sistema de eventos simple
     */
    emit(event, data) {
        if (this.config.debug) {
            console.log('📡 Network event:', event, data);
        }
        
        // En un entorno real, esto usaría EventEmitter o similar
        if (typeof window !== 'undefined' && window.dispatchEvent) {
            window.dispatchEvent(new CustomEvent(`network-${event}`, { detail: data }));
        }
    }
    
    /**
     * Desconectar del sistema de red
     */
    disconnect() {
        // Cerrar todas las conexiones peer
        for (const [peerId, peer] of this.peers) {
            if (peer.dataChannel) {
                peer.dataChannel.close();
            }
            if (peer.connection) {
                peer.connection.close();
            }
        }
        
        this.peers.clear();
        
        // Cerrar worker de compresión
        if (this.compressionWorker) {
            this.compressionWorker.terminate();
        }
        
        // Desconectar signaling
        if (this.signaling) {
            this.signaling.connected = false;
        }
        
        console.log('🔌 Networking system disconnected');
    }
}

// Exportar para uso global
if (typeof window !== 'undefined') {
    window.AdvancedNetworkingSystem = AdvancedNetworkingSystem;
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = AdvancedNetworkingSystem;
}
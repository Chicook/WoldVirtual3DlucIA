/**
 * Sistema Avanzado de Sincronización - Metaverso Crypto World Virtual 3D
 * Sincronización avanzada para el metaverso
 */

"use strict";

class SyncSystem {
    constructor() {
        this.syncQueue = [];
        this.syncInterval = 16; // 60 FPS
        this.lastSync = 0;
        this.isSyncing = false;
        
        // Estados de sincronización
        this.states = {
            scene: false,
            physics: false,
            audio: false,
            particles: false,
            ai: false,
            vr: false,
            blockchain: false,
            defi: false,
            nft: false
        };
        
        // Métricas de sincronización
        this.metrics = {
            syncCount: 0,
            averageSyncTime: 0,
            lastSyncTime: 0,
            syncErrors: 0,
            droppedFrames: 0
        };
        
        // Eventos
        this.events = new EventTarget();
        
        console.log('🔄 Sistema de Sincronización inicializado');
    }
    
    /**
     * Sincronización básica (compatibilidad)
     */
    sync(root, options) {
        const walker = new Walker(root, options);
        return walker.start();
    }
    
    /**
     * Sincronización avanzada del metaverso
     */
    async syncMetaverse(components = {}) {
        const startTime = performance.now();
        
        try {
            // Sincronizar escena
            if (components.scene) {
                await this.syncScene(components.scene);
            }
            
            // Sincronizar física
            if (components.physics) {
                await this.syncPhysics(components.physics);
            }
            
            // Sincronizar audio
            if (components.audio) {
                await this.syncAudio(components.audio);
            }
            
            // Sincronizar partículas
            if (components.particles) {
                await this.syncParticles(components.particles);
            }
            
            // Sincronizar IA
            if (components.ai) {
                await this.syncAI(components.ai);
            }
            
            // Sincronizar VR
            if (components.vr) {
                await this.syncVR(components.vr);
            }
            
            // Sincronizar blockchain
            if (components.blockchain) {
                await this.syncBlockchain(components.blockchain);
            }
            
            // Sincronizar DeFi
            if (components.defi) {
                await this.syncDefi(components.defi);
            }
            
            // Sincronizar NFT
            if (components.nft) {
                await this.syncNFT(components.nft);
            }
            
            const syncTime = performance.now() - startTime;
            this.updateMetrics(syncTime);
            
            this.events.dispatchEvent(new CustomEvent('metaverse-synced', {
                detail: { syncTime, components }
            }));
            
            return true;
            
        } catch (error) {
            this.metrics.syncErrors++;
            
            this.events.dispatchEvent(new CustomEvent('sync-error', {
                detail: { error, components }
            }));
            
            throw error;
        }
    }
    
    /**
     * Sincronizar escena
     */
    async syncScene(scene) {
        if (!scene) return;
        
        // Sincronizar objetos de la escena
        scene.traverse(object => {
            if (object.userData.needsSync) {
                this.syncObject(object);
                object.userData.needsSync = false;
            }
        });
        
        // Sincronizar iluminación
        if (scene.userData.lighting) {
            await this.syncLighting(scene.userData.lighting);
        }
        
        // Sincronizar cámara
        if (scene.userData.camera) {
            await this.syncCamera(scene.userData.camera);
        }
        
        this.states.scene = true;
    }
    
    /**
     * Sincronizar objeto
     */
    syncObject(object) {
        if (object.userData.syncData) {
            const syncData = object.userData.syncData;
            
            // Sincronizar posición
            if (syncData.position) {
                object.position.copy(syncData.position);
            }
            
            // Sincronizar rotación
            if (syncData.rotation) {
                object.rotation.copy(syncData.rotation);
            }
            
            // Sincronizar escala
            if (syncData.scale) {
                object.scale.copy(syncData.scale);
            }
            
            // Sincronizar material
            if (syncData.material) {
                object.material = syncData.material;
            }
            
            // Sincronizar geometría
            if (syncData.geometry) {
                object.geometry = syncData.geometry;
            }
        }
    }
    
    /**
     * Sincronizar iluminación
     */
    async syncLighting(lighting) {
        if (lighting.ambient) {
            lighting.ambient.intensity = lighting.ambient.targetIntensity;
        }
        
        if (lighting.directional) {
            lighting.directional.intensity = lighting.directional.targetIntensity;
            lighting.directional.position.copy(lighting.directional.targetPosition);
        }
        
        if (lighting.point) {
            lighting.point.intensity = lighting.point.targetIntensity;
            lighting.point.position.copy(lighting.point.targetPosition);
        }
    }
    
    /**
     * Sincronizar cámara
     */
    async syncCamera(camera) {
        if (camera.targetPosition) {
            camera.position.copy(camera.targetPosition);
        }
        
        if (camera.targetRotation) {
            camera.rotation.copy(camera.targetRotation);
        }
        
        if (camera.targetFOV) {
            camera.fov = camera.targetFOV;
            camera.updateProjectionMatrix();
        }
    }
    
    /**
     * Sincronizar física
     */
    async syncPhysics(physics) {
        if (!physics.world) return;
        
        // Sincronizar cuerpos físicos
        physics.bodies.forEach((body, id) => {
            if (body.mesh && body.needsSync) {
                body.mesh.position.copy(body.position);
                body.mesh.quaternion.copy(body.quaternion);
                body.needsSync = false;
            }
        });
        
        // Sincronizar vehículos
        physics.vehicles.forEach((vehicle, id) => {
            if (vehicle.mesh && vehicle.needsSync) {
                vehicle.mesh.position.copy(vehicle.position);
                vehicle.mesh.rotation.copy(vehicle.rotation);
                vehicle.needsSync = false;
            }
        });
        
        this.states.physics = true;
    }
    
    /**
     * Sincronizar audio
     */
    async syncAudio(audio) {
        if (!audio.listener) return;
        
        // Sincronizar posición del listener
        if (audio.listener.position) {
            audio.listener.setPosition(
                audio.listener.position.x,
                audio.listener.position.y,
                audio.listener.position.z
            );
        }
        
        // Sincronizar sonidos 3D
        audio.sounds.forEach((sound, id) => {
            if (sound.needsSync) {
                sound.setPosition(sound.position.x, sound.position.y, sound.position.z);
                sound.setVolume(sound.volume);
                sound.needsSync = false;
            }
        });
        
        this.states.audio = true;
    }
    
    /**
     * Sincronizar partículas
     */
    async syncParticles(particles) {
        if (!particles.emitters) return;
        
        // Sincronizar emisores
        particles.emitters.forEach((emitter, id) => {
            if (emitter.needsSync) {
                emitter.position.copy(emitter.targetPosition);
                emitter.rotation.copy(emitter.targetRotation);
                emitter.needsSync = false;
            }
        });
        
        // Sincronizar partículas
        particles.particles.forEach((particle, id) => {
            if (particle.needsSync) {
                particle.position.copy(particle.targetPosition);
                particle.velocity.copy(particle.targetVelocity);
                particle.needsSync = false;
            }
        });
        
        this.states.particles = true;
    }
    
    /**
     * Sincronizar IA
     */
    async syncAI(ai) {
        if (!ai.npcs) return;
        
        // Sincronizar NPCs
        ai.npcs.forEach((npc, id) => {
            if (npc.needsSync) {
                npc.position.copy(npc.targetPosition);
                npc.rotation.copy(npc.targetRotation);
                npc.state = npc.targetState;
                npc.needsSync = false;
            }
        });
        
        // Sincronizar agentes
        ai.agents.forEach((agent, id) => {
            if (agent.needsSync) {
                agent.position.copy(agent.targetPosition);
                agent.rotation.copy(agent.targetRotation);
                agent.state = agent.targetState;
                agent.needsSync = false;
            }
        });
        
        this.states.ai = true;
    }
    
    /**
     * Sincronizar VR
     */
    async syncVR(vr) {
        if (!vr.controllers) return;
        
        // Sincronizar controladores
        vr.controllers.forEach((controller, id) => {
            if (controller.needsSync) {
                controller.position.copy(controller.targetPosition);
                controller.rotation.copy(controller.targetRotation);
                controller.needsSync = false;
            }
        });
        
        // Sincronizar manos
        vr.hands.forEach((hand, id) => {
            if (hand.needsSync) {
                hand.position.copy(hand.targetPosition);
                hand.rotation.copy(hand.targetRotation);
                hand.needsSync = false;
            }
        });
        
        this.states.vr = true;
    }
    
    /**
     * Sincronizar blockchain
     */
    async syncBlockchain(blockchain) {
        if (!blockchain.connection) return;
        
        // Sincronizar estado de la conexión
        blockchain.connection.status = blockchain.connection.targetStatus;
        
        // Sincronizar transacciones pendientes
        blockchain.pendingTransactions.forEach((tx, id) => {
            if (tx.needsSync) {
                tx.status = tx.targetStatus;
                tx.confirmations = tx.targetConfirmations;
                tx.needsSync = false;
            }
        });
        
        // Sincronizar balance
        if (blockchain.balance && blockchain.balance.needsSync) {
            blockchain.balance.amount = blockchain.balance.targetAmount;
            blockchain.balance.needsSync = false;
        }
        
        this.states.blockchain = true;
    }
    
    /**
     * Sincronizar DeFi
     */
    async syncDefi(defi) {
        if (!defi.protocols) return;
        
        // Sincronizar protocolos
        defi.protocols.forEach((protocol, id) => {
            if (protocol.needsSync) {
                protocol.apy = protocol.targetApy;
                protocol.tvl = protocol.targetTvl;
                protocol.needsSync = false;
            }
        });
        
        // Sincronizar posiciones
        defi.positions.forEach((position, id) => {
            if (position.needsSync) {
                position.amount = position.targetAmount;
                position.value = position.targetValue;
                position.needsSync = false;
            }
        });
        
        this.states.defi = true;
    }
    
    /**
     * Sincronizar NFT
     */
    async syncNFT(nft) {
        if (!nft.tokens) return;
        
        // Sincronizar tokens
        nft.tokens.forEach((token, id) => {
            if (token.needsSync) {
                token.owner = token.targetOwner;
                token.price = token.targetPrice;
                token.metadata = token.targetMetadata;
                token.needsSync = false;
            }
        });
        
        // Sincronizar marketplace
        if (nft.marketplace && nft.marketplace.needsSync) {
            nft.marketplace.listings = nft.marketplace.targetListings;
            nft.marketplace.needsSync = false;
        }
        
        this.states.nft = true;
    }
    
    /**
     * Iniciar sincronización continua
     */
    startContinuousSync() {
        if (this.isSyncing) return;
        
        this.isSyncing = true;
        this.syncLoop();
        
        this.events.dispatchEvent(new CustomEvent('continuous-sync-started'));
    }
    
    /**
     * Detener sincronización continua
     */
    stopContinuousSync() {
        this.isSyncing = false;
        
        this.events.dispatchEvent(new CustomEvent('continuous-sync-stopped'));
    }
    
    /**
     * Loop de sincronización
     */
    syncLoop() {
        if (!this.isSyncing) return;
        
        const currentTime = performance.now();
        
        if (currentTime - this.lastSync >= this.syncInterval) {
            this.syncMetaverse().catch(error => {
                console.error('Error en sincronización:', error);
            });
            
            this.lastSync = currentTime;
        }
        
        requestAnimationFrame(() => this.syncLoop());
    }
    
    /**
     * Actualizar métricas
     */
    updateMetrics(syncTime) {
        this.metrics.syncCount++;
        this.metrics.lastSyncTime = syncTime;
        
        const total = this.metrics.syncCount;
        this.metrics.averageSyncTime = 
            (this.metrics.averageSyncTime * (total - 1) + syncTime) / total;
    }
    
    /**
     * Crear sincronizador de escena
     */
    createSceneSynchronizer(scene) {
        return {
            scene,
            
            sync: async () => {
                await this.syncScene(scene);
            },
            
            markForSync: (object) => {
                object.userData.needsSync = true;
            },
            
            updateObject: (object, data) => {
                object.userData.syncData = data;
                object.userData.needsSync = true;
            }
        };
    }
    
    /**
     * Crear sincronizador de física
     */
    createPhysicsSynchronizer(physics) {
        return {
            physics,
            
            sync: async () => {
                await this.syncPhysics(physics);
            },
            
            markBodyForSync: (bodyId) => {
                const body = this.physics.bodies.get(bodyId);
                if (body) {
                    body.needsSync = true;
                }
            },
            
            updateBody: (bodyId, data) => {
                const body = this.physics.bodies.get(bodyId);
                if (body) {
                    Object.assign(body, data);
                    body.needsSync = true;
                }
            }
        };
    }
    
    /**
     * Crear sincronizador de audio
     */
    createAudioSynchronizer(audio) {
        return {
            audio,
            
            sync: async () => {
                await this.syncAudio(audio);
            },
            
            markSoundForSync: (soundId) => {
                const sound = this.audio.sounds.get(soundId);
                if (sound) {
                    sound.needsSync = true;
                }
            },
            
            updateSound: (soundId, data) => {
                const sound = this.audio.sounds.get(soundId);
                if (sound) {
                    Object.assign(sound, data);
                    sound.needsSync = true;
                }
            }
        };
    }
    
    /**
     * Crear sincronizador de IA
     */
    createAISynchronizer(ai) {
        return {
            ai,
            
            sync: async () => {
                await this.syncAI(ai);
            },
            
            markNPCForSync: (npcId) => {
                const npc = this.ai.npcs.get(npcId);
                if (npc) {
                    npc.needsSync = true;
                }
            },
            
            updateNPC: (npcId, data) => {
                const npc = this.ai.npcs.get(npcId);
                if (npc) {
                    Object.assign(npc, data);
                    npc.needsSync = true;
                }
            }
        };
    }
    
    /**
     * Crear sincronizador de VR
     */
    createVRSynchronizer(vr) {
        return {
            vr,
            
            sync: async () => {
                await this.syncVR(vr);
            },
            
            markControllerForSync: (controllerId) => {
                const controller = this.vr.controllers.get(controllerId);
                if (controller) {
                    controller.needsSync = true;
                }
            },
            
            updateController: (controllerId, data) => {
                const controller = this.vr.controllers.get(controllerId);
                if (controller) {
                    Object.assign(controller, data);
                    controller.needsSync = true;
                }
            }
        };
    }
    
    /**
     * Obtener estado de sincronización
     */
    getSyncState() {
        return this.states;
    }
    
    /**
     * Obtener métricas
     */
    getMetrics() {
        return this.metrics;
    }
    
    /**
     * Limpiar recursos
     */
    dispose() {
        this.stopContinuousSync();
        this.syncQueue = [];
        this.events = null;
        
        console.log('🧹 Sistema de Sincronización limpiado');
    }
}

// Función de compatibilidad con el código original
function sync(root, options) {
    const syncSystem = new SyncSystem();
    return syncSystem.sync(root, options);
}

// Exportar para uso global
window.SyncSystem = SyncSystem;
window.sync = sync;

// Exportar para módulos
if (typeof exports !== 'undefined') {
    exports.sync = sync;
    exports.SyncSystem = SyncSystem;
}

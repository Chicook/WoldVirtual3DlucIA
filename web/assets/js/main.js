/**
 * Main JavaScript - Script Principal de la Plataforma
 * Coordinación de todos los módulos y funcionalidades del metaverso
 * @version 1.0.0
 * @author Metaverso Crypto World Virtual 3D
 */

class MetaversoMain {
    constructor() {
        this.platform = null;
        this.initializer = null;
        this.currentPage = 'home';
        this.isInitialized = false;
        this.eventListeners = new Map();
        
        // Módulos
        this.ui = null;
        this.navigation = null;
        this.audio = null;
        this.web3 = null;
        this.threeScene = null;
        this.marketplace = null;
        this.defi = null;
        this.governance = null;
        this.chat = null;
        this.notifications = null;
        
        // Estado de la aplicación
        this.state = {
            user: null,
            wallet: null,
            currentIsland: null,
            audioEnabled: true,
            audioVolume: 0.7,
            graphicsQuality: 'medium',
            notifications: true
        };
        
        this.init();
    }

    /**
     * Inicializar la aplicación
     */
    async init() {
        try {
            console.log('🚀 Inicializando aplicación principal...');

            // Inicializar módulos básicos
            await this.initializeBasicModules();
            
            // Configurar eventos
            this.setupEventListeners();
            
            // Inicializar UI
            this.initializeUI();
            
            // Cargar configuración guardada
            this.loadSavedSettings();
            
            // Inicializar plataforma
            await this.initializePlatform();
            
            this.isInitialized = true;
            console.log('✅ Aplicación principal inicializada');
            
        } catch (error) {
            console.error('❌ Error inicializando aplicación:', error);
            this.showNotification('Error inicializando aplicación', 'error');
        }
    }

    /**
     * Inicializar módulos básicos
     */
    async initializeBasicModules() {
        // UI
        this.ui = new MetaversoUI();
        
        // Navegación
        this.navigation = new MetaversoNavigation();
        
        // Audio
        this.audio = new MetaversoAudio();
        
        // Web3
        this.web3 = new MetaversoWeb3();
        
        // Three.js Scene
        this.threeScene = new MetaversoThreeScene();
        
        // Marketplace
        this.marketplace = new MetaversoMarketplace();
        
        // DeFi
        this.defi = new MetaversoDeFi();
        
        // Gobernanza
        this.governance = new MetaversoGovernance();
        
        // Chat
        this.chat = new MetaversoChat();
        
        // Notificaciones
        this.notifications = new MetaversoNotifications();
    }

    /**
     * Configurar event listeners
     */
    setupEventListeners() {
        // Eventos de navegación
        this.on('navigation:page:changed', this.handlePageChange.bind(this));
        this.on('navigation:sidebar:toggle', this.handleSidebarToggle.bind(this));
        
        // Eventos de wallet
        this.on('wallet:connected', this.handleWalletConnection.bind(this));
        this.on('wallet:disconnected', this.handleWalletDisconnection.bind(this));
        this.on('wallet:account:changed', this.handleAccountChange.bind(this));
        
        // Eventos de audio
        this.on('audio:toggle', this.handleAudioToggle.bind(this));
        this.on('audio:volume:changed', this.handleVolumeChange.bind(this));
        
        // Eventos de islas
        this.on('island:changed', this.handleIslandChange.bind(this));
        this.on('island:explore', this.handleIslandExplore.bind(this));
        
        // Eventos de avatares
        this.on('avatar:created', this.handleAvatarCreated.bind(this));
        this.on('avatar:customized', this.handleAvatarCustomized.bind(this));
        
        // Eventos de marketplace
        this.on('marketplace:item:listed', this.handleItemListed.bind(this));
        this.on('marketplace:item:purchased', this.handleItemPurchased.bind(this));
        
        // Eventos de DeFi
        this.on('defi:staked', this.handleStaking.bind(this));
        this.on('defi:unstaked', this.handleUnstaking.bind(this));
        this.on('defi:rewards:claimed', this.handleRewardsClaimed.bind(this));
        
        // Eventos de gobernanza
        this.on('governance:proposal:created', this.handleProposalCreated.bind(this));
        this.on('governance:vote:cast', this.handleVoteCast.bind(this));
        
        // Eventos de chat
        this.on('chat:message:received', this.handleChatMessage.bind(this));
        this.on('chat:user:joined', this.handleUserJoined.bind(this));
        this.on('chat:user:left', this.handleUserLeft.bind(this));
        
        // Eventos de notificaciones
        this.on('notification:show', this.handleShowNotification.bind(this));
        this.on('notification:hide', this.handleHideNotification.bind(this));
        
        // Eventos de configuración
        this.on('settings:changed', this.handleSettingsChange.bind(this));
        
        // Eventos de la plataforma
        this.on('platform:initialized', this.handlePlatformInitialized.bind(this));
        this.on('platform:started', this.handlePlatformStarted.bind(this));
        this.on('platform:error', this.handlePlatformError.bind(this));
        
        // Eventos de blockchain
        this.on('blockchain:connected', this.handleBlockchainConnected.bind(this));
        this.on('blockchain:transaction:completed', this.handleTransactionCompleted.bind(this));
        this.on('blockchain:transaction:failed', this.handleTransactionFailed.bind(this));
        
        // Eventos de networking
        this.on('networking:connected', this.handleNetworkingConnected.bind(this));
        this.on('networking:disconnected', this.handleNetworkingDisconnected.bind(this));
        this.on('networking:message:received', this.handleNetworkingMessage.bind(this));
        
        // Eventos de audio ambiental
        this.on('audio:ambient:changed', this.handleAmbientChanged.bind(this));
        this.on('audio:effect:applied', this.handleAudioEffect.bind(this));
        
        // Eventos de física
        this.on('physics:collision', this.handlePhysicsCollision.bind(this));
        this.on('physics:body:added', this.handlePhysicsBodyAdded.bind(this));
        this.on('physics:body:removed', this.handlePhysicsBodyRemoved.bind(this));
        
        // Eventos de seguridad
        this.on('security:threat:detected', this.handleSecurityThreat.bind(this));
        this.on('security:user:blocked', this.handleUserBlocked.bind(this));
        this.on('security:audit:completed', this.handleSecurityAudit.bind(this));
    }

    /**
     * Inicializar UI
     */
    initializeUI() {
        // Configurar controles de audio
        this.setupAudioControls();
        
        // Configurar controles de navegación
        this.setupNavigationControls();
        
        // Configurar controles de wallet
        this.setupWalletControls();
        
        // Configurar controles de configuración
        this.setupSettingsControls();
        
        // Configurar modales
        this.setupModals();
        
        // Configurar notificaciones
        this.setupNotifications();
    }

    /**
     * Configurar controles de audio
     */
    setupAudioControls() {
        const audioToggle = document.getElementById('audio-toggle');
        const audioSlider = document.getElementById('audio-slider');
        const audioVolume = document.getElementById('audio-volume');
        
        if (audioToggle) {
            audioToggle.addEventListener('click', () => {
                this.emit('audio:toggle');
            });
        }
        
        if (audioSlider) {
            audioSlider.addEventListener('input', (e) => {
                const volume = e.target.value / 100;
                this.emit('audio:volume:changed', { volume });
            });
        }
        
        if (audioVolume) {
            audioVolume.addEventListener('input', (e) => {
                const volume = e.target.value / 100;
                this.emit('audio:volume:changed', { volume });
            });
        }
    }

    /**
     * Configurar controles de navegación
     */
    setupNavigationControls() {
        const navButtons = document.querySelectorAll('.nav-btn');
        const menuToggle = document.getElementById('menu-toggle');
        const sidebarClose = document.getElementById('sidebar-close');
        
        navButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                const page = btn.dataset.page;
                this.emit('navigation:page:changed', { page });
            });
        });
        
        if (menuToggle) {
            menuToggle.addEventListener('click', () => {
                this.emit('navigation:sidebar:toggle');
            });
        }
        
        if (sidebarClose) {
            sidebarClose.addEventListener('click', () => {
                this.emit('navigation:sidebar:toggle');
            });
        }
    }

    /**
     * Configurar controles de wallet
     */
    setupWalletControls() {
        const connectWalletBtn = document.getElementById('connect-wallet-btn');
        const walletOptions = document.querySelectorAll('.wallet-option');
        
        if (connectWalletBtn) {
            connectWalletBtn.addEventListener('click', () => {
                this.showModal('wallet-modal');
            });
        }
        
        walletOptions.forEach(option => {
            option.addEventListener('click', () => {
                const walletType = option.dataset.wallet;
                this.emit('wallet:connect', { type: walletType });
                this.hideModal('wallet-modal');
            });
        });
    }

    /**
     * Configurar controles de configuración
     */
    setupSettingsControls() {
        const graphicsQuality = document.getElementById('graphics-quality');
        
        if (graphicsQuality) {
            graphicsQuality.addEventListener('change', (e) => {
                this.emit('settings:changed', { 
                    graphicsQuality: e.target.value 
                });
            });
        }
    }

    /**
     * Configurar modales
     */
    setupModals() {
        const modalOverlay = document.getElementById('modal-overlay');
        const modalCloses = document.querySelectorAll('.modal-close');
        
        if (modalOverlay) {
            modalOverlay.addEventListener('click', (e) => {
                if (e.target === modalOverlay) {
                    this.hideAllModals();
                }
            });
        }
        
        modalCloses.forEach(close => {
            close.addEventListener('click', () => {
                const modalId = close.dataset.modal;
                this.hideModal(modalId);
            });
        });
    }

    /**
     * Configurar notificaciones
     */
    setupNotifications() {
        // Las notificaciones se manejan a través del módulo de notificaciones
    }

    /**
     * Inicializar plataforma
     */
    async initializePlatform() {
        try {
            console.log('🎯 Inicializando plataforma...');
            
            // Configuración de la plataforma
            const platformConfig = {
                environment: 'development',
                debug: true,
                autoStart: true,
                
                blockchain: {
                    network: 'ethereum',
                    rpcUrl: 'https://mainnet.infura.io/v3/YOUR_KEY',
                    contracts: {
                        metaversoCore: '0x...',
                        metaversoToken: '0x...',
                        metaversoNFT: '0x...',
                        metaversoDeFi: '0x...',
                        metaversoGovernance: '0x...'
                    }
                },
                
                audio: {
                    enabled: this.state.audioEnabled,
                    spatial: true,
                    ambient: true,
                    volume: this.state.audioVolume
                },
                
                networking: {
                    serverUrl: 'wss://metaverso-server.com'
                }
            };
            
            // Inicializar plataforma
            const { initializer, platform } = await initializeMetaversoPlatform(platformConfig);
            
            this.initializer = initializer;
            this.platform = platform;
            
            // Configurar eventos de la plataforma
            this.setupPlatformEvents();
            
            console.log('✅ Plataforma inicializada');
            
        } catch (error) {
            console.error('❌ Error inicializando plataforma:', error);
            throw error;
        }
    }

    /**
     * Configurar eventos de la plataforma
     */
    setupPlatformEvents() {
        if (!this.initializer) return;
        
        // Eventos de inicialización
        this.initializer.on('platform:initialized', () => {
            this.emit('platform:initialized');
        });
        
        this.initializer.on('platform:started', () => {
            this.emit('platform:started');
        });
        
        this.initializer.on('platform:error', (data) => {
            this.emit('platform:error', data);
        });
        
        // Eventos de módulos
        this.initializer.on('module:initialized', (data) => {
            this.emit('module:initialized', data);
        });
        
        this.initializer.on('module:error', (data) => {
            this.emit('module:error', data);
        });
        
        // Eventos de usuario
        this.initializer.on('user:login', (data) => {
            this.emit('user:login', data);
        });
        
        this.initializer.on('user:logout', (data) => {
            this.emit('user:logout', data);
        });
        
        // Eventos de blockchain
        this.initializer.on('blockchain:connected', (data) => {
            this.emit('blockchain:connected', data);
        });
        
        this.initializer.on('transaction:completed', (data) => {
            this.emit('transaction:completed', data);
        });
        
        // Eventos de networking
        this.initializer.on('networking:connected', (data) => {
            this.emit('networking:connected', data);
        });
        
        this.initializer.on('networking:disconnected', (data) => {
            this.emit('networking:disconnected', data);
        });
        
        // Eventos de islas
        this.initializer.on('island:changed', (data) => {
            this.emit('island:changed', data);
        });
        
        // Eventos de avatares
        this.initializer.on('avatar:created', (data) => {
            this.emit('avatar:created', data);
        });
        
        this.initializer.on('avatar:updated', (data) => {
            this.emit('avatar:updated', data);
        });
        
        // Eventos de marketplace
        this.initializer.on('marketplace:item:listed', (data) => {
            this.emit('marketplace:item:listed', data);
        });
        
        this.initializer.on('marketplace:item:sold', (data) => {
            this.emit('marketplace:item:sold', data);
        });
        
        // Eventos de DeFi
        this.initializer.on('defi:staked', (data) => {
            this.emit('defi:staked', data);
        });
        
        this.initializer.on('defi:unstaked', (data) => {
            this.emit('defi:unstaked', data);
        });
        
        // Eventos de gobernanza
        this.initializer.on('governance:proposal:created', (data) => {
            this.emit('governance:proposal:created', data);
        });
        
        this.initializer.on('governance:vote:cast', (data) => {
            this.emit('governance:vote:cast', data);
        });
        
        // Eventos de seguridad
        this.initializer.on('security:threat:detected', (data) => {
            this.emit('security:threat:detected', data);
        });
        
        this.initializer.on('security:user:blocked', (data) => {
            this.emit('security:user:blocked', data);
        });
    }

    /**
     * Cargar configuración guardada
     */
    loadSavedSettings() {
        try {
            const savedSettings = localStorage.getItem('metaverso-settings');
            if (savedSettings) {
                const settings = JSON.parse(savedSettings);
                this.state = { ...this.state, ...settings };
                
                // Aplicar configuración
                this.applySettings();
            }
        } catch (error) {
            console.error('Error cargando configuración:', error);
        }
    }

    /**
     * Aplicar configuración
     */
    applySettings() {
        // Aplicar volumen de audio
        if (this.state.audioVolume !== undefined) {
            this.emit('audio:volume:changed', { volume: this.state.audioVolume });
        }
        
        // Aplicar calidad gráfica
        if (this.state.graphicsQuality) {
            this.emit('settings:changed', { graphicsQuality: this.state.graphicsQuality });
        }
    }

    /**
     * Guardar configuración
     */
    saveSettings() {
        try {
            localStorage.setItem('metaverso-settings', JSON.stringify(this.state));
        } catch (error) {
            console.error('Error guardando configuración:', error);
        }
    }

    /**
     * Mostrar modal
     */
    showModal(modalId) {
        const modal = document.getElementById(modalId);
        const overlay = document.getElementById('modal-overlay');
        
        if (modal && overlay) {
            overlay.style.display = 'flex';
            modal.style.display = 'block';
            
            // Animación de entrada
            setTimeout(() => {
                modal.classList.add('modal-active');
            }, 10);
        }
    }

    /**
     * Ocultar modal
     */
    hideModal(modalId) {
        const modal = document.getElementById(modalId);
        const overlay = document.getElementById('modal-overlay');
        
        if (modal) {
            modal.classList.remove('modal-active');
            
            setTimeout(() => {
                modal.style.display = 'none';
                
                // Ocultar overlay si no hay otros modales abiertos
                const visibleModals = document.querySelectorAll('.modal[style*="display: block"]');
                if (visibleModals.length === 0) {
                    overlay.style.display = 'none';
                }
            }, 300);
        }
    }

    /**
     * Ocultar todos los modales
     */
    hideAllModals() {
        const modals = document.querySelectorAll('.modal');
        const overlay = document.getElementById('modal-overlay');
        
        modals.forEach(modal => {
            modal.classList.remove('modal-active');
            modal.style.display = 'none';
        });
        
        if (overlay) {
            overlay.style.display = 'none';
        }
    }

    /**
     * Mostrar notificación
     */
    showNotification(message, type = 'info', duration = 5000) {
        this.emit('notification:show', { message, type, duration });
    }

    /**
     * Ocultar notificación
     */
    hideNotification(id) {
        this.emit('notification:hide', { id });
    }

    /**
     * Handlers de eventos
     */
    handlePageChange(data) {
        this.currentPage = data.page;
        this.navigation.changePage(data.page);
        this.updatePageContent(data.page);
    }

    handleSidebarToggle() {
        this.navigation.toggleSidebar();
    }

    handleWalletConnection(data) {
        this.state.wallet = data.wallet;
        this.state.user = data.user;
        this.ui.updateUserInfo(data.user);
        this.showNotification('Wallet conectado exitosamente', 'success');
    }

    handleWalletDisconnection() {
        this.state.wallet = null;
        this.state.user = null;
        this.ui.updateUserInfo(null);
        this.showNotification('Wallet desconectado', 'info');
    }

    handleAccountChange(data) {
        this.state.user = data.user;
        this.ui.updateUserInfo(data.user);
        this.showNotification('Cuenta cambiada', 'info');
    }

    handleAudioToggle() {
        this.state.audioEnabled = !this.state.audioEnabled;
        this.audio.toggle();
        this.ui.updateAudioControls(this.state.audioEnabled);
        this.saveSettings();
    }

    handleVolumeChange(data) {
        this.state.audioVolume = data.volume;
        this.audio.setVolume(data.volume);
        this.ui.updateVolumeSlider(data.volume);
        this.saveSettings();
    }

    handleIslandChange(data) {
        this.state.currentIsland = data.island;
        this.threeScene.changeIsland(data.island);
        this.audio.changeAmbient(data.island.type);
        this.ui.updateIslandInfo(data.island);
        this.showNotification(`Cambiando a ${data.island.name}`, 'info');
    }

    handleIslandExplore(data) {
        this.threeScene.exploreIsland(data.island);
        this.showNotification(`Explorando ${data.island.name}`, 'info');
    }

    handleAvatarCreated(data) {
        this.ui.updateAvatarInfo(data.avatar);
        this.showNotification('Avatar creado exitosamente', 'success');
    }

    handleAvatarCustomized(data) {
        this.ui.updateAvatarInfo(data.avatar);
        this.showNotification('Avatar personalizado', 'success');
    }

    handleItemListed(data) {
        this.marketplace.addItem(data.item);
        this.showNotification('Item listado en marketplace', 'success');
    }

    handleItemPurchased(data) {
        this.marketplace.removeItem(data.item.id);
        this.showNotification('Item comprado exitosamente', 'success');
    }

    handleStaking(data) {
        this.defi.updateStakingInfo(data);
        this.showNotification('Staking realizado exitosamente', 'success');
    }

    handleUnstaking(data) {
        this.defi.updateStakingInfo(data);
        this.showNotification('Unstaking realizado exitosamente', 'success');
    }

    handleRewardsClaimed(data) {
        this.defi.updateRewardsInfo(data);
        this.showNotification('Recompensas reclamadas', 'success');
    }

    handleProposalCreated(data) {
        this.governance.addProposal(data.proposal);
        this.showNotification('Propuesta creada exitosamente', 'success');
    }

    handleVoteCast(data) {
        this.governance.updateVoteInfo(data);
        this.showNotification('Voto registrado', 'success');
    }

    handleChatMessage(data) {
        this.chat.addMessage(data.message);
        if (data.message.userId !== this.state.user?.id) {
            this.showNotification(`Nuevo mensaje de ${data.message.username}`, 'info');
        }
    }

    handleUserJoined(data) {
        this.chat.addUser(data.user);
        this.showNotification(`${data.user.username} se unió al chat`, 'info');
    }

    handleUserLeft(data) {
        this.chat.removeUser(data.user.id);
        this.showNotification(`${data.user.username} dejó el chat`, 'info');
    }

    handleShowNotification(data) {
        this.notifications.show(data.message, data.type, data.duration);
    }

    handleHideNotification(data) {
        this.notifications.hide(data.id);
    }

    handleSettingsChange(data) {
        Object.assign(this.state, data);
        this.saveSettings();
        this.applySettings();
    }

    handlePlatformInitialized() {
        this.showNotification('Plataforma inicializada', 'success');
        this.updateLoadingProgress(100);
    }

    handlePlatformStarted() {
        this.showNotification('¡Metaverso iniciado!', 'success');
        this.hideLoadingScreen();
    }

    handlePlatformError(data) {
        this.showNotification(`Error en la plataforma: ${data.error.message}`, 'error');
    }

    handleBlockchainConnected() {
        this.showNotification('Conectado a blockchain', 'success');
    }

    handleTransactionCompleted(data) {
        this.showNotification('Transacción completada exitosamente', 'success');
        this.updateTransactionInfo(data);
    }

    handleTransactionFailed(data) {
        this.showNotification(`Transacción fallida: ${data.error}`, 'error');
    }

    handleNetworkingConnected() {
        this.showNotification('Conectado al servidor', 'success');
    }

    handleNetworkingDisconnected() {
        this.showNotification('Desconectado del servidor', 'warning');
    }

    handleNetworkingMessage(data) {
        // Procesar mensajes del servidor
        console.log('Mensaje del servidor:', data);
    }

    handleAmbientChanged(data) {
        this.audio.changeAmbient(data.type);
        this.showNotification(`Audio ambiental cambiado a ${data.type}`, 'info');
    }

    handleAudioEffect(data) {
        this.audio.applyEffect(data.effect, data.params);
    }

    handlePhysicsCollision(data) {
        this.threeScene.handleCollision(data);
    }

    handlePhysicsBodyAdded(data) {
        this.threeScene.addPhysicsBody(data.body);
    }

    handlePhysicsBodyRemoved(data) {
        this.threeScene.removePhysicsBody(data.bodyId);
    }

    handleSecurityThreat(data) {
        this.showNotification(`Amenaza de seguridad detectada: ${data.threat.type}`, 'error');
    }

    handleUserBlocked(data) {
        this.showNotification(`Usuario bloqueado: ${data.reason}`, 'warning');
    }

    handleSecurityAudit(data) {
        this.showNotification('Auditoría de seguridad completada', 'info');
    }

    /**
     * Actualizar contenido de página
     */
    updatePageContent(page) {
        switch (page) {
            case 'home':
                this.updateHomePage();
                break;
            case 'explore':
                this.updateExplorePage();
                break;
            case 'marketplace':
                this.updateMarketplacePage();
                break;
            case 'defi':
                this.updateDeFiPage();
                break;
            case 'governance':
                this.updateGovernancePage();
                break;
            case 'community':
                this.updateCommunityPage();
                break;
        }
    }

    /**
     * Actualizar página de inicio
     */
    updateHomePage() {
        // Actualizar estadísticas
        this.updateStats();
        
        // Cargar características
        this.loadFeatures();
    }

    /**
     * Actualizar página de exploración
     */
    updateExplorePage() {
        // Cargar islas
        this.loadIslands();
        
        // Configurar filtros
        this.setupIslandFilters();
    }

    /**
     * Actualizar página de marketplace
     */
    updateMarketplacePage() {
        // Cargar items
        this.marketplace.loadItems();
        
        // Configurar categorías
        this.setupMarketplaceCategories();
    }

    /**
     * Actualizar página de DeFi
     */
    updateDeFiPage() {
        // Cargar pools
        this.defi.loadPools();
        
        // Actualizar estadísticas
        this.updateDeFiStats();
    }

    /**
     * Actualizar página de gobernanza
     */
    updateGovernancePage() {
        // Cargar propuestas
        this.governance.loadProposals();
        
        // Actualizar estadísticas
        this.updateGovernanceStats();
    }

    /**
     * Actualizar página de comunidad
     */
    updateCommunityPage() {
        // Cargar chat
        this.chat.loadMessages();
        
        // Cargar eventos
        this.loadEvents();
    }

    /**
     * Actualizar estadísticas
     */
    updateStats() {
        // Simular datos de estadísticas
        const stats = {
            users: Math.floor(Math.random() * 10000) + 1000,
            transactions: Math.floor(Math.random() * 100000) + 10000,
            nfts: Math.floor(Math.random() * 50000) + 5000
        };
        
        document.getElementById('total-users').textContent = stats.users.toLocaleString();
        document.getElementById('total-transactions').textContent = stats.transactions.toLocaleString();
        document.getElementById('total-nfts').textContent = stats.nfts.toLocaleString();
    }

    /**
     * Actualizar progreso de carga
     */
    updateLoadingProgress(progress) {
        const progressFill = document.getElementById('progress-fill');
        const progressText = document.getElementById('progress-text');
        
        if (progressFill) {
            progressFill.style.width = `${progress}%`;
        }
        
        if (progressText) {
            progressText.textContent = `Cargando... ${progress}%`;
        }
    }

    /**
     * Ocultar pantalla de carga
     */
    hideLoadingScreen() {
        const loadingScreen = document.getElementById('loading-screen');
        if (loadingScreen) {
            loadingScreen.style.opacity = '0';
            setTimeout(() => {
                loadingScreen.style.display = 'none';
            }, 500);
        }
    }

    /**
     * Actualizar información de transacción
     */
    updateTransactionInfo(data) {
        // Actualizar UI con información de transacción
        console.log('Transacción completada:', data);
    }

    /**
     * Cargar características
     */
    loadFeatures() {
        // Las características ya están en el HTML
    }

    /**
     * Cargar islas
     */
    loadIslands() {
        const islandsGrid = document.getElementById('islands-grid');
        if (!islandsGrid) return;
        
        const islands = [
            { id: 'forest', name: 'Bosque Místico', type: 'forest', description: 'Un bosque mágico lleno de criaturas fantásticas' },
            { id: 'ocean', name: 'Océano Infinito', type: 'ocean', description: 'Un vasto océano con islas flotantes' },
            { id: 'mountain', name: 'Cumbres Nevadas', type: 'mountain', description: 'Montañas imponentes con cuevas secretas' },
            { id: 'desert', name: 'Desierto Dorado', type: 'desert', description: 'Un desierto misterioso con oasis ocultos' },
            { id: 'city', name: 'Ciudad Futurista', type: 'city', description: 'Una ciudad futurista con tecnología avanzada' }
        ];
        
        islandsGrid.innerHTML = islands.map(island => `
            <div class="island-card" data-island="${island.type}">
                <div class="island-icon">${this.getIslandIcon(island.type)}</div>
                <h3>${island.name}</h3>
                <p>${island.description}</p>
                <button class="btn btn-primary" onclick="metaversoMain.exploreIsland('${island.id}')">
                    Explorar
                </button>
            </div>
        `).join('');
    }

    /**
     * Obtener icono de isla
     */
    getIslandIcon(type) {
        const icons = {
            forest: '🌲',
            ocean: '🌊',
            mountain: '⛰️',
            desert: '🏜️',
            city: '🏙️'
        };
        return icons[type] || '🏝️';
    }

    /**
     * Configurar filtros de islas
     */
    setupIslandFilters() {
        const filterButtons = document.querySelectorAll('.filter-btn');
        const islandCards = document.querySelectorAll('.island-card');
        
        filterButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                const filter = btn.dataset.island;
                
                // Actualizar botones activos
                filterButtons.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                
                // Filtrar islas
                islandCards.forEach(card => {
                    if (filter === 'all' || card.dataset.island === filter) {
                        card.style.display = 'block';
                    } else {
                        card.style.display = 'none';
                    }
                });
            });
        });
    }

    /**
     * Configurar categorías de marketplace
     */
    setupMarketplaceCategories() {
        const categoryButtons = document.querySelectorAll('.category-btn');
        
        categoryButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                const category = btn.dataset.category;
                
                // Actualizar botones activos
                categoryButtons.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                
                // Filtrar items
                this.marketplace.filterItems(category);
            });
        });
    }

    /**
     * Actualizar estadísticas de DeFi
     */
    updateDeFiStats() {
        // Simular datos
        const tvl = Math.random() * 1000000 + 500000;
        const rewards = Math.random() * 10000 + 1000;
        
        document.getElementById('total-value-locked').textContent = `$${tvl.toLocaleString()}`;
        document.getElementById('total-rewards').textContent = rewards.toLocaleString();
    }

    /**
     * Actualizar estadísticas de gobernanza
     */
    updateGovernanceStats() {
        // Simular datos
        const proposals = Math.floor(Math.random() * 50) + 10;
        const votingPower = Math.floor(Math.random() * 1000) + 100;
        
        document.getElementById('total-proposals').textContent = proposals;
        document.getElementById('voting-power').textContent = votingPower;
    }

    /**
     * Cargar eventos
     */
    loadEvents() {
        const eventsList = document.getElementById('events-list');
        if (!eventsList) return;
        
        const events = [
            { title: 'Torneo de Avatares', date: '2024-01-15', description: 'Compite con otros avatares' },
            { title: 'Subasta de NFTs', date: '2024-01-20', description: 'Subasta especial de NFTs únicos' },
            { title: 'Votación DAO', date: '2024-01-25', description: 'Vota en propuestas importantes' }
        ];
        
        eventsList.innerHTML = events.map(event => `
            <div class="event-item">
                <h4>${event.title}</h4>
                <p>${event.description}</p>
                <span class="event-date">${event.date}</span>
            </div>
        `).join('');
    }

    /**
     * Explorar isla
     */
    exploreIsland(islandId) {
        this.emit('island:explore', { islandId });
    }

    /**
     * Emitir evento
     */
    emit(eventName, data) {
        // Emitir a todos los listeners registrados
        if (this.eventListeners.has(eventName)) {
            this.eventListeners.get(eventName).forEach(callback => {
                try {
                    callback(data);
                } catch (error) {
                    console.error(`Error en listener de ${eventName}:`, error);
                }
            });
        }
        
        // Emitir a la plataforma si está disponible
        if (this.platform) {
            this.platform.emit(eventName, data);
        }
    }

    /**
     * Escuchar eventos
     */
    on(eventName, callback) {
        if (!this.eventListeners.has(eventName)) {
            this.eventListeners.set(eventName, []);
        }
        this.eventListeners.get(eventName).push(callback);
    }

    /**
     * Remover listener
     */
    off(eventName, callback) {
        if (this.eventListeners.has(eventName)) {
            const listeners = this.eventListeners.get(eventName);
            const index = listeners.indexOf(callback);
            if (index > -1) {
                listeners.splice(index, 1);
            }
        }
    }

    /**
     * Obtener estado
     */
    getState() {
        return { ...this.state };
    }

    /**
     * Destruir aplicación
     */
    async destroy() {
        try {
            console.log('🧹 Destruyendo aplicación principal...');
            
            // Detener plataforma
            if (this.initializer) {
                await this.initializer.destroy();
            }
            
            // Limpiar event listeners
            this.eventListeners.clear();
            
            // Limpiar módulos
            this.ui = null;
            this.navigation = null;
            this.audio = null;
            this.web3 = null;
            this.threeScene = null;
            this.marketplace = null;
            this.defi = null;
            this.governance = null;
            this.chat = null;
            this.notifications = null;
            
            console.log('✅ Aplicación principal destruida');
            
        } catch (error) {
            console.error('❌ Error destruyendo aplicación:', error);
        }
    }
}

// Inicializar aplicación cuando el DOM esté listo
let metaversoMain = null;

document.addEventListener('DOMContentLoaded', () => {
    metaversoMain = new MetaversoMain();
    
    // Hacer disponible globalmente
    window.metaversoMain = metaversoMain;
});

// Manejar cierre de ventana
window.addEventListener('beforeunload', () => {
    if (metaversoMain) {
        metaversoMain.destroy();
    }
}); 
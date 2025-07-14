/**
 * Metaverso Crypto World Virtual 3D - Main JavaScript
 * @author Metaverso Crypto World Virtual 3D
 * @version 1.0.0
 */

class MetaversoApp {
    constructor() {
        this.isInitialized = false;
        this.currentSection = 'home';
        this.isWalletConnected = false;
        this.userData = null;
        this.web3 = null;
        this.contracts = {};
        this.audioSystem = null;
        this.threeScene = null;
        this.ui = null;
        this.navigation = null;
        this.marketplace = null;
        this.defi = null;
        this.governance = null;
        this.community = null;
        
        // Stats
        this.stats = {
            totalUsers: 0,
            totalIslands: 0,
            totalNFTs: 0,
            totalVolume: 0
        };
        
        this.init();
    }

    /**
     * Initialize the application
     */
    async init() {
        try {
            console.log('🚀 Inicializando Metaverso Crypto World Virtual 3D...');
            
            // Show loading screen
            this.showLoadingScreen();
            
            // Initialize core systems
            await this.initializeCore();
            
            // Initialize Web3
            await this.initializeWeb3();
            
            // Initialize Three.js scene
            await this.initializeThreeScene();
            
            // Initialize audio system
            await this.initializeAudio();
            
            // Initialize UI components
            await this.initializeUI();
            
            // Initialize modules
            await this.initializeModules();
            
            // Load initial data
            await this.loadInitialData();
            
            // Setup event listeners
            this.setupEventListeners();
            
            // Hide loading screen
            this.hideLoadingScreen();
            
            this.isInitialized = true;
            console.log('✅ Metaverso inicializado exitosamente');
            
            // Start background processes
            this.startBackgroundProcesses();
            
        } catch (error) {
            console.error('❌ Error inicializando el metaverso:', error);
            this.showError('Error al inicializar el metaverso', error.message);
        }
    }

    /**
     * Initialize core systems
     */
    async initializeCore() {
        console.log('📦 Inicializando sistemas core...');
        
        // Initialize configuration
        await this.loadConfiguration();
        
        // Initialize utilities
        this.utils = new MetaversoUtils();
        
        // Initialize particles
        this.initializeParticles();
        
        console.log('✅ Sistemas core inicializados');
    }

    /**
     * Initialize Web3 connection
     */
    async initializeWeb3() {
        console.log('🔗 Inicializando Web3...');
        
        this.web3 = new MetaversoWeb3();
        await this.web3.initialize();
        
        // Initialize contracts
        await this.initializeContracts();
        
        console.log('✅ Web3 inicializado');
    }

    /**
     * Initialize Three.js scene
     */
    async initializeThreeScene() {
        console.log('🎮 Inicializando escena 3D...');
        
        this.threeScene = new MetaversoThreeScene();
        await this.threeScene.initialize();
        
        console.log('✅ Escena 3D inicializada');
    }

    /**
     * Initialize audio system
     */
    async initializeAudio() {
        console.log('🎵 Inicializando sistema de audio...');
        
        this.audioSystem = new MetaversoAudio();
        await this.audioSystem.initialize();
        
        console.log('✅ Sistema de audio inicializado');
    }

    /**
     * Initialize UI components
     */
    async initializeUI() {
        console.log('🎨 Inicializando componentes UI...');
        
        this.ui = new MetaversoUI();
        await this.ui.initialize();
        
        console.log('✅ Componentes UI inicializados');
    }

    /**
     * Initialize modules
     */
    async initializeModules() {
        console.log('📚 Inicializando módulos...');
        
        this.navigation = new MetaversoNavigation();
        this.marketplace = new MetaversoMarketplace();
        this.defi = new MetaversoDeFi();
        this.governance = new MetaversoGovernance();
        this.community = new MetaversoCommunity();
        
        await Promise.all([
            this.navigation.initialize(),
            this.marketplace.initialize(),
            this.defi.initialize(),
            this.governance.initialize(),
            this.community.initialize()
        ]);
        
        console.log('✅ Módulos inicializados');
    }

    /**
     * Load initial data
     */
    async loadInitialData() {
        console.log('📊 Cargando datos iniciales...');
        
        try {
            // Load stats
            await this.loadStats();
            
            // Load user data if connected
            if (this.isWalletConnected) {
                await this.loadUserData();
            }
            
            // Load islands
            await this.loadIslands();
            
            // Load NFTs
            await this.loadNFTs();
            
            console.log('✅ Datos iniciales cargados');
            
        } catch (error) {
            console.warn('⚠️ Error cargando datos iniciales:', error);
        }
    }

    /**
     * Setup event listeners
     */
    setupEventListeners() {
        console.log('🎧 Configurando event listeners...');
        
        // Navigation events
        document.addEventListener('click', (e) => {
            if (e.target.matches('.nav-link')) {
                e.preventDefault();
                const section = e.target.getAttribute('data-section');
                this.navigateToSection(section);
            }
        });
        
        // Wallet connection
        document.getElementById('connect-wallet').addEventListener('click', () => {
            this.connectWallet();
        });
        
        // User menu
        document.getElementById('user-menu-toggle').addEventListener('click', () => {
            this.toggleUserMenu();
        });
        
        // Modal events
        document.addEventListener('click', (e) => {
            if (e.target.matches('.modal-close') || e.target.matches('.modal-overlay')) {
                this.closeModal();
            }
        });
        
        // Keyboard events
        document.addEventListener('keydown', (e) => {
            this.handleKeyboardEvents(e);
        });
        
        // Window events
        window.addEventListener('resize', () => {
            this.handleResize();
        });
        
        window.addEventListener('scroll', () => {
            this.handleScroll();
        });
        
        console.log('✅ Event listeners configurados');
    }

    /**
     * Start background processes
     */
    startBackgroundProcesses() {
        console.log('🔄 Iniciando procesos en segundo plano...');
        
        // Update stats every 30 seconds
        setInterval(() => {
            this.updateStats();
        }, 30000);
        
        // Update user data every minute
        setInterval(() => {
            if (this.isWalletConnected) {
                this.updateUserData();
            }
        }, 60000);
        
        // Check for notifications every 10 seconds
        setInterval(() => {
            this.checkNotifications();
        }, 10000);
        
        console.log('✅ Procesos en segundo plano iniciados');
    }

    /**
     * Show loading screen
     */
    showLoadingScreen() {
        const loadingScreen = document.getElementById('loading-screen');
        loadingScreen.style.display = 'flex';
        
        // Simulate loading progress
        let progress = 0;
        const progressFill = document.getElementById('progress-fill');
        const progressText = document.getElementById('progress-text');
        const loadingTips = [
            'Conectando con la blockchain...',
            'Cargando escena 3D...',
            'Inicializando sistema de audio...',
            'Configurando interfaz...',
            'Cargando datos del metaverso...',
            'Preparando experiencia inmersiva...'
        ];
        
        const interval = setInterval(() => {
            progress += Math.random() * 15;
            if (progress > 100) progress = 100;
            
            progressFill.style.width = `${progress}%`;
            progressText.textContent = loadingTips[Math.floor(progress / 20)] || 'Completando...';
            
            if (progress >= 100) {
                clearInterval(interval);
            }
        }, 200);
    }

    /**
     * Hide loading screen
     */
    hideLoadingScreen() {
        const loadingScreen = document.getElementById('loading-screen');
        loadingScreen.classList.add('hidden');
        
        setTimeout(() => {
            loadingScreen.style.display = 'none';
        }, 500);
    }

    /**
     * Initialize particles
     */
    initializeParticles() {
        if (typeof particlesJS !== 'undefined') {
            particlesJS('particles-js', {
                particles: {
                    number: {
                        value: 80,
                        density: {
                            enable: true,
                            value_area: 800
                        }
                    },
                    color: {
                        value: '#00d4ff'
                    },
                    shape: {
                        type: 'circle',
                        stroke: {
                            width: 0,
                            color: '#000000'
                        }
                    },
                    opacity: {
                        value: 0.5,
                        random: false,
                        anim: {
                            enable: false,
                            speed: 1,
                            opacity_min: 0.1,
                            sync: false
                        }
                    },
                    size: {
                        value: 3,
                        random: true,
                        anim: {
                            enable: false,
                            speed: 40,
                            size_min: 0.1,
                            sync: false
                        }
                    },
                    line_linked: {
                        enable: true,
                        distance: 150,
                        color: '#00d4ff',
                        opacity: 0.4,
                        width: 1
                    },
                    move: {
                        enable: true,
                        speed: 6,
                        direction: 'none',
                        random: false,
                        straight: false,
                        out_mode: 'out',
                        bounce: false,
                        attract: {
                            enable: false,
                            rotateX: 600,
                            rotateY: 1200
                        }
                    }
                },
                interactivity: {
                    detect_on: 'canvas',
                    events: {
                        onhover: {
                            enable: true,
                            mode: 'repulse'
                        },
                        onclick: {
                            enable: true,
                            mode: 'push'
                        },
                        resize: true
                    },
                    modes: {
                        grab: {
                            distance: 400,
                            line_linked: {
                                opacity: 1
                            }
                        },
                        bubble: {
                            distance: 400,
                            size: 40,
                            duration: 2,
                            opacity: 8,
                            speed: 3
                        },
                        repulse: {
                            distance: 200,
                            duration: 0.4
                        },
                        push: {
                            particles_nb: 4
                        },
                        remove: {
                            particles_nb: 2
                        }
                    }
                },
                retina_detect: true
            });
        }
    }

    /**
     * Load configuration
     */
    async loadConfiguration() {
        try {
            const response = await fetch('assets/config/app.json');
            this.config = await response.json();
        } catch (error) {
            console.warn('⚠️ No se pudo cargar la configuración, usando valores por defecto');
            this.config = {
                network: 'ethereum',
                rpcUrl: 'https://mainnet.infura.io/v3/YOUR_PROJECT_ID',
                contracts: {
                    core: '0x...',
                    token: '0x...',
                    nft: '0x...',
                    defi: '0x...',
                    governance: '0x...'
                }
            };
        }
    }

    /**
     * Initialize contracts
     */
    async initializeContracts() {
        if (this.web3 && this.web3.isConnected) {
            try {
                // Initialize contract instances
                this.contracts.core = new this.web3.web3.eth.Contract(
                    CORE_ABI,
                    this.config.contracts.core
                );
                
                this.contracts.token = new this.web3.web3.eth.Contract(
                    TOKEN_ABI,
                    this.config.contracts.token
                );
                
                this.contracts.nft = new this.web3.web3.eth.Contract(
                    NFT_ABI,
                    this.config.contracts.nft
                );
                
                this.contracts.defi = new this.web3.web3.eth.Contract(
                    DEFI_ABI,
                    this.config.contracts.defi
                );
                
                this.contracts.governance = new this.web3.web3.eth.Contract(
                    GOVERNANCE_ABI,
                    this.config.contracts.governance
                );
                
                console.log('✅ Contratos inicializados');
            } catch (error) {
                console.error('❌ Error inicializando contratos:', error);
            }
        }
    }

    /**
     * Connect wallet
     */
    async connectWallet() {
        try {
            if (this.web3) {
                await this.web3.connectWallet();
                this.isWalletConnected = true;
                await this.loadUserData();
                this.updateUI();
                this.showNotification('Wallet conectada exitosamente', 'success');
            }
        } catch (error) {
            console.error('❌ Error conectando wallet:', error);
            this.showNotification('Error al conectar wallet', 'error');
        }
    }

    /**
     * Load user data
     */
    async loadUserData() {
        if (this.web3 && this.web3.isConnected) {
            try {
                const address = this.web3.getCurrentAddress();
                
                // Load user data from contract
                const userData = await this.contracts.core.methods.getUser(address).call();
                
                // Load token balance
                const balance = await this.contracts.token.methods.balanceOf(address).call();
                
                this.userData = {
                    address: address,
                    username: userData.username,
                    level: userData.level,
                    experience: userData.experience,
                    totalIslandsVisited: userData.totalIslandsVisited,
                    reputation: userData.reputation,
                    balance: this.web3.web3.utils.fromWei(balance, 'ether')
                };
                
                this.updateUserUI();
                
            } catch (error) {
                console.error('❌ Error cargando datos del usuario:', error);
            }
        }
    }

    /**
     * Load stats
     */
    async loadStats() {
        try {
            if (this.contracts.core) {
                const stats = await this.contracts.core.methods.getStats().call();
                
                this.stats = {
                    totalUsers: parseInt(stats.totalUsers),
                    totalIslands: parseInt(stats.totalIslands),
                    totalNFTs: parseInt(stats.totalAvatars),
                    totalVolume: 0 // This would come from a different source
                };
                
                this.updateStatsUI();
            }
        } catch (error) {
            console.error('❌ Error cargando estadísticas:', error);
        }
    }

    /**
     * Load islands
     */
    async loadIslands() {
        try {
            if (this.contracts.core) {
                const activeIslands = await this.contracts.core.methods.getActiveIslands().call();
                
                const islands = [];
                for (const islandId of activeIslands) {
                    const island = await this.contracts.core.methods.getIsland(islandId).call();
                    islands.push({
                        id: islandId,
                        name: island.name,
                        description: island.description,
                        currentUsers: parseInt(island.currentUsers),
                        maxCapacity: parseInt(island.maxCapacity),
                        visitCount: parseInt(island.visitCount),
                        averageRating: parseInt(island.averageRating),
                        islandType: island.islandType
                    });
                }
                
                this.renderIslands(islands);
            }
        } catch (error) {
            console.error('❌ Error cargando islas:', error);
        }
    }

    /**
     * Load NFTs
     */
    async loadNFTs() {
        try {
            if (this.contracts.nft) {
                const collections = await this.contracts.nft.methods.getAllCollections().call();
                
                const nfts = [];
                for (const collectionId of collections) {
                    const collection = await this.contracts.nft.methods.getCollection(collectionId).call();
                    const collectionNFTs = await this.contracts.nft.methods.getCollectionNFTs(collectionId).call();
                    
                    for (const tokenId of collectionNFTs.slice(0, 10)) { // Limit to 10 per collection
                        const nft = await this.contracts.nft.methods.getNFTMetadata(tokenId).call();
                        nfts.push({
                            id: tokenId,
                            name: nft.name,
                            description: nft.description,
                            image: nft.image,
                            rarity: parseInt(nft.rarity),
                            level: parseInt(nft.level),
                            collection: collection.name
                        });
                    }
                }
                
                this.renderNFTs(nfts);
            }
        } catch (error) {
            console.error('❌ Error cargando NFTs:', error);
        }
    }

    /**
     * Navigate to section
     */
    navigateToSection(section) {
        if (section === this.currentSection) return;
        
        // Hide current section
        const currentSectionEl = document.querySelector(`.section.active`);
        if (currentSectionEl) {
            currentSectionEl.classList.remove('active');
        }
        
        // Show new section
        const newSectionEl = document.getElementById(section);
        if (newSectionEl) {
            newSectionEl.classList.add('active');
        }
        
        // Update navigation
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
        });
        
        const activeLink = document.querySelector(`[data-section="${section}"]`);
        if (activeLink) {
            activeLink.classList.add('active');
        }
        
        this.currentSection = section;
        
        // Load section specific data
        this.loadSectionData(section);
    }

    /**
     * Load section specific data
     */
    loadSectionData(section) {
        switch (section) {
            case 'explore':
                this.loadIslands();
                break;
            case 'marketplace':
                this.marketplace.loadNFTs();
                break;
            case 'defi':
                this.defi.loadPools();
                break;
            case 'governance':
                this.governance.loadProposals();
                break;
            case 'community':
                this.community.loadEvents();
                break;
        }
    }

    /**
     * Toggle user menu
     */
    toggleUserMenu() {
        const userMenu = document.getElementById('user-menu');
        userMenu.classList.toggle('active');
    }

    /**
     * Close modal
     */
    closeModal() {
        const modalOverlay = document.getElementById('modal-overlay');
        modalOverlay.classList.remove('active');
        
        // Hide all modals
        document.querySelectorAll('.modal').forEach(modal => {
            modal.style.display = 'none';
        });
    }

    /**
     * Show modal
     */
    showModal(modalId) {
        const modalOverlay = document.getElementById('modal-overlay');
        const modal = document.getElementById(modalId);
        
        if (modal) {
            modal.style.display = 'block';
            modalOverlay.classList.add('active');
        }
    }

    /**
     * Handle keyboard events
     */
    handleKeyboardEvents(e) {
        switch (e.key) {
            case 'Escape':
                this.closeModal();
                break;
            case 'F11':
                e.preventDefault();
                this.toggleFullscreen();
                break;
            case 'm':
            case 'M':
                if (this.audioSystem) {
                    this.audioSystem.toggleMute();
                }
                break;
        }
    }

    /**
     * Handle window resize
     */
    handleResize() {
        if (this.threeScene) {
            this.threeScene.handleResize();
        }
    }

    /**
     * Handle scroll
     */
    handleScroll() {
        const nav = document.getElementById('main-nav');
        if (window.scrollY > 100) {
            nav.classList.add('scrolled');
        } else {
            nav.classList.remove('scrolled');
        }
    }

    /**
     * Toggle fullscreen
     */
    toggleFullscreen() {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen();
        } else {
            document.exitFullscreen();
        }
    }

    /**
     * Update UI
     */
    updateUI() {
        const connectBtn = document.getElementById('connect-wallet');
        const userMenuToggle = document.getElementById('user-menu-toggle');
        
        if (this.isWalletConnected) {
            connectBtn.style.display = 'none';
            userMenuToggle.style.display = 'flex';
        } else {
            connectBtn.style.display = 'flex';
            userMenuToggle.style.display = 'none';
        }
    }

    /**
     * Update user UI
     */
    updateUserUI() {
        if (this.userData) {
            const userName = document.getElementById('user-name');
            const userBalance = document.getElementById('user-balance');
            
            if (userName) userName.textContent = this.userData.username || 'Usuario';
            if (userBalance) userBalance.textContent = `${parseFloat(this.userData.balance).toFixed(2)} META`;
        }
    }

    /**
     * Update stats UI
     */
    updateStatsUI() {
        document.getElementById('total-users').textContent = this.stats.totalUsers.toLocaleString();
        document.getElementById('total-islands').textContent = this.stats.totalIslands.toLocaleString();
        document.getElementById('total-nfts').textContent = this.stats.totalNFTs.toLocaleString();
        document.getElementById('total-volume').textContent = `${this.stats.totalVolume.toFixed(2)} ETH`;
    }

    /**
     * Render islands
     */
    renderIslands(islands) {
        const grid = document.getElementById('islands-grid');
        if (!grid) return;
        
        grid.innerHTML = islands.map(island => `
            <div class="card island-card" onclick="metaverso.showIslandModal('${island.id}')">
                <div class="island-image">
                    <img src="assets/images/islands/${island.islandType.toLowerCase()}.jpg" alt="${island.name}">
                    <div class="island-overlay">
                        <h3>${island.name}</h3>
                    </div>
                    <div class="island-status ${island.currentUsers >= island.maxCapacity ? 'full' : ''}">
                        ${island.currentUsers >= island.maxCapacity ? 'Lleno' : 'Disponible'}
                    </div>
                </div>
                <div class="card-content">
                    <p>${island.description}</p>
                    <div class="island-stats">
                        <div class="island-stat">
                            <span class="island-stat-icon">👥</span>
                            <span>${island.currentUsers}/${island.maxCapacity}</span>
                        </div>
                        <div class="island-stat">
                            <span class="island-stat-icon">⭐</span>
                            <span>${island.averageRating}/5</span>
                        </div>
                    </div>
                </div>
            </div>
        `).join('');
    }

    /**
     * Render NFTs
     */
    renderNFTs(nfts) {
        const grid = document.getElementById('nft-grid');
        if (!grid) return;
        
        grid.innerHTML = nfts.map(nft => `
            <div class="card nft-card" onclick="metaverso.showNFTModal('${nft.id}')">
                <div class="nft-image">
                    <img src="${nft.image}" alt="${nft.name}">
                    <div class="nft-badge">${nft.collection}</div>
                </div>
                <div class="card-content">
                    <h3>${nft.name}</h3>
                    <p>${nft.description}</p>
                    <div class="nft-attributes">
                        <span class="nft-attribute">Rareza: ${nft.rarity}</span>
                        <span class="nft-attribute">Nivel: ${nft.level}</span>
                    </div>
                </div>
            </div>
        `).join('');
    }

    /**
     * Show island modal
     */
    showIslandModal(islandId) {
        // This would load island details and show modal
        this.showModal('island-modal');
    }

    /**
     * Show NFT modal
     */
    showNFTModal(nftId) {
        // This would load NFT details and show modal
        this.showModal('nft-modal');
    }

    /**
     * Show notification
     */
    showNotification(message, type = 'info') {
        const notifications = document.getElementById('notifications');
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <div class="notification-header">
                <span class="notification-title">${type.toUpperCase()}</span>
                <button class="notification-close">&times;</button>
            </div>
            <div class="notification-message">${message}</div>
        `;
        
        notifications.appendChild(notification);
        
        // Show notification
        setTimeout(() => {
            notification.classList.add('show');
        }, 100);
        
        // Auto remove after 5 seconds
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                notifications.removeChild(notification);
            }, 300);
        }, 5000);
        
        // Close button
        notification.querySelector('.notification-close').addEventListener('click', () => {
            notification.classList.remove('show');
            setTimeout(() => {
                notifications.removeChild(notification);
            }, 300);
        });
    }

    /**
     * Show error
     */
    showError(title, message) {
        this.showNotification(`${title}: ${message}`, 'error');
    }

    /**
     * Update stats
     */
    async updateStats() {
        await this.loadStats();
    }

    /**
     * Update user data
     */
    async updateUserData() {
        await this.loadUserData();
    }

    /**
     * Check notifications
     */
    checkNotifications() {
        // This would check for new notifications from the blockchain
        // For now, it's a placeholder
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.metaverso = new MetaversoApp();
});

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = MetaversoApp;
} 
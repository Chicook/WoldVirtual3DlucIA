/**
 * Sistema Modular de Páginas del Metaverso
 * Integración completa de todos los módulos del metaverso descentralizado
 */

class MetaversoPagesSystem {
    constructor() {
        // Módulos principales
        this.avatarSystem = null;
        this.blockchainSystem = null;
        this.threeJSSystem = null;
        this.audioSystem = null;
        this.explorationSystem = null;
        this.securitySystem = null;
        
        // Sistema de páginas
        this.currentPage = null;
        this.pages = new Map();
        this.navigation = null;
        this.router = null;
        
        // Estados
        this.isInitialized = false;
        this.isLoading = false;
        this.userSession = null;
        
        // Configuración
        this.config = {
            theme: 'metaverso',
            language: 'es',
            autoSave: true,
            performance: 'high',
            debug: false
        };
        
        this.init();
    }

    /**
     * Inicializar sistema de páginas
     */
    async init() {
        try {
            console.log('🚀 Inicializando Sistema de Páginas del Metaverso...');
            
            // Cargar configuración
            await this.loadConfiguration();
            
            // Inicializar módulos principales
            await this.initializeModules();
            
            // Crear sistema de navegación
            this.createNavigationSystem();
            
            // Crear páginas principales
            await this.createPages();
            
            // Inicializar router
            this.initializeRouter();
            
            // Cargar página inicial
            await this.loadInitialPage();
            
            this.isInitialized = true;
            console.log('✅ Sistema de Páginas del Metaverso inicializado');
            
        } catch (error) {
            console.error('❌ Error al inicializar sistema de páginas:', error);
        }
    }

    /**
     * Cargar configuración
     */
    async loadConfiguration() {
        // Cargar desde localStorage
        const savedConfig = localStorage.getItem('metaversoConfig');
        if (savedConfig) {
            this.config = { ...this.config, ...JSON.parse(savedConfig) };
        }
        
        // Aplicar configuración
        this.applyConfiguration();
    }

    /**
     * Aplicar configuración
     */
    applyConfiguration() {
        // Aplicar tema
        document.documentElement.setAttribute('data-theme', this.config.theme);
        
        // Aplicar idioma
        document.documentElement.setAttribute('lang', this.config.language);
        
        // Configurar modo debug
        if (this.config.debug) {
            window.metaversoDebug = true;
        }
    }

    /**
     * Inicializar módulos principales
     */
    async initializeModules() {
        // Sistema de avatares
        if (window.AvatarGeneratorService) {
            this.avatarSystem = new window.AvatarGeneratorService();
        }
        
        // Sistema blockchain
        if (window.MetaversoBlockchain) {
            this.blockchainSystem = new window.MetaversoBlockchain();
        }
        
        // Sistema Three.js
        if (window.ThreeJSAdvancedCore) {
            this.threeJSSystem = new window.ThreeJSAdvancedCore();
        }
        
        // Sistema de exploración
        if (window.MetaverseExplorationSystem) {
            this.explorationSystem = new window.MetaverseExplorationSystem();
        }
        
        // Sistema de seguridad
        this.securitySystem = this.createSecuritySystem();
    }

    /**
     * Crear sistema de seguridad
     */
    createSecuritySystem() {
        return {
            // Verificar integridad de módulos
            verifyModules: () => {
                const modules = [
                    'avatarSystem', 'blockchainSystem', 
                    'threeJSSystem', 'explorationSystem'
                ];
                
                return modules.every(module => this[module] !== null);
            },
            
            // Verificar permisos de usuario
            checkPermissions: (action) => {
                if (!this.userSession) return false;
                
                const permissions = {
                    'create_avatar': true,
                    'explore_world': true,
                    'blockchain_transaction': this.userSession.walletConnected,
                    'admin_panel': this.userSession.isAdmin
                };
                
                return permissions[action] || false;
            },
            
            // Validar entrada de datos
            validateInput: (data, type) => {
                const validators = {
                    'avatar_data': (data) => {
                        return data && typeof data === 'object' && 
                               data.gender && data.age && data.build;
                    },
                    'user_preferences': (data) => {
                        return data && typeof data === 'object';
                    }
                };
                
                return validators[type] ? validators[type](data) : true;
            }
        };
    }

    /**
     * Crear sistema de navegación
     */
    createNavigationSystem() {
        this.navigation = {
            // Navegar a página
            navigateTo: async (pageName, params = {}) => {
                if (this.isLoading) return;
                
                this.isLoading = true;
                
                try {
                    // Ocultar página actual
                    if (this.currentPage) {
                        await this.hidePage(this.currentPage);
                    }
                    
                    // Cargar nueva página
                    const page = this.pages.get(pageName);
                    if (page) {
                        await this.showPage(page, params);
                        this.currentPage = page;
                        
                        // Actualizar URL
                        this.updateURL(pageName, params);
                        
                        // Disparar evento de navegación
                        this.dispatchEvent('pageChanged', { page: pageName, params });
                    }
                } catch (error) {
                    console.error('Error al navegar:', error);
                } finally {
                    this.isLoading = false;
                }
            },
            
            // Navegar hacia atrás
            goBack: () => {
                if (window.history.length > 1) {
                    window.history.back();
                }
            },
            
            // Navegar hacia adelante
            goForward: () => {
                window.history.forward();
            }
        };
    }

    /**
     * Crear páginas principales
     */
    async createPages() {
        // Página de inicio
        this.pages.set('home', {
            name: 'home',
            title: 'Metaverso Crypto World Virtual 3D',
            template: this.createHomePage(),
            modules: ['avatar', 'blockchain', 'exploration'],
            requiresAuth: false
        });
        
        // Página de exploración
        this.pages.set('exploration', {
            name: 'exploration',
            title: 'Explorar Metaverso',
            template: this.createExplorationPage(),
            modules: ['threejs', 'audio', 'exploration'],
            requiresAuth: true
        });
        
        // Página de avatares
        this.pages.set('avatars', {
            name: 'avatars',
            title: 'Gestión de Avatares',
            template: this.createAvatarsPage(),
            modules: ['avatar', 'threejs'],
            requiresAuth: true
        });
        
        // Página de blockchain
        this.pages.set('blockchain', {
            name: 'blockchain',
            title: 'Blockchain & DeFi',
            template: this.createBlockchainPage(),
            modules: ['blockchain'],
            requiresAuth: true
        });
        
        // Página de configuración
        this.pages.set('settings', {
            name: 'settings',
            title: 'Configuración',
            template: this.createSettingsPage(),
            modules: [],
            requiresAuth: true
        });
        
        // Página de perfil
        this.pages.set('profile', {
            name: 'profile',
            title: 'Perfil de Usuario',
            template: this.createProfilePage(),
            modules: ['avatar', 'blockchain'],
            requiresAuth: true
        });
    }

    /**
     * Crear página de inicio
     */
    createHomePage() {
        return `
            <div class="metaverso-page home-page">
                <div class="hero-section">
                    <div class="hero-content">
                        <h1 class="hero-title">Metaverso Crypto World Virtual 3D</h1>
                        <p class="hero-subtitle">Explora un mundo descentralizado donde la realidad virtual se encuentra con blockchain</p>
                        
                        <div class="hero-actions">
                            <button class="btn btn-primary btn-large" onclick="metaversoPages.navigateTo('exploration')">
                                🚀 Explorar Ahora
                            </button>
                            <button class="btn btn-secondary btn-large" onclick="metaversoPages.navigateTo('avatars')">
                                👤 Crear Avatar
                            </button>
                        </div>
                    </div>
                    
                    <div class="hero-visual">
                        <div class="metaverso-preview">
                            <canvas id="homePreview" class="preview-canvas"></canvas>
                        </div>
                    </div>
                </div>
                
                <div class="features-section">
                    <h2>Características Principales</h2>
                    <div class="features-grid">
                        <div class="feature-card">
                            <div class="feature-icon">🎮</div>
                            <h3>Exploración 3D</h3>
                            <p>Explora islas virtuales únicas con gráficos avanzados</p>
                        </div>
                        <div class="feature-card">
                            <div class="feature-icon">👤</div>
                            <h3>Avatares Únicos</h3>
                            <p>Crea avatares personalizados con generación procedural</p>
                        </div>
                        <div class="feature-card">
                            <div class="feature-icon">🔗</div>
                            <h3>Blockchain Integrado</h3>
                            <p>Gestiona NFTs, tokens y transacciones descentralizadas</p>
                        </div>
                        <div class="feature-card">
                            <div class="feature-icon">🎵</div>
                            <h3>Audio Ambiental</h3>
                            <p>Experiencia inmersiva con sonidos generados proceduralmente</p>
                        </div>
                    </div>
                </div>
                
                <div class="stats-section">
                    <h2>Estadísticas del Metaverso</h2>
                    <div class="stats-grid">
                        <div class="stat-card">
                            <div class="stat-number" id="totalUsers">0</div>
                            <div class="stat-label">Usuarios Activos</div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-number" id="totalAvatars">0</div>
                            <div class="stat-label">Avatares Creados</div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-number" id="totalTransactions">0</div>
                            <div class="stat-label">Transacciones</div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-number" id="totalIslands">7</div>
                            <div class="stat-label">Islas Virtuales</div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * Crear página de exploración
     */
    createExplorationPage() {
        return `
            <div class="metaverso-page exploration-page">
                <div class="exploration-header">
                    <h1>Explorar Metaverso</h1>
                    <div class="exploration-controls">
                        <button class="btn btn-control" onclick="metaversoPages.toggleFullscreen()">
                            <span class="icon">⛶</span>
                        </button>
                        <button class="btn btn-control" onclick="metaversoPages.toggleAudio()">
                            <span class="icon">🔊</span>
                        </button>
                        <button class="btn btn-control" onclick="metaversoPages.toggleUI()">
                            <span class="icon">⚙️</span>
                        </button>
                    </div>
                </div>
                
                <div class="exploration-container">
                    <div class="threejs-canvas-container">
                        <canvas id="explorationCanvas" class="threejs-canvas"></canvas>
                    </div>
                    
                    <div class="exploration-ui">
                        <div class="island-info" id="islandInfo">
                            <h3>Isla Actual</h3>
                            <div class="island-details">
                                <div class="island-name" id="currentIslandName">Cargando...</div>
                                <div class="island-description" id="currentIslandDesc">Descripción de la isla</div>
                            </div>
                        </div>
                        
                        <div class="player-info" id="playerInfo">
                            <h3>Tu Avatar</h3>
                            <div class="player-details">
                                <div class="player-name" id="playerName">Usuario</div>
                                <div class="player-position" id="playerPosition">Posición: 0, 0, 0</div>
                            </div>
                        </div>
                        
                        <div class="navigation-panel">
                            <h3>Navegación</h3>
                            <div class="island-buttons" id="islandButtons">
                                <!-- Botones de islas se generan dinámicamente -->
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * Crear página de avatares
     */
    createAvatarsPage() {
        return `
            <div class="metaverso-page avatars-page">
                <div class="avatars-header">
                    <h1>Gestión de Avatares</h1>
                    <button class="btn btn-primary" onclick="metaversoPages.generateNewAvatar()">
                        🎲 Generar Nuevo Avatar
                    </button>
                </div>
                
                <div class="avatars-container">
                    <div class="avatar-preview-section">
                        <div class="avatar-preview-container">
                            <canvas id="avatarPreviewCanvas" class="avatar-preview-canvas"></canvas>
                        </div>
                        
                        <div class="avatar-info" id="avatarInfo">
                            <h3>Información del Avatar</h3>
                            <div class="avatar-details" id="avatarDetails">
                                <!-- Detalles del avatar se cargan dinámicamente -->
                            </div>
                        </div>
                    </div>
                    
                    <div class="avatar-customization-section">
                        <h3>Personalización</h3>
                        <div class="customization-panel">
                            <div class="customization-group">
                                <label>Género</label>
                                <select id="avatarGender" onchange="metaversoPages.updateAvatar('gender')">
                                    <option value="male">Masculino</option>
                                    <option value="female">Femenino</option>
                                </select>
                            </div>
                            
                            <div class="customization-group">
                                <label>Edad</label>
                                <select id="avatarAge" onchange="metaversoPages.updateAvatar('age')">
                                    <option value="young">Joven (18-30)</option>
                                    <option value="adult">Adulto (31-50)</option>
                                    <option value="mature">Maduro (51-70)</option>
                                </select>
                            </div>
                            
                            <div class="customization-group">
                                <label>Complexión</label>
                                <select id="avatarBuild" onchange="metaversoPages.updateAvatar('build')">
                                    <option value="slim">Delgado</option>
                                    <option value="average">Promedio</option>
                                    <option value="athletic">Atlético</option>
                                    <option value="heavy">Robusto</option>
                                </select>
                            </div>
                            
                            <div class="customization-group">
                                <label>Tono de Piel</label>
                                <select id="avatarSkinTone" onchange="metaversoPages.updateAvatar('skinTone')">
                                    <option value="very_light">Muy Claro</option>
                                    <option value="light">Claro</option>
                                    <option value="medium">Medio</option>
                                    <option value="dark">Oscuro</option>
                                    <option value="very_dark">Muy Oscuro</option>
                                </select>
                            </div>
                            
                            <div class="customization-group">
                                <label>Color de Cabello</label>
                                <select id="avatarHairColor" onchange="metaversoPages.updateAvatar('hairColor')">
                                    <option value="black">Negro</option>
                                    <option value="brown">Marrón</option>
                                    <option value="blonde">Rubio</option>
                                    <option value="red">Rojo</option>
                                    <option value="gray">Gris</option>
                                </select>
                            </div>
                            
                            <div class="customization-group">
                                <label>Ropa</label>
                                <select id="avatarClothing" onchange="metaversoPages.updateAvatar('clothing')">
                                    <option value="casual">Casual</option>
                                    <option value="formal">Formal</option>
                                    <option value="sport">Deportiva</option>
                                    <option value="elegant">Elegante</option>
                                </select>
                            </div>
                        </div>
                        
                        <div class="avatar-actions">
                            <button class="btn btn-secondary" onclick="metaversoPages.randomizeAvatar()">
                                🎲 Aleatorizar
                            </button>
                            <button class="btn btn-primary" onclick="metaversoPages.saveAvatar()">
                                💾 Guardar Avatar
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * Crear página de blockchain
     */
    createBlockchainPage() {
        return `
            <div class="metaverso-page blockchain-page">
                <div class="blockchain-header">
                    <h1>Blockchain & DeFi</h1>
                    <div class="wallet-status" id="walletStatus">
                        <span class="status-indicator" id="walletIndicator">🔴</span>
                        <span class="status-text" id="walletText">Wallet no conectada</span>
                    </div>
                </div>
                
                <div class="blockchain-container">
                    <div class="wallet-section">
                        <h3>Conectar Wallet</h3>
                        <div class="wallet-buttons">
                            <button class="btn btn-wallet" onclick="metaversoPages.connectWallet('metamask')">
                                <span class="wallet-icon">🦊</span>
                                MetaMask
                            </button>
                            <button class="btn btn-wallet" onclick="metaversoPages.connectWallet('walletconnect')">
                                <span class="wallet-icon">🔗</span>
                                WalletConnect
                            </button>
                        </div>
                        
                        <div class="wallet-info" id="walletInfo" style="display: none;">
                            <div class="wallet-address" id="walletAddress"></div>
                            <div class="wallet-balance" id="walletBalance"></div>
                        </div>
                    </div>
                    
                    <div class="nfts-section">
                        <h3>Mis NFTs</h3>
                        <div class="nfts-grid" id="nftsGrid">
                            <!-- NFTs se cargan dinámicamente -->
                        </div>
                    </div>
                    
                    <div class="defi-section">
                        <h3>DeFi & Tokens</h3>
                        <div class="defi-panel">
                            <div class="token-balance">
                                <h4>Balance de Tokens</h4>
                                <div class="token-list" id="tokenList">
                                    <!-- Tokens se cargan dinámicamente -->
                                </div>
                            </div>
                            
                            <div class="defi-actions">
                                <button class="btn btn-defi" onclick="metaversoPages.stakeTokens()">
                                    🏦 Staking
                                </button>
                                <button class="btn btn-defi" onclick="metaversoPages.provideLiquidity()">
                                    💧 Liquidez
                                </button>
                                <button class="btn btn-defi" onclick="metaversoPages.tradeTokens()">
                                    💱 Trading
                                </button>
                            </div>
                        </div>
                    </div>
                    
                    <div class="transactions-section">
                        <h3>Transacciones Recientes</h3>
                        <div class="transactions-list" id="transactionsList">
                            <!-- Transacciones se cargan dinámicamente -->
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * Crear página de configuración
     */
    createSettingsPage() {
        return `
            <div class="metaverso-page settings-page">
                <div class="settings-header">
                    <h1>Configuración</h1>
                </div>
                
                <div class="settings-container">
                    <div class="settings-section">
                        <h3>Apariencia</h3>
                        <div class="setting-group">
                            <label>Tema</label>
                            <select id="themeSelect" onchange="metaversoPages.changeTheme()">
                                <option value="metaverso">Metaverso</option>
                                <option value="light">Claro</option>
                                <option value="dark">Oscuro</option>
                                <option value="neon">Neón</option>
                            </select>
                        </div>
                        
                        <div class="setting-group">
                            <label>Idioma</label>
                            <select id="languageSelect" onchange="metaversoPages.changeLanguage()">
                                <option value="es">Español</option>
                                <option value="en">English</option>
                                <option value="fr">Français</option>
                            </select>
                        </div>
                    </div>
                    
                    <div class="settings-section">
                        <h3>Rendimiento</h3>
                        <div class="setting-group">
                            <label>Calidad Gráfica</label>
                            <select id="graphicsQuality" onchange="metaversoPages.changeGraphicsQuality()">
                                <option value="low">Baja</option>
                                <option value="medium">Media</option>
                                <option value="high">Alta</option>
                                <option value="ultra">Ultra</option>
                            </select>
                        </div>
                        
                        <div class="setting-group">
                            <label>FPS Objetivo</label>
                            <select id="targetFPS" onchange="metaversoPages.changeTargetFPS()">
                                <option value="30">30 FPS</option>
                                <option value="60">60 FPS</option>
                                <option value="120">120 FPS</option>
                            </select>
                        </div>
                        
                        <div class="setting-group">
                            <label>
                                <input type="checkbox" id="autoSave" onchange="metaversoPages.toggleAutoSave()">
                                Guardado Automático
                            </label>
                        </div>
                    </div>
                    
                    <div class="settings-section">
                        <h3>Audio</h3>
                        <div class="setting-group">
                            <label>Volumen General</label>
                            <input type="range" id="masterVolume" min="0" max="100" value="50" 
                                   onchange="metaversoPages.changeMasterVolume()">
                        </div>
                        
                        <div class="setting-group">
                            <label>Volumen de Música</label>
                            <input type="range" id="musicVolume" min="0" max="100" value="70" 
                                   onchange="metaversoPages.changeMusicVolume()">
                        </div>
                        
                        <div class="setting-group">
                            <label>Volumen de Efectos</label>
                            <input type="range" id="sfxVolume" min="0" max="100" value="80" 
                                   onchange="metaversoPages.changeSFXVolume()">
                        </div>
                    </div>
                    
                    <div class="settings-section">
                        <h3>Privacidad</h3>
                        <div class="setting-group">
                            <label>
                                <input type="checkbox" id="analyticsEnabled" onchange="metaversoPages.toggleAnalytics()">
                                Permitir Analytics
                            </label>
                        </div>
                        
                        <div class="setting-group">
                            <label>
                                <input type="checkbox" id="notificationsEnabled" onchange="metaversoPages.toggleNotifications()">
                                Notificaciones Push
                            </label>
                        </div>
                    </div>
                    
                    <div class="settings-actions">
                        <button class="btn btn-secondary" onclick="metaversoPages.resetSettings()">
                            🔄 Restablecer
                        </button>
                        <button class="btn btn-primary" onclick="metaversoPages.saveSettings()">
                            💾 Guardar Configuración
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * Crear página de perfil
     */
    createProfilePage() {
        return `
            <div class="metaverso-page profile-page">
                <div class="profile-header">
                    <h1>Perfil de Usuario</h1>
                </div>
                
                <div class="profile-container">
                    <div class="profile-avatar-section">
                        <div class="profile-avatar">
                            <canvas id="profileAvatarCanvas" class="profile-avatar-canvas"></canvas>
                        </div>
                        
                        <div class="profile-info">
                            <h3 id="profileName">Usuario</h3>
                            <div class="profile-stats">
                                <div class="stat">
                                    <span class="stat-label">Nivel</span>
                                    <span class="stat-value" id="profileLevel">1</span>
                                </div>
                                <div class="stat">
                                    <span class="stat-label">Experiencia</span>
                                    <span class="stat-value" id="profileXP">0</span>
                                </div>
                                <div class="stat">
                                    <span class="stat-label">Islas Visitadas</span>
                                    <span class="stat-value" id="profileIslands">0</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="profile-details-section">
                        <h3>Detalles del Perfil</h3>
                        <div class="profile-form">
                            <div class="form-group">
                                <label>Nombre de Usuario</label>
                                <input type="text" id="profileUsername" placeholder="Tu nombre de usuario">
                            </div>
                            
                            <div class="form-group">
                                <label>Email</label>
                                <input type="email" id="profileEmail" placeholder="tu@email.com">
                            </div>
                            
                            <div class="form-group">
                                <label>Biografía</label>
                                <textarea id="profileBio" placeholder="Cuéntanos sobre ti..."></textarea>
                            </div>
                            
                            <div class="form-group">
                                <label>Intereses</label>
                                <div class="interests-tags" id="interestsTags">
                                    <!-- Tags de intereses se generan dinámicamente -->
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="profile-achievements-section">
                        <h3>Logros</h3>
                        <div class="achievements-grid" id="achievementsGrid">
                            <!-- Logros se cargan dinámicamente -->
                        </div>
                    </div>
                    
                    <div class="profile-actions">
                        <button class="btn btn-secondary" onclick="metaversoPages.editProfile()">
                            ✏️ Editar Perfil
                        </button>
                        <button class="btn btn-primary" onclick="metaversoPages.saveProfile()">
                            💾 Guardar Cambios
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * Inicializar router
     */
    initializeRouter() {
        this.router = {
            // Manejar cambios de URL
            handleRoute: () => {
                const path = window.location.pathname;
                const params = new URLSearchParams(window.location.search);
                
                // Extraer nombre de página de la URL
                const pageName = path.split('/').pop() || 'home';
                
                // Navegar a la página
                this.navigation.navigateTo(pageName, Object.fromEntries(params));
            },
            
            // Escuchar cambios de URL
            init: () => {
                window.addEventListener('popstate', () => {
                    this.router.handleRoute();
                });
                
                // Manejar ruta inicial
                this.router.handleRoute();
            }
        };
        
        this.router.init();
    }

    /**
     * Cargar página inicial
     */
    async loadInitialPage() {
        const path = window.location.pathname;
        const pageName = path.split('/').pop() || 'home';
        
        await this.navigation.navigateTo(pageName);
    }

    /**
     * Mostrar página
     */
    async showPage(page, params = {}) {
        // Crear contenedor de página si no existe
        let pageContainer = document.getElementById('metaversoPageContainer');
        if (!pageContainer) {
            pageContainer = document.createElement('div');
            pageContainer.id = 'metaversoPageContainer';
            document.body.appendChild(pageContainer);
        }
        
        // Insertar contenido de la página
        pageContainer.innerHTML = page.template;
        
        // Inicializar módulos específicos de la página
        await this.initializePageModules(page, params);
        
        // Aplicar estilos específicos de la página
        this.applyPageStyles(page.name);
        
        // Disparar evento de página cargada
        this.dispatchEvent('pageLoaded', { page: page.name, params });
    }

    /**
     * Ocultar página
     */
    async hidePage(page) {
        const pageContainer = document.getElementById('metaversoPageContainer');
        if (pageContainer) {
            // Limpiar módulos específicos de la página
            await this.cleanupPageModules(page);
            
            // Ocultar contenedor
            pageContainer.style.display = 'none';
        }
    }

    /**
     * Inicializar módulos de página
     */
    async initializePageModules(page, params) {
        for (const moduleName of page.modules) {
            switch (moduleName) {
                case 'avatar':
                    await this.initializeAvatarModule();
                    break;
                case 'blockchain':
                    await this.initializeBlockchainModule();
                    break;
                case 'threejs':
                    await this.initializeThreeJSModule();
                    break;
                case 'audio':
                    await this.initializeAudioModule();
                    break;
                case 'exploration':
                    await this.initializeExplorationModule();
                    break;
            }
        }
    }

    /**
     * Limpiar módulos de página
     */
    async cleanupPageModules(page) {
        for (const moduleName of page.modules) {
            switch (moduleName) {
                case 'threejs':
                    if (this.threeJSSystem) {
                        this.threeJSSystem.dispose();
                    }
                    break;
                case 'audio':
                    // Limpiar audio
                    break;
                case 'exploration':
                    if (this.explorationSystem) {
                        this.explorationSystem.cleanup();
                    }
                    break;
            }
        }
    }

    /**
     * Inicializar módulo de avatares
     */
    async initializeAvatarModule() {
        if (!this.avatarSystem) return;
        
        // Cargar avatar del usuario
        const userId = this.userSession?.userId || 'guest';
        const avatar = this.avatarSystem.getUserAvatar(userId);
        
        if (avatar) {
            this.displayAvatarInfo(avatar);
        }
    }

    /**
     * Inicializar módulo blockchain
     */
    async initializeBlockchainModule() {
        if (!this.blockchainSystem) return;
        
        // Conectar wallet si está disponible
        await this.connectWallet();
        
        // Cargar información de blockchain
        this.loadBlockchainInfo();
    }

    /**
     * Inicializar módulo Three.js
     */
    async initializeThreeJSModule() {
        if (!this.threeJSSystem) return;
        
        // Inicializar canvas
        const canvas = document.getElementById('explorationCanvas') || 
                      document.getElementById('avatarPreviewCanvas') ||
                      document.getElementById('profileAvatarCanvas');
        
        if (canvas) {
            this.threeJSSystem.initialize(canvas);
        }
    }

    /**
     * Inicializar módulo de audio
     */
    async initializeAudioModule() {
        // Inicializar sistema de audio
        console.log('Inicializando módulo de audio...');
    }

    /**
     * Inicializar módulo de exploración
     */
    async initializeExplorationModule() {
        if (!this.explorationSystem) return;
        
        // Inicializar sistema de exploración
        this.explorationSystem.initialize();
        
        // Cargar información de islas
        this.loadIslandsInfo();
    }

    /**
     * Aplicar estilos de página
     */
    applyPageStyles(pageName) {
        // Remover estilos anteriores
        const existingStyles = document.querySelectorAll('.page-specific-styles');
        existingStyles.forEach(style => style.remove());
        
        // Aplicar estilos específicos de la página
        const style = document.createElement('style');
        style.className = 'page-specific-styles';
        
        switch (pageName) {
            case 'exploration':
                style.textContent = `
                    .exploration-page { height: 100vh; overflow: hidden; }
                    .threejs-canvas { width: 100%; height: 100%; }
                `;
                break;
            case 'avatars':
                style.textContent = `
                    .avatars-page { padding: 20px; }
                    .avatar-preview-canvas { border: 2px solid var(--border-color); }
                `;
                break;
        }
        
        document.head.appendChild(style);
    }

    /**
     * Actualizar URL
     */
    updateURL(pageName, params = {}) {
        const url = new URL(window.location);
        url.pathname = `/${pageName}`;
        
        // Añadir parámetros
        Object.entries(params).forEach(([key, value]) => {
            url.searchParams.set(key, value);
        });
        
        window.history.pushState({}, '', url);
    }

    /**
     * Disparar evento personalizado
     */
    dispatchEvent(eventName, data) {
        const event = new CustomEvent(`metaverso:${eventName}`, {
            detail: data,
            bubbles: true
        });
        document.dispatchEvent(event);
    }

    // Métodos públicos para interacción con la UI
    
    /**
     * Generar nuevo avatar
     */
    async generateNewAvatar() {
        if (!this.avatarSystem) return;
        
        const userId = this.userSession?.userId || 'guest';
        const avatar = this.avatarSystem.generateAvatarImmediate(userId);
        
        this.displayAvatarInfo(avatar);
        this.updateAvatarPreview(avatar);
    }

    /**
     * Mostrar información del avatar
     */
    displayAvatarInfo(avatar) {
        const avatarDetails = document.getElementById('avatarDetails');
        if (!avatarDetails) return;
        
        avatarDetails.innerHTML = `
            <div class="avatar-detail">
                <strong>Género:</strong> ${avatar.gender}
            </div>
            <div class="avatar-detail">
                <strong>Edad:</strong> ${avatar.age.group} (${avatar.age.value} años)
            </div>
            <div class="avatar-detail">
                <strong>Complexión:</strong> ${avatar.build}
            </div>
            <div class="avatar-detail">
                <strong>Altura:</strong> ${avatar.height.toFixed(2)}m
            </div>
            <div class="avatar-detail">
                <strong>Tono de Piel:</strong> ${avatar.skinTone}
            </div>
            <div class="avatar-detail">
                <strong>Color de Cabello:</strong> ${avatar.hairColor}
            </div>
            <div class="avatar-detail">
                <strong>Color de Ojos:</strong> ${avatar.eyeColor}
            </div>
            <div class="avatar-detail">
                <strong>Ropa:</strong> ${avatar.clothing}
            </div>
            <div class="avatar-detail">
                <strong>Personalidad:</strong> ${avatar.personality}
            </div>
            <div class="avatar-detail">
                <strong>Rasgos:</strong> ${avatar.traits.join(', ')}
            </div>
            <div class="avatar-detail">
                <strong>Intereses:</strong> ${avatar.interests.join(', ')}
            </div>
        `;
    }

    /**
     * Actualizar preview del avatar
     */
    updateAvatarPreview(avatar) {
        // Actualizar controles de personalización
        const controls = {
            'avatarGender': avatar.gender,
            'avatarAge': avatar.age.group,
            'avatarBuild': avatar.build,
            'avatarSkinTone': avatar.skinTone,
            'avatarHairColor': avatar.hairColor,
            'avatarClothing': avatar.clothing
        };
        
        Object.entries(controls).forEach(([id, value]) => {
            const element = document.getElementById(id);
            if (element) {
                element.value = value;
            }
        });
        
        // Actualizar canvas 3D si está disponible
        if (this.threeJSSystem) {
            this.threeJSSystem.updateAvatar(avatar);
        }
    }

    /**
     * Conectar wallet
     */
    async connectWallet(type = 'metamask') {
        if (!this.blockchainSystem) return;
        
        try {
            await this.blockchainSystem.connectWallet(type);
            this.updateWalletStatus(true);
        } catch (error) {
            console.error('Error al conectar wallet:', error);
            this.updateWalletStatus(false);
        }
    }

    /**
     * Actualizar estado de wallet
     */
    updateWalletStatus(connected) {
        const indicator = document.getElementById('walletIndicator');
        const text = document.getElementById('walletText');
        const info = document.getElementById('walletInfo');
        
        if (indicator) {
            indicator.textContent = connected ? '🟢' : '🔴';
        }
        
        if (text) {
            text.textContent = connected ? 'Wallet conectada' : 'Wallet no conectada';
        }
        
        if (info) {
            info.style.display = connected ? 'block' : 'none';
        }
    }

    /**
     * Cargar información de blockchain
     */
    loadBlockchainInfo() {
        // Implementar carga de información blockchain
        console.log('Cargando información de blockchain...');
    }

    /**
     * Cargar información de islas
     */
    loadIslandsInfo() {
        const islandButtons = document.getElementById('islandButtons');
        if (!islandButtons) return;
        
        const islands = [
            { name: 'Bosque Místico', id: 'forest' },
            { name: 'Océano Infinito', id: 'ocean' },
            { name: 'Montaña Celestial', id: 'mountain' },
            { name: 'Desierto Dorado', id: 'desert' },
            { name: 'Ciudad Futurista', id: 'city' },
            { name: 'Isla Volcánica', id: 'volcano' },
            { name: 'Valle Encantado', id: 'valley' }
        ];
        
        islandButtons.innerHTML = islands.map(island => `
            <button class="btn btn-island" onclick="metaversoPages.navigateToIsland('${island.id}')">
                ${island.name}
            </button>
        `).join('');
    }

    /**
     * Navegar a isla específica
     */
    navigateToIsland(islandId) {
        if (this.explorationSystem) {
            this.explorationSystem.navigateToIsland(islandId);
        }
    }

    /**
     * Cambiar tema
     */
    changeTheme() {
        const themeSelect = document.getElementById('themeSelect');
        if (themeSelect) {
            this.config.theme = themeSelect.value;
            this.applyConfiguration();
            this.saveConfiguration();
        }
    }

    /**
     * Cambiar idioma
     */
    changeLanguage() {
        const languageSelect = document.getElementById('languageSelect');
        if (languageSelect) {
            this.config.language = languageSelect.value;
            this.applyConfiguration();
            this.saveConfiguration();
        }
    }

    /**
     * Guardar configuración
     */
    saveConfiguration() {
        localStorage.setItem('metaversoConfig', JSON.stringify(this.config));
    }

    /**
     * Obtener estadísticas del sistema
     */
    getSystemStats() {
        return {
            totalPages: this.pages.size,
            currentPage: this.currentPage?.name,
            modulesLoaded: {
                avatar: !!this.avatarSystem,
                blockchain: !!this.blockchainSystem,
                threejs: !!this.threeJSSystem,
                exploration: !!this.explorationSystem
            },
            userSession: this.userSession,
            config: this.config
        };
    }
}

// Exportar para uso modular
export default MetaversoPagesSystem;

// Funciones globales para integración
window.MetaversoPagesSystem = MetaversoPagesSystem;
window.createMetaversoPagesSystem = () => {
    return new MetaversoPagesSystem();
};

// Inicializar sistema cuando se carga la página
document.addEventListener('DOMContentLoaded', () => {
    window.metaversoPages = new MetaversoPagesSystem();
}); 
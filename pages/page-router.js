/**
 * Sistema de Enrutamiento Avanzado para Páginas del Metaverso
 * Manejo de rutas, navegación y transiciones entre páginas
 */

class MetaversoPageRouter {
    constructor() {
        this.routes = new Map();
        this.currentRoute = null;
        this.history = [];
        this.maxHistory = 50;
        this.transitions = new Map();
        this.middleware = [];
        
        this.init();
    }

    /**
     * Inicializar router
     */
    init() {
        this.setupEventListeners();
        this.createDefaultRoutes();
        this.createTransitions();
        this.handleInitialRoute();
    }

    /**
     * Configurar event listeners
     */
    setupEventListeners() {
        // Manejar navegación del navegador
        window.addEventListener('popstate', (event) => {
            this.handlePopState(event);
        });

        // Interceptar clicks en enlaces
        document.addEventListener('click', (event) => {
            this.handleLinkClick(event);
        });

        // Manejar cambios de hash
        window.addEventListener('hashchange', (event) => {
            this.handleHashChange(event);
        });
    }

    /**
     * Crear rutas por defecto
     */
    createDefaultRoutes() {
        // Ruta principal
        this.addRoute('/', {
            name: 'home',
            title: 'Metaverso Crypto World Virtual 3D',
            component: 'home',
            requiresAuth: false,
            meta: {
                description: 'Explora un mundo descentralizado donde la realidad virtual se encuentra con blockchain',
                keywords: ['metaverso', 'crypto', '3d', 'blockchain', 'virtual']
            }
        });

        // Rutas de exploración
        this.addRoute('/exploration', {
            name: 'exploration',
            title: 'Explorar Metaverso',
            component: 'exploration',
            requiresAuth: true,
            meta: {
                description: 'Explora islas virtuales únicas con gráficos avanzados',
                keywords: ['exploración', 'islas', '3d', 'virtual']
            }
        });

        this.addRoute('/exploration/:islandId', {
            name: 'island',
            title: 'Isla Virtual',
            component: 'exploration',
            requiresAuth: true,
            params: ['islandId'],
            meta: {
                description: 'Explora una isla específica del metaverso',
                keywords: ['isla', 'exploración', 'virtual']
            }
        });

        // Rutas de avatares
        this.addRoute('/avatars', {
            name: 'avatars',
            title: 'Gestión de Avatares',
            component: 'avatars',
            requiresAuth: true,
            meta: {
                description: 'Crea y personaliza tu avatar único',
                keywords: ['avatar', 'personalización', '3d']
            }
        });

        this.addRoute('/avatars/create', {
            name: 'create-avatar',
            title: 'Crear Avatar',
            component: 'avatars',
            requiresAuth: true,
            meta: {
                description: 'Crea un nuevo avatar personalizado',
                keywords: ['crear', 'avatar', 'nuevo']
            }
        });

        this.addRoute('/avatars/:avatarId', {
            name: 'avatar-detail',
            title: 'Detalle de Avatar',
            component: 'avatars',
            requiresAuth: true,
            params: ['avatarId'],
            meta: {
                description: 'Detalles y personalización del avatar',
                keywords: ['avatar', 'detalle', 'personalización']
            }
        });

        // Rutas de blockchain
        this.addRoute('/blockchain', {
            name: 'blockchain',
            title: 'Blockchain & DeFi',
            component: 'blockchain',
            requiresAuth: true,
            meta: {
                description: 'Gestiona NFTs, tokens y transacciones descentralizadas',
                keywords: ['blockchain', 'defi', 'nft', 'crypto']
            }
        });

        this.addRoute('/blockchain/wallet', {
            name: 'wallet',
            title: 'Wallet',
            component: 'blockchain',
            requiresAuth: true,
            meta: {
                description: 'Gestiona tu wallet y conexiones',
                keywords: ['wallet', 'conexión', 'blockchain']
            }
        });

        this.addRoute('/blockchain/nfts', {
            name: 'nfts',
            title: 'Mis NFTs',
            component: 'blockchain',
            requiresAuth: true,
            meta: {
                description: 'Visualiza y gestiona tus NFTs',
                keywords: ['nft', 'colección', 'digital']
            }
        });

        this.addRoute('/blockchain/nfts/:nftId', {
            name: 'nft-detail',
            title: 'Detalle de NFT',
            component: 'blockchain',
            requiresAuth: true,
            params: ['nftId'],
            meta: {
                description: 'Detalles completos del NFT',
                keywords: ['nft', 'detalle', 'metadata']
            }
        });

        // Rutas de DeFi
        this.addRoute('/defi', {
            name: 'defi',
            title: 'DeFi',
            component: 'blockchain',
            requiresAuth: true,
            meta: {
                description: 'Servicios financieros descentralizados',
                keywords: ['defi', 'staking', 'liquidez', 'trading']
            }
        });

        this.addRoute('/defi/staking', {
            name: 'staking',
            title: 'Staking',
            component: 'blockchain',
            requiresAuth: true,
            meta: {
                description: 'Stake tus tokens y gana recompensas',
                keywords: ['staking', 'recompensas', 'tokens']
            }
        });

        this.addRoute('/defi/liquidity', {
            name: 'liquidity',
            title: 'Proveedor de Liquidez',
            component: 'blockchain',
            requiresAuth: true,
            meta: {
                description: 'Proporciona liquidez y gana fees',
                keywords: ['liquidez', 'pools', 'fees']
            }
        });

        // Rutas de perfil
        this.addRoute('/profile', {
            name: 'profile',
            title: 'Perfil de Usuario',
            component: 'profile',
            requiresAuth: true,
            meta: {
                description: 'Gestiona tu perfil y configuración',
                keywords: ['perfil', 'usuario', 'configuración']
            }
        });

        this.addRoute('/profile/settings', {
            name: 'settings',
            title: 'Configuración',
            component: 'settings',
            requiresAuth: true,
            meta: {
                description: 'Configuración personal del metaverso',
                keywords: ['configuración', 'preferencias', 'ajustes']
            }
        });

        this.addRoute('/profile/achievements', {
            name: 'achievements',
            title: 'Logros',
            component: 'profile',
            requiresAuth: true,
            meta: {
                description: 'Visualiza tus logros y progreso',
                keywords: ['logros', 'progreso', 'gamificación']
            }
        });

        // Rutas de marketplace
        this.addRoute('/marketplace', {
            name: 'marketplace',
            title: 'Marketplace',
            component: 'marketplace',
            requiresAuth: false,
            meta: {
                description: 'Compra y vende activos del metaverso',
                keywords: ['marketplace', 'compra', 'venta', 'activos']
            }
        });

        this.addRoute('/marketplace/nfts', {
            name: 'marketplace-nfts',
            title: 'NFTs en Venta',
            component: 'marketplace',
            requiresAuth: false,
            meta: {
                description: 'Explora NFTs disponibles para compra',
                keywords: ['nft', 'venta', 'colección']
            }
        });

        this.addRoute('/marketplace/lands', {
            name: 'marketplace-lands',
            title: 'Tierras Virtuales',
            component: 'marketplace',
            requiresAuth: false,
            meta: {
                description: 'Compra y vende tierras virtuales',
                keywords: ['tierras', 'virtual', 'propiedad']
            }
        });

        // Rutas de comunidad
        this.addRoute('/community', {
            name: 'community',
            title: 'Comunidad',
            component: 'community',
            requiresAuth: false,
            meta: {
                description: 'Conecta con otros usuarios del metaverso',
                keywords: ['comunidad', 'social', 'usuarios']
            }
        });

        this.addRoute('/community/events', {
            name: 'events',
            title: 'Eventos',
            component: 'community',
            requiresAuth: false,
            meta: {
                description: 'Eventos y actividades del metaverso',
                keywords: ['eventos', 'actividades', 'social']
            }
        });

        // Rutas de ayuda
        this.addRoute('/help', {
            name: 'help',
            title: 'Centro de Ayuda',
            component: 'help',
            requiresAuth: false,
            meta: {
                description: 'Guías y soporte para usuarios',
                keywords: ['ayuda', 'soporte', 'guías']
            }
        });

        this.addRoute('/help/faq', {
            name: 'faq',
            title: 'Preguntas Frecuentes',
            component: 'help',
            requiresAuth: false,
            meta: {
                description: 'Respuestas a preguntas comunes',
                keywords: ['faq', 'preguntas', 'respuestas']
            }
        });

        // Ruta 404
        this.addRoute('*', {
            name: 'not-found',
            title: 'Página No Encontrada',
            component: 'error',
            requiresAuth: false,
            meta: {
                description: 'La página que buscas no existe',
                keywords: ['error', '404', 'no encontrado']
            }
        });
    }

    /**
     * Crear transiciones
     */
    createTransitions() {
        // Transición fade
        this.transitions.set('fade', {
            enter: (element) => {
                element.style.opacity = '0';
                element.style.display = 'block';
                setTimeout(() => {
                    element.style.opacity = '1';
                }, 10);
            },
            exit: (element) => {
                element.style.opacity = '0';
                setTimeout(() => {
                    element.style.display = 'none';
                }, 300);
            }
        });

        // Transición slide
        this.transitions.set('slide', {
            enter: (element) => {
                element.style.transform = 'translateX(100%)';
                element.style.display = 'block';
                setTimeout(() => {
                    element.style.transform = 'translateX(0)';
                }, 10);
            },
            exit: (element) => {
                element.style.transform = 'translateX(-100%)';
                setTimeout(() => {
                    element.style.display = 'none';
                }, 300);
            }
        });

        // Transición scale
        this.transitions.set('scale', {
            enter: (element) => {
                element.style.transform = 'scale(0.8)';
                element.style.opacity = '0';
                element.style.display = 'block';
                setTimeout(() => {
                    element.style.transform = 'scale(1)';
                    element.style.opacity = '1';
                }, 10);
            },
            exit: (element) => {
                element.style.transform = 'scale(1.1)';
                element.style.opacity = '0';
                setTimeout(() => {
                    element.style.display = 'none';
                }, 300);
            }
        });

        // Transición flip
        this.transitions.set('flip', {
            enter: (element) => {
                element.style.transform = 'rotateY(90deg)';
                element.style.display = 'block';
                setTimeout(() => {
                    element.style.transform = 'rotateY(0deg)';
                }, 10);
            },
            exit: (element) => {
                element.style.transform = 'rotateY(-90deg)';
                setTimeout(() => {
                    element.style.display = 'none';
                }, 300);
            }
        });
    }

    /**
     * Manejar ruta inicial
     */
    handleInitialRoute() {
        const path = window.location.pathname;
        this.navigate(path, { replace: true });
    }

    /**
     * Añadir ruta
     */
    addRoute(path, config) {
        this.routes.set(path, {
            path,
            ...config,
            pattern: this.createPattern(path)
        });
    }

    /**
     * Crear patrón de ruta
     */
    createPattern(path) {
        if (path === '*') return null;
        
        const segments = path.split('/').filter(Boolean);
        const pattern = segments.map(segment => {
            if (segment.startsWith(':')) {
                return { type: 'param', name: segment.slice(1) };
            }
            return { type: 'literal', value: segment };
        });
        
        return pattern;
    }

    /**
     * Navegar a ruta
     */
    async navigate(path, options = {}) {
        const { replace = false, transition = 'fade' } = options;
        
        try {
            // Encontrar ruta
            const route = this.findRoute(path);
            if (!route) {
                return this.navigate('*', options);
            }

            // Ejecutar middleware
            for (const middleware of this.middleware) {
                const result = await middleware(route, path);
                if (result === false) {
                    return false;
                }
            }

            // Verificar autenticación
            if (route.requiresAuth && !this.isAuthenticated()) {
                return this.navigate('/login', { 
                    ...options, 
                    query: { redirect: path } 
                });
            }

            // Extraer parámetros
            const params = this.extractParams(route, path);
            
            // Actualizar historial
            if (!replace) {
                this.addToHistory(path);
            }
            
            // Actualizar URL
            this.updateURL(path, replace);
            
            // Actualizar metadatos
            this.updateMetadata(route);
            
            // Ejecutar transición
            await this.executeTransition(route, transition);
            
            // Actualizar estado
            this.currentRoute = route;
            
            // Disparar evento
            this.dispatchEvent('routeChanged', { route, path, params });
            
            return true;
            
        } catch (error) {
            console.error('Error en navegación:', error);
            return false;
        }
    }

    /**
     * Encontrar ruta
     */
    findRoute(path) {
        // Buscar ruta exacta
        if (this.routes.has(path)) {
            return this.routes.get(path);
        }

        // Buscar ruta con parámetros
        for (const [routePath, route] of this.routes) {
            if (routePath === '*') continue;
            
            if (this.matchesPattern(route.pattern, path)) {
                return route;
            }
        }

        // Ruta 404
        return this.routes.get('*');
    }

    /**
     * Verificar si la ruta coincide con el patrón
     */
    matchesPattern(pattern, path) {
        if (!pattern) return false;
        
        const segments = path.split('/').filter(Boolean);
        
        if (segments.length !== pattern.length) {
            return false;
        }
        
        for (let i = 0; i < pattern.length; i++) {
            const segment = segments[i];
            const patternSegment = pattern[i];
            
            if (patternSegment.type === 'literal' && patternSegment.value !== segment) {
                return false;
            }
        }
        
        return true;
    }

    /**
     * Extraer parámetros de la ruta
     */
    extractParams(route, path) {
        if (!route.pattern) return {};
        
        const segments = path.split('/').filter(Boolean);
        const params = {};
        
        for (let i = 0; i < route.pattern.length; i++) {
            const patternSegment = route.pattern[i];
            const segment = segments[i];
            
            if (patternSegment.type === 'param') {
                params[patternSegment.name] = segment;
            }
        }
        
        return params;
    }

    /**
     * Verificar autenticación
     */
    isAuthenticated() {
        // Implementar verificación de autenticación
        return window.metaversoPages?.userSession?.isAuthenticated || false;
    }

    /**
     * Añadir al historial
     */
    addToHistory(path) {
        this.history.push(path);
        
        if (this.history.length > this.maxHistory) {
            this.history.shift();
        }
    }

    /**
     * Actualizar URL
     */
    updateURL(path, replace = false) {
        const url = new URL(window.location);
        url.pathname = path;
        
        if (replace) {
            window.history.replaceState({}, '', url);
        } else {
            window.history.pushState({}, '', url);
        }
    }

    /**
     * Actualizar metadatos
     */
    updateMetadata(route) {
        // Actualizar título
        document.title = route.title;
        
        // Actualizar meta tags
        if (route.meta) {
            this.updateMetaTags(route.meta);
        }
    }

    /**
     * Actualizar meta tags
     */
    updateMetaTags(meta) {
        // Descripción
        let metaDesc = document.querySelector('meta[name="description"]');
        if (!metaDesc) {
            metaDesc = document.createElement('meta');
            metaDesc.name = 'description';
            document.head.appendChild(metaDesc);
        }
        metaDesc.content = meta.description;

        // Keywords
        let metaKeywords = document.querySelector('meta[name="keywords"]');
        if (!metaKeywords) {
            metaKeywords = document.createElement('meta');
            metaKeywords.name = 'keywords';
            document.head.appendChild(metaKeywords);
        }
        metaKeywords.content = meta.keywords.join(', ');

        // Open Graph
        let ogTitle = document.querySelector('meta[property="og:title"]');
        if (!ogTitle) {
            ogTitle = document.createElement('meta');
            ogTitle.setAttribute('property', 'og:title');
            document.head.appendChild(ogTitle);
        }
        ogTitle.content = meta.title || document.title;

        let ogDesc = document.querySelector('meta[property="og:description"]');
        if (!ogDesc) {
            ogDesc = document.createElement('meta');
            ogDesc.setAttribute('property', 'og:description');
            document.head.appendChild(ogDesc);
        }
        ogDesc.content = meta.description;
    }

    /**
     * Ejecutar transición
     */
    async executeTransition(route, transitionName) {
        const transition = this.transitions.get(transitionName);
        if (!transition) return;

        const currentElement = document.getElementById('metaversoPageContainer');
        const newElement = document.createElement('div');
        newElement.id = 'metaversoPageContainer';
        newElement.className = 'metaverso-page-container';

        // Aplicar transición de salida
        if (currentElement) {
            transition.exit(currentElement);
        }

        // Esperar transición de salida
        await this.delay(300);

        // Reemplazar elemento
        if (currentElement) {
            currentElement.remove();
        }
        document.body.appendChild(newElement);

        // Aplicar transición de entrada
        transition.enter(newElement);
    }

    /**
     * Manejar popstate
     */
    handlePopState(event) {
        const path = window.location.pathname;
        this.navigate(path, { replace: true });
    }

    /**
     * Manejar click en enlaces
     */
    handleLinkClick(event) {
        const link = event.target.closest('a');
        if (!link) return;

        const href = link.getAttribute('href');
        if (!href || href.startsWith('http') || href.startsWith('mailto:') || href.startsWith('tel:')) {
            return;
        }

        event.preventDefault();
        this.navigate(href);
    }

    /**
     * Manejar cambio de hash
     */
    handleHashChange(event) {
        const hash = window.location.hash.slice(1);
        if (hash) {
            this.navigate(`/${hash}`);
        }
    }

    /**
     * Añadir middleware
     */
    addMiddleware(middleware) {
        this.middleware.push(middleware);
    }

    /**
     * Obtener ruta actual
     */
    getCurrentRoute() {
        return this.currentRoute;
    }

    /**
     * Obtener historial
     */
    getHistory() {
        return [...this.history];
    }

    /**
     * Ir hacia atrás
     */
    goBack() {
        if (this.history.length > 1) {
            this.history.pop(); // Remover ruta actual
            const previousPath = this.history[this.history.length - 1];
            this.navigate(previousPath, { replace: true });
        }
    }

    /**
     * Ir hacia adelante
     */
    goForward() {
        window.history.forward();
    }

    /**
     * Generar enlace
     */
    generateLink(routeName, params = {}) {
        const route = Array.from(this.routes.values()).find(r => r.name === routeName);
        if (!route) return '#';

        let path = route.path;
        
        // Reemplazar parámetros
        Object.entries(params).forEach(([key, value]) => {
            path = path.replace(`:${key}`, value);
        });

        return path;
    }

    /**
     * Obtener parámetros de consulta
     */
    getQueryParams() {
        const urlParams = new URLSearchParams(window.location.search);
        const params = {};
        
        for (const [key, value] of urlParams) {
            params[key] = value;
        }
        
        return params;
    }

    /**
     * Establecer parámetros de consulta
     */
    setQueryParams(params) {
        const url = new URL(window.location);
        
        Object.entries(params).forEach(([key, value]) => {
            if (value === null || value === undefined) {
                url.searchParams.delete(key);
            } else {
                url.searchParams.set(key, value);
            }
        });
        
        window.history.replaceState({}, '', url);
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

    /**
     * Función de delay
     */
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * Obtener estadísticas del router
     */
    getStats() {
        return {
            totalRoutes: this.routes.size,
            currentRoute: this.currentRoute?.name,
            historyLength: this.history.length,
            middlewareCount: this.middleware.length,
            transitionsCount: this.transitions.size
        };
    }
}

// Exportar para uso modular
export default MetaversoPageRouter;

// Funciones globales para integración
window.MetaversoPageRouter = MetaversoPageRouter;
window.createMetaversoPageRouter = () => {
    return new MetaversoPageRouter();
}; 
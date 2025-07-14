/**
 * Metaverso Navigation System
 * @author Metaverso Crypto World Virtual 3D
 * @version 1.0.0
 */

class MetaversoNavigation {
    constructor() {
        this.isInitialized = false;
        this.currentSection = 'home';
        this.sections = new Map();
        this.routes = new Map();
        this.history = [];
        this.maxHistory = 50;
        
        // Navigation state
        this.state = {
            isNavigating: false,
            canGoBack: false,
            canGoForward: false
        };
        
        // Navigation options
        this.options = {
            smoothScroll: true,
            updateURL: true,
            updateTitle: true,
            scrollToTop: true,
            preloadSections: true
        };
        
        // Event listeners
        this.eventListeners = new Map();
        
        // Preloaded sections
        this.preloadedSections = new Set();
    }

    /**
     * Initialize navigation system
     */
    async initialize() {
        try {
            console.log('🧭 Inicializando sistema de navegación...');
            
            // Setup sections
            this.setupSections();
            
            // Setup routes
            this.setupRoutes();
            
            // Setup history
            this.setupHistory();
            
            // Setup event listeners
            this.setupEventListeners();
            
            // Setup keyboard navigation
            this.setupKeyboardNavigation();
            
            // Setup scroll restoration
            this.setupScrollRestoration();
            
            // Handle initial route
            this.handleInitialRoute();
            
            this.isInitialized = true;
            console.log('✅ Sistema de navegación inicializado');
            
        } catch (error) {
            console.error('❌ Error inicializando sistema de navegación:', error);
            throw error;
        }
    }

    /**
     * Setup sections
     */
    setupSections() {
        const sections = document.querySelectorAll('.section');
        sections.forEach(section => {
            const sectionId = section.id;
            this.sections.set(sectionId, {
                element: section,
                isLoaded: false,
                isVisible: false,
                scrollPosition: 0
            });
        });
        
        console.log(`📋 ${this.sections.size} secciones registradas`);
    }

    /**
     * Setup routes
     */
    setupRoutes() {
        // Define routes
        const routeDefinitions = [
            { path: '/', section: 'home', title: 'Inicio' },
            { path: '/explore', section: 'explore', title: 'Explorar' },
            { path: '/marketplace', section: 'marketplace', title: 'Marketplace' },
            { path: '/defi', section: 'defi', title: 'DeFi' },
            { path: '/governance', section: 'governance', title: 'Gobernanza' },
            { path: '/community', section: 'community', title: 'Comunidad' }
        ];
        
        routeDefinitions.forEach(route => {
            this.routes.set(route.path, {
                section: route.section,
                title: route.title,
                isLoaded: false
            });
        });
        
        console.log(`🛣️ ${this.routes.size} rutas registradas`);
    }

    /**
     * Setup history
     */
    setupHistory() {
        // Listen for popstate events
        window.addEventListener('popstate', (event) => {
            this.handlePopState(event);
        });
    }

    /**
     * Setup event listeners
     */
    setupEventListeners() {
        // Navigation links
        document.addEventListener('click', (e) => {
            if (e.target.matches('.nav-link')) {
                e.preventDefault();
                const section = e.target.getAttribute('data-section');
                if (section) {
                    this.navigateToSection(section);
                }
            }
        });
        
        // Programmatic navigation
        document.addEventListener('click', (e) => {
            if (e.target.matches('[data-navigate]')) {
                e.preventDefault();
                const target = e.target.getAttribute('data-navigate');
                this.navigateToSection(target);
            }
        });
        
        // Back button
        const backBtn = document.getElementById('nav-back');
        if (backBtn) {
            backBtn.addEventListener('click', () => {
                this.goBack();
            });
        }
        
        // Forward button
        const forwardBtn = document.getElementById('nav-forward');
        if (forwardBtn) {
            forwardBtn.addEventListener('click', () => {
                this.goForward();
            });
        }
    }

    /**
     * Setup keyboard navigation
     */
    setupKeyboardNavigation() {
        document.addEventListener('keydown', (e) => {
            // Alt + Arrow keys for navigation
            if (e.altKey) {
                switch (e.key) {
                    case 'ArrowLeft':
                        e.preventDefault();
                        this.goBack();
                        break;
                    case 'ArrowRight':
                        e.preventDefault();
                        this.goForward();
                        break;
                    case 'Home':
                        e.preventDefault();
                        this.navigateToSection('home');
                        break;
                }
            }
            
            // Number keys for quick navigation
            if (e.ctrlKey || e.metaKey) {
                const sectionMap = {
                    '1': 'home',
                    '2': 'explore',
                    '3': 'marketplace',
                    '4': 'defi',
                    '5': 'governance',
                    '6': 'community'
                };
                
                if (sectionMap[e.key]) {
                    e.preventDefault();
                    this.navigateToSection(sectionMap[e.key]);
                }
            }
        });
    }

    /**
     * Setup scroll restoration
     */
    setupScrollRestoration() {
        // Save scroll position before navigation
        window.addEventListener('beforeunload', () => {
            this.saveScrollPosition();
        });
        
        // Restore scroll position after navigation
        window.addEventListener('load', () => {
            this.restoreScrollPosition();
        });
    }

    /**
     * Handle initial route
     */
    handleInitialRoute() {
        const path = window.location.pathname;
        const route = this.routes.get(path);
        
        if (route) {
            this.navigateToSection(route.section, { updateURL: false });
        } else {
            // Default to home
            this.navigateToSection('home', { updateURL: false });
        }
    }

    /**
     * Navigate to section
     */
    async navigateToSection(sectionId, options = {}) {
        if (this.state.isNavigating) return;
        
        const mergedOptions = { ...this.options, ...options };
        
        try {
            this.state.isNavigating = true;
            
            // Save current scroll position
            this.saveScrollPosition();
            
            // Hide current section
            await this.hideCurrentSection();
            
            // Show new section
            await this.showSection(sectionId);
            
            // Update navigation state
            this.updateNavigationState(sectionId);
            
            // Update URL if needed
            if (mergedOptions.updateURL) {
                this.updateURL(sectionId);
            }
            
            // Update title if needed
            if (mergedOptions.updateTitle) {
                this.updateTitle(sectionId);
            }
            
            // Scroll to top if needed
            if (mergedOptions.scrollToTop) {
                this.scrollToTop();
            }
            
            // Add to history
            this.addToHistory(sectionId);
            
            // Preload adjacent sections
            if (mergedOptions.preloadSections) {
                this.preloadAdjacentSections(sectionId);
            }
            
            // Emit navigation event
            this.emit('navigated', {
                from: this.currentSection,
                to: sectionId,
                options: mergedOptions
            });
            
            this.currentSection = sectionId;
            
        } catch (error) {
            console.error('❌ Error navegando a sección:', error);
            this.emit('navigationError', error);
        } finally {
            this.state.isNavigating = false;
        }
    }

    /**
     * Hide current section
     */
    async hideCurrentSection() {
        const currentSection = this.sections.get(this.currentSection);
        if (!currentSection) return;
        
        const { element } = currentSection;
        
        // Save scroll position
        currentSection.scrollPosition = window.scrollY;
        
        // Animate out
        element.classList.add('section-exit');
        element.classList.remove('active');
        
        // Wait for animation
        await this.waitForAnimation(element, 'section-exit');
        
        element.classList.remove('section-exit');
        currentSection.isVisible = false;
    }

    /**
     * Show section
     */
    async showSection(sectionId) {
        const section = this.sections.get(sectionId);
        if (!section) {
            throw new Error(`Sección ${sectionId} no encontrada`);
        }
        
        const { element } = section;
        
        // Load section content if needed
        if (!section.isLoaded) {
            await this.loadSectionContent(sectionId);
            section.isLoaded = true;
        }
        
        // Show section
        element.classList.add('active', 'section-enter');
        
        // Wait for animation
        await this.waitForAnimation(element, 'section-enter');
        
        element.classList.remove('section-enter');
        section.isVisible = true;
        
        // Update navigation links
        this.updateNavigationLinks(sectionId);
    }

    /**
     * Load section content
     */
    async loadSectionContent(sectionId) {
        // This would load content dynamically
        // For now, content is already in the DOM
        
        // Emit content loaded event
        this.emit('contentLoaded', sectionId);
    }

    /**
     * Update navigation state
     */
    updateNavigationState(sectionId) {
        // Update back/forward buttons
        this.state.canGoBack = this.history.length > 0;
        this.state.canGoForward = false; // Would need to implement forward stack
        
        // Update UI
        this.updateNavigationUI();
    }

    /**
     * Update navigation UI
     */
    updateNavigationUI() {
        // Update back button
        const backBtn = document.getElementById('nav-back');
        if (backBtn) {
            backBtn.disabled = !this.state.canGoBack;
        }
        
        // Update forward button
        const forwardBtn = document.getElementById('nav-forward');
        if (forwardBtn) {
            forwardBtn.disabled = !this.state.canGoForward;
        }
        
        // Update progress indicator
        this.updateProgressIndicator();
    }

    /**
     * Update navigation links
     */
    updateNavigationLinks(activeSection) {
        // Remove active class from all links
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
        });
        
        // Add active class to current link
        const activeLink = document.querySelector(`[data-section="${activeSection}"]`);
        if (activeLink) {
            activeLink.classList.add('active');
        }
    }

    /**
     * Update URL
     */
    updateURL(sectionId) {
        const route = Array.from(this.routes.entries()).find(([path, route]) => {
            return route.section === sectionId;
        });
        
        if (route) {
            const [path] = route;
            window.history.pushState({ section: sectionId }, '', path);
        }
    }

    /**
     * Update title
     */
    updateTitle(sectionId) {
        const route = Array.from(this.routes.values()).find(route => {
            return route.section === sectionId;
        });
        
        if (route) {
            document.title = `${route.title} - Metaverso Crypto World Virtual 3D`;
        }
    }

    /**
     * Add to history
     */
    addToHistory(sectionId) {
        this.history.push({
            section: sectionId,
            timestamp: Date.now(),
            scrollPosition: window.scrollY
        });
        
        // Limit history size
        if (this.history.length > this.maxHistory) {
            this.history.shift();
        }
    }

    /**
     * Go back
     */
    goBack() {
        if (!this.state.canGoBack || this.history.length === 0) return;
        
        const previousEntry = this.history.pop();
        if (previousEntry) {
            this.navigateToSection(previousEntry.section, {
                updateURL: true,
                scrollToTop: false
            });
            
            // Restore scroll position
            setTimeout(() => {
                window.scrollTo(0, previousEntry.scrollPosition);
            }, 100);
        }
    }

    /**
     * Go forward
     */
    goForward() {
        // This would require implementing a forward stack
        // For now, it's not implemented
        console.warn('Navegación hacia adelante no implementada');
    }

    /**
     * Handle popstate
     */
    handlePopState(event) {
        const path = window.location.pathname;
        const route = this.routes.get(path);
        
        if (route) {
            this.navigateToSection(route.section, { updateURL: false });
        }
    }

    /**
     * Save scroll position
     */
    saveScrollPosition() {
        const currentSection = this.sections.get(this.currentSection);
        if (currentSection) {
            currentSection.scrollPosition = window.scrollY;
        }
    }

    /**
     * Restore scroll position
     */
    restoreScrollPosition() {
        const currentSection = this.sections.get(this.currentSection);
        if (currentSection && currentSection.scrollPosition > 0) {
            window.scrollTo(0, currentSection.scrollPosition);
        }
    }

    /**
     * Scroll to top
     */
    scrollToTop() {
        if (this.options.smoothScroll) {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        } else {
            window.scrollTo(0, 0);
        }
    }

    /**
     * Preload adjacent sections
     */
    preloadAdjacentSections(sectionId) {
        const sectionOrder = ['home', 'explore', 'marketplace', 'defi', 'governance', 'community'];
        const currentIndex = sectionOrder.indexOf(sectionId);
        
        if (currentIndex === -1) return;
        
        // Preload next section
        const nextIndex = (currentIndex + 1) % sectionOrder.length;
        const nextSection = sectionOrder[nextIndex];
        this.preloadSection(nextSection);
        
        // Preload previous section
        const prevIndex = currentIndex === 0 ? sectionOrder.length - 1 : currentIndex - 1;
        const prevSection = sectionOrder[prevIndex];
        this.preloadSection(prevSection);
    }

    /**
     * Preload section
     */
    async preloadSection(sectionId) {
        if (this.preloadedSections.has(sectionId)) return;
        
        const section = this.sections.get(sectionId);
        if (!section || section.isLoaded) return;
        
        try {
            await this.loadSectionContent(sectionId);
            section.isLoaded = true;
            this.preloadedSections.add(sectionId);
            
            console.log(`📦 Sección ${sectionId} precargada`);
        } catch (error) {
            console.warn(`⚠️ Error precargando sección ${sectionId}:`, error);
        }
    }

    /**
     * Update progress indicator
     */
    updateProgressIndicator() {
        const progressIndicator = document.getElementById('nav-progress');
        if (!progressIndicator) return;
        
        const sectionOrder = ['home', 'explore', 'marketplace', 'defi', 'governance', 'community'];
        const currentIndex = sectionOrder.indexOf(this.currentSection);
        const progress = ((currentIndex + 1) / sectionOrder.length) * 100;
        
        progressIndicator.style.width = `${progress}%`;
    }

    /**
     * Wait for animation
     */
    waitForAnimation(element, className) {
        return new Promise((resolve) => {
            const handleAnimationEnd = () => {
                element.removeEventListener('animationend', handleAnimationEnd);
                element.removeEventListener('transitionend', handleAnimationEnd);
                resolve();
            };
            
            element.addEventListener('animationend', handleAnimationEnd);
            element.addEventListener('transitionend', handleAnimationEnd);
            
            // Fallback timeout
            setTimeout(resolve, 300);
        });
    }

    /**
     * Get current section
     */
    getCurrentSection() {
        return this.currentSection;
    }

    /**
     * Get section info
     */
    getSectionInfo(sectionId) {
        return this.sections.get(sectionId);
    }

    /**
     * Get route info
     */
    getRouteInfo(path) {
        return this.routes.get(path);
    }

    /**
     * Get navigation history
     */
    getHistory() {
        return [...this.history];
    }

    /**
     * Clear history
     */
    clearHistory() {
        this.history = [];
        this.updateNavigationState(this.currentSection);
    }

    /**
     * Add event listener
     */
    addEventListener(event, callback) {
        if (!this.eventListeners.has(event)) {
            this.eventListeners.set(event, []);
        }
        this.eventListeners.get(event).push(callback);
    }

    /**
     * Remove event listener
     */
    removeEventListener(event, callback) {
        if (this.eventListeners.has(event)) {
            const listeners = this.eventListeners.get(event);
            const index = listeners.indexOf(callback);
            if (index > -1) {
                listeners.splice(index, 1);
            }
        }
    }

    /**
     * Emit event
     */
    emit(event, data) {
        if (this.eventListeners.has(event)) {
            this.eventListeners.get(event).forEach(callback => {
                callback(data);
            });
        }
    }

    /**
     * Dispose
     */
    dispose() {
        // Clear history
        this.clearHistory();
        
        // Clear sections
        this.sections.clear();
        
        // Clear routes
        this.routes.clear();
        
        // Clear preloaded sections
        this.preloadedSections.clear();
        
        // Clear event listeners
        this.eventListeners.clear();
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = MetaversoNavigation;
} 
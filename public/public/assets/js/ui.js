/**
 * Metaverso UI System
 * @author Metaverso Crypto World Virtual 3D
 * @version 1.0.0
 */

class MetaversoUI {
    constructor() {
        this.isInitialized = false;
        this.currentTheme = 'dark';
        this.currentLanguage = 'es';
        this.modals = new Map();
        this.notifications = [];
        this.tooltips = new Map();
        this.loadingStates = new Map();
        
        // UI components
        this.components = {
            modals: new Map(),
            dropdowns: new Map(),
            tooltips: new Map(),
            notifications: new Map(),
            loading: new Map()
        };
        
        // Event listeners
        this.eventListeners = new Map();
        
        // Animation queue
        this.animationQueue = [];
        this.isAnimating = false;
    }

    /**
     * Initialize UI system
     */
    async initialize() {
        try {
            console.log('🎨 Inicializando sistema UI...');
            
            // Setup theme
            this.setupTheme();
            
            // Setup language
            this.setupLanguage();
            
            // Initialize components
            this.initializeComponents();
            
            // Setup event listeners
            this.setupEventListeners();
            
            // Setup animations
            this.setupAnimations();
            
            // Setup accessibility
            this.setupAccessibility();
            
            this.isInitialized = true;
            console.log('✅ Sistema UI inicializado');
            
        } catch (error) {
            console.error('❌ Error inicializando sistema UI:', error);
            throw error;
        }
    }

    /**
     * Setup theme
     */
    setupTheme() {
        // Load saved theme or use default
        const savedTheme = localStorage.getItem('metaverso-theme') || 'dark';
        this.setTheme(savedTheme);
        
        // Add theme toggle functionality
        const themeToggle = document.getElementById('theme-toggle');
        if (themeToggle) {
            themeToggle.addEventListener('click', () => {
                this.toggleTheme();
            });
        }
    }

    /**
     * Set theme
     */
    setTheme(theme) {
        this.currentTheme = theme;
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('metaverso-theme', theme);
        
        // Update theme-specific styles
        this.updateThemeStyles(theme);
        
        // Emit theme change event
        this.emit('themeChanged', theme);
    }

    /**
     * Toggle theme
     */
    toggleTheme() {
        const newTheme = this.currentTheme === 'dark' ? 'light' : 'dark';
        this.setTheme(newTheme);
    }

    /**
     * Update theme styles
     */
    updateThemeStyles(theme) {
        const root = document.documentElement;
        
        if (theme === 'light') {
            root.style.setProperty('--bg-primary', '#ffffff');
            root.style.setProperty('--bg-secondary', '#f5f5f5');
            root.style.setProperty('--text-primary', '#000000');
            root.style.setProperty('--text-secondary', '#666666');
        } else {
            root.style.setProperty('--bg-primary', '#0a0a0a');
            root.style.setProperty('--bg-secondary', '#1a1a1a');
            root.style.setProperty('--text-primary', '#ffffff');
            root.style.setProperty('--text-secondary', '#cccccc');
        }
    }

    /**
     * Setup language
     */
    setupLanguage() {
        // Load saved language or use browser language
        const savedLanguage = localStorage.getItem('metaverso-language') || navigator.language.split('-')[0];
        this.setLanguage(savedLanguage);
        
        // Add language selector functionality
        const languageSelector = document.getElementById('language-selector');
        if (languageSelector) {
            languageSelector.addEventListener('change', (e) => {
                this.setLanguage(e.target.value);
            });
        }
    }

    /**
     * Set language
     */
    setLanguage(language) {
        this.currentLanguage = language;
        localStorage.setItem('metaverso-language', language);
        
        // Update text content
        this.updateTextContent(language);
        
        // Emit language change event
        this.emit('languageChanged', language);
    }

    /**
     * Update text content
     */
    updateTextContent(language) {
        // This would load and apply translations
        // For now, we'll use a simple approach
        const elements = document.querySelectorAll('[data-i18n]');
        elements.forEach(element => {
            const key = element.getAttribute('data-i18n');
            const translation = this.getTranslation(key, language);
            if (translation) {
                element.textContent = translation;
            }
        });
    }

    /**
     * Get translation
     */
    getTranslation(key, language) {
        // This would load from a translation file
        // For now, return the key
        return key;
    }

    /**
     * Initialize components
     */
    initializeComponents() {
        // Initialize modals
        this.initializeModals();
        
        // Initialize dropdowns
        this.initializeDropdowns();
        
        // Initialize tooltips
        this.initializeTooltips();
        
        // Initialize notifications
        this.initializeNotifications();
        
        // Initialize loading states
        this.initializeLoadingStates();
    }

    /**
     * Initialize modals
     */
    initializeModals() {
        const modals = document.querySelectorAll('.modal');
        modals.forEach(modal => {
            const modalId = modal.id;
            this.components.modals.set(modalId, {
                element: modal,
                isOpen: false,
                backdrop: null
            });
            
            // Add close functionality
            const closeBtn = modal.querySelector('.modal-close');
            if (closeBtn) {
                closeBtn.addEventListener('click', () => {
                    this.closeModal(modalId);
                });
            }
        });
    }

    /**
     * Initialize dropdowns
     */
    initializeDropdowns() {
        const dropdowns = document.querySelectorAll('.dropdown');
        dropdowns.forEach(dropdown => {
            const dropdownId = dropdown.id || this.generateId();
            this.components.dropdowns.set(dropdownId, {
                element: dropdown,
                isOpen: false,
                trigger: dropdown.querySelector('.dropdown-trigger'),
                content: dropdown.querySelector('.dropdown-content')
            });
            
            // Add toggle functionality
            const trigger = dropdown.querySelector('.dropdown-trigger');
            if (trigger) {
                trigger.addEventListener('click', () => {
                    this.toggleDropdown(dropdownId);
                });
            }
        });
    }

    /**
     * Initialize tooltips
     */
    initializeTooltips() {
        const tooltipElements = document.querySelectorAll('[data-tooltip]');
        tooltipElements.forEach(element => {
            this.createTooltip(element);
        });
    }

    /**
     * Initialize notifications
     */
    initializeNotifications() {
        // Create notification container if it doesn't exist
        if (!document.getElementById('notifications')) {
            const container = document.createElement('div');
            container.id = 'notifications';
            container.className = 'notifications';
            document.body.appendChild(container);
        }
    }

    /**
     * Initialize loading states
     */
    initializeLoadingStates() {
        // This would setup loading indicators
    }

    /**
     * Setup event listeners
     */
    setupEventListeners() {
        // Global click handler for closing modals and dropdowns
        document.addEventListener('click', (e) => {
            this.handleGlobalClick(e);
        });
        
        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            this.handleKeyboardShortcuts(e);
        });
        
        // Window resize
        window.addEventListener('resize', () => {
            this.handleResize();
        });
        
        // Scroll events
        window.addEventListener('scroll', () => {
            this.handleScroll();
        });
    }

    /**
     * Setup animations
     */
    setupAnimations() {
        // Setup GSAP if available
        if (typeof gsap !== 'undefined') {
            gsap.registerPlugin(ScrollTrigger);
        }
        
        // Setup intersection observer for animations
        this.setupIntersectionObserver();
    }

    /**
     * Setup intersection observer
     */
    setupIntersectionObserver() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate-in');
                }
            });
        }, {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        });
        
        // Observe elements with animation classes
        const animatedElements = document.querySelectorAll('.animate-on-scroll');
        animatedElements.forEach(element => {
            observer.observe(element);
        });
    }

    /**
     * Setup accessibility
     */
    setupAccessibility() {
        // Add ARIA labels
        this.addAriaLabels();
        
        // Setup focus management
        this.setupFocusManagement();
        
        // Setup keyboard navigation
        this.setupKeyboardNavigation();
    }

    /**
     * Add ARIA labels
     */
    addAriaLabels() {
        // Add labels to interactive elements
        const buttons = document.querySelectorAll('button:not([aria-label])');
        buttons.forEach(button => {
            if (button.textContent.trim()) {
                button.setAttribute('aria-label', button.textContent.trim());
            }
        });
    }

    /**
     * Setup focus management
     */
    setupFocusManagement() {
        // Trap focus in modals
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Tab') {
                this.handleTabKey(e);
            }
        });
    }

    /**
     * Setup keyboard navigation
     */
    setupKeyboardNavigation() {
        // Add keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey || e.metaKey) {
                this.handleKeyboardShortcuts(e);
            }
        });
    }

    /**
     * Show modal
     */
    showModal(modalId, options = {}) {
        const modal = this.components.modals.get(modalId);
        if (!modal) {
            console.warn(`Modal ${modalId} not found`);
            return;
        }
        
        const { element, isOpen } = modal;
        
        if (isOpen) return;
        
        // Create backdrop
        const backdrop = document.createElement('div');
        backdrop.className = 'modal-backdrop';
        backdrop.addEventListener('click', () => {
            this.closeModal(modalId);
        });
        
        // Show modal
        element.style.display = 'block';
        document.body.appendChild(backdrop);
        
        // Animate in
        this.animateIn(element, 'modal');
        
        // Update state
        modal.isOpen = true;
        modal.backdrop = backdrop;
        
        // Focus first focusable element
        this.focusFirstElement(element);
        
        // Emit event
        this.emit('modalOpened', modalId);
    }

    /**
     * Close modal
     */
    closeModal(modalId) {
        const modal = this.components.modals.get(modalId);
        if (!modal || !modal.isOpen) return;
        
        const { element, backdrop } = modal;
        
        // Animate out
        this.animateOut(element, 'modal').then(() => {
            element.style.display = 'none';
            
            // Remove backdrop
            if (backdrop && backdrop.parentNode) {
                backdrop.parentNode.removeChild(backdrop);
            }
            
            // Update state
            modal.isOpen = false;
            modal.backdrop = null;
            
            // Emit event
            this.emit('modalClosed', modalId);
        });
    }

    /**
     * Toggle dropdown
     */
    toggleDropdown(dropdownId) {
        const dropdown = this.components.dropdowns.get(dropdownId);
        if (!dropdown) return;
        
        const { element, isOpen, content } = dropdown;
        
        if (isOpen) {
            this.closeDropdown(dropdownId);
        } else {
            this.openDropdown(dropdownId);
        }
    }

    /**
     * Open dropdown
     */
    openDropdown(dropdownId) {
        const dropdown = this.components.dropdowns.get(dropdownId);
        if (!dropdown) return;
        
        const { element, content } = dropdown;
        
        // Close other dropdowns
        this.closeAllDropdowns();
        
        // Show content
        if (content) {
            content.style.display = 'block';
            this.animateIn(content, 'dropdown');
        }
        
        // Update state
        dropdown.isOpen = true;
        element.classList.add('open');
        
        // Emit event
        this.emit('dropdownOpened', dropdownId);
    }

    /**
     * Close dropdown
     */
    closeDropdown(dropdownId) {
        const dropdown = this.components.dropdowns.get(dropdownId);
        if (!dropdown || !dropdown.isOpen) return;
        
        const { element, content } = dropdown;
        
        // Hide content
        if (content) {
            this.animateOut(content, 'dropdown').then(() => {
                content.style.display = 'none';
            });
        }
        
        // Update state
        dropdown.isOpen = false;
        element.classList.remove('open');
        
        // Emit event
        this.emit('dropdownClosed', dropdownId);
    }

    /**
     * Close all dropdowns
     */
    closeAllDropdowns() {
        this.components.dropdowns.forEach((dropdown, id) => {
            if (dropdown.isOpen) {
                this.closeDropdown(id);
            }
        });
    }

    /**
     * Create tooltip
     */
    createTooltip(element) {
        const text = element.getAttribute('data-tooltip');
        if (!text) return;
        
        const tooltip = document.createElement('div');
        tooltip.className = 'tooltip';
        tooltip.textContent = text;
        document.body.appendChild(tooltip);
        
        // Position tooltip
        const position = this.calculateTooltipPosition(element, tooltip);
        tooltip.style.left = position.x + 'px';
        tooltip.style.top = position.y + 'px';
        
        // Show/hide on hover
        element.addEventListener('mouseenter', () => {
            tooltip.classList.add('show');
        });
        
        element.addEventListener('mouseleave', () => {
            tooltip.classList.remove('show');
        });
        
        // Store reference
        this.tooltips.set(element, tooltip);
    }

    /**
     * Calculate tooltip position
     */
    calculateTooltipPosition(element, tooltip) {
        const rect = element.getBoundingClientRect();
        const tooltipRect = tooltip.getBoundingClientRect();
        
        let x = rect.left + (rect.width / 2) - (tooltipRect.width / 2);
        let y = rect.top - tooltipRect.height - 10;
        
        // Adjust if tooltip goes off screen
        if (x < 0) x = 10;
        if (x + tooltipRect.width > window.innerWidth) {
            x = window.innerWidth - tooltipRect.width - 10;
        }
        if (y < 0) {
            y = rect.bottom + 10;
        }
        
        return { x, y };
    }

    /**
     * Show notification
     */
    showNotification(message, type = 'info', duration = 5000) {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <div class="notification-header">
                <span class="notification-title">${type.toUpperCase()}</span>
                <button class="notification-close">&times;</button>
            </div>
            <div class="notification-message">${message}</div>
        `;
        
        const container = document.getElementById('notifications');
        container.appendChild(notification);
        
        // Animate in
        this.animateIn(notification, 'notification');
        
        // Auto remove
        setTimeout(() => {
            this.removeNotification(notification);
        }, duration);
        
        // Close button
        const closeBtn = notification.querySelector('.notification-close');
        closeBtn.addEventListener('click', () => {
            this.removeNotification(notification);
        });
        
        // Store reference
        this.notifications.push(notification);
        
        return notification;
    }

    /**
     * Remove notification
     */
    removeNotification(notification) {
        this.animateOut(notification, 'notification').then(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
            
            const index = this.notifications.indexOf(notification);
            if (index > -1) {
                this.notifications.splice(index, 1);
            }
        });
    }

    /**
     * Show loading
     */
    showLoading(element, message = 'Cargando...') {
        const loadingId = this.generateId();
        
        const loading = document.createElement('div');
        loading.className = 'loading-overlay';
        loading.innerHTML = `
            <div class="loading-content">
                <div class="spinner"></div>
                <p>${message}</p>
            </div>
        `;
        
        element.appendChild(loading);
        this.animateIn(loading, 'loading');
        
        this.loadingStates.set(loadingId, {
            element: loading,
            parent: element
        });
        
        return loadingId;
    }

    /**
     * Hide loading
     */
    hideLoading(loadingId) {
        const loading = this.loadingStates.get(loadingId);
        if (!loading) return;
        
        this.animateOut(loading.element, 'loading').then(() => {
            if (loading.element.parentNode) {
                loading.element.parentNode.removeChild(loading.element);
            }
            this.loadingStates.delete(loadingId);
        });
    }

    /**
     * Animate in
     */
    animateIn(element, type) {
        return new Promise((resolve) => {
            element.classList.add('animate-in');
            
            // Use GSAP if available
            if (typeof gsap !== 'undefined') {
                gsap.fromTo(element, 
                    { opacity: 0, scale: 0.8, y: 20 },
                    { 
                        opacity: 1, 
                        scale: 1, 
                        y: 0, 
                        duration: 0.3, 
                        ease: 'back.out(1.7)',
                        onComplete: resolve
                    }
                );
            } else {
                // Fallback CSS animation
                setTimeout(resolve, 300);
            }
        });
    }

    /**
     * Animate out
     */
    animateOut(element, type) {
        return new Promise((resolve) => {
            element.classList.add('animate-out');
            
            // Use GSAP if available
            if (typeof gsap !== 'undefined') {
                gsap.to(element, {
                    opacity: 0,
                    scale: 0.8,
                    y: -20,
                    duration: 0.2,
                    ease: 'power2.in',
                    onComplete: resolve
                });
            } else {
                // Fallback CSS animation
                setTimeout(resolve, 200);
            }
        });
    }

    /**
     * Handle global click
     */
    handleGlobalClick(e) {
        // Close dropdowns when clicking outside
        this.components.dropdowns.forEach((dropdown, id) => {
            if (dropdown.isOpen && !dropdown.element.contains(e.target)) {
                this.closeDropdown(id);
            }
        });
    }

    /**
     * Handle keyboard shortcuts
     */
    handleKeyboardShortcuts(e) {
        switch (e.key) {
            case 'Escape':
                // Close modals and dropdowns
                this.components.modals.forEach((modal, id) => {
                    if (modal.isOpen) {
                        this.closeModal(id);
                    }
                });
                this.closeAllDropdowns();
                break;
            case 'm':
                // Toggle mute
                if (window.metaverso && window.metaverso.audioSystem) {
                    window.metaverso.audioSystem.toggleMute();
                }
                break;
            case 'f':
                // Toggle fullscreen
                if (e.ctrlKey || e.metaKey) {
                    e.preventDefault();
                    this.toggleFullscreen();
                }
                break;
        }
    }

    /**
     * Handle tab key
     */
    handleTabKey(e) {
        // Trap focus in modals
        this.components.modals.forEach((modal, id) => {
            if (modal.isOpen) {
                const focusableElements = modal.element.querySelectorAll(
                    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
                );
                
                if (focusableElements.length === 0) return;
                
                const firstElement = focusableElements[0];
                const lastElement = focusableElements[focusableElements.length - 1];
                
                if (e.shiftKey) {
                    if (document.activeElement === firstElement) {
                        e.preventDefault();
                        lastElement.focus();
                    }
                } else {
                    if (document.activeElement === lastElement) {
                        e.preventDefault();
                        firstElement.focus();
                    }
                }
            }
        });
    }

    /**
     * Handle resize
     */
    handleResize() {
        // Update tooltip positions
        this.tooltips.forEach((tooltip, element) => {
            const position = this.calculateTooltipPosition(element, tooltip);
            tooltip.style.left = position.x + 'px';
            tooltip.style.top = position.y + 'px';
        });
    }

    /**
     * Handle scroll
     */
    handleScroll() {
        // Update sticky elements
        const stickyElements = document.querySelectorAll('.sticky');
        stickyElements.forEach(element => {
            const rect = element.getBoundingClientRect();
            if (rect.top <= 0) {
                element.classList.add('stuck');
            } else {
                element.classList.remove('stuck');
            }
        });
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
     * Focus first element
     */
    focusFirstElement(container) {
        const focusableElements = container.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        
        if (focusableElements.length > 0) {
            focusableElements[0].focus();
        }
    }

    /**
     * Generate ID
     */
    generateId() {
        return 'ui-' + Math.random().toString(36).substr(2, 9);
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
        // Remove all tooltips
        this.tooltips.forEach(tooltip => {
            if (tooltip.parentNode) {
                tooltip.parentNode.removeChild(tooltip);
            }
        });
        
        // Remove all notifications
        this.notifications.forEach(notification => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        });
        
        // Close all modals
        this.components.modals.forEach((modal, id) => {
            if (modal.isOpen) {
                this.closeModal(id);
            }
        });
        
        // Close all dropdowns
        this.closeAllDropdowns();
        
        // Clear all states
        this.tooltips.clear();
        this.notifications = [];
        this.loadingStates.clear();
        this.eventListeners.clear();
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = MetaversoUI;
} 
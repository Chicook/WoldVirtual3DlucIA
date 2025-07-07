/**
 * JavaScript Principal - Metaverso Crypto World Virtual 3D
 * @author Metaverso Team
 */

class MetaversoApp {
    constructor() {
        this.currentLanguage = 'es';
        this.isScrolling = false;
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.initializeAnimations();
        this.loadUserPreferences();
        this.updateLanguage();
        this.startStatsAnimation();
    }

    /**
     * Configurar event listeners
     */
    setupEventListeners() {
        // Navegación suave
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', (e) => {
                e.preventDefault();
                const target = document.querySelector(anchor.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({ behavior: 'smooth' });
                }
            });
        });

        // Selector de idioma
        const languageSelector = document.getElementById('languageSelector');
        if (languageSelector) {
            languageSelector.addEventListener('change', (e) => {
                this.currentLanguage = e.target.value;
                this.updateLanguage();
                this.saveUserPreferences();
            });
        }

        // Navegación móvil
        const navToggle = document.getElementById('navToggle');
        const navMenu = document.querySelector('.nav-menu');
        
        if (navToggle && navMenu) {
            navToggle.addEventListener('click', () => {
                navMenu.classList.toggle('active');
                navToggle.classList.toggle('active');
            });
        }

        // Scroll events
        window.addEventListener('scroll', () => {
            this.handleScroll();
        });

        // Formulario de contacto
        const contactForm = document.getElementById('contactForm');
        if (contactForm) {
            contactForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleContactSubmit();
            });
        }

        // Botones de acción
        this.setupActionButtons();
    }

    /**
     * Configurar botones de acción
     */
    setupActionButtons() {
        // Botón de lanzar metaverso
        const launchButtons = document.querySelectorAll('[onclick*="launchMetaverse"]');
        launchButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                this.launchMetaverse();
            });
        });

        // Botón de comenzar experiencia
        const startButtons = document.querySelectorAll('[onclick*="startExperience"]');
        startButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                this.startExperience();
            });
        });

        // Botón de ver demo
        const demoButtons = document.querySelectorAll('[onclick*="watchDemo"]');
        demoButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                this.watchDemo();
            });
        });
    }

    /**
     * Inicializar animaciones
     */
    initializeAnimations() {
        // Animación de elementos flotantes
        this.animateFloatingElements();
        
        // Animación de partículas
        this.animateParticles();
        
        // Animación de progreso
        this.animateProgressBars();
        
        // Intersection Observer para animaciones al hacer scroll
        this.setupScrollAnimations();
    }

    /**
     * Animar elementos flotantes
     */
    animateFloatingElements() {
        const elements = document.querySelectorAll('.element');
        elements.forEach((element, index) => {
            element.style.animationDelay = `${index * 1.5}s`;
        });
    }

    /**
     * Animar partículas
     */
    animateParticles() {
        const particles = document.querySelector('.hero-particles');
        if (particles) {
            // Crear partículas dinámicas
            for (let i = 0; i < 50; i++) {
                const particle = document.createElement('div');
                particle.className = 'particle';
                particle.style.cssText = `
                    position: absolute;
                    width: 2px;
                    height: 2px;
                    background: rgba(102, 126, 234, 0.5);
                    border-radius: 50%;
                    left: ${Math.random() * 100}%;
                    top: ${Math.random() * 100}%;
                    animation: particleFloat ${5 + Math.random() * 10}s infinite;
                `;
                particles.appendChild(particle);
            }
        }
    }

    /**
     * Animar barras de progreso
     */
    animateProgressBars() {
        const progressBars = document.querySelectorAll('.progress-fill');
        progressBars.forEach(bar => {
            const progress = bar.getAttribute('data-progress');
            setTimeout(() => {
                bar.style.width = `${progress}%`;
            }, 500);
        });
    }

    /**
     * Configurar animaciones al hacer scroll
     */
    setupScrollAnimations() {
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate-in');
                }
            });
        }, observerOptions);

        // Observar elementos para animar
        document.querySelectorAll('.wiper-card, .feature-card, .team-member, .timeline-item').forEach(el => {
            observer.observe(el);
        });
    }

    /**
     * Manejar scroll
     */
    handleScroll() {
        if (this.isScrolling) return;
        
        this.isScrolling = true;
        requestAnimationFrame(() => {
            this.updateHeaderOnScroll();
            this.isScrolling = false;
        });
    }

    /**
     * Actualizar header en scroll
     */
    updateHeaderOnScroll() {
        const header = document.querySelector('.header');
        const scrollY = window.scrollY;
        
        if (scrollY > 100) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    }

    /**
     * Animar estadísticas
     */
    startStatsAnimation() {
        const stats = document.querySelectorAll('.stat-number');
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    this.animateNumber(entry.target);
                    observer.unobserve(entry.target);
                }
            });
        });

        stats.forEach(stat => observer.observe(stat));
    }

    /**
     * Animar número
     */
    animateNumber(element) {
        const target = parseInt(element.getAttribute('data-target'));
        const duration = 2000;
        const step = target / (duration / 16);
        let current = 0;

        const timer = setInterval(() => {
            current += step;
            if (current >= target) {
                current = target;
                clearInterval(timer);
            }
            
            element.textContent = Math.floor(current).toLocaleString();
        }, 16);
    }

    /**
     * Lanzar metaverso
     */
    launchMetaverse() {
        this.showNotification('🚀 Iniciando Metaverso...', 'info');
        
        // Simular carga
        setTimeout(() => {
            this.showNotification('¡Metaverso en desarrollo! Próximamente disponible.', 'warning');
        }, 2000);
    }

    /**
     * Comenzar experiencia
     */
    startExperience() {
        this.showNotification('🎮 Iniciando experiencia...', 'info');
        
        // Redirigir a la demo
        setTimeout(() => {
            window.location.href = '/demo';
        }, 1000);
    }

    /**
     * Ver demo
     */
    watchDemo() {
        this.showNotification('📹 Cargando demo...', 'info');
        
        // Abrir modal de demo
        this.openDemoModal();
    }

    /**
     * Abrir modal de demo
     */
    openDemoModal() {
        const modal = document.createElement('div');
        modal.className = 'demo-modal';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>Demo del Metaverso</h3>
                    <button class="modal-close" onclick="this.parentElement.parentElement.parentElement.remove()">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="modal-body">
                    <div class="demo-video">
                        <div class="video-placeholder">
                            <i class="fas fa-play-circle"></i>
                            <p>Video demo próximamente</p>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Cerrar modal al hacer clic fuera
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        });
    }

    /**
     * Manejar envío de formulario de contacto
     */
    handleContactSubmit() {
        const form = document.getElementById('contactForm');
        const formData = new FormData(form);
        
        // Validar formulario
        if (!this.validateContactForm(formData)) {
            return;
        }
        
        this.showNotification('📧 Enviando mensaje...', 'info');
        
        // Simular envío
        setTimeout(() => {
            this.showNotification('✅ Mensaje enviado correctamente', 'success');
            form.reset();
        }, 2000);
    }

    /**
     * Validar formulario de contacto
     */
    validateContactForm(formData) {
        const name = formData.get('name');
        const email = formData.get('email');
        const message = formData.get('message');
        
        if (!name || !email || !message) {
            this.showNotification('❌ Por favor, completa todos los campos', 'error');
            return false;
        }
        
        if (!this.isValidEmail(email)) {
            this.showNotification('❌ Por favor, ingresa un email válido', 'error');
            return false;
        }
        
        return true;
    }

    /**
     * Validar email
     */
    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    /**
     * Mostrar notificación
     */
    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <span>${message}</span>
                <button onclick="this.parentElement.parentElement.remove()">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        // Auto-remover después de 5 segundos
        setTimeout(() => {
            if (notification.parentElement) {
                notification.remove();
            }
        }, 5000);
    }

    /**
     * Actualizar idioma
     */
    updateLanguage() {
        // Aquí se implementaría la lógica de traducción
        console.log(`Idioma cambiado a: ${this.currentLanguage}`);
    }

    /**
     * Cargar preferencias del usuario
     */
    loadUserPreferences() {
        const savedLanguage = localStorage.getItem('metaverso-language');
        if (savedLanguage) {
            this.currentLanguage = savedLanguage;
            const selector = document.getElementById('languageSelector');
            if (selector) {
                selector.value = savedLanguage;
            }
        }
    }

    /**
     * Guardar preferencias del usuario
     */
    saveUserPreferences() {
        localStorage.setItem('metaverso-language', this.currentLanguage);
    }
}

// Inicializar aplicación cuando se carga la página
document.addEventListener('DOMContentLoaded', () => {
    window.metaversoApp = new MetaversoApp();
});

// Funciones globales para onclick
window.launchMetaverse = () => window.metaversoApp.launchMetaverse();
window.startExperience = () => window.metaversoApp.startExperience();
window.watchDemo = () => window.metaversoApp.watchDemo(); 
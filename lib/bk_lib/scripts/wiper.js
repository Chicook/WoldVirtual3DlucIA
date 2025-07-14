/**
 * Wiper Provisional - Sistema de seguimiento de progreso
 * @author Metaverso Team
 */

class WiperManager {
    constructor() {
        this.progressData = {
            frontend: { current: 40, target: 100, label: 'Frontend' },
            backend: { current: 15, target: 100, label: 'Backend' },
            blockchain: { current: 10, target: 100, label: 'Blockchain' },
            engine3d: { current: 5, target: 100, label: '3D Engine' }
        };
        
        this.overallProgress = 0;
        this.isAnimating = false;
        
        this.init();
    }

    init() {
        this.calculateOverallProgress();
        this.setupEventListeners();
        this.startProgressAnimation();
        this.setupRealTimeUpdates();
    }

    /**
     * Calcular progreso general
     */
    calculateOverallProgress() {
        const totalProgress = Object.values(this.progressData).reduce((sum, item) => {
            return sum + (item.current / item.target) * 100;
        }, 0);
        
        this.overallProgress = Math.round(totalProgress / Object.keys(this.progressData).length);
    }

    /**
     * Configurar event listeners
     */
    setupEventListeners() {
        // Hacer clic en tarjetas de progreso
        document.querySelectorAll('.wiper-card').forEach(card => {
            card.addEventListener('click', (e) => {
                this.showProgressDetails(card);
            });
        });

        // Hover effects
        document.querySelectorAll('.wiper-card').forEach(card => {
            card.addEventListener('mouseenter', (e) => {
                this.highlightCard(card);
            });

            card.addEventListener('mouseleave', (e) => {
                this.removeHighlight();
            });
        });
    }

    /**
     * Iniciar animación de progreso
     */
    startProgressAnimation() {
        const progressBars = document.querySelectorAll('.progress-fill');
        const progressNumbers = document.querySelectorAll('.progress-number');
        
        // Animar barras de progreso
        progressBars.forEach((bar, index) => {
            const progress = parseInt(bar.getAttribute('data-progress'));
            setTimeout(() => {
                this.animateProgressBar(bar, progress);
            }, index * 200);
        });

        // Animar número general
        const overallNumber = document.querySelector('.progress-number');
        if (overallNumber) {
            setTimeout(() => {
                this.animateNumber(overallNumber, this.overallProgress);
            }, 1000);
        }
    }

    /**
     * Animar barra de progreso
     */
    animateProgressBar(bar, targetProgress) {
        let currentProgress = 0;
        const duration = 2000;
        const step = targetProgress / (duration / 16);

        const timer = setInterval(() => {
            currentProgress += step;
            if (currentProgress >= targetProgress) {
                currentProgress = targetProgress;
                clearInterval(timer);
            }
            
            bar.style.width = `${currentProgress}%`;
        }, 16);
    }

    /**
     * Animar número
     */
    animateNumber(element, target) {
        let current = 0;
        const duration = 2000;
        const step = target / (duration / 16);

        const timer = setInterval(() => {
            current += step;
            if (current >= target) {
                current = target;
                clearInterval(timer);
            }
            
            element.textContent = `${Math.round(current)}%`;
        }, 16);
    }

    /**
     * Mostrar detalles de progreso
     */
    showProgressDetails(card) {
        const category = this.getCategoryFromCard(card);
        const data = this.progressData[category];
        
        if (!data) return;

        this.openProgressModal(category, data);
    }

    /**
     * Obtener categoría de la tarjeta
     */
    getCategoryFromCard(card) {
        const title = card.querySelector('h3').textContent.toLowerCase();
        
        if (title.includes('frontend')) return 'frontend';
        if (title.includes('backend')) return 'backend';
        if (title.includes('blockchain')) return 'blockchain';
        if (title.includes('3d')) return 'engine3d';
        
        return null;
    }

    /**
     * Abrir modal de detalles de progreso
     */
    openProgressModal(category, data) {
        const modal = document.createElement('div');
        modal.className = 'progress-modal';
        
        const tasks = this.getTasksForCategory(category);
        const tasksHtml = tasks.map(task => {
            const statusIcon = task.completed ? '✅' : '⏳';
            const statusClass = task.completed ? 'completed' : 'pending';
            return `<li class="task-${statusClass}">${statusIcon} ${task.description}</li>`;
        }).join('');

        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>${data.label} - Detalles de Progreso</h3>
                    <button class="modal-close" onclick="this.parentElement.parentElement.parentElement.remove()">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="modal-body">
                    <div class="progress-overview">
                        <div class="progress-circle-large" data-progress="${data.current}">
                            <span class="progress-number">${data.current}%</span>
                        </div>
                        <div class="progress-info">
                            <h4>Progreso Actual</h4>
                            <p>${data.current}% de ${data.target}% completado</p>
                            <div class="progress-bar-detailed">
                                <div class="progress-fill-detailed" data-progress="${data.current}"></div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="tasks-section">
                        <h4>Tareas Principales</h4>
                        <ul class="tasks-list">
                            ${tasksHtml}
                        </ul>
                    </div>
                    
                    <div class="timeline-section">
                        <h4>Línea de Tiempo</h4>
                        <div class="timeline-mini">
                            ${this.getTimelineForCategory(category)}
                        </div>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        // Animar progreso detallado
        setTimeout(() => {
            this.animateDetailedProgress(modal);
        }, 100);

        // Cerrar modal al hacer clic fuera
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        });
    }

    /**
     * Obtener tareas para categoría
     */
    getTasksForCategory(category) {
        const tasks = {
            frontend: [
                { description: 'Diseño de interfaz principal', completed: true },
                { description: 'Sistema de componentes', completed: true },
                { description: 'Responsive design', completed: true },
                { description: 'Animaciones y transiciones', completed: false },
                { description: 'Optimización de rendimiento', completed: false },
                { description: 'Testing cross-browser', completed: false }
            ],
            backend: [
                { description: 'Arquitectura del servidor', completed: true },
                { description: 'API REST básica', completed: true },
                { description: 'Base de datos', completed: false },
                { description: 'Autenticación de usuarios', completed: false },
                { description: 'Sistema de cache', completed: false },
                { description: 'Monitoreo y logs', completed: false }
            ],
            blockchain: [
                { description: 'Configuración de red', completed: true },
                { description: 'Smart contracts básicos', completed: false },
                { description: 'Integración de wallet', completed: false },
                { description: 'Sistema de NFTs', completed: false },
                { description: 'Economía virtual', completed: false },
                { description: 'Transacciones en tiempo real', completed: false }
            ],
            engine3d: [
                { description: 'Configuración de Three.js', completed: true },
                { description: 'Sistema de escenas', completed: false },
                { description: 'Renderizado 3D', completed: false },
                { description: 'Física y colisiones', completed: false },
                { description: 'Animaciones 3D', completed: false },
                { description: 'Optimización de gráficos', completed: false }
            ]
        };
        
        return tasks[category] || [];
    }

    /**
     * Obtener timeline para categoría
     */
    getTimelineForCategory(category) {
        const timelines = {
            frontend: `
                <div class="timeline-item">
                    <span class="date">Ene 2024</span>
                    <span class="event">Diseño inicial</span>
                </div>
                <div class="timeline-item">
                    <span class="date">Feb 2024</span>
                    <span class="event">Componentes básicos</span>
                </div>
                <div class="timeline-item">
                    <span class="date">Mar 2024</span>
                    <span class="event">Responsive design</span>
                </div>
                <div class="timeline-item">
                    <span class="date">Abr 2024</span>
                    <span class="event">Optimización</span>
                </div>
            `,
            backend: `
                <div class="timeline-item">
                    <span class="date">Feb 2024</span>
                    <span class="event">Arquitectura</span>
                </div>
                <div class="timeline-item">
                    <span class="date">Mar 2024</span>
                    <span class="event">API básica</span>
                </div>
                <div class="timeline-item">
                    <span class="date">Abr 2024</span>
                    <span class="event">Base de datos</span>
                </div>
                <div class="timeline-item">
                    <span class="date">May 2024</span>
                    <span class="event">Autenticación</span>
                </div>
            `,
            blockchain: `
                <div class="timeline-item">
                    <span class="date">Mar 2024</span>
                    <span class="event">Configuración</span>
                </div>
                <div class="timeline-item">
                    <span class="date">Abr 2024</span>
                    <span class="event">Smart contracts</span>
                </div>
                <div class="timeline-item">
                    <span class="date">May 2024</span>
                    <span class="event">Wallet integration</span>
                </div>
                <div class="timeline-item">
                    <span class="date">Jun 2024</span>
                    <span class="event">NFTs</span>
                </div>
            `,
            engine3d: `
                <div class="timeline-item">
                    <span class="date">Abr 2024</span>
                    <span class="event">Three.js setup</span>
                </div>
                <div class="timeline-item">
                    <span class="date">May 2024</span>
                    <span class="event">Escenas 3D</span>
                </div>
                <div class="timeline-item">
                    <span class="date">Jun 2024</span>
                    <span class="event">Física</span>
                </div>
                <div class="timeline-item">
                    <span class="date">Jul 2024</span>
                    <span class="event">Optimización</span>
                </div>
            `
        };
        
        return timelines[category] || '';
    }

    /**
     * Animar progreso detallado
     */
    animateDetailedProgress(modal) {
        const progressFill = modal.querySelector('.progress-fill-detailed');
        const progressCircle = modal.querySelector('.progress-circle-large');
        
        if (progressFill) {
            const progress = parseInt(progressFill.getAttribute('data-progress'));
            setTimeout(() => {
                progressFill.style.width = `${progress}%`;
            }, 100);
        }

        if (progressCircle) {
            const progress = parseInt(progressCircle.getAttribute('data-progress'));
            progressCircle.style.background = `conic-gradient(var(--primary-color) ${progress * 3.6}deg, var(--bg-tertiary) 0deg)`;
        }
    }

    /**
     * Resaltar tarjeta
     */
    highlightCard(card) {
        this.removeHighlight();
        card.classList.add('highlighted');
    }

    /**
     * Remover resaltado
     */
    removeHighlight() {
        document.querySelectorAll('.wiper-card').forEach(card => {
            card.classList.remove('highlighted');
        });
    }

    /**
     * Configurar actualizaciones en tiempo real
     */
    setupRealTimeUpdates() {
        // Simular actualizaciones de progreso
        setInterval(() => {
            this.simulateProgressUpdate();
        }, 30000); // Cada 30 segundos
    }

    /**
     * Simular actualización de progreso
     */
    simulateProgressUpdate() {
        if (this.isAnimating) return;
        
        this.isAnimating = true;
        
        // Simular pequeña actualización aleatoria
        const categories = Object.keys(this.progressData);
        const randomCategory = categories[Math.floor(Math.random() * categories.length)];
        const currentData = this.progressData[randomCategory];
        
        if (currentData.current < currentData.target) {
            const increment = Math.random() * 2; // Máximo 2% de incremento
            currentData.current = Math.min(currentData.current + increment, currentData.target);
            
            this.updateProgressDisplay(randomCategory, currentData.current);
            this.calculateOverallProgress();
            this.updateOverallProgress();
        }
        
        setTimeout(() => {
            this.isAnimating = false;
        }, 2000);
    }

    /**
     * Actualizar display de progreso
     */
    updateProgressDisplay(category, progress) {
        const card = document.querySelector(`[data-category="${category}"]`);
        if (card) {
            const progressFill = card.querySelector('.progress-fill');
            const progressText = card.querySelector('.progress-text');
            
            if (progressFill) {
                progressFill.style.width = `${progress}%`;
            }
            
            if (progressText) {
                progressText.textContent = `${Math.round(progress)}% Completado`;
            }
        }
    }

    /**
     * Actualizar progreso general
     */
    updateOverallProgress() {
        const overallNumber = document.querySelector('.progress-number');
        if (overallNumber) {
            this.animateNumber(overallNumber, this.overallProgress);
        }
    }

    /**
     * Obtener estadísticas del wiper
     */
    getWiperStats() {
        const totalProgress = Object.values(this.progressData).reduce((sum, item) => sum + item.current, 0);
        const averageProgress = totalProgress / Object.keys(this.progressData).length;
        
        return {
            overallProgress: this.overallProgress,
            averageProgress: Math.round(averageProgress),
            categories: Object.keys(this.progressData).length,
            lastUpdated: new Date().toISOString()
        };
    }

    /**
     * Exportar datos del wiper
     */
    exportWiperData() {
        const data = {
            progressData: this.progressData,
            overallProgress: this.overallProgress,
            stats: this.getWiperStats(),
            lastUpdated: new Date().toISOString()
        };
        
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = 'metaverso-wiper-data.json';
        a.click();
        
        URL.revokeObjectURL(url);
    }
}

// Inicializar wiper cuando se carga la página
document.addEventListener('DOMContentLoaded', () => {
    window.wiperManager = new WiperManager();
});

// Funciones globales
window.showProgressDetails = (category) => window.wiperManager.showProgressDetails(category);
window.exportWiperData = () => window.wiperManager.exportWiperData(); 
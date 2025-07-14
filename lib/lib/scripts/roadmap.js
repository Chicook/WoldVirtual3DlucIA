/**
 * Roadmap Interactivo - Metaverso Crypto World Virtual 3D
 * @author Metaverso Team
 */

class RoadmapManager {
    constructor() {
        this.currentPhase = 1;
        this.phases = [
            {
                id: 1,
                name: 'Fundación',
                date: 'Q1 2024',
                progress: 75,
                status: 'active',
                features: [
                    { text: 'Página de inicio', status: 'completed' },
                    { text: 'Sistema de idiomas', status: 'completed' },
                    { text: 'Roadmap interactivo', status: 'in-progress' },
                    { text: 'Documentación inicial', status: 'pending' }
                ]
            },
            {
                id: 2,
                name: 'Desarrollo Core',
                date: 'Q2 2024',
                progress: 0,
                status: 'pending',
                features: [
                    { text: 'Integración blockchain', status: 'pending' },
                    { text: 'Sistema de avatares 3D', status: 'pending' },
                    { text: 'Chat multilingüe', status: 'pending' },
                    { text: 'Economía virtual', status: 'pending' }
                ]
            },
            {
                id: 3,
                name: 'Metaverso',
                date: 'Q3 2024',
                progress: 0,
                status: 'pending',
                features: [
                    { text: 'Mundos 3D inmersivos', status: 'pending' },
                    { text: 'Interacciones sociales', status: 'pending' },
                    { text: 'Marketplace NFT', status: 'pending' },
                    { text: 'Eventos virtuales', status: 'pending' }
                ]
            },
            {
                id: 4,
                name: 'Expansión',
                date: 'Q4 2024',
                progress: 0,
                status: 'pending',
                features: [
                    { text: 'Múltiples mundos', status: 'pending' },
                    { text: 'Integración externa', status: 'pending' },
                    { text: 'API pública', status: 'pending' },
                    { text: 'Comunidad global', status: 'pending' }
                ]
            }
        ];
        
        this.init();
    }

    init() {
        this.renderRoadmap();
        this.setupEventListeners();
        this.animateTimeline();
    }

    /**
     * Renderizar roadmap
     */
    renderRoadmap() {
        const timeline = document.querySelector('.roadmap-timeline');
        if (!timeline) return;

        timeline.innerHTML = this.phases.map(phase => this.renderPhase(phase)).join('');
    }

    /**
     * Renderizar fase individual
     */
    renderPhase(phase) {
        const featuresHtml = phase.features.map(feature => {
            const statusIcon = this.getStatusIcon(feature.status);
            return `<li class="feature-${feature.status}">${statusIcon} ${feature.text}</li>`;
        }).join('');

        return `
            <div class="timeline-item ${phase.status}" data-phase="${phase.id}">
                <div class="timeline-marker">
                    <i class="fas ${this.getPhaseIcon(phase.id)}"></i>
                </div>
                <div class="timeline-content">
                    <h3>Fase ${phase.id}: ${phase.name}</h3>
                    <span class="timeline-date">${phase.date}</span>
                    <ul class="timeline-features">
                        ${featuresHtml}
                    </ul>
                    <div class="timeline-progress">
                        <div class="phase-progress-bar">
                            <div class="phase-progress-fill" data-progress="${phase.progress}"></div>
                        </div>
                        <span>${phase.progress}% Completado</span>
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * Obtener icono de estado
     */
    getStatusIcon(status) {
        const icons = {
            'completed': '✅',
            'in-progress': '🔄',
            'pending': '⏳'
        };
        return icons[status] || '⏳';
    }

    /**
     * Obtener icono de fase
     */
    getPhaseIcon(phaseId) {
        const icons = {
            1: 'fa-rocket',
            2: 'fa-cogs',
            3: 'fa-gamepad',
            4: 'fa-globe'
        };
        return icons[phaseId] || 'fa-circle';
    }

    /**
     * Configurar event listeners
     */
    setupEventListeners() {
        // Hacer clic en fases del timeline
        document.querySelectorAll('.timeline-item').forEach(item => {
            item.addEventListener('click', (e) => {
                const phaseId = parseInt(item.getAttribute('data-phase'));
                this.showPhaseDetails(phaseId);
            });
        });

        // Hover effects
        document.querySelectorAll('.timeline-content').forEach(content => {
            content.addEventListener('mouseenter', (e) => {
                this.highlightPhase(e.target.closest('.timeline-item'));
            });

            content.addEventListener('mouseleave', (e) => {
                this.removeHighlight();
            });
        });
    }

    /**
     * Mostrar detalles de la fase
     */
    showPhaseDetails(phaseId) {
        const phase = this.phases.find(p => p.id === phaseId);
        if (!phase) return;

        this.openPhaseModal(phase);
    }

    /**
     * Abrir modal de detalles de fase
     */
    openPhaseModal(phase) {
        const modal = document.createElement('div');
        modal.className = 'phase-modal';
        
        const featuresList = phase.features.map(feature => {
            const statusClass = `status-${feature.status}`;
            return `<li class="${statusClass}">${this.getStatusIcon(feature.status)} ${feature.text}</li>`;
        }).join('');

        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>Fase ${phase.id}: ${phase.name}</h3>
                    <button class="modal-close" onclick="this.parentElement.parentElement.parentElement.remove()">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="modal-body">
                    <div class="phase-info">
                        <div class="phase-date">
                            <i class="fas fa-calendar"></i>
                            <span>${phase.date}</span>
                        </div>
                        <div class="phase-status">
                            <i class="fas fa-chart-line"></i>
                            <span>Estado: ${this.getStatusText(phase.status)}</span>
                        </div>
                    </div>
                    
                    <div class="phase-progress">
                        <h4>Progreso General</h4>
                        <div class="progress-circle-large" data-progress="${phase.progress}">
                            <span class="progress-number">${phase.progress}%</span>
                        </div>
                    </div>
                    
                    <div class="phase-features">
                        <h4>Características</h4>
                        <ul class="features-list">
                            ${featuresList}
                        </ul>
                    </div>
                    
                    <div class="phase-description">
                        <h4>Descripción</h4>
                        <p>${this.getPhaseDescription(phase.id)}</p>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        // Animar progreso
        setTimeout(() => {
            this.animatePhaseProgress(modal);
        }, 100);

        // Cerrar modal al hacer clic fuera
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        });
    }

    /**
     * Obtener texto de estado
     */
    getStatusText(status) {
        const statusTexts = {
            'active': 'En Desarrollo',
            'completed': 'Completado',
            'pending': 'Pendiente'
        };
        return statusTexts[status] || 'Desconocido';
    }

    /**
     * Obtener descripción de fase
     */
    getPhaseDescription(phaseId) {
        const descriptions = {
            1: 'Fase inicial de desarrollo donde establecemos los cimientos del metaverso. Incluye la creación de la página web, sistema de idiomas y documentación básica.',
            2: 'Desarrollo de las funcionalidades core del metaverso. Integración con blockchain, sistema de avatares 3D y comunicación multilingüe.',
            3: 'Creación del metaverso completo con mundos inmersivos, interacciones sociales y marketplace de NFTs.',
            4: 'Expansión del metaverso con múltiples mundos, integraciones externas y desarrollo de la comunidad global.'
        };
        return descriptions[phaseId] || 'Descripción no disponible.';
    }

    /**
     * Resaltar fase
     */
    highlightPhase(item) {
        this.removeHighlight();
        item.classList.add('highlighted');
    }

    /**
     * Remover resaltado
     */
    removeHighlight() {
        document.querySelectorAll('.timeline-item').forEach(item => {
            item.classList.remove('highlighted');
        });
    }

    /**
     * Animar timeline
     */
    animateTimeline() {
        const timelineItems = document.querySelectorAll('.timeline-item');
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry, index) => {
                if (entry.isIntersecting) {
                    setTimeout(() => {
                        entry.target.classList.add('animate-in');
                    }, index * 200);
                }
            });
        }, { threshold: 0.3 });

        timelineItems.forEach(item => observer.observe(item));
    }

    /**
     * Animar progreso de fase
     */
    animatePhaseProgress(modal) {
        const progressCircle = modal.querySelector('.progress-circle-large');
        const progressFill = modal.querySelector('.phase-progress-fill');
        
        if (progressCircle) {
            const progress = parseInt(progressCircle.getAttribute('data-progress'));
            progressCircle.style.background = `conic-gradient(var(--primary-color) ${progress * 3.6}deg, var(--bg-tertiary) 0deg)`;
        }

        if (progressFill) {
            const progress = parseInt(progressFill.getAttribute('data-progress'));
            setTimeout(() => {
                progressFill.style.width = `${progress}%`;
            }, 100);
        }
    }

    /**
     * Actualizar progreso de fase
     */
    updatePhaseProgress(phaseId, progress) {
        const phase = this.phases.find(p => p.id === phaseId);
        if (phase) {
            phase.progress = progress;
            this.renderRoadmap();
        }
    }

    /**
     * Obtener estadísticas del roadmap
     */
    getRoadmapStats() {
        const totalFeatures = this.phases.reduce((sum, phase) => sum + phase.features.length, 0);
        const completedFeatures = this.phases.reduce((sum, phase) => {
            return sum + phase.features.filter(f => f.status === 'completed').length;
        }, 0);
        const inProgressFeatures = this.phases.reduce((sum, phase) => {
            return sum + phase.features.filter(f => f.status === 'in-progress').length;
        }, 0);

        return {
            totalPhases: this.phases.length,
            totalFeatures,
            completedFeatures,
            inProgressFeatures,
            completionRate: Math.round((completedFeatures / totalFeatures) * 100)
        };
    }

    /**
     * Exportar roadmap como JSON
     */
    exportRoadmap() {
        const data = {
            phases: this.phases,
            stats: this.getRoadmapStats(),
            lastUpdated: new Date().toISOString()
        };
        
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = 'metaverso-roadmap.json';
        a.click();
        
        URL.revokeObjectURL(url);
    }
}

// Inicializar roadmap cuando se carga la página
document.addEventListener('DOMContentLoaded', () => {
    window.roadmapManager = new RoadmapManager();
});

// Funciones globales
window.showPhaseDetails = (phaseId) => window.roadmapManager.showPhaseDetails(phaseId);
window.exportRoadmap = () => window.roadmapManager.exportRoadmap();
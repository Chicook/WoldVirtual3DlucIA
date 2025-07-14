/**
 * Sistema de Personalización Avanzada de Avatares
 * Interfaz y lógica para personalizar avatares humanos 3D
 */

class AvatarCustomization {
    constructor(avatarGenerator, container) {
        this.avatarGenerator = avatarGenerator;
        this.container = container;
        this.ui = null;
        this.currentPreset = 'default';
        this.presets = this.createPresets();
        
        this.init();
    }

    /**
     * Inicializar sistema de personalización
     */
    init() {
        this.createUI();
        this.setupEventListeners();
        this.loadPreset(this.currentPreset);
    }

    /**
     * Crear presets predefinidos
     */
    createPresets() {
        return {
            default: {
                gender: 'male',
                height: 1.8,
                build: 'average',
                skinTone: 'medium',
                hairStyle: 'short',
                hairColor: 'brown',
                eyeColor: 'brown',
                clothing: 'casual',
                accessories: []
            },
            athlete: {
                gender: 'male',
                height: 1.85,
                build: 'athletic',
                skinTone: 'medium',
                hairStyle: 'short',
                hairColor: 'black',
                eyeColor: 'blue',
                clothing: 'sport',
                accessories: ['watch']
            },
            business: {
                gender: 'male',
                height: 1.75,
                build: 'average',
                skinTone: 'light',
                hairStyle: 'short',
                hairColor: 'brown',
                eyeColor: 'brown',
                clothing: 'formal',
                accessories: ['glasses', 'watch']
            },
            casual_female: {
                gender: 'female',
                height: 1.65,
                build: 'slim',
                skinTone: 'medium',
                hairStyle: 'long',
                hairColor: 'blonde',
                eyeColor: 'green',
                clothing: 'casual',
                accessories: ['necklace']
            },
            gamer: {
                gender: 'male',
                height: 1.78,
                build: 'average',
                skinTone: 'medium',
                hairStyle: 'short',
                hairColor: 'black',
                eyeColor: 'brown',
                clothing: 'casual',
                accessories: ['glasses']
            }
        };
    }

    /**
     * Crear interfaz de usuario
     */
    createUI() {
        this.ui = document.createElement('div');
        this.ui.className = 'avatar-customization-ui';
        this.ui.innerHTML = `
            <div class="customization-panel">
                <h2>Personalizar Avatar</h2>
                
                <div class="section">
                    <h3>Presets</h3>
                    <select id="preset-selector">
                        <option value="default">Default</option>
                        <option value="athlete">Athlete</option>
                        <option value="business">Business</option>
                        <option value="casual_female">Casual Female</option>
                        <option value="gamer">Gamer</option>
                    </select>
                </div>

                <div class="section">
                    <h3>Características Básicas</h3>
                    <div class="control-group">
                        <label>Género:</label>
                        <select id="gender-selector">
                            <option value="male">Masculino</option>
                            <option value="female">Femenino</option>
                        </select>
                    </div>
                    
                    <div class="control-group">
                        <label>Altura: <span id="height-value">1.8</span>m</label>
                        <input type="range" id="height-slider" min="1.5" max="2.0" step="0.05" value="1.8">
                    </div>
                    
                    <div class="control-group">
                        <label>Complexión:</label>
                        <select id="build-selector">
                            <option value="slim">Delgado</option>
                            <option value="average">Promedio</option>
                            <option value="athletic">Atlético</option>
                            <option value="heavy">Robusto</option>
                        </select>
                    </div>
                </div>

                <div class="section">
                    <h3>Apariencia</h3>
                    <div class="control-group">
                        <label>Tono de Piel:</label>
                        <select id="skin-tone-selector">
                            <option value="light">Claro</option>
                            <option value="medium">Medio</option>
                            <option value="dark">Oscuro</option>
                            <option value="veryDark">Muy Oscuro</option>
                        </select>
                    </div>
                    
                    <div class="control-group">
                        <label>Color de Ojos:</label>
                        <select id="eye-color-selector">
                            <option value="brown">Marrón</option>
                            <option value="blue">Azul</option>
                            <option value="green">Verde</option>
                            <option value="hazel">Avellana</option>
                        </select>
                    </div>
                </div>

                <div class="section">
                    <h3>Cabello</h3>
                    <div class="control-group">
                        <label>Estilo:</label>
                        <select id="hair-style-selector">
                            <option value="short">Corto</option>
                            <option value="long">Largo</option>
                            <option value="curly">Rizado</option>
                            <option value="bald">Calvo</option>
                        </select>
                    </div>
                    
                    <div class="control-group">
                        <label>Color:</label>
                        <select id="hair-color-selector">
                            <option value="black">Negro</option>
                            <option value="brown">Marrón</option>
                            <option value="blonde">Rubio</option>
                            <option value="red">Rojo</option>
                            <option value="gray">Gris</option>
                            <option value="white">Blanco</option>
                        </select>
                    </div>
                </div>

                <div class="section">
                    <h3>Ropa</h3>
                    <div class="control-group">
                        <label>Estilo:</label>
                        <select id="clothing-selector">
                            <option value="casual">Casual</option>
                            <option value="formal">Formal</option>
                            <option value="sport">Deportivo</option>
                        </select>
                    </div>
                </div>

                <div class="section">
                    <h3>Accesorios</h3>
                    <div class="accessories-grid">
                        <label class="checkbox-label">
                            <input type="checkbox" id="accessory-glasses" value="glasses">
                            Gafas
                        </label>
                        <label class="checkbox-label">
                            <input type="checkbox" id="accessory-hat" value="hat">
                            Sombrero
                        </label>
                        <label class="checkbox-label">
                            <input type="checkbox" id="accessory-watch" value="watch">
                            Reloj
                        </label>
                        <label class="checkbox-label">
                            <input type="checkbox" id="accessory-necklace" value="necklace">
                            Collar
                        </label>
                    </div>
                </div>

                <div class="section">
                    <h3>Acciones</h3>
                    <div class="action-buttons">
                        <button id="randomize-btn" class="btn btn-secondary">Aleatorio</button>
                        <button id="reset-btn" class="btn btn-secondary">Resetear</button>
                        <button id="save-btn" class="btn btn-primary">Guardar</button>
                        <button id="export-btn" class="btn btn-primary">Exportar</button>
                    </div>
                </div>
            </div>
        `;

        this.container.appendChild(this.ui);
        this.addStyles();
    }

    /**
     * Añadir estilos CSS
     */
    addStyles() {
        const style = document.createElement('style');
        style.textContent = `
            .avatar-customization-ui {
                position: fixed;
                top: 20px;
                right: 20px;
                width: 350px;
                max-height: 90vh;
                background: rgba(255, 255, 255, 0.95);
                border-radius: 10px;
                box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
                padding: 20px;
                overflow-y: auto;
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                z-index: 1000;
            }

            .customization-panel h2 {
                margin: 0 0 20px 0;
                color: #333;
                text-align: center;
                font-size: 1.5em;
            }

            .section {
                margin-bottom: 25px;
                padding-bottom: 20px;
                border-bottom: 1px solid #eee;
            }

            .section:last-child {
                border-bottom: none;
            }

            .section h3 {
                margin: 0 0 15px 0;
                color: #555;
                font-size: 1.1em;
            }

            .control-group {
                margin-bottom: 15px;
            }

            .control-group label {
                display: block;
                margin-bottom: 5px;
                color: #666;
                font-weight: 500;
            }

            .control-group select,
            .control-group input[type="range"] {
                width: 100%;
                padding: 8px;
                border: 1px solid #ddd;
                border-radius: 5px;
                font-size: 14px;
            }

            .control-group select:focus,
            .control-group input[type="range"]:focus {
                outline: none;
                border-color: #007bff;
                box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.25);
            }

            .accessories-grid {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 10px;
            }

            .checkbox-label {
                display: flex;
                align-items: center;
                padding: 8px;
                border: 1px solid #ddd;
                border-radius: 5px;
                cursor: pointer;
                transition: background-color 0.2s;
            }

            .checkbox-label:hover {
                background-color: #f8f9fa;
            }

            .checkbox-label input[type="checkbox"] {
                margin-right: 8px;
            }

            .action-buttons {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 10px;
            }

            .btn {
                padding: 10px 15px;
                border: none;
                border-radius: 5px;
                font-size: 14px;
                font-weight: 500;
                cursor: pointer;
                transition: all 0.2s;
            }

            .btn-primary {
                background-color: #007bff;
                color: white;
            }

            .btn-primary:hover {
                background-color: #0056b3;
            }

            .btn-secondary {
                background-color: #6c757d;
                color: white;
            }

            .btn-secondary:hover {
                background-color: #545b62;
            }

            #preset-selector {
                font-weight: bold;
                background-color: #e3f2fd;
            }

            #height-value {
                font-weight: bold;
                color: #007bff;
            }
        `;
        document.head.appendChild(style);
    }

    /**
     * Configurar event listeners
     */
    setupEventListeners() {
        // Preset selector
        document.getElementById('preset-selector').addEventListener('change', (e) => {
            this.loadPreset(e.target.value);
        });

        // Características básicas
        document.getElementById('gender-selector').addEventListener('change', (e) => {
            this.updateConfig({ gender: e.target.value });
        });

        document.getElementById('height-slider').addEventListener('input', (e) => {
            const height = parseFloat(e.target.value);
            document.getElementById('height-value').textContent = height.toFixed(2);
            this.updateConfig({ height });
        });

        document.getElementById('build-selector').addEventListener('change', (e) => {
            this.updateConfig({ build: e.target.value });
        });

        // Apariencia
        document.getElementById('skin-tone-selector').addEventListener('change', (e) => {
            this.updateConfig({ skinTone: e.target.value });
        });

        document.getElementById('eye-color-selector').addEventListener('change', (e) => {
            this.updateConfig({ eyeColor: e.target.value });
        });

        // Cabello
        document.getElementById('hair-style-selector').addEventListener('change', (e) => {
            this.updateConfig({ hairStyle: e.target.value });
        });

        document.getElementById('hair-color-selector').addEventListener('change', (e) => {
            this.updateConfig({ hairColor: e.target.value });
        });

        // Ropa
        document.getElementById('clothing-selector').addEventListener('change', (e) => {
            this.updateConfig({ clothing: e.target.value });
        });

        // Accesorios
        const accessoryCheckboxes = document.querySelectorAll('input[type="checkbox"][id^="accessory-"]');
        accessoryCheckboxes.forEach(checkbox => {
            checkbox.addEventListener('change', () => {
                this.updateAccessories();
            });
        });

        // Botones de acción
        document.getElementById('randomize-btn').addEventListener('click', () => {
            this.randomizeAvatar();
        });

        document.getElementById('reset-btn').addEventListener('click', () => {
            this.loadPreset('default');
        });

        document.getElementById('save-btn').addEventListener('click', () => {
            this.saveAvatar();
        });

        document.getElementById('export-btn').addEventListener('click', () => {
            this.exportAvatar();
        });
    }

    /**
     * Cargar preset
     */
    loadPreset(presetName) {
        const preset = this.presets[presetName];
        if (!preset) return;

        this.currentPreset = presetName;
        this.avatarGenerator.customize(preset);
        this.updateUI(preset);
    }

    /**
     * Actualizar configuración
     */
    updateConfig(updates) {
        const currentConfig = this.avatarGenerator.getConfig();
        const newConfig = { ...currentConfig, ...updates };
        this.avatarGenerator.customize(newConfig);
    }

    /**
     * Actualizar accesorios
     */
    updateAccessories() {
        const accessories = [];
        const accessoryCheckboxes = document.querySelectorAll('input[type="checkbox"][id^="accessory-"]:checked');
        
        accessoryCheckboxes.forEach(checkbox => {
            accessories.push(checkbox.value);
        });

        this.updateConfig({ accessories });
    }

    /**
     * Actualizar interfaz de usuario
     */
    updateUI(config) {
        // Actualizar selectores
        document.getElementById('gender-selector').value = config.gender;
        document.getElementById('height-slider').value = config.height;
        document.getElementById('height-value').textContent = config.height.toFixed(2);
        document.getElementById('build-selector').value = config.build;
        document.getElementById('skin-tone-selector').value = config.skinTone;
        document.getElementById('eye-color-selector').value = config.eyeColor;
        document.getElementById('hair-style-selector').value = config.hairStyle;
        document.getElementById('hair-color-selector').value = config.hairColor;
        document.getElementById('clothing-selector').value = config.clothing;

        // Actualizar accesorios
        const accessoryCheckboxes = document.querySelectorAll('input[type="checkbox"][id^="accessory-"]');
        accessoryCheckboxes.forEach(checkbox => {
            checkbox.checked = config.accessories.includes(checkbox.value);
        });
    }

    /**
     * Generar avatar aleatorio
     */
    randomizeAvatar() {
        const randomConfig = {
            gender: ['male', 'female'][Math.floor(Math.random() * 2)],
            height: 1.5 + Math.random() * 0.5,
            build: ['slim', 'average', 'athletic', 'heavy'][Math.floor(Math.random() * 4)],
            skinTone: ['light', 'medium', 'dark', 'veryDark'][Math.floor(Math.random() * 4)],
            hairStyle: ['short', 'long', 'curly', 'bald'][Math.floor(Math.random() * 4)],
            hairColor: ['black', 'brown', 'blonde', 'red', 'gray', 'white'][Math.floor(Math.random() * 6)],
            eyeColor: ['brown', 'blue', 'green', 'hazel'][Math.floor(Math.random() * 4)],
            clothing: ['casual', 'formal', 'sport'][Math.floor(Math.random() * 3)],
            accessories: []
        };

        // Añadir accesorios aleatorios
        const allAccessories = ['glasses', 'hat', 'watch', 'necklace'];
        allAccessories.forEach(accessory => {
            if (Math.random() > 0.7) {
                randomConfig.accessories.push(accessory);
            }
        });

        this.avatarGenerator.customize(randomConfig);
        this.updateUI(randomConfig);
    }

    /**
     * Guardar avatar
     */
    saveAvatar() {
        const avatarData = this.avatarGenerator.exportAvatar();
        const avatarName = prompt('Nombre del avatar:', 'Mi Avatar');
        
        if (avatarName) {
            const savedAvatars = JSON.parse(localStorage.getItem('savedAvatars') || '{}');
            savedAvatars[avatarName] = avatarData;
            localStorage.setItem('savedAvatars', JSON.stringify(savedAvatars));
            
            alert(`Avatar "${avatarName}" guardado exitosamente!`);
        }
    }

    /**
     * Exportar avatar
     */
    exportAvatar() {
        const avatarData = this.avatarGenerator.exportAvatar();
        const dataStr = JSON.stringify(avatarData, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        
        const link = document.createElement('a');
        link.href = URL.createObjectURL(dataBlob);
        link.download = 'avatar.json';
        link.click();
    }

    /**
     * Cargar avatar guardado
     */
    loadSavedAvatar(avatarName) {
        const savedAvatars = JSON.parse(localStorage.getItem('savedAvatars') || '{}');
        const avatarData = savedAvatars[avatarName];
        
        if (avatarData) {
            this.avatarGenerator.importAvatar(avatarData);
            this.updateUI(avatarData.config);
            return true;
        }
        return false;
    }

    /**
     * Obtener lista de avatares guardados
     */
    getSavedAvatars() {
        const savedAvatars = JSON.parse(localStorage.getItem('savedAvatars') || '{}');
        return Object.keys(savedAvatars);
    }

    /**
     * Eliminar avatar guardado
     */
    deleteSavedAvatar(avatarName) {
        const savedAvatars = JSON.parse(localStorage.getItem('savedAvatars') || '{}');
        delete savedAvatars[avatarName];
        localStorage.setItem('savedAvatars', JSON.stringify(savedAvatars));
    }

    /**
     * Mostrar/ocultar interfaz
     */
    toggle() {
        this.ui.style.display = this.ui.style.display === 'none' ? 'block' : 'none';
    }

    /**
     * Destruir interfaz
     */
    destroy() {
        if (this.ui && this.ui.parentNode) {
            this.ui.parentNode.removeChild(this.ui);
        }
    }
}

// Exportar para uso modular
export default AvatarCustomization;

// Funciones globales para integración
window.AvatarCustomization = AvatarCustomization;
window.createAvatarCustomization = (avatarGenerator, container) => {
    return new AvatarCustomization(avatarGenerator, container);
}; 
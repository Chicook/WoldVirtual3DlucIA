/**
 * Configuración del Sistema de Avatares - Three.js Metaverso
 * Configuraciones, estilos y paletas de colores
 */

class AvatarConfig {
    constructor() {
        this.styles = this.initializeStyles();
        this.colorPalettes = this.initializeColorPalettes();
        this.geometryPresets = this.initializeGeometryPresets();
        this.materialPresets = this.initializeMaterialPresets();
        this.animationPresets = this.initializeAnimationPresets();
    }
    
    /**
     * Inicializar estilos disponibles
     */
    initializeStyles() {
        return {
            cyberpunk: {
                name: 'Cyberpunk',
                description: 'Estilo futurista con elementos tecnológicos',
                characteristics: {
                    geometry: 'angular',
                    colors: 'neon',
                    effects: ['glow', 'hologram', 'particles'],
                    accessories: ['glasses', 'cybernetics', 'implants'],
                    clothing: ['armor', 'tech_suit', 'leather']
                },
                modifiers: {
                    headShape: 'angular',
                    bodyProportions: 'athletic',
                    textureStyle: 'metallic',
                    animationStyle: 'robotic'
                }
            },
            
            fantasy: {
                name: 'Fantasy',
                description: 'Estilo mágico con elementos fantásticos',
                characteristics: {
                    geometry: 'organic',
                    colors: 'magical',
                    effects: ['magic', 'energy', 'sparkles'],
                    accessories: ['crown', 'magic_staff', 'jewelry'],
                    clothing: ['robe', 'armor', 'dress']
                },
                modifiers: {
                    headShape: 'rounded',
                    bodyProportions: 'graceful',
                    textureStyle: 'ethereal',
                    animationStyle: 'fluid'
                }
            },
            
            realistic: {
                name: 'Realistic',
                description: 'Estilo realista con proporciones humanas',
                characteristics: {
                    geometry: 'human',
                    colors: 'natural',
                    effects: [],
                    accessories: ['glasses', 'watch', 'jewelry'],
                    clothing: ['casual', 'formal', 'sport']
                },
                modifiers: {
                    headShape: 'human',
                    bodyProportions: 'realistic',
                    textureStyle: 'natural',
                    animationStyle: 'human'
                }
            },
            
            abstract: {
                name: 'Abstract',
                description: 'Estilo abstracto con formas geométricas únicas',
                characteristics: {
                    geometry: 'geometric',
                    colors: 'vibrant',
                    effects: ['distortion', 'energy', 'waves'],
                    accessories: [],
                    clothing: ['geometric', 'naked']
                },
                modifiers: {
                    headShape: 'geometric',
                    bodyProportions: 'abstract',
                    textureStyle: 'vibrant',
                    animationStyle: 'unconventional'
                }
            }
        };
    }
    
    /**
     * Inicializar paletas de colores
     */
    initializeColorPalettes() {
        return {
            cyberpunk: {
                primary: ['#e74c3c', '#3498db', '#f39c12', '#9b59b6'],
                secondary: ['#2c3e50', '#34495e', '#7f8c8d', '#95a5a6'],
                accent: ['#00ff00', '#ff00ff', '#00ffff', '#ffff00'],
                skin: ['#d68910', '#8b4513', '#2c3e50', '#34495e'],
                hair: ['#2c3e50', '#8b4513', '#e74c3c', '#9b59b6']
            },
            
            fantasy: {
                primary: ['#8e44ad', '#2980b9', '#27ae60', '#f39c12'],
                secondary: ['#2c3e50', '#34495e', '#7f8c8d', '#95a5a6'],
                accent: ['#e74c3c', '#9b59b6', '#3498db', '#f1c40f'],
                skin: ['#f4d03f', '#d68910', '#8b4513', '#e74c3c'],
                hair: ['#2c3e50', '#8b4513', '#d68910', '#f4d03f']
            },
            
            realistic: {
                primary: ['#34495e', '#7f8c8d', '#95a5a6', '#bdc3c7'],
                secondary: ['#2c3e50', '#34495e', '#7f8c8d', '#95a5a6'],
                accent: ['#3498db', '#e74c3c', '#f39c12', '#27ae60'],
                skin: ['#f4d03f', '#d68910', '#8b4513', '#2c3e50'],
                hair: ['#2c3e50', '#8b4513', '#d68910', '#f4d03f']
            },
            
            abstract: {
                primary: ['#e74c3c', '#3498db', '#f39c12', '#9b59b6'],
                secondary: ['#27ae60', '#8e44ad', '#f1c40f', '#e67e22'],
                accent: ['#00ff00', '#ff00ff', '#00ffff', '#ffff00'],
                skin: ['#e74c3c', '#3498db', '#f39c12', '#9b59b6'],
                hair: ['#27ae60', '#8e44ad', '#f1c40f', '#e67e22']
            }
        };
    }
    
    /**
     * Inicializar presets de geometría
     */
    initializeGeometryPresets() {
        return {
            head: {
                cyberpunk: {
                    baseShape: 'sphere',
                    modifications: ['angular', 'tech_details'],
                    scale: { x: 1.0, y: 1.1, z: 1.0 }
                },
                fantasy: {
                    baseShape: 'sphere',
                    modifications: ['rounded', 'magical_details'],
                    scale: { x: 1.0, y: 1.0, z: 1.0 }
                },
                realistic: {
                    baseShape: 'sphere',
                    modifications: ['human_proportions'],
                    scale: { x: 1.0, y: 1.0, z: 1.0 }
                },
                abstract: {
                    baseShape: 'octahedron',
                    modifications: ['geometric', 'distortion'],
                    scale: { x: 1.2, y: 1.2, z: 1.2 }
                }
            },
            
            body: {
                cyberpunk: {
                    baseShape: 'box',
                    modifications: ['angular', 'tech_details'],
                    scale: { x: 1.2, y: 1.5, z: 0.6 }
                },
                fantasy: {
                    baseShape: 'box',
                    modifications: ['rounded', 'magical_details'],
                    scale: { x: 1.0, y: 1.5, z: 0.5 }
                },
                realistic: {
                    baseShape: 'box',
                    modifications: ['human_proportions'],
                    scale: { x: 1.0, y: 1.5, z: 0.5 }
                },
                abstract: {
                    baseShape: 'icosahedron',
                    modifications: ['geometric', 'distortion'],
                    scale: { x: 1.5, y: 1.8, z: 0.8 }
                }
            },
            
            limbs: {
                cyberpunk: {
                    baseShape: 'cylinder',
                    modifications: ['angular', 'tech_details'],
                    scale: { x: 0.2, y: 1.2, z: 0.2 }
                },
                fantasy: {
                    baseShape: 'cylinder',
                    modifications: ['rounded', 'magical_details'],
                    scale: { x: 0.2, y: 1.2, z: 0.2 }
                },
                realistic: {
                    baseShape: 'cylinder',
                    modifications: ['human_proportions'],
                    scale: { x: 0.2, y: 1.2, z: 0.2 }
                },
                abstract: {
                    baseShape: 'cone',
                    modifications: ['geometric', 'distortion'],
                    scale: { x: 0.3, y: 1.5, z: 0.3 }
                }
            }
        };
    }
    
    /**
     * Inicializar presets de materiales
     */
    initializeMaterialPresets() {
        return {
            cyberpunk: {
                skin: {
                    type: 'MeshStandardMaterial',
                    properties: {
                        roughness: 0.3,
                        metalness: 0.1,
                        emissive: 0x3498db,
                        emissiveIntensity: 0.1
                    }
                },
                clothing: {
                    type: 'MeshStandardMaterial',
                    properties: {
                        roughness: 0.2,
                        metalness: 0.8,
                        emissive: 0xe74c3c,
                        emissiveIntensity: 0.2
                    }
                },
                hair: {
                    type: 'MeshStandardMaterial',
                    properties: {
                        roughness: 0.9,
                        metalness: 0.0,
                        transparent: true,
                        opacity: 0.9
                    }
                }
            },
            
            fantasy: {
                skin: {
                    type: 'MeshStandardMaterial',
                    properties: {
                        roughness: 0.2,
                        metalness: 0.0,
                        emissive: 0x8e44ad,
                        emissiveIntensity: 0.05
                    }
                },
                clothing: {
                    type: 'MeshStandardMaterial',
                    properties: {
                        roughness: 0.1,
                        metalness: 0.0,
                        emissive: 0xf39c12,
                        emissiveIntensity: 0.1
                    }
                },
                hair: {
                    type: 'MeshStandardMaterial',
                    properties: {
                        roughness: 0.8,
                        metalness: 0.0,
                        transparent: true,
                        opacity: 0.8
                    }
                }
            },
            
            realistic: {
                skin: {
                    type: 'MeshStandardMaterial',
                    properties: {
                        roughness: 0.8,
                        metalness: 0.0
                    }
                },
                clothing: {
                    type: 'MeshStandardMaterial',
                    properties: {
                        roughness: 0.7,
                        metalness: 0.0
                    }
                },
                hair: {
                    type: 'MeshStandardMaterial',
                    properties: {
                        roughness: 0.9,
                        metalness: 0.0
                    }
                }
            },
            
            abstract: {
                skin: {
                    type: 'MeshStandardMaterial',
                    properties: {
                        roughness: 0.1,
                        metalness: 0.5,
                        emissive: 0xe74c3c,
                        emissiveIntensity: 0.3
                    }
                },
                clothing: {
                    type: 'MeshStandardMaterial',
                    properties: {
                        roughness: 0.0,
                        metalness: 1.0,
                        emissive: 0x3498db,
                        emissiveIntensity: 0.4
                    }
                },
                hair: {
                    type: 'MeshStandardMaterial',
                    properties: {
                        roughness: 0.0,
                        metalness: 0.8,
                        emissive: 0xf39c12,
                        emissiveIntensity: 0.2
                    }
                }
            }
        };
    }
    
    /**
     * Inicializar presets de animaciones
     */
    initializeAnimationPresets() {
        return {
            cyberpunk: {
                idle: {
                    duration: 4,
                    keyframes: [
                        { time: 0, scale: [1, 1, 1] },
                        { time: 2, scale: [1.02, 1.02, 1.02] },
                        { time: 4, scale: [1, 1, 1] }
                    ]
                },
                walk: {
                    duration: 2,
                    keyframes: [
                        { time: 0, rotation: [0, 0, 0] },
                        { time: 0.5, rotation: [0.3, 0, 0] },
                        { time: 1, rotation: [0, 0, 0] },
                        { time: 1.5, rotation: [-0.3, 0, 0] },
                        { time: 2, rotation: [0, 0, 0] }
                    ]
                }
            },
            
            fantasy: {
                idle: {
                    duration: 6,
                    keyframes: [
                        { time: 0, scale: [1, 1, 1] },
                        { time: 3, scale: [1.01, 1.01, 1.01] },
                        { time: 6, scale: [1, 1, 1] }
                    ]
                },
                walk: {
                    duration: 3,
                    keyframes: [
                        { time: 0, rotation: [0, 0, 0] },
                        { time: 0.75, rotation: [0.2, 0, 0] },
                        { time: 1.5, rotation: [0, 0, 0] },
                        { time: 2.25, rotation: [-0.2, 0, 0] },
                        { time: 3, rotation: [0, 0, 0] }
                    ]
                }
            },
            
            realistic: {
                idle: {
                    duration: 4,
                    keyframes: [
                        { time: 0, scale: [1, 1, 1] },
                        { time: 2, scale: [1.005, 1.005, 1.005] },
                        { time: 4, scale: [1, 1, 1] }
                    ]
                },
                walk: {
                    duration: 1.5,
                    keyframes: [
                        { time: 0, rotation: [0, 0, 0] },
                        { time: 0.375, rotation: [0.25, 0, 0] },
                        { time: 0.75, rotation: [0, 0, 0] },
                        { time: 1.125, rotation: [-0.25, 0, 0] },
                        { time: 1.5, rotation: [0, 0, 0] }
                    ]
                }
            },
            
            abstract: {
                idle: {
                    duration: 5,
                    keyframes: [
                        { time: 0, scale: [1, 1, 1], rotation: [0, 0, 0] },
                        { time: 2.5, scale: [1.1, 1.1, 1.1], rotation: [0, Math.PI, 0] },
                        { time: 5, scale: [1, 1, 1], rotation: [0, Math.PI * 2, 0] }
                    ]
                },
                walk: {
                    duration: 2,
                    keyframes: [
                        { time: 0, rotation: [0, 0, 0], scale: [1, 1, 1] },
                        { time: 0.5, rotation: [0.5, 0, 0], scale: [1.2, 0.8, 1.2] },
                        { time: 1, rotation: [0, 0, 0], scale: [1, 1, 1] },
                        { time: 1.5, rotation: [-0.5, 0, 0], scale: [0.8, 1.2, 0.8] },
                        { time: 2, rotation: [0, 0, 0], scale: [1, 1, 1] }
                    ]
                }
            }
        };
    }
    
    /**
     * Obtener estilo por nombre
     */
    getStyle(styleName) {
        return this.styles[styleName] || this.styles.realistic;
    }
    
    /**
     * Obtener paleta de colores por estilo
     */
    getColorPalette(styleName) {
        return this.colorPalettes[styleName] || this.colorPalettes.realistic;
    }
    
    /**
     * Obtener preset de geometría
     */
    getGeometryPreset(part, styleName) {
        const presets = this.geometryPresets[part];
        return presets ? presets[styleName] || presets.realistic : null;
    }
    
    /**
     * Obtener preset de material
     */
    getMaterialPreset(styleName) {
        return this.materialPresets[styleName] || this.materialPresets.realistic;
    }
    
    /**
     * Obtener preset de animación
     */
    getAnimationPreset(styleName) {
        return this.animationPresets[styleName] || this.animationPresets.realistic;
    }
    
    /**
     * Obtener color aleatorio de paleta
     */
    getRandomColor(palette, category) {
        const colors = palette[category];
        if (colors && colors.length > 0) {
            return colors[Math.floor(Math.random() * colors.length)];
        }
        return '#808080';
    }
    
    /**
     * Obtener color por semilla
     */
    getColorBySeed(palette, category, seed) {
        const colors = palette[category];
        if (colors && colors.length > 0) {
            return colors[seed % colors.length];
        }
        return '#808080';
    }
    
    /**
     * Validar opciones de avatar
     */
    validateOptions(options) {
        const validOptions = { ...options };
        
        // Validar estilo
        if (!this.styles[validOptions.style]) {
            validOptions.style = 'realistic';
        }
        
        // Validar género
        const validGenders = ['male', 'female', 'neutral'];
        if (!validGenders.includes(validOptions.gender)) {
            validOptions.gender = 'neutral';
        }
        
        // Validar altura
        const validHeights = ['short', 'average', 'tall'];
        if (!validHeights.includes(validOptions.height)) {
            validOptions.height = 'average';
        }
        
        // Validar complexión
        const validBuilds = ['slim', 'average', 'athletic', 'heavy'];
        if (!validBuilds.includes(validOptions.build)) {
            validOptions.build = 'average';
        }
        
        // Validar estilo de cabello
        const validHairStyles = ['short', 'long', 'bald', 'spiky'];
        if (!validHairStyles.includes(validOptions.hairStyle)) {
            validOptions.hairStyle = 'short';
        }
        
        // Validar color de ojos
        const validEyeColors = ['blue', 'green', 'brown', 'red'];
        if (!validEyeColors.includes(validOptions.eyeColor)) {
            validOptions.eyeColor = 'blue';
        }
        
        // Validar tono de piel
        const validSkinTones = ['light', 'medium', 'dark', 'exotic'];
        if (!validSkinTones.includes(validOptions.skinTone)) {
            validOptions.skinTone = 'medium';
        }
        
        // Validar ropa
        const validClothing = ['casual', 'formal', 'armor', 'naked'];
        if (!validClothing.includes(validOptions.clothing)) {
            validOptions.clothing = 'casual';
        }
        
        return validOptions;
    }
    
    /**
     * Generar opciones aleatorias
     */
    generateRandomOptions() {
        const styles = Object.keys(this.styles);
        const genders = ['male', 'female', 'neutral'];
        const heights = ['short', 'average', 'tall'];
        const builds = ['slim', 'average', 'athletic', 'heavy'];
        const hairStyles = ['short', 'long', 'bald', 'spiky'];
        const eyeColors = ['blue', 'green', 'brown', 'red'];
        const skinTones = ['light', 'medium', 'dark', 'exotic'];
        const clothing = ['casual', 'formal', 'armor', 'naked'];
        
        return {
            style: styles[Math.floor(Math.random() * styles.length)],
            gender: genders[Math.floor(Math.random() * genders.length)],
            height: heights[Math.floor(Math.random() * heights.length)],
            build: builds[Math.floor(Math.random() * builds.length)],
            hairStyle: hairStyles[Math.floor(Math.random() * hairStyles.length)],
            eyeColor: eyeColors[Math.floor(Math.random() * eyeColors.length)],
            skinTone: skinTones[Math.floor(Math.random() * skinTones.length)],
            clothing: clothing[Math.floor(Math.random() * clothing.length)],
            accessories: [],
            effects: []
        };
    }
}

// Exportar para uso global
window.AvatarConfig = AvatarConfig; 
/**
 * Configuración de Islas Virtuales - Metaverso Crypto World Virtual 3D
 * @author Metaverso Team
 */

class IslandsConfiguration {
    constructor() {
        this.islands = new Map();
        this.audioPresets = new Map();
        this.visualEffects = new Map();
        this.blockchainIntegrations = new Map();
        
        this.initializeIslands();
        this.initializeAudioPresets();
        this.initializeVisualEffects();
        this.initializeBlockchainIntegrations();
    }

    /**
     * Inicializar configuración de islas
     */
    initializeIslands() {
        // Isla del Bosque Mágico
        this.islands.set('forest', {
            id: 'forest',
            name: 'Isla del Bosque Mágico',
            description: 'Un bosque místico lleno de árboles antiguos y partículas mágicas flotantes.',
            position: { x: 0, y: 0, z: 0 },
            size: 200,
            theme: 'nature',
            features: [
                'Árboles mágicos animados',
                'Partículas flotantes',
                'Sonidos de naturaleza',
                'NFTs de criaturas mágicas',
                'Minería de tokens verdes'
            ],
            audio: {
                ambient: 'forest',
                layers: ['wind', 'leaves', 'birds', 'magic_sparkles'],
                volume: 0.7,
                reverb: { roomSize: 0.4, damping: 0.6 }
            },
            visual: {
                fog: { color: 0x87CEEB, near: 100, far: 1000 },
                lighting: { ambient: 0x404040, directional: 0xffffff },
                particles: { count: 100, color: 0x00ff88, size: 2 }
            },
            blockchain: {
                tokens: ['GREEN_TOKEN', 'MAGIC_CRYSTAL'],
                nfts: ['FOREST_CREATURE', 'MAGIC_TREE'],
                staking: { enabled: true, reward: 'GREEN_TOKEN' }
            },
            economy: {
                currency: 'GREEN_TOKEN',
                tradingPairs: ['GREEN_TOKEN/ETH', 'GREEN_TOKEN/USDT'],
                marketplace: true,
                crafting: ['magic_potion', 'enchanted_weapon']
            }
        });

        // Isla del Océano Profundo
        this.islands.set('ocean', {
            id: 'ocean',
            name: 'Isla del Océano Profundo',
            description: 'Un vasto océano con islas pequeñas y olas que se mueven suavemente.',
            position: { x: 400, y: 0, z: 0 },
            size: 300,
            theme: 'water',
            features: [
                'Olas animadas',
                'Islas pequeñas',
                'Sonidos de agua',
                'NFTs de criaturas marinas',
                'Pesca de tokens acuáticos'
            ],
            audio: {
                ambient: 'ocean',
                layers: ['waves', 'underwater', 'seagulls'],
                volume: 0.8,
                reverb: { roomSize: 0.6, damping: 0.3 }
            },
            visual: {
                fog: { color: 0x006994, near: 150, far: 800 },
                lighting: { ambient: 0x303040, directional: 0x87CEEB },
                particles: { count: 50, color: 0x0099cc, size: 3 }
            },
            blockchain: {
                tokens: ['BLUE_TOKEN', 'PEARL_CRYSTAL'],
                nfts: ['SEA_CREATURE', 'TREASURE_CHEST'],
                staking: { enabled: true, reward: 'BLUE_TOKEN' }
            },
            economy: {
                currency: 'BLUE_TOKEN',
                tradingPairs: ['BLUE_TOKEN/ETH', 'BLUE_TOKEN/USDT'],
                marketplace: true,
                crafting: ['water_potion', 'ocean_weapon']
            }
        });

        // Isla de las Montañas Nevadas
        this.islands.set('mountain', {
            id: 'mountain',
            name: 'Isla de las Montañas Nevadas',
            description: 'Picos nevados que se elevan hacia el cielo con copos de nieve que caen.',
            position: { x: -400, y: 0, z: 200 },
            size: 250,
            theme: 'ice',
            features: [
                'Picos nevados',
                'Copos de nieve',
                'Sonidos de viento',
                'NFTs de criaturas de hielo',
                'Minería de cristales de hielo'
            ],
            audio: {
                ambient: 'mountain',
                layers: ['wind', 'ice_cracking'],
                volume: 0.6,
                reverb: { roomSize: 0.8, damping: 0.2 }
            },
            visual: {
                fog: { color: 0xffffff, near: 200, far: 1200 },
                lighting: { ambient: 0x505050, directional: 0xffffff },
                particles: { count: 200, color: 0xffffff, size: 1 }
            },
            blockchain: {
                tokens: ['WHITE_TOKEN', 'ICE_CRYSTAL'],
                nfts: ['ICE_CREATURE', 'FROZEN_ARTIFACT'],
                staking: { enabled: true, reward: 'WHITE_TOKEN' }
            },
            economy: {
                currency: 'WHITE_TOKEN',
                tradingPairs: ['WHITE_TOKEN/ETH', 'WHITE_TOKEN/USDT'],
                marketplace: true,
                crafting: ['ice_potion', 'frost_weapon']
            }
        });

        // Isla del Desierto Místico
        this.islands.set('desert', {
            id: 'desert',
            name: 'Isla del Desierto Místico',
            description: 'Un desierto dorado con dunas de arena y un oasis en el centro.',
            position: { x: 0, y: 0, z: 400 },
            size: 350,
            theme: 'sand',
            features: [
                'Dunas de arena',
                'Oasis',
                'Palmeras',
                'NFTs de criaturas del desierto',
                'Búsqueda de tesoros enterrados'
            ],
            audio: {
                ambient: 'desert',
                layers: ['wind', 'sand_storm'],
                volume: 0.5,
                reverb: { roomSize: 0.7, damping: 0.4 }
            },
            visual: {
                fog: { color: 0xf4a460, near: 180, far: 900 },
                lighting: { ambient: 0x604020, directional: 0xffaa00 },
                particles: { count: 80, color: 0xdaa520, size: 2 }
            },
            blockchain: {
                tokens: ['GOLD_TOKEN', 'SAND_CRYSTAL'],
                nfts: ['DESERT_CREATURE', 'ANCIENT_RELIC'],
                staking: { enabled: true, reward: 'GOLD_TOKEN' }
            },
            economy: {
                currency: 'GOLD_TOKEN',
                tradingPairs: ['GOLD_TOKEN/ETH', 'GOLD_TOKEN/USDT'],
                marketplace: true,
                crafting: ['desert_potion', 'sand_weapon']
            }
        });

        // Isla de la Ciudad Futurista
        this.islands.set('city', {
            id: 'city',
            name: 'Isla de la Ciudad Futurista',
            description: 'Una metrópolis futurista con rascacielos iluminados y tecnología avanzada.',
            position: { x: 400, y: 0, z: -400 },
            size: 400,
            theme: 'technology',
            features: [
                'Rascacielos',
                'Luces de ciudad',
                'Tecnología futurista',
                'NFTs de vehículos voladores',
                'Trading de tokens tecnológicos'
            ],
            audio: {
                ambient: 'city',
                layers: ['city_ambience', 'hover_cars'],
                volume: 0.9,
                reverb: { roomSize: 0.3, damping: 0.7 }
            },
            visual: {
                fog: { color: 0x333333, near: 200, far: 1000 },
                lighting: { ambient: 0x202020, directional: 0xffff00 },
                particles: { count: 100, color: 0xffff00, size: 1 }
            },
            blockchain: {
                tokens: ['TECH_TOKEN', 'CYBER_CRYSTAL'],
                nfts: ['FLYING_VEHICLE', 'ROBOT_COMPANION'],
                staking: { enabled: true, reward: 'TECH_TOKEN' }
            },
            economy: {
                currency: 'TECH_TOKEN',
                tradingPairs: ['TECH_TOKEN/ETH', 'TECH_TOKEN/USDT'],
                marketplace: true,
                crafting: ['tech_potion', 'cyber_weapon']
            }
        });

        // Isla del Volcán Activo
        this.islands.set('volcano', {
            id: 'volcano',
            name: 'Isla del Volcán Activo',
            description: 'Un volcán en erupción con lava fluyendo y rocas volcánicas.',
            position: { x: -400, y: 0, z: -200 },
            size: 180,
            theme: 'fire',
            features: [
                'Lava fluyendo',
                'Rocas volcánicas',
                'Sonidos de erupción',
                'NFTs de criaturas de fuego',
                'Minería de cristales volcánicos'
            ],
            audio: {
                ambient: 'volcano',
                layers: ['lava', 'eruption', 'fire'],
                volume: 0.8,
                reverb: { roomSize: 0.5, damping: 0.5 }
            },
            visual: {
                fog: { color: 0xff4400, near: 100, far: 600 },
                lighting: { ambient: 0x402000, directional: 0xff6600 },
                particles: { count: 150, color: 0xff4400, size: 3 }
            },
            blockchain: {
                tokens: ['FIRE_TOKEN', 'LAVA_CRYSTAL'],
                nfts: ['FIRE_CREATURE', 'VOLCANIC_ARTIFACT'],
                staking: { enabled: true, reward: 'FIRE_TOKEN' }
            },
            economy: {
                currency: 'FIRE_TOKEN',
                tradingPairs: ['FIRE_TOKEN/ETH', 'FIRE_TOKEN/USDT'],
                marketplace: true,
                crafting: ['fire_potion', 'volcanic_weapon']
            }
        });

        // Isla del Espacio Exterior
        this.islands.set('space', {
            id: 'space',
            name: 'Isla del Espacio Exterior',
            description: 'Una estación espacial flotando en el vacío del espacio con estrellas brillantes.',
            position: { x: 0, y: 200, z: 0 },
            size: 500,
            theme: 'cosmic',
            features: [
                'Estación espacial',
                'Estrellas brillantes',
                'Sonidos del espacio',
                'NFTs de naves espaciales',
                'Exploración de asteroides'
            ],
            audio: {
                ambient: 'space',
                layers: ['cosmic_wind', 'star_field'],
                volume: 0.4,
                reverb: { roomSize: 1.0, damping: 0.1 }
            },
            visual: {
                fog: { color: 0x000011, near: 500, far: 2000 },
                lighting: { ambient: 0x001122, directional: 0xffffff },
                particles: { count: 1000, color: 0xffffff, size: 1 }
            },
            blockchain: {
                tokens: ['COSMIC_TOKEN', 'STAR_CRYSTAL'],
                nfts: ['SPACESHIP', 'ALIEN_ARTIFACT'],
                staking: { enabled: true, reward: 'COSMIC_TOKEN' }
            },
            economy: {
                currency: 'COSMIC_TOKEN',
                tradingPairs: ['COSMIC_TOKEN/ETH', 'COSMIC_TOKEN/USDT'],
                marketplace: true,
                crafting: ['cosmic_potion', 'stellar_weapon']
            }
        });
    }

    /**
     * Inicializar presets de audio
     */
    initializeAudioPresets() {
        this.audioPresets.set('forest', {
            baseFrequency: 180,
            modulationDepth: 0.4,
            reverbTime: 3.0,
            noiseLevel: 0.15,
            harmonicContent: 0.6,
            windIntensity: 0.3,
            waterFlow: 0.1,
            layers: [
                { type: 'wind', volume: 0.6, pitch: 1.0 },
                { type: 'leaves', volume: 0.4, pitch: 1.0 },
                { type: 'birds', volume: 0.3, pitch: 1.0 }
            ]
        });

        this.audioPresets.set('ocean', {
            baseFrequency: 60,
            modulationDepth: 0.6,
            reverbTime: 4.0,
            noiseLevel: 0.25,
            harmonicContent: 0.3,
            windIntensity: 0.5,
            waterFlow: 0.8,
            layers: [
                { type: 'waves', volume: 0.8, pitch: 0.9 },
                { type: 'underwater', volume: 0.5, pitch: 0.7 },
                { type: 'seagulls', volume: 0.2, pitch: 1.1 }
            ]
        });

        this.audioPresets.set('mountain', {
            baseFrequency: 120,
            modulationDepth: 0.2,
            reverbTime: 5.0,
            noiseLevel: 0.1,
            harmonicContent: 0.7,
            windIntensity: 0.7,
            waterFlow: 0.05,
            layers: [
                { type: 'wind', volume: 0.7, pitch: 1.2 },
                { type: 'ice_cracking', volume: 0.3, pitch: 0.8 }
            ]
        });

        this.audioPresets.set('desert', {
            baseFrequency: 90,
            modulationDepth: 0.8,
            reverbTime: 2.5,
            noiseLevel: 0.2,
            harmonicContent: 0.4,
            windIntensity: 0.6,
            waterFlow: 0.0,
            layers: [
                { type: 'wind', volume: 0.5, pitch: 1.1 },
                { type: 'sand_storm', volume: 0.4, pitch: 0.9 }
            ]
        });

        this.audioPresets.set('city', {
            baseFrequency: 440,
            modulationDepth: 0.3,
            reverbTime: 1.5,
            noiseLevel: 0.3,
            harmonicContent: 0.8,
            windIntensity: 0.2,
            waterFlow: 0.0,
            layers: [
                { type: 'city_ambience', volume: 0.8, pitch: 1.0 },
                { type: 'hover_cars', volume: 0.6, pitch: 1.1 }
            ]
        });
    }

    /**
     * Inicializar efectos visuales
     */
    initializeVisualEffects() {
        this.visualEffects.set('particles', {
            forest: {
                count: 100,
                color: 0x00ff88,
                size: 2,
                speed: 0.5,
                opacity: 0.6,
                animation: 'float'
            },
            ocean: {
                count: 50,
                color: 0x0099cc,
                size: 3,
                speed: 0.3,
                opacity: 0.7,
                animation: 'wave'
            },
            mountain: {
                count: 200,
                color: 0xffffff,
                size: 1,
                speed: 0.8,
                opacity: 0.8,
                animation: 'fall'
            },
            desert: {
                count: 80,
                color: 0xdaa520,
                size: 2,
                speed: 0.4,
                opacity: 0.5,
                animation: 'drift'
            },
            city: {
                count: 100,
                color: 0xffff00,
                size: 1,
                speed: 0.6,
                opacity: 0.9,
                animation: 'pulse'
            }
        });

        this.visualEffects.set('lighting', {
            forest: {
                ambient: 0x404040,
                directional: 0xffffff,
                intensity: 1.0,
                shadow: true
            },
            ocean: {
                ambient: 0x303040,
                directional: 0x87CEEB,
                intensity: 0.8,
                shadow: true
            },
            mountain: {
                ambient: 0x505050,
                directional: 0xffffff,
                intensity: 1.2,
                shadow: true
            },
            desert: {
                ambient: 0x604020,
                directional: 0xffaa00,
                intensity: 1.5,
                shadow: true
            },
            city: {
                ambient: 0x202020,
                directional: 0xffff00,
                intensity: 0.9,
                shadow: true
            }
        });

        this.visualEffects.set('fog', {
            forest: { color: 0x87CEEB, near: 100, far: 1000 },
            ocean: { color: 0x006994, near: 150, far: 800 },
            mountain: { color: 0xffffff, near: 200, far: 1200 },
            desert: { color: 0xf4a460, near: 180, far: 900 },
            city: { color: 0x333333, near: 200, far: 1000 }
        });
    }

    /**
     * Inicializar integraciones blockchain
     */
    initializeBlockchainIntegrations() {
        this.blockchainIntegrations.set('tokens', {
            GREEN_TOKEN: {
                name: 'Green Token',
                symbol: 'GREEN',
                decimals: 18,
                totalSupply: '1000000000000000000000000',
                island: 'forest',
                utility: 'Environmental rewards and forest activities'
            },
            BLUE_TOKEN: {
                name: 'Blue Token',
                symbol: 'BLUE',
                decimals: 18,
                totalSupply: '1000000000000000000000000',
                island: 'ocean',
                utility: 'Ocean exploration and marine activities'
            },
            WHITE_TOKEN: {
                name: 'White Token',
                symbol: 'WHITE',
                decimals: 18,
                totalSupply: '1000000000000000000000000',
                island: 'mountain',
                utility: 'Mountain climbing and ice activities'
            },
            GOLD_TOKEN: {
                name: 'Gold Token',
                symbol: 'GOLD',
                decimals: 18,
                totalSupply: '1000000000000000000000000',
                island: 'desert',
                utility: 'Desert exploration and treasure hunting'
            },
            TECH_TOKEN: {
                name: 'Tech Token',
                symbol: 'TECH',
                decimals: 18,
                totalSupply: '1000000000000000000000000',
                island: 'city',
                utility: 'Technology development and urban activities'
            },
            FIRE_TOKEN: {
                name: 'Fire Token',
                symbol: 'FIRE',
                decimals: 18,
                totalSupply: '1000000000000000000000000',
                island: 'volcano',
                utility: 'Volcanic activities and fire magic'
            },
            COSMIC_TOKEN: {
                name: 'Cosmic Token',
                symbol: 'COSMIC',
                decimals: 18,
                totalSupply: '1000000000000000000000000',
                island: 'space',
                utility: 'Space exploration and cosmic activities'
            }
        });

        this.blockchainIntegrations.set('nfts', {
            FOREST_CREATURE: {
                name: 'Forest Creature',
                description: 'Magical creatures that inhabit the forest',
                island: 'forest',
                rarity: 'common',
                attributes: ['magic', 'nature', 'healing']
            },
            SEA_CREATURE: {
                name: 'Sea Creature',
                description: 'Mysterious creatures of the deep ocean',
                island: 'ocean',
                rarity: 'rare',
                attributes: ['water', 'swimming', 'treasure']
            },
            ICE_CREATURE: {
                name: 'Ice Creature',
                description: 'Frozen beings from the mountain peaks',
                island: 'mountain',
                rarity: 'epic',
                attributes: ['ice', 'strength', 'endurance']
            },
            DESERT_CREATURE: {
                name: 'Desert Creature',
                description: 'Ancient beings of the mystical desert',
                island: 'desert',
                rarity: 'legendary',
                attributes: ['sand', 'wisdom', 'mystery']
            },
            FLYING_VEHICLE: {
                name: 'Flying Vehicle',
                description: 'Advanced transportation of the future city',
                island: 'city',
                rarity: 'rare',
                attributes: ['technology', 'speed', 'transport']
            },
            FIRE_CREATURE: {
                name: 'Fire Creature',
                description: 'Beings born from the volcanic flames',
                island: 'volcano',
                rarity: 'epic',
                attributes: ['fire', 'power', 'destruction']
            },
            SPACESHIP: {
                name: 'Spaceship',
                description: 'Interstellar vessels for cosmic exploration',
                island: 'space',
                rarity: 'legendary',
                attributes: ['cosmic', 'exploration', 'travel']
            }
        });

        this.blockchainIntegrations.set('smart_contracts', {
            staking: {
                name: 'Island Staking',
                description: 'Stake tokens to earn rewards from island activities',
                functions: ['stake', 'unstake', 'claim_rewards', 'get_staked_amount']
            },
            marketplace: {
                name: 'NFT Marketplace',
                description: 'Trade NFTs and tokens between players',
                functions: ['list_item', 'buy_item', 'cancel_listing', 'get_listings']
            },
            crafting: {
                name: 'Crafting System',
                description: 'Create items using resources and tokens',
                functions: ['craft_item', 'get_recipe', 'get_materials', 'craft_batch']
            },
            governance: {
                name: 'DAO Governance',
                description: 'Vote on island developments and changes',
                functions: ['create_proposal', 'vote', 'execute_proposal', 'get_proposals']
            }
        });
    }

    /**
     * Obtener configuración de isla
     */
    getIslandConfig(islandId) {
        return this.islands.get(islandId);
    }

    /**
     * Obtener preset de audio
     */
    getAudioPreset(islandId) {
        return this.audioPresets.get(islandId);
    }

    /**
     * Obtener efectos visuales
     */
    getVisualEffects(islandId) {
        return {
            particles: this.visualEffects.get('particles')[islandId],
            lighting: this.visualEffects.get('lighting')[islandId],
            fog: this.visualEffects.get('fog')[islandId]
        };
    }

    /**
     * Obtener integración blockchain
     */
    getBlockchainIntegration(type, id) {
        return this.blockchainIntegrations.get(type)[id];
    }

    /**
     * Obtener todas las islas
     */
    getAllIslands() {
        return Array.from(this.islands.values());
    }

    /**
     * Obtener islas por tema
     */
    getIslandsByTheme(theme) {
        return Array.from(this.islands.values()).filter(island => island.theme === theme);
    }

    /**
     * Obtener islas cercanas
     */
    getNearbyIslands(position, radius) {
        return Array.from(this.islands.values()).filter(island => {
            const distance = Math.sqrt(
                Math.pow(island.position.x - position.x, 2) +
                Math.pow(island.position.y - position.y, 2) +
                Math.pow(island.position.z - position.z, 2)
            );
            return distance <= radius;
        });
    }

    /**
     * Validar configuración de isla
     */
    validateIslandConfig(islandId) {
        const island = this.islands.get(islandId);
        if (!island) return false;

        const required = ['id', 'name', 'position', 'size', 'theme'];
        return required.every(field => island.hasOwnProperty(field));
    }

    /**
     * Exportar configuración
     */
    exportConfig() {
        return {
            islands: Object.fromEntries(this.islands),
            audioPresets: Object.fromEntries(this.audioPresets),
            visualEffects: Object.fromEntries(this.visualEffects),
            blockchainIntegrations: Object.fromEntries(this.blockchainIntegrations),
            version: '1.0.0',
            timestamp: new Date().toISOString()
        };
    }

    /**
     * Importar configuración
     */
    importConfig(config) {
        if (config.islands) {
            this.islands = new Map(Object.entries(config.islands));
        }
        if (config.audioPresets) {
            this.audioPresets = new Map(Object.entries(config.audioPresets));
        }
        if (config.visualEffects) {
            this.visualEffects = new Map(Object.entries(config.visualEffects));
        }
        if (config.blockchainIntegrations) {
            this.blockchainIntegrations = new Map(Object.entries(config.blockchainIntegrations));
        }
    }
}

// Inicializar configuración global
window.islandsConfig = new IslandsConfiguration();

// Funciones globales
window.getIslandConfig = (islandId) => window.islandsConfig.getIslandConfig(islandId);
window.getAudioPreset = (islandId) => window.islandsConfig.getAudioPreset(islandId);
window.getVisualEffects = (islandId) => window.islandsConfig.getVisualEffects(islandId);
window.getAllIslands = () => window.islandsConfig.getAllIslands();
window.exportIslandsConfig = () => window.islandsConfig.exportConfig();

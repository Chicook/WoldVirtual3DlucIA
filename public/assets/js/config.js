/**
 * Metaverso Configuration
 * @author Metaverso Crypto World Virtual 3D
 * @version 1.0.0
 */

// ============ NETWORK CONFIGURATION ============

const NETWORK_CONFIG = {
    // Ethereum Mainnet
    ethereum: {
        chainId: 1,
        name: 'Ethereum Mainnet',
        rpcUrl: 'https://mainnet.infura.io/v3/YOUR_PROJECT_ID',
        explorer: 'https://etherscan.io',
        contracts: {
            core: '0x...',
            token: '0x...',
            nft: '0x...',
            defi: '0x...',
            governance: '0x...'
        }
    },
    
    // Polygon
    polygon: {
        chainId: 137,
        name: 'Polygon',
        rpcUrl: 'https://polygon-rpc.com',
        explorer: 'https://polygonscan.com',
        contracts: {
            core: '0x...',
            token: '0x...',
            nft: '0x...',
            defi: '0x...',
            governance: '0x...'
        }
    },
    
    // BSC
    bsc: {
        chainId: 56,
        name: 'Binance Smart Chain',
        rpcUrl: 'https://bsc-dataseed.binance.org',
        explorer: 'https://bscscan.com',
        contracts: {
            core: '0x...',
            token: '0x...',
            nft: '0x...',
            defi: '0x...',
            governance: '0x...'
        }
    },
    
    // Arbitrum
    arbitrum: {
        chainId: 42161,
        name: 'Arbitrum One',
        rpcUrl: 'https://arb1.arbitrum.io/rpc',
        explorer: 'https://arbiscan.io',
        contracts: {
            core: '0x...',
            token: '0x...',
            nft: '0x...',
            defi: '0x...',
            governance: '0x...'
        }
    },
    
    // Optimism
    optimism: {
        chainId: 10,
        name: 'Optimism',
        rpcUrl: 'https://mainnet.optimism.io',
        explorer: 'https://optimistic.etherscan.io',
        contracts: {
            core: '0x...',
            token: '0x...',
            nft: '0x...',
            defi: '0x...',
            governance: '0x...'
        }
    },
    
    // Base
    base: {
        chainId: 8453,
        name: 'Base',
        rpcUrl: 'https://mainnet.base.org',
        explorer: 'https://basescan.org',
        contracts: {
            core: '0x...',
            token: '0x...',
            nft: '0x...',
            defi: '0x...',
            governance: '0x...'
        }
    }
};

// ============ CONTRACT ABIs ============

const CORE_ABI = [
    // User management
    {
        "inputs": [{"name": "user", "type": "address"}],
        "name": "getUser",
        "outputs": [
            {"name": "username", "type": "string"},
            {"name": "level", "type": "uint256"},
            {"name": "experience", "type": "uint256"},
            {"name": "totalIslandsVisited", "type": "uint256"},
            {"name": "reputation", "type": "uint256"}
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "getStats",
        "outputs": [
            {"name": "totalUsers", "type": "uint256"},
            {"name": "totalIslands", "type": "uint256"},
            {"name": "totalAvatars", "type": "uint256"}
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "getActiveIslands",
        "outputs": [{"name": "", "type": "uint256[]"}],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [{"name": "islandId", "type": "uint256"}],
        "name": "getIsland",
        "outputs": [
            {"name": "name", "type": "string"},
            {"name": "description", "type": "string"},
            {"name": "currentUsers", "type": "uint256"},
            {"name": "maxCapacity", "type": "uint256"},
            {"name": "visitCount", "type": "uint256"},
            {"name": "averageRating", "type": "uint256"},
            {"name": "islandType", "type": "string"}
        ],
        "stateMutability": "view",
        "type": "function"
    }
];

const TOKEN_ABI = [
    {
        "inputs": [{"name": "account", "type": "address"}],
        "name": "balanceOf",
        "outputs": [{"name": "", "type": "uint256"}],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {"name": "to", "type": "address"},
            {"name": "amount", "type": "uint256"}
        ],
        "name": "transfer",
        "outputs": [{"name": "", "type": "bool"}],
        "stateMutability": "nonpayable",
        "type": "function"
    }
];

const NFT_ABI = [
    {
        "inputs": [],
        "name": "getAllCollections",
        "outputs": [{"name": "", "type": "uint256[]"}],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [{"name": "collectionId", "type": "uint256"}],
        "name": "getCollection",
        "outputs": [
            {"name": "name", "type": "string"},
            {"name": "description", "type": "string"},
            {"name": "totalSupply", "type": "uint256"}
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [{"name": "collectionId", "type": "uint256"}],
        "name": "getCollectionNFTs",
        "outputs": [{"name": "", "type": "uint256[]"}],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [{"name": "tokenId", "type": "uint256"}],
        "name": "getNFTMetadata",
        "outputs": [
            {"name": "name", "type": "string"},
            {"name": "description", "type": "string"},
            {"name": "image", "type": "string"},
            {"name": "rarity", "type": "uint256"},
            {"name": "level", "type": "uint256"}
        ],
        "stateMutability": "view",
        "type": "function"
    }
];

const DEFI_ABI = [
    {
        "inputs": [],
        "name": "getStakingPools",
        "outputs": [{"name": "", "type": "uint256[]"}],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [{"name": "poolId", "type": "uint256"}],
        "name": "getPoolInfo",
        "outputs": [
            {"name": "name", "type": "string"},
            {"name": "totalStaked", "type": "uint256"},
            {"name": "apy", "type": "uint256"},
            {"name": "rewards", "type": "uint256"}
        ],
        "stateMutability": "view",
        "type": "function"
    }
];

const GOVERNANCE_ABI = [
    {
        "inputs": [],
        "name": "getActiveProposals",
        "outputs": [{"name": "", "type": "uint256[]"}],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [{"name": "proposalId", "type": "uint256"}],
        "name": "getProposal",
        "outputs": [
            {"name": "title", "type": "string"},
            {"name": "description", "type": "string"},
            {"name": "forVotes", "type": "uint256"},
            {"name": "againstVotes", "type": "uint256"},
            {"name": "endTime", "type": "uint256"}
        ],
        "stateMutability": "view",
        "type": "function"
    }
];

// ============ UI CONFIGURATION ============

const UI_CONFIG = {
    // Theme colors
    colors: {
        primary: '#00d4ff',
        secondary: '#ff6b35',
        accent: '#ffd700',
        success: '#00ff88',
        warning: '#ffaa00',
        error: '#ff4444',
        background: '#0a0a0a',
        surface: '#1a1a1a',
        text: '#ffffff',
        textSecondary: '#cccccc'
    },
    
    // Typography
    typography: {
        fontFamily: {
            primary: 'Orbitron, monospace',
            secondary: 'Rajdhani, sans-serif',
            body: 'Exo 2, sans-serif'
        },
        fontSize: {
            xs: '0.75rem',
            sm: '0.875rem',
            base: '1rem',
            lg: '1.125rem',
            xl: '1.25rem',
            '2xl': '1.5rem',
            '3xl': '1.875rem',
            '4xl': '2.25rem',
            '5xl': '3rem',
            '6xl': '3.75rem'
        }
    },
    
    // Spacing
    spacing: {
        xs: '0.25rem',
        sm: '0.5rem',
        md: '1rem',
        lg: '1.5rem',
        xl: '2rem',
        '2xl': '3rem',
        '3xl': '4rem'
    },
    
    // Breakpoints
    breakpoints: {
        sm: '640px',
        md: '768px',
        lg: '1024px',
        xl: '1280px',
        '2xl': '1536px'
    },
    
    // Animations
    animations: {
        duration: {
            fast: '0.15s',
            normal: '0.3s',
            slow: '0.5s'
        },
        easing: {
            ease: 'ease-in-out',
            linear: 'linear',
            easeIn: 'ease-in',
            easeOut: 'ease-out'
        }
    }
};

// ============ THREE.JS CONFIGURATION ============

const THREE_CONFIG = {
    // Scene settings
    scene: {
        background: 0x0a0a0a,
        fog: {
            color: 0x0a0a0a,
            near: 50,
            far: 200
        }
    },
    
    // Camera settings
    camera: {
        fov: 75,
        near: 0.1,
        far: 1000,
        position: { x: 0, y: 10, z: 20 },
        target: { x: 0, y: 0, z: 0 }
    },
    
    // Renderer settings
    renderer: {
        antialias: true,
        alpha: true,
        shadowMap: true,
        pixelRatio: window.devicePixelRatio
    },
    
    // Controls settings
    controls: {
        enableDamping: true,
        dampingFactor: 0.05,
        screenSpacePanning: false,
        minDistance: 5,
        maxDistance: 100,
        maxPolarAngle: Math.PI / 2
    },
    
    // Lighting settings
    lighting: {
        ambient: {
            color: 0x404040,
            intensity: 0.3
        },
        directional: {
            color: 0xffffff,
            intensity: 1,
            position: { x: 50, y: 50, z: 50 },
            castShadow: true
        }
    }
};

// ============ AUDIO CONFIGURATION ============

const AUDIO_CONFIG = {
    // Volume settings
    volume: {
        master: 0.5,
        music: 0.3,
        sfx: 0.7
    },
    
    // Audio features
    features: {
        spatialAudio: true,
        reverb: true,
        compression: true
    },
    
    // Audio files
    files: {
        ambient: {
            forest: 'assets/audio/ambient/forest.mp3',
            ocean: 'assets/audio/ambient/ocean.mp3',
            mountain: 'assets/audio/ambient/mountain.mp3',
            desert: 'assets/audio/ambient/desert.mp3',
            city: 'assets/audio/ambient/city.mp3'
        },
        music: {
            main: 'assets/audio/music/main_theme.mp3',
            menu: 'assets/audio/music/menu.mp3',
            battle: 'assets/audio/music/battle.mp3'
        },
        sfx: {
            click: 'assets/audio/sfx/click.mp3',
            notification: 'assets/audio/sfx/notification.mp3',
            success: 'assets/audio/sfx/success.mp3',
            error: 'assets/audio/sfx/error.mp3'
        }
    }
};

// ============ ISLAND CONFIGURATION ============

const ISLAND_CONFIG = {
    // Island types
    types: {
        forest: {
            name: 'Bosque Místico',
            description: 'Un bosque encantado lleno de magia y misterio',
            capacity: 50,
            audio: 'ambient_forest',
            particles: 'leaves',
            color: '#228B22'
        },
        ocean: {
            name: 'Océano Profundo',
            description: 'Las profundidades del océano con criaturas marinas',
            capacity: 40,
            audio: 'ambient_ocean',
            particles: 'bubbles',
            color: '#006994'
        },
        mountain: {
            name: 'Cumbres Nevadas',
            description: 'Montañas imponentes con vistas espectaculares',
            capacity: 30,
            audio: 'ambient_mountain',
            particles: 'snow',
            color: '#FFFFFF'
        },
        desert: {
            name: 'Desierto Ardiente',
            description: 'Un desierto vasto con dunas interminables',
            capacity: 35,
            audio: 'ambient_desert',
            particles: 'sand',
            color: '#F4A460'
        },
        city: {
            name: 'Ciudad Futurista',
            description: 'Una metrópolis tecnológica del futuro',
            capacity: 60,
            audio: 'ambient_city',
            particles: 'lights',
            color: '#87CEEB'
        },
        volcano: {
            name: 'Volcán Activo',
            description: 'Un volcán en erupción con lava ardiente',
            capacity: 25,
            audio: 'ambient_volcano',
            particles: 'fire',
            color: '#FF4500'
        },
        valley: {
            name: 'Valle Verde',
            description: 'Un valle fértil con ríos cristalinos',
            capacity: 45,
            audio: 'ambient_valley',
            particles: 'flowers',
            color: '#32CD32'
        }
    },
    
    // Island generation
    generation: {
        minDistance: 30,
        maxDistance: 100,
        heightVariation: 5,
        sizeVariation: 0.3
    }
};

// ============ AVATAR CONFIGURATION ============

const AVATAR_CONFIG = {
    // Avatar types
    types: {
        human: {
            name: 'Humano',
            description: 'Avatar humano personalizable',
            baseStats: {
                health: 100,
                stamina: 100,
                speed: 1.0
            }
        },
        robot: {
            name: 'Robot',
            description: 'Avatar robótico futurista',
            baseStats: {
                health: 120,
                stamina: 80,
                speed: 1.2
            }
        },
        animal: {
            name: 'Animal',
            description: 'Avatar de animal mágico',
            baseStats: {
                health: 80,
                stamina: 120,
                speed: 1.5
            }
        }
    },
    
    // Customization options
    customization: {
        body: {
            height: { min: 0.8, max: 1.2, default: 1.0 },
            weight: { min: 0.7, max: 1.3, default: 1.0 },
            skinTone: ['#FFDBB4', '#EDB98A', '#D08B5B', '#AE5D29', '#8D4A43', '#5C3836']
        },
        hair: {
            styles: ['short', 'long', 'curly', 'straight', 'wavy', 'bald'],
            colors: ['#090806', '#2c222b', '#71635a', '#c8b5a0', '#dcd0ba', '#f4e4bc']
        },
        eyes: {
            colors: ['#4a4a4a', '#8b4513', '#228b22', '#4169e1', '#ff69b4', '#ffd700']
        },
        clothing: {
            tops: ['t-shirt', 'shirt', 'jacket', 'hoodie', 'suit'],
            bottoms: ['jeans', 'shorts', 'pants', 'skirt'],
            shoes: ['sneakers', 'boots', 'sandals', 'formal']
        }
    }
};

// ============ GAME CONFIGURATION ============

const GAME_CONFIG = {
    // Player settings
    player: {
        moveSpeed: 5,
        jumpHeight: 2,
        gravity: 9.8,
        maxHealth: 100,
        maxStamina: 100
    },
    
    // Physics settings
    physics: {
        gravity: -9.8,
        airResistance: 0.98,
        friction: 0.8,
        bounce: 0.5
    },
    
    // Interaction settings
    interaction: {
        range: 3,
        cooldown: 0.5,
        autoCollect: true
    },
    
    // Economy settings
    economy: {
        startingTokens: 100,
        tokenSymbol: 'META',
        decimals: 18,
        inflationRate: 0.02
    }
};

// ============ API CONFIGURATION ============

const API_CONFIG = {
    // Base URLs
    baseURL: 'https://api.metaversocrypto.com',
    wsURL: 'wss://api.metaversocrypto.com/ws',
    
    // Endpoints
    endpoints: {
        auth: '/auth',
        user: '/user',
        islands: '/islands',
        nfts: '/nfts',
        marketplace: '/marketplace',
        defi: '/defi',
        governance: '/governance'
    },
    
    // Request settings
    request: {
        timeout: 10000,
        retries: 3,
        retryDelay: 1000
    }
};

// ============ SECURITY CONFIGURATION ============

const SECURITY_CONFIG = {
    // Authentication
    auth: {
        sessionTimeout: 24 * 60 * 60 * 1000, // 24 hours
        refreshTokenExpiry: 7 * 24 * 60 * 60 * 1000, // 7 days
        maxLoginAttempts: 5,
        lockoutDuration: 15 * 60 * 1000 // 15 minutes
    },
    
    // Content Security Policy
    csp: {
        'default-src': ["'self'"],
        'script-src': ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
        'style-src': ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
        'font-src': ["'self'", "https://fonts.gstatic.com"],
        'img-src': ["'self'", "data:", "https:"],
        'connect-src': ["'self'", "https:", "wss:"],
        'frame-src': ["'none'"],
        'object-src': ["'none'"]
    },
    
    // Rate limiting
    rateLimit: {
        requests: 100,
        window: 60 * 1000 // 1 minute
    }
};

// ============ PERFORMANCE CONFIGURATION ============

const PERFORMANCE_CONFIG = {
    // Rendering
    rendering: {
        targetFPS: 60,
        maxFPS: 120,
        vsync: true,
        antialiasing: true,
        shadows: true,
        particles: 1000
    },
    
    // Loading
    loading: {
        preloadDistance: 100,
        maxConcurrentLoads: 5,
        cacheSize: 100
    },
    
    // Memory
    memory: {
        maxTextureSize: 2048,
        maxLights: 10,
        maxObjects: 1000
    }
};

// ============ EXPORT CONFIGURATION ============

const CONFIG = {
    network: NETWORK_CONFIG,
    abis: {
        core: CORE_ABI,
        token: TOKEN_ABI,
        nft: NFT_ABI,
        defi: DEFI_ABI,
        governance: GOVERNANCE_ABI
    },
    ui: UI_CONFIG,
    three: THREE_CONFIG,
    audio: AUDIO_CONFIG,
    islands: ISLAND_CONFIG,
    avatars: AVATAR_CONFIG,
    game: GAME_CONFIG,
    api: API_CONFIG,
    security: SECURITY_CONFIG,
    performance: PERFORMANCE_CONFIG
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CONFIG;
} else {
    window.METAVERSO_CONFIG = CONFIG;
} 
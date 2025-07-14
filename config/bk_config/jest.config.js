/**
 * Jest Configuration - WoldVirtual3DlucIA v0.6.0
 * Configuración completa para testing unitario, integración y e2e
 */

module.exports = {
  // Configuración básica
  verbose: true,
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/test/setup.js'],
  
  // Directorios de test
  testMatch: [
    '<rootDir>/test/unit/**/*.test.{js,jsx,ts,tsx}',
    '<rootDir>/test/integration/**/*.test.{js,jsx,ts,tsx}',
    '<rootDir>/test/e2e/**/*.test.{js,jsx,ts,tsx}',
    '<rootDir>/src/**/*.test.{js,jsx,ts,tsx}',
    '<rootDir>/components/**/*.test.{js,jsx,ts,tsx}',
    '<rootDir>/services/**/*.test.{js,jsx,ts,tsx}',
    '<rootDir>/core/**/*.test.{js,jsx,ts,tsx}',
    '<rootDir>/.bin/editor3d/**/*.test.{js,jsx,ts,tsx}'
  ],
  
  // Archivos a ignorar
  testPathIgnorePatterns: [
    '/node_modules/',
    '/dist/',
    '/build/',
    '/coverage/',
    '/.git/',
    '/test-results/'
  ],
  
  // Transformaciones
  transform: {
    '^.+\\.(js|jsx|ts|tsx)$': ['babel-jest', {
      presets: [
        ['@babel/preset-env', { targets: { node: 'current' } }],
        '@babel/preset-react',
        '@babel/preset-typescript'
      ],
      plugins: [
        '@babel/plugin-proposal-class-properties',
        '@babel/plugin-proposal-object-rest-spread'
      ]
    }],
    '^.+\\.(css|less|scss|sass)$': '<rootDir>/test/mocks/styleMock.js',
    '^.+\\.(jpg|jpeg|png|gif|webp|svg)$': '<rootDir>/test/mocks/fileMock.js'
  },
  
  // Módulos de transformación
  transformIgnorePatterns: [
    '/node_modules/(?!(three|@react-three|@types/three)/)'
  ],
  
  // Mapeo de módulos
  moduleNameMapping: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@/components/(.*)$': '<rootDir>/components/$1',
    '^@/services/(.*)$': '<rootDir>/services/$1',
    '^@/core/(.*)$': '<rootDir>/core/$1',
    '^@/types/(.*)$': '<rootDir>/@types/$1',
    '^@/utils/(.*)$': '<rootDir>/helpers/$1',
    '^@/assets/(.*)$': '<rootDir>/assets/$1',
    '^@/config/(.*)$': '<rootDir>/config/$1'
  },
  
  // Extensions
  moduleFileExtensions: ['js', 'jsx', 'ts', 'tsx', 'json'],
  
  // Coverage
  collectCoverage: true,
  collectCoverageFrom: [
    'src/**/*.{js,jsx,ts,tsx}',
    'components/**/*.{js,jsx,ts,tsx}',
    'services/**/*.{js,jsx,ts,tsx}',
    'core/**/*.{js,jsx,ts,tsx}',
    '.bin/editor3d/**/*.{js,jsx,ts,tsx}',
    '!**/*.d.ts',
    '!**/*.test.{js,jsx,ts,tsx}',
    '!**/node_modules/**',
    '!**/dist/**',
    '!**/build/**'
  ],
  
  coverageDirectory: 'coverage',
  coverageReporters: [
    'text',
    'text-summary',
    'html',
    'lcov',
    'json'
  ],
  
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    }
  },
  
  // Timeouts
  testTimeout: 30000,
  
  // Mocks globales
  globals: {
    'ts-jest': {
      tsconfig: 'tsconfig.json'
    }
  },
  
  // Configuración para testing de componentes React
  setupFilesAfterEnv: [
    '<rootDir>/test/setup.js'
  ],
  
  // Configuración para testing de Three.js
  testEnvironmentOptions: {
    customExportConditions: ['node', 'node-addons']
  },
  
  // Configuración para testing de APIs
  testEnvironmentOptions: {
    url: 'http://localhost:3000'
  },
  
  // Configuración para testing de WebGL
  testEnvironmentOptions: {
    customExportConditions: ['node', 'node-addons'],
    pretendToBeVisual: true
  },
  
  // Configuración para testing de módulos ES6
  extensionsToTreatAsEsm: ['.ts', '.tsx'],
  
  // Configuración para testing de workers
  testEnvironmentOptions: {
    customExportConditions: ['node', 'node-addons']
  },
  
  // Configuración para testing de Web APIs
  testEnvironmentOptions: {
    customExportConditions: ['node', 'node-addons'],
    pretendToBeVisual: true
  },
  
  // Configuración para testing de módulos CSS
  moduleNameMapping: {
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
    '\\.(jpg|jpeg|png|gif|webp|svg)$': '<rootDir>/test/mocks/fileMock.js'
  },
  
  // Configuración para testing de módulos de audio
  moduleNameMapping: {
    '\\.(mp3|wav|ogg)$': '<rootDir>/test/mocks/audioMock.js'
  },
  
  // Configuración para testing de módulos de video
  moduleNameMapping: {
    '\\.(mp4|webm|ogg)$': '<rootDir>/test/mocks/videoMock.js'
  },
  
  // Configuración para testing de módulos de 3D
  moduleNameMapping: {
    '\\.(glb|gltf|obj|fbx|dae)$': '<rootDir>/test/mocks/modelMock.js'
  },
  
  // Configuración para testing de módulos de blockchain
  moduleNameMapping: {
    '^web3$': '<rootDir>/test/mocks/web3Mock.js',
    '^ethers$': '<rootDir>/test/mocks/ethersMock.js'
  },
  
  // Configuración para testing de módulos de IA
  moduleNameMapping: {
    '^@google/generative-ai$': '<rootDir>/test/mocks/geminiMock.js',
    '^openai$': '<rootDir>/test/mocks/openaiMock.js'
  },
  
  // Configuración para testing de módulos de base de datos
  moduleNameMapping: {
    '^sqlite3$': '<rootDir>/test/mocks/sqliteMock.js',
    '^pg$': '<rootDir>/test/mocks/postgresMock.js',
    '^mysql2$': '<rootDir>/test/mocks/mysqlMock.js'
  },
  
  // Configuración para testing de módulos de caché
  moduleNameMapping: {
    '^redis$': '<rootDir>/test/mocks/redisMock.js',
    '^memcached$': '<rootDir>/test/mocks/memcachedMock.js'
  },
  
  // Configuración para testing de módulos de logging
  moduleNameMapping: {
    '^winston$': '<rootDir>/test/mocks/winstonMock.js',
    '^pino$': '<rootDir>/test/mocks/pinoMock.js'
  },
  
  // Configuración para testing de módulos de monitoreo
  moduleNameMapping: {
    '^prometheus-client$': '<rootDir>/test/mocks/prometheusMock.js',
    '^statsd$': '<rootDir>/test/mocks/statsdMock.js'
  },
  
  // Configuración para testing de módulos de autenticación
  moduleNameMapping: {
    '^passport$': '<rootDir>/test/mocks/passportMock.js',
    '^jsonwebtoken$': '<rootDir>/test/mocks/jwtMock.js'
  },
  
  // Configuración para testing de módulos de validación
  moduleNameMapping: {
    '^joi$': '<rootDir>/test/mocks/joiMock.js',
    '^yup$': '<rootDir>/test/mocks/yupMock.js'
  },
  
  // Configuración para testing de módulos de encriptación
  moduleNameMapping: {
    '^bcrypt$': '<rootDir>/test/mocks/bcryptMock.js',
    '^crypto$': '<rootDir>/test/mocks/cryptoMock.js'
  },
  
  // Configuración para testing de módulos de compresión
  moduleNameMapping: {
    '^zlib$': '<rootDir>/test/mocks/zlibMock.js',
    '^brotli$': '<rootDir>/test/mocks/brotliMock.js'
  },
  
  // Configuración para testing de módulos de imágenes
  moduleNameMapping: {
    '^sharp$': '<rootDir>/test/mocks/sharpMock.js',
    '^jimp$': '<rootDir>/test/mocks/jimpMock.js'
  },
  
  // Configuración para testing de módulos de audio
  moduleNameMapping: {
    '^ffmpeg$': '<rootDir>/test/mocks/ffmpegMock.js',
    '^@tonejs/tone$': '<rootDir>/test/mocks/toneMock.js'
  },
  
  // Configuración para testing de módulos de física
  moduleNameMapping: {
    '^cannon-es$': '<rootDir>/test/mocks/cannonMock.js',
    '^ammo.js$': '<rootDir>/test/mocks/ammoMock.js'
  },
  
  // Configuración para testing de módulos de networking
  moduleNameMapping: {
    '^socket.io$': '<rootDir>/test/mocks/socketioMock.js',
    '^ws$': '<rootDir>/test/mocks/wsMock.js'
  },
  
  // Configuración para testing de módulos de WebRTC
  moduleNameMapping: {
    '^simple-peer$': '<rootDir>/test/mocks/simplepeerMock.js',
    '^webrtc-adapter$': '<rootDir>/test/mocks/webrtcMock.js'
  },
  
  // Configuración para testing de módulos de P2P
  moduleNameMapping: {
    '^libp2p$': '<rootDir>/test/mocks/libp2pMock.js',
    '^ipfs$': '<rootDir>/test/mocks/ipfsMock.js'
  },
  
  // Configuración para testing de módulos de DeFi
  moduleNameMapping: {
    '^@uniswap/sdk$': '<rootDir>/test/mocks/uniswapMock.js',
    '^@aave/protocol-js$': '<rootDir>/test/mocks/aaveMock.js'
  },
  
  // Configuración para testing de módulos de NFT
  moduleNameMapping: {
    '^@openzeppelin/contracts$': '<rootDir>/test/mocks/openzeppelinMock.js',
    '^@nftstorage/nft.storage$': '<rootDir>/test/mocks/nftstorageMock.js'
  },
  
  // Configuración para testing de módulos de metaverso
  moduleNameMapping: {
    '^@decentraland/sdk$': '<rootDir>/test/mocks/decentralandMock.js',
    '^@cryptovoxels/sdk$': '<rootDir>/test/mocks/cryptovoxelsMock.js'
  }
}; 
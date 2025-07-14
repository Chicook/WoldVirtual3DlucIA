/**
 * Jest Configuration - Web Module v0.6.0
 * Configuración simplificada para testing del módulo web
 */

module.exports = {
  // Configuración básica
  verbose: true,
  testEnvironment: 'jsdom',
  
  // Directorios de test
  testMatch: [
    '<rootDir>/src/**/*.test.{js,jsx,ts,tsx}',
    '<rootDir>/src/**/__tests__/**/*.{js,jsx,ts,tsx}'
  ],
  
  // Archivos a ignorar
  testPathIgnorePatterns: [
    '/node_modules/',
    '/dist/',
    '/build/',
    '/coverage/'
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
    }]
  },
  
  // Módulos de transformación
  transformIgnorePatterns: [
    '/node_modules/(?!(three|@react-three|@types/three)/)'
  ],
  
  // Mapeo de módulos
  moduleNameMapping: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@/components/(.*)$': '<rootDir>/src/components/$1',
    '^@/utils/(.*)$': '<rootDir>/src/utils/$1',
    '^@/modules/(.*)$': '<rootDir>/src/modules/$1',
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
    '\\.(jpg|jpeg|png|gif|webp|svg)$': '<rootDir>/src/__mocks__/fileMock.js',
    '\\.(mp3|wav|ogg)$': '<rootDir>/src/__mocks__/audioMock.js',
    '\\.(mp4|webm)$': '<rootDir>/src/__mocks__/videoMock.js'
  },
  
  // Extensions
  moduleFileExtensions: ['js', 'jsx', 'ts', 'tsx', 'json'],
  
  // Setup files
  setupFilesAfterEnv: [
    '<rootDir>/src/setupTests.ts'
  ],
  
  // Coverage
  collectCoverage: true,
  collectCoverageFrom: [
    'src/**/*.{js,jsx,ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/*.test.{js,jsx,ts,tsx}',
    '!src/**/__tests__/**',
    '!src/**/__mocks__/**',
    '!**/node_modules/**'
  ],
  
  coverageDirectory: 'coverage',
  coverageReporters: [
    'text',
    'text-summary',
    'html',
    'lcov'
  ],
  
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70
    }
  },
  
  // Timeouts
  testTimeout: 10000,
  
  // Configuración para testing de componentes React
  testEnvironmentOptions: {
    customExportConditions: ['node', 'node-addons'],
    pretendToBeVisual: true
  },
  
  // Configuración para testing de módulos ES6
  extensionsToTreatAsEsm: ['.ts', '.tsx'],
  
  // Globals
  globals: {
    'ts-jest': {
      tsconfig: 'tsconfig.json'
    }
  }
}; 
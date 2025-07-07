/**
 * @fileoverview Configuración de Jest para pruebas del sistema de helpers
 */

module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  roots: ['<rootDir>/src', '<rootDir>/tests'],
  testMatch: [
    '**/__tests__/**/*.ts',
    '**/?(*.)+(spec|test).ts'
  ],
  transform: {
    '^.+\\.ts$': 'ts-jest'
  },
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.d.ts',
    '!src/index.ts',
    '!src/types/**/*.ts'
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  setupFilesAfterEnv: ['<rootDir>/tests/setup.ts'],
  moduleNameMapping: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@/visualization/(.*)$': '<rootDir>/src/visualization/$1',
    '^@/development/(.*)$': '<rootDir>/src/development/$1',
    '^@/web3/(.*)$': '<rootDir>/src/web3/$1',
    '^@/interaction/(.*)$': '<rootDir>/src/interaction/$1',
    '^@/physics/(.*)$': '<rootDir>/src/physics/$1',
    '^@/audio/(.*)$': '<rootDir>/src/audio/$1',
    '^@/utils/(.*)$': '<rootDir>/src/utils/$1',
    '^@/types/(.*)$': '<rootDir>/src/types/$1'
  },
  testTimeout: 10000,
  verbose: true,
  clearMocks: true,
  restoreMocks: true,
  globals: {
    'ts-jest': {
      tsconfig: 'tsconfig.json'
    }
  }
}; 
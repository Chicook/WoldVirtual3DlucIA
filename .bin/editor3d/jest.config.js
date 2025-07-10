/**
 * Vitest Configuration for Enterprise 3D Editor
 * 
 * Comprehensive testing setup with coverage, performance testing,
 * and visual regression testing capabilities.
 * 
 * Migrated from Jest to Vitest for better performance and modern features.
 */

import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react()],
  
  test: {
    // Test environment
    environment: 'jsdom',
    
    // File extensions to test
    include: [
      '**/__tests__/**/*.{test,spec}.{ts,tsx,js,jsx}',
      '**/*.{test,spec}.{ts,tsx,js,jsx}'
    ],
    
    // Exclude patterns
    exclude: [
      'node_modules/**',
      'dist/**',
      'build/**',
      'coverage/**',
      '**/*.config.{js,ts}'
    ],
    
    // Global test setup
    setupFiles: ['./src/test/setup.ts'],
    
    // Coverage configuration
    coverage: {
      provider: 'v8',
      reporter: ['text', 'text-summary', 'html', 'lcov', 'json'],
      exclude: [
        'node_modules/**',
        'src/test/**',
        '**/*.d.ts',
        '**/*.config.{js,ts}',
        '**/*.stories.{ts,tsx}',
        'src/test/setup.ts'
      ],
      thresholds: {
        global: {
          branches: 85,
          functions: 85,
          lines: 85,
          statements: 85
        }
      }
    },
    
    // Performance testing
    testTimeout: 15000,
    
    // Visual regression testing
    environmentOptions: {
      jsdom: {
        url: 'http://localhost:5173'
      }
    },
    
    // Test results processing
    reporters: [
      'default',
      'html',
      'json'
    ],
    
    // Performance monitoring
    globals: true,
    
    // CSS handling
    css: true,
    
    // Clear mocks between tests
    clearMocks: true,
    
    // Restore mocks after each test
    restoreMocks: true,
    
    // Verbose output
    verbose: true,
    
    // Bail on first failure (useful for CI)
    bail: process.env.CI ? 1 : 0,
    
    // Maximum workers
    maxThreads: process.env.CI ? 2 : undefined,
    minThreads: process.env.CI ? 2 : undefined,
    
    // Cache directory
    cache: {
      dir: '.vitest-cache'
    },
    
    // Test location
    testLocationInResults: true,
    
    // Error on missing coverage
    errorOnDeprecated: true,
    
    // UI testing
    ui: true
  },
  
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
      '@core': resolve(__dirname, './src/core'),
      '@components': resolve(__dirname, './src/components'),
      '@services': resolve(__dirname, './src/services'),
      '@utils': resolve(__dirname, './src/utils'),
      '@test': resolve(__dirname, './src/test')
    }
  },
  
  // Build configuration for testing
  build: {
    target: 'esnext',
    sourcemap: true
  }
}); 
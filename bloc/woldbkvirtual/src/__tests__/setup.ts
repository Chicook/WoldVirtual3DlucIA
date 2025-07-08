/**
 * Configuración global para tests
 */

import { config } from 'dotenv';

// Cargar variables de entorno para tests
config({ path: '.env.test' });

// Configuración global de Jest
beforeAll(() => {
  // Configurar timeouts más largos para tests de blockchain
  jest.setTimeout(30000);
});

afterAll(() => {
  // Limpiar después de todos los tests
});

beforeEach(() => {
  // Configurar antes de cada test
});

afterEach(() => {
  // Limpiar después de cada test
  jest.clearAllMocks();
});

// Mock de console para evitar logs en tests
global.console = {
  ...console,
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
}; 
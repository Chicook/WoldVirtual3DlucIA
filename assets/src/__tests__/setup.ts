/**
 * @fileoverview Configuración global para pruebas unitarias
 */

// Configuración global para pruebas
global.beforeAll = (fn: () => void | Promise<void>) => {
  // Configurar variables de entorno para pruebas
  process.env.NODE_ENV = 'test';
  process.env.ASSETS_TEMP_DIR = './temp-test';
  process.env.ASSETS_PROCESSED_DIR = './processed-test';
  fn();
};

global.afterAll = (fn: () => void | Promise<void>) => {
  // Limpiar después de las pruebas
  console.log('🧹 Limpieza completada');
  fn();
};

// Mock para fs-extra
jest.mock('fs-extra', () => ({
  ensureDir: jest.fn(),
  readFile: jest.fn(),
  writeFile: jest.fn(),
  remove: jest.fn(),
  copy: jest.fn(),
  move: jest.fn(),
  stat: jest.fn(),
}));

// Mock para sharp
jest.mock('sharp', () => {
  return jest.fn(() => ({
    resize: jest.fn().mockReturnThis(),
    jpeg: jest.fn().mockReturnThis(),
    png: jest.fn().mockReturnThis(),
    webp: jest.fn().mockReturnThis(),
    toBuffer: jest.fn().mockResolvedValue(Buffer.from('mock-image')),
    toFile: jest.fn().mockResolvedValue({}),
  }));
});

// Mock para axios
jest.mock('axios', () => ({
  post: jest.fn(),
  get: jest.fn(),
  put: jest.fn(),
  delete: jest.fn(),
})); 
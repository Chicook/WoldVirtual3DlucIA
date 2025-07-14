/**
 * @fileoverview Setup para tests - Web Module v0.6.0
 * @version 1.0.0
 * @description Configuración global para testing del módulo web
 */

import '@testing-library/jest-dom';

// Mock global de fetch
global.fetch = jest.fn();

// Mock global de localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
  key: jest.fn(),
  length: 0
};
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
});

// Mock global de sessionStorage
const sessionStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
  key: jest.fn(),
  length: 0
};
Object.defineProperty(window, 'sessionStorage', {
  value: sessionStorageMock
});

// Mock global de URL.createObjectURL
global.URL.createObjectURL = jest.fn(() => 'mock-url');
global.URL.revokeObjectURL = jest.fn();

// Mock global de ResizeObserver
global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn()
}));

// Mock global de IntersectionObserver
global.IntersectionObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn()
}));

// Mock global de MutationObserver
global.MutationObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  disconnect: jest.fn(),
  takeRecords: jest.fn()
}));

// Mock global de PerformanceObserver
global.PerformanceObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  disconnect: jest.fn(),
  takeRecords: jest.fn()
})) as any;
(global.PerformanceObserver as any).supportedEntryTypes = [];

// Mock global de window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Mock global de window.scrollTo
window.scrollTo = jest.fn();

// Mock global de window.getComputedStyle
window.getComputedStyle = jest.fn(() => ({
  getPropertyValue: jest.fn(() => ''),
  setProperty: jest.fn()
})) as any;

// Mock global de Element.prototype
Element.prototype.scrollIntoView = jest.fn();
Element.prototype.getBoundingClientRect = jest.fn(() => ({
  top: 0,
  left: 0,
  bottom: 0,
  right: 0,
  width: 0,
  height: 0,
  x: 0,
  y: 0,
  toJSON: jest.fn()
})) as any;

// Mock global de HTMLVideoElement
Object.defineProperty(global.HTMLVideoElement.prototype, 'load', {
  value: jest.fn()
});

Object.defineProperty(global.HTMLVideoElement.prototype, 'play', {
  value: jest.fn().mockResolvedValue(undefined)
});

Object.defineProperty(global.HTMLVideoElement.prototype, 'pause', {
  value: jest.fn()
});

// Mock global de AudioContext
global.AudioContext = jest.fn().mockImplementation(() => ({
  sampleRate: 44100,
  currentTime: 0,
  state: 'running',
  createOscillator: jest.fn(() => ({
    frequency: { value: 440 },
    type: 'sine',
    connect: jest.fn(),
    start: jest.fn(),
    stop: jest.fn()
  })),
  createGain: jest.fn(() => ({
    gain: { value: 1.0 },
    connect: jest.fn()
  })),
  createAnalyser: jest.fn(() => ({
    connect: jest.fn(),
    getByteFrequencyData: jest.fn(),
    getByteTimeDomainData: jest.fn()
  })),
  createMediaElementSource: jest.fn(() => ({
    connect: jest.fn()
  }))
})) as any;

// Mock global de requestAnimationFrame
global.requestAnimationFrame = jest.fn((callback) => {
  setTimeout(callback, 16);
  return 1;
});

global.cancelAnimationFrame = jest.fn();

// Mock global de console para tests
const originalConsole = { ...console };
global.console = {
  ...console,
  log: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
  info: jest.fn(),
  debug: jest.fn()
};

// Configuración global de Jest
beforeEach(() => {
  // Limpiar todos los mocks antes de cada test
  jest.clearAllMocks();
  
  // Resetear localStorage y sessionStorage
  localStorageMock.getItem.mockReturnValue(null);
  sessionStorageMock.getItem.mockReturnValue(null);
  
  // Resetear fetch
  (global.fetch as jest.Mock).mockClear();
  
  // Resetear URL.createObjectURL
  (global.URL.createObjectURL as jest.Mock).mockClear();
});

// Configuración después de cada test
afterEach(() => {
  // Limpiar timers
  jest.clearAllTimers();
  
  // Limpiar mocks
  jest.clearAllMocks();
  
  // Restaurar console
  global.console = { ...originalConsole };
}); 
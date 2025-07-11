import '@testing-library/jest-dom';
import 'jest-canvas-mock';

// Mock de Three.js para tests
jest.mock('three', () => {
  const THREE = jest.requireActual('three');
  
  // Mock de WebGLRenderer
  class MockWebGLRenderer {
    domElement = document.createElement('canvas');
    info = {
      memory: {
        geometries: 0,
        textures: 0
      },
      render: {
        calls: 0,
        triangles: 0,
        points: 0,
        lines: 0
      }
    };
    
    setSize() {}
    render() {}
    setClearColor() {}
    setPixelRatio() {}
    dispose() {}
  }

  return {
    ...THREE,
    WebGLRenderer: MockWebGLRenderer
  };
});

// Mock de @react-three/fiber
jest.mock('@react-three/fiber', () => ({
  useThree: () => ({
    scene: {},
    camera: {},
    gl: {},
    controls: {}
  }),
  useFrame: jest.fn(),
  Canvas: jest.fn(({ children }) => ({ type: 'div', props: { children } }))
}));

// Mock de @react-three/drei
jest.mock('@react-three/drei', () => ({
  useGLTF: () => ({ scene: {}, animations: [] }),
  useTexture: () => ({}),
  useAnimations: () => ({ actions: {} }),
  OrbitControls: () => null,
  Environment: () => null,
  Stats: () => null,
  PerspectiveCamera: jest.fn(({ children }) => ({ type: 'div', props: { children } })),
  OrthographicCamera: jest.fn(({ children }) => ({ type: 'div', props: { children } })),
  Html: jest.fn(({ children }) => ({ type: 'div', props: { children } }))
}));

// Mock de ethers
jest.mock('ethers', () => ({
  ethers: {
    utils: {
      isAddress: jest.fn(() => true),
      getAddress: jest.fn((address) => address),
      formatEther: jest.fn((value) => value.toString()),
      parseEther: jest.fn((value) => value),
      formatUnits: jest.fn((value) => value.toString()),
      parseUnits: jest.fn((value) => value),
      verifyMessage: jest.fn(() => '0x123...')
    },
    providers: {
      Web3Provider: jest.fn(),
      JsonRpcProvider: jest.fn()
    },
    Contract: jest.fn(),
    BigNumber: {
      from: jest.fn((value) => ({ toString: () => value.toString() }))
    }
  }
}));

// Mock de window.ethereum
Object.defineProperty(window, 'ethereum', {
  value: {
    request: jest.fn(),
    on: jest.fn(),
    removeListener: jest.fn()
  },
  writable: true
});

// Mock de ResizeObserver
global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn()
}));

// Mock de IntersectionObserver
global.IntersectionObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn()
}));

// Mock de performance
Object.defineProperty(window, 'performance', {
  value: {
    now: jest.fn(() => Date.now())
  },
  writable: true
});

// Configuración global para tests
global.console = {
  ...console,
  // Suprimir warnings específicos en tests
  warn: jest.fn(),
  error: jest.fn()
};
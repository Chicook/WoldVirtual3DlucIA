/**
 * @fileoverview Configuración de pruebas para el sistema de helpers
 */

// Mock de Three.js
jest.mock('three', () => {
  const mockThree = {
    Vector3: jest.fn().mockImplementation((x = 0, y = 0, z = 0) => ({
      x, y, z,
      copy: jest.fn().mockReturnThis(),
      clone: jest.fn().mockReturnThis(),
      set: jest.fn().mockReturnThis(),
      add: jest.fn().mockReturnThis(),
      sub: jest.fn().mockReturnThis(),
      multiplyScalar: jest.fn().mockReturnThis(),
      distanceTo: jest.fn().mockReturnValue(1),
      length: jest.fn().mockReturnValue(1)
    })),
    Quaternion: jest.fn().mockImplementation((x = 0, y = 0, z = 0, w = 1) => ({
      x, y, z, w,
      copy: jest.fn().mockReturnThis(),
      clone: jest.fn().mockReturnThis(),
      set: jest.fn().mockReturnThis(),
      setFromAxisAngle: jest.fn().mockReturnThis(),
      multiply: jest.fn().mockReturnThis()
    })),
    Matrix4: jest.fn().mockImplementation(() => ({
      identity: jest.fn().mockReturnThis(),
      copy: jest.fn().mockReturnThis(),
      clone: jest.fn().mockReturnThis(),
      set: jest.fn().mockReturnThis(),
      multiply: jest.fn().mockReturnThis(),
      makeRotationX: jest.fn().mockReturnThis(),
      makeRotationY: jest.fn().mockReturnThis(),
      makeRotationZ: jest.fn().mockReturnThis(),
      makeTranslation: jest.fn().mockReturnThis(),
      makeScale: jest.fn().mockReturnThis()
    })),
    Color: jest.fn().mockImplementation((color = 0xffffff) => ({
      r: 1, g: 1, b: 1,
      setHex: jest.fn().mockReturnThis(),
      setRGB: jest.fn().mockReturnThis(),
      copy: jest.fn().mockReturnThis(),
      clone: jest.fn().mockReturnThis()
    })),
    Euler: jest.fn().mockImplementation((x = 0, y = 0, z = 0) => ({
      x, y, z,
      copy: jest.fn().mockReturnThis(),
      clone: jest.fn().mockReturnThis(),
      set: jest.fn().mockReturnThis()
    })),
    Spherical: jest.fn().mockImplementation((radius = 1, phi = 0, theta = 0) => ({
      radius, phi, theta,
      set: jest.fn().mockReturnThis(),
      setFromVector3: jest.fn().mockReturnThis(),
      copy: jest.fn().mockReturnThis()
    })),
    Vector2: jest.fn().mockImplementation((x = 0, y = 0) => ({
      x, y,
      copy: jest.fn().mockReturnThis(),
      clone: jest.fn().mockReturnThis(),
      set: jest.fn().mockReturnThis(),
      sub: jest.fn().mockReturnThis(),
      add: jest.fn().mockReturnThis(),
      multiplyScalar: jest.fn().mockReturnThis(),
      distanceTo: jest.fn().mockReturnValue(1),
      length: jest.fn().mockReturnValue(1)
    })),
    BoxGeometry: jest.fn().mockImplementation(() => ({
      parameters: { width: 1, height: 1, depth: 1 },
      dispose: jest.fn()
    })),
    SphereGeometry: jest.fn().mockImplementation(() => ({
      parameters: { radius: 1 },
      dispose: jest.fn()
    })),
    CylinderGeometry: jest.fn().mockImplementation(() => ({
      parameters: { radiusTop: 1, radiusBottom: 1, height: 1 },
      dispose: jest.fn()
    })),
    CapsuleGeometry: jest.fn().mockImplementation(() => ({
      parameters: { radius: 1, height: 1 },
      dispose: jest.fn()
    })),
    MeshLambertMaterial: jest.fn().mockImplementation(() => ({
      dispose: jest.fn()
    })),
    MeshBasicMaterial: jest.fn().mockImplementation(() => ({
      dispose: jest.fn()
    })),
    ShaderMaterial: jest.fn().mockImplementation(() => ({
      uniforms: {},
      dispose: jest.fn()
    })),
    Mesh: jest.fn().mockImplementation((geometry, material) => ({
      geometry,
      material,
      position: new mockThree.Vector3(),
      rotation: new mockThree.Euler(),
      quaternion: new mockThree.Quaternion(),
      scale: new mockThree.Vector3(1, 1, 1),
      visible: true,
      add: jest.fn(),
      remove: jest.fn(),
      dispose: jest.fn()
    })),
    LineSegments: jest.fn().mockImplementation(() => ({
      position: new mockThree.Vector3(),
      rotation: new mockThree.Euler(),
      quaternion: new mockThree.Quaternion(),
      scale: new mockThree.Vector3(1, 1, 1),
      visible: true,
      add: jest.fn(),
      remove: jest.fn(),
      dispose: jest.fn()
    })),
    Line: jest.fn().mockImplementation(() => ({
      position: new mockThree.Vector3(),
      rotation: new mockThree.Euler(),
      quaternion: new mockThree.Quaternion(),
      scale: new mockThree.Vector3(1, 1, 1),
      visible: true,
      add: jest.fn(),
      remove: jest.fn(),
      dispose: jest.fn()
    })),
    Object3D: jest.fn().mockImplementation(() => ({
      position: new mockThree.Vector3(),
      rotation: new mockThree.Euler(),
      quaternion: new mockThree.Quaternion(),
      scale: new mockThree.Vector3(1, 1, 1),
      visible: true,
      add: jest.fn(),
      remove: jest.fn(),
      dispose: jest.fn(),
      traverse: jest.fn()
    })),
    LightProbe: jest.fn().mockImplementation(() => ({
      position: new mockThree.Vector3(),
      rotation: new mockThree.Euler(),
      quaternion: new mockThree.Quaternion(),
      scale: new mockThree.Vector3(1, 1, 1),
      visible: true,
      add: jest.fn(),
      remove: jest.fn(),
      dispose: jest.fn(),
      sh: [1, 0, 0, 0, 0, 0, 0, 0, 0]
    })),
    RectAreaLight: jest.fn().mockImplementation(() => ({
      position: new mockThree.Vector3(),
      rotation: new mockThree.Euler(),
      quaternion: new mockThree.Quaternion(),
      scale: new mockThree.Vector3(1, 1, 1),
      visible: true,
      add: jest.fn(),
      remove: jest.fn(),
      dispose: jest.fn()
    })),
    PositionalAudio: jest.fn().mockImplementation(() => ({
      position: new mockThree.Vector3(),
      rotation: new mockThree.Euler(),
      quaternion: new mockThree.Quaternion(),
      scale: new mockThree.Vector3(1, 1, 1),
      visible: true,
      add: jest.fn(),
      remove: jest.fn(),
      dispose: jest.fn(),
      setBuffer: jest.fn(),
      setVolume: jest.fn(),
      setLoop: jest.fn(),
      play: jest.fn(),
      pause: jest.fn(),
      stop: jest.fn(),
      isPlaying: false,
      context: null
    })),
    Audio: jest.fn().mockImplementation(() => ({
      position: new mockThree.Vector3(),
      rotation: new mockThree.Euler(),
      quaternion: new mockThree.Quaternion(),
      scale: new mockThree.Vector3(1, 1, 1),
      visible: true,
      add: jest.fn(),
      remove: jest.fn(),
      dispose: jest.fn(),
      setBuffer: jest.fn(),
      setVolume: jest.fn(),
      setLoop: jest.fn(),
      play: jest.fn(),
      pause: jest.fn(),
      stop: jest.fn(),
      isPlaying: false,
      context: null
    })),
    AudioListener: jest.fn().mockImplementation(() => ({
      position: new mockThree.Vector3(),
      rotation: new mockThree.Euler(),
      quaternion: new mockThree.Quaternion(),
      scale: new mockThree.Vector3(1, 1, 1),
      visible: true,
      add: jest.fn(),
      remove: jest.fn(),
      dispose: jest.fn(),
      getMasterVolume: jest.fn().mockReturnValue(1),
      setMasterVolume: jest.fn()
    })),
    PerspectiveCamera: jest.fn().mockImplementation(() => ({
      position: new mockThree.Vector3(),
      rotation: new mockThree.Euler(),
      quaternion: new mockThree.Quaternion(),
      scale: new mockThree.Vector3(1, 1, 1),
      visible: true,
      add: jest.fn(),
      remove: jest.fn(),
      dispose: jest.fn(),
      lookAt: jest.fn(),
      getWorldPosition: jest.fn().mockReturnValue(new mockThree.Vector3())
    })),
    Scene: jest.fn().mockImplementation(() => ({
      add: jest.fn(),
      remove: jest.fn(),
      traverse: jest.fn(),
      children: []
    })),
    WebGLRenderer: jest.fn().mockImplementation(() => ({
      setSize: jest.fn(),
      render: jest.fn(),
      dispose: jest.fn(),
      getContext: jest.fn().mockReturnValue({
        getExtension: jest.fn().mockReturnValue(null)
      }),
      info: {
        memory: {
          geometries: 0,
          textures: 0
        },
        render: {
          triangles: 0,
          calls: 0
        }
      }
    })),
    AmbientLight: jest.fn().mockImplementation(() => ({
      position: new mockThree.Vector3(),
      rotation: new mockThree.Euler(),
      quaternion: new mockThree.Quaternion(),
      scale: new mockThree.Vector3(1, 1, 1),
      visible: true,
      add: jest.fn(),
      remove: jest.fn(),
      dispose: jest.fn()
    })),
    DirectionalLight: jest.fn().mockImplementation(() => ({
      position: new mockThree.Vector3(),
      rotation: new mockThree.Euler(),
      quaternion: new mockThree.Quaternion(),
      scale: new mockThree.Vector3(1, 1, 1),
      visible: true,
      add: jest.fn(),
      remove: jest.fn(),
      dispose: jest.fn()
    })),
    MathUtils: {
      generateUUID: jest.fn().mockReturnValue('test-uuid-123')
    }
  };

  return mockThree;
});

// Mock de ethers
jest.mock('ethers', () => ({
  JsonRpcProvider: jest.fn().mockImplementation(() => ({
    getNetwork: jest.fn().mockResolvedValue({ chainId: 1 }),
    getBalance: jest.fn().mockResolvedValue('1000000000000000000'),
    getBlockNumber: jest.fn().mockResolvedValue(12345678),
    getFeeData: jest.fn().mockResolvedValue({ gasPrice: '20000000000' }),
    getBlock: jest.fn().mockResolvedValue({ timestamp: 1234567890, difficulty: '1000000' }),
    getTransaction: jest.fn().mockResolvedValue({
      hash: '0x123',
      from: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6',
      to: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6',
      value: '1000000000000000000',
      gasPrice: '20000000000',
      data: '0x'
    }),
    getTransactionReceipt: jest.fn().mockResolvedValue({
      gasUsed: '21000',
      blockNumber: 12345678,
      status: 1
    }),
    on: jest.fn(),
    off: jest.fn(),
    eventQueue: jest.fn().mockReturnValue({
      drainCollisionEvents: jest.fn()
    })
  })),
  Contract: jest.fn().mockImplementation(() => ({
    name: jest.fn().mockResolvedValue('Test Token'),
    symbol: jest.fn().mockResolvedValue('TEST'),
    decimals: jest.fn().mockResolvedValue(18),
    totalSupply: jest.fn().mockResolvedValue('1000000000000000000000000'),
    balanceOf: jest.fn().mockResolvedValue('1000000000000000000000'),
    tokenURI: jest.fn().mockResolvedValue('https://example.com/metadata.json'),
    ownerOf: jest.fn().mockResolvedValue('0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6')
  })),
  Wallet: jest.fn().mockImplementation(() => ({
    sendTransaction: jest.fn().mockResolvedValue({
      hash: '0x123',
      from: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6',
      to: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6',
      value: '1000000000000000000',
      gasPrice: '20000000000',
      data: '0x',
      wait: jest.fn().mockResolvedValue({
        gasUsed: '21000',
        blockNumber: 12345678,
        status: 1
      })
    })
  })),
  BrowserProvider: jest.fn().mockImplementation(() => ({
    getSigner: jest.fn().mockResolvedValue({
      sendTransaction: jest.fn().mockResolvedValue({
        hash: '0x123',
        wait: jest.fn().mockResolvedValue({
          gasUsed: '21000',
          blockNumber: 12345678,
          status: 1
        })
      })
    })
  })),
  Vector3: jest.fn().mockImplementation((x = 0, y = 0, z = 0) => ({ x, y, z })),
  Quaternion: jest.fn().mockImplementation((x = 0, y = 0, z = 0, w = 1) => ({ x, y, z, w })),
  formatEther: jest.fn().mockReturnValue('1.0'),
  parseEther: jest.fn().mockReturnValue('1000000000000000000'),
  formatUnits: jest.fn().mockReturnValue('20'),
  parseUnits: jest.fn().mockReturnValue('20000000000')
}));

// Mock de Rapier
jest.mock('@dimforge/rapier3d-compat', () => ({
  init: jest.fn().mockResolvedValue(undefined),
  Vector3: jest.fn().mockImplementation((x = 0, y = 0, z = 0) => ({ x, y, z })),
  Quaternion: jest.fn().mockImplementation((x = 0, y = 0, z = 0, w = 1) => ({ x, y, z, w })),
  World: jest.fn().mockImplementation(() => ({
    setSolverIterations: jest.fn(),
    setVelocityIterations: jest.fn(),
    setPositionIterations: jest.fn(),
    step: jest.fn(),
    createRigidBody: jest.fn().mockReturnValue({
      setLinvel: jest.fn(),
      setAngvel: jest.fn(),
      setTranslation: jest.fn(),
      setRotation: jest.fn(),
      applyImpulse: jest.fn(),
      applyTorqueImpulse: jest.fn(),
      applyImpulseAtPoint: jest.fn(),
      translation: jest.fn().mockReturnValue({ x: 0, y: 0, z: 0 }),
      rotation: jest.fn().mockReturnValue({ x: 0, y: 0, z: 0, w: 1 }),
      linvel: jest.fn().mockReturnValue({ x: 0, y: 0, z: 0 }),
      angvel: jest.fn().mockReturnValue({ x: 0, y: 0, z: 0 }),
      mass: jest.fn().mockReturnValue(1),
      linearDamping: jest.fn().mockReturnValue(0),
      angularDamping: jest.fn().mockReturnValue(0),
      isSleeping: jest.fn().mockReturnValue(false),
      isFixed: jest.fn().mockReturnValue(false),
      isKinematic: jest.fn().mockReturnValue(false)
    }),
    createCollider: jest.fn().mockReturnValue({
      setFriction: jest.fn(),
      setRestitution: jest.fn(),
      friction: jest.fn().mockReturnValue(0.5),
      restitution: jest.fn().mockReturnValue(0.3),
      shape: jest.fn().mockReturnValue({
        type: 'Cuboid',
        halfExtents: jest.fn().mockReturnValue({ x: 0.5, y: 0.5, z: 0.5 }),
        radius: jest.fn().mockReturnValue(1)
      })
    }),
    removeRigidBody: jest.fn(),
    removeCollider: jest.fn(),
    getRigidBody: jest.fn().mockReturnValue({
      translation: jest.fn().mockReturnValue({ x: 0, y: 0, z: 0 }),
      rotation: jest.fn().mockReturnValue({ x: 0, y: 0, z: 0, w: 1 }),
      linvel: jest.fn().mockReturnValue({ x: 0, y: 0, z: 0 }),
      angvel: jest.fn().mockReturnValue({ x: 0, y: 0, z: 0 }),
      mass: jest.fn().mockReturnValue(1),
      linearDamping: jest.fn().mockReturnValue(0),
      angularDamping: jest.fn().mockReturnValue(0),
      isSleeping: jest.fn().mockReturnValue(false),
      isFixed: jest.fn().mockReturnValue(false),
      isKinematic: jest.fn().mockReturnValue(false)
    }),
    eventQueue: jest.fn().mockReturnValue({
      drainCollisionEvents: jest.fn()
    })
  })),
  RigidBodyDesc: {
    fixed: jest.fn().mockReturnValue({}),
    kinematicPositionBased: jest.fn().mockReturnValue({}),
    dynamic: jest.fn().mockReturnValue({
      setLinearDamping: jest.fn().mockReturnThis(),
      setAngularDamping: jest.fn().mockReturnThis(),
      setCcdEnabled: jest.fn().mockReturnThis()
    })
  },
  ColliderDesc: {
    cuboid: jest.fn().mockReturnValue({}),
    ball: jest.fn().mockReturnValue({}),
    cylinder: jest.fn().mockReturnValue({}),
    capsule: jest.fn().mockReturnValue({})
  },
  ShapeType: {
    Cuboid: 'Cuboid',
    Ball: 'Ball',
    Cylinder: 'Cylinder',
    Capsule: 'Capsule'
  }
}));

// Mock de Web Audio API
global.AudioContext = jest.fn().mockImplementation(() => ({
  createGain: jest.fn().mockReturnValue({
    gain: { value: 1 },
    connect: jest.fn()
  }),
  createConvolver: jest.fn().mockReturnValue({
    buffer: null,
    connect: jest.fn()
  }),
  createDelay: jest.fn().mockReturnValue({
    delayTime: { value: 0.5 },
    connect: jest.fn()
  }),
  createBiquadFilter: jest.fn().mockReturnValue({
    type: 'lowpass',
    frequency: { value: 2000 },
    Q: { value: 1 },
    connect: jest.fn()
  }),
  createBuffer: jest.fn().mockReturnValue({
    duration: 10,
    sampleRate: 44100,
    getChannelData: jest.fn().mockReturnValue(new Float32Array(44100))
  }),
  decodeAudioData: jest.fn().mockResolvedValue({
    duration: 10,
    sampleRate: 44100,
    getChannelData: jest.fn().mockReturnValue(new Float32Array(44100))
  }),
  sampleRate: 44100,
  close: jest.fn()
}));

// Mock de fetch
global.fetch = jest.fn().mockResolvedValue({
  arrayBuffer: jest.fn().mockResolvedValue(new ArrayBuffer(1024)),
  json: jest.fn().mockResolvedValue({
    name: 'Test NFT',
    description: 'Test Description',
    image: 'https://example.com/image.jpg',
    attributes: []
  })
});

// Mock de performance
global.performance = {
  now: jest.fn().mockReturnValue(1000),
  memory: {
    usedJSHeapSize: 1000000,
    jsHeapSizeLimit: 2000000
  }
};

// Mock de window
Object.defineProperty(window, 'innerWidth', {
  writable: true,
  configurable: true,
  value: 1024
});

Object.defineProperty(window, 'innerHeight', {
  writable: true,
  configurable: true,
  value: 768
});

// Mock de document
Object.defineProperty(document, 'body', {
  writable: true,
  configurable: true,
  value: {
    appendChild: jest.fn(),
    removeChild: jest.fn()
  }
});

// Mock de console para evitar spam en tests
global.console = {
  ...console,
  log: jest.fn(),
  warn: jest.fn(),
  error: jest.fn()
}; 
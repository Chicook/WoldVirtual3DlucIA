/**
 * @fileoverview Ejemplo básico de uso del sistema de helpers del metaverso
 * @module @metaverso/helpers/examples/basic-usage
 */

import * as THREE from 'three';
import {
  LightProbeHelper,
  PerformanceHelper,
  BlockchainHelper,
  CameraHelper,
  PhysicsHelper,
  AudioHelper,
  ValidationHelper,
  initializeHelpers,
  checkCompatibility
} from '../src/index';

/**
 * Ejemplo básico de uso del sistema de helpers
 */
export class BasicUsageExample {
  private scene: THREE.Scene;
  private camera: THREE.Camera;
  private renderer: THREE.WebGLRenderer;
  private helpers: {
    performance: PerformanceHelper;
    camera: CameraHelper;
    physics: PhysicsHelper;
    audio: AudioHelper;
    validation: ValidationHelper;
  };

  constructor() {
    // Verificar compatibilidad
    const compatibility = checkCompatibility();
    console.log('Compatibilidad del sistema:', compatibility);

    // Inicializar Three.js
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(this.renderer.domElement);

    // Inicializar helpers
    this.helpers = this._initializeHelpers();

    // Configurar escena
    this._setupScene();

    // Iniciar loop de renderizado
    this._animate();
  }

  /**
   * Inicializar helpers
   */
  private _initializeHelpers() {
    // Configuración del sistema
    const config = initializeHelpers({
      visualization: {
        enabled: true,
        showNormals: false,
        showBoundingBoxes: true,
        showWireframes: false,
        showTangents: false,
        showLightHelpers: true
      },
      development: {
        enabled: true,
        showFPS: true,
        showMemory: true,
        showProfiling: false,
        logLevel: 'info'
      },
      web3: {
        enabled: true,
        network: 'ethereum',
        rpcUrl: 'https://mainnet.infura.io/v3/YOUR_PROJECT_ID'
      },
      interaction: {
        enabled: true,
        enableVR: true,
        enableTouch: true,
        enableRaycast: true
      },
      physics: {
        enabled: true,
        engine: 'rapier',
        gravity: { x: 0, y: -9.81, z: 0 }
      },
      audio: {
        enabled: true,
        positional: {
          enabled: true,
          maxDistance: 100,
          rolloffFactor: 1
        }
      }
    });

    // Helper de rendimiento
    const performance = new PerformanceHelper(this.renderer, this.scene, this.camera);
    performance.setConfig({
      enableWarnings: true,
      warningThresholds: {
        fps: 30,
        frameTime: 33,
        memoryUsage: 0.8,
        drawCalls: 1000
      }
    });

    // Helper de cámara
    const camera = new CameraHelper(this.camera, this.renderer.domElement, {
      enableOrbit: true,
      enablePan: true,
      enableZoom: true,
      enableDolly: true,
      enableRotate: true,
      enableKeys: true,
      enableTouch: true,
      enableVR: true,
      minDistance: 1,
      maxDistance: 100,
      panSpeed: 1.0,
      zoomSpeed: 1.0,
      rotateSpeed: 1.0,
      enableDamping: true,
      dampingFactor: 0.05
    });

    // Helper de física
    const physics = new PhysicsHelper({
      engine: 'rapier',
      gravity: new THREE.Vector3(0, -9.81, 0),
      timeStep: 1 / 60,
      maxSubSteps: 10,
      enableDebug: true,
      enableSleeping: true,
      enableCCD: true,
      solverIterations: 4,
      velocityIterations: 1,
      positionIterations: 1
    });

    // Helper de audio
    const audio = new AudioHelper(this.camera, {
      enablePositional: true,
      enableReverb: false,
      enableEcho: false,
      enableFilter: false,
      maxDistance: 100,
      rolloffFactor: 1,
      refDistance: 1,
      maxVolume: 1
    });

    // Helper de validación
    const validation = new ValidationHelper({
      validateTypes: true,
      validateRanges: true,
      validateFormats: true,
      errorMessages: {
        required: 'El campo es requerido',
        type: 'Tipo de dato inválido',
        range: 'Valor fuera del rango permitido',
        length: 'Longitud inválida',
        pattern: 'Formato inválido',
        custom: 'Validación personalizada falló'
      }
    });

    return {
      performance,
      camera,
      physics,
      audio,
      validation
    };
  }

  /**
   * Configurar escena
   */
  private _setupScene() {
    // Iluminación
    const ambientLight = new THREE.AmbientLight(0x404040, 0.6);
    this.scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(10, 10, 5);
    this.scene.add(directionalLight);

    // LightProbe para iluminación global
    const lightProbe = new THREE.LightProbe();
    this.scene.add(lightProbe);

    // Helper de LightProbe
    const lightProbeHelper = new LightProbeHelper(lightProbe, 2, 0xffffff, 1);
    lightProbeHelper.setShowIntensity(true);
    lightProbeHelper.setShowSphericalHarmonics(true);
    this.scene.add(lightProbeHelper);

    // Geometrías de ejemplo
    this._createExampleGeometries();

    // Posicionar cámara
    this.camera.position.set(5, 5, 5);
    this.camera.lookAt(0, 0, 0);
  }

  /**
   * Crear geometrías de ejemplo
   */
  private _createExampleGeometries() {
    // Cubo
    const cubeGeometry = new THREE.BoxGeometry(1, 1, 1);
    const cubeMaterial = new THREE.MeshLambertMaterial({ color: 0x00ff00 });
    const cube = new THREE.Mesh(cubeGeometry, cubeMaterial);
    cube.position.set(-2, 0, 0);
    this.scene.add(cube);

    // Esfera
    const sphereGeometry = new THREE.SphereGeometry(0.5, 32, 32);
    const sphereMaterial = new THREE.MeshLambertMaterial({ color: 0xff0000 });
    const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
    sphere.position.set(0, 0, 0);
    this.scene.add(sphere);

    // Cilindro
    const cylinderGeometry = new THREE.CylinderGeometry(0.5, 0.5, 1, 32);
    const cylinderMaterial = new THREE.MeshLambertMaterial({ color: 0x0000ff });
    const cylinder = new THREE.Mesh(cylinderGeometry, cylinderMaterial);
    cylinder.position.set(2, 0, 0);
    this.scene.add(cylinder);

    // Agregar cuerpos físicos
    this._addPhysicsBodies();
  }

  /**
   * Agregar cuerpos físicos
   */
  private async _addPhysicsBodies() {
    // Esperar a que la física se inicialice
    await this.helpers.physics.init();

    // Cubo físico
    this.helpers.physics.createBody('cube', this.scene.children.find(child => 
      child instanceof THREE.Mesh && child.position.x === -2
    ) as THREE.Mesh, 'dynamic', 1, 0.5, 0.3);

    // Esfera física
    this.helpers.physics.createBody('sphere', this.scene.children.find(child => 
      child instanceof THREE.Mesh && child.position.x === 0
    ) as THREE.Mesh, 'dynamic', 1, 0.3, 0.8);

    // Cilindro físico
    this.helpers.physics.createBody('cylinder', this.scene.children.find(child => 
      child instanceof THREE.Mesh && child.position.x === 2
    ) as THREE.Mesh, 'dynamic', 1, 0.7, 0.2);

    // Habilitar debug de física
    this.helpers.physics.setDebugEnabled(true, this.scene);
  }

  /**
   * Cargar audio de ejemplo
   */
  private async _loadExampleAudio() {
    try {
      // Cargar archivo de audio
      await this.helpers.audio.loadAudio('ambient', '/audio/ambient.mp3', 'ambient');
      
      // Crear fuente de audio posicional
      this.helpers.audio.createAudioSource('ambientSource', 'ambient', new THREE.Vector3(0, 2, 0), {
        type: 'ambient',
        volume: 0.5,
        loop: true,
        autoplay: true,
        maxDistance: 50,
        rolloffFactor: 1,
        refDistance: 1
      });

      console.log('Audio cargado correctamente');
    } catch (error) {
      console.warn('No se pudo cargar el audio:', error);
    }
  }

  /**
   * Ejemplo de validación
   */
  private _exampleValidation() {
    // Validar datos de Three.js
    const threeJSData = {
      position: new THREE.Vector3(1, 2, 3),
      rotation: new THREE.Quaternion(),
      scale: new THREE.Vector3(1, 1, 1),
      visible: true,
      uuid: THREE.MathUtils.generateUUID(),
      type: 'Mesh'
    };

    const threeJSResult = this.helpers.validation.validateThreeJSData(threeJSData);
    console.log('Validación Three.js:', threeJSResult);

    // Validar datos de blockchain
    const blockchainData = {
      address: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6',
      amount: '1.5',
      gasLimit: 21000,
      gasPrice: '20'
    };

    const blockchainResult = this.helpers.validation.validateBlockchainData(blockchainData);
    console.log('Validación Blockchain:', blockchainResult);

    // Validar datos de audio
    const audioData = {
      url: 'https://example.com/audio.mp3',
      volume: 0.8,
      loop: true,
      autoplay: false,
      maxDistance: 100
    };

    const audioResult = this.helpers.validation.validateAudioData(audioData);
    console.log('Validación Audio:', audioResult);
  }

  /**
   * Ejemplo de blockchain
   */
  private async _exampleBlockchain() {
    try {
      // Crear helper de blockchain
      const blockchain = new BlockchainHelper({
        network: 'ethereum',
        rpcUrl: 'https://mainnet.infura.io/v3/YOUR_PROJECT_ID',
        chainId: 1,
        name: 'Ethereum Mainnet',
        currency: 'ETH',
        blockTime: 12
      });

      // Conectar
      await blockchain.connect();

      // Obtener información de red
      const networkInfo = blockchain.getNetworkInfo();
      console.log('Información de red:', networkInfo);

      // Obtener estadísticas
      const stats = await blockchain.getNetworkStats();
      console.log('Estadísticas de red:', stats);

      // Ejemplo de obtener balance (requiere dirección válida)
      // const balance = await blockchain.getBalance('0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6');
      // console.log('Balance:', balance);

    } catch (error) {
      console.warn('Error en ejemplo de blockchain:', error);
    }
  }

  /**
   * Loop de animación
   */
  private _animate() {
    requestAnimationFrame(this._animate.bind(this));

    // Iniciar frame para performance
    this.helpers.performance.startFrame();

    // Actualizar helpers
    this.helpers.performance.update();
    this.helpers.camera.update();
    this.helpers.physics.update();
    this.helpers.audio.update();

    // Renderizar escena
    this.renderer.render(this.scene, this.camera);

    // Finalizar frame para performance
    this.helpers.performance.endFrame();
  }

  /**
   * Obtener estadísticas
   */
  public getStats() {
    return {
      performance: this.helpers.performance.getPerformanceReport(),
      physics: this.helpers.physics.getStats(),
      audio: this.helpers.audio.getStats()
    };
  }

  /**
   * Limpiar recursos
   */
  public dispose() {
    // Limpiar helpers
    this.helpers.performance.dispose();
    this.helpers.camera.dispose();
    this.helpers.physics.dispose();
    this.helpers.audio.dispose();

    // Limpiar Three.js
    this.scene.traverse((object) => {
      if (object instanceof THREE.Mesh) {
        if (object.geometry) object.geometry.dispose();
        if (object.material) {
          if (Array.isArray(object.material)) {
            object.material.forEach(material => material.dispose());
          } else {
            object.material.dispose();
          }
        }
      }
    });

    this.renderer.dispose();
    document.body.removeChild(this.renderer.domElement);
  }
}

// Ejemplo de uso
if (typeof window !== 'undefined') {
  // Ejecutar cuando se carga la página
  window.addEventListener('load', () => {
    const example = new BasicUsageExample();
    
    // Cargar audio después de un delay
    setTimeout(() => {
      example._loadExampleAudio();
    }, 1000);
    
    // Ejemplo de validación
    setTimeout(() => {
      example._exampleValidation();
    }, 2000);
    
    // Ejemplo de blockchain
    setTimeout(() => {
      example._exampleBlockchain();
    }, 3000);
    
    // Mostrar estadísticas cada 5 segundos
    setInterval(() => {
      const stats = example.getStats();
      console.log('Estadísticas del sistema:', stats);
    }, 5000);
    
    // Limpiar al salir
    window.addEventListener('beforeunload', () => {
      example.dispose();
    });
  });
} 
/**
 * @fileoverview Ejemplo básico de generación de imágenes de entorno
 * @module @metaverso/image-generator/examples/basic-generation
 */

import * as THREE from 'three';
import { ProceduralSkyboxGenerator } from '../src/generators/ProceduralSkyboxGenerator';
import { TerrainGenerator } from '../src/generators/TerrainGenerator';
import { NFTImageCreator } from '../src/web3/NFTImageCreator';
import { PREDEFINED_PALETTES } from '../src/types';

/**
 * Ejemplo básico de generación de imágenes
 */
export class BasicGenerationExample {
  private renderer: THREE.WebGLRenderer;
  private scene: THREE.Scene;
  private camera: THREE.Camera;
  private skyboxGenerator: ProceduralSkyboxGenerator;
  private terrainGenerator: TerrainGenerator;
  private nftCreator: NFTImageCreator;

  /**
   * Constructor del ejemplo
   */
  constructor() {
    this._setupThreeJS();
    this._setupGenerators();
    this._setupNFT();
  }

  /**
   * Configurar Three.js
   */
  private _setupThreeJS(): void {
    // Crear renderer
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setSize(800, 600);
    this.renderer.setPixelRatio(window.devicePixelRatio);
    document.body.appendChild(this.renderer.domElement);

    // Crear escena
    this.scene = new THREE.Scene();

    // Crear cámara
    this.camera = new THREE.PerspectiveCamera(75, 800 / 600, 0.1, 1000);
    this.camera.position.set(0, 5, 10);
    this.camera.lookAt(0, 0, 0);

    // Agregar controles de cámara
    this._addCameraControls();
  }

  /**
   * Configurar generadores
   */
  private _setupGenerators(): void {
    // Configurar generador de skybox
    this.skyboxGenerator = new ProceduralSkyboxGenerator({
      resolution: 1024,
      quality: 'high',
      algorithm: 'simplex',
      octaves: 4,
      persistence: 0.5,
      lacunarity: 2.0,
      seed: Math.random() * 1000000,
      colorPalette: PREDEFINED_PALETTES.sunset,
      contrast: 1.0,
      saturation: 1.0,
      brightness: 1.0,
      effects: {
        atmosphere: true,
        volumetricClouds: false,
        fog: false,
        rain: false,
        snow: false,
        dust: false,
        smoke: false,
        particles: false,
        postProcessing: true,
        bloom: false,
        ssao: false,
        motionBlur: false
      },
      type: 'sunset',
      atmosphere: true,
      clouds: true,
      stars: false,
      aurora: false,
      lightning: false,
      sunDirection: new THREE.Vector3(0.5, 0.8, 0.3),
      sunColor: new THREE.Color(0xffff00),
      skyTopColor: new THREE.Color(0x87ceeb),
      skyBottomColor: new THREE.Color(0x4169e1),
      scatteringIntensity: 1.0,
      atmosphereHeight: 10
    });

    // Configurar generador de terreno
    this.terrainGenerator = new TerrainGenerator({
      resolution: 1024,
      quality: 'high',
      algorithm: 'simplex',
      octaves: 6,
      persistence: 0.5,
      lacunarity: 2.0,
      seed: Math.random() * 1000000,
      colorPalette: PREDEFINED_PALETTES.forest,
      contrast: 1.0,
      saturation: 1.0,
      brightness: 1.0,
      effects: {
        atmosphere: false,
        volumetricClouds: false,
        fog: false,
        rain: false,
        snow: false,
        dust: false,
        smoke: false,
        particles: false,
        postProcessing: true,
        bloom: false,
        ssao: false,
        motionBlur: false
      },
      width: 512,
      height: 512,
      scale: 1.0,
      maxHeight: 100,
      minHeight: 0,
      erosion: true,
      waterErosion: true,
      thermalErosion: true,
      erosionIntensity: 0.5,
      erosionIterations: 10,
      heightTexture: true,
      normalTexture: true,
      roughnessTexture: true
    });
  }

  /**
   * Configurar NFT
   */
  private _setupNFT(): void {
    this.nftCreator = new NFTImageCreator({
      network: 'ethereum',
      contractAddress: '0x1234567890123456789012345678901234567890', // Dirección de ejemplo
      rpcUrl: 'https://mainnet.infura.io/v3/YOUR_PROJECT_ID',
      ipfsGateway: 'https://ipfs.io',
      gasLimit: 300000
    });
  }

  /**
   * Agregar controles de cámara
   */
  private _addCameraControls(): void {
    // Implementación simple de controles de cámara
    let isMouseDown = false;
    let mouseX = 0;
    let mouseY = 0;

    this.renderer.domElement.addEventListener('mousedown', (event) => {
      isMouseDown = true;
      mouseX = event.clientX;
      mouseY = event.clientY;
    });

    this.renderer.domElement.addEventListener('mouseup', () => {
      isMouseDown = false;
    });

    this.renderer.domElement.addEventListener('mousemove', (event) => {
      if (isMouseDown) {
        const deltaX = event.clientX - mouseX;
        const deltaY = event.clientY - mouseY;

        // Rotar cámara
        this.camera.position.x = Math.cos(deltaX * 0.01) * 10;
        this.camera.position.z = Math.sin(deltaX * 0.01) * 10;
        this.camera.lookAt(0, 0, 0);

        mouseX = event.clientX;
        mouseY = event.clientY;
      }
    });

    // Zoom con rueda del mouse
    this.renderer.domElement.addEventListener('wheel', (event) => {
      const zoom = event.deltaY > 0 ? 1.1 : 0.9;
      this.camera.position.multiplyScalar(zoom);
    });
  }

  /**
   * Generar skybox
   */
  public async generateSkybox(): Promise<void> {
    console.log('[BasicGenerationExample] Generando skybox...');
    
    try {
      const skybox = await this.skyboxGenerator.generate();
      
      // Aplicar skybox a la escena
      this.scene.background = skybox.texture;
      
      console.log('[BasicGenerationExample] Skybox generado:', skybox.metadata);
      
      // Crear NFT del skybox
      await this._createSkyboxNFT(skybox);
      
    } catch (error) {
      console.error('[BasicGenerationExample] Error al generar skybox:', error);
    }
  }

  /**
   * Generar terreno
   */
  public async generateTerrain(): Promise<void> {
    console.log('[BasicGenerationExample] Generando terreno...');
    
    try {
      const terrain = await this.terrainGenerator.generate();
      
      // Crear mesh del terreno
      const material = new THREE.MeshStandardMaterial({
        map: terrain.heightmap,
        normalMap: terrain.normalMap,
        roughnessMap: terrain.roughnessMap,
        metalness: 0.0,
        roughness: 1.0
      });
      
      const mesh = new THREE.Mesh(terrain.geometry, material);
      mesh.rotation.x = -Math.PI / 2; // Rotar para que esté horizontal
      this.scene.add(mesh);
      
      console.log('[BasicGenerationExample] Terreno generado:', terrain.metadata);
      
      // Crear NFT del terreno
      await this._createTerrainNFT(terrain);
      
    } catch (error) {
      console.error('[BasicGenerationExample] Error al generar terreno:', error);
    }
  }

  /**
   * Crear NFT del skybox
   */
  private async _createSkyboxNFT(skybox: any): Promise<void> {
    try {
      const nft = await this.nftCreator.createNFT({
        image: skybox.texture,
        name: `Procedural Skybox #${Date.now()}`,
        description: 'Skybox procedural generado con algoritmos de ruido y efectos atmosféricos',
        attributes: {
          type: 'skybox',
          resolution: `${skybox.metadata.resolution}`,
          algorithm: 'procedural',
          seed: this.skyboxGenerator.getSeed(),
          generationParams: skybox.parameters,
          createdAt: new Date().toISOString(),
          generatorVersion: '1.0.0',
          imageHash: skybox.metadata.imageHash,
          rarity: 'uncommon'
        },
        network: 'ethereum',
        contractAddress: '0x1234567890123456789012345678901234567890'
      });
      
      console.log('[BasicGenerationExample] NFT del skybox creado:', nft);
      
    } catch (error) {
      console.error('[BasicGenerationExample] Error al crear NFT del skybox:', error);
    }
  }

  /**
   * Crear NFT del terreno
   */
  private async _createTerrainNFT(terrain: any): Promise<void> {
    try {
      const nft = await this.nftCreator.createNFT({
        image: terrain.heightmap,
        name: `Procedural Terrain #${Date.now()}`,
        description: 'Terreno procedural generado con erosión y texturas realistas',
        attributes: {
          type: 'terrain',
          resolution: `${terrain.metadata.dimensions.width}x${terrain.metadata.dimensions.height}`,
          algorithm: 'procedural',
          seed: this.terrainGenerator.getSeed(),
          generationParams: terrain.parameters,
          createdAt: new Date().toISOString(),
          generatorVersion: '1.0.0',
          imageHash: terrain.metadata.imageHash,
          rarity: 'rare'
        },
        network: 'ethereum',
        contractAddress: '0x1234567890123456789012345678901234567890'
      });
      
      console.log('[BasicGenerationExample] NFT del terreno creado:', nft);
      
    } catch (error) {
      console.error('[BasicGenerationExample] Error al crear NFT del terreno:', error);
    }
  }

  /**
   * Renderizar escena
   */
  public render(): void {
    this.renderer.render(this.scene, this.camera);
  }

  /**
   * Iniciar loop de renderizado
   */
  public startRenderLoop(): void {
    const animate = () => {
      requestAnimationFrame(animate);
      this.render();
    };
    animate();
  }

  /**
   * Limpiar recursos
   */
  public dispose(): void {
    this.renderer.dispose();
    document.body.removeChild(this.renderer.domElement);
  }
}

/**
 * Función principal del ejemplo
 */
export async function runBasicGenerationExample(): Promise<void> {
  console.log('[BasicGenerationExample] Iniciando ejemplo de generación básica...');
  
  const example = new BasicGenerationExample();
  
  // Generar skybox
  await example.generateSkybox();
  
  // Generar terreno
  await example.generateTerrain();
  
  // Iniciar loop de renderizado
  example.startRenderLoop();
  
  console.log('[BasicGenerationExample] Ejemplo iniciado correctamente');
  
  // Exponer para acceso global
  (window as any).basicGenerationExample = example;
}

// Ejecutar si es el archivo principal
if (typeof window !== 'undefined') {
  window.addEventListener('DOMContentLoaded', runBasicGenerationExample);
} 
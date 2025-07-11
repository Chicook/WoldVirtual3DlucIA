// lucIA Environment - Entorno 3D digital para el avatar
// WoldVirtual3DlucIA v0.6.0

import * as THREE from 'three';

// Configuración del entorno digital
export interface EnvironmentConfig {
  floor: {
    size: number;
    color: THREE.Color;
    gridColor: THREE.Color;
  };
  walls: {
    height: number;
    color: THREE.Color;
    transparency: number;
  };
  particles: {
    count: number;
    color: THREE.Color;
    size: number;
  };
  lighting: {
    ambient: THREE.Color;
    directional: THREE.Color;
    point: THREE.Color;
  };
  fog: {
    color: THREE.Color;
    near: number;
    far: number;
  };
}

// Sistema de entorno 3D
export class LuciaEnvironment {
  private static instance: LuciaEnvironment;
  private scene: THREE.Scene | null = null;
  private particles: THREE.Points | null = null;
  private lights: THREE.Group | null = null;
  private isInitialized: boolean = false;
  private animationFrame: number = 0;

  static getInstance(): LuciaEnvironment {
    if (!LuciaEnvironment.instance) {
      LuciaEnvironment.instance = new LuciaEnvironment();
    }
    return LuciaEnvironment.instance;
  }

  // Configuración por defecto del entorno
  private getDefaultConfig(): EnvironmentConfig {
    return {
      floor: {
        size: 20,
        color: new THREE.Color(0x1a1a2e), // Azul oscuro digital
        gridColor: new THREE.Color(0x16213e)
      },
      walls: {
        height: 8,
        color: new THREE.Color(0x0f3460), // Azul medio
        transparency: 0.3
      },
      particles: {
        count: 1000,
        color: new THREE.Color(0x00d4ff), // Azul brillante
        size: 0.02
      },
      lighting: {
        ambient: new THREE.Color(0x404040),
        directional: new THREE.Color(0xffffff),
        point: new THREE.Color(0x00d4ff)
      },
      fog: {
        color: new THREE.Color(0x1a1a2e),
        near: 5,
        far: 30
      }
    };
  }

  // Inicializar entorno
  public initialize(scene: THREE.Scene, config: EnvironmentConfig = this.getDefaultConfig()): void {
    if (this.isInitialized) return;

    this.scene = scene;
    
    // Crear suelo
    this.createFloor(config.floor);
    
    // Crear paredes
    this.createWalls(config.walls, config.floor.size);
    
    // Crear partículas
    this.createParticles(config.particles);
    
    // Crear iluminación
    this.createLighting(config.lighting);
    
    // Configurar neblina
    this.setupFog(config.fog);
    
    // Crear elementos decorativos
    this.createDecorations();
    
    // Iniciar animaciones
    this.startAnimations();

    this.isInitialized = true;
  }

  // Crear suelo digital
  private createFloor(floorConfig: EnvironmentConfig['floor']): void {
    if (!this.scene) return;

    // Geometría del suelo
    const floorGeometry = new THREE.PlaneGeometry(floorConfig.size, floorConfig.size);
    const floorMaterial = new THREE.MeshStandardMaterial({
      color: floorConfig.color,
      roughness: 0.8,
      metalness: 0.2
    });
    const floor = new THREE.Mesh(floorGeometry, floorMaterial);
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    this.scene.add(floor);

    // Grid digital
    const gridHelper = new THREE.GridHelper(
      floorConfig.size,
      20,
      floorConfig.gridColor,
      floorConfig.gridColor
    );
    gridHelper.position.y = 0.01;
    this.scene.add(gridHelper);
  }

  // Crear paredes transparentes
  private createWalls(wallsConfig: EnvironmentConfig['walls'], floorSize: number): void {
    if (!this.scene) return;

    const wallMaterial = new THREE.MeshStandardMaterial({
      color: wallsConfig.color,
      transparent: true,
      opacity: wallsConfig.transparency,
      roughness: 0.5,
      metalness: 0.3
    });

    // Pared trasera
    const backWall = new THREE.Mesh(
      new THREE.PlaneGeometry(floorSize, wallsConfig.height),
      wallMaterial
    );
    backWall.position.set(0, wallsConfig.height / 2, -floorSize / 2);
    this.scene.add(backWall);

    // Pared frontal
    const frontWall = new THREE.Mesh(
      new THREE.PlaneGeometry(floorSize, wallsConfig.height),
      wallMaterial
    );
    frontWall.position.set(0, wallsConfig.height / 2, floorSize / 2);
    frontWall.rotation.y = Math.PI;
    this.scene.add(frontWall);

    // Pared izquierda
    const leftWall = new THREE.Mesh(
      new THREE.PlaneGeometry(floorSize, wallsConfig.height),
      wallMaterial
    );
    leftWall.position.set(-floorSize / 2, wallsConfig.height / 2, 0);
    leftWall.rotation.y = Math.PI / 2;
    this.scene.add(leftWall);

    // Pared derecha
    const rightWall = new THREE.Mesh(
      new THREE.PlaneGeometry(floorSize, wallsConfig.height),
      wallMaterial
    );
    rightWall.position.set(floorSize / 2, wallsConfig.height / 2, 0);
    rightWall.rotation.y = -Math.PI / 2;
    this.scene.add(rightWall);
  }

  // Crear partículas digitales
  private createParticles(particlesConfig: EnvironmentConfig['particles']): void {
    if (!this.scene) return;

    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particlesConfig.count * 3);
    const colors = new Float32Array(particlesConfig.count * 3);

    for (let i = 0; i < particlesConfig.count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 40; // X
      positions[i * 3 + 1] = Math.random() * 10; // Y
      positions[i * 3 + 2] = (Math.random() - 0.5) * 40; // Z

      colors[i * 3] = particlesConfig.color.r;
      colors[i * 3 + 1] = particlesConfig.color.g;
      colors[i * 3 + 2] = particlesConfig.color.b;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const material = new THREE.PointsMaterial({
      size: particlesConfig.size,
      vertexColors: true,
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending
    });

    this.particles = new THREE.Points(geometry, material);
    this.scene.add(this.particles);
  }

  // Crear iluminación
  private createLighting(lightingConfig: EnvironmentConfig['lighting']): void {
    if (!this.scene) return;

    this.lights = new THREE.Group();

    // Luz ambiental
    const ambientLight = new THREE.AmbientLight(
      lightingConfig.ambient,
      0.3
    );
    this.lights.add(ambientLight);

    // Luz direccional principal
    const directionalLight = new THREE.DirectionalLight(
      lightingConfig.directional,
      0.8
    );
    directionalLight.position.set(10, 10, 5);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    this.lights.add(directionalLight);

    // Luces puntuales digitales
    const pointLight1 = new THREE.PointLight(
      lightingConfig.point,
      0.5,
      20
    );
    pointLight1.position.set(5, 5, 5);
    this.lights.add(pointLight1);

    const pointLight2 = new THREE.PointLight(
      lightingConfig.point,
      0.5,
      20
    );
    pointLight2.position.set(-5, 5, -5);
    this.lights.add(pointLight2);

    const pointLight3 = new THREE.PointLight(
      lightingConfig.point,
      0.3,
      15
    );
    pointLight3.position.set(0, 8, 0);
    this.lights.add(pointLight3);

    this.scene.add(this.lights);
  }

  // Configurar neblina
  private setupFog(fogConfig: EnvironmentConfig['fog']): void {
    if (!this.scene) return;

    this.scene.fog = new THREE.Fog(
      fogConfig.color,
      fogConfig.near,
      fogConfig.far
    );
  }

  // Crear elementos decorativos
  private createDecorations(): void {
    if (!this.scene) return;

    // Holograma flotante
    const hologramGeometry = new THREE.CylinderGeometry(0.5, 0.5, 2, 8);
    const hologramMaterial = new THREE.MeshStandardMaterial({
      color: 0x00d4ff,
      transparent: true,
      opacity: 0.3,
      wireframe: true
    });
    const hologram = new THREE.Mesh(hologramGeometry, hologramMaterial);
    hologram.position.set(5, 2, 5);
    this.scene.add(hologram);

    // Esfera de datos
    const dataSphereGeometry = new THREE.SphereGeometry(0.8, 16, 16);
    const dataSphereMaterial = new THREE.MeshStandardMaterial({
      color: 0x00d4ff,
      transparent: true,
      opacity: 0.4,
      wireframe: true
    });
    const dataSphere = new THREE.Mesh(dataSphereGeometry, dataSphereMaterial);
    dataSphere.position.set(-5, 3, -5);
    this.scene.add(dataSphere);

    // Cubo flotante
    const cubeGeometry = new THREE.BoxGeometry(0.6, 0.6, 0.6);
    const cubeMaterial = new THREE.MeshStandardMaterial({
      color: 0x00d4ff,
      transparent: true,
      opacity: 0.2,
      wireframe: true
    });
    const cube = new THREE.Mesh(cubeGeometry, cubeMaterial);
    cube.position.set(0, 4, 8);
    this.scene.add(cube);
  }

  // Iniciar animaciones
  private startAnimations(): void {
    const animate = () => {
      if (!this.isInitialized) return;

      // Animación de partículas
      if (this.particles) {
        const positions = this.particles.geometry.attributes.position.array as Float32Array;
        const time = Date.now() * 0.001;
        
        for (let i = 0; i < positions.length; i += 3) {
          positions[i + 1] += Math.sin(time + i) * 0.001; // Movimiento vertical
          positions[i] += Math.cos(time + i) * 0.001; // Movimiento horizontal
        }
        
        this.particles.geometry.attributes.position.needsUpdate = true;
      }

      // Animación de luces
      if (this.lights) {
        const time = Date.now() * 0.001;
        this.lights.rotation.y = time * 0.1;
      }

      this.animationFrame = requestAnimationFrame(animate);
    };

    this.animationFrame = requestAnimationFrame(animate);
  }

  // Actualizar configuración del entorno
  public updateConfig(config: Partial<EnvironmentConfig>): void {
    // Implementar actualización dinámica de configuración
    console.log('Actualizando configuración del entorno:', config);
  }

  // Obtener partículas para manipulación externa
  public getParticles(): THREE.Points | null {
    return this.particles;
  }

  // Obtener luces para manipulación externa
  public getLights(): THREE.Group | null {
    return this.lights;
  }

  // Limpiar recursos
  public cleanup(): void {
    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame);
    }
    
    if (this.particles) {
      this.particles.geometry.dispose();
      (this.particles.material as THREE.Material).dispose();
    }
    
    this.isInitialized = false;
  }
}

// Exportar instancia singleton
export const luciaEnvironment = LuciaEnvironment.getInstance(); 
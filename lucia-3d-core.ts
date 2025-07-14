// lucIA 3D Core - Sistema principal del avatar 3D
// WoldVirtual3DlucIA v0.6.0

import * as THREE from 'three';

// Configuración principal de lucIA
export interface LuciaConfig {
  physical: {
    age: number;
    ethnicity: string;
    height: string;
    build: string;
    skinTone: THREE.Color;
    hairColor: THREE.Color;
    eyeColor: THREE.Color;
    lipColor: THREE.Color;
  };
  geometry: {
    head: {
      radius: number;
      segments: number;
      position: [number, number, number];
    };
    hair: {
      length: number;
      volume: number;
      style: string;
    };
    eyes: {
      size: number;
      spacing: number;
      depth: number;
    };
    mouth: {
      width: number;
      height: number;
      depth: number;
    };
    nose: {
      width: number;
      height: number;
      depth: number;
    };
  };
  voice: {
    pitch: number;
    rate: number;
    volume: number;
    vibrato: number;
    attack: number;
    decay: number;
    sustain: number;
    release: number;
  };
  emotions: {
    neutral: EmotionConfig;
    happy: EmotionConfig;
    concentrated: EmotionConfig;
    curious: EmotionConfig;
  };
  animations: {
    breathing: AnimationConfig;
    blinking: AnimationConfig;
    speaking: AnimationConfig;
  };
}

export interface EmotionConfig {
  eyebrowHeight: number;
  mouthCurve: number;
  eyeOpenness: number;
}

export interface AnimationConfig {
  frequency: number;
  amplitude: number;
  duration?: number;
}

// Configuración por defecto de lucIA (35 años, morena española)
export const luciaConfig: LuciaConfig = {
  physical: {
    age: 35,
    ethnicity: 'spanish',
    height: 'tall',
    build: 'slim',
    skinTone: new THREE.Color(0xf5d0c5), // Piel clara española
    hairColor: new THREE.Color(0x2c1810), // Moreno oscuro
    eyeColor: new THREE.Color(0x4a4a4a), // Marrón oscuro
    lipColor: new THREE.Color(0xd4a5a5) // Labios naturales
  },
  geometry: {
    head: {
      radius: 0.8,
      segments: 32,
      position: [0, 1.7, 0]
    },
    hair: {
      length: 1.2,
      volume: 0.9,
      style: 'long_straight'
    },
    eyes: {
      size: 0.15,
      spacing: 0.4,
      depth: 0.1
    },
    mouth: {
      width: 0.3,
      height: 0.1,
      depth: 0.05
    },
    nose: {
      width: 0.1,
      height: 0.3,
      depth: 0.1
    }
  },
  voice: {
    pitch: 220, // Hz - voz femenina
    rate: 0.9, // Velocidad ligeramente más lenta para acento español
    volume: -10, // dB - volumen suave
    vibrato: 0.1, // Ligero vibrato para naturalidad
    attack: 0.1, // Ataque suave
    decay: 0.3, // Decay natural
    sustain: 0.7, // Sustain para mantener la voz
    release: 0.5 // Release suave
  },
  emotions: {
    neutral: {
      eyebrowHeight: 0,
      mouthCurve: 0,
      eyeOpenness: 1
    },
    happy: {
      eyebrowHeight: 0.1,
      mouthCurve: 0.3,
      eyeOpenness: 0.8
    },
    concentrated: {
      eyebrowHeight: -0.1,
      mouthCurve: -0.1,
      eyeOpenness: 0.9
    },
    curious: {
      eyebrowHeight: 0.2,
      mouthCurve: 0.1,
      eyeOpenness: 1.1
    }
  },
  animations: {
    breathing: {
      frequency: 0.5, // Hz
      amplitude: 0.02
    },
    blinking: {
      frequency: 3, // segundos entre parpadeos
      duration: 0.15 // segundos de parpadeo
    },
    speaking: {
      frequency: 8, // Hz para movimiento de boca
      amplitude: 0.1
    }
  }
};

// Clase principal de lucIA 3D
export class Lucia3D {
  private config: LuciaConfig;
  private scene: THREE.Scene | null = null;
  private camera: THREE.Camera | null = null;
  private renderer: THREE.WebGLRenderer | null = null;
  private avatar: THREE.Group | null = null;
  private isInitialized: boolean = false;

  constructor(config: LuciaConfig = luciaConfig) {
    this.config = config;
  }

  // Inicializar el sistema 3D
  public initialize(container: HTMLElement): void {
    if (this.isInitialized) return;

    // Crear escena
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x1a1a2e);

    // Crear cámara
    this.camera = new THREE.PerspectiveCamera(
      60,
      container.clientWidth / container.clientHeight,
      0.1,
      1000
    );
    this.camera.position.set(0, 1.8, 3);

    // Crear renderer
    this.renderer = new THREE.WebGLRenderer({ 
      antialias: true, 
      alpha: true 
    });
    this.renderer.setSize(container.clientWidth, container.clientHeight);
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(this.renderer.domElement);

    // Crear avatar
    this.createAvatar();

    // Configurar iluminación
    this.setupLighting();

    // Iniciar render loop
    this.animate();

    this.isInitialized = true;
  }

  // Crear el avatar de lucIA
  private createAvatar(): void {
    if (!this.scene) return;

    this.avatar = new THREE.Group();

    // Crear cabeza
    const headGeometry = new THREE.SphereGeometry(
      this.config.geometry.head.radius,
      this.config.geometry.head.segments,
      this.config.geometry.head.segments
    );
    const headMaterial = new THREE.MeshStandardMaterial({
      color: this.config.physical.skinTone,
      roughness: 0.8,
      metalness: 0.1
    });
    const head = new THREE.Mesh(headGeometry, headMaterial);
    head.position.set(...this.config.geometry.head.position);
    head.castShadow = true;
    this.avatar.add(head);

    // Crear cabello
    this.createHair();

    // Crear ojos
    this.createEyes();

    // Crear boca
    this.createMouth();

    // Crear nariz
    this.createNose();

    this.scene.add(this.avatar);
  }

  // Crear cabello
  private createHair(): void {
    if (!this.avatar) return;

    const hairMaterial = new THREE.MeshStandardMaterial({
      color: this.config.physical.hairColor,
      roughness: 0.9,
      metalness: 0.0
    });

    // Cabello principal
    const hairGeometry = new THREE.CylinderGeometry(
      0.9, 0.7, this.config.geometry.hair.length, 16
    );
    const hair = new THREE.Mesh(hairGeometry, hairMaterial);
    hair.position.set(0, 1.7, 0);
    hair.castShadow = true;
    this.avatar.add(hair);

    // Mechones laterales
    const sideHairGeometry = new THREE.CylinderGeometry(0.3, 0.2, 0.8, 8);
    
    const leftHair = new THREE.Mesh(sideHairGeometry, hairMaterial);
    leftHair.position.set(-0.6, 1.5, 0);
    leftHair.rotation.z = 0.3;
    leftHair.castShadow = true;
    this.avatar.add(leftHair);

    const rightHair = new THREE.Mesh(sideHairGeometry, hairMaterial);
    rightHair.position.set(0.6, 1.5, 0);
    rightHair.rotation.z = -0.3;
    rightHair.castShadow = true;
    this.avatar.add(rightHair);
  }

  // Crear ojos
  private createEyes(): void {
    if (!this.avatar) return;

    const eyeMaterial = new THREE.MeshStandardMaterial({
      color: this.config.physical.eyeColor,
      roughness: 0.2,
      metalness: 0.8
    });

    const eyeGeometry = new THREE.SphereGeometry(
      this.config.geometry.eyes.size,
      16, 16
    );

    const leftEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
    leftEye.position.set(-this.config.geometry.eyes.spacing/2, 1.8, 0.6);
    this.avatar.add(leftEye);

    const rightEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
    rightEye.position.set(this.config.geometry.eyes.spacing/2, 1.8, 0.6);
    this.avatar.add(rightEye);
  }

  // Crear boca
  private createMouth(): void {
    if (!this.avatar) return;

    const mouthMaterial = new THREE.MeshStandardMaterial({
      color: this.config.physical.lipColor,
      roughness: 0.7,
      metalness: 0.1
    });

    const mouthGeometry = new THREE.BoxGeometry(
      this.config.geometry.mouth.width,
      this.config.geometry.mouth.height,
      this.config.geometry.mouth.depth
    );
    const mouth = new THREE.Mesh(mouthGeometry, mouthMaterial);
    mouth.position.set(0, 1.4, 0.7);
    this.avatar.add(mouth);
  }

  // Crear nariz
  private createNose(): void {
    if (!this.avatar) return;

    const noseMaterial = new THREE.MeshStandardMaterial({
      color: this.config.physical.skinTone,
      roughness: 0.8,
      metalness: 0.1
    });

    const noseGeometry = new THREE.BoxGeometry(
      this.config.geometry.nose.width,
      this.config.geometry.nose.height,
      this.config.geometry.nose.depth
    );
    const nose = new THREE.Mesh(noseGeometry, noseMaterial);
    nose.position.set(0, 1.6, 0.75);
    this.avatar.add(nose);
  }

  // Configurar iluminación
  private setupLighting(): void {
    if (!this.scene) return;

    // Luz ambiental
    const ambientLight = new THREE.AmbientLight(0x404040, 0.3);
    this.scene.add(ambientLight);

    // Luz direccional principal
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(10, 10, 5);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    this.scene.add(directionalLight);

    // Luces puntuales
    const pointLight1 = new THREE.PointLight(0x00d4ff, 0.5, 20);
    pointLight1.position.set(5, 5, 5);
    this.scene.add(pointLight1);

    const pointLight2 = new THREE.PointLight(0x00d4ff, 0.5, 20);
    pointLight2.position.set(-5, 5, -5);
    this.scene.add(pointLight2);
  }

  // Loop de animación
  private animate(): void {
    if (!this.renderer || !this.scene || !this.camera) return;

    requestAnimationFrame(() => this.animate());
    this.renderer.render(this.scene, this.camera);
  }

  // Limpiar recursos
  public dispose(): void {
    if (this.renderer) {
      this.renderer.dispose();
    }
    this.isInitialized = false;
  }
}

// Exportar instancia singleton
export const lucia3D = new Lucia3D(); 
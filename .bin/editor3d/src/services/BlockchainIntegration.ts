import * as THREE from 'three';

export interface NFTMetadata {
  id: string;
  name: string;
  description: string;
  image: string;
  attributes: {
    trait_type: string;
    value: string | number;
  }[];
  properties: {
    files: { uri: string; type: string }[];
    category: string;
  };
}

export interface SceneMetadata {
  id: string;
  name: string;
  description: string;
  creator: string;
  createdAt: number;
  objects: SceneObjectMetadata[];
  environment: EnvironmentMetadata;
  version: string;
}

export interface SceneObjectMetadata {
  id: string;
  type: string;
  position: { x: number; y: number; z: number };
  rotation: { x: number; y: number; z: number };
  scale: { x: number; y: number; z: number };
  material: MaterialMetadata;
  animations?: AnimationMetadata[];
  scripts?: ScriptMetadata[];
  nftData?: NFTMetadata;
}

export interface MaterialMetadata {
  type: string;
  color?: string;
  opacity?: number;
  roughness?: number;
  metalness?: number;
  textures?: {
    diffuse?: string;
    normal?: string;
    bump?: string;
    emissive?: string;
  };
}

export interface AnimationMetadata {
  id: string;
  type: string;
  duration: number;
  parameters: any;
}

export interface ScriptMetadata {
  id: string;
  type: string;
  parameters: any;
  enabled: boolean;
}

export interface EnvironmentMetadata {
  lighting: {
    ambient: { color: string; intensity: number };
    directional: { color: string; intensity: number; position: { x: number; y: number; z: number } };
  };
  fog: {
    color: string;
    near: number;
    far: number;
  };
  skybox?: string;
}

export interface BlockchainConfig {
  network: 'ethereum' | 'polygon' | 'bsc' | 'testnet';
  contractAddress: string;
  gasLimit: number;
  gasPrice: number;
}

class BlockchainIntegration {
  private config: BlockchainConfig;
  private isConnected: boolean = false;
  private walletAddress: string | null = null;
  private sceneMetadata: Map<string, SceneMetadata> = new Map();

  constructor(config: BlockchainConfig) {
    this.config = config;
  }

  /**
   * Conectar a wallet
   */
  async connectWallet(): Promise<boolean> {
    try {
      // Verificar si MetaMask está disponible
      if (typeof window.ethereum === 'undefined') {
        throw new Error('MetaMask no está instalado');
      }

      // Solicitar conexión
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts'
      });

      if (accounts.length > 0) {
        this.walletAddress = accounts[0];
        this.isConnected = true;
        return true;
      }

      return false;
    } catch (error) {
      console.error('Error conectando wallet:', error);
      return false;
    }
  }

  /**
   * Desconectar wallet
   */
  disconnectWallet(): void {
    this.walletAddress = null;
    this.isConnected = false;
  }

  /**
   * Verificar conexión
   */
  isWalletConnected(): boolean {
    return this.isConnected && this.walletAddress !== null;
  }

  /**
   * Obtener dirección de wallet
   */
  getWalletAddress(): string | null {
    return this.walletAddress;
  }

  /**
   * Generar metadata de escena para NFT
   */
  generateSceneMetadata(
    sceneId: string,
    name: string,
    description: string,
    scene: THREE.Scene
  ): SceneMetadata {
    const objects: SceneObjectMetadata[] = [];
    
    // Recorrer objetos de la escena
    scene.traverse((object) => {
      if (object instanceof THREE.Mesh && object.userData.id) {
        const objectMetadata: SceneObjectMetadata = {
          id: object.userData.id,
          type: object.userData.type || 'mesh',
          position: {
            x: object.position.x,
            y: object.position.y,
            z: object.position.z
          },
          rotation: {
            x: object.rotation.x,
            y: object.rotation.y,
            z: object.rotation.z
          },
          scale: {
            x: object.scale.x,
            y: object.scale.y,
            z: object.scale.z
          },
          material: this.extractMaterialMetadata(object.material)
        };

        // Añadir animaciones si existen
        if (object.userData.animations) {
          objectMetadata.animations = object.userData.animations;
        }

        // Añadir scripts si existen
        if (object.userData.scripts) {
          objectMetadata.scripts = object.userData.scripts;
        }

        objects.push(objectMetadata);
      }
    });

    const metadata: SceneMetadata = {
      id: sceneId,
      name,
      description,
      creator: this.walletAddress || 'unknown',
      createdAt: Date.now(),
      objects,
      environment: this.extractEnvironmentMetadata(scene),
      version: '1.0.0'
    };

    this.sceneMetadata.set(sceneId, metadata);
    return metadata;
  }

  /**
   * Extraer metadata de material
   */
  private extractMaterialMetadata(material: THREE.Material): MaterialMetadata {
    const metadata: MaterialMetadata = {
      type: material.type
    };

    if (material instanceof THREE.MeshStandardMaterial) {
      metadata.color = '#' + material.color.getHexString();
      metadata.opacity = material.opacity;
      metadata.roughness = material.roughness;
      metadata.metalness = material.metalness;
      
      if (material.map) {
        metadata.textures = {
          diffuse: material.map.source?.data?.src || ''
        };
      }
      if (material.normalMap) {
        if (!metadata.textures) metadata.textures = {};
        metadata.textures.normal = material.normalMap.source?.data?.src || '';
      }
      if (material.bumpMap) {
        if (!metadata.textures) metadata.textures = {};
        metadata.textures.bump = material.bumpMap.source?.data?.src || '';
      }
      if (material.emissiveMap) {
        if (!metadata.textures) metadata.textures = {};
        metadata.textures.emissive = material.emissiveMap.source?.data?.src || '';
      }
    } else if (material instanceof THREE.MeshBasicMaterial) {
      metadata.color = '#' + material.color.getHexString();
      metadata.opacity = material.opacity;
      
      if (material.map) {
        metadata.textures = {
          diffuse: material.map.source?.data?.src || ''
        };
      }
    }

    return metadata;
  }

  /**
   * Extraer metadata del entorno
   */
  private extractEnvironmentMetadata(scene: THREE.Scene): EnvironmentMetadata {
    const environment: EnvironmentMetadata = {
      lighting: {
        ambient: { color: '#404040', intensity: 0.5 },
        directional: { color: '#ffffff', intensity: 1.0, position: { x: 10, y: 10, z: 5 } }
      },
      fog: {
        color: '#000000',
        near: 1,
        far: 1000
      }
    };

    // Buscar luces en la escena
    scene.traverse((object) => {
      if (object instanceof THREE.AmbientLight) {
        environment.lighting.ambient = {
          color: '#' + object.color.getHexString(),
          intensity: object.intensity
        };
      } else if (object instanceof THREE.DirectionalLight) {
        environment.lighting.directional = {
          color: '#' + object.color.getHexString(),
          intensity: object.intensity,
          position: {
            x: object.position.x,
            y: object.position.y,
            z: object.position.z
          }
        };
      }
    });

    // Buscar niebla
    if (scene.fog) {
      environment.fog = {
        color: '#' + scene.fog.color.getHexString(),
        near: scene.fog.near,
        far: scene.fog.far
      };
    }

    return environment;
  }

  /**
   * Generar metadata NFT estándar
   */
  generateNFTMetadata(
    sceneMetadata: SceneMetadata,
    imageUrl: string
  ): NFTMetadata {
    const attributes = [
      {
        trait_type: 'Creator',
        value: sceneMetadata.creator
      },
      {
        trait_type: 'Object Count',
        value: sceneMetadata.objects.length
      },
      {
        trait_type: 'Creation Date',
        value: new Date(sceneMetadata.createdAt).toISOString()
      },
      {
        trait_type: 'Version',
        value: sceneMetadata.version
      }
    ];

    // Añadir atributos de objetos únicos
    const objectTypes = new Set(sceneMetadata.objects.map(obj => obj.type));
    objectTypes.forEach(type => {
      const count = sceneMetadata.objects.filter(obj => obj.type === type).length;
      attributes.push({
        trait_type: `${type} Count`,
        value: count
      });
    });

    return {
      id: sceneMetadata.id,
      name: sceneMetadata.name,
      description: sceneMetadata.description,
      image: imageUrl,
      attributes,
      properties: {
        files: [
          {
            uri: imageUrl,
            type: 'image/png'
          }
        ],
        category: 'metaverse-scene'
      }
    };
  }

  /**
   * Preparar transacción para minting
   */
  async prepareMintTransaction(
    sceneMetadata: SceneMetadata,
    nftMetadata: NFTMetadata
  ): Promise<any> {
    if (!this.isWalletConnected()) {
      throw new Error('Wallet no conectada');
    }

    // Simular preparación de transacción
    const transaction = {
      to: this.config.contractAddress,
      from: this.walletAddress,
      gas: this.config.gasLimit,
      gasPrice: this.config.gasPrice,
      data: this.encodeMintFunction(nftMetadata),
      value: '0x0'
    };

    return transaction;
  }

  /**
   * Codificar función de minting
   */
  private encodeMintFunction(nftMetadata: NFTMetadata): string {
    // Simulación de codificación de función
    // En implementación real, usaría ethers.js o web3.js
    const functionSignature = 'mint(string,string,string)';
    const tokenURI = JSON.stringify(nftMetadata);
    
    // Codificación simplificada
    return '0x' + Buffer.from(functionSignature + tokenURI).toString('hex');
  }

  /**
   * Subir metadata a IPFS (simulado)
   */
  async uploadMetadataToIPFS(metadata: NFTMetadata): Promise<string> {
    // Simulación de subida a IPFS
    // En implementación real, usaría Pinata o similar
    const metadataHash = 'Qm' + Buffer.from(JSON.stringify(metadata)).toString('base64').substring(0, 44);
    return `ipfs://${metadataHash}`;
  }

  /**
   * Subir imagen a IPFS (simulado)
   */
  async uploadImageToIPFS(imageData: string): Promise<string> {
    // Simulación de subida de imagen a IPFS
    const imageHash = 'Qm' + Buffer.from(imageData).toString('base64').substring(0, 44);
    return `ipfs://${imageHash}`;
  }

  /**
   * Verificar balance de tokens
   */
  async checkTokenBalance(tokenAddress: string): Promise<string> {
    if (!this.isWalletConnected()) {
      throw new Error('Wallet no conectada');
    }

    // Simulación de verificación de balance
    return '1000000000000000000000'; // 1000 tokens en wei
  }

  /**
   * Obtener historial de transacciones
   */
  async getTransactionHistory(): Promise<any[]> {
    if (!this.isWalletConnected()) {
      throw new Error('Wallet no conectada');
    }

    // Simulación de historial
    return [
      {
        hash: '0x123...',
        from: this.walletAddress,
        to: this.config.contractAddress,
        value: '0',
        timestamp: Date.now() - 86400000,
        status: 'confirmed'
      }
    ];
  }

  /**
   * Validar metadata de escena
   */
  validateSceneMetadata(metadata: SceneMetadata): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!metadata.name || metadata.name.trim().length === 0) {
      errors.push('Nombre de escena requerido');
    }

    if (!metadata.description || metadata.description.trim().length === 0) {
      errors.push('Descripción de escena requerida');
    }

    if (!metadata.creator || metadata.creator === 'unknown') {
      errors.push('Creador de escena requerido');
    }

    if (metadata.objects.length === 0) {
      errors.push('La escena debe contener al menos un objeto');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * Exportar metadata como JSON
   */
  exportMetadataAsJSON(sceneId: string): string | null {
    const metadata = this.sceneMetadata.get(sceneId);
    if (!metadata) return null;

    return JSON.stringify(metadata, null, 2);
  }

  /**
   * Importar metadata desde JSON
   */
  importMetadataFromJSON(jsonData: string): SceneMetadata | null {
    try {
      const metadata = JSON.parse(jsonData) as SceneMetadata;
      this.sceneMetadata.set(metadata.id, metadata);
      return metadata;
    } catch (error) {
      console.error('Error importando metadata:', error);
      return null;
    }
  }

  /**
   * Obtener información de debug
   */
  getDebugInfo(): {
    connected: boolean;
    walletAddress: string | null;
    network: string;
    totalScenes: number;
  } {
    return {
      connected: this.isConnected,
      walletAddress: this.walletAddress,
      network: this.config.network,
      totalScenes: this.sceneMetadata.size
    };
  }
}

// Configuración por defecto
const defaultConfig: BlockchainConfig = {
  network: 'testnet',
  contractAddress: '0x0000000000000000000000000000000000000000',
  gasLimit: 3000000,
  gasPrice: 20000000000 // 20 gwei
};

export const blockchainIntegration = new BlockchainIntegration(defaultConfig);

// Extensión de Window para TypeScript
declare global {
  interface Window {
    ethereum?: any;
  }
} 
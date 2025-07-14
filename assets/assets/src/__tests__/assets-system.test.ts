/**
 * @fileoverview Pruebas básicas del sistema de assets
 */

import { AssetsSystem, AssetType, AssetCategory } from '../index';

describe('AssetsSystem', () => {
  let assetsSystem: AssetsSystem;

  beforeEach(() => {
    assetsSystem = new AssetsSystem();
  });

  afterEach(async () => {
    if (assetsSystem) {
      await assetsSystem.cleanup();
    }
  });

  describe('Inicialización', () => {
    it('debería inicializar correctamente', async () => {
      await expect(assetsSystem.initialize()).resolves.not.toThrow();
    });

    it('debería manejar errores de inicialización', async () => {
      // Simular error de configuración
      jest.spyOn(console, 'error').mockImplementation(() => {});
      
      // Esto debería fallar graciosamente
      await expect(assetsSystem.initialize()).rejects.toThrow();
    });
  });

  describe('Procesamiento de assets', () => {
    beforeEach(async () => {
      await assetsSystem.initialize();
    });

    it('debería validar archivos correctamente', async () => {
      const mockFilePath = './test-asset.png';
      
      // Mock de validación exitosa
      const result = await assetsSystem.processAsset(mockFilePath, {
        optimization: { quality: 85 },
        compression: { algorithm: 'gzip' },
        upload: { platform: 'local' }
      });

      expect(result).toBeDefined();
      expect(result.success).toBeDefined();
    });

    it('debería manejar archivos inexistentes', async () => {
      const nonExistentFile = './non-existent-file.glb';
      
      const result = await assetsSystem.processAsset(nonExistentFile);
      
      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });
  });

  describe('Búsqueda de assets', () => {
    beforeEach(async () => {
      await assetsSystem.initialize();
    });

    it('debería buscar assets por criterios', async () => {
      const criteria = {
        type: AssetType.MODEL_3D,
        category: AssetCategory.CHARACTER,
        limit: 10
      };

      const results = await assetsSystem.searchAssets(criteria);
      
      expect(Array.isArray(results)).toBe(true);
    });

    it('debería manejar criterios de búsqueda vacíos', async () => {
      const results = await assetsSystem.searchAssets({});
      
      expect(Array.isArray(results)).toBe(true);
    });
  });

  describe('Estadísticas del sistema', () => {
    beforeEach(async () => {
      await assetsSystem.initialize();
    });

    it('debería obtener estadísticas del sistema', async () => {
      const stats = await assetsSystem.getStats();
      
      expect(stats).toBeDefined();
      expect(stats.totalAssets).toBeDefined();
      expect(stats.totalSize).toBeDefined();
      expect(stats.averageOptimization).toBeDefined();
    });
  });

  describe('Gestión de metadatos', () => {
    beforeEach(async () => {
      await assetsSystem.initialize();
    });

    it('debería actualizar metadatos de asset', async () => {
      const assetId = 'test-asset-123';
      const metadata = {
        id: assetId,
        name: 'Test Asset',
        type: AssetType.MODEL_3D,
        category: AssetCategory.CHARACTER,
        size: 1024,
        url: 'https://example.com/test.glb',
        hash: 'test-hash',
        createdAt: new Date(),
        updatedAt: new Date()
      };

      await expect(
        assetsSystem.updateAssetMetadata(assetId, metadata)
      ).resolves.not.toThrow();
    });
  });

  describe('Limpieza del sistema', () => {
    it('debería limpiar recursos correctamente', async () => {
      await assetsSystem.initialize();
      await expect(assetsSystem.cleanup()).resolves.not.toThrow();
    });
  });
}); 
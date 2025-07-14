/**
 * @jest-environment node
 */

/**
 * Enterprise Material Service Tests
 * 
 * Comprehensive test suite for material system including
 * material creation, shader compilation, node graphs, and texture loading.
 */
import { MaterialService } from '../materials/MaterialService';
import { EventEmitter } from '../events/EventEmitter';
import { Logger } from '../logging/Logger';
import { 
  Material, 
  MaterialType, 
  MaterialProperties, 
  Shader, 
  Texture,
  MaterialNodeGraph,
  MaterialNode,
  NodeType
} from '../materials/MaterialService';

describe('Material Service', () => {
  let materialService: MaterialService;
  let eventEmitter: EventEmitter<any>;
  let logger: Logger;

  beforeEach(() => {
    eventEmitter = new EventEmitter();
    logger = new Logger('MaterialService');
    materialService = new MaterialService(eventEmitter, logger);
  });

  afterEach(() => {
    materialService.clearCache();
  });

  describe('Material Creation', () => {
    it('should create PBR material', async () => {
      const properties: MaterialProperties = {
        baseColor: { r: 1, g: 0, b: 0 },
        metallic: 0.5,
        roughness: 0.3,
        emissive: { r: 0.1, g: 0.1, b: 0.1 },
        emissiveIntensity: 1.0
      };

      const material = await materialService.createMaterial('pbr', properties, 'TestPBR');
      
      expect(material.type).toBe('pbr');
      expect(material.name).toBe('TestPBR');
      expect(material.properties.baseColor).toEqual(properties.baseColor);
      expect(material.properties.metallic).toBe(0.5);
      expect(material.properties.roughness).toBe(0.3);
      expect(material.shader).toBeDefined();
      expect(material.textures).toHaveLength(0);
      expect(material.metadata.version).toBe(1);
    });

    it('should create unlit material', async () => {
      const material = await materialService.createMaterial('unlit', {
        baseColor: { r: 0, g: 1, b: 0 }
      });
      
      expect(material.type).toBe('unlit');
      expect(material.properties.baseColor).toEqual({ r: 0, g: 1, b: 0 });
    });

    it('should create phong material', async () => {
      const material = await materialService.createMaterial('phong', {
        baseColor: { r: 0, g: 0, b: 1 }
      });
      
      expect(material.type).toBe('phong');
      expect(material.properties.baseColor).toEqual({ r: 0, g: 0, b: 1 });
    });

    it('should create toon material', async () => {
      const material = await materialService.createMaterial('toon', {
        baseColor: { r: 1, g: 1, b: 0 }
      });
      
      expect(material.type).toBe('toon');
      expect(material.properties.baseColor).toEqual({ r: 1, g: 1, b: 0 });
    });

    it('should create glass material', async () => {
      const material = await materialService.createMaterial('glass', {
        baseColor: { r: 1, g: 1, b: 1, a: 0.5 },
        alpha: 0.5
      });
      
      expect(material.type).toBe('glass');
      expect(material.properties.alpha).toBe(0.5);
    });

    it('should create hair material', async () => {
      const material = await materialService.createMaterial('hair', {
        baseColor: { r: 0.8, g: 0.6, b: 0.4 }
      });
      
      expect(material.type).toBe('hair');
      expect(material.properties.baseColor).toEqual({ r: 0.8, g: 0.6, b: 0.4 });
    });

    it('should generate default material name', async () => {
      const material = await materialService.createMaterial('pbr');
      
      expect(material.name).toMatch(/^pbr_/);
    });

    it('should cache materials', async () => {
      const material1 = await materialService.createMaterial('pbr', { baseColor: { r: 1, g: 0, b: 0 } });
      const material2 = await materialService.createMaterial('pbr', { baseColor: { r: 1, g: 0, b: 0 } });
      
      expect(material1.id).toBe(material2.id);
      
      const stats = materialService.getCacheStats();
      expect(stats.materialCount).toBe(1);
    });
  });

  describe('Shader Compilation', () => {
    it('should compile PBR shader', async () => {
      const shader = await materialService.createShader('pbr', {
        baseColor: { r: 1, g: 0, b: 0 },
        metallic: 0.5,
        roughness: 0.3
      });
      
      expect(shader.vertexSource).toBeDefined();
      expect(shader.fragmentSource).toBeDefined();
      expect(shader.uniforms).toHaveLength(6); // baseColor, metallic, roughness, emissive, emissiveIntensity, alpha
      expect(shader.attributes).toHaveLength(3); // position, normal, uv
      expect(shader.compiled).toBe(true);
      expect(shader.metadata.compilationTime).toBeGreaterThan(0);
    });

    it('should cache compiled shaders', async () => {
      const properties = { baseColor: { r: 1, g: 0, b: 0 } };
      
      const shader1 = await materialService.createShader('pbr', properties);
      const shader2 = await materialService.createShader('pbr', properties);
      
      expect(shader1.id).toBe(shader2.id);
      
      const stats = materialService.getCacheStats();
      expect(stats.shaderCount).toBe(1);
    });

    it('should handle shader compilation errors', async () => {
      // This would test actual shader compilation errors
      // For now, we'll test the structure
      const shader = await materialService.createShader('pbr', {});
      
      expect(shader.metadata.errorCount).toBe(0);
      expect(shader.metadata.warningCount).toBe(0);
    });
  });

  describe('Node Graph System', () => {
    it('should create node graph', () => {
      const graph = materialService.createNodeGraph();
      
      expect(graph.id).toBeDefined();
      expect(graph.nodes).toHaveLength(0);
      expect(graph.connections).toHaveLength(0);
      expect(graph.metadata.nodeCount).toBe(0);
      expect(graph.metadata.connectionCount).toBe(0);
      expect(graph.metadata.compilationStatus).toBe('pending');
    });

    it('should add nodes to graph', () => {
      const graph = materialService.createNodeGraph();
      
      const textureNode = materialService.addNode(graph, 'texture', { x: 100, y: 100 }, {
        path: 'textures/diffuse.jpg'
      });
      
      const colorNode = materialService.addNode(graph, 'color', { x: 200, y: 100 }, {
        value: { r: 1, g: 1, b: 1 }
      });
      
      expect(graph.nodes).toHaveLength(2);
      expect(graph.metadata.nodeCount).toBe(2);
      expect(textureNode.type).toBe('texture');
      expect(colorNode.type).toBe('color');
      expect(textureNode.inputs).toHaveLength(1);
      expect(textureNode.outputs).toHaveLength(2);
      expect(colorNode.inputs).toHaveLength(1);
      expect(colorNode.outputs).toHaveLength(1);
    });

    it('should connect nodes', () => {
      const graph = materialService.createNodeGraph();
      
      const textureNode = materialService.addNode(graph, 'texture', { x: 100, y: 100 });
      const colorNode = materialService.addNode(graph, 'color', { x: 200, y: 100 });
      
      const connection = materialService.connectNodes(
        graph,
        textureNode.id,
        'color',
        colorNode.id,
        'value'
      );
      
      expect(graph.connections).toHaveLength(1);
      expect(graph.metadata.connectionCount).toBe(1);
      expect(connection.fromNode).toBe(textureNode.id);
      expect(connection.toNode).toBe(colorNode.id);
      expect(connection.fromOutput).toBe('color');
      expect(connection.toInput).toBe('value');
      
      // Check that input is marked as connected
      const input = colorNode.inputs.find(i => i.name === 'value');
      expect(input?.connected).toBe(true);
    });

    it('should compile node graph to shader', async () => {
      const graph = materialService.createNodeGraph();
      
      const textureNode = materialService.addNode(graph, 'texture', { x: 100, y: 100 });
      const outputNode = materialService.addNode(graph, 'output', { x: 300, y: 100 });
      
      materialService.connectNodes(graph, textureNode.id, 'color', outputNode.id, 'baseColor');
      
      const shader = await materialService.compileNodeGraph(graph);
      
      expect(shader).toBeDefined();
      expect(graph.metadata.compilationStatus).toBe('success');
      expect(graph.metadata.lastCompiled).toBeGreaterThan(0);
    });

    it('should handle node graph compilation errors', async () => {
      const graph = materialService.createNodeGraph();
      
      // Create invalid connection
      const textureNode = materialService.addNode(graph, 'texture', { x: 100, y: 100 });
      const colorNode = materialService.addNode(graph, 'color', { x: 200, y: 100 });
      
      // Connect incompatible types
      materialService.connectNodes(graph, textureNode.id, 'color', colorNode.id, 'value');
      
      const shader = await materialService.compileNodeGraph(graph);
      
      // Should handle compilation gracefully
      expect(shader).toBeDefined();
    });
  });

  describe('Texture Loading', () => {
    it('should load texture', async () => {
      const texture = await materialService.loadTexture('textures/diffuse.jpg', {
        type: 'diffuse',
        filtering: 'linear',
        wrapping: 'repeat'
      });
      
      expect(texture.id).toBeDefined();
      expect(texture.name).toBe('diffuse.jpg');
      expect(texture.type).toBe('diffuse');
      expect(texture.url).toBe('textures/diffuse.jpg');
      expect(texture.filtering).toBe('linear');
      expect(texture.wrapping).toBe('repeat');
    });

    it('should cache loaded textures', async () => {
      const texture1 = await materialService.loadTexture('textures/diffuse.jpg');
      const texture2 = await materialService.loadTexture('textures/diffuse.jpg');
      
      expect(texture1.id).toBe(texture2.id);
      
      const stats = materialService.getCacheStats();
      expect(stats.textureCount).toBe(1);
    });

    it('should handle texture loading errors', async () => {
      // This would test actual texture loading errors
      // For now, we'll test the structure
      const texture = await materialService.loadTexture('invalid/path.jpg');
      
      expect(texture).toBeDefined();
      expect(texture.metadata.fileSize).toBe(0);
    });
  });

  describe('Material Updates', () => {
    it('should update material properties', async () => {
      const material = await materialService.createMaterial('pbr', {
        baseColor: { r: 1, g: 0, b: 0 }
      });
      
      const originalVersion = material.metadata.version;
      
      await materialService.updateMaterial(material, {
        baseColor: { r: 0, g: 1, b: 0 },
        metallic: 0.8
      });
      
      expect(material.properties.baseColor).toEqual({ r: 0, g: 1, b: 0 });
      expect(material.properties.metallic).toBe(0.8);
      expect(material.metadata.version).toBe(originalVersion + 1);
      expect(material.metadata.updatedAt).toBeGreaterThan(material.metadata.createdAt);
    });

    it('should recompile shader when needed', async () => {
      const material = await materialService.createMaterial('pbr', {
        baseColor: { r: 1, g: 0, b: 0 }
      });
      
      const originalShaderId = material.shader.id;
      
      await materialService.updateMaterial(material, {
        baseColor: { r: 0, g: 1, b: 0 }
      });
      
      // Shader should be recompiled with new properties
      expect(material.shader.id).not.toBe(originalShaderId);
    });
  });

  describe('Material Management', () => {
    it('should get material by ID', async () => {
      const material = await materialService.createMaterial('pbr');
      const retrieved = materialService.getMaterial(material.id);
      
      expect(retrieved).toBeDefined();
      expect(retrieved?.id).toBe(material.id);
    });

    it('should get all materials', async () => {
      await materialService.createMaterial('pbr');
      await materialService.createMaterial('unlit');
      
      const materials = materialService.getAllMaterials();
      
      expect(materials).toHaveLength(2);
      expect(materials.some(m => m.type === 'pbr')).toBe(true);
      expect(materials.some(m => m.type === 'unlit')).toBe(true);
    });

    it('should delete material', async () => {
      const material = await materialService.createMaterial('pbr');
      
      materialService.deleteMaterial(material.id);
      
      const retrieved = materialService.getMaterial(material.id);
      expect(retrieved).toBeUndefined();
    });

    it('should clear cache', () => {
      materialService.clearCache();
      
      const stats = materialService.getCacheStats();
      expect(stats.materialCount).toBe(0);
      expect(stats.shaderCount).toBe(0);
      expect(stats.textureCount).toBe(0);
      expect(stats.nodeGraphCount).toBe(0);
    });

    it('should provide cache statistics', async () => {
      await materialService.createMaterial('pbr');
      await materialService.createShader('pbr', {});
      await materialService.loadTexture('textures/diffuse.jpg');
      materialService.createNodeGraph();
      
      const stats = materialService.getCacheStats();
      
      expect(stats.materialCount).toBe(1);
      expect(stats.shaderCount).toBe(1);
      expect(stats.textureCount).toBe(1);
      expect(stats.nodeGraphCount).toBe(1);
    });
  });

  describe('Event System Integration', () => {
    it('should emit material created event', (done: jest.DoneCallback) => {
      eventEmitter.on('material:created', (data: any) => {
        expect(data.material.type).toBe('pbr');
        expect(data.material.name).toBeDefined();
        done();
      });
      
      materialService.createMaterial('pbr');
    });

    it('should emit material updated event', (done: jest.DoneCallback) => {
      eventEmitter.on('material:updated', (data: any) => {
        expect(data.material).toBeDefined();
        expect(data.properties).toBeDefined();
        done();
      });
      
      materialService.createMaterial('pbr').then(material => {
        materialService.updateMaterial(material, { metallic: 0.5 });
      });
    });

    it('should emit material deleted event', (done: jest.DoneCallback) => {
      eventEmitter.on('material:deleted', (data: any) => {
        expect(data.material).toBeDefined();
        done();
      });
      
      materialService.createMaterial('pbr').then(material => {
        materialService.deleteMaterial(material.id);
      });
    });

    it('should emit shader compiled event', (done: jest.DoneCallback) => {
      eventEmitter.on('shader:compiled', (data: any) => {
        expect(data.shader).toBeDefined();
        expect(data.shader.compiled).toBe(true);
        done();
      });
      
      materialService.createShader('pbr', {});
    });

    it('should emit node graph created event', (done: jest.DoneCallback) => {
      eventEmitter.on('nodegraph:created', (data: any) => {
        expect(data.nodeGraph).toBeDefined();
        expect(data.nodeGraph.nodes).toHaveLength(0);
        done();
      });
      
      materialService.createNodeGraph();
    });

    it('should emit node added event', (done: jest.DoneCallback) => {
      eventEmitter.on('node:added', (data: any) => {
        expect(data.graph).toBeDefined();
        expect(data.node).toBeDefined();
        expect(data.node.type).toBe('texture');
        done();
      });
      
      const graph = materialService.createNodeGraph();
      materialService.addNode(graph, 'texture', { x: 100, y: 100 });
    });

    it('should emit node connected event', (done: jest.DoneCallback) => {
      eventEmitter.on('node:connected', (data: any) => {
        expect(data.graph).toBeDefined();
        expect(data.connection).toBeDefined();
        done();
      });
      
      const graph = materialService.createNodeGraph();
      const node1 = materialService.addNode(graph, 'texture', { x: 100, y: 100 });
      const node2 = materialService.addNode(graph, 'color', { x: 200, y: 100 });
      materialService.connectNodes(graph, node1.id, 'color', node2.id, 'value');
    });

    it('should emit node graph compiled event', (done: jest.DoneCallback) => {
      eventEmitter.on('nodegraph:compiled', (data: any) => {
        expect(data.graph).toBeDefined();
        expect(data.shader).toBeDefined();
        expect(data.compilationTime).toBeGreaterThan(0);
        done();
      });
      
      const graph = materialService.createNodeGraph();
      materialService.compileNodeGraph(graph);
    });

    it('should emit texture loaded event', (done: jest.DoneCallback) => {
      eventEmitter.on('texture:loaded', (data: any) => {
        expect(data.texture).toBeDefined();
        expect(data.texture.url).toBe('textures/diffuse.jpg');
        done();
      });
      
      materialService.loadTexture('textures/diffuse.jpg');
    });

    it('should emit cache cleared event', (done: jest.DoneCallback) => {
      eventEmitter.on('material:cache-cleared', () => {
        done();
      });
      
      materialService.clearCache();
    });
  });

  describe('Performance and Memory', () => {
    it('should handle multiple materials efficiently', async () => {
      const startTime = performance.now();
      
      const promises = [];
      for (let i = 0; i < 10; i++) {
        promises.push(materialService.createMaterial('pbr', {
          baseColor: { r: Math.random(), g: Math.random(), b: Math.random() }
        }));
      }
      
      await Promise.all(promises);
      
      const endTime = performance.now();
      expect(endTime - startTime).toBeLessThan(1000); // Should complete within 1 second
    });

    it('should reuse cached shaders', async () => {
      const properties = { baseColor: { r: 1, g: 0, b: 0 } };
      
      const startTime = performance.now();
      await materialService.createShader('pbr', properties);
      const firstTime = performance.now() - startTime;
      
      const startTime2 = performance.now();
      await materialService.createShader('pbr', properties);
      const secondTime = performance.now() - startTime2;
      
      // Second call should be faster due to caching
      expect(secondTime).toBeLessThan(firstTime);
    });
  });

  describe('Error Handling', () => {
    it('should handle invalid material types', async () => {
      await expect(
        materialService.createMaterial('invalid' as MaterialType)
      ).rejects.toThrow();
    });

    it('should handle invalid node types', () => {
      const graph = materialService.createNodeGraph();
      
      expect(() => {
        materialService.addNode(graph, 'invalid' as NodeType, { x: 100, y: 100 });
      }).toThrow();
    });

    it('should handle invalid texture URLs', async () => {
      const texture = await materialService.loadTexture('');
      
      expect(texture).toBeDefined();
      expect(texture.name).toBe('');
    });
  });
}); 
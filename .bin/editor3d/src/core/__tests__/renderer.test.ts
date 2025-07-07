import { Material, MaterialType, BlendMode } from '../renderer/Material';
import { Geometry } from '../renderer/Geometry';
import { Camera } from '../renderer/Camera';
import { Renderer } from '../renderer/Renderer';
import { Vector3 } from '../scene/math/Vector3';
import { Matrix4 } from '../scene/math/Matrix4';

// Mock WebGL context
const createMockWebGLContext = () => {
  const mockGL = {
    createShader: jest.fn(() => ({})),
    createProgram: jest.fn(() => ({})),
    createBuffer: jest.fn(() => ({})),
    createTexture: jest.fn(() => ({})),
    createVertexArray: jest.fn(() => ({})),
    shaderSource: jest.fn(),
    compileShader: jest.fn(),
    attachShader: jest.fn(),
    linkProgram: jest.fn(),
    useProgram: jest.fn(),
    bindBuffer: jest.fn(),
    bufferData: jest.fn(),
    bindVertexArray: jest.fn(),
    enableVertexAttribArray: jest.fn(),
    vertexAttribPointer: jest.fn(),
    drawArrays: jest.fn(),
    drawElements: jest.fn(),
    clear: jest.fn(),
    viewport: jest.fn(),
    enable: jest.fn(),
    disable: jest.fn(),
    depthMask: jest.fn(),
    frontFace: jest.fn(),
    blendFunc: jest.fn(),
    activeTexture: jest.fn(),
    bindTexture: jest.fn(),
    texImage2D: jest.fn(),
    texParameteri: jest.fn(),
    generateMipmap: jest.fn(),
    uniformMatrix4fv: jest.fn(),
    uniform3f: jest.fn(),
    uniform1f: jest.fn(),
    uniform1i: jest.fn(),
    getShaderParameter: jest.fn(() => true),
    getProgramParameter: jest.fn(() => true),
    getShaderInfoLog: jest.fn(() => ''),
    getProgramInfoLog: jest.fn(() => ''),
    getUniformLocation: jest.fn(() => ({})),
    getAttribLocation: jest.fn(() => 0),
    deleteShader: jest.fn(),
    deleteProgram: jest.fn(),
    deleteBuffer: jest.fn(),
    deleteTexture: jest.fn(),
    deleteVertexArray: jest.fn(),
    
    // WebGL constants
    VERTEX_SHADER: 35633,
    FRAGMENT_SHADER: 35632,
    ARRAY_BUFFER: 34962,
    ELEMENT_ARRAY_BUFFER: 34963,
    STATIC_DRAW: 35044,
    TRIANGLES: 4,
    UNSIGNED_INT: 5125,
    FLOAT: 5126,
    RGBA: 6408,
    UNSIGNED_BYTE: 5121,
    TEXTURE_2D: 3553,
    LINEAR: 9729,
    LINEAR_MIPMAP_LINEAR: 9987,
    REPEAT: 10497,
    CLAMP_TO_EDGE: 33071,
    COMPILE_STATUS: 35713,
    LINK_STATUS: 35714,
    BLEND: 3042,
    DEPTH_TEST: 2929,
    CULL_FACE: 2884,
    SRC_ALPHA: 770,
    ONE_MINUS_SRC_ALPHA: 771,
    ONE: 1,
    DST_COLOR: 774,
    ZERO: 0,
    CCW: 2305,
    CW: 2304,
    TEXTURE0: 33984,
    TEXTURE_WRAP_S: 10242,
    TEXTURE_WRAP_T: 10243,
    TEXTURE_MIN_FILTER: 10241,
    TEXTURE_MAG_FILTER: 10240,
    COLOR_BUFFER_BIT: 16384,
    DEPTH_BUFFER_BIT: 256
  };
  
  return mockGL as unknown as WebGL2RenderingContext;
};

describe('Material', () => {
  let material: Material;
  let mockGL: WebGL2RenderingContext;

  beforeEach(() => {
    material = new Material('test-material', MaterialType.STANDARD);
    mockGL = createMockWebGLContext();
  });

  describe('Constructor', () => {
    it('should create material with correct properties', () => {
      expect(material.name).toBe('test-material');
      expect(material.type).toBe(MaterialType.STANDARD);
      expect(material.visible).toBe(true);
      expect(material.transparent).toBe(false);
      expect(material.depthTest).toBe(true);
      expect(material.depthWrite).toBe(true);
      expect(material.cullFace).toBe(true);
      expect(material.blendMode).toBe(BlendMode.NORMAL);
    });

    it('should initialize PBR properties correctly', () => {
      expect(material.pbr.albedo).toEqual(new Vector3(1, 1, 1));
      expect(material.pbr.metallic).toBe(0.0);
      expect(material.pbr.roughness).toBe(0.5);
      expect(material.pbr.ao).toBe(1.0);
      expect(material.pbr.emissive).toEqual(new Vector3(0, 0, 0));
    });

    it('should initialize shaders based on type', () => {
      expect(material.vertexShader).toBeTruthy();
      expect(material.fragmentShader).toBeTruthy();
      expect(material.vertexShader).toContain('#version 300 es');
      expect(material.fragmentShader).toContain('#version 300 es');
    });
  });

  describe('Property Management', () => {
    it('should set and get properties correctly', () => {
      material.setProperty('u_color', new Vector3(1, 0, 0));
      expect(material.getProperty('u_color')).toEqual(new Vector3(1, 0, 0));
    });

    it('should emit property changed event', () => {
      const mockEmit = jest.spyOn(material, 'emit');
      material.setProperty('u_opacity', 0.5);
      expect(mockEmit).toHaveBeenCalledWith('propertyChanged', { name: 'u_opacity', value: 0.5 });
    });
  });

  describe('Compilation', () => {
    it('should compile material successfully', () => {
      const result = material.compile(mockGL);
      expect(result).toBe(true);
      expect(mockGL.createShader).toHaveBeenCalledWith(mockGL.VERTEX_SHADER);
      expect(mockGL.createShader).toHaveBeenCalledWith(mockGL.FRAGMENT_SHADER);
      expect(mockGL.createProgram).toHaveBeenCalled();
      expect(mockGL.attachShader).toHaveBeenCalledTimes(2);
      expect(mockGL.linkProgram).toHaveBeenCalled();
    });

    it('should handle compilation errors gracefully', () => {
      mockGL.getShaderParameter = jest.fn(() => false);
      mockGL.getShaderInfoLog = jest.fn(() => 'Compilation error');
      
      const result = material.compile(mockGL);
      expect(result).toBe(false);
    });
  });

  describe('Binding', () => {
    it('should bind material to WebGL context', () => {
      material.compile(mockGL);
      const result = material.bind(mockGL);
      
      expect(result).toBe(true);
      expect(mockGL.useProgram).toHaveBeenCalled();
    });

    it('should configure blending for transparent materials', () => {
      material.transparent = true;
      material.compile(mockGL);
      material.bind(mockGL);
      
      expect(mockGL.enable).toHaveBeenCalledWith(mockGL.BLEND);
      expect(mockGL.blendFunc).toHaveBeenCalledWith(mockGL.SRC_ALPHA, mockGL.ONE_MINUS_SRC_ALPHA);
    });

    it('should configure depth testing', () => {
      material.depthTest = false;
      material.compile(mockGL);
      material.bind(mockGL);
      
      expect(mockGL.disable).toHaveBeenCalledWith(mockGL.DEPTH_TEST);
    });
  });

  describe('Texture Management', () => {
    it('should create texture from URL', async () => {
      const config = { url: 'test.jpg' };
      
      // Mock Image constructor
      global.Image = jest.fn(() => ({
        onload: null,
        onerror: null,
        crossOrigin: '',
        src: ''
      })) as any;
      
      await expect(material.createTexture(mockGL, 'test', config)).resolves.not.toThrow();
      expect(mockGL.createTexture).toHaveBeenCalled();
    });

    it('should handle texture creation errors', async () => {
      const config = { url: 'invalid.jpg' };
      
      global.Image = jest.fn(() => ({
        onload: null,
        onerror: null,
        crossOrigin: '',
        src: ''
      })) as any;
      
      // Simulate error
      setTimeout(() => {
        const img = (global.Image as any).mock.results[0].value;
        img.onerror();
      }, 0);
      
      await expect(material.createTexture(mockGL, 'test', config)).rejects.toThrow();
    });
  });

  describe('Cloning', () => {
    it('should clone material correctly', () => {
      material.setProperty('u_color', new Vector3(1, 0, 0));
      material.pbr.metallic = 0.8;
      
      const cloned = material.clone();
      
      expect(cloned.name).toBe(material.name);
      expect(cloned.type).toBe(material.type);
      expect(cloned.getProperty('u_color')).toEqual(new Vector3(1, 0, 0));
      expect(cloned.pbr.metallic).toBe(0.8);
      expect(cloned).not.toBe(material);
    });
  });

  describe('Serialization', () => {
    it('should serialize material correctly', () => {
      const serialized = material.serialize();
      
      expect(serialized.name).toBe('test-material');
      expect(serialized.type).toBe(MaterialType.STANDARD);
      expect(serialized.visible).toBe(true);
      expect(serialized.pbr).toBeDefined();
      expect(serialized.vertexShader).toBeDefined();
      expect(serialized.fragmentShader).toBeDefined();
    });

    it('should deserialize material correctly', () => {
      const serialized = material.serialize();
      const deserialized = Material.deserialize(serialized);
      
      expect(deserialized.name).toBe(material.name);
      expect(deserialized.type).toBe(material.type);
      expect(deserialized.visible).toBe(material.visible);
      expect(deserialized.pbr.albedo).toEqual(material.pbr.albedo);
    });
  });

  describe('Disposal', () => {
    it('should dispose material resources', () => {
      material.compile(mockGL);
      material.dispose(mockGL);
      
      expect(mockGL.deleteProgram).toHaveBeenCalled();
      expect(material._compiled).toBe(false);
    });
  });
});

describe('Geometry', () => {
  let geometry: Geometry;
  let mockGL: WebGL2RenderingContext;

  beforeEach(() => {
    geometry = new Geometry('test-geometry');
    mockGL = createMockWebGLContext();
  });

  describe('Constructor', () => {
    it('should create geometry with correct properties', () => {
      expect(geometry.name).toBe('test-geometry');
      expect(geometry.vertices).toEqual([]);
      expect(geometry.indices).toEqual([]);
      expect(geometry.normals).toEqual([]);
      expect(geometry.uvs).toEqual([]);
      expect(geometry.tangents).toEqual([]);
    });
  });

  describe('Vertex Management', () => {
    it('should add vertices correctly', () => {
      const vertices = [
        new Vector3(0, 0, 0),
        new Vector3(1, 0, 0),
        new Vector3(0, 1, 0)
      ];
      
      geometry.setVertices(vertices);
      expect(geometry.vertices).toEqual(vertices);
      expect(geometry.vertexCount).toBe(3);
    });

    it('should add indices correctly', () => {
      const indices = [0, 1, 2];
      geometry.setIndices(indices);
      expect(geometry.indices).toEqual(indices);
      expect(geometry.indexCount).toBe(3);
    });

    it('should calculate normals automatically', () => {
      const vertices = [
        new Vector3(0, 0, 0),
        new Vector3(1, 0, 0),
        new Vector3(0, 1, 0)
      ];
      
      geometry.setVertices(vertices);
      geometry.calculateNormals();
      
      expect(geometry.normals.length).toBe(3);
      expect(geometry.normals[0]).toBeInstanceOf(Vector3);
    });
  });

  describe('Buffer Management', () => {
    it('should create buffers successfully', () => {
      const vertices = [new Vector3(0, 0, 0), new Vector3(1, 0, 0)];
      geometry.setVertices(vertices);
      
      geometry.createBuffers(mockGL);
      
      expect(mockGL.createBuffer).toHaveBeenCalled();
      expect(mockGL.bindBuffer).toHaveBeenCalled();
      expect(mockGL.bufferData).toHaveBeenCalled();
    });

    it('should bind geometry for rendering', () => {
      geometry.createBuffers(mockGL);
      geometry.bind(mockGL);
      
      expect(mockGL.bindVertexArray).toHaveBeenCalled();
      expect(mockGL.enableVertexAttribArray).toHaveBeenCalled();
      expect(mockGL.vertexAttribPointer).toHaveBeenCalled();
    });
  });

  describe('Rendering', () => {
    it('should render geometry correctly', () => {
      const vertices = [new Vector3(0, 0, 0), new Vector3(1, 0, 0), new Vector3(0, 1, 0)];
      const indices = [0, 1, 2];
      
      geometry.setVertices(vertices);
      geometry.setIndices(indices);
      geometry.createBuffers(mockGL);
      
      geometry.render(mockGL);
      
      expect(mockGL.drawElements).toHaveBeenCalledWith(
        mockGL.TRIANGLES,
        3,
        mockGL.UNSIGNED_INT,
        0
      );
    });

    it('should render without indices', () => {
      const vertices = [new Vector3(0, 0, 0), new Vector3(1, 0, 0), new Vector3(0, 1, 0)];
      geometry.setVertices(vertices);
      geometry.createBuffers(mockGL);
      
      geometry.render(mockGL);
      
      expect(mockGL.drawArrays).toHaveBeenCalledWith(mockGL.TRIANGLES, 0, 3);
    });
  });

  describe('Bounding Volume', () => {
    it('should calculate bounding box', () => {
      const vertices = [
        new Vector3(0, 0, 0),
        new Vector3(1, 1, 1),
        new Vector3(-1, -1, -1)
      ];
      
      geometry.setVertices(vertices);
      const boundingBox = geometry.getBoundingBox();
      
      expect(boundingBox.min).toEqual(new Vector3(-1, -1, -1));
      expect(boundingBox.max).toEqual(new Vector3(1, 1, 1));
    });

    it('should calculate bounding sphere', () => {
      const vertices = [
        new Vector3(0, 0, 0),
        new Vector3(1, 0, 0),
        new Vector3(0, 1, 0)
      ];
      
      geometry.setVertices(vertices);
      const boundingSphere = geometry.getBoundingSphere();
      
      expect(boundingSphere.center).toBeInstanceOf(Vector3);
      expect(boundingSphere.radius).toBeGreaterThan(0);
    });
  });

  describe('Cloning', () => {
    it('should clone geometry correctly', () => {
      const vertices = [new Vector3(0, 0, 0), new Vector3(1, 0, 0)];
      const indices = [0, 1];
      
      geometry.setVertices(vertices);
      geometry.setIndices(indices);
      
      const cloned = geometry.clone();
      
      expect(cloned.name).toBe(geometry.name);
      expect(cloned.vertices).toEqual(geometry.vertices);
      expect(cloned.indices).toEqual(geometry.indices);
      expect(cloned).not.toBe(geometry);
    });
  });

  describe('Serialization', () => {
    it('should serialize geometry correctly', () => {
      const vertices = [new Vector3(0, 0, 0), new Vector3(1, 0, 0)];
      geometry.setVertices(vertices);
      
      const serialized = geometry.serialize();
      
      expect(serialized.name).toBe('test-geometry');
      expect(serialized.vertices).toBeDefined();
      expect(serialized.vertexCount).toBe(2);
    });

    it('should deserialize geometry correctly', () => {
      const vertices = [new Vector3(0, 0, 0), new Vector3(1, 0, 0)];
      geometry.setVertices(vertices);
      
      const serialized = geometry.serialize();
      const deserialized = Geometry.deserialize(serialized);
      
      expect(deserialized.name).toBe(geometry.name);
      expect(deserialized.vertexCount).toBe(geometry.vertexCount);
    });
  });
});

describe('Camera', () => {
  let camera: Camera;

  beforeEach(() => {
    camera = new Camera('test-camera');
  });

  describe('Constructor', () => {
    it('should create camera with correct properties', () => {
      expect(camera.name).toBe('test-camera');
      expect(camera.position).toEqual(new Vector3(0, 0, 0));
      expect(camera.rotation).toEqual(new Vector3(0, 0, 0));
      expect(camera.fov).toBe(75);
      expect(camera.aspect).toBe(16 / 9);
      expect(camera.near).toBe(0.1);
      expect(camera.far).toBe(1000);
    });
  });

  describe('Transformations', () => {
    it('should update view matrix when position changes', () => {
      camera.position = new Vector3(0, 0, 5);
      camera.updateViewMatrix();
      
      expect(camera.viewMatrix).toBeInstanceOf(Matrix4);
    });

    it('should update projection matrix when properties change', () => {
      camera.fov = 90;
      camera.aspect = 1;
      camera.updateProjectionMatrix();
      
      expect(camera.projectionMatrix).toBeInstanceOf(Matrix4);
    });
  });

  describe('Camera Controls', () => {
    it('should handle orbit controls', () => {
      camera.orbit(0.1, 0.1);
      
      expect(camera.rotation.x).not.toBe(0);
      expect(camera.rotation.y).not.toBe(0);
    });

    it('should handle pan controls', () => {
      const initialPosition = camera.position.clone();
      camera.pan(1, 1);
      
      expect(camera.position).not.toEqual(initialPosition);
    });

    it('should handle zoom controls', () => {
      const initialPosition = camera.position.clone();
      camera.zoom(0.5);
      
      expect(camera.position).not.toEqual(initialPosition);
    });
  });

  describe('Frustum Culling', () => {
    it('should create frustum planes', () => {
      camera.updateViewMatrix();
      camera.updateProjectionMatrix();
      camera.updateFrustum();
      
      expect(camera.frustum.planes.length).toBe(6);
    });

    it('should test point visibility', () => {
      camera.position = new Vector3(0, 0, 5);
      camera.updateViewMatrix();
      camera.updateProjectionMatrix();
      camera.updateFrustum();
      
      const pointInFront = new Vector3(0, 0, 0);
      const pointBehind = new Vector3(0, 0, 10);
      
      expect(camera.frustum.containsPoint(pointInFront)).toBe(true);
      expect(camera.frustum.containsPoint(pointBehind)).toBe(false);
    });
  });

  describe('Serialization', () => {
    it('should serialize camera correctly', () => {
      const serialized = camera.serialize();
      
      expect(serialized.name).toBe('test-camera');
      expect(serialized.position).toBeDefined();
      expect(serialized.rotation).toBeDefined();
      expect(serialized.fov).toBe(75);
    });

    it('should deserialize camera correctly', () => {
      const serialized = camera.serialize();
      const deserialized = Camera.deserialize(serialized);
      
      expect(deserialized.name).toBe(camera.name);
      expect(deserialized.position).toEqual(camera.position);
      expect(deserialized.fov).toBe(camera.fov);
    });
  });
});

describe('Renderer', () => {
  let renderer: Renderer;
  let mockGL: WebGL2RenderingContext;
  let mockCanvas: HTMLCanvasElement;

  beforeEach(() => {
    mockGL = createMockWebGLContext();
    mockCanvas = {
      getContext: jest.fn(() => mockGL),
      width: 800,
      height: 600
    } as any;
    
    renderer = new Renderer(mockCanvas);
  });

  describe('Constructor', () => {
    it('should create renderer with correct properties', () => {
      expect(renderer.gl).toBe(mockGL);
      expect(renderer.canvas).toBe(mockCanvas);
      expect(renderer.width).toBe(800);
      expect(renderer.height).toBe(600);
    });
  });

  describe('Rendering', () => {
    it('should clear screen correctly', () => {
      renderer.clear();
      
      expect(mockGL.clear).toHaveBeenCalledWith(
        mockGL.COLOR_BUFFER_BIT | mockGL.DEPTH_BUFFER_BIT
      );
      expect(mockGL.viewport).toHaveBeenCalledWith(0, 0, 800, 600);
    });

    it('should render scene with camera', () => {
      const camera = new Camera('test-camera');
      const material = new Material('test-material');
      const geometry = new Geometry('test-geometry');
      
      geometry.setVertices([new Vector3(0, 0, 0), new Vector3(1, 0, 0), new Vector3(0, 1, 0)]);
      geometry.createBuffers(mockGL);
      
      renderer.render(camera, [geometry], [material]);
      
      expect(mockGL.useProgram).toHaveBeenCalled();
      expect(mockGL.bindVertexArray).toHaveBeenCalled();
      expect(mockGL.drawArrays).toHaveBeenCalled();
    });
  });

  describe('Resize', () => {
    it('should handle canvas resize', () => {
      mockCanvas.width = 1024;
      mockCanvas.height = 768;
      
      renderer.resize();
      
      expect(renderer.width).toBe(1024);
      expect(renderer.height).toBe(768);
      expect(mockGL.viewport).toHaveBeenCalledWith(0, 0, 1024, 768);
    });
  });

  describe('Disposal', () => {
    it('should dispose renderer resources', () => {
      renderer.dispose();
      
      // Should clean up any created resources
      expect(renderer.gl).toBeNull();
    });
  });
}); 
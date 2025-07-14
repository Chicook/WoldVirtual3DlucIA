import { LightManager, LightingConfig } from '../lighting/LightManager';
import { DirectionalLight } from '../lighting/DirectionalLight';
import { PointLight } from '../lighting/PointLight';
import { SpotLight } from '../lighting/SpotLight';
import { AreaLight } from '../lighting/AreaLight';
import { AmbientLight } from '../lighting/AmbientLight';
import { LightType } from '../lighting/Light';
import { Vector3 } from '../scene/math/Vector3';

// Mock WebGL context
const createMockWebGLContext = () => {
  const mockGL = {
    createTexture: jest.fn(() => ({})),
    createFramebuffer: jest.fn(() => ({})),
    createProgram: jest.fn(() => ({})),
    createShader: jest.fn(() => ({})),
    bindTexture: jest.fn(),
    bindFramebuffer: jest.fn(),
    texImage2D: jest.fn(),
    texParameteri: jest.fn(),
    framebufferTexture2D: jest.fn(),
    checkFramebufferStatus: jest.fn(() => 36053), // FRAMEBUFFER_COMPLETE
    viewport: jest.fn(),
    clear: jest.fn(),
    useProgram: jest.fn(),
    drawArrays: jest.fn(),
    drawElements: jest.fn(),
    uniform1f: jest.fn(),
    uniform1i: jest.fn(),
    uniform3f: jest.fn(),
    uniformMatrix4fv: jest.fn(),
    getUniformLocation: jest.fn(() => ({})),
    getAttribLocation: jest.fn(() => 0),
    enableVertexAttribArray: jest.fn(),
    vertexAttribPointer: jest.fn(),
    deleteTexture: jest.fn(),
    deleteFramebuffer: jest.fn(),
    deleteProgram: jest.fn(),
    deleteShader: jest.fn(),
    shaderSource: jest.fn(),
    compileShader: jest.fn(),
    attachShader: jest.fn(),
    linkProgram: jest.fn(),
    getShaderParameter: jest.fn(() => true),
    getProgramParameter: jest.fn(() => true),
    getShaderInfoLog: jest.fn(() => ''),
    getProgramInfoLog: jest.fn(() => ''),
    
    // WebGL constants
    TEXTURE_2D: 3553,
    RGBA16F: 34842,
    RGBA: 6408,
    FLOAT: 5126,
    DEPTH_COMPONENT24: 33190,
    DEPTH_COMPONENT: 6402,
    UNSIGNED_INT: 5125,
    LINEAR: 9729,
    NEAREST: 9728,
    CLAMP_TO_EDGE: 33071,
    FRAMEBUFFER: 36160,
    COLOR_ATTACHMENT0: 36064,
    DEPTH_ATTACHMENT: 36096,
    FRAMEBUFFER_COMPLETE: 36053,
    DEPTH_BUFFER_BIT: 256,
    COLOR_BUFFER_BIT: 16384,
    TRIANGLES: 4,
    VERTEX_SHADER: 35633,
    FRAGMENT_SHADER: 35632,
    COMPILE_STATUS: 35713,
    LINK_STATUS: 35714
  };
  
  return mockGL as unknown as WebGL2RenderingContext;
};

describe('LightManager', () => {
  let lightManager: LightManager;
  let mockGL: WebGL2RenderingContext;

  beforeEach(() => {
    lightManager = new LightManager();
    mockGL = createMockWebGLContext();
  });

  describe('Constructor', () => {
    it('should create light manager with default configuration', () => {
      expect(lightManager.config.maxLights).toBe(16);
      expect(lightManager.config.enableShadows).toBe(true);
      expect(lightManager.config.shadowQuality).toBe('high');
      expect(lightManager.config.enableGlobalIllumination).toBe(false);
      expect(lightManager.config.ambientIntensity).toBe(0.3);
    });

    it('should initialize with default lighting', () => {
      const lights = lightManager.getLights();
      expect(lights.length).toBeGreaterThan(0);
      
      const ambientLight = lightManager.getAmbientLight();
      expect(ambientLight).toBeInstanceOf(AmbientLight);
      expect(ambientLight?.intensity).toBe(0.3);
    });
  });

  describe('Light Management', () => {
    it('should add lights correctly', () => {
      const directionalLight = new DirectionalLight('test_directional', 'Test Directional');
      lightManager.addLight(directionalLight);
      
      expect(lightManager.getLights().length).toBe(2); // Default + new
      expect(lightManager.getLight('test_directional')).toBe(directionalLight);
    });

    it('should remove lights correctly', () => {
      const directionalLight = new DirectionalLight('test_directional', 'Test Directional');
      lightManager.addLight(directionalLight);
      
      const result = lightManager.removeLight('test_directional');
      expect(result).toBe(true);
      expect(lightManager.getLight('test_directional')).toBeUndefined();
    });

    it('should respect maximum light limit', () => {
      lightManager.setConfig({ maxLights: 2 });
      
      const light1 = new DirectionalLight('light1', 'Light 1');
      const light2 = new DirectionalLight('light2', 'Light 2');
      const light3 = new DirectionalLight('light3', 'Light 3');
      
      lightManager.addLight(light1);
      lightManager.addLight(light2);
      lightManager.addLight(light3); // Should not be added
      
      expect(lightManager.getLights().length).toBe(2);
    });
  });

  describe('Light Creation', () => {
    it('should create directional light', () => {
      const light = lightManager.createDirectionalLight('test', 'Test Light');
      
      expect(light).toBeInstanceOf(DirectionalLight);
      expect(light.type).toBe(LightType.DIRECTIONAL);
      expect(lightManager.getLight('test')).toBe(light);
    });

    it('should create point light', () => {
      const light = lightManager.createPointLight('test', 'Test Light');
      
      expect(light).toBeInstanceOf(PointLight);
      expect(light.type).toBe(LightType.POINT);
      expect(lightManager.getLight('test')).toBe(light);
    });

    it('should create spot light', () => {
      const light = lightManager.createSpotLight('test', 'Test Light');
      
      expect(light).toBeInstanceOf(SpotLight);
      expect(light.type).toBe(LightType.SPOT);
      expect(lightManager.getLight('test')).toBe(light);
    });

    it('should create area light', () => {
      const light = lightManager.createAreaLight('test', 'Test Light');
      
      expect(light).toBeInstanceOf(AreaLight);
      expect(light.type).toBe(LightType.AREA);
      expect(lightManager.getLight('test')).toBe(light);
    });

    it('should create ambient light', () => {
      const light = lightManager.createAmbientLight('test', 'Test Light');
      
      expect(light).toBeInstanceOf(AmbientLight);
      expect(light.type).toBe(LightType.AMBIENT);
      expect(lightManager.getAmbientLight()).toBe(light);
    });
  });

  describe('Light Filtering', () => {
    beforeEach(() => {
      lightManager.createDirectionalLight('directional1', 'Directional 1');
      lightManager.createPointLight('point1', 'Point 1');
      lightManager.createSpotLight('spot1', 'Spot 1');
      lightManager.createAreaLight('area1', 'Area 1');
    });

    it('should filter lights by type', () => {
      const directionalLights = lightManager.getLightsByType(LightType.DIRECTIONAL);
      const pointLights = lightManager.getLightsByType(LightType.POINT);
      const spotLights = lightManager.getLightsByType(LightType.SPOT);
      const areaLights = lightManager.getLightsByType(LightType.AREA);
      
      expect(directionalLights.length).toBeGreaterThan(0);
      expect(pointLights.length).toBe(1);
      expect(spotLights.length).toBe(1);
      expect(areaLights.length).toBe(1);
    });

    it('should filter shadow casting lights', () => {
      const directionalLight = lightManager.getLight('directional1');
      directionalLight?.setCastShadows(true);
      
      const shadowLights = lightManager.getShadowCastingLights();
      expect(shadowLights.length).toBeGreaterThan(0);
      expect(shadowLights.some(light => light.id === 'directional1')).toBe(true);
    });
  });

  describe('Light Culling', () => {
    it('should cull lights by distance', () => {
      const cameraPosition = new Vector3(0, 0, 0);
      const pointLight = lightManager.createPointLight('point1', 'Point 1');
      pointLight.setPosition(new Vector3(0, 0, 100)); // Far away
      
      const visibleLights = lightManager.cullLights(cameraPosition, null);
      expect(visibleLights.length).toBeLessThan(lightManager.getLights().length);
    });

    it('should cull shadows by distance', () => {
      const cameraPosition = new Vector3(0, 0, 0);
      const directionalLight = lightManager.createDirectionalLight('directional1', 'Directional 1');
      directionalLight.setCastShadows(true);
      directionalLight.setPosition(new Vector3(0, 0, 1000)); // Far away
      
      const shadowLights = lightManager.cullShadows(cameraPosition, null);
      expect(shadowLights.length).toBeLessThanOrEqual(lightManager.getShadowCastingLights().length);
    });
  });

  describe('Configuration', () => {
    it('should update configuration correctly', () => {
      const newConfig: Partial<LightingConfig> = {
        maxLights: 8,
        enableShadows: false,
        shadowQuality: 'low',
        ambientIntensity: 0.5
      };
      
      lightManager.setConfig(newConfig);
      
      expect(lightManager.config.maxLights).toBe(8);
      expect(lightManager.config.enableShadows).toBe(false);
      expect(lightManager.config.shadowQuality).toBe('low');
      expect(lightManager.config.ambientIntensity).toBe(0.5);
    });

    it('should update ambient light intensity when config changes', () => {
      lightManager.setConfig({ ambientIntensity: 0.8 });
      
      const ambientLight = lightManager.getAmbientLight();
      expect(ambientLight?.intensity).toBe(0.8);
    });
  });

  describe('Lighting Uniforms', () => {
    it('should generate lighting uniforms', () => {
      const uniforms = lightManager.getLightingUniforms();
      
      expect(uniforms['u_lighting_enabled']).toBe(1);
      expect(uniforms['u_lighting_maxLights']).toBe(16);
      expect(uniforms['u_lighting_exposure']).toBe(1.0);
      expect(uniforms['u_lighting_gamma']).toBe(2.2);
    });

    it('should include ambient light uniforms', () => {
      const uniforms = lightManager.getLightingUniforms();
      
      // Should include ambient light uniforms
      expect(Object.keys(uniforms).some(key => key.includes('ambient'))).toBe(true);
    });

    it('should include dynamic light uniforms', () => {
      const pointLight = lightManager.createPointLight('point1', 'Point 1');
      pointLight.setColor(new Vector3(1, 0, 0));
      pointLight.setIntensity(2.0);
      
      const uniforms = lightManager.getLightingUniforms();
      
      // Should include light count
      expect(uniforms['u_lighting_count']).toBeGreaterThan(0);
    });
  });

  describe('Update System', () => {
    it('should update light matrices', () => {
      const directionalLight = lightManager.createDirectionalLight('test', 'Test Light');
      const initialMatrix = directionalLight.viewMatrix.clone();
      
      directionalLight.setPosition(new Vector3(10, 10, 10));
      lightManager.update();
      
      expect(directionalLight.viewMatrix).not.toEqual(initialMatrix);
    });
  });

  describe('Serialization', () => {
    it('should serialize light manager', () => {
      const directionalLight = lightManager.createDirectionalLight('test', 'Test Light');
      directionalLight.setColor(new Vector3(1, 0, 0));
      
      const serialized = lightManager.serialize();
      
      expect(serialized.config).toBeDefined();
      expect(serialized.lights).toBeDefined();
      expect(serialized.ambientLight).toBeDefined();
      expect(serialized.lights.length).toBeGreaterThan(0);
    });

    it('should deserialize light manager', () => {
      const directionalLight = lightManager.createDirectionalLight('test', 'Test Light');
      directionalLight.setColor(new Vector3(1, 0, 0));
      
      const serialized = lightManager.serialize();
      const deserialized = LightManager.deserialize(serialized);
      
      expect(deserialized.config.maxLights).toBe(lightManager.config.maxLights);
      expect(deserialized.getLights().length).toBe(lightManager.getLights().length);
      expect(deserialized.getAmbientLight()).toBeInstanceOf(AmbientLight);
    });
  });

  describe('Disposal', () => {
    it('should dispose light manager resources', () => {
      const directionalLight = lightManager.createDirectionalLight('test', 'Test Light');
      
      lightManager.dispose(mockGL);
      
      expect(mockGL.deleteFramebuffer).toHaveBeenCalled();
      expect(mockGL.deleteTexture).toHaveBeenCalled();
    });
  });
});

describe('DirectionalLight', () => {
  let light: DirectionalLight;
  let mockGL: WebGL2RenderingContext;

  beforeEach(() => {
    light = new DirectionalLight('test', 'Test Directional Light');
    mockGL = createMockWebGLContext();
  });

  describe('Constructor', () => {
    it('should create directional light with correct properties', () => {
      expect(light.type).toBe(LightType.DIRECTIONAL);
      expect(light.direction).toEqual(new Vector3(0, -1, 0));
      expect(light.shadowCascadeCount).toBe(4);
      expect(light.shadowCascadeSplits).toEqual([0.1, 0.25, 0.5, 1.0]);
    });
  });

  describe('Shadow Configuration', () => {
    it('should set shadow cascade count', () => {
      light.setShadowCascadeCount(2);
      expect(light.shadowCascadeCount).toBe(2);
      expect(light.shadowConfig.cascadeCount).toBe(2);
    });

    it('should set shadow cascade splits', () => {
      const splits = [0.2, 0.4, 0.6, 0.8];
      light.setShadowCascadeSplits(splits);
      expect(light.shadowCascadeSplits).toEqual(splits);
      expect(light.shadowConfig.cascadeSplits).toEqual(splits);
    });
  });

  describe('Direction Control', () => {
    it('should set direction correctly', () => {
      const direction = new Vector3(1, 0, 0);
      light.setDirection(direction);
      
      expect(light.direction).toEqual(direction.normalize());
      expect(light.target).toEqual(light.position.clone().add(direction.normalize()));
    });
  });

  describe('Cloning', () => {
    it('should clone directional light correctly', () => {
      light.setDirection(new Vector3(1, 0, 0));
      light.setShadowCascadeCount(2);
      
      const cloned = light.clone();
      
      expect(cloned).toBeInstanceOf(DirectionalLight);
      expect(cloned.direction).toEqual(light.direction);
      expect(cloned.shadowCascadeCount).toBe(light.shadowCascadeCount);
      expect(cloned).not.toBe(light);
    });
  });
});

describe('PointLight', () => {
  let light: PointLight;
  let mockGL: WebGL2RenderingContext;

  beforeEach(() => {
    light = new PointLight('test', 'Test Point Light');
    mockGL = createMockWebGLContext();
  });

  describe('Constructor', () => {
    it('should create point light with correct properties', () => {
      expect(light.type).toBe(LightType.POINT);
      expect(light.position).toEqual(new Vector3(0, 5, 0));
      expect(light.attenuation.constant).toBe(1.0);
      expect(light.attenuation.linear).toBe(0.09);
      expect(light.attenuation.quadratic).toBe(0.032);
    });
  });

  describe('Attenuation', () => {
    it('should calculate attenuation correctly', () => {
      const distance = 10.0;
      const attenuation = light.calculateAttenuation(distance);
      
      expect(attenuation).toBeGreaterThan(0);
      expect(attenuation).toBeLessThanOrEqual(1);
    });

    it('should set attenuation configuration', () => {
      const newAttenuation = {
        constant: 0.5,
        linear: 0.1,
        quadratic: 0.05,
        maxDistance: 50.0
      };
      
      light.setAttenuation(newAttenuation);
      
      expect(light.attenuation.constant).toBe(0.5);
      expect(light.attenuation.linear).toBe(0.1);
      expect(light.attenuation.quadratic).toBe(0.05);
      expect(light.attenuation.maxDistance).toBe(50.0);
    });
  });

  describe('Shadow Mapping', () => {
    it('should create cube shadow map', () => {
      light.setCastShadows(true);
      light.createShadowMap(mockGL);
      
      expect(mockGL.createTexture).toHaveBeenCalled();
      expect(mockGL.createFramebuffer).toHaveBeenCalled();
    });
  });

  describe('Cloning', () => {
    it('should clone point light correctly', () => {
      light.setAttenuation({ constant: 0.5, linear: 0.1, quadratic: 0.05, maxDistance: 50.0 });
      
      const cloned = light.clone();
      
      expect(cloned).toBeInstanceOf(PointLight);
      expect(cloned.attenuation.constant).toBe(0.5);
      expect(cloned.attenuation.maxDistance).toBe(50.0);
      expect(cloned).not.toBe(light);
    });
  });
});

describe('SpotLight', () => {
  let light: SpotLight;
  let mockGL: WebGL2RenderingContext;

  beforeEach(() => {
    light = new SpotLight('test', 'Test Spot Light');
    mockGL = createMockWebGLContext();
  });

  describe('Constructor', () => {
    it('should create spot light with correct properties', () => {
      expect(light.type).toBe(LightType.SPOT);
      expect(light.angle).toBe(Math.PI / 4);
      expect(light.penumbra).toBe(0.1);
      expect(light.attenuation.constant).toBe(1.0);
    });
  });

  describe('Cone Control', () => {
    it('should set angle correctly', () => {
      light.setAngle(Math.PI / 6);
      expect(light.angle).toBe(Math.PI / 6);
    });

    it('should set penumbra correctly', () => {
      light.setPenumbra(0.2);
      expect(light.penumbra).toBe(0.2);
    });
  });

  describe('Cone Factor Calculation', () => {
    it('should calculate cone factor correctly', () => {
      const point = new Vector3(0, 0, 0);
      const normal = new Vector3(0, 1, 0);
      
      const factor = light.calculateConeFactor(point);
      expect(factor).toBeGreaterThanOrEqual(0);
      expect(factor).toBeLessThanOrEqual(1);
    });
  });

  describe('Target Control', () => {
    it('should set target correctly', () => {
      const target = new Vector3(0, 0, 10);
      light.setTarget(target);
      
      expect(light.target).toEqual(target);
      expect(light.direction).toEqual(target.clone().subtract(light.position).normalize());
    });
  });

  describe('Cloning', () => {
    it('should clone spot light correctly', () => {
      light.setAngle(Math.PI / 6);
      light.setPenumbra(0.2);
      light.setAttenuation({ constant: 0.5, linear: 0.1, quadratic: 0.05, maxDistance: 50.0 });
      
      const cloned = light.clone();
      
      expect(cloned).toBeInstanceOf(SpotLight);
      expect(cloned.angle).toBe(Math.PI / 6);
      expect(cloned.penumbra).toBe(0.2);
      expect(cloned.attenuation.constant).toBe(0.5);
      expect(cloned).not.toBe(light);
    });
  });
});

describe('AreaLight', () => {
  let light: AreaLight;
  let mockGL: WebGL2RenderingContext;

  beforeEach(() => {
    light = new AreaLight('test', 'Test Area Light');
    mockGL = createMockWebGLContext();
  });

  describe('Constructor', () => {
    it('should create area light with correct properties', () => {
      expect(light.type).toBe(LightType.AREA);
      expect(light.width).toBe(1.0);
      expect(light.height).toBe(1.0);
      expect(light.shape).toBe('rectangle');
      expect(light.samples).toBe(16);
    });
  });

  describe('Size Control', () => {
    it('should set size correctly', () => {
      light.setSize(2.0, 3.0);
      expect(light.width).toBe(2.0);
      expect(light.height).toBe(3.0);
    });
  });

  describe('Shape Control', () => {
    it('should set shape correctly', () => {
      light.setShape('disk');
      expect(light.shape).toBe('disk');
    });
  });

  describe('Sample Points', () => {
    it('should generate sample points', () => {
      const points = light.getSamplePoints();
      expect(points.length).toBe(light.samples);
      expect(points[0]).toBeInstanceOf(Vector3);
    });
  });

  describe('Irradiance Calculation', () => {
    it('should calculate irradiance correctly', () => {
      const point = new Vector3(0, 0, 0);
      const irradiance = light.calculateIrradiance(point);
      expect(irradiance).toBeGreaterThan(0);
    });
  });

  describe('Cloning', () => {
    it('should clone area light correctly', () => {
      light.setSize(2.0, 3.0);
      light.setShape('disk');
      light.setSamples(8);
      
      const cloned = light.clone();
      
      expect(cloned).toBeInstanceOf(AreaLight);
      expect(cloned.width).toBe(2.0);
      expect(cloned.height).toBe(3.0);
      expect(cloned.shape).toBe('disk');
      expect(cloned.samples).toBe(8);
      expect(cloned).not.toBe(light);
    });
  });
});

describe('AmbientLight', () => {
  let light: AmbientLight;

  beforeEach(() => {
    light = new AmbientLight('test', 'Test Ambient Light');
  });

  describe('Constructor', () => {
    it('should create ambient light with correct properties', () => {
      expect(light.type).toBe(LightType.AMBIENT);
      expect(light.intensity).toBe(0.3);
      expect(light.skyColor).toEqual(new Vector3(0.5, 0.7, 1.0));
      expect(light.groundColor).toEqual(new Vector3(0.3, 0.3, 0.3));
      expect(light.hemisphere).toBe(false);
    });
  });

  describe('Hemispheric Lighting', () => {
    it('should set sky color correctly', () => {
      const skyColor = new Vector3(0.8, 0.9, 1.0);
      light.setSkyColor(skyColor);
      expect(light.skyColor).toEqual(skyColor);
    });

    it('should set ground color correctly', () => {
      const groundColor = new Vector3(0.1, 0.1, 0.1);
      light.setGroundColor(groundColor);
      expect(light.groundColor).toEqual(groundColor);
    });

    it('should enable hemispheric lighting', () => {
      light.setHemisphere(true);
      expect(light.hemisphere).toBe(true);
    });
  });

  describe('Ambient Calculation', () => {
    it('should calculate ambient lighting correctly', () => {
      const point = new Vector3(0, 0, 0);
      const normal = new Vector3(0, 1, 0);
      
      const ambient = light.calculateAmbient(point, normal);
      expect(ambient).toBeInstanceOf(Vector3);
      expect(ambient.x).toBeGreaterThanOrEqual(0);
      expect(ambient.y).toBeGreaterThanOrEqual(0);
      expect(ambient.z).toBeGreaterThanOrEqual(0);
    });

    it('should calculate hemispheric lighting correctly', () => {
      light.setHemisphere(true);
      const point = new Vector3(0, 0, 0);
      const normal = new Vector3(0, 1, 0);
      
      const ambient = light.calculateAmbient(point, normal);
      expect(ambient).toBeInstanceOf(Vector3);
    });
  });

  describe('Cloning', () => {
    it('should clone ambient light correctly', () => {
      light.setSkyColor(new Vector3(0.8, 0.9, 1.0));
      light.setGroundColor(new Vector3(0.1, 0.1, 0.1));
      light.setHemisphere(true);
      
      const cloned = light.clone();
      
      expect(cloned).toBeInstanceOf(AmbientLight);
      expect(cloned.skyColor).toEqual(light.skyColor);
      expect(cloned.groundColor).toEqual(light.groundColor);
      expect(cloned.hemisphere).toBe(light.hemisphere);
      expect(cloned).not.toBe(light);
    });
  });
}); 
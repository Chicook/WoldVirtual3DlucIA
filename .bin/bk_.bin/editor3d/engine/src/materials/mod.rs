//! # Sistema de Materiales
//! 
//! Sistema de gestión de materiales PBR y avanzados para el metaverso.
//! Proporciona materiales físicamente basados y efectos visuales avanzados.

use serde::{Serialize, Deserialize};
use tracing::{info, debug};
use std::collections::HashMap;

/// Sistema de materiales principal
pub struct MaterialSystem {
    /// Materiales registrados
    materials: HashMap<String, Material>,
    /// Shaders disponibles
    shaders: HashMap<String, Shader>,
    /// Texturas cargadas
    textures: HashMap<String, Texture>,
    /// Estado del sistema
    running: bool,
}

/// Material principal
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Material {
    /// ID del material
    pub id: String,
    /// Nombre del material
    pub name: String,
    /// Tipo de material
    pub material_type: MaterialType,
    /// Configuración del material
    pub config: MaterialConfig,
    /// Shader asociado
    pub shader_id: Option<String>,
    /// Texturas del material
    pub textures: MaterialTextures,
    /// Estado del material
    pub state: MaterialState,
}

/// Tipo de material
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum MaterialType {
    Standard,
    PBR,
    Unlit,
    Transparent,
    Emissive,
    Custom(String),
}

/// Configuración de material
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MaterialConfig {
    /// Color base
    pub base_color: [f32; 4],
    /// Metallic
    pub metallic: f32,
    /// Roughness
    pub roughness: f32,
    /// Emissive
    pub emissive: [f32; 3],
    /// Configuración de transparencia
    pub transparency: Option<TransparencyConfig>,
    /// Configuración de reflexión
    pub reflection: Option<ReflectionConfig>,
    /// Configuración de refracción
    pub refraction: Option<RefractionConfig>,
    /// Configuración de subsurface scattering
    pub subsurface: Option<SubsurfaceConfig>,
    /// Configuración de clearcoat
    pub clearcoat: Option<ClearcoatConfig>,
    /// Configuración de sheen
    pub sheen: Option<SheenConfig>,
    /// Configuración de anisotropy
    pub anisotropy: Option<AnisotropyConfig>,
}

/// Configuración de transparencia
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TransparencyConfig {
    /// Modo de blending
    pub blend_mode: BlendMode,
    /// Factor de transparencia
    pub alpha: f32,
    /// Configuración de alpha test
    pub alpha_test: Option<AlphaTestConfig>,
    /// Configuración de depth write
    pub depth_write: bool,
    /// Configuración de depth test
    pub depth_test: bool,
}

/// Modo de blending
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum BlendMode {
    Normal,
    Additive,
    Multiply,
    Screen,
    Overlay,
    SoftLight,
    HardLight,
    ColorDodge,
    ColorBurn,
    Darken,
    Lighten,
    Difference,
    Exclusion,
}

/// Configuración de alpha test
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AlphaTestConfig {
    /// Umbral
    pub threshold: f32,
    /// Función
    pub function: AlphaTestFunction,
}

/// Función de alpha test
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum AlphaTestFunction {
    Never,
    Less,
    Equal,
    LessEqual,
    Greater,
    NotEqual,
    GreaterEqual,
    Always,
}

/// Configuración de reflexión
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ReflectionConfig {
    /// Intensidad de reflexión
    pub intensity: f32,
    /// Fresnel
    pub fresnel: f32,
    /// Configuración de IOR
    pub ior: f32,
    /// Configuración de roughness
    pub roughness: f32,
}

/// Configuración de refracción
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct RefractionConfig {
    /// Índice de refracción
    pub ior: f32,
    /// Intensidad de refracción
    pub intensity: f32,
    /// Configuración de dispersión
    pub dispersion: Option<DispersionConfig>,
}

/// Configuración de dispersión
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DispersionConfig {
    /// Factor de dispersión
    pub factor: f32,
    /// Configuración de longitudes de onda
    pub wavelengths: [f32; 3],
}

/// Configuración de subsurface scattering
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SubsurfaceConfig {
    /// Factor de scattering
    pub scattering_factor: f32,
    /// Color de scattering
    pub scattering_color: [f32; 3],
    /// Configuración de translucencia
    pub translucency: f32,
}

/// Configuración de clearcoat
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ClearcoatConfig {
    /// Factor de clearcoat
    pub factor: f32,
    /// Roughness de clearcoat
    pub roughness: f32,
    /// Configuración de IOR
    pub ior: f32,
}

/// Configuración de sheen
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SheenConfig {
    /// Factor de sheen
    pub factor: f32,
    /// Color de sheen
    pub color: [f32; 3],
    /// Roughness de sheen
    pub roughness: f32,
}

/// Configuración de anisotropía
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AnisotropyConfig {
    /// Factor de anisotropía
    pub factor: f32,
    /// Dirección de anisotropía
    pub direction: [f32; 2],
    /// Roughness de anisotropía
    pub roughness: f32,
}

/// Texturas del material
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MaterialTextures {
    /// Textura de albedo
    pub albedo: Option<String>,
    /// Textura de normal
    pub normal: Option<String>,
    /// Textura de metallic roughness
    pub metallic_roughness: Option<String>,
    /// Textura de emissive
    pub emissive: Option<String>,
    /// Textura de ambient occlusion
    pub ao: Option<String>,
    /// Textura de height
    pub height: Option<String>,
    /// Textura de clearcoat
    pub clearcoat: Option<String>,
    /// Textura de sheen
    pub sheen: Option<String>,
    /// Textura de anisotropy
    pub anisotropy: Option<String>,
    /// Textura de translucency
    pub translucency: Option<String>,
}

/// Estado del material
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MaterialState {
    /// Activo
    pub active: bool,
    /// Cargado
    pub loaded: bool,
    /// Compilado
    pub compiled: bool,
    /// Tiempo de carga
    pub load_time: f32,
}

/// Shader
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Shader {
    /// ID del shader
    pub id: String,
    /// Nombre del shader
    pub name: String,
    /// Tipo de shader
    pub shader_type: ShaderType,
    /// Configuración del shader
    pub config: ShaderConfig,
    /// Código del shader
    pub code: ShaderCode,
    /// Estado del shader
    pub state: ShaderState,
}

/// Tipo de shader
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum ShaderType {
    Vertex,
    Fragment,
    Compute,
    Geometry,
    TessellationControl,
    TessellationEvaluation,
}

/// Configuración de shader
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ShaderConfig {
    /// Versión de GLSL
    pub glsl_version: String,
    /// Configuración de uniforms
    pub uniforms: Vec<UniformConfig>,
    /// Configuración de atributos
    pub attributes: Vec<AttributeConfig>,
    /// Configuración de varyings
    pub varyings: Vec<VaryingConfig>,
    /// Configuración de defines
    pub defines: HashMap<String, String>,
}

/// Configuración de uniform
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct UniformConfig {
    /// Nombre
    pub name: String,
    /// Tipo
    pub uniform_type: UniformType,
    /// Ubicación
    pub location: i32,
    /// Valor por defecto
    pub default_value: Option<UniformValue>,
}

/// Tipo de uniform
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum UniformType {
    Float,
    Vec2,
    Vec3,
    Vec4,
    Mat3,
    Mat4,
    Int,
    Bool,
    Sampler2D,
    SamplerCube,
    Sampler3D,
}

/// Valor de uniform
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum UniformValue {
    Float(f32),
    Vec2([f32; 2]),
    Vec3([f32; 3]),
    Vec4([f32; 4]),
    Mat3([[f32; 3]; 3]),
    Mat4([[f32; 4]; 4]),
    Int(i32),
    Bool(bool),
    Texture(String),
}

/// Configuración de atributo
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AttributeConfig {
    /// Nombre
    pub name: String,
    /// Tipo
    pub attribute_type: AttributeType,
    /// Ubicación
    pub location: u32,
    /// Normalizado
    pub normalized: bool,
}

/// Tipo de atributo
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum AttributeType {
    Float,
    Vec2,
    Vec3,
    Vec4,
    Int,
    Bool,
}

/// Configuración de varying
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct VaryingConfig {
    /// Nombre
    pub name: String,
    /// Tipo
    pub varying_type: VaryingType,
    /// Interpolación
    pub interpolation: InterpolationType,
}

/// Tipo de varying
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum VaryingType {
    Float,
    Vec2,
    Vec3,
    Vec4,
}

/// Tipo de interpolación
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum InterpolationType {
    Smooth,
    Flat,
    NoPerspective,
}

/// Código del shader
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ShaderCode {
    /// Código del vertex shader
    pub vertex_code: String,
    /// Código del fragment shader
    pub fragment_code: String,
    /// Código del compute shader
    pub compute_code: Option<String>,
    /// Código del geometry shader
    pub geometry_code: Option<String>,
    /// Código del tessellation control shader
    pub tessellation_control_code: Option<String>,
    /// Código del tessellation evaluation shader
    pub tessellation_evaluation_code: Option<String>,
}

/// Estado del shader
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ShaderState {
    /// Activo
    pub active: bool,
    /// Compilado
    pub compiled: bool,
    /// Enlazado
    pub linked: bool,
    /// Tiempo de compilación
    pub compile_time: f32,
}

/// Textura
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Texture {
    /// ID de la textura
    pub id: String,
    /// Nombre de la textura
    pub name: String,
    /// Tipo de textura
    pub texture_type: TextureType,
    /// Configuración de la textura
    pub config: TextureConfig,
    /// Datos de la textura
    pub data: Option<TextureData>,
    /// Estado de la textura
    pub state: TextureState,
}

/// Tipo de textura
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum TextureType {
    Diffuse,
    Normal,
    Specular,
    Emissive,
    Height,
    Roughness,
    Metallic,
    AO,
    Clearcoat,
    Sheen,
    Anisotropy,
    Translucency,
    Custom(String),
}

/// Configuración de textura
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TextureConfig {
    /// Ancho
    pub width: u32,
    /// Alto
    pub height: u32,
    /// Profundidad (para texturas 3D)
    pub depth: Option<u32>,
    /// Formato
    pub format: TextureFormat,
    /// Filtro de minificación
    pub min_filter: TextureFilter,
    /// Filtro de magnificación
    pub mag_filter: TextureFilter,
    /// Modo de wrapping U
    pub wrap_u: TextureWrap,
    /// Modo de wrapping V
    pub wrap_v: TextureWrap,
    /// Modo de wrapping W (para texturas 3D)
    pub wrap_w: Option<TextureWrap>,
    /// Generación de mipmaps
    pub generate_mipmaps: bool,
    /// Configuración de anisotropía
    pub anisotropy: Option<f32>,
}

/// Formato de textura
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum TextureFormat {
    RGBA8,
    RGB8,
    RG8,
    R8,
    RGBA16F,
    RGB16F,
    RG16F,
    R16F,
    RGBA32F,
    RGB32F,
    RG32F,
    R32F,
    Depth24,
    Depth32F,
    Depth24Stencil8,
    BC1,
    BC2,
    BC3,
    BC4,
    BC5,
    BC6H,
    BC7,
}

/// Filtro de textura
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum TextureFilter {
    Nearest,
    Linear,
    NearestMipmapNearest,
    LinearMipmapNearest,
    NearestMipmapLinear,
    LinearMipmapLinear,
}

/// Modo de wrapping de textura
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum TextureWrap {
    ClampToEdge,
    ClampToBorder,
    MirroredRepeat,
    Repeat,
}

/// Datos de textura
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TextureData {
    /// Datos de píxeles
    pub pixels: Vec<u8>,
    /// Formato
    pub format: TextureFormat,
    /// Ancho
    pub width: u32,
    /// Alto
    pub height: u32,
    /// Profundidad
    pub depth: Option<u32>,
    /// Mipmaps
    pub mipmaps: Option<Vec<Vec<u8>>>,
}

/// Estado de textura
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TextureState {
    /// Activa
    pub active: bool,
    /// Cargada
    pub loaded: bool,
    /// Subida a GPU
    pub uploaded: bool,
    /// Tiempo de carga
    pub load_time: f32,
}

impl MaterialSystem {
    /// Crea un nuevo sistema de materiales
    pub fn new() -> Self {
        info!("🎨 Inicializando sistema de materiales...");
        
        Self {
            materials: HashMap::new(),
            shaders: HashMap::new(),
            textures: HashMap::new(),
            running: false,
        }
    }

    /// Inicializa el sistema
    pub async fn initialize(&mut self) -> Result<(), Box<dyn std::error::Error>> {
        info!("🚀 Inicializando sistema de materiales...");
        
        // Cargar shaders por defecto
        self.load_default_shaders().await?;
        
        // Cargar materiales por defecto
        self.load_default_materials().await?;
        
        // Cargar texturas por defecto
        self.load_default_textures().await?;
        
        self.running = true;
        
        info!("✅ Sistema de materiales inicializado correctamente");
        Ok(())
    }

    /// Actualiza el sistema
    pub async fn update(&mut self) -> Result<(), Box<dyn std::error::Error>> {
        if !self.running {
            return Ok(());
        }
        
        // Actualizar materiales
        for material in self.materials.values_mut() {
            if material.state.active {
                self.update_material(material).await?;
            }
        }
        
        Ok(())
    }

    /// Limpia el sistema
    pub async fn cleanup(&mut self) -> Result<(), Box<dyn std::error::Error>> {
        info!("🧹 Limpiando sistema de materiales...");
        
        self.running = false;
        self.materials.clear();
        self.shaders.clear();
        self.textures.clear();
        
        info!("✅ Sistema de materiales limpiado correctamente");
        Ok(())
    }

    /// Carga shaders por defecto
    async fn load_default_shaders(&mut self) -> Result<(), Box<dyn std::error::Error>> {
        // Shader PBR estándar
        let pbr_shader = Shader {
            id: "pbr_standard".to_string(),
            name: "PBR Standard".to_string(),
            shader_type: ShaderType::Vertex,
            config: ShaderConfig {
                glsl_version: "#version 300 es".to_string(),
                uniforms: vec![
                    UniformConfig {
                        name: "u_modelMatrix".to_string(),
                        uniform_type: UniformType::Mat4,
                        location: 0,
                        default_value: None,
                    },
                    UniformConfig {
                        name: "u_viewMatrix".to_string(),
                        uniform_type: UniformType::Mat4,
                        location: 1,
                        default_value: None,
                    },
                    UniformConfig {
                        name: "u_projectionMatrix".to_string(),
                        uniform_type: UniformType::Mat4,
                        location: 2,
                        default_value: None,
                    },
                ],
                attributes: vec![
                    AttributeConfig {
                        name: "a_position".to_string(),
                        attribute_type: AttributeType::Vec3,
                        location: 0,
                        normalized: false,
                    },
                    AttributeConfig {
                        name: "a_normal".to_string(),
                        attribute_type: AttributeType::Vec3,
                        location: 1,
                        normalized: false,
                    },
                    AttributeConfig {
                        name: "a_uv".to_string(),
                        attribute_type: AttributeType::Vec2,
                        location: 2,
                        normalized: false,
                    },
                ],
                varyings: vec![
                    VaryingConfig {
                        name: "v_position".to_string(),
                        varying_type: VaryingType::Vec3,
                        interpolation: InterpolationType::Smooth,
                    },
                    VaryingConfig {
                        name: "v_normal".to_string(),
                        varying_type: VaryingType::Vec3,
                        interpolation: InterpolationType::Smooth,
                    },
                    VaryingConfig {
                        name: "v_uv".to_string(),
                        varying_type: VaryingType::Vec2,
                        interpolation: InterpolationType::Smooth,
                    },
                ],
                defines: HashMap::new(),
            },
            code: ShaderCode {
                vertex_code: "#version 300 es\nin vec3 a_position;\nin vec3 a_normal;\nin vec2 a_uv;\nuniform mat4 u_modelMatrix;\nuniform mat4 u_viewMatrix;\nuniform mat4 u_projectionMatrix;\nout vec3 v_position;\nout vec3 v_normal;\nout vec2 v_uv;\nvoid main() {\n    v_position = (u_modelMatrix * vec4(a_position, 1.0)).xyz;\n    v_normal = mat3(u_modelMatrix) * a_normal;\n    v_uv = a_uv;\n    gl_Position = u_projectionMatrix * u_viewMatrix * u_modelMatrix * vec4(a_position, 1.0);\n}".to_string(),
                fragment_code: "#version 300 es\nprecision mediump float;\nin vec3 v_position;\nin vec3 v_normal;\nin vec2 v_uv;\nout vec4 fragColor;\nvoid main() {\n    vec3 normal = normalize(v_normal);\n    vec3 lightDir = normalize(vec3(1.0, 1.0, 1.0));\n    float diff = max(dot(normal, lightDir), 0.0);\n    vec3 color = vec3(0.8, 0.8, 0.8) * diff + vec3(0.2, 0.2, 0.2);\n    fragColor = vec4(color, 1.0);\n}".to_string(),
                compute_code: None,
                geometry_code: None,
                tessellation_control_code: None,
                tessellation_evaluation_code: None,
            },
            state: ShaderState {
                active: true,
                compiled: false,
                linked: false,
                compile_time: 0.0,
            },
        };
        
        self.shaders.insert(pbr_shader.id.clone(), pbr_shader);
        
        Ok(())
    }

    /// Carga materiales por defecto
    async fn load_default_materials(&mut self) -> Result<(), Box<dyn std::error::Error>> {
        // Material estándar
        let standard_material = Material {
            id: "standard".to_string(),
            name: "Standard".to_string(),
            material_type: MaterialType::Standard,
            config: MaterialConfig {
                base_color: [1.0, 1.0, 1.0, 1.0],
                metallic: 0.0,
                roughness: 0.5,
                emissive: [0.0, 0.0, 0.0],
                transparency: None,
                reflection: None,
                refraction: None,
                subsurface: None,
                clearcoat: None,
                sheen: None,
                anisotropy: None,
            },
            shader_id: Some("pbr_standard".to_string()),
            textures: MaterialTextures {
                albedo: None,
                normal: None,
                metallic_roughness: None,
                emissive: None,
                ao: None,
                height: None,
                clearcoat: None,
                sheen: None,
                anisotropy: None,
                translucency: None,
            },
            state: MaterialState {
                active: true,
                loaded: true,
                compiled: false,
                load_time: 0.0,
            },
        };
        
        self.materials.insert(standard_material.id.clone(), standard_material);
        
        Ok(())
    }

    /// Carga texturas por defecto
    async fn load_default_textures(&mut self) -> Result<(), Box<dyn std::error::Error>> {
        // Textura de ruido blanco
        let white_noise_texture = Texture {
            id: "white_noise".to_string(),
            name: "White Noise".to_string(),
            texture_type: TextureType::Diffuse,
            config: TextureConfig {
                width: 256,
                height: 256,
                depth: None,
                format: TextureFormat::RGBA8,
                min_filter: TextureFilter::Linear,
                mag_filter: TextureFilter::Linear,
                wrap_u: TextureWrap::Repeat,
                wrap_v: TextureWrap::Repeat,
                wrap_w: None,
                generate_mipmaps: false,
                anisotropy: None,
            },
            data: Some(TextureData {
                pixels: vec![255; 256 * 256 * 4],
                format: TextureFormat::RGBA8,
                width: 256,
                height: 256,
                depth: None,
                mipmaps: None,
            }),
            state: TextureState {
                active: true,
                loaded: true,
                uploaded: false,
                load_time: 0.0,
            },
        };
        
        self.textures.insert(white_noise_texture.id.clone(), white_noise_texture);
        
        Ok(())
    }

    /// Actualiza un material
    async fn update_material(&self, material: &mut Material) -> Result<(), Box<dyn std::error::Error>> {
        // Actualizar estado del material
        if !material.state.compiled {
            self.compile_material(material).await?;
        }
        
        Ok(())
    }

    /// Compila un material
    async fn compile_material(&self, material: &mut Material) -> Result<(), Box<dyn std::error::Error>> {
        // Implementar compilación de material
        material.state.compiled = true;
        
        debug!("🔧 Material compilado: {}", material.name);
        Ok(())
    }

    /// Crea un material
    pub async fn create_material(&mut self, material: Material) -> Result<(), Box<dyn std::error::Error>> {
        let id = material.id.clone();
        self.materials.insert(id.clone(), material);
        
        debug!("➕ Material creado: {} ({})", id, id);
        Ok(())
    }

    /// Obtiene un material
    pub fn get_material(&self, id: &str) -> Option<&Material> {
        self.materials.get(id)
    }

    /// Obtiene todos los materiales
    pub fn get_all_materials(&self) -> &HashMap<String, Material> {
        &self.materials
    }

    /// Crea un shader
    pub async fn create_shader(&mut self, shader: Shader) -> Result<(), Box<dyn std::error::Error>> {
        let id = shader.id.clone();
        self.shaders.insert(id.clone(), shader);
        
        debug!("➕ Shader creado: {} ({})", id, id);
        Ok(())
    }

    /// Obtiene un shader
    pub fn get_shader(&self, id: &str) -> Option<&Shader> {
        self.shaders.get(id)
    }

    /// Crea una textura
    pub async fn create_texture(&mut self, texture: Texture) -> Result<(), Box<dyn std::error::Error>> {
        let id = texture.id.clone();
        self.textures.insert(id.clone(), texture);
        
        debug!("➕ Textura creada: {} ({})", id, id);
        Ok(())
    }

    /// Obtiene una textura
    pub fn get_texture(&self, id: &str) -> Option<&Texture> {
        self.textures.get(id)
    }

    /// Obtiene el estado de salud del sistema
    pub async fn health_check(&self) -> bool {
        self.running
    }

    /// Obtiene estadísticas del sistema
    pub fn get_stats(&self) -> MaterialStats {
        MaterialStats {
            material_count: self.materials.len(),
            shader_count: self.shaders.len(),
            texture_count: self.textures.len(),
            active_materials: self.materials.values().filter(|m| m.state.active).count(),
            compiled_materials: self.materials.values().filter(|m| m.state.compiled).count(),
        }
    }
}

/// Estadísticas del sistema de materiales
#[derive(Debug, Clone)]
pub struct MaterialStats {
    /// Número de materiales
    pub material_count: usize,
    /// Número de shaders
    pub shader_count: usize,
    /// Número de texturas
    pub texture_count: usize,
    /// Número de materiales activos
    pub active_materials: usize,
    /// Número de materiales compilados
    pub compiled_materials: usize,
} 
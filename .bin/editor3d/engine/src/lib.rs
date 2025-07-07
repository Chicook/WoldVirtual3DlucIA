//! # Motor 3D del Metaverso
//! 
//! Motor 3D descentralizado de alto rendimiento para el metaverso.
//! Proporciona renderizado, física, networking, y más en un solo sistema integrado.

pub mod ecs;
pub mod physics;
pub mod networking;
pub mod wasm;
pub mod renderer;
pub mod scene;
pub mod camera;
pub mod lighting;
pub mod materials;
pub mod animations;
pub mod audio;
pub mod crypto;
pub mod utils;

use serde::{Serialize, Deserialize};
use tracing::{info, debug, error};
use std::collections::HashMap;

/// Motor 3D principal
pub struct Engine3D {
    /// Configuración del motor
    config: EngineConfig,
    /// Sistema ECS
    ecs_system: ecs::ECSSystem,
    /// Sistema de física
    physics_system: physics::PhysicsSystem,
    /// Sistema de networking
    networking_system: networking::NetworkingSystem,
    /// Sistema WebAssembly
    wasm_system: wasm::WASMSystem,
    /// Sistema de renderizado
    renderer_system: renderer::RendererSystem,
    /// Sistema de escenas
    scene_system: scene::SceneSystem,
    /// Sistema de cámaras
    camera_system: camera::CameraSystem,
    /// Sistema de iluminación
    lighting_system: lighting::LightingSystem,
    /// Sistema de materiales
    material_system: materials::MaterialSystem,
    /// Sistema de animaciones
    animation_system: animations::AnimationSystem,
    /// Sistema de audio
    audio_system: audio::AudioSystem,
    /// Sistema de crypto
    crypto_system: crypto::CryptoSystem,
    /// Sistema de utilidades
    utils_system: utils::UtilsSystem,
    /// Estado del motor
    running: bool,
}

/// Configuración del motor
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct EngineConfig {
    /// Configuración general
    pub general_config: GeneralConfig,
    /// Configuración de rendimiento
    pub performance_config: PerformanceConfig,
    /// Configuración de gráficos
    pub graphics_config: GraphicsConfig,
    /// Configuración de física
    pub physics_config: physics::PhysicsConfig,
    /// Configuración de networking
    pub networking_config: networking::NetworkingConfig,
    /// Configuración de WebAssembly
    pub wasm_config: wasm::WASMConfig,
    /// Configuración de renderizado
    pub renderer_config: renderer::RendererConfig,
    /// Configuración de escenas
    pub scene_config: scene::SceneConfig,
    /// Configuración de cámaras
    pub camera_config: camera::CameraConfig,
    /// Configuración de iluminación
    pub lighting_config: lighting::LightingConfig,
    /// Configuración de materiales
    pub material_config: materials::MaterialConfig,
    /// Configuración de animaciones
    pub animation_config: animations::AnimationConfig,
    /// Configuración de audio
    pub audio_config: audio::AudioConfig,
    /// Configuración de crypto
    pub crypto_config: crypto::CryptoConfig,
    /// Configuración de utilidades
    pub utils_config: utils::UtilsConfig,
}

/// Configuración general
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct GeneralConfig {
    /// Nombre del motor
    pub engine_name: String,
    /// Versión del motor
    pub engine_version: String,
    /// Configuración de debug
    pub debug_enabled: bool,
    /// Configuración de logging
    pub logging_enabled: bool,
}

/// Configuración de rendimiento
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PerformanceConfig {
    /// FPS objetivo
    pub target_fps: u32,
    /// Configuración de vsync
    pub vsync_enabled: bool,
    /// Configuración de multithreading
    pub multithreading_enabled: bool,
    /// Configuración de optimización
    pub optimization_enabled: bool,
}

/// Configuración de gráficos
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct GraphicsConfig {
    /// Resolución
    pub resolution: [u32; 2],
    /// Configuración de fullscreen
    pub fullscreen: bool,
    /// Configuración de antialiasing
    pub antialiasing: AntialiasingConfig,
    /// Configuración de calidad
    pub quality_config: QualityConfig,
}

/// Configuración de antialiasing
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AntialiasingConfig {
    /// Tipo de antialiasing
    pub antialiasing_type: AntialiasingType,
    /// Nivel de antialiasing
    pub antialiasing_level: u32,
}

/// Tipo de antialiasing
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum AntialiasingType {
    None,
    MSAA,
    FXAA,
    TAA,
    Custom(String),
}

/// Configuración de calidad
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct QualityConfig {
    /// Nivel de calidad
    pub quality_level: QualityLevel,
    /// Configuración de LOD
    pub lod_config: LODConfig,
    /// Configuración de sombras
    pub shadow_config: ShadowConfig,
}

/// Nivel de calidad
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum QualityLevel {
    Low,
    Medium,
    High,
    Ultra,
    Custom(String),
}

/// Configuración de LOD
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct LODConfig {
    /// Habilitado
    pub enabled: bool,
    /// Niveles de LOD
    pub lod_levels: Vec<LODLevel>,
}

/// Nivel de LOD
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct LODLevel {
    /// Distancia
    pub distance: f32,
    /// Factor de reducción
    pub reduction_factor: f32,
}

/// Configuración de sombras
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ShadowConfig {
    /// Habilitadas
    pub enabled: bool,
    /// Resolución de sombras
    pub shadow_resolution: u32,
    /// Configuración de cascada
    pub cascade_config: CascadeConfig,
}

/// Configuración de cascada
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CascadeConfig {
    /// Número de cascadas
    pub cascade_count: u32,
    /// Configuración de división
    pub split_config: SplitConfig,
}

/// Configuración de división
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SplitConfig {
    /// Factor de división
    pub split_factor: f32,
    /// Configuración de bias
    pub bias_config: BiasConfig,
}

/// Configuración de bias
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct BiasConfig {
    /// Bias constante
    pub constant_bias: f32,
    /// Bias de pendiente
    pub slope_bias: f32,
}

impl Engine3D {
    /// Crea un nuevo motor 3D
    pub fn new(config: &EngineConfig) -> Self {
        info!("🚀 Inicializando motor 3D del metaverso...");
        
        Self {
            config: config.clone(),
            ecs_system: ecs::ECSSystem::new(),
            physics_system: physics::PhysicsSystem::new(&config.physics_config),
            networking_system: networking::NetworkingSystem::new(&config.networking_config),
            wasm_system: wasm::WASMSystem::new(&config.wasm_config),
            renderer_system: renderer::RendererSystem::new(&config.renderer_config),
            scene_system: scene::SceneSystem::new(&config.scene_config),
            camera_system: camera::CameraSystem::new(&config.camera_config),
            lighting_system: lighting::LightingSystem::new(&config.lighting_config),
            material_system: materials::MaterialSystem::new(&config.material_config),
            animation_system: animations::AnimationSystem::new(),
            audio_system: audio::AudioSystem::new(&config.audio_config),
            crypto_system: crypto::CryptoSystem::new(&config.crypto_config),
            utils_system: utils::UtilsSystem::new(&config.utils_config),
            running: false,
        }
    }

    /// Inicializa el motor
    pub async fn initialize(&mut self) -> Result<(), Box<dyn std::error::Error>> {
        info!("🚀 Inicializando motor 3D...");
        
        // Inicializar sistemas en orden de dependencia
        self.utils_system.initialize().await?;
        self.crypto_system.initialize().await?;
        self.audio_system.initialize().await?;
        self.animation_system.initialize().await?;
        self.material_system.initialize().await?;
        self.lighting_system.initialize().await?;
        self.camera_system.initialize().await?;
        self.scene_system.initialize().await?;
        self.renderer_system.initialize().await?;
        self.wasm_system.initialize().await?;
        self.networking_system.initialize().await?;
        self.physics_system.initialize().await?;
        self.ecs_system.initialize().await?;
        
        self.running = true;
        
        info!("✅ Motor 3D inicializado correctamente");
        Ok(())
    }

    /// Actualiza el motor
    pub async fn update(&mut self, delta_time: f32) -> Result<(), Box<dyn std::error::Error>> {
        if !self.running {
            return Ok(());
        }
        
        // Actualizar sistemas en orden de dependencia
        self.utils_system.update().await?;
        self.crypto_system.update().await?;
        self.audio_system.update(delta_time).await?;
        self.animation_system.update(delta_time).await?;
        self.material_system.update(delta_time).await?;
        self.lighting_system.update(delta_time).await?;
        self.camera_system.update(delta_time).await?;
        self.scene_system.update(delta_time).await?;
        self.renderer_system.update(delta_time).await?;
        self.wasm_system.update(delta_time).await?;
        self.networking_system.update(delta_time).await?;
        self.physics_system.update(delta_time).await?;
        self.ecs_system.update(delta_time).await?;
        
        Ok(())
    }

    /// Renderiza el frame
    pub async fn render(&mut self) -> Result<(), Box<dyn std::error::Error>> {
        if !self.running {
            return Ok(());
        }
        
        // Renderizar frame
        self.renderer_system.render().await?;
        
        Ok(())
    }

    /// Limpia el motor
    pub async fn cleanup(&mut self) -> Result<(), Box<dyn std::error::Error>> {
        info!("🧹 Limpiando motor 3D...");
        
        self.running = false;
        
        // Limpiar sistemas en orden inverso
        self.ecs_system.cleanup().await?;
        self.physics_system.cleanup().await?;
        self.networking_system.cleanup().await?;
        self.wasm_system.cleanup().await?;
        self.renderer_system.cleanup().await?;
        self.scene_system.cleanup().await?;
        self.camera_system.cleanup().await?;
        self.lighting_system.cleanup().await?;
        self.material_system.cleanup().await?;
        self.animation_system.cleanup().await?;
        self.audio_system.cleanup().await?;
        self.crypto_system.cleanup().await?;
        self.utils_system.cleanup().await?;
        
        info!("✅ Motor 3D limpiado correctamente");
        Ok(())
    }

    /// Obtiene el estado de salud del motor
    pub async fn health_check(&self) -> bool {
        self.running &&
        self.ecs_system.health_check().await &&
        self.physics_system.health_check().await &&
        self.networking_system.health_check().await &&
        self.wasm_system.health_check().await &&
        self.renderer_system.health_check().await &&
        self.scene_system.health_check().await &&
        self.camera_system.health_check().await &&
        self.lighting_system.health_check().await &&
        self.material_system.health_check().await &&
        self.animation_system.health_check().await &&
        self.audio_system.health_check().await &&
        self.crypto_system.health_check().await &&
        self.utils_system.health_check().await
    }

    /// Obtiene estadísticas del motor
    pub fn get_stats(&self) -> EngineStats {
        EngineStats {
            ecs_stats: self.ecs_system.get_stats(),
            physics_stats: self.physics_system.get_stats(),
            networking_stats: self.networking_system.get_stats(),
            wasm_stats: self.wasm_system.get_stats(),
            renderer_stats: self.renderer_system.get_stats(),
            scene_stats: self.scene_system.get_stats(),
            camera_stats: self.camera_system.get_stats(),
            lighting_stats: self.lighting_system.get_stats(),
            material_stats: self.material_system.get_stats(),
            animation_stats: self.animation_system.get_stats(),
            audio_stats: self.audio_system.get_stats(),
            crypto_stats: self.crypto_system.get_stats(),
            utils_stats: self.utils_system.get_stats(),
        }
    }

    /// Obtiene el sistema ECS
    pub fn get_ecs_system(&self) -> &ecs::ECSSystem {
        &self.ecs_system
    }

    /// Obtiene el sistema de física
    pub fn get_physics_system(&self) -> &physics::PhysicsSystem {
        &self.physics_system
    }

    /// Obtiene el sistema de networking
    pub fn get_networking_system(&self) -> &networking::NetworkingSystem {
        &self.networking_system
    }

    /// Obtiene el sistema WebAssembly
    pub fn get_wasm_system(&self) -> &wasm::WASMSystem {
        &self.wasm_system
    }

    /// Obtiene el sistema de renderizado
    pub fn get_renderer_system(&self) -> &renderer::RendererSystem {
        &self.renderer_system
    }

    /// Obtiene el sistema de escenas
    pub fn get_scene_system(&self) -> &scene::SceneSystem {
        &self.scene_system
    }

    /// Obtiene el sistema de cámaras
    pub fn get_camera_system(&self) -> &camera::CameraSystem {
        &self.camera_system
    }

    /// Obtiene el sistema de iluminación
    pub fn get_lighting_system(&self) -> &lighting::LightingSystem {
        &self.lighting_system
    }

    /// Obtiene el sistema de materiales
    pub fn get_material_system(&self) -> &materials::MaterialSystem {
        &self.material_system
    }

    /// Obtiene el sistema de animaciones
    pub fn get_animation_system(&self) -> &animations::AnimationSystem {
        &self.animation_system
    }

    /// Obtiene el sistema de audio
    pub fn get_audio_system(&self) -> &audio::AudioSystem {
        &self.audio_system
    }

    /// Obtiene el sistema de crypto
    pub fn get_crypto_system(&self) -> &crypto::CryptoSystem {
        &self.crypto_system
    }

    /// Obtiene el sistema de utilidades
    pub fn get_utils_system(&self) -> &utils::UtilsSystem {
        &self.utils_system
    }
}

/// Estadísticas del motor
#[derive(Debug, Clone)]
pub struct EngineStats {
    /// Estadísticas del ECS
    pub ecs_stats: ecs::ECSStats,
    /// Estadísticas de física
    pub physics_stats: physics::PhysicsStats,
    /// Estadísticas de networking
    pub networking_stats: networking::NetworkingStats,
    /// Estadísticas de WebAssembly
    pub wasm_stats: wasm::WASMStats,
    /// Estadísticas de renderizado
    pub renderer_stats: renderer::RendererStats,
    /// Estadísticas de escenas
    pub scene_stats: scene::SceneStats,
    /// Estadísticas de cámaras
    pub camera_stats: camera::CameraStats,
    /// Estadísticas de iluminación
    pub lighting_stats: lighting::LightingStats,
    /// Estadísticas de materiales
    pub material_stats: materials::MaterialStats,
    /// Estadísticas de animaciones
    pub animation_stats: animations::AnimationStats,
    /// Estadísticas de audio
    pub audio_stats: audio::AudioStats,
    /// Estadísticas de crypto
    pub crypto_stats: crypto::CryptoStats,
    /// Estadísticas de utilidades
    pub utils_stats: utils::UtilsStats,
}

/// Función de inicialización del motor
pub async fn initialize_engine(config: &EngineConfig) -> Result<Engine3D, Box<dyn std::error::Error>> {
    let mut engine = Engine3D::new(config);
    engine.initialize().await?;
    Ok(engine)
}

/// Función de limpieza del motor
pub async fn cleanup_engine(engine: &mut Engine3D) -> Result<(), Box<dyn std::error::Error>> {
    engine.cleanup().await
}

/// Función de bucle principal del motor
pub async fn run_engine_loop(engine: &mut Engine3D) -> Result<(), Box<dyn std::error::Error>> {
    let mut last_time = std::time::Instant::now();
    
    loop {
        let current_time = std::time::Instant::now();
        let delta_time = current_time.duration_since(last_time).as_secs_f32();
        last_time = current_time;
        
        // Actualizar motor
        engine.update(delta_time).await?;
        
        // Renderizar frame
        engine.render().await?;
        
        // Verificar estado de salud
        if !engine.health_check().await {
            error!("❌ Motor no saludable, deteniendo bucle");
            break;
        }
        
        // Control de FPS
        let target_fps = engine.config.performance_config.target_fps;
        let target_frame_time = 1.0 / target_fps as f32;
        
        if delta_time < target_frame_time {
            let sleep_time = target_frame_time - delta_time;
            tokio::time::sleep(tokio::time::Duration::from_secs_f32(sleep_time)).await;
        }
    }
    
    Ok(())
} 
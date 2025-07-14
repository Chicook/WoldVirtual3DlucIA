//! Ejemplo completo del motor 3D del metaverso
//! 
//! Demuestra todas las funcionalidades del motor incluyendo ECS, física,
//! networking P2P, audio 3D, renderizado y más.

use metaverso_engine::{
    Engine3D, EngineConfig, GeneralConfig, PerformanceConfig, GraphicsConfig,
    initialize_engine, run_engine_loop,
    ecs::{ECSSystem, ECSConfig, Entity, TransformComponent, MeshComponent, MaterialComponent},
    physics::{PhysicsSystem, PhysicsConfig, PhysicsBody, BodyType},
    networking::{NetworkingSystem, NetworkingConfig, NetworkType},
    audio::{AudioSystem, AudioConfig, AudioSource, AudioSourceType},
    renderer::{RendererSystem, RendererConfig, RenderAPI},
    scene::{SceneSystem, SceneConfig, Scene},
    camera::{CameraSystem, CameraConfig, Camera, CameraType},
    lighting::{LightingSystem, LightingConfig},
    materials::{MaterialSystem, MaterialConfig},
    animations::{AnimationSystem, AnimationConfig},
    crypto::{CryptoSystem, CryptoConfig},
    utils::{UtilsSystem, UtilsConfig},
};
use glam::{Vec3, Vec4, Quat};
use tracing::{info, debug, error};
use anyhow::Result;

#[tokio::main]
async fn main() -> Result<()> {
    // Configurar logging
    tracing_subscriber::fmt::init();
    
    info!("🚀 Iniciando Motor 3D del Metaverso");

    // Configurar el motor
    let config = create_engine_config();
    
    // Inicializar motor
    let mut engine = initialize_engine(&config).await?;
    
    // Crear escena del metaverso
    create_metaverso_scene(&mut engine).await?;
    
    // Ejecutar bucle principal
    run_engine_loop(&mut engine).await?;
    
    Ok(())
}

/// Crear configuración del motor
fn create_engine_config() -> EngineConfig {
    EngineConfig {
        general_config: GeneralConfig {
            engine_name: "Metaverso Crypto World Virtual 3D".to_string(),
            engine_version: "1.0.0".to_string(),
            debug_enabled: true,
            logging_enabled: true,
        },
        performance_config: PerformanceConfig {
            target_fps: 60,
            vsync_enabled: true,
            multithreading_enabled: true,
            optimization_enabled: true,
        },
        graphics_config: GraphicsConfig {
            resolution: [1920, 1080],
            fullscreen: false,
            antialiasing: metaverso_engine::AntialiasingConfig {
                antialiasing_type: metaverso_engine::AntialiasingType::MSAA,
                antialiasing_level: 4,
            },
            quality_config: metaverso_engine::QualityConfig {
                quality_level: metaverso_engine::QualityLevel::High,
                lod_config: metaverso_engine::LODConfig {
                    enabled: true,
                    lod_levels: vec![
                        metaverso_engine::LODLevel { distance: 10.0, reduction_factor: 0.5 },
                        metaverso_engine::LODLevel { distance: 50.0, reduction_factor: 0.25 },
                        metaverso_engine::LODLevel { distance: 100.0, reduction_factor: 0.1 },
                    ],
                },
                shadow_config: metaverso_engine::ShadowConfig {
                    enabled: true,
                    shadow_resolution: 2048,
                    cascade_config: metaverso_engine::CascadeConfig {
                        cascade_count: 4,
                        split_config: metaverso_engine::SplitConfig {
                            split_factor: 0.5,
                            bias_config: metaverso_engine::BiasConfig {
                                constant_bias: 0.005,
                                slope_bias: 1.0,
                            },
                        },
                    },
                },
            },
        },
        physics_config: PhysicsConfig {
            enabled: true,
            simulation_config: metaverso_engine::physics::SimulationConfig {
                time_step: 1.0 / 60.0,
                max_sub_steps: 10,
                gravity: [0.0, -9.81, 0.0],
                solver_config: metaverso_engine::physics::SolverConfig {
                    solver_type: metaverso_engine::physics::SolverType::Islands,
                    iterations: 10,
                    tolerance: 0.001,
                    warm_start: true,
                },
                island_config: metaverso_engine::physics::IslandConfig {
                    enabled: true,
                    max_size: 1000,
                    sleep_config: metaverso_engine::physics::SleepConfig {
                        enabled: true,
                        linear_threshold: 0.1,
                        angular_threshold: 0.1,
                        time_threshold: 2.0,
                    },
                },
            },
            collision_config: metaverso_engine::physics::CollisionConfig {
                collision_detection: true,
                broad_phase_config: metaverso_engine::physics::BroadPhaseConfig {
                    broad_phase_type: metaverso_engine::physics::BroadPhaseType::SAP,
                    max_objects: 10000,
                    sap_config: metaverso_engine::physics::SAPConfig {
                        enabled: true,
                        bucket_size: 100,
                        sorting: true,
                    },
                },
                narrow_phase_config: metaverso_engine::physics::NarrowPhaseConfig {
                    narrow_phase_type: metaverso_engine::physics::NarrowPhaseType::GJK,
                    contact_manifold: true,
                    gjk_config: metaverso_engine::physics::GJKConfig {
                        enabled: true,
                        max_iterations: 100,
                        tolerance: 0.001,
                    },
                },
                event_config: metaverso_engine::physics::EventConfig {
                    collision_events: true,
                    trigger_events: true,
                    contact_events: true,
                },
            },
            optimization_config: metaverso_engine::physics::OptimizationConfig {
                multithreading: true,
                simd: true,
                cache_friendly: true,
                memory_pooling: true,
            },
            network_config: metaverso_engine::physics::NetworkConfig {
                distributed_sync: true,
                interpolation: true,
                prediction: true,
                network_settings: metaverso_engine::physics::NetworkSettings {
                    latency: 50.0,
                    packet_loss: 0.01,
                    buffer_size: 1024,
                },
            },
        },
        networking_config: NetworkingConfig {
            enabled: true,
            network_type: NetworkType::P2P,
            p2p_config: metaverso_engine::networking::P2PConfig {
                enabled: true,
                discovery_config: metaverso_engine::networking::DiscoveryConfig {
                    enabled: true,
                    discovery_method: metaverso_engine::networking::DiscoveryMethod::DHT,
                    bootstrap_nodes: vec![
                        "/ip4/127.0.0.1/tcp/63785/p2p/QmNnooDu7bfjPFoTZYxMNLWUQJyrVwtbZg5gBMjTezGAJN".to_string(),
                    ],
                    dht_config: metaverso_engine::networking::DHTConfig {
                        enabled: true,
                        bucket_size: 20,
                        replication_factor: 3,
                        ttl: 3600,
                    },
                },
                connection_config: metaverso_engine::networking::ConnectionConfig {
                    max_connections: 100,
                    connection_timeout: 30,
                    keep_alive: true,
                    retry_config: metaverso_engine::networking::RetryConfig {
                        enabled: true,
                        max_attempts: 3,
                        initial_delay: 1000,
                        backoff_factor: 2.0,
                    },
                },
                message_config: metaverso_engine::networking::MessageConfig {
                    message_types: vec![
                        metaverso_engine::networking::MessageType::Position,
                        metaverso_engine::networking::MessageType::Animation,
                        metaverso_engine::networking::MessageType::Chat,
                        metaverso_engine::networking::MessageType::State,
                    ],
                    compression: true,
                    encryption: true,
                    buffer_config: metaverso_engine::networking::BufferConfig {
                        buffer_size: 1024,
                        timeout: 5000,
                        flush_config: metaverso_engine::networking::FlushConfig {
                            enabled: true,
                            interval: 100,
                            min_size: 64,
                        },
                    },
                },
            },
            message_config: metaverso_engine::networking::MessageConfig {
                message_types: vec![
                    metaverso_engine::networking::MessageType::Position,
                    metaverso_engine::networking::MessageType::Animation,
                    metaverso_engine::networking::MessageType::Chat,
                ],
                compression: true,
                encryption: true,
                buffer_config: metaverso_engine::networking::BufferConfig {
                    buffer_size: 1024,
                    timeout: 5000,
                    flush_config: metaverso_engine::networking::FlushConfig {
                        enabled: true,
                        interval: 100,
                        min_size: 64,
                    },
                },
            },
            security_config: metaverso_engine::networking::SecurityConfig {
                encryption: true,
                authentication: true,
                authorization: true,
                key_config: metaverso_engine::networking::KeyConfig {
                    key_type: metaverso_engine::networking::KeyType::Ed25519,
                    key_size: 256,
                    rotation: true,
                },
            },
        },
        wasm_config: metaverso_engine::wasm::WASMConfig {
            enabled: true,
            hot_reloading: true,
            sandboxing: true,
            memory_limit: 1024 * 1024 * 100, // 100MB
        },
        renderer_config: RendererConfig {
            enabled: true,
            render_api: RenderAPI::WebGL2,
            quality_config: metaverso_engine::renderer::QualityConfig {
                quality_level: metaverso_engine::renderer::QualityLevel::High,
                resolution: [1920, 1080],
                antialiasing: metaverso_engine::renderer::AntialiasingConfig {
                    antialiasing_type: metaverso_engine::renderer::AntialiasingType::MSAA,
                    antialiasing_level: 4,
                    fxaa: true,
                    taa: false,
                },
                shadows: metaverso_engine::renderer::ShadowConfig {
                    enabled: true,
                    resolution: 2048,
                    cascade: metaverso_engine::renderer::CascadeConfig {
                        cascade_count: 4,
                        split_factor: 0.5,
                        bias: metaverso_engine::renderer::BiasConfig {
                            constant_bias: 0.005,
                            slope_bias: 1.0,
                        },
                    },
                    soft_shadows: true,
                },
                lod: metaverso_engine::renderer::LODConfig {
                    enabled: true,
                    levels: vec![
                        metaverso_engine::renderer::LODLevel { distance: 10.0, reduction_factor: 0.5 },
                        metaverso_engine::renderer::LODLevel { distance: 50.0, reduction_factor: 0.25 },
                        metaverso_engine::renderer::LODLevel { distance: 100.0, reduction_factor: 0.1 },
                    ],
                    transition_distance: 5.0,
                },
            },
            effects_config: metaverso_engine::renderer::EffectsConfig {
                bloom: metaverso_engine::renderer::BloomConfig {
                    enabled: true,
                    intensity: 0.5,
                    threshold: 0.8,
                    radius: 4.0,
                },
                ssao: metaverso_engine::renderer::SSAOConfig {
                    enabled: true,
                    radius: 0.5,
                    bias: 0.025,
                    intensity: 1.0,
                },
                motion_blur: metaverso_engine::renderer::MotionBlurConfig {
                    enabled: true,
                    intensity: 0.5,
                    samples: 16,
                },
                depth_of_field: metaverso_engine::renderer::DepthOfFieldConfig {
                    enabled: true,
                    focal_distance: 10.0,
                    aperture: 2.8,
                    bokeh: true,
                },
                color_grading: metaverso_engine::renderer::ColorGradingConfig {
                    enabled: true,
                    lut: None,
                    exposure: 0.0,
                    contrast: 1.0,
                    saturation: 1.0,
                },
            },
            optimization_config: metaverso_engine::renderer::OptimizationConfig {
                frustum_culling: true,
                occlusion_culling: true,
                instancing: true,
                batching: true,
                lod: true,
            },
        },
        scene_config: SceneConfig {
            enabled: true,
            scene_management: true,
            scene_graph: true,
            spatial_indexing: true,
        },
        camera_config: CameraConfig {
            enabled: true,
            camera_type: CameraType::Perspective,
            fov: 75.0,
            aspect_ratio: 16.0 / 9.0,
            near_plane: 0.1,
            far_plane: 1000.0,
        },
        lighting_config: LightingConfig {
            enabled: true,
            ambient_lighting: true,
            directional_lighting: true,
            point_lighting: true,
            spot_lighting: true,
        },
        material_config: MaterialConfig {
            enabled: true,
            pbr_materials: true,
            texture_compression: true,
            mipmap_generation: true,
        },
        animation_config: AnimationConfig {
            enabled: true,
            skeletal_animations: true,
            morphing_animations: true,
            procedural_animations: true,
        },
        audio_config: AudioConfig {
            enabled: true,
            context_config: metaverso_engine::audio::ContextConfig {
                sample_rate: 44100.0,
                latency: 0.1,
                buffer_config: metaverso_engine::audio::BufferConfig {
                    buffer_size: 4096,
                    num_buffers: 2,
                    streaming: true,
                },
                compression_config: metaverso_engine::audio::CompressionConfig {
                    enabled: true,
                    compression_type: metaverso_engine::audio::CompressionType::Limiter,
                    ratio: 4.0,
                    threshold: -20.0,
                },
            },
            spatial_config: metaverso_engine::audio::SpatialConfig {
                enabled: true,
                hrtf_config: metaverso_engine::audio::HRTFConfig {
                    enabled: true,
                    hrtf_file: "hrtf/default.hrtf".to_string(),
                    interpolation: true,
                    filter_config: metaverso_engine::audio::FilterConfig {
                        enabled: true,
                        filter_type: metaverso_engine::audio::FilterType::LowPass,
                        frequency: 20000.0,
                        q: 1.0,
                    },
                },
                distance_config: metaverso_engine::audio::DistanceConfig {
                    enabled: true,
                    min_distance: 1.0,
                    max_distance: 100.0,
                    rolloff: metaverso_engine::audio::RolloffType::Logarithmic,
                    attenuation: 1.0,
                },
                occlusion_config: metaverso_engine::audio::OcclusionConfig {
                    enabled: true,
                    occlusion_factor: 0.5,
                    raycast_config: metaverso_engine::audio::RaycastConfig {
                        enabled: true,
                        num_rays: 8,
                        max_distance: 50.0,
                    },
                },
            },
            effects_config: metaverso_engine::audio::EffectsConfig {
                reverb: metaverso_engine::audio::ReverbConfig {
                    enabled: true,
                    decay: 2.0,
                    pre_delay: 0.1,
                    wet_level: 0.3,
                    dry_level: 0.7,
                },
                echo: metaverso_engine::audio::EchoConfig {
                    enabled: true,
                    delay: 0.5,
                    feedback: 0.3,
                    wet_level: 0.2,
                },
                distortion: metaverso_engine::audio::DistortionConfig {
                    enabled: true,
                    amount: 0.1,
                    oversample: 2,
                    wet_level: 0.1,
                },
                chorus: metaverso_engine::audio::ChorusConfig {
                    enabled: true,
                    rate: 1.5,
                    depth: 0.002,
                    feedback: 0.2,
                },
            },
            music_config: metaverso_engine::audio::MusicConfig {
                enabled: true,
                transition_config: metaverso_engine::audio::TransitionConfig {
                    enabled: true,
                    transition_time: 2.0,
                    transition_type: metaverso_engine::audio::TransitionType::Crossfade,
                    crossfade: true,
                },
                layering_config: metaverso_engine::audio::LayeringConfig {
                    enabled: true,
                    max_layers: 4,
                    blend_config: metaverso_engine::audio::BlendConfig {
                        enabled: true,
                        blend_type: metaverso_engine::audio::BlendType::Linear,
                        factor: 0.5,
                    },
                },
                adaptation_config: metaverso_engine::audio::AdaptationConfig {
                    enabled: true,
                    sensitivity: 0.5,
                    trigger_config: metaverso_engine::audio::TriggerConfig {
                        enabled: true,
                        trigger_types: vec![
                            metaverso_engine::audio::TriggerType::Combat,
                            metaverso_engine::audio::TriggerType::Exploration,
                            metaverso_engine::audio::TriggerType::Dialogue,
                        ],
                        response_config: metaverso_engine::audio::ResponseConfig {
                            enabled: true,
                            response_time: 0.5,
                            intensity: 0.8,
                        },
                    },
                },
            },
        },
        crypto_config: CryptoConfig {
            enabled: true,
            blockchain_config: metaverso_engine::crypto::BlockchainConfig {
                enabled: true,
                network: metaverso_engine::crypto::Network::Ethereum,
                rpc_url: "https://mainnet.infura.io/v3/YOUR_PROJECT_ID".to_string(),
                chain_id: 1,
            },
            wallet_config: metaverso_engine::crypto::WalletConfig {
                enabled: true,
                wallet_type: metaverso_engine::crypto::WalletType::MetaMask,
                auto_connect: true,
            },
            nft_config: metaverso_engine::crypto::NFTConfig {
                enabled: true,
                contract_address: "0x...".to_string(),
                token_standard: metaverso_engine::crypto::TokenStandard::ERC721,
            },
        },
        utils_config: UtilsConfig {
            enabled: true,
            logging_config: metaverso_engine::utils::LoggingConfig {
                enabled: true,
                level: metaverso_engine::utils::LogLevel::Info,
                file_output: true,
                console_output: true,
            },
            profiling_config: metaverso_engine::utils::ProfilingConfig {
                enabled: true,
                cpu_profiling: true,
                memory_profiling: true,
                gpu_profiling: true,
            },
        },
    }
}

/// Crear escena del metaverso
async fn create_metaverso_scene(engine: &mut Engine3D) -> Result<()> {
    info!("🌍 Creando escena del metaverso");

    // Obtener sistemas
    let ecs_system = engine.get_ecs_system();
    let scene_system = engine.get_scene_system();
    let camera_system = engine.get_camera_system();
    let renderer_system = engine.get_renderer_system();
    let physics_system = engine.get_physics_system();
    let audio_system = engine.get_audio_system();
    let networking_system = engine.get_networking_system();

    // Crear escena principal
    let scene = Scene {
        id: "metaverso_scene".to_string(),
        name: "Escena del Metaverso".to_string(),
        config: SceneConfig {
            scene_management: true,
            scene_graph: true,
            spatial_indexing: true,
        },
        state: metaverso_engine::scene::SceneState {
            active: true,
            loaded: true,
            entities: vec![],
        },
    };

    // Crear cámara principal
    let camera = Camera {
        id: "main_camera".to_string(),
        name: "Cámara Principal".to_string(),
        camera_type: CameraType::Perspective,
        config: CameraConfig {
            fov: 75.0,
            aspect_ratio: 16.0 / 9.0,
            near_plane: 0.1,
            far_plane: 1000.0,
        },
        state: metaverso_engine::camera::CameraState {
            active: true,
            position: [0.0, 10.0, 20.0],
            rotation: [0.0, 0.0, 0.0],
        },
    };

    // Crear entidades del metaverso
    create_metaverso_entities(engine).await?;

    // Crear fuentes de audio
    create_audio_sources(engine).await?;

    // Crear efectos de iluminación
    create_lighting_effects(engine).await?;

    info!("✅ Escena del metaverso creada exitosamente");
    Ok(())
}

/// Crear entidades del metaverso
async fn create_metaverso_entities(engine: &mut Engine3D) -> Result<()> {
    info!("🏗️ Creando entidades del metaverso");

    // Crear terreno
    create_terrain(engine).await?;

    // Crear edificios
    create_buildings(engine).await?;

    // Crear avatares
    create_avatars(engine).await?;

    // Crear objetos interactivos
    create_interactive_objects(engine).await?;

    Ok(())
}

/// Crear terreno
async fn create_terrain(engine: &mut Engine3D) -> Result<()> {
    let ecs_system = engine.get_ecs_system();
    
    // Crear entidad de terreno
    let terrain_id = ecs_system.create_entity("Terrain".to_string()).await?;

    // Agregar componente de transformación
    let transform = TransformComponent {
        position: Vec3::new(0.0, 0.0, 0.0),
        rotation: Quat::IDENTITY,
        scale: Vec3::new(100.0, 1.0, 100.0),
        matrix: Mat4::IDENTITY,
        parent: None,
        children: vec![],
    };
    ecs_system.add_component(terrain_id, Box::new(transform)).await?;

    // Agregar componente de malla
    let mesh = MeshComponent {
        mesh_id: "terrain_mesh".to_string(),
        vertices: vec![
            Vec3::new(-50.0, 0.0, -50.0),
            Vec3::new(50.0, 0.0, -50.0),
            Vec3::new(50.0, 0.0, 50.0),
            Vec3::new(-50.0, 0.0, 50.0),
        ],
        normals: vec![Vec3::new(0.0, 1.0, 0.0); 4],
        uvs: vec![
            Vec3::new(0.0, 0.0, 0.0),
            Vec3::new(1.0, 0.0, 0.0),
            Vec3::new(1.0, 1.0, 0.0),
            Vec3::new(0.0, 1.0, 0.0),
        ],
        indices: vec![0, 1, 2, 0, 2, 3],
        material_id: Some("grass_material".to_string()),
        lod_level: 0,
    };
    ecs_system.add_component(terrain_id, Box::new(mesh)).await?;

    // Agregar componente de física
    let physics = metaverso_engine::ecs::PhysicsComponent {
        body_type: metaverso_engine::ecs::BodyType::Static,
        mass: 0.0,
        velocity: Vec3::ZERO,
        force: Vec3::ZERO,
        collision: true,
        collision_config: metaverso_engine::ecs::CollisionConfig {
            shape: metaverso_engine::ecs::CollisionShape::Box(Vec3::new(50.0, 0.5, 50.0)),
            filter: 1,
            material: "ground".to_string(),
        },
    };
    ecs_system.add_component(terrain_id, Box::new(physics)).await?;

    info!("🌱 Terreno creado");
    Ok(())
}

/// Crear edificios
async fn create_buildings(engine: &mut Engine3D) -> Result<()> {
    let ecs_system = engine.get_ecs_system();
    
    // Crear varios edificios
    let building_positions = vec![
        Vec3::new(-20.0, 0.0, -20.0),
        Vec3::new(20.0, 0.0, -20.0),
        Vec3::new(0.0, 0.0, 20.0),
        Vec3::new(-30.0, 0.0, 10.0),
        Vec3::new(30.0, 0.0, 10.0),
    ];

    for (i, position) in building_positions.iter().enumerate() {
        let building_id = ecs_system.create_entity(format!("Building_{}", i)).await?;

        // Transformación
        let transform = TransformComponent {
            position: *position,
            rotation: Quat::IDENTITY,
            scale: Vec3::new(5.0, 10.0, 5.0),
            matrix: Mat4::IDENTITY,
            parent: None,
            children: vec![],
        };
        ecs_system.add_component(building_id, Box::new(transform)).await?;

        // Malla
        let mesh = MeshComponent {
            mesh_id: "building_mesh".to_string(),
            vertices: vec![
                Vec3::new(-2.5, 0.0, -2.5),
                Vec3::new(2.5, 0.0, -2.5),
                Vec3::new(2.5, 10.0, -2.5),
                Vec3::new(-2.5, 10.0, -2.5),
                Vec3::new(-2.5, 0.0, 2.5),
                Vec3::new(2.5, 0.0, 2.5),
                Vec3::new(2.5, 10.0, 2.5),
                Vec3::new(-2.5, 10.0, 2.5),
            ],
            normals: vec![Vec3::new(0.0, 1.0, 0.0); 8],
            uvs: vec![Vec3::new(0.0, 0.0, 0.0); 8],
            indices: vec![
                0, 1, 2, 0, 2, 3, // Front
                1, 5, 6, 1, 6, 2, // Right
                5, 4, 7, 5, 7, 6, // Back
                4, 0, 3, 4, 3, 7, // Left
                3, 2, 6, 3, 6, 7, // Top
                4, 5, 1, 4, 1, 0, // Bottom
            ],
            material_id: Some("building_material".to_string()),
            lod_level: 0,
        };
        ecs_system.add_component(building_id, Box::new(mesh)).await?;

        // Física
        let physics = metaverso_engine::ecs::PhysicsComponent {
            body_type: metaverso_engine::ecs::BodyType::Static,
            mass: 0.0,
            velocity: Vec3::ZERO,
            force: Vec3::ZERO,
            collision: true,
            collision_config: metaverso_engine::ecs::CollisionConfig {
                shape: metaverso_engine::ecs::CollisionShape::Box(Vec3::new(2.5, 5.0, 2.5)),
                filter: 2,
                material: "building".to_string(),
            },
        };
        ecs_system.add_component(building_id, Box::new(physics)).await?;
    }

    info!("🏢 Edificios creados");
    Ok(())
}

/// Crear avatares
async fn create_avatars(engine: &mut Engine3D) -> Result<()> {
    let ecs_system = engine.get_ecs_system();
    
    // Crear avatar del jugador
    let avatar_id = ecs_system.create_entity("Player_Avatar".to_string()).await?;

    // Transformación
    let transform = TransformComponent {
        position: Vec3::new(0.0, 1.0, 0.0),
        rotation: Quat::IDENTITY,
        scale: Vec3::new(1.0, 1.0, 1.0),
        matrix: Mat4::IDENTITY,
        parent: None,
        children: vec![],
    };
    ecs_system.add_component(avatar_id, Box::new(transform)).await?;

    // Malla del avatar
    let mesh = MeshComponent {
        mesh_id: "avatar_mesh".to_string(),
        vertices: vec![
            Vec3::new(0.0, 0.0, 0.0),
            Vec3::new(0.5, 0.0, 0.0),
            Vec3::new(0.5, 2.0, 0.0),
            Vec3::new(0.0, 2.0, 0.0),
        ],
        normals: vec![Vec3::new(0.0, 0.0, 1.0); 4],
        uvs: vec![Vec3::new(0.0, 0.0, 0.0); 4],
        indices: vec![0, 1, 2, 0, 2, 3],
        material_id: Some("avatar_material".to_string()),
        lod_level: 0,
    };
    ecs_system.add_component(avatar_id, Box::new(mesh)).await?;

    // Física del avatar
    let physics = metaverso_engine::ecs::PhysicsComponent {
        body_type: metaverso_engine::ecs::BodyType::Dynamic,
        mass: 70.0,
        velocity: Vec3::ZERO,
        force: Vec3::ZERO,
        collision: true,
        collision_config: metaverso_engine::ecs::CollisionConfig {
            shape: metaverso_engine::ecs::CollisionShape::Capsule(0.5, 2.0),
            filter: 4,
            material: "player".to_string(),
        },
    };
    ecs_system.add_component(avatar_id, Box::new(physics)).await?;

    // Componente de red
    let network = metaverso_engine::ecs::NetworkComponent {
        network_id: "player_network".to_string(),
        network_type: metaverso_engine::ecs::NetworkType::P2P,
        state: metaverso_engine::ecs::NetworkState {
            connected: true,
            latency: 0.0,
            packet_loss: 0.0,
        },
        config: metaverso_engine::ecs::NetworkConfig {
            port: 8080,
            host: "localhost".to_string(),
            protocol: "p2p".to_string(),
        },
    };
    ecs_system.add_component(avatar_id, Box::new(network)).await?;

    info!("👤 Avatar del jugador creado");
    Ok(())
}

/// Crear objetos interactivos
async fn create_interactive_objects(engine: &mut Engine3D) -> Result<()> {
    let ecs_system = engine.get_ecs_system();
    
    // Crear portal NFT
    let portal_id = ecs_system.create_entity("NFT_Portal".to_string()).await?;

    // Transformación
    let transform = TransformComponent {
        position: Vec3::new(0.0, 0.0, -30.0),
        rotation: Quat::IDENTITY,
        scale: Vec3::new(3.0, 3.0, 0.1),
        matrix: Mat4::IDENTITY,
        parent: None,
        children: vec![],
    };
    ecs_system.add_component(portal_id, Box::new(transform)).await?;

    // Malla del portal
    let mesh = MeshComponent {
        mesh_id: "portal_mesh".to_string(),
        vertices: vec![
            Vec3::new(-1.5, -1.5, 0.0),
            Vec3::new(1.5, -1.5, 0.0),
            Vec3::new(1.5, 1.5, 0.0),
            Vec3::new(-1.5, 1.5, 0.0),
        ],
        normals: vec![Vec3::new(0.0, 0.0, 1.0); 4],
        uvs: vec![Vec3::new(0.0, 0.0, 0.0); 4],
        indices: vec![0, 1, 2, 0, 2, 3],
        material_id: Some("portal_material".to_string()),
        lod_level: 0,
    };
    ecs_system.add_component(portal_id, Box::new(mesh)).await?;

    // Script del portal
    let script = metaverso_engine::ecs::ScriptComponent {
        script_id: "portal_script".to_string(),
        script_type: metaverso_engine::ecs::ScriptType::JavaScript,
        code: r#"
            // Script del portal NFT
            function onPlayerEnter(player) {
                // Verificar NFT
                if (player.hasNFT('portal_access')) {
                    teleportPlayer(player, 'nft_world');
                } else {
                    showMessage(player, 'Necesitas un NFT para acceder');
                }
            }
        "#.to_string(),
        state: metaverso_engine::ecs::ScriptState {
            loaded: true,
            running: true,
            error: None,
        },
    };
    ecs_system.add_component(portal_id, Box::new(script)).await?;

    info!("🚪 Portal NFT creado");
    Ok(())
}

/// Crear fuentes de audio
async fn create_audio_sources(engine: &mut Engine3D) -> Result<()> {
    let audio_system = engine.get_audio_system();
    
    // Música de fondo
    let background_music = AudioSource {
        id: "background_music".to_string(),
        name: "Música de Fondo".to_string(),
        source_type: AudioSourceType::Music,
        config: metaverso_engine::audio::AudioSourceConfig {
            audio_file: "audio/background_music.ogg".to_string(),
            volume: 0.3,
            pitch: 1.0,
            looped: true,
            spatial: false,
            distance_config: None,
            effects_config: None,
        },
        state: metaverso_engine::audio::AudioSourceState {
            active: true,
            playing: false,
            paused: false,
            playback_time: 0.0,
            position: Vec3::ZERO,
            velocity: Vec3::ZERO,
        },
        effects: vec!["reverb".to_string()],
    };
    audio_system.create_audio_source(background_music).await?;

    // Sonido ambiental
    let ambient_sound = AudioSource {
        id: "ambient_sound".to_string(),
        name: "Sonido Ambiental".to_string(),
        source_type: AudioSourceType::Ambient,
        config: metaverso_engine::audio::AudioSourceConfig {
            audio_file: "audio/ambient.ogg".to_string(),
            volume: 0.5,
            pitch: 1.0,
            looped: true,
            spatial: true,
            distance_config: Some(metaverso_engine::audio::DistanceConfig {
                min_distance: 1.0,
                max_distance: 50.0,
                rolloff: metaverso_engine::audio::RolloffType::Logarithmic,
                attenuation: 1.0,
            }),
            effects_config: None,
        },
        state: metaverso_engine::audio::AudioSourceState {
            active: true,
            playing: false,
            paused: false,
            playback_time: 0.0,
            position: Vec3::new(0.0, 0.0, 0.0),
            velocity: Vec3::ZERO,
        },
        effects: vec![],
    };
    audio_system.create_audio_source(ambient_sound).await?;

    info!("🎵 Fuentes de audio creadas");
    Ok(())
}

/// Crear efectos de iluminación
async fn create_lighting_effects(engine: &mut Engine3D) -> Result<()> {
    let ecs_system = engine.get_ecs_system();
    
    // Luz direccional (sol)
    let sun_id = ecs_system.create_entity("Sun".to_string()).await?;

    let sun_light = metaverso_engine::ecs::LightComponent {
        light_type: metaverso_engine::ecs::LightType::Directional,
        color: Vec3::new(1.0, 0.95, 0.8),
        intensity: 1.0,
        range: 1000.0,
        angle: 0.0,
        shadows: true,
        shadow_config: metaverso_engine::ecs::ShadowConfig {
            resolution: 2048,
            bias: 0.005,
            soft_shadows: true,
        },
    };
    ecs_system.add_component(sun_id, Box::new(sun_light)).await?;

    // Luz puntual (lámpara)
    let lamp_id = ecs_system.create_entity("Street_Lamp".to_string()).await?;

    let lamp_light = metaverso_engine::ecs::LightComponent {
        light_type: metaverso_engine::ecs::LightType::Point,
        color: Vec3::new(1.0, 1.0, 0.8),
        intensity: 0.8,
        range: 15.0,
        angle: 0.0,
        shadows: true,
        shadow_config: metaverso_engine::ecs::ShadowConfig {
            resolution: 1024,
            bias: 0.01,
            soft_shadows: false,
        },
    };
    ecs_system.add_component(lamp_id, Box::new(lamp_light)).await?;

    info!("💡 Efectos de iluminación creados");
    Ok(())
} 
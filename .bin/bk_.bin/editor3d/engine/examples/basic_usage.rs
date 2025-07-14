//! # Ejemplo Básico de Uso del Motor 3D
//! 
//! Este ejemplo muestra cómo inicializar y usar el motor 3D del metaverso.

use engine_3d::{
    Engine3D, EngineConfig, GeneralConfig, PerformanceConfig, GraphicsConfig,
    AntialiasingConfig, AntialiasingType, QualityConfig, QualityLevel,
    initialize_engine, run_engine_loop, cleanup_engine
};

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    // Configurar logging
    tracing_subscriber::fmt::init();
    
    println!("🚀 Iniciando ejemplo básico del motor 3D...");
    
    // Crear configuración del motor
    let config = EngineConfig {
        general_config: GeneralConfig {
            engine_name: "Metaverso Engine".to_string(),
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
            antialiasing: AntialiasingConfig {
                antialiasing_type: AntialiasingType::MSAA,
                antialiasing_level: 4,
            },
            quality_config: QualityConfig {
                quality_level: QualityLevel::High,
                lod_config: engine_3d::LODConfig {
                    enabled: true,
                    lod_levels: vec![
                        engine_3d::LODLevel { distance: 10.0, reduction_factor: 0.5 },
                        engine_3d::LODLevel { distance: 50.0, reduction_factor: 0.25 },
                        engine_3d::LODLevel { distance: 100.0, reduction_factor: 0.1 },
                    ],
                },
                shadow_config: engine_3d::ShadowConfig {
                    enabled: true,
                    shadow_resolution: 2048,
                    cascade_config: engine_3d::CascadeConfig {
                        cascade_count: 4,
                        split_config: engine_3d::SplitConfig {
                            split_factor: 0.5,
                            bias_config: engine_3d::BiasConfig {
                                constant_bias: 0.001,
                                slope_bias: 0.001,
                            },
                        },
                    },
                },
            },
        },
        physics_config: engine_3d::physics::PhysicsConfig {
            physics_enabled: true,
            gravity: [0.0, -9.81, 0.0],
            simulation_config: engine_3d::physics::SimulationConfig {
                time_step: 1.0 / 60.0,
                max_sub_steps: 10,
                solver_config: engine_3d::physics::SolverConfig {
                    solver_type: engine_3d::physics::SolverType::Islands,
                    iterations: 10,
                    tolerance: 0.001,
                },
            },
            collision_config: engine_3d::physics::CollisionConfig {
                collision_detection: true,
                broad_phase_config: engine_3d::physics::BroadPhaseConfig {
                    broad_phase_type: engine_3d::physics::BroadPhaseType::SAP,
                    max_objects: 10000,
                },
                narrow_phase_config: engine_3d::physics::NarrowPhaseConfig {
                    narrow_phase_type: engine_3d::physics::NarrowPhaseType::GJK,
                    contact_manifold: true,
                },
            },
            rigid_body_config: engine_3d::physics::RigidBodyConfig {
                rigid_bodies_enabled: true,
                max_rigid_bodies: 1000,
                sleeping_config: engine_3d::physics::SleepingConfig {
                    sleeping_enabled: true,
                    sleep_threshold: 0.1,
                    wake_threshold: 0.2,
                },
            },
            soft_body_config: engine_3d::physics::SoftBodyConfig {
                soft_bodies_enabled: false,
                max_soft_bodies: 100,
                solver_config: engine_3d::physics::SoftBodySolverConfig {
                    solver_type: engine_3d::physics::SoftBodySolverType::PositionBased,
                    iterations: 5,
                    stiffness: 0.5,
                },
            },
            fluid_config: engine_3d::physics::FluidConfig {
                fluids_enabled: false,
                max_particles: 10000,
                solver_config: engine_3d::physics::FluidSolverConfig {
                    solver_type: engine_3d::physics::FluidSolverType::SPH,
                    smoothing_length: 1.0,
                    density: 1000.0,
                },
            },
        },
        networking_config: engine_3d::networking::NetworkingConfig {
            networking_enabled: true,
            network_type: engine_3d::networking::NetworkType::P2P,
            p2p_config: engine_3d::networking::P2PConfig {
                p2p_enabled: true,
                discovery_config: engine_3d::networking::DiscoveryConfig {
                    discovery_enabled: true,
                    discovery_method: engine_3d::networking::DiscoveryMethod::DHT,
                    bootstrap_nodes: vec![],
                },
                connection_config: engine_3d::networking::ConnectionConfig {
                    max_connections: 100,
                    connection_timeout: 30,
                    keep_alive: true,
                },
                message_config: engine_3d::networking::MessageConfig {
                    message_types: vec![
                        engine_3d::networking::MessageType::Position,
                        engine_3d::networking::MessageType::Animation,
                        engine_3d::networking::MessageType::Chat,
                    ],
                    compression: true,
                    encryption: true,
                },
            },
            client_server_config: engine_3d::networking::ClientServerConfig {
                client_server_enabled: false,
                server_config: engine_3d::networking::ServerConfig {
                    server_address: "127.0.0.1:8080".to_string(),
                    max_clients: 1000,
                    tick_rate: 60,
                },
                client_config: engine_3d::networking::ClientConfig {
                    client_address: "127.0.0.1:0".to_string(),
                    connection_timeout: 30,
                    reconnect: true,
                },
            },
        },
        wasm_config: engine_3d::wasm::WASMConfig {
            wasm_enabled: true,
            runtime_config: engine_3d::wasm::RuntimeConfig {
                runtime_type: engine_3d::wasm::RuntimeType::Wasmtime,
                memory_config: engine_3d::wasm::MemoryConfig {
                    initial_memory: 64,
                    max_memory: 1024,
                    memory_growth: true,
                },
                threading_config: engine_3d::wasm::ThreadingConfig {
                    threading_enabled: true,
                    max_threads: 4,
                    thread_pool_size: 8,
                },
            },
            module_config: engine_3d::wasm::ModuleConfig {
                module_loading: true,
                module_caching: true,
                module_validation: true,
            },
            binding_config: engine_3d::wasm::BindingConfig {
                bindings_enabled: true,
                api_bindings: vec![
                    engine_3d::wasm::APIBinding::Math,
                    engine_3d::wasm::APIBinding::Physics,
                    engine_3d::wasm::APIBinding::Rendering,
                ],
            },
        },
        renderer_config: engine_3d::renderer::RendererConfig {
            renderer_enabled: true,
            api_config: engine_3d::renderer::APIConfig {
                api_type: engine_3d::renderer::APIType::WebGL,
                version: "2.0".to_string(),
                extensions: vec![],
            },
            pipeline_config: engine_3d::renderer::PipelineConfig {
                pipeline_type: engine_3d::renderer::PipelineType::Forward,
                shader_config: engine_3d::renderer::ShaderConfig {
                    shader_loading: true,
                    shader_compilation: true,
                    shader_caching: true,
                },
            },
            optimization_config: engine_3d::renderer::OptimizationConfig {
                optimization_enabled: true,
                culling_config: engine_3d::renderer::CullingConfig {
                    frustum_culling: true,
                    occlusion_culling: true,
                    backface_culling: true,
                },
                batching_config: engine_3d::renderer::BatchingConfig {
                    batching_enabled: true,
                    batch_size: 1000,
                    instancing: true,
                },
            },
        },
        scene_config: engine_3d::scene::SceneConfig {
            scene_management: true,
            scene_graph: true,
            spatial_indexing: true,
        },
        camera_config: engine_3d::camera::CameraConfig {
            camera_management: true,
            camera_types: vec![
                engine_3d::camera::CameraType::Perspective,
                engine_3d::camera::CameraType::Orthographic,
            ],
        },
        lighting_config: engine_3d::lighting::LightingConfig {
            lighting_enabled: true,
            light_types: vec![
                engine_3d::lighting::LightType::Directional,
                engine_3d::lighting::LightType::Point,
                engine_3d::lighting::LightType::Spot,
            ],
        },
        material_config: engine_3d::materials::MaterialConfig {
            material_system: true,
            pbr_materials: true,
            shader_materials: true,
        },
        animation_config: engine_3d::animations::AnimationConfig {
            animation_system: true,
            skeletal_animation: true,
            morphing_animation: true,
        },
        audio_config: engine_3d::audio::AudioConfig {
            spatial_audio: true,
            sound_effects: true,
            background_music: true,
            webaudio_config: engine_3d::audio::WebAudioConfig {
                context_config: engine_3d::audio::AudioContextConfig {
                    context_type: engine_3d::audio::AudioContextType::Standard,
                    latency_hint: engine_3d::audio::LatencyHint::Interactive,
                    sample_rate: None,
                },
                sample_rate: 44100,
                buffer_size: 2048,
                channels: 2,
            },
            hrtf_config: None,
            reverb_config: None,
        },
        crypto_config: engine_3d::crypto::CryptoConfig {
            transaction_verification: true,
            nft_support: true,
            token_support: true,
            smart_contract_support: true,
            blockchain_config: engine_3d::crypto::BlockchainConfig {
                network: engine_3d::crypto::BlockchainNetwork::Ethereum,
                rpc_config: engine_3d::crypto::RPCConfig {
                    rpc_url: "https://mainnet.infura.io/v3/your-project-id".to_string(),
                    timeout: 30,
                    retry_config: engine_3d::crypto::RetryConfig {
                        max_retries: 3,
                        retry_delay: 1000,
                        backoff_factor: 2.0,
                    },
                },
                gas_config: engine_3d::crypto::GasConfig {
                    gas_limit: 21000,
                    gas_price: 20000000000,
                    estimation_config: engine_3d::crypto::GasEstimationConfig {
                        enabled: true,
                        safety_factor: 1.1,
                        buffer_config: engine_3d::crypto::BufferConfig {
                            buffer_size: 1024,
                            timeout: 5000,
                        },
                    },
                },
                confirmation_config: engine_3d::crypto::ConfirmationConfig {
                    required_confirmations: 12,
                    timeout: 300000,
                    polling_config: engine_3d::crypto::PollingConfig {
                        polling_interval: 5000,
                        max_attempts: 60,
                    },
                },
            },
            wallet_config: engine_3d::crypto::WalletConfig {
                wallets: HashMap::new(),
                security_config: engine_3d::crypto::SecurityConfig {
                    encryption_config: engine_3d::crypto::EncryptionConfig {
                        algorithm: engine_3d::crypto::EncryptionAlgorithm::AES256,
                        key_config: engine_3d::crypto::KeyConfig {
                            key_size: 256,
                            derivation_config: engine_3d::crypto::KeyDerivationConfig {
                                algorithm: engine_3d::crypto::KeyDerivationAlgorithm::PBKDF2,
                                iterations: 100000,
                                salt_config: engine_3d::crypto::SaltConfig {
                                    salt_size: 32,
                                    salt: None,
                                },
                            },
                        },
                        salt_config: engine_3d::crypto::SaltConfig {
                            salt_size: 32,
                            salt: None,
                        },
                    },
                    authentication_config: engine_3d::crypto::AuthenticationConfig {
                        method: engine_3d::crypto::AuthenticationMethod::Password,
                        mfa_config: None,
                    },
                    authorization_config: engine_3d::crypto::AuthorizationConfig {
                        allowed_roles: vec!["user".to_string(), "admin".to_string()],
                        permissions_config: engine_3d::crypto::PermissionsConfig {
                            read_permissions: vec!["read".to_string()],
                            write_permissions: vec!["write".to_string()],
                            execute_permissions: vec!["execute".to_string()],
                        },
                    },
                },
                backup_config: engine_3d::crypto::BackupConfig {
                    enabled: true,
                    frequency_config: engine_3d::crypto::FrequencyConfig {
                        frequency_type: engine_3d::crypto::FrequencyType::Daily,
                        interval: 86400,
                    },
                    storage_config: engine_3d::crypto::StorageConfig {
                        storage_type: engine_3d::crypto::StorageType::Local,
                        encryption_config: engine_3d::crypto::EncryptionConfig {
                            algorithm: engine_3d::crypto::EncryptionAlgorithm::AES256,
                            key_config: engine_3d::crypto::KeyConfig {
                                key_size: 256,
                                derivation_config: engine_3d::crypto::KeyDerivationConfig {
                                    algorithm: engine_3d::crypto::KeyDerivationAlgorithm::PBKDF2,
                                    iterations: 100000,
                                    salt_config: engine_3d::crypto::SaltConfig {
                                        salt_size: 32,
                                        salt: None,
                                    },
                                },
                            },
                            salt_config: engine_3d::crypto::SaltConfig {
                                salt_size: 32,
                                salt: None,
                            },
                        },
                    },
                },
            },
        },
        utils_config: engine_3d::utils::UtilsConfig {
            dev_tools_enabled: true,
            math_utils_enabled: true,
            time_utils_enabled: true,
            file_utils_enabled: true,
            logging_config: engine_3d::utils::LoggingConfig {
                enabled: true,
                log_level: engine_3d::utils::LogLevel::Info,
                file_config: engine_3d::utils::FileLogConfig {
                    enabled: true,
                    file_path: "logs/engine.log".to_string(),
                    rotation_config: engine_3d::utils::RotationConfig {
                        max_size: 10 * 1024 * 1024, // 10MB
                        max_files: 5,
                        compression: true,
                    },
                },
                console_config: engine_3d::utils::ConsoleLogConfig {
                    enabled: true,
                    colors: true,
                    timestamp: true,
                },
            },
            debugging_config: engine_3d::utils::DebuggingConfig {
                enabled: true,
                breakpoints: true,
                profiling: true,
                memory_tracking: true,
            },
        },
    };
    
    // Inicializar motor
    let mut engine = initialize_engine(&config).await?;
    
    println!("✅ Motor inicializado correctamente");
    
    // Ejecutar bucle principal
    println!("🔄 Iniciando bucle principal...");
    run_engine_loop(&mut engine).await?;
    
    // Limpiar motor
    println!("🧹 Limpiando motor...");
    cleanup_engine(&mut engine).await?;
    
    println!("✅ Ejemplo completado correctamente");
    Ok(())
} 
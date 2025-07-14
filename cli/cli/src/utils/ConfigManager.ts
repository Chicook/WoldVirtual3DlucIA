import { readFile, writeFile, access } from 'fs/promises'
import { existsSync } from 'fs'
import { join } from 'path'
import { Logger } from './Logger'
import { z } from 'zod'

// Esquemas de validación
const NetworkConfigSchema = z.object({
  name: z.string(),
  chainId: z.number(),
  rpcUrl: z.string().url(),
  explorerUrl: z.string().url().optional(),
  nativeCurrency: z.object({
    name: z.string(),
    symbol: z.string(),
    decimals: z.number()
  }),
  enabled: z.boolean().default(true)
})

const ContractConfigSchema = z.object({
  compiler: z.object({
    version: z.string(),
    optimizer: z.object({
      enabled: z.boolean(),
      runs: z.number()
    }),
    viaIR: z.boolean().default(true)
  }),
  gas: z.object({
    limit: z.number().optional(),
    price: z.string().optional(),
    reports: z.boolean().default(true)
  }),
  verification: z.object({
    enabled: z.boolean().default(false),
    apiKeys: z.record(z.string()).optional()
  })
})

const BackendConfigSchema = z.object({
  server: z.object({
    port: z.number().default(3000),
    host: z.string().default('localhost'),
    cors: z.boolean().default(true)
  }),
  database: z.object({
    url: z.string(),
    type: z.enum(['postgresql', 'mysql', 'sqlite', 'mongodb']),
    pool: z.object({
      min: z.number().default(2),
      max: z.number().default(10)
    }).optional()
  }),
  auth: z.object({
    jwt: z.object({
      secret: z.string(),
      expiresIn: z.string().default('24h')
    }),
    oauth: z.object({
      enabled: z.boolean().default(false),
      providers: z.record(z.object({
        clientId: z.string(),
        clientSecret: z.string()
      })).optional()
    })
  })
})

const FrontendConfigSchema = z.object({
  build: z.object({
    target: z.enum(['es2015', 'es2017', 'es2020', 'esnext']).default('es2020'),
    format: z.enum(['es', 'cjs', 'umd', 'iife']).default('es'),
    minify: z.boolean().default(true),
    sourcemap: z.boolean().default(false)
  }),
  dev: z.object({
    port: z.number().default(5173),
    host: z.string().default('localhost'),
    https: z.boolean().default(false)
  }),
  assets: z.object({
    baseUrl: z.string().default('/'),
    cdn: z.boolean().default(false),
    compression: z.boolean().default(true)
  })
})

const AssetConfigSchema = z.object({
  images: z.object({
    formats: z.array(z.enum(['webp', 'avif', 'jpeg', 'png'])).default(['webp', 'jpeg']),
    quality: z.number().min(1).max(100).default(85),
    maxWidth: z.number().optional(),
    maxHeight: z.number().optional(),
    generateThumbnails: z.boolean().default(true)
  }),
  audio: z.object({
    formats: z.array(z.enum(['mp3', 'ogg', 'wav'])).default(['mp3', 'ogg']),
    quality: z.number().min(1).max(100).default(80),
    bitrate: z.number().default(128)
  }),
  video: z.object({
    formats: z.array(z.enum(['mp4', 'webm'])).default(['mp4', 'webm']),
    quality: z.number().min(1).max(100).default(80),
    maxBitrate: z.number().default(2000)
  }),
  models: z.object({
    formats: z.array(z.enum(['gltf', 'glb', 'obj', 'fbx'])).default(['gltf', 'glb']),
    optimization: z.boolean().default(true),
    compression: z.boolean().default(true)
  })
})

const MetaverseConfigSchema = z.object({
  world: z.object({
    name: z.string(),
    description: z.string().optional(),
    version: z.string().default('1.0.0'),
    maxPlayers: z.number().default(100),
    physics: z.object({
      gravity: z.number().default(-9.81),
      collisionDetection: z.boolean().default(true)
    })
  }),
  avatars: z.object({
    customization: z.boolean().default(true),
    maxHeight: z.number().default(2.5),
    minHeight: z.number().default(1.0),
    defaultHeight: z.number().default(1.7)
  }),
  interactions: z.object({
    chat: z.boolean().default(true),
    gestures: z.boolean().default(true),
    trading: z.boolean().default(true),
    social: z.boolean().default(true)
  })
})

const SecurityConfigSchema = z.object({
  cors: z.object({
    enabled: z.boolean().default(true),
    origins: z.array(z.string()).default(['*']),
    methods: z.array(z.string()).default(['GET', 'POST', 'PUT', 'DELETE']),
    credentials: z.boolean().default(true)
  }),
  rateLimit: z.object({
    enabled: z.boolean().default(true),
    windowMs: z.number().default(15 * 60 * 1000), // 15 minutes
    max: z.number().default(100)
  }),
  helmet: z.object({
    enabled: z.boolean().default(true),
    contentSecurityPolicy: z.boolean().default(true),
    hsts: z.boolean().default(true)
  }),
  validation: z.object({
    enabled: z.boolean().default(true),
    sanitize: z.boolean().default(true),
    escape: z.boolean().default(true)
  })
})

const MonitoringConfigSchema = z.object({
  enabled: z.boolean().default(true),
  metrics: z.object({
    enabled: z.boolean().default(true),
    interval: z.number().default(60000), // 1 minute
    retention: z.number().default(7 * 24 * 60 * 60 * 1000) // 7 days
  }),
  logging: z.object({
    level: z.enum(['debug', 'info', 'warn', 'error']).default('info'),
    file: z.boolean().default(true),
    console: z.boolean().default(true),
    retention: z.number().default(30 * 24 * 60 * 60 * 1000) // 30 days
  }),
  alerts: z.object({
    enabled: z.boolean().default(false),
    email: z.object({
      enabled: z.boolean().default(false),
      recipients: z.array(z.string()).default([])
    }),
    webhook: z.object({
      enabled: z.boolean().default(false),
      url: z.string().url().optional()
    })
  })
})

const MetaversoConfigSchema = z.object({
  version: z.string(),
  environment: z.enum(['development', 'staging', 'production']).default('development'),
  networks: z.array(NetworkConfigSchema),
  contracts: ContractConfigSchema,
  backend: BackendConfigSchema,
  frontend: FrontendConfigSchema,
  assets: AssetConfigSchema,
  metaverse: MetaverseConfigSchema,
  security: SecurityConfigSchema,
  monitoring: MonitoringConfigSchema,
  paths: z.object({
    contracts: z.string().default('./contracts'),
    backend: z.string().default('./backend'),
    frontend: z.string().default('./client'),
    assets: z.string().default('./assets'),
    build: z.string().default('./build'),
    logs: z.string().default('./logs')
  }).optional()
})

export type MetaversoConfig = z.infer<typeof MetaversoConfigSchema>

export class ConfigManager {
  private config: MetaversoConfig | null = null
  private configPath: string = ''
  private logger: Logger

  constructor() {
    this.logger = new Logger('ConfigManager')
  }

  /**
   * Carga la configuración desde un archivo
   */
  async loadConfig(path: string): Promise<MetaversoConfig> {
    try {
      this.logger.info(`Cargando configuración desde: ${path}`)
      
      const configData = await readFile(path, 'utf-8')
      const parsedConfig = JSON.parse(configData)
      
      // Validar configuración
      const validatedConfig = MetaversoConfigSchema.parse(parsedConfig)
      
      this.config = validatedConfig
      this.configPath = path
      
      this.logger.success('Configuración cargada exitosamente')
      return validatedConfig
    } catch (error) {
      this.logger.error('Error al cargar configuración:', error as Error)
      throw error
    }
  }

  /**
   * Carga la configuración por defecto
   */
  async loadDefaultConfig(): Promise<MetaversoConfig> {
    const defaultPaths = [
      './metaverso.config.json',
      './config/metaverso.json',
      './.metaverso/config.json'
    ]

    for (const path of defaultPaths) {
      try {
        if (existsSync(path)) {
          return await this.loadConfig(path)
        }
      } catch (error) {
        this.logger.warn(`No se pudo cargar configuración desde: ${path}`)
      }
    }

    // Crear configuración por defecto
    return this.createDefaultConfig()
  }

  /**
   * Crea una configuración por defecto
   */
  createDefaultConfig(): MetaversoConfig {
    const defaultConfig: MetaversoConfig = {
      version: '1.0.0',
      environment: 'development',
      networks: [
        {
          name: 'Ethereum Mainnet',
          chainId: 1,
          rpcUrl: 'https://mainnet.infura.io/v3/YOUR_PROJECT_ID',
          explorerUrl: 'https://etherscan.io',
          nativeCurrency: {
            name: 'Ether',
            symbol: 'ETH',
            decimals: 18
          },
          enabled: false
        },
        {
          name: 'Polygon',
          chainId: 137,
          rpcUrl: 'https://polygon-rpc.com',
          explorerUrl: 'https://polygonscan.com',
          nativeCurrency: {
            name: 'MATIC',
            symbol: 'MATIC',
            decimals: 18
          },
          enabled: true
        }
      ],
      contracts: {
        compiler: {
          version: '0.8.19',
          optimizer: {
            enabled: true,
            runs: 200
          },
          viaIR: true
        },
        gas: {
          reports: true
        },
        verification: {
          enabled: false
        }
      },
      backend: {
        server: {
          port: 3000,
          host: 'localhost',
          cors: true
        },
        database: {
          url: 'postgresql://localhost:5432/metaverso',
          type: 'postgresql',
          pool: {
            min: 2,
            max: 10
          }
        },
        auth: {
          jwt: {
            secret: 'your-super-secret-jwt-key',
            expiresIn: '24h'
          },
          oauth: {
            enabled: false
          }
        }
      },
      frontend: {
        build: {
          target: 'es2020',
          format: 'es',
          minify: true,
          sourcemap: false
        },
        dev: {
          port: 5173,
          host: 'localhost',
          https: false
        },
        assets: {
          baseUrl: '/',
          cdn: false,
          compression: true
        }
      },
      assets: {
        images: {
          formats: ['webp', 'jpeg'],
          quality: 85,
          generateThumbnails: true
        },
        audio: {
          formats: ['mp3', 'ogg'],
          quality: 80,
          bitrate: 128
        },
        video: {
          formats: ['mp4', 'webm'],
          quality: 80,
          maxBitrate: 2000
        },
        models: {
          formats: ['gltf', 'glb'],
          optimization: true,
          compression: true
        }
      },
      metaverse: {
        world: {
          name: 'Metaverso Web3',
          description: 'Metaverso descentralizado construido con Web3',
          version: '1.0.0',
          maxPlayers: 100,
          physics: {
            gravity: -9.81,
            collisionDetection: true
          }
        },
        avatars: {
          customization: true,
          maxHeight: 2.5,
          minHeight: 1.0,
          defaultHeight: 1.7
        },
        interactions: {
          chat: true,
          gestures: true,
          trading: true,
          social: true
        }
      },
      security: {
        cors: {
          enabled: true,
          origins: ['*'],
          methods: ['GET', 'POST', 'PUT', 'DELETE'],
          credentials: true
        },
        rateLimit: {
          enabled: true,
          windowMs: 15 * 60 * 1000,
          max: 100
        },
        helmet: {
          enabled: true,
          contentSecurityPolicy: true,
          hsts: true
        },
        validation: {
          enabled: true,
          sanitize: true,
          escape: true
        }
      },
      monitoring: {
        enabled: true,
        metrics: {
          enabled: true,
          interval: 60000,
          retention: 7 * 24 * 60 * 60 * 1000
        },
        logging: {
          level: 'info',
          file: true,
          console: true,
          retention: 30 * 24 * 60 * 60 * 1000
        },
        alerts: {
          enabled: false,
          email: {
            enabled: false,
            recipients: []
          },
          webhook: {
            enabled: false
          }
        }
      }
    }

    this.config = defaultConfig
    return defaultConfig
  }

  /**
   * Guarda la configuración actual
   */
  async saveConfig(path?: string): Promise<void> {
    try {
      if (!this.config) {
        throw new Error('No hay configuración para guardar')
      }

      const savePath = path || this.configPath || './metaverso.config.json'
      const configData = JSON.stringify(this.config, null, 2)
      
      await writeFile(savePath, configData, 'utf-8')
      
      this.logger.success(`Configuración guardada en: ${savePath}`)
    } catch (error) {
      this.logger.error('Error al guardar configuración:', error as Error)
      throw error
    }
  }

  /**
   * Obtiene la configuración actual
   */
  getConfig(): MetaversoConfig | null {
    return this.config
  }

  /**
   * Obtiene una sección específica de la configuración
   */
  getSection<T extends keyof MetaversoConfig>(section: T): MetaversoConfig[T] | null {
    return this.config ? this.config[section] : null
  }

  /**
   * Actualiza una sección de la configuración
   */
  updateSection<T extends keyof MetaversoConfig>(
    section: T, 
    data: Partial<MetaversoConfig[T]>
  ): void {
    if (!this.config) {
      throw new Error('No hay configuración cargada')
    }

    this.config[section] = {
      ...this.config[section],
      ...data
    } as MetaversoConfig[T]

    this.logger.info(`Sección ${String(section)} actualizada`)
  }

  /**
   * Valida la configuración actual
   */
  validateConfig(): boolean {
    try {
      if (!this.config) {
        return false
      }

      MetaversoConfigSchema.parse(this.config)
      return true
    } catch (error) {
      this.logger.error('Configuración inválida:', error as Error)
      return false
    }
  }

  /**
   * Obtiene la configuración para un entorno específico
   */
  getEnvironmentConfig(environment: string): Partial<MetaversoConfig> {
    if (!this.config) {
      return {}
    }

    // Aquí podrías implementar lógica para cargar configuraciones específicas por entorno
    return this.config
  }

  /**
   * Resetea la configuración
   */
  reset(): void {
    this.config = null
    this.configPath = ''
    this.logger.info('Configuración reseteada')
  }

  /**
   * Obtiene estadísticas de la configuración
   */
  getStats(): any {
    return {
      loaded: !!this.config,
      path: this.configPath,
      environment: this.config?.environment,
      networks: this.config?.networks.length || 0,
      version: this.config?.version
    }
  }
} 
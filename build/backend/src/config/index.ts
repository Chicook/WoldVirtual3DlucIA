import dotenv from 'dotenv';

dotenv.config();

export const config = {
  // Configuración del servidor
  server: {
    port: parseInt(process.env.PORT || '3001', 10),
    host: process.env.HOST || 'localhost',
    environment: process.env.NODE_ENV || 'development',
    isProduction: process.env.NODE_ENV === 'production',
    isDevelopment: process.env.NODE_ENV === 'development',
    isTest: process.env.NODE_ENV === 'test'
  },

  // Configuración de CORS
  cors: {
    origins: process.env.CORS_ORIGINS?.split(',') || [
      'http://localhost:3000',
      'http://localhost:3001',
      'http://localhost:5173',
      'http://localhost:8080'
    ],
    credentials: true
  },

  // Configuración de base de datos
  database: {
    url: process.env.DATABASE_URL || 'postgresql://localhost:5432/woldvirtual_build',
    type: process.env.DATABASE_TYPE || 'postgresql',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    username: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || 'password',
    database: process.env.DB_NAME || 'woldvirtual_build',
    ssl: process.env.DB_SSL === 'true',
    pool: {
      min: parseInt(process.env.DB_POOL_MIN || '2', 10),
      max: parseInt(process.env.DB_POOL_MAX || '10', 10),
      acquire: parseInt(process.env.DB_POOL_ACQUIRE || '30000', 10),
      idle: parseInt(process.env.DB_POOL_IDLE || '10000', 10)
    }
  },

  // Configuración de Redis
  redis: {
    url: process.env.REDIS_URL || 'redis://localhost:6379',
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379', 10),
    password: process.env.REDIS_PASSWORD,
    db: parseInt(process.env.REDIS_DB || '0', 10),
    keyPrefix: process.env.REDIS_KEY_PREFIX || 'woldvirtual:build:'
  },

  // Configuración de JWT
  jwt: {
    secret: process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production',
    expiresIn: process.env.JWT_EXPIRES_IN || '24h',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
    issuer: process.env.JWT_ISSUER || 'woldvirtual-build',
    audience: process.env.JWT_AUDIENCE || 'woldvirtual-build-api'
  },

  // Configuración de logging
  logging: {
    level: process.env.LOG_LEVEL || 'info',
    format: process.env.LOG_FORMAT || 'json',
    file: process.env.LOG_FILE || 'logs/backend.log',
    maxSize: process.env.LOG_MAX_SIZE || '20m',
    maxFiles: process.env.LOG_MAX_FILES || '14d'
  },

  // Configuración de build
  build: {
    maxConcurrency: parseInt(process.env.BUILD_MAX_CONCURRENCY || '4', 10),
    timeout: parseInt(process.env.BUILD_TIMEOUT || '300000', 10), // 5 minutos
    retryAttempts: parseInt(process.env.BUILD_RETRY_ATTEMPTS || '3', 10),
    retryDelay: parseInt(process.env.BUILD_RETRY_DELAY || '5000', 10),
    cleanupInterval: parseInt(process.env.BUILD_CLEANUP_INTERVAL || '3600000', 10), // 1 hora
    maxQueueSize: parseInt(process.env.BUILD_MAX_QUEUE_SIZE || '100', 10)
  },

  // Configuración de notificaciones
  notifications: {
    email: {
      enabled: process.env.EMAIL_ENABLED === 'true',
      host: process.env.EMAIL_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.EMAIL_PORT || '587', 10),
      secure: process.env.EMAIL_SECURE === 'true',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    },
    webhook: {
      enabled: process.env.WEBHOOK_ENABLED === 'true',
      url: process.env.WEBHOOK_URL,
      secret: process.env.WEBHOOK_SECRET
    },
    slack: {
      enabled: process.env.SLACK_ENABLED === 'true',
      webhookUrl: process.env.SLACK_WEBHOOK_URL,
      channel: process.env.SLACK_CHANNEL || '#builds'
    }
  },

  // Configuración de almacenamiento
  storage: {
    type: process.env.STORAGE_TYPE || 'local', // local, s3, gcs
    local: {
      path: process.env.STORAGE_LOCAL_PATH || './uploads'
    },
    s3: {
      bucket: process.env.S3_BUCKET,
      region: process.env.S3_REGION || 'us-east-1',
      accessKeyId: process.env.S3_ACCESS_KEY_ID,
      secretAccessKey: process.env.S3_SECRET_ACCESS_KEY
    },
    gcs: {
      bucket: process.env.GCS_BUCKET,
      projectId: process.env.GCS_PROJECT_ID,
      keyFilename: process.env.GCS_KEY_FILENAME
    }
  },

  // Configuración de seguridad
  security: {
    bcryptRounds: parseInt(process.env.BCRYPT_ROUNDS || '12', 10),
    rateLimitWindow: parseInt(process.env.RATE_LIMIT_WINDOW || '900000', 10), // 15 minutos
    rateLimitMax: parseInt(process.env.RATE_LIMIT_MAX || '100', 10),
    sessionSecret: process.env.SESSION_SECRET || 'your-super-secret-session-key',
    csrfEnabled: process.env.CSRF_ENABLED === 'true'
  },

  // Configuración de monitoreo
  monitoring: {
    enabled: process.env.MONITORING_ENABLED === 'true',
    metrics: {
      enabled: process.env.METRICS_ENABLED === 'true',
      port: parseInt(process.env.METRICS_PORT || '9090', 10)
    },
    health: {
      enabled: process.env.HEALTH_ENABLED === 'true',
      interval: parseInt(process.env.HEALTH_INTERVAL || '30000', 10) // 30 segundos
    }
  },

  // Configuración de cache
  cache: {
    ttl: parseInt(process.env.CACHE_TTL || '3600', 10), // 1 hora
    maxSize: parseInt(process.env.CACHE_MAX_SIZE || '1000', 10),
    checkPeriod: parseInt(process.env.CACHE_CHECK_PERIOD || '600', 10) // 10 minutos
  },

  // Configuración de WebSocket
  websocket: {
    cors: {
      origin: process.env.WS_CORS_ORIGIN?.split(',') || ['http://localhost:3000'],
      methods: ['GET', 'POST']
    },
    pingTimeout: parseInt(process.env.WS_PING_TIMEOUT || '60000', 10),
    pingInterval: parseInt(process.env.WS_PING_INTERVAL || '25000', 10)
  }
};

// Validación de configuración crítica
export function validateConfig(): void {
  const requiredEnvVars = [
    'JWT_SECRET',
    'DATABASE_URL'
  ];

  const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
  
  if (missingVars.length > 0) {
    throw new Error(`Variables de entorno requeridas faltantes: ${missingVars.join(', ')}`);
  }

  if (config.server.isProduction && config.jwt.secret === 'your-super-secret-jwt-key-change-in-production') {
    throw new Error('JWT_SECRET debe ser cambiado en producción');
  }
}

// Exportar configuración validada
export default config; 
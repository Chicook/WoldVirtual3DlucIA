import winston from 'winston'

export interface LogLevel {
  error: 0
  warn: 1
  info: 2
  http: 3
  verbose: 4
  debug: 5
  silly: 6
}

export interface LogEntry {
  timestamp: string
  level: string
  message: string
  module: string
  metadata?: any
}

export class Logger {
  private logger: winston.Logger
  private module: string

  constructor(module: string) {
    this.module = module
    this.logger = this.createLogger()
  }

  /**
   * Crea una instancia de Winston logger
   */
  private createLogger(): winston.Logger {
    const logFormat = winston.format.combine(
      winston.format.timestamp({
        format: 'YYYY-MM-DD HH:mm:ss'
      }),
      winston.format.errors({ stack: true }),
      winston.format.json(),
      winston.format.printf(({ timestamp, level, message, module, ...metadata }) => {
        let msg = `${timestamp} [${level.toUpperCase()}] [${module}] ${message}`
        
        if (Object.keys(metadata).length > 0) {
          msg += ` ${JSON.stringify(metadata)}`
        }
        
        return msg
      })
    )

    const transports: winston.transport[] = [
      // Console transport
      new winston.transports.Console({
        format: winston.format.combine(
          winston.format.colorize(),
          winston.format.simple()
        )
      })
    ]

    // File transports for different levels
    if (process.env.NODE_ENV === 'production') {
      transports.push(
        new winston.transports.File({
          filename: 'logs/error.log',
          level: 'error',
          format: logFormat
        }),
        new winston.transports.File({
          filename: 'logs/combined.log',
          format: logFormat
        })
      )
    }

    return winston.createLogger({
      level: process.env.LOG_LEVEL || 'info',
      format: logFormat,
      transports,
      defaultMeta: { module: this.module }
    })
  }

  /**
   * Log error message
   */
  error(message: string, error?: any): void {
    const metadata = error ? { error: error.message, stack: error.stack } : {}
    this.logger.error(message, metadata)
  }

  /**
   * Log warning message
   */
  warn(message: string, metadata?: any): void {
    this.logger.warn(message, metadata)
  }

  /**
   * Log info message
   */
  info(message: string, metadata?: any): void {
    this.logger.info(message, metadata)
  }

  /**
   * Log debug message
   */
  debug(message: string, metadata?: any): void {
    this.logger.debug(message, metadata)
  }

  /**
   * Log verbose message
   */
  verbose(message: string, metadata?: any): void {
    this.logger.verbose(message, metadata)
  }

  /**
   * Log silly message
   */
  silly(message: string, metadata?: any): void {
    this.logger.silly(message, metadata)
  }

  /**
   * Log HTTP request
   */
  http(message: string, metadata?: any): void {
    this.logger.http(message, metadata)
  }

  /**
   * Log blockchain transaction
   */
  transaction(hash: string, method: string, metadata?: any): void {
    this.info(`Transaction ${method}`, {
      hash,
      method,
      ...metadata
    })
  }

  /**
   * Log blockchain event
   */
  event(eventName: string, contract: string, metadata?: any): void {
    this.info(`Event ${eventName}`, {
      event: eventName,
      contract,
      ...metadata
    })
  }

  /**
   * Log DeFi operation
   */
  defi(protocol: string, operation: string, metadata?: any): void {
    this.info(`DeFi ${operation}`, {
      protocol,
      operation,
      ...metadata
    })
  }

  /**
   * Log NFT operation
   */
  nft(operation: string, tokenId: string, metadata?: any): void {
    this.info(`NFT ${operation}`, {
      operation,
      tokenId,
      ...metadata
    })
  }

  /**
   * Log network operation
   */
  network(operation: string, network: string, metadata?: any): void {
    this.info(`Network ${operation}`, {
      operation,
      network,
      ...metadata
    })
  }

  /**
   * Log performance metrics
   */
  performance(operation: string, duration: number, metadata?: any): void {
    this.info(`Performance ${operation}`, {
      operation,
      duration: `${duration}ms`,
      ...metadata
    })
  }

  /**
   * Log security event
   */
  security(event: string, severity: 'low' | 'medium' | 'high' | 'critical', metadata?: any): void {
    const level = severity === 'critical' ? 'error' : severity === 'high' ? 'warn' : 'info'
    this.logger[level](`Security ${event}`, {
      event,
      severity,
      ...metadata
    })
  }

  /**
   * Log audit trail
   */
  audit(user: string, action: string, resource: string, metadata?: any): void {
    this.info(`Audit ${action}`, {
      user,
      action,
      resource,
      timestamp: new Date().toISOString(),
      ...metadata
    })
  }

  /**
   * Create child logger with additional context
   */
  child(context: any): Logger {
    const childLogger = new Logger(this.module)
    childLogger.logger = this.logger.child(context)
    return childLogger
  }

  /**
   * Get current log level
   */
  getLevel(): string {
    return this.logger.level
  }

  /**
   * Set log level
   */
  setLevel(level: string): void {
    this.logger.level = level
  }

  /**
   * Check if a level is enabled
   */
  isLevelEnabled(level: string): boolean {
    return this.logger.isLevelEnabled(level)
  }

  /**
   * Add transport
   */
  addTransport(transport: winston.transport): void {
    this.logger.add(transport)
  }

  /**
   * Remove transport
   */
  removeTransport(transport: winston.transport): void {
    this.logger.remove(transport)
  }

  /**
   * Clear all transports
   */
  clearTransports(): void {
    this.logger.clear()
  }

  /**
   * Get all transports
   */
  getTransports(): winston.transport[] {
    return this.logger.transports
  }

  /**
   * Configure logging for blockchain operations
   */
  static configureBlockchainLogging(): void {
    // Create logs directory if it doesn't exist
    const fs = require('fs')
    const path = require('path')
    
    const logsDir = path.join(process.cwd(), 'logs')
    if (!fs.existsSync(logsDir)) {
      fs.mkdirSync(logsDir, { recursive: true })
    }

    // Configure global error handling
    process.on('uncaughtException', (error) => {
      const logger = new Logger('System')
      logger.error('Uncaught Exception', error)
      process.exit(1)
    })

    process.on('unhandledRejection', (reason, promise) => {
      const logger = new Logger('System')
      logger.error('Unhandled Rejection', { reason, promise })
    })
  }

  /**
   * Create a logger for a specific blockchain operation
   */
  static createBlockchainLogger(operation: string): Logger {
    return new Logger(`Blockchain.${operation}`)
  }

  /**
   * Create a logger for a specific DeFi protocol
   */
  static createDeFiLogger(protocol: string): Logger {
    return new Logger(`DeFi.${protocol}`)
  }

  /**
   * Create a logger for a specific network
   */
  static createNetworkLogger(network: string): Logger {
    return new Logger(`Network.${network}`)
  }

  /**
   * Create a logger for NFT operations
   */
  static createNFTLogger(collection?: string): Logger {
    const module = collection ? `NFT.${collection}` : 'NFT'
    return new Logger(module)
  }
} 
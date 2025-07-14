import chalk from 'chalk'
import { createWriteStream, WriteStream } from 'fs'
import { mkdir, appendFile } from 'fs/promises'
import { existsSync } from 'fs'

export type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'fatal'

export interface LogConfig {
  level: LogLevel
  enableConsole: boolean
  enableFile: boolean
  logDir: string
  format: 'json' | 'text'
  colors: boolean
  timestamp: boolean
}

export interface LogEntry {
  timestamp: string
  level: string
  module: string
  message: string
  data?: any
  error?: Error
}

export class Logger {
  private config: LogConfig
  private module: string
  private fileStream?: WriteStream
  private logQueue: LogEntry[] = []
  private isProcessing: boolean = false

  constructor(module: string, config?: Partial<LogConfig>) {
    this.module = module
    this.config = {
      level: 'info',
      enableConsole: true,
      enableFile: false,
      logDir: 'logs/',
      format: 'text',
      colors: true,
      timestamp: true,
      ...config
    }
    
    this.initialize()
  }

  /**
   * Inicializa el logger
   */
  private async initialize(): Promise<void> {
    try {
      if (this.config.enableFile) {
        await this.setupFileLogging()
      }
    } catch (error) {
      console.error('Failed to initialize logger:', error)
    }
  }

  /**
   * Configura el logging a archivo
   */
  private async setupFileLogging(): Promise<void> {
    try {
      if (!existsSync(this.config.logDir)) {
        await mkdir(this.config.logDir, { recursive: true })
      }
      
      const logFile = `${this.config.logDir}/${this.module}-${new Date().toISOString().split('T')[0]}.log`
      this.fileStream = createWriteStream(logFile, { flags: 'a' })
      
      this.fileStream.on('error', (error) => {
        console.error('Log file stream error:', error)
      })
    } catch (error) {
      console.error('Failed to setup file logging:', error)
    }
  }

  /**
   * Log de debug
   */
  debug(message: string, data?: any): void {
    this.log('debug', message, data)
  }

  /**
   * Log de info
   */
  info(message: string, data?: any): void {
    this.log('info', message, data)
  }

  /**
   * Log de warning
   */
  warn(message: string, data?: any): void {
    this.log('warn', message, data)
  }

  /**
   * Log de error
   */
  error(message: string, error?: Error, data?: any): void {
    this.log('error', message, data, error)
  }

  /**
   * Log de fatal
   */
  fatal(message: string, error?: Error, data?: any): void {
    this.log('fatal', message, data, error)
  }

  /**
   * Log de éxito
   */
  success(message: string, data?: any): void {
    this.log('info', `✅ ${message}`, data)
  }

  /**
   * Log de progreso
   */
  progress(message: string, data?: any): void {
    this.log('info', `🔄 ${message}`, data)
  }

  /**
   * Método principal de logging
   */
  private log(level: LogLevel, message: string, data?: any, error?: Error): void {
    if (this.shouldLog(level)) {
      const entry: LogEntry = {
        timestamp: new Date().toISOString(),
        level,
        module: this.module,
        message,
        data,
        error
      }

      this.logQueue.push(entry)
      
      if (!this.isProcessing) {
        this.processLogQueue()
      }
    }
  }

  /**
   * Verifica si debe loggear el mensaje
   */
  private shouldLog(level: LogLevel): boolean {
    const levels: Record<LogLevel, number> = {
      debug: 0,
      info: 1,
      warn: 2,
      error: 3,
      fatal: 4
    }
    
    return levels[level] >= levels[this.config.level]
  }

  /**
   * Procesa la cola de logs
   */
  private async processLogQueue(): Promise<void> {
    if (this.isProcessing || this.logQueue.length === 0) {
      return
    }

    this.isProcessing = true

    try {
      while (this.logQueue.length > 0) {
        const entry = this.logQueue.shift()!
        await this.writeLog(entry)
      }
    } catch (error) {
      console.error('Error processing log queue:', error)
    } finally {
      this.isProcessing = false
    }
  }

  /**
   * Escribe el log
   */
  private async writeLog(entry: LogEntry): Promise<void> {
    try {
      // Console output
      if (this.config.enableConsole) {
        this.writeToConsole(entry)
      }

      // File output
      if (this.config.enableFile && this.fileStream) {
        await this.writeToFile(entry)
      }
    } catch (error) {
      console.error('Failed to write log:', error)
    }
  }

  /**
   * Escribe al console
   */
  private writeToConsole(entry: LogEntry): void {
    const timestamp = this.config.timestamp ? `[${entry.timestamp}] ` : ''
    const level = entry.level.toUpperCase()
    const module = `[${entry.module}]`
    const message = entry.message

    let output = `${timestamp}${level} ${module} ${message}`

    if (entry.data) {
      output += ` ${JSON.stringify(entry.data)}`
    }

    if (entry.error) {
      output += `\nError: ${entry.error.message}\nStack: ${entry.error.stack}`
    }

    if (this.config.colors) {
      output = this.addColors(output, entry.level)
    }

    console.log(output)
  }

  /**
   * Escribe al archivo
   */
  private async writeToFile(entry: LogEntry): Promise<void> {
    try {
      let logLine: string

      if (this.config.format === 'json') {
        logLine = JSON.stringify(entry) + '\n'
      } else {
        logLine = `[${entry.timestamp}] ${entry.level.toUpperCase()} [${entry.module}] ${entry.message}`
        
        if (entry.data) {
          logLine += ` ${JSON.stringify(entry.data)}`
        }
        
        if (entry.error) {
          logLine += `\nError: ${entry.error.message}\nStack: ${entry.error.stack}`
        }
        
        logLine += '\n'
      }

      if (this.fileStream) {
        this.fileStream.write(logLine)
      }
    } catch (error) {
      console.error('Failed to write to log file:', error)
    }
  }

  /**
   * Añade colores al output
   */
  private addColors(text: string, level: string): string {
    const colors = {
      debug: chalk.cyan,
      info: chalk.green,
      warn: chalk.yellow,
      error: chalk.red,
      fatal: chalk.magenta
    }

    const color = colors[level as keyof typeof colors] || chalk.white
    return color(text)
  }

  /**
   * Crea un logger hijo
   */
  child(subModule: string): Logger {
    return new Logger(`${this.module}:${subModule}`, this.config)
  }

  /**
   * Cambia el nivel de log
   */
  setLevel(level: LogLevel): void {
    this.config.level = level
  }

  /**
   * Habilita/deshabilita console logging
   */
  setConsoleLogging(enabled: boolean): void {
    this.config.enableConsole = enabled
  }

  /**
   * Habilita/deshabilita file logging
   */
  setFileLogging(enabled: boolean): void {
    this.config.enableFile = enabled
    if (enabled && !this.fileStream) {
      this.setupFileLogging()
    }
  }

  /**
   * Obtiene estadísticas del logger
   */
  getStats(): any {
    return {
      module: this.module,
      config: this.config,
      queueLength: this.logQueue.length,
      isProcessing: this.isProcessing,
      hasFileStream: !!this.fileStream
    }
  }

  /**
   * Limpia recursos del logger
   */
  async cleanup(): Promise<void> {
    try {
      if (this.fileStream) {
        this.fileStream.end()
        this.fileStream = undefined
      }
      
      // Process remaining logs
      await this.processLogQueue()
    } catch (error) {
      console.error('Failed to cleanup logger:', error)
    }
  }
}

/**
 * Logger singleton para el CLI
 */
export const cliLogger = new Logger('CLI', {
  level: 'info',
  enableConsole: true,
  enableFile: true,
  logDir: 'logs/cli/',
  format: 'text',
  colors: true,
  timestamp: true
}) 
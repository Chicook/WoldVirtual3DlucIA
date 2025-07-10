/**
 * startServer.ts - Script para iniciar el servidor WebSocket del Editor 3D
 * 
 * Líneas: 1-200 (Primera instancia)
 */

import { editor3DServer } from './WebSocketServer';
import { EventEmitter } from 'events';

// Configuración del servidor
const SERVER_CONFIG = {
  port: process.env.EDITOR3D_PORT ? parseInt(process.env.EDITOR3D_PORT) : 8080,
  host: process.env.EDITOR3D_HOST || 'localhost',
  maxClients: process.env.EDITOR3D_MAX_CLIENTS ? parseInt(process.env.EDITOR3D_MAX_CLIENTS) : 100,
  pingInterval: 30000,
  pingTimeout: 10000,
  heartbeatInterval: 5000
};

// Logger simple
class Logger {
  private prefix: string;

  constructor(prefix: string = 'Editor3D Server') {
    this.prefix = prefix;
  }

  info(message: string, ...args: any[]): void {
    console.log(`[${this.prefix}] ${message}`, ...args);
  }

  warn(message: string, ...args: any[]): void {
    console.warn(`[${this.prefix}] ⚠️  ${message}`, ...args);
  }

  error(message: string, ...args: any[]): void {
    console.error(`[${this.prefix}] ❌ ${message}`, ...args);
  }

  success(message: string, ...args: any[]): void {
    console.log(`[${this.prefix}] ✅ ${message}`, ...args);
  }
}

const logger = new Logger();

// Manejo de señales del sistema
class SignalHandler {
  private server: any;
  private logger: Logger;

  constructor(server: any, logger: Logger) {
    this.server = server;
    this.logger = logger;
    this.setupSignalHandlers();
  }

  private setupSignalHandlers(): void {
    process.on('SIGINT', () => this.handleShutdown('SIGINT'));
    process.on('SIGTERM', () => this.handleShutdown('SIGTERM'));
    process.on('uncaughtException', (error) => this.handleUncaughtException(error));
    process.on('unhandledRejection', (reason, promise) => this.handleUnhandledRejection(reason, promise));
  }

  private async handleShutdown(signal: string): Promise<void> {
    this.logger.info(`Recibida señal ${signal}, cerrando servidor...`);
    
    try {
      await this.server.stop();
      this.logger.success('Servidor cerrado correctamente');
      process.exit(0);
    } catch (error) {
      this.logger.error('Error al cerrar servidor:', error);
      process.exit(1);
    }
  }

  private handleUncaughtException(error: Error): void {
    this.logger.error('Excepción no capturada:', error);
    process.exit(1);
  }

  private handleUnhandledRejection(reason: any, promise: Promise<any>): void {
    this.logger.error('Promesa rechazada no manejada:', reason);
    this.logger.error('Promesa:', promise);
  }
}

// Monitor de rendimiento
class PerformanceMonitor {
  private logger: Logger;
  private statsInterval: NodeJS.Timeout | null = null;
  private startTime: Date;

  constructor(logger: Logger) {
    this.logger = logger;
    this.startTime = new Date();
  }

  start(): void {
    this.statsInterval = setInterval(() => {
      this.logStats();
    }, 30000); // Cada 30 segundos
  }

  stop(): void {
    if (this.statsInterval) {
      clearInterval(this.statsInterval);
      this.statsInterval = null;
    }
  }

  private logStats(): void {
    const stats = editor3DServer.getStats();
    const uptime = Math.floor((Date.now() - this.startTime.getTime()) / 1000);
    
    this.logger.info(`📊 Estadísticas del servidor:`);
    this.logger.info(`   - Tiempo activo: ${this.formatUptime(uptime)}`);
    this.logger.info(`   - Conexiones totales: ${stats.totalConnections}`);
    this.logger.info(`   - Conexiones activas: ${stats.activeConnections}`);
    this.logger.info(`   - Mensajes totales: ${stats.totalMessages}`);
    this.logger.info(`   - Memoria: ${this.getMemoryUsage()}`);
  }

  private formatUptime(seconds: number): string {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours}h ${minutes}m ${secs}s`;
  }

  private getMemoryUsage(): string {
    const usage = process.memoryUsage();
    const rss = Math.round(usage.rss / 1024 / 1024);
    const heapUsed = Math.round(usage.heapUsed / 1024 / 1024);
    const heapTotal = Math.round(usage.heapTotal / 1024 / 1024);
    return `${heapUsed}MB / ${heapTotal}MB (RSS: ${rss}MB)`;
  }
}

// Función principal para iniciar el servidor
async function startEditor3DServer(): Promise<void> {
  try {
    logger.info('🚀 Iniciando servidor WebSocket del Editor 3D...');
    logger.info(`📋 Configuración:`);
    logger.info(`   - Puerto: ${SERVER_CONFIG.port}`);
    logger.info(`   - Host: ${SERVER_CONFIG.host}`);
    logger.info(`   - Máximo clientes: ${SERVER_CONFIG.maxClients}`);
    logger.info(`   - Intervalo ping: ${SERVER_CONFIG.pingInterval}ms`);
    logger.info(`   - Timeout ping: ${SERVER_CONFIG.pingTimeout}ms`);

    // Configurar el servidor
    editor3DServer.updateConfig(SERVER_CONFIG);

    // Configurar event handlers
    editor3DServer.on('listening', () => {
      logger.success(`Servidor iniciado en ws://${SERVER_CONFIG.host}:${SERVER_CONFIG.port}`);
    });

    editor3DServer.on('clientConnected', (clientId: string) => {
      logger.info(`👤 Cliente conectado: ${clientId}`);
    });

    editor3DServer.on('clientDisconnected', (clientId: string, code: number, reason: string) => {
      logger.info(`👋 Cliente desconectado: ${clientId} (${code}: ${reason})`);
    });

    editor3DServer.on('messageReceived', (clientId: string, message: any) => {
      logger.info(`📨 Mensaje de ${clientId}: ${message.type}`);
    });

    editor3DServer.on('error', (error: Error) => {
      logger.error('Error del servidor:', error);
    });

    // Iniciar el servidor
    await editor3DServer.start();

    // Configurar manejo de señales
    const signalHandler = new SignalHandler(editor3DServer, logger);

    // Iniciar monitor de rendimiento
    const performanceMonitor = new PerformanceMonitor(logger);
    performanceMonitor.start();

    // Mostrar información de uso
    logger.info('📖 Comandos disponibles:');
    logger.info('   - Ctrl+C: Detener servidor');
    logger.info('   - Estadísticas se muestran cada 30 segundos');
    logger.info('');
    logger.success('✅ Servidor listo para conexiones');

  } catch (error) {
    logger.error('❌ Error al iniciar servidor:', error);
    process.exit(1);
  }
}

// Función para verificar si el puerto está disponible
async function checkPortAvailability(port: number): Promise<boolean> {
  return new Promise((resolve) => {
    const net = require('net');
    const server = net.createServer();
    
    server.listen(port, () => {
      server.close();
      resolve(true);
    });
    
    server.on('error', () => {
      resolve(false);
    });
  });
}

// Función para encontrar un puerto disponible
async function findAvailablePort(startPort: number): Promise<number> {
  let port = startPort;
  const maxAttempts = 100;
  
  for (let i = 0; i < maxAttempts; i++) {
    if (await checkPortAvailability(port)) {
      return port;
    }
    port++;
  }
  
  throw new Error(`No se pudo encontrar un puerto disponible después de ${maxAttempts} intentos`);
}

// Función para iniciar con puerto automático
async function startWithAutoPort(): Promise<void> {
  try {
    const originalPort = SERVER_CONFIG.port;
    const availablePort = await findAvailablePort(originalPort);
    
    if (availablePort !== originalPort) {
      logger.warn(`Puerto ${originalPort} no disponible, usando ${availablePort}`);
      SERVER_CONFIG.port = availablePort;
    }
    
    await startEditor3DServer();
  } catch (error) {
    logger.error('Error al encontrar puerto disponible:', error);
    process.exit(1);
  }
}

// Exportar funciones para uso externo
export {
  startEditor3DServer,
  startWithAutoPort,
  checkPortAvailability,
  findAvailablePort,
  SERVER_CONFIG
};

// Si este archivo se ejecuta directamente
if (require.main === module) {
  const args = process.argv.slice(2);
  
  if (args.includes('--auto-port')) {
    startWithAutoPort();
  } else {
    startEditor3DServer();
  }
} 
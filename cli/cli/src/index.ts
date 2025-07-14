#!/usr/bin/env node

/**
 * @metaverso/cli - Herramientas de Línea de Comandos para Metaverso Web3
 * 
 * CLI completo para gestión, desarrollo y despliegue del metaverso descentralizado
 */

import { Command } from 'commander'
import chalk from 'chalk'
import { Logger } from './utils/Logger'
import { ConfigManager } from './utils/ConfigManager'
import { ProjectManager } from './utils/ProjectManager'

// Importar comandos
import { InitCommand } from './commands/InitCommand'
import { BuildCommand } from './commands/BuildCommand'
import { DeployCommand } from './commands/DeployCommand'
import { GenerateCommand } from './commands/GenerateCommand'
import { ValidateCommand } from './commands/ValidateCommand'
import { TestCommand } from './commands/TestCommand'
import { MonitorCommand } from './commands/MonitorCommand'
import { ConfigCommand } from './commands/ConfigCommand'
import { BlockchainCommand } from './commands/BlockchainCommand'
import { AssetCommand } from './commands/AssetCommand'
import { UserCommand } from './commands/UserCommand'
import { WorldCommand } from './commands/WorldCommand'
import { AnalyticsCommand } from './commands/AnalyticsCommand'
import { SecurityCommand } from './commands/SecurityCommand'
import { BackupCommand } from './commands/BackupCommand'
import { UpdateCommand } from './commands/UpdateCommand'
import { HelpCommand } from './commands/HelpCommand'

// Crear instancia del programa principal
const program = new Command()

// Configurar información del programa
program
  .name('metaverso')
  .description('CLI para gestión y desarrollo del Metaverso Web3 descentralizado')
  .version('1.0.0', '-v, --version', 'Mostrar versión')
  .option('-d, --debug', 'Habilitar modo debug')
  .option('-q, --quiet', 'Modo silencioso')
  .option('-c, --config <path>', 'Ruta al archivo de configuración')
  .option('-e, --env <environment>', 'Entorno de ejecución', 'development')

// Configurar logger global
const logger = new Logger('CLI')
const configManager = new ConfigManager()
const projectManager = new ProjectManager()

// Middleware para logging y configuración
program.hook('preAction', async (thisCommand) => {
  const options = thisCommand.opts()
  
  // Configurar logger
  if (options.debug) {
    logger.setLevel('debug')
  }
  if (options.quiet) {
    logger.setLevel('error')
  }
  
  // Cargar configuración
  if (options.config) {
    await configManager.loadConfig(options.config)
  }
  
  // Verificar proyecto
  await projectManager.verifyProject()
  
  logger.info(`Ejecutando comando: ${thisCommand.name()}`)
})

// Middleware para manejo de errores
program.hook('postAction', async (thisCommand) => {
  logger.info(`Comando ${thisCommand.name()} completado`)
})

// Configurar comandos principales
const commands = [
  new InitCommand(),
  new BuildCommand(),
  new DeployCommand(),
  new GenerateCommand(),
  new ValidateCommand(),
  new TestCommand(),
  new MonitorCommand(),
  new ConfigCommand(),
  new BlockchainCommand(),
  new AssetCommand(),
  new UserCommand(),
  new WorldCommand(),
  new AnalyticsCommand(),
  new SecurityCommand(),
  new BackupCommand(),
  new UpdateCommand(),
  new HelpCommand()
]

// Registrar todos los comandos
commands.forEach(command => {
  command.register(program)
})

// Comando por defecto (ayuda)
program.action(() => {
  console.log(chalk.blue.bold('\n🌐 Metaverso Web3 CLI'))
  console.log(chalk.gray('Herramientas de línea de comandos para el metaverso descentralizado\n'))
  
  console.log(chalk.yellow('Comandos principales:'))
  console.log('  init          Inicializar nuevo proyecto de metaverso')
  console.log('  build         Construir todos los módulos del proyecto')
  console.log('  deploy        Desplegar el metaverso a diferentes entornos')
  console.log('  generate      Generar código, contratos y assets')
  console.log('  validate      Validar configuración y código')
  console.log('  test          Ejecutar tests del proyecto')
  console.log('  monitor       Monitorear el estado del metaverso')
  
  console.log(chalk.yellow('\nComandos de configuración:'))
  console.log('  config        Gestionar configuración del proyecto')
  console.log('  blockchain    Gestionar contratos y blockchain')
  console.log('  asset         Gestionar assets multimedia')
  console.log('  user          Gestionar usuarios y avatares')
  console.log('  world         Gestionar mundos y escenas')
  
  console.log(chalk.yellow('\nComandos avanzados:'))
  console.log('  analytics     Análisis y métricas del metaverso')
  console.log('  security      Auditoría de seguridad')
  console.log('  backup        Backup y restauración')
  console.log('  update        Actualizar dependencias y módulos')
  console.log('  help          Mostrar ayuda detallada')
  
  console.log(chalk.gray('\nPara más información sobre un comando específico:'))
  console.log('  metaverso <comando> --help\n')
})

// Manejo de errores global
process.on('uncaughtException', (error) => {
  logger.error('Error no capturado:', error)
  process.exit(1)
})

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Promesa rechazada no manejada:', reason)
  process.exit(1)
})

// Función principal
async function main() {
  try {
    // Mostrar banner
    if (!process.argv.includes('--quiet') && !process.argv.includes('-q')) {
      console.log(chalk.blue.bold('\n🌐 Metaverso Web3 CLI v1.0.0'))
      console.log(chalk.gray('Construyendo el futuro del metaverso descentralizado...\n'))
    }
    
    // Parsear argumentos
    await program.parseAsync()
    
  } catch (error) {
    logger.error('Error en la ejecución del CLI:', error)
    process.exit(1)
  }
}

// Exportar para uso programático
export {
  program,
  logger,
  configManager,
  projectManager,
  commands
}

// Ejecutar si es el archivo principal
if (require.main === module) {
  main()
} 
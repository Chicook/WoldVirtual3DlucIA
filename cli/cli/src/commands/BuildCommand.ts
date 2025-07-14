import { Command } from 'commander'
import chalk from 'chalk'
import inquirer from 'inquirer'
import { Logger } from '../utils/Logger'
import { ConfigManager } from '../utils/ConfigManager'
import { ProjectManager } from '../utils/ProjectManager'

export class BuildCommand {
  private logger: Logger
  private configManager: ConfigManager
  private projectManager: ProjectManager

  constructor() {
    this.logger = new Logger('BuildCommand')
    this.configManager = new ConfigManager()
    this.projectManager = new ProjectManager()
  }

  /**
   * Registra el comando
   */
  register(program: Command): void {
    program
      .command('build')
      .description('Construir todos los módulos del proyecto')
      .option('-t, --target <target>', 'Target específico (contracts, backend, frontend, assets, all)')
      .option('-e, --env <environment>', 'Entorno de build (development, staging, production)')
      .option('-o, --optimize', 'Habilitar optimización')
      .option('-c, --compress', 'Habilitar compresión')
      .option('-s, --sign', 'Firmar builds')
      .option('-v, --verify', 'Verificar builds')
      .option('--watch', 'Modo watch')
      .option('--clean', 'Limpiar antes de construir')
      .option('--parallel', 'Construir en paralelo')
      .action(async (options) => {
        await this.execute(options)
      })
  }

  /**
   * Ejecuta el comando
   */
  async execute(options: any): Promise<void> {
    try {
      this.logger.info('Iniciando proceso de build...')
      
      // Mostrar banner
      this.showBanner()
      
      // Verificar proyecto
      await this.verifyProject()
      
      // Cargar configuración
      const config = await this.configManager.loadDefaultConfig()
      
      // Obtener opciones de build
      const buildOptions = await this.getBuildOptions(options)
      
      // Limpiar si es necesario
      if (buildOptions.clean) {
        await this.cleanBuilds()
      }
      
      // Ejecutar builds
      const results = await this.executeBuilds(buildOptions)
      
      // Mostrar resultados
      this.showResults(results)
      
      this.logger.success('Build completado exitosamente!')
      
    } catch (error) {
      this.logger.error('Error durante el build:', error as Error)
      throw error
    }
  }

  /**
   * Muestra el banner de build
   */
  private showBanner(): void {
    console.log(chalk.blue.bold('\n🔨 Metaverso Web3 - Build System'))
    console.log(chalk.gray('Construyendo el futuro del metaverso...\n'))
  }

  /**
   * Verifica el proyecto
   */
  private async verifyProject(): Promise<void> {
    this.logger.progress('Verificando proyecto...')
    
    const verification = await this.projectManager.verifyProject()
    
    if (!verification.valid) {
      console.log(chalk.red('❌ Problemas encontrados:'))
      verification.issues.forEach(issue => {
        console.log(chalk.red(`   - ${issue}`))
      })
      throw new Error('Proyecto no válido')
    }
    
    this.logger.success('Proyecto verificado correctamente')
  }

  /**
   * Obtiene las opciones de build
   */
  private async getBuildOptions(options: any): Promise<any> {
    const buildOptions: any = {
      target: options.target || 'all',
      environment: options.env || 'development',
      optimize: options.optimize || false,
      compress: options.compress || false,
      sign: options.sign || false,
      verify: options.verify || false,
      watch: options.watch || false,
      clean: options.clean || false,
      parallel: options.parallel || false
    }

    // Si no se especificó target, preguntar al usuario
    if (!options.target && !options.yes) {
      const { target } = await inquirer.prompt([
        {
          type: 'list',
          name: 'target',
          message: '¿Qué quieres construir?',
          choices: [
            { name: 'Todo (contratos, backend, frontend, assets)', value: 'all' },
            { name: 'Solo contratos inteligentes', value: 'contracts' },
            { name: 'Solo backend', value: 'backend' },
            { name: 'Solo frontend', value: 'frontend' },
            { name: 'Solo assets', value: 'assets' }
          ],
          default: 'all'
        }
      ])
      buildOptions.target = target
    }

    // Preguntar por optimizaciones si no se especificaron
    if (!options.optimize && !options.yes) {
      const { optimize } = await inquirer.prompt([
        {
          type: 'confirm',
          name: 'optimize',
          message: '¿Habilitar optimización?',
          default: true
        }
      ])
      buildOptions.optimize = optimize
    }

    // Preguntar por compresión si no se especificó
    if (!options.compress && !options.yes) {
      const { compress } = await inquirer.prompt([
        {
          type: 'confirm',
          name: 'compress',
          message: '¿Habilitar compresión?',
          default: true
        }
      ])
      buildOptions.compress = compress
    }

    return buildOptions
  }

  /**
   * Limpia los builds anteriores
   */
  private async cleanBuilds(): Promise<void> {
    this.logger.progress('Limpiando builds anteriores...')
    
    try {
      await this.projectManager.runScript('clean')
      this.logger.success('Builds limpiados exitosamente')
    } catch (error) {
      this.logger.warn('No se pudo limpiar builds (ignorado)')
    }
  }

  /**
   * Ejecuta los builds
   */
  private async executeBuilds(options: any): Promise<any> {
    const results: any = {}
    const startTime = Date.now()

    if (options.target === 'all' || options.target === 'contracts') {
      results.contracts = await this.buildContracts(options)
    }

    if (options.target === 'all' || options.target === 'backend') {
      results.backend = await this.buildBackend(options)
    }

    if (options.target === 'all' || options.target === 'frontend') {
      results.frontend = await this.buildFrontend(options)
    }

    if (options.target === 'all' || options.target === 'assets') {
      results.assets = await this.buildAssets(options)
    }

    results.totalTime = Date.now() - startTime
    return results
  }

  /**
   * Construye contratos
   */
  private async buildContracts(options: any): Promise<any> {
    this.logger.progress('Construyendo contratos inteligentes...')
    
    try {
      const startTime = Date.now()
      
      // Compilar contratos
      await this.projectManager.runCommand('cd contracts && npm run build')
      
      // Optimizar si está habilitado
      if (options.optimize) {
        await this.projectManager.runCommand('cd contracts && npm run optimize')
      }
      
      // Verificar si está habilitado
      if (options.verify) {
        await this.projectManager.runCommand('cd contracts && npm run verify')
      }
      
      const duration = Date.now() - startTime
      
      this.logger.success(`Contratos construidos en ${duration}ms`)
      
      return {
        success: true,
        duration,
        size: await this.getBuildSize('contracts'),
        artifacts: await this.getContractArtifacts()
      }
    } catch (error) {
      this.logger.error('Error construyendo contratos:', error as Error)
      return {
        success: false,
        error: error.message
      }
    }
  }

  /**
   * Construye backend
   */
  private async buildBackend(options: any): Promise<any> {
    this.logger.progress('Construyendo backend...')
    
    try {
      const startTime = Date.now()
      
      // Instalar dependencias
      await this.projectManager.runCommand('cd backend && npm install')
      
      // Construir backend
      await this.projectManager.runCommand('cd backend && npm run build')
      
      // Optimizar si está habilitado
      if (options.optimize) {
        await this.projectManager.runCommand('cd backend && npm run optimize')
      }
      
      const duration = Date.now() - startTime
      
      this.logger.success(`Backend construido en ${duration}ms`)
      
      return {
        success: true,
        duration,
        size: await this.getBuildSize('backend'),
        bundles: await this.getBackendBundles()
      }
    } catch (error) {
      this.logger.error('Error construyendo backend:', error as Error)
      return {
        success: false,
        error: error.message
      }
    }
  }

  /**
   * Construye frontend
   */
  private async buildFrontend(options: any): Promise<any> {
    this.logger.progress('Construyendo frontend...')
    
    try {
      const startTime = Date.now()
      
      // Instalar dependencias
      await this.projectManager.runCommand('cd client && npm install')
      
      // Construir frontend
      await this.projectManager.runCommand('cd client && npm run build')
      
      // Optimizar si está habilitado
      if (options.optimize) {
        await this.projectManager.runCommand('cd client && npm run optimize')
      }
      
      const duration = Date.now() - startTime
      
      this.logger.success(`Frontend construido en ${duration}ms`)
      
      return {
        success: true,
        duration,
        size: await this.getBuildSize('client'),
        bundles: await this.getFrontendBundles()
      }
    } catch (error) {
      this.logger.error('Error construyendo frontend:', error as Error)
      return {
        success: false,
        error: error.message
      }
    }
  }

  /**
   * Construye assets
   */
  private async buildAssets(options: any): Promise<any> {
    this.logger.progress('Procesando assets...')
    
    try {
      const startTime = Date.now()
      
      // Procesar assets
      await this.projectManager.runCommand('cd assets && npm run process')
      
      // Optimizar si está habilitado
      if (options.optimize) {
        await this.projectManager.runCommand('cd assets && npm run optimize')
      }
      
      // Comprimir si está habilitado
      if (options.compress) {
        await this.projectManager.runCommand('cd assets && npm run compress')
      }
      
      const duration = Date.now() - startTime
      
      this.logger.success(`Assets procesados en ${duration}ms`)
      
      return {
        success: true,
        duration,
        size: await this.getBuildSize('assets'),
        assets: await this.getProcessedAssets()
      }
    } catch (error) {
      this.logger.error('Error procesando assets:', error as Error)
      return {
        success: false,
        error: error.message
      }
    }
  }

  /**
   * Obtiene el tamaño del build
   */
  private async getBuildSize(module: string): Promise<number> {
    try {
      const { stdout } = await this.projectManager.runCommand(`du -sb ${module}/dist ${module}/build 2>/dev/null || echo "0"`)
      return parseInt(stdout.split('\t')[0]) || 0
    } catch {
      return 0
    }
  }

  /**
   * Obtiene artifacts de contratos
   */
  private async getContractArtifacts(): Promise<string[]> {
    try {
      const { stdout } = await this.projectManager.runCommand('find contracts/out -name "*.json" 2>/dev/null || echo ""')
      return stdout.split('\n').filter(file => file.trim())
    } catch {
      return []
    }
  }

  /**
   * Obtiene bundles del backend
   */
  private async getBackendBundles(): Promise<string[]> {
    try {
      const { stdout } = await this.projectManager.runCommand('find backend/dist -name "*.js" 2>/dev/null || echo ""')
      return stdout.split('\n').filter(file => file.trim())
    } catch {
      return []
    }
  }

  /**
   * Obtiene bundles del frontend
   */
  private async getFrontendBundles(): Promise<string[]> {
    try {
      const { stdout } = await this.projectManager.runCommand('find client/dist -name "*.js" -o -name "*.css" 2>/dev/null || echo ""')
      return stdout.split('\n').filter(file => file.trim())
    } catch {
      return []
    }
  }

  /**
   * Obtiene assets procesados
   */
  private async getProcessedAssets(): Promise<string[]> {
    try {
      const { stdout } = await this.projectManager.runCommand('find assets/dist -type f 2>/dev/null || echo ""')
      return stdout.split('\n').filter(file => file.trim())
    } catch {
      return []
    }
  }

  /**
   * Muestra los resultados del build
   */
  private showResults(results: any): void {
    console.log(chalk.green.bold('\n✅ Build completado!'))
    console.log(chalk.blue('\n📊 Resumen:'))
    
    const totalTime = results.totalTime || 0
    console.log(`   Tiempo total: ${totalTime}ms`)
    
    let totalSize = 0
    let successCount = 0
    let failCount = 0
    
    // Contratos
    if (results.contracts) {
      if (results.contracts.success) {
        console.log(chalk.green(`   ✅ Contratos: ${results.contracts.duration}ms (${this.formatSize(results.contracts.size)})`))
        totalSize += results.contracts.size
        successCount++
      } else {
        console.log(chalk.red(`   ❌ Contratos: Error - ${results.contracts.error}`))
        failCount++
      }
    }
    
    // Backend
    if (results.backend) {
      if (results.backend.success) {
        console.log(chalk.green(`   ✅ Backend: ${results.backend.duration}ms (${this.formatSize(results.backend.size)})`))
        totalSize += results.backend.size
        successCount++
      } else {
        console.log(chalk.red(`   ❌ Backend: Error - ${results.backend.error}`))
        failCount++
      }
    }
    
    // Frontend
    if (results.frontend) {
      if (results.frontend.success) {
        console.log(chalk.green(`   ✅ Frontend: ${results.frontend.duration}ms (${this.formatSize(results.frontend.size)})`))
        totalSize += results.frontend.size
        successCount++
      } else {
        console.log(chalk.red(`   ❌ Frontend: Error - ${results.frontend.error}`))
        failCount++
      }
    }
    
    // Assets
    if (results.assets) {
      if (results.assets.success) {
        console.log(chalk.green(`   ✅ Assets: ${results.assets.duration}ms (${this.formatSize(results.assets.size)})`))
        totalSize += results.assets.size
        successCount++
      } else {
        console.log(chalk.red(`   ❌ Assets: Error - ${results.assets.error}`))
        failCount++
      }
    }
    
    console.log(chalk.blue(`\n📈 Estadísticas:`))
    console.log(`   Tamaño total: ${this.formatSize(totalSize)}`)
    console.log(`   Módulos exitosos: ${successCount}`)
    console.log(`   Módulos fallidos: ${failCount}`)
    
    if (failCount > 0) {
      console.log(chalk.yellow('\n⚠️  Algunos módulos fallaron. Revisa los logs para más detalles.'))
    } else {
      console.log(chalk.green('\n🎉 ¡Todos los módulos se construyeron exitosamente!'))
    }
  }

  /**
   * Formatea el tamaño en bytes
   */
  private formatSize(bytes: number): string {
    if (bytes === 0) return '0 B'
    
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }
} 
import { Logger } from '../utils/Logger'
import { ProjectManager } from '../utils/ProjectManager'

export interface ProjectValidationResult {
  valid: boolean
  errors: string[]
  warnings: string[]
  suggestions: string[]
  stats: {
    totalFiles: number
    totalSize: number
    modules: string[]
    dependencies: number
  }
}

export interface ProjectValidationOptions {
  checkStructure?: boolean
  checkDependencies?: boolean
  checkSecurity?: boolean
  checkPerformance?: boolean
  checkCompatibility?: boolean
}

export class ProjectValidator {
  private logger: Logger
  private projectManager: ProjectManager

  constructor() {
    this.logger = new Logger('ProjectValidator')
    this.projectManager = new ProjectManager()
  }

  /**
   * Valida el proyecto completo
   */
  async validateProject(options: ProjectValidationOptions = {}): Promise<ProjectValidationResult> {
    const result: ProjectValidationResult = {
      valid: true,
      errors: [],
      warnings: [],
      suggestions: [],
      stats: {
        totalFiles: 0,
        totalSize: 0,
        modules: [],
        dependencies: 0
      }
    }

    try {
      this.logger.info('Iniciando validación del proyecto...')

      // Verificar que existe un proyecto
      if (!(await this.projectManager.isProjectExists())) {
        result.errors.push('No se encontró un proyecto válido en el directorio actual')
        result.valid = false
        return result
      }

      // Obtener información del proyecto
      const projectInfo = await this.projectManager.getProjectInfo()
      if (!projectInfo) {
        result.errors.push('No se pudo obtener información del proyecto')
        result.valid = false
        return result
      }

      // Validar estructura si está habilitado
      if (options.checkStructure !== false) {
        const structureValidation = await this.validateStructure()
        result.errors.push(...structureValidation.errors)
        result.warnings.push(...structureValidation.warnings)
      }

      // Validar dependencias si está habilitado
      if (options.checkDependencies !== false) {
        const dependenciesValidation = await this.validateDependencies(projectInfo)
        result.errors.push(...dependenciesValidation.errors)
        result.warnings.push(...dependenciesValidation.warnings)
      }

      // Validar seguridad si está habilitado
      if (options.checkSecurity !== false) {
        const securityValidation = await this.validateSecurity()
        result.errors.push(...securityValidation.errors)
        result.warnings.push(...securityValidation.warnings)
      }

      // Validar rendimiento si está habilitado
      if (options.checkPerformance !== false) {
        const performanceValidation = await this.validatePerformance()
        result.errors.push(...performanceValidation.errors)
        result.warnings.push(...performanceValidation.warnings)
      }

      // Validar compatibilidad si está habilitado
      if (options.checkCompatibility !== false) {
        const compatibilityValidation = await this.validateCompatibility()
        result.errors.push(...compatibilityValidation.errors)
        result.warnings.push(...compatibilityValidation.warnings)
      }

      // Obtener estadísticas
      result.stats = await this.getProjectStats()

      // Generar sugerencias
      result.suggestions = this.generateSuggestions(result)

      // Determinar si el proyecto es válido
      result.valid = result.errors.length === 0

      this.logger.info(`Validación completada: ${result.valid ? 'VÁLIDO' : 'INVÁLIDO'}`)
      this.logger.info(`Errores: ${result.errors.length}, Advertencias: ${result.warnings.length}`)

    } catch (error) {
      this.logger.error('Error durante la validación del proyecto:', error as Error)
      result.valid = false
      result.errors.push(`Error de validación: ${error.message}`)
    }

    return result
  }

  /**
   * Valida la estructura del proyecto
   */
  private async validateStructure(): Promise<{ errors: string[]; warnings: string[] }> {
    const errors: string[] = []
    const warnings: string[] = []

    // Verificar directorios requeridos
    const requiredDirs = ['contracts', 'backend', 'client', 'assets']
    for (const dir of requiredDirs) {
      if (!(await this.projectManager.fileExists(dir))) {
        errors.push(`Directorio requerido no encontrado: ${dir}`)
      }
    }

    // Verificar archivos requeridos
    const requiredFiles = ['package.json', 'metaverso.config.json']
    for (const file of requiredFiles) {
      if (!(await this.projectManager.fileExists(file))) {
        errors.push(`Archivo requerido no encontrado: ${file}`)
      }
    }

    // Verificar estructura de contratos
    if (await this.projectManager.fileExists('contracts')) {
      const contractFiles = ['package.json', 'foundry.toml']
      for (const file of contractFiles) {
        if (!(await this.projectManager.fileExists(`contracts/${file}`))) {
          warnings.push(`Archivo de contratos no encontrado: contracts/${file}`)
        }
      }
    }

    // Verificar estructura de backend
    if (await this.projectManager.fileExists('backend')) {
      const backendFiles = ['package.json', 'tsconfig.json']
      for (const file of backendFiles) {
        if (!(await this.projectManager.fileExists(`backend/${file}`))) {
          warnings.push(`Archivo de backend no encontrado: backend/${file}`)
        }
      }
    }

    // Verificar estructura de frontend
    if (await this.projectManager.fileExists('client')) {
      const frontendFiles = ['package.json', 'tsconfig.json', 'vite.config.ts']
      for (const file of frontendFiles) {
        if (!(await this.projectManager.fileExists(`client/${file}`))) {
          warnings.push(`Archivo de frontend no encontrado: client/${file}`)
        }
      }
    }

    return { errors, warnings }
  }

  /**
   * Valida las dependencias del proyecto
   */
  private async validateDependencies(projectInfo: any): Promise<{ errors: string[]; warnings: string[] }> {
    const errors: string[] = []
    const warnings: string[] = []

    // Verificar dependencias requeridas
    const requiredDeps = ['typescript', 'node']
    for (const dep of requiredDeps) {
      if (!projectInfo.dependencies.includes(dep)) {
        warnings.push(`Dependencia recomendada no encontrada: ${dep}`)
      }
    }

    // Verificar versiones de Node.js
    try {
      const { stdout } = await this.projectManager.runCommand('node --version')
      const nodeVersion = stdout.trim().replace('v', '')
      const majorVersion = parseInt(nodeVersion.split('.')[0])
      
      if (majorVersion < 18) {
        errors.push(`Node.js versión ${nodeVersion} no es compatible. Se requiere 18+`)
      }
    } catch (error) {
      errors.push('No se pudo verificar la versión de Node.js')
    }

    // Verificar versiones de npm
    try {
      const { stdout } = await this.projectManager.runCommand('npm --version')
      const npmVersion = stdout.trim()
      const majorVersion = parseInt(npmVersion.split('.')[0])
      
      if (majorVersion < 9) {
        warnings.push(`npm versión ${npmVersion} es antigua. Se recomienda 9+`)
      }
    } catch (error) {
      warnings.push('No se pudo verificar la versión de npm')
    }

    return { errors, warnings }
  }

  /**
   * Valida la seguridad del proyecto
   */
  private async validateSecurity(): Promise<{ errors: string[]; warnings: string[] }> {
    const errors: string[] = []
    const warnings: string[] = []

    // Verificar archivos de seguridad
    const securityFiles = ['.env', '.gitignore']
    for (const file of securityFiles) {
      if (!(await this.projectManager.fileExists(file))) {
        warnings.push(`Archivo de seguridad no encontrado: ${file}`)
      }
    }

    // Verificar .env
    if (await this.projectManager.fileExists('.env')) {
      try {
        const envContent = await this.projectManager.readFile('.env')
        if (envContent.includes('your-super-secret-jwt-key')) {
          errors.push('JWT secret no ha sido configurado en .env')
        }
        if (envContent.includes('your-api-key')) {
          warnings.push('API keys no han sido configuradas en .env')
        }
      } catch (error) {
        warnings.push('No se pudo leer el archivo .env')
      }
    }

    // Verificar .gitignore
    if (await this.projectManager.fileExists('.gitignore')) {
      try {
        const gitignoreContent = await this.projectManager.readFile('.gitignore')
        const requiredIgnores = ['.env', 'node_modules', 'dist', 'build']
        for (const ignore of requiredIgnores) {
          if (!gitignoreContent.includes(ignore)) {
            warnings.push(`Archivo/directorio no ignorado en .gitignore: ${ignore}`)
          }
        }
      } catch (error) {
        warnings.push('No se pudo leer el archivo .gitignore')
      }
    }

    return { errors, warnings }
  }

  /**
   * Valida el rendimiento del proyecto
   */
  private async validatePerformance(): Promise<{ errors: string[]; warnings: string[] }> {
    const errors: string[] = []
    const warnings: string[] = []

    // Verificar tamaño del proyecto
    try {
      const stats = await this.projectManager.getProjectStats()
      const sizeInMB = stats.size / (1024 * 1024)
      
      if (sizeInMB > 1000) {
        warnings.push(`Proyecto muy grande: ${sizeInMB.toFixed(2)}MB. Considera optimizar`)
      }
    } catch (error) {
      warnings.push('No se pudo verificar el tamaño del proyecto')
    }

    // Verificar node_modules
    if (await this.projectManager.fileExists('node_modules')) {
      try {
        const { stdout } = await this.projectManager.runCommand('du -sh node_modules')
        const size = stdout.split('\t')[0]
        warnings.push(`Tamaño de node_modules: ${size}`)
      } catch (error) {
        warnings.push('No se pudo verificar el tamaño de node_modules')
      }
    }

    return { errors, warnings }
  }

  /**
   * Valida la compatibilidad del proyecto
   */
  private async validateCompatibility(): Promise<{ errors: string[]; warnings: string[] }> {
    const errors: string[] = []
    const warnings: string[] = []

    // Verificar compatibilidad de TypeScript
    try {
      const { stdout } = await this.projectManager.runCommand('npx tsc --version')
      const tsVersion = stdout.trim().split(' ')[1]
      const majorVersion = parseInt(tsVersion.split('.')[0])
      
      if (majorVersion < 5) {
        warnings.push(`TypeScript versión ${tsVersion} es antigua. Se recomienda 5+`)
      }
    } catch (error) {
      warnings.push('TypeScript no está instalado o no es accesible')
    }

    // Verificar compatibilidad de herramientas
    const tools = [
      { name: 'Foundry', command: 'forge --version' },
      { name: 'Vite', command: 'npx vite --version' },
      { name: 'ESLint', command: 'npx eslint --version' }
    ]

    for (const tool of tools) {
      try {
        await this.projectManager.runCommand(tool.command)
      } catch (error) {
        warnings.push(`${tool.name} no está instalado o no es accesible`)
      }
    }

    return { errors, warnings }
  }

  /**
   * Obtiene estadísticas del proyecto
   */
  private async getProjectStats(): Promise<ProjectValidationResult['stats']> {
    try {
      const stats = await this.projectManager.getProjectStats()
      const structure = await this.projectManager.getProjectStructure()
      
      return {
        totalFiles: structure.files.length,
        totalSize: stats.size || 0,
        modules: structure.directories,
        dependencies: stats.dependencies || 0
      }
    } catch (error) {
      this.logger.error('Error obteniendo estadísticas:', error as Error)
      return {
        totalFiles: 0,
        totalSize: 0,
        modules: [],
        dependencies: 0
      }
    }
  }

  /**
   * Genera sugerencias de mejora
   */
  private generateSuggestions(validationResult: ProjectValidationResult): string[] {
    const suggestions: string[] = []

    // Sugerencias basadas en errores y advertencias
    if (validationResult.warnings.some(w => w.includes('JWT secret'))) {
      suggestions.push('Configura un JWT secret seguro en el archivo .env')
    }

    if (validationResult.warnings.some(w => w.includes('API key'))) {
      suggestions.push('Configura las API keys necesarias en el archivo .env')
    }

    if (validationResult.warnings.some(w => w.includes('TypeScript'))) {
      suggestions.push('Actualiza TypeScript a la versión más reciente')
    }

    if (validationResult.warnings.some(w => w.includes('npm'))) {
      suggestions.push('Actualiza npm a la versión más reciente')
    }

    if (validationResult.stats.totalSize > 100 * 1024 * 1024) { // 100MB
      suggestions.push('Considera optimizar el tamaño del proyecto')
    }

    if (validationResult.stats.modules.length < 4) {
      suggestions.push('Verifica que todos los módulos principales estén presentes')
    }

    return suggestions
  }
} 
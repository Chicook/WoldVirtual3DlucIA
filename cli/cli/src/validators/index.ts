/**
 * @metaverso/cli - Validadores
 * 
 * Exporta todos los validadores del CLI para el metaverso
 */

// Exportar validadores principales
export * from './ConfigValidator'
export * from './ProjectValidator'
export * from './SecurityValidator'
export * from './PerformanceValidator'

// Exportar tipos comunes
export interface ValidationResult {
  valid: boolean
  errors: string[]
  warnings: string[]
  suggestions: string[]
}

export interface ValidationOptions {
  strict?: boolean
  checkSecrets?: boolean
  checkUrls?: boolean
  checkDependencies?: boolean
  checkSecurity?: boolean
  checkPerformance?: boolean
}

// Exportar clase principal de validación
import { ConfigValidator } from './ConfigValidator'
import { ProjectValidator } from './ProjectValidator'
import { SecurityValidator } from './SecurityValidator'
import { PerformanceValidator } from './PerformanceValidator'
import { Logger } from '../utils/Logger'

export class ValidatorManager {
  private logger: Logger
  private configValidator: ConfigValidator
  private projectValidator: ProjectValidator
  private securityValidator: SecurityValidator
  private performanceValidator: PerformanceValidator

  constructor() {
    this.logger = new Logger('ValidatorManager')
    this.configValidator = new ConfigValidator()
    this.projectValidator = new ProjectValidator()
    this.securityValidator = new SecurityValidator()
    this.performanceValidator = new PerformanceValidator()
  }

  /**
   * Ejecuta validación completa del proyecto
   */
  async validateAll(options: ValidationOptions = {}): Promise<{
    config: any
    project: any
    security: any
    performance: any
    summary: {
      valid: boolean
      totalIssues: number
      score: number
    }
  }> {
    try {
      this.logger.info('Iniciando validación completa del proyecto...')

      // Ejecutar todas las validaciones en paralelo
      const [configResult, projectResult, securityResult, performanceResult] = await Promise.all([
        this.configValidator.validateConfig({}, options),
        this.projectValidator.validateProject(options),
        this.securityValidator.auditSecurity(options),
        this.performanceValidator.validatePerformance(options)
      ])

      // Calcular resumen
      const totalIssues = 
        configResult.errors.length + configResult.warnings.length +
        projectResult.errors.length + projectResult.warnings.length +
        securityResult.vulnerabilities.length +
        performanceResult.issues.length

      const score = Math.round((securityResult.score + performanceResult.score) / 2)
      const valid = configResult.valid && projectResult.valid && securityResult.valid && performanceResult.valid

      const summary = {
        valid,
        totalIssues,
        score
      }

      this.logger.info(`Validación completada. Score: ${score}/100, Issues: ${totalIssues}`)

      return {
        config: configResult,
        project: projectResult,
        security: securityResult,
        performance: performanceResult,
        summary
      }

    } catch (error) {
      this.logger.error('Error durante la validación completa:', error as Error)
      throw error
    }
  }

  /**
   * Valida solo la configuración
   */
  async validateConfig(config: any, options?: any): Promise<any> {
    return this.configValidator.validateConfig(config, options)
  }

  /**
   * Valida solo el proyecto
   */
  async validateProject(options?: any): Promise<any> {
    return this.projectValidator.validateProject(options)
  }

  /**
   * Valida solo la seguridad
   */
  async validateSecurity(options?: any): Promise<any> {
    return this.securityValidator.auditSecurity(options)
  }

  /**
   * Valida solo el rendimiento
   */
  async validatePerformance(options?: any): Promise<any> {
    return this.performanceValidator.validatePerformance(options)
  }

  /**
   * Obtiene estadísticas de validación
   */
  getStats(): any {
    return {
      validators: {
        config: 'ConfigValidator',
        project: 'ProjectValidator',
        security: 'SecurityValidator',
        performance: 'PerformanceValidator'
      },
      capabilities: [
        'Validación de configuración',
        'Validación de estructura de proyecto',
        'Auditoría de seguridad',
        'Análisis de rendimiento',
        'Validación de dependencias',
        'Verificación de secretos',
        'Análisis de compliance'
      ]
    }
  }
}

// Exportar instancia singleton
export const validatorManager = new ValidatorManager()

// Exportar funciones de conveniencia
export const validateAll = (options?: ValidationOptions) => validatorManager.validateAll(options)
export const validateConfig = (config: any, options?: any) => validatorManager.validateConfig(config, options)
export const validateProject = (options?: any) => validatorManager.validateProject(options)
export const validateSecurity = (options?: any) => validatorManager.validateSecurity(options)
export const validatePerformance = (options?: any) => validatorManager.validatePerformance(options) 
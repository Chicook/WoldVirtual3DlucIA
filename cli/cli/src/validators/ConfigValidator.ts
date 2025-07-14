import { z } from 'zod'
import { Logger } from '../utils/Logger'

export interface ValidationResult {
  valid: boolean
  errors: string[]
  warnings: string[]
  suggestions: string[]
}

export interface ConfigValidationOptions {
  strict?: boolean
  checkSecrets?: boolean
  checkUrls?: boolean
  checkDependencies?: boolean
}

export class ConfigValidator {
  private logger: Logger

  constructor() {
    this.logger = new Logger('ConfigValidator')
  }

  /**
   * Valida la configuración completa del metaverso
   */
  async validateConfig(config: any, options: ConfigValidationOptions = {}): Promise<ValidationResult> {
    const result: ValidationResult = {
      valid: true,
      errors: [],
      warnings: [],
      suggestions: []
    }

    try {
      this.logger.info('Iniciando validación de configuración...')

      // Validar estructura básica
      const basicValidation = this.validateBasicStructure(config)
      result.errors.push(...basicValidation.errors)
      result.warnings.push(...basicValidation.warnings)

      // Validar redes blockchain
      const networkValidation = this.validateNetworks(config.networks || [])
      result.errors.push(...networkValidation.errors)
      result.warnings.push(...networkValidation.warnings)

      // Validar configuración de contratos
      const contractValidation = this.validateContracts(config.contracts || {})
      result.errors.push(...contractValidation.errors)
      result.warnings.push(...contractValidation.warnings)

      // Validar configuración de backend
      const backendValidation = this.validateBackend(config.backend || {})
      result.errors.push(...backendValidation.errors)
      result.warnings.push(...backendValidation.warnings)

      // Validar configuración de frontend
      const frontendValidation = this.validateFrontend(config.frontend || {})
      result.errors.push(...frontendValidation.errors)
      result.warnings.push(...frontendValidation.warnings)

      // Validar configuración de metaverso
      const metaverseValidation = this.validateMetaverse(config.metaverse || {})
      result.errors.push(...metaverseValidation.errors)
      result.warnings.push(...metaverseValidation.warnings)

      // Validar configuración de seguridad
      const securityValidation = this.validateSecurity(config.security || {})
      result.errors.push(...securityValidation.errors)
      result.warnings.push(...securityValidation.warnings)

      // Validar configuración de monitoreo
      const monitoringValidation = this.validateMonitoring(config.monitoring || {})
      result.errors.push(...monitoringValidation.errors)
      result.warnings.push(...monitoringValidation.warnings)

      // Validaciones adicionales si están habilitadas
      if (options.checkSecrets) {
        const secretsValidation = this.validateSecrets(config)
        result.errors.push(...secretsValidation.errors)
        result.warnings.push(...secretsValidation.warnings)
      }

      if (options.checkUrls) {
        const urlsValidation = this.validateUrls(config)
        result.errors.push(...urlsValidation.errors)
        result.warnings.push(...urlsValidation.warnings)
      }

      if (options.checkDependencies) {
        const dependenciesValidation = this.validateDependencies(config)
        result.errors.push(...dependenciesValidation.errors)
        result.warnings.push(...dependenciesValidation.warnings)
      }

      // Generar sugerencias
      result.suggestions = this.generateSuggestions(config, result)

      // Determinar si la configuración es válida
      result.valid = result.errors.length === 0

      this.logger.info(`Validación completada: ${result.valid ? 'VÁLIDA' : 'INVÁLIDA'}`)
      this.logger.info(`Errores: ${result.errors.length}, Advertencias: ${result.warnings.length}`)

    } catch (error) {
      this.logger.error('Error durante la validación:', error as Error)
      result.valid = false
      result.errors.push(`Error de validación: ${error.message}`)
    }

    return result
  }

  /**
   * Valida la estructura básica de la configuración
   */
  private validateBasicStructure(config: any): ValidationResult {
    const result: ValidationResult = {
      valid: true,
      errors: [],
      warnings: [],
      suggestions: []
    }

    // Validar campos requeridos
    const requiredFields = ['version', 'environment']
    for (const field of requiredFields) {
      if (!config[field]) {
        result.errors.push(`Campo requerido faltante: ${field}`)
      }
    }

    // Validar versión
    if (config.version && !this.isValidVersion(config.version)) {
      result.errors.push('Formato de versión inválido. Debe ser semver (ej: 1.0.0)')
    }

    // Validar entorno
    if (config.environment && !['development', 'staging', 'production'].includes(config.environment)) {
      result.errors.push('Entorno inválido. Debe ser: development, staging, o production')
    }

    // Advertencias
    if (!config.project?.name) {
      result.warnings.push('Nombre del proyecto no especificado')
    }

    if (!config.project?.description) {
      result.warnings.push('Descripción del proyecto no especificada')
    }

    return result
  }

  /**
   * Valida la configuración de redes blockchain
   */
  private validateNetworks(networks: any[]): ValidationResult {
    const result: ValidationResult = {
      valid: true,
      errors: [],
      warnings: [],
      suggestions: []
    }

    if (!Array.isArray(networks)) {
      result.errors.push('Networks debe ser un array')
      return result
    }

    if (networks.length === 0) {
      result.warnings.push('No hay redes blockchain configuradas')
    }

    const requiredNetworkFields = ['name', 'chainId', 'rpcUrl']
    const validChainIds = [1, 137, 42161, 10, 56, 43114] // Ethereum, Polygon, Arbitrum, Optimism, BSC, Avalanche

    for (let i = 0; i < networks.length; i++) {
      const network = networks[i]
      
      // Validar campos requeridos
      for (const field of requiredNetworkFields) {
        if (!network[field]) {
          result.errors.push(`Red ${i}: Campo requerido faltante: ${field}`)
        }
      }

      // Validar chainId
      if (network.chainId && !validChainIds.includes(network.chainId)) {
        result.warnings.push(`Red ${i}: ChainId ${network.chainId} no es una red estándar`)
      }

      // Validar RPC URL
      if (network.rpcUrl && !this.isValidUrl(network.rpcUrl)) {
        result.errors.push(`Red ${i}: RPC URL inválida: ${network.rpcUrl}`)
      }

      // Validar explorer URL
      if (network.explorerUrl && !this.isValidUrl(network.explorerUrl)) {
        result.errors.push(`Red ${i}: Explorer URL inválida: ${network.explorerUrl}`)
      }

      // Validar moneda nativa
      if (network.nativeCurrency) {
        const currency = network.nativeCurrency
        if (!currency.name || !currency.symbol || !currency.decimals) {
          result.errors.push(`Red ${i}: Configuración de moneda nativa incompleta`)
        }
      }
    }

    return result
  }

  /**
   * Valida la configuración de contratos
   */
  private validateContracts(contracts: any): ValidationResult {
    const result: ValidationResult = {
      valid: true,
      errors: [],
      warnings: [],
      suggestions: []
    }

    // Validar compilador
    if (contracts.compiler) {
      const compiler = contracts.compiler
      
      if (compiler.version && !this.isValidSolidityVersion(compiler.version)) {
        result.errors.push('Versión de Solidity inválida')
      }

      if (compiler.optimizer) {
        if (typeof compiler.optimizer.enabled !== 'boolean') {
          result.errors.push('Optimizer.enabled debe ser un booleano')
        }
        
        if (compiler.optimizer.runs && (compiler.optimizer.runs < 0 || compiler.optimizer.runs > 1000000)) {
          result.errors.push('Optimizer.runs debe estar entre 0 y 1000000')
        }
      }
    }

    // Validar gas
    if (contracts.gas) {
      if (contracts.gas.limit && contracts.gas.limit <= 0) {
        result.errors.push('Gas limit debe ser mayor que 0')
      }
    }

    return result
  }

  /**
   * Valida la configuración de backend
   */
  private validateBackend(backend: any): ValidationResult {
    const result: ValidationResult = {
      valid: true,
      errors: [],
      warnings: [],
      suggestions: []
    }

    // Validar servidor
    if (backend.server) {
      const server = backend.server
      
      if (server.port && (server.port < 1 || server.port > 65535)) {
        result.errors.push('Puerto del servidor debe estar entre 1 y 65535')
      }

      if (server.host && !this.isValidHost(server.host)) {
        result.errors.push('Host del servidor inválido')
      }
    }

    // Validar base de datos
    if (backend.database) {
      const db = backend.database
      
      if (!db.type || !['postgresql', 'mysql', 'sqlite', 'mongodb'].includes(db.type)) {
        result.errors.push('Tipo de base de datos inválido')
      }

      if (!db.url) {
        result.errors.push('URL de base de datos requerida')
      }

      if (db.pool) {
        if (db.pool.min && db.pool.min < 1) {
          result.errors.push('Pool mínimo debe ser mayor que 0')
        }
        
        if (db.pool.max && db.pool.max < db.pool.min) {
          result.errors.push('Pool máximo debe ser mayor o igual al mínimo')
        }
      }
    }

    // Validar autenticación
    if (backend.auth) {
      if (backend.auth.jwt) {
        if (!backend.auth.jwt.secret) {
          result.errors.push('JWT secret requerido')
        }
        
        if (backend.auth.jwt.secret && backend.auth.jwt.secret.length < 32) {
          result.warnings.push('JWT secret debería tener al menos 32 caracteres')
        }
      }
    }

    return result
  }

  /**
   * Valida la configuración de frontend
   */
  private validateFrontend(frontend: any): ValidationResult {
    const result: ValidationResult = {
      valid: true,
      errors: [],
      warnings: [],
      suggestions: []
    }

    // Validar build
    if (frontend.build) {
      const build = frontend.build
      
      if (build.target && !['es2015', 'es2017', 'es2020', 'esnext'].includes(build.target)) {
        result.errors.push('Target de build inválido')
      }

      if (build.format && !['es', 'cjs', 'umd', 'iife'].includes(build.format)) {
        result.errors.push('Formato de build inválido')
      }
    }

    // Validar desarrollo
    if (frontend.dev) {
      const dev = frontend.dev
      
      if (dev.port && (dev.port < 1 || dev.port > 65535)) {
        result.errors.push('Puerto de desarrollo debe estar entre 1 y 65535')
      }
    }

    return result
  }

  /**
   * Valida la configuración del metaverso
   */
  private validateMetaverse(metaverse: any): ValidationResult {
    const result: ValidationResult = {
      valid: true,
      errors: [],
      warnings: [],
      suggestions: []
    }

    // Validar mundo
    if (metaverse.world) {
      const world = metaverse.world
      
      if (!world.name) {
        result.errors.push('Nombre del mundo requerido')
      }

      if (world.maxPlayers && (world.maxPlayers < 1 || world.maxPlayers > 10000)) {
        result.errors.push('MaxPlayers debe estar entre 1 y 10000')
      }

      if (world.physics) {
        if (world.physics.gravity && typeof world.physics.gravity !== 'number') {
          result.errors.push('Gravity debe ser un número')
        }
      }
    }

    // Validar avatares
    if (metaverse.avatars) {
      const avatars = metaverse.avatars
      
      if (avatars.maxHeight && avatars.maxHeight <= 0) {
        result.errors.push('MaxHeight debe ser mayor que 0')
      }

      if (avatars.minHeight && avatars.minHeight <= 0) {
        result.errors.push('MinHeight debe ser mayor que 0')
      }

      if (avatars.maxHeight && avatars.minHeight && avatars.maxHeight <= avatars.minHeight) {
        result.errors.push('MaxHeight debe ser mayor que MinHeight')
      }
    }

    return result
  }

  /**
   * Valida la configuración de seguridad
   */
  private validateSecurity(security: any): ValidationResult {
    const result: ValidationResult = {
      valid: true,
      errors: [],
      warnings: [],
      suggestions: []
    }

    // Validar CORS
    if (security.cors) {
      if (security.cors.origins && !Array.isArray(security.cors.origins)) {
        result.errors.push('CORS origins debe ser un array')
      }

      if (security.cors.methods && !Array.isArray(security.cors.methods)) {
        result.errors.push('CORS methods debe ser un array')
      }
    }

    // Validar rate limiting
    if (security.rateLimit) {
      if (security.rateLimit.windowMs && security.rateLimit.windowMs <= 0) {
        result.errors.push('Rate limit window debe ser mayor que 0')
      }

      if (security.rateLimit.max && security.rateLimit.max <= 0) {
        result.errors.push('Rate limit max debe ser mayor que 0')
      }
    }

    return result
  }

  /**
   * Valida la configuración de monitoreo
   */
  private validateMonitoring(monitoring: any): ValidationResult {
    const result: ValidationResult = {
      valid: true,
      errors: [],
      warnings: [],
      suggestions: []
    }

    // Validar métricas
    if (monitoring.metrics) {
      if (monitoring.metrics.interval && monitoring.metrics.interval <= 0) {
        result.errors.push('Intervalo de métricas debe ser mayor que 0')
      }

      if (monitoring.metrics.retention && monitoring.metrics.retention <= 0) {
        result.errors.push('Retención de métricas debe ser mayor que 0')
      }
    }

    // Validar logging
    if (monitoring.logging) {
      if (monitoring.logging.level && !['debug', 'info', 'warn', 'error'].includes(monitoring.logging.level)) {
        result.errors.push('Nivel de logging inválido')
      }

      if (monitoring.logging.retention && monitoring.logging.retention <= 0) {
        result.errors.push('Retención de logs debe ser mayor que 0')
      }
    }

    return result
  }

  /**
   * Valida secretos y claves
   */
  private validateSecrets(config: any): ValidationResult {
    const result: ValidationResult = {
      valid: true,
      errors: [],
      warnings: [],
      suggestions: []
    }

    // Verificar JWT secret
    if (config.backend?.auth?.jwt?.secret) {
      const secret = config.backend.auth.jwt.secret
      if (secret === 'your-super-secret-jwt-key' || secret.length < 32) {
        result.warnings.push('JWT secret debe ser cambiado por uno seguro')
      }
    }

    // Verificar API keys
    if (config.contracts?.verification?.apiKeys) {
      const apiKeys = config.contracts.verification.apiKeys
      for (const [network, key] of Object.entries(apiKeys)) {
        if (key === 'your-api-key' || key === '') {
          result.warnings.push(`API key para ${network} debe ser configurada`)
        }
      }
    }

    return result
  }

  /**
   * Valida URLs
   */
  private validateUrls(config: any): ValidationResult {
    const result: ValidationResult = {
      valid: true,
      errors: [],
      warnings: [],
      suggestions: []
    }

    // Validar URLs de redes
    if (config.networks) {
      for (const network of config.networks) {
        if (network.rpcUrl && !this.isValidUrl(network.rpcUrl)) {
          result.errors.push(`RPC URL inválida para ${network.name}: ${network.rpcUrl}`)
        }
        
        if (network.explorerUrl && !this.isValidUrl(network.explorerUrl)) {
          result.errors.push(`Explorer URL inválida para ${network.name}: ${network.explorerUrl}`)
        }
      }
    }

    // Validar URL de base de datos
    if (config.backend?.database?.url) {
      const dbUrl = config.backend.database.url
      if (!this.isValidDatabaseUrl(dbUrl)) {
        result.errors.push(`URL de base de datos inválida: ${dbUrl}`)
      }
    }

    return result
  }

  /**
   * Valida dependencias
   */
  private validateDependencies(config: any): ValidationResult {
    const result: ValidationResult = {
      valid: true,
      errors: [],
      warnings: [],
      suggestions: []
    }

    // Verificar dependencias requeridas
    const requiredDeps = ['typescript', 'node']
    // Aquí podrías verificar las dependencias reales del package.json

    return result
  }

  /**
   * Genera sugerencias de mejora
   */
  private generateSuggestions(config: any, validationResult: ValidationResult): string[] {
    const suggestions: string[] = []

    // Sugerencias basadas en errores y advertencias
    if (validationResult.warnings.some(w => w.includes('JWT secret'))) {
      suggestions.push('Genera un JWT secret seguro usando: node -e "console.log(require(\'crypto\').randomBytes(32).toString(\'hex\'))"')
    }

    if (validationResult.warnings.some(w => w.includes('API key'))) {
      suggestions.push('Configura las API keys para verificación de contratos en los block explorers')
    }

    if (!config.networks || config.networks.length === 0) {
      suggestions.push('Configura al menos una red blockchain para el desarrollo')
    }

    if (!config.monitoring?.enabled) {
      suggestions.push('Habilita el monitoreo para mejor observabilidad del sistema')
    }

    if (!config.security?.rateLimit?.enabled) {
      suggestions.push('Habilita rate limiting para proteger tu API')
    }

    return suggestions
  }

  /**
   * Utilidades de validación
   */
  private isValidVersion(version: string): boolean {
    return /^\d+\.\d+\.\d+$/.test(version)
  }

  private isValidUrl(url: string): boolean {
    try {
      new URL(url)
      return true
    } catch {
      return false
    }
  }

  private isValidHost(host: string): boolean {
    return /^[a-zA-Z0-9.-]+$/.test(host) || host === 'localhost'
  }

  private isValidSolidityVersion(version: string): boolean {
    return /^\d+\.\d+\.\d+$/.test(version)
  }

  private isValidDatabaseUrl(url: string): boolean {
    const validSchemes = ['postgresql://', 'mysql://', 'mongodb://', 'sqlite://']
    return validSchemes.some(scheme => url.startsWith(scheme))
  }
} 
import { Logger } from '../utils/Logger'
import { ProjectManager } from '../utils/ProjectManager'

export interface SecurityValidationResult {
  valid: boolean
  score: number
  vulnerabilities: Vulnerability[]
  recommendations: string[]
  compliance: ComplianceResult
}

export interface Vulnerability {
  id: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  title: string
  description: string
  location: string
  cve?: string
  fixedIn?: string
  remediation: string
}

export interface ComplianceResult {
  gdpr: boolean
  sox: boolean
  pci: boolean
  hipaa: boolean
  issues: string[]
}

export interface SecurityValidationOptions {
  checkDependencies?: boolean
  checkCode?: boolean
  checkConfig?: boolean
  checkSecrets?: boolean
  checkNetwork?: boolean
  checkCompliance?: boolean
}

export class SecurityValidator {
  private logger: Logger
  private projectManager: ProjectManager

  constructor() {
    this.logger = new Logger('SecurityValidator')
    this.projectManager = new ProjectManager()
  }

  /**
   * Ejecuta auditoría de seguridad completa
   */
  async auditSecurity(options: SecurityValidationOptions = {}): Promise<SecurityValidationResult> {
    const result: SecurityValidationResult = {
      valid: true,
      score: 100,
      vulnerabilities: [],
      recommendations: [],
      compliance: {
        gdpr: true,
        sox: true,
        pci: true,
        hipaa: true,
        issues: []
      }
    }

    try {
      this.logger.info('Iniciando auditoría de seguridad...')

      // Verificar dependencias si está habilitado
      if (options.checkDependencies !== false) {
        const depVulns = await this.checkDependencies()
        result.vulnerabilities.push(...depVulns)
      }

      // Verificar código si está habilitado
      if (options.checkCode !== false) {
        const codeVulns = await this.checkCode()
        result.vulnerabilities.push(...codeVulns)
      }

      // Verificar configuración si está habilitado
      if (options.checkConfig !== false) {
        const configVulns = await this.checkConfiguration()
        result.vulnerabilities.push(...configVulns)
      }

      // Verificar secretos si está habilitado
      if (options.checkSecrets !== false) {
        const secretVulns = await this.checkSecrets()
        result.vulnerabilities.push(...secretVulns)
      }

      // Verificar red si está habilitado
      if (options.checkNetwork !== false) {
        const networkVulns = await this.checkNetwork()
        result.vulnerabilities.push(...networkVulns)
      }

      // Verificar compliance si está habilitado
      if (options.checkCompliance !== false) {
        const complianceResult = await this.checkCompliance()
        result.compliance = complianceResult
      }

      // Calcular score de seguridad
      result.score = this.calculateSecurityScore(result.vulnerabilities)

      // Generar recomendaciones
      result.recommendations = this.generateRecommendations(result)

      // Determinar si es válido
      result.valid = result.score >= 70 && result.vulnerabilities.filter(v => v.severity === 'critical').length === 0

      this.logger.info(`Auditoría completada. Score: ${result.score}/100`)
      this.logger.info(`Vulnerabilidades encontradas: ${result.vulnerabilities.length}`)

    } catch (error) {
      this.logger.error('Error durante la auditoría de seguridad:', error as Error)
      result.valid = false
      result.score = 0
      result.vulnerabilities.push({
        id: 'AUDIT_ERROR',
        severity: 'critical',
        title: 'Error de Auditoría',
        description: 'Error durante la ejecución de la auditoría de seguridad',
        location: 'system',
        remediation: 'Revisar logs y ejecutar nuevamente'
      })
    }

    return result
  }

  /**
   * Verifica vulnerabilidades en dependencias
   */
  private async checkDependencies(): Promise<Vulnerability[]> {
    const vulnerabilities: Vulnerability[] = []

    try {
      this.logger.progress('Verificando vulnerabilidades en dependencias...')

      // Ejecutar npm audit
      const { stdout, stderr } = await this.projectManager.runCommand('npm audit --json')
      
      if (stderr) {
        this.logger.warn('npm audit generó advertencias')
      }

      try {
        const auditResult = JSON.parse(stdout)
        
        if (auditResult.vulnerabilities) {
          for (const [pkgName, vulnData] of Object.entries(auditResult.vulnerabilities)) {
            const vuln = vulnData as any
            
            vulnerabilities.push({
              id: vuln.id || `DEP-${pkgName}`,
              severity: this.mapSeverity(vuln.severity),
              title: `Vulnerabilidad en ${pkgName}`,
              description: vuln.title || 'Vulnerabilidad de seguridad detectada',
              location: `dependencies/${pkgName}`,
              cve: vuln.cve,
              fixedIn: vuln.fixedIn,
              remediation: `Actualizar ${pkgName} a la versión ${vuln.fixedIn || 'más reciente'}`
            })
          }
        }
      } catch (parseError) {
        this.logger.warn('No se pudo parsear el resultado de npm audit')
      }

    } catch (error) {
      this.logger.warn('npm audit no está disponible o falló')
    }

    return vulnerabilities
  }

  /**
   * Verifica vulnerabilidades en el código
   */
  private async checkCode(): Promise<Vulnerability[]> {
    const vulnerabilities: Vulnerability[] = []

    try {
      this.logger.progress('Verificando vulnerabilidades en el código...')

      // Verificar archivos de configuración
      const configFiles = ['package.json', 'metaverso.config.json', '.env']
      
      for (const file of configFiles) {
        if (await this.projectManager.fileExists(file)) {
          const fileVulns = await this.checkFileSecurity(file)
          vulnerabilities.push(...fileVulns)
        }
      }

      // Verificar archivos de contratos
      if (await this.projectManager.fileExists('contracts')) {
        const contractVulns = await this.checkContractSecurity()
        vulnerabilities.push(...contractVulns)
      }

      // Verificar archivos de backend
      if (await this.projectManager.fileExists('backend')) {
        const backendVulns = await this.checkBackendSecurity()
        vulnerabilities.push(...backendVulns)
      }

      // Verificar archivos de frontend
      if (await this.projectManager.fileExists('client')) {
        const frontendVulns = await this.checkFrontendSecurity()
        vulnerabilities.push(...frontendVulns)
      }

    } catch (error) {
      this.logger.error('Error verificando código:', error as Error)
    }

    return vulnerabilities
  }

  /**
   * Verifica seguridad de un archivo específico
   */
  private async checkFileSecurity(filePath: string): Promise<Vulnerability[]> {
    const vulnerabilities: Vulnerability[] = []

    try {
      const content = await this.projectManager.readFile(filePath)
      
      // Verificar secretos hardcodeados
      const secretPatterns = [
        /password\s*[:=]\s*["'][^"']+["']/gi,
        /secret\s*[:=]\s*["'][^"']+["']/gi,
        /key\s*[:=]\s*["'][^"']+["']/gi,
        /token\s*[:=]\s*["'][^"']+["']/gi,
        /api_key\s*[:=]\s*["'][^"']+["']/gi
      ]

      for (const pattern of secretPatterns) {
        if (pattern.test(content)) {
          vulnerabilities.push({
            id: `HARDCODED_SECRET_${filePath}`,
            severity: 'high',
            title: 'Secreto hardcodeado',
            description: 'Se encontró un secreto hardcodeado en el archivo',
            location: filePath,
            remediation: 'Mover secretos a variables de entorno'
          })
        }
      }

      // Verificar URLs inseguras
      const insecureUrls = content.match(/https?:\/\/[^\s"']+/g) || []
      for (const url of insecureUrls) {
        if (url.startsWith('http://')) {
          vulnerabilities.push({
            id: `INSECURE_URL_${filePath}`,
            severity: 'medium',
            title: 'URL insegura',
            description: 'Se encontró una URL HTTP (no HTTPS)',
            location: filePath,
            remediation: 'Usar HTTPS en lugar de HTTP'
          })
        }
      }

    } catch (error) {
      this.logger.warn(`No se pudo verificar el archivo ${filePath}`)
    }

    return vulnerabilities
  }

  /**
   * Verifica seguridad de contratos
   */
  private async checkContractSecurity(): Promise<Vulnerability[]> {
    const vulnerabilities: Vulnerability[] = []

    try {
      // Verificar archivos de contratos
      const contractFiles = [
        'contracts/core/',
        'contracts/nfts/',
        'contracts/defi/',
        'contracts/governance/'
      ]

      for (const dir of contractFiles) {
        if (await this.projectManager.fileExists(dir)) {
          // Verificar patrones de seguridad comunes en Solidity
          const solidityVulns = await this.checkSoliditySecurity(dir)
          vulnerabilities.push(...solidityVulns)
        }
      }

    } catch (error) {
      this.logger.warn('Error verificando seguridad de contratos')
    }

    return vulnerabilities
  }

  /**
   * Verifica seguridad de código Solidity
   */
  private async checkSoliditySecurity(dir: string): Promise<Vulnerability[]> {
    const vulnerabilities: Vulnerability[] = []

    try {
      // Buscar archivos .sol
      const { stdout } = await this.projectManager.runCommand(`find ${dir} -name "*.sol"`)
      const files = stdout.split('\n').filter(f => f.trim())

      for (const file of files) {
        try {
          const content = await this.projectManager.readFile(file)
          
          // Verificar patrones de vulnerabilidad
          const patterns = [
            {
              pattern: /\.call\(/g,
              severity: 'high' as const,
              title: 'Uso de .call()',
              description: 'Uso de .call() puede ser peligroso',
              remediation: 'Usar .transfer() o .send() cuando sea posible'
            },
            {
              pattern: /tx\.origin/g,
              severity: 'critical' as const,
              title: 'Uso de tx.origin',
              description: 'tx.origin es vulnerable a ataques de phishing',
              remediation: 'Usar msg.sender en lugar de tx.origin'
            },
            {
              pattern: /block\.timestamp/g,
              severity: 'medium' as const,
              title: 'Uso de block.timestamp',
              description: 'block.timestamp puede ser manipulado por mineros',
              remediation: 'Usar oráculos para tiempo confiable'
            },
            {
              pattern: /revert\(\)/g,
              severity: 'low' as const,
              title: 'Uso de revert()',
              description: 'revert() sin mensaje no es informativo',
              remediation: 'Usar revert con mensaje descriptivo'
            }
          ]

          for (const { pattern, severity, title, description, remediation } of patterns) {
            if (pattern.test(content)) {
              vulnerabilities.push({
                id: `SOLIDITY_${title.replace(/\s+/g, '_')}_${file}`,
                severity,
                title,
                description,
                location: file,
                remediation
              })
            }
          }
        } catch (error) {
          this.logger.warn(`No se pudo verificar el archivo ${file}`)
        }
      }
    } catch (error) {
      this.logger.warn('Error verificando archivos Solidity')
    }

    return vulnerabilities
  }

  /**
   * Verifica seguridad del backend
   */
  private async checkBackendSecurity(): Promise<Vulnerability[]> {
    const vulnerabilities: Vulnerability[] = []

    try {
      // Verificar archivos de configuración del backend
      const backendFiles = [
        'backend/package.json',
        'backend/src/app.ts',
        'backend/src/middleware/'
      ]

      for (const file of backendFiles) {
        if (await this.projectManager.fileExists(file)) {
          const fileVulns = await this.checkFileSecurity(file)
          vulnerabilities.push(...fileVulns)
        }
      }

    } catch (error) {
      this.logger.warn('Error verificando seguridad del backend')
    }

    return vulnerabilities
  }

  /**
   * Verifica seguridad del frontend
   */
  private async checkFrontendSecurity(): Promise<Vulnerability[]> {
    const vulnerabilities: Vulnerability[] = []

    try {
      // Verificar archivos de configuración del frontend
      const frontendFiles = [
        'client/package.json',
        'client/vite.config.ts',
        'client/src/'
      ]

      for (const file of frontendFiles) {
        if (await this.projectManager.fileExists(file)) {
          const fileVulns = await this.checkFileSecurity(file)
          vulnerabilities.push(...fileVulns)
        }
      }

    } catch (error) {
      this.logger.warn('Error verificando seguridad del frontend')
    }

    return vulnerabilities
  }

  /**
   * Verifica configuración de seguridad
   */
  private async checkConfiguration(): Promise<Vulnerability[]> {
    const vulnerabilities: Vulnerability[] = []

    try {
      this.logger.progress('Verificando configuración de seguridad...')

      // Verificar archivo de configuración
      if (await this.projectManager.fileExists('metaverso.config.json')) {
        const configContent = await this.projectManager.readFile('metaverso.config.json')
        const config = JSON.parse(configContent)

        // Verificar configuración de CORS
        if (config.backend?.server?.cors === true) {
          vulnerabilities.push({
            id: 'CORS_ENABLED',
            severity: 'medium',
            title: 'CORS habilitado sin restricciones',
            description: 'CORS está habilitado sin configurar orígenes específicos',
            location: 'metaverso.config.json',
            remediation: 'Configurar orígenes específicos en CORS'
          })
        }

        // Verificar rate limiting
        if (!config.security?.rateLimit?.enabled) {
          vulnerabilities.push({
            id: 'NO_RATE_LIMIT',
            severity: 'medium',
            title: 'Rate limiting deshabilitado',
            description: 'No hay protección contra ataques de fuerza bruta',
            location: 'metaverso.config.json',
            remediation: 'Habilitar rate limiting'
          })
        }

        // Verificar helmet
        if (!config.security?.helmet?.enabled) {
          vulnerabilities.push({
            id: 'NO_HELMET',
            severity: 'medium',
            title: 'Helmet deshabilitado',
            description: 'No hay protección de headers HTTP',
            location: 'metaverso.config.json',
            remediation: 'Habilitar Helmet para protección de headers'
          })
        }
      }

    } catch (error) {
      this.logger.warn('Error verificando configuración')
    }

    return vulnerabilities
  }

  /**
   * Verifica secretos y claves
   */
  private async checkSecrets(): Promise<Vulnerability[]> {
    const vulnerabilities: Vulnerability[] = []

    try {
      this.logger.progress('Verificando secretos y claves...')

      // Verificar archivo .env
      if (await this.projectManager.fileExists('.env')) {
        const envContent = await this.projectManager.readFile('.env')
        
        // Verificar secretos por defecto
        const defaultSecrets = [
          'your-super-secret-jwt-key',
          'your-api-key',
          'your-secret-key',
          'password123',
          'admin123'
        ]

        for (const secret of defaultSecrets) {
          if (envContent.includes(secret)) {
            vulnerabilities.push({
              id: `DEFAULT_SECRET_${secret}`,
              severity: 'critical',
              title: 'Secreto por defecto',
              description: `Se encontró un secreto por defecto: ${secret}`,
              location: '.env',
              remediation: 'Cambiar por un secreto seguro'
            })
          }
        }

        // Verificar secretos débiles
        const weakPatterns = [
          /password\s*=\s*[a-zA-Z0-9]{1,8}/gi,
          /secret\s*=\s*[a-zA-Z0-9]{1,16}/gi
        ]

        for (const pattern of weakPatterns) {
          if (pattern.test(envContent)) {
            vulnerabilities.push({
              id: 'WEAK_SECRET',
              severity: 'high',
              title: 'Secreto débil',
              description: 'Se encontró un secreto con poca entropía',
              location: '.env',
              remediation: 'Usar secretos con al menos 32 caracteres'
            })
          }
        }
      }

    } catch (error) {
      this.logger.warn('Error verificando secretos')
    }

    return vulnerabilities
  }

  /**
   * Verifica configuración de red
   */
  private async checkNetwork(): Promise<Vulnerability[]> {
    const vulnerabilities: Vulnerability[] = []

    try {
      this.logger.progress('Verificando configuración de red...')

      // Verificar configuración de redes
      if (await this.projectManager.fileExists('metaverso.config.json')) {
        const configContent = await this.projectManager.readFile('metaverso.config.json')
        const config = JSON.parse(configContent)

        if (config.networks) {
          for (const network of config.networks) {
            // Verificar URLs HTTP
            if (network.rpcUrl && network.rpcUrl.startsWith('http://')) {
              vulnerabilities.push({
                id: `INSECURE_RPC_${network.name}`,
                severity: 'high',
                title: 'RPC URL insegura',
                description: `RPC URL de ${network.name} usa HTTP`,
                location: 'metaverso.config.json',
                remediation: 'Usar HTTPS para RPC URLs'
              })
            }

            // Verificar URLs públicas
            if (network.rpcUrl && network.rpcUrl.includes('infura.io')) {
              vulnerabilities.push({
                id: `PUBLIC_RPC_${network.name}`,
                severity: 'medium',
                title: 'RPC URL pública',
                description: `RPC URL de ${network.name} es pública`,
                location: 'metaverso.config.json',
                remediation: 'Usar RPC URL privada o con autenticación'
              })
            }
          }
        }
      }

    } catch (error) {
      this.logger.warn('Error verificando configuración de red')
    }

    return vulnerabilities
  }

  /**
   * Verifica compliance
   */
  private async checkCompliance(): Promise<ComplianceResult> {
    const compliance: ComplianceResult = {
      gdpr: true,
      sox: true,
      pci: true,
      hipaa: true,
      issues: []
    }

    try {
      this.logger.progress('Verificando compliance...')

      // Verificar GDPR
      if (await this.projectManager.fileExists('metaverso.config.json')) {
        const configContent = await this.projectManager.readFile('metaverso.config.json')
        const config = JSON.parse(configContent)

        // Verificar logging de datos personales
        if (config.monitoring?.logging?.level === 'debug') {
          compliance.gdpr = false
          compliance.issues.push('Logging en modo debug puede exponer datos personales (GDPR)')
        }

        // Verificar retención de datos
        if (config.monitoring?.logging?.retention > 30 * 24 * 60 * 60 * 1000) { // 30 días
          compliance.gdpr = false
          compliance.issues.push('Retención de logs excede 30 días (GDPR)')
        }
      }

    } catch (error) {
      this.logger.warn('Error verificando compliance')
    }

    return compliance
  }

  /**
   * Calcula el score de seguridad
   */
  private calculateSecurityScore(vulnerabilities: Vulnerability[]): number {
    let score = 100

    for (const vuln of vulnerabilities) {
      switch (vuln.severity) {
        case 'critical':
          score -= 20
          break
        case 'high':
          score -= 10
          break
        case 'medium':
          score -= 5
          break
        case 'low':
          score -= 2
          break
      }
    }

    return Math.max(0, score)
  }

  /**
   * Genera recomendaciones de seguridad
   */
  private generateRecommendations(result: SecurityValidationResult): string[] {
    const recommendations: string[] = []

    // Recomendaciones basadas en vulnerabilidades críticas
    const criticalVulns = result.vulnerabilities.filter(v => v.severity === 'critical')
    if (criticalVulns.length > 0) {
      recommendations.push('Prioriza la corrección de vulnerabilidades críticas')
    }

    // Recomendaciones basadas en score
    if (result.score < 70) {
      recommendations.push('Implementa medidas de seguridad adicionales')
    }

    // Recomendaciones específicas
    if (result.vulnerabilities.some(v => v.title.includes('Secreto hardcodeado'))) {
      recommendations.push('Mueve todos los secretos a variables de entorno')
    }

    if (result.vulnerabilities.some(v => v.title.includes('CORS'))) {
      recommendations.push('Configura CORS con orígenes específicos')
    }

    if (result.vulnerabilities.some(v => v.title.includes('Rate limiting'))) {
      recommendations.push('Habilita rate limiting para proteger contra ataques')
    }

    // Recomendaciones de compliance
    if (!result.compliance.gdpr) {
      recommendations.push('Revisa la configuración para cumplir con GDPR')
    }

    return recommendations
  }

  /**
   * Mapea severidad de npm audit a nuestro formato
   */
  private mapSeverity(npmSeverity: string): 'low' | 'medium' | 'high' | 'critical' {
    switch (npmSeverity?.toLowerCase()) {
      case 'critical':
        return 'critical'
      case 'high':
        return 'high'
      case 'moderate':
        return 'medium'
      case 'low':
        return 'low'
      default:
        return 'medium'
    }
  }
}

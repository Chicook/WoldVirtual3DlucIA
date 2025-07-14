import { Logger } from '../utils/Logger'
import { ProjectManager } from '../utils/ProjectManager'

export interface PerformanceValidationResult {
  valid: boolean
  score: number
  metrics: PerformanceMetrics
  issues: PerformanceIssue[]
  recommendations: string[]
}

export interface PerformanceMetrics {
  buildTime: number
  bundleSize: number
  memoryUsage: number
  cpuUsage: number
  loadTime: number
  responseTime: number
  throughput: number
}

export interface PerformanceIssue {
  id: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  title: string
  description: string
  location: string
  impact: string
  remediation: string
}

export interface PerformanceValidationOptions {
  checkBuild?: boolean
  checkBundle?: boolean
  checkMemory?: boolean
  checkCpu?: boolean
  checkNetwork?: boolean
  checkDatabase?: boolean
}

export class PerformanceValidator {
  private logger: Logger
  private projectManager: ProjectManager

  constructor() {
    this.logger = new Logger('PerformanceValidator')
    this.projectManager = new ProjectManager()
  }

  /**
   * Ejecuta validación de rendimiento completa
   */
  async validatePerformance(options: PerformanceValidationOptions = {}): Promise<PerformanceValidationResult> {
    const result: PerformanceValidationResult = {
      valid: true,
      score: 100,
      metrics: {
        buildTime: 0,
        bundleSize: 0,
        memoryUsage: 0,
        cpuUsage: 0,
        loadTime: 0,
        responseTime: 0,
        throughput: 0
      },
      issues: [],
      recommendations: []
    }

    try {
      this.logger.info('Iniciando validación de rendimiento...')

      // Verificar build si está habilitado
      if (options.checkBuild !== false) {
        const buildIssues = await this.checkBuildPerformance()
        result.issues.push(...buildIssues)
      }

      // Verificar bundle si está habilitado
      if (options.checkBundle !== false) {
        const bundleIssues = await this.checkBundlePerformance()
        result.issues.push(...bundleIssues)
      }

      // Verificar memoria si está habilitado
      if (options.checkMemory !== false) {
        const memoryIssues = await this.checkMemoryPerformance()
        result.issues.push(...memoryIssues)
      }

      // Verificar CPU si está habilitado
      if (options.checkCpu !== false) {
        const cpuIssues = await this.checkCpuPerformance()
        result.issues.push(...cpuIssues)
      }

      // Verificar red si está habilitado
      if (options.checkNetwork !== false) {
        const networkIssues = await this.checkNetworkPerformance()
        result.issues.push(...networkIssues)
      }

      // Verificar base de datos si está habilitado
      if (options.checkDatabase !== false) {
        const dbIssues = await this.checkDatabasePerformance()
        result.issues.push(...dbIssues)
      }

      // Calcular métricas
      result.metrics = await this.calculateMetrics()

      // Calcular score de rendimiento
      result.score = this.calculatePerformanceScore(result.issues, result.metrics)

      // Generar recomendaciones
      result.recommendations = this.generateRecommendations(result)

      // Determinar si es válido
      result.valid = result.score >= 70

      this.logger.info(`Validación de rendimiento completada. Score: ${result.score}/100`)
      this.logger.info(`Problemas encontrados: ${result.issues.length}`)

    } catch (error) {
      this.logger.error('Error durante la validación de rendimiento:', error as Error)
      result.valid = false
      result.score = 0
      result.issues.push({
        id: 'PERFORMANCE_ERROR',
        severity: 'critical',
        title: 'Error de Validación',
        description: 'Error durante la ejecución de la validación de rendimiento',
        location: 'system',
        impact: 'No se pudo completar la validación',
        remediation: 'Revisar logs y ejecutar nuevamente'
      })
    }

    return result
  }

  /**
   * Verifica rendimiento del build
   */
  private async checkBuildPerformance(): Promise<PerformanceIssue[]> {
    const issues: PerformanceIssue[] = []

    try {
      this.logger.progress('Verificando rendimiento del build...')

      // Verificar tiempo de build
      const startTime = Date.now()
      
      try {
        await this.projectManager.runCommand('npm run build', { timeout: 300000 }) // 5 minutos
        const buildTime = Date.now() - startTime
        
        if (buildTime > 120000) { // 2 minutos
          issues.push({
            id: 'SLOW_BUILD',
            severity: 'medium',
            title: 'Build lento',
            description: `El build toma ${buildTime}ms (más de 2 minutos)`,
            location: 'build system',
            impact: 'Tiempo de desarrollo más lento',
            remediation: 'Optimizar configuración de build, usar cache, paralelizar'
          })
        }
      } catch (error) {
        issues.push({
          id: 'BUILD_FAILED',
          severity: 'high',
          title: 'Build falló',
          description: 'El build no se pudo completar',
          location: 'build system',
          impact: 'No se puede generar el proyecto',
          remediation: 'Revisar errores de compilación y dependencias'
        })
      }

    } catch (error) {
      this.logger.warn('Error verificando rendimiento del build')
    }

    return issues
  }

  /**
   * Verifica rendimiento del bundle
   */
  private async checkBundlePerformance(): Promise<PerformanceIssue[]> {
    const issues: PerformanceIssue[] = []

    try {
      this.logger.progress('Verificando rendimiento del bundle...')

      // Verificar tamaño de bundles
      const bundlePaths = [
        'client/dist',
        'backend/dist',
        'build'
      ]

      for (const path of bundlePaths) {
        if (await this.projectManager.fileExists(path)) {
          try {
            const { stdout } = await this.projectManager.runCommand(`du -sb ${path}`)
            const size = parseInt(stdout.split('\t')[0])
            const sizeInMB = size / (1024 * 1024)

            if (sizeInMB > 50) { // 50MB
              issues.push({
                id: `LARGE_BUNDLE_${path}`,
                severity: 'medium',
                title: 'Bundle muy grande',
                description: `Bundle en ${path}: ${sizeInMB.toFixed(2)}MB`,
                location: path,
                impact: 'Tiempo de carga más lento',
                remediation: 'Optimizar imports, usar code splitting, comprimir assets'
              })
            }
          } catch (error) {
            this.logger.warn(`No se pudo verificar tamaño de ${path}`)
          }
        }
      }

      // Verificar archivos individuales grandes
      try {
        const { stdout } = await this.projectManager.runCommand('find . -name "*.js" -o -name "*.css" -size +1M')
        const largeFiles = stdout.split('\n').filter(f => f.trim())
        
        for (const file of largeFiles) {
          if (file) {
            issues.push({
              id: `LARGE_FILE_${file}`,
              severity: 'low',
              title: 'Archivo muy grande',
              description: `Archivo grande encontrado: ${file}`,
              location: file,
              impact: 'Tiempo de carga más lento',
              remediation: 'Optimizar, comprimir o dividir el archivo'
            })
          }
        }
      } catch (error) {
        // No hay archivos grandes
      }

    } catch (error) {
      this.logger.warn('Error verificando rendimiento del bundle')
    }

    return issues
  }

  /**
   * Verifica rendimiento de memoria
   */
  private async checkMemoryPerformance(): Promise<PerformanceIssue[]> {
    const issues: PerformanceIssue[] = []

    try {
      this.logger.progress('Verificando rendimiento de memoria...')

      // Verificar uso de memoria del sistema
      try {
        const { stdout } = await this.projectManager.runCommand('free -m')
        const lines = stdout.split('\n')
        const memLine = lines[1].split(/\s+/)
        const totalMem = parseInt(memLine[1])
        const usedMem = parseInt(memLine[2])
        const memUsage = (usedMem / totalMem) * 100

        if (memUsage > 80) {
          issues.push({
            id: 'HIGH_MEMORY_USAGE',
            severity: 'medium',
            title: 'Alto uso de memoria',
            description: `Uso de memoria: ${memUsage.toFixed(1)}%`,
            location: 'system',
            impact: 'Rendimiento del sistema degradado',
            remediation: 'Cerrar aplicaciones innecesarias, optimizar procesos'
          })
        }
      } catch (error) {
        this.logger.warn('No se pudo verificar uso de memoria del sistema')
      }

      // Verificar node_modules
      if (await this.projectManager.fileExists('node_modules')) {
        try {
          const { stdout } = await this.projectManager.runCommand('du -sh node_modules')
          const size = stdout.split('\t')[0]
          const sizeInMB = this.parseSize(size)

          if (sizeInMB > 500) { // 500MB
            issues.push({
              id: 'LARGE_NODE_MODULES',
              severity: 'low',
              title: 'node_modules muy grande',
              description: `Tamaño de node_modules: ${size}`,
              location: 'node_modules',
              impact: 'Más espacio en disco, builds más lentos',
              remediation: 'Revisar dependencias, usar .npmrc para optimizar'
            })
          }
        } catch (error) {
          this.logger.warn('No se pudo verificar tamaño de node_modules')
        }
      }

    } catch (error) {
      this.logger.warn('Error verificando rendimiento de memoria')
    }

    return issues
  }

  /**
   * Verifica rendimiento de CPU
   */
  private async checkCpuPerformance(): Promise<PerformanceIssue[]> {
    const issues: PerformanceIssue[] = []

    try {
      this.logger.progress('Verificando rendimiento de CPU...')

      // Verificar uso de CPU del sistema
      try {
        const { stdout } = await this.projectManager.runCommand('top -bn1 | grep "Cpu(s)"')
        const cpuMatch = stdout.match(/(\d+\.\d+)%us/)
        
        if (cpuMatch) {
          const cpuUsage = parseFloat(cpuMatch[1])
          
          if (cpuUsage > 80) {
            issues.push({
              id: 'HIGH_CPU_USAGE',
              severity: 'medium',
              title: 'Alto uso de CPU',
              description: `Uso de CPU: ${cpuUsage}%`,
              location: 'system',
              impact: 'Rendimiento del sistema degradado',
              remediation: 'Cerrar procesos pesados, optimizar configuración'
            })
          }
        }
      } catch (error) {
        this.logger.warn('No se pudo verificar uso de CPU del sistema')
      }

    } catch (error) {
      this.logger.warn('Error verificando rendimiento de CPU')
    }

    return issues
  }

  /**
   * Verifica rendimiento de red
   */
  private async checkNetworkPerformance(): Promise<PerformanceIssue[]> {
    const issues: PerformanceIssue[] = []

    try {
      this.logger.progress('Verificando rendimiento de red...')

      // Verificar conectividad a redes blockchain
      if (await this.projectManager.fileExists('metaverso.config.json')) {
        const configContent = await this.projectManager.readFile('metaverso.config.json')
        const config = JSON.parse(configContent)

        if (config.networks) {
          for (const network of config.networks) {
            if (network.rpcUrl) {
              try {
                const startTime = Date.now()
                await this.projectManager.runCommand(`curl -s --connect-timeout 5 ${network.rpcUrl}`)
                const responseTime = Date.now() - startTime

                if (responseTime > 5000) { // 5 segundos
                  issues.push({
                    id: `SLOW_RPC_${network.name}`,
                    severity: 'medium',
                    title: 'RPC lento',
                    description: `RPC de ${network.name} responde en ${responseTime}ms`,
                    location: network.rpcUrl,
                    impact: 'Transacciones más lentas',
                    remediation: 'Usar RPC más rápido o configurar fallback'
                  })
                }
              } catch (error) {
                issues.push({
                  id: `RPC_UNREACHABLE_${network.name}`,
                  severity: 'high',
                  title: 'RPC no accesible',
                  description: `No se puede conectar a ${network.name}`,
                  location: network.rpcUrl,
                  impact: 'No se pueden realizar transacciones',
                  remediation: 'Verificar conectividad y configuración de red'
                })
              }
            }
          }
        }
      }

    } catch (error) {
      this.logger.warn('Error verificando rendimiento de red')
    }

    return issues
  }

  /**
   * Verifica rendimiento de base de datos
   */
  private async checkDatabasePerformance(): Promise<PerformanceIssue[]> {
    const issues: PerformanceIssue[] = []

    try {
      this.logger.progress('Verificando rendimiento de base de datos...')

      // Verificar configuración de base de datos
      if (await this.projectManager.fileExists('metaverso.config.json')) {
        const configContent = await this.projectManager.readFile('metaverso.config.json')
        const config = JSON.parse(configContent)

        if (config.backend?.database) {
          const db = config.backend.database

          // Verificar pool de conexiones
          if (db.pool) {
            if (db.pool.max && db.pool.max > 20) {
              issues.push({
                id: 'LARGE_CONNECTION_POOL',
                severity: 'low',
                title: 'Pool de conexiones muy grande',
                description: `Pool máximo: ${db.pool.max} conexiones`,
                location: 'database config',
                impact: 'Mayor uso de recursos',
                remediation: 'Reducir pool máximo a 10-20 conexiones'
              })
            }

            if (db.pool.min && db.pool.min > 5) {
              issues.push({
                id: 'LARGE_MIN_POOL',
                severity: 'low',
                title: 'Pool mínimo muy grande',
                description: `Pool mínimo: ${db.pool.min} conexiones`,
                location: 'database config',
                impact: 'Mayor uso de recursos',
                remediation: 'Reducir pool mínimo a 2-5 conexiones'
              })
            }
          }
        }
      }

    } catch (error) {
      this.logger.warn('Error verificando rendimiento de base de datos')
    }

    return issues
  }

  /**
   * Calcula métricas de rendimiento
   */
  private async calculateMetrics(): Promise<PerformanceMetrics> {
    const metrics: PerformanceMetrics = {
      buildTime: 0,
      bundleSize: 0,
      memoryUsage: 0,
      cpuUsage: 0,
      loadTime: 0,
      responseTime: 0,
      throughput: 0
    }

    try {
      // Calcular tamaño total del bundle
      const bundlePaths = ['client/dist', 'backend/dist', 'build']
      for (const path of bundlePaths) {
        if (await this.projectManager.fileExists(path)) {
          try {
            const { stdout } = await this.projectManager.runCommand(`du -sb ${path}`)
            const size = parseInt(stdout.split('\t')[0])
            metrics.bundleSize += size
          } catch (error) {
            // Ignorar errores
          }
        }
      }

      // Calcular uso de memoria
      try {
        const { stdout } = await this.projectManager.runCommand('free -m')
        const lines = stdout.split('\n')
        const memLine = lines[1].split(/\s+/)
        const totalMem = parseInt(memLine[1])
        const usedMem = parseInt(memLine[2])
        metrics.memoryUsage = (usedMem / totalMem) * 100
      } catch (error) {
        // Ignorar errores
      }

      // Calcular uso de CPU
      try {
        const { stdout } = await this.projectManager.runCommand('top -bn1 | grep "Cpu(s)"')
        const cpuMatch = stdout.match(/(\d+\.\d+)%us/)
        if (cpuMatch) {
          metrics.cpuUsage = parseFloat(cpuMatch[1])
        }
      } catch (error) {
        // Ignorar errores
      }

    } catch (error) {
      this.logger.warn('Error calculando métricas')
    }

    return metrics
  }

  /**
   * Calcula el score de rendimiento
   */
  private calculatePerformanceScore(issues: PerformanceIssue[], metrics: PerformanceMetrics): number {
    let score = 100

    // Penalizar por problemas
    for (const issue of issues) {
      switch (issue.severity) {
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

    // Penalizar por métricas pobres
    if (metrics.bundleSize > 100 * 1024 * 1024) { // 100MB
      score -= 10
    }

    if (metrics.memoryUsage > 80) {
      score -= 5
    }

    if (metrics.cpuUsage > 80) {
      score -= 5
    }

    return Math.max(0, score)
  }

  /**
   * Genera recomendaciones de rendimiento
   */
  private generateRecommendations(result: PerformanceValidationResult): string[] {
    const recommendations: string[] = []

    // Recomendaciones basadas en problemas críticos
    const criticalIssues = result.issues.filter(i => i.severity === 'critical')
    if (criticalIssues.length > 0) {
      recommendations.push('Prioriza la corrección de problemas críticos de rendimiento')
    }

    // Recomendaciones basadas en score
    if (result.score < 70) {
      recommendations.push('Implementa optimizaciones de rendimiento')
    }

    // Recomendaciones específicas
    if (result.issues.some(i => i.title.includes('Build lento'))) {
      recommendations.push('Optimiza la configuración de build y usa cache')
    }

    if (result.issues.some(i => i.title.includes('Bundle muy grande'))) {
      recommendations.push('Implementa code splitting y optimiza imports')
    }

    if (result.issues.some(i => i.title.includes('Alto uso de memoria'))) {
      recommendations.push('Optimiza el uso de memoria y cierra procesos innecesarios')
    }

    if (result.issues.some(i => i.title.includes('RPC lento'))) {
      recommendations.push('Usa RPCs más rápidos o configura múltiples endpoints')
    }

    return recommendations
  }

  /**
   * Parsea tamaño en formato humano a bytes
   */
  private parseSize(sizeStr: string): number {
    const match = sizeStr.match(/^(\d+(?:\.\d+)?)([KMGT]?)$/)
    if (!match) return 0

    const value = parseFloat(match[1])
    const unit = match[2]

    switch (unit) {
      case 'K':
        return value * 1024
      case 'M':
        return value * 1024 * 1024
      case 'G':
        return value * 1024 * 1024 * 1024
      case 'T':
        return value * 1024 * 1024 * 1024 * 1024
      default:
        return value
    }
  }
} 
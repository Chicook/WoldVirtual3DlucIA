import { existsSync, mkdir, writeFile, readFile, access } from 'fs/promises'
import { join, resolve } from 'path'
import { exec } from 'child_process'
import { promisify } from 'util'
import { Logger } from './Logger'

const execAsync = promisify(exec)

export interface ProjectInfo {
  name: string
  version: string
  description: string
  type: 'metaverso' | 'contract' | 'backend' | 'frontend' | 'asset'
  path: string
  dependencies: string[]
  scripts: Record<string, string>
}

export interface ProjectStructure {
  directories: string[]
  files: string[]
  configs: Record<string, any>
}

export class ProjectManager {
  private logger: Logger
  private projectRoot: string

  constructor() {
    this.logger = new Logger('ProjectManager')
    this.projectRoot = process.cwd()
  }

  /**
   * Verifica si existe un proyecto en el directorio actual
   */
  async isProjectExists(): Promise<boolean> {
    try {
      const packageJsonPath = join(this.projectRoot, 'package.json')
      const metaversoConfigPath = join(this.projectRoot, 'metaverso.config.json')
      
      return existsSync(packageJsonPath) || existsSync(metaversoConfigPath)
    } catch (error) {
      this.logger.error('Error verificando proyecto:', error as Error)
      return false
    }
  }

  /**
   * Obtiene información del proyecto actual
   */
  async getProjectInfo(): Promise<ProjectInfo | null> {
    try {
      const packageJsonPath = join(this.projectRoot, 'package.json')
      
      if (!existsSync(packageJsonPath)) {
        return null
      }

      const packageJsonContent = await readFile(packageJsonPath, 'utf-8')
      const packageJson = JSON.parse(packageJsonContent)

      return {
        name: packageJson.name || 'unknown',
        version: packageJson.version || '1.0.0',
        description: packageJson.description || '',
        type: this.detectProjectType(packageJson),
        path: this.projectRoot,
        dependencies: [
          ...Object.keys(packageJson.dependencies || {}),
          ...Object.keys(packageJson.devDependencies || {})
        ],
        scripts: packageJson.scripts || {}
      }
    } catch (error) {
      this.logger.error('Error obteniendo información del proyecto:', error as Error)
      return null
    }
  }

  /**
   * Detecta el tipo de proyecto basado en package.json
   */
  private detectProjectType(packageJson: any): ProjectInfo['type'] {
    const name = packageJson.name || ''
    const dependencies = Object.keys(packageJson.dependencies || {})
    const devDependencies = Object.keys(packageJson.devDependencies || {})

    if (name.includes('metaverso') || dependencies.includes('@metaverso')) {
      return 'metaverso'
    }
    
    if (dependencies.includes('hardhat') || dependencies.includes('foundry')) {
      return 'contract'
    }
    
    if (dependencies.includes('express') || dependencies.includes('fastify')) {
      return 'backend'
    }
    
    if (dependencies.includes('react') || dependencies.includes('vue')) {
      return 'frontend'
    }
    
    return 'asset'
  }

  /**
   * Crea un directorio
   */
  async createDirectory(path: string): Promise<void> {
    try {
      const fullPath = join(this.projectRoot, path)
      
      if (!existsSync(fullPath)) {
        await mkdir(fullPath, { recursive: true })
        this.logger.debug(`Directorio creado: ${path}`)
      }
    } catch (error) {
      this.logger.error(`Error creando directorio ${path}:`, error as Error)
      throw error
    }
  }

  /**
   * Escribe un archivo
   */
  async writeFile(path: string, content: string): Promise<void> {
    try {
      const fullPath = join(this.projectRoot, path)
      const dir = fullPath.substring(0, fullPath.lastIndexOf('/'))
      
      if (!existsSync(dir)) {
        await mkdir(dir, { recursive: true })
      }
      
      await writeFile(fullPath, content, 'utf-8')
      this.logger.debug(`Archivo creado: ${path}`)
    } catch (error) {
      this.logger.error(`Error escribiendo archivo ${path}:`, error as Error)
      throw error
    }
  }

  /**
   * Lee un archivo
   */
  async readFile(path: string): Promise<string> {
    try {
      const fullPath = join(this.projectRoot, path)
      return await readFile(fullPath, 'utf-8')
    } catch (error) {
      this.logger.error(`Error leyendo archivo ${path}:`, error as Error)
      throw error
    }
  }

  /**
   * Verifica si un archivo existe
   */
  async fileExists(path: string): Promise<boolean> {
    try {
      const fullPath = join(this.projectRoot, path)
      await access(fullPath)
      return true
    } catch {
      return false
    }
  }

  /**
   * Ejecuta un comando en el directorio del proyecto
   */
  async runCommand(command: string, options?: any): Promise<{ stdout: string; stderr: string }> {
    try {
      this.logger.debug(`Ejecutando comando: ${command}`)
      
      const { stdout, stderr } = await execAsync(command, {
        cwd: this.projectRoot,
        ...options
      })
      
      if (stderr) {
        this.logger.warn(`Comando generó stderr: ${stderr}`)
      }
      
      return { stdout, stderr }
    } catch (error) {
      this.logger.error(`Error ejecutando comando ${command}:`, error as Error)
      throw error
    }
  }

  /**
   * Instala dependencias
   */
  async installDependencies(packages: string[], options: { dev?: boolean; global?: boolean } = {}): Promise<void> {
    try {
      const { dev = false, global = false } = options
      let command = 'npm install'
      
      if (global) {
        command = 'npm install -g'
      } else if (dev) {
        command = 'npm install --save-dev'
      } else {
        command = 'npm install --save'
      }
      
      if (packages.length > 0) {
        command += ` ${packages.join(' ')}`
      }
      
      await this.runCommand(command)
      this.logger.success('Dependencias instaladas exitosamente')
    } catch (error) {
      this.logger.error('Error instalando dependencias:', error as Error)
      throw error
    }
  }

  /**
   * Ejecuta un script del package.json
   */
  async runScript(scriptName: string, args: string[] = []): Promise<void> {
    try {
      const projectInfo = await this.getProjectInfo()
      
      if (!projectInfo || !projectInfo.scripts[scriptName]) {
        throw new Error(`Script '${scriptName}' no encontrado`)
      }
      
      const command = `npm run ${scriptName} ${args.join(' ')}`
      await this.runCommand(command)
    } catch (error) {
      this.logger.error(`Error ejecutando script ${scriptName}:`, error as Error)
      throw error
    }
  }

  /**
   * Obtiene la estructura del proyecto
   */
  async getProjectStructure(): Promise<ProjectStructure> {
    try {
      const structure: ProjectStructure = {
        directories: [],
        files: [],
        configs: {}
      }

      // Obtener package.json
      const packageJsonPath = join(this.projectRoot, 'package.json')
      if (existsSync(packageJsonPath)) {
        const packageJsonContent = await readFile(packageJsonPath, 'utf-8')
        structure.configs.package = JSON.parse(packageJsonContent)
      }

      // Obtener metaverso.config.json
      const metaversoConfigPath = join(this.projectRoot, 'metaverso.config.json')
      if (existsSync(metaversoConfigPath)) {
        const metaversoConfigContent = await readFile(metaversoConfigPath, 'utf-8')
        structure.configs.metaverso = JSON.parse(metaversoConfigContent)
      }

      // Obtener tsconfig.json
      const tsconfigPath = join(this.projectRoot, 'tsconfig.json')
      if (existsSync(tsconfigPath)) {
        const tsconfigContent = await readFile(tsconfigPath, 'utf-8')
        structure.configs.typescript = JSON.parse(tsconfigContent)
      }

      // Obtener .env
      const envPath = join(this.projectRoot, '.env')
      if (existsSync(envPath)) {
        structure.files.push('.env')
      }

      // Obtener .gitignore
      const gitignorePath = join(this.projectRoot, '.gitignore')
      if (existsSync(gitignorePath)) {
        structure.files.push('.gitignore')
      }

      // Directorios principales
      const mainDirs = ['contracts', 'backend', 'client', 'assets', 'build', 'config', 'docs', 'tests', 'logs']
      for (const dir of mainDirs) {
        const dirPath = join(this.projectRoot, dir)
        if (existsSync(dirPath)) {
          structure.directories.push(dir)
        }
      }

      return structure
    } catch (error) {
      this.logger.error('Error obteniendo estructura del proyecto:', error as Error)
      throw error
    }
  }

  /**
   * Verifica la integridad del proyecto
   */
  async verifyProject(): Promise<{ valid: boolean; issues: string[] }> {
    try {
      const issues: string[] = []
      const projectInfo = await this.getProjectInfo()
      const structure = await this.getProjectStructure()

      // Verificar package.json
      if (!projectInfo) {
        issues.push('No se encontró package.json')
      }

      // Verificar metaverso.config.json
      if (!structure.configs.metaverso) {
        issues.push('No se encontró metaverso.config.json')
      }

      // Verificar directorios principales
      const requiredDirs = ['contracts', 'backend', 'client', 'assets']
      for (const dir of requiredDirs) {
        if (!structure.directories.includes(dir)) {
          issues.push(`Directorio requerido no encontrado: ${dir}`)
        }
      }

      // Verificar dependencias
      if (projectInfo) {
        const requiredDeps = ['typescript', 'node']
        for (const dep of requiredDeps) {
          if (!projectInfo.dependencies.includes(dep)) {
            issues.push(`Dependencia requerida no encontrada: ${dep}`)
          }
        }
      }

      return {
        valid: issues.length === 0,
        issues
      }
    } catch (error) {
      this.logger.error('Error verificando proyecto:', error as Error)
      return {
        valid: false,
        issues: ['Error durante la verificación del proyecto']
      }
    }
  }

  /**
   * Limpia el proyecto
   */
  async cleanProject(): Promise<void> {
    try {
      this.logger.info('Limpiando proyecto...')
      
      const commands = [
        'npm run clean',
        'rm -rf node_modules',
        'rm -rf dist',
        'rm -rf build',
        'rm -rf .cache',
        'rm -rf coverage'
      ]

      for (const command of commands) {
        try {
          await this.runCommand(command)
        } catch (error) {
          this.logger.warn(`Comando falló (ignorado): ${command}`)
        }
      }

      this.logger.success('Proyecto limpiado exitosamente')
    } catch (error) {
      this.logger.error('Error limpiando proyecto:', error as Error)
      throw error
    }
  }

  /**
   * Actualiza el proyecto
   */
  async updateProject(): Promise<void> {
    try {
      this.logger.info('Actualizando proyecto...')
      
      // Actualizar dependencias
      await this.runCommand('npm update')
      
      // Verificar actualizaciones de seguridad
      await this.runCommand('npm audit')
      
      // Limpiar cache
      await this.runCommand('npm cache clean --force')
      
      this.logger.success('Proyecto actualizado exitosamente')
    } catch (error) {
      this.logger.error('Error actualizando proyecto:', error as Error)
      throw error
    }
  }

  /**
   * Crea un backup del proyecto
   */
  async createBackup(backupPath?: string): Promise<string> {
    try {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
      const defaultBackupPath = join(this.projectRoot, '..', `backup-${timestamp}`)
      const targetPath = backupPath || defaultBackupPath

      this.logger.info(`Creando backup en: ${targetPath}`)

      // Crear directorio de backup
      await mkdir(targetPath, { recursive: true })

      // Copiar archivos importantes
      const importantFiles = [
        'package.json',
        'metaverso.config.json',
        'tsconfig.json',
        '.env.example',
        'README.md'
      ]

      for (const file of importantFiles) {
        const sourcePath = join(this.projectRoot, file)
        const destPath = join(targetPath, file)
        
        if (existsSync(sourcePath)) {
          const content = await readFile(sourcePath, 'utf-8')
          await writeFile(destPath, content, 'utf-8')
        }
      }

      // Copiar directorios importantes
      const importantDirs = ['contracts', 'backend', 'client', 'assets', 'config', 'docs']
      
      for (const dir of importantDirs) {
        const sourceDir = join(this.projectRoot, dir)
        const destDir = join(targetPath, dir)
        
        if (existsSync(sourceDir)) {
          await this.copyDirectory(sourceDir, destDir)
        }
      }

      this.logger.success(`Backup creado exitosamente en: ${targetPath}`)
      return targetPath
    } catch (error) {
      this.logger.error('Error creando backup:', error as Error)
      throw error
    }
  }

  /**
   * Copia un directorio recursivamente
   */
  private async copyDirectory(source: string, destination: string): Promise<void> {
    // Esta es una implementación simplificada
    // En producción, usarías una librería como fs-extra
    await this.runCommand(`cp -r "${source}" "${destination}"`)
  }

  /**
   * Obtiene estadísticas del proyecto
   */
  async getProjectStats(): Promise<any> {
    try {
      const projectInfo = await this.getProjectInfo()
      const structure = await this.getProjectStructure()
      const verification = await this.verifyProject()

      return {
        info: projectInfo,
        structure: {
          directories: structure.directories.length,
          files: structure.files.length,
          configs: Object.keys(structure.configs).length
        },
        verification,
        size: await this.getProjectSize(),
        lastModified: await this.getLastModified()
      }
    } catch (error) {
      this.logger.error('Error obteniendo estadísticas del proyecto:', error as Error)
      throw error
    }
  }

  /**
   * Obtiene el tamaño del proyecto
   */
  private async getProjectSize(): Promise<number> {
    try {
      const { stdout } = await this.runCommand('du -sb .')
      return parseInt(stdout.split('\t')[0])
    } catch {
      return 0
    }
  }

  /**
   * Obtiene la fecha de última modificación
   */
  private async getLastModified(): Promise<Date> {
    try {
      const { stdout } = await this.runCommand('find . -type f -exec stat -c %Y {} + | sort -n | tail -1')
      const timestamp = parseInt(stdout.trim()) * 1000
      return new Date(timestamp)
    } catch {
      return new Date()
    }
  }
} 
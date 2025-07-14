import { Command } from 'commander'
import chalk from 'chalk'
import inquirer from 'inquirer'
import { Logger } from '../utils/Logger'
import { ConfigManager } from '../utils/ConfigManager'
import { ProjectManager } from '../utils/ProjectManager'
import { TemplateManager } from '../utils/TemplateManager'

export class InitCommand {
  private logger: Logger
  private configManager: ConfigManager
  private projectManager: ProjectManager
  private templateManager: TemplateManager

  constructor() {
    this.logger = new Logger('InitCommand')
    this.configManager = new ConfigManager()
    this.projectManager = new ProjectManager()
    this.templateManager = new TemplateManager()
  }

  /**
   * Registra el comando
   */
  register(program: Command): void {
    program
      .command('init')
      .description('Inicializar un nuevo proyecto de metaverso')
      .option('-t, --template <template>', 'Template a usar')
      .option('-y, --yes', 'Confirmar todas las opciones por defecto')
      .option('-o, --output <directory>', 'Directorio de salida')
      .action(async (options) => {
        await this.execute(options)
      })
  }

  /**
   * Ejecuta el comando
   */
  async execute(options: any): Promise<void> {
    try {
      this.logger.info('Iniciando inicialización del proyecto...')
      
      // Mostrar banner
      this.showBanner()
      
      // Verificar si ya existe un proyecto
      if (await this.projectManager.isProjectExists()) {
        const { overwrite } = await inquirer.prompt([
          {
            type: 'confirm',
            name: 'overwrite',
            message: 'Ya existe un proyecto en este directorio. ¿Deseas sobrescribirlo?',
            default: false
          }
        ])

        if (!overwrite) {
          this.logger.info('Inicialización cancelada')
          return
        }
      }

      // Obtener configuración del usuario
      const config = await this.getUserConfiguration(options)
      
      // Crear estructura del proyecto
      await this.createProjectStructure(config)
      
      // Generar archivos de configuración
      await this.generateConfigurationFiles(config)
      
      // Instalar dependencias
      await this.installDependencies(config)
      
      // Configurar herramientas de desarrollo
      await this.setupDevelopmentTools(config)
      
      // Mostrar resumen
      this.showSummary(config)
      
      this.logger.success('Proyecto inicializado exitosamente!')
      
    } catch (error) {
      this.logger.error('Error durante la inicialización:', error as Error)
      throw error
    }
  }

  /**
   * Muestra el banner de inicialización
   */
  private showBanner(): void {
    console.log(chalk.blue.bold('\n🌐 Metaverso Web3 - Inicialización'))
    console.log(chalk.gray('Configurando tu nuevo proyecto de metaverso descentralizado...\n'))
  }

  /**
   * Obtiene la configuración del usuario
   */
  private async getUserConfiguration(options: any): Promise<any> {
    const config: any = {}

    // Nombre del proyecto
    if (!options.yes) {
      const { projectName } = await inquirer.prompt([
        {
          type: 'input',
          name: 'projectName',
          message: 'Nombre del proyecto:',
          default: 'metaverso-web3',
          validate: (input: string) => {
            if (!input.trim()) {
              return 'El nombre del proyecto es requerido'
            }
            if (!/^[a-z0-9-]+$/.test(input)) {
              return 'El nombre debe contener solo letras minúsculas, números y guiones'
            }
            return true
          }
        }
      ])
      config.projectName = projectName
    } else {
      config.projectName = 'metaverso-web3'
    }

    // Descripción del proyecto
    if (!options.yes) {
      const { description } = await inquirer.prompt([
        {
          type: 'input',
          name: 'description',
          message: 'Descripción del proyecto:',
          default: 'Metaverso descentralizado construido con Web3'
        }
      ])
      config.description = description
    } else {
      config.description = 'Metaverso descentralizado construido con Web3'
    }

    // Template
    if (!options.template && !options.yes) {
      const { template } = await inquirer.prompt([
        {
          type: 'list',
          name: 'template',
          message: 'Selecciona un template:',
          choices: [
            { name: 'Básico - Estructura mínima', value: 'basic' },
            { name: 'Completo - Con todos los módulos', value: 'full' },
            { name: 'Gaming - Enfocado en juegos', value: 'gaming' },
            { name: 'Social - Enfocado en interacción social', value: 'social' },
            { name: 'DeFi - Enfocado en finanzas descentralizadas', value: 'defi' },
            { name: 'Personalizado - Configuración manual', value: 'custom' }
          ],
          default: 'full'
        }
      ])
      config.template = template
    } else {
      config.template = options.template || 'full'
    }

    // Redes blockchain
    if (!options.yes) {
      const { networks } = await inquirer.prompt([
        {
          type: 'checkbox',
          name: 'networks',
          message: 'Selecciona las redes blockchain a soportar:',
          choices: [
            { name: 'Ethereum Mainnet', value: 'ethereum', checked: false },
            { name: 'Polygon', value: 'polygon', checked: true },
            { name: 'Arbitrum', value: 'arbitrum', checked: false },
            { name: 'Optimism', value: 'optimism', checked: false },
            { name: 'BSC', value: 'bsc', checked: false },
            { name: 'Avalanche', value: 'avalanche', checked: false }
          ]
        }
      ])
      config.networks = networks
    } else {
      config.networks = ['polygon']
    }

    // Base de datos
    if (!options.yes) {
      const { database } = await inquirer.prompt([
        {
          type: 'list',
          name: 'database',
          message: 'Selecciona la base de datos:',
          choices: [
            { name: 'PostgreSQL', value: 'postgresql' },
            { name: 'MySQL', value: 'mysql' },
            { name: 'SQLite', value: 'sqlite' },
            { name: 'MongoDB', value: 'mongodb' }
          ],
          default: 'postgresql'
        }
      ])
      config.database = database
    } else {
      config.database = 'postgresql'
    }

    // Características del metaverso
    if (!options.yes) {
      const { features } = await inquirer.prompt([
        {
          type: 'checkbox',
          name: 'features',
          message: 'Selecciona las características del metaverso:',
          choices: [
            { name: 'Avatares personalizables', value: 'avatars', checked: true },
            { name: 'Chat en tiempo real', value: 'chat', checked: true },
            { name: 'Sistema de trading', value: 'trading', checked: true },
            { name: 'Gestos y animaciones', value: 'gestures', checked: true },
            { name: 'Sistema de reputación', value: 'reputation', checked: false },
            { name: 'Misiones y quests', value: 'quests', checked: false },
            { name: 'Sistema de tierras', value: 'lands', checked: false },
            { name: 'Marketplace NFT', value: 'marketplace', checked: true },
            { name: 'Sistema de gobernanza', value: 'governance', checked: false },
            { name: 'Integración DeFi', value: 'defi', checked: false }
          ]
        }
      ])
      config.features = features
    } else {
      config.features = ['avatars', 'chat', 'trading', 'gestures', 'marketplace']
    }

    // Herramientas de desarrollo
    if (!options.yes) {
      const { devTools } = await inquirer.prompt([
        {
          type: 'checkbox',
          name: 'devTools',
          message: 'Selecciona las herramientas de desarrollo:',
          choices: [
            { name: 'ESLint', value: 'eslint', checked: true },
            { name: 'Prettier', value: 'prettier', checked: true },
            { name: 'Husky', value: 'husky', checked: true },
            { name: 'Jest', value: 'jest', checked: true },
            { name: 'Storybook', value: 'storybook', checked: false },
            { name: 'Cypress', value: 'cypress', checked: false },
            { name: 'Docker', value: 'docker', checked: true },
            { name: 'GitHub Actions', value: 'github-actions', checked: true }
          ]
        }
      ])
      config.devTools = devTools
    } else {
      config.devTools = ['eslint', 'prettier', 'husky', 'jest', 'docker', 'github-actions']
    }

    return config
  }

  /**
   * Crea la estructura del proyecto
   */
  private async createProjectStructure(config: any): Promise<void> {
    this.logger.progress('Creando estructura del proyecto...')

    const structure = [
      'contracts/',
      'contracts/core/',
      'contracts/nfts/',
      'contracts/defi/',
      'contracts/governance/',
      'backend/',
      'backend/src/',
      'backend/src/apis/',
      'backend/src/models/',
      'backend/src/services/',
      'backend/src/middleware/',
      'backend/src/utils/',
      'client/',
      'client/src/',
      'client/src/components/',
      'client/src/hooks/',
      'client/src/contexts/',
      'client/src/stores/',
      'client/src/utils/',
      'assets/',
      'assets/images/',
      'assets/models/',
      'assets/audio/',
      'assets/textures/',
      'build/',
      'config/',
      'docs/',
      'scripts/',
      'tests/',
      'tests/unit/',
      'tests/integration/',
      'tests/e2e/',
      'logs/',
      '.github/',
      '.github/workflows/'
    ]

    for (const dir of structure) {
      await this.projectManager.createDirectory(dir)
    }

    this.logger.success('Estructura del proyecto creada')
  }

  /**
   * Genera archivos de configuración
   */
  private async generateConfigurationFiles(config: any): Promise<void> {
    this.logger.progress('Generando archivos de configuración...')

    // Generar metaverso.config.json
    const metaversoConfig = this.generateMetaversoConfig(config)
    await this.projectManager.writeFile('metaverso.config.json', JSON.stringify(metaversoConfig, null, 2))

    // Generar package.json principal
    const packageJson = this.generatePackageJson(config)
    await this.projectManager.writeFile('package.json', JSON.stringify(packageJson, null, 2))

    // Generar README.md
    const readme = this.generateReadme(config)
    await this.projectManager.writeFile('README.md', readme)

    // Generar .gitignore
    const gitignore = this.generateGitignore()
    await this.projectManager.writeFile('.gitignore', gitignore)

    // Generar .env.example
    const envExample = this.generateEnvExample(config)
    await this.projectManager.writeFile('.env.example', envExample)

    // Generar Dockerfile
    if (config.devTools.includes('docker')) {
      const dockerfile = this.generateDockerfile(config)
      await this.projectManager.writeFile('Dockerfile', dockerfile)
    }

    // Generar docker-compose.yml
    if (config.devTools.includes('docker')) {
      const dockerCompose = this.generateDockerCompose(config)
      await this.projectManager.writeFile('docker-compose.yml', dockerCompose)
    }

    this.logger.success('Archivos de configuración generados')
  }

  /**
   * Instala dependencias
   */
  private async installDependencies(config: any): Promise<void> {
    this.logger.progress('Instalando dependencias...')

    // Instalar dependencias principales
    await this.projectManager.runCommand('npm install')

    // Instalar dependencias de desarrollo
    if (config.devTools.includes('eslint')) {
      await this.projectManager.runCommand('npm install --save-dev eslint @typescript-eslint/eslint-plugin @typescript-eslint/parser')
    }

    if (config.devTools.includes('prettier')) {
      await this.projectManager.runCommand('npm install --save-dev prettier')
    }

    if (config.devTools.includes('jest')) {
      await this.projectManager.runCommand('npm install --save-dev jest @types/jest ts-jest')
    }

    this.logger.success('Dependencias instaladas')
  }

  /**
   * Configura herramientas de desarrollo
   */
  private async setupDevelopmentTools(config: any): Promise<void> {
    this.logger.progress('Configurando herramientas de desarrollo...')

    // Configurar ESLint
    if (config.devTools.includes('eslint')) {
      const eslintConfig = this.generateEslintConfig()
      await this.projectManager.writeFile('.eslintrc.js', eslintConfig)
    }

    // Configurar Prettier
    if (config.devTools.includes('prettier')) {
      const prettierConfig = this.generatePrettierConfig()
      await this.projectManager.writeFile('.prettierrc', prettierConfig)
    }

    // Configurar Jest
    if (config.devTools.includes('jest')) {
      const jestConfig = this.generateJestConfig()
      await this.projectManager.writeFile('jest.config.js', jestConfig)
    }

    // Configurar Husky
    if (config.devTools.includes('husky')) {
      await this.projectManager.runCommand('npx husky install')
      await this.projectManager.runCommand('npx husky add .husky/pre-commit "npm run lint"')
    }

    this.logger.success('Herramientas de desarrollo configuradas')
  }

  /**
   * Genera configuración de metaverso
   */
  private generateMetaversoConfig(config: any): any {
    return {
      version: '1.0.0',
      environment: 'development',
      project: {
        name: config.projectName,
        description: config.description
      },
      networks: this.generateNetworksConfig(config.networks),
      contracts: {
        compiler: {
          version: '0.8.19',
          optimizer: {
            enabled: true,
            runs: 200
          },
          viaIR: true
        },
        gas: {
          reports: true
        },
        verification: {
          enabled: false
        }
      },
      backend: {
        server: {
          port: 3000,
          host: 'localhost',
          cors: true
        },
        database: {
          type: config.database,
          url: this.getDatabaseUrl(config.database)
        },
        auth: {
          jwt: {
            secret: 'your-super-secret-jwt-key',
            expiresIn: '24h'
          }
        }
      },
      frontend: {
        build: {
          target: 'es2020',
          format: 'es',
          minify: true
        },
        dev: {
          port: 5173,
          host: 'localhost'
        }
      },
      metaverse: {
        features: config.features,
        world: {
          name: config.projectName,
          description: config.description,
          maxPlayers: 100
        }
      }
    }
  }

  /**
   * Genera configuración de redes
   */
  private generateNetworksConfig(networks: string[]): any[] {
    const networkConfigs: any = {
      ethereum: {
        name: 'Ethereum Mainnet',
        chainId: 1,
        rpcUrl: 'https://mainnet.infura.io/v3/YOUR_PROJECT_ID',
        explorerUrl: 'https://etherscan.io',
        nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 }
      },
      polygon: {
        name: 'Polygon',
        chainId: 137,
        rpcUrl: 'https://polygon-rpc.com',
        explorerUrl: 'https://polygonscan.com',
        nativeCurrency: { name: 'MATIC', symbol: 'MATIC', decimals: 18 }
      },
      arbitrum: {
        name: 'Arbitrum',
        chainId: 42161,
        rpcUrl: 'https://arb1.arbitrum.io/rpc',
        explorerUrl: 'https://arbiscan.io',
        nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 }
      }
    }

    return networks.map(network => ({
      ...networkConfigs[network],
      enabled: true
    }))
  }

  /**
   * Obtiene URL de base de datos
   */
  private getDatabaseUrl(type: string): string {
    const urls: Record<string, string> = {
      postgresql: 'postgresql://localhost:5432/metaverso',
      mysql: 'mysql://localhost:3306/metaverso',
      sqlite: './data/metaverso.db',
      mongodb: 'mongodb://localhost:27017/metaverso'
    }
    return urls[type] || urls.postgresql
  }

  /**
   * Genera package.json
   */
  private generatePackageJson(config: any): any {
    return {
      name: config.projectName,
      version: '1.0.0',
      description: config.description,
      private: true,
      workspaces: [
        'contracts',
        'backend',
        'client',
        'assets'
      ],
      scripts: {
        'dev': 'npm run dev:all',
        'dev:all': 'concurrently \"npm run dev:backend\" \"npm run dev:frontend\"',
        'dev:backend': 'cd backend && npm run dev',
        'dev:frontend': 'cd client && npm run dev',
        'build': 'npm run build:all',
        'build:all': 'npm run build:contracts && npm run build:backend && npm run build:frontend',
        'build:contracts': 'cd contracts && npm run build',
        'build:backend': 'cd backend && npm run build',
        'build:frontend': 'cd client && npm run build',
        'test': 'npm run test:all',
        'test:all': 'npm run test:contracts && npm run test:backend && npm run test:frontend',
        'test:contracts': 'cd contracts && npm run test',
        'test:backend': 'cd backend && npm run test',
        'test:frontend': 'cd client && npm run test',
        'lint': 'npm run lint:all',
        'lint:all': 'npm run lint:contracts && npm run lint:backend && npm run lint:frontend',
        'lint:fix': 'npm run lint:fix:all',
        'lint:fix:all': 'npm run lint:fix:contracts && npm run lint:fix:backend && npm run lint:fix:frontend',
        'deploy': 'npm run deploy:all',
        'deploy:all': 'npm run deploy:contracts && npm run deploy:backend && npm run deploy:frontend',
        'clean': 'npm run clean:all',
        'clean:all': 'npm run clean:contracts && npm run clean:backend && npm run clean:frontend'
      },
      devDependencies: {
        'concurrently': '^8.0.0',
        'typescript': '^5.0.0',
        '@types/node': '^20.0.0'
      },
      engines: {
        node: '>=18.0.0',
        npm: '>=9.0.0'
      }
    }
  }

  /**
   * Genera README.md
   */
  private generateReadme(config: any): string {
    return `# ${config.projectName}

${config.description}

## 🚀 Características

${config.features.map((feature: string) => `- ${feature}`).join('\n')}

## 📋 Requisitos

- Node.js >= 18.0.0
- npm >= 9.0.0
- Git

## 🛠️ Instalación

\`\`\`bash
# Clonar el repositorio
git clone <repository-url>
cd ${config.projectName}

# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env
# Editar .env con tus configuraciones

# Iniciar desarrollo
npm run dev
\`\`\`

## 📚 Documentación

Ver la [documentación completa](docs/README.md) para más información.

## 🤝 Contribución

1. Fork el proyecto
2. Crea una rama para tu feature (\`git checkout -b feature/AmazingFeature\`)
3. Commit tus cambios (\`git commit -m 'Add some AmazingFeature'\`)
4. Push a la rama (\`git push origin feature/AmazingFeature\`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo [LICENSE](LICENSE) para detalles.
`
  }

  /**
   * Genera .gitignore
   */
  private generateGitignore(): string {
    return `# Dependencies
node_modules/
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Build outputs
dist/
build/
out/

# Environment variables
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# Logs
logs/
*.log

# Runtime data
pids/
*.pid
*.seed
*.pid.lock

# Coverage directory used by tools like istanbul
coverage/
*.lcov

# nyc test coverage
.nyc_output

# Dependency directories
jspm_packages/

# Optional npm cache directory
.npm

# Optional eslint cache
.eslintcache

# Microbundle cache
.rpt2_cache/
.rts2_cache_cjs/
.rts2_cache_es/
.rts2_cache_umd/

# Optional REPL history
.node_repl_history

# Output of 'npm pack'
*.tgz

# Yarn Integrity file
.yarn-integrity

# parcel-bundler cache (https://parceljs.org/)
.cache
.parcel-cache

# Next.js build output
.next

# Nuxt.js build / generate output
.nuxt
dist

# Gatsby files
.cache/
public

# Storybook build outputs
.out
.storybook-out

# Temporary folders
tmp/
temp/

# Editor directories and files
.vscode/
.idea/
*.swp
*.swo
*~

# OS generated files
.DS_Store
.DS_Store?
._*
.Spotlight-V100
.Trashes
ehthumbs.db
Thumbs.db

# Database
*.db
*.sqlite
*.sqlite3

# Keys and certificates
*.key
*.pem
*.crt
*.p12

# Foundry
cache/
out/
broadcast/
`
  }

  /**
   * Genera .env.example
   */
  private generateEnvExample(config: any): string {
    return `# Environment Configuration
NODE_ENV=development

# Database
DATABASE_URL=${this.getDatabaseUrl(config.database)}

# JWT
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=24h

# Blockchain Networks
ETHEREUM_RPC_URL=https://mainnet.infura.io/v3/YOUR_PROJECT_ID
POLYGON_RPC_URL=https://polygon-rpc.com
ARBITRUM_RPC_URL=https://arb1.arbitrum.io/rpc

# API Keys
ETHERSCAN_API_KEY=your-etherscan-api-key
POLYGONSCAN_API_KEY=your-polygonscan-api-key
ARBISCAN_API_KEY=your-arbiscan-api-key

# Storage
STORAGE_PROVIDER=local
STORAGE_PATH=./uploads

# Email
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# Monitoring
SENTRY_DSN=your-sentry-dsn
LOG_LEVEL=info

# Development
DEBUG=true
PORT=3000
CLIENT_PORT=5173
`
  }

  /**
   * Genera Dockerfile
   */
  private generateDockerfile(config: any): string {
    return `# Dockerfile for Metaverso Web3
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./
COPY contracts/package*.json ./contracts/
COPY backend/package*.json ./backend/
COPY client/package*.json ./client/

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Expose ports
EXPOSE 3000 5173

# Start the application
CMD ["npm", "start"]
`
  }

  /**
   * Genera docker-compose.yml
   */
  private generateDockerCompose(config: any): string {
    return `version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
      - "5173:5173"
    environment:
      - NODE_ENV=development
      - DATABASE_URL=postgresql://postgres:password@db:5432/metaverso
    depends_on:
      - db
    volumes:
      - .:/app
      - /app/node_modules

  db:
    image: postgres:15-alpine
    environment:
      - POSTGRES_DB=metaverso
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=password
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"

volumes:
  postgres_data:
`
  }

  /**
   * Genera configuración de ESLint
   */
  private generateEslintConfig(): string {
    return `module.exports = {
  root: true,
  env: {
    node: true,
    es2022: true,
  },
  extends: [
    'eslint:recommended',
    '@typescript-eslint/recommended',
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 2022,
    sourceType: 'module',
  },
  plugins: ['@typescript-eslint'],
  rules: {
    '@typescript-eslint/no-unused-vars': 'error',
    '@typescript-eslint/no-explicit-any': 'warn',
    'prefer-const': 'error',
    'no-var': 'error',
  },
  ignorePatterns: ['dist/', 'build/', 'node_modules/'],
};
`
  }

  /**
   * Genera configuración de Prettier
   */
  private generatePrettierConfig(): string {
    return `{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 80,
  "tabWidth": 2,
  "useTabs": false
}
`
  }

  /**
   * Genera configuración de Jest
   */
  private generateJestConfig(): string {
    return `module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/tests'],
  testMatch: ['**/__tests__/**/*.ts', '**/?(*.)+(spec|test).ts'],
  transform: {
    '^.+\\.ts$': 'ts-jest',
  },
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.d.ts',
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
};
`
  }

  /**
   * Muestra resumen de la inicialización
   */
  private showSummary(config: any): void {
    console.log(chalk.green.bold('\n✅ Proyecto inicializado exitosamente!'))
    console.log(chalk.blue('\n📋 Resumen:'))
    console.log(`   Nombre: ${config.projectName}`)
    console.log(`   Template: ${config.template}`)
    console.log(`   Redes: ${config.networks.join(', ')}`)
    console.log(`   Base de datos: ${config.database}`)
    console.log(`   Características: ${config.features.length}`)
    
    console.log(chalk.blue('\n🚀 Próximos pasos:'))
    console.log('   1. cd ' + config.projectName)
    console.log('   2. cp .env.example .env')
    console.log('   3. Editar .env con tus configuraciones')
    console.log('   4. npm run dev')
    
    console.log(chalk.blue('\n📚 Documentación:'))
    console.log('   - README.md para información básica')
    console.log('   - docs/ para documentación detallada')
    
    console.log(chalk.gray('\n¡Disfruta construyendo tu metaverso! 🌐\n'))
  }
} 
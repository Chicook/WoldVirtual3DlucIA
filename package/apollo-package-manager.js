const { ApolloServer } = require('@apollo/server');
const { expressMiddleware } = require('@apollo/server/express4');
const { ApolloServerPluginDrainHttpServer } = require('@apollo/server/plugin/drainHttpServer');
const express = require('express');
const http = require('http');
const cors = require('cors');
const { json } = require('body-parser');
const path = require('path');
const fs = require('fs').promises;

// Importar servicios
const PackageService = require('./services/package-service');
const DependencyService = require('./services/dependency-service');
const ModuleService = require('./services/module-service');
const RestoreService = require('./services/restore-service');

// Importar schema y resolvers
const { typeDefs } = require('./schema');
const { resolvers } = require('./resolvers');

class ApolloPackageManager {
  constructor() {
    this.app = express();
    this.httpServer = http.createServer(this.app);
    this.packageService = new PackageService();
    this.dependencyService = new DependencyService();
    this.moduleService = new ModuleService();
    this.restoreService = new RestoreService();
    this.projectRoot = path.resolve(__dirname, '..');
  }

  async start() {
    console.log('🚀 Iniciando Apollo Package Manager...');

    // Configurar Apollo Server
    const server = new ApolloServer({
      typeDefs,
      resolvers,
      plugins: [ApolloServerPluginDrainHttpServer({ httpServer: this.httpServer })],
      context: async ({ req }) => ({
        packageService: this.packageService,
        dependencyService: this.dependencyService,
        moduleService: this.moduleService,
        restoreService: this.restoreService,
        projectRoot: this.projectRoot,
        user: req.user
      }),
      formatError: (error) => {
        console.error('GraphQL Error:', error);
        return {
          message: error.message,
          code: error.extensions?.code || 'INTERNAL_SERVER_ERROR',
          path: error.path
        };
      }
    });

    await server.start();

    // Configurar middleware
    this.app.use(
      '/graphql',
      cors(),
      json(),
      expressMiddleware(server, {
        context: async ({ req }) => ({
          packageService: this.packageService,
          dependencyService: this.dependencyService,
          moduleService: this.moduleService,
          restoreService: this.restoreService,
          projectRoot: this.projectRoot,
          user: req.user
        })
      })
    );

    // Configurar rutas adicionales
    this.setupRoutes();

    const PORT = process.env.PACKAGE_MANAGER_PORT || 4001;
    await new Promise((resolve) => this.httpServer.listen(PORT, resolve));
    
    console.log(`✅ Apollo Package Manager ejecutándose en http://localhost:${PORT}/graphql`);
    console.log(`📦 Studio disponible en http://localhost:${PORT}/studio`);
    console.log(`🔧 Dashboard disponible en http://localhost:${PORT}/dashboard`);
    
    return server;
  }

  setupRoutes() {
    // Dashboard principal
    this.app.get('/dashboard', (req, res) => {
      res.send(`
        <!DOCTYPE html>
        <html lang="es">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Apollo Package Manager Dashboard</title>
            <style>
                body { font-family: Arial, sans-serif; margin: 0; padding: 20px; background: #f5f5f5; }
                .container { max-width: 1200px; margin: 0 auto; }
                .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 10px; margin-bottom: 30px; }
                .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px; margin-bottom: 30px; }
                .card { background: white; padding: 25px; border-radius: 10px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
                .card h3 { margin-top: 0; color: #333; }
                .btn { background: #007bff; color: white; padding: 10px 20px; border: none; border-radius: 5px; cursor: pointer; text-decoration: none; display: inline-block; margin: 5px; }
                .btn:hover { background: #0056b3; }
                .btn.danger { background: #dc3545; }
                .btn.danger:hover { background: #c82333; }
                .btn.success { background: #28a745; }
                .btn.success:hover { background: #218838; }
                .status { padding: 5px 10px; border-radius: 15px; font-size: 0.9em; }
                .status.ok { background: #d4edda; color: #155724; }
                .status.warning { background: #fff3cd; color: #856404; }
                .status.error { background: #f8d7da; color: #721c24; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>📦 Apollo Package Manager</h1>
                    <p>Gestión inteligente de dependencias y paquetes faltantes</p>
                </div>
                
                <div class="grid">
                    <div class="card">
                        <h3>🔍 Análisis de Módulos</h3>
                        <p>Analiza todos los módulos del proyecto para detectar dependencias faltantes.</p>
                        <a href="/api/analyze-modules" class="btn">Analizar Módulos</a>
                        <a href="/api/scan-dependencies" class="btn">Escanear Dependencias</a>
                    </div>
                    
                    <div class="card">
                        <h3>📋 Estado de Dependencias</h3>
                        <p>Verifica el estado actual de todas las dependencias en el proyecto.</p>
                        <a href="/api/dependency-status" class="btn">Ver Estado</a>
                        <a href="/api/missing-packages" class="btn">Paquetes Faltantes</a>
                    </div>
                    
                    <div class="card">
                        <h3>🔧 Restauración Automática</h3>
                        <p>Restaura automáticamente las dependencias faltantes detectadas.</p>
                        <a href="/api/restore-all" class="btn success">Restaurar Todo</a>
                        <a href="/api/restore-selective" class="btn">Restauración Selectiva</a>
                    </div>
                    
                    <div class="card">
                        <h3>📊 Reportes y Métricas</h3>
                        <p>Genera reportes detallados sobre el estado de las dependencias.</p>
                        <a href="/api/generate-report" class="btn">Generar Reporte</a>
                        <a href="/api/dependency-metrics" class="btn">Ver Métricas</a>
                    </div>
                </div>
                
                <div class="card">
                    <h3>🚀 Acciones Rápidas</h3>
                    <a href="/graphql" class="btn">GraphQL Playground</a>
                    <a href="/studio" class="btn">Apollo Studio</a>
                    <a href="/api/health" class="btn">Health Check</a>
                    <a href="/api/cleanup" class="btn danger">Limpiar Cache</a>
                </div>
            </div>
        </body>
        </html>
      `);
    });

    // Apollo Studio
    this.app.get('/studio', (req, res) => {
      res.send(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>Apollo Package Manager Studio</title>
            <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@apollo/studio@1.0.0/dist/studio.css">
        </head>
        <body>
            <div id="studio"></div>
            <script src="https://cdn.jsdelivr.net/npm/@apollo/studio@1.0.0/dist/studio.js"></script>
            <script>
                window.addEventListener('load', function() {
                    new window.ApolloStudio({
                        endpoint: '/graphql',
                        title: 'Package Manager GraphQL API'
                    });
                });
            </script>
        </body>
        </html>
      `);
    });

    // API Routes
    this.app.get('/api/health', async (req, res) => {
      try {
        const health = await this.getSystemHealth();
        res.json(health);
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    });

    this.app.get('/api/analyze-modules', async (req, res) => {
      try {
        const analysis = await this.moduleService.analyzeAllModules();
        res.json(analysis);
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    });

    this.app.get('/api/scan-dependencies', async (req, res) => {
      try {
        const scan = await this.dependencyService.scanAllDependencies();
        res.json(scan);
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    });

    this.app.get('/api/dependency-status', async (req, res) => {
      try {
        const status = await this.dependencyService.getDependencyStatus();
        res.json(status);
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    });

    this.app.get('/api/missing-packages', async (req, res) => {
      try {
        const missing = await this.packageService.getMissingPackages();
        res.json(missing);
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    });

    this.app.post('/api/restore-all', async (req, res) => {
      try {
        const result = await this.restoreService.restoreAllDependencies();
        res.json(result);
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    });

    this.app.post('/api/restore-selective', async (req, res) => {
      try {
        const { packages } = req.body;
        const result = await this.restoreService.restoreSelectiveDependencies(packages);
        res.json(result);
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    });

    this.app.get('/api/generate-report', async (req, res) => {
      try {
        const report = await this.packageService.generateDependencyReport();
        res.json(report);
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    });

    this.app.get('/api/dependency-metrics', async (req, res) => {
      try {
        const metrics = await this.dependencyService.getDependencyMetrics();
        res.json(metrics);
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    });

    this.app.post('/api/cleanup', async (req, res) => {
      try {
        const result = await this.packageService.cleanupCache();
        res.json(result);
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    });
  }

  async getSystemHealth() {
    return {
      status: 'OK',
      timestamp: new Date().toISOString(),
      services: {
        packageService: this.packageService.isReady(),
        dependencyService: this.dependencyService.isReady(),
        moduleService: this.moduleService.isReady(),
        restoreService: this.restoreService.isReady()
      },
      uptime: process.uptime(),
      memoryUsage: process.memoryUsage()
    };
  }

  async stop() {
    await this.httpServer.close();
    console.log('🛑 Apollo Package Manager detenido');
  }
}

// Exportar para uso directo
if (require.main === module) {
  const manager = new ApolloPackageManager();
  manager.start().catch(console.error);
}

module.exports = ApolloPackageManager; 
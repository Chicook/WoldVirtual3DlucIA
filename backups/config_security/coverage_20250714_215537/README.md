# Sistema Apollo de Coverage

Un sistema completo de análisis de cobertura de código basado en Apollo GraphQL que proporciona métricas detalladas, reportes y análisis de calidad de código.

## 🚀 Características

- **API GraphQL completa** con Apollo Server
- **Análisis de cobertura** en tiempo real
- **Métricas de rendimiento** y calidad
- **Generación de reportes** en múltiples formatos (HTML, JSON, CSV, XML, PDF)
- **Cliente Apollo** para integración fácil
- **Studio de desarrollo** integrado
- **Sistema de métricas** avanzado
- **Programación de reportes** automáticos

## 📋 Requisitos

- Node.js >= 16.0.0
- npm >= 8.0.0

## 🛠️ Instalación

1. **Clonar el repositorio:**
```bash
cd coverage
npm install
```

2. **Configurar variables de entorno:**
```bash
cp .env.example .env
# Editar .env con tus configuraciones
```

3. **Iniciar el servidor:**
```bash
npm start
```

## 🏗️ Arquitectura

```
coverage/
├── apollo-server.js          # Servidor principal Apollo
├── apollo-client.js          # Cliente Apollo
├── schema.js                 # Schema GraphQL
├── resolvers.js              # Resolvers GraphQL
├── services/
│   ├── coverage-service.js   # Lógica de cobertura
│   ├── metrics-service.js    # Métricas y estadísticas
│   └── report-service.js     # Generación de reportes
├── data/                     # Almacenamiento de datos
├── templates/                # Plantillas de reportes
└── package.json
```

## 🔧 Configuración

### Variables de Entorno

```env
# Servidor
APOLLO_PORT=4000
NODE_ENV=development

# Base de datos (opcional)
DATABASE_URL=mongodb://localhost:27017/coverage

# Autenticación
JWT_SECRET=your-jwt-secret

# Apollo Engine
APOLLO_ENGINE_API_KEY=your-api-key
```

### Configuración del Cliente

```javascript
const ApolloCoverageClient = require('./apollo-client');

const client = new ApolloCoverageClient({
  uri: 'http://localhost:4000/graphql',
  token: 'your-auth-token'
});
```

## 📊 Uso

### 1. Iniciar el Servidor

```bash
# Desarrollo
npm run dev

# Producción
npm start
```

### 2. Acceder al Studio

Abre tu navegador en: `http://localhost:4000/studio`

### 3. Ejemplos de Consultas GraphQL

#### Obtener Reportes de Cobertura

```graphql
query GetCoverageReports {
  coverageReports {
    id
    projectName
    coveragePercentage
    totalLines
    coveredLines
    files {
      fileName
      coveragePercentage
    }
  }
}
```

#### Crear un Reporte de Cobertura

```graphql
mutation CreateCoverageReport {
  createCoverageReport(input: {
    projectName: "mi-proyecto"
    totalLines: 1000
    coveredLines: 850
    files: [{
      fileName: "app.js"
      filePath: "/src/app.js"
      totalLines: 100
      coveredLines: 85
    }]
  }) {
    id
    coveragePercentage
  }
}
```

#### Obtener Métricas del Sistema

```graphql
query GetSystemMetrics {
  systemHealth {
    status
    uptime
    memoryUsage
  }
  coverageStatistics {
    totalProjects
    averageCoverage
    coverageDistribution {
      range
      count
    }
  }
}
```

### 4. Uso del Cliente

```javascript
const client = new ApolloCoverageClient();

// Obtener reportes
const reports = await client.getCoverageReports();

// Crear reporte
const newReport = await client.createCoverageReport({
  projectName: "mi-proyecto",
  totalLines: 1000,
  coveredLines: 850,
  files: [...]
});

// Obtener métricas
const metrics = await client.getMetrics("proyecto-id");

// Obtener tendencias
const trend = await client.getCoverageTrend("proyecto-id", 30);
```

## 📈 Métricas Disponibles

### Cobertura de Código
- **Líneas**: Porcentaje de líneas ejecutadas
- **Funciones**: Porcentaje de funciones llamadas
- **Ramas**: Porcentaje de ramas condicionales ejecutadas
- **Declaraciones**: Porcentaje de declaraciones ejecutadas

### Métricas de Calidad
- **Complejidad Ciclomática**: Medida de complejidad del código
- **Índice de Mantenibilidad**: Facilidad de mantenimiento
- **Deuda Técnica**: Tiempo estimado para refactorización
- **Calidad de Pruebas**: Efectividad de las pruebas

### Métricas de Rendimiento
- **Tiempo de Respuesta**: Promedio de respuesta de la API
- **Tasa de Errores**: Porcentaje de errores
- **Throughput**: Número de requests por segundo
- **Uso de Memoria**: Consumo de recursos del sistema

## 📋 Generación de Reportes

### Formatos Soportados

- **HTML**: Reportes interactivos con gráficos
- **JSON**: Datos estructurados para integración
- **CSV**: Datos tabulares para análisis
- **XML**: Formato estándar de cobertura
- **PDF**: Reportes imprimibles

### Ejemplo de Generación

```javascript
const reportService = new ReportService();

// Generar reporte HTML
const htmlReport = await reportService.generateCoverageReport(
  "proyecto-id",
  "html",
  { includeCharts: true }
);

// Generar reporte JSON
const jsonReport = await reportService.generateCoverageReport(
  "proyecto-id",
  "json"
);

// Exportar reporte
const exportPath = await reportService.exportReport(
  report.id,
  "html"
);
```

## 🔄 Programación de Reportes

```javascript
// Programar reporte diario
await reportService.scheduleReport("proyecto-id", {
  frequency: "DAILY",
  interval: 1
}, "html");

// Programar reporte semanal
await reportService.scheduleReport("proyecto-id", {
  frequency: "WEEKLY",
  interval: 1
}, "pdf");
```

## 🧪 Testing

```bash
# Ejecutar tests
npm test

# Tests en modo watch
npm run test:watch

# Tests con cobertura
npm run test:coverage
```

## 📝 Scripts Disponibles

| Comando | Descripción |
|---------|-------------|
| `npm start` | Iniciar servidor en producción |
| `npm run dev` | Iniciar servidor en desarrollo |
| `npm test` | Ejecutar tests |
| `npm run lint` | Verificar código |
| `npm run lint:fix` | Corregir problemas de linting |
| `npm run studio` | Abrir Apollo Studio |
| `npm run generate-types` | Generar tipos TypeScript |

## 🔌 Integración con CI/CD

### GitHub Actions

```yaml
name: Coverage Analysis
on: [push, pull_request]

jobs:
  coverage:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - run: npm install
      - run: npm run test:coverage
      
      - name: Upload to Apollo Coverage
        run: |
          curl -X POST http://localhost:4000/graphql \
            -H "Content-Type: application/json" \
            -d '{"query":"mutation { createCoverageReport(input: {...}) { id } }"}'
```

### Jenkins Pipeline

```groovy
pipeline {
    agent any
    stages {
        stage('Test & Coverage') {
            steps {
                sh 'npm install'
                sh 'npm run test:coverage'
            }
        }
        stage('Upload Coverage') {
            steps {
                sh '''
                    curl -X POST http://localhost:4000/graphql \
                      -H "Content-Type: application/json" \
                      -d '{"query":"mutation { createCoverageReport(input: {...}) { id } }"}'
                '''
            }
        }
    }
}
```

## 🚀 Despliegue

### Docker

```dockerfile
FROM node:18-alpine

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY . .
EXPOSE 4000

CMD ["npm", "start"]
```

### Docker Compose

```yaml
version: '3.8'
services:
  apollo-coverage:
    build: .
    ports:
      - "4000:4000"
    environment:
      - NODE_ENV=production
      - APOLLO_PORT=4000
    volumes:
      - ./data:/app/data
```

## 📊 Monitoreo

### Health Check

```bash
curl http://localhost:4000/health
```

### Métricas del Sistema

```bash
curl http://localhost:4000/metrics
```

## 🤝 Contribución

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo [LICENSE](LICENSE) para detalles.

## 🆘 Soporte

- **Documentación**: [Wiki del proyecto](https://github.com/metaverso-crypto-world/apollo-coverage-system/wiki)
- **Issues**: [GitHub Issues](https://github.com/metaverso-crypto-world/apollo-coverage-system/issues)
- **Discusiones**: [GitHub Discussions](https://github.com/metaverso-crypto-world/apollo-coverage-system/discussions)

## 🔗 Enlaces Útiles

- [Apollo GraphQL](https://www.apollographql.com/)
- [GraphQL](https://graphql.org/)
- [Jest Coverage](https://jestjs.io/docs/en/cli#--coverage)
- [Istanbul Coverage](https://istanbul.js.org/)

---

**Desarrollado con ❤️ por el equipo de Metaverso Crypto World Virtual 3D** 
# builder/

Scripts de compilación y optimización de código, contratos y assets.

## ¿Qué contiene?
- Bash: `compile.sh` para limpiar, compilar, testear y documentar.
- Node.js: `optimize-assets.js` para optimizar modelos 3D y texturas.

## Buenas prácticas
- Añade soporte a nuevos formatos de assets.
- Centraliza logs de build y optimización.
- Documenta dependencias y ejemplos de uso.

## Ejemplo de uso
```bash
./compile.sh
node optimize-assets.js
```

## 🚀 **SISTEMA AVANZADO DE BUILD Y OPTIMIZACIÓN**

### **Funcionalidades Extendidas**

#### **1. Compilación Inteligente Multi-Lenguaje**
- **TypeScript/JavaScript** - Compilación con optimizaciones
- **Python** - Compilación de scripts y módulos
- **Smart Contracts** - Compilación de Solidity con verificaciones
- **Assets 3D** - Optimización automática de modelos y texturas

#### **2. Sistema de Cache Avanzado**
- **Incremental Builds** - Solo recompila archivos modificados
- **Dependency Tracking** - Análisis de dependencias en tiempo real
- **Parallel Processing** - Compilación paralela para mayor velocidad
- **Memory Optimization** - Gestión inteligente de memoria

#### **3. Optimización Automática**
- **Code Splitting** - División automática de bundles
- **Tree Shaking** - Eliminación de código no utilizado
- **Asset Compression** - Compresión inteligente de recursos
- **Bundle Analysis** - Análisis detallado de bundles

### **Comandos Avanzados**

```bash
# Build completo con optimizaciones
./compile.sh --optimize --parallel

# Build incremental (solo cambios)
./compile.sh --incremental

# Build con análisis de performance
./compile.sh --analyze --profile

# Optimización de assets específicos
node optimize-assets.js --models --textures --audio

# Cache management
./compile.sh --clear-cache
./compile.sh --cache-stats
```

### **Configuración Avanzada**

#### **Variables de Entorno**
```bash
BUILD_MODE=production          # development, production, testing
OPTIMIZATION_LEVEL=high        # low, medium, high, extreme
PARALLEL_JOBS=4               # Número de jobs paralelos
CACHE_ENABLED=true            # Habilitar sistema de cache
ANALYZE_BUNDLES=true          # Generar análisis de bundles
```

#### **Archivos de Configuración**
- `builder.config.json` - Configuración principal del builder
- `optimization.config.js` - Reglas de optimización
- `cache.config.json` - Configuración del sistema de cache
- `performance.config.js` - Métricas y umbrales de performance

### **Métricas y Monitoreo**

El sistema incluye métricas detalladas de:
- **Tiempo de compilación** por módulo
- **Uso de memoria** durante el proceso
- **Tamaño de bundles** antes y después de optimización
- **Performance de assets** optimizados
- **Cache hit/miss ratio**

### **Integración con CI/CD**

```yaml
# GitHub Actions example
- name: Build and Optimize
  run: |
    ./compile.sh --ci --optimize
    node optimize-assets.js --batch
```

### **Soporte Multi-Entorno**

- **Development** - Build rápido con debugging
- **Staging** - Build optimizado con testing
- **Production** - Build ultra-optimizado
- **Testing** - Build con coverage y testing 
# 🐳 Ubicación del docker-compose.yml

## 📍 **Ubicación Correcta: RAÍZ del Proyecto**

El archivo `docker-compose.yml` **DEBE estar en la raíz** del proyecto `MetaversoCryptoWoldVirtual3d/` por las siguientes razones técnicas:

---

## 🔧 **Razones Técnicas**

### **1. Rutas Relativas**
```yaml
# Estas rutas están configuradas desde la raíz
volumes:
  - ./backend:/app          # ✅ Correcto desde raíz
  - ./client:/app           # ✅ Correcto desde raíz
  - ./scripts/mongo-init.js # ✅ Correcto desde raíz
```

### **2. Comando Docker Compose**
```bash
# Docker Compose busca el archivo en el directorio actual
docker-compose up -d        # ✅ Busca en raíz
docker-compose down         # ✅ Busca en raíz
```

### **3. Contexto de Build**
```yaml
services:
  backend:
    build:
      context: ./backend    # ✅ Contexto relativo a raíz
  frontend:
    build:
      context: ./client     # ✅ Contexto relativo a raíz
```

---

## 🚫 **¿Por qué NO en /data?**

### **Problemas si estuviera en /data:**

1. **Rutas Incorrectas**
   ```yaml
   # ❌ Incorrecto desde /data
   volumes:
     - ../../backend:/app     # Ruta compleja y frágil
     - ../../client:/app      # Ruta compleja y frágil
   ```

2. **Comandos Inconvenientes**
   ```bash
   # ❌ Tendrías que navegar a /data
   cd data
   docker-compose up -d
   
   # ✅ Correcto desde raíz
   docker-compose up -d
   ```

3. **Scripts de NPM**
   ```json
   // ❌ Scripts tendrían rutas complejas
   "docker:up": "cd data && docker-compose up -d"
   
   // ✅ Scripts simples desde raíz
   "docker:up": "docker-compose up -d"
   ```

---

## 📁 **Estructura Recomendada**

```
MetaversoCryptoWoldVirtual3d/
├── 🐳 docker-compose.yml          # ✅ AQUÍ en la raíz
├── 📦 package.json
├── 📁 client/
├── 📁 backend/
├── 📁 data/                       # ✅ Datos persistentes
│   ├── mongodb/
│   ├── redis/
│   ├── ipfs/
│   └── ...
├── 📁 scripts/
├── 📁 docs/
└── 📁 config/
```

---

## 🔄 **Migración (si es necesario)**

Si el archivo está en `/data`, muévelo a la raíz:

```bash
# 1. Mover el archivo
mv data/docker-compose.yml ./docker-compose.yml

# 2. Actualizar rutas si es necesario
# (Las rutas actuales ya están correctas)

# 3. Verificar funcionamiento
docker-compose config
docker-compose up -d
```

---

## ✅ **Verificación**

Para verificar que todo funciona correctamente:

```bash
# 1. Desde la raíz del proyecto
cd /path/to/MetaversoCryptoWoldVirtual3d

# 2. Verificar configuración
docker-compose config

# 3. Iniciar servicios
docker-compose up -d

# 4. Verificar logs
docker-compose logs -f

# 5. Verificar estado
docker-compose ps
```

---

## 🎯 **Comandos Útiles**

```bash
# Iniciar todos los servicios
npm run docker:up

# Detener todos los servicios
npm run docker:down

# Ver logs en tiempo real
npm run docker:logs

# Reconstruir imágenes
npm run docker:build

# Limpiar completamente
npm run docker:clean

# Reiniciar servicios
npm run docker:restart
```

---

## 📋 **Resumen**

- ✅ **docker-compose.yml en RAÍZ** = Funcionamiento correcto
- ❌ **docker-compose.yml en /data** = Problemas de rutas y comandos
- 🔧 **Rutas relativas** = Configuradas desde la raíz
- 🚀 **Scripts NPM** = Optimizados para raíz
- 📁 **Estructura** = Estándar de la industria

**Conclusión**: El archivo `docker-compose.yml` debe permanecer en la raíz del proyecto para garantizar el funcionamiento correcto de todos los servicios del metaverso. 
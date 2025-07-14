# 📦 Gestión de Dependencias Sin Conflictos de Merge

## 🎯 Objetivo

Este documento explica cómo manejar las dependencias de npm/yarn en el proyecto WoldVirtual3DlucIA para evitar conflictos de merge y mantener el repositorio limpio.

## 🚨 Problemas Comunes

### ❌ Lo que NO hacer:
- Subir `node_modules/` al repositorio
- Subir múltiples archivos de lock (`package-lock.json`, `yarn.lock`, `pnpm-lock.yaml`)
- Subir archivos de cache y build
- Subir configuraciones específicas del entorno

### ✅ Lo que SÍ hacer:
- Mantener solo `package.json` con las dependencias
- Usar un solo gestor de paquetes por proyecto
- Documentar las versiones de Node.js y npm
- Usar scripts de instalación automática

## 🛠️ Configuración Actual

### .gitignore Principal
El archivo `.gitignore` principal incluye:

```gitignore
# Dependencias de Node.js (CRÍTICO - NO SUBIR)
node_modules/
node_modules/*
*/node_modules/
**/node_modules/
**/node_modules/*

# Archivos de lock (mantener solo uno por proyecto)
package-lock.json
yarn.lock
pnpm-lock.yaml

# Cache de dependencias
.npm/
.yarn/
.pnpm-store/
.yarn-integrity
```

### .gitignore de Web
El archivo `web/.gitignore` incluye configuraciones específicas para el módulo web.

## 📋 Guía de Instalación

### Para Desarrolladores Nuevos

1. **Clonar el repositorio:**
```bash
git clone https://github.com/Chicook/WoldVirtual3DlucIA.git
cd WoldVirtual3DlucIA
```

2. **Instalar dependencias principales:**
```bash
npm install
```

3. **Instalar dependencias del módulo web:**
```bash
cd web
npm install
```

4. **Instalar dependencias del editor 3D:**
```bash
cd ../.bin/editor3d
npm install
```

5. **Instalar dependencias del cliente:**
```bash
cd ../../client
npm install
```

### Para Actualizaciones

1. **Actualizar dependencias principales:**
```bash
git pull origin woldbkvirtual
npm install
```

2. **Actualizar dependencias de módulos:**
```bash
cd web && npm install
cd ../.bin/editor3d && npm install
cd ../../client && npm install
```

## 🔧 Scripts de Automatización

### Script de Instalación Completa
```bash
# Crear script: scripts/install-all.sh
#!/bin/bash
echo "Instalando dependencias de WoldVirtual3DlucIA..."

# Dependencias principales
npm install

# Dependencias del módulo web
cd web && npm install && cd ..

# Dependencias del editor 3D
cd .bin/editor3d && npm install && cd ../..

# Dependencias del cliente
cd client && npm install && cd ..

echo "✅ Todas las dependencias instaladas correctamente"
```

### Script de Actualización
```bash
# Crear script: scripts/update-all.sh
#!/bin/bash
echo "Actualizando dependencias de WoldVirtual3DlucIA..."

# Actualizar dependencias principales
npm update

# Actualizar dependencias del módulo web
cd web && npm update && cd ..

# Actualizar dependencias del editor 3D
cd .bin/editor3d && npm update && cd ../..

# Actualizar dependencias del cliente
cd client && npm update && cd ..

echo "✅ Todas las dependencias actualizadas correctamente"
```

## 📊 Gestión de Versiones

### Versiones Recomendadas
- **Node.js**: 18.x o superior
- **npm**: 9.x o superior
- **yarn**: 1.22.x o superior (si se usa)

### Archivo .nvmrc
Crear un archivo `.nvmrc` en la raíz del proyecto:
```
18.17.0
```

### Archivo .npmrc
Crear un archivo `.npmrc` en la raíz del proyecto:
```
save-exact=true
package-lock=true
```

## 🚀 Workflow de Desarrollo

### 1. Antes de Hacer Commit
```bash
# Verificar que no hay node_modules en el staging
git status | grep node_modules

# Si hay node_modules, removerlos
git reset HEAD node_modules/
git checkout -- node_modules/
```

### 2. Al Agregar Nuevas Dependencias
```bash
# Agregar dependencia
npm install nueva-dependencia

# Verificar que solo se modificó package.json
git status

# Commit solo package.json
git add package.json
git commit -m "feat: agregar nueva-dependencia"
```

### 3. Al Actualizar Dependencias
```bash
# Actualizar dependencias
npm update

# Verificar cambios
git diff package.json

# Commit cambios
git add package.json
git commit -m "chore: actualizar dependencias"
```

## 🔍 Verificación de Configuración

### Comando de Verificación
```bash
# Crear script: scripts/verify-deps.sh
#!/bin/bash
echo "Verificando configuración de dependencias..."

# Verificar que no hay node_modules en el repositorio
if git ls-files | grep -q "node_modules/"; then
    echo "❌ ERROR: node_modules/ encontrado en el repositorio"
    exit 1
fi

# Verificar que existe package.json
if [ ! -f "package.json" ]; then
    echo "❌ ERROR: package.json no encontrado"
    exit 1
fi

# Verificar que no hay múltiples archivos de lock
lock_files=$(ls -la | grep -E "\.(lock|yaml)$" | wc -l)
if [ $lock_files -gt 1 ]; then
    echo "❌ ERROR: Múltiples archivos de lock detectados"
    exit 1
fi

echo "✅ Configuración de dependencias correcta"
```

## 📝 Mejores Prácticas

### ✅ Recomendado
- Usar `npm install` para instalar dependencias
- Mantener solo `package.json` en el repositorio
- Documentar versiones de Node.js y npm
- Usar scripts de automatización
- Verificar configuración antes de commits

### ❌ Evitar
- Subir `node_modules/` al repositorio
- Usar múltiples gestores de paquetes
- Subir archivos de lock duplicados
- Subir archivos de cache y build
- Ignorar conflictos de merge

## 🆘 Solución de Problemas

### Error: "node_modules already exists"
```bash
# Remover node_modules
rm -rf node_modules/
npm install
```

### Error: "Conflicting lock files"
```bash
# Remover archivos de lock
rm package-lock.json yarn.lock pnpm-lock.yaml
npm install
```

### Error: "Package not found"
```bash
# Limpiar cache de npm
npm cache clean --force
npm install
```

## 📚 Recursos Adicionales

- [Documentación oficial de npm](https://docs.npmjs.com/)
- [Guía de .gitignore para Node.js](https://github.com/github/gitignore/blob/main/Node.gitignore)
- [Mejores prácticas de npm](https://docs.npmjs.com/cli/v8/using-npm/developers)
- [Gestión de dependencias en proyectos grandes](https://docs.npmjs.com/cli/v8/using-npm/workspaces)

---

**Nota**: Este documento debe actualizarse cuando se agreguen nuevos módulos o se cambien las configuraciones de dependencias. 
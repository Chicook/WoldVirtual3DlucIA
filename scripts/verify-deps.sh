#!/bin/bash

echo "🔍 Verificando configuración de dependencias de WoldVirtual3DlucIA..."
echo "================================================================"

# Verificar que no hay node_modules en el repositorio
if git ls-files | grep -q "node_modules/"; then
    echo "❌ ERROR: node_modules/ encontrado en el repositorio"
    echo "   Esto causará conflictos de merge. Remover con:"
    echo "   git rm -r --cached node_modules/"
    exit 1
else
    echo "✅ No hay node_modules/ en el repositorio"
fi

# Verificar que existe package.json principal
if [ ! -f "package.json" ]; then
    echo "❌ ERROR: package.json principal no encontrado"
    exit 1
else
    echo "✅ package.json principal encontrado"
fi

# Verificar que no hay múltiples archivos de lock
lock_files=$(ls -la | grep -E "\.(lock|yaml)$" | grep -E "(package-lock|yarn|pnpm)" | wc -l)
if [ $lock_files -gt 1 ]; then
    echo "❌ ERROR: Múltiples archivos de lock detectados:"
    ls -la | grep -E "\.(lock|yaml)$" | grep -E "(package-lock|yarn|pnpm)"
    echo "   Mantener solo uno para evitar conflictos"
    exit 1
else
    echo "✅ Configuración de archivos de lock correcta"
fi

# Verificar versiones de Node.js y npm
echo ""
echo "📊 Versiones del sistema:"
echo "   Node.js: $(node --version)"
echo "   npm: $(npm --version)"

# Verificar que la versión de Node.js es compatible
node_version=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
if [ $node_version -lt 18 ]; then
    echo "⚠️  ADVERTENCIA: Node.js versión $node_version detectada"
    echo "   Se recomienda Node.js 18.x o superior"
else
    echo "✅ Versión de Node.js compatible"
fi

# Verificar dependencias principales
echo ""
echo "📦 Verificando dependencias principales..."
if [ -f "package.json" ]; then
    echo "   Dependencias en package.json: $(grep -c '"dependencies"' package.json || echo "0")"
    echo "   Dependencias de desarrollo: $(grep -c '"devDependencies"' package.json || echo "0")"
fi

# Verificar módulos específicos
echo ""
echo "🔧 Verificando módulos específicos:"

# Módulo web
if [ -f "web/package.json" ]; then
    echo "   ✅ web/package.json encontrado"
else
    echo "   ⚠️  web/package.json no encontrado"
fi

# Editor 3D
if [ -f ".bin/editor3d/package.json" ]; then
    echo "   ✅ .bin/editor3d/package.json encontrado"
else
    echo "   ⚠️  .bin/editor3d/package.json no encontrado"
fi

# Cliente
if [ -f "client/package.json" ]; then
    echo "   ✅ client/package.json encontrado"
else
    echo "   ⚠️  client/package.json no encontrado"
fi

echo ""
echo "✅ Verificación de dependencias completada"
echo "================================================================"
echo "💡 Para instalar todas las dependencias, ejecutar:"
echo "   npm install"
echo "   cd web && npm install"
echo "   cd ../.bin/editor3d && npm install"
echo "   cd ../../client && npm install" 
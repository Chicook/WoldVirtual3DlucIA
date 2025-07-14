#!/bin/bash
# Valida todos los archivos de tipos .d.ts en el proyecto
set -e
find . -name "*.d.ts" | while read file; do
  echo "Validando $file..."
  tsc --noEmit $file || { echo "❌ Error de tipos en $file"; exit 1; }
done
echo "✅ Todos los archivos de tipos son válidos." 